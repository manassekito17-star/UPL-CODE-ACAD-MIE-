import { closest, distance } from "./hints";
import { compileProject } from "./interpreter";
import { KEYWORDS, norm } from "./lexer";
import { BUILTIN_NAMES } from "./builtins";

/**
 * « Corriger le code » : l'éditeur réécrit le module en corrigeant les erreurs de syntaxe
 * qu'il sait réparer à coup sûr (fautes de frappe, mot oublié, virgule, guillemet, FINSI…),
 * une erreur après l'autre, jusqu'à ce que le module compile.
 */

export interface Change {
  /** Numéro de ligne (1 = première) dans le code corrigé. */
  line: number;
  before: string;
  after: string;
  why: string;
}

type Module = { name: string; main: boolean; code: string };

const STATEMENTS = ["ÉCRIRE", "LIRE", "SI", "SINON", "FINSI", "POUR", "FINPOUR", "TANTQUE", "FINTANTQUE", "RÉPÉTER", "EXÉCUTER", "RETOURNER", "DÉBUT", "FIN"];
const FUNCTIONS = ["ABSOLU", "ALÉATOIRE", "ARRONDIR", "CHAÎNE", "COMPTER", "COSINUS", "ENTIER", "FLOTTANT", "LONGUEUR", "MAJUSCULES", "MAXIMUM", "MINIMUM", "MINUSCULES", "PLAFOND", "PLANCHER", "POSITION", "RACINE", "SINUS", "SOUSENSEMBLE", "TAILLE", "TANGENTE", "TRONQUER"];
const OPENER: Record<string, RegExp> = {
  FINSI: /^\s*SI\b/i,
  FINPOUR: /^\s*POUR\b/i,
  FINTANTQUE: /^\s*TANT\s*QUE\b/i,
};

const quoted = (message: string, after: string) => new RegExp(`${after}\\s*«\\s*([^»]+?)\\s*»`).exec(message)?.[1] ?? null;
const indentOf = (s: string) => /^\s*/.exec(s)![0];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Remplace le mot `from` (mot entier, sans tenir compte de la casse) par `to`, la première fois. */
function replaceWord(line: string, from: string, to: string): string | null {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_])${esc(from)}(?![\\p{L}\\p{N}_])`, "iu");
  return re.test(line) ? line.replace(re, `$1${to}`) : null;
}

/** Une correction pour l'erreur donnée, ou null si on ne sait pas la réparer à coup sûr. */
function fixOnce(message: string, lines: string[], idx: number, modules: string[]): { lines: string[]; line: number; why: string } | null {
  const line = lines[idx] ?? "";
  const set = (text: string, why: string) => {
    if (text === line) return null;
    const out = [...lines];
    out[idx] = text;
    return { lines: out, line: idx, why };
  };

  const fn = quoted(message, "Module ou fonction");
  if (fn) {
    const guess = closest(fn, [...FUNCTIONS, ...BUILTIN_NAMES, ...modules]);
    const r = guess && replaceWord(line, fn, guess);
    return r ? set(r, `${fn} → ${guess}`) : null;
  }
  const ins = quoted(message, "Instruction inconnue");
  if (ins) {
    const guess = closest(ins, STATEMENTS);
    const r = guess && replaceWord(line, ins, guess);
    return r ? set(r, `${ins} → ${guess}`) : null;
  }

  const exp = /^(?:«\s*)?([^\s»]+)(?:\s*»)? attendu, trouvé (.+)\.$/.exec(message);
  if (exp) {
    const [, want, found] = exp;
    const raw = /«\s*(.+?)\s*»/.exec(found)?.[1];
    // Faute de frappe sur le mot attendu (FAIR → FAIRE, ALOR → ALORS).
    if (raw && !KEYWORDS.has(norm(raw)) && /^[\p{L}']+$/u.test(raw) && distance(norm(raw), norm(want)) <= 2) {
      const r = replaceWord(line, raw, want);
      if (r) return set(r, `${raw} → ${want}`);
    }
    // Mot oublié en fin de ligne.
    if ((want === "ALORS" || want === "FAIRE") && found === "fin de ligne") return set(`${line.replace(/\s+$/, "")} ${want}`, `${want} ajouté`);
    // Bloc non fermé : FINSI / FINPOUR / FINTANTQUE ajouté avant la ligne trouvée.
    const opener = OPENER[norm(want)];
    if (opener) {
      let open = idx - 1;
      while (open >= 0 && !opener.test(lines[open])) open--;
      const indent = open >= 0 ? indentOf(lines[open]) : indentOf(line);
      // Le bloc se termine à la première ligne qui n'est plus décalée par rapport à son ouverture.
      let at = idx;
      if (open >= 0)
        for (let j = open + 1; j < idx; j++)
          if (lines[j].trim() && indentOf(lines[j]).length <= indent.length) {
            at = j;
            break;
          }
      const out = [...lines];
      out.splice(at, 0, `${indent}${want}`);
      return { lines: out, line: at, why: `${want} ajouté pour fermer le bloc${open >= 0 ? ` de la ligne ${open + 1}` : ""}` };
    }
    if (want === ")" && found === "fin de ligne") return set(`${line.replace(/\s+$/, "")})`, "parenthèse fermée");
    if (want === "]" && found === "fin de ligne") return set(`${line.replace(/\s+$/, "")}]`, "crochet fermé");
    return null;
  }

  if (/Fin d'instruction attendue/.test(message)) {
    const raw = quoted(message, "trouvé");
    const first = /^\s*([\p{L}']+)/u.exec(line)?.[1];
    const guess = first && !STATEMENTS.some((k) => norm(k) === norm(first)) ? closest(first, STATEMENTS) : null;
    if (first && guess) {
      const r = replaceWord(line, first, guess);
      if (r) return set(r, `${first} → ${guess}`);
    }
    if (raw === ";") return set(line.replace(/;\s*$/, "").replace(/;/, " "), "point-virgule retiré");
    // ÉCRIRE / LIRE : virgule oubliée entre deux éléments.
    if (raw && /^\s*(ÉCRIRE|ECRIRE|AFFICHER|LIRE|SAISIR)\b/i.test(line)) {
      const start = /^\s*\S+\s*/.exec(line)![0].length;
      let at = line.indexOf(raw, start + 1);
      if (at > 0 && /["']/.test(line[at - 1])) at--;
      if (at > start) return set(`${line.slice(0, at).replace(/\s+$/, "")}, ${line.slice(at)}`, "virgule ajoutée");
    }
    return null;
  }
  if (/Chaîne de caractères non terminée/.test(message)) {
    const q = /["']/.exec(line.slice(line.search(/["']/)))?.[0] ?? '"';
    return set(`${line.replace(/\s+$/, "")}${q}`, "guillemet fermé");
  }
  const ch = quoted(message, "Caractère inattendu");
  if (ch) {
    if (ch === ";") return set(line.replace(/;/g, ""), "point-virgule retiré");
    if ("“”«»".includes(ch)) return set(line.replace(/[“”«»]/g, '"'), "guillemets remplacés par \"");
    if (ch === "{" || ch === "}") return set(line.replace(/[{}]/g, "").replace(/\s+$/, ""), "accolade retirée");
    return null;
  }
  if (/Aucune instruction ne peut suivre FIN/.test(message)) {
    // FIN écrit à la place de FINSI/FINPOUR… : rien de sûr, on laisse l'étudiant décider.
    return null;
  }
  return null;
}

/**
 * Corrige le module `name` du projet. Renvoie le code corrigé et la liste des changements,
 * ou null si aucune correction sûre n'est possible. `compiles` dit si le module compile ensuite.
 */
export function autoFix(modules: Module[], name: string): { code: string; changes: Change[]; compiles: boolean } | null {
  const target = modules.find((m) => norm(m.name) === norm(name));
  if (!target) return null;
  let lines = target.code.split("\n");
  const changes: Change[] = [];
  const seen = new Set<string>();
  const others = modules.filter((m) => !m.main && m !== target).map((m) => m.name);
  for (let i = 0; i < 30; i++) {
    const code = lines.join("\n");
    if (seen.has(code)) break;
    seen.add(code);
    const res = compileProject(modules.map((m) => (m === target ? { ...m, code } : m)));
    if (res.ok || norm(res.error.module) !== norm(name)) break;
    const fix = fixOnce(res.error.message, lines, res.error.line - 1, others);
    if (!fix) break;
    const inserted = fix.lines.length > lines.length;
    // Une ligne ajoutée décale les lignes déjà corrigées en dessous.
    if (inserted) for (const c of changes) if (c.line - 1 >= fix.line) c.line++;
    changes.push({ line: fix.line + 1, before: inserted ? "" : lines[fix.line], after: fix.lines[fix.line], why: fix.why });
    lines = fix.lines;
  }
  if (!changes.length) return null;
  // Plusieurs corrections sur la même ligne : une seule entrée (avant → après).
  const merged: Change[] = [];
  for (const c of changes) {
    const prev = merged.find((m) => m.line === c.line);
    if (prev) prev.why += ` ; ${c.why}`;
    else merged.push({ ...c, after: lines[c.line - 1] });
  }
  merged.sort((a, b) => a.line - b.line);
  changes.splice(0, changes.length, ...merged);
  const code = lines.join("\n");
  const compiles = compileProject(modules.map((m) => (m === target ? { ...m, code } : m))).ok;
  return { code, changes, compiles };
}
