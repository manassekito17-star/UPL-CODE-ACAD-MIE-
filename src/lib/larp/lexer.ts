/**
 * Analyse lexicale du pseudo-code « classique » (syntaxe compatible LARP).
 *
 * Règles reprises de la documentation publique du langage :
 * mots réservés insensibles à la casse et aux accents (ÉCRIRE = ecrire),
 * commentaires « \\ » jusqu'à la fin de la ligne, prolongation d'une
 * instruction sur la ligne suivante avec « $ » en fin de ligne, chaînes entre
 * apostrophes ou guillemets avec séquences d'échappement \n \a \b \\.
 */

export type TokKind = "num" | "str" | "id" | "kw" | "op" | "nl" | "eof";

export interface Tok {
  k: TokKind;
  /** Valeur normalisée (mot réservé en majuscules sans accents, opérateur, texte). */
  v: string;
  /** Texte d'origine (pour les identificateurs). */
  raw: string;
  line: number;
  col: number;
  num?: number;
  float?: boolean;
}

export class LarpError extends Error {
  constructor(
    message: string,
    public line: number,
    public module = "",
  ) {
    super(message);
  }
}

/** Majuscules sans accents : clé de comparaison des mots réservés, variables et modules. */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();

export const KEYWORDS = new Set([
  "DEBUT",
  "FIN",
  "ENTRER",
  "RETOURNER",
  "REFERENCE",
  "EXECUTER",
  "LIRE",
  "DE",
  "ECRIRE",
  "DANS",
  "REQUETE",
  "SEPARATEUR",
  "SI",
  "ALORS",
  "SINON",
  "FINSI",
  "SELECTIONNER",
  "SELECTION",
  "FINSELECTIONNER",
  "FINSELECTION",
  "TANTQUE",
  "FAIRE",
  "FINTANTQUE",
  "REPETER",
  "JUSQUA",
  "POUR",
  "INCREMENT",
  "FINPOUR",
  "ET",
  "OU",
  "NON",
  "EST",
  "ENTIER",
  "FLOTTANT",
  "CHAINE",
  "CONTENEUR",
  "DEFINIE",
  "DEFINI",
  "DETERMINEE",
  "DETERMINE",
  "INDEFINIE",
  "INDEFINI",
  "INDETERMINEE",
  "INDETERMINE",
  "DETRUIRE",
  "COMPRESSER",
  "OUVRIR",
  "TAMPON",
  "FICHIER",
  "SUR",
  "EN",
  "LECTURE",
  "ECRITURE",
  "AJOUT",
  "FERMER",
]);

const OPS = ["//", "!=", "<>", "<=", ">=", "==", "<", ">", "=", "+", "-", "*", "/", "%", "^", "(", ")", "[", "]", ",", ":", "!", "←"];

const isIdStart = (c: string) => /[A-Za-z_À-ɏ]/.test(c);
const isIdChar = (c: string) => /[A-Za-z0-9_À-ɏ]/.test(c);

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const n = src.length;
  const push = (t: Omit<Tok, "line" | "col">, l = line, c = col) => out.push({ ...t, line: l, col: c });
  const adv = (k = 1) => {
    for (let j = 0; j < k; j++) {
      if (src[i] === "\n") {
        line++;
        col = 1;
      } else col++;
      i++;
    }
  };

  while (i < n) {
    const c = src[i];
    // Commentaire « \\ » jusqu'à la fin de la ligne.
    if (c === "\\" && src[i + 1] === "\\") {
      while (i < n && src[i] !== "\n") adv();
      continue;
    }
    if (c === "\r") {
      adv();
      continue;
    }
    if (c === "\n") {
      push({ k: "nl", v: "\n", raw: "\n" });
      adv();
      continue;
    }
    if (c === " " || c === "\t" || c === " ") {
      adv();
      continue;
    }
    // Prolongation « $ » : l'instruction continue à la ligne suivante.
    if (c === "$") {
      let j = i + 1;
      while (j < n && (src[j] === " " || src[j] === "\t" || src[j] === "\r")) j++;
      if (src[j] === "\\" && src[j + 1] === "\\") while (j < n && src[j] !== "\n") j++;
      if (j >= n || src[j] === "\n") {
        while (i < j) adv();
        if (i < n) adv(); // saute le retour à la ligne
        continue;
      }
      throw new LarpError("Le symbole $ doit terminer la ligne (prolongation d'instruction).", line);
    }
    if (c === '"' || c === "'" || c === "“" || c === "”" || c === "‘" || c === "’") {
      const close = c === "“" ? "”" : c === "‘" ? "’" : c;
      const l = line;
      const cc = col;
      adv();
      let s = "";
      while (i < n && src[i] !== close && !(close === "”" && src[i] === '"')) {
        if (src[i] === "\n") throw new LarpError("Chaîne de caractères non terminée (guillemet ou apostrophe manquant).", l);
        if (src[i] === "\\" && i + 1 < n) {
          const e = src[i + 1];
          if (e === "n") s += "\n";
          else if (e === "\\") s += "\\";
          else if (e === "a" || e === "b") s += "";
          else s += "\\" + e;
          adv(2);
          continue;
        }
        s += src[i];
        adv();
      }
      if (i >= n) throw new LarpError("Chaîne de caractères non terminée (guillemet ou apostrophe manquant).", l);
      adv();
      push({ k: "str", v: s, raw: s }, l, cc);
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      const m = /^(\d*\.\d+|\d+\.?\d*)([eE][-+]?\d+)?/.exec(src.slice(i));
      const text = m![0];
      const float = text.includes(".") || /[eE]/.test(text);
      push({ k: "num", v: text, raw: text, num: Number(text), float });
      adv(text.length);
      if (i < n && isIdStart(src[i])) throw new LarpError(`Nombre mal formé : « ${text}${src[i]}… ».`, line);
      continue;
    }
    if (isIdStart(c)) {
      const l = line;
      const cc = col;
      let j = i;
      while (j < n && isIdChar(src[j])) j++;
      let raw = src.slice(i, j);
      adv(j - i);
      // JUSQU'À (avec apostrophe droite ou typographique).
      if (norm(raw) === "JUSQU" && (src[i] === "'" || src[i] === "’") && /[aAàÀ]/.test(src[i + 1] ?? "")) {
        raw = raw + src[i] + src[i + 1];
        adv(2);
      }
      const key = norm(raw).replace(/['’]/g, "");
      if (KEYWORDS.has(key)) push({ k: "kw", v: key, raw }, l, cc);
      else push({ k: "id", v: key, raw }, l, cc);
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) {
      const v = op === "<>" ? "!=" : op === "==" || op === "←" ? "=" : op;
      push({ k: "op", v, raw: op });
      adv(op.length);
      continue;
    }
    throw new LarpError(`Caractère inattendu « ${c} ».`, line);
  }
  push({ k: "nl", v: "\n", raw: "\n" });
  push({ k: "eof", v: "", raw: "" });
  return merge(out);
}

/** Tolérances d'écriture : « TANT QUE », « FIN SI », « FIN TANTQUE », « FIN POUR »… */
function merge(t: Tok[]): Tok[] {
  const r: Tok[] = [];
  for (let i = 0; i < t.length; i++) {
    const a = t[i];
    const b = t[i + 1];
    if (a.k === "id" && a.v === "TANT" && b && b.k === "id" && b.v === "QUE" && b.line === a.line) {
      r.push({ ...a, k: "kw", v: "TANTQUE", raw: `${a.raw} ${b.raw}` });
      i++;
      continue;
    }
    if (a.k === "kw" && a.v === "FIN" && b && b.line === a.line && b.k === "kw" && ["SI", "TANTQUE", "POUR", "SELECTIONNER", "SELECTION"].includes(b.v)) {
      r.push({ ...a, v: b.v === "SELECTION" ? "FINSELECTIONNER" : `FIN${b.v}`, raw: `${a.raw} ${b.raw}` });
      i++;
      continue;
    }
    if (a.k === "id" && a.v === "FIN" && b && b.k === "id" && b.v === "TANT") {
      r.push(a);
      continue;
    }
    if (a.k === "kw" && a.v === "FINSELECTION") {
      r.push({ ...a, v: "FINSELECTIONNER" });
      continue;
    }
    if (a.k === "kw" && a.v === "SELECTION") {
      r.push({ ...a, v: "SELECTIONNER" });
      continue;
    }
    r.push(a);
  }
  return r;
}
