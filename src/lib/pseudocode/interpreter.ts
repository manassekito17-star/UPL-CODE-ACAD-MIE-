import type { BaseType, Expr, LValue, Program, Routine, Stmt, TypeSpec } from "./ast";
import { PseudoError } from "./lexer";
import { parse } from "./parser";

export interface ArrayValue {
  kind: "array";
  base: BaseType;
  dims: Array<[number, number]>;
  data: Value[];
}
export type Value = number | string | boolean | ArrayValue;

interface Slot {
  display: string;
  type: TypeSpec | null; // null = typage dynamique (mode script)
  value: Value | undefined;
  isConst: boolean;
}

interface Ref {
  get(): Value | undefined;
  set(v: Value): void;
  type: TypeSpec | null;
  display: string;
}

interface Frame {
  vars: Map<string, Slot | { ref: Ref }>;
  routine: Routine | null;
}

export interface RunLimits {
  /** Nombre maximal d'instructions exécutées. */
  maxSteps: number;
  /** Profondeur maximale de récursivité. */
  maxDepth: number;
  /** Taille maximale de la sortie en caractères. */
  maxOutput: number;
}

export const DEFAULT_LIMITS: RunLimits = {
  maxSteps: 2_000_000,
  maxDepth: 500,
  maxOutput: 100_000,
};

export interface TraceVariable {
  name: string;
  type: string;
  value: string;
}

/** État de l'algorithme juste AVANT l'exécution de l'instruction de la ligne indiquée. */
export interface TraceStep {
  index: number;
  line: number;
  kind: Stmt["kind"] | "fin";
  /** Pile d'appels, du programme principal à la routine courante. */
  stack: string[];
  /** Variables visibles : locales de la routine courante puis globales. */
  variables: TraceVariable[];
  /** Sortie produite jusqu'ici. */
  output: string;
  /**
   * Explication de l'étape (mode détaillé du laboratoire) : résultat d'une
   * condition, numéro d'itération, appel ou retour de sous-programme.
   */
  note?: string;
  /** Résultat de la condition évaluée à cette étape (mode détaillé). */
  decision?: boolean;
  /** Ligne du saut de boucle : vérification de la condition / passage au tour suivant. */
  loopCheck?: boolean;
}

export interface RunResult {
  ok: boolean;
  stdout: string;
  error: null | { kind: "syntaxe" | "execution"; message: string; line: number; hint?: string };
  steps: number;
}

class ReturnSignal {
  constructor(public value: Value | null) {}
}

const TYPE_LABEL: Record<BaseType, string> = {
  ENTIER: "ENTIER",
  REEL: "REEL",
  CHAINE: "CHAINE",
  CARACTERE: "CARACTERE",
  BOOLEEN: "BOOLEEN",
};

export function formatValue(v: Value | undefined): string {
  if (v === undefined) return "?";
  if (typeof v === "boolean") return v ? "VRAI" : "FAUX";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return String(Number(v.toPrecision(12)));
  }
  if (typeof v === "string") return v;
  return `[${v.data.map(formatValue).join(", ")}]`;
}

function typeName(v: Value | undefined): string {
  if (v === undefined) return "indéfinie";
  if (typeof v === "number") return Number.isInteger(v) ? "ENTIER" : "REEL";
  if (typeof v === "string") return "CHAINE";
  if (typeof v === "boolean") return "BOOLEEN";
  return "TABLEAU";
}

class Interpreter {
  private steps = 0;
  private depth = 0;
  private out: string[] = [];
  private outLen = 0;
  private globals: Frame = { vars: new Map(), routine: null };
  private frame: Frame = this.globals;
  private routines = new Map<string, Routine>();
  private inputTokens: string[];
  private inputPos = 0;

  private stack: string[] = ["Programme principal"];
  tracer: ((step: Omit<TraceStep, "index">) => TraceStep | undefined) | null = null;
  /** Mode détaillé : étapes supplémentaires aux vérifications de boucle et explications. */
  detailed = false;

  private annotateStep(step: TraceStep | undefined, note: string, decision: boolean) {
    if (this.detailed && step) {
      step.note = note;
      step.decision = decision;
    }
  }

  private emitLoopCheck(line: number, kind: Stmt["kind"], note: string, decision: boolean): TraceStep | undefined {
    if (!this.detailed || !this.tracer) return undefined;
    return this.tracer({ line, kind, stack: [...this.stack], variables: this.snapshot(), output: this.stdout, note, decision, loopCheck: true });
  }

  constructor(
    private program: Program & { implicitVars: boolean },
    stdin: string,
    private limits: RunLimits,
  ) {
    this.inputTokens = stdin.replace(/\r\n?/g, "\n").split("\n");
    // On retire la dernière ligne vide éventuelle
    if (this.inputTokens.length && this.inputTokens[this.inputTokens.length - 1] === "") this.inputTokens.pop();
  }

  get stdout() {
    return this.out.join("");
  }
  get stepCount() {
    return this.steps;
  }

  run() {
    for (const r of this.program.routines) {
      if (this.routines.has(r.name)) {
        throw new PseudoError("syntaxe", `La ${r.kind} « ${r.display} » est définie deux fois.`, r.line);
      }
      this.routines.set(r.name, r);
    }
    for (const c of this.program.consts) this.declareConst(this.globals, c.name, c.display, c.value, c.type, c.line);
    for (const v of this.program.vars) this.declareVar(this.globals, v.name, v.display, v.type, v.line);
    try {
      this.execBlock(this.program.body);
    } catch (e) {
      if (e instanceof ReturnSignal) return; // RETOURNER dans le programme principal : arrêt
      throw e;
    }
  }

  // ---------- déclarations ----------
  private declareConst(frame: Frame, name: string, display: string, expr: Expr, type: TypeSpec | undefined, line: number) {
    if (frame.vars.has(name)) throw new PseudoError("execution", `« ${display} » est déclaré deux fois.`, line);
    const value = this.eval(expr);
    frame.vars.set(name, { display, type: type ?? null, value, isConst: true });
  }

  private declareVar(frame: Frame, name: string, display: string, type: TypeSpec, line: number) {
    if (frame.vars.has(name)) throw new PseudoError("execution", `La variable « ${display} » est déclarée deux fois.`, line);
    if (this.routines.has(name) && frame === this.globals) {
      throw new PseudoError("execution", `« ${display} » est à la fois une variable et une fonction.`, line);
    }
    let value: Value | undefined;
    if (type.dims) {
      const dims: Array<[number, number]> = type.dims.map((d) => {
        const lo = this.eval(d.lo);
        const hi = this.eval(d.hi);
        if (typeof lo !== "number" || typeof hi !== "number" || !Number.isInteger(lo) || !Number.isInteger(hi)) {
          throw new PseudoError("execution", `Les bornes du tableau « ${display} » doivent être des entiers.`, line);
        }
        if (hi < lo) throw new PseudoError("execution", `Bornes invalides pour « ${display} » : ${lo}..${hi}.`, line);
        return [lo, hi];
      });
      const size = dims.reduce((acc, [lo, hi]) => acc * (hi - lo + 1), 1);
      if (size > 1_000_000) throw new PseudoError("execution", `Le tableau « ${display} » est trop grand (${size} cases).`, line);
      value = { kind: "array", base: type.base, dims, data: new Array(size).fill(undefined) };
    }
    frame.vars.set(name, { display, type, value, isConst: false });
  }

  // ---------- accès aux variables ----------
  private lookup(name: string, display: string, line: number): Ref {
    let entry = this.frame.vars.get(name);
    if (!entry && this.frame !== this.globals) entry = this.globals.vars.get(name);
    if (!entry) {
      if (this.program.implicitVars) {
        const slot: Slot = { display, type: null, value: undefined, isConst: false };
        this.frame.vars.set(name, slot);
        entry = slot;
      } else {
        const hint = this.routines.has(name)
          ? `« ${display} » est une fonction : appelez-la avec des parenthèses, par exemple ${display}(…).`
          : `Déclarez-la dans la section VARIABLES, par exemple : ${display} : ENTIER`;
        throw new PseudoError("execution", `Variable « ${display} » non déclarée.`, line, hint);
      }
    }
    if ("ref" in entry) return entry.ref;
    const slot = entry;
    return {
      get: () => slot.value,
      set: (v: Value) => {
        if (slot.isConst) throw new PseudoError("execution", `« ${slot.display} » est une constante : sa valeur ne peut pas changer.`, line);
        slot.value = v;
      },
      type: slot.type,
      display: slot.display,
    };
  }

  private checkType(type: TypeSpec | null, value: Value, display: string, line: number): Value {
    if (!type) return value;
    if (type.isArray) {
      if (typeof value !== "object") {
        throw new PseudoError("execution", `« ${display} » est un tableau : on ne peut pas lui affecter une valeur simple.`, line, "Affectez une case précise : T[i] ← valeur");
      }
      return value;
    }
    return this.checkBase(type.base, value, display, line);
  }

  private checkBase(base: BaseType, value: Value, display: string, line: number): Value {
    const bad = () =>
      new PseudoError(
        "execution",
        `Type incompatible : « ${display} » est de type ${TYPE_LABEL[base]} mais reçoit une valeur de type ${typeName(value)} (${formatValue(value)}).`,
        line,
        base === "ENTIER" && typeof value === "number"
          ? "La division « / » donne un REEL. Pour une division entière, utilisez DIV."
          : undefined,
      );
    switch (base) {
      case "ENTIER":
        if (typeof value !== "number" || !Number.isInteger(value)) throw bad();
        return value;
      case "REEL":
        if (typeof value !== "number") throw bad();
        return value;
      case "CHAINE":
        if (typeof value !== "string") throw bad();
        return value;
      case "CARACTERE":
        if (typeof value !== "string" || value.length !== 1) {
          throw new PseudoError(
            "execution",
            `« ${display} » est de type CARACTERE : il doit contenir exactement un caractère (reçu : « ${formatValue(value)} »).`,
            line,
          );
        }
        return value;
      case "BOOLEEN":
        if (typeof value !== "boolean") throw bad();
        return value;
    }
  }

  private arrayOffset(arr: ArrayValue, indices: number[], display: string, line: number): number {
    if (indices.length !== arr.dims.length) {
      throw new PseudoError("execution", `Le tableau « ${display} » a ${arr.dims.length} dimension(s), mais ${indices.length} indice(s) ont été donnés.`, line);
    }
    let offset = 0;
    for (let k = 0; k < indices.length; k++) {
      const [lo, hi] = arr.dims[k];
      const idx = indices[k];
      if (!Number.isInteger(idx)) throw new PseudoError("execution", `L'indice de « ${display} » doit être un entier (reçu : ${formatValue(idx)}).`, line);
      if (idx < lo || idx > hi) {
        throw new PseudoError(
          "execution",
          `Indice hors limites : ${display}[${idx}] n'existe pas (indices valides : ${lo} à ${hi}).`,
          line,
          "Vérifiez les bornes de votre boucle.",
        );
      }
      offset = offset * (hi - lo + 1) + (idx - lo);
    }
    return offset;
  }

  private lvalueRef(target: LValue): Ref {
    const base = this.lookup(target.name, target.display, target.line);
    if (target.kind === "var") return base;
    const container = base.get();
    const indices = target.indices.map((e) => this.evalNumber(e, "Un indice"));
    if (typeof container === "string") {
      throw new PseudoError("execution", `On ne peut pas modifier un caractère de la chaîne « ${target.display} » directement.`, target.line);
    }
    if (!container || typeof container !== "object") {
      if (this.program.implicitVars && container === undefined) {
        throw new PseudoError("execution", `« ${target.display} » n'est pas un tableau.`, target.line, "En mode simplifié, déclarez vos tableaux dans une section VARIABLES.");
      }
      throw new PseudoError("execution", `« ${target.display} » n'est pas un tableau.`, target.line);
    }
    const arr = container;
    const offset = this.arrayOffset(arr, indices, target.display, target.line);
    const display = `${target.display}[${indices.join(", ")}]`;
    return {
      get: () => arr.data[offset],
      set: (v: Value) => {
        arr.data[offset] = this.checkBase(arr.base, v, display, target.line);
      },
      type: { base: arr.base },
      display,
    };
  }

  // ---------- instructions ----------
  private tick(line: number) {
    if (++this.steps > this.limits.maxSteps) {
      throw new PseudoError(
        "execution",
        `Limite d'exécution atteinte (${this.limits.maxSteps.toLocaleString("fr-FR")} instructions).`,
        line,
        "Votre programme contient peut-être une boucle infinie : vérifiez que la condition de sortie finit par être atteinte.",
      );
    }
  }

  private write(text: string, line: number) {
    this.outLen += text.length;
    if (this.outLen > this.limits.maxOutput) {
      throw new PseudoError("execution", "Sortie trop longue : le programme affiche trop de texte.", line, "Vérifiez qu'une boucle n'affiche pas indéfiniment.");
    }
    this.out.push(text);
  }

  private execBlock(stmts: Stmt[]) {
    for (const s of stmts) this.exec(s);
  }

  /** Photographie des variables visibles (pour la trace et le laboratoire). */
  snapshot(): TraceVariable[] {
    const out: TraceVariable[] = [];
    const describeType = (t: TypeSpec | null, v: Value | undefined) => {
      if (t?.isArray || (v && typeof v === "object")) return `TABLEAU DE ${t?.base ?? (v as ArrayValue).base}`;
      return t?.base ?? (v === undefined ? "?" : typeName(v));
    };
    const add = (frame: Frame, seen: Set<string>) => {
      for (const [name, entry] of frame.vars) {
        if (seen.has(name)) continue;
        seen.add(name);
        if ("ref" in entry) {
          const v = entry.ref.get();
          out.push({ name: entry.ref.display, type: `${describeType(entry.ref.type, v)} (réf.)`, value: v === undefined ? "?" : formatValue(v) });
        } else {
          out.push({ name: entry.display + (entry.isConst ? " (const.)" : ""), type: describeType(entry.type, entry.value), value: entry.value === undefined ? "?" : formatValue(entry.value) });
        }
      }
    };
    const seen = new Set<string>();
    add(this.frame, seen);
    if (this.frame !== this.globals) add(this.globals, seen);
    return out;
  }

  traceEnd(line: number) {
    this.tracer?.({ line, kind: "fin", stack: [...this.stack], variables: this.snapshot(), output: this.stdout });
  }

  private exec(s: Stmt) {
    this.tick(s.line);
    const step = this.tracer?.({ line: s.line, kind: s.kind, stack: [...this.stack], variables: this.snapshot(), output: this.stdout });
    const annotate = (note: string, decision?: boolean) => {
      if (this.detailed && step) {
        step.note = note;
        if (decision !== undefined) step.decision = decision;
      }
    };
    switch (s.kind) {
      case "assign": {
        const ref = this.lvalueRef(s.target);
        const value = this.eval(s.value);
        if (typeof value === "object" && s.target.kind === "var") {
          // Copie d'un tableau complet
          ref.set(this.checkType(ref.type, { ...value, data: [...value.data] }, ref.display, s.line));
        } else {
          ref.set(this.checkType(ref.type, value, ref.display, s.line));
        }
        return;
      }
      case "write": {
        const text = s.args.map((a) => formatValue(this.eval(a))).join("");
        this.write(text + (s.newline ? "\n" : ""), s.line);
        return;
      }
      case "read": {
        for (const t of s.targets) {
          const ref = this.lvalueRef(t);
          ref.set(this.readValue(ref, s.line));
        }
        return;
      }
      case "if": {
        for (const [k, b] of s.branches.entries()) {
          if (this.evalBool(b.cond, "La condition du SI")) {
            annotate(k === 0 ? "Condition VRAIE : on exécute le bloc ALORS." : `Conditions précédentes FAUSSES, condition du SINON SI n° ${k} VRAIE : on exécute ce bloc.`, true);
            this.execBlock(b.body);
            return;
          }
        }
        annotate(s.elseBody ? "Condition(s) FAUSSE(S) : on exécute le bloc SINON." : "Condition FAUSSE : le bloc ALORS est ignoré.", false);
        if (s.elseBody) this.execBlock(s.elseBody);
        return;
      }
      case "for": {
        const ref = this.lvalueRef(s.variable);
        const from = this.evalNumber(s.from, "La valeur de départ du POUR");
        const to = this.evalNumber(s.to, "La valeur d'arrivée du POUR");
        const step = s.step ? this.evalNumber(s.step, "Le PAS") : 1;
        if (step === 0) throw new PseudoError("execution", "Le PAS d'une boucle POUR ne peut pas valoir 0.", s.line);
        ref.set(this.checkType(ref.type, from, ref.display, s.line));
        let turn = 0;
        for (;;) {
          const cur = ref.get() as number;
          const done = step > 0 ? cur > to : cur < to;
          const msg = done
            ? `${ref.display} = ${formatValue(cur)} ${step > 0 ? ">" : "<"} ${formatValue(to)} : fin de la boucle POUR (${turn} tour(s)).`
            : `${ref.display} = ${formatValue(cur)} : tour n° ${turn + 1} de la boucle POUR.`;
          if (turn === 0) annotate(msg, !done);
          else this.emitLoopCheck(s.line, s.kind, msg, !done);
          if (done) break;
          turn++;
          this.tick(s.line);
          this.execBlock(s.body);
          ref.set(this.checkType(ref.type, (ref.get() as number) + step, ref.display, s.line));
        }
        return;
      }
      case "while": {
        let turn = 0;
        for (;;) {
          const check = turn > 0 ? this.emitLoopCheck(s.line, s.kind, "Retour au TANT QUE : on réévalue la condition.", true) : undefined;
          const ok = this.evalBool(s.cond, "La condition du TANT QUE");
          const msg = ok ? `Condition VRAIE : tour n° ${turn + 1} de la boucle TANT QUE.` : `Condition FAUSSE : sortie de la boucle TANT QUE (${turn} tour(s)).`;
          if (turn === 0) annotate(msg, ok);
          else this.annotateStep(check, msg, ok);
          if (!ok) break;
          turn++;
          this.tick(s.line);
          this.execBlock(s.body);
        }
        return;
      }
      case "repeat": {
        let turn = 0;
        annotate("Début de la boucle RÉPÉTER : le bloc s'exécute au moins une fois.");
        for (;;) {
          turn++;
          this.tick(s.line);
          this.execBlock(s.body);
          const check = this.emitLoopCheck(s.line, s.kind, "Fin du tour : on évalue la condition JUSQU'A.", false);
          const stop = this.evalBool(s.cond, "La condition du JUSQU'A");
          this.annotateStep(check, stop ? `Condition JUSQU'A VRAIE : sortie de la boucle (${turn} tour(s)).` : `Condition JUSQU'A FAUSSE : tour n° ${turn + 1}.`, !stop);
          if (stop) break;
        }
        return;
      }
      case "switch": {
        const subject = this.eval(s.subject);
        for (const c of s.cases) {
          if (c.values.some((v) => this.eval(v) === subject)) {
            annotate(`Valeur testée : ${formatValue(subject)} → cas correspondant exécuté.`);
            this.execBlock(c.body);
            return;
          }
        }
        annotate(`Valeur testée : ${formatValue(subject)} → aucun cas ne correspond${s.defaultBody ? ", bloc AUTRE exécuté" : ""}.`);
        if (s.defaultBody) this.execBlock(s.defaultBody);
        return;
      }
      case "return": {
        if (!this.frame.routine) {
          throw new ReturnSignal(null);
        }
        if (this.frame.routine.kind === "procedure" && s.value) {
          throw new PseudoError("execution", "Une PROCEDURE ne retourne pas de valeur.", s.line, "Utilisez une FONCTION si vous avez besoin d'un résultat.");
        }
        const rv = s.value ? this.eval(s.value) : null;
        annotate(rv === null ? `Fin de ${this.frame.routine!.display} : retour à l'appelant.` : `${this.frame.routine!.display} retourne ${formatValue(rv)} à l'appelant.`);
        throw new ReturnSignal(rv);
      }
      case "call": {
        const routine = this.routines.get(s.name);
        if (!routine && BUILTINS[s.name]) {
          throw new PseudoError("execution", `« ${s.display} » est une fonction prédéfinie : son résultat doit être utilisé.`, s.line, `Exemple : ECRIRE(${s.display}(…))`);
        }
        annotate(`Appel de la procédure ${s.display} : une nouvelle zone de variables est créée.`);
        this.callRoutine(s.name, s.display, s.args, s.line, false);
        return;
      }
    }
  }

  private readValue(ref: Ref, line: number): Value {
    const base = ref.type?.base;
    if (this.inputPos >= this.inputTokens.length) {
      throw new PseudoError(
        "execution",
        `Aucune donnée disponible pour LIRE(${ref.display}).`,
        line,
        "Saisissez les valeurs d'entrée dans la zone « Entrée » (une valeur par ligne).",
      );
    }
    const rawLine = this.inputTokens[this.inputPos++];
    const text = rawLine.trim();
    const parseNum = () => Number(text.replace(",", "."));
    if (!base) {
      // typage dynamique : nombre si possible
      if (text !== "" && !Number.isNaN(parseNum())) return parseNum();
      return rawLine;
    }
    switch (base) {
      case "ENTIER": {
        const n = parseNum();
        if (text === "" || !Number.isInteger(n)) {
          throw new PseudoError("execution", `LIRE(${ref.display}) attend un ENTIER, mais a reçu « ${text} ».`, line);
        }
        return n;
      }
      case "REEL": {
        const n = parseNum();
        if (text === "" || Number.isNaN(n)) {
          throw new PseudoError("execution", `LIRE(${ref.display}) attend un REEL, mais a reçu « ${text} ».`, line);
        }
        return n;
      }
      case "BOOLEEN": {
        const t = text.toUpperCase();
        if (t === "VRAI" || t === "TRUE" || t === "1") return true;
        if (t === "FAUX" || t === "FALSE" || t === "0") return false;
        throw new PseudoError("execution", `LIRE(${ref.display}) attend VRAI ou FAUX, mais a reçu « ${text} ».`, line);
      }
      case "CARACTERE":
        return text.charAt(0);
      default:
        return rawLine;
    }
  }

  private callRoutine(name: string, display: string, args: Expr[], line: number, expectValue: boolean): Value | null {
    const routine = this.routines.get(name);
    if (!routine) {
      throw new PseudoError("execution", `Fonction ou procédure « ${display} » inconnue.`, line, "Vérifiez l'orthographe ou définissez-la avec FONCTION / PROCEDURE.");
    }
    if (expectValue && routine.kind === "procedure") {
      throw new PseudoError("execution", `« ${routine.display} » est une PROCEDURE : elle ne retourne pas de valeur.`, line);
    }
    if (args.length !== routine.params.length) {
      throw new PseudoError(
        "execution",
        `« ${routine.display} » attend ${routine.params.length} argument(s), mais ${args.length} ont été donnés.`,
        line,
      );
    }
    if (this.depth >= this.limits.maxDepth) {
      throw new PseudoError(
        "execution",
        `Trop d'appels imbriqués (plus de ${this.limits.maxDepth}).`,
        line,
        "Votre récursivité n'a peut-être pas de cas de base, ou celui-ci n'est jamais atteint.",
      );
    }
    const frame: Frame = { vars: new Map(), routine };
    routine.params.forEach((p, k) => {
      const arg = args[k];
      if (p.byRef) {
        if (arg.kind !== "var" && arg.kind !== "index") {
          throw new PseudoError("execution", `Le paramètre « ${p.display} » est passé par référence : l'argument doit être une variable.`, line);
        }
        const ref = this.lvalueRef(arg);
        if (p.type.isArray) {
          const v = ref.get();
          if (!v || typeof v !== "object") {
            throw new PseudoError("execution", `Le paramètre « ${p.display} » attend un tableau.`, line);
          }
        }
        frame.vars.set(p.name, { ref: { ...ref, display: p.display } });
      } else {
        const v = this.eval(arg);
        frame.vars.set(p.name, {
          display: p.display,
          type: p.type,
          value: this.checkType(p.type, typeof v === "object" ? { ...v, data: [...v.data] } : v, p.display, line),
          isConst: false,
        });
      }
    });
    const saved = this.frame;
    this.frame = frame;
    this.depth++;
    this.stack.push(`${routine.display}(${routine.params.map((p) => p.display).join(", ")})`);
    try {
      for (const c of routine.consts) this.declareConst(frame, c.name, c.display, c.value, c.type, c.line);
      for (const v of routine.vars) this.declareVar(frame, v.name, v.display, v.type, v.line);
      this.execBlock(routine.body);
    } catch (e) {
      if (e instanceof ReturnSignal) {
        if (routine.kind === "fonction") {
          if (e.value === null) throw new PseudoError("execution", `La fonction « ${routine.display} » doit retourner une valeur.`, line);
          return this.checkType(routine.returnType, e.value, `le résultat de ${routine.display}`, line);
        }
        return null;
      }
      throw e;
    } finally {
      this.frame = saved;
      this.depth--;
      this.stack.pop();
    }
    if (routine.kind === "fonction") {
      throw new PseudoError(
        "execution",
        `La fonction « ${routine.display} » s'est terminée sans RETOURNER de valeur.`,
        routine.line,
        "Ajoutez une instruction RETOURNER à la fin de la fonction.",
      );
    }
    return null;
  }

  // ---------- expressions ----------
  private evalNumber(e: Expr, what: string): number {
    const v = this.eval(e);
    if (typeof v !== "number") throw new PseudoError("execution", `${what} doit être un nombre (reçu : ${typeName(v)}).`, e.line);
    return v;
  }
  private evalBool(e: Expr, what: string): boolean {
    const v = this.eval(e);
    if (typeof v !== "boolean") {
      throw new PseudoError("execution", `${what} doit être VRAI ou FAUX (reçu : ${formatValue(v)}).`, e.line, "Utilisez une comparaison, par exemple : x > 0");
    }
    return v;
  }

  eval(e: Expr): Value {
    switch (e.kind) {
      case "num":
      case "str":
      case "bool":
        return e.value;
      case "var": {
        if (e.name in CONSTANTS && !this.frame.vars.has(e.name) && !this.globals.vars.has(e.name)) return CONSTANTS[e.name];
        const v = this.lookup(e.name, e.display, e.line).get();
        if (v === undefined) {
          throw new PseudoError(
            "execution",
            `La variable « ${e.display} » est utilisée avant d'avoir reçu une valeur.`,
            e.line,
            `Initialisez-la d'abord, par exemple : ${e.display} ← 0`,
          );
        }
        return v;
      }
      case "index": {
        const container = this.lookup(e.name, e.display, e.line).get();
        const indices = e.indices.map((x) => this.evalNumber(x, "Un indice"));
        if (typeof container === "string") {
          if (indices.length !== 1) throw new PseudoError("execution", "Une chaîne n'a qu'un seul indice.", e.line);
          const i = indices[0];
          if (!Number.isInteger(i) || i < 1 || i > container.length) {
            throw new PseudoError("execution", `Indice ${i} hors de la chaîne « ${e.display} » (indices valides : 1 à ${container.length}).`, e.line);
          }
          return container[i - 1];
        }
        if (!container || typeof container !== "object") {
          throw new PseudoError("execution", `« ${e.display} » n'est pas un tableau.`, e.line);
        }
        const v = container.data[this.arrayOffset(container, indices, e.display, e.line)];
        if (v === undefined) {
          throw new PseudoError(
            "execution",
            `La case ${e.display}[${indices.join(", ")}] est utilisée avant d'avoir reçu une valeur.`,
            e.line,
          );
        }
        return v;
      }
      case "call": {
        if (this.routines.has(e.name)) {
          return this.callRoutine(e.name, e.display, e.args, e.line, true) as Value;
        }
        const builtin = BUILTINS[e.name];
        if (builtin) {
          if (builtin.arity !== undefined && builtin.arity !== e.args.length) {
            throw new PseudoError("execution", `${e.display.toUpperCase()} attend ${builtin.arity} argument(s).`, e.line);
          }
          return builtin.fn(e.args.map((a) => this.eval(a)), e.line);
        }
        throw new PseudoError("execution", `Fonction « ${e.display} » inconnue.`, e.line, "Vérifiez l'orthographe ou définissez-la avec FONCTION.");
      }
      case "unary": {
        const v = this.eval(e.operand);
        if (e.op === "NON") {
          if (typeof v !== "boolean") throw new PseudoError("execution", "NON s'applique à une valeur VRAI ou FAUX.", e.line);
          return !v;
        }
        if (typeof v !== "number") throw new PseudoError("execution", `Le signe « ${e.op} » s'applique à un nombre.`, e.line);
        return e.op === "-" ? -v : v;
      }
      case "binary":
        return this.evalBinary(e);
    }
  }

  private evalBinary(e: Extract<Expr, { kind: "binary" }>): Value {
    if (e.op === "ET" || e.op === "OU") {
      const l = this.evalBool(e.left, `L'opérande gauche de ${e.op}`);
      if (e.op === "ET" && !l) return false;
      if (e.op === "OU" && l) return true;
      return this.evalBool(e.right, `L'opérande droite de ${e.op}`);
    }
    const l = this.eval(e.left);
    const r = this.eval(e.right);
    const num = (side: Value, which: string): number => {
      if (typeof side !== "number") {
        throw new PseudoError(
          "execution",
          `L'opérateur « ${e.op} » attend des nombres, mais l'opérande ${which} vaut ${formatValue(side)} (${typeName(side)}).`,
          e.line,
          e.op === "+" ? "Pour coller du texte et un nombre, utilisez ECRIRE(\"texte\", nombre) ou CHAINE(nombre)." : undefined,
        );
      }
      return side;
    };
    switch (e.op) {
      case "+":
        if (typeof l === "string" && typeof r === "string") return l + r;
        return num(l, "gauche") + num(r, "droite");
      case "-":
        return num(l, "gauche") - num(r, "droite");
      case "*":
        return num(l, "gauche") * num(r, "droite");
      case "/": {
        const d = num(r, "droite");
        if (d === 0) throw new PseudoError("execution", "Division par zéro.", e.line, "Vérifiez que le diviseur est différent de 0 avant de diviser.");
        return num(l, "gauche") / d;
      }
      case "DIV":
      case "MOD": {
        const a = num(l, "gauche");
        const b = num(r, "droite");
        if (!Number.isInteger(a) || !Number.isInteger(b)) {
          throw new PseudoError("execution", `${e.op} s'applique à des entiers.`, e.line);
        }
        if (b === 0) throw new PseudoError("execution", "Division par zéro.", e.line);
        return e.op === "DIV" ? Math.trunc(a / b) : a % b;
      }
      case "^":
        return Math.pow(num(l, "gauche"), num(r, "droite"));
      case "=":
      case "<>": {
        if (typeof l === "object" || typeof r === "object") {
          throw new PseudoError("execution", "On ne peut pas comparer des tableaux entiers.", e.line);
        }
        if (typeof l !== typeof r) {
          throw new PseudoError("execution", `Comparaison impossible entre ${typeName(l)} et ${typeName(r)}.`, e.line);
        }
        return e.op === "=" ? l === r : l !== r;
      }
      case "<":
      case ">":
      case "<=":
      case ">=": {
        let a: number | string;
        let b: number | string;
        if (typeof l === "string" && typeof r === "string") {
          a = l;
          b = r;
        } else {
          a = num(l, "gauche");
          b = num(r, "droite");
        }
        if (e.op === "<") return a < b;
        if (e.op === ">") return a > b;
        if (e.op === "<=") return a <= b;
        return a >= b;
      }
    }
    throw new PseudoError("execution", `Opérateur inconnu « ${e.op} ».`, e.line);
  }
}

// ---------- fonctions prédéfinies ----------
type Builtin = { arity?: number; fn: (args: Value[], line: number) => Value };

const needNum = (v: Value, name: string, line: number): number => {
  if (typeof v !== "number") throw new PseudoError("execution", `${name} attend un nombre.`, line);
  return v;
};
const needStr = (v: Value, name: string, line: number): string => {
  if (typeof v !== "string") throw new PseudoError("execution", `${name} attend une chaîne de caractères.`, line);
  return v;
};
const needInt = (v: Value, name: string, line: number): number => {
  const n = needNum(v, name, line);
  if (!Number.isInteger(n)) throw new PseudoError("execution", `${name} attend un nombre entier.`, line);
  return n;
};
const arity = (args: Value[], name: string, line: number, ...allowed: number[]) => {
  if (!allowed.includes(args.length)) {
    const list = allowed.length === 1 ? String(allowed[0]) : `${allowed.slice(0, -1).join(", ")} ou ${allowed[allowed.length - 1]}`;
    throw new PseudoError("execution", `${name} attend ${list} argument(s).`, line);
  }
};
const finite = (x: number, name: string, line: number) => {
  if (!Number.isFinite(x)) throw new PseudoError("execution", `${name} : résultat impossible à calculer (valeur hors du domaine).`, line);
  return x;
};

/** Nombres d'une liste d'arguments ou d'un tableau (SOMME(t), MAX(a, b, c)…). */
function numbers(args: Value[], name: string, line: number): number[] {
  const out: number[] = [];
  for (const a of args) {
    if (a && typeof a === "object") for (const x of a.data) out.push(needNum(x, name, line));
    else out.push(needNum(a, name, line));
  }
  if (!out.length) throw new PseudoError("execution", `${name} attend au moins une valeur.`, line);
  return out;
}

const math1 = (name: string, f: (x: number) => number): Builtin => ({ arity: 1, fn: ([v], line) => finite(f(needNum(v, name, line)), name, line) });

const len: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    if (typeof v === "string") return v.length;
    if (v && typeof v === "object") return v.data.length;
    throw new PseudoError("execution", "LONGUEUR attend une chaîne ou un tableau.", line);
  },
};

/**
 * Nombre au hasard (ALEA, ALEATOIRE, HASARD, RANDOM) :
 * ()     → réel entre 0 (inclus) et 1 (exclu) ;
 * (n)    → entier entre 0 et n − 1 ;
 * (a, b) → entier entre a et b, bornes comprises.
 */
const random: Builtin = {
  fn: (args, line) => {
    if (args.length === 0) return Math.random();
    if (args.length === 1) {
      const n = Math.trunc(needNum(args[0], "ALEATOIRE", line));
      if (n < 1) throw new PseudoError("execution", "ALEATOIRE(n) attend un nombre n ≥ 1.", line);
      return Math.floor(Math.random() * n);
    }
    if (args.length === 2) {
      let lo = Math.ceil(needNum(args[0], "ALEATOIRE", line));
      let hi = Math.floor(needNum(args[1], "ALEATOIRE", line));
      if (lo > hi) [lo, hi] = [hi, lo];
      return lo + Math.floor(Math.random() * (hi - lo + 1));
    }
    throw new PseudoError("execution", "ALEATOIRE attend 0, 1 ou 2 arguments : ALEATOIRE(), ALEATOIRE(n) ou ALEATOIRE(min, max).", line);
  },
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const pad = (n: number) => String(n).padStart(2, "0");

const sqrt: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    const n = needNum(v, "RACINE", line);
    if (n < 0) throw new PseudoError("execution", "RACINE d'un nombre négatif impossible.", line);
    return Math.sqrt(n);
  },
};
const abs = math1("ABS", Math.abs);
const floor = math1("ENT", Math.floor);
const ceil = math1("PLAFOND", Math.ceil);
const trunc = math1("TRONQUER", Math.trunc);
const round: Builtin = {
  fn: (args, line) => {
    arity(args, "ARRONDI", line, 1, 2);
    const x = needNum(args[0], "ARRONDI", line);
    if (args.length === 1) return Math.sign(x) * Math.round(Math.abs(x));
    const d = needInt(args[1], "ARRONDI", line);
    const f = Math.pow(10, d);
    return (Math.sign(x) * Math.round(Math.abs(x) * f)) / f;
  },
};
const pow: Builtin = { arity: 2, fn: ([a, b], line) => finite(Math.pow(needNum(a, "PUISSANCE", line), needNum(b, "PUISSANCE", line)), "PUISSANCE", line) };
const ln: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    const x = needNum(v, "LN", line);
    if (x <= 0) throw new PseudoError("execution", "LN (logarithme) d'un nombre négatif ou nul impossible.", line);
    return Math.log(x);
  },
};
const log10: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    const x = needNum(v, "LOG10", line);
    if (x <= 0) throw new PseudoError("execution", "LOG10 d'un nombre négatif ou nul impossible.", line);
    return Math.log10(x);
  },
};
const asin = math1("ARCSIN", Math.asin);
const acos = math1("ARCCOS", Math.acos);
const atan = math1("ARCTAN", Math.atan);
const min: Builtin = { fn: (args, line) => Math.min(...numbers(args, "MIN", line)) };
const max: Builtin = { fn: (args, line) => Math.max(...numbers(args, "MAX", line)) };
const sum: Builtin = { fn: (args, line) => numbers(args, "SOMME", line).reduce((s, x) => s + x, 0) };
const mean: Builtin = {
  fn: (args, line) => {
    const xs = numbers(args, "MOYENNE", line);
    return xs.reduce((s, x) => s + x, 0) / xs.length;
  },
};
const rest: Builtin = {
  arity: 2,
  fn: ([a, b], line) => {
    const y = needNum(b, "RESTE", line);
    if (y === 0) throw new PseudoError("execution", "RESTE : division par zéro.", line);
    return needNum(a, "RESTE", line) % y;
  },
};
const quotient: Builtin = {
  arity: 2,
  fn: ([a, b], line) => {
    const y = needNum(b, "QUOTIENT", line);
    if (y === 0) throw new PseudoError("execution", "QUOTIENT : division par zéro.", line);
    return Math.trunc(needNum(a, "QUOTIENT", line) / y);
  },
};
const pgcd: Builtin = { arity: 2, fn: ([a, b], line) => gcd(needInt(a, "PGCD", line), needInt(b, "PGCD", line)) };
const ppcm: Builtin = {
  arity: 2,
  fn: ([a, b], line) => {
    const x = needInt(a, "PPCM", line);
    const y = needInt(b, "PPCM", line);
    return x === 0 || y === 0 ? 0 : Math.abs(x * y) / gcd(x, y);
  },
};
const fact: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    const n = needInt(v, "FACTORIELLE", line);
    if (n < 0) throw new PseudoError("execution", "FACTORIELLE d'un nombre négatif impossible.", line);
    if (n > 170) throw new PseudoError("execution", "FACTORIELLE : nombre trop grand (170 au maximum).", line);
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
};
const even: Builtin = { arity: 1, fn: ([v], line) => needInt(v, "EST_PAIR", line) % 2 === 0 };
const odd: Builtin = { arity: 1, fn: ([v], line) => Math.abs(needInt(v, "EST_IMPAIR", line) % 2) === 1 };
const prime: Builtin = { arity: 1, fn: ([v], line) => isPrime(needInt(v, "EST_PREMIER", line)) };
const pi: Builtin = { arity: 0, fn: () => Math.PI };

// Chaînes
const upper: Builtin = { arity: 1, fn: ([v], line) => needStr(v, "MAJUSCULE", line).toUpperCase() };
const lower: Builtin = { arity: 1, fn: ([v], line) => needStr(v, "MINUSCULE", line).toLowerCase() };
const substr: Builtin = {
  arity: 3,
  fn: ([s, d, n], line) => {
    const str = needStr(s, "SOUSCHAINE", line);
    const start = needNum(d, "SOUSCHAINE", line);
    return str.substr(Math.max(0, start - 1), Math.max(0, needNum(n, "SOUSCHAINE", line)));
  },
};
const left: Builtin = { arity: 2, fn: ([s, n], line) => needStr(s, "GAUCHE", line).slice(0, Math.max(0, needNum(n, "GAUCHE", line))) };
const right: Builtin = {
  arity: 2,
  fn: ([s, n], line) => {
    const str = needStr(s, "DROITE", line);
    const k = Math.max(0, needNum(n, "DROITE", line));
    return k === 0 ? "" : str.slice(-k);
  },
};
/** POSITION(sous_chaine, chaine) : position (à partir de 1) de la première occurrence, 0 si absente. */
const position: Builtin = { arity: 2, fn: ([sub, s], line) => needStr(s, "POSITION", line).indexOf(needStr(sub, "POSITION", line)) + 1 };
/** TROUVE(chaine, sous_chaine) : même résultat, arguments dans l'autre ordre. */
const find: Builtin = { arity: 2, fn: ([s, sub], line) => needStr(s, "TROUVE", line).indexOf(needStr(sub, "TROUVE", line)) + 1 };
const contains: Builtin = { arity: 2, fn: ([s, sub], line) => needStr(s, "CONTIENT", line).includes(needStr(sub, "CONTIENT", line)) };
const startsWith: Builtin = { arity: 2, fn: ([s, p], line) => needStr(s, "COMMENCE_PAR", line).startsWith(needStr(p, "COMMENCE_PAR", line)) };
const endsWith: Builtin = { arity: 2, fn: ([s, p], line) => needStr(s, "FINIT_PAR", line).endsWith(needStr(p, "FINIT_PAR", line)) };
const replace: Builtin = { arity: 3, fn: ([s, a, b], line) => needStr(s, "REMPLACER", line).split(needStr(a, "REMPLACER", line)).join(needStr(b, "REMPLACER", line)) };
const reverse: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    if (typeof v === "string") return [...v].reverse().join("");
    if (v && typeof v === "object") return { ...v, data: [...v.data].reverse() };
    throw new PseudoError("execution", "INVERSER attend une chaîne ou un tableau.", line);
  },
};
const trim: Builtin = { arity: 1, fn: ([v], line) => needStr(v, "SUPPRIMER_ESPACES", line).trim() };
const repeat: Builtin = {
  arity: 2,
  fn: ([s, n], line) => {
    const k = needInt(n, "DUPLIQUER", line);
    if (k < 0 || k > 10000) throw new PseudoError("execution", "DUPLIQUER : nombre de répétitions entre 0 et 10000.", line);
    return needStr(s, "DUPLIQUER", line).repeat(k);
  },
};
const concat: Builtin = { fn: (args) => args.map((a) => formatValue(a)).join("") };
const toStr: Builtin = { arity: 1, fn: ([v]) => formatValue(v) };
const toNumber: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    if (typeof v === "number") return v;
    const n = Number(String(v).trim().replace(",", "."));
    if (typeof v !== "string" || String(v).trim() === "" || Number.isNaN(n)) throw new PseudoError("execution", `Conversion impossible en nombre : « ${formatValue(v)} ».`, line);
    return n;
  },
};
const isNumeric: Builtin = {
  arity: 1,
  fn: ([v]) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v.trim().replace(",", ".")))),
};
const ord: Builtin = { arity: 1, fn: ([v], line) => needStr(v, "ORD", line).charCodeAt(0) };
const chr: Builtin = { arity: 1, fn: ([v], line) => String.fromCharCode(needNum(v, "CHR", line)) };
const capitalize: Builtin = {
  arity: 1,
  fn: ([v], line) => {
    const s = needStr(v, "CAPITALISER", line);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  },
};

// Date et heure (horloge de l'appareil)
const now = () => new Date();
const dateFn: Builtin = { arity: 0, fn: () => { const d = now(); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; } };
const timeFn: Builtin = {
  fn: (args, line) => {
    arity(args, "HEURE", line, 0);
    const d = now();
    return d.getHours();
  },
};

/** Clés : nom normalisé (minuscules, sans accents). Les variantes avec « _ » sont aussi acceptées sans « _ ». */
const BASE_BUILTINS: Record<string, Builtin> = {
  // Nombres
  racine: sqrt, rac: sqrt, sqrt,
  abs, absolu: abs, valeur_absolue: abs,
  ent: floor, partie_entiere: floor, plancher: floor, floor,
  plafond: ceil, ceil,
  tronquer: trunc, tronque: trunc, trunc,
  arrondi: round, arrondir: round, round,
  puissance: pow, puiss: pow, pow,
  carre: { arity: 1, fn: ([v], line) => needNum(v, "CARRE", line) ** 2 },
  cube: { arity: 1, fn: ([v], line) => needNum(v, "CUBE", line) ** 3 },
  exp: math1("EXP", Math.exp),
  ln, log: ln, loge: ln,
  log10,
  log2: { arity: 1, fn: ([v], line) => { const x = needNum(v, "LOG2", line); if (x <= 0) throw new PseudoError("execution", "LOG2 d'un nombre négatif ou nul impossible.", line); return Math.log2(x); } },
  sin: math1("SIN", Math.sin), sinus: math1("SINUS", Math.sin),
  cos: math1("COS", Math.cos), cosinus: math1("COSINUS", Math.cos),
  tan: math1("TAN", Math.tan), tangente: math1("TANGENTE", Math.tan),
  arcsin: asin, asin,
  arccos: acos, acos,
  arctan: atan, atan, arctangente: atan,
  degres: math1("DEGRES", (x) => (x * 180) / Math.PI),
  radians: math1("RADIANS", (x) => (x * Math.PI) / 180),
  pi,
  signe: math1("SIGNE", (x) => Math.sign(x)),
  min, minimum: min,
  max, maximum: max,
  somme: sum,
  moyenne: mean,
  reste: rest, modulo: rest,
  quotient,
  pgcd, ppcm,
  factorielle: fact, fact,
  est_pair: even, pair: even,
  est_impair: odd, impair: odd,
  est_premier: prime, premier: prime,
  alea: random, aleatoire: random, hasard: random, random,
  // Chaînes
  longueur: len, taille: len, nb_caracteres: len,
  majuscule: upper, majuscules: upper,
  minuscule: lower, minuscules: lower,
  capitaliser: capitalize,
  souschaine: substr, sous_chaine: substr, extraire: substr, milieu: substr,
  gauche: left, droite: right,
  position: position, pos: position,
  trouve: find, chercher: find, rechercher: find,
  contient: contains,
  commence_par: startsWith,
  finit_par: endsWith, termine_par: endsWith,
  remplacer: replace,
  inverser: reverse,
  supprimer_espaces: trim, enlever_espaces: trim, trim,
  dupliquer: repeat,
  concat, concatener: concat,
  chaine: toStr, enchaine: toStr, texte: toStr,
  nombre: toNumber, val: toNumber, valeur: toNumber,
  est_numerique: isNumeric, estnum: isNumeric,
  entier: {
    arity: 1,
    fn: ([v], line) => {
      if (typeof v === "number") return Math.trunc(v);
      if (typeof v === "string" && /^\s*-?\d+\s*$/.test(v)) return Number(v);
      throw new PseudoError("execution", `Conversion impossible en ENTIER : « ${formatValue(v)} ».`, line);
    },
  },
  reel: {
    arity: 1,
    fn: ([v], line) => {
      const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
      if (Number.isNaN(n)) throw new PseudoError("execution", `Conversion impossible en REEL : « ${formatValue(v)} ».`, line);
      return n;
    },
  },
  ord, code: ord, asc: ord,
  chr, car: chr,
  // Date et heure
  date: dateFn, aujourdhui: dateFn,
  annee: { arity: 0, fn: () => now().getFullYear() },
  mois: { arity: 0, fn: () => now().getMonth() + 1 },
  jour: { arity: 0, fn: () => now().getDate() },
  heure: timeFn,
  minute: { arity: 0, fn: () => now().getMinutes() },
  seconde: { arity: 0, fn: () => now().getSeconds() },
};

const BUILTINS: Record<string, Builtin> = { ...BASE_BUILTINS };
for (const [k, v] of Object.entries(BASE_BUILTINS)) if (k.includes("_")) BUILTINS[k.replace(/_/g, "")] ??= v;

/** Constantes utilisables sans parenthèses quand aucune variable ne porte ce nom. */
const CONSTANTS: Record<string, number> = { pi: Math.PI };

/** Liste des fonctions prédéfinies (pour la documentation et l'éditeur). */
export const BUILTIN_NAMES = Object.keys(BASE_BUILTINS).map((n) => n.toUpperCase());

export function runPseudocode(source: string, stdin = "", limits: Partial<RunLimits> = {}): RunResult {
  let interp: Interpreter | null = null;
  try {
    const program = parse(source);
    interp = new Interpreter(program, stdin, { ...DEFAULT_LIMITS, ...limits });
    interp.run();
    return { ok: true, stdout: interp.stdout, error: null, steps: interp.stepCount };
  } catch (e) {
    const stdout = interp?.stdout ?? "";
    const steps = interp?.stepCount ?? 0;
    if (e instanceof PseudoError) {
      return { ok: false, stdout, steps, error: { kind: e.kind, message: e.message, line: e.line, hint: e.hint } };
    }
    if (e instanceof RangeError) {
      return {
        ok: false,
        stdout,
        steps,
        error: { kind: "execution", message: "Récursivité trop profonde.", line: 0, hint: "Vérifiez le cas de base de votre fonction récursive." },
      };
    }
    return { ok: false, stdout, steps, error: { kind: "execution", message: `Erreur interne : ${(e as Error).message}`, line: 0 } };
  }
}

export interface TraceResult extends RunResult {
  trace: TraceStep[];
  truncated: boolean;
}

/**
 * Exécute l'algorithme en enregistrant l'état avant chaque instruction
 * (tableau de suivi des variables, exécution pas à pas).
 */
export function traceExecution(source: string, stdin = "", maxSteps = 5000, limits: Partial<RunLimits> = {}, options: { detailed?: boolean } = {}): TraceResult {
  const trace: TraceStep[] = [];
  let truncated = false;
  let interp: Interpreter | null = null;
  const lastLine = source.replace(/\r\n?/g, "\n").split("\n").length;
  try {
    const program = parse(source);
    interp = new Interpreter(program, stdin, { ...DEFAULT_LIMITS, maxSteps: Math.min(DEFAULT_LIMITS.maxSteps, 200_000), ...limits });
    interp.detailed = Boolean(options.detailed);
    interp.tracer = (step) => {
      if (trace.length >= maxSteps) {
        truncated = true;
        return undefined;
      }
      const full = { ...step, index: trace.length };
      trace.push(full);
      return full;
    };
    interp.run();
    if (!truncated) interp.traceEnd(lastLine);
    return { ok: true, stdout: interp.stdout, error: null, steps: interp.stepCount, trace, truncated };
  } catch (e) {
    const base = runResultFromError(e, interp);
    if (interp && !truncated) interp.traceEnd(base.error?.line || lastLine);
    return { ...base, trace, truncated };
  }
}

function runResultFromError(e: unknown, interp: Interpreter | null): RunResult {
  const stdout = interp?.stdout ?? "";
  const steps = interp?.stepCount ?? 0;
  if (e instanceof PseudoError) return { ok: false, stdout, steps, error: { kind: e.kind, message: e.message, line: e.line, hint: e.hint } };
  if (e instanceof RangeError) {
    return { ok: false, stdout, steps, error: { kind: "execution", message: "Récursivité trop profonde.", line: 0, hint: "Vérifiez le cas de base de votre fonction récursive." } };
  }
  return { ok: false, stdout, steps, error: { kind: "execution", message: `Erreur interne : ${(e as Error).message}`, line: 0 } };
}

/** Vérifie uniquement la syntaxe (utilisé par l'éditeur pour souligner les erreurs). */
export function checkPseudocode(source: string): RunResult["error"] {
  try {
    parse(source);
    return null;
  } catch (e) {
    if (e instanceof PseudoError) return { kind: e.kind, message: e.message, line: e.line, hint: e.hint };
    return { kind: "syntaxe", message: (e as Error).message, line: 0 };
  }
}
