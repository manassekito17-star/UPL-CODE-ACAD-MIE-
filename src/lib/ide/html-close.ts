/** Balises HTML sans balise de fermeture. */
export const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/**
 * Balise à fermer automatiquement quand on vient de taper « > » :
 * `before` est le texte de la ligne jusqu'au curseur, `after` la suite.
 * Renvoie le nom de la balise, ou null (balise vide, auto-fermante, déjà fermée, commentaire…).
 */
export function tagToClose(before: string, after: string): string | null {
  const m = /<([a-zA-Z][a-zA-Z0-9-]*)(?:\s+(?:[^<>"']|"[^"]*"|'[^']*')*)?>$/.exec(before);
  if (!m || before.endsWith("/>")) return null;
  const tag = m[1];
  if (VOID_TAGS.has(tag.toLowerCase())) return null;
  if (after.trimStart().toLowerCase().startsWith(`</${tag.toLowerCase()}>`)) return null;
  return tag;
}

/**
 * Touche d'attribut (class, id) pressée juste après une balise ouvrante (« <div>| ») :
 * nombre de caractères à reculer pour écrire l'attribut dans la balise (« <div class=""> »), ou 0.
 */
export function attributeBacktrack(before: string): number {
  return /<[a-zA-Z][a-zA-Z0-9-]*(?:\s+(?:[^<>"']|"[^"]*"|'[^']*')*)?>$/.test(before) && !before.endsWith("/>") ? 1 : 0;
}
