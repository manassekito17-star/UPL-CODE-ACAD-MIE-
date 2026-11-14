/**
 * Compilation (analyse + liage) et exécution pas à pas d'un projet classique
 * compatible LARP : un module principal, des modules auxiliaires et des
 * tampons d'entrées/sorties. L'exécution est un générateur : il s'arrête avant
 * chaque instruction (événement « step », pour le pas-à-pas et les points
 * d'arrêt) et quand une lecture attend une saisie (événement « input »).
 */
import { builtin, BUILTIN_NAMES } from "./builtins";
import { KEYWORDS, LarpError, norm } from "./lexer";
import { parseModule, type Expr, type LValue, type ModuleAst, type Stmt } from "./parser";
import { binary, bool, clone, compare, cont, equals, fmt, inputValue, int, RunError, str, toInt, truth, typeName, type Val, type Value } from "./values";

export interface SourceModule {
  name: string;
  main: boolean;
  code: string;
}

export interface SourceBuffer {
  name: string;
  content: string;
}

export interface Compiled {
  main: ModuleAst;
  modules: Map<string, ModuleAst>;
}

export type CompileResult = { ok: true; compiled: Compiled; log: string[] } | { ok: false; error: LarpError; log: string[] };

export const NAME_RE = /^[A-Za-z_À-ɏ][A-Za-z0-9_À-ɏ]*$/;

function walk(stmts: Stmt[], onExpr: (e: Expr, line: number) => void, onStmt?: (s: Stmt) => void) {
  const ex = (e: Expr | null | undefined, line: number) => {
    if (!e) return;
    onExpr(e, line);
    switch (e.t) {
      case "cont":
        e.items.forEach((x) => ex(x, line));
        break;
      case "index":
        ex(e.base, line);
        ex(e.index, line);
        break;
      case "call":
        e.args.forEach((x) => ex(x, line));
        break;
      case "un":
      case "est":
        ex(e.e, line);
        break;
      case "bin":
        ex(e.a, line);
        ex(e.b, line);
        break;
    }
  };
  const lv = (l: LValue) => l.idx.forEach((x) => ex(x, l.line));
  for (const s of stmts) {
    onStmt?.(s);
    switch (s.s) {
      case "assign":
        lv(s.target);
        ex(s.e, s.line);
        break;
      case "call":
        ex(s.call, s.line);
        break;
      case "lire":
        s.vars.forEach(lv);
        ex(s.canal, s.line);
        break;
      case "ecrire":
        s.items.forEach((x) => ex(x, s.line));
        ex(s.canal, s.line);
        break;
      case "requete":
        ex(s.label, s.line);
        s.vars.forEach(lv);
        break;
      case "sep":
        ex(s.e, s.line);
        break;
      case "si":
        s.branches.forEach((b) => {
          ex(b.cond, b.line);
          walk(b.body, onExpr, onStmt);
        });
        if (s.els) walk(s.els, onExpr, onStmt);
        break;
      case "sel":
        ex(s.e, s.line);
        s.cases.forEach((c) => {
          c.consts.forEach((x) => ex(x, c.line));
          walk(c.body, onExpr, onStmt);
        });
        if (s.els) walk(s.els, onExpr, onStmt);
        break;
      case "tq":
        ex(s.cond, s.line);
        walk(s.body, onExpr, onStmt);
        break;
      case "rep":
        walk(s.body, onExpr, onStmt);
        ex(s.cond, s.condLine);
        break;
      case "pour":
        ex(s.from, s.line);
        ex(s.to, s.line);
        ex(s.step, s.line);
        walk(s.body, onExpr, onStmt);
        break;
      case "detruire":
      case "compresser":
        lv(s.target);
        break;
      case "ouvrir":
        ex(s.name, s.line);
        ex(s.canal, s.line);
        break;
      case "fermer":
        s.canaux.forEach((x) => ex(x, s.line));
        break;
    }
  }
}

/** Compile tous les modules puis vérifie les appels (« liage du projet »). */
export function compileProject(modules: SourceModule[]): CompileResult {
  const log: string[] = [];
  const asts = new Map<string, ModuleAst>();
  const mains = modules.filter((m) => m.main);
  try {
    if (mains.length !== 1) throw new LarpError("Le projet doit contenir exactement un module principal.", 1, mains[0]?.name ?? "");
    for (const m of [...mains, ...modules.filter((x) => !x.main)]) {
      log.push(`Compilation du module ${m.name}...`);
      if (!m.main && !NAME_RE.test(m.name)) throw new LarpError(`Nom de module invalide « ${m.name} ».`, 1, m.name);
      if (!m.main && KEYWORDS.has(norm(m.name))) throw new LarpError(`« ${m.name} » est un mot réservé : choisissez un autre nom de module.`, 1, m.name);
      if (!m.main && BUILTIN_NAMES.has(norm(m.name))) throw new LarpError(`« ${m.name} » est le nom d'une fonction prédéfinie : choisissez un autre nom de module.`, 1, m.name);
      const ast = parseModule(m.code, m.name, m.main);
      if (asts.has(ast.key)) throw new LarpError(`Deux modules portent le nom « ${m.name} ».`, 1, m.name);
      asts.set(ast.key, ast);
    }
    log.push("Liage du projet...");
    for (const ast of asts.values()) {
      const check = (e: Expr, line: number) => {
        if (e.t !== "call") return;
        const b = builtin(e.key);
        if (b && !e.explicit) return;
        const target = asts.get(e.key);
        if (!target) {
          if (e.explicit) throw new LarpError(`Module « ${e.name} » inexistant dans le projet.`, line, ast.name);
          throw new LarpError(e.parens ? `Module ou fonction « ${e.name} » inexistant.` : `Instruction inconnue « ${e.name} ».`, line, ast.name);
        }
        if (target.main) throw new LarpError("Le module principal ne peut pas être invoqué.", line, ast.name);
        if (target.params.length !== e.args.length)
          throw new LarpError(`Le module ${target.name} attend ${target.params.length} argument${target.params.length > 1 ? "s" : ""} (${e.args.length} fourni${e.args.length > 1 ? "s" : ""}).`, line, ast.name);
        target.params.forEach((p, i) => {
          const a = e.args[i];
          if (p.ref && a.t !== "var") throw new LarpError(`Le paramètre référence ${p.name} du module ${target.name} doit recevoir une variable.`, line, ast.name);
        });
      };
      const lvCheck = (l: LValue) => {
        if (BUILTIN_NAMES.has(l.key)) throw new LarpError(`« ${l.name} » est le nom d'une fonction prédéfinie : il ne peut pas servir de nom de variable.`, l.line, ast.name);
      };
      walk(ast.body, check, (s) => {
        if (s.s === "assign" || s.s === "detruire" || s.s === "compresser") lvCheck(s.target);
        if (s.s === "lire" || s.s === "requete") s.vars.forEach(lvCheck);
        if (s.s === "pour") lvCheck(s.v);
      });
      if (ast.ret) walk([{ s: "sep", line: ast.endLine, e: ast.ret }], check);
      ast.params.forEach((p) => {
        if (BUILTIN_NAMES.has(p.key)) throw new LarpError(`« ${p.name} » est le nom d'une fonction prédéfinie : il ne peut pas servir de nom de paramètre.`, ast.startLine, ast.name);
      });
    }
    log.push("COMPLÉTÉE - aucune erreur détectée.");
    return { ok: true, compiled: { main: asts.get(norm(mains[0].name))!, modules: asts }, log };
  } catch (e) {
    if (e instanceof LarpError) {
      log.push(`ÉCHEC - ${e.module ? `${e.module} (ligne ${e.line})` : `ligne ${e.line}`} : ${e.message}`);
      return { ok: false, error: e, log };
    }
    throw e;
  }
}

// ---------------------------------------------------------------- Exécution

export type RunEvent = { type: "step"; module: string; line: number } | { type: "input" };

interface Cell {
  name: string;
  v: Val;
}

export interface Frame {
  module: ModuleAst;
  env: Map<string, Cell>;
  line: number;
  label: string;
}

interface Channel {
  key: string;
  mode: "LECTURE" | "ECRITURE" | "AJOUT";
  lines: string[];
  pos: number;
}

export interface MachineOptions {
  /** Sortie console ; kind « ind » pour #IND (affiché en rouge). */
  out: (text: string, kind?: "ind") => void;
  /** Avertissement (panneau de messages). */
  warn?: (message: string, module: string, line: number) => void;
  buffers?: SourceBuffer[];
  random?: () => number;
  maxDepth?: number;
}

export class Machine {
  frames: Frame[] = [];
  sep = " ";
  private inputLines: string[] = [];
  buffers = new Map<string, SourceBuffer>();
  private channels = new Map<number, Channel>();
  private warned = new Set<string>();
  steps = 0;

  constructor(
    private compiled: Compiled,
    private opts: MachineOptions,
  ) {
    for (const b of opts.buffers ?? []) this.buffers.set(norm(b.name), { ...b });
  }

  /** Ligne saisie dans la console (réponse à un événement « input »). */
  provideInput(line: string) {
    this.inputLines.push(line);
  }

  get top(): Frame | undefined {
    return this.frames[this.frames.length - 1];
  }

  /** Variables visibles du module en cours (inspection pas-à-pas). */
  variables(frame = this.top): Array<{ name: string; value: string; type: string }> {
    if (!frame) return [];
    return [...frame.env.values()].map((c) => ({ name: c.name, value: fmt(c.v, this.sep), type: typeName(c.v) }));
  }

  *run(): Generator<RunEvent, void, void> {
    const main = this.compiled.main;
    this.frames.push({ module: main, env: new Map(), line: main.startLine, label: main.name });
    yield* this.stepAt(main.startLine);
    yield* this.block(main.body);
    yield* this.stepAt(main.endLine);
    this.frames.pop();
  }

  private err(e: unknown): never {
    if (e instanceof LarpError) throw e;
    const f = this.top;
    const msg = e instanceof RunError ? e.message : e instanceof RangeError ? "Pile d'appels saturée (récursivité trop profonde)." : e instanceof Error ? e.message : String(e);
    throw new LarpError(msg, f?.line ?? 1, f?.module.name ?? "");
  }

  private *stepAt(line: number): Generator<RunEvent, void, void> {
    const f = this.top!;
    f.line = line;
    this.steps++;
    yield { type: "step", module: f.module.name, line };
  }

  private *block(list: Stmt[]): Generator<RunEvent, void, void> {
    for (const s of list) yield* this.stmt(s);
  }

  private num(v: Val): number {
    return this.wrap(() => toInt(v));
  }

  private wrap<T>(fn: () => T): T {
    try {
      return fn();
    } catch (e) {
      this.err(e);
    }
  }

  // ------------------------------------------------------------ Variables
  private cell(key: string, name: string, create: boolean): Cell | undefined {
    const env = this.top!.env;
    let c = env.get(key);
    if (!c && create) {
      c = { name, v: null };
      env.set(key, c);
    }
    return c;
  }

  private readVar(name: string, key: string, line: number): Val {
    const c = this.cell(key, name, false);
    if (!c || c.v === null) {
      const k = `${this.top!.module.key}:${key}`;
      if (!this.warned.has(k)) {
        this.warned.add(k);
        this.opts.warn?.(`Avertissement : la variable ${name} est indéfinie (#IND).`, this.top!.module.name, line);
      }
      return null;
    }
    return c.v;
  }

  private *assign(target: LValue, value: Val): Generator<RunEvent, void, void> {
    const c = this.cell(target.key, target.name, true)!;
    if (!target.idx.length) {
      c.v = clone(value);
      return;
    }
    const idx: number[] = [];
    for (const e of target.idx) idx.push(this.num(yield* this.expr(e)));
    if (c.v === null) c.v = cont([]);
    let box: Value = c.v;
    for (let i = 0; i < idx.length; i++) {
      if (box.k !== "c") this.err(new RunError(`${target.name} n'est pas un conteneur : impossible d'utiliser [ ].`));
      const pos = idx[i];
      if (pos < 1) this.err(new RunError(`Position ${pos} invalide : les positions d'un conteneur commencent à 1.`));
      while (box.v.length < pos) box.v.push(null);
      if (i === idx.length - 1) box.v[pos - 1] = clone(value);
      else {
        if (box.v[pos - 1] === null || box.v[pos - 1]!.k !== "c") box.v[pos - 1] = cont([]);
        box = box.v[pos - 1]!;
      }
    }
  }

  // ------------------------------------------------------------ Expressions
  private *expr(e: Expr): Generator<RunEvent, Val, void> {
    switch (e.t) {
      case "num":
        return e.float ? { k: "f", v: e.v } : this.wrap(() => int(e.v));
      case "str":
        return str(e.v);
      case "cont": {
        const items: Val[] = [];
        for (const x of e.items) items.push(x ? clone(yield* this.expr(x)) : null);
        return cont(items);
      }
      case "var": {
        const b = builtin(e.key);
        if (b) return this.wrap(() => b([], this.ctx()));
        const m = this.compiled.modules.get(e.key);
        if (m && !this.top!.env.has(e.key)) return yield* this.callModule(m, [], e.name, e.line, true);
        return this.readVar(e.name, e.key, e.line);
      }
      case "index": {
        const base = yield* this.expr(e.base);
        const i = this.num(yield* this.expr(e.index));
        if (base === null) this.err(new RunError("Accès [ ] à une valeur indéfinie (#IND)."));
        if (base.k !== "c") this.err(new RunError(`Accès [ ] impossible : la valeur n'est pas un conteneur (${typeName(base)}).`));
        if (i < 1) this.err(new RunError(`Position ${i} invalide : les positions d'un conteneur commencent à 1.`));
        return base.v[i - 1] ?? null;
      }
      case "call": {
        const b = e.explicit ? undefined : builtin(e.key);
        const args: Val[] = [];
        if (b) {
          for (const a of e.args) args.push(yield* this.expr(a));
          return this.wrap(() => b(args, this.ctx()));
        }
        const m = this.compiled.modules.get(e.key);
        if (!m) this.err(new RunError(`Module « ${e.name} » inexistant.`));
        return yield* this.callModule(m, e.args, e.name, e.line, true);
      }
      case "un": {
        const v = yield* this.expr(e.e);
        if (e.op === "NON") return bool(!this.wrap(() => truth(v)));
        return this.wrap(() => binary("*", v, int(-1)));
      }
      case "bin": {
        if (e.op === "ET" || e.op === "OU") return bool(yield* this.cond(e));
        const a = yield* this.expr(e.a);
        const b = yield* this.expr(e.b);
        return this.wrap(() => binary(e.op, a, b));
      }
      case "est": {
        const v = yield* this.expr(e.e);
        let r: boolean;
        switch (e.what) {
          case "ENTIER":
            r = v !== null && v.k === "i";
            break;
          case "FLOTTANT":
            r = v !== null && v.k === "f";
            break;
          case "CHAINE":
            r = v !== null && v.k === "s";
            break;
          case "CONTENEUR":
            r = v !== null && v.k === "c";
            break;
          case "DEFINIE":
            r = v !== null;
            break;
          case "INDEFINIE":
            r = v === null;
            break;
        }
        return bool(e.neg ? !r : r);
      }
    }
  }

  private ctx() {
    return {
      sep: () => this.sep,
      eof: (n: number) => {
        const ch = this.channels.get(n);
        if (!ch) throw new RunError(`Le canal ${n} n'est pas ouvert.`);
        if (ch.mode !== "LECTURE") throw new RunError(`FINDECONTENU : le canal ${n} n'est pas ouvert en LECTURE.`);
        return !ch.lines.slice(ch.pos).some((l) => l.trim() !== "");
      },
      random: this.opts.random ?? Math.random,
    };
  }

  private *cond(e: Expr): Generator<RunEvent, boolean, void> {
    if (e.t === "bin" && (e.op === "ET" || e.op === "OU")) {
      const a = yield* this.cond(e.a);
      if (e.op === "ET" && !a) return false;
      if (e.op === "OU" && a) return true;
      return yield* this.cond(e.b);
    }
    if (e.t === "un" && e.op === "NON") return !(yield* this.cond(e.e));
    const v = yield* this.expr(e);
    return this.wrap(() => truth(v));
  }

  private *callModule(m: ModuleAst, args: Expr[], name: string, line: number, wantValue: boolean): Generator<RunEvent, Val, void> {
    if (this.frames.length >= (this.opts.maxDepth ?? 2000)) this.err(new RunError("Pile d'appels saturée (récursivité trop profonde ?)."));
    const env = new Map<string, Cell>();
    const shown: string[] = [];
    for (let i = 0; i < m.params.length; i++) {
      const p = m.params[i];
      const a = args[i];
      if (p.ref) {
        if (a.t !== "var") this.err(new RunError(`Le paramètre référence ${p.name} doit recevoir une variable.`));
        const c = this.cell(a.key, a.name, true)!;
        env.set(p.key, c);
        shown.push(fmt(c.v, this.sep));
      } else {
        const v = clone(yield* this.expr(a));
        env.set(p.key, { name: p.name, v });
        shown.push(fmt(v, this.sep));
      }
    }
    const caller = this.top!;
    caller.line = line;
    this.frames.push({ module: m, env, line: m.startLine, label: `${m.name}(${shown.join(", ")})` });
    yield* this.stepAt(m.startLine);
    yield* this.block(m.body);
    yield* this.stepAt(m.endLine);
    let ret: Val = null;
    if (m.ret) ret = clone(yield* this.expr(m.ret));
    this.frames.pop();
    if (wantValue && !m.ret) this.opts.warn?.(`Avertissement : le module ${name} ne retourne aucune valeur (#IND).`, caller.module.name, line);
    return ret;
  }

  // ------------------------------------------------------------ Entrées / sorties
  private *readTokens(n: number, canal?: number): Generator<RunEvent, string[], void> {
    const split = (l: string) => (this.sep === " " ? l.split(/\s+/).filter(Boolean) : l.split(this.sep).map((x) => x.trim()));
    const got: string[] = [];
    if (canal !== undefined) {
      const ch = this.channels.get(canal);
      if (!ch) this.err(new RunError(`Le canal ${canal} n'est pas ouvert.`));
      if (ch.mode !== "LECTURE") this.err(new RunError(`Le canal ${canal} n'est pas ouvert en LECTURE.`));
      while (got.length < n) {
        if (ch.pos >= ch.lines.length) this.err(new RunError(`Lecture impossible : fin du contenu du canal ${canal} atteinte.`));
        const l = ch.lines[ch.pos++];
        if (l.trim() === "") continue;
        got.push(...split(l));
      }
      return got.slice(0, n);
    }
    while (got.length < n) {
      while (!this.inputLines.length) yield { type: "input" };
      const l = this.inputLines.shift()!;
      if (l.trim() === "") continue;
      got.push(...split(l));
    }
    return got.slice(0, n);
  }

  private write(items: Val[], canal: number | undefined, newline: boolean) {
    if (canal !== undefined) {
      const ch = this.channels.get(canal);
      if (!ch) this.err(new RunError(`Le canal ${canal} n'est pas ouvert.`));
      if (ch.mode === "LECTURE") this.err(new RunError(`Le canal ${canal} est ouvert en LECTURE : écriture impossible.`));
      const b = this.buffers.get(ch.key)!;
      b.content += items.map((v) => fmt(v, this.sep)).join(this.sep) + "\n";
      return;
    }
    items.forEach((v, i) => {
      if (i) this.opts.out(this.sep);
      if (v === null) this.opts.out("#IND", "ind");
      else if (v.k === "c") this.writeCont(v);
      else this.opts.out(fmt(v, this.sep));
    });
    if (newline) this.opts.out("\n");
  }

  private writeCont(v: Extract<Value, { k: "c" }>) {
    this.opts.out("[");
    v.v.forEach((x, i) => {
      if (i) this.opts.out(this.sep);
      if (x === null) this.opts.out("#IND", "ind");
      else if (x.k === "c") this.writeCont(x);
      else this.opts.out(fmt(x, this.sep));
    });
    this.opts.out("]");
  }

  // ------------------------------------------------------------ Instructions
  private *stmt(s: Stmt): Generator<RunEvent, void, void> {
    switch (s.s) {
      case "assign": {
        yield* this.stepAt(s.line);
        const v = yield* this.expr(s.e);
        yield* this.assign(s.target, v);
        return;
      }
      case "call": {
        yield* this.stepAt(s.line);
        const b = s.call.explicit ? undefined : builtin(s.call.key);
        if (b) {
          const args: Val[] = [];
          for (const a of s.call.args) args.push(yield* this.expr(a));
          this.wrap(() => b(args, this.ctx()));
          return;
        }
        const m = this.compiled.modules.get(s.call.key);
        if (!m) this.err(new RunError(`Module « ${s.call.name} » inexistant.`));
        yield* this.callModule(m, s.call.args, s.call.name, s.line, false);
        this.top!.line = s.line;
        return;
      }
      case "lire": {
        yield* this.stepAt(s.line);
        const canal = s.canal ? this.num(yield* this.expr(s.canal)) : undefined;
        const toks = yield* this.readTokens(s.vars.length, canal);
        for (let i = 0; i < s.vars.length; i++) yield* this.assign(s.vars[i], inputValue(toks[i]));
        return;
      }
      case "ecrire": {
        yield* this.stepAt(s.line);
        const vals: Val[] = [];
        for (const e of s.items) vals.push(yield* this.expr(e));
        const canal = s.canal ? this.num(yield* this.expr(s.canal)) : undefined;
        this.write(vals, canal, true);
        return;
      }
      case "requete": {
        yield* this.stepAt(s.line);
        const label = yield* this.expr(s.label);
        this.write([label], undefined, false);
        if (s.vars.length) {
          const toks = yield* this.readTokens(s.vars.length);
          for (let i = 0; i < s.vars.length; i++) yield* this.assign(s.vars[i], inputValue(toks[i]));
        }
        return;
      }
      case "sep": {
        yield* this.stepAt(s.line);
        const v = yield* this.expr(s.e);
        if (v === null || v.k !== "s" || [...v.v].length !== 1) this.err(new RunError("SÉPARATEUR attend une chaîne d'un seul caractère (ex. \",\")."));
        this.sep = v.v;
        return;
      }
      case "si": {
        for (const b of s.branches) {
          yield* this.stepAt(b.line);
          if (yield* this.cond(b.cond)) {
            yield* this.block(b.body);
            return;
          }
        }
        if (s.els) yield* this.block(s.els);
        return;
      }
      case "sel": {
        yield* this.stepAt(s.line);
        const v = yield* this.expr(s.e);
        for (const c of s.cases) {
          for (const k of c.consts) {
            const kv = yield* this.expr(k);
            if (this.wrap(() => (v !== null && kv !== null && v.k !== "c" && kv.k !== "c" ? compare(v, kv) === 0 : equals(v, kv)))) {
              yield* this.block(c.body);
              return;
            }
          }
        }
        if (s.els) yield* this.block(s.els);
        return;
      }
      case "tq": {
        for (;;) {
          yield* this.stepAt(s.line);
          if (!(yield* this.cond(s.cond))) return;
          yield* this.block(s.body);
        }
      }
      case "rep": {
        yield* this.stepAt(s.line);
        for (;;) {
          yield* this.block(s.body);
          yield* this.stepAt(s.condLine);
          if (yield* this.cond(s.cond)) return;
        }
      }
      case "pour": {
        yield* this.stepAt(s.line);
        const from = this.num(yield* this.expr(s.from));
        const to = this.num(yield* this.expr(s.to));
        const step = s.step ? this.num(yield* this.expr(s.step)) : 1;
        if (step === 0) this.err(new RunError("L'incrément d'une boucle POUR ne peut pas être 0."));
        yield* this.assign(s.v, int(from));
        for (;;) {
          const cur = this.readVar(s.v.name, s.v.key, s.line);
          const i = this.num(cur);
          if (step > 0 ? i > to : i < to) return;
          yield* this.block(s.body);
          yield* this.stepAt(s.line);
          const now = this.num(this.readVar(s.v.name, s.v.key, s.line));
          yield* this.assign(s.v, this.wrap(() => int(now + step)));
        }
      }
      case "detruire": {
        yield* this.stepAt(s.line);
        const c = this.cell(s.target.key, s.target.name, false);
        if (!s.target.idx.length) {
          if (c) c.v = null;
          return;
        }
        if (!c || c.v === null || c.v.k !== "c") this.err(new RunError(`${s.target.name} n'est pas un conteneur.`));
        let box: Value = c.v;
        for (let i = 0; i < s.target.idx.length; i++) {
          const pos = this.num(yield* this.expr(s.target.idx[i]));
          if (box.k !== "c" || pos < 1 || pos > box.v.length) return;
          if (i === s.target.idx.length - 1) box.v[pos - 1] = null;
          else if (box.v[pos - 1]) box = box.v[pos - 1]!;
          else return;
        }
        return;
      }
      case "compresser": {
        yield* this.stepAt(s.line);
        const c = this.cell(s.target.key, s.target.name, false);
        if (!c || c.v === null || c.v.k !== "c") this.err(new RunError(`COMPRESSER : ${s.target.name} n'est pas un conteneur.`));
        c.v = cont(c.v.v.filter((x) => x !== null));
        return;
      }
      case "ouvrir": {
        yield* this.stepAt(s.line);
        if (s.fichier) this.err(new RunError("Les fichiers du disque ne sont pas accessibles dans le navigateur : créez un tampon d'E/S (Projet » Tampons d'E/S » Nouveau) et utilisez OUVRIR TAMPON."));
        const nv = yield* this.expr(s.name);
        const name = fmt(nv);
        const key = norm(name);
        const canal = this.num(yield* this.expr(s.canal));
        if (canal < 1 || canal > 256) this.err(new RunError("Un numéro de canal doit être compris entre 1 et 256."));
        if (this.channels.has(canal)) this.err(new RunError(`Le canal ${canal} est déjà ouvert.`));
        const b = this.buffers.get(key);
        if (!b) this.err(new RunError(`Tampon d'E/S « ${name} » inexistant dans le projet.`));
        if (s.mode === "ECRITURE") b.content = "";
        this.channels.set(canal, { key, mode: s.mode, lines: s.mode === "LECTURE" ? b.content.split(/\r?\n/) : [], pos: 0 });
        return;
      }
      case "fermer": {
        yield* this.stepAt(s.line);
        for (const e of s.canaux) this.channels.delete(this.num(yield* this.expr(e)));
        return;
      }
    }
  }
}


// ---------------------------------------------------------------- Exécution complète (tests, exécution rapide)

export interface RunResult {
  output: string;
  error?: LarpError;
  warnings: string[];
  buffers: SourceBuffer[];
  /** Saisies non consommées / programme bloqué en attente de saisie. */
  waitingInput: boolean;
}

/** Exécute un projet jusqu'au bout avec des saisies préparées. */
export function runProject(modules: SourceModule[], inputs: string[] = [], opts: { buffers?: SourceBuffer[]; maxSteps?: number; random?: () => number } = {}): RunResult {
  const c = compileProject(modules);
  if (!c.ok) return { output: "", error: c.error, warnings: [], buffers: opts.buffers ?? [], waitingInput: false };
  let output = "";
  const warnings: string[] = [];
  const m = new Machine(c.compiled, { out: (t) => (output += t), warn: (msg) => warnings.push(msg), buffers: opts.buffers, random: opts.random });
  const queue = [...inputs];
  const gen = m.run();
  const max = opts.maxSteps ?? 1_000_000;
  try {
    for (;;) {
      const r = gen.next();
      if (r.done) break;
      if (r.value.type === "input") {
        if (!queue.length) return { output, warnings, buffers: [...m.buffers.values()], waitingInput: true };
        const l = queue.shift()!;
        output += l + "\n";
        m.provideInput(l);
      } else if (m.steps > max) throw new LarpError(`Exécution interrompue après ${max} instructions (boucle infinie ?).`, r.value.line, r.value.module);
    }
  } catch (e) {
    if (e instanceof LarpError) return { output, error: e, warnings, buffers: [...m.buffers.values()], waitingInput: false };
    throw e;
  }
  return { output, warnings, buffers: [...m.buffers.values()], waitingInput: false };
}
