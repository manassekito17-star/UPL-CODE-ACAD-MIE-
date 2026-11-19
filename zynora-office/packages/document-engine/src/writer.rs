//! Écriture DOCX avec docx-rs : styles de titres déclarés, listes à puces et numérotées.

use crate::DocError;
use crate::model::{self, Align, Block, Document, ListKind, Orientation, Paragraph, ParagraphStyle, Run, Script};
use docx_rs as dx;

pub(crate) const MM_TO_TWIPS: f64 = 1440.0 / 25.4;
// docx-rs déclare déjà une numérotation n° 1 : les nôtres utilisent des identifiants distincts.
const BULLET_ABSTRACT: usize = 101;
const ORDERED_ABSTRACT: usize = 102;
const BULLET_NUMBERING: usize = 101;

fn twips(mm: f64) -> i32 {
    (mm * MM_TO_TWIPS).round() as i32
}

pub(crate) fn style_id(s: ParagraphStyle) -> Option<&'static str> {
    match s {
        ParagraphStyle::Normal => None,
        ParagraphStyle::Title => Some("Title"),
        ParagraphStyle::Heading1 => Some("Heading1"),
        ParagraphStyle::Heading2 => Some("Heading2"),
        ParagraphStyle::Heading3 => Some("Heading3"),
        ParagraphStyle::Quote => Some("Quote"),
    }
}

fn styles(docx: dx::Docx) -> dx::Docx {
    let heading = |id: &str, name: &str, size: usize, color: &str| {
        dx::Style::new(id, dx::StyleType::Paragraph)
            .name(name)
            .based_on("Normal")
            .next("Normal")
            .q_format(true)
            .size(size)
            .bold()
            .color(color)
            .line_spacing(dx::LineSpacing::new().before(240).after(80))
            .outline_lvl(match id {
                "Heading1" => 0,
                "Heading2" => 1,
                _ => 2,
            })
    };
    docx.add_style(dx::Style::new("Normal", dx::StyleType::Paragraph).name("Normal").q_format(true))
        .add_style(
            dx::Style::new("Title", dx::StyleType::Paragraph)
                .name("Title")
                .based_on("Normal")
                .next("Normal")
                .q_format(true)
                .size(56)
                .line_spacing(dx::LineSpacing::new().after(160)),
        )
        .add_style(
            dx::Style::new("Hyperlink", dx::StyleType::Character).name("Hyperlink").color("0563C1").underline("single"),
        )
        .add_style(heading("Heading1", "heading 1", 32, "1F3864"))
        .add_style(heading("Heading2", "heading 2", 26, "2F5496"))
        .add_style(heading("Heading3", "heading 3", 24, "2F5496"))
        .add_style(
            dx::Style::new("Quote", dx::StyleType::Paragraph)
                .name("Quote")
                .based_on("Normal")
                .next("Normal")
                .q_format(true)
                .italic()
                .color("404040")
                .indent(Some(864), None, Some(864), None),
        )
}

fn numbering_definitions(mut docx: dx::Docx) -> dx::Docx {
    let mut bullets = dx::AbstractNumbering::new(BULLET_ABSTRACT);
    let mut ordered = dx::AbstractNumbering::new(ORDERED_ABSTRACT);
    for level in 0..9usize {
        let indent = 720 * (level as i32 + 1);
        let symbol = ["•", "◦", "▪"][level % 3];
        bullets = bullets.add_level(
            dx::Level::new(
                level,
                dx::Start::new(1),
                dx::NumberFormat::new("bullet"),
                dx::LevelText::new(symbol),
                dx::LevelJc::new("left"),
            )
            .indent(Some(indent), Some(dx::SpecialIndentType::Hanging(360)), None, None),
        );
        ordered = ordered.add_level(
            dx::Level::new(
                level,
                dx::Start::new(1),
                dx::NumberFormat::new("decimal"),
                dx::LevelText::new(format!("%{}.", level + 1)),
                dx::LevelJc::new("left"),
            )
            .indent(Some(indent), Some(dx::SpecialIndentType::Hanging(360)), None, None),
        );
    }
    docx = docx.add_abstract_numbering(bullets).add_abstract_numbering(ordered);
    docx.add_numbering(dx::Numbering::new(BULLET_NUMBERING, BULLET_ABSTRACT))
}

/// Attribue un identifiant de numérotation à chaque liste numérotée (redémarrage à 1 après
/// un paragraphe hors liste).
struct Lists {
    next_id: usize,
    current: Option<usize>,
    created: Vec<usize>,
}

impl Lists {
    fn id_for(&mut self, p: &Paragraph) -> Option<(usize, usize)> {
        let Some(list) = p.list else {
            self.current = None;
            return None;
        };
        let level = usize::from(list.level.min(8));
        match list.kind {
            ListKind::Bullet => Some((BULLET_NUMBERING, level)),
            ListKind::Ordered => {
                let id = *self.current.get_or_insert_with(|| {
                    self.next_id += 1;
                    self.created.push(self.next_id);
                    self.next_id
                });
                Some((id, level))
            }
        }
    }
}

fn run(r: &Run) -> dx::Run {
    let mut out = dx::Run::new();
    for (i, part) in r.text.split('\n').enumerate() {
        if i > 0 {
            out = out.add_break(dx::BreakType::TextWrapping);
        }
        for (j, piece) in part.split('\t').enumerate() {
            if j > 0 {
                out = out.add_tab();
            }
            if !piece.is_empty() {
                out = out.add_text(piece);
            }
        }
    }
    if r.bold {
        out = out.bold();
    }
    if r.italic {
        out = out.italic();
    }
    if r.underline {
        out = out.underline("single");
    }
    if r.strike {
        out = out.strike();
    }
    if let Some(c) = r.color.as_deref().and_then(model::hex_color) {
        out = out.color(c);
    }
    if let Some(h) = &r.highlight {
        out = out.highlight(h.clone());
    }
    if let Some(s) = r.size_pt {
        out = out.size((s * 2.0).round() as usize);
    }
    if let Some(f) = &r.font {
        out = out.fonts(dx::RunFonts::new().ascii(f).hi_ansi(f).east_asia(f).cs(f));
    }
    if let Some(s) = r.script {
        out.run_property = out.run_property.vert_align(match s {
            Script::Superscript => dx::VertAlignType::SuperScript,
            Script::Subscript => dx::VertAlignType::SubScript,
        });
    }
    if r.link.is_some() {
        out = out.style("Hyperlink");
    }
    out
}

fn paragraph(p: &Paragraph, lists: &mut Lists) -> dx::Paragraph {
    let mut out = dx::Paragraph::new();
    if let Some(id) = style_id(p.style) {
        out = out.style(id);
    }
    out = out.align(match p.align {
        Align::Left => dx::AlignmentType::Left,
        Align::Center => dx::AlignmentType::Center,
        Align::Right => dx::AlignmentType::Right,
        Align::Justify => dx::AlignmentType::Both,
    });
    if let Some((id, level)) = lists.id_for(p) {
        out = out.numbering(dx::NumberingId::new(id), dx::IndentLevel::new(level));
    }
    if p.indent_left_mm != 0.0 || p.first_line_mm != 0.0 {
        let special = match p.first_line_mm {
            v if v > 0.0 => Some(dx::SpecialIndentType::FirstLine(twips(v))),
            v if v < 0.0 => Some(dx::SpecialIndentType::Hanging(twips(-v))),
            _ => None,
        };
        out = out.indent(Some(twips(p.indent_left_mm)), special, None, None);
    }
    if p.space_before_pt.is_some() || p.space_after_pt.is_some() || p.line_spacing.is_some() {
        let mut ls = dx::LineSpacing::new();
        if let Some(v) = p.space_before_pt {
            ls = ls.before((v * 20.0).round() as u32);
        }
        if let Some(v) = p.space_after_pt {
            ls = ls.after((v * 20.0).round() as u32);
        }
        if let Some(v) = p.line_spacing {
            ls = ls.line((v * 240.0).round() as i32).line_rule(dx::LineSpacingType::Auto);
        }
        out = out.line_spacing(ls);
    }
    // Les portions consécutives partageant le même lien forment un seul lien hypertexte.
    let mut i = 0;
    while i < p.runs.len() {
        match &p.runs[i].link {
            Some(url) => {
                let mut link = dx::Hyperlink::new(url, dx::HyperlinkType::External);
                while i < p.runs.len() && p.runs[i].link.as_deref() == Some(url.as_str()) {
                    link = link.add_run(run(&p.runs[i]));
                    i += 1;
                }
                out = out.add_hyperlink(link);
            }
            None => {
                out = out.add_run(run(&p.runs[i]));
                i += 1;
            }
        }
    }
    out
}

fn table(t: &model::Table, text_width: f64, lists: &mut Lists) -> dx::Table {
    let columns = t.rows.iter().map(Vec::len).max().unwrap_or(1).max(1);
    let col_width = (twips(text_width) / columns as i32).max(1) as usize;
    let rows = t
        .rows
        .iter()
        .map(|row| {
            let mut cells: Vec<dx::TableCell> = row
                .iter()
                .map(|c| {
                    let mut cell = dx::TableCell::new().width(col_width, dx::WidthType::Dxa);
                    if c.paragraphs.is_empty() {
                        cell = cell.add_paragraph(dx::Paragraph::new());
                    }
                    for p in &c.paragraphs {
                        cell = cell.add_paragraph(paragraph(p, lists));
                    }
                    cell
                })
                .collect();
            while cells.len() < columns {
                cells.push(
                    dx::TableCell::new().width(col_width, dx::WidthType::Dxa).add_paragraph(dx::Paragraph::new()),
                );
            }
            lists.current = None;
            dx::TableRow::new(cells)
        })
        .collect();
    dx::Table::new(rows).set_grid(vec![col_width; columns]).width(col_width * columns, dx::WidthType::Dxa)
}

pub(crate) fn write(doc: &Document) -> Result<Vec<u8>, DocError> {
    let page = &doc.page;
    let (w, h) = match page.orientation {
        Orientation::Portrait => (page.width_mm.min(page.height_mm), page.width_mm.max(page.height_mm)),
        Orientation::Landscape => (page.width_mm.max(page.height_mm), page.width_mm.min(page.height_mm)),
    };
    let mut docx = dx::Docx::new().page_size(twips(w) as u32, twips(h) as u32).page_margin(
        dx::PageMargin::new()
            .top(twips(page.margin_top_mm))
            .right(twips(page.margin_right_mm))
            .bottom(twips(page.margin_bottom_mm))
            .left(twips(page.margin_left_mm))
            .header(twips(12.5))
            .footer(twips(12.5)),
    );
    if page.orientation == Orientation::Landscape {
        docx = docx.page_orient(dx::PageOrientationType::Landscape);
    }
    docx = numbering_definitions(styles(docx));
    let mut lists = Lists { next_id: BULLET_NUMBERING, current: None, created: Vec::new() };
    let text_width = w - page.margin_left_mm - page.margin_right_mm;
    let mut pending_break = false;
    for block in &doc.blocks {
        match block {
            Block::Paragraph(p) => {
                let mut para = paragraph(p, &mut lists);
                if std::mem::take(&mut pending_break) {
                    para = para.page_break_before(true);
                }
                docx = docx.add_paragraph(para);
            }
            Block::Table(t) => {
                if std::mem::take(&mut pending_break) {
                    docx =
                        docx.add_paragraph(dx::Paragraph::new().add_run(dx::Run::new().add_break(dx::BreakType::Page)));
                }
                lists.current = None;
                docx = docx.add_table(table(t, text_width, &mut lists));
            }
            Block::PageBreak => {
                if pending_break {
                    docx =
                        docx.add_paragraph(dx::Paragraph::new().add_run(dx::Run::new().add_break(dx::BreakType::Page)));
                }
                pending_break = true;
            }
        }
    }
    if pending_break {
        docx = docx.add_paragraph(dx::Paragraph::new().add_run(dx::Run::new().add_break(dx::BreakType::Page)));
    }
    for id in lists.created {
        docx = docx
            .add_numbering(dx::Numbering::new(id, ORDERED_ABSTRACT).add_override(dx::LevelOverride::new(0).start(1)));
    }
    let mut out = std::io::Cursor::new(Vec::new());
    docx.build().pack(&mut out).map_err(|e| DocError::Write(e.to_string()))?;
    Ok(out.into_inner())
}
