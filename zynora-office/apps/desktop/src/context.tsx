import { createContext, useContext } from "react";

import type { Translate } from "./i18n";
import type { Api, Language } from "./ipc";

export interface AppContextValue {
  api: Api;
  t: Translate;
  language: Language;
  /** Ouvre un classeur de la bibliothèque dans ZYNORA Sheets. */
  openWorkbook: (path: string) => Promise<void>;
  /** Crée un classeur vide dans un dossier de la bibliothèque et l'ouvre. */
  createWorkbook: (folder: string) => Promise<void>;
  /** Rouvre un document (classeur ou texte) depuis sa copie de récupération. */
  openRecovery: (path: string) => Promise<void>;
  /** Ouvre un document texte (DOCX, TXT) dans ZYNORA Word. */
  openText: (path: string) => Promise<void>;
  /** Crée un document texte vide dans un dossier de la bibliothèque et l'ouvre. */
  createText: (folder: string) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp doit être utilisé dans l'application");
  return value;
}

/** Message lisible d'une erreur venant du backend (ou de l'absence de Tauri). */
export function errorText(error: unknown, t: Translate): string {
  const message = error instanceof Error ? error.message : String(error);
  return message === "not_in_tauri" ? t("error.not_in_tauri") : message;
}

/** Document texte ouvert dans ZYNORA Word (selon l'extension). */
export function isTextPath(path: string): boolean {
  return /\.(docx|txt|odt)$/i.test(path);
}
