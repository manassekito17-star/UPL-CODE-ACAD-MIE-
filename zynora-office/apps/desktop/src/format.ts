import type { EntryKind, Language } from "./ipc";

const UNITS = { fr: ["o", "Ko", "Mo", "Go"], en: ["B", "KB", "MB", "GB"] } as const;

export function formatSize(bytes: number, language: Language): string {
  const units = UNITS[language];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}

export function dateFormatter(language: Language): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/** Phase de la feuille de route où arrive l'éditeur de ce type (ROADMAP.md). */
export function editorPhase(kind: EntryKind): number | null {
  switch (kind) {
    case "spreadsheet":
      return 2;
    case "text":
      return 3;
    case "presentation":
      return 4;
    default:
      return null;
  }
}

export function parentPath(path: string): string {
  const index = path.lastIndexOf("/");
  return index < 0 ? "" : path.slice(0, index);
}
