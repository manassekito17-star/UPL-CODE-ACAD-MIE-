import { createContext, useContext } from "react";

import type { Translate } from "./i18n";
import type { Api, Language } from "./ipc";

export interface AppContextValue {
  api: Api;
  t: Translate;
  language: Language;
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
