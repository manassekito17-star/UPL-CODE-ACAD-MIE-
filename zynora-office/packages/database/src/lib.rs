//! Base locale SQLite de ZYNORA OFFICE.
//!
//! Une seule base par utilisateur, dans le dossier de données de l'application.
//! Le schéma évolue par migrations numérotées (`PRAGMA user_version`) appliquées chacune
//! dans une transaction. Une base créée par une version **plus récente** de l'application
//! n'est jamais ouverte, pour ne pas l'abîmer.

use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::{Connection, OptionalExtension, Transaction, params};
use serde::{Deserialize, Serialize};

mod documents;
mod migrations;

pub use documents::{DocumentRecord, RecoveryRecord, TrashRecord};

pub use migrations::LATEST_VERSION;

#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {
    #[error("erreur de la base locale : {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error(
        "cette base a été créée par une version plus récente de ZYNORA OFFICE (schéma {found}, maximum géré {supported})"
    )]
    NewerSchema { found: u32, supported: u32 },
    #[error("valeur enregistrée invalide pour « {0} »")]
    CorruptedValue(String),
}

pub type Result<T> = std::result::Result<T, DatabaseError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Theme {
    Light,
    Dark,
    System,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    Fr,
    En,
}

impl Theme {
    pub fn as_str(self) -> &'static str {
        match self {
            Theme::Light => "light",
            Theme::Dark => "dark",
            Theme::System => "system",
        }
    }
}

impl Language {
    pub fn as_str(self) -> &'static str {
        match self {
            Language::Fr => "fr",
            Language::En => "en",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Settings {
    pub theme: Theme,
    pub language: Language,
}

impl Default for Settings {
    fn default() -> Self {
        Self { theme: Theme::System, language: Language::Fr }
    }
}

/// Modification d'un paramètre. Le type énuméré garantit qu'aucune clé ni valeur
/// arbitraire venant de l'interface ne peut être écrite en base.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "key", content = "value", rename_all = "snake_case")]
pub enum SettingChange {
    Theme(Theme),
    Language(Language),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct AuditEvent {
    pub id: i64,
    pub at_ms: i64,
    pub action: String,
    pub detail: String,
}

/// Nombre d'événements conservés dans le journal ; les plus anciens sont supprimés.
pub const AUDIT_LOG_CAPACITY: i64 = 10_000;

pub struct Database {
    pub(crate) conn: Connection,
}

impl Database {
    pub fn open(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        Self::init(conn)
    }

    pub fn open_in_memory() -> Result<Self> {
        Self::init(Connection::open_in_memory()?)
    }

    fn init(mut conn: Connection) -> Result<Self> {
        conn.pragma_update(None, "foreign_keys", "ON")?;
        conn.busy_timeout(std::time::Duration::from_secs(5))?;
        migrations::migrate(&mut conn)?;
        Ok(Self { conn })
    }

    pub fn schema_version(&self) -> Result<u32> {
        Ok(self.conn.pragma_query_value(None, "user_version", |row| row.get(0))?)
    }

    pub fn settings(&self) -> Result<Settings> {
        let mut settings = Settings::default();
        if let Some(theme) = self.read_setting::<Theme>("theme")? {
            settings.theme = theme;
        }
        if let Some(language) = self.read_setting::<Language>("language")? {
            settings.language = language;
        }
        Ok(settings)
    }

    fn read_setting<T: for<'de> Deserialize<'de>>(&self, key: &str) -> Result<Option<T>> {
        let raw: Option<String> =
            self.conn.query_row("SELECT value FROM settings WHERE key = ?1", [key], |row| row.get(0)).optional()?;
        // Valeurs stockées en JSON pour rester extensibles (objets, nombres plus tard).
        raw.map(|json| serde_json::from_str(&json).map_err(|_| DatabaseError::CorruptedValue(key.to_owned())))
            .transpose()
    }

    /// Applique une modification et l'inscrit au journal dans la même transaction.
    pub fn apply_setting(&mut self, change: SettingChange) -> Result<Settings> {
        let (key, value) = match change {
            SettingChange::Theme(t) => ("theme", t.as_str()),
            SettingChange::Language(l) => ("language", l.as_str()),
        };
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT INTO settings (key, value, updated_at_ms) VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at_ms = excluded.updated_at_ms",
            params![key, serde_json::to_string(value).unwrap_or_default(), now_ms()],
        )?;
        insert_event(&tx, "settings.update", &format!("{key}={value}"))?;
        tx.commit()?;
        self.settings()
    }

    /// Inscrit une opération sensible au journal local (jamais de contenu de document).
    pub fn record_event(&mut self, action: &str, detail: &str) -> Result<()> {
        let tx = self.conn.transaction()?;
        insert_event(&tx, action, detail)?;
        tx.commit()?;
        Ok(())
    }

    pub fn recent_events(&self, limit: u32) -> Result<Vec<AuditEvent>> {
        let mut stmt =
            self.conn.prepare("SELECT id, at_ms, action, detail FROM audit_log ORDER BY id DESC LIMIT ?1")?;
        let rows = stmt.query_map([limit], |row| {
            Ok(AuditEvent { id: row.get(0)?, at_ms: row.get(1)?, action: row.get(2)?, detail: row.get(3)? })
        })?;
        Ok(rows.collect::<std::result::Result<_, _>>()?)
    }
}

pub(crate) fn insert_event(tx: &Transaction<'_>, action: &str, detail: &str) -> Result<()> {
    tx.execute("INSERT INTO audit_log (at_ms, action, detail) VALUES (?1, ?2, ?3)", params![now_ms(), action, detail])?;
    tx.execute("DELETE FROM audit_log WHERE id <= (SELECT MAX(id) FROM audit_log) - ?1", [AUDIT_LOG_CAPACITY])?;
    Ok(())
}

pub(crate) fn now_ms() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as i64).unwrap_or(0)
}

#[cfg(test)]
mod tests;
