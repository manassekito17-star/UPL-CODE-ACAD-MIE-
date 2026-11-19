use super::*;

fn fr() -> Workbook {
    Workbook::new("Classeur", FormulaLanguage::Fr).expect("classeur")
}

fn set(wb: &mut Workbook, sheet: u32, cell: &str, input: &str) {
    let (row, column) = parse_ref(cell);
    wb.set_input(sheet, row, column, input).expect("saisie");
}

fn show(wb: &Workbook, sheet: u32, cell: &str) -> String {
    let (row, column) = parse_ref(cell);
    wb.display(sheet, row, column).expect("valeur")
}

fn parse_ref(cell: &str) -> (i32, i32) {
    let split = cell.find(|c: char| c.is_ascii_digit()).expect("référence");
    let column = cell[..split].bytes().fold(0, |acc, b| acc * 26 + i32::from(b - b'A' + 1));
    (cell[split..].parse().expect("ligne"), column)
}

/// Valeurs de référence calculées à la main : le moteur doit les retrouver exactement.
#[test]
fn calcule_les_fonctions_usuelles_en_francais() {
    let mut wb = fr();
    wb.add_sheet().expect("feuille 2");
    set(&mut wb, 1, "A1", "7");
    for (cell, input) in [("A1", "10"), ("A2", "20"), ("A3", "30,5"), ("A4", "texte")] {
        set(&mut wb, 0, cell, input);
    }
    let cases = [
        ("=SOMME(A1:A3)", "60,5"),
        ("=MOYENNE(A1:A2)", "15"),
        ("=MIN(A1:A3)", "10"),
        ("=MAX(A1:A3)", "30,5"),
        ("=NB(A1:A4)", "3"),
        ("=NBVAL(A1:A4)", "4"),
        ("=SI(A1>5;\"grand\";\"petit\")", "grand"),
        ("=ET(A1>0;A2>0)", "VRAI"),
        ("=OU(A1<0;A2<0)", "FAUX"),
        ("=SOMME.SI(A1:A3;\">15\")", "50,5"),
        ("=NB.SI(A1:A3;\">15\")", "2"),
        ("=RECHERCHEV(20;A1:A3;1;FAUX)", "20"),
        ("=$A$1+A2", "30"),
        ("=Feuil2!A1*2", "14"),
        ("=ARRONDI(2/3;2)", "0,67"),
        ("=CONCATENER(\"a\";\"b\")", "ab"),
    ];
    for (i, (formula, expected)) in cases.iter().enumerate() {
        let cell = format!("C{}", i + 1);
        set(&mut wb, 0, &cell, formula);
        assert_eq!(show(&wb, 0, &cell), *expected, "{formula}");
        assert_eq!(wb.content(0, i as i32 + 1, 3).expect("contenu"), *formula, "la formule est conservée");
    }
}

#[test]
fn signale_les_erreurs_de_calcul_et_recalcule_les_dependances() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "10");
    set(&mut wb, 0, "B1", "=A1/0");
    set(&mut wb, 0, "B2", "=INCONNUE(1)");
    set(&mut wb, 0, "B3", "=Z99+A1*2");
    set(&mut wb, 0, "B4", "=B3+1");
    set(&mut wb, 0, "B5", "=B5+1");
    assert_eq!(show(&wb, 0, "B1"), "#DIV/0!");
    assert_eq!(show(&wb, 0, "B2"), "#NOM?");
    assert_eq!(show(&wb, 0, "B4"), "21");
    assert!(show(&wb, 0, "B5").starts_with('#'), "référence circulaire signalée : {}", show(&wb, 0, "B5"));
    set(&mut wb, 0, "A1", "100");
    assert_eq!(show(&wb, 0, "B4"), "201", "recalcul en chaîne");
}

#[test]
fn trois_cycles_xlsx_sans_perte() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "10");
    set(&mut wb, 0, "A2", "=A1*3");
    wb.apply_style(CellRange::cell(0, 1, 1), &StyleChange::Bold(true)).expect("gras");
    wb.apply_style(CellRange::cell(0, 2, 1), &StyleChange::Fill("#ffcc00".into())).expect("fond");
    wb.add_sheet().expect("feuille");
    wb.rename_sheet(1, "Budget 2026").expect("renommage");
    set(&mut wb, 1, "B2", "='Feuil1'!A2+1");

    let mut bytes = wb.to_xlsx().expect("export");
    for cycle in 1..=3 {
        let mut reopened = Workbook::from_xlsx(&bytes, "Classeur", FormulaLanguage::Fr).expect("réouverture");
        assert_eq!(show(&reopened, 0, "A2"), "30");
        assert_eq!(reopened.content(0, 2, 1).expect("formule"), "=A1*3");
        assert_eq!(show(&reopened, 1, "B2"), "31");
        assert_eq!(reopened.sheets().iter().map(|s| s.name.as_str()).collect::<Vec<_>>(), ["Feuil1", "Budget 2026"]);
        let styles = reopened.range(CellRange { sheet: 0, top: 1, left: 1, bottom: 2, right: 1 }).expect("plage");
        assert!(styles.cells[0].style.bold);
        assert_eq!(styles.cells[1].style.fill.as_deref(), Some("#ffcc00"));
        set(&mut reopened, 0, "D1", &format!("cycle {cycle}"));
        bytes = reopened.to_xlsx().expect("réenregistrement");
    }
    let last = Workbook::from_xlsx(&bytes, "Classeur", FormulaLanguage::Fr).expect("final");
    assert_eq!(show(&last, 0, "D1"), "cycle 3");
}

#[test]
fn refuse_un_xlsx_corrompu() {
    assert!(matches!(
        Workbook::from_xlsx(b"PK\x03\x04pas un classeur", "x", FormulaLanguage::Fr),
        Err(SheetError::Read(_))
    ));
}

#[test]
fn importe_et_exporte_le_csv_sans_executer_de_formule() {
    let csv = "Produit;Prix;Note\r\nCafé;2,5;\"=HYPERLINK(\"\"http://x\"\")\"\r\nThé;3;ok\r\n";
    let mut wb = Workbook::from_csv(csv, "achats", FormulaLanguage::Fr).expect("import");
    assert_eq!(show(&wb, 0, "A2"), "Café");
    set(&mut wb, 0, "B4", "=SOMME(B2:B3)");
    assert_eq!(show(&wb, 0, "B4"), "5,5", "les nombres décimaux français sont reconnus");
    assert_eq!(show(&wb, 0, "C2"), "=HYPERLINK(\"http://x\")", "importé comme texte");
    let out = wb.to_csv(0).expect("export");
    assert_eq!(out.lines().next(), Some("Produit;Prix;Note"));
    assert!(out.contains("Café;2,5;\"'=HYPERLINK(\"\"http://x\"\")\""), "{out}");
    assert!(out.contains(";5,5;"), "{out}");
}

#[test]
fn styles_annuler_retablir() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "12");
    set(&mut wb, 0, "B1", "texte");
    let a1 = CellRange::cell(0, 1, 1);
    wb.apply_style(a1, &StyleChange::Italic(true)).expect("italique");
    wb.apply_style(a1, &StyleChange::FontColor("#c00000".into())).expect("couleur");
    let view = wb.range(CellRange { sheet: 0, top: 1, left: 1, bottom: 1, right: 2 }).expect("plage");
    assert!(view.cells[0].style.italic);
    assert_eq!(view.cells[0].style.color.as_deref(), Some("#c00000"));
    assert_eq!(view.cells[0].style.align, Align::Right, "nombre aligné à droite par défaut");
    assert!(!view.cells[0].style.align_set, "alignement par défaut, non choisi");
    assert_eq!(view.cells[1].style.align, Align::General);
    assert!(view.cells[0].numeric && !view.cells[1].numeric);

    wb.apply_style(a1, &StyleChange::Align(Align::Center)).expect("centré");
    assert_eq!(wb.range(a1).expect("plage").cells[0].style.align, Align::Center);
    assert!(wb.range(a1).expect("plage").cells[0].style.align_set);
    assert!(wb.can_undo());
    wb.undo().expect("annuler");
    wb.undo().expect("annuler");
    wb.undo().expect("annuler");
    assert!(!wb.range(a1).expect("plage").cells[0].style.italic);
    wb.redo().expect("rétablir");
    assert!(wb.range(a1).expect("plage").cells[0].style.italic);

    wb.apply_style(a1, &StyleChange::NumberFormat("0%".into())).expect("pourcentage");
    assert_eq!(show(&wb, 0, "A1"), "1200%");
    wb.apply_style(a1, &StyleChange::NumberFormat("0.00".into())).expect("format");
    assert_eq!(show(&wb, 0, "A1"), "12,00", "format canonique, affichage selon la langue");
    assert!(wb.apply_style(a1, &StyleChange::FontColor("rouge".into())).is_err(), "couleur invalide refusée");
}

#[test]
fn gere_les_feuilles() {
    let mut wb = fr();
    assert_eq!(wb.add_sheet().expect("ajout"), 1);
    wb.rename_sheet(1, "Ventes").expect("renommage");
    assert!(wb.rename_sheet(0, "Ventes").is_err(), "nom en double refusé");
    wb.delete_sheet(0).expect("suppression");
    assert_eq!(wb.sheets().iter().map(|s| s.name.as_str()).collect::<Vec<_>>(), ["Ventes"]);
    assert!(wb.delete_sheet(0).is_err(), "la dernière feuille est conservée");
}

#[test]
fn statistiques_de_selection() {
    let mut wb = fr();
    for (cell, v) in [("A1", "4"), ("A2", "6"), ("A3", "abc"), ("B1", "=A1*10")] {
        set(&mut wb, 0, cell, v);
    }
    let stats = wb.stats(CellRange { sheet: 0, top: 1, left: 1, bottom: 3, right: 2 }).expect("stats");
    assert_eq!((stats.count, stats.numeric_count), (4, 3));
    assert_eq!(stats.sum, 50.0);
    assert_eq!(stats.min, Some(4.0));
    assert_eq!(stats.max, Some(40.0));
    assert!((stats.average.expect("moyenne") - 50.0 / 3.0).abs() < 1e-9);
    let empty = wb.stats(CellRange::cell(0, 10, 10)).expect("vide");
    assert_eq!((empty.count, empty.average), (0, None));
}

#[test]
fn copier_coller_ajuste_les_references_relatives() {
    let mut wb = fr();
    for (cell, v) in [("A1", "1"), ("A2", "2"), ("B1", "=A1*10"), ("C1", "=$A$1+A1")] {
        set(&mut wb, 0, cell, v);
    }
    let copied = wb.copy(CellRange { sheet: 0, top: 1, left: 2, bottom: 1, right: 3 }).expect("copie");
    assert!(copied.text.contains("10"));
    wb.paste(CellRange::cell(0, 2, 2), &copied, false).expect("collage");
    assert_eq!(wb.content(0, 2, 2).expect("B2"), "=A2*10");
    assert_eq!(show(&wb, 0, "B2"), "20");
    assert_eq!(wb.content(0, 2, 3).expect("C2"), "=$A$1+A2");

    wb.paste_text(CellRange::cell(0, 5, 1), "x\ty\n3\t4").expect("collage texte");
    assert_eq!(show(&wb, 0, "B6"), "4");
}

#[test]
fn la_vue_de_plage_est_bornee_et_compacte() {
    let mut wb = fr();
    set(&mut wb, 0, "B2", "x");
    set(&mut wb, 0, "Z100", "loin");
    let view = wb.range(CellRange { sheet: 0, top: 1, left: 1, bottom: 30, right: 10 }).expect("plage");
    assert_eq!(view.cells.len(), 1, "seules les cellules non vides de la plage");
    assert_eq!((view.cells[0].row, view.cells[0].column), (2, 2));
    assert_eq!(view.column_widths.len(), 10);
    assert_eq!(view.row_heights.len(), 30);
    assert!(view.column_widths.iter().all(|w| *w > 0.0));
    assert_eq!(
        wb.range(CellRange { sheet: 0, top: 1, left: 1, bottom: 1000, right: 100 }),
        Err(SheetError::InvalidRange)
    );
    assert_eq!(wb.range(CellRange { sheet: 0, top: 0, left: 1, bottom: 1, right: 1 }), Err(SheetError::InvalidRange));
    assert_eq!(wb.set_input(0, MAX_ROWS + 1, 1, "x"), Err(SheetError::InvalidRange));
    assert_eq!(wb.used_size(0).expect("taille"), (100, 26));
}

#[test]
fn lignes_colonnes_et_fusion() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "1");
    set(&mut wb, 0, "A2", "2");
    set(&mut wb, 0, "B1", "=SOMME(A1:A2)");
    wb.insert_rows(0, 1, 1).expect("insertion");
    assert_eq!(wb.content(0, 2, 2).expect("formule décalée"), "=SOMME(A2:A3)");
    wb.delete_rows(0, 1, 1).expect("suppression");
    assert_eq!(show(&wb, 0, "B1"), "3");
    wb.insert_columns(0, 1, 1).expect("colonne");
    assert_eq!(show(&wb, 0, "C1"), "3");
    wb.delete_columns(0, 1, 1).expect("colonne");
    wb.merge(CellRange { sheet: 0, top: 5, left: 1, bottom: 5, right: 3 }).expect("fusion");
    wb.unmerge(CellRange { sheet: 0, top: 5, left: 1, bottom: 5, right: 3 }).expect("défusion");
    wb.set_column_width(0, 1, 150.0).expect("largeur");
    assert_eq!(wb.range(CellRange::cell(0, 1, 1)).expect("plage").column_widths[0], 150.0);
}

#[test]
fn grande_feuille_dans_un_temps_raisonnable() {
    let mut wb = fr();
    let start = std::time::Instant::now();
    for r in 1..=20_000 {
        wb.set_input(0, r, 1, &r.to_string()).expect("saisie");
    }
    set(&mut wb, 0, "B1", "=SOMME(A1:A20000)");
    assert_eq!(show(&wb, 0, "B1"), "200010000");
    set(&mut wb, 0, "A1", "1001");
    assert_eq!(show(&wb, 0, "B1"), "200011000");
    // Garde-fou large (machine de CI lente, mode debug) : il s'agit de détecter une régression d'ordre de grandeur.
    assert!(start.elapsed().as_secs() < 60, "{:?}", start.elapsed());
}

/// Vérification croisée avec LibreOffice (outil tiers) : `cargo test -- --ignored` sur une
/// machine où `soffice` est installé.
#[test]
#[ignore = "nécessite LibreOffice (soffice)"]
fn libreoffice_relit_nos_classeurs() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "10");
    set(&mut wb, 0, "A2", "32,5");
    set(&mut wb, 0, "A3", "=SOMME(A1:A2)");
    set(&mut wb, 0, "A4", "=SI(A3>40;\"oui\";\"non\")");
    let dir = std::env::temp_dir().join(format!("zynora-lo-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("dossier");
    let xlsx = dir.join("classeur.xlsx");
    std::fs::write(&xlsx, wb.to_xlsx().expect("export")).expect("écriture");
    let status = std::process::Command::new("soffice")
        // Profil LibreOffice propre à chaque test : deux instances ne peuvent pas partager le même.
        .arg(format!("-env:UserInstallation=file://{}", dir.join("profil").display()))
        .args(["--headless", "--convert-to", "csv", "--outdir"])
        .arg(&dir)
        .arg(&xlsx)
        .status()
        .expect("soffice");
    assert!(status.success());
    let csv = std::fs::read_to_string(dir.join("classeur.csv")).expect("csv");
    let values: Vec<_> = csv.lines().map(|l| l.trim_matches('"').to_owned()).collect();
    assert_eq!(values, ["10", "32.5", "42.5", "oui"], "valeurs recalculées par LibreOffice");
    let _ = std::fs::remove_dir_all(dir);
}

/// Ouverture d'un XLSX produit par un outil tiers (LibreOffice) : `cargo test -- --ignored`.
#[test]
#[ignore = "nécessite LibreOffice (soffice)"]
fn ouvre_un_xlsx_produit_par_libreoffice() {
    let dir = std::env::temp_dir().join(format!("zynora-lo-in-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("dossier");
    let fods = dir.join("tiers.fods");
    std::fs::write(
        &fods,
        r#"<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.spreadsheet">
<office:body><office:spreadsheet><table:table table:name="Ventes">
<table:table-row><table:table-cell office:value-type="float" office:value="4"/><table:table-cell office:value-type="string"><text:p>pommes</text:p></table:table-cell></table:table-row>
<table:table-row><table:table-cell office:value-type="float" office:value="6"/></table:table-row>
<table:table-row><table:table-cell table:formula="of:=SUM([.A1:.A2])" office:value-type="float" office:value="10"/></table:table-row>
</table:table></office:spreadsheet></office:body></office:document>"#,
    )
    .expect("écriture");
    let status = std::process::Command::new("soffice")
        // Profil LibreOffice propre à chaque test : deux instances ne peuvent pas partager le même.
        .arg(format!("-env:UserInstallation=file://{}", dir.join("profil").display()))
        .args(["--headless", "--convert-to", "xlsx", "--outdir"])
        .arg(&dir)
        .arg(&fods)
        .status()
        .expect("soffice");
    assert!(status.success());
    let bytes = std::fs::read(dir.join("tiers.xlsx")).expect("xlsx");
    let mut wb = Workbook::from_xlsx(&bytes, "tiers", FormulaLanguage::Fr).expect("ouverture");
    assert_eq!(wb.sheets()[0].name, "Ventes");
    assert_eq!(show(&wb, 0, "A3"), "10");
    assert_eq!(wb.content(0, 3, 1).expect("formule"), "=SOMME(A1:A2)", "formule traduite en français");
    set(&mut wb, 0, "A1", "40");
    assert_eq!(show(&wb, 0, "A3"), "46");
    let _ = std::fs::remove_dir_all(dir);
}
