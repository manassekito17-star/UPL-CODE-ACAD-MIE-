"use client";

import type { Monaco } from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { runInBrowser, runProgram } from "@/lib/execution/browser";
import { registerServiceWorker } from "@/lib/offline/client";
import { STATUS_LABELS, engineName, type ExecutionResult } from "@/lib/execution/types";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import {
  basename,
  copyPath,
  countInside,
  createFile,
  createFolder,
  deletePath,
  languageOf,
  movePath,
  previewFiles,
  runFiles,
  searchProject,
  symbolsOf,
  updateFile,
  validateSnapshot,
  type FsResult,
  type ProjectSnapshot,
} from "@/lib/ide/fs";
import { attributeBacktrack } from "@/lib/ide/html-close";
import { starterContent, starterCursor } from "@/lib/ide/starters";
import { PROJECT_TEMPLATES } from "@/lib/ide/templates";
import { exportZip, importEntries, importZip } from "@/lib/ide/zip";
import { ResultExtras, sqlConsoleText } from "../editor/result-extras";
import { WebPreview, type PreviewConsoleLine } from "../editor/web-preview";
import { TutorChat } from "../tutor/tutor-chat";
import { cn } from "../ui";
import { EditorGroup, type EditorSettings, type MonacoEditor } from "./editor-group";
import { Explorer, ToolButton, type CreateRequest } from "./explorer";
import { FileIcon } from "./file-icon";
import { MenuBar, type MenuDef } from "./menu-bar";
import { MobileKeys, type KeyAction } from "./mobile-keys";
import { OfflineDialog, type InstallPromptEvent } from "./offline-dialog";
import { Icon, type IconName } from "./icons";
import { useProject, type IdeProject, type SaveStatus } from "./use-project";

type SideView = "explorateur" | "recherche" | "projets" | "versions" | "parametres";
type BottomTab = "problemes" | "console" | "sortie" | "journal";
type RightPanel = "apercu" | "ia" | null;

interface Group {
  tabs: string[];
  active: string | null;
}

interface MonacoMarker {
  resource: { toString(): string };
  startLineNumber: number;
  startColumn: number;
  message: string;
  severity: number;
}

interface Problem {
  path: string;
  line: number;
  column: number;
  message: string;
  severity: "erreur" | "avertissement" | "info";
}

const DEFAULT_SETTINGS: EditorSettings = { theme: "studio", fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, autosave: true };
// v2 : thème « studio » par défaut. Les autres préférences de la v1 sont reprises.
const SETTINGS_KEY = "upl:ide:parametres:v2";
const OLD_SETTINGS_KEY = "upl:ide:parametres";

const STATUS_TEXT: Record<SaveStatus, string> = {
  enregistre: "Enregistré",
  modifie: "Modifications non enregistrées",
  enregistrement: "Enregistrement…",
  hors_ligne: "Hors ligne — conservé sur cet appareil",
  conflit: "Conflit de versions",
  local: "Projet local (cet appareil)",
  erreur: "Erreur d'enregistrement",
};

function useSettings() {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
      const old = s ? null : JSON.parse(localStorage.getItem(OLD_SETTINGS_KEY) ?? "null");
      // Préférences lues après le montage (stockage local absent au rendu serveur).
      /* eslint-disable react-hooks/set-state-in-effect */
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...s });
      else if (old) setSettings({ ...DEFAULT_SETTINGS, ...old, theme: DEFAULT_SETTINGS.theme, minimap: DEFAULT_SETTINGS.minimap });
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      /* ignoré */
    }
  }, []);
  const change = (patch: Partial<EditorSettings>) =>
    setSettings((s) => {
      const n = { ...s, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(n));
      } catch {
        /* ignoré */
      }
      return n;
    });
  return [settings, change] as const;
}

/** Poignée de redimensionnement (glisser à la souris ou au doigt, flèches au clavier). */
function Splitter({ direction, onDelta, label }: { direction: "x" | "y"; onDelta: (d: number) => void; label: string }) {
  const last = useRef<number | null>(null);
  return (
    <div
      role="separator"
      aria-orientation={direction === "x" ? "vertical" : "horizontal"}
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 40 : 12;
        if ((direction === "x" && e.key === "ArrowLeft") || (direction === "y" && e.key === "ArrowUp")) onDelta(-step);
        if ((direction === "x" && e.key === "ArrowRight") || (direction === "y" && e.key === "ArrowDown")) onDelta(step);
      }}
      onPointerDown={(e) => {
        last.current = direction === "x" ? e.clientX : e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (last.current === null) return;
        const pos = direction === "x" ? e.clientX : e.clientY;
        onDelta(pos - last.current);
        last.current = pos;
      }}
      onPointerUp={() => (last.current = null)}
      className={cn(
        "shrink-0 bg-[var(--ide-border)] transition-colors hover:bg-[var(--ide-accent)] focus:bg-[var(--ide-accent)] focus:outline-none",
        direction === "x" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
      )}
    />
  );
}

export function IdeShell({ initial, loggedIn, userName }: { initial: IdeProject; loggedIn: boolean; userName: string | null }) {
  const router = useRouter();
  const [settings, changeSettings] = useSettings();
  const { project, setProject, update, save, status, conflict, acceptServer, isDirty, log, addLog } = useProject({ initial, loggedIn, autosave: settings.autosave });
  const projectKey = project.id ?? "local";
  const snapshot: ProjectSnapshot = useMemo(() => ({ files: project.files, folders: project.folders }), [project.files, project.folders]);

  const firstFile = initial.files.find((f) => f.path === "index.html") ?? initial.files.find((f) => /^(main|Main)\./.test(basename(f.path))) ?? initial.files[0];
  const [groups, setGroups] = useState<Group[]>([{ tabs: firstFile ? [firstFile.path] : [], active: firstFile?.path ?? null }]);
  const [focusedGroup, setFocusedGroup] = useState(0);
  const [side, setSide] = useState<SideView | null>("explorateur");
  const [sideWidth, setSideWidth] = useState(250);
  const [bottom, setBottom] = useState<BottomTab | null>("console");
  const [bottomHeight, setBottomHeight] = useState(190);
  const [bottomMax, setBottomMax] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<string | null>(null);
  const [createRequest, setCreateRequest] = useState<CreateRequest | null>(null);
  const [sections, setSections] = useState({ ouverts: true, plan: true });
  const [right, setRight] = useState<RightPanel>(null);
  const [rightWidth, setRightWidth] = useState(420);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [consoleLines, setConsoleLines] = useState<PreviewConsoleLine[]>([]);
  const [previewDoc, setPreviewDoc] = useState("");
  const [previewWidth, setPreviewWidth] = useState<"100%" | "768px" | "390px">("100%");
  const [flash, setFlash] = useState<{ tone: "erreur" | "info"; text: string } | null>(null);
  const editorsRef = useRef<Map<number, MonacoEditor>>(new Map());
  const monacoRef = useRef<Monaco | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  // Sur téléphone, l'éditeur occupe l'écran au démarrage (barre latérale et panneau fermés).
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    // Disposition adaptée à la taille réelle de l'écran, connue seulement après le montage.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (window.innerWidth < 768) {
      setSide(null);
      setBottom(null);
    }
    setTouch(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Application installable et utilisable sans Internet (service worker, invitation d'installation, connexion).
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    void registerServiceWorker();
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    const onNet = () => setOnline(navigator.onLine);
    onNet();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
    };
  }, []);

  // Clavier du téléphone ouvert : l'IDE se limite à la partie visible de l'écran,
  // pour que la ligne en cours et le clavier de programmation restent au-dessus du clavier.
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v || !touch) return;
    const update = () => setViewport(Math.abs(v.height - window.innerHeight) > 80 ? { top: v.offsetTop, height: v.height } : null);
    update();
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, [touch]);

  const activePath = groups[focusedGroup]?.active ?? groups[0]?.active ?? null;
  const activeFile = project.files.find((f) => f.path === activePath) ?? null;
  const activeLang = activePath ? languageOf(activePath) : null;
  const runnable = activePath ? runFiles(snapshot, activePath) : null;
  const htmlPages = useMemo(() => project.files.filter((f) => /\.html?$/i.test(f.path)).map((f) => f.path), [project.files]);
  const activePreviewable = Boolean(activeLang?.preview);
  const previewPath = useMemo(
    () => (previewTarget && htmlPages.includes(previewTarget) ? previewTarget : activePreviewable ? activePath : htmlPages.includes("index.html") ? "index.html" : (htmlPages[0] ?? null)),
    [previewTarget, htmlPages, activePreviewable, activePath],
  );

  const notify = useCallback((text: string, tone: "erreur" | "info" = "erreur") => {
    setFlash({ tone, text });
    setTimeout(() => setFlash(null), 4500);
  }, []);

  /** Applique une opération de fichiers ; affiche l'erreur éventuelle. */
  const apply = useCallback(
    (r: FsResult, logText?: string) => {
      if (!r.ok) {
        notify(r.error);
        return false;
      }
      update(r.project);
      if (logText) addLog(logText);
      return true;
    },
    [update, notify, addLog],
  );

  // Les modèles Monaco gardent leur contenu : on les resynchronise après une modification externe
  // (restauration d'une version, import, chargement de la version du serveur).
  const syncModels = useCallback(
    (snap: ProjectSnapshot) => {
      const monaco = monacoRef.current;
      if (!monaco) return;
      for (const m of monaco.editor.getModels()) {
        const uri = m.uri.toString();
        const marker = `ide/${projectKey}/`;
        const i = uri.indexOf(marker);
        if (i < 0) continue;
        const path = decodeURIComponent(uri.slice(i + marker.length));
        const f = snap.files.find((x) => x.path === path);
        if (!f) m.dispose();
        else if (m.getValue() !== f.content) m.setValue(f.content);
      }
    },
    [projectKey],
  );

  const replaceProject = useCallback(
    (snap: ProjectSnapshot, logText: string) => {
      update(snap);
      syncModels(snap);
      setGroups((gs) => gs.map((g) => ({ tabs: g.tabs.filter((t) => snap.files.some((f) => f.path === t)), active: g.active && snap.files.some((f) => f.path === g.active) ? g.active : null })));
      addLog(logText);
    },
    [update, syncModels, addLog],
  );

  // ---------------- Onglets ----------------
  const openFile = useCallback(
    (path: string, groupIndex = focusedGroup) => {
      setGroups((gs) => gs.map((g, i) => (i === groupIndex ? { tabs: g.tabs.includes(path) ? g.tabs : [...g.tabs, path], active: path } : g)));
      setFocusedGroup(groupIndex);
      if (typeof window !== "undefined" && window.innerWidth < 768) setSide(null);
    },
    [focusedGroup],
  );
  const closeTab = (groupIndex: number, path: string) => {
    if (isDirty(path) && project.id && !window.confirm(`« ${basename(path)} » contient des modifications non enregistrées. Elles restent dans le projet (brouillon) ; fermer l'onglet ?`)) return;
    setGroups((gs) => {
      const next = gs.map((g, i) => {
        if (i !== groupIndex) return g;
        const idx = g.tabs.indexOf(path);
        const tabs = g.tabs.filter((t) => t !== path);
        return { tabs, active: g.active === path ? (tabs[Math.max(0, idx - 1)] ?? null) : g.active };
      });
      // Un groupe secondaire vide se referme.
      return next.length > 1 && !next[1].tabs.length ? [next[0]] : next;
    });
    if (groupIndex === 1 && groups[1]?.tabs.length === 1) setFocusedGroup(0);
  };
  const renameInTabs = (from: string, to: string) =>
    setGroups((gs) =>
      gs.map((g) => {
        const re = (p: string) => (p === from || p.startsWith(`${from}/`) ? to + p.slice(from.length) : p);
        return { tabs: g.tabs.map(re), active: g.active ? re(g.active) : null };
      }),
    );
  const toggleSplit = () => {
    if (groups.length > 1) {
      setGroups((gs) => [{ tabs: [...new Set([...gs[0].tabs, ...gs[1].tabs])], active: gs[0].active }]);
      setFocusedGroup(0);
    } else {
      setGroups((gs) => [gs[0], { tabs: gs[0].active ? [gs[0].active] : [], active: gs[0].active }]);
      setFocusedGroup(1);
    }
  };

  // ---------------- Fichiers ----------------
  const explorerActions = {
    open: (p: string) => openFile(p),
    createFile: (p: string) => {
      // Contenu de départ selon l'extension (index.html → page complète, Main.java → classe…).
      const ok = apply(createFile(snapshot, p, starterContent(p)), `Fichier créé : ${p}`);
      if (ok) {
        const path = p.replace(/^\/+/, "");
        const at = starterCursor(path);
        if (at) goTo(path, at.line, at.column);
        else openFile(path);
      }
      return ok;
    },
    createFolder: (p: string) => apply(createFolder(snapshot, p), `Dossier créé : ${p}`),
    rename: (from: string, to: string) => {
      const ok = apply(movePath(snapshot, from, to), `Renommé : ${from} → ${to}`);
      if (ok) renameInTabs(from, to);
      return ok;
    },
    move: (from: string, intoFolder: string) => {
      const to = intoFolder ? `${intoFolder}/${basename(from)}` : basename(from);
      const ok = apply(movePath(snapshot, from, to), `Déplacé : ${from} → ${to}`);
      if (ok) renameInTabs(from, to);
      return ok;
    },
    copy: (p: string) => apply(copyPath(snapshot, p), `Copie créée de ${p}`),
    remove: (p: string) => {
      const n = countInside(snapshot, p);
      const isFolder = !project.files.some((f) => f.path === p);
      if (!window.confirm(isFolder ? `Supprimer le dossier « ${p} » et ses ${n} fichier(s) ? Cette action peut être annulée en restaurant une version.` : `Supprimer « ${p} » ?`)) return;
      if (apply(deletePath(snapshot, p), `Supprimé : ${p}`)) {
        setGroups((gs) => gs.map((g) => ({ tabs: g.tabs.filter((t) => t !== p && !t.startsWith(`${p}/`)), active: g.active === p || g.active?.startsWith(`${p}/`) ? null : g.active })));
      }
    },
    importFiles: () => fileInput.current?.click(),
    importFolder: () => folderInput.current?.click(),
    exportZip: () => {
      const blob = new Blob([exportZip(snapshot) as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-|-$/g, "") || "projet"}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addLog(`Projet exporté en ZIP (${project.files.length} fichier(s)).`);
    },
  };

  const mergeImport = (incoming: ProjectSnapshot, skipped: string[], source: string) => {
    const clashes = incoming.files.filter((f) => project.files.some((g) => g.path === f.path)).map((f) => f.path);
    if (clashes.length && !window.confirm(`${clashes.length} fichier(s) existent déjà (${clashes.slice(0, 3).join(", ")}${clashes.length > 3 ? "…" : ""}). Les remplacer ?`)) return;
    const files = [...project.files.filter((f) => !incoming.files.some((g) => g.path === f.path)), ...incoming.files];
    const merged = validateSnapshot({ files, folders: [...project.folders, ...incoming.folders] });
    if (!merged.ok) return notify(merged.error);
    replaceProject(merged.project, `Import (${source}) : ${incoming.files.length} fichier(s)${skipped.length ? `, ${skipped.length} ignoré(s) : ${skipped.slice(0, 5).join(", ")}` : ""}.`);
    if (skipped.length) notify(`${skipped.length} fichier(s) ignoré(s) (binaires ou chemins refusés). Voir le journal.`, "info");
  };

  const onImport = async (list: FileList | null, folder: boolean) => {
    if (!list?.length) return;
    const files = [...list];
    if (!folder && files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
      const r = importZip(new Uint8Array(await files[0].arrayBuffer()));
      if (!r.ok || !r.project) return notify(r.error ?? "Import impossible.");
      return mergeImport(r.project, r.skipped, files[0].name);
    }
    const entries = await Promise.all(files.map(async (f) => ({ path: (folder && (f as File & { webkitRelativePath?: string }).webkitRelativePath) || f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
    const r = importEntries(entries);
    if (!r.ok || !r.project) return notify(r.error ?? "Import impossible.");
    mergeImport(r.project, r.skipped, folder ? "dossier" : "fichiers");
  };

  // ---------------- Édition ----------------
  const onChange = (path: string, value: string) => {
    const f = project.files.find((x) => x.path === path);
    if (!f || f.content === value) return;
    const r = updateFile(snapshot, path, value);
    if (r.ok) update(r.project);
    else notify(r.error);
  };

  const onReady = useCallback((index: number) => (editor: MonacoEditor, monaco: Monaco) => {
    editorsRef.current.set(index, editor);
    if (monacoRef.current) return;
    monacoRef.current = monaco;
    // Problèmes : diagnostics réels des analyseurs Monaco (TS/JS, CSS, JSON, HTML) et du pseudocode.
    const collect = () => {
      const marker = `ide/${projectKey}/`;
      setProblems(
        monaco.editor
          .getModelMarkers({})
          .filter((m: MonacoMarker) => m.resource.toString().includes(marker))
          .map((m: MonacoMarker) => {
            const uri = m.resource.toString();
            return {
              path: decodeURIComponent(uri.slice(uri.indexOf(marker) + marker.length)),
              line: m.startLineNumber,
              column: m.startColumn,
              message: m.message,
              severity: m.severity >= 8 ? "erreur" : m.severity >= 4 ? "avertissement" : "info",
            } satisfies Problem;
          })
          .sort((a: Problem, b: Problem) => (a.severity === b.severity ? a.path.localeCompare(b.path) || a.line - b.line : a.severity === "erreur" ? -1 : 1)),
      );
    };
    monaco.editor.onDidChangeMarkers(collect);
    collect();
  }, [projectKey]);

  const focusedEditor = () => editorsRef.current.get(focusedGroup) ?? editorsRef.current.get(0);
  const goTo = (path: string, line: number, column = 1) => {
    openFile(path);
    // L'éditeur change de fichier au rendu suivant : on attend que le bon fichier soit affiché (1 s au plus).
    let tries = 0;
    const attempt = () => {
      const ed = focusedEditor();
      const shown = ed?.getModel() ? decodeURIComponent(ed.getModel()!.uri.toString()).endsWith(`/${path}`) : false;
      if (!shown && tries++ < 20) return void setTimeout(attempt, 50);
      ed?.revealLineInCenter(line);
      ed?.setPosition({ lineNumber: line, column });
      ed?.focus();
    };
    setTimeout(attempt, 30);
  };
  const format = () => void focusedEditor()?.getAction("editor.action.formatDocument")?.run();

  /** Charge les modules de chaque langage de l'éditeur (coloration, analyse) pour les garder hors ligne. */
  const loadLanguages = async () => {
    const monaco = monacoRef.current;
    if (!monaco) throw new Error("L'éditeur n'est pas encore chargé : patientez un instant puis réessayez.");
    const langs = ["html", "css", "javascript", "typescript", "json", "python", "c", "java", "markdown", "sql", "php", "pseudocode"];
    await Promise.all(langs.map((l) => monaco.editor.colorize("x", l, {}).catch(() => "")));
    // Les analyseurs (CSS, HTML, JSON, TypeScript/JavaScript) tournent dans des workers chargés à la demande.
    const models = ["css", "html", "json", "typescript", "javascript"].map((l, i) => monaco.editor.createModel(l === "html" ? "<p></p>" : "", l, monaco.Uri.parse(`inmemory://hors-ligne/${i}.${l}`)));
    await new Promise((r) => setTimeout(r, 2500));
    models.forEach((m) => m.dispose());
  };
  const warmEngines = async () => {
    await runInBrowser("pseudocode", [{ name: "main.algo", content: "ALGORITHME Test\nDEBUT\n  ECRIRE(1)\nFIN\n" }], "");
    await runInBrowser("javascript", [{ name: "main.js", content: "console.log(1)" }], "");
  };
  const warmPhpSql = async () => {
    const php = await runInBrowser("php", [{ name: "index.php", content: "<?php echo 1;" }], "");
    if (php.status !== "ok") throw new Error(php.stderr || "PHP n'a pas pu être téléchargé.");
    const sql = await runInBrowser("sql", [{ name: "requetes.sql", content: "SELECT 1;" }], "");
    if (sql.status !== "ok") throw new Error(sql.stderr || "SQLite n'a pas pu être téléchargé.");
  };
  const warmPython = async () => {
    const r = await runInBrowser("python", [{ name: "main.py", content: "print(1)" }], "");
    if (r.status !== "ok") throw new Error(r.stderr || "Python n'a pas pu être téléchargé.");
  };

  // ---------------- Copier / coller ----------------
  const [pasteBox, setPasteBox] = useState<string | null>(null);
  const pasteTarget = useRef<MonacoEditor | null>(null);
  const insertText = (ed: MonacoEditor, text: string) => {
    const sel = ed.getSelection();
    if (!sel) return;
    ed.pushUndoStop();
    ed.executeEdits("coller", [{ range: sel, text, forceMoveMarkers: true }]);
    ed.pushUndoStop();
    ed.focus();
  };
  /** Copier, couper, coller, tout sélectionner : boutons du clavier et menu Édition (fiables sur téléphone). */
  const clipboard = async (id: "tout" | "copier" | "couper" | "coller") => {
    const ed = focusedEditor();
    const model = ed?.getModel();
    if (!ed || !model) return notify("Ouvrez d'abord un fichier.", "info");
    if (id === "tout") {
      ed.setSelection(model.getFullModelRange());
      ed.focus();
      return;
    }
    if (id === "coller") {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) throw new Error("vide");
        insertText(ed, text);
        notify("Texte collé.", "info");
      } catch {
        // Accès direct refusé ou indisponible : fenêtre où coller avec l'appui long du téléphone.
        pasteTarget.current = ed;
        setPasteBox("");
      }
      return;
    }
    const current = ed.getSelection();
    const monaco = monacoRef.current;
    if (!current || !monaco) return;
    // Sans sélection : la ligne entière (comme dans les éditeurs de bureau).
    const whole = current.isEmpty();
    const line = current.startLineNumber;
    const range = whole ? new monaco.Range(line, 1, line, model.getLineMaxColumn(line)) : current;
    const text = model.getValueInRange(range) + (whole ? "\n" : "");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return notify("Copie refusée par le navigateur : sélectionnez le texte puis utilisez le menu Copier du téléphone.");
    }
    if (id === "couper") {
      ed.pushUndoStop();
      ed.executeEdits("couper", [{ range: whole ? new monaco.Range(line, 1, line + 1, 1) : current, text: "" }]);
      ed.pushUndoStop();
    }
    notify(id === "couper" ? "Texte coupé." : `Copié (${text.length} caractère${text.length > 1 ? "s" : ""}).`, "info");
    ed.focus();
  };

  /** Touche du clavier de programmation (téléphone) appliquée à l'éditeur actif. */
  const keyAction = (a: KeyAction) => {
    if (a.kind === "assistant") return setRight((r) => (r === "ia" ? null : "ia"));
    if (a.kind === "presse-papiers") return void clipboard(a.id);
    const ed = focusedEditor();
    if (!ed) return;
    ed.focus();
    if (a.kind === "texte") ed.trigger("clavier", "type", { text: a.text });
    else if (a.kind === "modele") {
      // Attribut juste après « <div> » : il est écrit dans la balise (« <div class=""> »).
      const pos = ed.getPosition();
      const model = ed.getModel();
      if (pos && model && /^ (class|id)=/.test(a.snippet) && attributeBacktrack(model.getLineContent(pos.lineNumber).slice(0, pos.column - 1))) {
        ed.setPosition({ lineNumber: pos.lineNumber, column: pos.column - 1 });
      }
      (ed.getContribution("snippetController2") as unknown as { insert(template: string): void } | null)?.insert(a.snippet);
    }
    else if (a.kind === "balise") {
      ed.trigger("clavier", "type", { text: "<" });
      ed.trigger("clavier", "editor.action.triggerSuggest", {});
    } else if (a.id === "palette") void ed.getAction("editor.action.quickCommand")?.run();
    else if (a.id === "suggestions") ed.trigger("clavier", "editor.action.triggerSuggest", {});
    else ed.trigger("clavier", a.id, null);
  };
  const findReplace = () => void focusedEditor()?.getAction("editor.action.startFindReplaceAction")?.run();

  // ---------------- Exécution et aperçu ----------------
  const refreshPreview = useCallback(() => {
    if (!previewPath) return;
    setConsoleLines([]);
    setPreviewDoc(buildPreviewDocument(previewFiles(snapshot, previewPath)));
  }, [previewPath, snapshot]);

  useEffect(() => {
    if (right !== "apercu") return;
    const t = setTimeout(refreshPreview, 500);
    return () => clearTimeout(t);
  }, [right, refreshPreview]);

  const run = async () => {
    if (!activePath) return;
    if (!runnable) {
      if (previewPath) {
        setRight("apercu");
        refreshPreview();
        return;
      }
      notify(`${activeLang?.label ?? "Ce fichier"} : aucun moteur d'exécution n'est connecté à la plateforme pour ce type de fichier.`, "info");
      return;
    }
    setRunning(true);
    setResult(null);
    setRunError(null);
    setBottom("console");
    const started = new Date();
    const r = await runProgram(runnable.language, runnable.files, stdin, { onStatus: setRunStatus });
    setRunning(false);
    setRunStatus(null);
    setResult(r.result ?? null);
    setRunError(r.error ?? null);
    addLog(`Exécution de ${activePath} (${languageOf(activePath).label}) : ${r.result ? STATUS_LABELS[r.result.status] : (r.error ?? "erreur")}${r.result?.timeMs != null ? ` en ${r.result.timeMs} ms` : ""} — ${started.toLocaleTimeString("fr-FR")}.`, r.result?.status === "ok" ? "info" : "erreur");
  };

  // Raccourcis globaux
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSide((s) => (s ? null : "explorateur"));
      } else if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        setBottom((b) => (b ? null : "console"));
      } else if (e.key === "\\") {
        e.preventDefault();
        toggleSplit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---------------- Projets ----------------
  const saveToAccount = async () => {
    const name = window.prompt("Nom du projet :", project.name)?.trim();
    if (!name) return;
    const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, template: "import", snapshot }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Création impossible.");
    try {
      localStorage.removeItem("upl:ide:brouillon:local");
    } catch {
      /* ignoré */
    }
    router.push(`/ide?projet=${data.project.id}`);
  };
  const renameProject = async () => {
    const name = window.prompt("Nouveau nom du projet :", project.name)?.trim();
    if (!name || name === project.name) return;
    if (!project.id) {
      setProject((p) => ({ ...p, name }));
      return;
    }
    const res = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Renommage impossible.");
    setProject((p) => ({ ...p, name: data.project.name }));
    addLog(`Projet renommé : ${data.project.name}`);
  };

  const errorsCount = problems.filter((p) => p.severity === "erreur").length;
  const warningsCount = problems.filter((p) => p.severity === "avertissement").length;
  const symbols = activeFile ? symbolsOf(activeFile.path, activeFile.content) : [];
  const openEditors = [...new Set(groups.flatMap((g) => g.tabs))];

  /** Lance une commande de l'éditeur Monaco actif (annuler, sélection, palette…). */
  const editorAction = (id: string) => {
    const ed = focusedEditor();
    if (!ed) return notify("Ouvrez d'abord un fichier.", "info");
    ed.focus();
    if (id === "undo" || id === "redo") ed.trigger("menu", id, null);
    else void ed.getAction(id)?.run();
  };
  const newEntry = (kind: CreateRequest["kind"]) => {
    setSide("explorateur");
    setCreateRequest((r) => ({ kind, id: (r?.id ?? 0) + 1 }));
  };
  const togglePreview = () => setRight((r) => (r === "apercu" ? null : "apercu"));
  const noFile = !activePath;

  const menus: MenuDef[] = [
    {
      label: "Fichier",
      items: [
        { label: "Nouveau fichier…", onClick: () => newEntry("nouveau-fichier") },
        { label: "Nouveau dossier…", onClick: () => newEntry("nouveau-dossier") },
        "separateur",
        { label: "Ouvrir un projet…", onClick: () => setSide("projets") },
        { label: "Importer des fichiers ou un ZIP…", onClick: explorerActions.importFiles },
        { label: "Importer un dossier…", onClick: explorerActions.importFolder },
        { label: "Exporter le projet (ZIP)", onClick: explorerActions.exportZip },
        { label: "Installer et utiliser sans Internet…", onClick: () => setOfflineOpen(true) },
        "separateur",
        !project.id && loggedIn
          ? { label: "Enregistrer dans mon compte…", shortcut: "Ctrl+S", onClick: () => void saveToAccount() }
          : { label: "Enregistrer", shortcut: "Ctrl+S", onClick: () => void save(), disabled: status === "enregistrement" },
        { label: "Renommer le projet…", onClick: () => void renameProject() },
        { label: "Historique des versions", onClick: () => setSide("versions") },
        "separateur",
        { label: "Fermer l'éditeur", onClick: () => activePath && closeTab(focusedGroup, activePath), disabled: noFile },
        { label: "Préférences", onClick: () => setSide("parametres") },
      ],
    },
    {
      label: "Édition",
      items: [
        { label: "Couper", shortcut: "Ctrl+X", onClick: () => void clipboard("couper"), disabled: noFile },
        { label: "Copier", shortcut: "Ctrl+C", onClick: () => void clipboard("copier"), disabled: noFile },
        { label: "Coller", shortcut: "Ctrl+V", onClick: () => void clipboard("coller"), disabled: noFile },
        { label: "Tout sélectionner", shortcut: "Ctrl+A", onClick: () => void clipboard("tout"), disabled: noFile },
        "separateur",
        { label: "Annuler", shortcut: "Ctrl+Z", onClick: () => editorAction("undo"), disabled: noFile },
        { label: "Rétablir", shortcut: "Ctrl+Y", onClick: () => editorAction("redo"), disabled: noFile },
        "separateur",
        { label: "Rechercher", shortcut: "Ctrl+F", onClick: () => editorAction("actions.find"), disabled: noFile },
        { label: "Remplacer", shortcut: "Ctrl+H", onClick: findReplace, disabled: noFile },
        { label: "Rechercher dans le projet", onClick: () => setSide("recherche") },
        "separateur",
        { label: "Basculer le commentaire de ligne", shortcut: "Ctrl+/", onClick: () => editorAction("editor.action.commentLine"), disabled: noFile },
        { label: "Formater le document", shortcut: "Maj+Alt+F", onClick: format, disabled: !activeLang?.format },
      ],
    },
    {
      label: "Sélection",
      items: [
        { label: "Tout sélectionner", shortcut: "Ctrl+A", onClick: () => editorAction("editor.action.selectAll"), disabled: noFile },
        { label: "Étendre la sélection", shortcut: "Maj+Alt+→", onClick: () => editorAction("editor.action.smartSelect.expand"), disabled: noFile },
        "separateur",
        { label: "Copier la ligne vers le haut", shortcut: "Maj+Alt+↑", onClick: () => editorAction("editor.action.copyLinesUpAction"), disabled: noFile },
        { label: "Copier la ligne vers le bas", shortcut: "Maj+Alt+↓", onClick: () => editorAction("editor.action.copyLinesDownAction"), disabled: noFile },
        { label: "Déplacer la ligne vers le haut", shortcut: "Alt+↑", onClick: () => editorAction("editor.action.moveLinesUpAction"), disabled: noFile },
        { label: "Déplacer la ligne vers le bas", shortcut: "Alt+↓", onClick: () => editorAction("editor.action.moveLinesDownAction"), disabled: noFile },
        "separateur",
        { label: "Ajouter un curseur au-dessus", shortcut: "Ctrl+Alt+↑", onClick: () => editorAction("editor.action.insertCursorAbove"), disabled: noFile },
        { label: "Ajouter un curseur en dessous", shortcut: "Ctrl+Alt+↓", onClick: () => editorAction("editor.action.insertCursorBelow"), disabled: noFile },
        { label: "Sélectionner toutes les occurrences", shortcut: "Ctrl+Maj+L", onClick: () => editorAction("editor.action.selectHighlights"), disabled: noFile },
      ],
    },
    {
      label: "Affichage",
      items: [
        { label: "Palette de commandes…", shortcut: "F1", onClick: () => editorAction("editor.action.quickCommand"), disabled: noFile },
        { label: "Aller au symbole…", shortcut: "Ctrl+Maj+O", onClick: () => editorAction("editor.action.quickOutline"), disabled: noFile },
        "separateur",
        { label: "Explorateur", onClick: () => setSide("explorateur"), checked: side === "explorateur" },
        { label: "Recherche", onClick: () => setSide("recherche"), checked: side === "recherche" },
        { label: "Projets", onClick: () => setSide("projets"), checked: side === "projets" },
        "separateur",
        { label: "Barre latérale", shortcut: "Ctrl+B", onClick: () => setSide((v) => (v ? null : "explorateur")), checked: Boolean(side) },
        { label: "Panneau", shortcut: "Ctrl+J", onClick: () => setBottom((b) => (b ? null : "console")), checked: Boolean(bottom) },
        { label: "Aperçu web", onClick: togglePreview, checked: right === "apercu", disabled: !previewPath },
        { label: "Assistant IA", onClick: () => setRight((r) => (r === "ia" ? null : "ia")), checked: right === "ia" },
        { label: "Vue fractionnée", shortcut: "Ctrl+\\", onClick: toggleSplit, checked: groups.length > 1 },
        "separateur",
        { label: "Minicarte", onClick: () => changeSettings({ minimap: !settings.minimap }), checked: settings.minimap },
        { label: "Retour à la ligne", onClick: () => changeSettings({ wordWrap: !settings.wordWrap }), checked: settings.wordWrap },
        { label: "Thème studio (gris)", onClick: () => changeSettings({ theme: "studio" }), checked: settings.theme === "studio" },
        { label: "Thème nuit UPL", onClick: () => changeSettings({ theme: "sombre" }), checked: settings.theme === "sombre" },
        { label: "Thème clair", onClick: () => changeSettings({ theme: "clair" }), checked: settings.theme === "clair" },
      ],
    },
    {
      label: "Exécuter",
      items: [
        { label: runnable ? `Exécuter ${activeLang?.label}` : "Exécuter le fichier", shortcut: "Ctrl+Entrée", onClick: () => void run(), disabled: running || (!runnable && !previewPath) },
        { label: "Afficher l'aperçu web", onClick: () => setRight("apercu"), disabled: !previewPath },
        { label: "Actualiser l'aperçu", onClick: refreshPreview, disabled: right !== "apercu" },
        "separateur",
        { label: "Console et entrées", onClick: () => setBottom("console") },
        { label: "Détails de la dernière exécution", onClick: () => setBottom("sortie") },
      ],
    },
    {
      label: "Aide",
      items: [
        { label: "Formation", onClick: () => router.push("/formation") },
        { label: "Laboratoire d'algorithmique", onClick: () => router.push("/laboratoire") },
        { label: "Professeur IA", onClick: () => router.push("/professeur-ia") },
        "separateur",
        { label: "Installer et utiliser sans Internet…", onClick: () => setOfflineOpen(true) },
        { label: `Accueil ${BRAND.name}`, onClick: () => router.push("/") },
      ],
    },
  ];

  return (
    <div className={cn("ide-root fixed inset-0 z-50 flex flex-col bg-[var(--ide-bg)] text-[var(--ide-text)]", settings.theme === "clair" ? "ide-clair" : settings.theme === "sombre" ? "ide-sombre" : "ide-studio")} style={viewport ? { top: viewport.top, height: viewport.height, bottom: "auto" } : undefined} data-testid="ide">
      <input ref={fileInput} type="file" multiple hidden onChange={(e) => { void onImport(e.target.files, false); e.target.value = ""; }} aria-label="Importer des fichiers" data-testid="ide-import-fichiers" />
      <input ref={folderInput} type="file" multiple hidden {...{ webkitdirectory: "", directory: "" }} onChange={(e) => { void onImport(e.target.files, true); e.target.value = ""; }} aria-label="Importer un dossier" />

      {/* Barre de titre : logo, menus, titre de la fenêtre, actions */}
      <header className="flex h-[35px] shrink-0 items-center gap-1 border-b border-[var(--ide-border)] bg-[var(--ide-activity)] px-1.5">
        <Link href="/" className="grid h-6 w-6 shrink-0 place-items-center rounded font-mono text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #1d5fe0, #22d3ee)" }} aria-label={`${BRAND.name} — accueil`} title={`${BRAND.name} — accueil`}>
          {"</>"}
        </Link>
        <MenuBar menus={menus} />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 truncate px-2 text-xs text-[var(--ide-muted)]">
          {activePath && <span className="hidden truncate lg:inline">{basename(activePath)} —</span>}
          <button type="button" onClick={renameProject} className="max-w-[40vw] truncate rounded-sm px-1 py-0.5 text-[var(--ide-text)] hover:bg-[var(--ide-hover)]" title="Renommer le projet" data-testid="ide-nom-projet">
            {project.name}
          </button>
          <span className="hidden shrink-0 sm:inline">— UPL IDE</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!project.id && loggedIn ? (
            <TopButton icon="enregistrer" label="Enregistrer dans mon compte" onClick={saveToAccount} />
          ) : (
            <TopButton icon="enregistrer" label="Enregistrer (Ctrl+S)" onClick={() => void save()} disabled={status === "enregistrement"} />
          )}
          <TopButton icon="executer" label={runnable ? `Exécuter ${activeLang?.label} (Ctrl+Entrée)` : previewPath ? "Afficher l'aperçu" : "Exécuter"} onClick={run} disabled={running || (!runnable && !previewPath)} primary />
          <TopButton icon="apercu" label="Aperçu web" onClick={togglePreview} active={right === "apercu"} disabled={!previewPath} />
          <TopButton icon="diviser" label="Vue fractionnée (Ctrl+\)" onClick={toggleSplit} active={groups.length > 1} />
          <TopButton icon="formater" label={activeLang?.format ? "Formater le document (Maj+Alt+F)" : "Formatage non disponible pour ce langage"} onClick={format} disabled={!activeLang?.format} />
          <span className="mx-1 hidden h-4 w-px bg-[var(--ide-border)] sm:block" />
          <span className="hidden sm:contents">
            <TopButton icon="barreLaterale" label="Barre latérale (Ctrl+B)" onClick={() => setSide((v) => (v ? null : "explorateur"))} active={Boolean(side)} />
          </span>
          <TopButton icon="panneau" label="Panneau inférieur (Ctrl+J)" onClick={() => setBottom((b) => (b ? null : "console"))} active={Boolean(bottom)} />
          <TopButton icon="ia" label="Assistant IA" onClick={() => setRight((r) => (r === "ia" ? null : "ia"))} active={right === "ia"} />
        </div>
      </header>

      {conflict && (
        <div className="flex flex-wrap items-center gap-2 border-b border-red-500/40 bg-red-500/15 px-3 py-2 text-xs" role="alert" data-testid="ide-conflit">
          <span className="font-semibold">Le projet a été modifié sur un autre appareil (révision {conflict.revision}).</span>
          <button type="button" className="rounded bg-red-500/30 px-2 py-1 hover:bg-red-500/50" onClick={() => void save({ force: true })}>Garder la version de cet appareil</button>
          <button type="button" className="rounded bg-[var(--ide-hover)] px-2 py-1" onClick={() => { acceptServer(); syncModels({ files: conflict.files, folders: conflict.folders }); }}>Charger la version du serveur</button>
          <span className="text-[var(--ide-muted)]">Dans les deux cas, l&apos;autre version reste disponible dans l&apos;historique.</span>
        </div>
      )}
      {flash && (
        <div className={cn("absolute left-1/2 top-14 z-50 -translate-x-1/2 rounded-md px-4 py-2 text-sm shadow-xl", flash.tone === "erreur" ? "bg-red-600 text-white" : "bg-[var(--ide-accent)] text-white")} role="status" data-testid="ide-message">
          {flash.text}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* Barre d'activité */}
        <nav aria-label="Sections de l'IDE" className="flex w-12 shrink-0 flex-col items-center border-r border-[var(--ide-border)] bg-[var(--ide-activity)]">
          {(
            [
              ["explorateur", "fichiers", "Explorateur"],
              ["recherche", "recherche", "Recherche"],
              ["projets", "projets", "Projets"],
              ["versions", "versions", "Historique des versions"],
            ] as Array<[SideView, IconName, string]>
          ).map(([id, icon, label]) => (
            <ActivityButton key={id} icon={icon} label={label} active={side === id} onClick={() => setSide((s) => (s === id ? null : id))} />
          ))}
          <ActivityButton icon="ia" label="Assistant IA" active={right === "ia"} onClick={() => setRight((r) => (r === "ia" ? null : "ia"))} />
          <Link href="/formation" title="Formation" aria-label="Formation" className="grid h-12 w-12 place-items-center text-[var(--ide-muted)] hover:text-[var(--ide-text)]">
            <Icon name="formation" className="h-6 w-6" />
          </Link>
          <Link href="/laboratoire" title="Laboratoire d'algorithmique" aria-label="Laboratoire d'algorithmique" className="grid h-12 w-12 place-items-center text-[var(--ide-muted)] hover:text-[var(--ide-text)]">
            <Icon name="laboratoire" className="h-6 w-6" />
          </Link>
          <div className="mt-auto flex flex-col">
            <Link href={loggedIn ? "/tableau-de-bord" : "/connexion?suite=/ide"} title={loggedIn ? `Mon espace${userName ? ` — ${userName}` : ""}` : "Se connecter"} aria-label={loggedIn ? "Mon espace" : "Se connecter"} className="grid h-12 w-12 place-items-center text-[var(--ide-muted)] hover:text-[var(--ide-text)]">
              <Icon name="compte" className="h-6 w-6" />
            </Link>
            <ActivityButton icon="parametres" label="Paramètres" active={side === "parametres"} onClick={() => setSide((s) => (s === "parametres" ? null : "parametres"))} />
          </div>
        </nav>

        {/* Barre latérale */}
        {side && (
          <>
            <aside className="absolute inset-y-0 left-12 z-30 w-[calc(100vw-3rem)] max-w-sm border-r border-[var(--ide-border)] bg-[var(--ide-sidebar)] md:static md:z-auto md:w-[var(--side-w)] md:max-w-none md:shrink-0" style={{ "--side-w": `${sideWidth}px` } as React.CSSProperties} aria-label="Barre latérale">
              {side === "explorateur" && (
                <div className="flex h-full min-h-0 flex-col">
                  <p className="flex h-[35px] shrink-0 items-center px-5 text-[11px] uppercase tracking-wide text-[var(--ide-muted)]">Explorateur</p>
                  <SideSection title="Éditeurs ouverts" open={sections.ouverts} onToggle={() => setSections((x) => ({ ...x, ouverts: !x.ouverts }))}>
                    <ul className="max-h-40 overflow-auto pb-1" aria-label="Éditeurs ouverts" data-testid="ide-editeurs-ouverts">
                      {openEditors.map((t) => (
                        <li key={t} className={cn("group flex h-[22px] cursor-pointer items-center gap-1.5 pl-5 pr-1 text-[13px] hover:bg-[var(--ide-hover)]", t === activePath && "bg-[var(--ide-selection)]")} onClick={() => openFile(t)} title={t}>
                          <button
                            type="button"
                            aria-label={`Fermer ${basename(t)}`}
                            className="grid h-4 w-4 shrink-0 place-items-center rounded-sm opacity-60 hover:bg-[var(--ide-hover)] hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              groups.forEach((g, i) => g.tabs.includes(t) && closeTab(i, t));
                            }}
                          >
                            <Icon name="fermer" className="h-3 w-3" />
                          </button>
                          <FileIcon path={t} />
                          <span className="truncate">{basename(t)}</span>
                          {t.includes("/") && <span className="truncate text-xs text-[var(--ide-muted)]">{t.slice(0, t.lastIndexOf("/"))}</span>}
                        </li>
                      ))}
                      {!openEditors.length && <li className="pl-5 text-xs text-[var(--ide-muted)]">Aucun fichier ouvert.</li>}
                    </ul>
                  </SideSection>
                  <div className="flex min-h-0 flex-1 flex-col border-t border-[var(--ide-border)]">
                    <Explorer project={snapshot} activePath={activePath} dirty={isDirty} actions={explorerActions} title={project.name} createRequest={createRequest} onCreateHandled={() => setCreateRequest(null)} />
                  </div>
                  <SideSection title="Plan" open={sections.plan} onToggle={() => setSections((x) => ({ ...x, plan: !x.plan }))} bordered>
                    <ul className="max-h-48 overflow-auto pb-1 text-[13px]" aria-label="Plan du fichier" data-testid="ide-plan">
                      {symbols.map((sym, i) => (
                        <li key={i}>
                          <button type="button" onClick={() => activePath && goTo(activePath, sym.line)} className="flex h-[22px] w-full items-center gap-1.5 pl-5 pr-2 text-left hover:bg-[var(--ide-hover)]">
                            <Icon name="symbole" className="h-3.5 w-3.5 shrink-0 text-[#b180d7]" />
                            <span className="truncate">{sym.name}</span>
                            <span className="ml-auto shrink-0 text-xs text-[var(--ide-muted)]">{sym.kind} · l. {sym.line}</span>
                          </button>
                        </li>
                      ))}
                      {!symbols.length && <li className="pl-5 text-xs text-[var(--ide-muted)]">{activePath ? "Aucune fonction ni classe dans ce fichier." : "Ouvrez un fichier pour voir son plan."}</li>}
                    </ul>
                  </SideSection>
                </div>
              )}
              {side === "recherche" && <SearchView project={snapshot} onOpen={goTo} />}
              {side === "projets" && <ProjectsView current={project} loggedIn={loggedIn} onOpen={(id) => router.push(id ? `/ide?projet=${id}` : "/ide")} notify={notify} onExport={explorerActions.exportZip} />}
              {side === "versions" && <VersionsView project={project} loggedIn={loggedIn} onRestore={(snap, label) => replaceProject(snap, `Version restaurée dans l'éditeur : ${label}. Enregistrez pour la conserver.`)} onCheckpoint={(label) => void save({ checkpoint: label })} notify={notify} />}
              {side === "parametres" && <SettingsView settings={settings} onChange={changeSettings} userName={userName} />}
            </aside>
            <div className="hidden md:block">
              <Splitter direction="x" label="Largeur de la barre latérale" onDelta={(d) => setSideWidth((w) => Math.min(520, Math.max(170, w + d)))} />
            </div>
          </>
        )}

        {/* Zone principale */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={cn("flex min-h-0 flex-1", bottom && bottomMax && "hidden")}>
            <div className={cn("flex min-h-0 min-w-0 flex-1", right && "max-md:hidden")}>
              {groups.map((g, i) => (
                <div key={i} className="flex min-h-0 min-w-0 flex-1">
                  {i > 0 && <div className="w-px shrink-0 bg-[var(--ide-border)]" />}
                  <div className="min-h-0 min-w-0 flex-1">
                    <EditorGroup
                      projectKey={projectKey}
                      tabs={g.tabs}
                      active={g.active}
                      files={project.files}
                      focused={groups.length > 1 && focusedGroup === i}
                      dirty={isDirty}
                      settings={settings}
                      onFocus={() => setFocusedGroup(i)}
                      onSelect={(p) => openFile(p, i)}
                      onClose={(p) => closeTab(i, p)}
                      onChange={onChange}
                      onCursor={(line, column) => setCursor({ line, column })}
                      onReady={onReady(i)}
                      onRun={() => void run()}
                      onSave={() => void save()}
                      welcome={{
                        start: [
                          { label: "Nouveau fichier…", onClick: () => newEntry("nouveau-fichier") },
                          { label: "Ouvrir un projet…", onClick: () => setSide("projets") },
                          { label: "Importer des fichiers ou un ZIP…", onClick: explorerActions.importFiles },
                          { label: "Importer un dossier…", onClick: explorerActions.importFolder },
                          { label: "Installer et utiliser sans Internet…", onClick: () => setOfflineOpen(true) },
                        ],
                        recent: project.files.slice(0, 6).map((f) => ({ label: f.path, onClick: () => openFile(f.path, i) })),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {right && (
              <>
                <div className="hidden md:block">
                  <Splitter direction="x" label="Largeur du panneau de droite" onDelta={(d) => setRightWidth((w) => Math.min(900, Math.max(280, w - d)))} />
                </div>
                <section className="flex min-h-0 w-full flex-col border-l border-[var(--ide-border)] bg-[var(--ide-sidebar)] md:w-[var(--right-w)] md:shrink-0" style={{ "--right-w": `${rightWidth}px` } as React.CSSProperties} aria-label={right === "apercu" ? "Aperçu" : "Assistant IA"}>
                  <div className="flex h-[35px] shrink-0 items-stretch border-b border-[var(--ide-border)] bg-[var(--ide-tabs)] text-[13px]">
                    <span className="flex min-w-0 items-center gap-1.5 bg-[var(--ide-tab-active)] px-3 text-[var(--ide-text)] shadow-[inset_0_1px_0_var(--ide-accent)]">
                      {right === "apercu" ? <Icon name="apercu" className="h-4 w-4 shrink-0 text-[#519aba]" /> : <Icon name="ia" className="h-4 w-4 shrink-0 text-[#b180d7]" />}
                      <span className="truncate">{right === "apercu" ? `Aperçu — ${previewPath ? basename(previewPath) : ""}` : "Assistant IA"}</span>
                    </span>
                    <span className="ml-auto flex items-center pr-1">
                      <ToolButton icon="fermer" label="Fermer le panneau" onClick={() => setRight(null)} />
                    </span>
                  </div>
                  {right === "apercu" && (
                    <div className="flex h-9 shrink-0 items-center gap-1 border-b border-[var(--ide-border)] bg-[var(--ide-editor)] px-2 text-xs" data-testid="ide-barre-apercu">
                      <ToolButton icon="actualiser" label="Actualiser l'aperçu" onClick={refreshPreview} />
                      <label className="flex min-w-0 flex-1 items-center gap-1 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-0.5">
                        <span className="shrink-0 text-[var(--ide-muted)]">projet/</span>
                        <select
                          aria-label="Page affichée dans l'aperçu"
                          value={previewPath ?? ""}
                          onChange={(e) => setPreviewTarget(e.target.value)}
                          className="min-w-0 flex-1 bg-transparent text-[var(--ide-text)] outline-none"
                        >
                          {previewPath && !htmlPages.includes(previewPath) && <option value={previewPath}>{previewPath}</option>}
                          {htmlPages.map((p) => (
                            <option key={p} value={p} className="text-black">{p}</option>
                          ))}
                        </select>
                      </label>
                      {(
                        [
                          ["100%", "Ordinateur"],
                          ["768px", "Tablette"],
                          ["390px", "Téléphone"],
                        ] as const
                      ).map(([w, label]) => (
                        <button key={w} type="button" onClick={() => setPreviewWidth(w)} aria-pressed={previewWidth === w} className={cn("shrink-0 rounded-sm px-1.5 py-0.5", previewWidth === w ? "bg-[var(--ide-hover)] text-[var(--ide-text)]" : "text-[var(--ide-muted)] hover:text-[var(--ide-text)]")}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {right === "apercu" ? (
                    <div className={cn("min-h-0 flex-1 overflow-auto", previewWidth === "100%" ? "bg-white" : "bg-[#2b2b2b] p-2")}>
                      <div className="mx-auto h-full bg-white" style={{ width: previewWidth, maxWidth: "100%" }}>
                        <WebPreview doc={previewDoc} onConsole={(l) => setConsoleLines((c) => [...c.slice(-199), l])} className="h-full w-full border-0 bg-white" title="Aperçu du projet" />
                      </div>
                    </div>
                  ) : loggedIn ? (
                    <div className="min-h-0 flex-1 overflow-hidden p-2">
                      <TutorChat
                        className="h-full"
                        defaultMode="expliquer_code"
                        modes={["expliquer_code", "analyser_erreur", "question", "enseigner", "indice", "mentor_projet"]}
                        intro="Je vois le fichier ouvert et la liste des fichiers du projet. Je peux expliquer le code, analyser une erreur ou vous guider. (La génération et la modification de fichiers avec validation arrivent dans une prochaine phase.)"
                        getContext={() => ({
                          language: runnable?.language,
                          code: activeFile ? `// Projet « ${project.name} » — fichiers : ${project.files.map((f) => f.path).join(", ")}\n// Fichier ouvert : ${activeFile.path}\n${activeFile.content}`.slice(0, 19_000) : undefined,
                          output: result?.stdout?.slice(0, 4000),
                          error: (result?.compileOutput || result?.stderr || runError || undefined)?.slice(0, 4000),
                        })}
                      />
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-[var(--ide-muted)]">
                      <Link href="/connexion?suite=/ide" className="text-[var(--ide-accent)] underline">Connectez-vous</Link> pour utiliser l&apos;assistant IA.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Panneau inférieur */}
          {bottom && (
            <>
              {!bottomMax && <Splitter direction="y" label="Hauteur du panneau inférieur" onDelta={(d) => setBottomHeight((h) => Math.min(600, Math.max(110, h - d)))} />}
              <section className={cn("flex shrink-0 flex-col border-t border-[var(--ide-border)] bg-[var(--ide-panel)]", bottomMax && "min-h-0 flex-1")} style={bottomMax ? undefined : { height: bottomHeight }} aria-label="Panneau inférieur">
                <div className="flex h-[35px] shrink-0 items-center gap-1 overflow-x-auto px-2" role="tablist">
                  {(
                    [
                      ["problemes", "Problèmes"],
                      ["sortie", "Sortie"],
                      ["console", "Console"],
                      ["journal", "Journal"],
                    ] as Array<[BottomTab, string]>
                  ).map(([id, label]) => (
                    <button key={id} role="tab" aria-selected={bottom === id} type="button" onClick={() => setBottom(id)} className={cn("flex h-full shrink-0 items-center gap-1.5 px-2 text-[11px] uppercase tracking-wide", bottom === id ? "text-[var(--ide-text)] shadow-[inset_0_-1px_0_var(--ide-text)]" : "text-[var(--ide-muted)] hover:text-[var(--ide-text)]")}>
                      {label}
                      {id === "problemes" && problems.length > 0 && <span className="grid min-w-4 place-items-center rounded-full bg-[var(--ide-accent)] px-1 text-[10px] leading-4 text-white">{problems.length}</span>}
                    </button>
                  ))}
                  <span className="ml-auto" />
                  <ToolButton icon={bottomMax ? "reduire" : "agrandir"} label={bottomMax ? "Restaurer la taille du panneau" : "Agrandir le panneau"} onClick={() => setBottomMax((m) => !m)} />
                  <ToolButton icon="fermer" label="Fermer le panneau" onClick={() => { setBottom(null); setBottomMax(false); }} />
                </div>
                <div className="min-h-0 flex-1 overflow-auto font-mono text-xs" data-testid={`ide-panneau-${bottom}`}>
                  {bottom === "problemes" &&
                    (problems.length ? (
                      <ul>
                        {problems.map((p, i) => (
                          <li key={i}>
                            <button type="button" onClick={() => goTo(p.path, p.line, p.column)} className="flex w-full gap-2 px-3 py-1 text-left hover:bg-[var(--ide-hover)]">
                              <span className={p.severity === "erreur" ? "text-red-400" : p.severity === "avertissement" ? "text-amber-300" : "text-sky-300"}>{p.severity === "erreur" ? "✕" : p.severity === "avertissement" ? "⚠" : "ℹ"}</span>
                              <span className="min-w-0 flex-1 truncate font-sans">{p.message}</span>
                              <span className="shrink-0 text-[var(--ide-muted)]">{p.path} [{p.line}:{p.column}]</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-3 font-sans text-[var(--ide-muted)]">Aucun problème détecté dans les fichiers ouverts.</p>
                    ))}
                  {bottom === "console" && (
                    <div className="flex h-full min-h-0 flex-col gap-2 p-2 md:flex-row">
                      <label className="flex shrink-0 flex-col gap-1 font-sans md:w-56">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ide-muted)]">Entrées (une par ligne)</span>
                        <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} className="min-h-12 flex-1 resize-none rounded border border-[var(--ide-border)] bg-[var(--ide-input)] p-1.5 font-mono text-xs text-[var(--ide-text)]" placeholder="input(), LIRE, scanf, fgets(STDIN)…" aria-label="Entrées du programme" />
                      </label>
                      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                      <pre className="min-h-16 flex-1 overflow-auto whitespace-pre-wrap break-words rounded bg-black/40 p-2 text-gray-100" aria-live="polite" data-testid="ide-console">
                        {running && <span className="text-cyan-accent">{runStatus ?? "Exécution en cours…"}{"\n"}</span>}
                        {!running && !result && !runError && !consoleLines.length && <span className="text-gray-500">Ctrl + Entrée pour exécuter le fichier actif. Les messages console.log() de l&apos;aperçu web s&apos;affichent aussi ici.</span>}
                        {runError && <span className="text-red-300">{runError}{"\n"}</span>}
                        {result?.compileOutput && <span className="text-red-300">{result.compileOutput}{"\n"}</span>}
                        {result && sqlConsoleText(result)}
                        {result?.stderr && <span className="text-red-300">{result.stderr}</span>}
                        {result?.hint && <span className="block text-amber-300">💡 {result.hint}</span>}
                        {consoleLines.map((l, i) => (
                          <span key={i} className={cn("block", l.level === "error" && "text-red-300", l.level === "warn" && "text-amber-300")}>
                            [page] {l.text}
                          </span>
                        ))}
                      </pre>
                      <ResultExtras result={result} files={runnable?.files ?? []} />
                      </div>
                    </div>
                  )}
                  {bottom === "sortie" && (
                    <div className="space-y-1 p-3 font-sans">
                      {result ? (
                        <>
                          <p>Statut : <strong>{STATUS_LABELS[result.status]}</strong></p>
                          <p>Moteur : {engineName(result, true)}</p>
                          {result.timeMs !== null && <p>Durée : {result.timeMs} ms</p>}
                          {result.memoryKb ? <p>Mémoire : {Math.round(result.memoryKb / 1024)} Mo</p> : null}
                          {result.errorLine && <p>Ligne de l&apos;erreur : {result.errorLine}</p>}
                        </>
                      ) : (
                        <p className="text-[var(--ide-muted)]">Les informations de la dernière exécution s&apos;afficheront ici.</p>
                      )}
                    </div>
                  )}
                  {bottom === "journal" && (
                    <ul className="p-2">
                      {log.length ? (
                        [...log].reverse().map((l, i) => (
                          <li key={i} className={cn("px-1 py-0.5", l.level === "erreur" ? "text-red-300" : l.level === "avertissement" ? "text-amber-300" : "text-[var(--ide-text)]")}>
                            <span className="text-[var(--ide-muted)]">{new Date(l.at).toLocaleTimeString("fr-FR")}</span> {l.text}
                          </li>
                        ))
                      ) : (
                        <li className="p-1 font-sans text-[var(--ide-muted)]">Les actions sur le projet (enregistrements, imports, exécutions…) sont journalisées ici.</li>
                      )}
                    </ul>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Barre d'état */}
      <footer className="flex h-[22px] shrink-0 items-center overflow-x-auto bg-[var(--ide-status)] text-xs text-[var(--ide-status-text)]" data-testid="ide-barre-etat">
        <Link href="/" className="flex h-full shrink-0 items-center bg-[#16825d] px-2.5 font-mono text-[11px] font-bold hover:brightness-110" title={`${BRAND.name} — accueil`}>
          {"</>"} UPL
        </Link>
        <StatusItem onClick={() => setSide("projets")} label="Projet">
          <Icon name="projets" className="h-3.5 w-3.5" /> {project.id ? "compte" : "local"}
        </StatusItem>
        <StatusItem onClick={() => void save()} label="Enregistrer">
          <span data-testid="ide-statut">{STATUS_TEXT[status]}</span>
          {project.id ? <span>· rév. {project.revision}</span> : null}
        </StatusItem>
        {!online && (
          <StatusItem onClick={() => setOfflineOpen(true)} label="Hors connexion">
            <span className="rounded-sm bg-amber-500 px-1 font-semibold text-black" data-testid="ide-hors-connexion">Hors connexion</span>
          </StatusItem>
        )}
        <StatusItem onClick={() => setBottom("problemes")} label="Problèmes">
          <span aria-hidden>ⓧ</span> {errorsCount} <span aria-hidden>⚠</span> {warningsCount}
        </StatusItem>
        <span className="ml-auto" />
        {symbols.length > 0 && (
          <select
            aria-label="Aller à une fonction"
            className="mx-1 h-[18px] max-w-44 shrink-0 rounded-sm bg-white/15 px-1 text-[11px] text-[var(--ide-status-text)]"
            value=""
            onChange={(e) => activePath && goTo(activePath, Number(e.target.value))}
          >
            <option value="" className="text-black">Aller à… ({symbols.length})</option>
            {symbols.map((sym, i) => (
              <option key={i} value={sym.line} className="text-black">
                {sym.kind} {sym.name} — l. {sym.line}
              </option>
            ))}
          </select>
        )}
        {activePath && (
          <>
            <StatusItem onClick={() => editorAction("editor.action.gotoLine")} label="Aller à la ligne">Ln {cursor.line}, Col {cursor.column}</StatusItem>
            <StatusItem onClick={() => setSide("parametres")} label="Indentation">Espaces : {settings.tabSize}</StatusItem>
            <span className="shrink-0 px-2">UTF-8</span>
            <span className="shrink-0 px-2">LF</span>
            <span className="shrink-0 px-2">{activeLang?.label ?? "—"}</span>
          </>
        )}
        <StatusItem onClick={runnable ? () => void run() : previewPath ? togglePreview : () => undefined} label="Mode d'exécution">
          {runnable ? "▶ exécutable" : previewPath && (activeLang?.preview || !activePath) ? (right === "apercu" ? "◉ aperçu actif" : "aperçu web") : activePath ? "édition seule" : ""}
        </StatusItem>
      </footer>
      {pasteBox !== null && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-labelledby="titre-coller" onClick={() => setPasteBox(null)}>
          <div className="w-full max-w-lg rounded-lg border border-[var(--ide-border)] bg-[var(--ide-menu)] p-4 text-sm text-[var(--ide-text)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-coller" className="text-base font-semibold">Coller du code</h2>
            <p className="mt-1 text-xs text-[var(--ide-muted)]">Touchez la zone ci-dessous, puis appui long → <b>Coller</b> (ou Ctrl+V). Le texte sera inséré à la position du curseur.</p>
            <textarea
              autoFocus
              value={pasteBox}
              onChange={(e) => setPasteBox(e.target.value)}
              rows={8}
              aria-label="Texte à coller"
              className="mt-2 w-full resize-y rounded border border-[var(--ide-border)] bg-[var(--ide-input)] p-2 font-mono text-xs text-[var(--ide-text)]"
              data-testid="zone-coller"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setPasteBox(null)} className="rounded px-3 py-1.5 text-[var(--ide-muted)] hover:bg-[var(--ide-hover)]">Annuler</button>
              <button
                type="button"
                disabled={!pasteBox}
                onClick={() => {
                  if (pasteTarget.current && pasteBox) insertText(pasteTarget.current, pasteBox);
                  setPasteBox(null);
                }}
                className="rounded bg-[var(--ide-accent)] px-3 py-1.5 font-semibold text-white disabled:opacity-50"
              >
                Insérer dans le fichier
              </button>
            </div>
          </div>
        </div>
      )}
      <OfflineDialog open={offlineOpen} onClose={() => setOfflineOpen(false)} installEvent={installEvent} onInstalled={() => setInstallEvent(null)} online={online} loadLanguages={loadLanguages} warmPython={warmPython} warmEngines={warmEngines} warmPhpSql={warmPhpSql} />
      {touch && activePath && !(bottom && bottomMax) && <MobileKeys language={activeLang?.monaco ?? null} onAction={keyAction} />}
    </div>
  );
}

function StatusItem({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="flex h-full shrink-0 items-center gap-1 px-2 hover:bg-white/15">
      {children}
    </button>
  );
}

function SideSection({ title, open, onToggle, children, bordered }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; bordered?: boolean }) {
  return (
    <div className={cn("shrink-0", bordered && "border-t border-[var(--ide-border)]")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex h-[22px] w-full items-center gap-0.5 pl-1 text-left text-[11px] font-bold uppercase text-[var(--ide-text)] hover:bg-[var(--ide-hover)]">
        <Icon name="chevron" className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
        {title}
      </button>
      {open && children}
    </div>
  );
}

function TopButton({ icon, label, onClick, disabled, active, primary }: { icon: IconName; label: string; onClick: () => void; disabled?: boolean; active?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-[26px] w-[26px] place-items-center rounded-md disabled:opacity-35",
        primary ? "text-[#89d185] hover:bg-[var(--ide-hover)]" : "text-[var(--ide-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
        active && "bg-[var(--ide-hover)] text-[var(--ide-text)]",
      )}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

function ActivityButton({ icon, label, active, onClick }: { icon: IconName; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn("relative grid h-12 w-12 place-items-center", active ? "text-[var(--ide-text)] before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[var(--ide-accent)]" : "text-[var(--ide-muted)] hover:text-[var(--ide-text)]")}
    >
      <Icon name={icon} className="h-6 w-6" />
    </button>
  );
}

function SideTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ide-muted)]">{children}</p>;
}

function SearchView({ project, onOpen }: { project: ProjectSnapshot; onOpen: (path: string, line: number, column: number) => void }) {
  const [q, setQ] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const results = useMemo(() => searchProject(project, q, { caseSensitive }), [project, q, caseSensitive]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SideTitle>Rechercher dans le projet</SideTitle>
      <div className="space-y-1.5 px-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Texte à rechercher" aria-label="Texte à rechercher dans le projet" className="w-full rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1 text-sm" />
        <label className="flex items-center gap-1.5 text-xs text-[var(--ide-muted)]">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Respecter la casse
        </label>
        {q && <p className="text-xs text-[var(--ide-muted)]">{results.length} résultat(s){results.length >= 200 ? " (limité à 200)" : ""} · remplacement dans un fichier : Ctrl + H</p>}
      </div>
      <ul className="mt-2 min-h-0 flex-1 overflow-auto text-xs" data-testid="ide-resultats-recherche">
        {results.map((r, i) => (
          <li key={i}>
            <button type="button" onClick={() => onOpen(r.path, r.line, r.column)} className="block w-full px-3 py-1 text-left hover:bg-[var(--ide-hover)]">
              <span className="block truncate font-mono text-[var(--ide-text)]">{r.text}</span>
              <span className="text-[var(--ide-muted)]">{r.path}:{r.line}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ProjectRow {
  id: string;
  name: string;
  template: string;
  revision: number;
  updated_at: string;
}

function ProjectsView({ current, loggedIn, onOpen, notify, onExport }: { current: IdeProject; loggedIn: boolean; onOpen: (id: string | null) => void; notify: (t: string, tone?: "erreur" | "info") => void; onExport: () => void }) {
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("web");
  const [busy, setBusy] = useState(false);
  const zipInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!loggedIn) return;
    const res = await fetch("/api/projects");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setRows(data.projects);
    else notify(data.error ?? "Liste des projets indisponible.");
  }, [loggedIn, notify]);
  useEffect(() => {
    // Chargement de la liste depuis l'API (mise à jour d'état asynchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const create = async (body: object) => {
    setBusy(true);
    const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return notify(data.error ?? "Création impossible.");
    onOpen(data.project.id);
  };
  const patch = async (id: string, body: object) => {
    const res = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Opération impossible.");
    await load();
    return data.project as ProjectRow;
  };
  const remove = async (p: ProjectRow) => {
    if (!window.confirm(`Supprimer définitivement le projet « ${p.name} » et tout son historique ?`)) return;
    const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    if (!res.ok) return notify("Suppression impossible.");
    if (p.id === current.id) onOpen(null);
    else await load();
  };

  if (!loggedIn)
    return (
      <div className="p-3 text-sm">
        <SideTitle>Projets</SideTitle>
        <p className="px-3 text-[var(--ide-muted)]">Vous travaillez sur un projet local (enregistré dans ce navigateur).</p>
        <p className="mt-2 px-3">
          <Link href="/connexion?suite=/ide" className="text-[var(--ide-accent)] underline">Connectez-vous</Link> pour enregistrer vos projets dans votre compte et les retrouver sur tous vos appareils.
        </p>
        <button type="button" onClick={onExport} className="mx-3 mt-3 rounded border border-[var(--ide-border)] px-2 py-1 text-xs">Exporter ce projet (ZIP)</button>
      </div>
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SideTitle>Nouveau projet</SideTitle>
      <form
        className="space-y-1.5 px-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) void create({ name: name.trim(), template });
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du projet" aria-label="Nom du nouveau projet" className="w-full rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1 text-sm" />
        <select value={template} onChange={(e) => setTemplate(e.target.value)} aria-label="Modèle du projet" className="w-full rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1 text-sm">
          {PROJECT_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          <button type="submit" disabled={busy || !name.trim()} className="rounded bg-[var(--ide-accent)] px-2 py-1 text-xs font-semibold text-white disabled:opacity-50">Créer</button>
          <button type="button" onClick={() => zipInput.current?.click()} className="rounded border border-[var(--ide-border)] px-2 py-1 text-xs">Importer un ZIP</button>
          <input
            ref={zipInput}
            type="file"
            accept=".zip,application/zip"
            hidden
            aria-label="Importer un projet ZIP"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const r = importZip(new Uint8Array(await f.arrayBuffer()));
              if (!r.ok || !r.project) return notify(r.error ?? "Archive illisible.");
              await create({ name: f.name.replace(/\.zip$/i, "").slice(0, 120) || "Projet importé", template: "import", snapshot: r.project });
            }}
          />
        </div>
      </form>
      <SideTitle>Mes projets</SideTitle>
      <ul className="min-h-0 flex-1 overflow-auto text-sm" data-testid="ide-liste-projets">
        {rows === null && <li className="px-3 text-xs text-[var(--ide-muted)]">Chargement…</li>}
        {rows?.length === 0 && <li className="px-3 text-xs text-[var(--ide-muted)]">Aucun projet enregistré.</li>}
        {rows?.map((p) => (
          <li key={p.id} className={cn("group px-3 py-1.5 hover:bg-[var(--ide-hover)]", p.id === current.id && "bg-[var(--ide-selection)]")}>
            <button type="button" onClick={() => onOpen(p.id)} className="block w-full truncate text-left font-medium">{p.name}</button>
            <span className="text-[11px] text-[var(--ide-muted)]">{new Date(p.updated_at).toLocaleString("fr-FR")} · rév. {p.revision}</span>
            <span className="ml-2 inline-flex gap-2 text-[11px]">
              <button type="button" className="text-[var(--ide-accent)] hover:underline" onClick={async () => { const n = window.prompt("Nouveau nom :", p.name)?.trim(); if (n) await patch(p.id, { name: n }); }}>Renommer</button>
              <button type="button" className="text-[var(--ide-accent)] hover:underline" onClick={async () => { const d = await patch(p.id, { duplicate: true }); if (d) notify(`Copie créée : ${d.name}`, "info"); }}>Dupliquer</button>
              <button type="button" className="text-red-400 hover:underline" onClick={() => void remove(p)}>Supprimer</button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onOpen(null)} className="border-t border-[var(--ide-border)] px-3 py-1.5 text-left text-xs text-[var(--ide-muted)] hover:text-[var(--ide-text)]">Ouvrir le projet local de ce navigateur</button>
    </div>
  );
}

interface VersionRow {
  id: string;
  revision: number;
  label: string | null;
  createdAt: string;
  fileCount: number;
}

function VersionsView({ project, loggedIn, onRestore, onCheckpoint, notify }: { project: IdeProject; loggedIn: boolean; onRestore: (s: ProjectSnapshot, label: string) => void; onCheckpoint: (label: string) => void; notify: (t: string, tone?: "erreur" | "info") => void }) {
  const [rows, setRows] = useState<VersionRow[] | null>(null);
  const [label, setLabel] = useState("");
  const load = useCallback(async () => {
    if (!project.id) return;
    const res = await fetch(`/api/projects/${project.id}/versions`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) setRows(data.versions);
  }, [project.id]);
  useEffect(() => {
    // Historique rechargé après chaque enregistrement (mise à jour d'état asynchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, project.revision]);

  if (!project.id || !loggedIn)
    return (
      <div className="p-3 text-sm text-[var(--ide-muted)]">
        <SideTitle>Historique des versions</SideTitle>
        <p className="px-3">L&apos;historique est disponible pour les projets enregistrés dans votre compte.</p>
      </div>
    );

  const restore = async (v: VersionRow) => {
    const res = await fetch(`/api/projects/${project.id}/versions/${v.id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Version introuvable.");
    if (!window.confirm(`Remplacer les fichiers de l'éditeur par la version du ${new Date(v.createdAt).toLocaleString("fr-FR")} (${v.fileCount} fichier(s)) ? La version actuelle reste dans l'historique après enregistrement.`)) return;
    onRestore({ files: data.version.files, folders: data.version.folders }, v.label ?? `révision ${v.revision}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SideTitle>Point de sauvegarde</SideTitle>
      <form
        className="flex gap-1.5 px-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (label.trim()) {
            onCheckpoint(label.trim());
            setLabel("");
          }
        }}
      >
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex. Version avant le formulaire" aria-label="Nom du point de sauvegarde" className="min-w-0 flex-1 rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1 text-xs" />
        <button type="submit" className="rounded bg-[var(--ide-accent)] px-2 py-1 text-xs font-semibold text-white">Créer</button>
      </form>
      <SideTitle>Historique</SideTitle>
      <ul className="min-h-0 flex-1 overflow-auto text-xs" data-testid="ide-versions">
        {rows === null && <li className="px-3 text-[var(--ide-muted)]">Chargement…</li>}
        {rows?.map((v) => (
          <li key={v.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--ide-hover)]">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{v.label ?? `Enregistrement automatique`}</span>
              <span className="text-[var(--ide-muted)]">{new Date(v.createdAt).toLocaleString("fr-FR")} · rév. {v.revision} · {v.fileCount} fichier(s)</span>
            </span>
            <button type="button" onClick={() => void restore(v)} className="shrink-0 text-[var(--ide-accent)] hover:underline">Restaurer</button>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--ide-border)] px-3 py-1.5 text-[11px] text-[var(--ide-muted)]">Une version est conservée au plus toutes les 10 minutes, plus chaque point de sauvegarde (30 au maximum).</p>
    </div>
  );
}

function SettingsView({ settings, onChange, userName }: { settings: EditorSettings; onChange: (p: Partial<EditorSettings>) => void; userName: string | null }) {
  return (
    <div className="space-y-3 p-3 text-sm">
      <SideTitle>Paramètres de l&apos;éditeur</SideTitle>
      <label className="flex items-center justify-between gap-2">
        Thème
        <select value={settings.theme} onChange={(e) => onChange({ theme: e.target.value as EditorSettings["theme"] })} className="rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1" aria-label="Thème">
          <option value="sombre">Sombre</option>
          <option value="clair">Clair</option>
        </select>
      </label>
      <label className="flex items-center justify-between gap-2">
        Taille du texte
        <input type="number" min={10} max={26} value={settings.fontSize} onChange={(e) => onChange({ fontSize: Math.min(26, Math.max(10, Number(e.target.value) || 14)) })} className="w-20 rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1" aria-label="Taille du texte" />
      </label>
      <label className="flex items-center justify-between gap-2">
        Indentation (espaces)
        <select value={settings.tabSize} onChange={(e) => onChange({ tabSize: Number(e.target.value) })} className="rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1" aria-label="Indentation">
          {[2, 4].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      {(
        [
          ["wordWrap", "Retour à la ligne automatique"],
          ["minimap", "Minicarte"],
          ["autosave", "Enregistrement automatique"],
        ] as Array<[keyof EditorSettings, string]>
      ).map(([k, label]) => (
        <label key={k} className="flex items-center justify-between gap-2">
          {label}
          <input type="checkbox" checked={Boolean(settings[k])} onChange={(e) => onChange({ [k]: e.target.checked })} />
        </label>
      ))}
      <p className="text-xs text-[var(--ide-muted)]">Préférences enregistrées sur cet appareil{userName ? ` · connecté : ${userName}` : ""}.</p>
    </div>
  );
}
