//! Liaison WebAssembly des moteurs ZYNORA : le même code Rust que l'application de bureau,
//! exécuté dans le navigateur (version web, sans serveur bureautique).
//!
//! Les erreurs sont renvoyées comme exceptions JavaScript portant le message du moteur.

use wasm_bindgen::prelude::*;
use zynora_document_engine as doc;
use zynora_spreadsheet_engine::{FormulaLanguage, Workbook as Engine};

fn js_error(e: impl std::fmt::Display) -> JsError {
    JsError::new(&e.to_string())
}

fn language(code: &str) -> FormulaLanguage {
    if code.eq_ignore_ascii_case("en") { FormulaLanguage::En } else { FormulaLanguage::Fr }
}

/// Classeur ouvert dans le navigateur (moteur IronCalc via `zynora-spreadsheet-engine`).
#[wasm_bindgen]
pub struct Workbook {
    inner: Engine,
}

#[wasm_bindgen]
impl Workbook {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, lang: &str) -> Result<Workbook, JsError> {
        Ok(Self { inner: Engine::new(name, language(lang)).map_err(js_error)? })
    }

    #[wasm_bindgen(js_name = fromXlsx)]
    pub fn from_xlsx(bytes: &[u8], name: &str, lang: &str) -> Result<Workbook, JsError> {
        Ok(Self { inner: Engine::from_xlsx(bytes, name, language(lang)).map_err(js_error)? })
    }

    #[wasm_bindgen(js_name = toXlsx)]
    pub fn to_xlsx(&self) -> Result<Vec<u8>, JsError> {
        self.inner.to_xlsx().map_err(js_error)
    }

    /// Saisie d'une cellule (valeur ou formule) ; lignes et colonnes à partir de 1.
    #[wasm_bindgen(js_name = setInput)]
    pub fn set_input(&mut self, sheet: u32, row: i32, column: i32, input: &str) -> Result<(), JsError> {
        self.inner.set_input(sheet, row, column, input).map_err(js_error)
    }

    /// Valeur affichée, calculée par le moteur.
    pub fn display(&self, sheet: u32, row: i32, column: i32) -> Result<String, JsError> {
        self.inner.display(sheet, row, column).map_err(js_error)
    }

    /// Feuilles du classeur (JSON).
    pub fn sheets(&self) -> Result<String, JsError> {
        serde_json::to_string(&self.inner.sheets()).map_err(js_error)
    }
}

/// Lit un DOCX : `{ document, lost }` en JSON (mêmes règles que le bureau, pertes signalées).
#[wasm_bindgen(js_name = docxToJson)]
pub fn docx_to_json(bytes: &[u8]) -> Result<String, JsError> {
    serde_json::to_string(&doc::from_docx(bytes).map_err(js_error)?).map_err(js_error)
}

/// Écrit un DOCX à partir du modèle JSON (revalidé : liens, couleurs, images, dimensions).
#[wasm_bindgen(js_name = jsonToDocx)]
pub fn json_to_docx(json: &str) -> Result<Vec<u8>, JsError> {
    let document: doc::Document = serde_json::from_str(json).map_err(js_error)?;
    doc::to_docx(&document).map_err(js_error)
}
