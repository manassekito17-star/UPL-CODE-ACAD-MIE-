use super::*;

fn run(text: &str) -> Run {
    Run { text: text.into(), ..Run::default() }
}

fn para(style: ParagraphStyle, runs: Vec<Run>) -> Block {
    Block::Paragraph(Paragraph { style, runs, ..Paragraph::default() })
}

fn list(kind: ListKind, level: u8, text: &str) -> Block {
    Block::Paragraph(Paragraph { list: Some(ListInfo { kind, level }), runs: vec![run(text)], ..Paragraph::default() })
}

fn sample() -> Document {
    Document {
        page: Page { margin_left_mm: 20.0, margin_right_mm: 20.0, ..Page::default() },
        blocks: vec![
            para(ParagraphStyle::Title, vec![run("Rapport annuel")]),
            para(ParagraphStyle::Heading1, vec![run("Introduction")]),
            Block::Paragraph(Paragraph {
                align: Align::Justify,
                indent_left_mm: 10.0,
                first_line_mm: 5.0,
                space_after_pt: Some(6.0),
                line_spacing: Some(1.5),
                runs: vec![
                    run("Texte "),
                    Run { text: "gras".into(), bold: true, ..Run::default() },
                    run(" et "),
                    Run {
                        text: "italique rouge".into(),
                        italic: true,
                        color: Some("#c00000".into()),
                        ..Run::default()
                    },
                    run(", "),
                    Run { text: "souligné".into(), underline: true, ..Run::default() },
                    run(", "),
                    Run { text: "barré".into(), strike: true, ..Run::default() },
                    run(", "),
                    Run { text: "surligné".into(), highlight: Some("yellow".into()), ..Run::default() },
                    run(", "),
                    Run { text: "Arial 14".into(), font: Some("Arial".into()), size_pt: Some(14.0), ..Run::default() },
                    run(", H"),
                    Run { text: "2".into(), script: Some(Script::Subscript), ..Run::default() },
                    run("O, m"),
                    Run { text: "2".into(), script: Some(Script::Superscript), ..Run::default() },
                    run(", "),
                    Run { text: "lien".into(), link: Some("https://exemple.fr/page".into()), ..Run::default() },
                    run(".\nDeuxième ligne\tavec tabulation."),
                ],
                ..Paragraph::default()
            }),
            list(ListKind::Bullet, 0, "Puce A"),
            list(ListKind::Bullet, 1, "Sous-puce"),
            list(ListKind::Ordered, 0, "Premier"),
            list(ListKind::Ordered, 0, "Deuxième"),
            Block::Paragraph(Paragraph { align: Align::Center, runs: vec![run("Centré")], ..Paragraph::default() }),
            Block::Table(Table {
                rows: vec![
                    vec![
                        Cell { paragraphs: vec![Paragraph::plain("Produit")] },
                        Cell { paragraphs: vec![Paragraph::plain("Prix")] },
                    ],
                    vec![
                        Cell { paragraphs: vec![Paragraph::plain("Stylo")] },
                        Cell { paragraphs: vec![Paragraph::plain("1,50 €")] },
                    ],
                ],
            }),
            Block::PageBreak,
            para(ParagraphStyle::Heading2, vec![run("Annexe")]),
            para(ParagraphStyle::Quote, vec![run("Une citation.")]),
        ],
    }
}

#[test]
fn aller_retour_docx_sans_perte() {
    let doc = sample();
    let bytes = to_docx(&doc).expect("écriture");
    let loaded = from_docx(&bytes).expect("lecture");
    assert!(loaded.lost.is_empty(), "rien ne doit être perdu : {:?}", loaded.lost);
    assert_eq!(loaded.document, doc);
}

#[test]
fn listes_numerotees_redemarrent_apres_un_paragraphe() {
    let doc = Document {
        page: Page::default(),
        blocks: vec![
            list(ListKind::Ordered, 0, "a"),
            list(ListKind::Ordered, 0, "b"),
            Block::Paragraph(Paragraph::plain("coupure")),
            list(ListKind::Ordered, 0, "c"),
        ],
    };
    assert_eq!(doc.plain_text(), "1. a\n2. b\ncoupure\n1. c\n");
    let loaded = from_docx(&to_docx(&doc).expect("écriture")).expect("lecture");
    assert_eq!(loaded.document, doc);
}

#[test]
fn paysage_et_marges() {
    let mut doc = Document::default();
    doc.page.orientation = Orientation::Landscape;
    doc.page.margin_top_mm = 12.7;
    let loaded = from_docx(&to_docx(&doc).expect("écriture")).expect("lecture");
    let p = loaded.document.page;
    assert_eq!(p.orientation, Orientation::Landscape);
    assert_eq!((p.width_mm, p.height_mm), (297.0, 210.0));
    assert_eq!(p.margin_top_mm, 12.7);
}

#[test]
fn lit_un_docx_produit_par_libreoffice() {
    let loaded = from_docx(include_bytes!("../tests/fixtures/libreoffice-riche.docx")).expect("lecture");
    let doc = &loaded.document;
    let text = doc.plain_text();
    assert!(text.starts_with("Titre\nAvant  après lien\n"), "{text}");
    assert!(text.contains("1. un\n  1. sous\n2. deux\n• puce\ncite\nretrait\n"), "{text}");
    assert!(text.contains("a\tb\nfusion\n"), "{text}");
    let Block::Paragraph(h) = &doc.blocks[0] else { panic!("titre attendu") };
    assert_eq!(h.style, ParagraphStyle::Heading1);
    let Block::Paragraph(p) = &doc.blocks[1] else { panic!("paragraphe attendu") };
    assert_eq!(p.runs.last().and_then(|r| r.link.as_deref()), Some("https://a.fr/"));
    assert!(doc.blocks.iter().any(|b| matches!(b, Block::Paragraph(p) if p.style == ParagraphStyle::Quote)));
    assert!(doc.blocks.iter().any(|b| matches!(b, Block::Paragraph(p) if p.indent_left_mm == 20.0)));
    // L'image et la cellule fusionnée sont signalées : l'original ne sera pas écrasé.
    assert!(loaded.lost.contains(&"images et dessins".to_owned()), "{:?}", loaded.lost);
    assert!(loaded.lost.contains(&"cellules de tableau fusionnées".to_owned()), "{:?}", loaded.lost);
}

#[test]
fn texte_brut_aller_retour() {
    let doc = from_txt("\u{feff}Ligne 1\r\nLigne 2\n\u{c}Page 2\n".as_bytes()).expect("txt");
    assert_eq!(doc.blocks.len(), 4);
    assert!(matches!(doc.blocks[2], Block::PageBreak));
    assert_eq!(String::from_utf8(to_txt(&doc)).expect("utf8"), "Ligne 1\nLigne 2\n\u{c}Page 2\n");
    assert!(matches!(from_txt(&[0xff, 0xfe, 0x00]), Err(DocError::Encoding)));
    assert_eq!(Document::default().counts(), (0, 0));
    assert_eq!(doc.counts(), (6, 20));
}

#[test]
fn refuse_les_donnees_invalides() {
    let mut doc = sample();
    doc.page.margin_left_mm = 195.0;
    assert!(matches!(to_docx(&doc), Err(DocError::Invalid(_))));
    for bad in [
        Run { text: "x".into(), link: Some("javascript:alert(1)".into()), ..Run::default() },
        Run { text: "x".into(), link: Some("file:///etc/passwd".into()), ..Run::default() },
        Run { text: "x".into(), color: Some("rouge".into()), ..Run::default() },
        Run { text: "x".into(), highlight: Some("orange".into()), ..Run::default() },
        Run { text: "x".into(), size_pt: Some(f64::NAN), ..Run::default() },
    ] {
        let doc = Document { page: Page::default(), blocks: vec![para(ParagraphStyle::Normal, vec![bad.clone()])] };
        assert!(matches!(to_docx(&doc), Err(DocError::Invalid(_))), "{bad:?}");
    }
}

#[test]
fn fichier_endommage_refuse_sans_panique() {
    assert!(from_docx(b"pas un zip").is_err());
    let mut bytes = to_docx(&sample()).expect("écriture");
    bytes.truncate(bytes.len() / 2);
    assert!(from_docx(&bytes).is_err());
}

#[test]
fn json_stable_pour_l_interface() {
    let json = serde_json::to_value(Document::default()).expect("json");
    assert_eq!(json["blocks"][0]["type"], "paragraph");
    assert_eq!(json["page"]["orientation"], "portrait");
    let back: Document = serde_json::from_value(serde_json::json!({
        "page": json["page"],
        "blocks": [{"type": "paragraph", "style": "heading1", "runs": [{"text": "T", "bold": true}]}, {"type": "page_break"}]
    }))
    .expect("lecture json");
    assert_eq!(back.blocks.len(), 2);
}

fn soffice(dir: &std::path::Path, to: &str, input: &std::path::Path) {
    let status = std::process::Command::new("soffice")
        .arg(format!("-env:UserInstallation=file://{}", dir.join("profil").display()))
        .args(["--headless", "--convert-to", to, "--outdir"])
        .arg(dir)
        .arg(input)
        .stdout(std::process::Stdio::null())
        .status()
        .expect("soffice");
    assert!(status.success());
}

/// Vérification croisée : LibreOffice relit nos fichiers (`cargo test -- --ignored`).
#[test]
#[ignore = "nécessite LibreOffice (soffice)"]
fn libreoffice_relit_nos_documents() {
    let dir = std::env::temp_dir().join(format!("zynora-lo-doc-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("dossier");
    let docx = dir.join("rapport.docx");
    std::fs::write(&docx, to_docx(&sample()).expect("écriture")).expect("fichier");
    soffice(&dir, "html", &docx);
    let html = std::fs::read_to_string(dir.join("rapport.html")).expect("html");
    // LibreOffice coupe les lignes longues : espaces normalisés.
    let html = html.split_whitespace().collect::<Vec<_>>().join(" ");
    for expected in [
        "<h1",
        "Introduction",
        "<h2",
        "Annexe",
        "<ol",
        "<ul",
        "Premier",
        "Puce A",
        "<table",
        "1,50 €",
        "https://exemple.fr/page",
    ] {
        assert!(html.contains(expected), "« {expected} » absent du rendu LibreOffice");
    }
    assert!(
        html.contains("<b>gras</b>") || html.contains("font-weight: bold") || html.contains("<strong>gras"),
        "gras perdu"
    );
    // Et nous relisons ce que LibreOffice réenregistre.
    let back = dir.join("back");
    std::fs::create_dir_all(&back).expect("dossier");
    soffice(&back, "docx:MS Word 2007 XML", &docx);
    let loaded = from_docx(&std::fs::read(back.join("rapport.docx")).expect("docx")).expect("relecture");
    let text = loaded.document.plain_text();
    assert!(text.contains("Rapport annuel\nIntroduction\n"), "{text}");
    assert!(text.contains("• Puce A\n  • Sous-puce\n1. Premier\n2. Deuxième\n"), "{text}");
    let _ = std::fs::remove_dir_all(dir);
}
