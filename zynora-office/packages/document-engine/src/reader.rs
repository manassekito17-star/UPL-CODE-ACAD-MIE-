//! Lecture DOCX : parcours du modèle docx-rs (via sa représentation JSON, ses champs étant
//! privés) vers le [`Document`] ZYNORA, en relevant tout ce qui ne sera pas conservé.

use crate::model::{
    Align, Block, Cell, Document, ListInfo, ListKind, Orientation, Page, Paragraph, ParagraphStyle, Run, Script, Table,
};
use crate::writer::MM_TO_TWIPS;
use crate::{DocError, Loaded, MAX_TEXT_BYTES};
use serde_json::Value;
use std::collections::{BTreeSet, HashMap};

struct Ctx {
    lost: BTreeSet<String>,
    /// identifiant de relation → (octets d'origine, aperçu PNG)
    images: HashMap<String, (Vec<u8>, Vec<u8>)>,
    /// identifiant de style → nom (« heading 1 », « Title »…)
    style_names: HashMap<String, String>,
    /// identifiant de numérotation → (abstractNum, surcharges)
    numberings: HashMap<u64, u64>,
    /// (abstractNum, niveau) → format (« bullet », « decimal »…)
    formats: HashMap<(u64, u64), String>,
    links: HashMap<String, String>,
    text_bytes: usize,
}

impl Ctx {
    fn lose(&mut self, what: &str) {
        self.lost.insert(what.to_owned());
    }
}

fn twips_to_mm(v: &Value) -> Option<f64> {
    v.as_f64().map(|t| (t / MM_TO_TWIPS * 10.0).round() / 10.0)
}

fn non_empty(v: &Value) -> bool {
    match v {
        Value::Null => false,
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
        _ => true,
    }
}

pub(crate) fn read(bytes: &[u8]) -> Result<Loaded, DocError> {
    let mut docx = docx_rs::read_docx(bytes).map_err(|e| DocError::Read(e.to_string()))?;
    // Les octets des images sont retirés avant la conversion JSON (qui les recopierait en tableaux).
    let images = std::mem::take(&mut docx.images)
        .into_iter()
        .map(|(id, _, original, preview)| (id, (original.0, preview.0)))
        .collect();
    docx.media.clear();
    let v: Value = serde_json::from_str(&docx.json()).map_err(|e| DocError::Read(e.to_string()))?;
    let mut ctx = Ctx {
        lost: BTreeSet::new(),
        images,
        style_names: HashMap::new(),
        numberings: HashMap::new(),
        formats: HashMap::new(),
        links: HashMap::new(),
        text_bytes: 0,
    };
    for s in v["styles"]["styles"].as_array().into_iter().flatten() {
        if let (Some(id), Some(name)) = (s["styleId"].as_str(), s["name"].as_str()) {
            ctx.style_names.insert(id.to_owned(), name.to_ascii_lowercase());
        }
    }
    for n in v["numberings"]["numberings"].as_array().into_iter().flatten() {
        if let (Some(id), Some(abs)) = (n["id"].as_u64(), n["abstractNumId"].as_u64()) {
            ctx.numberings.insert(id, abs);
        }
    }
    for a in v["numberings"]["abstractNums"].as_array().into_iter().flatten() {
        let Some(id) = a["id"].as_u64() else { continue };
        for l in a["levels"].as_array().into_iter().flatten() {
            if let (Some(level), Some(format)) = (l["level"].as_u64(), l["format"].as_str()) {
                ctx.formats.insert((id, level), format.to_owned());
            }
        }
    }
    for h in v["hyperlinks"].as_array().into_iter().flatten() {
        if let (Some(rid), Some(url)) = (h[0].as_str(), h[1].as_str()) {
            ctx.links.insert(rid.to_owned(), url.to_owned());
        }
    }
    if non_empty(&v["comments"]["comments"]) {
        ctx.lose("commentaires");
    }
    let section = &v["document"]["sectionProperty"];
    let page = read_page(section, &mut ctx);

    let mut blocks = Vec::new();
    for child in v["document"]["children"].as_array().into_iter().flatten() {
        read_block(child, &mut blocks, &mut ctx, 0)?;
    }
    // Un document vide garde un paragraphe pour pouvoir être édité.
    if !blocks.iter().any(|b| matches!(b, Block::Paragraph(_) | Block::Table(_))) {
        blocks.push(Block::Paragraph(Paragraph::default()));
    }
    Ok(Loaded { document: Document { page, blocks }, lost: ctx.lost.into_iter().collect() })
}

fn read_page(section: &Value, ctx: &mut Ctx) -> Page {
    let mut page = Page::default();
    if let (Some(w), Some(h)) = (twips_to_mm(&section["pageSize"]["w"]), twips_to_mm(&section["pageSize"]["h"])) {
        page.width_mm = w;
        page.height_mm = h;
    }
    page.orientation = if section["pageSize"]["orient"].as_str() == Some("landscape") || page.width_mm > page.height_mm
    {
        Orientation::Landscape
    } else {
        Orientation::Portrait
    };
    let m = &section["pageMargin"];
    let set = |field: &mut f64, v: &Value| {
        if let Some(mm) = twips_to_mm(v) {
            *field = mm.max(0.0);
        }
    };
    set(&mut page.margin_top_mm, &m["top"]);
    set(&mut page.margin_right_mm, &m["right"]);
    set(&mut page.margin_bottom_mm, &m["bottom"]);
    set(&mut page.margin_left_mm, &m["left"]);
    for key in ["headerReference", "firstHeaderReference", "evenHeaderReference", "header", "firstHeader", "evenHeader"]
    {
        if non_empty(&section[key]) {
            ctx.lose("en-têtes de page");
        }
    }
    for key in ["footerReference", "firstFooterReference", "evenFooterReference", "footer", "firstFooter", "evenFooter"]
    {
        if non_empty(&section[key]) {
            ctx.lose("pieds de page");
        }
    }
    if section["columns"].as_u64().is_some_and(|c| c > 1) {
        ctx.lose("colonnes de texte");
    }
    page
}

fn read_block(child: &Value, blocks: &mut Vec<Block>, ctx: &mut Ctx, depth: usize) -> Result<(), DocError> {
    match child["type"].as_str() {
        Some("paragraph") => read_paragraph(&child["data"], blocks, ctx),
        Some("table") => {
            if depth > 0 {
                ctx.lose("tableaux imbriqués (aplatis)");
            }
            let table = read_table(&child["data"], ctx, depth)?;
            if depth == 0 {
                blocks.push(Block::Table(table));
            } else {
                // Tableau imbriqué : son texte est conservé ligne par ligne.
                for row in table.rows {
                    for cell in row {
                        blocks.extend(cell.paragraphs.into_iter().map(Block::Paragraph));
                    }
                }
            }
            Ok(())
        }
        Some("bookmarkStart" | "bookmarkEnd") => Ok(()),
        Some("structuredDataTag") => {
            ctx.lose("contrôles de contenu (texte conservé)");
            for c in child["data"]["children"].as_array().into_iter().flatten() {
                read_block(c, blocks, ctx, depth)?;
            }
            Ok(())
        }
        Some("tableOfContents") => {
            ctx.lose("table des matières");
            Ok(())
        }
        other => {
            ctx.lose(&format!("élément non pris en charge ({})", other.unwrap_or("inconnu")));
            Ok(())
        }
    }
}

fn read_table(data: &Value, ctx: &mut Ctx, depth: usize) -> Result<Table, DocError> {
    let mut rows = Vec::new();
    for row in data["rows"].as_array().into_iter().flatten() {
        let mut cells = Vec::new();
        for cell in row["data"]["cells"].as_array().into_iter().flatten() {
            let prop = &cell["data"]["property"];
            if prop["gridSpan"].as_u64().is_some_and(|s| s > 1) || non_empty(&prop["verticalMerge"]) {
                ctx.lose("cellules de tableau fusionnées");
            }
            if non_empty(&prop["shading"]) {
                ctx.lose("couleurs de fond des cellules");
            }
            let mut blocks = Vec::new();
            for c in cell["data"]["children"].as_array().into_iter().flatten() {
                read_block(c, &mut blocks, ctx, depth + 1)?;
            }
            let paragraphs = blocks
                .into_iter()
                .filter_map(|b| match b {
                    Block::Paragraph(p) => Some(p),
                    _ => None,
                })
                .collect();
            cells.push(Cell { paragraphs });
        }
        if !cells.is_empty() {
            rows.push(cells);
        }
    }
    if rows.is_empty() {
        rows.push(vec![Cell::default()]);
    }
    Ok(Table { rows })
}

fn paragraph_style(ctx: &mut Ctx, id: Option<&str>) -> ParagraphStyle {
    let Some(id) = id else { return ParagraphStyle::Normal };
    let name = ctx.style_names.get(id).cloned().unwrap_or_else(|| id.to_ascii_lowercase());
    let compact: String = name.chars().filter(|c| !c.is_whitespace()).collect();
    match compact.as_str() {
        "title" | "titre" => ParagraphStyle::Title,
        "heading1" | "titre1" => ParagraphStyle::Heading1,
        "heading2" | "titre2" => ParagraphStyle::Heading2,
        "heading3" | "titre3" => ParagraphStyle::Heading3,
        "quote" | "quotations" | "blockquotation" | "citation" | "intensequote" => ParagraphStyle::Quote,
        "normal" | "bodytext" | "textbody" | "corpsdetexte" | "tablecontents" | "listparagraph"
        | "paragraphedeliste" | "standard" | "default" | "nospacing" => ParagraphStyle::Normal,
        _ => {
            if compact.starts_with("heading") || compact.starts_with("titre") {
                ctx.lose("titres de niveau 4 et plus (convertis en niveau 3)");
                ParagraphStyle::Heading3
            } else {
                ctx.lose("styles de paragraphe personnalisés");
                ParagraphStyle::Normal
            }
        }
    }
}

fn read_paragraph(data: &Value, blocks: &mut Vec<Block>, ctx: &mut Ctx) -> Result<(), DocError> {
    let prop = &data["property"];
    let mut p = Paragraph { style: paragraph_style(ctx, prop["style"].as_str()), ..Paragraph::default() };
    p.align = match prop["alignment"].as_str() {
        Some("center") => Align::Center,
        Some("right" | "end") => Align::Right,
        Some("both" | "justified" | "distribute") => Align::Justify,
        _ => Align::Left,
    };
    let numbered = &prop["numberingProperty"];
    if let Some(id) = numbered["id"].as_u64().filter(|id| *id != 0) {
        let level = numbered["level"].as_u64().unwrap_or(0).min(8);
        let format = ctx.numberings.get(&id).and_then(|abs| ctx.formats.get(&(*abs, level))).cloned();
        let kind = match format.as_deref() {
            Some("bullet") => ListKind::Bullet,
            Some("decimal") | None => ListKind::Ordered,
            Some("none") => {
                ctx.lose("listes sans marque");
                ListKind::Bullet
            }
            Some(_) => {
                ctx.lose("numérotations en lettres ou en chiffres romains (converties en chiffres)");
                ListKind::Ordered
            }
        };
        p.list = Some(ListInfo { kind, level: level as u8 });
    }
    // Les retraits des listes sont ceux de la numérotation : on ne les recopie pas.
    let indent = &prop["indent"];
    if p.list.is_none() && non_empty(indent) {
        p.indent_left_mm = twips_to_mm(&indent["start"]).unwrap_or(0.0).max(0.0);
        let special = &indent["specialIndent"];
        let value = twips_to_mm(&special["val"]).unwrap_or(0.0);
        p.first_line_mm = match special["type"].as_str() {
            Some("firstLine") => value,
            Some("hanging") => -value,
            _ => 0.0,
        };
        if indent["end"].as_f64().is_some_and(|e| e != 0.0) {
            ctx.lose("retraits à droite");
        }
    }
    let spacing = &prop["lineSpacing"];
    p.space_before_pt = spacing["before"].as_f64().map(|t| t / 20.0);
    p.space_after_pt = spacing["after"].as_f64().map(|t| t / 20.0);
    if let Some(line) = spacing["line"].as_f64() {
        match spacing["lineRule"].as_str() {
            None | Some("auto") => p.line_spacing = Some((line / 240.0 * 100.0).round() / 100.0),
            Some(_) => ctx.lose("interlignes exacts ou minimums (convertis)"),
        }
    }
    if p.list.is_none() && prop["tabs"].as_array().is_some_and(|t| t.iter().any(|t| t["val"].as_str() != Some("clear")))
    {
        ctx.lose("taquets de tabulation");
    }
    if non_empty(&prop["sectionProperty"]) {
        ctx.lose("sections multiples (mise en page de la dernière section appliquée)");
    }
    for key in ["borders", "shading", "frameProperty"] {
        if non_empty(&prop[key]) {
            ctx.lose("bordures, trames et cadres de paragraphe");
        }
    }

    let mut page_break_after = false;
    for child in data["children"].as_array().into_iter().flatten() {
        match child["type"].as_str() {
            Some("run") => read_run(&child["data"], None, &mut p.runs, &mut page_break_after, ctx)?,
            Some("hyperlink") => {
                let link = child["data"]["rid"].as_str().and_then(|rid| ctx.links.get(rid)).cloned();
                let safe = link.filter(|l| crate::is_safe_link(l));
                if safe.is_none() {
                    ctx.lose("liens internes ou non web");
                }
                for c in child["data"]["children"].as_array().into_iter().flatten() {
                    if c["type"].as_str() == Some("run") {
                        read_run(&c["data"], safe.as_deref(), &mut p.runs, &mut page_break_after, ctx)?;
                    }
                }
            }
            Some("bookmarkStart" | "bookmarkEnd" | "commentRangeEnd") => {}
            Some("commentRangeStart") => ctx.lose("commentaires"),
            Some("insert" | "delete" | "moveFrom" | "moveTo") => ctx.lose("modifications suivies"),
            Some("structuredDataTag") => ctx.lose("contrôles de contenu"),
            other => ctx.lose(&format!("élément non pris en charge ({})", other.unwrap_or("inconnu"))),
        }
    }
    merge_runs(&mut p.runs);
    // Un paragraphe constitué uniquement d'un saut de page devient un saut de page.
    if page_break_after && p.runs.is_empty() && p.list.is_none() {
        blocks.push(Block::PageBreak);
        return Ok(());
    }
    if prop["pageBreakBefore"].as_bool() == Some(true) {
        blocks.push(Block::PageBreak);
    }
    blocks.push(Block::Paragraph(p));
    if page_break_after {
        blocks.push(Block::PageBreak);
    }
    Ok(())
}

fn read_run(
    data: &Value,
    link: Option<&str>,
    runs: &mut Vec<Run>,
    page_break: &mut bool,
    ctx: &mut Ctx,
) -> Result<(), DocError> {
    let rp = &data["runProperty"];
    let flag = |key: &str| rp[key].as_bool().unwrap_or(false);
    let mut base = Run {
        bold: flag("bold"),
        italic: flag("italic"),
        underline: rp["underline"].as_str().is_some_and(|u| u != "none"),
        strike: flag("strike"),
        color: rp["color"]
            .as_str()
            .filter(|c| *c != "auto")
            .and_then(crate::model::hex_color)
            .map(|c| format!("#{}", c.to_ascii_lowercase())),
        highlight: rp["highlight"].as_str().filter(|h| crate::HIGHLIGHTS.contains(h)).map(str::to_owned),
        size_pt: rp["sz"].as_f64().map(|s| s / 2.0),
        font: rp["fonts"]["ascii"].as_str().or_else(|| rp["fonts"]["hiAnsi"].as_str()).map(str::to_owned),
        script: match rp["vertAlign"].as_str() {
            Some("superscript") => Some(Script::Superscript),
            Some("subscript") => Some(Script::Subscript),
            _ => None,
        },
        link: link.map(str::to_owned),
        ..Run::default()
    };
    if rp["underline"].as_str().is_some_and(|u| u != "none" && u != "single") {
        ctx.lose("styles de soulignement (convertis en simple)");
    }
    if rp["highlight"].as_str().is_some_and(|h| h != "none" && !crate::HIGHLIGHTS.contains(&h)) {
        ctx.lose("couleurs de surlignage");
    }
    if flag("dstrike")
        || flag("caps")
        || flag("smallCaps")
        || non_empty(&rp["shading"])
        || non_empty(&rp["characterSpacing"])
    {
        ctx.lose("effets de caractère (petites majuscules, espacement, trame…)");
    }
    if flag("vanish") || flag("specVanish") {
        ctx.lose("texte masqué");
    }
    if rp["style"].as_str().is_some_and(|s| {
        !matches!(ctx.style_names.get(s).map(String::as_str), Some("hyperlink" | "internet link")) && s != "Hyperlink"
    }) {
        ctx.lose("styles de caractère");
    }
    if let Some(font) = &base.font {
        if font.is_empty() || font.len() > 64 || font.chars().any(char::is_control) {
            base.font = None;
        }
    }
    if base.size_pt.is_some_and(|s| !(1.0..=1638.0).contains(&s)) {
        base.size_pt = None;
    }

    let mut text = String::new();
    for c in data["children"].as_array().into_iter().flatten() {
        match c["type"].as_str() {
            Some("text") => text.push_str(c["data"]["text"].as_str().unwrap_or("")),
            Some("tab" | "ptab") => text.push('\t'),
            Some("break") => match c["data"]["breakType"].as_str() {
                Some("page") => {
                    if !text.is_empty() {
                        runs.push(Run { text: std::mem::take(&mut text), ..base.clone() });
                    }
                    *page_break = true;
                }
                Some("column") => ctx.lose("sauts de colonne"),
                _ => text.push('\n'),
            },
            Some("sym") => ctx.lose("symboles de police"),
            Some("drawing") => {
                let drawing = &c["data"];
                let pic = &drawing["data"];
                let image = (drawing["type"].as_str() == Some("pic"))
                    .then(|| pic["id"].as_str())
                    .flatten()
                    .and_then(|id| ctx.images.get(id))
                    .and_then(|(original, preview)| {
                        let emu = |i: usize| pic["size"][i].as_f64().unwrap_or(0.0) / crate::image::EMU_PER_MM;
                        crate::image::from_docx_media(original, preview, emu(0), emu(1))
                    });
                match image {
                    Some(image) => {
                        if pic["positionType"].as_str().is_some_and(|p| p != "inline") {
                            ctx.lose("position des images flottantes (placées dans le texte)");
                        }
                        if !text.is_empty() {
                            runs.push(Run { text: std::mem::take(&mut text), ..base.clone() });
                        }
                        ctx.text_bytes += image.data.len();
                        runs.push(Run { image: Some(image), ..base.clone() });
                    }
                    None => ctx.lose("dessins, formes et images vectorielles (EMF, WMF)"),
                }
            }
            Some("fieldChar" | "instrText" | "fldSimple") => ctx.lose("champs (numéros de page, dates, renvois)"),
            Some("footnoteReference" | "endnoteReference") => ctx.lose("notes de bas de page et de fin"),
            Some("commentReference") => ctx.lose("commentaires"),
            Some("deleteText" | "deleteInstrText") => ctx.lose("modifications suivies"),
            Some("shape" | "pict" | "object") => ctx.lose("objets et zones de texte"),
            other => ctx.lose(&format!("élément de texte non pris en charge ({})", other.unwrap_or("inconnu"))),
        }
    }
    ctx.text_bytes += text.len();
    if ctx.text_bytes > MAX_TEXT_BYTES {
        return Err(DocError::TooLarge);
    }
    if !text.is_empty() {
        runs.push(Run { text, ..base });
    }
    Ok(())
}

/// Fusionne les portions consécutives de même mise en forme (Word en produit beaucoup).
fn merge_runs(runs: &mut Vec<Run>) {
    let mut out: Vec<Run> = Vec::with_capacity(runs.len());
    for r in runs.drain(..) {
        if let Some(last) = out.last_mut().filter(|l| l.image.is_none() && r.image.is_none()) {
            let same = Run { text: String::new(), ..last.clone() } == Run { text: String::new(), ..r.clone() };
            if same {
                last.text.push_str(&r.text);
                continue;
            }
        }
        out.push(r);
    }
    *runs = out;
}
