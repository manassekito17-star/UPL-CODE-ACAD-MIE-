import { closest } from "@/lib/larp/hints";

export { closest };

/** Une correction appliquée par « Corriger le code ». */
export interface Change {
  /** Numéro de ligne (1 = première) dans le code corrigé. */
  line: number;
  why: string;
}

export interface FixResult {
  code: string;
  changes: Change[];
  /** true : le code corrigé n'a plus d'erreur de syntaxe ; null : impossible à vérifier sans l'exécuter. */
  compiles: boolean | null;
}

/** Erreur connue (message + ligne, 1 = première) ou null si le code est correct. */
export type Checker = (code: string) => { message: string; line: number } | null;

/** Une correction d'une erreur précise ; null si on ne sait pas la réparer à coup sûr. */
export type Rule = (message: string, lines: string[], idx: number) => { lines: string[]; line: number; why: string } | null;

export const indentOf = (s: string) => /^\s*/.exec(s)![0];
export const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Remplace le mot entier `from` par `to` (première occurrence, hors chaînes) ; null s'il est absent. */
export function replaceWord(line: string, from: string, to: string, comment?: "#" | "//"): string | null {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_.])${esc(from)}(?![\\p{L}\\p{N}_])`, "u");
  let done = false;
  const out = mapOutsideStrings(
    line,
    (part) => {
      if (done || !re.test(part)) return part;
      done = true;
      return part.replace(re, `$1${to}`);
    },
    comment,
  );
  return done ? out : null;
}

/** Applique `f` aux morceaux de la ligne situés hors des chaînes "…" et '…' (et avant un commentaire `#`/`//` si `comment` est donné). */
export function mapOutsideStrings(line: string, f: (part: string) => string, comment?: "#" | "//"): string {
  let out = "";
  let buf = "";
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      buf += c;
      if (c === "\\") {
        buf += line[++i] ?? "";
        continue;
      }
      if (c === quote) {
        out += buf;
        buf = "";
        quote = null;
      }
      continue;
    }
    if (comment && line.startsWith(comment, i)) {
      out += f(buf) + line.slice(i);
      return out;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += f(buf);
      buf = c;
      quote = c;
      continue;
    }
    buf += c;
  }
  return out + (quote ? buf : f(buf));
}

/** Guillemet ouvert et jamais fermé sur la ligne (ou null). */
export function unclosedQuote(line: string, comment?: "#" | "//"): string | null {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (comment && line.startsWith(comment, i)) return null;
    if (c === '"' || c === "'") quote = c;
  }
  return quote;
}

/** Parenthèses / crochets ouverts et non fermés sur la ligne (hors chaînes), dans l'ordre de fermeture. */
export function unclosedBrackets(line: string, comment?: "#" | "//"): string {
  const stack: string[] = [];
  const pairs: Record<string, string> = { "(": ")", "[": "]" };
  let bad = false;
  mapOutsideStrings(
    line,
    (part) => {
      for (const c of part) {
        if (pairs[c]) stack.push(pairs[c]);
        else if (c === ")" || c === "]") {
          if (stack[stack.length - 1] === c) stack.pop();
          else bad = true;
        }
      }
      return part;
    },
    comment,
  );
  return bad ? "" : stack.reverse().join("");
}

/**
 * Corrige le code erreur par erreur : `check` trouve l'erreur, `rule` la répare, jusqu'à ce que le code
 * soit correct ou qu'aucune correction sûre ne soit possible.
 */
export function fixLoop(code: string, check: Checker, rule: Rule, initial: { lines: string[]; changes: Change[] } = { lines: code.split("\n"), changes: [] }): FixResult | null {
  let lines = initial.lines;
  const changes = [...initial.changes];
  const seen = new Set<string>();
  let ok = false;
  for (let i = 0; i < 40; i++) {
    const current = lines.join("\n");
    if (seen.has(current)) break;
    seen.add(current);
    const err = check(current);
    if (!err) {
      ok = true;
      break;
    }
    const fix = rule(err.message, lines, Math.max(0, err.line - 1));
    if (!fix) break;
    if (fix.lines.length > lines.length) for (const c of changes) if (c.line - 1 >= fix.line) c.line += fix.lines.length - lines.length;
    changes.push({ line: fix.line + 1, why: fix.why });
    lines = fix.lines;
  }
  if (!changes.length) return null;
  return { code: lines.join("\n"), changes: mergeChanges(changes), compiles: ok || !check(lines.join("\n")) };
}

/** Plusieurs corrections sur la même ligne : une seule entrée. */
export function mergeChanges(changes: Change[]): Change[] {
  const merged: Change[] = [];
  for (const c of changes) {
    const prev = merged.find((m) => m.line === c.line);
    if (prev) prev.why += ` ; ${c.why}`;
    else merged.push({ ...c });
  }
  return merged.sort((a, b) => a.line - b.line);
}

/** Insère `closer` à la fin du bloc ouvert par la dernière ligne qui correspond à `opener` avant `idx`. */
export function insertCloser(lines: string[], idx: number, opener: RegExp, closer: string): { lines: string[]; line: number; why: string } {
  let open = idx - 1;
  while (open >= 0 && !opener.test(lines[open])) open--;
  const indent = open >= 0 ? indentOf(lines[open]) : indentOf(lines[idx] ?? "");
  let at = Math.min(idx, lines.length);
  if (open >= 0)
    for (let j = open + 1; j < at; j++)
      if (lines[j].trim() && indentOf(lines[j]).length <= indent.length) {
        at = j;
        break;
      }
  const out = [...lines];
  out.splice(at, 0, `${indent}${closer}`);
  return { lines: out, line: at, why: `${closer} ajouté pour fermer le bloc${open >= 0 ? ` de la ligne ${open + 1}` : ""}` };
}
