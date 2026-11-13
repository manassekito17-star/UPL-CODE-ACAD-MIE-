/**
 * UPL Flow Studio — modèle commun des organigrammes algorithmiques.
 *
 * L'organigramme est « structuré » (comme Flowgorithm ou RAPTOR) : un arbre de
 * blocs (affectation, entrée, sortie, condition, boucles, appel, commentaire).
 * Il se traduit sans perte en pseudocode UPL, analysé puis exécuté par le vrai
 * interpréteur de la plateforme ; le pseudocode se retraduit en organigramme
 * via l'AST (src/lib/pseudocode/ast.ts). Les expressions restent du texte en
 * syntaxe pseudocode (validées par l'analyseur au moment de la traduction).
 */
import type { Expr, LValue, Stmt, TypeSpec } from "../pseudocode/ast";
import { exprToString } from "../pseudocode/flowchart";
import { parse } from "../pseudocode/parser";

export const VAR_TYPES = ["ENTIER", "REEL", "CHAINE", "CARACTERE", "BOOLEEN"] as const;
export type VarType = (typeof VAR_TYPES)[number];

export interface FlowVar {
  name: string;
  type: VarType;
  /** Tableau : nombre de cases (indices de 1 à size). */
  size?: number;
}

export type FlowNode =
  | { id: string; kind: "assign"; target: string; expr: string }
  | { id: string; kind: "input"; target: string }
  | { id: string; kind: "output"; expr: string }
  | { id: string; kind: "if"; cond: string; yes: FlowNode[]; no: FlowNode[] }
  | { id: string; kind: "while"; cond: string; body: FlowNode[] }
  | { id: string; kind: "for"; variable: string; from: string; to: string; step: string; body: FlowNode[] }
  | { id: string; kind: "repeat"; cond: string; body: FlowNode[] }
  | { id: string; kind: "call"; name: string; args: string }
  | { id: string; kind: "comment"; text: string };

export type FlowKind = FlowNode["kind"];
export type Branch = "body" | "yes" | "no";

export interface FlowProgram {
  name: string;
  vars: FlowVar[];
  body: FlowNode[];
}

/** Emplacement d'insertion : une position dans une séquence (racine ou branche d'un bloc). */
export interface FlowLoc {
  parent: string | null;
  branch: Branch;
  index: number;
}

export const KIND_LABELS: Record<FlowKind, string> = {
  assign: "Affectation",
  input: "Entrée (LIRE)",
  output: "Sortie (ÉCRIRE)",
  if: "Condition (SI)",
  while: "Boucle TANT QUE",
  for: "Boucle POUR",
  repeat: "Boucle RÉPÉTER",
  call: "Appel de procédure",
  comment: "Commentaire",
};

let counter = 0;
/** Identifiant de bloc (unique dans la session). */
export function newId(): string {
  counter += 1;
  return `b${Date.now().toString(36)}${counter.toString(36)}`;
}

/** Bloc neuf avec des valeurs par défaut lisibles. */
export function createNode(kind: FlowKind, id = newId()): FlowNode {
  switch (kind) {
    case "assign":
      return { id, kind, target: "x", expr: "0" };
    case "input":
      return { id, kind, target: "x" };
    case "output":
      return { id, kind, expr: '"Bonjour"' };
    case "if":
      return { id, kind, cond: "x > 0", yes: [], no: [] };
    case "while":
      return { id, kind, cond: "x > 0", body: [] };
    case "for":
      return { id, kind, variable: "i", from: "1", to: "10", step: "", body: [] };
    case "repeat":
      return { id, kind, cond: "x > 0", body: [] };
    case "call":
      return { id, kind, name: "maProcedure", args: "" };
    case "comment":
      return { id, kind, text: "Explication" };
  }
}

export function emptyProgram(name = "MonAlgorithme"): FlowProgram {
  return { name, vars: [], body: [] };
}

// ---------------------------------------------------------------- Parcours et modifications (immuables)

export function childLists(n: FlowNode): Array<[Branch, FlowNode[]]> {
  if (n.kind === "if") return [["yes", n.yes], ["no", n.no]];
  if (n.kind === "while" || n.kind === "for" || n.kind === "repeat") return [["body", n.body]];
  return [];
}

/** Tous les blocs, en profondeur (ordre du programme). */
export function allNodes(list: FlowNode[]): FlowNode[] {
  return list.flatMap((n) => [n, ...childLists(n).flatMap(([, l]) => allNodes(l))]);
}

export function findNode(p: FlowProgram, id: string): FlowNode | undefined {
  return allNodes(p.body).find((n) => n.id === id);
}

function mapList(list: FlowNode[], fn: (list: FlowNode[], parent: string | null, branch: Branch) => FlowNode[], parent: string | null, branch: Branch): FlowNode[] {
  const mapped = fn(list, parent, branch).map((n): FlowNode => {
    if (n.kind === "if") return { ...n, yes: mapList(n.yes, fn, n.id, "yes"), no: mapList(n.no, fn, n.id, "no") };
    if (n.kind === "while" || n.kind === "for" || n.kind === "repeat") return { ...n, body: mapList(n.body, fn, n.id, "body") };
    return n;
  });
  return mapped;
}

function editLists(p: FlowProgram, fn: (list: FlowNode[], parent: string | null, branch: Branch) => FlowNode[]): FlowProgram {
  return { ...p, body: mapList(p.body, fn, null, "body") };
}

/** Insère des blocs à un emplacement. */
export function insertNodes(p: FlowProgram, loc: FlowLoc, nodes: FlowNode[]): FlowProgram {
  return editLists(p, (list, parent, branch) => {
    if (parent !== loc.parent || branch !== loc.branch) return list;
    const i = Math.max(0, Math.min(loc.index, list.length));
    return [...list.slice(0, i), ...nodes, ...list.slice(i)];
  });
}

/** Supprime des blocs (et leur contenu). */
export function removeNodes(p: FlowProgram, ids: Set<string>): FlowProgram {
  return editLists(p, (list) => list.filter((n) => !ids.has(n.id)));
}

/** Modifie les propriétés d'un bloc (le type et l'identifiant ne changent pas). */
export function updateNode(p: FlowProgram, id: string, patch: Record<string, string>): FlowProgram {
  return editLists(p, (list) => list.map((n) => (n.id === id ? ({ ...n, ...patch, id: n.id, kind: n.kind } as FlowNode) : n)));
}

/** Copie profonde avec de nouveaux identifiants (copier-coller, dupliquer). */
export function cloneWithNewIds(n: FlowNode): FlowNode {
  const id = newId();
  if (n.kind === "if") return { ...n, id, yes: n.yes.map(cloneWithNewIds), no: n.no.map(cloneWithNewIds) };
  if (n.kind === "while" || n.kind === "for" || n.kind === "repeat") return { ...n, id, body: n.body.map(cloneWithNewIds) };
  return { ...n, id };
}

/** Emplacement d'un bloc existant (pour coller juste après lui). */
export function locationOf(p: FlowProgram, id: string): FlowLoc | null {
  let found: FlowLoc | null = null;
  editLists(p, (list, parent, branch) => {
    const i = list.findIndex((n) => n.id === id);
    if (i >= 0) found = { parent, branch, index: i };
    return list;
  });
  return found;
}

// ---------------------------------------------------------------- Organigramme → pseudocode

export interface Generated {
  code: string;
  /** Ligne (à partir de 1) → bloc : surlignage pendant l'exécution, erreurs. */
  nodeAtLine: Record<number, string>;
  /** Bloc → première ligne. */
  lineOfNode: Record<string, number>;
}

const clean = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const identifier = (s: string, fallback: string) => {
  const v = clean(s).replace(/[^\p{L}\p{N}_]/gu, "_").replace(/^(\d)/, "_$1");
  return v || fallback;
};

function typeText(v: FlowVar): string {
  return v.size && v.size > 0 ? `TABLEAU[1..${Math.floor(v.size)}] DE ${v.type}` : v.type;
}

export function toPseudocode(p: FlowProgram): Generated {
  const lines: string[] = [];
  const nodeAtLine: Record<number, string> = {};
  const lineOfNode: Record<string, number> = {};
  const push = (text: string, id?: string) => {
    lines.push(text);
    if (id) {
      nodeAtLine[lines.length] = id;
      lineOfNode[id] ??= lines.length;
    }
  };
  push(`ALGORITHME ${identifier(p.name, "MonAlgorithme")}`);
  if (p.vars.length) {
    push("VARIABLES");
    for (const v of p.vars) push(`  ${identifier(v.name, "x")} : ${typeText(v)}`);
  }
  push("DEBUT");
  const emit = (list: FlowNode[], depth: number) => {
    const pad = "  ".repeat(depth);
    for (const n of list) {
      switch (n.kind) {
        case "assign":
          push(`${pad}${clean(n.target)} ← ${clean(n.expr)}`, n.id);
          break;
        case "input":
          push(`${pad}LIRE(${clean(n.target)})`, n.id);
          break;
        case "output":
          push(`${pad}ECRIRE(${clean(n.expr)})`, n.id);
          break;
        case "call":
          push(`${pad}${identifier(n.name, "procedure")}(${clean(n.args)})`, n.id);
          break;
        case "comment":
          push(`${pad}// ${clean(n.text)}`, n.id);
          break;
        case "if":
          push(`${pad}SI ${clean(n.cond)} ALORS`, n.id);
          emit(n.yes, depth + 1);
          if (n.no.length) {
            push(`${pad}SINON`, n.id);
            emit(n.no, depth + 1);
          }
          push(`${pad}FINSI`);
          break;
        case "while":
          push(`${pad}TANT QUE ${clean(n.cond)} FAIRE`, n.id);
          emit(n.body, depth + 1);
          push(`${pad}FINTANTQUE`, n.id);
          break;
        case "for":
          push(`${pad}POUR ${clean(n.variable)} DE ${clean(n.from)} A ${clean(n.to)}${clean(n.step) ? ` PAS ${clean(n.step)}` : ""} FAIRE`, n.id);
          emit(n.body, depth + 1);
          push(`${pad}FINPOUR`, n.id);
          break;
        case "repeat":
          push(`${pad}REPETER`, n.id);
          emit(n.body, depth + 1);
          push(`${pad}JUSQU'A ${clean(n.cond)}`, n.id);
          break;
      }
    }
  };
  emit(p.body, 1);
  push("FIN");
  return { code: `${lines.join("\n")}\n`, nodeAtLine, lineOfNode };
}

// ---------------------------------------------------------------- Pseudocode → organigramme

export interface Imported {
  program: FlowProgram;
  /** Constructions converties de façon approchée ou ignorées (affichées à l'utilisateur). */
  warnings: string[];
}

const lv = (l: LValue) => exprToString(l as Expr);

function varType(t: TypeSpec): { type: VarType; size?: number; ok: boolean } {
  const type = t.base as VarType;
  if (!t.dims) return { type, ok: !t.isArray };
  if (t.dims.length === 1 && t.dims[0].lo.kind === "num" && t.dims[0].lo.value === 1 && t.dims[0].hi.kind === "num") {
    return { type, size: t.dims[0].hi.value, ok: true };
  }
  return { type, ok: false };
}

/** Traduit du pseudocode UPL en organigramme. Lève l'erreur de syntaxe de l'analyseur si le code est invalide. */
export function fromPseudocode(source: string): Imported {
  const ast = parse(source);
  const warnings: string[] = [];
  const vars: FlowVar[] = [];
  for (const v of ast.vars) {
    const t = varType(v.type);
    if (!t.ok) warnings.push(`Variable ${v.display} : tableau à plusieurs dimensions ou bornes non numériques, déclaré comme ${t.type} simple.`);
    vars.push({ name: v.display, type: t.type, ...(t.size ? { size: t.size } : {}) });
  }
  const consts: FlowNode[] = [];
  for (const c of ast.consts) {
    warnings.push(`Constante ${c.display} : convertie en variable initialisée au début du programme.`);
    vars.push({ name: c.display, type: c.type && !c.type.dims ? (c.type.base as VarType) : c.value.kind === "str" ? "CHAINE" : c.value.kind === "bool" ? "BOOLEEN" : "REEL" });
    consts.push({ id: newId(), kind: "assign", target: c.display, expr: exprToString(c.value) });
  }
  if (ast.routines.length) {
    warnings.push(`${ast.routines.length} fonction(s) ou procédure(s) non converties : seul le programme principal est dessiné (les sous-programmes arrivent dans une prochaine version).`);
  }
  const conv = (list: Stmt[]): FlowNode[] =>
    list.flatMap((s): FlowNode[] => {
      switch (s.kind) {
        case "assign":
          return [{ id: newId(), kind: "assign", target: lv(s.target), expr: exprToString(s.value) }];
        case "read":
          return s.targets.map((t) => ({ id: newId(), kind: "input", target: lv(t) }) as FlowNode);
        case "write":
          return [{ id: newId(), kind: "output", expr: s.args.map((a) => exprToString(a)).join(", ") }];
        case "call":
          return [{ id: newId(), kind: "call", name: s.display, args: s.args.map((a) => exprToString(a)).join(", ") }];
        case "if": {
          // SINON SI → conditions imbriquées dans la branche « Non ».
          const build = (k: number): FlowNode[] => {
            if (k >= s.branches.length) return s.elseBody ? conv(s.elseBody) : [];
            const b = s.branches[k];
            return [{ id: newId(), kind: "if", cond: exprToString(b.cond), yes: conv(b.body), no: build(k + 1) }];
          };
          return build(0);
        }
        case "while":
          return [{ id: newId(), kind: "while", cond: exprToString(s.cond), body: conv(s.body) }];
        case "for":
          return [{ id: newId(), kind: "for", variable: lv(s.variable), from: exprToString(s.from), to: exprToString(s.to), step: s.step ? exprToString(s.step) : "", body: conv(s.body) }];
        case "repeat":
          return [{ id: newId(), kind: "repeat", cond: exprToString(s.cond), body: conv(s.body) }];
        case "switch": {
          warnings.push(`SELON (ligne ${s.line}) converti en conditions SI imbriquées.`);
          const subject = exprToString(s.subject, 4);
          const build = (k: number): FlowNode[] => {
            if (k >= s.cases.length) return s.defaultBody ? conv(s.defaultBody) : [];
            const c = s.cases[k];
            const cond = c.values.map((v) => `${subject} = ${exprToString(v, 5)}`).join(" OU ");
            return [{ id: newId(), kind: "if", cond, yes: conv(c.body), no: build(k + 1) }];
          };
          return build(0);
        }
        case "return":
          warnings.push(`RETOURNER (ligne ${s.line}) ignoré dans le programme principal.`);
          return [];
      }
    });
  return { program: { name: ast.name ?? "MonAlgorithme", vars, body: [...consts, ...conv(ast.body)] }, warnings };
}

/** Vérifie qu'un programme se traduit en pseudocode valide ; renvoie l'erreur et le bloc concerné. */
export function validate(p: FlowProgram): { ok: true; generated: Generated } | { ok: false; generated: Generated; message: string; line: number; nodeId?: string } {
  const generated = toPseudocode(p);
  try {
    parse(generated.code);
    return { ok: true, generated };
  } catch (e) {
    const err = e as { message: string; line?: number };
    const line = err.line ?? 0;
    return { ok: false, generated, message: err.message, line, nodeId: generated.nodeAtLine[line] };
  }
}
