/**
 * Génération d'organigrammes (logigrammes) à partir du pseudocode.
 *
 * Symboles normalisés : ovale (début/fin), rectangle (traitement),
 * parallélogramme (entrée/sortie), losange (décision), rectangle à double
 * bord (appel de sous-programme). Le résultat est une chaîne SVG autonome ;
 * tout le texte est échappé.
 */
import type { Expr, LValue, Routine, Stmt } from "./ast";
import { parse } from "./parser";

const GAP = 26; // espace vertical entre deux symboles
const H = 40; // hauteur d'un symbole simple
const DH = 56; // hauteur d'un losange
const HGAP = 36; // espace horizontal entre deux branches
const MAX_CHARS = 38;

const COLORS = {
  stroke: "#10264f",
  terminal: "#cffafe",
  process: "#ffffff",
  io: "#e3edff",
  decision: "#fff7d6",
  call: "#f1f5f9",
  text: "#0a1a3a",
  label: "#1d5fe0",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function clip(s: string): string {
  return s.length > MAX_CHARS ? `${s.slice(0, MAX_CHARS - 1)}…` : s;
}

const textWidth = (s: string) => Math.max(110, Math.round(clip(s).length * 7.2 + 28));

// ---------- Expressions → texte ----------
const PREC: Record<string, number> = { OU: 1, ET: 2, "=": 4, "<>": 4, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, DIV: 6, MOD: 6, "^": 7 };
const OP_TEXT: Record<string, string> = { "<>": "≠", "<=": "≤", ">=": "≥" };

export function exprToString(e: Expr, parent = 0): string {
  switch (e.kind) {
    case "num":
      return String(e.value);
    case "str":
      return `"${e.value}"`;
    case "bool":
      return e.value ? "VRAI" : "FAUX";
    case "var":
      return e.display;
    case "index":
      return `${e.display}[${e.indices.map((i) => exprToString(i)).join(", ")}]`;
    case "call":
      return `${e.display}(${e.args.map((a) => exprToString(a)).join(", ")})`;
    case "unary":
      return e.op === "NON" ? `NON ${exprToString(e.operand, 3)}` : `${e.op}${exprToString(e.operand, 8)}`;
    case "binary": {
      const p = PREC[e.op] ?? 0;
      const s = `${exprToString(e.left, p)} ${OP_TEXT[e.op] ?? e.op} ${exprToString(e.right, p + 1)}`;
      return p < parent ? `(${s})` : s;
    }
  }
}

const lv = (t: LValue) => (t.kind === "var" ? t.display : `${t.display}[${t.indices.map((i) => exprToString(i)).join(", ")}]`);

// ---------- Mise en page ----------
interface Layout {
  w: number;
  h: number;
  /** Abscisse du point d'entrée / de sortie, relative au bord gauche. */
  cx: number;
  draw(x: number, y: number, out: string[]): void;
}

type Shape = "terminal" | "process" | "io" | "decision" | "call";

function shapeSvg(shape: Shape, cx: number, y: number, w: number, h: number, text: string, line?: number): string {
  const x = cx - w / 2;
  const t = esc(clip(text));
  const data = line ? ` data-ligne="${line}"` : "";
  const label = `<text x="${cx}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-size="13" fill="${COLORS.text}">${t}</text>`;
  const common = `stroke="${COLORS.stroke}" stroke-width="1.5"`;
  switch (shape) {
    case "terminal":
      return `<g${data}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${COLORS.terminal}" ${common}/>${label}</g>`;
    case "process":
      return `<g${data}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${COLORS.process}" ${common}/>${label}</g>`;
    case "call":
      return `<g${data}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLORS.call}" ${common}/><line x1="${x + 8}" y1="${y}" x2="${x + 8}" y2="${y + h}" ${common}/><line x1="${x + w - 8}" y1="${y}" x2="${x + w - 8}" y2="${y + h}" ${common}/>${label}</g>`;
    case "io": {
      const k = 12;
      return `<g${data}><polygon points="${x + k},${y} ${x + w},${y} ${x + w - k},${y + h} ${x},${y + h}" fill="${COLORS.io}" ${common}/>${label}</g>`;
    }
    case "decision":
      return `<g${data}><polygon points="${cx},${y} ${x + w},${y + h / 2} ${cx},${y + h} ${x},${y + h / 2}" fill="${COLORS.decision}" ${common}/>${label}</g>`;
  }
}

const arrow = (x1: number, y1: number, x2: number, y2: number) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLORS.stroke}" stroke-width="1.4" marker-end="url(#fleche)"/>`;
const path = (d: string, withArrow = true) => `<path d="${d}" fill="none" stroke="${COLORS.stroke}" stroke-width="1.4"${withArrow ? ' marker-end="url(#fleche)"' : ""}/>`;
const label = (x: number, y: number, t: string, anchor = "start") =>
  `<text x="${x}" y="${y}" font-size="11" font-weight="600" fill="${COLORS.label}" text-anchor="${anchor}">${esc(t)}</text>`;

function box(shape: Shape, text: string, line?: number): Layout {
  const w = shape === "decision" ? textWidth(text) + 40 : textWidth(text);
  const h = shape === "decision" ? DH : H;
  return { w, h, cx: w / 2, draw: (x, y, out) => out.push(shapeSvg(shape, x + w / 2, y, w, h, text, line)) };
}

/** Empile des blocs verticalement, reliés par des flèches. */
function sequence(items: Layout[]): Layout {
  if (items.length === 0) {
    return { w: 20, h: 0, cx: 10, draw: () => undefined };
  }
  const cx = Math.max(...items.map((i) => i.cx));
  const right = Math.max(...items.map((i) => i.w - i.cx));
  const w = cx + right;
  const h = items.reduce((s, i) => s + i.h, 0) + GAP * (items.length - 1);
  return {
    w,
    h,
    cx,
    draw(x, y, out) {
      let yy = y;
      items.forEach((it, k) => {
        it.draw(x + cx - it.cx, yy, out);
        yy += it.h;
        if (k < items.length - 1) {
          out.push(arrow(x + cx, yy, x + cx, yy + GAP));
          yy += GAP;
        }
      });
    },
  };
}

/** Décision à deux branches qui se rejoignent. */
function decision(cond: string, yes: Layout, no: Layout | null, line: number, yesLabel = "oui", noLabel = "non"): Layout {
  const d = box("decision", `${cond} ?`, line);
  const noL = no ?? { w: 20, h: 0, cx: 10, draw: () => undefined };
  const branchesW = yes.w + HGAP + noL.w;
  const w = Math.max(d.w, branchesW);
  const offset = (w - branchesW) / 2;
  const yesCx = offset + yes.cx;
  const noCx = offset + yes.w + HGAP + noL.cx;
  const cx = w / 2;
  const branchH = Math.max(yes.h, noL.h);
  const h = d.h + GAP + branchH + GAP;
  return {
    w,
    h,
    cx,
    draw(x, y, out) {
      d.draw(x + cx - d.cx, y, out);
      const midY = y + d.h / 2;
      const leftX = x + cx - d.w / 2;
      const rightX = x + cx + d.w / 2;
      const top = y + d.h + GAP;
      out.push(path(`M ${leftX} ${midY} H ${x + yesCx} V ${top}`), label(leftX - 4, midY - 6, yesLabel, "end"));
      yes.draw(x + yesCx - yes.cx, top, out);
      out.push(path(`M ${rightX} ${midY} H ${x + noCx} V ${top}`, Boolean(no)), label(rightX + 4, midY - 6, noLabel));
      if (no) no.draw(x + noCx - noL.cx, top, out);
      const join = y + h;
      out.push(path(`M ${x + yesCx} ${top + yes.h} V ${join - 8} H ${x + cx}`, false));
      out.push(path(`M ${x + noCx} ${top + (no ? noL.h : 0)} V ${join - 8} H ${x + cx}`, false));
      out.push(`<line x1="${x + cx}" y1="${join - 8}" x2="${x + cx}" y2="${join}" stroke="${COLORS.stroke}" stroke-width="1.4"/>`);
    },
  };
}

/** Boucle « tant que » : décision, corps à gauche, retour vers la décision, sortie à droite. */
function whileLoop(cond: string, body: Layout, line: number, before?: Layout, after?: Layout): Layout {
  const d = box("decision", `${cond} ?`, line);
  const inner = sequence([body, ...(after ? [after] : [])]);
  const loopMargin = 28;
  const exitMargin = 28;
  const cx = Math.max(d.cx, inner.cx) + loopMargin;
  const w = cx + Math.max(d.w - d.cx, inner.w - inner.cx) + exitMargin;
  const beforeH = before ? before.h + GAP : 0;
  const h = beforeH + d.h + GAP + inner.h + GAP;
  return {
    w,
    h,
    cx,
    draw(x, y, out) {
      let yy = y;
      if (before) {
        before.draw(x + cx - before.cx, yy, out);
        yy += before.h;
        out.push(arrow(x + cx, yy, x + cx, yy + GAP));
        yy += GAP;
      }
      const dTop = yy;
      d.draw(x + cx - d.cx, dTop, out);
      const bodyTop = dTop + d.h + GAP;
      out.push(arrow(x + cx, dTop + d.h, x + cx, bodyTop), label(x + cx + 6, dTop + d.h + 14, "oui"));
      inner.draw(x + cx - inner.cx, bodyTop, out);
      const bodyBottom = bodyTop + inner.h;
      // retour vers la condition
      out.push(path(`M ${x + cx} ${bodyBottom} v 10 H ${x + 8} V ${dTop - 10} H ${x + cx} v 6`));
      // sortie
      const rightX = x + cx + d.w / 2;
      const exitX = x + w - 8;
      out.push(path(`M ${rightX} ${dTop + d.h / 2} H ${exitX} V ${y + h - 10} H ${x + cx}`, false), label(rightX + 4, dTop + d.h / 2 - 6, "non"));
      out.push(`<line x1="${x + cx}" y1="${y + h - 10}" x2="${x + cx}" y2="${y + h}" stroke="${COLORS.stroke}" stroke-width="1.4"/>`);
    },
  };
}

/** Boucle « répéter … jusqu'à » : corps puis décision ; « non » remonte. */
function repeatLoop(body: Layout, cond: string, line: number): Layout {
  const d = box("decision", `${cond} ?`, line);
  const inner = sequence([body, d]);
  const loop = 28;
  const cx = inner.cx + loop;
  const w = cx + (inner.w - inner.cx) + 16;
  const h = 10 + inner.h + GAP;
  return {
    w,
    h,
    cx,
    draw(x, y, out) {
      const top = y + 10;
      inner.draw(x + cx - inner.cx, top, out);
      const dMid = top + inner.h - d.h / 2;
      const leftX = x + cx - d.w / 2;
      out.push(path(`M ${leftX} ${dMid} H ${x + 8} V ${y + 4} H ${x + cx} v 6`), label(leftX - 4, dMid - 6, "non", "end"));
      out.push(arrow(x + cx, top + inner.h, x + cx, y + h), label(x + cx + 6, top + inner.h + 14, "oui"));
    },
  };
}

function stmtLayout(s: Stmt): Layout {
  switch (s.kind) {
    case "assign":
      return box("process", `${lv(s.target)} ← ${exprToString(s.value)}`, s.line);
    case "write":
      return box("io", `ÉCRIRE ${s.args.map((a) => exprToString(a)).join(", ")}`, s.line);
    case "read":
      return box("io", `LIRE ${s.targets.map(lv).join(", ")}`, s.line);
    case "return":
      return box("process", s.value ? `RETOURNER ${exprToString(s.value)}` : "RETOURNER", s.line);
    case "call":
      return box("call", `${s.display}(${s.args.map((a) => exprToString(a)).join(", ")})`, s.line);
    case "if": {
      const build = (k: number): Layout => {
        const b = s.branches[k];
        const elseL = k + 1 < s.branches.length ? build(k + 1) : s.elseBody ? blockLayout(s.elseBody) : null;
        return decision(exprToString(b.cond), blockLayout(b.body), elseL, s.line);
      };
      return build(0);
    }
    case "while":
      return whileLoop(exprToString(s.cond), blockLayout(s.body), s.line);
    case "repeat":
      return repeatLoop(blockLayout(s.body), exprToString(s.cond), s.line);
    case "for": {
      const v = lv(s.variable);
      const step = s.step ? exprToString(s.step) : "1";
      const negative = s.step && s.step.kind === "unary" && s.step.op === "-";
      return whileLoop(
        `${v} ${negative ? "≥" : "≤"} ${exprToString(s.to)}`,
        blockLayout(s.body),
        s.line,
        box("process", `${v} ← ${exprToString(s.from)}`, s.line),
        box("process", `${v} ← ${v} + ${step}`.replace("+ -", "- "), s.line),
      );
    }
    case "switch": {
      const subject = exprToString(s.subject);
      const build = (k: number): Layout => {
        if (k >= s.cases.length) return s.defaultBody ? blockLayout(s.defaultBody) : { w: 20, h: 0, cx: 10, draw: () => undefined };
        const c = s.cases[k];
        const cond = c.values.map((v) => `${subject} = ${exprToString(v)}`).join(" OU ");
        const rest = k + 1 < s.cases.length || s.defaultBody ? build(k + 1) : null;
        return decision(cond, blockLayout(c.body), rest, s.line);
      };
      return build(0);
    }
  }
}

function blockLayout(stmts: Stmt[]): Layout {
  return sequence(stmts.map(stmtLayout));
}

function toSvg(title: string, body: Layout, start: string, end: string): string {
  const full = sequence([box("terminal", start), body, box("terminal", end)].filter((l) => l.h > 0));
  const pad = 16;
  const titleH = title ? 26 : 0;
  const w = Math.ceil(full.w + pad * 2);
  const h = Math.ceil(full.h + pad * 2 + titleH);
  const out: string[] = [];
  full.draw(pad, pad + titleH, out);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(`Organigramme : ${title}`)}" font-family="Inter, Arial, sans-serif">`,
    `<defs><marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${COLORS.stroke}"/></marker></defs>`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    title ? `<text x="${pad}" y="${pad + 12}" font-size="13" font-weight="700" fill="${COLORS.text}">${esc(title)}</text>` : "",
    ...out,
    "</svg>",
  ].join("");
}

export interface Flowchart {
  title: string;
  svg: string;
}

/** Organigrammes du programme principal puis de chaque fonction / procédure. */
export function generateFlowcharts(source: string): { ok: true; charts: Flowchart[] } | { ok: false; error: string; line: number } {
  try {
    const program = parse(source);
    const charts: Flowchart[] = [
      { title: program.name ? `Algorithme ${program.name}` : "Programme principal", svg: toSvg(program.name ? `Algorithme ${program.name}` : "Programme principal", blockLayout(program.body), "Début", "Fin") },
    ];
    for (const r of program.routines as Routine[]) {
      const sig = `${r.kind === "fonction" ? "Fonction" : "Procédure"} ${r.display}(${r.params.map((p) => p.display).join(", ")})`;
      charts.push({ title: sig, svg: toSvg(sig, blockLayout(r.body), `Début ${r.display}`, `Fin ${r.display}`) });
    }
    return { ok: true, charts };
  } catch (e) {
    const err = e as { message: string; line?: number };
    return { ok: false, error: err.message, line: err.line ?? 0 };
  }
}
