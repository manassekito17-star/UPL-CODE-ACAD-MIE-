/**
 * « Aller à n'importe quoi » (Ctrl+P) : un fichier, puis @symbole, :ligne ou #mot.
 * Exemples : « main », « main@calcul », « style:12 », « :40 », « @ », « #total ».
 */
export interface GotoQuery {
  file: string;
  mode: "fichier" | "symbole" | "ligne" | "mot";
  /** Texte après @ ou # ; numéro de ligne après : */
  rest: string;
  line: number | null;
  column: number | null;
}

export function parseGoto(input: string): GotoQuery {
  const m = /^([^@:#]*)([@:#])?(.*)$/.exec(input.trim())!;
  const file = m[1].trim();
  const sign = m[2];
  const rest = (m[3] ?? "").trim();
  if (sign === ":") {
    const lc = /^(\d+)(?::(\d+))?/.exec(rest);
    return { file, mode: "ligne", rest, line: lc ? Number(lc[1]) : null, column: lc?.[2] ? Number(lc[2]) : null };
  }
  if (sign === "@") return { file, mode: "symbole", rest, line: null, column: null };
  if (sign === "#") return { file, mode: "mot", rest, line: null, column: null };
  return { file, mode: "fichier", rest: "", line: null, column: null };
}

/** Score « flou » : toutes les lettres dans l'ordre ; bonus en début de mot et pour les lettres consécutives. -1 si absent. */
export function fuzzy(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return 0;
  const t = text.toLowerCase();
  let score = 0;
  let qi = 0;
  let prev = -2;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] !== q[qi]) continue;
    score += 1;
    if (i === 0 || /[\s/._\-:(]/.test(t[i - 1])) score += 4;
    if (prev === i - 1) score += 3;
    prev = i;
    qi++;
  }
  if (qi < q.length) return -1;
  if (t.startsWith(q)) score += 10;
  return score - t.length * 0.01;
}

/** Positions des lettres trouvées (pour les mettre en gras dans la liste). */
export function fuzzyPositions(query: string, text: string): number[] {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  const out: number[] = [];
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++)
    if (t[i] === q[qi]) {
      out.push(i);
      qi++;
    }
  return qi === q.length ? out : [];
}

/** Trie une liste par score flou décroissant (éléments absents retirés). */
export function rank<T>(query: string, items: T[], text: (x: T) => string, max = 60): T[] {
  if (!query.trim()) return items.slice(0, max);
  return items
    .map((x) => ({ x, s: fuzzy(query, text(x)) }))
    .filter((r) => r.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map((r) => r.x);
}
