/**
 * Disposition automatique d'un organigramme structuré : chaque bloc reçoit une
 * position, chaque flèche relie deux blocs (connecteurs recalculés à chaque
 * modification) et porte, quand c'est possible, un point d'insertion « + ».
 * Module pur (sans React) : testé indépendamment du canevas.
 */
import { type FlowLoc, type FlowNode, type FlowProgram } from "./model";

export type Shape = "terminal" | "process" | "io" | "decision" | "call" | "comment" | "junction" | "loop";

export interface LayoutNode {
  id: string;
  /** Bloc du programme représenté (absent pour Début, Fin et les jonctions). */
  flowId?: string;
  shape: Shape;
  label: string;
  /** Petit libellé au-dessus du texte (ex. « LIRE », « ÉCRIRE »). */
  tag?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  sourceHandle: "b" | "l" | "r";
  target: string;
  targetHandle: "t" | "lt";
  label?: string;
  /** Emplacement d'insertion représenté par cette flèche. */
  loc?: FlowLoc;
  /** Retour de boucle. */
  back?: boolean;
}

const GAP = 34;
const HG = 48;
const LOOP_M = 44;
const MIN_W = 130;
const H = { simple: 46, decision: 66, terminal: 40, junction: 12 };

export const textWidth = (s: string, min = MIN_W) => Math.min(300, Math.max(min, Math.round(s.length * 7.4 + 34)));

export function labelOf(n: FlowNode): { label: string; tag?: string; shape: Shape } {
  switch (n.kind) {
    case "assign":
      return { label: `${n.target} ← ${n.expr}`, shape: "process" };
    case "input":
      return { label: n.target, tag: "LIRE", shape: "io" };
    case "output":
      return { label: n.expr, tag: "ÉCRIRE", shape: "io" };
    case "call":
      return { label: `${n.name}(${n.args})`, tag: "APPEL", shape: "call" };
    case "comment":
      return { label: n.text, shape: "comment" };
    case "if":
      return { label: n.cond, tag: "SI", shape: "decision" };
    case "while":
      return { label: n.cond, tag: "TANT QUE", shape: "decision" };
    case "repeat":
      return { label: n.cond, tag: "JUSQU'À", shape: "decision" };
    case "for":
      return { label: `${n.variable} de ${n.from} à ${n.to}${n.step ? ` pas ${n.step}` : ""}`, tag: "POUR", shape: "loop" };
  }
}

const nodeWidth = (n: FlowNode) => {
  const l = labelOf(n);
  return l.shape === "decision" || l.shape === "loop" ? textWidth(l.label, 150) + 40 : textWidth(l.label);
};

function seqWidth(list: FlowNode[]): number {
  return Math.max(MIN_W, ...list.map(itemWidth));
}

function itemWidth(n: FlowNode): number {
  if (n.kind === "if") return Math.max(nodeWidth(n), seqWidth(n.yes) + HG + seqWidth(n.no));
  if (n.kind === "while" || n.kind === "for" || n.kind === "repeat") return Math.max(nodeWidth(n), seqWidth(n.body)) + 2 * LOOP_M;
  return nodeWidth(n);
}

interface Src {
  id: string;
  handle: LayoutEdge["sourceHandle"];
  label?: string;
}

export function layoutProgram(p: FlowProgram): { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number; height: number } {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  let edgeCount = 0;
  const addEdge = (src: Src, target: string, targetHandle: LayoutEdge["targetHandle"], extra: Partial<LayoutEdge> = {}) => {
    edges.push({ id: `e${edgeCount++}`, source: src.id, sourceHandle: src.handle, target, targetHandle, ...(src.label ? { label: src.label } : {}), ...extra });
  };
  const addNode = (n: Omit<LayoutNode, "x"> & { cx: number }) => {
    const { cx, ...rest } = n;
    nodes.push({ ...rest, x: Math.round(cx - n.w / 2) });
  };

  const layoutSeq = (list: FlowNode[], parent: string | null, branch: FlowLoc["branch"], cx: number, y: number, src: Src): { src: Src; y: number } => {
    let cur = src;
    let yy = y;
    list.forEach((n, k) => {
      const r = layoutItem(n, cx, yy);
      addEdge(cur, r.entry, "t", { loc: { parent, branch, index: k } });
      cur = r.exit;
      yy = r.y;
    });
    return { src: cur, y: yy };
  };

  const layoutItem = (n: FlowNode, cx: number, y: number): { entry: string; exit: Src; y: number } => {
    const info = labelOf(n);
    const w = nodeWidth(n);
    switch (n.kind) {
      case "if": {
        addNode({ id: n.id, flowId: n.id, shape: "decision", label: info.label, tag: info.tag, cx, y, w, h: H.decision });
        const wy = seqWidth(n.yes);
        const wn = seqWidth(n.no);
        const left = cx - (wy + HG + wn) / 2;
        const y2 = y + H.decision + GAP;
        const ry = layoutSeq(n.yes, n.id, "yes", left + wy / 2, y2, { id: n.id, handle: "l", label: "Oui" });
        const rn = layoutSeq(n.no, n.id, "no", left + wy + HG + wn / 2, y2, { id: n.id, handle: "r", label: "Non" });
        const jy = Math.max(ry.y, rn.y);
        const j = `${n.id}:fin`;
        addNode({ id: j, shape: "junction", label: "", cx, y: jy, w: H.junction, h: H.junction });
        addEdge(ry.src, j, "t", { loc: { parent: n.id, branch: "yes", index: n.yes.length } });
        addEdge(rn.src, j, "t", { loc: { parent: n.id, branch: "no", index: n.no.length } });
        return { entry: n.id, exit: { id: j, handle: "b" }, y: jy + H.junction + GAP };
      }
      case "while":
      case "for": {
        const shape = n.kind === "for" ? "loop" : "decision";
        addNode({ id: n.id, flowId: n.id, shape, label: info.label, tag: info.tag, cx, y, w, h: H.decision });
        const rb = layoutSeq(n.body, n.id, "body", cx, y + H.decision + GAP, { id: n.id, handle: "b", label: n.kind === "for" ? "Tour" : "Oui" });
        addEdge(rb.src, n.id, "lt", { loc: { parent: n.id, branch: "body", index: n.body.length }, back: true });
        return { entry: n.id, exit: { id: n.id, handle: "r", label: n.kind === "for" ? "Fin" : "Non" }, y: rb.y };
      }
      case "repeat": {
        const j = `${n.id}:debut`;
        addNode({ id: j, shape: "junction", label: "", cx, y, w: H.junction, h: H.junction });
        const rb = layoutSeq(n.body, n.id, "body", cx, y + H.junction + GAP, { id: j, handle: "b" });
        addNode({ id: n.id, flowId: n.id, shape: "decision", label: info.label, tag: info.tag, cx, y: rb.y, w, h: H.decision });
        addEdge(rb.src, n.id, "t", { loc: { parent: n.id, branch: "body", index: n.body.length } });
        addEdge({ id: n.id, handle: "l", label: "Non" }, j, "lt", { back: true });
        return { entry: j, exit: { id: n.id, handle: "b", label: "Oui" }, y: rb.y + H.decision + GAP };
      }
      default: {
        addNode({ id: n.id, flowId: n.id, shape: info.shape, label: info.label, tag: info.tag, cx, y, w, h: H.simple });
        return { entry: n.id, exit: { id: n.id, handle: "b" }, y: y + H.simple + GAP };
      }
    }
  };

  const width = seqWidth(p.body) + 2 * LOOP_M;
  const cx = width / 2;
  addNode({ id: "debut", shape: "terminal", label: "Début", cx, y: 0, w: 120, h: H.terminal });
  const r = layoutSeq(p.body, null, "body", cx, H.terminal + GAP, { id: "debut", handle: "b" });
  addNode({ id: "fin", shape: "terminal", label: "Fin", cx, y: r.y, w: 120, h: H.terminal });
  addEdge(r.src, "fin", "t", { loc: { parent: null, branch: "body", index: p.body.length } });
  return { nodes, edges, width, height: r.y + H.terminal };
}
