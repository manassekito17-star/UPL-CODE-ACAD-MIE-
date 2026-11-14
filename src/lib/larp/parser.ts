/**
 * Analyse syntaxique d'un module (principal : DÉBUT … FIN ; auxiliaire :
 * ENTRER … RETOURNER) du pseudo-code classique compatible LARP.
 */
import { LarpError, norm, tokenize, type Tok } from "./lexer";

export type Expr =
  | { t: "num"; v: number; float: boolean }
  | { t: "str"; v: string }
  | { t: "cont"; items: Array<Expr | null> }
  | { t: "var"; name: string; key: string; line: number }
  | { t: "index"; base: Expr; index: Expr; line: number }
  | { t: "call"; name: string; key: string; args: Expr[]; explicit: boolean; parens: boolean; line: number }
  | { t: "un"; op: "-" | "NON"; e: Expr; line: number }
  | { t: "bin"; op: string; a: Expr; b: Expr; line: number }
  | { t: "est"; e: Expr; neg: boolean; what: TypeTest; line: number };

export type TypeTest = "ENTIER" | "FLOTTANT" | "CHAINE" | "CONTENEUR" | "DEFINIE" | "INDEFINIE";

export interface LValue {
  name: string;
  key: string;
  idx: Expr[];
  line: number;
}

export type Stmt =
  | { s: "assign"; line: number; target: LValue; e: Expr }
  | { s: "call"; line: number; call: Extract<Expr, { t: "call" }> }
  | { s: "lire"; line: number; vars: LValue[]; canal?: Expr }
  | { s: "ecrire"; line: number; items: Expr[]; canal?: Expr }
  | { s: "requete"; line: number; label: Expr; vars: LValue[] }
  | { s: "sep"; line: number; e: Expr }
  | { s: "si"; line: number; branches: Array<{ cond: Expr; body: Stmt[]; line: number }>; els?: Stmt[]; elseLine?: number; endLine: number }
  | { s: "sel"; line: number; e: Expr; cases: Array<{ consts: Expr[]; body: Stmt[]; line: number }>; els?: Stmt[]; endLine: number }
  | { s: "tq"; line: number; cond: Expr; body: Stmt[]; endLine: number }
  | { s: "rep"; line: number; body: Stmt[]; cond: Expr; condLine: number }
  | { s: "pour"; line: number; v: LValue; from: Expr; to: Expr; step?: Expr; body: Stmt[]; endLine: number }
  | { s: "detruire"; line: number; target: LValue }
  | { s: "compresser"; line: number; target: LValue }
  | { s: "ouvrir"; line: number; fichier: boolean; name: Expr; canal: Expr; mode: "LECTURE" | "ECRITURE" | "AJOUT" }
  | { s: "fermer"; line: number; canaux: Expr[] };

export interface Param {
  name: string;
  key: string;
  ref: boolean;
}

export interface ModuleAst {
  name: string;
  key: string;
  main: boolean;
  params: Param[];
  body: Stmt[];
  ret?: Expr;
  /** Ligne de DÉBUT / ENTRER. */
  startLine: number;
  /** Ligne de FIN / RETOURNER. */
  endLine: number;
}

const BLOCK_END = new Set(["FIN", "RETOURNER", "FINSI", "SINON", "FINTANTQUE", "JUSQUA", "FINPOUR", "FINSELECTIONNER"]);
const TYPE_WORDS: Record<string, TypeTest> = {
  ENTIER: "ENTIER",
  FLOTTANT: "FLOTTANT",
  CHAINE: "CHAINE",
  CONTENEUR: "CONTENEUR",
  DEFINIE: "DEFINIE",
  DEFINI: "DEFINIE",
  DETERMINEE: "DEFINIE",
  DETERMINE: "DEFINIE",
  INDEFINIE: "INDEFINIE",
  INDEFINI: "INDEFINIE",
  INDETERMINEE: "INDEFINIE",
  INDETERMINE: "INDEFINIE",
};

const show = (t: Tok) => (t.k === "nl" ? "fin de ligne" : t.k === "eof" ? "fin du module" : `« ${t.raw} »`);

export function parseModule(src: string, name: string, main: boolean): ModuleAst {
  let toks: Tok[];
  try {
    toks = tokenize(src);
  } catch (e) {
    if (e instanceof LarpError) e.module = name;
    throw e;
  }
  let p = 0;
  const peek = (o = 0) => toks[Math.min(p + o, toks.length - 1)];
  const next = () => toks[p++];
  const err = (msg: string, t: Tok = peek()) => new LarpError(msg, t.line, name);
  const isKw = (v: string, t = peek()) => t.k === "kw" && t.v === v;
  const isOp = (v: string, t = peek()) => t.k === "op" && t.v === v;
  const eatKw = (v: string, what = v) => {
    if (!isKw(v)) throw err(`${what} attendu, trouvé ${show(peek())}.`);
    return next();
  };
  const eatOp = (v: string) => {
    if (!isOp(v)) throw err(`« ${v} » attendu, trouvé ${show(peek())}.`);
    return next();
  };
  const skipNl = () => {
    while (peek().k === "nl") p++;
  };
  const endOfStmt = () => {
    const t = peek();
    if (t.k !== "nl" && t.k !== "eof" && !(t.k === "kw" && BLOCK_END.has(t.v))) throw err(`Fin d'instruction attendue, trouvé ${show(t)}.`);
  };

  // ------------------------------------------------------------ Expressions
  const expr = (): Expr => orE();
  const orE = (): Expr => {
    let a = andE();
    while (isKw("OU")) {
      const t = next();
      a = { t: "bin", op: "OU", a, b: andE(), line: t.line };
    }
    return a;
  };
  const andE = (): Expr => {
    let a = notE();
    while (isKw("ET")) {
      const t = next();
      a = { t: "bin", op: "ET", a, b: notE(), line: t.line };
    }
    return a;
  };
  const notE = (): Expr => {
    if (isKw("NON") || isOp("!")) {
      const t = next();
      return { t: "un", op: "NON", e: notE(), line: t.line };
    }
    return relE();
  };
  const REL = new Set(["<", "<=", ">", ">=", "=", "!="]);
  const relE = (): Expr => {
    const a = addE();
    const t = peek();
    if (t.k === "op" && REL.has(t.v)) {
      next();
      const b = addE();
      const after = peek();
      if (after.k === "op" && REL.has(after.v)) throw err("Les opérateurs relationnels ne peuvent pas être enchaînés (ex. 5 < a < 10) : utilisez ET.", after);
      return { t: "bin", op: t.v, a, b, line: t.line };
    }
    if (isKw("EST")) {
      next();
      let neg = false;
      if (isKw("NON") || isOp("!")) {
        next();
        neg = true;
      }
      const w = peek();
      const what = w.k === "kw" ? TYPE_WORDS[w.v] : undefined;
      if (!what) throw err("Après EST : ENTIER, FLOTTANT, CHAÎNE, CONTENEUR, DÉFINIE ou INDÉFINIE.", w);
      next();
      return { t: "est", e: a, neg, what, line: t.line };
    }
    return a;
  };
  const addE = (): Expr => {
    let a = mulE();
    while (isOp("+") || isOp("-")) {
      const t = next();
      a = { t: "bin", op: t.v, a, b: mulE(), line: t.line };
    }
    return a;
  };
  const mulE = (): Expr => {
    let a = powE();
    while (isOp("*") || isOp("/") || isOp("//") || isOp("%")) {
      const t = next();
      a = { t: "bin", op: t.v, a, b: powE(), line: t.line };
    }
    return a;
  };
  const powE = (): Expr => {
    let a = unE();
    while (isOp("^")) {
      const t = next();
      a = { t: "bin", op: "^", a, b: unE(), line: t.line };
    }
    return a;
  };
  const unE = (): Expr => {
    if (isOp("-")) {
      const t = next();
      return { t: "un", op: "-", e: unE(), line: t.line };
    }
    if (isOp("+")) {
      next();
      return unE();
    }
    return postfix(primary());
  };
  const postfix = (e: Expr): Expr => {
    while (isOp("[")) {
      const t = next();
      const index = expr();
      eatOp("]");
      e = { t: "index", base: e, index, line: t.line };
    }
    return e;
  };
  const args = (): Expr[] => {
    eatOp("(");
    const list: Expr[] = [];
    if (!isOp(")")) {
      list.push(expr());
      while (isOp(",")) {
        next();
        list.push(expr());
      }
    }
    eatOp(")");
    return list;
  };
  const callExpr = (explicit: boolean): Extract<Expr, { t: "call" }> => {
    const t = peek();
    if (t.k !== "id") throw err(`Nom de module attendu après EXÉCUTER, trouvé ${show(t)}.`);
    next();
    const parens = isOp("(");
    return { t: "call", name: t.raw, key: t.v, args: parens ? args() : [], explicit, parens, line: t.line };
  };
  const primary = (): Expr => {
    const t = peek();
    if (t.k === "num") {
      next();
      return { t: "num", v: t.num!, float: !!t.float };
    }
    if (t.k === "str") {
      next();
      return { t: "str", v: t.v };
    }
    if (isOp("(")) {
      next();
      const e = expr();
      eatOp(")");
      return e;
    }
    if (isOp("[")) {
      next();
      const items: Array<Expr | null> = [];
      if (isOp("]")) {
        next();
        return { t: "cont", items };
      }
      for (;;) {
        if (isOp(",")) items.push(null);
        else if (isOp("]")) {
          items.push(null);
          break;
        } else items.push(expr());
        if (isOp(",")) {
          next();
          continue;
        }
        break;
      }
      eatOp("]");
      return { t: "cont", items };
    }
    if (isKw("EXECUTER")) {
      next();
      return callExpr(true);
    }
    if (t.k === "id") {
      next();
      if (isOp("(")) return { t: "call", name: t.raw, key: t.v, args: args(), explicit: false, parens: true, line: t.line };
      return { t: "var", name: t.raw, key: t.v, line: t.line };
    }
    if (t.k === "nl" || t.k === "eof") throw err("Expression incomplète : une valeur est attendue.");
    throw err(`Valeur attendue, trouvé ${show(t)}.`);
  };

  const lvalue = (): LValue => {
    const t = peek();
    if (t.k !== "id") throw err(t.k === "kw" ? `« ${t.raw} » est un mot réservé : il ne peut pas servir de nom de variable.` : `Nom de variable attendu, trouvé ${show(t)}.`);
    next();
    const idx: Expr[] = [];
    while (isOp("[")) {
      next();
      idx.push(expr());
      eatOp("]");
    }
    return { name: t.raw, key: t.v, idx, line: t.line };
  };
  const lvalues = (): LValue[] => {
    const list = [lvalue()];
    while (isOp(",")) {
      next();
      list.push(lvalue());
    }
    return list;
  };

  // ------------------------------------------------------------ Instructions
  const block = (): Stmt[] => {
    const list: Stmt[] = [];
    for (;;) {
      skipNl();
      const t = peek();
      if (t.k === "eof" || (t.k === "kw" && BLOCK_END.has(t.v))) return list;
      list.push(stmt());
    }
  };

  const isCaseStart = () => {
    const t = peek();
    return t.k === "num" || t.k === "str" || isOp("-") || isOp("[");
  };

  const stmt = (): Stmt => {
    const t = peek();
    const line = t.line;
    if (t.k === "kw") {
      switch (t.v) {
        case "LIRE": {
          next();
          const vars = lvalues();
          let canal: Expr | undefined;
          if (isKw("DE")) {
            next();
            canal = expr();
          }
          endOfStmt();
          return { s: "lire", line, vars, canal };
        }
        case "ECRIRE": {
          next();
          const items: Expr[] = [];
          if (peek().k !== "nl" && peek().k !== "eof" && !isKw("DANS")) {
            items.push(expr());
            while (isOp(",")) {
              next();
              items.push(expr());
            }
          }
          let canal: Expr | undefined;
          if (isKw("DANS")) {
            next();
            canal = expr();
          }
          endOfStmt();
          return { s: "ecrire", line, items, canal };
        }
        case "REQUETE": {
          next();
          const label = expr();
          let vars: LValue[] = [];
          if (isOp(",")) {
            next();
            vars = lvalues();
          }
          endOfStmt();
          return { s: "requete", line, label, vars };
        }
        case "SEPARATEUR": {
          next();
          const e = expr();
          endOfStmt();
          return { s: "sep", line, e };
        }
        case "SI": {
          next();
          const branches: Array<{ cond: Expr; body: Stmt[]; line: number }> = [];
          const cond = expr();
          eatKw("ALORS", "ALORS");
          branches.push({ cond, body: block(), line });
          let els: Stmt[] | undefined;
          let elseLine: number | undefined;
          for (;;) {
            if (isKw("SINON")) {
              const st = next();
              if (isKw("SI") && peek().line === st.line) {
                next();
                const c = expr();
                eatKw("ALORS", "ALORS");
                branches.push({ cond: c, body: block(), line: st.line });
                continue;
              }
              if (els) throw err("Une structure SI ne peut avoir qu'un seul SINON.", st);
              elseLine = st.line;
              els = block();
              continue;
            }
            break;
          }
          const end = peek();
          eatKw("FINSI", "FINSI");
          endOfStmt();
          return { s: "si", line, branches, els, elseLine, endLine: end.line };
        }
        case "SELECTIONNER": {
          next();
          const e = expr();
          endOfStmt();
          const cases: Array<{ consts: Expr[]; body: Stmt[]; line: number }> = [];
          let els: Stmt[] | undefined;
          skipNl();
          while (isCaseStart()) {
            const cl = peek().line;
            const consts = [expr()];
            while (isOp(",")) {
              next();
              consts.push(expr());
            }
            if (isOp(":")) next();
            const body: Stmt[] = [];
            for (;;) {
              skipNl();
              const k = peek();
              if (k.k === "eof" || isCaseStart() || (k.k === "kw" && BLOCK_END.has(k.v))) break;
              body.push(stmt());
            }
            cases.push({ consts, body, line: cl });
          }
          if (isKw("SINON")) {
            next();
            els = block();
          }
          const end = peek();
          eatKw("FINSELECTIONNER", "FINSÉLECTIONNER");
          endOfStmt();
          return { s: "sel", line, e, cases, els, endLine: end.line };
        }
        case "TANTQUE": {
          next();
          const cond = expr();
          eatKw("FAIRE", "FAIRE");
          const body = block();
          const end = peek();
          eatKw("FINTANTQUE", "FINTANTQUE");
          endOfStmt();
          return { s: "tq", line, cond, body, endLine: end.line };
        }
        case "REPETER": {
          next();
          const body = block();
          const ct = peek();
          eatKw("JUSQUA", "JUSQU'À");
          const cond = expr();
          endOfStmt();
          return { s: "rep", line, body, cond, condLine: ct.line };
        }
        case "POUR": {
          next();
          const v = lvalue();
          if (v.idx.length) throw err("La variable d'itération d'une boucle POUR doit être une variable simple.");
          eatOp("=");
          const from = expr();
          eatKw("JUSQUA", "JUSQU'À");
          const to = expr();
          let step: Expr | undefined;
          if (isKw("INCREMENT")) {
            next();
            step = expr();
          }
          eatKw("FAIRE", "FAIRE");
          const body = block();
          const end = peek();
          eatKw("FINPOUR", "FINPOUR");
          endOfStmt();
          return { s: "pour", line, v, from, to, step, body, endLine: end.line };
        }
        case "EXECUTER": {
          next();
          const call = callExpr(true);
          endOfStmt();
          return { s: "call", line, call };
        }
        case "DETRUIRE": {
          next();
          const target = lvalue();
          endOfStmt();
          return { s: "detruire", line, target };
        }
        case "COMPRESSER": {
          next();
          const target = lvalue();
          endOfStmt();
          return { s: "compresser", line, target };
        }
        case "OUVRIR": {
          next();
          let fichier = false;
          if (isKw("FICHIER")) {
            next();
            fichier = true;
          } else if (isKw("TAMPON")) next();
          const nameE = peek().k === "id" ? (() => {
            const nt = next();
            return { t: "str", v: nt.raw } as Expr;
          })() : expr();
          eatKw("SUR", "SUR");
          const canal = expr();
          eatKw("EN", "EN");
          const m = peek();
          if (!(m.k === "kw" && (m.v === "LECTURE" || m.v === "ECRITURE" || m.v === "AJOUT"))) throw err("Mode d'accès attendu : LECTURE, ÉCRITURE ou AJOUT.");
          next();
          endOfStmt();
          return { s: "ouvrir", line, fichier, name: nameE, canal, mode: m.v as "LECTURE" | "ECRITURE" | "AJOUT" };
        }
        case "FERMER": {
          next();
          const canaux = [expr()];
          while (isOp(",")) {
            next();
            canaux.push(expr());
          }
          endOfStmt();
          return { s: "fermer", line, canaux };
        }
        case "DEBUT":
          throw err("DÉBUT ne peut apparaître qu'une fois, au début du module principal.");
        case "ENTRER":
          throw err("ENTRER ne peut apparaître qu'au début d'un module auxiliaire.");
        default:
          throw err(`Instruction inattendue ${show(t)}.`);
      }
    }
    if (t.k === "id") {
      const after = peek(1);
      if ((after.k === "op" && (after.v === "=" || after.v === "[")) || (after.k === "op" && after.v === "←")) {
        const target = lvalue();
        eatOp("=");
        const e = expr();
        endOfStmt();
        return { s: "assign", line, target, e };
      }
      // Invocation sans EXÉCUTER (syntaxe alternative) : Nom ou Nom(arguments).
      next();
      const parens = isOp("(");
      const call = { t: "call" as const, name: t.raw, key: t.v, args: parens ? args() : [], explicit: false, parens, line };
      if (isOp("=")) throw err("Affectation invalide : seule une variable peut recevoir une valeur.");
      endOfStmt();
      return { s: "call", line, call };
    }
    throw err(`Instruction attendue, trouvé ${show(t)}.`);
  };

  // ------------------------------------------------------------ Module
  skipNl();
  const first = peek();
  if (main) {
    if (!isKw("DEBUT")) throw err(isKw("ENTRER") ? "Le module principal doit commencer par DÉBUT (ENTRER est réservé aux modules auxiliaires)." : "Le module principal doit commencer par l'instruction DÉBUT.", first);
    next();
    endOfStmt();
    const body = block();
    const end = peek();
    if (isKw("RETOURNER")) throw err("Le module principal se termine par FIN (RETOURNER est réservé aux modules auxiliaires).");
    if (!isKw("FIN")) throw err(end.k === "eof" ? "Instruction FIN manquante à la fin du module principal." : `${show(end)} inattendu ici (structure mal fermée ?).`, end);
    next();
    skipNl();
    if (peek().k !== "eof") throw err("Aucune instruction ne peut suivre FIN.");
    return { name, key: norm(name), main, params: [], body, startLine: first.line, endLine: end.line };
  }
  if (!isKw("ENTRER")) throw err(isKw("DEBUT") ? "Un module auxiliaire commence par ENTRER (DÉBUT est réservé au module principal)." : "Un module auxiliaire doit commencer par l'instruction ENTRER.", first);
  next();
  const params: Param[] = [];
  if (peek().k !== "nl") {
    for (;;) {
      let ref = false;
      if (isKw("REFERENCE")) {
        next();
        ref = true;
      }
      const pt = peek();
      if (pt.k !== "id") throw err(`Nom de paramètre attendu, trouvé ${show(pt)}.`);
      next();
      if (params.some((x) => x.key === pt.v)) throw err(`Paramètre « ${pt.raw} » déclaré deux fois.`, pt);
      params.push({ name: pt.raw, key: pt.v, ref });
      if (isOp(",")) {
        next();
        continue;
      }
      break;
    }
  }
  endOfStmt();
  const body = block();
  const end = peek();
  if (isKw("FIN")) throw err("Un module auxiliaire se termine par RETOURNER (FIN est réservé au module principal).");
  if (!isKw("RETOURNER")) throw err(end.k === "eof" ? "Instruction RETOURNER manquante à la fin du module auxiliaire." : `${show(end)} inattendu ici (structure mal fermée ?).`, end);
  next();
  let ret: Expr | undefined;
  if (peek().k !== "nl" && peek().k !== "eof") ret = expr();
  skipNl();
  if (peek().k !== "eof") throw err("Aucune instruction ne peut suivre RETOURNER.");
  return { name, key: norm(name), main, params, body, ret, startLine: first.line, endLine: end.line };
}
