import type { LanguageId, Level } from "@/content/types";

export const LEVEL_TONES: Record<Level, "vert" | "orange" | "rouge"> = {
  debutant: "vert",
  intermediaire: "orange",
  avance: "rouge",
};

export const LANGUAGE_COLORS: Record<LanguageId, string> = {
  pseudocode: "from-cyan-500 to-electrique-600",
  python: "from-electrique-500 to-yellow-400",
  c: "from-slate-500 to-electrique-700",
  javascript: "from-yellow-400 to-amber-500",
  java: "from-orange-500 to-red-600",
  html: "from-orange-500 to-amber-400",
  css: "from-electrique-600 to-cyan-accent",
};

export const LANGUAGE_INITIALS: Record<LanguageId, string> = {
  pseudocode: "ALG",
  python: "PY",
  c: "C",
  javascript: "JS",
  java: "JV",
  html: "HTML",
  css: "CSS",
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
