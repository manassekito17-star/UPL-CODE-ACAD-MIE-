//! Migrations du schéma. Ne jamais modifier une migration publiée : en ajouter une nouvelle.

use rusqlite::Connection;

use crate::{DatabaseError, Result};

pub(crate) const MIGRATIONS: &[&str] = &[
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
    // 2 — Phase 1 : documents (récents, favoris) et corbeille, par bibliothèque.
    "CREATE TABLE documents (
        library TEXT NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),
        last_used_at_ms INTEGER,
        PRIMARY KEY (library, path)
     ) STRICT;
     CREATE INDEX documents_recent ON documents (library, last_used_at_ms DESC);
     CREATE TABLE trash (
        id TEXT PRIMARY KEY NOT NULL,
        library TEXT NOT NULL,
        original_path TEXT NOT NULL,
        name TEXT NOT NULL,
        is_dir INTEGER NOT NULL CHECK (is_dir IN (0, 1)),
        size INTEGER NOT NULL,
        deleted_at_ms INTEGER NOT NULL
     ) STRICT;
     CREATE INDEX trash_by_library ON trash (library, deleted_at_ms DESC);",
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
