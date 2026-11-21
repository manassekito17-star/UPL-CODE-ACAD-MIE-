/**
 * Historique des versions du code, gardé sur l'appareil (localStorage), par éditeur et par fichier.
 * Une version est ajoutée à chaque exécution, enregistrement, correction automatique ou restauration
 * (sauf si le code n'a pas changé depuis la dernière version).
 */

export interface Version {
  at: number;
  code: string;
  reason: string;
}

const PREFIX = "zentech:historique:";
const MAX = 40;
const MAX_CODE = 200_000;
export const HISTORY_EVENT = "zentech:historique";

function read(key: string): Version[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const list = raw ? (JSON.parse(raw) as Version[]) : [];
    return Array.isArray(list) ? list.filter((v) => v && typeof v.code === "string" && typeof v.at === "number") : [];
  } catch {
    return [];
  }
}

/** Versions du plus récent au plus ancien. */
export function listVersions(key: string): Version[] {
  return read(key).sort((a, b) => b.at - a.at);
}

/** Ajoute une version ; ignorée si le code est vide, trop long ou identique à la dernière. */
export function recordVersion(key: string, code: string, reason: string): boolean {
  if (!code.trim() || code.length > MAX_CODE) return false;
  const list = read(key);
  const last = list.reduce<Version | null>((m, v) => (!m || v.at > m.at ? v : m), null);
  if (last && last.code === code) return false;
  // Heures strictement croissantes : deux versions gardées dans la même milliseconde restent dans l'ordre.
  const at = Math.max(Date.now(), (last?.at ?? 0) + 1);
  const next = [...list, { at, code, reason }].sort((a, b) => a.at - b.at).slice(-MAX);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(next));
  } catch {
    // Stockage plein : on retire les plus anciennes versions de ce fichier et on réessaie une fois.
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(next.slice(-10)));
    } catch {
      return false;
    }
  }
  try {
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT, { detail: key }));
  } catch {
    /* hors navigateur */
  }
  return true;
}

export function clearVersions(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignoré */
  }
}

/** Lignes ajoutées / retirées entre deux versions (comparaison simple, ligne par ligne). */
export function diffStats(before: string, after: string): { added: number; removed: number } {
  const a = before.split("\n");
  const b = after.split("\n");
  const count = (xs: string[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
  const ca = count(a);
  const cb = count(b);
  let added = 0;
  let removed = 0;
  for (const [l, n] of cb) added += Math.max(0, n - (ca.get(l) ?? 0));
  for (const [l, n] of ca) removed += Math.max(0, n - (cb.get(l) ?? 0));
  return { added, removed };
}

export function formatWhen(at: number, now = Date.now()): string {
  const d = new Date(at);
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const today = new Date(now);
  if (d.toDateString() === today.toDateString()) return `Aujourd'hui à ${time}`;
  const yesterday = new Date(now - 86_400_000);
  if (d.toDateString() === yesterday.toDateString()) return `Hier à ${time}`;
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${time}`;
}
