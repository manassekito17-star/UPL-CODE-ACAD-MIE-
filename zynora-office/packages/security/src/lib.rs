//! Sécurité de ZYNORA OFFICE : tout fichier qui entre dans l'application passe par ici.
//!
//! - [`paths`] : noms de fichiers valides sur les trois systèmes et chemins confinés
//!   à un dossier racine (ni `..`, ni lien symbolique qui s'en échappe).
//! - [`format`] : détection du format réel d'après le contenu, pas d'après l'extension.
//! - [`archive`] : inspection des conteneurs ZIP (DOCX, XLSX, PPTX, ODT, ODS, ODP)
//!   contre les bombes de décompression, les chemins piégés, les DTD XML et les macros.

pub mod archive;
pub mod format;
pub mod paths;

pub use archive::{ArchiveLimits, ArchiveReport, inspect_archive};
pub use format::{DetectedFormat, DocumentKind, check_extension_matches, detect_format};
pub use paths::{resolve_within, validate_file_name};

/// Erreurs de sécurité. Les messages sont destinés à l'utilisateur (français).
#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum SecurityError {
    #[error("nom de fichier invalide : {0}")]
    InvalidFileName(String),
    #[error("chemin refusé : il sort du dossier autorisé")]
    PathEscapesRoot,
    #[error("chemin introuvable ou illisible")]
    PathUnavailable,
    #[error("le contenu du fichier ne correspond pas à son extension ({0})")]
    ExtensionMismatch(String),
    #[error("format de fichier non pris en charge")]
    UnsupportedFormat,
    #[error("archive refusée : {0}")]
    UnsafeArchive(String),
}

pub type Result<T> = std::result::Result<T, SecurityError>;
