"use client";

/**
 * UPL Algo Classique — interface compatible LARP.
 *
 * Même disposition que l'environnement de développement documenté (barre de
 * menu, panneau de contrôle, navigateur de documents, panneau de modèles,
 * éditeurs textuel et graphique, panneau de messages, panneau de statut,
 * console d'exécution, fenêtre d'exécution pas-à-pas) pour que l'étudiant
 * clique aux mêmes endroits que le professeur. Toute la fenêtre est dessinée à
 * une taille fixe puis mise à l'échelle de l'écran (téléphone, tablette, PC).
 * Dessins, icônes et code sont originaux ; seule la disposition fonctionnelle
 * et la syntaxe publique du langage sont reprises.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cloneWithNewIds, findNode, insertNodes, locationOf, removeNodes, type FlowKind, type FlowLoc, type FlowNode, type FlowProgram } from "@/lib/flow/model";
import { compileProject, Machine, NAME_RE, type RunEvent } from "@/lib/larp/interpreter";
import { KEYWORDS, LarpError, norm } from "@/lib/larp/lexer";
import {
  deleteSaved,
  docSource,
  exampleProject,
  FLOW_TEMPLATES,
  larpNode,
  newBuffer,
  newModule,
  newProject,
  nodeForLine,
  projectSources,
  PSEUDO_TEMPLATES,
  saveProject,
  savedProjects,
  type DocSource,
  type LarpDoc,
  type LarpProject,
} from "@/lib/larp/project";
import { BUILTIN_NAMES } from "@/lib/larp/builtins";
import { deleteCloud, listCloud, loadCloud, saveCloud, type CloudEntry } from "@/lib/larp/cloud";
import { DRAG_TYPE, FlowGlyph, LarpChart } from "./chart";
import { LarpEditor, type EditorHandle } from "./editor";
import { Icons } from "./icons";
import { fieldClass, GroupBox, TitleBar, UI_FONT, useDrag, Win, XpButton, FACE } from "./windows";

const DW = 1000;
const DH = 640;
const CURRENT_KEY = "upl:larp:courant";

type Msg = { text: string; kind: "info" | "warn" | "err"; module?: string; line?: number };
type Seg = { t: string; k?: "ind" | "in" | "sys" | "err" };
type Status = "idle" | "running" | "paused" | "input" | "done" | "error";
type Auto = "run" | "pause" | "walk" | "continue";

type Dialog =
  | { t: "nouveau" }
  | { t: "ouvrir" }
  | { t: "sauver" }
  | { t: "renommer"; id: string }
  | { t: "confirm"; text: string; yes: () => void }
  | { t: "contenu"; id: string }
  | { t: "rechercher"; replace: boolean }
  | { t: "pseudo" }
  | { t: "aide" }
  | { t: "apropos" }
  | { t: "stats" }
  | { t: "couleurs" }
  | { t: "info"; title: string; text: string };

interface MenuItem {
  label?: string;
  accel?: string;
  action?: () => void;
  disabled?: boolean;
  sub?: MenuItem[];
  sep?: true;
  checked?: boolean;
}

function loadCurrent(): LarpProject {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (raw) {
      const p = JSON.parse(raw) as LarpProject;
      if (p && Array.isArray(p.docs) && p.docs.some((d) => d.main)) return p;
    }
  } catch {
    /* stockage indisponible */
  }
  return exampleProject();
}

function download(name: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function LarpStudio() {
  const router = useRouter();
  // ------------------------------------------------------------ Mise à l'échelle
  const [view, setView] = useState({ w: 1024, h: 700 });
  const [userZoom, setUserZoom] = useState(1);
  const [hidePortrait, setHidePortrait] = useState(false);
  useEffect(() => {
    // Le clavier du téléphone réduit la hauteur visible : on ne rétrécit pas la fenêtre pour autant
    // (seul un changement de largeur, donc d'orientation, recalcule la taille).
    const on = () => setView((v) => (v.w !== window.innerWidth || window.innerHeight > v.h ? { w: window.innerWidth, h: window.innerHeight } : v));
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const portrait = view.h > view.w && view.w < 700;
  // PC / paysage : toute la fenêtre visible. Téléphone en portrait : la fenêtre remplit toute la
  // hauteur de l'écran et on balaie de gauche à droite pour voir les autres parties.
  const fit = portrait ? (view.h - 2) / DH : Math.min(view.w / DW, (view.h - 2) / DH);
  const scale = fit * userZoom;
  /** « − » peut réduire jusqu'à voir toute la largeur de la fenêtre. */
  const minZoom = Math.min(1, view.w / DW / fit);

  // ------------------------------------------------------------ Projet
  const [project, setProject] = useState<LarpProject>(() => (typeof window === "undefined" ? exampleProject() : loadCurrent()));
  const [currentId, setCurrentId] = useState<string>(() => project.docs.find((d) => d.main)!.id);
  const [dirty, setDirtyState] = useState(false);
  /** Compteur de modifications : une sauvegarde ne marque « enregistré » que si rien n'a changé pendant l'envoi. */
  const edits = useRef(0);
  const setDirty = useCallback((v: boolean) => {
    if (v) edits.current++;
    setDirtyState(v);
  }, []);
  /** État de l'enregistrement dans le compte. */
  const [sync, setSync] = useState<"local" | "saving" | "saved" | "error">(() => (project.cloud ? "saved" : "local"));
  const doc = project.docs.find((d) => d.id === currentId) ?? project.docs.find((d) => d.main)!;
  const mainDoc = project.docs.find((d) => d.main)!;

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(project));
      } catch {
        /* stockage plein ou indisponible */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [project]);

  const updateDoc = useCallback((id: string, patch: Partial<LarpDoc>) => {
    setProject((p) => ({ ...p, docs: p.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
    setDirty(true);
  }, [setDirty]);

  // ------------------------------------------------------------ Interface
  const [menu, setMenuState] = useState<string | null>(null);
  const [subPath, setSubPath] = useState("");
  const setMenu = (m: string | null) => {
    setMenuState(m);
    setSubPath(m ? `/${m}` : "");
  };
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [messages, setMessages] = useState<Msg[]>([{ text: "Prêt. Ouvrez Exécuter » Exécuter… (F7) pour lancer l'algorithme.", kind: "info" }]);
  const [showSide, setShowSide] = useState(true);
  const [showMsgs, setShowMsgs] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [hint, setHint] = useState("");
  const [errorLoc, setErrorLoc] = useState<{ module: string; line: number } | null>(null);
  const [expanded, setExpanded] = useState({ main: true, aux: true, buf: true });
  const [editorBg, setEditorBg] = useState("#b9d3b1");
  const [chartZoom, setChartZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [armed, setArmed] = useState<FlowKind | null>(null);
  const [findText, setFindText] = useState("");
  const editor = useRef<EditorHandle>(null);
  const flowUndo = useRef<Array<{ id: string; flow: FlowProgram }>>([]);
  const flowClip = useRef<FlowNode | null>(null);

  // Points d'arrêt : lignes (pseudo-code) ou blocs (organigramme), par document.
  const [bps, setBps] = useState<Record<string, Array<number | string>>>({});

  // ------------------------------------------------------------ Exécution
  const [status, setStatus] = useState<Status>("idle");
  const [runMode, setRunMode] = useState<"normal" | "step">("normal");
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [stepOpen, setStepOpen] = useState(false);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [pos, setPos] = useState<{ module: string; line: number } | null>(null);
  const [inspect, setInspect] = useState<{ vars: Array<{ name: string; value: string; type: string }>; stack: string[] }>({ vars: [], stack: [] });
  const [selVar, setSelVar] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0.25);
  const [stepTab, setStepTab] = useState<"vars" | "bps">("vars");
  const [consolePos, setConsolePos] = useState({ x: 380, y: 300 });
  const [stepPos, setStepPos] = useState({ x: 540, y: 64 });
  const [inputText, setInputText] = useState("");
  const run = useRef<{ m: Machine; gen: Generator<RunEvent, void, void>; sources: Map<string, DocSource>; auto: Auto; timer?: ReturnType<typeof setTimeout>; out: Seg[] } | null>(null);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const isRunning = status === "running" || status === "paused" || status === "input";

  const addMsg = useCallback((m: Msg | Msg[]) => setMessages((l) => [...l, ...(Array.isArray(m) ? m : [m])].slice(-200)), []);

  const docOfModule = useCallback((name: string) => project.docs.find((d) => d.kind !== "tampon" && norm(d.name) === norm(name)), [project.docs]);

  const goTo = useCallback(
    (module: string, line: number) => {
      const d = docOfModule(module);
      if (!d) return;
      setCurrentId(d.id);
      if (d.kind === "pseudo") setTimeout(() => editor.current?.goto(line), 30);
      else setSelectedNode(nodeForLine(docSource(d), line) ?? null);
    },
    [docOfModule],
  );

  const flush = () => {
    const r = run.current;
    if (!r || !r.out.length) return;
    const add = r.out.splice(0);
    setSegs((s) => {
      const merged = [...s];
      for (const x of add) {
        const last = merged[merged.length - 1];
        if (last && last.k === x.k && x.t !== "\n" && !last.t.endsWith("\n") && merged.length > 0) last.t += x.t;
        else merged.push({ ...x });
      }
      return merged.length > 4000 ? merged.slice(-4000) : merged;
    });
  };

  const syncInspect = () => {
    const r = run.current;
    if (!r) return;
    setInspect({ vars: r.m.variables(), stack: r.m.frames.map((f) => f.label) });
  };

  const isBreakpoint = (module: string, line: number) => {
    const d = docOfModule(module);
    if (!d) return false;
    const list = bps[d.id] ?? [];
    if (d.kind === "pseudo") return list.includes(line);
    const src = run.current?.sources.get(d.name.toUpperCase());
    const id = src ? nodeForLine(src, line) : undefined;
    return !!id && list.includes(id);
  };

  const finish = () => {
    const r = run.current;
    flush();
    if (r) {
      // Les écritures dans les tampons d'E/S sont conservées dans le projet.
      const bufs = r.m.buffers;
      setProject((p) => ({ ...p, docs: p.docs.map((d) => (d.kind === "tampon" && bufs.get(norm(d.name)) ? { ...d, code: bufs.get(norm(d.name))!.content } : d)) }));
    }
    setStatus("done");
    setPos(null);
    syncInspect();
    addMsg({ text: "Exécution terminée.", kind: "info" });
  };

  const fail = (e: unknown) => {
    flush();
    const err = e instanceof LarpError ? e : new LarpError(e instanceof Error ? e.message : String(e), 1, "");
    setSegs((s) => [...s, { t: `\nErreur d'exécution : ${err.message}\n`, k: "err" }]);
    setStatus("error");
    setPos(null);
    setErrorLoc({ module: err.module, line: err.line });
    addMsg({ text: `Erreur d'exécution - ${err.module} (ligne ${err.line}) : ${err.message}`, kind: "err", module: err.module, line: err.line });
    goTo(err.module, err.line);
  };

  const pump = () => {
    const r = run.current;
    if (!r) return;
    clearTimeout(r.timer);
    const deadline = performance.now() + 14;
    try {
      for (;;) {
        const it = r.gen.next();
        if (it.done) {
          finish();
          return;
        }
        const ev = it.value;
        if (ev.type === "input") {
          flush();
          setStatus("input");
          syncInspect();
          return;
        }
        if (r.auto !== "run") {
          const bp = isBreakpoint(ev.module, ev.line);
          if (r.auto === "pause" || r.auto === "walk" || (r.auto === "continue" && bp)) {
            flush();
            setPos({ module: ev.module, line: ev.line });
            const d = docOfModule(ev.module);
            if (d) setCurrentId(d.id);
            syncInspect();
            if (r.auto === "walk" && !bp) {
              setStatus("running");
              r.timer = setTimeout(pump, Math.max(30, speedRef.current * 1000));
            } else {
              r.auto = "pause";
              setStatus("paused");
            }
            return;
          }
        }
        if (performance.now() > deadline) {
          flush();
          r.timer = setTimeout(pump, 0);
          return;
        }
      }
    } catch (e) {
      fail(e);
    }
  };

  const compile = (): { ok: true; res: ReturnType<typeof compileProject> & { ok: true }; sources: Map<string, DocSource>; buffers: ReturnType<typeof projectSources>["buffers"] } | { ok: false } => {
    const { modules, buffers, sources } = projectSources(project);
    const res = compileProject(modules);
    setErrorLoc(null);
    const log: Msg[] = res.log.map((t) => ({ text: t, kind: t.startsWith("ÉCHEC") ? "err" : "info" }));
    if (!res.ok) {
      log[log.length - 1] = { text: `Erreur - ${res.error.module} (ligne ${res.error.line}) : ${res.error.message}`, kind: "err", module: res.error.module, line: res.error.line };
      setMessages(log);
      setShowMsgs(true);
      setErrorLoc({ module: res.error.module, line: res.error.line });
      goTo(res.error.module, res.error.line);
      return { ok: false };
    }
    setMessages(log);
    return { ok: true, res, sources, buffers };
  };

  const stop = () => {
    if (run.current) clearTimeout(run.current.timer);
    run.current = null;
    setStatus("idle");
    setPos(null);
    setConsoleOpen(false);
    setStepOpen(false);
  };

  const start = (mode: "normal" | "step") => {
    if (run.current && isRunning) {
      if (mode === "step") stepOnce();
      return;
    }
    setMenu(null);
    const c = compile();
    if (!c.ok) return;
    const out: Seg[] = [];
    const m = new Machine(c.res.compiled, {
      out: (t, k) => out.push({ t, k }),
      warn: (text, module, line) => addMsg({ text: `${text} (${module}, ligne ${line})`, kind: "warn", module, line }),
      buffers: c.buffers,
    });
    run.current = { m, gen: m.run(), sources: c.sources, auto: mode === "normal" ? "run" : "pause", out };
    setSegs([]);
    setInputText("");
    setRunMode(mode);
    setConsoleOpen(true);
    setStepOpen(mode === "step");
    setStatus("running");
    addMsg({ text: mode === "normal" ? "Exécution du projet..." : "Exécution pas-à-pas du projet...", kind: "info" });
    setTimeout(pump, 0);
  };

  const stepOnce = () => {
    const r = run.current;
    if (!r) return start("step");
    if (status !== "paused") return;
    r.auto = "pause";
    setStatus("running");
    setTimeout(pump, 0);
  };
  const walk = () => {
    const r = run.current;
    if (!r || status === "input") return;
    r.auto = "walk";
    setStatus("running");
    setTimeout(pump, 0);
  };
  const cont = () => {
    const r = run.current;
    if (!r || status === "input") return;
    r.auto = "continue";
    setStatus("running");
    setPos(null);
    setTimeout(pump, 0);
  };
  const suspend = () => {
    const r = run.current;
    if (!r || status !== "running") return;
    clearTimeout(r.timer);
    r.auto = "pause";
    setTimeout(pump, 0);
  };

  const submitInput = () => {
    const r = run.current;
    if (!r || status !== "input") return;
    r.out.push({ t: inputText + "\n", k: "in" });
    r.m.provideInput(inputText);
    setInputText("");
    setStatus("running");
    setTimeout(pump, 0);
  };

  const closeConsole = () => {
    if (status === "running" || status === "paused" || status === "input") {
      setDialog({ t: "confirm", text: "L'algorithme est en cours d'exécution. Interrompre l'exécution ?", yes: () => stop() });
      return;
    }
    stop();
  };

  useEffect(() => () => clearTimeout(run.current?.timer), []);

  // Fermeture de la console terminée par une touche (comme dans l'environnement classique).
  useEffect(() => {
    if (!consoleOpen || (status !== "done" && status !== "error") || dialog) return;
    const on = (e: KeyboardEvent) => {
      if (e.key.startsWith("F") && e.key.length > 1) return;
      e.preventDefault();
      stop();
    };
    const t = setTimeout(() => window.addEventListener("keydown", on), 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", on);
    };
  });

  // ------------------------------------------------------------ Points d'arrêt
  const toggleBp = (key: number | string, d = doc) => {
    setBps((b) => {
      const list = b[d.id] ?? [];
      return { ...b, [d.id]: list.includes(key) ? list.filter((x) => x !== key) : [...list, key] };
    });
  };
  const toggleBpAtCursor = () => {
    if (doc.kind === "pseudo") toggleBp(cursor.line);
    else if (doc.kind === "organigramme" && selectedNode) toggleBp(selectedNode);
  };

  // ------------------------------------------------------------ Organigramme
  const setFlow = (flow: FlowProgram, record = true) => {
    if (doc.kind !== "organigramme" || !doc.flow) return;
    if (record) flowUndo.current.push({ id: doc.id, flow: doc.flow });
    updateDoc(doc.id, { flow });
  };
  const insertAt = (loc: FlowLoc, kind?: FlowKind) => {
    const k = kind ?? armed;
    if (!k || !doc.flow) {
      setHint("Choisissez d'abord une instruction dans le panneau Modèles, puis touchez un « + ».");
      return;
    }
    const n = larpNode(k);
    setFlow(insertNodes(doc.flow, loc, [n]));
    setArmed(null);
    setSelectedNode(n.id);
    setDialog({ t: "contenu", id: n.id });
  };
  const deleteNode = () => {
    if (doc.flow && selectedNode && selectedNode !== "debut" && selectedNode !== "fin") {
      setFlow(removeNodes(doc.flow, new Set([selectedNode])));
      setSelectedNode(null);
    }
  };
  const copyNode = (cut: boolean) => {
    if (!doc.flow || !selectedNode) return;
    const n = findNode(doc.flow, selectedNode);
    if (!n) return;
    flowClip.current = n;
    if (cut) deleteNode();
  };
  const pasteNode = () => {
    if (!doc.flow || !flowClip.current) return;
    const loc = selectedNode ? locationOf(doc.flow, selectedNode) : null;
    const target: FlowLoc = loc ? { ...loc, index: loc.index + 1 } : { parent: null, branch: "body", index: doc.flow.body.length };
    const n = cloneWithNewIds(flowClip.current);
    setFlow(insertNodes(doc.flow, target, [n]));
    setSelectedNode(n.id);
  };
  const undo = () => {
    if (doc.kind === "organigramme") {
      const last = [...flowUndo.current].reverse().find((u) => u.id === doc.id);
      if (!last) return;
      flowUndo.current.splice(flowUndo.current.lastIndexOf(last), 1);
      updateDoc(doc.id, { flow: last.flow });
      return;
    }
    editor.current?.textarea?.focus();
    document.execCommand("undo");
  };

  // ------------------------------------------------------------ Édition de texte
  const textCmd = async (cmd: "cut" | "copy" | "paste" | "delete" | "selectAll") => {
    if (doc.kind === "organigramme") {
      if (cmd === "cut") copyNode(true);
      else if (cmd === "copy") copyNode(false);
      else if (cmd === "paste") pasteNode();
      else if (cmd === "delete") deleteNode();
      return;
    }
    const t = editor.current?.textarea;
    if (!t) return;
    t.focus();
    if (cmd === "paste") {
      try {
        const txt = await navigator.clipboard.readText();
        document.execCommand("insertText", false, txt);
      } catch {
        setHint("Collage refusé par le navigateur : utilisez Ctrl+V ou l'appui long « Coller ».");
      }
      return;
    }
    if (cmd === "selectAll") {
      t.select();
      return;
    }
    if (cmd === "delete") {
      document.execCommand("delete");
      return;
    }
    const sel = t.value.slice(t.selectionStart, t.selectionEnd);
    try {
      await navigator.clipboard.writeText(sel);
    } catch {
      document.execCommand("copy");
    }
    if (cmd === "cut") document.execCommand("delete");
  };

  const findNext = (text = findText) => {
    if (!text) return setDialog({ t: "rechercher", replace: false });
    const order = [doc, ...project.docs.filter((d) => d.id !== doc.id)];
    const t = editor.current?.textarea;
    for (const d of order) {
      const src = d.kind === "organigramme" ? docSource(d).code : (d.code ?? "");
      const from = d.id === doc.id && t ? t.selectionEnd : 0;
      const i = src.toLowerCase().indexOf(text.toLowerCase(), from);
      if (i >= 0) {
        const line = src.slice(0, i).split("\n").length;
        if (d.kind === "organigramme") {
          setCurrentId(d.id);
          setSelectedNode(nodeForLine(docSource(d), line) ?? null);
        } else {
          setCurrentId(d.id);
          setTimeout(() => {
            const ta = editor.current?.textarea;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(i, i + text.length);
            editor.current?.goto(line, i - src.lastIndexOf("\n", i - 1));
            ta.setSelectionRange(i, i + text.length);
          }, 30);
        }
        setHint(`« ${text} » trouvé dans ${d.name}, ligne ${line}.`);
        return;
      }
    }
    setHint(`« ${text} » introuvable.`);
  };

  // ------------------------------------------------------------ Projet et documents
  const openProject = (p: LarpProject) => {
    stop();
    setProject(p);
    setCurrentId(p.docs.find((d) => d.main)!.id);
    setBps({});
    setSelectedNode(null);
    flowUndo.current = [];
    setDirty(false);
    setSync(p.cloud ? "saved" : "local");
    setMessages([{ text: `Projet « ${p.name} » ouvert${p.cloud ? " depuis votre compte" : ""}.`, kind: "info" }]);
  };
  /** Envoie le projet dans le compte (création ou nouvelle révision). */
  const cloudSave = async (p: LarpProject, opts: { force?: boolean; quiet?: boolean } = {}) => {
    const mark = edits.current;
    setSync("saving");
    const r = await saveCloud(p, p.cloud ?? null, opts.force);
    if (r.ok) {
      setProject((cur) => (cur.docs === p.docs || cur.name === p.name ? { ...cur, cloud: r.info } : cur));
      if (edits.current === mark) setDirtyState(false);
      setSync("saved");
      if (!opts.quiet) addMsg({ text: `Projet « ${p.name} » enregistré dans votre compte (retrouvez-le sur tous vos appareils).`, kind: "info" });
      return;
    }
    setSync("error");
    if (r.conflict) {
      setDialog({
        t: "confirm",
        text: "Ce projet a été modifié sur un autre appareil. Remplacer cette version par celle de cet appareil ?",
        yes: () => void cloudSave(p, { force: true }),
      });
      return;
    }
    addMsg({ text: `${r.message} (copie gardée sur cet appareil)`, kind: "warn" });
  };
  const save = (name = project.name, asNew = false) => {
    const p: LarpProject = { ...project, name, cloud: asNew || name !== project.name ? undefined : project.cloud };
    setProject(p);
    if (!saveProject(p)) addMsg({ text: "Copie locale impossible : stockage du navigateur indisponible.", kind: "warn" });
    void cloudSave(p);
  };
  // Enregistrement automatique dans le compte (projets déjà enregistrés une première fois).
  const cloudSaveRef = useRef(cloudSave);
  cloudSaveRef.current = cloudSave;
  useEffect(() => {
    if (!dirty || !project.cloud || sync === "saving") return;
    const t = setTimeout(() => void cloudSaveRef.current(project, { quiet: true }), 4000);
    return () => clearTimeout(t);
  }, [project, dirty, sync]);
  const validName = (name: string, exceptId?: string): string | null => {
    if (!NAME_RE.test(name)) return "Nom invalide : lettres, chiffres et _ uniquement, en commençant par une lettre.";
    if (KEYWORDS.has(norm(name)) || BUILTIN_NAMES.has(norm(name))) return `« ${name} » est un mot réservé.`;
    if (project.docs.some((d) => d.id !== exceptId && norm(d.name) === norm(name))) return `Un document s'appelle déjà « ${name} ».`;
    return null;
  };
  const addDoc = (d: LarpDoc) => {
    setProject((p) => ({ ...p, docs: [...p.docs, d] }));
    setCurrentId(d.id);
    setDirty(true);
  };
  const removeDoc = (id: string) => {
    setProject((p) => ({ ...p, docs: p.docs.filter((d) => d.id !== id) }));
    setCurrentId(mainDoc.id);
    setDirty(true);
  };
  const importInto = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".txt,.lap,text/plain";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const txt = await f.text();
      if (doc.kind === "organigramme") return setHint("Importer… s'applique aux modules en pseudo-code et aux tampons d'E/S.");
      updateDoc(doc.id, { code: txt.replace(/\r\n/g, "\n") });
      addMsg({ text: `Contenu importé depuis ${f.name}.`, kind: "info" });
    };
    inp.click();
  };
  const exportDoc = () => download(`${doc.name}.txt`, docSource(doc).code);
  const printDoc = () => {
    const w = window.open("", "_blank");
    if (!w) return setHint("Fenêtre d'impression bloquée par le navigateur.");
    const code = doc.kind === "tampon" ? (doc.code ?? "") : docSource(doc).code;
    w.document.write(`<title>${doc.name}</title><pre style="font:13px 'Courier New',monospace">${code.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`);
    w.document.close();
    w.print();
  };

  // ------------------------------------------------------------ Menus
  const editable = !isRunning;
  const docKindLabel = doc.kind === "pseudo" ? "pseudo-code" : doc.kind === "organigramme" ? "organigramme" : "tampon";
  const saved = menu === "Fichier" ? savedProjects() : {};
  const recent: MenuItem[] = Object.keys(saved).length ? Object.keys(saved).slice(0, 8).map((n) => ({ label: n, action: () => openProject(saved[n]) })) : [{ label: "(aucun projet récent)", disabled: true }];
  const menus: Array<{ name: string; items: MenuItem[] }> = [
    {
      name: "Fichier",
      items: [
        { label: "Nouveau...", accel: "Ctrl+N", action: () => setDialog({ t: "nouveau" }) },
        { label: "Ouvrir...", accel: "Ctrl+O", action: () => setDialog({ t: "ouvrir" }) },
        { label: "Rouvrir", accel: "Alt+O", sub: recent },
        { label: "Fermer projet", action: () => openProject(newProject("pseudo")) },
        { sep: true },
        { label: "Sauvegarder", accel: "Ctrl+S", action: () => (project.name === "SansTitre" ? setDialog({ t: "sauver" }) : save()) },
        { label: "Sauvegarder sous...", action: () => setDialog({ t: "sauver" }) },
        { sep: true },
        { label: "Imprimer...", accel: "Ctrl+P", action: printDoc },
        { sep: true },
        { label: "Quitter", accel: "Alt+F4", action: () => (router.push("/flow")) },
      ],
    },
    {
      name: "Éditer",
      items: [
        { label: "Annuler", accel: "Ctrl+Z", action: undo, disabled: !editable },
        { sep: true },
        { label: "Couper", accel: "Ctrl+X", action: () => textCmd("cut"), disabled: !editable },
        { label: "Copier", accel: "Ctrl+C", action: () => textCmd("copy") },
        { label: "Coller", accel: "Ctrl+V", action: () => textCmd("paste"), disabled: !editable },
        { label: "Effacer", accel: "Del", action: () => textCmd("delete"), disabled: !editable },
        { label: "Effacer tout", accel: "Ctrl+Del", disabled: doc.kind !== "tampon" || !editable, action: () => updateDoc(doc.id, { code: "" }) },
        { label: "Sélectionner tout", accel: "Ctrl+A", action: () => textCmd("selectAll"), disabled: doc.kind === "organigramme" },
        { sep: true },
        { label: "Contenu…", disabled: doc.kind !== "organigramme" || !selectedNode || !editable, action: () => selectedNode && setDialog({ t: "contenu", id: selectedNode }) },
        { label: "Augmenter l'indentation", disabled: doc.kind === "organigramme" || !editable, action: () => editor.current?.indent(1) },
        { label: "Réduire l'indentation", disabled: doc.kind === "organigramme" || !editable, action: () => editor.current?.indent(-1) },
        { sep: true },
        { label: "Rechercher...", accel: "Ctrl+F", action: () => setDialog({ t: "rechercher", replace: false }) },
        { label: "Rechercher suivant", accel: "F3", action: () => findNext() },
        { label: "Remplacer...", accel: "Ctrl+H", action: () => setDialog({ t: "rechercher", replace: true }), disabled: !editable },
      ],
    },
    {
      name: "Afficher",
      items: [
        { label: "Document", sub: project.docs.map((d) => ({ label: d.name, checked: d.id === doc.id, action: () => setCurrentId(d.id) })) },
        { label: "Panneau latéral", checked: showSide, action: () => setShowSide((v) => !v) },
        { label: "Messages", checked: showMsgs, action: () => setShowMsgs((v) => !v) },
        { label: "Console", accel: "F5", action: () => run.current && setConsoleOpen(true), disabled: !run.current },
        { sep: true },
        { label: "Agrandir l'affichage", action: () => setChartZoom((z) => Math.min(2, +(z + 0.25).toFixed(2))), disabled: doc.kind !== "organigramme" },
        { label: "Réduire l'affichage", action: () => setChartZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2))), disabled: doc.kind !== "organigramme" },
        { label: "Aucun agrandissement", action: () => setChartZoom(1), disabled: doc.kind !== "organigramme" },
        { sep: true },
        { label: "Pseudo-code…", action: () => setDialog({ t: "pseudo" }), disabled: doc.kind !== "organigramme" },
      ],
    },
    {
      name: "Exécuter",
      items: [
        {
          label: "Compiler...",
          accel: "Ctrl+F7",
          disabled: isRunning,
          action: () => {
            setShowMsgs(true);
            compile();
          },
        },
        { label: "Exécuter...", accel: "F7", action: () => start("normal"), disabled: isRunning },
        { label: "Exécuter pas-à-pas...", accel: "Shift+F7", action: () => start("step"), disabled: isRunning },
        { label: "Interrompre l'exécution…", action: stop, disabled: !run.current },
        { sep: true },
        { label: "Exécuter un pas", accel: "F6", action: stepOnce, disabled: !!run.current && (runMode !== "step" || status !== "paused") },
        { label: "Exécution animée", accel: "Ctrl+F6", action: stepOnce, disabled: !run.current || runMode !== "step" || status !== "paused" },
        { label: "Marcher", action: walk, disabled: !run.current || runMode !== "step" },
        { label: "Continuer l'exécution", action: cont, disabled: !run.current || runMode !== "step" },
        { label: "Suspendre l'exécution", accel: "Shift+F6", action: suspend, disabled: status !== "running" || runMode !== "step" },
        { sep: true },
        { label: "Point d'arrêt", accel: "F8", action: toggleBpAtCursor, disabled: doc.kind === "tampon" },
      ],
    },
    {
      name: "Projet",
      items: [
        {
          label: "Nouveau",
          sub: [
            { label: "Pseudo-code…", action: () => openProject(newProject("pseudo")) },
            { label: "Organigramme…", action: () => openProject(newProject("organigramme")) },
          ],
        },
        { label: "Fermer", action: () => openProject(newProject("pseudo")) },
        { label: "Statistiques...", accel: "F9", action: () => setDialog({ t: "stats" }) },
        { sep: true },
        {
          label: "Modules",
          sub: [
            {
              label: "Nouveau",
              sub: [
                { label: "Pseudo-code…", action: () => setDialog({ t: "nouveau" }) },
                { label: "Organigramme…", action: () => setDialog({ t: "nouveau" }) },
              ],
            },
            { label: "Renommer...", disabled: doc.kind === "tampon" || !!doc.main, action: () => setDialog({ t: "renommer", id: doc.id }) },
            { label: "Supprimer...", disabled: doc.kind === "tampon" || !!doc.main, action: () => setDialog({ t: "confirm", text: `Supprimer le module « ${doc.name} » ?`, yes: () => removeDoc(doc.id) }) },
            { label: "Importer…", disabled: doc.kind !== "pseudo", action: importInto },
            { label: "Exporter…", disabled: doc.kind === "tampon", action: exportDoc },
          ],
        },
        {
          label: "Tampons d'E/S",
          sub: [
            { label: "Nouveau...", action: () => setDialog({ t: "nouveau" }) },
            { label: "Renommer...", disabled: doc.kind !== "tampon", action: () => setDialog({ t: "renommer", id: doc.id }) },
            { label: "Supprimer...", disabled: doc.kind !== "tampon", action: () => setDialog({ t: "confirm", text: `Supprimer le tampon « ${doc.name} » ?`, yes: () => removeDoc(doc.id) }) },
            { label: "Importer…", disabled: doc.kind !== "tampon", action: importInto },
            { label: "Exporter…", disabled: doc.kind !== "tampon", action: () => download(`${doc.name}.txt`, doc.code ?? "") },
          ],
        },
      ],
    },
    {
      name: "Options",
      items: [
        { label: "Générales...", action: () => setDialog({ t: "info", title: "Options générales", text: "Les documents sont sauvegardés automatiquement dans ce navigateur. Utilisez Fichier » Sauvegarder pour garder plusieurs projets, et Projet » Modules » Exporter… pour obtenir un fichier texte." }) },
        { label: "Couleurs...", action: () => setDialog({ t: "couleurs" }) },
      ],
    },
    {
      name: "Aide",
      items: [
        { label: "Aide contextuelle...", accel: "F1", action: () => setDialog({ t: "aide" }) },
        { label: "Contenu...", accel: "Shift+F1", action: () => setDialog({ t: "aide" }) },
        { label: "Erreur...", accel: "Ctrl+F1", action: () => setDialog({ t: "info", title: "Erreur", text: messages.filter((m) => m.kind === "err").slice(-1)[0]?.text ?? "Aucune erreur sélectionnée." }) },
        { sep: true },
        { label: "À propos...", action: () => setDialog({ t: "apropos" }) },
      ],
    },
  ];

  // Raccourcis clavier globaux.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    if (dialog) {
      if (e.key === "Escape") setDialog(null);
      return;
    }
    const inField = (e.target as HTMLElement)?.closest?.("input, select, [data-console-input]");
    const ctrl = e.ctrlKey || e.metaKey;
    const k = e.key;
    const handled = () => e.preventDefault();
    if (k === "F7" && ctrl) return handled(), setShowMsgs(true), compile();
    if (k === "F7" && e.shiftKey) return handled(), start("step");
    if (k === "F7") return handled(), start("normal");
    if (k === "F6" && e.shiftKey) return handled(), suspend();
    if (k === "F6") return handled(), stepOnce();
    if (k === "F8") return handled(), toggleBpAtCursor();
    if (k === "F5") return handled(), run.current && setConsoleOpen(true);
    if (k === "F9") return handled(), setDialog({ t: "stats" });
    if (k === "F3") return handled(), findNext();
    if (k === "F1") return handled(), setDialog({ t: "aide" });
    if (k === "Escape") return setMenu(null);
    if (!ctrl) {
      if (!inField && doc.kind === "organigramme" && (k === "Delete" || k === "Backspace") && editable && !(e.target as HTMLElement)?.closest?.("textarea")) return handled(), deleteNode();
      return;
    }
    const lk = k.toLowerCase();
    if (lk === "n") return handled(), setDialog({ t: "nouveau" });
    if (lk === "o") return handled(), setDialog({ t: "ouvrir" });
    if (lk === "s") return handled(), project.name === "SansTitre" ? setDialog({ t: "sauver" }) : save();
    if (lk === "p") return handled(), printDoc();
    if (lk === "f") return handled(), setDialog({ t: "rechercher", replace: false });
    if (lk === "h") return handled(), setDialog({ t: "rechercher", replace: true });
    if (doc.kind === "organigramme" && !inField && editable) {
      if (lk === "z") return handled(), undo();
      if (lk === "x") return handled(), copyNode(true);
      if (lk === "c") return handled(), copyNode(false);
      if (lk === "v") return handled(), pasteNode();
    }
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  // ------------------------------------------------------------ Surlignage en exécution
  const activeLine = pos && norm(pos.module) === norm(doc.name) && doc.kind === "pseudo" ? pos.line : undefined;
  const activeNode = useMemo(() => {
    if (!pos || doc.kind !== "organigramme" || norm(pos.module) !== norm(doc.name)) return undefined;
    return nodeForLine(docSource(doc), pos.line);
  }, [pos, doc]);
  const errLine = errorLoc && norm(errorLoc.module) === norm(doc.name) ? errorLoc.line : undefined;
  const errNode = errLine && doc.kind === "organigramme" ? nodeForLine(docSource(doc), errLine) : undefined;
  const nextInstr = useMemo(() => {
    if (!pos) return "";
    const d = docOfModule(pos.module);
    if (!d) return "";
    return (docSource(d).code.split("\n")[pos.line - 1] ?? "").trim();
  }, [pos, docOfModule]);

  const dragConsole = useDrag(consolePos, setConsolePos, scale);
  const dragStep = useDrag(stepPos, setStepPos, scale);

  // ------------------------------------------------------------ Rendu
  const tb = (icon: string, label: string, action: () => void, disabled = false, testId?: string) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      data-testid={testId}
      disabled={disabled}
      onClick={action}
      onMouseEnter={() => setHint(label)}
      onMouseLeave={() => setHint("")}
      className="grid h-[24px] w-[24px] place-items-center rounded-[3px] border border-transparent enabled:hover:border-[#c2c0b6] enabled:hover:bg-[#f7f6f1] enabled:active:bg-[#e3e1d6] disabled:opacity-35"
    >
      {Icons[icon]}
    </button>
  );
  const sepV = <span className="mx-[3px] h-[20px] w-[2px] border-l border-r border-l-[#aca899] border-r-white" />;

  const renderItems = (items: MenuItem[], path: string): ReactNode => (
    <div className="min-w-[210px] border border-[#aca899] bg-white py-[2px] shadow-[2px_2px_4px_rgba(0,0,0,.35)]" style={{ font: UI_FONT }}>
      {items.map((it, i) => {
        if (it.sep) return <div key={i} className="mx-1 my-[3px] border-t border-[#aca899]" />;
        const key = `${path}/${it.label}`;
        const open = !!it.sub && (subPath === key || subPath.startsWith(key + "/"));
        return (
          <div key={i} className="relative">
            <button
              type="button"
              disabled={it.disabled}
              data-testid={`menu-${key.slice(1)}`}
              onMouseEnter={() => setSubPath(it.sub ? key : path)}
              onClick={() => {
                if (it.sub) return setSubPath(open ? path : key);
                setMenu(null);
                setSubPath("");
                it.action?.();
              }}
              className={`flex w-full items-center gap-2 px-1 py-[3px] text-left enabled:hover:bg-[#316ac5] enabled:hover:text-white disabled:text-[#aca899] ${open ? "bg-[#316ac5] text-white" : "text-black"}`}
            >
              <span className="w-[14px] text-center">{it.checked ? "✓" : ""}</span>
              <span className="flex-1 whitespace-nowrap">{it.label}</span>
              <span className="whitespace-nowrap pl-4 pr-1">{it.accel ?? (it.sub ? "▸" : "")}</span>
            </button>
            {it.sub && open && !it.disabled && <div className="absolute left-full top-[-3px] z-10">{renderItems(it.sub, key)}</div>}
          </div>
        );
      })}
    </div>
  );

  const navItem = (d: LarpDoc, indent: number) => (
    <button
      type="button"
      key={d.id}
      onClick={() => {
        setCurrentId(d.id);
        setSelectedNode(null);
        setArmed(null);
      }}
      className="flex w-full items-center gap-1 whitespace-nowrap py-[1px] text-left"
      style={{ paddingLeft: indent, font: "11px 'Courier New', monospace" }}
      data-testid={`doc-${d.name}`}
    >
      <span className="text-[#777]">└</span>
      {Icons[d.kind === "pseudo" ? "pseudo" : d.kind === "organigramme" ? "organigramme" : "tampon"]}
      <span className={d.id === doc.id ? "bg-[#316ac5] px-[2px] text-white" : "px-[2px]"}>{d.name.toUpperCase()}</span>
    </button>
  );
  const branch = (label: string, key: keyof typeof expanded, list: LarpDoc[]) => (
    <div>
      <button type="button" onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))} className="flex items-center gap-1 whitespace-nowrap" style={{ font: "11px 'Courier New', monospace" }}>
        <span className="grid h-[9px] w-[9px] place-items-center border border-[#7a7a7a] bg-white text-[8px] leading-none">{expanded[key] ? "−" : "+"}</span>
        {label}
      </button>
      {expanded[key] && list.map((d) => navItem(d, 12))}
    </div>
  );

  const statusText = status === "input" ? "En exécution... (saisie attendue)" : status === "running" ? "En exécution..." : status === "paused" ? "En pause…" : "Terminé";

  return (
    <div className="fixed inset-0 z-40 overflow-auto overscroll-none" style={{ background: "#3a6ea5" }} data-testid="larp-ecran" onClick={() => setMenu(null)}>
      {/* Cadre mis à l'échelle : même disposition que sur le PC du professeur. */}
      <div style={{ width: Math.max(DW * scale, view.w), height: Math.max(DH * scale, view.h), position: "relative" }}>
        <div
          className="absolute origin-top-left"
          style={{ width: DW, height: DH, transform: `scale(${scale})`, left: Math.max(0, (view.w - DW * scale) / 2), top: Math.max(0, (view.h - DH * scale) / 2), font: UI_FONT, color: "#000" }}
          data-testid="larp-fenetre"
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-t-[8px] border border-[#0831d9]" style={{ background: FACE }}>
            <TitleBar
              title={`UPL Algo Classique (compatible LARP) - [${project.name}${dirty ? "*" : ""}]`}
              icon={<span className="grid h-[14px] w-[14px] place-items-center rounded-[2px] bg-[#f28c28] text-[8px] font-black text-white">U</span>}
              onClose={() => (router.push("/flow"))}
            />
            {/* Barre de menu */}
            <div className="flex h-[20px] shrink-0 items-center border-b border-[#d8d2bd] px-[2px]" onClick={(e) => e.stopPropagation()}>
              {menus.map((m) => (
                <div key={m.name} className="relative">
                  <button
                    type="button"
                    data-testid={`menu-${m.name}`}
                    onClick={() => setMenu(menu === m.name ? null : m.name)}
                    onMouseEnter={() => menu && setMenu(m.name)}
                    className={`px-[7px] py-[1px] ${menu === m.name ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5] hover:text-white"}`}
                  >
                    {m.name}
                  </button>
                  {menu === m.name && <div className="absolute left-0 top-full z-30">{renderItems(m.items, `/${m.name}`)}</div>}
                </div>
              ))}
            </div>
            {/* Panneau de contrôle */}
            <div className="flex h-[30px] shrink-0 items-center gap-[1px] border-b border-[#aca899] px-[3px]" data-testid="panneau-controle">
              {tb("nouveau", "Nouveau... (Ctrl+N)", () => setDialog({ t: "nouveau" }))}
              {tb("ouvrir", "Ouvrir... (Ctrl+O)", () => setDialog({ t: "ouvrir" }))}
              {tb("fermer", "Fermer projet", () => openProject(newProject("pseudo")))}
              {tb("sauvegarder", "Sauvegarder (Ctrl+S)", () => (project.name === "SansTitre" ? setDialog({ t: "sauver" }) : save()))}
              {tb("imprimer", "Imprimer... (Ctrl+P)", printDoc)}
              {sepV}
              {tb("couper", "Couper (Ctrl+X)", () => textCmd("cut"), !editable)}
              {tb("copier", "Copier (Ctrl+C)", () => textCmd("copy"))}
              {tb("coller", "Coller (Ctrl+V)", () => textCmd("paste"), !editable)}
              {tb("annuler", "Annuler (Ctrl+Z)", undo, !editable)}
              {sepV}
              {tb("indenter", "Augmenter l'indentation", () => editor.current?.indent(1), doc.kind === "organigramme" || !editable)}
              {tb("desindenter", "Réduire l'indentation", () => editor.current?.indent(-1), doc.kind === "organigramme" || !editable)}
              {sepV}
              {tb("agrandir", "Agrandir l'affichage", () => setChartZoom((z) => Math.min(2, +(z + 0.25).toFixed(2))), doc.kind !== "organigramme")}
              {tb("reduire", "Réduire l'affichage", () => setChartZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2))), doc.kind !== "organigramme")}
              {sepV}
              {tb("rechercher", "Rechercher... (Ctrl+F)", () => setDialog({ t: "rechercher", replace: false }))}
              {tb("suivant", "Rechercher suivant (F3)", () => findNext())}
              {sepV}
              {tb("console", "Console (F5)", () => run.current && setConsoleOpen(true), !run.current)}
              {tb(
                "compiler",
                "Compiler... (Ctrl+F7)",
                () => {
                  setShowMsgs(true);
                  compile();
                },
                isRunning,
                "compiler",
              )}
              {tb("executer", "Exécuter... (F7)", () => start("normal"), isRunning, "executer")}
              {tb("pasapas", "Exécuter pas-à-pas... (Shift+F7)", () => start("step"), isRunning, "pas-a-pas")}
              {sepV}
              {tb("aide", "Aide contextuelle (F1)", () => setDialog({ t: "aide" }))}
              <select
                aria-label="Document édité"
                value={doc.id}
                onChange={(e) => setCurrentId(e.target.value)}
                className="ml-1 h-[20px] w-[118px] border border-[#7f9db9] bg-white px-[2px]"
                style={{ font: UI_FONT }}
                data-testid="choix-document"
              >
                {project.docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Panneau latéral + éditeur */}
            <div className="flex min-h-0 flex-1">
              {showSide && (
                <div className="flex w-[205px] shrink-0 flex-col border-r border-[#aca899]">
                  <div className="h-[16px] shrink-0 border-b border-[#aca899] bg-[#f1efe2] text-center leading-[15px]">Navigateur</div>
                  <div className="h-[132px] shrink-0 overflow-auto bg-white px-1 py-[2px]" data-testid="navigateur">
                    {branch("Module principal", "main", project.docs.filter((d) => d.main))}
                    {branch("Modules auxiliaires", "aux", project.docs.filter((d) => !d.main && d.kind !== "tampon"))}
                    {branch("Tampons d'E/S", "buf", project.docs.filter((d) => d.kind === "tampon"))}
                  </div>
                  <div className="h-[16px] shrink-0 border-y border-[#aca899] bg-[#f1efe2] text-center leading-[15px]">Modèles</div>
                  <div className="min-h-0 flex-1 overflow-auto" style={{ background: "#ecebe2" }} data-testid="modeles">
                    {doc.kind === "pseudo" &&
                      PSEUDO_TEMPLATES.map((t) => (
                        <button
                          type="button"
                          key={t.label}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", t.text.replace(/[{}]/g, ""))}
                          onClick={() => editable && editor.current?.insert(t.text)}
                          onMouseEnter={() => setHint(`Insérer : ${t.label} (toucher, ou glisser dans l'éditeur)`)}
                          className="block w-full border-b border-[#d8d6c9] px-2 py-[5px] text-left hover:bg-[#fffbe0]"
                          style={{ font: "9px Tahoma, Verdana, sans-serif" }}
                          data-testid={`modele-${t.label}`}
                        >
                          {t.lines.map((l, i) => (
                            <div key={i} className="whitespace-pre">
                              {l.split(/(\{[^}]*\})/).map((part, j) => (part.startsWith("{") ? <i key={j}>{part}</i> : <b key={j}>{part}</b>))}
                            </div>
                          ))}
                        </button>
                      ))}
                    {doc.kind === "organigramme" && (
                      <div className="grid grid-cols-3 gap-[2px] p-[3px]">
                        {FLOW_TEMPLATES.map((t) => (
                          <button
                            type="button"
                            key={t.kind}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData(DRAG_TYPE, t.kind)}
                            onClick={() => setArmed(armed === t.kind ? null : t.kind)}
                            onMouseEnter={() => setHint(`${t.label} : touchez-la puis touchez un « + » de l'organigramme (ou glissez-la sur un « + »).`)}
                            title={t.label}
                            aria-label={t.label}
                            data-testid={`forme-${t.kind}`}
                            className={`grid h-[38px] place-items-center rounded-[2px] border ${armed === t.kind ? "border-[#b45309] bg-[#fde68a]" : "border-transparent hover:border-[#aca899] hover:bg-[#f7f6f1]"}`}
                          >
                            <FlowGlyph kind={t.kind} />
                          </button>
                        ))}
                        <p className="col-span-3 px-1 pt-1 text-[10px] leading-tight text-[#555]">{armed ? "Touchez maintenant un « + » de l'organigramme." : "Touchez une forme, puis un « + »."}</p>
                      </div>
                    )}
                    {doc.kind === "tampon" && <p className="p-2 text-[#777]">(aucun modèle pour un tampon d&apos;E/S)</p>}
                  </div>
                </div>
              )}
              <div className="relative min-w-0 flex-1 border border-[#7f9db9] bg-white" onClick={(e) => e.stopPropagation()}>
                {doc.kind === "organigramme" && doc.flow ? (
                  <div className="absolute inset-0 overflow-auto" style={{ background: editorBg }} onClick={() => setSelectedNode(null)}>
                    <LarpChart
                      doc={doc}
                      flow={doc.flow}
                      zoom={chartZoom}
                      selected={selectedNode}
                      armed={armed}
                      editable={editable}
                      activeNode={activeNode}
                      errorNode={errNode}
                      breakpoints={new Set((bps[doc.id] ?? []).map(String))}
                      onSelect={setSelectedNode}
                      onEdit={(id) => editable && setDialog({ t: "contenu", id })}
                      onInsert={insertAt}
                    />
                  </div>
                ) : (
                  <LarpEditor
                    key={doc.id}
                    ref={editor}
                    value={doc.code ?? ""}
                    onChange={(v) => updateDoc(doc.id, { code: v })}
                    kind={doc.kind === "tampon" ? "tampon" : "module"}
                    bg={doc.kind === "tampon" ? "#ffffff" : editorBg}
                    activeLine={activeLine}
                    errorLine={errLine}
                    readOnly={!editable}
                    breakpoints={new Set((bps[doc.id] ?? []).filter((x): x is number => typeof x === "number"))}
                    onToggleBreakpoint={doc.kind === "pseudo" ? (l) => toggleBp(l) : undefined}
                    onCursor={(line, col) => setCursor({ line, col })}
                    testId="editeur-texte"
                  />
                )}
              </div>
            </div>

            {/* Panneau de messages */}
            {showMsgs && (
              <div className="h-[76px] shrink-0 overflow-auto border-t border-[#aca899] bg-white px-1 py-[1px]" style={{ font: "11px 'Courier New', monospace" }} data-testid="messages">
                {messages.map((m, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => m.module && m.line && goTo(m.module, m.line)}
                    className={`block w-full whitespace-pre text-left ${m.kind === "err" ? "text-[#d00000]" : m.kind === "warn" ? "text-[#8a5a00]" : "text-black"} ${m.module ? "hover:underline" : ""}`}
                  >
                    {m.kind === "info" && !m.text.startsWith("COMPL") && !m.text.startsWith("Prêt") ? "  " : ""}
                    {m.text}
                  </button>
                ))}
              </div>
            )}
            {/* Panneau de statut */}
            <div className="flex h-[20px] shrink-0 items-center gap-[2px] border-t border-[#aca899] px-[2px]" data-testid="statut">
              <span className="w-[60px] border border-[#aca899] px-1 text-center shadow-[inset_1px_1px_#fff]">{doc.kind === "organigramme" ? (selectedNode ? `#${String(docSource(doc).lineOfNode.get(selectedNode) ?? 0).padStart(4, "0")}` : "—") : `${cursor.line}:${cursor.col}`}</span>
              <span className="w-[44px] border border-[#aca899] px-1 text-center">{doc.kind === "organigramme" ? `${Math.round(chartZoom * 100)}%` : "Ins"}</span>
              <span className="w-[150px] truncate border border-[#aca899] px-1" data-testid="etat-compte" title="Enregistrement dans votre compte">
                {sync === "saving" ? "☁ Enregistrement…" : sync === "saved" ? (dirty ? "☁ Modifié…" : "☁ Dans votre compte") : sync === "error" ? "⚠ Non enregistré" : "Sur cet appareil"}
              </span>
              <span className="min-w-0 flex-1 truncate border border-[#aca899] px-1">{hint || `Document : ${doc.name} (${docKindLabel})${isRunning ? " — exécution en cours" : ""}`}</span>
            </div>
          </div>

          {/* Console d'exécution */}
          {consoleOpen && (
            <Win
              title="Console"
              icon={<span className="grid h-[14px] w-[14px] place-items-center rounded-[2px] bg-[#16a34a] text-[8px] font-black text-white">C</span>}
              onClose={closeConsole}
              onDragStart={dragConsole}
              testId="console"
              style={{ left: consolePos.x, top: consolePos.y, width: 560, height: 300, zIndex: 20 }}
            >
              <div className="h-[18px] shrink-0 border-b border-[#aca899] px-2 leading-[17px]" data-testid="console-statut">
                {statusText}
              </div>
              <div
                className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-all bg-black px-1 py-[2px] text-[#d8d8d8]"
                style={{ font: "13px 'Lucida Console', 'Courier New', monospace", lineHeight: "15px" }}
                data-testid="console-texte"
                onClick={() => {
                  if (status === "done" || status === "error") stop();
                  else (document.querySelector("[data-console-input]") as HTMLInputElement | null)?.focus();
                }}
                ref={(el) => {
                  if (el) el.scrollTop = el.scrollHeight;
                }}
              >
                {segs.map((s, i) => (
                  <span key={i} style={{ color: s.k === "ind" || s.k === "err" ? "#ff4040" : s.k === "in" ? "#ffffff" : undefined }}>
                    {s.t}
                  </span>
                ))}
                {status === "input" && (
                  <input
                    data-console-input
                    data-testid="console-saisie"
                    aria-label="Saisie de l'utilisateur"
                    autoFocus
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitInput();
                      }
                    }}
                    className="w-[60%] border-0 bg-transparent p-0 text-white caret-white outline-none"
                    style={{ font: "inherit" }}
                    enterKeyHint="send"
                  />
                )}
                {status === "input" && <span className="inline-block h-[13px] w-[7px] animate-pulse bg-[#d8d8d8] align-middle" />}
                {(status === "done" || status === "error") && (
                  <div className="mt-[15px] text-[#ffff00]" data-testid="console-fin">
                    Pressez une touche pour fermer la console...
                  </div>
                )}
              </div>
              {status === "input" && (
                <div className="flex shrink-0 gap-1 border-t border-[#aca899] p-[3px]">
                  <span className="self-center px-1">Saisie :</span>
                  <XpButton onClick={submitInput} testId="console-valider">
                    Entrée ↵
                  </XpButton>
                </div>
              )}
            </Win>
          )}

          {/* Fenêtre d'exécution pas-à-pas */}
          {stepOpen && run.current && (
            <Win title="Exécution pas-à-pas" onClose={stop} onDragStart={dragStep} testId="fenetre-pas-a-pas" style={{ left: stepPos.x, top: stepPos.y, width: 440, height: 262, zIndex: 21 }}>
              <div className="flex h-[44px] shrink-0 items-stretch gap-[2px] border-b border-[#aca899] p-[2px]">
                {(
                  [
                    ["unpas", "Un pas", stepOnce, status !== "paused", "un-pas"],
                    ["animer", "Animer", stepOnce, status !== "paused", "animer"],
                    ["marcher", "Marcher", walk, status === "input" || status === "done" || status === "error", "marcher"],
                    ["continuer", "Continuer", cont, status === "input" || status === "done" || status === "error", "continuer"],
                    ["pause", "Pause", suspend, status !== "running", "pause"],
                    ["arreter", "Arrêter", stop, false, "arreter"],
                    ["aide", "Aide", () => setDialog({ t: "aide" }), false, "aide-pas"],
                  ] as Array<[string, string, () => void, boolean, string]>
                ).map(([ic, label, fn, dis, id]) => (
                  <div key={id} className="flex flex-1 flex-col">
                    <button type="button" onClick={fn} disabled={dis} data-testid={`pas-${id}`} className="flex flex-1 flex-col items-center justify-center rounded-[2px] border border-[#c2c0b6] bg-[#f7f6f1] enabled:hover:bg-white disabled:opacity-40">
                      {Icons[ic]}
                      <span className="text-[10px] leading-none">{label}</span>
                    </button>
                    {id === "marcher" && (
                      <div className="flex">
                        <button type="button" aria-label="Plus lent" className="flex-1 border border-[#c2c0b6] text-[8px] leading-[9px]" onClick={() => setSpeed((s) => Math.min(2, +(s + 0.25).toFixed(2)))}>
                          ◂
                        </button>
                        <button type="button" aria-label="Plus rapide" className="flex-1 border border-[#c2c0b6] text-[8px] leading-[9px]" onClick={() => setSpeed((s) => Math.max(0.05, +(s >= 0.5 ? s - 0.25 : s / 2).toFixed(2)))}>
                          ▸
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex min-h-0 flex-1">
                <div className="flex min-w-0 flex-1 flex-col border-r border-[#aca899]">
                  {stepTab === "vars" ? (
                    <>
                      <div className="grid shrink-0 grid-cols-[1fr_1.4fr] border-b border-[#aca899] bg-[#f1efe2] font-bold">
                        <span className="border-r border-[#aca899] px-1">Variables</span>
                        <span className="px-1">Valeurs</span>
                      </div>
                      <div className="h-[86px] shrink-0 overflow-auto bg-white" style={{ font: "11px 'Courier New', monospace" }} data-testid="variables">
                        {inspect.vars.map((v) => (
                          <button type="button" key={v.name} onClick={() => setSelVar(v.name)} className={`grid w-full grid-cols-[1fr_1.4fr] text-left ${selVar === v.name ? "bg-[#316ac5] text-white" : ""}`}>
                            <span className="truncate px-1">{v.name}</span>
                            <span className="truncate px-1" data-testid={`valeur-${v.name}`}>
                              {v.value}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="shrink-0 border-y border-[#aca899] bg-[#f1efe2] px-1 font-bold">Animation</div>
                      <div className="min-h-0 flex-1 overflow-auto bg-white px-1 py-[2px]" style={{ font: "11px 'Courier New', monospace" }} data-testid="animation">
                        {pos ? (
                          <>
                            <span className="text-[#555]">Prochaine instruction :</span>
                            <div className="mt-[2px] bg-[#1d4ed8] px-1 text-white">{nextInstr || "(fin du module)"}</div>
                          </>
                        ) : status === "done" ? (
                          "Exécution terminée."
                        ) : status === "input" ? (
                          "Saisie attendue dans la console."
                        ) : (
                          ""
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="min-h-0 flex-1 overflow-auto bg-white" data-testid="liste-points-arret">
                      {project.docs.flatMap((d) =>
                        (bps[d.id] ?? []).map((b) => (
                          <label key={`${d.id}-${b}`} className="flex items-center gap-1 px-1">
                            <input type="checkbox" checked onChange={() => toggleBp(b, d)} />
                            {d.name} — {typeof b === "number" ? `ligne ${b}` : `bloc ${b}`}
                          </label>
                        )),
                      )}
                      {!Object.values(bps).some((l) => l.length) && <p className="p-1 text-[#777]">Aucun point d&apos;arrêt (F8 ou clic dans la marge).</p>}
                    </div>
                  )}
                  <div className="flex shrink-0 gap-[2px] px-1 pt-[1px]">
                    <button type="button" onClick={() => setStepTab("vars")} className={`rounded-t-[3px] border border-b-0 border-[#aca899] px-2 ${stepTab === "vars" ? "bg-white" : ""}`}>
                      Variables &amp; Animation
                    </button>
                    <button type="button" onClick={() => setStepTab("bps")} className={`rounded-t-[3px] border border-b-0 border-[#aca899] px-2 ${stepTab === "bps" ? "bg-white" : ""}`} data-testid="onglet-points-arret">
                      Points d&apos;arrêt
                    </button>
                  </div>
                </div>
                <div className="flex w-[150px] shrink-0 flex-col">
                  <div className="shrink-0 border-b border-[#aca899] bg-[#f1efe2] px-1 text-center font-bold">Pile d&apos;appels</div>
                  <div className="min-h-0 flex-1 overflow-auto bg-white" style={{ font: "11px 'Courier New', monospace" }} data-testid="pile-appels">
                    {inspect.stack.map((s, i) => (
                      <div key={i} className="truncate px-1" title={s}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex h-[18px] shrink-0 items-center gap-[2px] border-t border-[#aca899] px-[2px]">
                <span className="w-[120px] truncate border border-[#aca899] px-1">{pos ? `${pos.module}#${String(pos.line).padStart(4, "0")}` : statusText}</span>
                <span className="w-[64px] border border-[#aca899] px-1">{speed.toFixed(2)} sec</span>
                <span className="min-w-0 flex-1 truncate border border-[#aca899] px-1">{selVar ? `${selVar} est de type ${inspect.vars.find((v) => v.name === selVar)?.type ?? "indéfini"}` : ""}</span>
              </div>
            </Win>
          )}

          {dialog && (
            <div className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,.08)" }}>
              <DialogView
                dialog={dialog}
                close={() => setDialog(null)}
                project={project}
                doc={doc}
                findText={findText}
                setFindText={setFindText}
                findNext={findNext}
                editorBg={editorBg}
                setEditorBg={setEditorBg}
                validName={validName}
                onNewProject={(k) => openProject(newProject(k))}
                onNewModule={(k, name) => addDoc(newModule(k, name))}
                onNewBuffer={(name) => addDoc(newBuffer(name))}
                onOpen={openProject}
                onOpenCloud={async (id) => {
                  const r = await loadCloud(id);
                  if (r.ok) openProject({ ...r.project, cloud: r.info });
                  else addMsg({ text: r.message, kind: "err" });
                }}
                onSave={(name) => save(name, true)}
                onRename={(id, name) => updateDoc(id, { name })}
                onUpdateNode={(id, patch) => {
                  if (!doc.flow) return;
                  if (id === "debut" || id === "fin") {
                    updateDoc(doc.id, patch as Partial<LarpDoc>);
                    return;
                  }
                  flowUndo.current.push({ id: doc.id, flow: doc.flow });
                  const edit = (list: FlowNode[]): FlowNode[] =>
                    list.map((n) => {
                      const m = (n.id === id ? { ...n, ...patch } : n) as FlowNode;
                      if (m.kind === "if") return { ...m, yes: edit(m.yes), no: edit(m.no) };
                      if (m.kind === "while" || m.kind === "for" || m.kind === "repeat") return { ...m, body: edit(m.body) };
                      return m;
                    });
                  updateDoc(doc.id, { flow: { ...doc.flow, body: edit(doc.flow.body) } });
                }}
                onReplaceAll={(from, to) => {
                  let count = 0;
                  setProject((p) => ({
                    ...p,
                    docs: p.docs.map((d) => {
                      if (d.kind === "organigramme" || !d.code) return d;
                      const parts = d.code.split(from);
                      count += parts.length - 1;
                      return { ...d, code: parts.join(to) };
                    }),
                  }));
                  setDirty(true);
                  setTimeout(() => setHint(`${count} remplacement(s) effectué(s).`), 0);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Outils d'affichage (hors de la fenêtre) : zoom et conseil d'orientation sur téléphone. */}
      {(fit < 0.8 || portrait) && (
        <div className="fixed bottom-10 right-1 z-50 flex gap-1 rounded-full bg-black/45 p-0.5 text-white opacity-80 shadow" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label="Réduire" className="h-7 w-7 rounded-full bg-white/15 text-base" onClick={() => setUserZoom((z) => Math.max(minZoom, +(z - 0.5).toFixed(1)))}>
            −
          </button>
          <button type="button" className="h-7 rounded-full bg-white/15 px-2 text-[11px]" onClick={() => setUserZoom(1)}>
            Ajuster
          </button>
          <button type="button" aria-label="Agrandir" className="h-7 w-7 rounded-full bg-white/15 text-base" onClick={() => setUserZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))} data-testid="zoom-plus">
            +
          </button>
        </div>
      )}
      {portrait && !hidePortrait && (
        <div className="fixed inset-x-2 top-2 z-50 flex items-start gap-2 rounded-lg bg-[#10264f] p-3 text-sm text-white shadow-lg" data-testid="conseil-paysage">
          <span className="text-xl leading-none">↻</span>
          <p className="flex-1">La fenêtre remplit l&apos;écran : balayez vers la gauche ou la droite pour voir les autres parties (navigateur, éditeur, boutons). Tournez le téléphone (paysage) pour tout voir d&apos;un coup. Les boutons − / + en bas à droite changent la taille.</p>
          <button type="button" className="rounded bg-white/15 px-2 py-1 text-xs" onClick={() => setHidePortrait(true)}>
            OK
          </button>
        </div>
      )}
      <Link href="/flow" className="sr-only">
        Retour à UPL Flow Studio
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------- Boîtes de dialogue

interface DialogProps {
  dialog: Dialog;
  close: () => void;
  project: LarpProject;
  doc: LarpDoc;
  findText: string;
  setFindText: (s: string) => void;
  findNext: (s?: string) => void;
  editorBg: string;
  setEditorBg: (c: string) => void;
  validName: (name: string, exceptId?: string) => string | null;
  onNewProject: (k: "pseudo" | "organigramme") => void;
  onNewModule: (k: "pseudo" | "organigramme", name: string) => void;
  onNewBuffer: (name: string) => void;
  onOpen: (p: LarpProject) => void;
  onOpenCloud: (id: string) => Promise<void>;
  onSave: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onUpdateNode: (id: string, patch: Record<string, string>) => void;
  onReplaceAll: (from: string, to: string) => void;
}

function DialogView(props: DialogProps) {
  const { dialog, close } = props;
  const center = (w: number, h: number) => ({ left: (DW - w) / 2, top: Math.max(30, (DH - h) / 2 - 40), width: w });
  switch (dialog.t) {
    case "nouveau":
      return <NewDialog {...props} style={center(380, 330)} />;
    case "ouvrir":
      return <OpenDialog {...props} style={center(400, 300)} />;
    case "sauver":
      return <NameDialog title="Sauvegarder sous" label="Nom du projet :" initial={props.project.name === "SansTitre" ? "" : props.project.name} validate={(n) => (n.trim() ? null : "Indiquez un nom.")} onOk={(n) => props.onSave(n.trim())} close={close} style={center(340, 140)} />;
    case "renommer": {
      const d = props.project.docs.find((x) => x.id === dialog.id)!;
      return <NameDialog title={`Renommer ${d.name}`} label="Nouveau nom :" initial={d.name} validate={(n) => props.validName(n, d.id)} onOk={(n) => props.onRename(d.id, n)} close={close} style={center(340, 140)} />;
    }
    case "confirm":
      return (
        <Win title="Confirmation" onClose={close} style={center(330, 120)} testId="dialogue-confirmation">
          <div className="p-3">{dialog.text}</div>
          <div className="flex justify-center gap-2 pb-3">
            <XpButton
              autoFocus
              testId="confirmer-oui"
              onClick={() => {
                close();
                dialog.yes();
              }}
            >
              Oui
            </XpButton>
            <XpButton onClick={close}>Non</XpButton>
          </div>
        </Win>
      );
    case "contenu":
      return <NodeDialog {...props} id={dialog.id} style={center(400, 260)} />;
    case "rechercher":
      return <FindDialog {...props} replace={dialog.replace} style={center(380, 160)} />;
    case "pseudo":
      return (
        <Win title={`Pseudo-code de ${props.doc.name}`} onClose={close} style={center(520, 380)} testId="dialogue-pseudo">
          <pre className="m-2 h-[300px] overflow-auto border border-[#7f9db9] bg-[#b9d3b1] p-2" style={{ font: "12px 'Courier New', monospace" }}>
            {docSource(props.doc).code}
          </pre>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>Fermer</XpButton>
          </div>
        </Win>
      );
    case "stats": {
      const mods = props.project.docs.filter((d) => d.kind !== "tampon");
      const lines = mods.reduce((s, d) => s + docSource(d).code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("\\\\")).length, 0);
      return (
        <Win title="Statistiques du projet" onClose={close} style={center(330, 170)}>
          <div className="space-y-1 p-3">
            <p>Projet : {props.project.name}</p>
            <p>Modules : {mods.length} (dont {mods.filter((d) => d.kind === "organigramme").length} en organigramme)</p>
            <p>Tampons d&apos;E/S : {props.project.docs.length - mods.length}</p>
            <p>Lignes d&apos;instructions : {lines}</p>
          </div>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>OK</XpButton>
          </div>
        </Win>
      );
    }
    case "couleurs":
      return (
        <Win title="Couleurs" onClose={close} style={center(300, 160)}>
          <div className="space-y-2 p-3">
            <p>Fond des éditeurs (modules) :</p>
            <div className="flex gap-2">
              {[
                ["#b9d3b1", "Vert"],
                ["#ffffff", "Blanc"],
                ["#fdf6d8", "Crème"],
                ["#dbe6ff", "Bleu"],
              ].map(([c, l]) => (
                <button type="button" key={c} onClick={() => props.setEditorBg(c)} className={`flex flex-col items-center gap-1 rounded border p-1 ${props.editorBg === c ? "border-[#316ac5]" : "border-transparent"}`}>
                  <span className="h-6 w-10 border border-[#777]" style={{ background: c }} />
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>OK</XpButton>
          </div>
        </Win>
      );
    case "aide":
      return (
        <Win title="Aide — syntaxe du pseudo-code" onClose={close} style={center(620, 470)} testId="dialogue-aide">
          <div className="m-2 h-[390px] overflow-auto border border-[#7f9db9] bg-white p-2 leading-[1.45]" style={{ font: "11px Tahoma, sans-serif" }}>
            <HelpText />
          </div>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>Fermer</XpButton>
          </div>
        </Win>
      );
    case "apropos":
      return (
        <Win title="À propos" onClose={close} style={center(380, 210)}>
          <div className="space-y-2 p-3">
            <p className="font-bold">UPL Algo Classique — UPL CODE ACADEMY MK</p>
            <p>Interface d&apos;algorithmique classique dont la disposition et la syntaxe du pseudo-code sont compatibles avec le logiciel LARP (Logiciel d&apos;Algorithmes et de Résolution de Problèmes), afin de suivre un cours donné avec LARP sur un téléphone.</p>
            <p className="text-[#555]">Réalisation indépendante : aucun fichier ni code de LARP n&apos;est utilisé. LARP est une œuvre de son auteur.</p>
          </div>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>OK</XpButton>
          </div>
        </Win>
      );
    case "info":
      return (
        <Win title={dialog.title} onClose={close} style={center(360, 150)}>
          <div className="p-3">{dialog.text}</div>
          <div className="flex justify-end p-2 pt-0">
            <XpButton onClick={close}>OK</XpButton>
          </div>
        </Win>
      );
  }
}

function NewDialog({ close, style, validName, onNewProject, onNewModule, onNewBuffer }: DialogProps & { style: React.CSSProperties }) {
  const [choice, setChoice] = useState<"projet-pseudo" | "projet-organigramme" | "module-pseudo" | "module-organigramme" | "tampon">("module-pseudo");
  const [modName, setModName] = useState("");
  const [bufName, setBufName] = useState("");
  const [err, setErr] = useState("");
  const accept = () => {
    if (choice === "projet-pseudo" || choice === "projet-organigramme") {
      onNewProject(choice === "projet-pseudo" ? "pseudo" : "organigramme");
      return close();
    }
    const name = (choice === "tampon" ? bufName : modName).trim();
    const e = validName(name);
    if (e) return setErr(e);
    if (choice === "tampon") onNewBuffer(name);
    else onNewModule(choice === "module-pseudo" ? "pseudo" : "organigramme", name);
    close();
  };
  const radio = (v: typeof choice, label: string) => (
    <label className="mr-4 inline-flex items-center gap-1">
      <input type="radio" name="nouveau" checked={choice === v} onChange={() => setChoice(v)} data-testid={`nouveau-${v}`} /> {label}
    </label>
  );
  return (
    <Win title="Nouveau" onClose={close} style={style} testId="dialogue-nouveau">
      <div className="flex gap-2 p-2">
        <div className="flex-1 border border-[#d0d0bf] p-2">
          <p className="mb-1">Que désirez-vous créer?</p>
          <GroupBox label="Nouveau projet">
            {radio("projet-pseudo", "Pseudo-code")}
            {radio("projet-organigramme", "Organigramme")}
          </GroupBox>
          <GroupBox label="Nouveau module auxiliaire">
            {radio("module-pseudo", "Pseudo-code")}
            {radio("module-organigramme", "Organigramme")}
            <label className="mt-1 flex items-center gap-2">
              Nom:
              <input className={fieldClass} value={modName} onChange={(e) => setModName(e.target.value)} onFocus={() => !choice.startsWith("module") && setChoice("module-pseudo")} data-testid="nom-module" />
            </label>
          </GroupBox>
          <GroupBox label="Nouveau tampon d'E/S">
            {radio("tampon", "Tampon d'entrées/sorties")}
            <label className="mt-1 flex items-center gap-2">
              Nom:
              <input className={fieldClass} value={bufName} onChange={(e) => setBufName(e.target.value)} onFocus={() => setChoice("tampon")} data-testid="nom-tampon" />
            </label>
          </GroupBox>
          {err && <p className="text-[#d00]">{err}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <XpButton onClick={accept} testId="nouveau-accepter">
            <span className="text-[#16a34a]">✔</span> Accepter
          </XpButton>
          <XpButton onClick={close}>
            <span className="text-[#d00]">✘</span> Annuler
          </XpButton>
        </div>
      </div>
    </Win>
  );
}

function OpenDialog({ close, style, onOpen, onOpenCloud }: DialogProps & { style: React.CSSProperties }) {
  const [list, setList] = useState(() => savedProjects());
  const [cloud, setCloud] = useState<CloudEntry[] | null>(null);
  const [cloudMsg, setCloudMsg] = useState("Chargement de vos projets…");
  const [sel, setSel] = useState<string | null>(null);
  const names = Object.keys(list);
  const refresh = () =>
    listCloud().then((r) => {
      if (r.ok) {
        setCloud(r.list);
        setCloudMsg(r.list.length ? "" : "Aucun projet dans votre compte pour l'instant : utilisez Fichier » Sauvegarder.");
      } else {
        setCloud([]);
        setCloudMsg(r.message);
      }
    });
  useEffect(() => {
    void refresh();
  }, []);
  const openSel = async () => {
    if (!sel) return;
    if (sel === "__exemple") onOpen(exampleProject());
    else if (sel.startsWith("c:")) await onOpenCloud(sel.slice(2));
    else onOpen(list[sel.slice(2)]);
    close();
  };
  const importFile = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".txt,.lap,.json,text/plain,application/json";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const txt = (await f.text()).replace(/\r\n/g, "\n");
      try {
        const p = JSON.parse(txt) as LarpProject;
        if (p.docs?.some((d) => d.main)) {
          onOpen({ name: p.name ?? "Importé", docs: p.docs });
          return close();
        }
      } catch {
        /* texte brut : module principal */
      }
      const p = newProject("pseudo", f.name.replace(/\.[^.]+$/, ""));
      p.docs[0].code = txt;
      onOpen(p);
      close();
    };
    inp.click();
  };
  const item = (key: string, label: string, sub?: string) => (
    <button
      type="button"
      key={key}
      onClick={() => setSel(key)}
      onDoubleClick={() => {
        setSel(key);
        void (async () => {
          if (key === "__exemple") onOpen(exampleProject());
          else if (key.startsWith("c:")) await onOpenCloud(key.slice(2));
          else onOpen(list[key.slice(2)]);
          close();
        })();
      }}
      className={`flex w-full justify-between gap-2 px-1 text-left ${sel === key ? "bg-[#316ac5] text-white" : ""}`}
      data-testid={key.startsWith("c:") ? "projet-compte" : undefined}
    >
      <span className="truncate">{label}</span>
      {sub && <span className="shrink-0 opacity-70">{sub}</span>}
    </button>
  );
  return (
    <Win title="Ouvrir" onClose={close} style={style} testId="dialogue-ouvrir">
      <div className="flex gap-2 p-2">
        <div className="h-[230px] flex-1 overflow-auto border border-[#7f9db9] bg-white">
          <p className="bg-[#f1efe2] px-1 font-bold">☁ Mon compte</p>
          {cloud?.map((c) => item(`c:${c.id}`, c.name, new Date(c.updated_at).toLocaleDateString("fr-FR")))}
          {cloudMsg && <p className="px-1 text-[#666]">{cloudMsg}</p>}
          <p className="mt-1 bg-[#f1efe2] px-1 font-bold">Sur cet appareil</p>
          {item("__exemple", "Exemple (factorielle)")}
          {names.map((n) => item(`l:${n}`, n))}
        </div>
        <div className="flex flex-col gap-2">
          <XpButton disabled={!sel} onClick={() => void openSel()} testId="ouvrir-ok">
            Ouvrir
          </XpButton>
          <XpButton
            disabled={!sel || sel === "__exemple"}
            onClick={async () => {
              if (!sel) return;
              if (sel.startsWith("c:")) {
                if (!window.confirm("Supprimer définitivement ce projet de votre compte ?")) return;
                await deleteCloud(sel.slice(2));
                await refresh();
              } else {
                deleteSaved(sel.slice(2));
                setList(savedProjects());
              }
              setSel(null);
            }}
          >
            Supprimer
          </XpButton>
          <XpButton onClick={importFile}>Fichier…</XpButton>
          <XpButton onClick={close}>Annuler</XpButton>
        </div>
      </div>
      <p className="px-2 pb-2 text-[#555]">Les projets de votre compte se retrouvent sur tous vos appareils. « Fichier… » ouvre un fichier texte de pseudo-code.</p>
    </Win>
  );
}

function NameDialog({ title, label, initial, validate, onOk, close, style }: { title: string; label: string; initial: string; validate: (n: string) => string | null; onOk: (n: string) => void; close: () => void; style: React.CSSProperties }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState("");
  return (
    <Win title={title} onClose={close} style={style}>
      <form
        className="space-y-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const er = validate(v.trim());
          if (er) return setErr(er);
          onOk(v.trim());
          close();
        }}
      >
        <label className="block">
          {label}
          <input autoFocus className={fieldClass} value={v} onChange={(e) => setV(e.target.value)} data-testid="champ-nom" />
        </label>
        {err && <p className="text-[#d00]">{err}</p>}
        <div className="flex justify-end gap-2">
          <XpButton type="submit" testId="nom-ok">
            OK
          </XpButton>
          <XpButton onClick={close}>Annuler</XpButton>
        </div>
      </form>
    </Win>
  );
}

function NodeDialog({ close, style, doc, id, onUpdateNode }: DialogProps & { id: string; style: React.CSSProperties }) {
  const node = id === "debut" || id === "fin" ? undefined : doc.flow ? findNode(doc.flow, id) : undefined;
  const initial: Record<string, string> = (() => {
    if (id === "debut") return { entree: doc.entree ?? "" };
    if (id === "fin") return { retour: doc.retour ?? "" };
    if (!node) return {};
    const { id: _i, kind: _k, ...rest } = node as Record<string, unknown>;
    void _i;
    void _k;
    return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  })();
  const [vals, setVals] = useState<Record<string, string>>(initial);
  const field = (key: string, label: string, multiline = false) => (
    <label className="mb-2 block">
      {label}
      {multiline ? (
        <textarea autoFocus className={`${fieldClass} h-[90px] font-mono`} value={vals[key] ?? ""} onChange={(e) => setVals({ ...vals, [key]: e.target.value })} data-testid={`champ-${key}`} />
      ) : (
        <input autoFocus={key === Object.keys(initial)[0]} className={`${fieldClass} font-mono`} value={vals[key] ?? ""} onChange={(e) => setVals({ ...vals, [key]: e.target.value })} data-testid={`champ-${key}`} />
      )}
    </label>
  );
  if (doc.main && (id === "debut" || id === "fin"))
    return (
      <Win title="Contenu de l'instruction" onClose={close} style={style}>
        <div className="p-3">Les instructions DÉBUT et FIN du module principal ne se modifient pas.</div>
        <div className="flex justify-end p-2 pt-0">
          <XpButton onClick={close}>OK</XpButton>
        </div>
      </Win>
    );
  let body: ReactNode = null;
  let title = "Instruction";
  if (id === "debut") {
    title = "ENTRER";
    body = field("entree", "Paramètres (ex. X, RÉFÉRENCE Y) :");
  } else if (id === "fin") {
    title = "RETOURNER";
    body = field("retour", "Valeur de retour (facultative) :");
  } else if (node) {
    switch (node.kind) {
      case "assign":
        title = "Instruction séquentielle";
        body = field("expr", "Instruction(s), une par ligne (ex. Somme = Somme + x) :", true);
        break;
      case "input":
        title = "Entrées/sorties — Lecture";
        body = field("target", "Lecture (liste de variables) :");
        break;
      case "output":
        title = "Entrées/sorties — Écriture";
        body = field("expr", "Écriture (liste d'expressions) :");
        break;
      case "call":
        title = "Appel de module";
        body = (
          <>
            {field("name", "Module :")}
            {field("args", "Arguments (séparés par des virgules) :")}
          </>
        );
        break;
      case "comment":
        title = "Commentaire";
        body = field("text", "Texte :", true);
        break;
      case "if":
      case "while":
      case "repeat":
        title = node.kind === "if" ? "Condition SI" : node.kind === "while" ? "Boucle TANTQUE" : "Boucle RÉPÉTER-JUSQU'À";
        body = field("cond", "Condition :");
        break;
      case "for":
        title = "Boucle POUR";
        body = (
          <>
            {field("variable", "Variable :")}
            {field("from", "Valeur initiale :")}
            {field("to", "Valeur finale (JUSQU'À) :")}
            {field("step", "Incrément (facultatif) :")}
          </>
        );
        break;
    }
  }
  return (
    <Win title={`Contenu — ${title}`} onClose={close} style={style} testId="dialogue-contenu">
      <form
        className="p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onUpdateNode(id, vals);
          close();
        }}
      >
        {body}
        <div className="flex justify-end gap-2">
          <XpButton type="submit" testId="contenu-ok">
            OK
          </XpButton>
          <XpButton onClick={close}>Annuler</XpButton>
        </div>
      </form>
    </Win>
  );
}

function FindDialog({ close, style, replace, findText, setFindText, findNext, onReplaceAll }: DialogProps & { replace: boolean; style: React.CSSProperties }) {
  const [to, setTo] = useState("");
  return (
    <Win title={replace ? "Remplacer" : "Rechercher"} onClose={close} style={style}>
      <form
        className="space-y-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (replace) onReplaceAll(findText, to);
          else findNext(findText);
          close();
        }}
      >
        <label className="block">
          Rechercher :
          <input autoFocus className={fieldClass} value={findText} onChange={(e) => setFindText(e.target.value)} data-testid="champ-recherche" />
        </label>
        {replace && (
          <label className="block">
            Remplacer par :
            <input className={fieldClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <XpButton type="submit">{replace ? "Remplacer tout" : "Suivant"}</XpButton>
          <XpButton onClick={close}>Annuler</XpButton>
        </div>
      </form>
    </Win>
  );
}

function HelpText() {
  const row = (a: string, b: string) => (
    <tr>
      <td className="whitespace-pre border border-[#ddd] px-1 align-top font-mono font-bold">{a}</td>
      <td className="border border-[#ddd] px-1 align-top">{b}</td>
    </tr>
  );
  return (
    <div className="space-y-2">
      <p>
        Le pseudo-code ne distingue ni majuscules ni accents (ÉCRIRE = ecrire). Une instruction par ligne ; terminez une ligne par <b>$</b> pour continuer à la suivante. Commentaire : <b>\\</b> jusqu&apos;à la fin de la ligne.
      </p>
      <table className="w-full border-collapse">
        <tbody>
          {row("DÉBUT … FIN", "Module principal (un seul par projet).")}
          {row("ENTRER a, RÉFÉRENCE b … RETOURNER v", "Module auxiliaire : paramètres valeurs / références, valeur de retour facultative.")}
          {row("EXÉCUTER Module(args)", "Appel d'un module (ou simplement x = Module(args)).")}
          {row("x = expression", "Affectation (aucune déclaration de variable n'est nécessaire).")}
          {row("LIRE a, b", "Lecture au clavier (console) ; LIRE a DE 3 lit dans un tampon.")}
          {row("ÉCRIRE e1, e2", "Écriture (séparées par le séparateur, espace par défaut) ; ÉCRIRE … DANS 3.")}
          {row('REQUÊTE "Texte : ", a', "Affiche un libellé et lit sur la même ligne.")}
          {row('SÉPARATEUR ","', "Change le séparateur de lecture et d'écriture.")}
          {row("SI c ALORS … SINON SI c ALORS … SINON … FINSI", "Structures conditionnelles.")}
          {row("SÉLECTIONNER e\n  1, 2 : …\n  SINON …\nFINSÉLECTIONNER", "Structure de sélection (constantes).")}
          {row("TANTQUE c FAIRE … FINTANTQUE", "Boucle tant que.")}
          {row("RÉPÉTER … JUSQU'À c", "Boucle répéter jusqu'à.")}
          {row("POUR i = 1 JUSQU'À n INCRÉMENT p FAIRE … FINPOUR", "Boucle pour (incrément 1 par défaut).")}
          {row("+ - * / // % ^", "Opérateurs (// division entière, % modulo, ^ puissance).")}
          {row("= != <> < <= > >=", "Comparaisons ; logique : ET, OU, NON (ou !).")}
          {row("x EST ENTIER | FLOTTANT | CHAÎNE | CONTENEUR | DÉFINIE | INDÉFINIE", "Tests de type.")}
          {row("t = [1, 2, 3]   t[2]", "Conteneurs (positions à partir de 1) ; DÉTRUIRE t[2], COMPRESSER t.")}
          {row('OUVRIR TAMPON "NOM" SUR 1 EN LECTURE', "Tampons d'E/S (LECTURE, ÉCRITURE, AJOUT) ; FERMER 1 ; FINDECONTENU(1).")}
        </tbody>
      </table>
      <p>
        Fonctions : ABSOLU, ALÉATOIRE, ARCTANGENTE, ARRONDIR, CAPACITÉ, COMPTER (LONGUEUR), COSINUS, DATE, ENCARACTÈRES, ENCHAÎNE, EXP, FINDECONTENU, FORMATER, HEURE, LOG10, LOGE, MAJUSCULES, MAXIMUM, MINIMUM, MINUSCULES, PI, PLAFOND, PLANCHER, POSITION, RACINE, SINUS, SOUSENSEMBLE.
      </p>
      <p>
        Exécution : <b>F7</b> exécuter, <b>Shift+F7</b> pas-à-pas, <b>F6</b> un pas, <b>F8</b> point d&apos;arrêt (ou clic dans la marge), <b>Ctrl+F7</b> compiler. Organigramme : touchez une forme du panneau Modèles puis un « + » ; touchez deux fois un bloc pour modifier son contenu.
      </p>
    </div>
  );
}
