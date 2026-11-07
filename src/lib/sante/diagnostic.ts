/**
 * Diagnostic de configuration, sans jamais révéler de secret : on ne renvoie
 * que des faits (présence, format, rôle annoncé par la clé publique, résultat
 * d'une lecture publique).
 */
export type KeyKind = "absente" | "publishable" | "secret" | "jwt-anon" | "jwt-service_role" | "jwt-autre" | "illisible";

/** Nature d'une clé Supabase d'après son format (la valeur elle-même n'est jamais renvoyée). */
export function keyKind(key: string): KeyKind {
  if (!key) return "absente";
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("sb_secret_")) return "secret";
  const parts = key.split(".");
  if (parts.length !== 3) return "illisible";
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as { role?: unknown };
    if (payload.role === "anon") return "jwt-anon";
    if (payload.role === "service_role") return "jwt-service_role";
    return "jwt-autre";
  } catch {
    return "illisible";
  }
}

/** Identifiant du projet annoncé par une clé JWT (champ « ref »), ou null. */
export function keyRef(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as { ref?: unknown };
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    return null;
  }
}

/** Identifiant du projet d'après l'URL https://<ref>.supabase.co, ou null. */
export function urlRef(url: string): string | null {
  return /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url.trim())?.[1] ?? null;
}

/** Problèmes de saisie courants : espaces, guillemets, retour à la ligne, nom collé dans la valeur. */
export function inputIssues(value: string | undefined): string[] {
  if (!value) return [];
  const issues: string[] = [];
  if (value !== value.trim()) issues.push("espace ou retour à la ligne au début ou à la fin");
  if (/^["']|["']$/.test(value.trim())) issues.push("guillemets autour de la valeur");
  if (/\s/.test(value.trim())) issues.push("espace à l'intérieur de la valeur");
  if (/^[A-Z_]+[= ]/.test(value.trim())) issues.push("le nom de la variable semble collé dans la valeur");
  return issues;
}

/** L'URL du projet doit être de la forme https://<ref>.supabase.co (sans chemin). */
export function urlIssues(url: string | undefined): string[] {
  if (!url) return ["absente"];
  const issues = inputIssues(url);
  const local = /^http:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(url.trim()); // Supabase local (développement)
  if (!local && !/^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/.test(url.trim())) issues.push("format attendu : https://<identifiant>.supabase.co");
  return issues;
}
