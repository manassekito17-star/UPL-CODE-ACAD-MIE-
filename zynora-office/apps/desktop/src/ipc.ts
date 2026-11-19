/**
 * Accès typé aux commandes Rust (src-tauri/src/lib.rs). C'est le seul canal entre
 * l'interface et le système : aucune API Tauri générique n'est autorisée.
 */
import { invoke } from "@tauri-apps/api/core";

export type Theme = "light" | "dark" | "system";
export type Language = "fr" | "en";

export interface Settings {
  theme: Theme;
  language: Language;
}

export type SettingChange = { key: "theme"; value: Theme } | { key: "language"; value: Language };

export interface AppInfo {
  name: string;
  version: string;
  schema_version: number;
  os: string;
  arch: string;
  /** La session précédente ne s'est pas terminée normalement (plantage, coupure). */
  previous_session_interrupted: boolean;
  /** Application mobile : bibliothèque dans l'espace privé de l'application. */
  mobile: boolean;
}

export type EntryKind = "folder" | "text" | "spreadsheet" | "presentation" | "pdf";

/** Élément de la bibliothèque. `path` est relatif à la bibliothèque, séparateur « / ». */
export interface Entry {
  path: string;
  name: string;
  kind: EntryKind;
  size: number;
  modified_ms: number;
}

export interface EntryView extends Entry {
  favorite: boolean;
}

export interface LibraryInfo {
  path: string;
  is_default: boolean;
}

export interface Dashboard {
  recent: EntryView[];
  favorites: EntryView[];
}

export interface ImportOutcome {
  cancelled: boolean;
  imported: Entry[];
  rejected: Array<{ name: string; reason: string }>;
}

export interface TrashItem {
  id: string;
  original_path: string;
  name: string;
  is_dir: boolean;
  size: number;
  deleted_at_ms: number;
}

// --- ZYNORA Sheets -------------------------------------------------------------

export interface CellRange {
  sheet: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type Align = "general" | "left" | "center" | "right";

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  fill?: string;
  align: Align;
  /** Alignement choisi explicitement (sinon alignement par défaut du type de valeur). */
  align_set?: boolean;
  v_align?: VAlign;
  wrap?: boolean;
  font_size?: number;
  font_name?: string;
  /** Bordures prêtes à afficher (« 2px solid #c00000 »). */
  borders?: { top?: string; right?: string; bottom?: string; left?: string };
}

export type VAlign = "top" | "center" | "bottom";
export type BorderPreset = "all" | "outer" | "inner" | "top" | "bottom" | "left" | "right" | "none";
export type BorderLine = "thin" | "medium" | "thick" | "double" | "dotted";

export type FormatOp =
  | { op: "font_name"; name: string }
  | { op: "copy_styles"; source: CellRange }
  | { op: "borders"; preset: BorderPreset; line: BorderLine; color: string }
  | { op: "decimals"; delta: 1 | -1 }
  | { op: "thousands" | "clear_formats" | "clear_all" };

export type DataOp =
  | { op: "sort"; range: CellRange; key: number; ascending: boolean; header: boolean }
  | { op: "remove_duplicates"; range: CellRange; header: boolean };

export interface FindOptions {
  match_case: boolean;
  whole_cell: boolean;
  in_formulas: boolean;
}

export interface FunctionInfo {
  fr: string;
  en: string;
  category: string;
  syntax_fr: string;
  description: string;
}

export interface DefinedName {
  name: string;
  scope: number | null;
  formula: string;
}

export type NameOp =
  | { op: "list" }
  | { op: "add"; name: string; scope: number | null; formula: string }
  | { op: "delete"; name: string; scope: number | null };

export interface CellView {
  row: number;
  column: number;
  /** Valeur affichée, calculée par le moteur. */
  text: string;
  numeric: boolean;
  style: CellStyle;
}

export interface RangeView {
  sheet: number;
  cells: CellView[];
  column_widths: number[];
  row_heights: number[];
}

export interface SheetInfo {
  index: number;
  name: string;
  visible: boolean;
}

export interface BookState {
  dirty: boolean;
  can_undo: boolean;
  can_redo: boolean;
}

export interface WorkbookInfo {
  id: number;
  path: string;
  name: string;
  format: "xlsx" | "csv";
  sheets: SheetInfo[];
  state: BookState;
  recovered: boolean;
}

export interface EditResult<T> {
  value: T;
  state: BookState;
}

export interface SelectionStats {
  count: number;
  numeric_count: number;
  sum: number;
  average: number | null;
  min: number | null;
  max: number | null;
}

export type StyleChange =
  | { kind: "bold" | "italic" | "underline" | "strike"; value: boolean }
  | { kind: "font_color" | "fill" | "number_format"; value: string }
  | { kind: "align"; value: Align }
  | { kind: "font_size" | "font_size_delta"; value: number }
  | { kind: "vertical_align"; value: VAlign }
  | { kind: "wrap"; value: boolean };

export type Structure =
  | { op: "insert_rows" | "delete_rows" | "insert_columns" | "delete_columns"; sheet: number; at: number; count: number }
  | { op: "merge" | "unmerge"; range: CellRange }
  | { op: "column_width"; sheet: number; column: number; width: number };

export type SheetOp = { op: "add" } | { op: "rename"; sheet: number; name: string } | { op: "delete"; sheet: number };

export interface RecoveryRecord {
  path: string;
  file: string;
  saved_at_ms: number;
}

export interface AuditEvent {
  id: number;
  at_ms: number;
  action: string;
  detail: string;
}

export class IpcError extends Error {
  override name = "IpcError";
}

function inTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!inTauri()) {
    throw new IpcError("not_in_tauri");
  }
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error ? String(error.message) : String(error);
    throw new IpcError(message);
  }
}

// --- ZYNORA Word (modèle du moteur packages/document-engine) ---
export type DocParagraphStyle = "normal" | "title" | "heading1" | "heading2" | "heading3" | "quote";
export type DocAlign = "left" | "center" | "right" | "justify";
export interface DocRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  script?: "superscript" | "subscript";
  size_pt?: number;
  font?: string;
  link?: string;
  /** Image placée dans le texte (octets en base64, validés par le cœur Rust). */
  image?: DocImage;
}
export interface DocImage {
  mime: "image/png" | "image/jpeg" | "image/gif";
  data: string;
  width_mm: number;
  height_mm: number;
}
export interface DocParagraph {
  style?: DocParagraphStyle;
  align?: DocAlign;
  list?: { kind: "bullet" | "ordered"; level: number };
  indent_left_mm?: number;
  first_line_mm?: number;
  space_before_pt?: number;
  space_after_pt?: number;
  line_spacing?: number;
  runs: DocRun[];
}
export type DocBlock = ({ type: "paragraph" } & DocParagraph) | { type: "table"; rows: Array<Array<{ paragraphs: DocParagraph[] }>> } | { type: "page_break" };
export interface DocPage {
  orientation: "portrait" | "landscape";
  width_mm: number;
  height_mm: number;
  margin_top_mm: number;
  margin_right_mm: number;
  margin_bottom_mm: number;
  margin_left_mm: number;
}
export interface DocModel {
  page: DocPage;
  blocks: DocBlock[];
}
export interface DocumentInfo {
  path: string;
  name: string;
  format: "docx" | "txt";
  document: DocModel;
  /** Éléments du fichier que ZYNORA ne sait pas réécrire : l'original ne peut pas être remplacé. */
  lost: string[];
  recovered: boolean;
}

export const api = {
  appInfo: () => call<AppInfo>("app_info"),
  getSettings: () => call<Settings>("get_settings"),
  updateSetting: (change: SettingChange) => call<Settings>("update_setting", { change }),
  recentEvents: (limit: number) => call<AuditEvent[]>("recent_events", { limit }),

  libraryInfo: () => call<LibraryInfo>("library_info"),
  /** Ouvre le dialogue natif de choix de dossier ; `null` si l'utilisateur annule. */
  chooseLibrary: () => call<LibraryInfo | null>("choose_library"),
  dashboard: () => call<Dashboard>("dashboard"),
  listFolder: (path: string) => call<EntryView[]>("list_folder", { path }),
  searchDocuments: (query: string) => call<EntryView[]>("search_documents", { query }),
  createFolder: (parent: string, name: string) => call<Entry>("create_folder", { parent, name }),
  renameEntry: (path: string, newName: string) => call<Entry>("rename_entry", { path, newName }),
  /** Ouvre le dialogue natif de sélection de fichiers, puis importe après validation. */
  importDocuments: (folder: string) => call<ImportOutcome>("import_documents", { folder }),
  setFavorite: (path: string, favorite: boolean) => call<boolean>("set_favorite", { path, favorite }),
  trashEntry: (path: string) => call<TrashItem>("trash_entry", { path }),
  listTrash: () => call<TrashItem[]>("list_trash"),
  restoreTrash: (id: string) => call<Entry>("restore_trash", { id }),
  purgeTrash: (id: string) => call<null>("purge_trash", { id }),
  emptyTrash: () => call<number>("empty_trash"),

  sheetsOpen: (path: string) => call<WorkbookInfo>("sheets_open", { path }),
  sheetsCreate: (folder: string) => call<WorkbookInfo>("sheets_create", { folder }),
  sheetsRange: (id: number, range: CellRange, showFormulas = false) => call<RangeView>("sheets_range", { id, range, showFormulas }),
  sheetsCell: (id: number, sheet: number, row: number, column: number) =>
    call<{ content: string; display: string }>("sheets_cell", { id, sheet, row, column }),
  sheetsStats: (id: number, range: CellRange) => call<SelectionStats>("sheets_stats", { id, range }),
  sheetsSetInput: (id: number, sheet: number, row: number, column: number, input: string) =>
    call<EditResult<null>>("sheets_set_input", { id, sheet, row, column, input }),
  sheetsClear: (id: number, range: CellRange) => call<EditResult<null>>("sheets_clear", { id, range }),
  sheetsStyle: (id: number, range: CellRange, change: StyleChange) => call<EditResult<null>>("sheets_style", { id, range, change }),
  sheetsStructure: (id: number, change: Structure) => call<EditResult<null>>("sheets_structure", { id, change }),
  sheetsFormat: (id: number, range: CellRange, change: FormatOp) => call<EditResult<null>>("sheets_format", { id, range, change }),
  sheetsData: (id: number, change: DataOp) => call<EditResult<number>>("sheets_data", { id, change }),
  sheetsFind: (id: number, sheet: number, text: string, options: FindOptions) =>
    call<Array<{ row: number; column: number }>>("sheets_find", { id, sheet, text, options }),
  sheetsReplace: (id: number, sheet: number, text: string, replacement: string, matchCase: boolean) =>
    call<EditResult<number>>("sheets_replace", { id, sheet, text, replacement, matchCase }),
  /** Lit le quadrillage, ou le modifie si `show` est donné. */
  sheetsGridlines: (id: number, sheet: number, show?: boolean) => call<boolean>("sheets_gridlines", { id, sheet, show: show ?? null }),
  sheetsNames: (id: number, change: NameOp) => call<EditResult<DefinedName[]>>("sheets_names", { id, change }),
  sheetsRecalculate: (id: number) => call<null>("sheets_recalculate", { id }),
  sheetsFunctions: () => call<FunctionInfo[]>("sheets_functions"),
  sheetsSheet: (id: number, change: SheetOp) => call<EditResult<SheetInfo[]>>("sheets_sheet", { id, change }),
  sheetsHistory: (id: number, redo: boolean) => call<EditResult<SheetInfo[]>>("sheets_history", { id, redo }),
  sheetsCopy: (id: number, range: CellRange, cut: boolean) => call<string>("sheets_copy", { id, range, cut }),
  sheetsPaste: (id: number, target: CellRange, text: string, cut: boolean) =>
    call<EditResult<null>>("sheets_paste", { id, target, text, cut }),
  sheetsSave: (id: number) => call<BookState>("sheets_save", { id }),
  sheetsAutosave: (id: number) => call<boolean>("sheets_autosave", { id }),
  /** `false` si le classeur a des modifications non enregistrées et `discard` est faux. */
  sheetsClose: (id: number, discard: boolean) => call<boolean>("sheets_close", { id, discard }),
  listRecoveries: () => call<RecoveryRecord[]>("list_recoveries"),
  sheetsOpenRecovery: (path: string) => call<WorkbookInfo>("sheets_open_recovery", { path }),
  wordOpen: (path: string) => call<DocumentInfo>("word_open", { path }),
  wordCreate: (folder: string) => call<DocumentInfo>("word_create", { folder }),
  wordSave: (path: string, document: DocModel) => call<null>("word_save", { path, document }),
  wordSaveCopy: (path: string, name: string, document: DocModel) => call<DocumentInfo>("word_save_copy", { path, name, document }),
  wordAutosave: (path: string, document: DocModel) => call<null>("word_autosave", { path, document }),
  wordOpenRecovery: (path: string) => call<DocumentInfo>("word_open_recovery", { path }),
  /** Dialogue natif de choix d'image (ouvert par Rust) ; `null` si l'utilisateur annule. */
  wordPickImage: (maxWidthMm: number) => call<DocImage | null>("word_pick_image", { maxWidthMm }),
  /** `true` : dialogue d'impression natif ouvert ; `false` : appeler window.print(). */
  printWebview: () => call<boolean>("print_webview"),
  discardRecovery: (path: string) => call<null>("discard_recovery_command", { path }),
};

export type Api = typeof api;
