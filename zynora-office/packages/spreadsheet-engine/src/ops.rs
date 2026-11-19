//! Opérations des onglets Accueil (police, bordures, nombres, effacement), Données (tri,
//! doublons), Édition (rechercher, remplacer), Formules (noms définis) et Affichage (quadrillage).
//!
//! Les réorganisations de données (tri, doublons) passent par **un seul collage** : une seule
//! étape d'annulation, styles déplacés avec les valeurs.

use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};

use ironcalc::base::cell::CellValue;
use ironcalc::base::types::Style;
use serde::{Deserialize, Serialize};

use crate::{CellRange, Result, SheetError, Workbook, engine};

/// Nombre maximal de cellules réorganisées (tri, doublons) en une opération.
pub const MAX_REORDER_CELLS: i64 = 500_000;
/// Nombre maximal de résultats renvoyés par une recherche.
pub const MAX_FIND_RESULTS: usize = 10_000;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BorderPreset {
    All,
    Outer,
    Inner,
    Top,
    Bottom,
    Left,
    Right,
    None,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BorderLine {
    Thin,
    Medium,
    Thick,
    Double,
    Dotted,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct DefinedName {
    pub name: String,
    /// Feuille de portée, ou `None` pour tout le classeur.
    pub scope: Option<u32>,
    pub formula: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct Found {
    pub row: i32,
    pub column: i32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
pub struct FindOptions {
    pub match_case: bool,
    /// Toute la cellule doit correspondre (et non une partie).
    pub whole_cell: bool,
    /// Chercher dans les formules saisies plutôt que dans les valeurs affichées.
    pub in_formulas: bool,
}

/// Une fonction du catalogue de « Insérer une fonction ».
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct FunctionInfo {
    pub fr: &'static str,
    pub en: &'static str,
    pub category: &'static str,
    pub syntax_fr: &'static str,
    pub description: &'static str,
}

/// Fonctions proposées dans « Insérer une fonction ». Chacune est vérifiée par un test :
/// le moteur doit la reconnaître (aucune ne renvoie #NOM?).
pub const FUNCTIONS: &[FunctionInfo] = &[
    f("SOMME", "SUM", "Math et trigo", "SOMME(nombre1; [nombre2]; …)", "Additionne les nombres."),
    f(
        "SOMME.SI",
        "SUMIF",
        "Math et trigo",
        "SOMME.SI(plage; critère; [plage_somme])",
        "Additionne les cellules qui répondent à un critère.",
    ),
    f(
        "SOMME.SI.ENS",
        "SUMIFS",
        "Math et trigo",
        "SOMME.SI.ENS(plage_somme; plage1; critère1; …)",
        "Additionne selon plusieurs critères.",
    ),
    f(
        "SOMMEPROD",
        "SUMPRODUCT",
        "Math et trigo",
        "SOMMEPROD(matrice1; [matrice2]; …)",
        "Somme des produits des matrices.",
    ),
    f("ARRONDI", "ROUND", "Math et trigo", "ARRONDI(nombre; no_chiffres)", "Arrondit au nombre de chiffres indiqué."),
    f("ARRONDI.SUP", "ROUNDUP", "Math et trigo", "ARRONDI.SUP(nombre; no_chiffres)", "Arrondit vers le haut."),
    f("ARRONDI.INF", "ROUNDDOWN", "Math et trigo", "ARRONDI.INF(nombre; no_chiffres)", "Arrondit vers le bas."),
    f("ENT", "INT", "Math et trigo", "ENT(nombre)", "Partie entière (arrondi vers le bas)."),
    f("ABS", "ABS", "Math et trigo", "ABS(nombre)", "Valeur absolue."),
    f("MOD", "MOD", "Math et trigo", "MOD(nombre; diviseur)", "Reste d'une division."),
    f("PUISSANCE", "POWER", "Math et trigo", "PUISSANCE(nombre; puissance)", "Élève un nombre à une puissance."),
    f("RACINE", "SQRT", "Math et trigo", "RACINE(nombre)", "Racine carrée."),
    f("PRODUIT", "PRODUCT", "Math et trigo", "PRODUIT(nombre1; [nombre2]; …)", "Multiplie les nombres."),
    f("ALEA", "RAND", "Math et trigo", "ALEA()", "Nombre aléatoire entre 0 et 1."),
    f(
        "ALEA.ENTRE.BORNES",
        "RANDBETWEEN",
        "Math et trigo",
        "ALEA.ENTRE.BORNES(min; max)",
        "Entier aléatoire entre deux bornes.",
    ),
    f("PI", "PI", "Math et trigo", "PI()", "Valeur de π."),
    f("MOYENNE", "AVERAGE", "Statistiques", "MOYENNE(nombre1; [nombre2]; …)", "Moyenne arithmétique."),
    f(
        "MOYENNE.SI",
        "AVERAGEIF",
        "Statistiques",
        "MOYENNE.SI(plage; critère; [plage_moyenne])",
        "Moyenne des cellules qui répondent à un critère.",
    ),
    f("MIN", "MIN", "Statistiques", "MIN(nombre1; [nombre2]; …)", "Plus petite valeur."),
    f("MAX", "MAX", "Statistiques", "MAX(nombre1; [nombre2]; …)", "Plus grande valeur."),
    f("MEDIANE", "MEDIAN", "Statistiques", "MEDIANE(nombre1; [nombre2]; …)", "Valeur médiane."),
    f("NB", "COUNT", "Statistiques", "NB(valeur1; [valeur2]; …)", "Compte les cellules contenant des nombres."),
    f("NBVAL", "COUNTA", "Statistiques", "NBVAL(valeur1; [valeur2]; …)", "Compte les cellules non vides."),
    f("NB.VIDE", "COUNTBLANK", "Statistiques", "NB.VIDE(plage)", "Compte les cellules vides."),
    f("NB.SI", "COUNTIF", "Statistiques", "NB.SI(plage; critère)", "Compte les cellules qui répondent à un critère."),
    f("NB.SI.ENS", "COUNTIFS", "Statistiques", "NB.SI.ENS(plage1; critère1; …)", "Compte selon plusieurs critères."),
    f("GRANDE.VALEUR", "LARGE", "Statistiques", "GRANDE.VALEUR(matrice; k)", "k-ième plus grande valeur."),
    f("PETITE.VALEUR", "SMALL", "Statistiques", "PETITE.VALEUR(matrice; k)", "k-ième plus petite valeur."),
    f("SI", "IF", "Logique", "SI(test; valeur_si_vrai; [valeur_si_faux])", "Renvoie une valeur selon une condition."),
    f(
        "SI.CONDITIONS",
        "IFS",
        "Logique",
        "SI.CONDITIONS(test1; valeur1; …)",
        "Teste plusieurs conditions dans l'ordre.",
    ),
    f(
        "SIERREUR",
        "IFERROR",
        "Logique",
        "SIERREUR(valeur; valeur_si_erreur)",
        "Remplace une erreur par une autre valeur.",
    ),
    f("ET", "AND", "Logique", "ET(logique1; [logique2]; …)", "VRAI si tous les arguments sont vrais."),
    f("OU", "OR", "Logique", "OU(logique1; [logique2]; …)", "VRAI si au moins un argument est vrai."),
    f("NON", "NOT", "Logique", "NON(logique)", "Inverse une valeur logique."),
    f(
        "RECHERCHEV",
        "VLOOKUP",
        "Recherche et référence",
        "RECHERCHEV(valeur; table; no_colonne; [valeur_proche])",
        "Cherche une valeur dans la première colonne d'un tableau.",
    ),
    f(
        "RECHERCHEH",
        "HLOOKUP",
        "Recherche et référence",
        "RECHERCHEH(valeur; table; no_ligne; [valeur_proche])",
        "Cherche une valeur dans la première ligne d'un tableau.",
    ),
    f(
        "RECHERCHEX",
        "XLOOKUP",
        "Recherche et référence",
        "RECHERCHEX(valeur; tableau_recherche; tableau_renvoyé; …)",
        "Recherche moderne dans une plage.",
    ),
    f(
        "INDEX",
        "INDEX",
        "Recherche et référence",
        "INDEX(matrice; no_ligne; [no_colonne])",
        "Valeur à une position donnée.",
    ),
    f(
        "EQUIV",
        "MATCH",
        "Recherche et référence",
        "EQUIV(valeur; tableau; [type])",
        "Position d'une valeur dans une plage.",
    ),
    f(
        "CHOISIR",
        "CHOOSE",
        "Recherche et référence",
        "CHOISIR(no_index; valeur1; …)",
        "Choisit une valeur dans une liste.",
    ),
    f("LIGNE", "ROW", "Recherche et référence", "LIGNE([référence])", "Numéro de ligne."),
    f("COLONNE", "COLUMN", "Recherche et référence", "COLONNE([référence])", "Numéro de colonne."),
    f("CONCATENER", "CONCATENATE", "Texte", "CONCATENER(texte1; [texte2]; …)", "Assemble des textes."),
    f("CONCAT", "CONCAT", "Texte", "CONCAT(texte1; [texte2]; …)", "Assemble des textes et des plages."),
    f(
        "JOINDRE.TEXTE",
        "TEXTJOIN",
        "Texte",
        "JOINDRE.TEXTE(séparateur; ignorer_vides; texte1; …)",
        "Assemble avec un séparateur.",
    ),
    f("GAUCHE", "LEFT", "Texte", "GAUCHE(texte; [nb_car])", "Premiers caractères d'un texte."),
    f("DROITE", "RIGHT", "Texte", "DROITE(texte; [nb_car])", "Derniers caractères d'un texte."),
    f("STXT", "MID", "Texte", "STXT(texte; début; nb_car)", "Extrait une partie d'un texte."),
    f("NBCAR", "LEN", "Texte", "NBCAR(texte)", "Nombre de caractères."),
    f("MAJUSCULE", "UPPER", "Texte", "MAJUSCULE(texte)", "Met en majuscules."),
    f("MINUSCULE", "LOWER", "Texte", "MINUSCULE(texte)", "Met en minuscules."),
    f("NOMPROPRE", "PROPER", "Texte", "NOMPROPRE(texte)", "Majuscule à chaque mot."),
    f("SUPPRESPACE", "TRIM", "Texte", "SUPPRESPACE(texte)", "Supprime les espaces en trop."),
    f(
        "SUBSTITUE",
        "SUBSTITUTE",
        "Texte",
        "SUBSTITUE(texte; ancien; nouveau; [no_position])",
        "Remplace un texte par un autre.",
    ),
    f("TROUVE", "FIND", "Texte", "TROUVE(texte_cherché; texte; [début])", "Position d'un texte (respecte la casse)."),
    f("CHERCHE", "SEARCH", "Texte", "CHERCHE(texte_cherché; texte; [début])", "Position d'un texte (sans la casse)."),
    f("TEXTE", "TEXT", "Texte", "TEXTE(valeur; format)", "Met un nombre en forme de texte."),
    f("CNUM", "VALUE", "Texte", "CNUM(texte)", "Convertit un texte en nombre."),
    f("AUJOURDHUI", "TODAY", "Date et heure", "AUJOURDHUI()", "Date du jour."),
    f("MAINTENANT", "NOW", "Date et heure", "MAINTENANT()", "Date et heure actuelles."),
    f("DATE", "DATE", "Date et heure", "DATE(année; mois; jour)", "Construit une date."),
    f("ANNEE", "YEAR", "Date et heure", "ANNEE(date)", "Année d'une date."),
    f("MOIS", "MONTH", "Date et heure", "MOIS(date)", "Mois d'une date."),
    f("JOUR", "DAY", "Date et heure", "JOUR(date)", "Jour d'une date."),
    f("JOURSEM", "WEEKDAY", "Date et heure", "JOURSEM(date; [type])", "Jour de la semaine."),
    f(
        "NB.JOURS.OUVRES",
        "NETWORKDAYS",
        "Date et heure",
        "NB.JOURS.OUVRES(début; fin; [fériés])",
        "Jours ouvrés entre deux dates.",
    ),
    f("FIN.MOIS", "EOMONTH", "Date et heure", "FIN.MOIS(date; mois)", "Dernier jour du mois."),
    f("VPM", "PMT", "Finances", "VPM(taux; npm; va; [vc]; [type])", "Mensualité d'un emprunt."),
    f("VA", "PV", "Finances", "VA(taux; npm; vpm; [vc]; [type])", "Valeur actuelle."),
    f("VC", "FV", "Finances", "VC(taux; npm; vpm; [va]; [type])", "Valeur future."),
    f("ESTVIDE", "ISBLANK", "Information", "ESTVIDE(valeur)", "VRAI si la cellule est vide."),
    f("ESTNUM", "ISNUMBER", "Information", "ESTNUM(valeur)", "VRAI si la valeur est un nombre."),
    f("ESTTEXTE", "ISTEXT", "Information", "ESTTEXTE(valeur)", "VRAI si la valeur est un texte."),
    f("ESTERREUR", "ISERROR", "Information", "ESTERREUR(valeur)", "VRAI si la valeur est une erreur."),
];

const fn f(
    fr: &'static str,
    en: &'static str,
    category: &'static str,
    syntax_fr: &'static str,
    description: &'static str,
) -> FunctionInfo {
    FunctionInfo { fr, en, category, syntax_fr, description }
}

/// Ajoute (`delta` > 0) ou retire des décimales à un format de nombre canonique.
pub fn adjust_decimals(format: &str, delta: i32) -> String {
    let base = if format.is_empty() || format.eq_ignore_ascii_case("general") { "0" } else { format };
    // Seule la première section (nombres positifs) est utilisée comme modèle.
    let section = base.split(';').next().unwrap_or("0");
    let (prefix, rest) = match section.find(['0', '#']) {
        Some(i) => section.split_at(i),
        None => return format.to_owned(),
    };
    let end = rest.find(|c: char| !matches!(c, '0' | '#' | ',' | '.')).unwrap_or(rest.len());
    let (number, suffix) = rest.split_at(end);
    let (integer, decimals) = number.split_once('.').unwrap_or((number, ""));
    let count = (decimals.len() as i32 + delta).clamp(0, 15) as usize;
    let new_number = if count == 0 { integer.to_owned() } else { format!("{integer}.{}", "0".repeat(count)) };
    format!("{prefix}{new_number}{suffix}")
}

/// Active ou retire le séparateur de milliers d'un format de nombre canonique.
pub fn toggle_thousands(format: &str) -> String {
    let base = if format.is_empty() || format.eq_ignore_ascii_case("general") { "0" } else { format };
    if base.contains("#,##") {
        base.replacen("#,##", "", 1)
    } else {
        match base.find('0') {
            Some(i) => format!("{}#,##{}", &base[..i], &base[i..]),
            None => base.to_owned(),
        }
    }
}

/// Clé de tri : nombres, puis textes (sans casse ni accents), puis booléens ; vides à la fin.
fn compare(a: &CellValue, b: &CellValue) -> Ordering {
    fn rank(v: &CellValue) -> u8 {
        match v {
            CellValue::Number(_) => 0,
            CellValue::String(s) if !s.is_empty() => 1,
            CellValue::Boolean(_) => 2,
            _ => 3,
        }
    }
    match (a, b) {
        (CellValue::Number(x), CellValue::Number(y)) => x.partial_cmp(y).unwrap_or(Ordering::Equal),
        (CellValue::String(x), CellValue::String(y)) => fold(x).cmp(&fold(y)),
        (CellValue::Boolean(x), CellValue::Boolean(y)) => x.cmp(y),
        _ => rank(a).cmp(&rank(b)),
    }
}

fn fold(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| match c {
            'à' | 'â' | 'ä' | 'á' => 'a',
            'ç' => 'c',
            'é' | 'è' | 'ê' | 'ë' => 'e',
            'î' | 'ï' | 'í' => 'i',
            'ô' | 'ö' | 'ó' => 'o',
            'ù' | 'û' | 'ü' | 'ú' => 'u',
            other => other,
        })
        .collect()
}

#[derive(Serialize)]
struct RawCell {
    text: String,
    is_spill: bool,
    style: Style,
}

impl Workbook {
    fn check_reorder(&self, range: CellRange) -> Result<()> {
        range.validate()?;
        if range.cells() > MAX_REORDER_CELLS {
            return Err(SheetError::Engine("plage trop grande pour cette opération".into()));
        }
        for (row, column) in self.stored_cells_in(range)? {
            if self.content(range.sheet, row, column)?.starts_with('=') {
                return Err(SheetError::Engine(
                    "la plage contient des formules : copiez-la en valeurs avant de la trier ou d'en retirer les doublons".into(),
                ));
            }
        }
        Ok(())
    }

    /// Lignes de la plage : (contenu, valeur, style) de chaque cellule.
    fn read_rows(&self, range: CellRange) -> Result<Vec<Vec<(String, CellValue, Style)>>> {
        let model = self.model.get_model();
        (range.top..=range.bottom)
            .map(|row| {
                (range.left..=range.right)
                    .map(|column| {
                        Ok((
                            self.content(range.sheet, row, column)?,
                            model.get_cell_value_by_index(range.sheet, row, column).map_err(engine)?,
                            self.model.get_cell_style(range.sheet, row, column).map_err(engine)?,
                        ))
                    })
                    .collect()
            })
            .collect()
    }

    /// Réécrit la plage en une seule opération (une étape d'annulation).
    fn write_rows(&mut self, range: CellRange, rows: Vec<Vec<(String, CellValue, Style)>>) -> Result<()> {
        let mut data: HashMap<i32, HashMap<i32, RawCell>> = HashMap::new();
        for (r, cells) in rows.into_iter().enumerate() {
            let row = data.entry(range.top + r as i32).or_default();
            for (c, (text, _, style)) in cells.into_iter().enumerate() {
                row.insert(range.left + c as i32, RawCell { text, is_spill: false, style });
            }
        }
        let data: ironcalc::base::ClipboardData = serde_json::to_value(&data)
            .and_then(serde_json::from_value)
            .map_err(|e| SheetError::Engine(e.to_string()))?;
        self.select(range)?;
        self.model
            .paste_from_clipboard(range.sheet, (range.top, range.left, range.bottom, range.right), &data, false)
            .map_err(engine)
    }

    /// Trie les lignes de la plage selon une colonne (valeurs et mises en forme déplacées).
    pub fn sort(&mut self, range: CellRange, key_column: i32, ascending: bool, has_header: bool) -> Result<()> {
        self.check_reorder(range)?;
        if key_column < range.left || key_column > range.right {
            return Err(SheetError::InvalidRange);
        }
        let mut rows = self.read_rows(range)?;
        let header = if has_header && !rows.is_empty() { Some(rows.remove(0)) } else { None };
        let key = (key_column - range.left) as usize;
        rows.sort_by(|a, b| {
            let order = compare(&a[key].1, &b[key].1);
            // Les cellules vides restent à la fin, quel que soit le sens.
            let empty =
                |r: &Vec<(String, CellValue, Style)>| matches!(r[key].1, CellValue::None) || r[key].0.is_empty();
            match (empty(a), empty(b)) {
                (true, false) => Ordering::Greater,
                (false, true) => Ordering::Less,
                _ if ascending => order,
                _ => order.reverse(),
            }
        });
        if let Some(header) = header {
            rows.insert(0, header);
        }
        self.write_rows(range, rows)
    }

    /// Supprime les lignes en double (sur toutes les colonnes de la plage) ; renvoie leur nombre.
    pub fn remove_duplicates(&mut self, range: CellRange, has_header: bool) -> Result<usize> {
        self.check_reorder(range)?;
        let rows = self.read_rows(range)?;
        let width = rows.first().map_or(0, Vec::len);
        let mut seen = HashSet::new();
        let mut kept = Vec::with_capacity(rows.len());
        for (index, row) in rows.into_iter().enumerate() {
            let key: Vec<String> = row.iter().map(|(content, _, _)| fold(content.trim())).collect();
            // Une ligne vide n'est pas une donnée : elle n'est jamais comptée comme doublon.
            let empty = key.iter().all(String::is_empty);
            if (has_header && index == 0) || empty || seen.insert(key) {
                kept.push(row);
            }
        }
        let height = (range.bottom - range.top + 1) as usize;
        let removed = height - kept.len();
        while kept.len() < height {
            kept.push((0..width).map(|_| (String::new(), CellValue::None, Style::default())).collect());
        }
        if removed > 0 {
            self.write_rows(range, kept)?;
        }
        Ok(removed)
    }

    /// Recherche dans une feuille (ordre ligne par ligne).
    pub fn find(&self, sheet: u32, needle: &str, options: FindOptions) -> Result<Vec<Found>> {
        if needle.is_empty() {
            return Ok(Vec::new());
        }
        let normalize = |s: &str| if options.match_case { s.to_owned() } else { s.to_lowercase() };
        let target = normalize(needle);
        let mut cells = self.stored_cells(sheet)?;
        cells.sort_unstable();
        let mut found = Vec::new();
        for (row, column) in cells {
            let text =
                if options.in_formulas { self.content(sheet, row, column)? } else { self.display(sheet, row, column)? };
            let text = normalize(&text);
            let hit = if options.whole_cell { text == target } else { text.contains(&target) };
            if hit {
                found.push(Found { row, column });
                if found.len() >= MAX_FIND_RESULTS {
                    break;
                }
            }
        }
        Ok(found)
    }

    /// Remplace dans le contenu saisi des cellules (formules comprises) ; renvoie le nombre de cellules modifiées.
    pub fn replace_all(&mut self, sheet: u32, needle: &str, replacement: &str, match_case: bool) -> Result<usize> {
        let options = FindOptions { match_case, whole_cell: false, in_formulas: true };
        let hits = self.find(sheet, needle, options)?;
        let mut changed = 0;
        for hit in hits {
            let content = self.content(sheet, hit.row, hit.column)?;
            let updated = if match_case {
                content.replace(needle, replacement)
            } else {
                replace_ignore_case(&content, needle, replacement)
            };
            if updated != content {
                self.set_input(sheet, hit.row, hit.column, &updated)?;
                changed += 1;
            }
        }
        Ok(changed)
    }

    pub fn gridlines(&self, sheet: u32) -> Result<bool> {
        self.model.get_show_grid_lines(sheet).map_err(engine)
    }

    pub fn set_gridlines(&mut self, sheet: u32, show: bool) -> Result<()> {
        self.model.set_show_grid_lines(sheet, show).map_err(engine)
    }

    pub fn defined_names(&self) -> Vec<DefinedName> {
        self.model
            .get_defined_name_list()
            .into_iter()
            .map(|(name, scope, formula)| DefinedName { name, scope, formula })
            .collect()
    }

    /// Définit un nom (« TauxTVA » → « =Feuil1!$B$1 »).
    pub fn add_defined_name(&mut self, name: &str, scope: Option<u32>, formula: &str) -> Result<()> {
        let formula = formula.strip_prefix('=').unwrap_or(formula);
        self.model.new_defined_name(name.trim(), scope, formula).map_err(engine)
    }

    pub fn delete_defined_name(&mut self, name: &str, scope: Option<u32>) -> Result<()> {
        self.model.delete_defined_name(name, scope).map_err(engine)
    }

    /// Efface contenus et mises en forme.
    pub fn clear_all(&mut self, range: CellRange) -> Result<()> {
        range.validate()?;
        self.model.range_clear_all(&range.area()).map_err(engine)
    }

    pub fn clear_formats(&mut self, range: CellRange) -> Result<()> {
        range.validate()?;
        self.model.range_clear_formatting(&range.area()).map_err(engine)
    }

    pub fn set_borders(&mut self, range: CellRange, preset: BorderPreset, line: BorderLine, color: &str) -> Result<()> {
        range.validate()?;
        let style = match line {
            BorderLine::Thin => "thin",
            BorderLine::Medium => "medium",
            BorderLine::Thick => "thick",
            BorderLine::Double => "double",
            BorderLine::Dotted => "dotted",
        };
        let kind = match preset {
            BorderPreset::All => "All",
            BorderPreset::Outer => "Outer",
            BorderPreset::Inner => "Inner",
            BorderPreset::Top => "Top",
            BorderPreset::Bottom => "Bottom",
            BorderPreset::Left => "Left",
            BorderPreset::Right => "Right",
            BorderPreset::None => "None",
        };
        let color = if color.is_empty() { "#000000" } else { color };
        let border_area: ironcalc::base::BorderArea =
            serde_json::from_value(serde_json::json!({ "item": { "style": style, "color": color }, "type": kind }))
                .map_err(|e| SheetError::Engine(e.to_string()))?;
        self.model.set_area_with_border(&range.area(), &border_area).map_err(engine)
    }

    /// Police (nom) d'une plage : le moteur n'offre pas de chemin de style direct, la plage est
    /// donc réécrite avec ses styles modifiés (une étape d'annulation).
    pub fn set_font_name(&mut self, range: CellRange, name: &str) -> Result<()> {
        range.validate()?;
        if range.cells() > MAX_REORDER_CELLS || name.trim().is_empty() || name.len() > 64 {
            return Err(SheetError::InvalidRange);
        }
        let styles = (range.top..=range.bottom)
            .map(|row| {
                (range.left..=range.right)
                    .map(|column| {
                        let mut style = self.model.get_cell_style(range.sheet, row, column).map_err(engine)?;
                        name.trim().clone_into(&mut style.font.name);
                        Ok(style)
                    })
                    .collect::<Result<Vec<_>>>()
            })
            .collect::<Result<Vec<_>>>()?;
        self.select(range)?;
        self.model.on_paste_styles(&styles).map_err(engine)
    }

    /// Format de nombre de la cellule en haut à gauche (base des boutons « décimales »).
    pub fn number_format(&self, sheet: u32, row: i32, column: i32) -> Result<String> {
        Ok(self.model.get_cell_style(sheet, row, column).map_err(engine)?.num_fmt)
    }

    /// « Reproduire la mise en forme » : styles de `source` appliqués à `target` (motif répété).
    pub fn copy_styles(&mut self, source: CellRange, target: CellRange) -> Result<()> {
        source.validate()?;
        target.validate()?;
        if source.cells() > MAX_REORDER_CELLS || target.cells() > MAX_REORDER_CELLS {
            return Err(SheetError::InvalidRange);
        }
        let pattern = (source.top..=source.bottom)
            .map(|row| {
                (source.left..=source.right)
                    .map(|column| self.model.get_cell_style(source.sheet, row, column).map_err(engine))
                    .collect::<Result<Vec<_>>>()
            })
            .collect::<Result<Vec<_>>>()?;
        let (ph, pw) = (pattern.len(), pattern.first().map_or(0, Vec::len));
        let styles: Vec<Vec<Style>> = (0..(target.bottom - target.top + 1) as usize)
            .map(|r| (0..(target.right - target.left + 1) as usize).map(|c| pattern[r % ph][c % pw].clone()).collect())
            .collect();
        self.select(target)?;
        self.model.on_paste_styles(&styles).map_err(engine)
    }

    /// Recalcule tout le classeur (« Calculer maintenant »).
    pub fn recalculate(&mut self) {
        self.model.evaluate();
    }
}

fn replace_ignore_case(text: &str, needle: &str, replacement: &str) -> String {
    let lower = text.to_lowercase();
    let target = needle.to_lowercase();
    // Repli prudent si la mise en minuscules change la longueur (caractères particuliers).
    if lower.len() != text.len() || target.is_empty() {
        return text.replace(needle, replacement);
    }
    let mut out = String::with_capacity(text.len());
    let mut last = 0;
    for (index, _) in lower.match_indices(&target) {
        out.push_str(&text[last..index]);
        out.push_str(replacement);
        last = index + target.len();
    }
    out.push_str(&text[last..]);
    out
}
