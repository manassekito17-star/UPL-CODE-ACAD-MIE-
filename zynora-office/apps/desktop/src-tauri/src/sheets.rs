//! Commandes de ZYNORA Sheets.
//!
//! Les classeurs ouverts vivent dans le cœur Rust ; l'interface ne reçoit que la partie visible
//! de la grille et les valeurs **calculées par le moteur**. Les fichiers sont lus et revalidés
//! par la bibliothèque, enregistrés de façon atomique, et une copie de récupération est écrite
//! à intervalle régulier tant que des modifications ne sont pas enregistrées.

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Mutex, MutexGuard};

use serde::{Deserialize, Serialize};
use tauri::State;
use zynora_database::{Language, RecoveryRecord};
use zynora_file_manager::{Entry, Library, write_atomic};
use zynora_spreadsheet_engine::{
    CellRange, Copied, FormulaLanguage, RangeView, SelectionStats, SheetError, SheetInfo, StyleChange, Workbook,
};

use crate::library::open_library;
use crate::{AppState, CommandError};

type CommandResult<T> = Result<T, CommandError>;

impl From<SheetError> for CommandError {
    fn from(error: SheetError) -> Self {
        CommandError::new(error.to_string())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum SheetFormat {
    Xlsx,
    Csv,
}

pub(crate) struct OpenWorkbook {
    workbook: Workbook,
    library: String,
    path: String,
    format: SheetFormat,
    /// Modifié depuis le dernier enregistrement.
    dirty: bool,
    /// Modifié depuis la dernière copie de récupération.
    unsnapshotted: bool,
    clipboard: Option<Copied>,
}

#[derive(Default)]
pub(crate) struct Workbooks {
    open: Mutex<HashMap<u32, OpenWorkbook>>,
    next_id: AtomicU32,
}

impl Workbooks {
    fn lock(&self) -> CommandResult<MutexGuard<'_, HashMap<u32, OpenWorkbook>>> {
        self.open.lock().map_err(|_| CommandError::new("classeurs indisponibles, redémarrez l'application"))
    }
}

fn with<T>(state: &AppState, id: u32, f: impl FnOnce(&mut OpenWorkbook) -> CommandResult<T>) -> CommandResult<T> {
    let mut open = state.workbooks.lock()?;
    let book = open.get_mut(&id).ok_or_else(|| CommandError::new("classeur fermé"))?;
    f(book)
}

/// Modification : le classeur devient « non enregistré ».
fn edit<T>(
    state: &AppState,
    id: u32,
    f: impl FnOnce(&mut Workbook) -> Result<T, SheetError>,
) -> CommandResult<EditResult<T>> {
    with(state, id, |book| {
        let value = f(&mut book.workbook)?;
        book.dirty = true;
        book.unsnapshotted = true;
        Ok(EditResult { value, state: book_state(book) })
    })
}

#[derive(Debug, Serialize)]
pub(crate) struct BookState {
    dirty: bool,
    can_undo: bool,
    can_redo: bool,
}

fn book_state(book: &OpenWorkbook) -> BookState {
    BookState { dirty: book.dirty, can_undo: book.workbook.can_undo(), can_redo: book.workbook.can_redo() }
}

#[derive(Debug, Serialize)]
pub(crate) struct EditResult<T> {
    value: T,
    state: BookState,
}

#[derive(Debug, Serialize)]
pub(crate) struct WorkbookInfo {
    id: u32,
    path: String,
    name: String,
    format: SheetFormat,
    sheets: Vec<SheetInfo>,
    state: BookState,
    /// Ouvert depuis une copie de récupération (modifications non enregistrées retrouvées).
    recovered: bool,
}

fn formula_language(state: &AppState) -> CommandResult<FormulaLanguage> {
    Ok(match state.db()?.settings()?.language {
        Language::Fr => FormulaLanguage::Fr,
        Language::En => FormulaLanguage::En,
    })
}

fn register(state: &AppState, book: OpenWorkbook, recovered: bool) -> CommandResult<WorkbookInfo> {
    let id = state.workbooks.next_id.fetch_add(1, Ordering::Relaxed) + 1;
    let info = WorkbookInfo {
        id,
        name: book.path.rsplit('/').next().unwrap_or(&book.path).to_owned(),
        path: book.path.clone(),
        format: book.format,
        sheets: book.workbook.sheets(),
        state: book_state(&book),
        recovered,
    };
    let mut db = state.db()?;
    let kind = "spreadsheet";
    let _ = db.touch_document(&book.library, &book.path, &info.name, kind);
    let _ = db.record_event("sheets.open", &book.path);
    drop(db);
    state.workbooks.lock()?.insert(id, book);
    Ok(info)
}

fn load(
    bytes: &[u8],
    extension: &str,
    name: &str,
    language: FormulaLanguage,
) -> CommandResult<(Workbook, SheetFormat)> {
    match extension {
        "xlsx" => Ok((Workbook::from_xlsx(bytes, name, language)?, SheetFormat::Xlsx)),
        "csv" => {
            let text = String::from_utf8(bytes.to_vec())
                .map_err(|_| CommandError::new("le fichier CSV n'est pas en UTF-8"))?;
            Ok((Workbook::from_csv(&text, name, language)?, SheetFormat::Csv))
        }
        "ods" => Err(CommandError::new(
            "l'ouverture des fichiers ODS n'est pas encore prise en charge (voir COMPATIBILITY.md) ; enregistrez-le en XLSX depuis LibreOffice",
        )),
        _ => Err(CommandError::new("ce document n'est pas un classeur")),
    }
}

#[tauri::command]
pub(crate) fn sheets_open(state: State<'_, AppState>, path: String) -> CommandResult<WorkbookInfo> {
    let (library, key) = open_library(&state)?;
    let (bytes, extension) = library.read_document(&path)?;
    let name = path.rsplit('/').next().unwrap_or(&path).to_owned();
    let (workbook, format) = load(&bytes, &extension, &name, formula_language(&state)?)?;
    let book =
        OpenWorkbook { workbook, library: key, path, format, dirty: false, unsnapshotted: false, clipboard: None };
    register(&state, book, false)
}

#[tauri::command]
pub(crate) fn sheets_create(state: State<'_, AppState>, folder: String) -> CommandResult<WorkbookInfo> {
    let (library, key) = open_library(&state)?;
    let language = formula_language(&state)?;
    let name = match language {
        FormulaLanguage::Fr => "Classeur.xlsx",
        FormulaLanguage::En => "Workbook.xlsx",
    };
    let workbook = Workbook::new(name, language)?;
    let entry = library.create_document(&folder, name, &workbook.to_xlsx()?)?;
    state.db()?.record_event("sheets.create", &entry.path)?;
    let book = OpenWorkbook {
        workbook,
        library: key,
        path: entry.path,
        format: SheetFormat::Xlsx,
        dirty: false,
        unsnapshotted: false,
        clipboard: None,
    };
    register(&state, book, false)
}

#[derive(Debug, Serialize)]
pub(crate) struct CellContent {
    content: String,
    display: String,
}

#[tauri::command]
pub(crate) fn sheets_range(state: State<'_, AppState>, id: u32, range: CellRange) -> CommandResult<RangeView> {
    with(&state, id, |book| Ok(book.workbook.range(range)?))
}

#[tauri::command]
pub(crate) fn sheets_cell(
    state: State<'_, AppState>,
    id: u32,
    sheet: u32,
    row: i32,
    column: i32,
) -> CommandResult<CellContent> {
    with(&state, id, |book| {
        Ok(CellContent {
            content: book.workbook.content(sheet, row, column)?,
            display: book.workbook.display(sheet, row, column)?,
        })
    })
}

#[tauri::command]
pub(crate) fn sheets_stats(state: State<'_, AppState>, id: u32, range: CellRange) -> CommandResult<SelectionStats> {
    with(&state, id, |book| Ok(book.workbook.stats(range)?))
}

#[tauri::command]
pub(crate) fn sheets_set_input(
    state: State<'_, AppState>,
    id: u32,
    sheet: u32,
    row: i32,
    column: i32,
    input: String,
) -> CommandResult<EditResult<()>> {
    if input.len() > 32_767 {
        return Err(CommandError::new("une cellule contient au plus 32 767 caractères"));
    }
    edit(&state, id, |wb| wb.set_input(sheet, row, column, &input))
}

#[tauri::command]
pub(crate) fn sheets_clear(state: State<'_, AppState>, id: u32, range: CellRange) -> CommandResult<EditResult<()>> {
    edit(&state, id, |wb| wb.clear_contents(range))
}

#[tauri::command]
pub(crate) fn sheets_style(
    state: State<'_, AppState>,
    id: u32,
    range: CellRange,
    change: StyleChange,
) -> CommandResult<EditResult<()>> {
    edit(&state, id, |wb| wb.apply_style(range, &change))
}

#[derive(Debug, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
pub(crate) enum Structure {
    InsertRows { sheet: u32, at: i32, count: i32 },
    DeleteRows { sheet: u32, at: i32, count: i32 },
    InsertColumns { sheet: u32, at: i32, count: i32 },
    DeleteColumns { sheet: u32, at: i32, count: i32 },
    Merge { range: CellRange },
    Unmerge { range: CellRange },
    ColumnWidth { sheet: u32, column: i32, width: f64 },
}

#[tauri::command]
pub(crate) fn sheets_structure(
    state: State<'_, AppState>,
    id: u32,
    change: Structure,
) -> CommandResult<EditResult<()>> {
    edit(&state, id, |wb| match change {
        Structure::InsertRows { sheet, at, count } => wb.insert_rows(sheet, at, count.clamp(1, 10_000)),
        Structure::DeleteRows { sheet, at, count } => wb.delete_rows(sheet, at, count.clamp(1, 10_000)),
        Structure::InsertColumns { sheet, at, count } => wb.insert_columns(sheet, at, count.clamp(1, 1_000)),
        Structure::DeleteColumns { sheet, at, count } => wb.delete_columns(sheet, at, count.clamp(1, 1_000)),
        Structure::Merge { range } => wb.merge(range),
        Structure::Unmerge { range } => wb.unmerge(range),
        Structure::ColumnWidth { sheet, column, width } => wb.set_column_width(sheet, column, width),
    })
}

#[derive(Debug, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
pub(crate) enum SheetOp {
    Add,
    Rename { sheet: u32, name: String },
    Delete { sheet: u32 },
}

#[tauri::command]
pub(crate) fn sheets_sheet(
    state: State<'_, AppState>,
    id: u32,
    change: SheetOp,
) -> CommandResult<EditResult<Vec<SheetInfo>>> {
    edit(&state, id, |wb| {
        match change {
            SheetOp::Add => {
                wb.add_sheet()?;
            }
            SheetOp::Rename { sheet, name } => wb.rename_sheet(sheet, &name)?,
            SheetOp::Delete { sheet } => wb.delete_sheet(sheet)?,
        }
        Ok(wb.sheets())
    })
}

#[tauri::command]
pub(crate) fn sheets_history(
    state: State<'_, AppState>,
    id: u32,
    redo: bool,
) -> CommandResult<EditResult<Vec<SheetInfo>>> {
    edit(&state, id, |wb| {
        if redo {
            wb.redo()?
        } else {
            wb.undo()?
        }
        Ok(wb.sheets())
    })
}

/// Copie (ou coupe) une plage dans le presse-papiers interne ; renvoie le texte tabulé
/// pour le presse-papiers du système.
#[tauri::command]
pub(crate) fn sheets_copy(state: State<'_, AppState>, id: u32, range: CellRange, cut: bool) -> CommandResult<String> {
    with(&state, id, |book| {
        let copied = book.workbook.copy(range)?;
        let text = copied.text.clone();
        book.clipboard = Some(copied);
        if cut {
            book.dirty = true;
            book.unsnapshotted = true;
        }
        Ok(text)
    })
}

/// Colle le presse-papiers interne si son texte correspond à celui du système (copie faite dans
/// ZYNORA : formules ajustées), sinon le texte venant d'une autre application.
#[tauri::command]
pub(crate) fn sheets_paste(
    state: State<'_, AppState>,
    id: u32,
    target: CellRange,
    text: String,
    cut: bool,
) -> CommandResult<EditResult<()>> {
    with(&state, id, |book| {
        match book.clipboard.take() {
            Some(copied) if copied.text.trim_end() == text.trim_end() => {
                book.workbook.paste(target, &copied, cut)?;
                if !cut {
                    book.clipboard = Some(copied);
                }
            }
            _ => book.workbook.paste_text(target, &text)?,
        }
        book.dirty = true;
        book.unsnapshotted = true;
        Ok(EditResult { value: (), state: book_state(book) })
    })
}

fn recovery_dir(state: &AppState) -> PathBuf {
    state.data_dir.join("recovery")
}

/// Nom de fichier de récupération stable pour un document (empreinte FNV-1a, sans chemin).
fn recovery_name(library: &str, path: &str) -> String {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in library.bytes().chain([0]).chain(path.bytes()) {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x0100_0000_01b3);
    }
    format!("{hash:016x}.xlsx")
}

fn discard_recovery(state: &AppState, library: &str, path: &str) -> CommandResult<()> {
    if let Some(file) = state.db()?.take_recovery(library, path)? {
        let _ = fs::remove_file(recovery_dir(state).join(file));
    }
    Ok(())
}

/// Enregistre le classeur à son emplacement (XLSX, ou CSV de la première feuille).
#[tauri::command]
pub(crate) fn sheets_save(state: State<'_, AppState>, id: u32) -> CommandResult<BookState> {
    save(&state, id)
}

fn save(state: &AppState, id: u32) -> CommandResult<BookState> {
    let (bytes, library_key, path) = with(state, id, |book| {
        let bytes = match book.format {
            SheetFormat::Xlsx => book.workbook.to_xlsx()?,
            SheetFormat::Csv => book.workbook.to_csv(0)?.into_bytes(),
        };
        Ok((bytes, book.library.clone(), book.path.clone()))
    })?;
    let library = Library::open(std::path::Path::new(&library_key))?;
    let entry: Entry = library.save_document(&path, &bytes)?;
    discard_recovery(state, &library_key, &path)?;
    state.db()?.record_event("sheets.save", &entry.path)?;
    with(state, id, |book| {
        book.dirty = false;
        book.unsnapshotted = false;
        Ok(book_state(book))
    })
}

/// Sauvegarde automatique : copie de récupération (dans le dossier de données de l'application,
/// jamais à la place du document) si des modifications ne sont pas encore protégées.
#[tauri::command]
pub(crate) fn sheets_autosave(state: State<'_, AppState>, id: u32) -> CommandResult<bool> {
    autosave(&state, id)
}

fn autosave(state: &AppState, id: u32) -> CommandResult<bool> {
    let snapshot = with(state, id, |book| {
        if !book.dirty || !book.unsnapshotted {
            return Ok(None);
        }
        Ok(Some((book.workbook.to_xlsx()?, book.library.clone(), book.path.clone())))
    })?;
    let Some((bytes, library, path)) = snapshot else { return Ok(false) };
    let dir = recovery_dir(state);
    fs::create_dir_all(&dir).map_err(|_| CommandError::new("dossier de récupération inaccessible"))?;
    let file = recovery_name(&library, &path);
    write_atomic(&dir.join(&file), &bytes)?;
    state.db()?.set_recovery(&library, &path, &file)?;
    with(state, id, |book| {
        book.unsnapshotted = false;
        Ok(())
    })?;
    Ok(true)
}

/// Ferme un classeur. Sans `discard`, un classeur non enregistré n'est pas fermé.
#[tauri::command]
pub(crate) fn sheets_close(state: State<'_, AppState>, id: u32, discard: bool) -> CommandResult<bool> {
    close(&state, id, discard)
}

fn close(state: &AppState, id: u32, discard: bool) -> CommandResult<bool> {
    let mut open = state.workbooks.lock()?;
    let Some(book) = open.get(&id) else { return Ok(true) };
    if book.dirty && !discard {
        return Ok(false);
    }
    let book = open.remove(&id).ok_or_else(|| CommandError::new("classeur fermé"))?;
    drop(open);
    // Fermeture volontaire sans enregistrer : la copie de récupération n'a plus lieu d'être.
    discard_recovery(state, &book.library, &book.path)?;
    Ok(true)
}

#[tauri::command]
pub(crate) fn list_recoveries(state: State<'_, AppState>) -> CommandResult<Vec<RecoveryRecord>> {
    let (_, key) = open_library(&state)?;
    Ok(state.db()?.recoveries(&key)?)
}

/// Rouvre un document à partir de sa copie de récupération (non enregistré tant que
/// l'utilisateur ne l'enregistre pas).
#[tauri::command]
pub(crate) fn sheets_open_recovery(state: State<'_, AppState>, path: String) -> CommandResult<WorkbookInfo> {
    let (library, key) = open_library(&state)?;
    let record = state
        .db()?
        .recoveries(&key)?
        .into_iter()
        .find(|r| r.path == path)
        .ok_or_else(|| CommandError::new("aucune copie de récupération pour ce document"))?;
    let bytes = fs::read(recovery_dir(&state).join(&record.file))
        .map_err(|_| CommandError::new("copie de récupération introuvable"))?;
    zynora_file_manager::validate_bytes(&bytes, "xlsx")?;
    library.entry(&path)?; // le document d'origine doit toujours exister pour y enregistrer
    let name = path.rsplit('/').next().unwrap_or(&path).to_owned();
    let workbook = Workbook::from_xlsx(&bytes, &name, formula_language(&state)?)?;
    let format = if path.to_lowercase().ends_with(".csv") { SheetFormat::Csv } else { SheetFormat::Xlsx };
    let book =
        OpenWorkbook { workbook, library: key, path, format, dirty: true, unsnapshotted: false, clipboard: None };
    state.db()?.record_event("sheets.recover", &book.path)?;
    register(&state, book, true)
}

#[tauri::command]
pub(crate) fn discard_recovery_command(state: State<'_, AppState>, path: String) -> CommandResult<()> {
    let (_, key) = open_library(&state)?;
    discard_recovery(&state, &key, &path)?;
    state.db()?.record_event("sheets.recovery_discarded", &path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn state(dir: &std::path::Path) -> AppState {
        AppState {
            db: Ok(std::sync::Mutex::new(zynora_database::Database::open_in_memory().expect("base"))),
            data_dir: dir.join("data"),
            default_library: dir.join("ZYNORA"),
            previous_session_interrupted: false,
            workbooks: Workbooks::default(),
        }
    }

    fn open_new(state: &AppState) -> WorkbookInfo {
        let (library, key) = open_library(state).expect("bibliothèque");
        let workbook = Workbook::new("Classeur.xlsx", FormulaLanguage::Fr).expect("classeur");
        let entry = library.create_document("", "Classeur.xlsx", &workbook.to_xlsx().expect("xlsx")).expect("création");
        let book = OpenWorkbook {
            workbook,
            library: key,
            path: entry.path,
            format: SheetFormat::Xlsx,
            dirty: false,
            unsnapshotted: false,
            clipboard: None,
        };
        register(state, book, false).expect("ouverture")
    }

    #[test]
    fn edition_recuperation_puis_enregistrement() {
        let dir = tempfile::tempdir().expect("dossier");
        let state = state(dir.path());
        let info = open_new(&state);
        assert!(
            !autosave(&state, info.id).expect("sauvegarde automatique"),
            "rien à protéger tant que rien n'est modifié"
        );

        let result = edit(&state, info.id, |wb| wb.set_input(0, 1, 1, "=6*7")).expect("saisie");
        assert!(result.state.dirty && result.state.can_undo);
        assert!(autosave(&state, info.id).expect("sauvegarde automatique"), "copie de récupération écrite");
        assert!(
            !autosave(&state, info.id).expect("sauvegarde automatique"),
            "pas de seconde copie sans nouvelle modification"
        );
        let (_, key) = open_library(&state).expect("bibliothèque");
        let recoveries = state.db().expect("base").recoveries(&key).expect("liste");
        assert_eq!(recoveries.len(), 1);
        assert!(recovery_dir(&state).join(&recoveries[0].file).exists());

        // Le document d'origine n'a pas été touché par la sauvegarde automatique.
        let (original, _) =
            Library::open(std::path::Path::new(&key)).expect("lib").read_document("Classeur.xlsx").expect("lecture");
        let untouched = Workbook::from_xlsx(&original, "x", FormulaLanguage::Fr).expect("classeur");
        assert_eq!(untouched.display(0, 1, 1).expect("A1"), "");

        // Fermeture refusée tant que non enregistré.
        assert!(!close(&state, info.id, false).expect("fermeture"));

        assert!(!save(&state, info.id).expect("enregistrement").dirty);
        assert!(
            state.db().expect("base").recoveries(&key).expect("liste").is_empty(),
            "copie supprimée après enregistrement"
        );
        let (saved, _) =
            Library::open(std::path::Path::new(&key)).expect("lib").read_document("Classeur.xlsx").expect("lecture");
        assert_eq!(
            Workbook::from_xlsx(&saved, "x", FormulaLanguage::Fr).expect("classeur").display(0, 1, 1).expect("A1"),
            "42"
        );
        assert!(close(&state, info.id, false).expect("fermeture"));
    }

    #[test]
    fn noms_de_recuperation_stables_et_sans_chemin() {
        let a = recovery_name("/lib", "Clients/devis.xlsx");
        assert_eq!(a, recovery_name("/lib", "Clients/devis.xlsx"));
        assert_ne!(a, recovery_name("/lib", "Clients/devis2.xlsx"));
        assert_ne!(a, recovery_name("/autre", "Clients/devis.xlsx"));
        assert!(a.ends_with(".xlsx") && !a.contains('/') && a.len() == 21);
    }
}
