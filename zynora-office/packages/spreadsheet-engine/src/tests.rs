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

// --- Onglet Accueil complet, Données, Édition, Formules, Affichage ---------------------------

#[test]
fn police_alignement_vertical_renvoi_et_bordures_sont_conserves_en_xlsx() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "titre");
    let a1 = CellRange::cell(0, 1, 1);
    wb.apply_style(a1, &StyleChange::FontSize(18)).expect("taille");
    wb.apply_style(a1, &StyleChange::FontSizeDelta(2)).expect("agrandir");
    wb.apply_style(a1, &StyleChange::VerticalAlign(VAlign::Top)).expect("haut");
    wb.apply_style(a1, &StyleChange::Wrap(true)).expect("renvoi");
    wb.set_font_name(a1, "Georgia").expect("police");
    wb.set_borders(
        CellRange { sheet: 0, top: 1, left: 1, bottom: 2, right: 2 },
        BorderPreset::Outer,
        BorderLine::Medium,
        "#c00000",
    )
    .expect("bordures");

    let check = |wb: &Workbook| {
        let view = wb.range(CellRange { sheet: 0, top: 1, left: 1, bottom: 2, right: 2 }).expect("plage");
        let a1 = view.cells.iter().find(|c| (c.row, c.column) == (1, 1)).expect("A1");
        assert_eq!(a1.style.font_size, Some(20));
        assert_eq!(a1.style.font_name.as_deref(), Some("Georgia"));
        assert_eq!(a1.style.v_align, VAlign::Top);
        assert!(a1.style.wrap);
        assert_eq!(a1.style.borders.top.as_deref(), Some("2px solid #c00000"));
        assert_eq!(a1.style.borders.left.as_deref(), Some("2px solid #c00000"));
        assert_eq!(a1.style.borders.right, None, "bordure extérieure seulement");
        let b2 = view.cells.iter().find(|c| (c.row, c.column) == (2, 2)).expect("B2");
        assert!(b2.style.borders.bottom.is_some() && b2.style.borders.right.is_some());
    };
    check(&wb);
    let reopened = Workbook::from_xlsx(&wb.to_xlsx().expect("export"), "x", FormulaLanguage::Fr).expect("réouverture");
    check(&reopened);

    wb.set_borders(
        CellRange { sheet: 0, top: 1, left: 1, bottom: 2, right: 2 },
        BorderPreset::None,
        BorderLine::Thin,
        "",
    )
    .expect("aucune");
    assert_eq!(wb.range(a1).expect("plage").cells[0].style.borders, BordersView::default());
    assert!(wb.set_font_name(a1, "").is_err());
}

#[test]
fn decimales_et_separateur_de_milliers() {
    assert_eq!(adjust_decimals("general", 1), "0.0");
    assert_eq!(adjust_decimals("0", 2), "0.00");
    assert_eq!(adjust_decimals("0.00", -1), "0.0");
    assert_eq!(adjust_decimals("0.0", -1), "0");
    assert_eq!(adjust_decimals("#,##0.00 \"€\"", 1), "#,##0.000 \"€\"");
    assert_eq!(adjust_decimals("0.00%", -2), "0%");
    assert_eq!(toggle_thousands("0.00"), "#,##0.00");
    assert_eq!(toggle_thousands("#,##0.00"), "0.00");
    assert_eq!(toggle_thousands("general"), "#,##0");

    let mut wb = fr();
    set(&mut wb, 0, "A1", "1234,5");
    let a1 = CellRange::cell(0, 1, 1);
    let fmt = toggle_thousands(&adjust_decimals(&wb.number_format(0, 1, 1).expect("format"), 2));
    wb.apply_style(a1, &StyleChange::NumberFormat(fmt)).expect("format");
    assert_eq!(show(&wb, 0, "A1").replace(['\u{202f}', '\u{a0}'], " "), "1 234,50");
}

#[test]
fn effacer_les_formats_ou_tout() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "5");
    let a1 = CellRange::cell(0, 1, 1);
    wb.apply_style(a1, &StyleChange::Bold(true)).expect("gras");
    wb.clear_formats(a1).expect("formats");
    assert_eq!(show(&wb, 0, "A1"), "5");
    assert!(!wb.range(a1).expect("plage").cells[0].style.bold);
    wb.apply_style(a1, &StyleChange::Bold(true)).expect("gras");
    wb.clear_all(a1).expect("tout");
    assert!(wb.range(a1).expect("plage").cells.is_empty());
}

#[test]
fn tri_croissant_decroissant_avec_entete_et_styles() {
    let mut wb = fr();
    for (cell, v) in [
        ("A1", "Nom"),
        ("B1", "Note"),
        ("A2", "Élodie"),
        ("B2", "14"),
        ("A3", "bruno"),
        ("B3", "9"),
        ("A4", "Alice"),
        ("B4", "17"),
        ("A5", ""),
        ("B5", ""),
        ("A6", "Zoé"),
        ("B6", "12"),
    ] {
        if !v.is_empty() {
            set(&mut wb, 0, cell, v);
        }
    }
    wb.apply_style(CellRange::cell(0, 4, 1), &StyleChange::Bold(true)).expect("gras d'Alice");
    let range = CellRange { sheet: 0, top: 1, left: 1, bottom: 6, right: 2 };

    wb.sort(range, 2, false, true).expect("tri par note décroissante");
    let column = |wb: &Workbook, c: &str| (1..=6).map(|r| show(wb, 0, &format!("{c}{r}"))).collect::<Vec<_>>();
    assert_eq!(column(&wb, "A"), ["Nom", "Alice", "Élodie", "Zoé", "bruno", ""]);
    assert_eq!(column(&wb, "B"), ["Note", "17", "14", "12", "9", ""]);
    assert!(wb.range(CellRange::cell(0, 2, 1)).expect("plage").cells[0].style.bold, "la mise en forme suit la ligne");

    wb.sort(range, 1, true, true).expect("tri par nom");
    assert_eq!(
        column(&wb, "A"),
        ["Nom", "Alice", "bruno", "Élodie", "Zoé", ""],
        "sans casse ni accents, vides à la fin"
    );

    wb.undo().expect("annuler");
    assert_eq!(column(&wb, "A"), ["Nom", "Alice", "Élodie", "Zoé", "bruno", ""], "une seule étape d'annulation");

    set(&mut wb, 0, "C2", "=B2*2");
    assert!(
        wb.sort(CellRange { sheet: 0, top: 1, left: 1, bottom: 6, right: 3 }, 1, true, true).is_err(),
        "formules refusées"
    );
    assert!(wb.sort(range, 5, true, true).is_err(), "colonne hors plage");
}

#[test]
fn supprime_les_doublons() {
    let mut wb = fr();
    for (cell, v) in [("A1", "Ville"), ("A2", "Paris"), ("A3", "Lyon"), ("A4", "paris"), ("A5", "Lyon"), ("A6", "Nice")]
    {
        set(&mut wb, 0, cell, v);
    }
    let range = CellRange { sheet: 0, top: 1, left: 1, bottom: 6, right: 1 };
    assert_eq!(wb.remove_duplicates(range, true).expect("doublons"), 2);
    assert_eq!(
        (1..=6).map(|r| show(&wb, 0, &format!("A{r}"))).collect::<Vec<_>>(),
        ["Ville", "Paris", "Lyon", "Nice", "", ""]
    );
    assert_eq!(wb.remove_duplicates(range, true).expect("aucun"), 0);
}

#[test]
fn rechercher_et_remplacer() {
    let mut wb = fr();
    for (cell, v) in [("A1", "Total ventes"), ("B2", "total"), ("C3", "=SOMME(A5:A6)"), ("A5", "4"), ("A6", "6")] {
        set(&mut wb, 0, cell, v);
    }
    let opts = |match_case, whole_cell, in_formulas| FindOptions { match_case, whole_cell, in_formulas };
    let hits = wb.find(0, "total", opts(false, false, false)).expect("recherche");
    assert_eq!(hits, [Found { row: 1, column: 1 }, Found { row: 2, column: 2 }]);
    assert_eq!(wb.find(0, "total", opts(true, false, false)).expect("casse").len(), 1);
    assert_eq!(wb.find(0, "total", opts(false, true, false)).expect("entière").len(), 1);
    assert_eq!(
        wb.find(0, "10", opts(false, true, false)).expect("valeur").len(),
        1,
        "cherche dans les valeurs calculées"
    );
    assert_eq!(wb.find(0, "SOMME", opts(false, false, true)).expect("formules").len(), 1);

    assert_eq!(wb.replace_all(0, "total", "Somme", false).expect("remplacement"), 2);
    assert_eq!(show(&wb, 0, "A1"), "Somme ventes");
    assert_eq!(wb.replace_all(0, "A6", "A5", true).expect("dans une formule"), 1);
    assert_eq!(show(&wb, 0, "C3"), "4");
}

#[test]
fn quadrillage_et_noms_definis() {
    let mut wb = fr();
    assert!(wb.gridlines(0).expect("quadrillage"));
    wb.set_gridlines(0, false).expect("masquer");
    assert!(!wb.gridlines(0).expect("quadrillage"));
    let reopened = Workbook::from_xlsx(&wb.to_xlsx().expect("export"), "x", FormulaLanguage::Fr).expect("réouverture");
    assert!(!reopened.gridlines(0).expect("conservé"));

    set(&mut wb, 0, "B1", "0,2");
    wb.add_defined_name("TauxTVA", None, "=Feuil1!$B$1").expect("nom");
    set(&mut wb, 0, "A1", "=100*TauxTVA");
    assert_eq!(show(&wb, 0, "A1"), "20");
    assert_eq!(wb.defined_names().iter().map(|n| n.name.as_str()).collect::<Vec<_>>(), ["TauxTVA"]);
    assert!(wb.add_defined_name("A1", None, "=1").is_err(), "un nom ne peut pas ressembler à une référence");
    wb.delete_defined_name("TauxTVA", None).expect("suppression");
    assert!(wb.defined_names().is_empty());
}

#[test]
fn chaque_fonction_du_catalogue_est_reconnue_par_le_moteur() {
    for (language, pick) in [(FormulaLanguage::Fr, true), (FormulaLanguage::En, false)] {
        let mut wb = Workbook::new("catalogue", language).expect("classeur");
        for (i, info) in FUNCTIONS.iter().enumerate() {
            let name = if pick { info.fr } else { info.en };
            let row = i as i32 + 1;
            wb.set_input(0, row, 1, &format!("={name}()")).expect("saisie");
            let display = wb.display(0, row, 1).expect("valeur");
            assert!(!display.starts_with("#NOM") && !display.starts_with("#NAME"), "{name} inconnue ({display})");
            assert_eq!(
                wb.content(0, row, 1).expect("contenu"),
                format!("={name}()"),
                "{name} relue dans la même langue"
            );
        }
    }
    assert!(FUNCTIONS.len() >= 70);
}

#[test]
fn reproduire_la_mise_en_forme_et_afficher_les_formules() {
    let mut wb = fr();
    set(&mut wb, 0, "A1", "1");
    set(&mut wb, 0, "A2", "=A1*2");
    wb.apply_style(CellRange::cell(0, 1, 1), &StyleChange::Bold(true)).expect("gras");
    wb.apply_style(CellRange::cell(0, 1, 1), &StyleChange::Fill("#ffff00".into())).expect("fond");
    wb.copy_styles(CellRange::cell(0, 1, 1), CellRange { sheet: 0, top: 1, left: 2, bottom: 2, right: 3 })
        .expect("reproduire");
    let view = wb.range(CellRange { sheet: 0, top: 1, left: 2, bottom: 2, right: 3 }).expect("plage");
    assert_eq!(view.cells.len(), 4);
    assert!(view.cells.iter().all(|c| c.style.bold && c.style.fill.as_deref() == Some("#ffff00")));
    assert_eq!(show(&wb, 0, "A1"), "1", "les valeurs ne sont pas touchées");

    let formulas = wb.range_view(CellRange { sheet: 0, top: 1, left: 1, bottom: 2, right: 1 }, true).expect("formules");
    assert_eq!(formulas.cells.iter().map(|c| c.text.as_str()).collect::<Vec<_>>(), ["1", "=A1*2"]);
}
