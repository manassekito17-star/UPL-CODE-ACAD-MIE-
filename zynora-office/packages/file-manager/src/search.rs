//! Recherche de documents par nom.

use std::collections::VecDeque;
use std::fs;

use crate::{Entry, INTERNAL_DIR, Library, Result, sort_entries};

/// Profondeur et nombre d'éléments parcourus bornés : une bibliothèque immense ou un dossier
/// piégé ne peut pas bloquer l'application.
const MAX_DEPTH: usize = 16;
const MAX_VISITED: usize = 50_000;

/// Minuscules sans accents, pour que « ete » trouve « Été ».
pub(crate) fn fold(text: &str) -> String {
    text.chars()
        .flat_map(char::to_lowercase)
        .map(|c| match c {
            'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' => 'a',
            'ç' => 'c',
            'è' | 'é' | 'ê' | 'ë' => 'e',
            'ì' | 'í' | 'î' | 'ï' => 'i',
            'ñ' => 'n',
            'ò' | 'ó' | 'ô' | 'õ' | 'ö' => 'o',
            'ù' | 'ú' | 'û' | 'ü' => 'u',
            'ý' | 'ÿ' => 'y',
            'œ' => 'o',
            'æ' => 'a',
            other => other,
        })
        .collect()
}

pub(crate) fn search(library: &Library, query: &str, limit: usize) -> Result<Vec<Entry>> {
    let needle = fold(query.trim());
    if needle.is_empty() {
        return Ok(Vec::new());
    }
    let mut found = Vec::new();
    let mut visited = 0;
    let mut queue = VecDeque::from([(library.root().to_path_buf(), 0usize)]);

    while let Some((dir, depth)) = queue.pop_front() {
        let Ok(items) = fs::read_dir(&dir) else { continue };
        for item in items.flatten() {
            visited += 1;
            if visited > MAX_VISITED {
                sort_entries(&mut found);
                return Ok(found);
            }
            let path = item.path();
            if depth == 0 && item.file_name() == INTERNAL_DIR {
                continue;
            }
            let Ok(Some(entry)) = library.describe(&path) else { continue };
            if entry.kind == crate::EntryKind::Folder && depth + 1 < MAX_DEPTH {
                queue.push_back((path, depth + 1));
            }
            if fold(&entry.name).contains(&needle) {
                found.push(entry);
                if found.len() >= limit {
                    sort_entries(&mut found);
                    return Ok(found);
                }
            }
        }
    }
    sort_entries(&mut found);
    Ok(found)
}
