use super::*;

#[test]
fn cree_le_schema_et_donne_des_parametres_par_defaut() {
    let db = Database::open_in_memory().expect("base");
    assert_eq!(db.schema_version().expect("version"), LATEST_VERSION);
    assert_eq!(LATEST_VERSION, 3);
    assert_eq!(db.settings().expect("paramètres"), Settings { theme: Theme::System, language: Language::Fr });
}

#[test]
fn enregistre_les_parametres_et_les_journalise() {
    let mut db = Database::open_in_memory().expect("base");
    let s = db.apply_setting(SettingChange::Theme(Theme::Dark)).expect("thème");
    assert_eq!(s.theme, Theme::Dark);
    let s = db.apply_setting(SettingChange::Language(Language::En)).expect("langue");
    assert_eq!(s, Settings { theme: Theme::Dark, language: Language::En });

    let events = db.recent_events(10).expect("journal");
    let details: Vec<_> = events.iter().map(|e| (e.action.as_str(), e.detail.as_str())).collect();
    assert_eq!(details, [("settings.update", "language=en"), ("settings.update", "theme=dark")]);
    assert!(events[0].at_ms > 0);
}

#[test]
fn les_parametres_survivent_a_la_reouverture() {
    let dir = tempfile::tempdir().expect("dossier");
    let path = dir.path().join("zynora.db");
    {
        let mut db = Database::open(&path).expect("base");
        db.apply_setting(SettingChange::Theme(Theme::Light)).expect("thème");
    }
    let db = Database::open(&path).expect("réouverture");
    assert_eq!(db.schema_version().expect("version"), LATEST_VERSION);
    assert_eq!(LATEST_VERSION, 3);
    assert_eq!(db.settings().expect("paramètres").theme, Theme::Light);
}

#[test]
fn refuse_une_base_creee_par_une_version_plus_recente() {
    let dir = tempfile::tempdir().expect("dossier");
    let path = dir.path().join("zynora.db");
    {
        let conn = Connection::open(&path).expect("sqlite");
        conn.pragma_update(None, "user_version", LATEST_VERSION + 1).expect("version");
    }
    match Database::open(&path) {
        Err(DatabaseError::NewerSchema { found, supported }) => {
            assert_eq!((found, supported), (LATEST_VERSION + 1, LATEST_VERSION));
        }
        other => panic!("base plus récente ouverte à tort : {:?}", other.err()),
    }
}

#[test]
fn signale_une_valeur_corrompue_au_lieu_de_l_ignorer() {
    let db = Database::open_in_memory().expect("base");
    db.conn
        .execute("INSERT INTO settings (key, value, updated_at_ms) VALUES ('theme', '\"violet\"', 0)", [])
        .expect("insertion");
    assert!(matches!(db.settings(), Err(DatabaseError::CorruptedValue(k)) if k == "theme"));
}

#[test]
fn le_journal_est_borne() {
    let mut db = Database::open_in_memory().expect("base");
    for i in 0..(AUDIT_LOG_CAPACITY + 5) {
        db.record_event("test", &i.to_string()).expect("événement");
    }
    let count: i64 = db.conn.query_row("SELECT COUNT(*) FROM audit_log", [], |r| r.get(0)).expect("compte");
    assert_eq!(count, AUDIT_LOG_CAPACITY);
    assert_eq!(db.recent_events(1).expect("journal")[0].detail, (AUDIT_LOG_CAPACITY + 4).to_string());
}

#[test]
fn les_modifications_venant_de_l_interface_sont_typees() {
    let change: SettingChange = serde_json::from_str(r#"{"key":"theme","value":"dark"}"#).expect("json");
    assert_eq!(change, SettingChange::Theme(Theme::Dark));
    assert!(serde_json::from_str::<SettingChange>(r#"{"key":"theme","value":"violet"}"#).is_err());
    assert!(serde_json::from_str::<SettingChange>(r#"{"key":"admin","value":true}"#).is_err());
}

#[test]
fn une_base_v1_existante_passe_en_v2_sans_perte() {
    let dir = tempfile::tempdir().expect("dossier");
    let path = dir.path().join("zynora.db");
    {
        // Base telle que créée par la version 0.1.0 (schéma 1 uniquement).
        let mut conn = Connection::open(&path).expect("sqlite");
        let tx = conn.transaction().expect("transaction");
        tx.execute_batch(migrations::MIGRATIONS[0]).expect("schéma v1");
        tx.execute("INSERT INTO settings VALUES ('theme', '\"dark\"', 1)", []).expect("paramètre");
        tx.pragma_update(None, "user_version", 1).expect("version");
        tx.commit().expect("commit");
    }
    let mut db = Database::open(&path).expect("migration");
    assert_eq!(db.schema_version().expect("version"), LATEST_VERSION);
    assert_eq!(db.settings().expect("paramètres").theme, Theme::Dark);
    db.touch_document("/lib", "a.docx", "a.docx", "text").expect("nouvelle table utilisable");
}
