//! Métadonnées des documents : bibliothèque choisie, récents, favoris, corbeille.
//! Les documents eux-mêmes restent des fichiers ordinaires ; seule leur trace est ici.

use rusqlite::{OptionalExtension, params};
use serde::Serialize;

use crate::{Database, Result, insert_event, now_ms};

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct DocumentRecord {
    pub path: String,
    pub name: String,
    pub kind: String,
    pub favorite: bool,
    pub last_used_at_ms: Option<i64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct TrashRecord {
    pub id: String,
    pub original_path: String,
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub deleted_at_ms: i64,
}

/// Copie de récupération d'un document dont les modifications n'étaient pas enregistrées.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct RecoveryRecord {
    pub path: String,
    /// Nom du fichier de récupération dans le dossier de données de l'application.
    pub file: String,
    pub saved_at_ms: i64,
}

/// Condition « ce chemin, ou un élément qu'il contient » sans LIKE (les noms peuvent contenir % ou _).
const PATH_OR_DESCENDANT: &str = "(path = ?2 OR substr(path, 1, length(?2) + 1) = ?2 || '/')";

impl Database {
    /// Dossier de la bibliothèque choisi par l'utilisateur (absent : dossier par défaut).
    pub fn library_path(&self) -> Result<Option<String>> {
        self.read_setting::<String>("library_path")
    }

    /// Enregistre le dossier de bibliothèque. Réservé au cœur Rust : la valeur provient
    /// toujours d'un dialogue natif, jamais d'une saisie de l'interface.
    pub fn set_library_path(&mut self, path: &str) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT INTO settings (key, value, updated_at_ms) VALUES ('library_path', ?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at_ms = excluded.updated_at_ms",
            params![serde_json::to_string(path).unwrap_or_default(), now_ms()],
        )?;
        insert_event(&tx, "library.select", path)?;
        tx.commit()?;
        Ok(())
    }

    /// Marque un document comme utilisé (import, ouverture) : il apparaît dans les récents.
    pub fn touch_document(&mut self, library: &str, path: &str, name: &str, kind: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO documents (library, path, name, kind, last_used_at_ms) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(library, path) DO UPDATE SET name = excluded.name, kind = excluded.kind,
                 last_used_at_ms = excluded.last_used_at_ms",
            params![library, path, name, kind, now_ms()],
        )?;
        Ok(())
    }

    pub fn set_favorite(&mut self, library: &str, path: &str, name: &str, kind: &str, favorite: bool) -> Result<()> {
        self.conn.execute(
            "INSERT INTO documents (library, path, name, kind, favorite) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(library, path) DO UPDATE SET name = excluded.name, kind = excluded.kind,
                 favorite = excluded.favorite",
            params![library, path, name, kind, favorite],
        )?;
        Ok(())
    }

    pub fn recent_documents(&self, library: &str, limit: u32) -> Result<Vec<DocumentRecord>> {
        self.query_documents(
            "SELECT path, name, kind, favorite, last_used_at_ms FROM documents
             WHERE library = ?1 AND last_used_at_ms IS NOT NULL
             ORDER BY last_used_at_ms DESC LIMIT ?2",
            params![library, limit],
        )
    }

    pub fn favorite_documents(&self, library: &str) -> Result<Vec<DocumentRecord>> {
        self.query_documents(
            "SELECT path, name, kind, favorite, last_used_at_ms FROM documents
             WHERE library = ?1 AND favorite = 1 ORDER BY name COLLATE NOCASE",
            params![library],
        )
    }

    fn query_documents(&self, sql: &str, args: impl rusqlite::Params) -> Result<Vec<DocumentRecord>> {
        let mut stmt = self.conn.prepare(sql)?;
        let rows = stmt.query_map(args, |row| {
            Ok(DocumentRecord {
                path: row.get(0)?,
                name: row.get(1)?,
                kind: row.get(2)?,
                favorite: row.get(3)?,
                last_used_at_ms: row.get(4)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<_, _>>()?)
    }

    /// Suit un renommage : le document, ou tout le contenu d'un dossier renommé.
    pub fn rename_documents(&mut self, library: &str, old_path: &str, new_path: &str, new_name: &str) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "UPDATE documents SET name = ?3 WHERE library = ?1 AND path = ?2",
            params![library, old_path, new_name],
        )?;
        tx.execute(
            &format!(
                "UPDATE documents SET path = ?3 || substr(path, length(?2) + 1)
                 WHERE library = ?1 AND {PATH_OR_DESCENDANT}"
            ),
            params![library, old_path, new_path],
        )?;
        insert_event(&tx, "document.rename", &format!("{old_path} → {new_path}"))?;
        tx.commit()?;
        Ok(())
    }

    /// Enregistre un élément mis à la corbeille et oublie ses traces (récents, favoris).
    pub fn record_trashed(&mut self, library: &str, item: &TrashRecord) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT INTO trash (id, library, original_path, name, is_dir, size, deleted_at_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![item.id, library, item.original_path, item.name, item.is_dir, item.size as i64, item.deleted_at_ms],
        )?;
        tx.execute(
            &format!("DELETE FROM documents WHERE library = ?1 AND {PATH_OR_DESCENDANT}"),
            params![library, item.original_path],
        )?;
        insert_event(&tx, "document.trash", &item.original_path)?;
        tx.commit()?;
        Ok(())
    }

    pub fn trash_items(&self, library: &str) -> Result<Vec<TrashRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, original_path, name, is_dir, size, deleted_at_ms FROM trash
             WHERE library = ?1 ORDER BY deleted_at_ms DESC, id DESC",
        )?;
        let rows = stmt.query_map([library], row_to_trash)?;
        Ok(rows.collect::<std::result::Result<_, _>>()?)
    }

    pub fn trash_item(&self, library: &str, id: &str) -> Result<Option<TrashRecord>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id, original_path, name, is_dir, size, deleted_at_ms FROM trash WHERE library = ?1 AND id = ?2",
                params![library, id],
                row_to_trash,
            )
            .optional()?)
    }

    /// Retire un élément de la corbeille (restauré ou supprimé définitivement) et le journalise.
    pub fn remove_trash_item(&mut self, library: &str, id: &str, action: &str) -> Result<()> {
        let tx = self.conn.transaction()?;
        let path: Option<String> = tx
            .query_row("SELECT original_path FROM trash WHERE library = ?1 AND id = ?2", params![library, id], |r| {
                r.get(0)
            })
            .optional()?;
        tx.execute("DELETE FROM trash WHERE library = ?1 AND id = ?2", params![library, id])?;
        insert_event(&tx, action, path.as_deref().unwrap_or(id))?;
        tx.commit()?;
        Ok(())
    }
}

impl Database {
    pub fn set_recovery(&mut self, library: &str, path: &str, file: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO recovery (library, path, file, saved_at_ms) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(library, path) DO UPDATE SET file = excluded.file, saved_at_ms = excluded.saved_at_ms",
            params![library, path, file, now_ms()],
        )?;
        Ok(())
    }

    pub fn recoveries(&self, library: &str) -> Result<Vec<RecoveryRecord>> {
        let mut stmt = self
            .conn
            .prepare("SELECT path, file, saved_at_ms FROM recovery WHERE library = ?1 ORDER BY saved_at_ms DESC")?;
        let rows = stmt.query_map([library], |r| {
            Ok(RecoveryRecord { path: r.get(0)?, file: r.get(1)?, saved_at_ms: r.get(2)? })
        })?;
        Ok(rows.collect::<std::result::Result<_, _>>()?)
    }

    /// Retire le point de récupération d'un document et renvoie son fichier, à supprimer.
    pub fn take_recovery(&mut self, library: &str, path: &str) -> Result<Option<String>> {
        let tx = self.conn.transaction()?;
        let file: Option<String> = tx
            .query_row("SELECT file FROM recovery WHERE library = ?1 AND path = ?2", params![library, path], |r| {
                r.get(0)
            })
            .optional()?;
        tx.execute("DELETE FROM recovery WHERE library = ?1 AND path = ?2", params![library, path])?;
        tx.commit()?;
        Ok(file)
    }
}

fn row_to_trash(row: &rusqlite::Row<'_>) -> rusqlite::Result<TrashRecord> {
    Ok(TrashRecord {
        id: row.get(0)?,
        original_path: row.get(1)?,
        name: row.get(2)?,
        is_dir: row.get(3)?,
        size: row.get::<_, i64>(4)?.max(0) as u64,
        deleted_at_ms: row.get(5)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const LIB: &str = "/home/test/Documents/ZYNORA";

    fn trash(id: &str, path: &str) -> TrashRecord {
        TrashRecord {
            id: id.into(),
            original_path: path.into(),
            name: path.rsplit('/').next().unwrap_or(path).into(),
            is_dir: false,
            size: 10,
            deleted_at_ms: 1,
        }
    }

    #[test]
    fn points_de_recuperation_par_document() {
        let mut db = Database::open_in_memory().expect("base");
        db.set_recovery(LIB, "a.xlsx", "r1.xlsx").expect("ajout");
        db.set_recovery(LIB, "a.xlsx", "r2.xlsx").expect("mise à jour");
        db.set_recovery("/autre", "b.xlsx", "r3.xlsx").expect("autre bibliothèque");
        let list = db.recoveries(LIB).expect("liste");
        assert_eq!(list.len(), 1);
        assert_eq!((list[0].path.as_str(), list[0].file.as_str()), ("a.xlsx", "r2.xlsx"));
        assert_eq!(db.take_recovery(LIB, "a.xlsx").expect("retrait").as_deref(), Some("r2.xlsx"));
        assert_eq!(db.take_recovery(LIB, "a.xlsx").expect("retrait"), None);
        assert!(db.recoveries(LIB).expect("liste").is_empty());
    }

    #[test]
    fn memorise_la_bibliotheque_et_journalise_le_choix() {
        let mut db = Database::open_in_memory().expect("base");
        assert_eq!(db.library_path().expect("lecture"), None);
        db.set_library_path(LIB).expect("écriture");
        assert_eq!(db.library_path().expect("lecture").as_deref(), Some(LIB));
        assert_eq!(db.recent_events(1).expect("journal")[0].action, "library.select");
    }

    #[test]
    fn recents_et_favoris_par_bibliotheque() {
        let mut db = Database::open_in_memory().expect("base");
        db.touch_document(LIB, "a.docx", "a.docx", "text").expect("a");
        std::thread::sleep(std::time::Duration::from_millis(3));
        db.touch_document(LIB, "b.xlsx", "b.xlsx", "spreadsheet").expect("b");
        db.touch_document("/autre", "c.docx", "c.docx", "text").expect("c");
        db.set_favorite(LIB, "Zeta.pdf", "Zeta.pdf", "pdf", true).expect("favori sans usage");
        db.set_favorite(LIB, "a.docx", "a.docx", "text", true).expect("favori");

        let recents = db.recent_documents(LIB, 10).expect("récents");
        assert_eq!(recents.iter().map(|d| d.path.as_str()).collect::<Vec<_>>(), ["b.xlsx", "a.docx"]);
        assert!(recents[1].favorite);
        let favorites = db.favorite_documents(LIB).expect("favoris");
        assert_eq!(favorites.iter().map(|d| d.path.as_str()).collect::<Vec<_>>(), ["a.docx", "Zeta.pdf"]);

        db.set_favorite(LIB, "a.docx", "a.docx", "text", false).expect("retrait");
        assert_eq!(db.favorite_documents(LIB).expect("favoris").len(), 1);
        assert_eq!(db.recent_documents(LIB, 10).expect("récents").len(), 2, "le retrait du favori garde le récent");
        assert_eq!(db.recent_documents(LIB, 1).expect("limite").len(), 1);
    }

    #[test]
    fn suit_le_renommage_d_un_dossier_sans_toucher_aux_noms_voisins() {
        let mut db = Database::open_in_memory().expect("base");
        for path in ["Clients/devis.xlsx", "Clients/2026/x.docx", "Clients 2/y.docx", "Clients%/z.docx"] {
            db.touch_document(LIB, path, path.rsplit('/').next().unwrap_or(path), "text").expect("doc");
        }
        db.rename_documents(LIB, "Clients", "Archives", "Archives").expect("renommage");
        let mut paths: Vec<_> = db.recent_documents(LIB, 10).expect("récents").into_iter().map(|d| d.path).collect();
        paths.sort();
        assert_eq!(paths, ["Archives/2026/x.docx", "Archives/devis.xlsx", "Clients 2/y.docx", "Clients%/z.docx"]);

        db.rename_documents(LIB, "Archives/devis.xlsx", "Archives/Devis final.xlsx", "Devis final.xlsx").expect("doc");
        let renamed = db.recent_documents(LIB, 10).expect("récents");
        assert!(renamed.iter().any(|d| d.path == "Archives/Devis final.xlsx" && d.name == "Devis final.xlsx"));
    }

    #[test]
    fn corbeille_enregistree_puis_retiree() {
        let mut db = Database::open_in_memory().expect("base");
        db.touch_document(LIB, "Clients/devis.xlsx", "devis.xlsx", "spreadsheet").expect("doc");
        db.touch_document(LIB, "Clients 2/autre.xlsx", "autre.xlsx", "spreadsheet").expect("doc");
        db.record_trashed(LIB, &trash("1-a", "Clients")).expect("corbeille");
        db.record_trashed(LIB, &TrashRecord { deleted_at_ms: 2, ..trash("2-b", "note.txt") }).expect("corbeille");

        let remaining = db.recent_documents(LIB, 10).expect("récents");
        assert_eq!(remaining.len(), 1, "le contenu du dossier mis à la corbeille est oublié, pas le voisin");
        assert_eq!(
            db.trash_items(LIB).expect("liste").iter().map(|t| t.id.as_str()).collect::<Vec<_>>(),
            ["2-b", "1-a"]
        );
        assert!(db.trash_items("/autre").expect("liste").is_empty());
        assert_eq!(db.trash_item(LIB, "1-a").expect("lecture").map(|t| t.original_path), Some("Clients".into()));
        assert_eq!(db.trash_item("/autre", "1-a").expect("lecture"), None, "isolé par bibliothèque");

        db.remove_trash_item(LIB, "1-a", "trash.restore").expect("retrait");
        assert_eq!(db.trash_items(LIB).expect("liste").len(), 1);
        let event = &db.recent_events(1).expect("journal")[0];
        assert_eq!((event.action.as_str(), event.detail.as_str()), ("trash.restore", "Clients"));
    }
}
