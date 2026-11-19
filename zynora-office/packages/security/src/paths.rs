//! Noms de fichiers et chemins sûrs.

use std::path::{Component, Path, PathBuf};

use crate::{Result, SecurityError};

/// Noms réservés par Windows, interdits quelle que soit l'extension (`CON.txt` aussi).
const WINDOWS_RESERVED: &[&str] = &[
    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2",
    "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

const FORBIDDEN_CHARS: &[char] = &['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

/// Longueur maximale d'un nom de fichier, en octets UTF-8 (limite de ext4, APFS et NTFS).
pub const MAX_FILE_NAME_BYTES: usize = 255;

/// Vérifie qu'un nom de fichier (sans dossier) est valide sur Windows, macOS et Linux.
///
/// Un document enregistré sous Linux doit pouvoir être copié tel quel sur Windows :
/// on applique donc partout les règles les plus strictes.
pub fn validate_file_name(name: &str) -> Result<()> {
    let invalid = |why: &str| Err(SecurityError::InvalidFileName(why.to_owned()));
    if name.is_empty() || name.trim().is_empty() {
        return invalid("le nom est vide");
    }
    if name.len() > MAX_FILE_NAME_BYTES {
        return invalid("le nom est trop long");
    }
    if name == "." || name == ".." {
        return invalid("nom réservé");
    }
    if let Some(c) = name.chars().find(|c| FORBIDDEN_CHARS.contains(c) || c.is_control()) {
        let shown = if c.is_control() { "caractère de contrôle".to_owned() } else { format!("« {c} »") };
        return Err(SecurityError::InvalidFileName(format!("caractère interdit : {shown}")));
    }
    if name.ends_with('.') || name.ends_with(' ') {
        return invalid("le nom ne doit pas finir par un point ou une espace");
    }
    let stem = name.split('.').next().unwrap_or_default().trim_end();
    if WINDOWS_RESERVED.iter().any(|r| r.eq_ignore_ascii_case(stem)) {
        return invalid("nom réservé par Windows");
    }
    Ok(())
}

/// Résout `candidate` (relatif à `root`, ou absolu) et garantit que le résultat reste
/// dans `root`, même en présence de `..` ou de liens symboliques.
///
/// La cible peut ne pas exister encore (enregistrement d'un nouveau fichier) : son dossier
/// parent, lui, doit exister. Le chemin renvoyé est canonique.
pub fn resolve_within(root: &Path, candidate: &Path) -> Result<PathBuf> {
    let root = root.canonicalize().map_err(|_| SecurityError::PathUnavailable)?;
    let joined = if candidate.is_absolute() { candidate.to_path_buf() } else { root.join(candidate) };

    // Normalisation lexicale d'abord : `..` au-delà de la racine du système est refusé.
    let mut normalized = PathBuf::new();
    for component in joined.components() {
        match component {
            Component::ParentDir => {
                if !normalized.pop() {
                    return Err(SecurityError::PathEscapesRoot);
                }
            }
            Component::CurDir => {}
            other => normalized.push(other.as_os_str()),
        }
    }

    // Confinement d'abord, existence ensuite. Le plus long ancêtre présent sur le disque est
    // rendu canonique (liens symboliques résolus), puis on lui rattache la partie absente, qui
    // ne contient plus de `..`. Un lien symbolique cassé compte comme présent : sa résolution
    // échoue au lieu de laisser écrire à travers lui.
    let mut present = normalized.as_path();
    let mut absent = Vec::new();
    while present.symlink_metadata().is_err() {
        absent.push(present.file_name().ok_or(SecurityError::PathEscapesRoot)?);
        present = present.parent().ok_or(SecurityError::PathEscapesRoot)?;
    }
    let mut resolved = present.canonicalize().map_err(|_| SecurityError::PathUnavailable)?;
    for part in absent.iter().rev() {
        resolved.push(part);
    }
    if !resolved.starts_with(&root) {
        return Err(SecurityError::PathEscapesRoot);
    }

    match absent.as_slice() {
        [] => Ok(resolved),
        [name] => {
            validate_file_name(&name.to_string_lossy())?;
            Ok(resolved)
        }
        _ => Err(SecurityError::PathUnavailable),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepte_les_noms_ordinaires() {
        for ok in ["Rapport annuel 2026.docx", "budget.xlsx", "Présentation – été.pptx", ".notes", "a"] {
            assert_eq!(validate_file_name(ok), Ok(()), "{ok}");
        }
    }

    #[test]
    fn refuse_les_noms_dangereux_ou_non_portables() {
        for bad in [
            "",
            "   ",
            ".",
            "..",
            "a/b",
            "a\\b",
            "x:y",
            "q?",
            "étoile*",
            "tab\tname",
            "fin.",
            "fin ",
            "CON",
            "con.txt",
            "Lpt1.docx",
            "NUL ",
            "nul.tar.gz",
        ] {
            assert!(validate_file_name(bad).is_err(), "{bad:?} aurait dû être refusé");
        }
        assert!(validate_file_name(&"a".repeat(256)).is_err());
        assert!(validate_file_name(&"é".repeat(128)).is_err(), "la limite se compte en octets");
    }

    #[test]
    fn confine_les_chemins_a_la_racine() {
        let dir = tempfile::tempdir().expect("dossier temporaire");
        let root = dir.path();
        std::fs::create_dir(root.join("docs")).expect("mkdir");
        std::fs::write(root.join("docs/a.txt"), "x").expect("write");

        let ok = resolve_within(root, Path::new("docs/a.txt")).expect("chemin interne");
        assert!(ok.ends_with("docs/a.txt"));
        // Fichier pas encore créé : accepté si le dossier parent existe.
        assert!(resolve_within(root, Path::new("docs/nouveau.docx")).is_ok());
        assert!(resolve_within(root, Path::new("docs/../docs/./a.txt")).is_ok());

        assert_eq!(resolve_within(root, Path::new("../x")), Err(SecurityError::PathEscapesRoot));
        assert_eq!(resolve_within(root, Path::new("docs/../../x")), Err(SecurityError::PathEscapesRoot));
        assert_eq!(resolve_within(root, Path::new("/etc/passwd")), Err(SecurityError::PathEscapesRoot));
        assert_eq!(resolve_within(root, Path::new("absent/x.txt")), Err(SecurityError::PathUnavailable));
        assert!(matches!(resolve_within(root, Path::new("docs/CON.txt")), Err(SecurityError::InvalidFileName(_))));
    }

    #[cfg(unix)]
    #[test]
    fn refuse_un_lien_symbolique_qui_sort_de_la_racine() {
        let outside = tempfile::tempdir().expect("dossier externe");
        std::fs::write(outside.path().join("secret.txt"), "s").expect("write");
        let dir = tempfile::tempdir().expect("racine");
        std::os::unix::fs::symlink(outside.path(), dir.path().join("lien")).expect("symlink");
        assert_eq!(resolve_within(dir.path(), Path::new("lien/secret.txt")), Err(SecurityError::PathEscapesRoot));
        // Fichier encore absent derrière le lien : refusé aussi (confinement avant existence).
        assert_eq!(resolve_within(dir.path(), Path::new("lien/nouveau.docx")), Err(SecurityError::PathEscapesRoot));
    }

    #[cfg(unix)]
    #[test]
    fn refuse_d_ecrire_a_travers_un_lien_symbolique_casse() {
        let outside = tempfile::tempdir().expect("dossier externe");
        let dir = tempfile::tempdir().expect("racine");
        std::os::unix::fs::symlink(outside.path().join("cible-absente.docx"), dir.path().join("piege.docx"))
            .expect("symlink");
        assert!(resolve_within(dir.path(), Path::new("piege.docx")).is_err());
    }
}
