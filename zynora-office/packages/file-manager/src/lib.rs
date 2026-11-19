//! Bibliothèque de documents de ZYNORA OFFICE.
//!
//! Un dossier racine (par défaut `Documents/ZYNORA`) contient les documents de l'utilisateur.
//! Toutes les opérations reçoivent des chemins **relatifs à cette racine**, résolus par
//! [`zynora_security::resolve_within`] : l'interface ne peut jamais désigner un fichier ailleurs.
//!
//! Garanties :
//! - rien n'est écrasé : un nom déjà pris est refusé (renommage) ou décliné en « nom (2) » (import) ;
//! - rien n'est supprimé sans passer par la corbeille interne (`.zynora/corbeille`) ;
//! - un import est copié puis **validé sur la copie** (pas de fenêtre entre contrôle et copie),
//!   et n'apparaît sous son nom définitif qu'une fois validé (renommage atomique) ;
//! - [`write_atomic`] remplace un fichier sans jamais laisser de version à moitié écrite.

use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Component, Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use zynora_security::archive::PackageKind;
use zynora_security::{ArchiveLimits, DetectedFormat, SecurityError, check_extension_matches, detect_format};

mod search;

/// Dossier interne de l'application dans la bibliothèque (corbeille, fichiers temporaires).
pub const INTERNAL_DIR: &str = ".zynora";
const TRASH_DIR: &str = "corbeille";
/// Taille maximale d'un document importé.
pub const MAX_IMPORT_BYTES: u64 = 512 * 1024 * 1024;

#[derive(Debug, thiserror::Error)]
pub enum FileError {
    #[error(transparent)]
    Security(#[from] SecurityError),
    #[error("« {0} » existe déjà à cet endroit")]
    AlreadyExists(String),
    #[error("élément introuvable")]
    NotFound,
    #[error("emplacement réservé à ZYNORA")]
    Reserved,
    #[error("l'extension du fichier ne peut pas être modifiée (.{0})")]
    ExtensionChange(String),
    #[error("fichier trop volumineux (maximum {} Mo)", MAX_IMPORT_BYTES / 1024 / 1024)]
    TooLarge,
    #[error("type de fichier non pris en charge")]
    Unsupported,
    #[error("ce document contient des macros : il n'est pas importé")]
    MacrosRefused,
    #[error("le contenu ne correspond pas à un document .{0} valide")]
    WrongPackage(String),
    #[error("opération sur le disque impossible : {0}")]
    Io(String),
}

impl From<io::Error> for FileError {
    fn from(error: io::Error) -> Self {
        match error.kind() {
            io::ErrorKind::NotFound => FileError::NotFound,
            io::ErrorKind::AlreadyExists => FileError::AlreadyExists(String::new()),
            _ => FileError::Io(error.kind().to_string()),
        }
    }
}

pub type Result<T> = std::result::Result<T, FileError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum EntryKind {
    Folder,
    Text,
    Spreadsheet,
    Presentation,
    Pdf,
}

impl EntryKind {
    pub fn as_str(self) -> &'static str {
        match self {
            EntryKind::Folder => "folder",
            EntryKind::Text => "text",
            EntryKind::Spreadsheet => "spreadsheet",
            EntryKind::Presentation => "presentation",
            EntryKind::Pdf => "pdf",
        }
    }
}

/// Extensions proposées dans le dialogue d'import.
pub const IMPORTABLE_EXTENSIONS: &[&str] = &["docx", "odt", "txt", "xlsx", "ods", "csv", "pptx", "odp", "pdf"];

/// Familles de documents reconnues par extension. Les formats à macros n'en font pas partie.
pub fn kind_for_extension(extension: &str) -> Option<EntryKind> {
    match extension.to_ascii_lowercase().as_str() {
        "docx" | "odt" | "txt" => Some(EntryKind::Text),
        "xlsx" | "ods" | "csv" => Some(EntryKind::Spreadsheet),
        "pptx" | "odp" => Some(EntryKind::Presentation),
        "pdf" => Some(EntryKind::Pdf),
        _ => None,
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Entry {
    /// Chemin relatif à la racine, séparateur `/` sur toutes les plateformes.
    pub path: String,
    pub name: String,
    pub kind: EntryKind,
    pub size: u64,
    pub modified_ms: i64,
}

/// Élément placé dans la corbeille. Les métadonnées sont conservées par l'appelant (base locale).
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct TrashedEntry {
    pub id: String,
    pub original_path: String,
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
}

pub struct Library {
    root: PathBuf,
}

impl Library {
    /// Ouvre (et crée au besoin) la bibliothèque.
    pub fn open(root: &Path) -> Result<Self> {
        fs::create_dir_all(root)?;
        Ok(Self { root: root.canonicalize()? })
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    /// Résout un chemin relatif reçu de l'interface. `""` désigne la racine.
    fn resolve(&self, relative: &str) -> Result<PathBuf> {
        let path = Path::new(relative);
        if path.components().any(|c| matches!(c, Component::Prefix(_) | Component::RootDir)) {
            return Err(SecurityError::PathEscapesRoot.into());
        }
        let resolved = zynora_security::resolve_within(&self.root, path)?;
        if resolved.starts_with(self.root.join(INTERNAL_DIR)) {
            return Err(FileError::Reserved);
        }
        Ok(resolved)
    }

    fn resolve_existing(&self, relative: &str) -> Result<PathBuf> {
        let path = self.resolve(relative)?;
        if path.symlink_metadata().is_err() {
            return Err(FileError::NotFound);
        }
        Ok(path)
    }

    fn relative(&self, absolute: &Path) -> String {
        let rel = absolute.strip_prefix(&self.root).unwrap_or(absolute);
        rel.components().map(|c| c.as_os_str().to_string_lossy()).collect::<Vec<_>>().join("/")
    }

    /// Décrit un élément, ou `None` s'il n'a pas à être montré (caché, type non pris en charge).
    fn describe(&self, path: &Path) -> Result<Option<Entry>> {
        let name = path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
        if name.starts_with('.') {
            return Ok(None);
        }
        // Les liens symboliques ne sont pas suivis dans la bibliothèque.
        let meta = fs::symlink_metadata(path)?;
        let kind = if meta.is_dir() {
            EntryKind::Folder
        } else if meta.is_file() {
            match extension_of(&name).and_then(kind_for_extension) {
                Some(kind) => kind,
                None => return Ok(None),
            }
        } else {
            return Ok(None);
        };
        let modified_ms = meta
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0);
        Ok(Some(Entry {
            path: self.relative(path),
            name,
            kind,
            size: if meta.is_file() { meta.len() } else { 0 },
            modified_ms,
        }))
    }

    pub fn entry(&self, relative: &str) -> Result<Entry> {
        self.describe(&self.resolve_existing(relative)?)?.ok_or(FileError::NotFound)
    }

    /// Contenu d'un dossier : dossiers d'abord, puis documents, par ordre alphabétique.
    pub fn list(&self, relative_dir: &str) -> Result<Vec<Entry>> {
        let dir = self.resolve_existing(relative_dir)?;
        let mut entries = Vec::new();
        for item in fs::read_dir(&dir)? {
            if let Some(entry) = self.describe(&item?.path())? {
                entries.push(entry);
            }
        }
        sort_entries(&mut entries);
        Ok(entries)
    }

    /// Recherche par nom, insensible à la casse et aux accents, dans toute la bibliothèque.
    pub fn search(&self, query: &str, limit: usize) -> Result<Vec<Entry>> {
        search::search(self, query, limit)
    }

    pub fn create_folder(&self, relative_dir: &str, name: &str) -> Result<Entry> {
        zynora_security::validate_file_name(name)?;
        reject_hidden(name)?;
        let parent = self.resolve_existing(relative_dir)?;
        let target = parent.join(name);
        fs::create_dir(&target).map_err(|e| already_exists(e, name))?;
        self.describe(&target)?.ok_or(FileError::NotFound)
    }

    /// Renomme sans jamais écraser ; l'extension d'un document ne change pas.
    pub fn rename(&self, relative: &str, new_name: &str) -> Result<Entry> {
        zynora_security::validate_file_name(new_name)?;
        reject_hidden(new_name)?;
        let source = self.resolve_existing(relative)?;
        if relative.is_empty() || source == self.root {
            return Err(FileError::Reserved);
        }
        if source.is_file() {
            let old = extension_of(&source.file_name().unwrap_or_default().to_string_lossy()).map(str::to_lowercase);
            let new = extension_of(new_name).map(str::to_lowercase);
            if old != new {
                return Err(FileError::ExtensionChange(old.unwrap_or_default()));
            }
        }
        let target = source.parent().ok_or(FileError::Reserved)?.join(new_name);
        // Sur un système insensible à la casse, « rapport » → « Rapport » désigne le même fichier :
        // seul ce cas est permis quand la cible existe déjà.
        let same_file = target.canonicalize().ok().as_deref() == Some(source.as_path());
        if target.symlink_metadata().is_ok() && !same_file {
            return Err(FileError::AlreadyExists(new_name.to_owned()));
        }
        fs::rename(&source, &target)?;
        self.describe(&target)?.ok_or(FileError::NotFound)
    }

    /// Importe un document : copie dans un fichier temporaire, validation de la copie,
    /// puis apparition sous un nom libre (« nom (2).docx » si nécessaire).
    pub fn import(&self, source: &Path, relative_dir: &str) -> Result<Entry> {
        let name = source.file_name().map(|n| n.to_string_lossy().into_owned()).ok_or(FileError::NotFound)?;
        zynora_security::validate_file_name(&name)?;
        let extension = extension_of(&name).map(str::to_lowercase).ok_or(FileError::Unsupported)?;
        kind_for_extension(&extension).ok_or(FileError::Unsupported)?;

        let meta = fs::metadata(source)?;
        if !meta.is_file() {
            return Err(FileError::Unsupported);
        }
        if meta.len() > MAX_IMPORT_BYTES {
            return Err(FileError::TooLarge);
        }

        let dir = self.resolve_existing(relative_dir)?;
        let temp = dir.join(temp_name(&name));
        let result = copy_capped(source, &temp).and_then(|()| validate_document(&temp, &extension));
        if let Err(error) = result {
            let _ = fs::remove_file(&temp);
            return Err(error);
        }
        let target = unique_destination(&dir, &name)?;
        if let Err(error) = fs::rename(&temp, &target) {
            let _ = fs::remove_file(&temp);
            return Err(error.into());
        }
        self.describe(&target)?.ok_or(FileError::NotFound)
    }

    /// Lit un document de la bibliothèque **et le revalide** : il a pu être déposé ou modifié
    /// par un autre logiciel depuis son import.
    pub fn read_document(&self, relative: &str) -> Result<(Vec<u8>, String)> {
        let path = self.resolve_existing(relative)?;
        let name = path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
        let extension = extension_of(&name).map(str::to_lowercase).ok_or(FileError::Unsupported)?;
        kind_for_extension(&extension).ok_or(FileError::Unsupported)?;
        let meta = fs::symlink_metadata(&path)?;
        if !meta.is_file() {
            return Err(FileError::Unsupported);
        }
        if meta.len() > MAX_IMPORT_BYTES {
            return Err(FileError::TooLarge);
        }
        let mut bytes = Vec::with_capacity(meta.len() as usize);
        File::open(&path)?.take(MAX_IMPORT_BYTES + 1).read_to_end(&mut bytes)?;
        if bytes.len() as u64 > MAX_IMPORT_BYTES {
            return Err(FileError::TooLarge);
        }
        validate_bytes(&bytes, &extension)?;
        Ok((bytes, extension))
    }

    /// Enregistre un document existant (remplacement atomique, jamais à moitié écrit).
    pub fn save_document(&self, relative: &str, bytes: &[u8]) -> Result<Entry> {
        let path = self.resolve_existing(relative)?;
        if !fs::symlink_metadata(&path)?.is_file() {
            return Err(FileError::Unsupported);
        }
        write_atomic(&path, bytes)?;
        self.describe(&path)?.ok_or(FileError::NotFound)
    }

    /// Crée un nouveau document sous un nom libre (« Classeur (2).xlsx »…).
    pub fn create_document(&self, relative_dir: &str, name: &str, bytes: &[u8]) -> Result<Entry> {
        zynora_security::validate_file_name(name)?;
        reject_hidden(name)?;
        let extension = extension_of(name).map(str::to_lowercase).ok_or(FileError::Unsupported)?;
        kind_for_extension(&extension).ok_or(FileError::Unsupported)?;
        let dir = self.resolve_existing(relative_dir)?;
        let target = unique_destination(&dir, name)?;
        // Nom libre réservé de façon atomique, puis contenu écrit de façon atomique.
        File::options().write(true).create_new(true).open(&target)?;
        if let Err(error) = write_atomic(&target, bytes) {
            let _ = fs::remove_file(&target);
            return Err(error);
        }
        self.describe(&target)?.ok_or(FileError::NotFound)
    }

    fn trash_root(&self) -> PathBuf {
        self.root.join(INTERNAL_DIR).join(TRASH_DIR)
    }

    /// Place un fichier ou un dossier dans la corbeille interne (aucune suppression).
    pub fn move_to_trash(&self, relative: &str) -> Result<TrashedEntry> {
        let source = self.resolve_existing(relative)?;
        if source == self.root {
            return Err(FileError::Reserved);
        }
        let meta = fs::symlink_metadata(&source)?;
        let name = source.file_name().map(|n| n.to_string_lossy().into_owned()).ok_or(FileError::Reserved)?;
        let id = new_id();
        let slot = self.trash_root().join(&id);
        fs::create_dir_all(&slot)?;
        fs::rename(&source, slot.join(&name))?;
        Ok(TrashedEntry {
            id,
            original_path: self.relative(&source),
            name,
            is_dir: meta.is_dir(),
            size: if meta.is_file() { meta.len() } else { 0 },
        })
    }

    /// Remet un élément à son emplacement d'origine (recréé si besoin), sous un nom libre.
    pub fn restore(&self, id: &str, original_path: &str) -> Result<Entry> {
        let slot = self.trash_slot(id)?;
        let original = Path::new(original_path);
        if original.components().any(|c| !matches!(c, Component::Normal(_))) || original_path.is_empty() {
            return Err(SecurityError::PathEscapesRoot.into());
        }
        let name = original.file_name().map(|n| n.to_string_lossy().into_owned()).ok_or(FileError::NotFound)?;
        let stored = slot.join(&name);
        if stored.symlink_metadata().is_err() {
            return Err(FileError::NotFound);
        }

        let parent_rel = original.parent().map(|p| p.to_string_lossy().into_owned()).unwrap_or_default();
        if !parent_rel.is_empty() {
            // Le dossier d'origine a pu être supprimé entre-temps : on le recrée dans la racine.
            let mut current = self.root.clone();
            for component in Path::new(&parent_rel).components() {
                current.push(component);
                let checked = zynora_security::resolve_within(&self.root, &current)?;
                if checked.starts_with(self.root.join(INTERNAL_DIR)) {
                    return Err(FileError::Reserved);
                }
                if !checked.is_dir() {
                    fs::create_dir(&checked)?;
                }
            }
        }
        let parent = self.resolve_existing(&parent_rel)?;
        let target = unique_destination(&parent, &name)?;
        fs::rename(&stored, &target)?;
        let _ = fs::remove_dir(&slot);
        self.describe(&target)?.ok_or(FileError::NotFound)
    }

    /// Supprime définitivement un élément de la corbeille (après confirmation de l'utilisateur).
    pub fn purge(&self, id: &str) -> Result<()> {
        let slot = self.trash_slot(id)?;
        match fs::remove_dir_all(&slot) {
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
            other => Ok(other?),
        }
    }

    fn trash_slot(&self, id: &str) -> Result<PathBuf> {
        if id.is_empty() || id.len() > 64 || !id.chars().all(|c| c.is_ascii_hexdigit() || c == '-') {
            return Err(SecurityError::PathEscapesRoot.into());
        }
        Ok(self.trash_root().join(id))
    }
}

fn sort_entries(entries: &mut [Entry]) {
    entries.sort_by(|a, b| {
        (a.kind != EntryKind::Folder)
            .cmp(&(b.kind != EntryKind::Folder))
            .then_with(|| search::fold(&a.name).cmp(&search::fold(&b.name)))
            .then_with(|| a.name.cmp(&b.name))
    });
}

fn extension_of(name: &str) -> Option<&str> {
    let (stem, ext) = name.rsplit_once('.')?;
    (!stem.is_empty() && !ext.is_empty()).then_some(ext)
}

fn reject_hidden(name: &str) -> Result<()> {
    if name.starts_with('.') {
        return Err(SecurityError::InvalidFileName("un nom ne peut pas commencer par un point".into()).into());
    }
    Ok(())
}

fn already_exists(error: io::Error, name: &str) -> FileError {
    if error.kind() == io::ErrorKind::AlreadyExists { FileError::AlreadyExists(name.to_owned()) } else { error.into() }
}

fn new_id() -> String {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0);
    format!("{nanos:x}-{:x}-{:x}", std::process::id(), COUNTER.fetch_add(1, Ordering::Relaxed))
}

fn temp_name(name: &str) -> String {
    format!(".{name}.{}.zynora-tmp", new_id())
}

/// Premier nom libre : « Rapport.docx », puis « Rapport (2).docx », « Rapport (3).docx »…
fn unique_destination(dir: &Path, name: &str) -> Result<PathBuf> {
    let candidate = dir.join(name);
    if candidate.symlink_metadata().is_err() {
        return Ok(candidate);
    }
    let (stem, ext) = match extension_of(name) {
        Some(ext) => (&name[..name.len() - ext.len() - 1], format!(".{ext}")),
        None => (name, String::new()),
    };
    for n in 2..10_000 {
        let candidate = dir.join(format!("{stem} ({n}){ext}"));
        if candidate.symlink_metadata().is_err() {
            return Ok(candidate);
        }
    }
    Err(FileError::AlreadyExists(name.to_owned()))
}

/// Copie au plus [`MAX_IMPORT_BYTES`] octets (le fichier source peut grossir pendant la copie).
fn copy_capped(source: &Path, dest: &Path) -> Result<()> {
    let mut input = File::open(source)?;
    let mut output = File::options().write(true).create_new(true).open(dest)?;
    let copied = io::copy(&mut (&mut input).take(MAX_IMPORT_BYTES + 1), &mut output)?;
    if copied > MAX_IMPORT_BYTES {
        return Err(FileError::TooLarge);
    }
    output.sync_all()?;
    Ok(())
}

/// Validation de sécurité d'un document : format réel, conteneur sain, paquet cohérent.
fn validate_document(path: &Path, extension: &str) -> Result<()> {
    validate_bytes(&fs::read(path)?, extension)
}

/// Validation de sécurité sur des octets déjà en mémoire (aucune relecture du disque).
pub fn validate_bytes(bytes: &[u8], extension: &str) -> Result<()> {
    let head = &bytes[..bytes.len().min(8192)];
    check_extension_matches(extension, head)?;
    if detect_format(head) != DetectedFormat::Zip {
        return Ok(());
    }
    let report = zynora_security::inspect_archive(io::Cursor::new(bytes), ArchiveLimits::default())?;
    if report.has_macros {
        return Err(FileError::MacrosRefused);
    }
    let expected_odf = match extension {
        "odt" => Some("application/vnd.oasis.opendocument.text"),
        "ods" => Some("application/vnd.oasis.opendocument.spreadsheet"),
        "odp" => Some("application/vnd.oasis.opendocument.presentation"),
        _ => None,
    };
    let coherent = match (&report.package, expected_odf) {
        (PackageKind::Ooxml, None) => true,
        (PackageKind::OpenDocument { mimetype }, Some(expected)) => mimetype == expected,
        _ => false,
    };
    if coherent { Ok(()) } else { Err(FileError::WrongPackage(extension.to_owned())) }
}

/// Remplace le contenu d'un fichier de façon atomique : écriture dans un fichier temporaire
/// du même dossier, synchronisation sur le disque, puis renommage. En cas de coupure, le fichier
/// contient soit l'ancienne version complète, soit la nouvelle — jamais un mélange.
pub fn write_atomic(path: &Path, bytes: &[u8]) -> Result<()> {
    let dir = path.parent().ok_or(FileError::NotFound)?;
    let name = path.file_name().map(|n| n.to_string_lossy().into_owned()).ok_or(FileError::NotFound)?;
    let temp = dir.join(temp_name(&name));
    let written = (|| -> io::Result<()> {
        let mut file = File::options().write(true).create_new(true).open(&temp)?;
        file.write_all(bytes)?;
        file.sync_all()
    })();
    if let Err(error) = written.and_then(|()| fs::rename(&temp, path)) {
        let _ = fs::remove_file(&temp);
        return Err(error.into());
    }
    #[cfg(unix)]
    if let Ok(dir) = File::open(dir) {
        let _ = dir.sync_all(); // rend le renommage durable
    }
    Ok(())
}

#[cfg(test)]
mod tests;
