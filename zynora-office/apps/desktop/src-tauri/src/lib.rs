//! Point d'entrée de l'application de bureau.
//!
//! L'interface (WebView) ne dispose d'aucune API système : elle ne peut appeler que les
//! commandes déclarées ici, dont les arguments sont typés et validés par serde.

use std::sync::{Mutex, MutexGuard};

use serde::Serialize;
use tauri::{Manager, State};
use zynora_database::{AuditEvent, Database, DatabaseError, SettingChange, Settings};

struct AppState {
    db: Mutex<Database>,
}

impl AppState {
    fn db(&self) -> Result<MutexGuard<'_, Database>, CommandError> {
        self.db.lock().map_err(|_| CommandError::new("la base locale est indisponible, redémarrez l'application"))
    }
}

/// Erreur renvoyée à l'interface : un message lisible, jamais de détail interne sensible.
#[derive(Debug, Serialize)]
struct CommandError {
    message: String,
}

impl CommandError {
    fn new(message: impl Into<String>) -> Self {
        Self { message: message.into() }
    }
}

impl From<DatabaseError> for CommandError {
    fn from(error: DatabaseError) -> Self {
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
}

#[tauri::command]
fn app_info(state: State<'_, AppState>) -> Result<AppInfo, CommandError> {
    Ok(AppInfo {
        name: "ZYNORA Office",
        version: env!("CARGO_PKG_VERSION"),
        schema_version: state.db()?.schema_version()?,
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
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

pub fn run() {
    let result = tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let mut db = Database::open(&data_dir.join("zynora.db"))?;
            db.record_event("app.start", env!("CARGO_PKG_VERSION"))?;
            app.manage(AppState { db: Mutex::new(db) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![app_info, get_settings, update_setting, recent_events])
        .run(tauri::generate_context!());

    if let Err(error) = result {
        eprintln!("ZYNORA Office n'a pas pu démarrer : {error}");
        std::process::exit(1);
    }
}
