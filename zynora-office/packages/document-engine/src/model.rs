//! Modèle de document échangé avec l'interface (JSON). Volontairement limité aux éléments que
//! ZYNORA sait lire, afficher, modifier ET réécrire sans perte.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Document {
    pub page: Page,
    pub blocks: Vec<Block>,
}

impl Default for Document {
    fn default() -> Self {
        Self { page: Page::default(), blocks: vec![Block::Paragraph(Paragraph::default())] }
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Orientation {
    #[default]
    Portrait,
    Landscape,
}

/// Mise en page (dimensions en millimètres, format A4 par défaut).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Page {
    pub orientation: Orientation,
    pub width_mm: f64,
    pub height_mm: f64,
    pub margin_top_mm: f64,
    pub margin_right_mm: f64,
    pub margin_bottom_mm: f64,
    pub margin_left_mm: f64,
}

impl Default for Page {
    fn default() -> Self {
        Self {
            orientation: Orientation::Portrait,
            width_mm: 210.0,
            height_mm: 297.0,
            margin_top_mm: 25.0,
            margin_right_mm: 25.0,
            margin_bottom_mm: 25.0,
            margin_left_mm: 25.0,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Block {
    Paragraph(Paragraph),
    Table(Table),
    PageBreak,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParagraphStyle {
    #[default]
    Normal,
    Title,
    Heading1,
    Heading2,
    Heading3,
    Quote,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Align {
    #[default]
    Left,
    Center,
    Right,
    Justify,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ListKind {
    Bullet,
    Ordered,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct ListInfo {
    pub kind: ListKind,
    /// Niveau d'imbrication (0 à 8).
    pub level: u8,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Paragraph {
    #[serde(default)]
    pub style: ParagraphStyle,
    #[serde(default)]
    pub align: Align,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub list: Option<ListInfo>,
    /// Retrait gauche (mm).
    #[serde(default, skip_serializing_if = "is_zero")]
    pub indent_left_mm: f64,
    /// Retrait de première ligne (mm) ; négatif = retrait suspendu.
    #[serde(default, skip_serializing_if = "is_zero")]
    pub first_line_mm: f64,
    /// Espacement avant / après (points) ; absent = valeur du style.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub space_before_pt: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub space_after_pt: Option<f64>,
    /// Interligne multiple (1 = simple, 1.5, 2…) ; absent = valeur du style.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line_spacing: Option<f64>,
    #[serde(default)]
    pub runs: Vec<Run>,
}

fn is_zero(v: &f64) -> bool {
    *v == 0.0
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Script {
    Superscript,
    Subscript,
}

/// Portion de texte de mise en forme homogène. Un retour à la ligne forcé est « \n ».
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Run {
    pub text: String,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub bold: bool,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub italic: bool,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub underline: bool,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub strike: bool,
    /// Couleur « #rrggbb ».
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    /// Surlignage : nom de couleur Word (« yellow », « green »…).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlight: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub script: Option<Script>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub size_pt: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font: Option<String>,
    /// Lien hypertexte externe (http, https, mailto).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
    /// Image placée dans le texte (le texte de la portion est alors vide).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image: Option<crate::image::ImageData>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Table {
    pub rows: Vec<Vec<Cell>>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Cell {
    pub paragraphs: Vec<Paragraph>,
}

/// Couleurs de surlignage autorisées par le format DOCX.
pub const HIGHLIGHTS: &[&str] = &[
    "yellow",
    "green",
    "cyan",
    "magenta",
    "blue",
    "red",
    "darkBlue",
    "darkCyan",
    "darkGreen",
    "darkMagenta",
    "darkRed",
    "darkYellow",
    "darkGray",
    "lightGray",
    "black",
];

/// Un lien n'est accepté que vers le web ou une adresse électronique.
pub fn is_safe_link(url: &str) -> bool {
    let lower = url.trim().to_ascii_lowercase();
    (lower.starts_with("https://") || lower.starts_with("http://") || lower.starts_with("mailto:"))
        && !url.chars().any(char::is_control)
        && url.len() <= 2048
}

impl Document {
    /// Texte brut (une ligne par paragraphe, cellules séparées par des tabulations).
    pub fn plain_text(&self) -> String {
        let mut out = String::new();
        let mut counters = [0usize; 9];
        for block in &self.blocks {
            match block {
                Block::Paragraph(p) => {
                    push_paragraph(&mut out, p, &mut counters);
                }
                Block::Table(t) => {
                    for row in &t.rows {
                        let cells: Vec<String> = row
                            .iter()
                            .map(|c| c.paragraphs.iter().map(Paragraph::text).collect::<Vec<_>>().join(" "))
                            .collect();
                        out.push_str(&cells.join("\t"));
                        out.push('\n');
                    }
                }
                Block::PageBreak => out.push('\u{c}'),
            }
        }
        out
    }

    /// Nombre de mots et de caractères (espaces compris).
    pub fn counts(&self) -> (usize, usize) {
        let text = self.plain_text();
        (text.split_whitespace().count(), text.chars().filter(|c| !matches!(c, '\n' | '\u{c}')).count())
    }
}

fn push_paragraph(out: &mut String, p: &Paragraph, counters: &mut [usize; 9]) {
    match p.list {
        Some(ListInfo { kind, level }) => {
            let level = usize::from(level.min(8));
            out.push_str(&"  ".repeat(level));
            match kind {
                ListKind::Bullet => out.push_str("• "),
                ListKind::Ordered => {
                    counters[level] += 1;
                    for c in counters.iter_mut().skip(level + 1) {
                        *c = 0;
                    }
                    out.push_str(&format!("{}. ", counters[level]));
                }
            }
        }
        None => *counters = [0; 9],
    }
    out.push_str(&p.text());
    out.push('\n');
}

impl Paragraph {
    pub fn text(&self) -> String {
        self.runs.iter().map(|r| r.text.as_str()).collect()
    }

    pub fn plain(text: &str) -> Self {
        Self { runs: vec![Run { text: text.to_owned(), ..Run::default() }], ..Self::default() }
    }
}

/// « #RRGGBB » ou « RRGGBB » → « RRGGBB » en majuscules.
pub(crate) fn hex_color(c: &str) -> Option<String> {
    let h = c.strip_prefix('#').unwrap_or(c);
    (h.len() == 6 && h.chars().all(|ch| ch.is_ascii_hexdigit())).then(|| h.to_ascii_uppercase())
}
