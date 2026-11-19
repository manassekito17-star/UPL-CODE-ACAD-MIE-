//! CSV : lecture tolérante (RFC 4180, séparateur détecté) et écriture protégée.

use crate::{Result, SheetError};

/// Nombre maximal de cellules importées depuis un CSV.
pub const MAX_CSV_CELLS: usize = 2_000_000;

/// Détecte le séparateur sur la première ligne : `;`, `,` ou tabulation.
fn detect_delimiter(text: &str) -> char {
    let first = text.lines().next().unwrap_or_default();
    [';', '\t', ',']
        .into_iter()
        .max_by_key(|d| (first.matches(*d).count(), matches!(d, ';')))
        .filter(|d| first.contains(*d))
        .unwrap_or(',')
}

pub fn parse(text: &str) -> Result<Vec<Vec<String>>> {
    let text = text.strip_prefix('\u{feff}').unwrap_or(text);
    let delimiter = detect_delimiter(text);
    let mut rows = Vec::new();
    let mut row = Vec::new();
    let mut field = String::new();
    let mut in_quotes = false;
    let mut cells = 0usize;
    let mut chars = text.chars().peekable();

    let mut end_field = |row: &mut Vec<String>, field: &mut String| -> Result<()> {
        cells += 1;
        if cells > MAX_CSV_CELLS {
            return Err(SheetError::CsvTooLarge(MAX_CSV_CELLS));
        }
        row.push(std::mem::take(field));
        Ok(())
    };

    while let Some(c) = chars.next() {
        if in_quotes {
            match c {
                '"' if chars.peek() == Some(&'"') => {
                    chars.next();
                    field.push('"');
                }
                '"' => in_quotes = false,
                other => field.push(other),
            }
            continue;
        }
        match c {
            '"' if field.is_empty() => in_quotes = true,
            '\r' => {}
            '\n' => {
                end_field(&mut row, &mut field)?;
                rows.push(std::mem::take(&mut row));
            }
            c if c == delimiter => end_field(&mut row, &mut field)?,
            other => field.push(other),
        }
    }
    if !field.is_empty() || !row.is_empty() {
        end_field(&mut row, &mut field)?;
        rows.push(row);
    }
    Ok(rows)
}

/// Une valeur CSV commençant par « = » est importée comme **texte** : ouvrir un CSV ne doit
/// jamais exécuter de formule venue de l'extérieur.
pub fn as_input(field: &str) -> String {
    if field.starts_with('=') { format!("'{field}") } else { field.to_owned() }
}

/// Échappement à l'export ; un texte qui ressemble à une formule (=, +, -, @) est préfixé
/// d'une apostrophe pour ne pas être exécuté par un autre tableur (injection CSV).
pub fn escape(text: &str, delimiter: char, numeric: bool) -> String {
    let guarded = if !numeric && text.starts_with(['=', '+', '-', '@']) { format!("'{text}") } else { text.to_owned() };
    if guarded.contains([delimiter, '"', '\n', '\r']) {
        format!("\"{}\"", guarded.replace('"', "\"\""))
    } else {
        guarded
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lit_les_guillemets_les_retours_et_detecte_le_separateur() {
        let rows = parse(
            "\u{feff}Nom;Note;Commentaire\r\n\"Dupont; Jean\";12,5;\"il a dit \"\"bravo\"\"\nfin\"\r\nMartin;9;\n",
        )
        .expect("csv");
        assert_eq!(rows.len(), 3);
        assert_eq!(rows[1], ["Dupont; Jean", "12,5", "il a dit \"bravo\"\nfin"]);
        assert_eq!(rows[2], ["Martin", "9", ""]);
        assert_eq!(parse("a,b\n1,2").expect("csv")[1], ["1", "2"]);
        assert_eq!(parse("a\tb\n1\t2").expect("csv")[1], ["1", "2"]);
    }

    #[test]
    fn neutralise_les_formules_a_l_import_et_a_l_export() {
        assert_eq!(as_input("=HYPERLINK(\"http://x\")"), "'=HYPERLINK(\"http://x\")");
        assert_eq!(as_input("12"), "12");
        assert_eq!(escape("=1+1", ';', false), "'=1+1");
        assert_eq!(escape("-5", ';', true), "-5");
        assert_eq!(escape("a;b", ';', false), "\"a;b\"");
        assert_eq!(escape("dit \"oui\"", ',', false), "\"dit \"\"oui\"\"\"");
    }

    #[test]
    fn borne_la_taille() {
        let huge = "a,".repeat(MAX_CSV_CELLS + 1);
        assert_eq!(parse(&huge), Err(SheetError::CsvTooLarge(MAX_CSV_CELLS)));
    }
}
