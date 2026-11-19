//! Détection du format réel d'un fichier d'après ses premiers octets.

use serde::Serialize;

use crate::{Result, SecurityError};

/// Conteneur physique reconnu dans l'en-tête du fichier.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DetectedFormat {
    /// Archive ZIP : OOXML (DOCX, XLSX, PPTX) ou OpenDocument (ODT, ODS, ODP).
    Zip,
    /// Conteneur OLE/CFB : anciens DOC/XLS/PPT, ou fichier Office **chiffré**.
    Ole,
    Pdf,
    /// Texte UTF-8 valide (TXT, CSV).
    Text,
    Unknown,
}

/// Famille de document attendue d'après l'extension.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DocumentKind {
    Text,
    Spreadsheet,
    Presentation,
    Pdf,
}

/// Détecte le conteneur à partir des premiers octets (quelques kilo-octets suffisent).
pub fn detect_format(head: &[u8]) -> DetectedFormat {
    if head.starts_with(b"PK\x03\x04") || head.starts_with(b"PK\x05\x06") {
        DetectedFormat::Zip
    } else if head.starts_with(&[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]) {
        DetectedFormat::Ole
    } else if head.starts_with(b"%PDF-") {
        DetectedFormat::Pdf
    } else if looks_like_text(head) {
        DetectedFormat::Text
    } else {
        DetectedFormat::Unknown
    }
}

fn looks_like_text(head: &[u8]) -> bool {
    let body = head.strip_prefix(&[0xEF, 0xBB, 0xBF]).unwrap_or(head);
    if body.contains(&0) {
        return false;
    }
    match std::str::from_utf8(body) {
        Ok(_) => true,
        // L'échantillon peut couper un caractère multi-octets en fin de tampon.
        Err(e) => e.error_len().is_none() && body.len() - e.valid_up_to() < 4,
    }
}

/// Vérifie que le contenu correspond à l'extension et renvoie la famille de document.
///
/// Un `.docx` qui n'est pas une archive ZIP est refusé ; un `.docx` au format OLE est
/// signalé à part, car c'est le cas des documents Office protégés par mot de passe.
pub fn check_extension_matches(extension: &str, head: &[u8]) -> Result<DocumentKind> {
    let ext = extension.trim_start_matches('.').to_ascii_lowercase();
    let (expected, kind) = match ext.as_str() {
        "docx" | "odt" => (DetectedFormat::Zip, DocumentKind::Text),
        "xlsx" | "ods" => (DetectedFormat::Zip, DocumentKind::Spreadsheet),
        "pptx" | "odp" => (DetectedFormat::Zip, DocumentKind::Presentation),
        "txt" => (DetectedFormat::Text, DocumentKind::Text),
        "csv" => (DetectedFormat::Text, DocumentKind::Spreadsheet),
        "pdf" => (DetectedFormat::Pdf, DocumentKind::Pdf),
        _ => return Err(SecurityError::UnsupportedFormat),
    };
    let actual = detect_format(head);
    if actual == expected || (expected == DetectedFormat::Text && head.is_empty()) {
        return Ok(kind);
    }
    if expected == DetectedFormat::Zip && actual == DetectedFormat::Ole {
        return Err(SecurityError::ExtensionMismatch(
            "document chiffré ou ancien format Office (OLE), non pris en charge".into(),
        ));
    }
    Err(SecurityError::ExtensionMismatch(format!(".{ext}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reconnait_les_conteneurs() {
        assert_eq!(detect_format(b"PK\x03\x04rest"), DetectedFormat::Zip);
        assert_eq!(detect_format(&[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0]), DetectedFormat::Ole);
        assert_eq!(detect_format(b"%PDF-1.7\n"), DetectedFormat::Pdf);
        assert_eq!(detect_format("Nom;Âge\nÉlodie;31\n".as_bytes()), DetectedFormat::Text);
        assert_eq!(detect_format(&[0xEF, 0xBB, 0xBF, b'a']), DetectedFormat::Text);
        assert_eq!(detect_format(&[0x7F, b'E', b'L', b'F', 0, 1]), DetectedFormat::Unknown);
        // Un « é » coupé en fin d'échantillon reste du texte.
        assert_eq!(detect_format(&[b'a', 0xC3]), DetectedFormat::Text);
    }

    #[test]
    fn verifie_la_coherence_extension_contenu() {
        assert_eq!(check_extension_matches("DOCX", b"PK\x03\x04"), Ok(DocumentKind::Text));
        assert_eq!(check_extension_matches(".ods", b"PK\x03\x04"), Ok(DocumentKind::Spreadsheet));
        assert_eq!(check_extension_matches("csv", b"a,b\n1,2"), Ok(DocumentKind::Spreadsheet));
        assert_eq!(check_extension_matches("txt", b""), Ok(DocumentKind::Text));
        assert!(matches!(check_extension_matches("docx", b"%PDF-1.4"), Err(SecurityError::ExtensionMismatch(_))));
        assert!(matches!(
            check_extension_matches("xlsx", &[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
            Err(SecurityError::ExtensionMismatch(m)) if m.contains("chiffré")
        ));
        assert_eq!(check_extension_matches("exe", b"MZ"), Err(SecurityError::UnsupportedFormat));
        assert_eq!(check_extension_matches("docm", b"PK\x03\x04"), Err(SecurityError::UnsupportedFormat));
    }
}
