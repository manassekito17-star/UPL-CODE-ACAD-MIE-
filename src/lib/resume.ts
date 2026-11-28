/**
 * « Reprendre là où j'en étais » : la dernière page de travail (éditeur, projet, leçon…) est gardée
 * sur l'appareil. Quand l'application installée est rouverte, elle revient directement à cette page.
 */
export const RESUME_KEY = "zentech:reprendre";
export const RESUME_MAX_AGE = 30 * 86_400_000;

export type ResumeApp = "site" | "ide" | "editeur";
interface Entry {
  url: string;
  at: number;
}
export interface ResumeState {
  last?: Entry;
  apps?: Partial<Record<ResumeApp, Entry>>;
}

/** Pages qu'on ne « reprend » pas (connexion, page d'accueil, reprise elle-même…). */
const SKIP = /^\/(?:$|reprendre|connexion|inscription|auth\/|mot-de-passe-oublie|reinitialiser-mot-de-passe|compte-suspendu|acces-refuse|avis-important|telecharger)/;

export function appOf(path: string): ResumeApp {
  if (path === "/ide" || path.startsWith("/ide/") || path.startsWith("/ide?")) return "ide";
  if (path === "/editeur" || path.startsWith("/editeur?") || path.startsWith("/editeur/")) return "editeur";
  return "site";
}

/** Nouvel état après la visite de `url` (chemin + paramètres, ex. « /ide?projet=… »). */
export function remember(state: ResumeState, url: string, now: number): ResumeState {
  if (!url.startsWith("/") || url.startsWith("//") || SKIP.test(url.split("?")[0])) return state;
  const entry = { url, at: now };
  return { last: entry, apps: { ...state.apps, [appOf(url)]: entry } };
}

/** Page à rouvrir : celle de l'application demandée (IDE, Algo), sinon la dernière page ; null si trop ancienne. */
export function target(state: ResumeState, app: ResumeApp | null, now: number): string | null {
  const e = app && app !== "site" ? state.apps?.[app] : state.last;
  if (!e || typeof e.url !== "string" || now - e.at > RESUME_MAX_AGE || !e.url.startsWith("/") || e.url.startsWith("//")) return null;
  return e.url;
}

export function readResume(): ResumeState {
  try {
    const raw = JSON.parse(localStorage.getItem(RESUME_KEY) ?? "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function writeResume(state: ResumeState) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible */
  }
}

/** Page d'ouverture par défaut de chaque application installée. */
export const DEFAULT_START: Record<ResumeApp, string> = { site: "/tableau-de-bord", ide: "/ide", editeur: "/editeur?langage=pseudocode" };
