//! Images des documents : validation des octets reçus (fichier choisi, contenu d'un DOCX),
//! dimensions, conversion en PNG pour l'écriture. Toujours décodées avec des limites.

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde::{Deserialize, Serialize};

use crate::DocError;

/// Taille maximale d'un fichier image accepté.
pub const MAX_IMAGE_BYTES: usize = 32 * 1024 * 1024;
/// Dimension maximale (pixels) d'une image décodée.
pub const MAX_IMAGE_PIXELS_SIDE: u32 = 16_384;
/// Résolution de référence pour la taille par défaut d'une image insérée.
const DEFAULT_DPI: f64 = 96.0;
pub(crate) const EMU_PER_MM: f64 = 36_000.0;

/// Image placée dans le texte. Les octets voyagent en base64 dans le JSON de l'interface.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImageData {
    /// « image/png », « image/jpeg » ou « image/gif ».
    pub mime: String,
    /// Octets de l'image, en base64.
    pub data: String,
    pub width_mm: f64,
    pub height_mm: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Kind {
    Png,
    Jpeg,
    Gif,
}

impl Kind {
    pub(crate) fn sniff(bytes: &[u8]) -> Option<Self> {
        if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
            Some(Self::Png)
        } else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
            Some(Self::Jpeg)
        } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
            Some(Self::Gif)
        } else {
            None
        }
    }

    pub(crate) fn mime(self) -> &'static str {
        match self {
            Self::Png => "image/png",
            Self::Jpeg => "image/jpeg",
            Self::Gif => "image/gif",
        }
    }

    fn format(self) -> image::ImageFormat {
        match self {
            Self::Png => image::ImageFormat::Png,
            Self::Jpeg => image::ImageFormat::Jpeg,
            Self::Gif => image::ImageFormat::Gif,
        }
    }
}

fn limits() -> image::Limits {
    let mut limits = image::Limits::default();
    limits.max_image_width = Some(MAX_IMAGE_PIXELS_SIDE);
    limits.max_image_height = Some(MAX_IMAGE_PIXELS_SIDE);
    limits.max_alloc = Some(512 * 1024 * 1024);
    limits
}

fn reader(bytes: &[u8], kind: Kind) -> image::ImageReader<std::io::Cursor<&[u8]>> {
    let mut reader = image::ImageReader::with_format(std::io::Cursor::new(bytes), kind.format());
    reader.limits(limits());
    reader
}

/// Vérifie le format réel et lit les dimensions (sans décoder toute l'image).
pub(crate) fn inspect(bytes: &[u8]) -> Result<(Kind, u32, u32), DocError> {
    if bytes.len() > MAX_IMAGE_BYTES {
        return Err(DocError::Invalid("image trop volumineuse (32 Mo au plus)".into()));
    }
    let kind = Kind::sniff(bytes)
        .ok_or_else(|| DocError::Invalid("format d'image non pris en charge (PNG, JPEG ou GIF)".into()))?;
    let (w, h) =
        reader(bytes, kind).into_dimensions().map_err(|_| DocError::Invalid("image illisible ou endommagée".into()))?;
    if w == 0 || h == 0 || w > MAX_IMAGE_PIXELS_SIDE || h > MAX_IMAGE_PIXELS_SIDE {
        return Err(DocError::Invalid("dimensions d'image non prises en charge".into()));
    }
    Ok((kind, w, h))
}

/// Prépare une image choisie par l'utilisateur : format vérifié, taille par défaut (96 ppp)
/// ramenée à `max_width_mm` en conservant les proportions.
pub fn prepare_image(bytes: &[u8], max_width_mm: f64) -> Result<ImageData, DocError> {
    let (kind, w, h) = inspect(bytes)?;
    let mut width = f64::from(w) * 25.4 / DEFAULT_DPI;
    let mut height = f64::from(h) * 25.4 / DEFAULT_DPI;
    if max_width_mm.is_finite() && max_width_mm > 1.0 && width > max_width_mm {
        height *= max_width_mm / width;
        width = max_width_mm;
    }
    Ok(ImageData {
        mime: kind.mime().into(),
        data: STANDARD.encode(bytes),
        width_mm: round(width),
        height_mm: round(height.max(1.0)),
    })
}

pub(crate) fn round(mm: f64) -> f64 {
    (mm * 10.0).round() / 10.0
}

impl ImageData {
    pub(crate) fn bytes(&self) -> Result<Vec<u8>, DocError> {
        STANDARD.decode(self.data.as_bytes()).map_err(|_| DocError::Invalid("image mal encodée".into()))
    }

    pub(crate) fn validate(&self) -> Result<(), DocError> {
        let bad = |v: f64| !v.is_finite() || !(1.0..=2000.0).contains(&v);
        if bad(self.width_mm) || bad(self.height_mm) {
            return Err(DocError::Invalid("taille d'image".into()));
        }
        // Limite avant décodage du base64 (4 caractères pour 3 octets).
        if self.data.len() > MAX_IMAGE_BYTES / 3 * 4 + 4 {
            return Err(DocError::Invalid("image trop volumineuse (32 Mo au plus)".into()));
        }
        let (kind, _, _) = inspect(&self.bytes()?)?;
        if kind.mime() != self.mime {
            return Err(DocError::Invalid("type d'image incohérent".into()));
        }
        Ok(())
    }

    /// Octets PNG (le format écrit dans le DOCX) et dimensions en pixels.
    pub(crate) fn to_png(&self) -> Result<(Vec<u8>, u32, u32), DocError> {
        let bytes = self.bytes()?;
        let (kind, w, h) = inspect(&bytes)?;
        if kind == Kind::Png {
            return Ok((bytes, w, h));
        }
        let decoded =
            reader(&bytes, kind).decode().map_err(|_| DocError::Invalid("image illisible ou endommagée".into()))?;
        let mut out = std::io::Cursor::new(Vec::new());
        decoded.write_to(&mut out, image::ImageFormat::Png).map_err(|e| DocError::Write(e.to_string()))?;
        Ok((out.into_inner(), w, h))
    }
}

/// Image lue dans un DOCX : l'original s'il est affichable, sinon l'aperçu PNG fourni par
/// docx-rs (BMP, TIFF…). `None` pour les formats vectoriels (EMF, WMF).
pub(crate) fn from_docx_media(original: &[u8], preview_png: &[u8], width_mm: f64, height_mm: f64) -> Option<ImageData> {
    let bytes = if Kind::sniff(original).is_some() && inspect(original).is_ok() {
        original
    } else if !preview_png.is_empty() && inspect(preview_png).is_ok() {
        preview_png
    } else {
        return None;
    };
    let kind = Kind::sniff(bytes)?;
    Some(ImageData {
        mime: kind.mime().into(),
        data: STANDARD.encode(bytes),
        width_mm: round(width_mm.clamp(1.0, 2000.0)),
        height_mm: round(height_mm.clamp(1.0, 2000.0)),
    })
}
