"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Handle, Position, type EdgeProps, type NodeProps } from "@xyflow/react";
import type { FlowKind, FlowLoc } from "@/lib/flow/model";
import type { Shape } from "@/lib/flow/layout";

export interface ShapeData extends Record<string, unknown> {
  shape: Shape;
  label: string;
  tag?: string;
  w: number;
  h: number;
  flowId?: string;
  active?: boolean;
  error?: boolean;
  breakpoint?: boolean;
}

export interface PlusData extends Record<string, unknown> {
  label?: string;
  loc?: FlowLoc;
  back?: boolean;
  armed?: boolean;
  onPlus?: (loc: FlowLoc, x: number, y: number) => void;
  onDropKind?: (loc: FlowLoc, kind: FlowKind) => void;
}

const FILL: Record<Shape, string> = {
  terminal: "#cffafe",
  process: "#ffffff",
  io: "#e3edff",
  decision: "#fff7d6",
  loop: "#ede9fe",
  call: "#f1f5f9",
  comment: "#fefce8",
  junction: "#10264f",
};

/** Forme d'un bloc : symboles normalisés des organigrammes (dessin original). */
function ShapeSvg({ shape, w, h, stroke, width }: { shape: Shape; w: number; h: number; stroke: string; width: number }) {
  const common = { fill: FILL[shape], stroke, strokeWidth: width };
  const k = 14;
  switch (shape) {
    case "terminal":
      return <rect x={1} y={1} width={w - 2} height={h - 2} rx={(h - 2) / 2} {...common} />;
    case "io":
      return <polygon points={`${k},1 ${w - 1},1 ${w - k},${h - 1} 1,${h - 1}`} {...common} />;
    case "decision":
      return <polygon points={`${w / 2},1 ${w - 1},${h / 2} ${w / 2},${h - 1} 1,${h / 2}`} {...common} />;
    case "loop":
      return <polygon points={`${k + 4},1 ${w - k - 4},1 ${w - 1},${h / 2} ${w - k - 4},${h - 1} ${k + 4},${h - 1} 1,${h / 2}`} {...common} />;
    case "call":
      return (
        <g>
          <rect x={1} y={1} width={w - 2} height={h - 2} {...common} />
          <line x1={10} y1={1} x2={10} y2={h - 1} stroke={stroke} strokeWidth={width} />
          <line x1={w - 10} y1={1} x2={w - 10} y2={h - 1} stroke={stroke} strokeWidth={width} />
        </g>
      );
    case "comment":
      return <path d={`M1 1 H${w - 14} L${w - 1} 14 V${h - 1} H1 Z`} {...common} strokeDasharray="5 3" />;
    case "junction":
      return <circle cx={w / 2} cy={h / 2} r={w / 2 - 1} fill={FILL.junction} />;
    default:
      return <rect x={1} y={1} width={w - 2} height={h - 2} rx={4} {...common} />;
  }
}

const hidden = { opacity: 0, width: 6, height: 6, minWidth: 0, minHeight: 0, border: 0 };

export function ShapeNode({ data, selected }: NodeProps) {
  const d = data as ShapeData;
  const stroke = d.error ? "#dc2626" : d.active ? "#f28c28" : selected ? "#1d5fe0" : "#10264f";
  const sw = d.active || selected || d.error ? 3 : 1.5;
  return (
    <div style={{ width: d.w, height: d.h }} className="relative" data-testid={d.flowId ? `bloc-${d.flowId}` : `noeud-${d.shape}`} data-actif={d.active ? "oui" : undefined}>
      <svg width={d.w} height={d.h} className="absolute inset-0 overflow-visible" aria-hidden>
        <ShapeSvg shape={d.shape} w={d.w} h={d.h} stroke={stroke} width={sw} />
      </svg>
      {d.shape !== "junction" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center leading-tight">
          {d.tag && <span className="text-[9px] font-bold uppercase tracking-wider text-[#1d5fe0]">{d.tag}</span>}
          <span className={`max-w-full truncate font-mono text-[12px] ${d.shape === "comment" ? "italic text-gris-700" : "text-[#0a1a3a]"}`} title={d.label}>
            {d.label || " "}
          </span>
        </div>
      )}
      {d.breakpoint && <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-white bg-red-600 shadow" title="Point d'arrêt" data-testid="point-arret" />}
      <Handle type="target" position={Position.Top} id="t" style={hidden} isConnectable={false} />
      <Handle type="target" position={Position.Left} id="lt" style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} id="b" style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Left} id="l" style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Right} id="r" style={hidden} isConnectable={false} />
    </div>
  );
}

/** Flèche orthogonale avec libellé (Oui / Non) et point d'insertion « + » (clic ou dépôt d'une forme). */
export function PlusEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd } = props;
  const d = (props.data ?? {}) as PlusData;
  const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 6, offset: d.back ? 28 : 18 });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: "#10264f", strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        {d.label && (
          <span className="nodrag nopan pointer-events-none absolute rounded bg-white px-1 text-[10px] font-bold text-[#1d5fe0]" style={{ transform: `translate(-50%, -50%) translate(${sourceX + (targetX > sourceX + 4 ? 18 : targetX < sourceX - 4 ? -18 : 0)}px, ${sourceY + 10}px)` }}>
            {d.label}
          </span>
        )}
        {d.loc && (
          <button
            type="button"
            aria-label="Insérer un bloc ici"
            title="Insérer un bloc ici (cliquez ou déposez une forme)"
            data-testid="inserer"
            className={`nodrag nopan absolute grid h-6 w-6 place-items-center rounded-full border text-sm font-bold leading-none shadow-sm transition ${d.armed ? "border-[#f28c28] bg-[#f28c28] text-white" : "border-[#1d5fe0] bg-white text-[#1d5fe0] hover:bg-[#1d5fe0] hover:text-white"}`}
            style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`, pointerEvents: "all" }}
            onClick={(e) => {
              e.stopPropagation();
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              d.onPlus?.(d.loc!, r.left + r.width / 2, r.bottom);
            }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("application/upl-flow")) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const kind = e.dataTransfer.getData("application/upl-flow") as FlowKind;
              if (kind) d.onDropKind?.(d.loc!, kind);
            }}
          >
            +
          </button>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
