//! Inspection des archives ZIP avant toute lecture par un moteur documentaire.
//!
//! Les tailles déclarées dans l'en-tête d'une archive peuvent mentir : chaque entrée est
//! réellement décompressée (vers un compteur, sans rien garder en mémoire) et la lecture
//! s'arrête dès qu'une limite est dépassée.

use std::collections::HashSet;
use std::io::{self, Read, Seek};

use serde::Serialize;
use zip::ZipArchive;

use crate::{Result, SecurityError};

/// Limites appliquées à une archive importée.
#[derive(Debug, Clone, Copy)]
pub struct ArchiveLimits {
    pub max_entries: usize,
    pub max_entry_bytes: u64,
    pub max_total_bytes: u64,
    /// Taux de compression maximal toléré pour une entrée de plus de `ratio_threshold_bytes`.
    pub max_ratio: u64,
    pub ratio_threshold_bytes: u64,
}

impl Default for ArchiveLimits {
    fn default() -> Self {
        Self {
            max_entries: 10_000,
            max_entry_bytes: 512 * 1024 * 1024,
            max_total_bytes: 1024 * 1024 * 1024,
            // Le XML très répétitif d'une feuille de calcul se compresse fortement ;
            // au-delà de 1000:1 sur plus de 10 Mo, c'est une bombe de décompression.
            max_ratio: 1000,
            ratio_threshold_bytes: 10 * 1024 * 1024,
        }
    }
}

/// Famille de paquet reconnue dans l'archive.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PackageKind {
    /// Office Open XML (présence de `[Content_Types].xml`).
    Ooxml,
    /// OpenDocument, avec le type MIME lu dans l'entrée `mimetype`.
    OpenDocument {
        mimetype: String,
    },
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ArchiveReport {
    pub entries: usize,
    pub total_uncompressed_bytes: u64,
    pub package: PackageKind,
    /// Projet de macros présent (VBA ou Basic). Les macros ne sont **jamais** exécutées.
    pub has_macros: bool,
}

fn refuse<T>(why: impl Into<String>) -> Result<T> {
    Err(SecurityError::UnsafeArchive(why.into()))
}

/// Inspecte une archive et renvoie son rapport, ou une erreur si elle est dangereuse.
pub fn inspect_archive<R: Read + Seek>(reader: R, limits: ArchiveLimits) -> Result<ArchiveReport> {
    let mut archive = ZipArchive::new(reader).or_else(|_| refuse("ce n'est pas une archive ZIP valide"))?;
    if archive.len() > limits.max_entries {
        return refuse(format!("trop d'entrées ({})", archive.len()));
    }

    let mut seen = HashSet::new();
    let mut total: u64 = 0;
    let mut has_content_types = false;
    let mut odf_mimetype = None;
    let mut has_macros = false;

    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .or_else(|_| refuse("entrée illisible, chiffrée ou compressée avec une méthode non prise en charge"))?;
        let name =
            entry.name().map(|n| n.into_owned()).or_else(|_| refuse("nom d'entrée illisible (encodage invalide)"))?;

        // `enclosed_name` retire silencieusement un « / » initial : les chemins absolus
        // (y compris « C:… » de Windows) sont donc refusés explicitement.
        let absolute = name.starts_with('/') || name.as_bytes().get(1) == Some(&b':');
        if absolute || entry.enclosed_name().is_none() || name.contains('\\') || name.contains('\0') {
            return refuse(format!("chemin d'entrée dangereux : {name:?}"));
        }
        if !seen.insert(name.to_lowercase()) {
            return refuse(format!("entrée en double : {name:?}"));
        }
        if entry.is_dir() {
            continue;
        }

        let lower = name.to_lowercase();
        has_macros |= lower.ends_with("vbaproject.bin") || lower.starts_with("basic/") || lower.starts_with("scripts/");
        has_content_types |= name == "[Content_Types].xml";

        // Lecture réelle, bornée : on ne fait jamais confiance à la taille déclarée.
        let entry_cap = limits.max_entry_bytes.min(limits.max_total_bytes - total);
        let mut head = Vec::with_capacity(4096);
        (&mut entry).take(4096).read_to_end(&mut head).or_else(|_| refuse(format!("entrée corrompue : {name:?}")))?;
        let rest = io::copy(&mut (&mut entry).take(entry_cap.saturating_sub(head.len() as u64) + 1), &mut io::sink())
            .or_else(|_| refuse(format!("entrée corrompue : {name:?}")))?;
        let actual = head.len() as u64 + rest;

        if actual > entry_cap {
            return refuse(if actual > limits.max_entry_bytes {
                format!("entrée trop volumineuse une fois décompressée : {name:?}")
            } else {
                "contenu décompressé trop volumineux".to_owned()
            });
        }
        let compressed = entry.compressed_size().max(1);
        if actual > limits.ratio_threshold_bytes && actual / compressed > limits.max_ratio {
            return refuse(format!("taux de compression anormal (bombe de décompression) : {name:?}"));
        }
        total += actual;

        if (lower.ends_with(".xml") || lower.ends_with(".rels")) && contains_doctype(&head) {
            return refuse(format!("déclaration DTD interdite dans {name:?}"));
        }
        if name == "mimetype" {
            odf_mimetype = std::str::from_utf8(&head).ok().map(|s| s.trim().to_owned());
        }
    }

    let package = match (has_content_types, odf_mimetype) {
        (true, _) => PackageKind::Ooxml,
        (false, Some(m)) if m.starts_with("application/vnd.oasis.opendocument.") => {
            PackageKind::OpenDocument { mimetype: m }
        }
        _ => PackageKind::Unknown,
    };
    Ok(ArchiveReport { entries: archive.len(), total_uncompressed_bytes: total, package, has_macros })
}

/// Les formats OOXML et ODF n'utilisent jamais de DTD : leur présence signale une
/// tentative d'entité externe (XXE) ou d'expansion d'entités (« billion laughs »).
fn contains_doctype(head: &[u8]) -> bool {
    const NEEDLE: &[u8] = b"<!doctype";
    head.windows(NEEDLE.len()).any(|w| w.eq_ignore_ascii_case(NEEDLE))
        || head.windows(8).any(|w| w.eq_ignore_ascii_case(b"<!entity"))
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use zip::CompressionMethod;
    use zip::write::{SimpleFileOptions, ZipWriter};

    use super::*;

    fn build(entries: &[(&str, &[u8])]) -> Cursor<Vec<u8>> {
        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);
        for (name, data) in entries {
            if name.ends_with('/') {
                writer.add_directory(*name, options).expect("dossier");
            } else {
                writer.start_file(*name, options).expect("entrée");
                std::io::Write::write_all(&mut writer, data).expect("écriture");
            }
        }
        let mut cursor = writer.finish().expect("archive");
        cursor.set_position(0);
        cursor
    }

    fn reason(result: Result<ArchiveReport>) -> String {
        match result {
            Err(SecurityError::UnsafeArchive(why)) => why,
            other => panic!("archive acceptée à tort : {other:?}"),
        }
    }

    #[test]
    fn accepte_un_paquet_ooxml_minimal() {
        let report = inspect_archive(
            build(&[
                ("[Content_Types].xml", b"<?xml version=\"1.0\"?><Types/>"),
                ("_rels/.rels", b"<Relationships/>"),
                ("word/", b""),
                ("word/document.xml", b"<w:document/>"),
            ]),
            ArchiveLimits::default(),
        )
        .expect("paquet valide");
        assert_eq!(report.package, PackageKind::Ooxml);
        assert_eq!(report.entries, 4);
        assert!(!report.has_macros);
        assert_eq!(report.total_uncompressed_bytes, 29 + 16 + 13);
    }

    #[test]
    fn reconnait_opendocument_et_les_macros() {
        let report = inspect_archive(
            build(&[
                ("mimetype", b"application/vnd.oasis.opendocument.spreadsheet"),
                ("content.xml", b"<office:document-content/>"),
                ("Basic/Standard/Module1.xml", b"<script/>"),
            ]),
            ArchiveLimits::default(),
        )
        .expect("paquet valide");
        assert_eq!(
            report.package,
            PackageKind::OpenDocument { mimetype: "application/vnd.oasis.opendocument.spreadsheet".into() }
        );
        assert!(report.has_macros);

        let vba = inspect_archive(
            build(&[("[Content_Types].xml", b"<Types/>"), ("xl/vbaProject.bin", b"\x00\x01")]),
            ArchiveLimits::default(),
        )
        .expect("paquet valide");
        assert!(vba.has_macros);
    }

    #[test]
    fn refuse_les_chemins_pieges_et_les_doublons() {
        assert!(
            reason(inspect_archive(build(&[("../evil.xml", b"x")]), ArchiveLimits::default())).contains("dangereux")
        );
        assert!(
            reason(inspect_archive(build(&[("/etc/cron.d/x", b"x")]), ArchiveLimits::default())).contains("dangereux")
        );
        assert!(
            reason(inspect_archive(build(&[("word\\..\\x", b"x")]), ArchiveLimits::default())).contains("dangereux")
        );
        assert!(
            reason(inspect_archive(build(&[("C:/Windows/x", b"x")]), ArchiveLimits::default())).contains("dangereux")
        );
        assert!(
            reason(inspect_archive(build(&[("a.xml", b"1"), ("A.xml", b"2")]), ArchiveLimits::default()))
                .contains("double")
        );
    }

    #[test]
    fn refuse_les_dtd_xml() {
        let xxe = b"<?xml version=\"1.0\"?><!DOCTYPE r [<!ENTITY x SYSTEM \"file:///etc/passwd\">]><r>&x;</r>";
        assert!(
            reason(inspect_archive(build(&[("word/document.xml", xxe)]), ArchiveLimits::default())).contains("DTD")
        );
        let rels = b"<!doctype x><Relationships/>";
        assert!(reason(inspect_archive(build(&[("_rels/.rels", rels)]), ArchiveLimits::default())).contains("DTD"));
        // Une image peut contenir n'importe quels octets : seule la structure XML est contrôlée.
        assert!(inspect_archive(build(&[("media/a.png", b"<!DOCTYPE")]), ArchiveLimits::default()).is_ok());
    }

    #[test]
    fn refuse_les_bombes_de_decompression() {
        let zeros = vec![0u8; 2 * 1024 * 1024];
        let limits = ArchiveLimits { max_ratio: 100, ratio_threshold_bytes: 1024 * 1024, ..ArchiveLimits::default() };
        assert!(reason(inspect_archive(build(&[("sheet.xml", &zeros)]), limits)).contains("bombe"));

        let small = ArchiveLimits { max_entry_bytes: 1024, ..ArchiveLimits::default() };
        assert!(reason(inspect_archive(build(&[("big.xml", &zeros)]), small)).contains("trop volumineuse"));

        let total = ArchiveLimits { max_total_bytes: 1500, ..ArchiveLimits::default() };
        let kilo = vec![b'a'; 1000];
        assert!(reason(inspect_archive(build(&[("a.xml", &kilo), ("b.xml", &kilo)]), total)).contains("volumineux"));

        let few = ArchiveLimits { max_entries: 2, ..ArchiveLimits::default() };
        assert!(reason(inspect_archive(build(&[("a", b""), ("b", b""), ("c", b"")]), few)).contains("trop d'entrées"));
    }

    #[test]
    fn refuse_ce_qui_n_est_pas_une_archive() {
        assert!(reason(inspect_archive(Cursor::new(b"%PDF-1.7".to_vec()), ArchiveLimits::default())).contains("ZIP"));
    }
}
