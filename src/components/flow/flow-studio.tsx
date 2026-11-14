"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, getNodesBounds, getViewportForBounds, useReactFlow, type Edge, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { layoutProgram } from "@/lib/flow/layout";
import {
  KIND_LABELS,
  VAR_TYPES,
  allNodes,
  cloneWithNewIds,
  createNode,
  emptyProgram,
  findNode,
  fromPseudocode,
  insertNodes,
  locationOf,
  removeNodes,
  updateNode,
  validate,
  type FlowKind,
  type FlowLoc,
  type FlowNode,
  type FlowProgram,
  type FlowVar,
  type VarType,
} from "@/lib/flow/model";
import { FLOW_TEMPLATES } from "@/lib/flow/templates";
import type { TraceResult, TraceStep } from "@/lib/pseudocode/interpreter";
import { CodeEditor, type MonacoEditor } from "../editor/code-editor";
import { cn } from "../ui";
import { PlusEdge, ShapeNode, type PlusData, type ShapeData } from "./flow-canvas-parts";

const STORE = "upl:flow:projets";
const nodeTypes = { forme: ShapeNode };
const edgeTypes = { plus: PlusEdge };

const PALETTE: Array<{ kind: FlowKind; icon: string; hint: string }> = [
  { kind: "assign", icon: "▭", hint: "x ← expression" },
  { kind: "input", icon: "▱", hint: "LIRE une valeur" },
  { kind: "output", icon: "▱", hint: "ÉCRIRE un résultat" },
  { kind: "if", icon: "◇", hint: "SI … ALORS … SINON" },
  { kind: "while", icon: "↺", hint: "TANT QUE condition" },
  { kind: "for", icon: "⬡", hint: "POUR i DE a À b" },
  { kind: "repeat", icon: "↻", hint: "RÉPÉTER … JUSQU'À" },
  { kind: "call", icon: "▥", hint: "Appeler une procédure" },
  { kind: "comment", icon: "✎", hint: "Note explicative" },
];

/** Boutons d'insertion du pseudocode (le curseur est placé dans l'instruction). */
const SNIPPETS: Array<{ label: string; text: string }> = [
  { label: "Déclarer", text: "x : ENTIER" },
  { label: "Écrire", text: 'ECRIRE("")' },
  { label: "Lire", text: "LIRE(x)" },
  { label: "←", text: "x ← 0" },
  { label: "Si", text: "SI x > 0 ALORS\n  \nFINSI" },
  { label: "Si / Sinon", text: "SI x > 0 ALORS\n  \nSINON\n  \nFINSI" },
  { label: "Pour", text: "POUR i DE 1 A 10 FAIRE\n  \nFINPOUR" },
  { label: "Tant que", text: "TANT QUE x > 0 FAIRE\n  \nFINTANTQUE" },
  { label: "Répéter", text: "REPETER\n  \nJUSQU'A x > 0" },
];

/** Formes des autres diagrammes : prévues (phase 6), affichées comme telles. */
const PLANNED_SHAPES = ["Sous-programme / fonction", "Connecteur de page", "Document", "Base de données", "Opération manuelle"];

const MODES = [
  { id: "organigramme", label: "Organigramme", ready: true },
  { id: "pseudocode", label: "Pseudocode", ready: true },
  { id: "debogage", label: "Débogage", ready: true },
  { id: "visuel", label: "Programmation visuelle", ready: false },
  { id: "donnees", label: "Diagramme de données", ready: false },
  { id: "presentation", label: "Présentation", ready: false },
] as const;
type Mode = (typeof MODES)[number]["id"];

interface Project {
  id: string;
  name: string;
  program: FlowProgram;
  stdin: string;
  updatedAt: string;
}

interface HistoryEntry {
  program: FlowProgram;
  label: string;
  at: string;
}

const missingInputRe = /Aucune donnée disponible pour LIRE\((.+?)\)/i;

function loadProjects(): Project[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORE) ?? "[]") as Project[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function freshProject(name = "Mon algorithme", program?: FlowProgram): Project {
  return { id: `p${Date.now().toString(36)}`, name, program: program ?? emptyProgram("MonAlgorithme"), stdin: "", updatedAt: new Date().toISOString() };
}

/** Variables utilisées (cibles d'affectation, de lecture, compteurs de boucle) mais non déclarées. */
function undeclared(p: FlowProgram): string[] {
  const declared = new Set(p.vars.map((v) => v.name.toLowerCase()));
  const used = new Set<string>();
  for (const n of allNodes(p.body)) {
    const t = n.kind === "assign" || n.kind === "input" ? n.target : n.kind === "for" ? n.variable : "";
    const name = t.replace(/\[.*$/, "").trim();
    if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(name) && !declared.has(name.toLowerCase())) used.add(name);
  }
  return [...used];
}

/** Programme sans identifiants de blocs : comparaison du contenu seulement. */
function toComparable(p: FlowProgram): unknown {
  return JSON.parse(JSON.stringify(p, (k, v) => (k === "id" ? undefined : v)));
}

function runTrace(code: string, stdin: string): Promise<TraceResult & { timeMs: number }> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("../../workers/trace.worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ ok: false, stdout: "", steps: 0, trace: [], truncated: false, timeMs: 8000, error: { kind: "execution", message: "Temps limite dépassé (8 s) : l'algorithme a été arrêté. Vérifiez qu'aucune boucle ne tourne sans fin.", line: 0 } } as unknown as TraceResult & { timeMs: number });
    }, 8000);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.postMessage({ code, stdin, maxSteps: 20000 });
  });
}

export function FlowStudio() {
  return (
    <ReactFlowProvider>
      <Studio />
    </ReactFlowProvider>
  );
}

function Studio() {
  const rf = useReactFlow();
  const [projects, setProjects] = useState<Project[]>([]);
  const [current, setCurrent] = useState<Project>(() => freshProject());
  const program = current.program;
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<FlowNode[]>([]);
  const [armed, setArmed] = useState<FlowKind | null>(null);
  const [menu, setMenu] = useState<{ loc: FlowLoc; x: number; y: number } | null>(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode>("organigramme");
  const [mobileTab, setMobileTab] = useState<"canevas" | "proprietes" | "code" | "console">("canevas");
  const [bottomTab, setBottomTab] = useState<"console" | "erreurs" | "historique">("console");
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());
  const [trace, setTrace] = useState<(TraceResult & { timeMs: number }) | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [answer, setAnswer] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{ program: FlowProgram; warnings: string[] } | { error: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditor | null>(null);
  // Pseudocode en cours de frappe : synchronisé vers l'organigramme dès qu'il est valide.
  const [draft, setDraft] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<{ message: string; line: number } | null>(null);
  const [draftWarnings, setDraftWarnings] = useState<string[]>([]);
  const draftErrorRef = useRef(false);
  useEffect(() => {
    draftErrorRef.current = Boolean(draftError);
  }, [draftError]);
  const [vivid, setVivid] = useState(true);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("upl:flow:theme") === "classique") setVivid(false);
    } catch {
      /* ignoré */
    }
  }, []);

  // ---------------- Projets enregistrés sur l'appareil (sauvegarde automatique)
  useEffect(() => {
    const list = loadProjects();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (list.length) {
      setProjects(list);
      setCurrent(list[0]);
    } else {
      const first = freshProject("Somme de 1 à n", fromPseudocode(FLOW_TEMPLATES[0].code).program);
      setProjects([first]);
      setCurrent(first);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      setProjects((list) => {
        const next = [current, ...list.filter((p) => p.id !== current.id)].slice(0, 50);
        try {
          localStorage.setItem(STORE, JSON.stringify(next));
        } catch {
          /* stockage indisponible */
        }
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [current]);

  const flash = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(null), 3500);
  };

  /** Applique une modification du programme (avec historique pour annuler / rétablir). */
  const commit = useCallback(
    (next: FlowProgram, label: string, coalesceKey?: string) => {
      const now = Date.now();
      const coalesce = coalesceKey && lastCoalesce.current?.key === coalesceKey && now - lastCoalesce.current.at < 1500;
      if (!coalesce) setPast((p) => [...p.slice(-99), { program: current.program, label, at: new Date().toISOString() }]);
      lastCoalesce.current = coalesceKey ? { key: coalesceKey, at: now } : null;
      setFuture([]);
      setCurrent((c) => ({ ...c, program: next, updatedAt: new Date().toISOString() }));
      setTrace(null);
      setPlaying(false);
    },
    [current.program],
  );

  const undo = () => {
    const prev = past.at(-1);
    if (!prev) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [{ program: current.program, label: prev.label, at: prev.at }, ...f]);
    setCurrent((c) => ({ ...c, program: prev.program }));
    setTrace(null);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, { program: current.program, label: next.label, at: next.at }]);
    setCurrent((c) => ({ ...c, program: next.program }));
    setTrace(null);
  };

  const insert = (loc: FlowLoc, kind: FlowKind) => {
    const node = createNode(kind);
    commit(insertNodes(program, loc, [node]), `Ajout : ${KIND_LABELS[kind]}`);
    setSelected([node.id]);
    setArmed(null);
    setMenu(null);
  };

  const deleteSelected = () => {
    if (!selected.length) return;
    commit(removeNodes(program, new Set(selected)), `Suppression de ${selected.length} bloc(s)`);
    setSelected([]);
  };
  const copySelected = () => {
    const nodes = selected.map((id) => findNode(program, id)).filter(Boolean) as FlowNode[];
    if (nodes.length) {
      setClipboard(nodes);
      flash(`${nodes.length} bloc(s) copié(s)`);
    }
  };
  const paste = () => {
    if (!clipboard.length) return;
    const after = selected.length ? locationOf(program, selected[selected.length - 1]) : null;
    const loc = after ? { ...after, index: after.index + 1 } : { parent: null, branch: "body" as const, index: program.body.length };
    const copies = clipboard.map(cloneWithNewIds);
    commit(insertNodes(program, loc, copies), `Collage de ${copies.length} bloc(s)`);
    setSelected(copies.map((c) => c.id));
  };

  // Raccourcis clavier (hors champs de saisie)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable]")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      else if (mod && e.key.toLowerCase() === "c") copySelected();
      else if (mod && e.key.toLowerCase() === "v") paste();
      else if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      else if (e.key === "Escape") {
        setArmed(null);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---------------- Validation et pseudocode
  const check = useMemo(() => validate(program), [program]);
  const generated = check.generated;
  const missing = useMemo(() => undeclared(program), [program]);

  // ---------------- Exécution réelle (interpréteur UPL, trace complète)
  const step: TraceStep | undefined = trace?.trace[idx];
  const activeNode = step ? generated.nodeAtLine[step.line] : undefined;
  const lastIdx = (trace?.trace.length ?? 1) - 1;
  // Console en bulles : sorties (vert) et valeurs lues (bleu), dans l'ordre réel de l'exécution.
  const transcript = useMemo(() => {
    const out: Array<{ kind: "out" | "in"; text: string }> = [];
    if (!trace) return out;
    const steps = trace.trace;
    for (let k = 1; k <= Math.min(idx, steps.length - 1); k++) {
      const prev = steps[k - 1];
      if (prev.kind === "read") {
        const n = findNode(program, generated.nodeAtLine[prev.line] ?? "");
        const name = n && n.kind === "input" ? n.target.trim().toLowerCase() : "";
        const v = steps[k].variables.find((x) => x.name.toLowerCase() === name);
        if (v) out.push({ kind: "in", text: v.value });
      }
      const delta = steps[k].output.slice(prev.output.length);
      for (const line of delta.split("\n").filter((l, i, arr) => l || i < arr.length - 1)) if (line) out.push({ kind: "out", text: line });
    }
    return out;
  }, [trace, idx, program, generated]);
  const missingInput = trace && idx >= lastIdx ? missingInputRe.exec(trace.error?.message ?? "")?.[1] : undefined;

  const start = async (opts: { play: boolean; keepIdx?: number; stdin?: string }) => {
    if (!check.ok) {
      setBottomTab("erreurs");
      setMobileTab("console");
      return;
    }
    setRunning(true);
    const r = await runTrace(generated.code, opts.stdin ?? current.stdin);
    setRunning(false);
    setTrace(r);
    const first = opts.keepIdx ?? 0;
    setIdx(Math.min(first, Math.max(0, r.trace.length - 1)));
    setPlaying(opts.play);
    setMode("debogage");
    setBottomTab("console");
  };

  // Lecture automatique : avance d'une étape, s'arrête aux points d'arrêt et à la fin.
  useEffect(() => {
    if (!playing || !trace) return;
    if (idx >= lastIdx) {
      const t = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const next = idx + 1;
      setIdx(next);
      const node = generated.nodeAtLine[trace.trace[next]?.line ?? -1];
      if (node && breakpoints.has(node)) {
        setPlaying(false);
        flash("Point d'arrêt atteint");
      }
    }, speed);
    return () => clearTimeout(t);
  }, [playing, idx, lastIdx, trace, speed, breakpoints, generated]);

  const giveInput = () => {
    const stdin = `${current.stdin}${current.stdin && !current.stdin.endsWith("\n") ? "\n" : ""}${answer}\n`;
    setCurrent((c) => ({ ...c, stdin }));
    setAnswer("");
    void start({ play: true, keepIdx: idx, stdin });
  };

  // Pseudocode modifié à la main → organigramme (aperçu instantané si le code est valide).
  useEffect(() => {
    if (draft === null) return;
    const t = setTimeout(() => {
      try {
        const r = fromPseudocode(draft);
        setDraftError(null);
        setDraftWarnings(r.warnings);
        if (JSON.stringify(toComparable({ ...r.program, name: program.name })) !== JSON.stringify(toComparable(program))) {
          commit({ ...r.program, name: program.name }, "Modification du pseudocode", "pseudocode");
        }
      } catch (e) {
        const err = e as { message: string; line?: number };
        setDraftError({ message: err.message, line: err.line ?? 0 });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const insertSnippet = (text: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    if (!sel) return;
    const pos = sel.getStartPosition();
    const indent = (ed.getModel()?.getLineContent(pos.lineNumber).match(/^\s*/)?.[0] ?? "");
    ed.executeEdits("upl-flow", [{ range: sel, text: text.replace(/\n/g, `\n${indent}`), forceMoveMarkers: true }]);
    ed.focus();
  };

  // ---------------- Canevas
  const layout = useMemo(() => layoutProgram(program), [program]);
  const errorNode = !check.ok ? check.nodeId : trace?.error ? generated.nodeAtLine[trace.error.line] : undefined;
  const nodes: Node[] = useMemo(
    () =>
      layout.nodes.map((n) => ({
        id: n.id,
        type: "forme",
        position: { x: n.x, y: n.y },
        width: n.w,
        height: n.h,
        selected: n.flowId ? selected.includes(n.flowId) : false,
        selectable: Boolean(n.flowId),
        draggable: false,
        data: {
          shape: n.shape,
          label: n.label,
          tag: n.tag,
          w: n.w,
          h: n.h,
          flowId: n.flowId,
          active: Boolean(n.flowId && n.flowId === activeNode && mode === "debogage"),
          error: Boolean(n.flowId && n.flowId === errorNode),
          breakpoint: Boolean(n.flowId && breakpoints.has(n.flowId)),
          vivid,
        } satisfies ShapeData,
      })),
    [layout, selected, activeNode, errorNode, breakpoints, mode, vivid],
  );
  const edges: Edge[] = useMemo(
    () =>
      layout.edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        type: "plus",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#10264f", width: 16, height: 16 },
        selectable: false,
        data: {
          label: e.label,
          loc: mode === "debogage" ? undefined : e.loc,
          back: e.back,
          armed: Boolean(armed),
          onPlus: (loc: FlowLoc, x: number, y: number) => (armed ? insert(loc, armed) : setMenu({ loc, x, y })),
          onDropKind: (loc: FlowLoc, kind: FlowKind) => insert(loc, kind),
        } satisfies PlusData,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, armed, mode, program],
  );

  // Recentrage quand la taille du programme change beaucoup (premier affichage, modèle, import).
  const layoutKey = `${current.id}:${layout.nodes.length > 0}`;
  useEffect(() => {
    const t = setTimeout(() => void rf.fitView({ padding: 0.15, maxZoom: 1.1, duration: 200 }), 60);
    return () => clearTimeout(t);
  }, [layoutKey, rf]);
  // Suit le bloc actif pendant le débogage.
  useEffect(() => {
    if (!activeNode || mode !== "debogage") return;
    const n = layout.nodes.find((x) => x.flowId === activeNode);
    if (n) void rf.setCenter(n.x + n.w / 2, n.y + n.h / 2, { zoom: Math.max(rf.getZoom(), 0.8), duration: 250 });
  }, [activeNode, mode, layout, rf]);

  const exportImage = async (kind: "png" | "svg") => {
    const viewport = canvasRef.current?.querySelector<HTMLElement>(".react-flow__viewport");
    if (!viewport) return;
    const bounds = getNodesBounds(rf.getNodes());
    const width = Math.ceil(bounds.width + 80);
    const height = Math.ceil(bounds.height + 80);
    const vp = getViewportForBounds(bounds, width, height, 0.2, 2, 40);
    const opts = { backgroundColor: "#ffffff", width, height, style: { width: `${width}px`, height: `${height}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` } };
    const url = kind === "png" ? await toPng(viewport, { ...opts, pixelRatio: 2 }) : await toSvg(viewport, opts);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.name.replace(/[^\p{L}\p{N}_-]+/gu, "-") || "organigramme"}.${kind}`;
    a.click();
  };

  const selectedNode = selected.length === 1 ? findNode(program, selected[0]) : undefined;
  const filteredPalette = PALETTE.filter((p) => `${KIND_LABELS[p.kind]} ${p.hint}`.toLowerCase().includes(search.toLowerCase()));

  const setVars = (vars: FlowVar[], label: string, key?: string) => commit({ ...program, vars }, label, key);

  // ---------------- Rendu
  const toolbarBtn = "rounded px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-40";
  const palette = (
    <div className="space-y-1" data-testid="bibliotheque">
      {filteredPalette.map((p) => (
        <button
          key={p.kind}
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/upl-flow", p.kind);
            e.dataTransfer.effectAllowed = "copy";
          }}
          onClick={() => {
            setArmed(armed === p.kind ? null : p.kind);
            setMobileTab("canevas");
          }}
          className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs", armed === p.kind ? "bg-[#f28c28] text-black" : "text-gray-200 hover:bg-white/10")}
          title={`${p.hint} — glissez sur un « + » du canevas, ou touchez puis touchez un « + »`}
        >
          <span className="w-4 text-center text-base leading-none">{p.icon}</span>
          <span className="flex-1">{KIND_LABELS[p.kind]}</span>
        </button>
      ))}
      <p className="pt-2 text-[10px] uppercase tracking-wider text-gray-500">Bientôt (phase 6)</p>
      {PLANNED_SHAPES.map((s) => (
        <p key={s} className="px-2 py-0.5 text-[11px] text-gray-500">{s}</p>
      ))}
    </div>
  );

  const inspector = (
    <div className="space-y-3 text-xs text-gray-200" data-testid="inspecteur">
      {!selectedNode ? (
        <p className="text-gray-400">{selected.length > 1 ? `${selected.length} blocs sélectionnés : copier, coller ou supprimer.` : "Sélectionnez un bloc pour modifier ses propriétés."}</p>
      ) : (
        <>
          <p className="font-semibold text-white">{KIND_LABELS[selectedNode.kind]}</p>
          {(Object.entries(selectedNode) as Array<[string, unknown]>)
            .filter(([k, v]) => typeof v === "string" && k !== "id" && k !== "kind")
            .map(([k, v]) => (
              <label key={k} className="block">
                <span className="mb-0.5 block text-gray-400">{FIELD_LABELS[k] ?? k}</span>
                <input
                  value={v as string}
                  onChange={(e) => commit(updateNode(program, selectedNode.id, { [k]: e.target.value }), `Modification : ${KIND_LABELS[selectedNode.kind]}`, `${selectedNode.id}:${k}`)}
                  spellCheck={false}
                  className="w-full rounded border border-white/10 bg-[#2b2d30] px-2 py-1 font-mono text-[13px] text-white focus:border-[#f28c28] focus:outline-none"
                  aria-label={FIELD_LABELS[k] ?? k}
                />
              </label>
            ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
              onClick={() =>
                setBreakpoints((b) => {
                  const n = new Set(b);
                  if (n.has(selectedNode.id)) n.delete(selectedNode.id);
                  else n.add(selectedNode.id);
                  return n;
                })
              }
            >
              {breakpoints.has(selectedNode.id) ? "Retirer le point d'arrêt" : "● Point d'arrêt"}
            </button>
            <button type="button" className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={copySelected}>Copier</button>
            <button type="button" className="rounded bg-red-600/80 px-2 py-1 text-white hover:bg-red-600" onClick={deleteSelected}>Supprimer</button>
          </div>
        </>
      )}
      <div className="border-t border-white/10 pt-3" data-testid="variables">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-white">Variables</span>
          <button type="button" className="rounded bg-white/10 px-2 py-0.5 hover:bg-white/20" onClick={() => setVars([...program.vars, { name: `v${program.vars.length + 1}`, type: "ENTIER" }], "Ajout d'une variable")}>
            + Ajouter
          </button>
        </div>
        {missing.length > 0 && (
          <button
            type="button"
            className="mb-2 w-full rounded border border-amber-400/60 bg-amber-400/10 px-2 py-1 text-left text-amber-200"
            onClick={() => setVars([...program.vars, ...missing.map((name) => ({ name, type: "ENTIER" as VarType }))], "Déclaration automatique")}
          >
            Non déclarées : {missing.join(", ")} — déclarer (ENTIER)
          </button>
        )}
        <div className="space-y-1.5">
          {program.vars.map((v, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                value={v.name}
                aria-label={`Nom de la variable ${i + 1}`}
                onChange={(e) => setVars(program.vars.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)), "Variable renommée", `var${i}:nom`)}
                className="w-20 min-w-0 flex-1 rounded border border-white/10 bg-[#2b2d30] px-1.5 py-1 font-mono text-white"
              />
              <select
                value={v.type}
                aria-label={`Type de ${v.name}`}
                onChange={(e) => setVars(program.vars.map((x, k) => (k === i ? { ...x, type: e.target.value as VarType } : x)), "Type modifié")}
                className="rounded border border-white/10 bg-[#2b2d30] px-1 py-1 text-white"
              >
                {VAR_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input
                value={v.size ?? ""}
                placeholder="tab."
                title="Tableau : nombre de cases (vide = variable simple)"
                aria-label={`Taille du tableau ${v.name}`}
                inputMode="numeric"
                onChange={(e) => {
                  const size = parseInt(e.target.value, 10);
                  setVars(program.vars.map((x, k) => (k === i ? { name: x.name, type: x.type, ...(size > 0 ? { size } : {}) } : x)), "Tableau modifié", `var${i}:taille`);
                }}
                className="w-12 rounded border border-white/10 bg-[#2b2d30] px-1 py-1 text-white"
              />
              <button type="button" aria-label={`Supprimer ${v.name}`} className="px-1 text-gray-400 hover:text-red-400" onClick={() => setVars(program.vars.filter((_, k) => k !== i), "Variable supprimée")}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const editing = mode !== "debogage";
  const codeView = (
    <div className="flex h-full min-h-0 flex-col bg-[#2b2b2b]" data-testid="pseudocode">
      {editing && (
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-1 py-1" role="toolbar" aria-label="Insérer une instruction">
          {SNIPPETS.map((sn) => (
            <button key={sn.label} type="button" className="whitespace-nowrap rounded bg-white/10 px-2 py-0.5 text-[11px] text-gray-100 hover:bg-[#f28c28] hover:text-black" onClick={() => insertSnippet(sn.text)}>
              {sn.label}
            </button>
          ))}
        </div>
      )}
      <div className="min-h-0 flex-1">
        <CodeEditor
          language="pseudocode"
          value={draft ?? generated.code}
          onChange={(v) => setDraft(v)}
          readOnly={!editing}
          theme="upl-algo"
          fontSize={13}
          pageScroll={false}
          highlightLine={mode === "debogage" ? (step?.line ?? null) : null}
          markers={draftError ? [{ line: draftError.line || 1, message: draftError.message }] : !check.ok && draft === null ? [{ line: check.line || 1, message: check.message }] : []}
          onEditor={(ed) => {
            editorRef.current = ed;
            ed.onDidBlurEditorText(() => setDraft((d) => (d !== null && !draftErrorRef.current ? null : d)));
          }}
        />
      </div>
      {(draftError || draftWarnings.length > 0) && editing && (
        <div className="max-h-16 shrink-0 overflow-auto border-t border-white/10 px-2 py-1 text-[11px]" data-testid="synchro-pseudocode">
          {draftError ? <p className="text-red-300">Ligne {draftError.line} : {draftError.message} — l&apos;organigramme sera mis à jour dès que le code sera valide.</p> : draftWarnings.map((w) => <p key={w} className="text-amber-200">⚠ {w}</p>)}
        </div>
      )}
    </div>
  );

  const consoleView = (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2 text-xs" data-testid="console-flow">
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-white/10 pb-1">
        {(["console", "erreurs", "historique"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setBottomTab(t)} className={cn("rounded px-2 py-0.5 capitalize", bottomTab === t ? "bg-white/15 text-white" : "text-gray-400")}>
            {t === "erreurs" ? `Erreurs${!check.ok || trace?.error ? " ●" : ""}` : t}
          </button>
        ))}
      </div>
      {bottomTab === "console" && (
        <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-[1fr_14rem]">
          <div className="flex min-h-0 flex-col gap-1">
            <div className="min-h-16 flex-1 space-y-1 overflow-auto rounded bg-black/40 p-2 font-mono text-[13px] text-gray-100" aria-live="polite" data-testid="sortie-flow">
              {running && <p className="text-[#f28c28]">Exécution…</p>}
              {!trace && !running && <p className="text-gray-500">▶ Exécuter lance le vrai interpréteur UPL ; ⏭ avance bloc par bloc.</p>}
              {transcript.map((t, i) => (
                <p key={i} className={cn("w-fit max-w-[90%] whitespace-pre-wrap rounded-lg px-2 py-0.5", t.kind === "out" ? "bg-emerald-600/25 text-emerald-100" : "ml-auto bg-sky-600/30 text-sky-100")} data-type={t.kind === "out" ? "sortie" : "entree"}>
                  {t.kind === "in" ? `↳ ${t.text}` : t.text}
                </p>
              ))}
              {trace?.error && idx >= lastIdx && !missingInput && <p className="text-red-300">{trace.error.message}</p>}
              {trace && idx >= lastIdx && !trace.error && <p className="text-emerald-300">✓ Fin de l&apos;algorithme ({trace.trace.length} étapes)</p>}
            </div>
            {missingInput && (
              <form
                className="flex items-center gap-2 rounded border border-[#f28c28]/60 bg-black/40 px-2 py-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  giveInput();
                }}
                data-testid="saisie-flow"
              >
                <span className="font-mono text-[#f28c28]">{missingInput} ?</span>
                <input autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label={`Valeur de ${missingInput}`} className="min-w-0 flex-1 border-b border-[#f28c28] bg-transparent font-mono text-white outline-none" />
                <button type="submit" className="rounded bg-[#f28c28] px-2 py-0.5 font-semibold text-black">OK</button>
              </form>
            )}
            <label className="text-gray-400">
              Entrées préparées (une par ligne)
              <textarea value={current.stdin} onChange={(e) => setCurrent((c) => ({ ...c, stdin: e.target.value }))} rows={2} className="mt-0.5 w-full resize-y rounded border border-white/10 bg-[#2b2d30] px-2 py-1 font-mono text-white" />
            </label>
          </div>
          <div className="min-h-0 overflow-auto rounded bg-black/30 p-2" data-testid="variables-trace">
            <p className="mb-1 font-semibold text-white">Variables {step ? `(étape ${idx + 1}/${trace?.trace.length})` : ""}</p>
            {step?.variables.length ? (
              <table className="w-full font-mono">
                <tbody>
                  {step.variables.map((v) => (
                    <tr key={v.name} className={cn(trace && idx > 0 && trace.trace[idx - 1]?.variables.find((p) => p.name === v.name)?.value !== v.value && "text-[#f28c28]")}>
                      <td className="pr-2 text-gray-300">{v.name}</td>
                      <td className="text-white">{v.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">—</p>
            )}
            {step?.note && <p className="mt-2 text-amber-200">{step.note}</p>}
          </div>
        </div>
      )}
      {bottomTab === "erreurs" && (
        <div className="space-y-1 overflow-auto" data-testid="erreurs-flow">
          {check.ok && !trace?.error && <p className="text-emerald-300">✓ Aucune erreur : l&apos;organigramme se traduit en pseudocode valide.</p>}
          {!check.ok && (
            <button type="button" className="block text-left text-red-300 underline-offset-2 hover:underline" onClick={() => check.nodeId && setSelected([check.nodeId])}>
              Erreur (ligne {check.line}) : {check.message}
            </button>
          )}
          {trace?.error && <p className="text-red-300">Exécution (ligne {trace.error.line}) : {trace.error.message}{trace.error.hint ? ` — ${trace.error.hint}` : ""}</p>}
          {missing.length > 0 && <p className="text-amber-200">Variables non déclarées : {missing.join(", ")}.</p>}
        </div>
      )}
      {bottomTab === "historique" && (
        <ol className="space-y-0.5 overflow-auto text-gray-300" data-testid="historique-flow">
          {past.length === 0 && <li className="text-gray-500">Aucune modification pour l&apos;instant.</li>}
          {[...past].reverse().map((h, i) => (
            <li key={i}>
              {new Date(h.at).toLocaleTimeString("fr-FR")} — {h.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  const canvas = (
    <div ref={canvasRef} className="relative h-full min-h-0 bg-[#f7f8fa]" data-testid="canevas-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        selectionOnDrag={false}
        multiSelectionKeyCode={["Shift", "Meta", "Control"]}
        onNodeClick={(e, n) => {
          const id = (n.data as ShapeData).flowId;
          if (!id) return;
          setSelected((s) => (e.shiftKey || e.ctrlKey || e.metaKey ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id]));
        }}
        onPaneClick={() => {
          setSelected([]);
          setMenu(null);
        }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: false }}
        deleteKeyCode={null}
      >
        <Background gap={20} color="#dfe3ea" />
        <Controls showInteractive={false} />
        {mode !== "pseudocode" && (
          <MiniMap pannable zoomable className="max-md:!hidden" style={{ width: 140, height: 100 }} nodeColor={(n) => ((n.data as ShapeData).shape === "decision" ? "#fb7185" : (n.data as ShapeData).shape === "io" ? "#4ade80" : "#fde047")} />
        )}
      </ReactFlow>
      {armed && (
        <p className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#f28c28] px-3 py-1 text-xs font-semibold text-black shadow">
          Touchez un « + » pour placer : {KIND_LABELS[armed]}
        </p>
      )}
      {menu && (
        <div className="fixed z-50 w-56 rounded-md border border-white/10 bg-[#2b2d30] py-1 shadow-2xl" style={{ left: Math.min(menu.x - 112, (typeof window !== "undefined" ? window.innerWidth : 400) - 232), top: menu.y + 4 }} role="menu" data-testid="menu-insertion">
          {PALETTE.map((p) => (
            <button key={p.kind} type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-100 hover:bg-white/10" onClick={() => insert(menu.loc, p.kind)}>
              <span className="w-4 text-center">{p.icon}</span>
              {KIND_LABELS[p.kind]}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const debugBar = (
    <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Exécution et débogage">
      <button type="button" className={cn(toolbarBtn, "bg-emerald-600 text-white hover:bg-emerald-500")} onClick={() => void start({ play: true })} disabled={running} aria-label="Exécuter">
        ▶ Exécuter
      </button>
      {trace && (
        <>
          <button type="button" className={toolbarBtn} onClick={() => setPlaying(!playing)} disabled={idx >= lastIdx} aria-label={playing ? "Pause" : "Reprendre"}>
            {playing ? "⏸ Pause" : "⏵ Reprendre"}
          </button>
          <button type="button" className={toolbarBtn} onClick={() => (setPlaying(false), setIdx((i) => Math.max(0, i - 1)))} disabled={idx === 0} aria-label="Étape précédente">
            ⏮
          </button>
          <button type="button" className={toolbarBtn} onClick={() => (setPlaying(false), setIdx((i) => Math.min(lastIdx, i + 1)))} disabled={idx >= lastIdx} aria-label="Étape suivante">
            ⏭
          </button>
          <button type="button" className={toolbarBtn} onClick={() => (setPlaying(false), setIdx(0))} aria-label="Réinitialiser">
            ↺
          </button>
          <button type="button" className={toolbarBtn} onClick={() => (setPlaying(false), setTrace(null), setMode("organigramme"))} aria-label="Arrêter">
            ⏹
          </button>
        </>
      )}
      {!trace && (
        <button type="button" className={toolbarBtn} onClick={() => void start({ play: false })} disabled={running} aria-label="Pas à pas">
          ⏭ Pas à pas
        </button>
      )}
      <label className="ml-1 hidden items-center gap-1 text-[11px] text-gray-400 sm:flex">
        Vitesse
        <input type="range" min={50} max={1500} step={50} value={1550 - speed} onChange={(e) => setSpeed(1550 - Number(e.target.value))} aria-label="Vitesse d'exécution" />
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#1e1f22] text-gray-100" data-testid="flow-studio">
      {/* Barre supérieure */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-[#2b2d30] px-2 py-1.5">
        <Link href="/" className="rounded px-2 py-1 text-sm font-bold text-white hover:bg-white/10" aria-label="Retour à l'accueil">
          ← <span className="text-[#f28c28]">UPL</span> Flow Studio
        </Link>
        <Link href="/flow/classique" className="rounded border border-[#f28c28]/60 px-2 py-1 text-xs font-semibold text-[#f8b46a] hover:bg-white/10" data-testid="lien-classique" title="Interface à la même disposition que LARP">
          Interface classique (LARP)
        </Link>
        <input
          value={current.name}
          onChange={(e) => setCurrent((c) => ({ ...c, name: e.target.value, program: { ...c.program, name: e.target.value } }))}
          aria-label="Nom du projet"
          className="w-40 rounded border border-white/10 bg-[#1e1f22] px-2 py-1 text-xs text-white"
        />
        <div className="flex items-center gap-0.5" role="toolbar" aria-label="Édition">
          <button type="button" className={toolbarBtn} onClick={undo} disabled={!past.length} aria-label="Annuler" title="Annuler (Ctrl+Z)">↶</button>
          <button type="button" className={toolbarBtn} onClick={redo} disabled={!future.length} aria-label="Rétablir" title="Rétablir (Ctrl+Y)">↷</button>
          <button type="button" className={toolbarBtn} onClick={copySelected} disabled={!selected.length} aria-label="Copier">Copier</button>
          <button type="button" className={toolbarBtn} onClick={paste} disabled={!clipboard.length} aria-label="Coller">Coller</button>
          <button type="button" className={toolbarBtn} onClick={deleteSelected} disabled={!selected.length} aria-label="Supprimer la sélection">Suppr.</button>
          <button type="button" className={toolbarBtn} onClick={() => void rf.fitView({ padding: 0.15, duration: 200 })} aria-label="Ajuster à l'écran">⤢</button>
          <button
            type="button"
            className={toolbarBtn}
            aria-pressed={vivid}
            aria-label="Couleurs vives"
            title="Formes colorées selon leur rôle / couleurs classiques"
            onClick={() => {
              setVivid(!vivid);
              try {
                localStorage.setItem("upl:flow:theme", vivid ? "classique" : "vives");
              } catch {
                /* ignoré */
              }
            }}
          >
            🎨
          </button>
        </div>
        <div className="ml-auto">{debugBar}</div>
      </header>
      {/* Modes */}
      <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-2 py-1 text-xs" aria-label="Modes de travail">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={!m.ready}
            onClick={() => {
              setMode(m.id);
              if (m.id === "pseudocode") setMobileTab("code");
            }}
            title={m.ready ? undefined : "Prévu dans une prochaine phase"}
            className={cn("whitespace-nowrap rounded px-2.5 py-1", mode === m.id ? "bg-[#f28c28] font-semibold text-black" : m.ready ? "text-gray-300 hover:bg-white/10" : "text-gray-600")}
          >
            {m.label}
            {!m.ready && " · bientôt"}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <button type="button" className={toolbarBtn} onClick={() => void exportImage("png")}>PNG</button>
          <button type="button" className={toolbarBtn} onClick={() => void exportImage("svg")}>SVG</button>
          <button type="button" className={toolbarBtn} onClick={() => (setImportOpen(true), setImportResult(null), setImportText(generated.code))}>Importer du pseudocode</button>
        </span>
      </nav>

      {/* Corps : ordinateur = 3 colonnes + panneau bas ; téléphone = onglets */}
      <div className="grid min-h-0 flex-1 md:grid-cols-[13rem_minmax(0,1fr)_17rem]">
        <aside className={cn("min-h-0 overflow-auto border-r border-white/10 p-2 max-md:hidden")}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Projets</p>
          <div className="mb-3 space-y-0.5" data-testid="projets-flow">
            {projects.map((p) => (
              <div key={p.id} className="group flex items-center">
                <button type="button" onClick={() => (setCurrent(p), setPast([]), setFuture([]), setTrace(null), setSelected([]))} className={cn("flex-1 truncate rounded px-2 py-1 text-left text-xs", p.id === current.id ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10")}>
                  {p.name}
                </button>
                {projects.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Supprimer le projet ${p.name}`}
                    className="px-1 text-gray-500 opacity-0 hover:text-red-400 group-hover:opacity-100"
                    onClick={() => {
                      if (!confirm(`Supprimer le projet « ${p.name} » ?`)) return;
                      const rest = projects.filter((x) => x.id !== p.id);
                      setProjects(rest);
                      try {
                        localStorage.setItem(STORE, JSON.stringify(rest));
                      } catch {
                        /* ignoré */
                      }
                      if (p.id === current.id) setCurrent(rest[0]);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <select
              className="mt-1 w-full rounded border border-white/10 bg-[#2b2d30] px-1 py-1 text-xs text-gray-200"
              value=""
              aria-label="Nouveau projet"
              onChange={(e) => {
                const t = FLOW_TEMPLATES.find((x) => x.id === e.target.value);
                const p = t ? freshProject(t.title, fromPseudocode(t.code).program) : freshProject("Nouveau projet");
                setCurrent(p);
                setPast([]);
                setFuture([]);
                setTrace(null);
                setSelected([]);
              }}
            >
              <option value="">+ Nouveau projet…</option>
              <option value="vide">Projet vide</option>
              {FLOW_TEMPLATES.map((t) => <option key={t.id} value={t.id}>Modèle : {t.title}</option>)}
            </select>
          </div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Bibliothèque de formes</p>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une forme…" aria-label="Rechercher une forme" className="mb-2 w-full rounded border border-white/10 bg-[#2b2d30] px-2 py-1 text-xs text-white" />
          {palette}
        </aside>

        <main className={cn("relative min-h-0", mobileTab !== "canevas" && "max-md:hidden")}>
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
            {mode === "pseudocode" ? (
              <div className="grid min-h-0 md:grid-cols-2">
                <div className="min-h-0 border-r border-white/10 max-md:hidden">{codeView}</div>
                {canvas}
              </div>
            ) : (
              canvas
            )}
            {/* Bibliothèque en ligne sur téléphone */}
            <div className="flex gap-1 overflow-x-auto border-t border-white/10 bg-[#2b2d30] p-1 md:hidden" aria-label="Formes">
              {PALETTE.map((p) => (
                <button key={p.kind} type="button" onClick={() => setArmed(armed === p.kind ? null : p.kind)} className={cn("whitespace-nowrap rounded px-2 py-1.5 text-xs", armed === p.kind ? "bg-[#f28c28] text-black" : "bg-white/10 text-gray-100")}>
                  {p.icon} {KIND_LABELS[p.kind]}
                </button>
              ))}
            </div>
          </div>
        </main>

        <aside className={cn("min-h-0 overflow-auto border-l border-white/10 p-3", mobileTab !== "proprietes" && "max-md:hidden")}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Inspecteur</p>
          {inspector}
        </aside>

        {/* Panneau bas (ordinateur) / onglets (téléphone) */}
        <section className={cn("min-h-0 border-t border-white/10 md:col-span-3 md:grid md:h-56", mode === "pseudocode" ? "md:grid-cols-1" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]", mobileTab === "code" || mobileTab === "console" ? "max-md:flex max-md:flex-col" : "max-md:hidden")}>
          <div className={cn("min-h-0 border-r border-white/10", mobileTab !== "code" && "max-md:hidden", "max-md:flex-1", mode === "pseudocode" && "md:hidden")}>{mode === "pseudocode" ? null : codeView}</div>
          <div className={cn("min-h-0", mobileTab !== "console" && "max-md:hidden", "max-md:flex-1")}>{consoleView}</div>
        </section>
      </div>

      <nav className="grid shrink-0 grid-cols-4 border-t border-white/10 bg-[#2b2d30] text-xs md:hidden" aria-label="Panneaux">
        {(
          [
            ["canevas", "Organigramme"],
            ["proprietes", "Propriétés"],
            ["code", "Pseudocode"],
            ["console", "Console"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMobileTab(id)} className={cn("py-2.5", mobileTab === id ? "font-semibold text-[#f28c28]" : "text-gray-300")}>
            {label}
          </button>
        ))}
      </nav>

      {notice && <p className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-1.5 text-xs text-white" role="status">{notice}</p>}

      {importOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Importer du pseudocode" onClick={() => setImportOpen(false)}>
          <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-[#2b2d30] p-4 text-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 font-semibold text-white">Pseudocode → organigramme</h2>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={12} spellCheck={false} aria-label="Pseudocode à importer" className="w-full rounded border border-white/10 bg-[#1e1f22] p-2 font-mono text-[13px] text-white" />
            {importResult && "error" in importResult && <p className="mt-2 text-red-300">{importResult.error}</p>}
            {importResult && "program" in importResult && (
              <div className="mt-2 rounded bg-black/30 p-2 text-xs">
                <p className="text-emerald-300">✓ {allNodes(importResult.program.body).length} bloc(s), {importResult.program.vars.length} variable(s). Le projet actuel sera remplacé (annulable avec ↶).</p>
                {importResult.warnings.map((w) => <p key={w} className="text-amber-200">⚠ {w}</p>)}
              </div>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="rounded px-3 py-1.5 text-gray-300 hover:bg-white/10" onClick={() => setImportOpen(false)}>Annuler</button>
              {importResult && "program" in importResult ? (
                <button type="button" className="rounded bg-[#f28c28] px-3 py-1.5 font-semibold text-black" onClick={() => (commit(importResult.program, "Import du pseudocode"), setImportOpen(false))}>
                  Remplacer le projet
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded bg-[#1d5fe0] px-3 py-1.5 font-semibold text-white"
                  onClick={() => {
                    try {
                      setImportResult(fromPseudocode(importText));
                    } catch (e) {
                      const err = e as { message: string; line?: number };
                      setImportResult({ error: `Erreur${err.line ? ` (ligne ${err.line})` : ""} : ${err.message}` });
                    }
                  }}
                >
                  Analyser
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  target: "Variable",
  expr: "Expression",
  cond: "Condition",
  variable: "Compteur",
  from: "De",
  to: "À",
  step: "Pas (facultatif)",
  name: "Nom de la procédure",
  args: "Arguments",
  text: "Texte",
};
