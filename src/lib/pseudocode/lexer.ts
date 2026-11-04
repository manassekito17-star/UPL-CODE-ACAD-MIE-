/**
 * Analyseur lexical du pseudocode UPL.
 *
 * Les mots-clés sont insensibles à la casse et aux accents :
 * « Écrire », « ECRIRE » et « ecrire » sont équivalents.
 */

export type TokenType = "num" | "str" | "ident" | "op" | "nl" | "eof";

export interface Token {
  type: TokenType;
  /** Texte original (ou valeur littérale décodée pour les chaînes). */
  value: string;
  /** Forme normalisée : majuscules, sans accents, sans « _ ». */
  norm: string;
  line: number;
  col: number;
}

export class PseudoError extends Error {
  line: number;
  hint?: string;
  kind: "syntaxe" | "execution";
  constructor(kind: "syntaxe" | "execution", message: string, line: number, hint?: string) {
    super(message);
    this.kind = kind;
    this.line = line;
    this.hint = hint;
  }
}

export function normalizeWord(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

/** Mots composés à fusionner : « FIN SI » → FINSI, « TANT QUE » → TANTQUE… */
const MERGES: Array<[string, string, string]> = [
  ["TANT", "QUE", "TANTQUE"],
  ["SINON", "SI", "SINONSI"],
  ["FIN", "SI", "FINSI"],
  ["FIN", "POUR", "FINPOUR"],
  ["FIN", "TANTQUE", "FINTANTQUE"],
  ["FIN", "SELON", "FINSELON"],
  ["FIN", "FONCTION", "FINFONCTION"],
  ["FIN", "PROCEDURE", "FINPROCEDURE"],
  ["FIN", "ALGORITHME", "FIN"],
];

/** Variantes avec « _ » acceptées : FIN_SI, TANT_QUE, FIN_TANT_QUE… */
const UNDERSCORE_KEYWORDS = new Set([
  "FINSI",
  "FINPOUR",
  "FINTANTQUE",
  "FINSELON",
  "FINFONCTION",
  "FINPROCEDURE",
  "TANTQUE",
  "SINONSI",
]);

const OPERATORS = [
  "<-",
  ":=",
  "<=",
  ">=",
  "<>",
  "!=",
  "..",
  "←",
  "≤",
  "≥",
  "≠",
  "+",
  "-",
  "*",
  "/",
  "^",
  "%",
  "=",
  "<",
  ">",
  "(",
  ")",
  "[",
  "]",
  ",",
  ":",
  ";",
];

const OP_ALIASES: Record<string, string> = {
  ":=": "<-",
  "←": "<-",
  "≤": "<=",
  "≥": ">=",
  "≠": "<>",
  "!=": "<>",
  "%": "MOD",
};

export function tokenize(source: string): Token[] {
  const raw: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const src = source.replace(/\r\n?/g, "\n");

  const push = (type: TokenType, value: string, norm: string, l = line, c = col) =>
    raw.push({ type, value, norm, line: l, col: c });

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (src[i] === "\n") {
        line++;
        col = 1;
      } else {
        col++;
      }
      i++;
    }
  };

  while (i < src.length) {
    const ch = src[i];

    // Commentaires
    if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") advance();
      continue;
    }
    if (ch === "#") {
      while (i < src.length && src[i] !== "\n") advance();
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const startLine = line;
      advance(2);
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) advance();
      if (i >= src.length) {
        throw new PseudoError("syntaxe", "Commentaire /* non fermé.", startLine, "Ajoutez */ à la fin du commentaire.");
      }
      advance(2);
      continue;
    }

    if (ch === "\n") {
      push("nl", "\n", "\n");
      advance();
      continue;
    }
    if (ch === " " || ch === "\t") {
      advance();
      continue;
    }

    // Nombres
    if (/[0-9]/.test(ch)) {
      const l = line;
      const c = col;
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      // partie décimale (mais pas l'opérateur d'intervalle « .. »)
      if (src[j] === "." && /[0-9]/.test(src[j + 1] ?? "")) {
        j++;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
      }
      const text = src.slice(i, j);
      advance(j - i);
      push("num", text, text, l, c);
      continue;
    }

    // Chaînes "..." et caractères '...'
    if (ch === '"' || ch === "“" || ch === "”" || ch === "«") {
      const close = ch === "«" ? "»" : ch === "“" ? "”" : ch;
      const l = line;
      const c = col;
      advance();
      let text = "";
      while (i < src.length && src[i] !== close && !(close === "”" && src[i] === '"') && src[i] !== "\n") {
        text += src[i];
        advance();
      }
      if (i >= src.length || src[i] === "\n") {
        throw new PseudoError("syntaxe", "Chaîne de caractères non fermée.", l, `Ajoutez le guillemet fermant ${close}.`);
      }
      advance();
      push("str", text, text, l, c);
      continue;
    }
    if (ch === "'") {
      const prev = raw[raw.length - 1];
      // JUSQU'A : l'apostrophe appartient au mot-clé
      if (prev && prev.type === "ident" && prev.norm === "JUSQU" && prev.line === line) {
        advance();
        const l = line;
        let word = "";
        while (i < src.length && /[\p{L}]/u.test(src[i])) {
          word += src[i];
          advance();
        }
        if (normalizeWord(word) !== "A") {
          throw new PseudoError("syntaxe", "Mot-clé JUSQU'A mal écrit.", l);
        }
        prev.value = "JUSQU'A";
        prev.norm = "JUSQUA";
        continue;
      }
      const l = line;
      const c = col;
      advance();
      let text = "";
      while (i < src.length && src[i] !== "'" && src[i] !== "\n") {
        text += src[i];
        advance();
      }
      if (i >= src.length || src[i] === "\n") {
        throw new PseudoError("syntaxe", "Caractère ou chaîne non fermé.", l, "Ajoutez l'apostrophe fermante '.");
      }
      advance();
      push("str", text, text, l, c);
      continue;
    }

    // Identifiants et mots-clés
    if (/[\p{L}_]/u.test(ch)) {
      const l = line;
      const c = col;
      let j = i;
      while (j < src.length && /[\p{L}\p{N}_]/u.test(src[j])) j++;
      const text = src.slice(i, j);
      advance(j - i);
      let norm = normalizeWord(text);
      const noUnderscore = norm.replace(/_/g, "");
      if (UNDERSCORE_KEYWORDS.has(noUnderscore)) norm = noUnderscore;
      if (noUnderscore === "JUSQUA") norm = "JUSQUA";
      push("ident", text, norm, l, c);
      continue;
    }

    // Opérateurs
    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (op) {
      const l = line;
      const c = col;
      advance(op.length);
      const canonical = OP_ALIASES[op] ?? op;
      push("op", op, canonical, l, c);
      continue;
    }

    throw new PseudoError("syntaxe", `Caractère inattendu « ${ch} ».`, line);
  }
  raw.push({ type: "nl", value: "\n", norm: "\n", line, col });
  raw.push({ type: "eof", value: "", norm: "", line, col });

  // Fusion des mots composés situés sur la même ligne
  const out: Token[] = [];
  for (const tok of raw) {
    const prev = out[out.length - 1];
    if (prev && prev.type === "ident" && tok.type === "ident" && prev.line === tok.line) {
      const merge = MERGES.find(([a, b]) => prev.norm === a && tok.norm === b);
      if (merge) {
        prev.norm = merge[2];
        prev.value = `${prev.value} ${tok.value}`;
        // « FIN TANT QUE » : TANT + QUE → TANTQUE, puis FIN + TANTQUE → FINTANTQUE
        const before = out[out.length - 2];
        if (before && before.type === "ident" && before.line === prev.line) {
          const again = MERGES.find(([a, b]) => before.norm === a && prev.norm === b);
          if (again) {
            before.norm = again[2];
            before.value = `${before.value} ${prev.value}`;
            out.pop();
          }
        }
        continue;
      }
    }
    out.push(tok);
  }
  return out;
}
