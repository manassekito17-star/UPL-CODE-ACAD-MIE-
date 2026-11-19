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
};

export type Api = typeof api;
