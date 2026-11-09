/**
 * Chemin de retour après connexion (« ?suite= ») : uniquement une page de ce site.
 * Refuse les adresses absolues, « //autre-site », « /\autre-site » (lu « // » par les navigateurs),
 * les caractères de contrôle et les schémas (javascript:, data:…).
 */
export function safeRedirectPath(value: unknown, fallback = "/tableau-de-bord"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 500) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = "https://upl.invalid";
    const u = new URL(value, base);
    if (u.origin !== base) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
