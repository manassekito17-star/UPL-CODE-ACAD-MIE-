//! Commandes de la bibliothèque de documents (ZYNORA Core).
//!
//! Les chemins échangés avec l'interface sont **relatifs à la bibliothèque** et revalidés à
//! chaque appel par `zynora-file-manager` (lui-même adossé à `zynora-security`).

use std::collections::HashSet;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;
use zynora_database::{DocumentRecord, TrashRecord};
use zynora_file_manager::{Entry, EntryKind, IMPORTABLE_EXTENSIONS, Library};

use crate::{AppState, CommandError};

type CommandResult<T> = Result<T, CommandError>;

#[derive(Debug, Serialize)]
pub(crate) struct LibraryInfo {
    path: String,
    is_default: bool,
}

/// Élément de la bibliothèque tel que montré à l'interface (avec l'état « favori »).
#[derive(Debug, Serialize)]
pub(crate) struct EntryView {
    #[serde(flatten)]
    entry: Entry,
    favorite: bool,
}

#[derive(Debug, Serialize)]
pub(crate) struct Dashboard {
    recent: Vec<EntryView>,
    favorites: Vec<EntryView>,
}

#[derive(Debug, Serialize)]
pub(crate) struct Rejected {
    name: String,
    reason: String,
}

#[derive(Debug, Serialize)]
pub(crate) struct ImportOutcome {
    cancelled: bool,
    imported: Vec<Entry>,
    rejected: Vec<Rejected>,
}

/// Bibliothèque courante et sa clé en base (chemin canonique).
fn open_library(state: &AppState) -> CommandResult<(Library, String)> {
    let configured = state.db()?.library_path()?;
    let root = configured.map(PathBuf::from).unwrap_or_else(|| state.default_library.clone());
    let library = Library::open(&root)?;
    let key = library.root().to_string_lossy().into_owned();
    Ok((library, key))
}

fn favorites(state: &AppState, key: &str) -> CommandResult<HashSet<String>> {
    Ok(state.db()?.favorite_documents(key)?.into_iter().map(|d| d.path).collect())
}

fn views(entries: Vec<Entry>, favorites: &HashSet<String>) -> Vec<EntryView> {
    entries
        .into_iter()
        .map(|entry| {
            let favorite = favorites.contains(&entry.path);
            EntryView { entry, favorite }
        })
        .collect()
}

/// Documents connus de la base qui existent encore sur le disque (un fichier supprimé
/// hors de ZYNORA disparaît simplement des listes).
fn existing(library: &Library, records: Vec<DocumentRecord>) -> Vec<EntryView> {
    records
        .into_iter()
        .filter_map(|record| {
            library.entry(&record.path).ok().map(|entry| EntryView { entry, favorite: record.favorite })
        })
        .collect()
}

fn now_ms() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as i64).unwrap_or(0)
}

#[tauri::command]
pub(crate) fn library_info(state: State<'_, AppState>) -> CommandResult<LibraryInfo> {
    let (library, _) = open_library(&state)?;
    let is_default = state.db()?.library_path()?.is_none();
    Ok(LibraryInfo { path: library.root().to_string_lossy().into_owned(), is_default })
}

/// Ouvre le dialogue natif de choix de dossier. `None` si l'utilisateur annule.
#[tauri::command]
pub(crate) async fn choose_library(app: AppHandle, state: State<'_, AppState>) -> CommandResult<Option<LibraryInfo>> {
    let Some(picked) = app.dialog().file().set_title("Dossier des documents ZYNORA").blocking_pick_folder() else {
        return Ok(None);
    };
    let path = picked.into_path().map_err(|_| CommandError::new("dossier non pris en charge"))?;
    let path = path.canonicalize().map_err(|_| CommandError::new("dossier introuvable"))?;
    if path.parent().is_none() || path.starts_with(&state.data_dir) {
        return Err(CommandError::new("ce dossier ne peut pas servir de bibliothèque"));
    }
    let library = Library::open(&path)?;
    let display = library.root().to_string_lossy().into_owned();
    state.db()?.set_library_path(&display)?;
    Ok(Some(LibraryInfo { path: display, is_default: false }))
}

#[tauri::command]
pub(crate) fn list_folder(state: State<'_, AppState>, path: String) -> CommandResult<Vec<EntryView>> {
    let (library, key) = open_library(&state)?;
    let entries = library.list(&path)?;
    Ok(views(entries, &favorites(&state, &key)?))
}

#[tauri::command]
pub(crate) async fn search_documents(state: State<'_, AppState>, query: String) -> CommandResult<Vec<EntryView>> {
    if query.chars().count() > 200 {
        return Err(CommandError::new("recherche trop longue"));
    }
    let (library, key) = open_library(&state)?;
    let entries = library.search(&query, 200)?;
    Ok(views(entries, &favorites(&state, &key)?))
}

#[tauri::command]
pub(crate) fn dashboard(state: State<'_, AppState>) -> CommandResult<Dashboard> {
    let (library, key) = open_library(&state)?;
    let (recent, favorites) = {
        let db = state.db()?;
        (db.recent_documents(&key, 12)?, db.favorite_documents(&key)?)
    };
    Ok(Dashboard { recent: existing(&library, recent), favorites: existing(&library, favorites) })
}

#[tauri::command]
pub(crate) fn create_folder(state: State<'_, AppState>, parent: String, name: String) -> CommandResult<Entry> {
    let (library, _) = open_library(&state)?;
    let entry = library.create_folder(&parent, &name)?;
    state.db()?.record_event("folder.create", &entry.path)?;
    Ok(entry)
}

#[tauri::command]
pub(crate) fn rename_entry(state: State<'_, AppState>, path: String, new_name: String) -> CommandResult<Entry> {
    let (library, key) = open_library(&state)?;
    let entry = library.rename(&path, &new_name)?;
    state.db()?.rename_documents(&key, &path, &entry.path, &entry.name)?;
    Ok(entry)
}

/// Ouvre le dialogue natif de sélection, puis importe chaque fichier après validation.
#[tauri::command]
pub(crate) async fn import_documents(
    app: AppHandle,
    state: State<'_, AppState>,
    folder: String,
) -> CommandResult<ImportOutcome> {
    let (library, key) = open_library(&state)?;
    library.list(&folder)?; // le dossier cible doit exister avant d'ouvrir le dialogue
    let Some(picked) = app
        .dialog()
        .file()
        .set_title("Importer des documents")
        .add_filter("Documents", IMPORTABLE_EXTENSIONS)
        .blocking_pick_files()
    else {
        return Ok(ImportOutcome { cancelled: true, imported: Vec::new(), rejected: Vec::new() });
    };

    let sources: Vec<PathBuf> = picked.into_iter().filter_map(|p| p.into_path().ok()).collect();
    Ok(import_paths(&state, &library, &key, &folder, &sources))
}

fn import_paths(state: &AppState, library: &Library, key: &str, folder: &str, sources: &[PathBuf]) -> ImportOutcome {
    let mut outcome = ImportOutcome { cancelled: false, imported: Vec::new(), rejected: Vec::new() };
    for source in sources {
        let name = source.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
        match library.import(source, folder) {
            Ok(entry) => {
                if let Ok(mut db) = state.db() {
                    let _ = db.touch_document(key, &entry.path, &entry.name, entry.kind.as_str());
                    let _ = db.record_event("document.import", &entry.path);
                }
                outcome.imported.push(entry);
            }
            Err(error) => {
                let reason = error.to_string();
                if let Ok(mut db) = state.db() {
                    let _ = db.record_event("document.import_refused", &format!("{name} : {reason}"));
                }
                outcome.rejected.push(Rejected { name, reason });
            }
        }
    }
    outcome
}

#[tauri::command]
pub(crate) fn set_favorite(state: State<'_, AppState>, path: String, favorite: bool) -> CommandResult<bool> {
    let (library, key) = open_library(&state)?;
    let entry = library.entry(&path)?;
    if entry.kind == EntryKind::Folder {
        return Err(CommandError::new("seuls les documents peuvent être mis en favori"));
    }
    state.db()?.set_favorite(&key, &entry.path, &entry.name, entry.kind.as_str(), favorite)?;
    Ok(favorite)
}

#[tauri::command]
pub(crate) fn trash_entry(state: State<'_, AppState>, path: String) -> CommandResult<TrashRecord> {
    let (library, key) = open_library(&state)?;
    let trashed = library.move_to_trash(&path)?;
    let record = TrashRecord {
        id: trashed.id,
        original_path: trashed.original_path,
        name: trashed.name,
        is_dir: trashed.is_dir,
        size: trashed.size,
        deleted_at_ms: now_ms(),
    };
    state.db()?.record_trashed(&key, &record)?;
    Ok(record)
}

#[tauri::command]
pub(crate) fn list_trash(state: State<'_, AppState>) -> CommandResult<Vec<TrashRecord>> {
    let (_, key) = open_library(&state)?;
    Ok(state.db()?.trash_items(&key)?)
}

fn trash_record(state: &AppState, key: &str, id: &str) -> CommandResult<TrashRecord> {
    state.db()?.trash_item(key, id)?.ok_or_else(|| CommandError::new("élément absent de la corbeille"))
}

#[tauri::command]
pub(crate) fn restore_trash(state: State<'_, AppState>, id: String) -> CommandResult<Entry> {
    let (library, key) = open_library(&state)?;
    let record = trash_record(&state, &key, &id)?;
    let entry = library.restore(&record.id, &record.original_path)?;
    state.db()?.remove_trash_item(&key, &record.id, "trash.restore")?;
    Ok(entry)
}

/// Suppression définitive d'un élément de la corbeille. L'interface demande confirmation avant.
#[tauri::command]
pub(crate) fn purge_trash(state: State<'_, AppState>, id: String) -> CommandResult<()> {
    let (library, key) = open_library(&state)?;
    let record = trash_record(&state, &key, &id)?;
    library.purge(&record.id)?;
    state.db()?.remove_trash_item(&key, &record.id, "trash.purge")?;
    Ok(())
}

#[tauri::command]
pub(crate) fn empty_trash(state: State<'_, AppState>) -> CommandResult<usize> {
    let (library, key) = open_library(&state)?;
    let items = state.db()?.trash_items(&key)?;
    for item in &items {
        library.purge(&item.id)?;
        state.db()?.remove_trash_item(&key, &item.id, "trash.purge")?;
    }
    Ok(items.len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn l_import_par_lot_continue_apres_un_refus_et_journalise_tout() {
        let dir = tempfile::tempdir().expect("dossier");
        let source_dir = tempfile::tempdir().expect("sources");
        let ok = source_dir.path().join("notes.txt");
        let bad = source_dir.path().join("faux.pdf");
        std::fs::write(&ok, "bonjour").expect("écriture");
        std::fs::write(&bad, "pas un pdf").expect("écriture");

        let state = AppState {
            db: Ok(std::sync::Mutex::new(zynora_database::Database::open_in_memory().expect("base"))),
            data_dir: dir.path().join("data"),
            default_library: dir.path().join("ZYNORA"),
            previous_session_interrupted: false,
        };
        let (library, key) = open_library(&state).expect("bibliothèque");
        let outcome = import_paths(&state, &library, &key, "", &[bad, ok]);

        assert_eq!(outcome.imported.iter().map(|e| e.name.as_str()).collect::<Vec<_>>(), ["notes.txt"]);
        assert_eq!(outcome.rejected.len(), 1);
        assert_eq!(outcome.rejected[0].name, "faux.pdf");
        let db = state.db().expect("base");
        assert_eq!(db.recent_documents(&key, 10).expect("récents")[0].path, "notes.txt");
        let actions: Vec<_> = db.recent_events(5).expect("journal").into_iter().map(|e| e.action).collect();
        assert!(actions.contains(&"document.import".to_owned()));
        assert!(actions.contains(&"document.import_refused".to_owned()));
        drop(db);
        assert!(std::path::Path::new(&key).join("notes.txt").exists());
    }
}
