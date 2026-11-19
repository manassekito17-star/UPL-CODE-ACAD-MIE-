//! Moteur de tableur de ZYNORA OFFICE.
//!
//! Adossé à IronCalc (MIT/Apache-2.0) : **tous les calculs** sont faits par ce moteur ; l'interface
//! n'affiche que les valeurs qu'il renvoie. Ce module ajoute :
//! - l'ouverture et l'enregistrement XLSX (octets, pour l'écriture atomique côté appelant) ;
//! - l'import et l'export CSV (séparateur détecté, guillemets RFC 4180, protection contre
//!   l'injection de formules) ;
//! - une vue « plage visible » compacte pour la grille, les styles usuels, les feuilles,
//!   l'annulation, le presse-papiers interne et les statistiques de sélection.

use std::collections::HashMap;
use std::io::Cursor;

use ironcalc::base::cell::CellValue;
use ironcalc::base::expressions::types::Area;
use ironcalc::base::types::{CellType, Color, HorizontalAlignment};
use ironcalc::base::{ClipboardData, Model, UserModel};
use serde::{Deserialize, Serialize};

mod csv;

/// Limites de la grille (identiques à Excel).
pub const MAX_ROWS: i32 = 1_048_576;
pub const MAX_COLUMNS: i32 = 16_384;
/// Nombre maximal de cellules renvoyées en une fois à l'interface.
pub const MAX_RANGE_CELLS: i64 = 20_000;

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum SheetError {
    #[error("classeur illisible : {0}")]
    Read(String),
    #[error("enregistrement impossible : {0}")]
    Write(String),
    #[error("{0}")]
    Engine(String),
    #[error("plage invalide")]
    InvalidRange,
    #[error("fichier CSV trop volumineux (maximum {0} cellules)")]
    CsvTooLarge(usize),
}

pub type Result<T> = std::result::Result<T, SheetError>;

fn engine(error: String) -> SheetError {
    SheetError::Engine(error)
}

/// Langue des fonctions et format des nombres (« SOMME » et « 1,5 » en français).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FormulaLanguage {
    Fr,
    En,
}

impl FormulaLanguage {
    fn ids(self) -> (&'static str, &'static str) {
        match self {
            FormulaLanguage::Fr => ("fr", "fr"),
            FormulaLanguage::En => ("en", "en"),
        }
    }
    fn csv_delimiter(self) -> char {
        match self {
            FormulaLanguage::Fr => ';',
            FormulaLanguage::En => ',',
        }
    }
}

/// Fuseau horaire des fonctions de date (AUJOURDHUI, MAINTENANT).
pub const DEFAULT_TIMEZONE: &str = "UTC";

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct SheetInfo {
    pub index: u32,
    pub name: String,
    pub visible: bool,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Align {
    #[default]
    General,
    Left,
    Center,
    Right,
}

/// Style d'une cellule tel qu'affiché par la grille. Couleurs en `#rrggbb`.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize)]
pub struct CellStyleView {
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub bold: bool,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub italic: bool,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub underline: bool,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub strike: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fill: Option<String>,
    /// Alignement effectif (« Général » : nombres à droite, texte à gauche, booléens et erreurs centrés).
    pub align: Align,
    /// Alignement choisi explicitement par l'utilisateur (sinon : alignement par défaut du type).
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub align_set: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CellView {
    pub row: i32,
    pub column: i32,
    pub text: String,
    /// Valeur numérique (au sens du moteur, formules comprises).
    pub numeric: bool,
    pub style: CellStyleView,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct RangeView {
    pub sheet: u32,
    /// Cellules non vides ou mises en forme de la plage demandée.
    pub cells: Vec<CellView>,
    /// Largeurs des colonnes de la plage, en pixels.
    pub column_widths: Vec<f64>,
    /// Hauteurs des lignes de la plage, en pixels.
    pub row_heights: Vec<f64>,
}

/// Rectangle de cellules (1-indexé, bornes incluses).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct CellRange {
    pub sheet: u32,
    pub top: i32,
    pub left: i32,
    pub bottom: i32,
    pub right: i32,
}

impl CellRange {
    pub fn cell(sheet: u32, row: i32, column: i32) -> Self {
        Self { sheet, top: row, left: column, bottom: row, right: column }
    }
    fn validate(&self) -> Result<()> {
        let ok = self.top >= 1
            && self.left >= 1
            && self.bottom >= self.top
            && self.right >= self.left
            && self.bottom <= MAX_ROWS
            && self.right <= MAX_COLUMNS;
        if ok { Ok(()) } else { Err(SheetError::InvalidRange) }
    }
    fn cells(&self) -> i64 {
        i64::from(self.bottom - self.top + 1) * i64::from(self.right - self.left + 1)
    }
    fn area(&self) -> Area {
        Area {
            sheet: self.sheet,
            row: self.top,
            column: self.left,
            width: self.right - self.left + 1,
            height: self.bottom - self.top + 1,
        }
    }
}

/// Modification de style applicable à une plage (liste fermée : aucune clé arbitraire).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", content = "value", rename_all = "snake_case")]
pub enum StyleChange {
    Bold(bool),
    Italic(bool),
    Underline(bool),
    Strike(bool),
    /// `#rrggbb`, ou chaîne vide pour revenir à la couleur automatique.
    FontColor(String),
    Fill(String),
    Align(Align),
    /// Format de nombre en syntaxe Excel **canonique** (« 0.00 », « 0% », « dd/mm/yyyy »…) ;
    /// l'affichage suit la langue du classeur (« 12,00 » en français).
    NumberFormat(String),
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct SelectionStats {
    /// Cellules non vides.
    pub count: u64,
    /// Cellules numériques.
    pub numeric_count: u64,
    pub sum: f64,
    pub average: Option<f64>,
    pub min: Option<f64>,
    pub max: Option<f64>,
}

/// Contenu copié : données internes d'IronCalc (formules ajustées au collage) et texte brut.
pub struct Copied {
    sheet: u32,
    range: (i32, i32, i32, i32),
    data: ClipboardData,
    /// Texte tabulé, pour le presse-papiers du système.
    pub text: String,
}

#[derive(Deserialize)]
struct RawClipboard {
    csv: String,
    data: ClipboardData,
    sheet: u32,
    range: (i32, i32, i32, i32),
}

pub struct Workbook {
    model: UserModel<'static>,
    language: FormulaLanguage,
}

impl Workbook {
    /// Nouveau classeur vide d'une feuille (« Feuil1 » en français).
    pub fn new(name: &str, language: FormulaLanguage) -> Result<Self> {
        let (locale, lang) = language.ids();
        let model = UserModel::new_empty(leak(name), locale, DEFAULT_TIMEZONE, lang).map_err(engine)?;
        Ok(Self { model, language })
    }

    /// Ouvre un classeur XLSX. Le fichier doit avoir été validé par `zynora-security` avant.
    pub fn from_xlsx(bytes: &[u8], name: &str, language: FormulaLanguage) -> Result<Self> {
        let (locale, lang) = language.ids();
        let workbook = ironcalc::import::load_from_xlsx_bytes(bytes, name, locale, DEFAULT_TIMEZONE)
            .map_err(|e| SheetError::Read(e.to_string()))?;
        let model = Model::from_workbook(workbook, lang).map_err(SheetError::Read)?;
        Ok(Self { model: UserModel::from_model(model), language })
    }

    /// Classeur XLSX complet, prêt à être écrit de façon atomique.
    pub fn to_xlsx(&self) -> Result<Vec<u8>> {
        let mut bytes = Vec::new();
        ironcalc::export::save_xlsx_to_writer(self.model.get_model(), Cursor::new(&mut bytes))
            .map_err(|e| SheetError::Write(e.to_string()))?;
        Ok(bytes)
    }

    /// Importe un texte CSV dans un nouveau classeur.
    pub fn from_csv(text: &str, name: &str, language: FormulaLanguage) -> Result<Self> {
        let mut workbook = Self::new(name, language)?;
        let rows = csv::parse(text)?;
        workbook.model.pause_evaluation();
        for (r, fields) in rows.iter().enumerate() {
            for (c, field) in fields.iter().enumerate() {
                if field.is_empty() {
                    continue;
                }
                let row = i32::try_from(r + 1).map_err(|_| SheetError::InvalidRange)?;
                let column = i32::try_from(c + 1).map_err(|_| SheetError::InvalidRange)?;
                if row > MAX_ROWS || column > MAX_COLUMNS {
                    return Err(SheetError::InvalidRange);
                }
                workbook.model.set_user_input(0, row, column, &csv::as_input(field)).map_err(engine)?;
            }
        }
        workbook.model.resume_evaluation();
        workbook.model.evaluate();
        Ok(workbook)
    }

    /// Exporte une feuille en CSV (valeurs affichées ; séparateur de la langue).
    pub fn to_csv(&self, sheet: u32) -> Result<String> {
        let (rows, columns) = self.used_size(sheet)?;
        let delimiter = self.language.csv_delimiter();
        let mut out = String::new();
        for row in 1..=rows {
            let mut fields = Vec::with_capacity(columns as usize);
            for column in 1..=columns {
                let text = self.model.get_formatted_cell_value(sheet, row, column).map_err(engine)?;
                let numeric = matches!(self.model.get_cell_type(sheet, row, column), Ok(CellType::Number));
                fields.push(csv::escape(&text, delimiter, numeric));
            }
            out.push_str(&fields.join(&delimiter.to_string()));
            out.push_str("\r\n");
        }
        Ok(out)
    }

    pub fn language(&self) -> FormulaLanguage {
        self.language
    }

    pub fn sheets(&self) -> Vec<SheetInfo> {
        self.model
            .get_worksheets_properties()
            .into_iter()
            .enumerate()
            .map(|(index, p)| SheetInfo { index: index as u32, name: p.name, visible: p.state == "visible" })
            .collect()
    }

    pub fn add_sheet(&mut self) -> Result<u32> {
        self.model.new_sheet().map_err(engine)?;
        Ok(self.sheets().len() as u32 - 1)
    }

    pub fn rename_sheet(&mut self, sheet: u32, name: &str) -> Result<()> {
        self.model.rename_sheet(sheet, name.trim()).map_err(engine)
    }

    pub fn delete_sheet(&mut self, sheet: u32) -> Result<()> {
        if self.sheets().len() <= 1 {
            return Err(SheetError::Engine("un classeur doit garder au moins une feuille".into()));
        }
        self.model.delete_sheet(sheet).map_err(engine)
    }

    /// Saisie d'une cellule, comme dans la barre de formule (« =SOMME(A1:A3) », « 12,5 », texte…).
    pub fn set_input(&mut self, sheet: u32, row: i32, column: i32, input: &str) -> Result<()> {
        CellRange::cell(sheet, row, column).validate()?;
        self.model.set_user_input(sheet, row, column, input).map_err(engine)
    }

    /// Contenu saisi (la formule, pas son résultat).
    pub fn content(&self, sheet: u32, row: i32, column: i32) -> Result<String> {
        self.model.get_cell_content(sheet, row, column).map_err(engine)
    }

    /// Valeur affichée (résultat formaté).
    pub fn display(&self, sheet: u32, row: i32, column: i32) -> Result<String> {
        self.model.get_formatted_cell_value(sheet, row, column).map_err(engine)
    }

    pub fn clear_contents(&mut self, range: CellRange) -> Result<()> {
        range.validate()?;
        self.model.range_clear_contents(&range.area()).map_err(engine)
    }

    pub fn apply_style(&mut self, range: CellRange, change: &StyleChange) -> Result<()> {
        range.validate()?;
        let bool_text = |b: bool| if b { "true" } else { "false" };
        let (path, value): (&str, String) = match change {
            StyleChange::Bold(b) => ("font.b", bool_text(*b).into()),
            StyleChange::Italic(b) => ("font.i", bool_text(*b).into()),
            StyleChange::Underline(b) => ("font.u", bool_text(*b).into()),
            StyleChange::Strike(b) => ("font.strike", bool_text(*b).into()),
            StyleChange::FontColor(c) => ("font.color", c.clone()),
            StyleChange::Fill(c) => ("fill.color", c.clone()),
            StyleChange::Align(a) => (
                "alignment.horizontal",
                match a {
                    Align::General => "general",
                    Align::Left => "left",
                    Align::Center => "center",
                    Align::Right => "right",
                }
                .into(),
            ),
            StyleChange::NumberFormat(f) => ("num_fmt", f.clone()),
        };
        self.model.update_range_style(&range.area(), path, &value).map_err(engine)
    }

    pub fn merge(&mut self, range: CellRange) -> Result<()> {
        range.validate()?;
        self.model.merge_cells(&range.area()).map_err(engine)
    }

    pub fn unmerge(&mut self, range: CellRange) -> Result<()> {
        range.validate()?;
        self.model.unmerge_cells(&range.area()).map_err(engine)
    }

    pub fn insert_rows(&mut self, sheet: u32, row: i32, count: i32) -> Result<()> {
        self.model.insert_rows(sheet, row, count).map_err(engine)
    }

    pub fn delete_rows(&mut self, sheet: u32, row: i32, count: i32) -> Result<()> {
        self.model.delete_rows(sheet, row, count).map_err(engine)
    }

    pub fn insert_columns(&mut self, sheet: u32, column: i32, count: i32) -> Result<()> {
        self.model.insert_columns(sheet, column, count).map_err(engine)
    }

    pub fn delete_columns(&mut self, sheet: u32, column: i32, count: i32) -> Result<()> {
        self.model.delete_columns(sheet, column, count).map_err(engine)
    }

    pub fn set_column_width(&mut self, sheet: u32, column: i32, width_px: f64) -> Result<()> {
        self.model.set_columns_width(sheet, column, column, width_px.clamp(8.0, 2000.0)).map_err(engine)
    }

    pub fn undo(&mut self) -> Result<()> {
        self.model.undo().map_err(engine)
    }

    pub fn redo(&mut self) -> Result<()> {
        self.model.redo().map_err(engine)
    }

    pub fn can_undo(&self) -> bool {
        self.model.can_undo()
    }

    pub fn can_redo(&self) -> bool {
        self.model.can_redo()
    }

    /// Dernière ligne et dernière colonne non vides d'une feuille.
    pub fn used_size(&self, sheet: u32) -> Result<(i32, i32)> {
        let mut rows = 0;
        let mut columns = 0;
        for (row, column) in self.stored_cells(sheet)? {
            if !self.display(sheet, row, column)?.is_empty() || !self.content(sheet, row, column)?.is_empty() {
                rows = rows.max(row);
                columns = columns.max(column);
            }
        }
        Ok((rows, columns))
    }

    /// Cellules affichables d'une plage (la partie visible de la grille).
    pub fn range(&self, range: CellRange) -> Result<RangeView> {
        range.validate()?;
        if range.cells() > MAX_RANGE_CELLS {
            return Err(SheetError::InvalidRange);
        }
        let sheet = range.sheet;
        let mut cells = Vec::new();
        for (row, column) in self.stored_cells_in(range)? {
            let text = self.display(sheet, row, column)?;
            let style = self.style_view(sheet, row, column)?;
            if text.is_empty() && style == CellStyleView::default() {
                continue;
            }
            let numeric = matches!(self.model.get_cell_type(sheet, row, column), Ok(CellType::Number));
            cells.push(CellView { row, column, text, numeric, style });
        }
        cells.sort_by_key(|c| (c.row, c.column));
        let column_widths = (range.left..=range.right)
            .map(|c| self.model.get_column_width(sheet, c).map_err(engine))
            .collect::<Result<_>>()?;
        let row_heights = (range.top..=range.bottom)
            .map(|r| self.model.get_row_height(sheet, r).map_err(engine))
            .collect::<Result<_>>()?;
        Ok(RangeView { sheet, cells, column_widths, row_heights })
    }

    /// Coordonnées des cellules stockées d'une feuille (le moteur ne stocke que les cellules utilisées).
    fn stored_cells(&self, sheet: u32) -> Result<Vec<(i32, i32)>> {
        let worksheet = self.model.get_model().workbook.worksheet(sheet).map_err(engine)?;
        Ok(worksheet.sheet_data.cells().map(|(row, column, _)| (row, column)).collect())
    }

    fn stored_cells_in(&self, range: CellRange) -> Result<Vec<(i32, i32)>> {
        Ok(self
            .stored_cells(range.sheet)?
            .into_iter()
            .filter(|(r, c)| *r >= range.top && *r <= range.bottom && *c >= range.left && *c <= range.right)
            .collect())
    }

    fn style_view(&self, sheet: u32, row: i32, column: i32) -> Result<CellStyleView> {
        let style = self.model.get_cell_style(sheet, row, column).map_err(engine)?;
        let color = |c: &Color| match c {
            Color::None => None,
            other => Some(self.model.resolve_color(other).to_lowercase()),
        };
        let horizontal = style.alignment.as_ref().map(|a| a.horizontal.clone()).unwrap_or(HorizontalAlignment::General);
        let align_set = matches!(
            horizontal,
            HorizontalAlignment::Left
                | HorizontalAlignment::Center
                | HorizontalAlignment::CenterContinuous
                | HorizontalAlignment::Right
        );
        let align = match horizontal {
            HorizontalAlignment::Left => Align::Left,
            HorizontalAlignment::Center | HorizontalAlignment::CenterContinuous => Align::Center,
            HorizontalAlignment::Right => Align::Right,
            _ => match self.model.get_cell_type(sheet, row, column) {
                Ok(CellType::Number) => Align::Right,
                Ok(CellType::LogicalValue | CellType::ErrorValue) => Align::Center,
                _ => Align::General,
            },
        };
        let font_color = color(&style.font.color).filter(|c| c != "#000000");
        Ok(CellStyleView {
            bold: style.font.b,
            italic: style.font.i,
            underline: style.font.u,
            strike: style.font.strike,
            color: font_color,
            fill: color(&style.fill.color),
            align,
            align_set,
        })
    }

    /// Somme, moyenne, nombre… de la sélection, calculés à partir des valeurs du moteur.
    pub fn stats(&self, range: CellRange) -> Result<SelectionStats> {
        range.validate()?;
        let mut stats = SelectionStats { count: 0, numeric_count: 0, sum: 0.0, average: None, min: None, max: None };
        for (row, column) in self.stored_cells_in(range)? {
            match self.model.get_model().get_cell_value_by_index(range.sheet, row, column).map_err(engine)? {
                CellValue::None => {}
                CellValue::Number(n) => {
                    stats.count += 1;
                    stats.numeric_count += 1;
                    stats.sum += n;
                    stats.min = Some(stats.min.map_or(n, |m: f64| m.min(n)));
                    stats.max = Some(stats.max.map_or(n, |m: f64| m.max(n)));
                }
                CellValue::String(s) if s.is_empty() => {}
                _ => stats.count += 1,
            }
        }
        if stats.numeric_count > 0 {
            stats.average = Some(stats.sum / stats.numeric_count as f64);
        }
        Ok(stats)
    }

    /// Copie une plage (formules comprises, pour un collage avec références ajustées).
    pub fn copy(&mut self, range: CellRange) -> Result<Copied> {
        range.validate()?;
        self.select(range)?;
        let clipboard = self.model.copy_to_clipboard().map_err(engine)?;
        let raw: RawClipboard = serde_json::to_value(&clipboard)
            .and_then(serde_json::from_value)
            .map_err(|e| SheetError::Engine(e.to_string()))?;
        Ok(Copied { sheet: raw.sheet, range: raw.range, data: raw.data, text: raw.csv })
    }

    /// Colle à partir de la cellule `target` ; `cut` déplace au lieu de copier.
    pub fn paste(&mut self, target: CellRange, copied: &Copied, cut: bool) -> Result<()> {
        target.validate()?;
        self.select(target)?;
        self.model.paste_from_clipboard(copied.sheet, copied.range, &copied.data, cut).map_err(engine)
    }

    /// Colle un texte venant d'une autre application (tabulations / retours à la ligne).
    pub fn paste_text(&mut self, target: CellRange, text: &str) -> Result<()> {
        target.validate()?;
        self.select(target)?;
        self.model.paste_csv_string(&target.area(), text).map_err(engine)
    }

    fn select(&mut self, range: CellRange) -> Result<()> {
        self.model.set_selected_sheet(range.sheet).map_err(engine)?;
        self.model.set_selected_cell(range.top, range.left).map_err(engine)?;
        self.model.set_selected_range(range.top, range.left, range.bottom, range.right).map_err(engine)
    }
}

/// IronCalc conserve le nom du classeur par référence : on le fixe pour la durée du processus.
/// Les noms sont courts et peu nombreux (un par classeur ouvert).
fn leak(name: &str) -> &'static str {
    static NAMES: std::sync::Mutex<Option<HashMap<String, &'static str>>> = std::sync::Mutex::new(None);
    let mut guard = NAMES.lock().unwrap_or_else(|e| e.into_inner());
    let map = guard.get_or_insert_with(HashMap::new);
    if let Some(existing) = map.get(name) {
        return existing;
    }
    let leaked: &'static str = Box::leak(name.to_owned().into_boxed_str());
    map.insert(name.to_owned(), leaked);
    leaked
}

#[cfg(test)]
mod tests;
