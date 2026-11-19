//! Commandes de ZYNORA Word.
//!
//! L'éditeur vit dans l'interface ; le cœur Rust convertit entre fichiers (DOCX, TXT) et le
//! modèle [`Document`], revalide tout ce qu'il reçoit et protège les originaux :
//! - un document dont la lecture a perdu des éléments (images, notes…) n'est **jamais écrasé** :
//!   la vérification est refaite sur le fichier présent sur le disque au moment d'enregistrer ;
//! - les copies de récupération sont écrites hors du document, dans le dossier de données.

use std::fs;

use serde::Serialize;
use tauri::State;
use zynora_document_engine::{
    DocError, Document, ImageData, MAX_IMAGE_BYTES, from_docx, from_txt, prepare_image, to_docx, to_txt,
};
use zynora_file_manager::{Library, write_atomic};

use crate::library::open_library;
use crate::sheets::{discard_recovery, recovery_dir, recovery_name};
use crate::{AppState, CommandError};

type CommandResult<T> = Result<T, CommandError>;

/// Taille maximale d'une copie de récupération relue (JSON).
const MAX_RECOVERY_BYTES: u64 = 128 * 1024 * 1024;

impl From<DocError> for CommandError {
    fn from(error: DocError) -> Self {
        CommandError::new(error.to_string())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum TextFormat {
    Docx,
    Txt,
}

impl TextFormat {
    fn of(path: &str) -> CommandResult<Self> {
        let lower = path.to_ascii_lowercase();
        if lower.ends_with(".docx") {
            Ok(Self::Docx)
        } else if lower.ends_with(".txt") {
            Ok(Self::Txt)
        } else if lower.ends_with(".odt") {
            Err(CommandError::new(
                "Le format ODT n'est pas encore pris en charge par ZYNORA Word. Ouvrez-le dans LibreOffice et enregistrez-le en DOCX.",
            ))
        } else {
            Err(CommandError::new("Ce fichier n'est pas un document texte pris en charge (DOCX ou TXT)."))
        }
    }

    fn encode(self, doc: &Document) -> CommandResult<Vec<u8>> {
        match self {
            Self::Docx => Ok(to_docx(doc)?),
            Self::Txt => {
                doc.validate()?;
                Ok(to_txt(doc))
            }
        }
    }
}

#[derive(Debug, Serialize)]
pub(crate) struct DocumentInfo {
    path: String,
    name: String,
    format: TextFormat,
    document: Document,
    /// Éléments du fichier que ZYNORA ne sait pas réécrire : l'enregistrement sur l'original est refusé.
    lost: Vec<String>,
    /// Ouvert depuis une copie de récupération (modifications non enregistrées retrouvées).
    recovered: bool,
}

fn file_name(path: &str) -> String {
    path.rsplit('/').next().unwrap_or(path).to_owned()
}

fn decode(bytes: &[u8], format: TextFormat) -> CommandResult<(Document, Vec<String>)> {
    Ok(match format {
        TextFormat::Docx => {
            let loaded = from_docx(bytes)?;
            (loaded.document, loaded.lost)
        }
        TextFormat::Txt => (from_txt(bytes)?, Vec::new()),
    })
}

fn info(
    state: &AppState,
    key: &str,
    path: String,
    document: Document,
    lost: Vec<String>,
    recovered: bool,
) -> CommandResult<DocumentInfo> {
    let name = file_name(&path);
    let format = TextFormat::of(&path)?;
    let mut db = state.db()?;
    let _ = db.touch_document(key, &path, &name, "text");
    Ok(DocumentInfo { path, name, format, document, lost, recovered })
}

fn load(library: &Library, path: &str) -> CommandResult<(Document, Vec<String>)> {
    let format = TextFormat::of(path)?;
    let (bytes, _) = library.read_document(path)?;
    decode(&bytes, format)
}

#[tauri::command]
pub(crate) fn word_open(state: State<'_, AppState>, path: String) -> CommandResult<DocumentInfo> {
    open(&state, path)
}

fn open(state: &AppState, path: String) -> CommandResult<DocumentInfo> {
    let (library, key) = open_library(state)?;
    let (document, lost) = load(&library, &path)?;
    state.db()?.record_event("word.open", &path)?;
    info(state, &key, path, document, lost, false)
}

#[tauri::command]
pub(crate) fn word_create(state: State<'_, AppState>, folder: String) -> CommandResult<DocumentInfo> {
    create(&state, &folder)
}

fn create(state: &AppState, folder: &str) -> CommandResult<DocumentInfo> {
    let (library, key) = open_library(state)?;
    let name = "Document.docx";
    let document = Document::default();
    let entry = library.create_document(folder, name, &to_docx(&document)?)?;
    state.db()?.record_event("word.create", &entry.path)?;
    info(state, &key, entry.path, document, Vec::new(), false)
}

/// Enregistre sur le document d'origine. Refusé si le fichier présent sur le disque contient des
/// éléments que ZYNORA ne sait pas réécrire : il faut alors « Enregistrer une copie ».
#[tauri::command]
pub(crate) fn word_save(state: State<'_, AppState>, path: String, document: Document) -> CommandResult<()> {
    save(&state, &path, &document)
}

fn save(state: &AppState, path: &str, document: &Document) -> CommandResult<()> {
    let (library, key) = open_library(state)?;
    let format = TextFormat::of(path)?;
    let bytes = format.encode(document)?;
    if format == TextFormat::Docx {
        let (_, lost) = load(&library, path)?;
        if !lost.is_empty() {
            return Err(CommandError::new(format!(
                "Ce document contient des éléments que ZYNORA ne sait pas encore conserver ({}). Pour ne pas les perdre, l'original n'est pas remplacé : utilisez « Enregistrer une copie ».",
                lost.join(", ")
            )));
        }
    }
    let entry = library.save_document(path, &bytes)?;
    discard_recovery(state, &key, path)?;
    state.db()?.record_event("word.save", &entry.path)?;
    Ok(())
}

/// Enregistre le document sous un nouveau nom, dans le même dossier (jamais d'écrasement : un
/// nom libre est choisi si besoin). L'extension choisit le format (.docx ou .txt).
#[tauri::command]
pub(crate) fn word_save_copy(
    state: State<'_, AppState>,
    path: String,
    name: String,
    document: Document,
) -> CommandResult<DocumentInfo> {
    save_copy(&state, &path, &name, document)
}

fn save_copy(state: &AppState, path: &str, name: &str, document: Document) -> CommandResult<DocumentInfo> {
    let (library, key) = open_library(state)?;
    let format = TextFormat::of(name)?;
    let bytes = format.encode(&document)?;
    let folder = path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or("");
    let entry = library.create_document(folder, name, &bytes)?;
    // Les modifications non enregistrées de l'original sont désormais dans la copie.
    discard_recovery(state, &key, path)?;
    state.db()?.record_event("word.save_copy", &entry.path)?;
    // Relu depuis le format écrit : l'interface affiche exactement ce qui a été enregistré.
    let document = if format == TextFormat::Txt { from_txt(&bytes)? } else { document };
    info(state, &key, entry.path, document, Vec::new(), false)
}

fn recovery_file(library: &str, path: &str) -> String {
    recovery_name(library, path).replace(".xlsx", ".zdoc.json")
}

/// Sauvegarde automatique : copie de récupération hors du document (jamais à sa place).
#[tauri::command]
pub(crate) fn word_autosave(state: State<'_, AppState>, path: String, document: Document) -> CommandResult<()> {
    autosave(&state, &path, &document)
}

fn autosave(state: &AppState, path: &str, document: &Document) -> CommandResult<()> {
    let (library, key) = open_library(state)?;
    library.entry(path)?;
    document.validate()?;
    let json = serde_json::to_vec(document).map_err(|_| CommandError::new("copie de récupération impossible"))?;
    let dir = recovery_dir(state);
    fs::create_dir_all(&dir).map_err(|_| CommandError::new("dossier de récupération inaccessible"))?;
    let file = recovery_file(&key, path);
    write_atomic(&dir.join(&file), &json)?;
    state.db()?.set_recovery(&key, path, &file)?;
    Ok(())
}

/// Rouvre un document depuis sa copie de récupération (non enregistré tant que l'utilisateur
/// ne l'enregistre pas). Les pertes éventuelles de l'original restent signalées.
#[tauri::command]
pub(crate) fn word_open_recovery(state: State<'_, AppState>, path: String) -> CommandResult<DocumentInfo> {
    open_recovery(&state, path)
}

fn open_recovery(state: &AppState, path: String) -> CommandResult<DocumentInfo> {
    let (library, key) = open_library(state)?;
    let record = state
        .db()?
        .recoveries(&key)?
        .into_iter()
        .find(|r| r.path == path)
        .ok_or_else(|| CommandError::new("aucune copie de récupération pour ce document"))?;
    let file = recovery_dir(state).join(&record.file);
    let too_big = fs::metadata(&file).map(|m| m.len() > MAX_RECOVERY_BYTES).unwrap_or(true);
    if too_big {
        return Err(CommandError::new("copie de récupération introuvable ou trop volumineuse"));
    }
    let bytes = fs::read(&file).map_err(|_| CommandError::new("copie de récupération introuvable"))?;
    let document: Document =
        serde_json::from_slice(&bytes).map_err(|_| CommandError::new("copie de récupération endommagée"))?;
    document.validate()?;
    // L'original doit toujours exister ; ses pertes éventuelles restent signalées.
    let (_, lost) = load(&library, &path)?;
    state.db()?.record_event("word.recover", &path)?;
    info(state, &key, path, document, lost, true)
}

/// Lit une image choisie par l'utilisateur : fichier ordinaire, taille bornée, format vérifié.
fn read_image_file(path: &std::path::Path, max_width_mm: f64) -> CommandResult<ImageData> {
    use std::io::Read;
    let meta = fs::symlink_metadata(path).map_err(|_| CommandError::new("image introuvable"))?;
    if !meta.is_file() {
        return Err(CommandError::new("ce n'est pas un fichier image"));
    }
    if meta.len() > MAX_IMAGE_BYTES as u64 {
        return Err(CommandError::new("image trop volumineuse (32 Mo au plus)"));
    }
    let mut bytes = Vec::new();
    fs::File::open(path)
        .and_then(|f| f.take(MAX_IMAGE_BYTES as u64 + 1).read_to_end(&mut bytes))
        .map_err(|_| CommandError::new("image illisible"))?;
    Ok(prepare_image(&bytes, max_width_mm)?)
}

/// Insertion d'une image : le dialogue natif est ouvert par le cœur Rust, qui renvoie l'image
/// validée (ou `None` si l'utilisateur annule).
#[cfg(desktop)]
#[tauri::command]
pub(crate) async fn word_pick_image(app: tauri::AppHandle, max_width_mm: f64) -> CommandResult<Option<ImageData>> {
    use tauri_plugin_dialog::DialogExt;
    let Some(picked) = app
        .dialog()
        .file()
        .set_title("Insérer une image")
        .add_filter("Images", &["png", "jpg", "jpeg", "gif"])
        .blocking_pick_file()
    else {
        return Ok(None);
    };
    let path = picked.into_path().map_err(|_| CommandError::new("emplacement non pris en charge"))?;
    read_image_file(&path, max_width_mm).map(Some)
}

#[cfg(mobile)]
#[tauri::command]
pub(crate) async fn word_pick_image(_app: tauri::AppHandle, _max_width_mm: f64) -> CommandResult<Option<ImageData>> {
    Err(CommandError::new("sur téléphone, l'insertion d'images depuis le stockage arrive prochainement"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use zynora_document_engine::{Block, Paragraph, Run};

    fn state(dir: &std::path::Path) -> AppState {
        AppState {
            db: Ok(std::sync::Mutex::new(zynora_database::Database::open_in_memory().expect("base"))),
            data_dir: dir.join("data"),
            default_library: dir.join("ZYNORA"),
            previous_session_interrupted: false,
            workbooks: crate::sheets::Workbooks::default(),
        }
    }

    fn text(doc: &Document) -> String {
        doc.plain_text()
    }

    fn with_text(t: &str) -> Document {
        Document {
            blocks: vec![Block::Paragraph(Paragraph {
                runs: vec![Run { text: t.into(), bold: true, ..Run::default() }],
                ..Paragraph::default()
            })],
            ..Document::default()
        }
    }

    #[test]
    fn creer_modifier_recuperer_enregistrer() {
        let dir = tempfile::tempdir().expect("dossier");
        let state = state(dir.path());
        let created = create(&state, "").expect("création");
        assert_eq!(created.path, "Document.docx");
        assert_eq!(created.format, TextFormat::Docx);

        autosave(&state, &created.path, &with_text("Brouillon")).expect("sauvegarde automatique");
        // L'original n'a pas été modifié par la sauvegarde automatique.
        assert_eq!(text(&open(&state, created.path.clone()).expect("ouverture").document), "\n");
        let recovered = open_recovery(&state, created.path.clone()).expect("récupération");
        assert!(recovered.recovered);
        assert_eq!(text(&recovered.document), "Brouillon\n");

        save(&state, &created.path, &with_text("Final")).expect("enregistrement");
        let (_, key) = open_library(&state).expect("bibliothèque");
        assert!(state.db().expect("base").recoveries(&key).expect("liste").is_empty(), "copie supprimée");
        let reopened = open(&state, created.path.clone()).expect("ouverture");
        assert_eq!(text(&reopened.document), "Final\n");
        assert!(reopened.lost.is_empty());
    }

    #[test]
    fn un_document_avec_pertes_n_est_jamais_ecrase() {
        let dir = tempfile::tempdir().expect("dossier");
        let state = state(dir.path());
        let (library, _) = open_library(&state).expect("bibliothèque");
        let original = include_bytes!("../../../../packages/document-engine/tests/fixtures/libreoffice-riche.docx");
        library.create_document("", "riche.docx", original).expect("import");
        let opened = open(&state, "riche.docx".into()).expect("ouverture");
        assert!(opened.lost.iter().any(|l| l == "cellules de tableau fusionnées"), "{:?}", opened.lost);

        let err = save(&state, "riche.docx", &opened.document).expect_err("écrasement refusé");
        assert!(err.message.contains("Enregistrer une copie"));
        let (bytes, _) = library.read_document("riche.docx").expect("lecture");
        assert_eq!(bytes, original, "l'original est intact");

        let copy = save_copy(&state, "riche.docx", "riche.docx", opened.document).expect("copie");
        assert_eq!(copy.path, "riche (2).docx", "nom libre choisi automatiquement");
        assert!(copy.lost.is_empty());
        save(&state, &copy.path, &copy.document).expect("la copie peut être enregistrée");
    }

    #[test]
    fn image_choisie_validee_et_bornee() {
        let dir = tempfile::tempdir().expect("dossier");
        // PNG 1×1 valide (8 bits, RVB).
        let png: &[u8] = &[
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0,
            1, 8, 2, 0, 0, 0, 0x90, 0x77, 0x53, 0xDE, 0, 0, 0, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8,
            0xCF, 0xC0, 0, 0, 0x03, 0x01, 0x01, 0, 0x18, 0xDD, 0x8D, 0xB0, 0, 0, 0, 0, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82,
        ];
        let file = dir.path().join("point.png");
        fs::write(&file, png).expect("écriture");
        let image = read_image_file(&file, 160.0).expect("image");
        assert_eq!(image.mime, "image/png");
        let fake = dir.path().join("faux.png");
        fs::write(&fake, b"<script>").expect("écriture");
        assert!(read_image_file(&fake, 160.0).is_err(), "contenu qui n'est pas une image");
        assert!(read_image_file(dir.path(), 160.0).is_err(), "dossier");
        assert!(read_image_file(&dir.path().join("absent.png"), 160.0).is_err());
    }

    #[test]
    fn texte_brut_et_formats_refuses() {
        let dir = tempfile::tempdir().expect("dossier");
        let state = state(dir.path());
        let (library, _) = open_library(&state).expect("bibliothèque");
        library.create_document("", "notes.txt", "a\nb\n".as_bytes()).expect("txt");
        let opened = open(&state, "notes.txt".into()).expect("ouverture");
        assert_eq!(opened.format, TextFormat::Txt);
        save(&state, "notes.txt", &with_text("c")).expect("enregistrement");
        assert_eq!(library.read_document("notes.txt").expect("lecture").0, b"c\n");
        let copy = save_copy(&state, "notes.txt", "notes.docx", with_text("d")).expect("copie DOCX");
        assert_eq!(copy.format, TextFormat::Docx);
        assert!(save_copy(&state, "notes.txt", "notes.exe", with_text("d")).is_err());
        assert!(TextFormat::of("a.odt").is_err());
    }
}
