//! Moteur de documents de ZYNORA OFFICE.
//!
//! Le texte est échangé avec l'interface sous forme d'un [`Document`] (JSON). La lecture DOCX
//! s'appuie sur docx-rs (MIT) ; tout élément que ZYNORA ne sait pas réécrire est **signalé** dans
//! [`Loaded::lost`] afin que l'interface n'écrase jamais l'original sans le dire (enregistrement
//! d'une copie imposé).

mod image;
mod model;
mod reader;
mod writer;

#[cfg(test)]
mod tests;

pub use image::{ImageData, MAX_IMAGE_BYTES, prepare_image};
pub use model::*;

/// Taille maximale d'un document décompressé accepté (garde-fou mémoire).
pub const MAX_TEXT_BYTES: usize = 64 * 1024 * 1024;

#[derive(Debug, thiserror::Error)]
pub enum DocError {
    #[error("Le document est illisible ou endommagé : {0}")]
    Read(String),
    #[error("Impossible d'écrire le document : {0}")]
    Write(String),
    #[error("Le texte n'est pas encodé en UTF-8.")]
    Encoding,
    #[error("Le document est trop volumineux.")]
    TooLarge,
    #[error("Données de document invalides : {0}")]
    Invalid(String),
}

/// Résultat d'une ouverture : le document et la liste (dédoublonnée) des éléments non conservés.
#[derive(Debug, Clone, PartialEq, serde::Serialize)]
pub struct Loaded {
    pub document: Document,
    pub lost: Vec<String>,
}

/// Lit un fichier DOCX. Une erreur interne de la bibliothèque (panique) est convertie en erreur.
pub fn from_docx(bytes: &[u8]) -> Result<Loaded, DocError> {
    let result = std::panic::catch_unwind(|| reader::read(bytes));
    match result {
        Ok(r) => r,
        Err(_) => Err(DocError::Read("structure DOCX non prise en charge".into())),
    }
}

/// Écrit un fichier DOCX.
pub fn to_docx(doc: &Document) -> Result<Vec<u8>, DocError> {
    doc.validate()?;
    writer::write(doc)
}

/// Lit un fichier texte UTF-8 (BOM accepté) : un paragraphe par ligne.
pub fn from_txt(bytes: &[u8]) -> Result<Document, DocError> {
    if bytes.len() > MAX_TEXT_BYTES {
        return Err(DocError::TooLarge);
    }
    let text =
        std::str::from_utf8(bytes.strip_prefix(b"\xEF\xBB\xBF").unwrap_or(bytes)).map_err(|_| DocError::Encoding)?;
    let text = text.replace("\r\n", "\n").replace('\r', "\n");
    let mut blocks: Vec<Block> = Vec::new();
    for (i, page) in text.split('\u{c}').enumerate() {
        if i > 0 {
            blocks.push(Block::PageBreak);
        }
        let page = page.strip_suffix('\n').unwrap_or(page);
        blocks.extend(page.split('\n').map(|l| Block::Paragraph(Paragraph::plain(l))));
    }
    if blocks.is_empty() {
        blocks.push(Block::Paragraph(Paragraph::default()));
    }
    Ok(Document { page: Page::default(), blocks })
}

/// Exporte en texte brut UTF-8.
pub fn to_txt(doc: &Document) -> Vec<u8> {
    doc.plain_text().into_bytes()
}

impl Document {
    /// Vérifie les valeurs reçues de l'interface avant écriture.
    pub fn validate(&self) -> Result<(), DocError> {
        let p = &self.page;
        let dims = [p.width_mm, p.height_mm];
        if dims.iter().any(|d| !d.is_finite() || !(50.0..=1000.0).contains(d)) {
            return Err(DocError::Invalid("dimensions de page".into()));
        }
        let margins = [p.margin_top_mm, p.margin_right_mm, p.margin_bottom_mm, p.margin_left_mm];
        if margins.iter().any(|m| !m.is_finite() || !(0.0..=200.0).contains(m))
            || p.margin_left_mm + p.margin_right_mm >= p.width_mm - 10.0
            || p.margin_top_mm + p.margin_bottom_mm >= p.height_mm - 10.0
        {
            return Err(DocError::Invalid("marges".into()));
        }
        let mut stack: Vec<&Paragraph> = Vec::new();
        for b in &self.blocks {
            match b {
                Block::Paragraph(p) => stack.push(p),
                Block::Table(t) => {
                    if t.rows.is_empty() || t.rows.iter().any(Vec::is_empty) {
                        return Err(DocError::Invalid("tableau vide".into()));
                    }
                    stack.extend(t.rows.iter().flatten().flat_map(|c| c.paragraphs.iter()));
                }
                Block::PageBreak => {}
            }
        }
        for p in stack {
            p.validate()?;
        }
        Ok(())
    }
}

impl Paragraph {
    fn validate(&self) -> Result<(), DocError> {
        let bad = |v: f64, lo: f64, hi: f64| !v.is_finite() || v < lo || v > hi;
        if bad(self.indent_left_mm, 0.0, 500.0)
            || bad(self.first_line_mm, -200.0, 200.0)
            || self.space_before_pt.is_some_and(|v| bad(v, 0.0, 1584.0))
            || self.space_after_pt.is_some_and(|v| bad(v, 0.0, 1584.0))
            || self.line_spacing.is_some_and(|v| bad(v, 0.5, 10.0))
            || self.list.is_some_and(|l| l.level > 8)
        {
            return Err(DocError::Invalid("mise en forme du paragraphe".into()));
        }
        for r in &self.runs {
            if r.size_pt.is_some_and(|s| bad(s, 1.0, 1638.0)) {
                return Err(DocError::Invalid("taille de police".into()));
            }
            if r.color.as_deref().is_some_and(|c| model::hex_color(c).is_none()) {
                return Err(DocError::Invalid("couleur".into()));
            }
            if r.highlight.as_deref().is_some_and(|h| !HIGHLIGHTS.contains(&h)) {
                return Err(DocError::Invalid("surlignage".into()));
            }
            if r.link.as_deref().is_some_and(|l| !is_safe_link(l)) {
                return Err(DocError::Invalid("lien hypertexte non autorisé".into()));
            }
            if r.font.as_deref().is_some_and(|f| f.is_empty() || f.len() > 64 || f.chars().any(char::is_control)) {
                return Err(DocError::Invalid("police".into()));
            }
            if let Some(image) = &r.image {
                image.validate()?;
            }
        }
        Ok(())
    }
}
