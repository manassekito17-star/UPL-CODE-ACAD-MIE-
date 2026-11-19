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
}

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
  | { kind: "align"; value: Align };

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
  sheetsRange: (id: number, range: CellRange) => call<RangeView>("sheets_range", { id, range }),
  sheetsCell: (id: number, sheet: number, row: number, column: number) =>
    call<{ content: string; display: string }>("sheets_cell", { id, sheet, row, column }),
  sheetsStats: (id: number, range: CellRange) => call<SelectionStats>("sheets_stats", { id, range }),
  sheetsSetInput: (id: number, sheet: number, row: number, column: number, input: string) =>
    call<EditResult<null>>("sheets_set_input", { id, sheet, row, column, input }),
  sheetsClear: (id: number, range: CellRange) => call<EditResult<null>>("sheets_clear", { id, range }),
  sheetsStyle: (id: number, range: CellRange, change: StyleChange) => call<EditResult<null>>("sheets_style", { id, range, change }),
  sheetsStructure: (id: number, change: Structure) => call<EditResult<null>>("sheets_structure", { id, change }),
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
  discardRecovery: (path: string) => call<null>("discard_recovery_command", { path }),
};

export type Api = typeof api;
