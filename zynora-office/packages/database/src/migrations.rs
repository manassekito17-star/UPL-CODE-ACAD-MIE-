//! Migrations du schéma. Ne jamais modifier une migration publiée : en ajouter une nouvelle.

use rusqlite::Connection;

use crate::{DatabaseError, Result};

const MIGRATIONS: &[&str] = &[
    // 1 — Phase 0 : paramètres et journal des opérations sensibles.
    "CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at_ms INTEGER NOT NULL
     ) STRICT;
     CREATE TABLE audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        at_ms INTEGER NOT NULL,
        action TEXT NOT NULL,
        detail TEXT NOT NULL
     ) STRICT;",
];

pub const LATEST_VERSION: u32 = MIGRATIONS.len() as u32;

pub(crate) fn migrate(conn: &mut Connection) -> Result<()> {
    let current: u32 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if current > LATEST_VERSION {
        return Err(DatabaseError::NewerSchema { found: current, supported: LATEST_VERSION });
    }
    for (index, sql) in MIGRATIONS.iter().enumerate().skip(current as usize) {
        let tx = conn.transaction()?;
        tx.execute_batch(sql)?;
        tx.pragma_update(None, "user_version", index as u32 + 1)?;
        tx.commit()?;
    }
    Ok(())
}
