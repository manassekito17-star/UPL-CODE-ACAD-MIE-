import type { BaseType, ConstDecl, Expr, LValue, Param, Program, Routine, Stmt, TypeSpec, VarDecl } from "./ast";
import { PseudoError, tokenize, type Token } from "./lexer";

/** Mots réservés : ils ne peuvent pas servir de nom de variable. */
const RESERVED = new Set([
  "ALGORITHME",
  "PROGRAMME",
  "CONSTANTES",
  "CONSTANTE",
  "VARIABLES",
  "VARIABLE",
  "DEBUT",
  "FIN",
  "SI",
  "ALORS",
  "SINON",
  "SINONSI",
  "FINSI",
  "POUR",
  "FAIRE",
  "FINPOUR",
  "TANTQUE",
  "FINTANTQUE",
  "REPETER",
  "JUSQUA",
  "SELON",
  "FINSELON",
  "FONCTION",
  "FINFONCTION",
  "PROCEDURE",
  "FINPROCEDURE",
  "RETOURNER",
  "RETOURNE",
  "RENVOYER",
  "ECRIRE",
  "AFFICHER",
  "LIRE",
  "SAISIR",
  "ET",
  "OU",
  "NON",
  "DIV",
  "MOD",
  "VRAI",
  "FAUX",
  "TABLEAU",
]);

/** Mots qui terminent une instruction (début ou fin de bloc). */
const BLOCK_WORDS = new Set([
  "SINON",
  "SINONSI",
  "FINSI",
  "FINPOUR",
  "FINTANTQUE",
  "JUSQUA",
  "FINSELON",
  "FINFONCTION",
  "FINPROCEDURE",
  "FIN",
  "CAS",
  "AUTRE",
]);

const SECTION_WORDS = new Set([
  "ALGORITHME",
  "PROGRAMME",
  "CONSTANTES",
  "CONSTANTE",
  "CONST",
  "VARIABLES",
  "VARIABLE",
  "VAR",
  "DEBUT",
  "FONCTION",
  "PROCEDURE",
]);

const BASE_TYPES: Record<string, BaseType> = {
  ENTIER: "ENTIER",
  ENTIERS: "ENTIER",
  REEL: "REEL",
  REELS: "REEL",
  CHAINE: "CHAINE",
  CHAINES: "CHAINE",
  CARACTERE: "CARACTERE",
  CARACTERES: "CARACTERE",
  CAR: "CARACTERE",
  BOOLEEN: "BOOLEEN",
  BOOLEENS: "BOOLEEN",
  LOGIQUE: "BOOLEEN",
};

const COMPARATORS = new Set(["=", "<>", "<", ">", "<=", ">="]);

export function idKey(display: string): string {
  return display
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  // ---------- utilitaires ----------
  private get cur(): Token {
    return this.tokens[this.pos];
  }
  private peek(offset = 1): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }
  private next(): Token {
    const t = this.tokens[this.pos];
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }
  private isWord(word: string, tok: Token = this.cur): boolean {
    return tok.type === "ident" && tok.norm === word;
  }
  private isAnyWord(words: Set<string>, tok: Token = this.cur): boolean {
    return tok.type === "ident" && words.has(tok.norm);
  }
  private isOp(op: string, tok: Token = this.cur): boolean {
    return tok.type === "op" && tok.norm === op;
  }
  private error(message: string, hint?: string, tok: Token = this.cur): never {
    throw new PseudoError("syntaxe", message, tok.line, hint);
  }
  private describe(tok: Token): string {
    if (tok.type === "eof") return "la fin du programme";
    if (tok.type === "nl") return "la fin de la ligne";
    return `« ${tok.value} »`;
  }
  private expectOp(op: string, hint?: string): Token {
    if (!this.isOp(op)) this.error(`« ${op} » attendu, mais ${this.describe(this.cur)} trouvé.`, hint);
    return this.next();
  }
  private expectWord(word: string, display: string, hint?: string): Token {
    if (!this.isWord(word)) this.error(`${display} attendu, mais ${this.describe(this.cur)} trouvé.`, hint);
    return this.next();
  }
  private skipNewlines() {
    while (this.cur.type === "nl" || this.isOp(";")) this.next();
  }
  private skipRestOfLine() {
    while (this.cur.type !== "nl" && this.cur.type !== "eof") this.next();
  }
  private expectIdentifier(what = "un nom"): Token {
    const t = this.cur;
    if (t.type !== "ident") this.error(`${what} attendu, mais ${this.describe(t)} trouvé.`);
    if (RESERVED.has(t.norm)) {
      this.error(`« ${t.value} » est un mot réservé et ne peut pas être utilisé comme nom.`, "Choisissez un autre nom de variable.");
    }
    return this.next();
  }

  // ---------- programme ----------
  parseProgram(): Program & { implicitVars: boolean } {
    const program: Program & { implicitVars: boolean } = {
      name: null,
      consts: [],
      vars: [],
      routines: [],
      body: [],
      implicitVars: false,
    };
    this.skipNewlines();

    // Mode « script » : pas de structure ALGORITHME / DEBUT … FIN
    if (!this.isAnyWord(SECTION_WORDS) && this.cur.type !== "eof") {
      program.implicitVars = true;
      program.body = this.parseBlock(new Set(), "la fin du programme");
      return program;
    }

    let mainFound = false;
    while (this.cur.type !== "eof") {
      this.skipNewlines();
      const t = this.cur;
      if (t.type === "eof") break;
      if (this.isWord("ALGORITHME") || this.isWord("PROGRAMME")) {
        this.next();
        if (this.cur.type === "ident") program.name = this.next().value;
        this.skipRestOfLine();
      } else if (this.isAnyWord(new Set(["CONSTANTES", "CONSTANTE", "CONST"]))) {
        this.next();
        program.consts.push(...this.parseConstSection());
      } else if (this.isAnyWord(new Set(["VARIABLES", "VARIABLE", "VAR"]))) {
        this.next();
        program.vars.push(...this.parseVarSection());
      } else if (this.isWord("FONCTION") || this.isWord("PROCEDURE")) {
        program.routines.push(this.parseRoutine());
      } else if (this.isWord("DEBUT")) {
        if (mainFound) this.error("Le programme contient deux blocs DEBUT … FIN principaux.");
        this.next();
        program.body = this.parseBlock(new Set(["FIN"]), "FIN");
        this.next(); // FIN
        this.skipRestOfLine();
        mainFound = true;
      } else {
        this.error(
          `${this.describe(t)} inattendu à cet endroit.`,
          mainFound
            ? "Après le FIN du programme principal, seules des FONCTION ou PROCEDURE sont autorisées."
            : "Les instructions doivent être placées entre DEBUT et FIN.",
        );
      }
    }
    if (!mainFound) {
      throw new PseudoError(
        "syntaxe",
        "Bloc principal DEBUT … FIN introuvable.",
        this.cur.line,
        "Ajoutez DEBUT avant vos instructions et FIN après.",
      );
    }
    return program;
  }

  private parseConstSection(): ConstDecl[] {
    const out: ConstDecl[] = [];
    for (;;) {
      this.skipNewlines();
      if (this.cur.type !== "ident" || this.isAnyWord(SECTION_WORDS)) break;
      const nameTok = this.expectIdentifier("Un nom de constante");
      let type: TypeSpec | undefined;
      if (this.isOp(":")) {
        this.next();
        type = this.parseType();
      }
      if (!this.isOp("=") && !this.isOp("<-")) {
        this.error(`« = » attendu après le nom de la constante ${nameTok.value}.`, "Exemple : PI = 3.14");
      }
      this.next();
      const value = this.parseExpr();
      out.push({ name: idKey(nameTok.value), display: nameTok.value, value, type, line: nameTok.line });
    }
    return out;
  }

  private parseVarSection(): VarDecl[] {
    const out: VarDecl[] = [];
    for (;;) {
      this.skipNewlines();
      if (this.cur.type !== "ident" || this.isAnyWord(SECTION_WORDS)) break;
      const names: Token[] = [this.expectIdentifier("Un nom de variable")];
      while (this.isOp(",")) {
        this.next();
        names.push(this.expectIdentifier("Un nom de variable"));
      }
      this.expectOp(":", "Une déclaration s'écrit : nom : TYPE (exemple : age : ENTIER).");
      const type = this.parseType();
      for (const n of names) out.push({ name: idKey(n.value), display: n.value, type, line: n.line });
    }
    return out;
  }

  private parseBaseType(): BaseType {
    const t = this.cur;
    const base = t.type === "ident" ? BASE_TYPES[t.norm] : undefined;
    if (!base) {
      this.error(
        `Type inconnu ${this.describe(t)}.`,
        "Types disponibles : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN, TABLEAU[1..n] DE type.",
      );
    }
    this.next();
    // « CHAINE DE CARACTERES »
    if (base === "CHAINE" && this.isWord("DE") && this.peek().type === "ident" && BASE_TYPES[this.peek().norm] === "CARACTERE") {
      this.next();
      this.next();
    }
    return base;
  }

  private parseType(): TypeSpec {
    if (this.isWord("TABLEAU")) {
      this.next();
      let dims: TypeSpec["dims"];
      if (this.isOp("[")) {
        this.next();
        dims = [];
        for (;;) {
          const first = this.parseExpr();
          if (this.isOp("..")) {
            this.next();
            const hi = this.parseExpr();
            dims.push({ lo: first, hi });
          } else {
            dims.push({ lo: { kind: "num", value: 1, line: first.line }, hi: first });
          }
          if (this.isOp(",")) {
            this.next();
            continue;
          }
          break;
        }
        this.expectOp("]");
      }
      if (!this.isWord("DE") && !this.isOp(":")) {
        this.error("« DE » attendu après TABLEAU[…].", "Exemple : notes : TABLEAU[1..10] DE REEL");
      }
      this.next();
      const base = this.parseBaseType();
      return { base, dims, isArray: true };
    }
    return { base: this.parseBaseType() };
  }

  private parseRoutine(): Routine {
    const kwTok = this.next();
    const kind = kwTok.norm === "FONCTION" ? "fonction" : "procedure";
    const nameTok = this.expectIdentifier(`Le nom de la ${kind}`);
    const params: Param[] = [];
    if (this.isOp("(")) {
      this.next();
      while (!this.isOp(")")) {
        let byRef = false;
        // Modes de passage : VAR, ES, E/S, S (référence) — E (valeur)
        if ((this.isWord("VAR") || this.isWord("ES") || this.isWord("S") || this.isWord("REF")) && this.peek().type === "ident") {
          byRef = true;
          this.next();
        } else if (this.isWord("E") && this.isOp("/", this.peek()) && this.isWord("S", this.peek(2))) {
          byRef = true;
          this.next();
          this.next();
          this.next();
        } else if (this.isWord("E") && this.peek().type === "ident") {
          this.next();
        }
        const names: Token[] = [this.expectIdentifier("Un nom de paramètre")];
        while (this.isOp(",")) {
          this.next();
          names.push(this.expectIdentifier("Un nom de paramètre"));
        }
        this.expectOp(":", "Un paramètre s'écrit : nom : TYPE.");
        const type = this.parseType();
        if (type.isArray) byRef = true; // les tableaux sont toujours passés par référence
        for (const n of names) params.push({ name: idKey(n.value), display: n.value, type, byRef });
        if (this.isOp(",") || this.isOp(";")) {
          this.next();
          continue;
        }
        if (!this.isOp(")")) this.error(`« , » ou « ) » attendu dans la liste des paramètres.`);
      }
      this.next();
    }
    let returnType: TypeSpec | null = null;
    if (kind === "fonction") {
      if (!this.isOp(":")) {
        this.error(`Le type de retour de la fonction ${nameTok.value} est manquant.`, `Exemple : FONCTION ${nameTok.value}(x : ENTIER) : ENTIER`);
      }
      this.next();
      returnType = this.parseType();
    }
    const consts: ConstDecl[] = [];
    const vars: VarDecl[] = [];
    for (;;) {
      this.skipNewlines();
      if (this.isAnyWord(new Set(["VARIABLES", "VARIABLE", "VAR"]))) {
        this.next();
        vars.push(...this.parseVarSection());
      } else if (this.isAnyWord(new Set(["CONSTANTES", "CONSTANTE", "CONST"]))) {
        this.next();
        consts.push(...this.parseConstSection());
      } else break;
    }
    const endWord = kind === "fonction" ? "FINFONCTION" : "FINPROCEDURE";
    let body: Stmt[];
    if (this.isWord("DEBUT")) {
      this.next();
      body = this.parseBlock(new Set(["FIN", endWord]), `FIN ou ${endWord}`);
      const closing = this.next();
      if (closing.norm === "FIN") {
        // « FIN » puis éventuellement « FINFONCTION » sur la ligne suivante
        const save = this.pos;
        this.skipNewlines();
        if (this.isWord(endWord)) this.next();
        else this.pos = save;
      }
    } else {
      body = this.parseBlock(new Set([endWord, "FIN"]), endWord);
      this.next();
    }
    this.skipRestOfLine();
    return {
      kind,
      name: idKey(nameTok.value),
      display: nameTok.value,
      params,
      returnType,
      vars,
      consts,
      body,
      line: kwTok.line,
    };
  }

  // ---------- instructions ----------
  private parseBlock(terminators: Set<string>, expected: string): Stmt[] {
    const out: Stmt[] = [];
    for (;;) {
      this.skipNewlines();
      if (this.cur.type === "eof") {
        if (terminators.size === 0) return out;
        this.error(`${expected} attendu avant la fin du programme.`, `Vérifiez que chaque bloc ouvert est bien fermé par ${expected}.`);
      }
      if (this.isAnyWord(terminators)) return out;
      if (this.isAnyWord(BLOCK_WORDS)) {
        this.error(`${this.describe(this.cur)} inattendu : ${expected} était attendu.`, "Vérifiez l'imbrication de vos blocs SI / POUR / TANT QUE.");
      }
      out.push(this.parseStatement());
      const t = this.cur.type as Token["type"];
      if (!(t === "nl" || t === "eof" || this.isOp(";") || this.isAnyWord(BLOCK_WORDS))) {
        this.error(`Fin d'instruction attendue, mais ${this.describe(this.cur)} trouvé.`, "Écrivez une seule instruction par ligne.");
      }
    }
  }

  private parseStatement(): Stmt {
    const t = this.cur;
    const line = t.line;
    if (t.type !== "ident") this.error(`Instruction attendue, mais ${this.describe(t)} trouvé.`);

    switch (t.norm) {
      case "SI":
        return this.parseIf();
      case "POUR":
        return this.parseFor();
      case "TANTQUE": {
        this.next();
        const cond = this.parseExpr();
        if (this.isWord("FAIRE")) this.next();
        const body = this.parseBlock(new Set(["FINTANTQUE"]), "FINTANTQUE");
        this.next();
        return { kind: "while", cond, body, line };
      }
      case "REPETER": {
        this.next();
        const body = this.parseBlock(new Set(["JUSQUA"]), "JUSQU'A");
        this.next();
        const cond = this.parseExpr();
        return { kind: "repeat", body, cond, line };
      }
      case "SELON":
        return this.parseSwitch();
      case "RETOURNER":
      case "RETOURNE":
      case "RENVOYER": {
        this.next();
        if (this.cur.type === "nl" || this.cur.type === "eof" || this.isOp(";") || this.isAnyWord(BLOCK_WORDS)) {
          return { kind: "return", value: null, line };
        }
        return { kind: "return", value: this.parseExpr(), line };
      }
      case "ECRIRE":
      case "AFFICHER":
      case "ECRIRELN": {
        this.next();
        return { kind: "write", args: this.parseArgsForCommand(), newline: true, line };
      }
      case "LIRE":
      case "SAISIR": {
        this.next();
        const exprs = this.parseArgsForCommand();
        if (exprs.length === 0) this.error("LIRE doit recevoir au moins une variable.", "Exemple : LIRE(age)");
        const targets = exprs.map((e) => {
          if (e.kind !== "var" && e.kind !== "index") {
            throw new PseudoError("syntaxe", "LIRE ne peut lire que dans une variable ou une case de tableau.", e.line);
          }
          return e as LValue;
        });
        return { kind: "read", targets, line };
      }
      case "APPELER": {
        this.next();
        const nameTok = this.expectIdentifier("Le nom de la procédure");
        const args = this.isOp("(") ? this.parseCallArgs() : [];
        return { kind: "call", name: idKey(nameTok.value), display: nameTok.value, args, line };
      }
    }

    if (RESERVED.has(t.norm)) this.error(`${this.describe(t)} inattendu ici.`);

    // Appel de procédure ou affectation
    const nameTok = this.next();
    if (this.isOp("(")) {
      const args = this.parseCallArgs();
      return { kind: "call", name: idKey(nameTok.value), display: nameTok.value, args, line };
    }
    let target: LValue = { kind: "var", name: idKey(nameTok.value), display: nameTok.value, line };
    if (this.isOp("[")) {
      target = { kind: "index", name: idKey(nameTok.value), display: nameTok.value, indices: this.parseIndices(), line };
    }
    if (this.isOp("<-")) {
      this.next();
      return { kind: "assign", target, value: this.parseExpr(), line };
    }
    if (this.isOp("=")) {
      this.error(
        "« = » sert à comparer. Pour affecter une valeur à une variable, utilisez « ← » (ou « <- »).",
        `Exemple : ${nameTok.value} ← 5`,
      );
    }
    this.error(`Instruction incomplète après « ${nameTok.value} ».`, `Pour une affectation : ${nameTok.value} ← valeur`);
  }

  /** ECRIRE("a", b) ou ECRIRE "a", b */
  private parseArgsForCommand(): Expr[] {
    if (this.cur.type === "nl" || this.cur.type === "eof") return [];
    if (this.isOp("(")) {
      // Trouver la parenthèse fermante correspondante
      let depth = 0;
      let j = this.pos;
      for (; j < this.tokens.length; j++) {
        const tk = this.tokens[j];
        if (tk.type === "nl" || tk.type === "eof") break;
        if (tk.type === "op" && tk.norm === "(") depth++;
        if (tk.type === "op" && tk.norm === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      const after = this.tokens[j + 1];
      const wraps =
        this.tokens[j]?.norm === ")" &&
        after &&
        (after.type === "nl" || after.type === "eof" || (after.type === "op" && after.norm === ";") || (after.type === "ident" && BLOCK_WORDS.has(after.norm)));
      if (wraps) return this.parseCallArgs();
    }
    const args = [this.parseExpr()];
    while (this.isOp(",")) {
      this.next();
      args.push(this.parseExpr());
    }
    return args;
  }

  private parseCallArgs(): Expr[] {
    this.expectOp("(");
    const args: Expr[] = [];
    if (!this.isOp(")")) {
      args.push(this.parseExpr());
      while (this.isOp(",")) {
        this.next();
        args.push(this.parseExpr());
      }
    }
    this.expectOp(")", "Vérifiez que chaque parenthèse ouvrante a sa parenthèse fermante.");
    return args;
  }

  private parseIndices(): Expr[] {
    const indices: Expr[] = [];
    while (this.isOp("[")) {
      this.next();
      indices.push(this.parseExpr());
      while (this.isOp(",")) {
        this.next();
        indices.push(this.parseExpr());
      }
      this.expectOp("]");
    }
    return indices;
  }

  private parseIf(): Stmt {
    const line = this.next().line;
    const branches: Array<{ cond: Expr; body: Stmt[] }> = [];
    let cond = this.parseExpr();
    this.expectWord("ALORS", "ALORS", "Une condition s'écrit : SI condition ALORS … FINSI");
    const ends = new Set(["SINON", "SINONSI", "FINSI"]);
    let body = this.parseBlock(ends, "FINSI");
    branches.push({ cond, body });
    let elseBody: Stmt[] | null = null;
    for (;;) {
      if (this.isWord("SINONSI")) {
        this.next();
        cond = this.parseExpr();
        this.expectWord("ALORS", "ALORS");
        body = this.parseBlock(ends, "FINSI");
        branches.push({ cond, body });
        continue;
      }
      if (this.isWord("SINON")) {
        this.next();
        elseBody = this.parseBlock(new Set(["FINSI"]), "FINSI");
      }
      break;
    }
    this.expectWord("FINSI", "FINSI");
    return { kind: "if", branches, elseBody, line };
  }

  private parseFor(): Stmt {
    const line = this.next().line;
    const nameTok = this.expectIdentifier("Le compteur de la boucle");
    const variable: LValue = { kind: "var", name: idKey(nameTok.value), display: nameTok.value, line };
    if (this.isWord("DE") || this.isOp("<-") || this.isOp("=")) this.next();
    else this.error("« DE » ou « ← » attendu après le compteur.", "Exemple : POUR i DE 1 A 10 FAIRE");
    const from = this.parseExpr();
    if (this.isWord("A") || this.isWord("JUSQUA") || this.isWord("JUSQU")) this.next();
    else this.error("« A » attendu dans la boucle POUR.", "Exemple : POUR i DE 1 A 10 FAIRE");
    const to = this.parseExpr();
    let step: Expr | null = null;
    if (this.isWord("PAS")) {
      this.next();
      step = this.parseExpr();
    }
    if (this.isWord("FAIRE")) this.next();
    const body = this.parseBlock(new Set(["FINPOUR"]), "FINPOUR");
    this.next();
    // « FINPOUR i » toléré
    if (this.cur.type === "ident" && idKey(this.cur.value) === variable.name) this.next();
    return { kind: "for", variable, from, to, step, body, line };
  }

  private parseSwitch(): Stmt {
    const line = this.next().line;
    const subject = this.parseExpr();
    if (this.isWord("FAIRE")) this.next();
    const cases: Array<{ values: Expr[]; body: Stmt[] }> = [];
    let defaultBody: Stmt[] | null = null;
    const ends = new Set(["CAS", "AUTRE", "SINON", "FINSELON"]);
    for (;;) {
      this.skipNewlines();
      if (this.isWord("FINSELON")) break;
      if (this.isWord("CAS") && !this.isWord("AUTRE", this.peek())) {
        this.next();
        const values = [this.parseExpr()];
        while (this.isOp(",")) {
          this.next();
          values.push(this.parseExpr());
        }
        this.expectOp(":", "Exemple : CAS 1 : ECRIRE(\"Lundi\")");
        cases.push({ values, body: this.parseBlock(ends, "FINSELON") });
        continue;
      }
      if (this.isWord("AUTRE") || this.isWord("SINON") || this.isWord("CAS")) {
        if (this.isWord("CAS")) this.next();
        this.next();
        if (this.isOp(":")) this.next();
        defaultBody = this.parseBlock(new Set(["FINSELON"]), "FINSELON");
        break;
      }
      this.error(`CAS, AUTRE ou FINSELON attendu, mais ${this.describe(this.cur)} trouvé.`);
    }
    this.expectWord("FINSELON", "FINSELON");
    return { kind: "switch", subject, cases, defaultBody, line };
  }

  // ---------- expressions ----------
  parseExpr(): Expr {
    return this.parseOr();
  }
  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.isWord("OU")) {
      const line = this.next().line;
      left = { kind: "binary", op: "OU", left, right: this.parseAnd(), line };
    }
    return left;
  }
  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.isWord("ET")) {
      const line = this.next().line;
      left = { kind: "binary", op: "ET", left, right: this.parseNot(), line };
    }
    return left;
  }
  private parseNot(): Expr {
    if (this.isWord("NON")) {
      const line = this.next().line;
      return { kind: "unary", op: "NON", operand: this.parseNot(), line };
    }
    return this.parseComparison();
  }
  private parseComparison(): Expr {
    const left = this.parseAdd();
    if (this.cur.type === "op" && COMPARATORS.has(this.cur.norm)) {
      const tok = this.next();
      const right = this.parseAdd();
      if (this.cur.type === "op" && COMPARATORS.has(this.cur.norm)) {
        this.error(
          "Comparaisons enchaînées non autorisées (exemple : 0 < x < 10).",
          "Utilisez ET : (x > 0) ET (x < 10)",
        );
      }
      return { kind: "binary", op: tok.norm, left, right, line: tok.line };
    }
    return left;
  }
  private parseAdd(): Expr {
    let left = this.parseMul();
    while (this.isOp("+") || this.isOp("-")) {
      const tok = this.next();
      left = { kind: "binary", op: tok.norm, left, right: this.parseMul(), line: tok.line };
    }
    return left;
  }
  private parseMul(): Expr {
    let left = this.parseUnary();
    while (this.isOp("*") || this.isOp("/") || this.isOp("MOD") || this.isWord("DIV") || this.isWord("MOD")) {
      const tok = this.next();
      left = { kind: "binary", op: tok.norm, left, right: this.parseUnary(), line: tok.line };
    }
    return left;
  }
  private parseUnary(): Expr {
    if (this.isOp("-") || this.isOp("+")) {
      const tok = this.next();
      return { kind: "unary", op: tok.norm as "-" | "+", operand: this.parseUnary(), line: tok.line };
    }
    return this.parsePow();
  }
  private parsePow(): Expr {
    const base = this.parsePrimary();
    if (this.isOp("^")) {
      const tok = this.next();
      return { kind: "binary", op: "^", left: base, right: this.parseUnary(), line: tok.line };
    }
    return base;
  }
  private parsePrimary(): Expr {
    const t = this.cur;
    if (t.type === "num") {
      this.next();
      return { kind: "num", value: Number(t.value), line: t.line };
    }
    if (t.type === "str") {
      this.next();
      return { kind: "str", value: t.value, line: t.line };
    }
    if (this.isOp("(")) {
      this.next();
      const e = this.parseExpr();
      this.expectOp(")", "Vérifiez vos parenthèses.");
      return e;
    }
    if (this.isWord("VRAI") || this.isWord("FAUX")) {
      this.next();
      return { kind: "bool", value: t.norm === "VRAI", line: t.line };
    }
    if (t.type === "ident") {
      if (RESERVED.has(t.norm)) this.error(`Valeur attendue, mais le mot-clé « ${t.value} » a été trouvé.`);
      this.next();
      if (this.isOp("(")) {
        return { kind: "call", name: idKey(t.value), display: t.value, args: this.parseCallArgs(), line: t.line };
      }
      if (this.isOp("[")) {
        return { kind: "index", name: idKey(t.value), display: t.value, indices: this.parseIndices(), line: t.line };
      }
      return { kind: "var", name: idKey(t.value), display: t.value, line: t.line };
    }
    this.error(`Valeur attendue, mais ${this.describe(t)} trouvé.`);
  }
}

export function parse(source: string) {
  return new Parser(tokenize(source)).parseProgram();
}
