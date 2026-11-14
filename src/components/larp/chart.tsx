"use client";

/**
 * Éditeur graphique classique : organigramme sur fond vert, symboles blancs,
 * branches « Vrai » / « Faux », points d'insertion « + » (toucher une forme du
 * panneau de modèles puis un « + », ou glisser-déposer), zoom par paliers.
 * Dessin SVG autonome (fonctionne dans l'interface mise à l'échelle).
 */
import { useMemo, type ReactNode } from "react";
import { allNodes, findNode, type FlowKind, type FlowLoc, type FlowNode, type FlowProgram } from "@/lib/flow/model";
import { layoutProgram, type LayoutEdge, type LayoutNode } from "@/lib/flow/layout";
import { processText, type LarpDoc } from "@/lib/larp/project";

const PAD = 30;
type Pt = [number, number];

export const DRAG_TYPE = "application/x-larp-flow";

export function nodeLabel(doc: LarpDoc, n: FlowNode | undefined, id: string): { text: string; tag?: string } {
  if (id === "debut") return { text: doc.main ? "DÉBUT" : `ENTRER${doc.entree?.trim() ? " " + doc.entree.trim() : ""}` };
  if (id === "fin") return { text: doc.main ? "FIN" : `RETOURNER${doc.retour?.trim() ? " " + doc.retour.trim() : ""}` };
  if (!n) return { text: "" };
  switch (n.kind) {
    case "assign": {
      const l = processText(n).split("\n").filter((x) => x.trim());
      return { text: (l[0] ?? "") + (l.length > 1 ? " …" : "") };
    }
    case "input":
      return { text: `LIRE ${n.target}` };
    case "output":
      return { text: `ÉCRIRE ${n.expr}` };
    case "call":
      return { text: `${n.name}(${n.args})`, tag: "EXÉCUTER" };
    case "comment":
      return { text: n.text };
    case "if":
      return { text: n.cond };
    case "while":
      return { text: n.cond, tag: "TANTQUE" };
    case "repeat":
      return { text: n.cond, tag: "JUSQU'À" };
    case "for":
      return { text: `${n.variable} = ${n.from} … ${n.to}${n.step.trim() ? ` (${n.step})` : ""}`, tag: "POUR" };
  }
}

function shapePath(shape: LayoutNode["shape"], w: number, h: number, props: { fill: string; stroke: string; sw: number }): ReactNode {
  const c = { fill: props.fill, stroke: props.stroke, strokeWidth: props.sw };
  const k = 12;
  switch (shape) {
    case "terminal":
      return <rect x={1} y={1} width={w - 2} height={h - 2} rx={(h - 2) / 2} {...c} />;
    case "io":
      return <polygon points={`${k},1 ${w - 1},1 ${w - k},${h - 1} 1,${h - 1}`} {...c} />;
    case "decision":
      return <polygon points={`${w / 2},1 ${w - 1},${h / 2} ${w / 2},${h - 1} 1,${h / 2}`} {...c} />;
    case "loop":
      return <polygon points={`${k + 4},1 ${w - k - 4},1 ${w - 1},${h / 2} ${w - k - 4},${h - 1} ${k + 4},${h - 1} 1,${h / 2}`} {...c} />;
    case "call":
      return (
        <g>
          <rect x={1} y={1} width={w - 2} height={h - 2} {...c} />
          <line x1={9} y1={1} x2={9} y2={h - 1} stroke={props.stroke} strokeWidth={props.sw} />
          <line x1={w - 9} y1={1} x2={w - 9} y2={h - 1} stroke={props.stroke} strokeWidth={props.sw} />
        </g>
      );
    case "comment":
      return <rect x={1} y={1} width={w - 2} height={h - 2} {...c} fill="none" strokeDasharray="4 3" />;
    case "junction":
      return <circle cx={w / 2} cy={h / 2} r={4} fill="#555" />;
    default:
      return <rect x={1} y={1} width={w - 2} height={h - 2} {...c} />;
  }
}

interface Props {
  doc: LarpDoc;
  flow: FlowProgram;
  zoom: number;
  selected: string | null;
  armed: FlowKind | null;
  editable: boolean;
  activeNode?: string;
  errorNode?: string;
  breakpoints: Set<string>;
  onSelect: (id: string | null) => void;
  onEdit: (id: string) => void;
  onInsert: (loc: FlowLoc, kind?: FlowKind) => void;
}

export function LarpChart({ doc, flow, zoom, selected, armed, editable, activeNode, errorNode, breakpoints, onSelect, onEdit, onInsert }: Props) {
  const lay = useMemo(() => layoutProgram(flow), [flow]);
  const byId = useMemo(() => new Map(lay.nodes.map((n) => [n.id, n])), [lay]);

  const bbox = (id: string) => {
    const n = findNode(flow, id);
    const ids = new Set<string>([id]);
    if (n && (n.kind === "while" || n.kind === "for" || n.kind === "repeat" || n.kind === "if")) {
      const kids = n.kind === "if" ? [...n.yes, ...n.no] : n.body;
      for (const k of allNodes(kids)) {
        ids.add(k.id);
        ids.add(`${k.id}:fin`);
        ids.add(`${k.id}:debut`);
      }
      ids.add(`${id}:debut`);
    }
    let minX = Infinity;
    let maxX = -Infinity;
    for (const i of ids) {
      const l = byId.get(i);
      if (!l) continue;
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.w);
    }
    return { minX, maxX };
  };

  const route = (e: LayoutEdge): { pts: Pt[]; plus?: Pt } => {
    const s = byId.get(e.source)!;
    const t = byId.get(e.target)!;
    const sp: Pt = e.sourceHandle === "b" ? [s.x + s.w / 2, s.y + s.h] : e.sourceHandle === "l" ? [s.x, s.y + s.h / 2] : [s.x + s.w, s.y + s.h / 2];
    const tp: Pt = e.targetHandle === "t" ? [t.x + t.w / 2, t.y] : [t.x, t.y + t.h / 2];
    let pts: Pt[];
    if (e.back) {
      const loopId = e.target.endsWith(":debut") ? e.target.slice(0, -6) : e.target;
      const left = bbox(loopId).minX - 16;
      pts = e.sourceHandle === "b" ? [sp, [sp[0], sp[1] + 12], [left, sp[1] + 12], [left, tp[1]], tp] : [sp, [left, sp[1]], [left, tp[1]], tp];
      return { pts, plus: e.loc ? [sp[0], sp[1] + 6] : undefined };
    }
    if (e.sourceHandle === "b") {
      if (Math.abs(sp[0] - tp[0]) < 1) pts = [sp, tp];
      else {
        const my = tp[1] - 12;
        pts = [sp, [sp[0], my], [tp[0], my], tp];
      }
    } else {
      const d = e.sourceHandle === "r" ? 1 : -1;
      const src = findNode(flow, e.source);
      const loopExit = !!src && (src.kind === "while" || src.kind === "for");
      if (!loopExit && (tp[0] - sp[0]) * d > 10) pts = [sp, [tp[0], sp[1]], tp];
      else {
        const b = bbox(e.source);
        const out = loopExit ? (d > 0 ? b.maxX + 16 : b.minX - 16) : sp[0] + d * 20;
        const my = tp[1] - 12;
        pts = [sp, [out, sp[1]], [out, my], [tp[0], my], tp];
      }
    }
    if (!e.loc) return { pts };
    let best: Pt = [(sp[0] + tp[0]) / 2, (sp[1] + tp[1]) / 2];
    let len = -1;
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      if (Math.abs(a[0] - b[0]) < 0.5 && Math.abs(a[1] - b[1]) > len) {
        len = Math.abs(a[1] - b[1]);
        best = [a[0], (a[1] + b[1]) / 2];
      }
    }
    return { pts, plus: best };
  };

  const W = lay.width + PAD * 2 + 60;
  const H = lay.height + PAD * 2;
  const label = (l?: string) => (l === "Oui" || l === "Tour" ? "Vrai" : l === "Non" || l === "Fin" ? "Faux" : l);

  return (
    <div style={{ width: W * zoom, height: H * zoom }} onClick={() => onSelect(null)} data-testid="organigramme">
      <div className="relative origin-top-left" style={{ width: W, height: H, transform: `scale(${zoom})` }}>
        <svg width={W} height={H} className="absolute inset-0">
          <defs>
            <marker id="larp-fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#222" />
            </marker>
          </defs>
          <g transform={`translate(${PAD + 30},${PAD})`}>
            {lay.edges.map((e) => {
              const r = route(e);
              const lbl = label(e.label);
              const sp = r.pts[0];
              return (
                <g key={e.id}>
                  <polyline points={r.pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#222" strokeWidth={1.2} markerEnd={byId.get(e.target)?.shape === "junction" ? undefined : "url(#larp-fleche)"} />
                  {lbl && (
                    <text x={sp[0] + (e.sourceHandle === "l" ? -6 : e.sourceHandle === "r" ? 6 : 8)} y={sp[1] + (e.sourceHandle === "b" ? 12 : -5)} textAnchor={e.sourceHandle === "l" ? "end" : "start"} fontSize={11} fontFamily="Tahoma, Arial, sans-serif" fill="#111">
                      {lbl}
                    </text>
                  )}
                </g>
              );
            })}
            {lay.nodes.map((n) => {
              const id = n.flowId ?? n.id;
              const isSel = selected === id;
              const active = activeNode === id;
              const fill = active ? "#1d4ed8" : "#ffffff";
              const stroke = errorNode === id ? "#dc2626" : isSel ? "#1d4ed8" : "#222";
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  {shapePath(n.shape, n.w, n.h, { fill, stroke, sw: isSel || errorNode === id ? 2.4 : 1.2 })}
                </g>
              );
            })}
          </g>
        </svg>
        {lay.nodes
          .filter((n) => n.shape !== "junction")
          .map((n) => {
            const id = n.flowId ?? n.id;
            const fn = n.flowId ? findNode(flow, n.flowId) : undefined;
            const l = nodeLabel(doc, fn, id);
            const active = activeNode === id;
            return (
              <div
                key={n.id}
                className="absolute flex cursor-pointer select-none flex-col items-center justify-center overflow-hidden px-3 text-center leading-tight"
                style={{ left: n.x + PAD + 30, top: n.y + PAD, width: n.w, height: n.h, font: "12px Tahoma, Arial, sans-serif", color: active ? "#fff" : "#111", fontStyle: n.shape === "comment" ? "italic" : undefined }}
                data-testid={`bloc-${id}`}
                data-actif={active ? "oui" : undefined}
                title={l.text}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (selected === id) onEdit(id);
                  else onSelect(id);
                }}
                onDoubleClick={(ev) => {
                  ev.stopPropagation();
                  onEdit(id);
                }}
              >
                {l.tag && <span className="text-[9px] font-bold tracking-wide opacity-80">{l.tag}</span>}
                <span className="max-w-full truncate">{l.text || " "}</span>
                {breakpoints.has(id) && <span className="absolute left-0 top-0 h-[10px] w-[10px] rounded-full border border-white bg-[#d00]" data-testid="point-arret" />}
              </div>
            );
          })}
        {editable &&
          lay.edges.map((e) => {
            const r = route(e);
            if (!r.plus || !e.loc) return null;
            const loc = e.loc;
            return (
              <button
                key={`p${e.id}`}
                type="button"
                data-testid="inserer"
                aria-label="Insérer une instruction ici"
                title={armed ? "Insérer l'instruction choisie ici" : "Choisissez d'abord une forme dans le panneau Modèles"}
                className={`absolute grid h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[12px] font-bold leading-none shadow ${armed ? "border-[#b45309] bg-[#f59e0b] text-white" : "border-[#555] bg-white text-[#333]"}`}
                style={{ left: r.plus[0] + PAD + 30, top: r.plus[1] + PAD }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onInsert(loc);
                }}
                onDragOver={(ev) => {
                  if (ev.dataTransfer.types.includes(DRAG_TYPE)) ev.preventDefault();
                }}
                onDrop={(ev) => {
                  ev.preventDefault();
                  const k = ev.dataTransfer.getData(DRAG_TYPE) as FlowKind;
                  if (k) onInsert(loc, k);
                }}
              >
                +
              </button>
            );
          })}
      </div>
    </div>
  );
}

/** Petite vignette d'une forme pour le panneau de modèles (organigramme). */
export function FlowGlyph({ kind }: { kind: FlowKind }) {
  const st = { fill: "#fff", stroke: "#222", strokeWidth: 1 };
  const arrowIn = <path d="M20 0v5" stroke="#222" />;
  const body = (() => {
    switch (kind) {
      case "assign":
        return <rect x={10} y={5} width={20} height={11} {...st} />;
      case "input":
      case "output":
        return (
          <g>
            <polygon points="14,5 31,5 26,16 9,16" {...st} />
            <text x={20} y={14} fontSize={7} textAnchor="middle" fontFamily="Tahoma">{kind === "input" ? "L" : "É"}</text>
          </g>
        );
      case "call":
        return (
          <g>
            <rect x={9} y={5} width={22} height={11} {...st} />
            <path d="M12 5v11M28 5v11" stroke="#222" />
          </g>
        );
      case "comment":
        return <rect x={9} y={5} width={22} height={11} fill="none" stroke="#222" strokeDasharray="2 2" />;
      case "if":
        return (
          <g>
            <polygon points="20,5 28,11 20,17 12,11" {...st} />
            <path d="M12 11H5v9M28 11h7v9" stroke="#222" fill="none" />
            <text x={4} y={9} fontSize={6} fontFamily="Tahoma">V</text>
            <text x={32} y={9} fontSize={6} fontFamily="Tahoma">F</text>
          </g>
        );
      case "while":
        return (
          <g>
            <polygon points="20,5 28,11 20,17 12,11" {...st} />
            <path d="M20 17v3M28 11h6v10M12 11H6v-4h14" stroke="#222" fill="none" />
          </g>
        );
      case "repeat":
        return (
          <g>
            <rect x={13} y={4} width={14} height={5} {...st} />
            <polygon points="20,11 26,15 20,19 14,15" {...st} />
            <path d="M14 15H8V2h12" stroke="#222" fill="none" />
          </g>
        );
      case "for":
        return <polygon points="13,5 27,5 31,11 27,17 13,17 9,11" {...st} />;
    }
  })();
  return (
    <svg width={40} height={22} viewBox="0 0 40 22" aria-hidden>
      {kind !== "repeat" && arrowIn}
      {body}
    </svg>
  );
}
