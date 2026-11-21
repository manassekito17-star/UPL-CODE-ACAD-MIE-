import { BUILTIN_NAMES, checkPseudocode } from "@/lib/pseudocode";
import { norm } from "@/lib/larp/lexer";
import { closest, fixLoop, insertCloser, mapOutsideStrings, replaceWord, unclosedQuote, type Change, type FixResult, type Rule } from "./common";

/** Correction automatique du pseudo-code de ZENTECH Algo (moteur de /editeur et du laboratoire). */

const STATEMENTS = ["ECRIRE", "LIRE", "AFFICHER", "RETOURNER"];
const OPENERS: Record<string, RegExp> = {
  FINSI: /^\s*SI\b/i,
  FINPOUR: /^\s*POUR\b/i,
  FINTANTQUE: /^\s*TANT\s*_?QUE\b/i,
  FINFONCTION: /^\s*FONCTION\b/i,
  FINPROCEDURE: /^\s*PROC[EÉ]DURE\b/i,
  FINSELON: /^\s*SELON\b/i,
};

/** Fonctions et procédures écrites par l'étudiant. */
const userRoutines = (code: string) => [...code.matchAll(/^\s*(?:FONCTION|PROC[EÉ]DURE)\s+([\p{L}_][\p{L}\p{N}_]*)/gimu)].map((m) => m[1]);

const callCandidates = (code: string) => [...STATEMENTS, ...BUILTIN_NAMES, ...userRoutines(code)];

/** Appels `NOM(` dont le nom n'existe pas mais ressemble à une fonction connue (ECRIR( → ECRIRE(). */
function fixCalls(lines: string[]): { lines: string[]; changes: Change[] } {
  const known = new Set(callCandidates(lines.join("\n")).map(norm));
  const changes: Change[] = [];
  const out = lines.map((line, i) => {
    let changed = line;
    const whys: string[] = [];
    changed = mapOutsideStrings(changed, (part) =>
      part.replace(/([\p{L}_][\p{L}\p{N}_]*)(\s*\()/gu, (m, name: string, paren: string) => {
        if (known.has(norm(name))) return m;
        const guess = closest(name, callCandidates(lines.join("\n")));
        if (!guess) return m;
        whys.push(`${name} → ${guess}`);
        return guess + paren;
      }),
    );
    if (whys.length) changes.push({ line: i + 1, why: whys.join(" ; ") });
    return changed;
  });
  return { lines: out, changes };
}

const rule =
  (code: string): Rule =>
  (message, lines, idx) => {
    const line = lines[idx] ?? "";
    const set = (text: string, why: string) => {
      if (text === line) return null;
      const out = [...lines];
      out[idx] = text;
      return { lines: out, line: idx, why };
    };
    const name = /(?:Fonction ou procédure|Fonction|Procédure) « ([^»]+) » inconnue/.exec(message)?.[1] ?? /Instruction incomplète après « ([^»]+) »/.exec(message)?.[1];
    if (name) {
      const guess = closest(name, callCandidates(code));
      const r = guess && replaceWord(line, name, guess);
      return r ? set(r, `${name} → ${guess}`) : null;
    }
    const atEnd = /^(.+?) attendu, mais la fin de la ligne trouvé/.exec(message)?.[1];
    if (atEnd === "ALORS" || atEnd === "FAIRE") return set(`${line.replace(/\s+$/, "")} ${atEnd}`, `${atEnd} ajouté`);
    if (atEnd === "« ) »") return set(`${line.replace(/\s+$/, "")})`, "parenthèse fermée");
    const missingComma = /^« \) » attendu, mais « (.+?) » trouvé/.exec(message)?.[1];
    if (missingComma) {
      const open = line.indexOf("(");
      let at = line.indexOf(missingComma, open + 1);
      if (at > 0 && /["']/.test(line[at - 1])) at--;
      if (open >= 0 && at > open + 1) return set(`${line.slice(0, at).replace(/\s+$/, "")}, ${line.slice(at)}`, "virgule ajoutée");
      return null;
    }
    const closer = /inattendu : (FIN\w+) était attendu/.exec(message)?.[1] ?? /^(FIN\w+) attendu avant la fin du programme/.exec(message)?.[1];
    if (closer && OPENERS[closer]) {
      const end = /avant la fin du programme/.test(message) ? lines.length - (lines[lines.length - 1].trim() ? 0 : 1) : idx;
      return insertCloser(lines, end, OPENERS[closer], closer);
    }
    if (/Chaîne de caractères non fermée/.test(message)) {
      const q = unclosedQuote(line) ?? '"';
      const trimmed = line.replace(/\s+$/, "");
      return set(trimmed.endsWith(")") ? `${trimmed.slice(0, -1)}${q})` : `${trimmed}${q}`, "guillemet fermé");
    }
    return null;
  };

const check = (code: string) => {
  const e = checkPseudocode(code);
  return e ? { message: e.message, line: e.line } : null;
};

/** `error` : erreur affichée à l'exécution (fonction inconnue…), corrigée en premier. */
export function autoFixPseudocode(code: string, error?: { message: string; line: number }): FixResult | null {
  const calls = fixCalls(code.split("\n"));
  let lines = calls.lines;
  const changes = [...calls.changes];
  if (error && !calls.changes.length) {
    const fix = rule(code)(error.message, lines, Math.max(0, error.line - 1));
    if (fix) {
      lines = fix.lines;
      changes.push({ line: fix.line + 1, why: fix.why });
    }
  }
  return fixLoop(lines.join("\n"), check, rule(code), { lines, changes });
}
