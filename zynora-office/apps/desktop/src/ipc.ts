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
};

export type Api = typeof api;
