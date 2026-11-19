//! Point d'entrée de l'application de bureau.
//!
//! L'interface (WebView) ne dispose d'aucune API système : elle ne peut appeler que les
//! commandes déclarées ici, dont les arguments sont typés et validés par serde. Les dialogues
//! natifs (choix de fichiers, de dossier) sont ouverts **par le cœur Rust**, jamais par l'interface.

use std::fs;
use std::path::PathBuf;
use std::sync::{Mutex, MutexGuard};

use serde::Serialize;
use tauri::{Manager, RunEvent, State};
use zynora_database::{AuditEvent, Database, DatabaseError, SettingChange, Settings};
use zynora_file_manager::FileError;

mod library;

pub(crate) struct AppState {
    /// Base locale, ou message d'erreur si elle n'a pas pu être ouverte au démarrage :
    /// l'application s'ouvre quand même et affiche l'erreur au lieu de se fermer.
    db: Result<Mutex<Database>, String>,
    data_dir: PathBuf,
    default_library: PathBuf,
    previous_session_interrupted: bool,
}

impl AppState {
    pub(crate) fn db(&self) -> Result<MutexGuard<'_, Database>, CommandError> {
        match &self.db {
            Ok(db) => {
                db.lock().map_err(|_| CommandError::new("la base locale est indisponible, redémarrez l'application"))
            }
            Err(message) => Err(CommandError::new(message.clone())),
        }
    }
}

/// Erreur renvoyée à l'interface : un message lisible, jamais de détail interne sensible.
#[derive(Debug, Serialize)]
pub(crate) struct CommandError {
    message: String,
}

impl CommandError {
    pub(crate) fn new(message: impl Into<String>) -> Self {
        Self { message: message.into() }
    }
}

impl From<DatabaseError> for CommandError {
    fn from(error: DatabaseError) -> Self {
        Self::new(error.to_string())
    }
}

impl From<FileError> for CommandError {
    fn from(error: FileError) -> Self {
        Self::new(error.to_string())
    }
}

#[derive(Debug, Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
    schema_version: u32,
    os: &'static str,
    arch: &'static str,
    previous_session_interrupted: bool,
}

#[tauri::command]
fn app_info(state: State<'_, AppState>) -> Result<AppInfo, CommandError> {
    Ok(AppInfo {
        name: "ZYNORA Office",
        version: env!("CARGO_PKG_VERSION"),
        schema_version: state.db()?.schema_version()?,
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        previous_session_interrupted: state.previous_session_interrupted,
    })
}

#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> Result<Settings, CommandError> {
    Ok(state.db()?.settings()?)
}

#[tauri::command]
fn update_setting(state: State<'_, AppState>, change: SettingChange) -> Result<Settings, CommandError> {
    Ok(state.db()?.apply_setting(change)?)
}

#[tauri::command]
fn recent_events(state: State<'_, AppState>, limit: u32) -> Result<Vec<AuditEvent>, CommandError> {
    Ok(state.db()?.recent_events(limit.clamp(1, 200))?)
}

const SESSION_LOCK: &str = "session.lock";

fn open_state(app: &tauri::App) -> Result<AppState, Box<dyn std::error::Error>> {
    let data_dir = app.path().app_data_dir()?;
    fs::create_dir_all(&data_dir)?;

    // Un verrou de session encore présent signifie que la session précédente ne s'est pas
    // terminée normalement (plantage, coupure de courant).
    let lock = data_dir.join(SESSION_LOCK);
    let previous_session_interrupted = lock.exists();
    fs::write(&lock, std::process::id().to_string())?;

    let db = Database::open(&data_dir.join("zynora.db"))
        .and_then(|mut db| {
            db.record_event("app.start", env!("CARGO_PKG_VERSION"))?;
            if previous_session_interrupted {
                db.record_event("app.recovered", "session précédente interrompue")?;
            }
            Ok(Mutex::new(db))
        })
        .map_err(|e| format!("La base locale n'a pas pu être ouverte : {e}"));

    let default_library = app
        .path()
        .document_dir()
        .or_else(|_| app.path().home_dir())
        .unwrap_or_else(|_| data_dir.clone())
        .join("ZYNORA");

    Ok(AppState { db, data_dir, default_library, previous_session_interrupted })
}

pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let state = open_state(app)?;
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_info,
            get_settings,
            update_setting,
            recent_events,
            library::library_info,
            library::choose_library,
            library::list_folder,
            library::search_documents,
            library::dashboard,
            library::create_folder,
            library::rename_entry,
            library::import_documents,
            library::set_favorite,
            library::trash_entry,
            library::list_trash,
            library::restore_trash,
            library::purge_trash,
            library::empty_trash,
        ])
        .build(tauri::generate_context!());

    let app = match app {
        Ok(app) => app,
        Err(error) => {
            eprintln!("ZYNORA Office n'a pas pu démarrer : {error}");
            std::process::exit(1);
        }
    };
    app.run(|handle, event| {
        if let RunEvent::Exit = event {
            // Fin normale : le verrou est retiré, la prochaine session ne signalera pas d'incident.
            if let Some(state) = handle.try_state::<AppState>() {
                let _ = fs::remove_file(state.data_dir.join(SESSION_LOCK));
            }
        }
    });
}
