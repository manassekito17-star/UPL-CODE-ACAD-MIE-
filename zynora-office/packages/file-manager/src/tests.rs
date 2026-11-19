use std::io::Cursor;

use zip::write::{SimpleFileOptions, ZipWriter};

use super::*;

struct Fixture {
    _dir: tempfile::TempDir,
    _outside: tempfile::TempDir,
    lib: Library,
    outside: PathBuf,
}

fn fixture() -> Fixture {
    let dir = tempfile::tempdir().expect("bibliothèque");
    let outside = tempfile::tempdir().expect("dossier source");
    let lib = Library::open(&dir.path().join("ZYNORA")).expect("ouverture");
    let outside_path = outside.path().to_path_buf();
    Fixture { _dir: dir, _outside: outside, lib, outside: outside_path }
}

fn zip_bytes(entries: &[(&str, &[u8])]) -> Vec<u8> {
    let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
    for (name, data) in entries {
        writer.start_file(*name, SimpleFileOptions::default()).expect("entrée");
        std::io::Write::write_all(&mut writer, data).expect("écriture");
    }
    writer.finish().expect("archive").into_inner()
}

fn docx() -> Vec<u8> {
    zip_bytes(&[("[Content_Types].xml", b"<Types/>"), ("word/document.xml", b"<w:document/>")])
}

fn put(dir: &Path, name: &str, bytes: &[u8]) -> PathBuf {
    let path = dir.join(name);
    fs::write(&path, bytes).expect("écriture du fichier de test");
    path
}

fn names(entries: &[Entry]) -> Vec<&str> {
    entries.iter().map(|e| e.name.as_str()).collect()
}

fn no_temp_files(dir: &Path) -> bool {
    fs::read_dir(dir).expect("lecture").flatten().all(|e| !e.file_name().to_string_lossy().ends_with(".zynora-tmp"))
}

#[test]
fn liste_les_dossiers_puis_les_documents_pris_en_charge() {
    let f = fixture();
    let root = f.lib.root().to_path_buf();
    put(&root, "zèbre.xlsx", b"PK\x03\x04");
    put(&root, "Été.docx", b"PK\x03\x04");
    put(&root, "notes.txt", b"bonjour");
    put(&root, "programme.exe", b"MZ");
    put(&root, "macro.docm", b"PK\x03\x04");
    put(&root, ".cache", b"x");
    fs::create_dir(root.join("Archives")).expect("mkdir");
    fs::create_dir_all(root.join(INTERNAL_DIR).join("corbeille")).expect("mkdir");

    let entries = f.lib.list("").expect("liste");
    assert_eq!(names(&entries), ["Archives", "Été.docx", "notes.txt", "zèbre.xlsx"]);
    assert_eq!(entries[0].kind, EntryKind::Folder);
    assert_eq!(entries[1].kind, EntryKind::Text);
    assert_eq!(entries[2].size, 7);
    assert!(entries[2].modified_ms > 0);
    assert_eq!(entries[3].path, "zèbre.xlsx");
}

#[test]
fn refuse_les_chemins_hors_bibliotheque_et_le_dossier_interne() {
    let f = fixture();
    fs::create_dir_all(f.lib.root().join(INTERNAL_DIR).join("corbeille")).expect("mkdir");
    assert!(matches!(f.lib.list(".."), Err(FileError::Security(SecurityError::PathEscapesRoot))));
    assert!(matches!(f.lib.list("/etc"), Err(FileError::Security(SecurityError::PathEscapesRoot))));
    assert!(matches!(f.lib.list(".zynora/corbeille"), Err(FileError::Reserved)));
    assert!(matches!(f.lib.move_to_trash(".zynora"), Err(FileError::Reserved)));
    assert!(matches!(f.lib.list("absent"), Err(FileError::NotFound)));
    assert!(matches!(f.lib.move_to_trash(""), Err(FileError::Reserved)));
}

#[test]
fn cree_des_dossiers_sans_ecraser() {
    let f = fixture();
    let created = f.lib.create_folder("", "Projets 2026").expect("dossier");
    assert_eq!((created.path.as_str(), created.kind), ("Projets 2026", EntryKind::Folder));
    let nested = f.lib.create_folder("Projets 2026", "Clients").expect("sous-dossier");
    assert_eq!(nested.path, "Projets 2026/Clients");
    assert!(matches!(f.lib.create_folder("", "Projets 2026"), Err(FileError::AlreadyExists(_))));
    assert!(matches!(f.lib.create_folder("", "a/b"), Err(FileError::Security(_))));
    assert!(matches!(f.lib.create_folder("", ".cache"), Err(FileError::Security(_))));
    assert!(matches!(f.lib.create_folder("", "CON"), Err(FileError::Security(_))));
}

#[test]
fn renomme_sans_ecraser_ni_changer_d_extension() {
    let f = fixture();
    let root = f.lib.root().to_path_buf();
    put(&root, "brouillon.docx", b"1");
    put(&root, "final.docx", b"2");
    fs::create_dir(root.join("dossier")).expect("mkdir");

    let renamed = f.lib.rename("brouillon.docx", "Rapport.docx").expect("renommage");
    assert_eq!(renamed.path, "Rapport.docx");
    assert!(matches!(f.lib.rename("Rapport.docx", "final.docx"), Err(FileError::AlreadyExists(_))));
    assert_eq!(fs::read(root.join("final.docx")).expect("lecture"), b"2", "rien n'a été écrasé");
    assert!(matches!(f.lib.rename("Rapport.docx", "Rapport.pdf"), Err(FileError::ExtensionChange(e)) if e == "docx"));
    assert!(matches!(f.lib.rename("Rapport.docx", "Rapport"), Err(FileError::ExtensionChange(_))));
    assert_eq!(f.lib.rename("Rapport.docx", "Rapport.DOCX").expect("casse de l'extension").name, "Rapport.DOCX");
    assert_eq!(f.lib.rename("dossier", "Dossier clients").expect("dossier").kind, EntryKind::Folder);
    assert!(matches!(f.lib.rename("", "x"), Err(FileError::Reserved)));
}

#[test]
fn importe_un_document_valide_sous_un_nom_libre() {
    let f = fixture();
    let source = put(&f.outside, "Contrat.docx", &docx());
    let first = f.lib.import(&source, "").expect("import");
    assert_eq!((first.name.as_str(), first.kind), ("Contrat.docx", EntryKind::Text));
    let second = f.lib.import(&source, "").expect("second import");
    assert_eq!(second.name, "Contrat (2).docx");
    assert_eq!(fs::read(f.lib.root().join("Contrat (2).docx")).expect("lecture"), docx());
    assert!(no_temp_files(f.lib.root()));

    let csv = put(&f.outside, "budget.csv", "poste;montant\nloyer;800\n".as_bytes());
    assert_eq!(f.lib.import(&csv, "").expect("csv").kind, EntryKind::Spreadsheet);
    let ods = put(
        &f.outside,
        "calc.ods",
        &zip_bytes(&[("mimetype", b"application/vnd.oasis.opendocument.spreadsheet"), ("content.xml", b"<c/>")]),
    );
    assert!(f.lib.import(&ods, "").is_ok());
}

#[test]
fn refuse_les_documents_dangereux_ou_incoherents_sans_laisser_de_trace() {
    let f = fixture();
    type Expected = fn(&FileError) -> bool;
    let cases: Vec<(PathBuf, Expected)> = vec![
        (put(&f.outside, "faux.docx", b"%PDF-1.7 pas un docx"), |e| matches!(e, FileError::Security(_))),
        (
            put(
                &f.outside,
                "macro.xlsx",
                &zip_bytes(&[("[Content_Types].xml", b"<T/>"), ("xl/vbaProject.bin", b"\x00")]),
            ),
            |e| matches!(e, FileError::MacrosRefused),
        ),
        (
            put(
                &f.outside,
                "ods-deguise.docx",
                &zip_bytes(&[("mimetype", b"application/vnd.oasis.opendocument.text")]),
            ),
            |e| matches!(e, FileError::WrongPackage(_)),
        ),
        (
            put(
                &f.outside,
                "mauvais-type.odt",
                &zip_bytes(&[("mimetype", b"application/vnd.oasis.opendocument.spreadsheet")]),
            ),
            |e| matches!(e, FileError::WrongPackage(_)),
        ),
        (
            put(
                &f.outside,
                "xxe.docx",
                &zip_bytes(&[("[Content_Types].xml", b"<!DOCTYPE x [<!ENTITY e SYSTEM \"file:///etc/passwd\">]><T/>")]),
            ),
            |e| matches!(e, FileError::Security(SecurityError::UnsafeArchive(_))),
        ),
        (put(&f.outside, "outil.exe", b"MZ"), |e| matches!(e, FileError::Unsupported)),
        (put(&f.outside, "binaire.csv", b"\x00\x01\x02"), |e| matches!(e, FileError::Security(_))),
    ];
    for (source, expected) in cases {
        let error = f.lib.import(&source, "").expect_err(&format!("{source:?} importé à tort"));
        assert!(expected(&error), "{source:?} : erreur inattendue {error:?}");
    }
    assert!(f.lib.list("").expect("liste").is_empty());
    assert!(no_temp_files(f.lib.root()), "aucun fichier temporaire ne doit rester");
    assert!(matches!(f.lib.import(&f.outside, ""), Err(FileError::Security(_) | FileError::Unsupported)));
}

#[test]
fn la_corbeille_conserve_et_restaure_sans_ecraser() {
    let f = fixture();
    let root = f.lib.root().to_path_buf();
    fs::create_dir(root.join("Clients")).expect("mkdir");
    put(&root.join("Clients"), "devis.xlsx", b"PK\x03\x04 v1");

    let trashed = f.lib.move_to_trash("Clients/devis.xlsx").expect("corbeille");
    assert_eq!((trashed.original_path.as_str(), trashed.is_dir, trashed.size), ("Clients/devis.xlsx", false, 7));
    assert!(f.lib.list("Clients").expect("liste").is_empty());
    assert!(f.lib.search("devis", 10).expect("recherche").is_empty(), "la corbeille n'est pas cherchée");

    // Un nouveau fichier a pris la place : la restauration ne l'écrase pas.
    put(&root.join("Clients"), "devis.xlsx", b"PK\x03\x04 v2");
    let restored = f.lib.restore(&trashed.id, &trashed.original_path).expect("restauration");
    assert_eq!(restored.path, "Clients/devis (2).xlsx");
    assert_eq!(fs::read(root.join("Clients/devis.xlsx")).expect("lecture"), b"PK\x03\x04 v2");
    assert_eq!(fs::read(root.join("Clients/devis (2).xlsx")).expect("lecture"), b"PK\x03\x04 v1");
    assert!(matches!(f.lib.restore(&trashed.id, &trashed.original_path), Err(FileError::NotFound)));
}

#[test]
fn restaure_un_dossier_dont_le_parent_a_disparu() {
    let f = fixture();
    let root = f.lib.root().to_path_buf();
    fs::create_dir_all(root.join("A/B")).expect("mkdir");
    put(&root.join("A/B"), "note.txt", b"x");
    let trashed = f.lib.move_to_trash("A/B").expect("corbeille");
    assert!(trashed.is_dir);
    let a = f.lib.move_to_trash("A").expect("corbeille du parent");
    f.lib.purge(&a.id).expect("suppression définitive");

    let restored = f.lib.restore(&trashed.id, &trashed.original_path).expect("restauration");
    assert_eq!(restored.path, "A/B");
    assert_eq!(fs::read(root.join("A/B/note.txt")).expect("lecture"), b"x");
}

#[test]
fn la_suppression_definitive_ne_vise_que_la_corbeille() {
    let f = fixture();
    put(f.lib.root(), "a.txt", b"x");
    let trashed = f.lib.move_to_trash("a.txt").expect("corbeille");
    for bad in ["../..", "", "x/../../y", "a b"] {
        assert!(f.lib.purge(bad).is_err(), "{bad:?}");
        assert!(f.lib.restore(bad, "a.txt").is_err(), "{bad:?}");
    }
    assert!(f.lib.restore(&trashed.id, "../a.txt").is_err());
    assert!(f.lib.restore(&trashed.id, "/tmp/a.txt").is_err());
    assert!(f.lib.restore(&trashed.id, ".zynora/a.txt").is_err());
    f.lib.purge(&trashed.id).expect("purge");
    f.lib.purge(&trashed.id).expect("purge idempotente");
    assert!(!f.lib.root().join(INTERNAL_DIR).join(TRASH_DIR).join(&trashed.id).exists());
}

#[test]
fn recherche_sans_tenir_compte_des_accents_ni_de_la_casse() {
    let f = fixture();
    let root = f.lib.root().to_path_buf();
    fs::create_dir_all(root.join("Équipe/Été 2026")).expect("mkdir");
    put(&root.join("Équipe/Été 2026"), "Planning été.xlsx", b"PK\x03\x04");
    put(&root, "ETE.txt", b"x");
    put(&root, "hiver.txt", b"x");
    put(&root, "été.exe", b"MZ");

    let results = f.lib.search("ete", 50).expect("recherche");
    assert_eq!(names(&results), ["Été 2026", "ETE.txt", "Planning été.xlsx"]);
    assert_eq!(results[2].path, "Équipe/Été 2026/Planning été.xlsx");
    assert_eq!(f.lib.search("ÉTÉ", 1).expect("limite").len(), 1);
    assert!(f.lib.search("   ", 10).expect("vide").is_empty());
}

#[test]
fn l_ecriture_atomique_remplace_sans_laisser_de_fichier_temporaire() {
    let dir = tempfile::tempdir().expect("dossier");
    let path = dir.path().join("classeur.xlsx");
    write_atomic(&path, b"version 1").expect("écriture");
    write_atomic(&path, b"version 2, plus longue").expect("remplacement");
    assert_eq!(fs::read(&path).expect("lecture"), b"version 2, plus longue");
    assert!(no_temp_files(dir.path()));
    assert!(write_atomic(&dir.path().join("absent/x.txt"), b"x").is_err());
}

#[cfg(unix)]
#[test]
fn ne_suit_pas_les_liens_symboliques_de_la_bibliotheque() {
    let f = fixture();
    put(&f.outside, "secret.docx", b"PK\x03\x04");
    std::os::unix::fs::symlink(f.outside.join("secret.docx"), f.lib.root().join("lien.docx")).expect("symlink");
    std::os::unix::fs::symlink(&f.outside, f.lib.root().join("lien-dossier")).expect("symlink");
    assert!(f.lib.list("").expect("liste").is_empty(), "les liens ne sont pas listés");
    assert!(f.lib.list("lien-dossier").is_err());
    assert!(f.lib.search("secret", 10).expect("recherche").is_empty());
}

#[test]
fn lit_revalide_enregistre_et_cree_des_documents() {
    let f = fixture();
    let created = f.lib.create_document("", "Classeur.xlsx", &docx()).expect("création");
    assert_eq!(created.name, "Classeur.xlsx");
    assert_eq!(f.lib.create_document("", "Classeur.xlsx", &docx()).expect("seconde").name, "Classeur (2).xlsx");
    assert!(f.lib.create_document("", "x.exe", b"MZ").is_err());

    let (bytes, ext) = f.lib.read_document("Classeur.xlsx").expect("lecture");
    assert_eq!((bytes, ext.as_str()), (docx(), "xlsx"));
    let saved =
        f.lib.save_document("Classeur.xlsx", &zip_bytes(&[("[Content_Types].xml", b"<v2/>")])).expect("enregistrement");
    assert_eq!(saved.path, "Classeur.xlsx");
    assert!(no_temp_files(f.lib.root()));

    // Un fichier remplacé hors de ZYNORA par un contenu piégé est refusé à l'ouverture.
    put(f.lib.root(), "piege.xlsx", &zip_bytes(&[("[Content_Types].xml", b"<T/>"), ("xl/vbaProject.bin", b"\x00")]));
    assert!(matches!(f.lib.read_document("piege.xlsx"), Err(FileError::MacrosRefused)));
    assert!(matches!(f.lib.read_document("../x.xlsx"), Err(FileError::Security(_))));
    assert!(matches!(f.lib.save_document("absent.xlsx", b"x"), Err(FileError::NotFound)));
}
