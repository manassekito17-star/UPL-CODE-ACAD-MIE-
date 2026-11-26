"use client";

// Les commandes (menus, palette, raccourcis) sont des fonctions créées au rendu qui utilisent les
// éditeurs (refs) ; elles ne s'exécutent que sur un clic ou une touche, jamais pendant le rendu.
/* eslint-disable react-hooks/refs */

import Editor, { type Monaco } from "@monaco-editor/react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { configureMonaco, type MonacoEditor } from "@/components/editor/code-editor";
import { ConsoleScreen, END_OF_PROGRAM, isNarrowScreen } from "@/components/editor/console-screen";
import { FixDialog } from "@/components/editor/fix-dialog";
import { HistoryDialog } from "@/components/editor/history-dialog";
import { sqlConsoleText } from "@/components/editor/result-extras";
import { attachTouchEditMenu } from "@/components/editor/touch-edit-menu";
import { WebPreview, type PreviewConsoleLine } from "@/components/editor/web-preview";
import { runProgram } from "@/lib/execution/browser";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import { autoFixCode, type FixResult } from "@/lib/fix";
import { recordVersion } from "@/lib/history";
import { basename, buildTree, copyPath, createFile, createFolder, deletePath, dirname, languageOf, movePath, previewFiles, runFiles, searchProject, symbolsOf, updateFile, type ProjectSnapshot, type TreeNode } from "@/lib/ide/fs";
import { exportZip, importEntries } from "@/lib/ide/zip";
import { fuzzyPositions, parseGoto, rank } from "@/lib/texte/goto";
import { COLOR_SCHEMES, parseSettings, setSettingInText, type TexteSettings } from "@/lib/texte/settings";
import { readWorkspace, SETTINGS_PATH, starterWorkspace, STORE_KEY, type Layout, type Workspace } from "@/lib/texte/workspace";
import { eventCombo, toMonaco } from "./keys";
import { defineTexteThemes, MONACO_THEME, UI, type UiColors } from "./themes";

/**
 * ZENTECH Texte : éditeur de texte pour développeurs, avec l'ergonomie des éditeurs de texte classiques
 * (aller à n'importe quoi, palette de commandes, curseurs multiples, recherche en bas de l'écran,
 * construction Ctrl+B, vues fractionnées, mode sans distraction, préférences en JSON, session gardée).
 */

type MenuName = "Fichier" | "Édition" | "Sélection" | "Rechercher" | "Affichage" | "Aller" | "Outils" | "Préférences" | "Aide";
interface Cmd {
  id: string;
  label: string;
  kb?: string;
  run: () => void;
  /** Raccourci enregistré dans l'éditeur (sinon : seulement hors de l'éditeur). */
  inEditor?: boolean;
}
type Palette = { kind: "aller"; text: string } | { kind: "commandes"; text: string };
interface FindState {
  mode: "rechercher" | "remplacer" | "fichiers";
  query: string;
  replace: string;
  regex: boolean;
  matchCase: boolean;
  whole: boolean;
  where: string;
}
interface Output {
  title: string;
  text: string;
  running: boolean;
  error?: { message: string; line: number; path: string } | null;
  preview?: string;
  results?: Array<{ path: string; line: number; column: number; text: string }>;
}
interface Ask {
  title: string;
  text: string;
  buttons: Array<{ label: string; run: () => void; primary?: boolean }>;
}

const SYNTAXES: Array<[string, string]> = [
  ["plaintext", "Texte brut"],
  ["pseudocode", "Pseudocode"],
  ["python", "Python"],
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["json", "JSON"],
  ["markdown", "Markdown"],
  ["php", "PHP"],
  ["sql", "SQL"],
  ["c", "C"],
  ["java", "Java"],
  ["kplus", "K+"],
];

/** Horloge pour mesurer la durée d'une exécution (appelée seulement dans un gestionnaire d'événement). */
const clock = () => performance.now();

export function TexteStudio() {
  const [ws, setWs] = useState<Workspace>(() => starterWorkspace());
  const [loaded, setLoaded] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [find, setFind] = useState<FindState | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [outputOpen, setOutputOpen] = useState(false);
  const [distraction, setDistraction] = useState(false);
  const [menu, setMenu] = useState<MenuName | null>(null);
  const [status, setStatus] = useState({ line: 1, column: 1, selections: 1, selected: 0 });
  const [flash, setFlash] = useState<string | null>(null);
  const [transient, setTransient] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["python", "web", "algo"]));
  const [ask, setAsk] = useState<Ask | null>(null);
  const [fix, setFix] = useState<(FixResult & { path: string }) | null>(null);
  const [historyPath, setHistoryPath] = useState<string | null>(null);
  const [keysOpen, setKeysOpen] = useState(false);
  const [stdin, setStdin] = useState("");
  const [bookmarks, setBookmarks] = useState<Record<string, number[]>>({});
  const [sideMobile, setSideMobile] = useState(false);
  const [findCount, setFindCount] = useState<number | null>(null);
  /** Téléphone : écran « ← Console » plein écran pendant l'exécution. */
  const [consoleScreen, setConsoleScreen] = useState(false);
  const [menuX, setMenuX] = useState(8);
  // Petit écran (téléphone) : retour à la ligne et pas de minicarte, quelle que soit la préférence.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const closed = useRef<string[]>([]);
  const editors = useRef(new Map<number, MonacoEditor>());
  const monacoRef = useRef<Monaco | null>(null);
  const cmdRef = useRef<Map<string, Cmd>>(new Map());
  const findDecos = useRef(new Map<number, ReturnType<MonacoEditor["createDecorationsCollection"]>>());
  const markDecos = useRef(new Map<number, ReturnType<MonacoEditor["createDecorationsCollection"]>>());

  // ---------- Session (gardée sur l'appareil) ----------
  useEffect(() => {
    let saved: Workspace | null = null;
    try {
      saved = readWorkspace(localStorage.getItem(STORE_KEY));
    } catch {
      /* stockage indisponible */
    }
    // Lecture du stockage après le montage (indisponible au rendu serveur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setWs(saved);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(ws));
      } catch {
        /* stockage plein ou indisponible */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [ws, loaded]);

  const parsed = useMemo(() => parseSettings(ws.saved[SETTINGS_PATH] ?? ws.settingsText), [ws.saved, ws.settingsText]);
  const settings = parsed.settings;
  const ui: UiColors = UI[settings.color_scheme];
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });
  const group = ws.groups[ws.focused] ?? ws.groups[0];
  const activePath = group?.active ?? null;

  const contentOf = useCallback((path: string) => (path === SETTINGS_PATH ? ws.settingsText : (ws.project.files.find((f) => f.path === path)?.content ?? "")), [ws]);
  const isDirty = (path: string) => (path === SETTINGS_PATH ? ws.settingsText !== (ws.saved[SETTINGS_PATH] ?? ws.settingsText) : ws.saved[path] !== contentOf(path));
  const syntaxOf = (path: string) => (path === SETTINGS_PATH ? "json" : (ws.syntax[path] ?? languageOf(path).monaco));
  const syntaxLabel = (path: string) => SYNTAXES.find(([id]) => id === syntaxOf(path))?.[1] ?? languageOf(path).label;
  const say = useCallback((m: string) => {
    setFlash(m);
    window.setTimeout(() => setFlash((f) => (f === m ? null : f)), 3500);
  }, []);
  const focused = () => editors.current.get(ws.focused) ?? editors.current.get(0) ?? null;

  // ---------- Fichiers et onglets ----------
  const setProject = (fn: (p: ProjectSnapshot) => { ok: true; project: ProjectSnapshot } | { ok: false; error: string }, then?: (p: ProjectSnapshot) => void) => {
    const r = fn(ws.project);
    if (!r.ok) return say(r.error), false;
    setWs((w) => ({ ...w, project: r.project }));
    then?.(r.project);
    return true;
  };
  const openFile = (path: string, opts: { group?: number; preview?: boolean; line?: number; column?: number; endColumn?: number } = {}) => {
    const g = opts.group ?? ws.focused;
    setWs((w) => {
      const groups = w.groups.map((x, i) => {
        if (i !== g) return x;
        let tabs = x.tabs;
        if (opts.preview && transient && transient !== path && !isDirty(transient)) tabs = tabs.filter((t) => t !== transient);
        if (!tabs.includes(path)) tabs = [...tabs, path];
        return { tabs, active: path };
      });
      return { ...w, groups, focused: g };
    });
    setTransient(opts.preview && !ws.groups[g]?.tabs.includes(path) ? path : opts.preview ? transient : null);
    setSideMobile(false);
    if (opts.line) {
      window.setTimeout(() => {
        const ed = editors.current.get(g);
        if (!ed) return;
        const sel = { startLineNumber: opts.line!, startColumn: opts.column ?? 1, endLineNumber: opts.line!, endColumn: opts.endColumn ?? opts.column ?? 1 };
        ed.setSelection(sel);
        ed.revealLineInCenter(opts.line!);
        ed.focus();
      }, 60);
    } else window.setTimeout(() => editors.current.get(g)?.focus(), 30);
  };
  const reallyClose = (path: string, g = ws.focused) => {
    closed.current.push(path);
    setWs((w) => ({
      ...w,
      groups: w.groups.map((x, i) => {
        if (i !== g) return x;
        const idx = x.tabs.indexOf(path);
        const tabs = x.tabs.filter((t) => t !== path);
        return { tabs, active: x.active === path ? (tabs[Math.min(idx, tabs.length - 1)] ?? null) : x.active };
      }),
    }));
    if (transient === path) setTransient(null);
  };
  const closeTab = (path: string, g = ws.focused) => {
    if (!isDirty(path) || ws.groups.some((x, i) => i !== g && x.tabs.includes(path))) return reallyClose(path, g);
    setAsk({
      title: "Enregistrer les modifications ?",
      text: `« ${basename(path)} » a été modifié depuis le dernier enregistrement.`,
      buttons: [
        { label: "Enregistrer", primary: true, run: () => (save(path), reallyClose(path, g)) },
        { label: "Ne pas enregistrer", run: () => (revert(path), reallyClose(path, g)) },
        { label: "Annuler", run: () => undefined },
      ],
    });
  };
  const save = (path = activePath) => {
    if (!path) return;
    const content = contentOf(path);
    setWs((w) => ({ ...w, saved: { ...w.saved, [path]: content } }));
    if (path === SETTINGS_PATH) {
      const r = parseSettings(content);
      return say(r.error ?? (r.warnings[0] ? `Préférences appliquées. ${r.warnings[0]}` : "Préférences appliquées ✓"));
    }
    recordVersion(`texte:${path}`, content, "Enregistrement");
    setTransient((t) => (t === path ? null : t));
    say(`« ${basename(path)} » enregistré`);
  };
  const saveAll = () => {
    const all = [...new Set(ws.groups.flatMap((g) => g.tabs))].filter(isDirty);
    all.forEach((p) => save(p));
    say(all.length ? `${all.length} fichier${all.length > 1 ? "s" : ""} enregistré${all.length > 1 ? "s" : ""}` : "Rien à enregistrer");
  };
  const revert = (path = activePath) => {
    if (!path || ws.saved[path] === undefined) return;
    if (path === SETTINGS_PATH) setWs((w) => ({ ...w, settingsText: w.saved[SETTINGS_PATH] }));
    else setProject((p) => updateFile(p, path, ws.saved[path]));
  };
  const onEdit = (path: string, value: string) => {
    if (path === SETTINGS_PATH) return setWs((w) => ({ ...w, settingsText: value }));
    if (contentOf(path) === value) return;
    setTransient((t) => (t === path ? null : t));
    const r = updateFile(ws.project, path, value);
    if (r.ok) setWs((w) => ({ ...w, project: r.project }));
  };
  const newFile = (folder = activePath && activePath !== SETTINGS_PATH ? dirname(activePath) : "") => {
    const name = window.prompt("Nom du nouveau fichier (avec son extension : .py, .js, .html…)", folder ? `${folder}/` : "");
    if (!name) return;
    setProject(
      (p) => createFile(p, name.trim(), ""),
      () => {
        setWs((w) => ({ ...w, saved: { ...w.saved, [name.trim()]: "" } }));
        openFile(name.trim());
      },
    );
  };
  const newFolder = (parent = "") => {
    const name = window.prompt("Nom du nouveau dossier", parent ? `${parent}/` : "");
    if (name) setProject((p) => createFolder(p, name.trim()), () => setExpanded((e) => new Set([...e, name.trim()])));
  };
  const renamePath = (path: string) => {
    const to = window.prompt("Nouveau nom (chemin complet)", path);
    if (!to || to === path) return;
    setProject(
      (p) => movePath(p, path, to.trim()),
      () =>
        setWs((w) => ({
          ...w,
          groups: w.groups.map((g) => ({ tabs: g.tabs.map((t) => (t === path ? to.trim() : t.startsWith(`${path}/`) ? to.trim() + t.slice(path.length) : t)), active: g.active === path ? to.trim() : g.active })),
          saved: Object.fromEntries(Object.entries(w.saved).map(([k, v]) => [k === path ? to.trim() : k.startsWith(`${path}/`) ? to.trim() + k.slice(path.length) : k, v])),
        })),
    );
  };
  const removePath = (path: string) => {
    if (!window.confirm(`Supprimer « ${path} » ?`)) return;
    setProject(
      (p) => deletePath(p, path),
      () => setWs((w) => ({ ...w, groups: w.groups.map((g) => ({ tabs: g.tabs.filter((t) => t !== path && !t.startsWith(`${path}/`)), active: g.active === path || g.active?.startsWith(`${path}/`) ? (g.tabs.find((t) => t !== path && !t.startsWith(`${path}/`)) ?? null) : g.active })) })),
    );
  };
  const duplicateFile = (path: string) => setProject((p) => copyPath(p, path));
  const download = (path = activePath) => {
    if (!path) return;
    const url = URL.createObjectURL(new Blob([contentOf(path)], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: basename(path) });
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportProject = () => {
    const url = URL.createObjectURL(new Blob([exportZip(ws.project) as BlobPart], { type: "application/zip" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "zentech-texte.zip" });
    a.click();
    URL.revokeObjectURL(url);
  };
  const importFiles = () => {
    const input = Object.assign(document.createElement("input"), { type: "file", multiple: true });
    input.onchange = async () => {
      const list = [...(input.files ?? [])];
      const entries = await Promise.all(list.map(async (f) => ({ path: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
      const r = importEntries(entries);
      if (!r.ok || !r.project) return say(r.error ?? "Import impossible.");
      let p = ws.project;
      for (const f of r.project.files) {
        const c = createFile(p, f.path, f.content);
        if (c.ok) p = c.project;
      }
      setWs((w) => ({ ...w, project: p, saved: { ...w.saved, ...Object.fromEntries(r.project!.files.map((f) => [f.path, f.content])) } }));
      say(`${r.project.files.length} fichier(s) importé(s)${r.skipped.length ? `, ${r.skipped.length} ignoré(s)` : ""}`);
    };
    input.click();
  };

  // ---------- Disposition ----------
  const setLayout = (layout: Layout) =>
    setWs((w) => {
      if (layout === "1") {
        const tabs = [...new Set(w.groups.flatMap((g) => g.tabs))];
        return { ...w, layout, groups: [{ tabs, active: w.groups[w.focused]?.active ?? tabs[0] ?? null }], focused: 0 };
      }
      const groups = w.groups.length > 1 ? w.groups : [w.groups[0], { tabs: w.groups[0].active ? [w.groups[0].active] : [], active: w.groups[0].active }];
      return { ...w, layout, groups };
    });
  const focusGroup = (i: number) => {
    if (i >= ws.groups.length) return;
    setWs((w) => ({ ...w, focused: i }));
    window.setTimeout(() => editors.current.get(i)?.focus(), 20);
  };
  const moveToGroup = (i: number) => {
    if (!activePath) return;
    if (ws.groups.length < 2) setLayout("2col");
    setWs((w) => {
      const groups = w.groups.length > 1 ? [...w.groups] : [w.groups[0], { tabs: [], active: null }];
      groups[w.focused] = { tabs: groups[w.focused].tabs.filter((t) => t !== activePath), active: groups[w.focused].tabs.find((t) => t !== activePath) ?? null };
      groups[i] = { tabs: groups[i].tabs.includes(activePath) ? groups[i].tabs : [...groups[i].tabs, activePath], active: activePath };
      return { ...w, groups, layout: w.layout === "1" ? "2col" : w.layout, focused: i };
    });
  };
  const cycleTab = (dir: 1 | -1) => {
    if (!group || !group.tabs.length) return;
    const i = group.tabs.indexOf(group.active ?? "");
    openFile(group.tabs[(i + dir + group.tabs.length) % group.tabs.length]);
  };
  const setSetting = (key: keyof TexteSettings, value: unknown) =>
    setWs((w) => {
      const text = setSettingInText(w.saved[SETTINGS_PATH] ?? w.settingsText, key, value);
      return { ...w, settingsText: w.settingsText === (w.saved[SETTINGS_PATH] ?? w.settingsText) ? text : setSettingInText(w.settingsText, key, value), saved: { ...w.saved, [SETTINGS_PATH]: text } };
    });

  // ---------- Actions de l'éditeur ----------
  const act = (id: string) => {
    const ed = focused();
    if (!ed) return;
    ed.focus();
    void ed.getAction(id)?.run();
  };
  const selectedLineRange = (ed: MonacoEditor) => {
    const model = ed.getModel()!;
    const sel = ed.getSelection()!;
    if (sel.isEmpty()) return { start: 1, end: model.getLineCount() };
    return { start: sel.startLineNumber, end: sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber ? sel.endLineNumber - 1 : sel.endLineNumber };
  };
  const transformLines = (fn: (lines: string[]) => string[], label: string) => {
    const ed = focused();
    const model = ed?.getModel();
    if (!ed || !model) return;
    const { start, end } = selectedLineRange(ed);
    const lines = model.getValueInRange({ startLineNumber: start, startColumn: 1, endLineNumber: end, endColumn: model.getLineMaxColumn(end) }).split("\n");
    ed.pushUndoStop();
    ed.executeEdits(label, [{ range: { startLineNumber: start, startColumn: 1, endLineNumber: end, endColumn: model.getLineMaxColumn(end) }, text: fn(lines).join("\n") }]);
    ed.pushUndoStop();
  };
  const selectIndentation = () => {
    const ed = focused();
    const model = ed?.getModel();
    if (!ed || !model) return;
    const line = ed.getPosition()!.lineNumber;
    const indent = (n: number) => /^\s*/.exec(model.getLineContent(n))![0].length;
    const blank = (n: number) => !model.getLineContent(n).trim();
    const level = indent(line);
    let a = line;
    let b = line;
    while (a > 1 && (blank(a - 1) || indent(a - 1) >= level)) a--;
    while (b < model.getLineCount() && (blank(b + 1) || indent(b + 1) >= level)) b++;
    while (a < line && blank(a)) a++;
    while (b > line && blank(b)) b--;
    ed.setSelection({ startLineNumber: a, startColumn: 1, endLineNumber: b, endColumn: model.getLineMaxColumn(b) });
  };
  const pasteAndIndent = async () => {
    const ed = focused();
    if (!ed) return;
    try {
      const text = await navigator.clipboard.readText();
      const sels = ed.getSelections() ?? [];
      ed.pushUndoStop();
      ed.executeEdits("coller", sels.map((range) => ({ range, text })));
      const end = ed.getPosition()!;
      const start = sels[0]!;
      ed.setSelection({ startLineNumber: start.startLineNumber, startColumn: 1, endLineNumber: end.lineNumber, endColumn: end.column });
      await ed.getAction("editor.action.reindentselectedlines")?.run();
      ed.setPosition(ed.getSelection()!.getEndPosition());
    } catch {
      say("Coller : autorisez l'accès au presse-papiers, ou utilisez Ctrl+V.");
    }
  };
  const toggleBookmark = () => {
    if (!activePath) return;
    const line = focused()?.getPosition()?.lineNumber;
    if (!line) return;
    setBookmarks((b) => {
      const cur = b[activePath] ?? [];
      return { ...b, [activePath]: cur.includes(line) ? cur.filter((l) => l !== line) : [...cur, line].sort((x, y) => x - y) };
    });
  };
  const gotoBookmark = (dir: 1 | -1) => {
    const ed = focused();
    const marks = activePath ? (bookmarks[activePath] ?? []) : [];
    if (!ed || !marks.length) return say("Aucun signet dans ce fichier (Ctrl+F2 pour en poser un).");
    const line = ed.getPosition()!.lineNumber;
    const next = dir === 1 ? (marks.find((l) => l > line) ?? marks[0]) : ([...marks].reverse().find((l) => l < line) ?? marks[marks.length - 1]);
    ed.setPosition({ lineNumber: next, column: 1 });
    ed.revealLineInCenter(next);
  };

  // ---------- Recherche dans le fichier ----------
  const matches = useCallback(
    (ed: MonacoEditor, f: FindState) => {
      const model = ed.getModel();
      const monaco = monacoRef.current;
      if (!model || !monaco || !f.query) return [];
      try {
        return model.findMatches(f.query, false, f.regex, f.matchCase, f.whole ? ed.getOption(monaco.editor.EditorOption.wordSeparators) : null, true, 5000);
      } catch {
        return [];
      }
    },
    [],
  );
  const openFind = (mode: FindState["mode"]) => {
    const ed = focused();
    const sel = ed?.getSelection();
    const selected = sel && !sel.isEmpty() && sel.startLineNumber === sel.endLineNumber ? ed!.getModel()!.getValueInRange(sel) : "";
    setFind((f) => ({ mode, query: selected || f?.query || "", replace: f?.replace ?? "", regex: f?.regex ?? false, matchCase: f?.matchCase ?? false, whole: f?.whole ?? false, where: f?.where ?? "" }));
    window.setTimeout(() => (document.getElementById("zt-recherche") as HTMLInputElement | null)?.select(), 30);
  };
  const findStep = (dir: 1 | -1, f = find) => {
    const ed = focused();
    if (!ed || !f?.query) return;
    const list = matches(ed, f);
    if (!list.length) return say(`« ${f.query} » introuvable`);
    const pos = dir === 1 ? ed.getSelection()!.getEndPosition() : ed.getSelection()!.getStartPosition();
    const after = (r: (typeof list)[number]) => r.range.startLineNumber > pos.lineNumber || (r.range.startLineNumber === pos.lineNumber && r.range.startColumn >= pos.column);
    const m = dir === 1 ? (list.find(after) ?? list[0]) : ([...list].reverse().find((r) => !after(r) && !(r.range.endLineNumber === pos.lineNumber && r.range.endColumn > pos.column)) ?? list[list.length - 1]);
    ed.setSelection(m.range);
    ed.revealRangeInCenterIfOutsideViewport(m.range);
  };
  const findAll = () => {
    const ed = focused();
    if (!ed || !find?.query) return;
    const list = matches(ed, find);
    if (!list.length) return say(`« ${find.query} » introuvable`);
    const monaco = monacoRef.current!;
    ed.setSelections(list.map((m) => new monaco.Selection(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn)));
    ed.focus();
    setFind(null);
    say(`${list.length} sélections`);
  };
  const replaced = (m: { matches: string[] | null }, f: FindState) => (f.regex && m.matches ? f.replace.replace(/\$(\d)/g, (_, d: string) => m.matches![Number(d)] ?? "") : f.replace);
  const replaceNext = () => {
    const ed = focused();
    const model = ed?.getModel();
    if (!ed || !model || !find?.query) return;
    const list = matches(ed, find);
    const sel = ed.getSelection()!;
    const cur = list.find((m) => m.range.startLineNumber === sel.startLineNumber && m.range.startColumn === sel.startColumn && m.range.endLineNumber === sel.endLineNumber && m.range.endColumn === sel.endColumn);
    if (cur) ed.executeEdits("remplacer", [{ range: cur.range, text: replaced(cur, find) }]);
    findStep(1);
  };
  const replaceAll = () => {
    const ed = focused();
    if (!ed || !find?.query) return;
    const list = matches(ed, find);
    if (!list.length) return say(`« ${find.query} » introuvable`);
    ed.pushUndoStop();
    ed.executeEdits("tout-remplacer", list.map((m) => ({ range: m.range, text: replaced(m, find) })));
    ed.pushUndoStop();
    say(`${list.length} remplacement${list.length > 1 ? "s" : ""}`);
  };
  const useSelectionForFind = () => {
    const ed = focused();
    const sel = ed?.getSelection();
    if (!ed || !sel) return;
    const word = sel.isEmpty() ? ed.getModel()?.getWordAtPosition(sel.getStartPosition())?.word : ed.getModel()?.getValueInRange(sel);
    if (word) setFind((f) => ({ mode: f?.mode ?? "rechercher", query: word, replace: f?.replace ?? "", regex: false, matchCase: f?.matchCase ?? false, whole: f?.whole ?? false, where: f?.where ?? "" }));
  };
  // Correspondances soulignées tant que la recherche est ouverte.
  useEffect(() => {
    const monaco = monacoRef.current;
    for (const [i, ed] of editors.current) {
      let deco = findDecos.current.get(i);
      if (!deco) findDecos.current.set(i, (deco = ed.createDecorationsCollection()));
      if (!find || find.mode === "fichiers" || !find.query || !monaco) {
        deco.clear();
        continue;
      }
      if (i === ws.focused) setFindCount(matches(ed, find).length);
      deco.set(matches(ed, find).map((m) => ({ range: m.range, options: { className: "zt-trouve", overviewRuler: { color: "#f9ae58", position: monaco.editor.OverviewRulerLane.Center } } })));
    }
  }, [find, matches, ws]);
  // Signets (marque dans la marge).
  useEffect(() => {
    for (const [i, ed] of editors.current) {
      let deco = markDecos.current.get(i);
      if (!deco) markDecos.current.set(i, (deco = ed.createDecorationsCollection()));
      const path = ws.groups[i]?.active;
      deco.set((path ? (bookmarks[path] ?? []) : []).map((l) => ({ range: { startLineNumber: l, startColumn: 1, endLineNumber: l, endColumn: 1 }, options: { isWholeLine: true, glyphMarginClassName: "zt-signet" } })));
    }
  }, [bookmarks, ws.groups]);

  // ---------- Recherche dans les fichiers ----------
  const findInFiles = () => {
    if (!find?.query) return;
    let results = searchProject(ws.project, find.query, { caseSensitive: find.matchCase }, 500);
    if (find.regex) {
      try {
        const re = new RegExp(find.query, find.matchCase ? "" : "i");
        results = ws.project.files.flatMap((f) => f.content.split("\n").flatMap((l, i) => (re.test(l) ? [{ path: f.path, line: i + 1, column: (l.search(re) ?? 0) + 1, text: l.trim().slice(0, 160) }] : []))).slice(0, 500);
      } catch {
        return say("Expression régulière invalide.");
      }
    }
    if (find.whole) results = results.filter((r) => new RegExp(`(^|\\W)${find.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, find.matchCase ? "" : "i").test(r.text));
    if (find.where.trim()) results = results.filter((r) => r.path.toLowerCase().includes(find.where.trim().toLowerCase()));
    const files = new Set(results.map((r) => r.path)).size;
    setOutput({ title: "Résultats de la recherche", text: `Recherche de « ${find.query} » : ${results.length} correspondance${results.length > 1 ? "s" : ""} dans ${files} fichier${files > 1 ? "s" : ""}.`, running: false, results });
    setOutputOpen(true);
  };
  const replaceInFiles = () => {
    if (!find?.query) return;
    let re: RegExp;
    try {
      re = new RegExp(find.regex ? find.query : find.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), find.matchCase ? "g" : "gi");
    } catch {
      return say("Expression régulière invalide.");
    }
    const targets = ws.project.files.filter((f) => (!find.where.trim() || f.path.toLowerCase().includes(find.where.trim().toLowerCase())) && re.test(f.content));
    if (!targets.length) return say("Aucune correspondance.");
    if (!window.confirm(`Remplacer dans ${targets.length} fichier(s) ?`)) return;
    let p = ws.project;
    for (const f of targets) {
      re.lastIndex = 0;
      const r = updateFile(p, f.path, f.content.replace(re, find.replace));
      if (r.ok) p = r.project;
    }
    setWs((w) => ({ ...w, project: p }));
    say(`Remplacé dans ${targets.length} fichier(s)`);
  };

  // ---------- Construction (Ctrl+B) ----------
  const build = async () => {
    const path = activePath;
    if (!path || path === SETTINGS_PATH) return say("Ouvrez un fichier de code pour l'exécuter.");
    recordVersion(`texte:${path}`, contentOf(path), "Exécution");
    setOutputOpen(true);
    if (languageOf(path).preview) {
      setOutput({ title: `Aperçu — ${basename(path)}`, text: "", running: false, preview: buildPreviewDocument(previewFiles(ws.project, path)) });
      return;
    }
    const rf = runFiles(ws.project, path);
    if (!rf) {
      setOutput({ title: "Sortie", text: `Aucun système de construction pour « ${basename(path)} » (${languageOf(path).label}).\nFichiers exécutables : .py, .js, .algo, .php, .sql, .c, .java, .kplus — et .html pour l'aperçu.`, running: false });
      return;
    }
    setOutput({ title: `Sortie — ${basename(path)}`, text: "", running: true });
    if (isNarrowScreen()) setConsoleScreen(true);
    const t0 = clock();
    const r = await runProgram(rf.language, rf.files, stdin);
    const secs = ((clock() - t0) / 1000).toFixed(2);
    const res = r.result;
    if (!res) {
      setOutput({ title: `Sortie — ${basename(path)}`, text: `${r.error ?? "Exécution impossible."}\n${END_OF_PROGRAM}`, running: false });
      return;
    }
    const body = [res.compileOutput, sqlConsoleText(res), res.stderr].filter(Boolean).join(res.stdout.endsWith("\n") ? "" : "\n");
    const failed = res.status !== "ok";
    const message = [res.compileOutput, res.stderr].filter(Boolean).join("\n");
    setOutput({
      title: `Sortie — ${basename(path)} · ${secs} s${failed ? " · erreur" : ""}`,
      text: `${body}${body && !body.endsWith("\n") ? "\n" : ""}${res.hint ? `💡 ${res.hint}\n` : ""}\n${END_OF_PROGRAM}`,
      running: false,
      error: failed ? { message, line: res.errorLine ?? 0, path } : null,
    });
  };
  const openCorrection = () => {
    const path = activePath;
    if (!path || path === SETTINGS_PATH) return;
    const err = output?.error?.path === path ? output.error : undefined;
    const r = autoFixCode(languageOf(path).run ?? syntaxOf(path), contentOf(path), err ? { message: err.message, line: err.line } : undefined);
    if (!r) return say("Aucune erreur que l'éditeur sait corriger n'a été trouvée.");
    setFix({ ...r, path });
  };

  // ---------- Commandes (menus, palette, raccourcis) ----------
  const toggleFullScreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void document.documentElement.requestFullscreen?.().catch(() => say("Plein écran indisponible sur cet appareil."));
  };
  const commands: Cmd[] = [
    // Fichier
    { id: "fichier.nouveau", label: "Nouveau fichier", kb: "Ctrl+N", run: () => newFile() },
    { id: "fichier.dossier", label: "Nouveau dossier…", run: () => newFolder() },
    { id: "fichier.importer", label: "Ouvrir des fichiers de l'appareil…", kb: "Ctrl+O", run: importFiles },
    { id: "fichier.enregistrer", label: "Enregistrer", kb: "Ctrl+S", run: () => save(), inEditor: true },
    { id: "fichier.enregistrer-sous", label: "Enregistrer sous… (renommer)", kb: "Ctrl+Maj+S", run: () => activePath && activePath !== SETTINGS_PATH && renamePath(activePath), inEditor: true },
    { id: "fichier.tout", label: "Tout enregistrer", kb: "Ctrl+Alt+S", run: saveAll, inEditor: true },
    { id: "fichier.revenir", label: "Revenir à la version enregistrée", run: () => revert() },
    { id: "fichier.dupliquer", label: "Dupliquer le fichier", run: () => activePath && activePath !== SETTINGS_PATH && duplicateFile(activePath) },
    { id: "fichier.supprimer", label: "Supprimer le fichier", run: () => activePath && activePath !== SETTINGS_PATH && removePath(activePath) },
    { id: "fichier.telecharger", label: "Télécharger le fichier", run: () => download() },
    { id: "fichier.zip", label: "Exporter tous les fichiers (ZIP)", run: exportProject },
    { id: "fichier.historique", label: "Historique du fichier…", run: () => activePath && activePath !== SETTINGS_PATH && setHistoryPath(activePath) },
    { id: "fichier.fermer", label: "Fermer le fichier", kb: "Ctrl+W", run: () => activePath && closeTab(activePath), inEditor: true },
    { id: "fichier.rouvrir", label: "Rouvrir le fichier fermé", kb: "Ctrl+Maj+T", run: () => { const p = closed.current.pop(); if (p && (p === SETTINGS_PATH || ws.project.files.some((f) => f.path === p))) openFile(p); }, inEditor: true },
    { id: "fichier.fermer-tout", label: "Fermer tous les fichiers", run: () => setWs((w) => ({ ...w, groups: w.groups.map(() => ({ tabs: [], active: null })) })) },
    // Édition
    { id: "edition.annuler", label: "Annuler", kb: "Ctrl+Z", run: () => act("undo") },
    { id: "edition.retablir", label: "Rétablir", kb: "Ctrl+Y", run: () => act("redo") },
    { id: "edition.coller-indenter", label: "Coller et indenter", kb: "Ctrl+Maj+V", run: () => void pasteAndIndent(), inEditor: true },
    { id: "ligne.indenter", label: "Ligne : indenter", kb: "Ctrl+]", run: () => act("editor.action.indentLines"), inEditor: true },
    { id: "ligne.desindenter", label: "Ligne : désindenter", kb: "Ctrl+[", run: () => act("editor.action.outdentLines"), inEditor: true },
    { id: "ligne.monter", label: "Ligne : monter", kb: "Ctrl+Maj+Haut", run: () => act("editor.action.moveLinesUpAction"), inEditor: true },
    { id: "ligne.descendre", label: "Ligne : descendre", kb: "Ctrl+Maj+Bas", run: () => act("editor.action.moveLinesDownAction"), inEditor: true },
    { id: "ligne.dupliquer", label: "Ligne : dupliquer", kb: "Ctrl+Maj+D", run: () => act("editor.action.copyLinesDownAction"), inEditor: true },
    { id: "ligne.supprimer", label: "Ligne : supprimer", kb: "Ctrl+Maj+K", run: () => act("editor.action.deleteLines"), inEditor: true },
    { id: "ligne.joindre", label: "Ligne : joindre les lignes", kb: "Ctrl+J", run: () => act("editor.action.joinLines"), inEditor: true },
    { id: "ligne.apres", label: "Ligne : insérer une ligne après", kb: "Ctrl+Entrée", run: () => act("editor.action.insertLineAfter"), inEditor: true },
    { id: "ligne.avant", label: "Ligne : insérer une ligne avant", kb: "Ctrl+Maj+Entrée", run: () => act("editor.action.insertLineBefore"), inEditor: true },
    { id: "commentaire.ligne", label: "Commentaire : ligne", kb: "Ctrl+/", run: () => act("editor.action.commentLine"), inEditor: true },
    { id: "commentaire.bloc", label: "Commentaire : bloc", kb: "Ctrl+Maj+/", run: () => act("editor.action.blockComment"), inEditor: true },
    { id: "texte.fin", label: "Texte : effacer jusqu'à la fin de la ligne", kb: "Ctrl+K Ctrl+K", run: () => act("deleteAllRight"), inEditor: true },
    { id: "texte.debut", label: "Texte : effacer jusqu'au début de la ligne", kb: "Ctrl+K Ctrl+Retour arrière", run: () => act("deleteAllLeft"), inEditor: true },
    { id: "texte.transposer", label: "Texte : transposer", kb: "Ctrl+T", run: () => act("editor.action.transposeLetters"), inEditor: true },
    { id: "casse.majuscules", label: "Convertir la casse : majuscules", kb: "Ctrl+K Ctrl+U", run: () => act("editor.action.transformToUppercase"), inEditor: true },
    { id: "casse.minuscules", label: "Convertir la casse : minuscules", kb: "Ctrl+K Ctrl+L", run: () => act("editor.action.transformToLowercase"), inEditor: true },
    { id: "casse.titre", label: "Convertir la casse : Première Lettre En Majuscule", run: () => act("editor.action.transformToTitlecase") },
    { id: "casse.serpent", label: "Convertir la casse : snake_case", run: () => act("editor.action.transformToSnakecase") },
    { id: "trier.lignes", label: "Trier les lignes", kb: "F9", run: () => transformLines((l) => [...l].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })), "trier"), inEditor: true },
    { id: "trier.casse", label: "Trier les lignes (respecter la casse)", kb: "Ctrl+F9", run: () => transformLines((l) => [...l].sort(), "trier"), inEditor: true },
    { id: "lignes.inverser", label: "Inverser l'ordre des lignes", run: () => transformLines((l) => [...l].reverse(), "inverser") },
    { id: "lignes.uniques", label: "Garder les lignes uniques", run: () => transformLines((l) => [...new Set(l)], "uniques") },
    { id: "lignes.espaces", label: "Supprimer les espaces en fin de ligne", run: () => transformLines((l) => l.map((x) => x.replace(/\s+$/, "")), "espaces") },
    { id: "pli.plier", label: "Code : plier", kb: "Ctrl+Maj+[", run: () => act("editor.fold"), inEditor: true },
    { id: "pli.deplier", label: "Code : déplier", kb: "Ctrl+Maj+]", run: () => act("editor.unfold"), inEditor: true },
    { id: "pli.tout", label: "Code : tout plier", kb: "Ctrl+K Ctrl+1", run: () => act("editor.foldAll"), inEditor: true },
    { id: "pli.rien", label: "Code : tout déplier", kb: "Ctrl+K Ctrl+J", run: () => act("editor.unfoldAll"), inEditor: true },
    { id: "edition.formater", label: "Mettre en forme le document", kb: "Maj+Alt+F", run: () => act("editor.action.formatDocument"), inEditor: true },
    // Sélection
    { id: "selection.lignes", label: "Séparer la sélection en lignes (un curseur par ligne)", kb: "Ctrl+Maj+L", run: () => act("editor.action.insertCursorAtEndOfEachLineSelected"), inEditor: true },
    { id: "selection.haut", label: "Ajouter un curseur sur la ligne précédente", kb: "Ctrl+Alt+Haut", run: () => act("editor.action.insertCursorAbove"), inEditor: true },
    { id: "selection.bas", label: "Ajouter un curseur sur la ligne suivante", kb: "Ctrl+Alt+Bas", run: () => act("editor.action.insertCursorBelow"), inEditor: true },
    { id: "selection.tout", label: "Tout sélectionner", kb: "Ctrl+A", run: () => act("editor.action.selectAll") },
    { id: "selection.ligne", label: "Étendre la sélection à la ligne", kb: "Ctrl+L", run: () => act("expandLineSelection"), inEditor: true },
    { id: "selection.mot", label: "Sélectionner le mot (puis l'occurrence suivante)", kb: "Ctrl+D", run: () => act("editor.action.addSelectionToNextFindMatch"), inEditor: true },
    { id: "selection.passer", label: "Passer cette occurrence", kb: "Ctrl+K Ctrl+D", run: () => act("editor.action.moveSelectionToNextFindMatch"), inEditor: true },
    { id: "selection.portee", label: "Étendre la sélection (portée)", kb: "Ctrl+Maj+Espace", run: () => act("editor.action.smartSelect.expand"), inEditor: true },
    { id: "selection.reduire", label: "Réduire la sélection", kb: "Ctrl+Maj+Alt+Espace", run: () => act("editor.action.smartSelect.shrink"), inEditor: true },
    { id: "selection.crochets", label: "Étendre la sélection aux crochets", kb: "Ctrl+Maj+M", run: () => act("editor.action.selectToBracket"), inEditor: true },
    { id: "selection.indentation", label: "Étendre la sélection à l'indentation", kb: "Ctrl+Maj+J", run: selectIndentation, inEditor: true },
    { id: "selection.balise", label: "Étendre la sélection à la balise", kb: "Ctrl+Maj+A", run: () => act("editor.emmet.action.balanceOut") },
    // Rechercher
    { id: "rechercher.ouvrir", label: "Rechercher…", kb: "Ctrl+F", run: () => openFind("rechercher"), inEditor: true },
    { id: "rechercher.suivant", label: "Rechercher le suivant", kb: "F3", run: () => findStep(1), inEditor: true },
    { id: "rechercher.precedent", label: "Rechercher le précédent", kb: "Maj+F3", run: () => findStep(-1), inEditor: true },
    { id: "rechercher.incremental", label: "Recherche incrémentale", kb: "Ctrl+I", run: () => openFind("rechercher"), inEditor: true },
    { id: "rechercher.remplacer", label: "Remplacer…", kb: "Ctrl+H", run: () => openFind("remplacer"), inEditor: true },
    { id: "rechercher.remplacer-suivant", label: "Remplacer le suivant", kb: "Ctrl+Maj+H", run: replaceNext, inEditor: true },
    { id: "rechercher.rapide", label: "Recherche rapide (mot suivant)", kb: "Ctrl+F3", run: () => act("editor.action.nextSelectionMatchFindAction"), inEditor: true },
    { id: "rechercher.rapide-tout", label: "Recherche rapide : tout sélectionner", kb: "Alt+F3", run: () => act("editor.action.selectHighlights"), inEditor: true },
    { id: "rechercher.selection", label: "Utiliser la sélection pour rechercher", kb: "Ctrl+E", run: useSelectionForFind, inEditor: true },
    { id: "rechercher.fichiers", label: "Rechercher dans les fichiers…", kb: "Ctrl+Maj+F", run: () => openFind("fichiers"), inEditor: true },
    // Affichage
    { id: "affichage.barre", label: "Afficher / masquer la barre latérale", kb: "Ctrl+K Ctrl+B", run: () => setWs((w) => ({ ...w, sidebar: !w.sidebar })), inEditor: true },
    { id: "affichage.minimap", label: "Afficher / masquer la minicarte", run: () => setSetting("minimap", !settings.minimap) },
    { id: "affichage.console", label: "Afficher / masquer la console", kb: "Ctrl+`", run: () => setOutputOpen((o) => !o), inEditor: true },
    { id: "affichage.plein", label: "Plein écran", kb: "F11", run: toggleFullScreen, inEditor: true },
    { id: "affichage.zen", label: "Mode sans distraction", kb: "Maj+F11", run: () => setDistraction((d) => !d), inEditor: true },
    { id: "affichage.1", label: "Disposition : une seule vue", kb: "Alt+Maj+1", run: () => setLayout("1"), inEditor: true },
    { id: "affichage.2col", label: "Disposition : deux colonnes", kb: "Alt+Maj+2", run: () => setLayout("2col"), inEditor: true },
    { id: "affichage.2lig", label: "Disposition : deux lignes", kb: "Alt+Maj+8", run: () => setLayout("2lig"), inEditor: true },
    { id: "affichage.groupe1", label: "Aller au groupe 1", kb: "Ctrl+1", run: () => focusGroup(0), inEditor: true },
    { id: "affichage.groupe2", label: "Aller au groupe 2", kb: "Ctrl+2", run: () => focusGroup(1), inEditor: true },
    { id: "affichage.vers1", label: "Déplacer le fichier dans le groupe 1", kb: "Ctrl+Maj+1", run: () => moveToGroup(0), inEditor: true },
    { id: "affichage.vers2", label: "Déplacer le fichier dans le groupe 2", kb: "Ctrl+Maj+2", run: () => moveToGroup(1), inEditor: true },
    { id: "affichage.retour", label: "Retour à la ligne automatique", run: () => setSetting("word_wrap", !settings.word_wrap) },
    { id: "affichage.plus", label: "Agrandir le texte", kb: "Ctrl+=", run: () => setSetting("font_size", Math.min(40, settings.font_size + 1)), inEditor: true },
    { id: "affichage.moins", label: "Réduire le texte", kb: "Ctrl+-", run: () => setSetting("font_size", Math.max(8, settings.font_size - 1)), inEditor: true },
    { id: "indentation.espaces", label: "Indentation : convertir en espaces", run: () => act("editor.action.indentationToSpaces") },
    { id: "indentation.tabs", label: "Indentation : convertir en tabulations", run: () => act("editor.action.indentationToTabs") },
    ...[2, 4, 8].map((n) => ({ id: `indentation.${n}`, label: `Indentation : largeur ${n}`, run: () => setSetting("tab_size", n) })),
    ...SYNTAXES.map(([id, label]) => ({ id: `syntaxe.${id}`, label: `Syntaxe : ${label}`, run: () => activePath && activePath !== SETTINGS_PATH && setWs((w) => ({ ...w, syntax: { ...w.syntax, [activePath]: id } })) })),
    // Aller
    { id: "aller.tout", label: "Aller à n'importe quoi…", kb: "Ctrl+P", run: () => setPalette({ kind: "aller", text: "" }), inEditor: true },
    { id: "aller.symbole", label: "Aller au symbole…", kb: "Ctrl+R", run: () => setPalette({ kind: "aller", text: "@" }), inEditor: true },
    { id: "aller.ligne", label: "Aller à la ligne…", kb: "Ctrl+G", run: () => setPalette({ kind: "aller", text: ":" }), inEditor: true },
    { id: "aller.mot", label: "Aller au mot…", kb: "Ctrl+;", run: () => setPalette({ kind: "aller", text: "#" }), inEditor: true },
    { id: "aller.definition", label: "Aller à la définition", kb: "F12", run: () => act("editor.action.revealDefinition") },
    { id: "aller.reference", label: "Aller aux références", kb: "Maj+F12", run: () => act("editor.action.goToReferences") },
    { id: "aller.crochet", label: "Aller au crochet correspondant", kb: "Ctrl+M", run: () => act("editor.action.jumpToBracket"), inEditor: true },
    { id: "aller.retour", label: "Revenir à la position précédente", kb: "Alt+-", run: () => act("cursorUndo"), inEditor: true },
    { id: "aller.avant", label: "Aller à la position suivante", kb: "Alt+Maj+-", run: () => act("cursorRedo"), inEditor: true },
    { id: "aller.onglet-suivant", label: "Onglet suivant", kb: "Ctrl+PgSuiv", run: () => cycleTab(1), inEditor: true },
    { id: "aller.onglet-precedent", label: "Onglet précédent", kb: "Ctrl+PgPréc", run: () => cycleTab(-1), inEditor: true },
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ id: `aller.onglet${n}`, label: `Aller à l'onglet ${n}`, kb: `Alt+${n}`, run: () => group?.tabs[n - 1] && openFile(group.tabs[n - 1]), inEditor: true })),
    { id: "signet.basculer", label: "Signet : poser / retirer", kb: "Ctrl+F2", run: toggleBookmark, inEditor: true },
    { id: "signet.suivant", label: "Signet : suivant", kb: "F2", run: () => gotoBookmark(1), inEditor: true },
    { id: "signet.precedent", label: "Signet : précédent", kb: "Maj+F2", run: () => gotoBookmark(-1), inEditor: true },
    { id: "signet.effacer", label: "Signet : tout effacer", kb: "Ctrl+Maj+F2", run: () => activePath && setBookmarks((b) => ({ ...b, [activePath]: [] })), inEditor: true },
    // Outils
    { id: "outils.palette", label: "Palette de commandes…", kb: "Ctrl+Maj+P", run: () => setPalette({ kind: "commandes", text: "" }), inEditor: true },
    { id: "outils.construire", label: "Construire (exécuter le fichier)", kb: "Ctrl+B", run: () => void build(), inEditor: true },
    { id: "outils.construire-f7", label: "Construire (F7)", kb: "F7", run: () => void build(), inEditor: true },
    { id: "outils.corriger", label: "Corriger le code…", run: openCorrection },
    // Préférences
    { id: "preferences.reglages", label: "Préférences : réglages", kb: "Ctrl+,", run: () => openFile(SETTINGS_PATH), inEditor: true },
    ...COLOR_SCHEMES.map((c) => ({ id: `theme.${c}`, label: `Préférences : thème ${c}`, run: () => setSetting("color_scheme", c) })),
    { id: "preferences.raccourcis", label: "Préférences : raccourcis clavier", run: () => setKeysOpen(true) },
    // Aide
    { id: "aide.raccourcis", label: "Aide : liste des raccourcis", kb: "Ctrl+K Ctrl+S", run: () => setKeysOpen(true), inEditor: true },
    { id: "aide.lisezmoi", label: "Aide : premiers pas", run: () => (ws.project.files.some((f) => f.path === "LISEZMOI.md") ? openFile("LISEZMOI.md") : setKeysOpen(true)) },
  ];
  const byId = new Map(commands.map((c) => [c.id, c]));
  useEffect(() => {
    cmdRef.current = byId;
  });

  const MENUS: Record<MenuName, Array<string | "-">> = {
    Fichier: ["fichier.nouveau", "fichier.dossier", "fichier.importer", "-", "fichier.enregistrer", "fichier.enregistrer-sous", "fichier.tout", "fichier.revenir", "-", "fichier.dupliquer", "fichier.supprimer", "fichier.telecharger", "fichier.zip", "fichier.historique", "-", "fichier.fermer", "fichier.rouvrir", "fichier.fermer-tout"],
    Édition: ["edition.annuler", "edition.retablir", "edition.coller-indenter", "-", "ligne.indenter", "ligne.desindenter", "ligne.monter", "ligne.descendre", "ligne.dupliquer", "ligne.supprimer", "ligne.joindre", "ligne.apres", "ligne.avant", "-", "commentaire.ligne", "commentaire.bloc", "-", "texte.fin", "texte.debut", "texte.transposer", "-", "casse.majuscules", "casse.minuscules", "casse.titre", "casse.serpent", "-", "trier.lignes", "trier.casse", "lignes.inverser", "lignes.uniques", "lignes.espaces", "-", "pli.plier", "pli.deplier", "pli.tout", "pli.rien", "edition.formater"],
    Sélection: ["selection.lignes", "selection.haut", "selection.bas", "-", "selection.tout", "selection.ligne", "selection.mot", "selection.passer", "-", "selection.portee", "selection.reduire", "selection.crochets", "selection.indentation", "selection.balise"],
    Rechercher: ["rechercher.ouvrir", "rechercher.suivant", "rechercher.precedent", "rechercher.incremental", "-", "rechercher.remplacer", "rechercher.remplacer-suivant", "-", "rechercher.rapide", "rechercher.rapide-tout", "selection.mot", "rechercher.selection", "-", "rechercher.fichiers"],
    Affichage: ["affichage.barre", "affichage.minimap", "affichage.console", "-", "affichage.plein", "affichage.zen", "-", "affichage.1", "affichage.2col", "affichage.2lig", "affichage.groupe1", "affichage.groupe2", "affichage.vers1", "affichage.vers2", "-", "affichage.retour", "affichage.plus", "affichage.moins", "-", "indentation.2", "indentation.4", "indentation.8", "indentation.espaces", "indentation.tabs", "-", ...SYNTAXES.map(([id]) => `syntaxe.${id}`)],
    Aller: ["aller.tout", "aller.symbole", "aller.ligne", "aller.mot", "-", "aller.definition", "aller.reference", "aller.crochet", "-", "aller.retour", "aller.avant", "-", "aller.onglet-suivant", "aller.onglet-precedent", "-", "signet.basculer", "signet.suivant", "signet.precedent", "signet.effacer"],
    Outils: ["outils.palette", "-", "outils.construire", "outils.corriger", "-", "fichier.historique"],
    Préférences: ["preferences.reglages", "-", ...COLOR_SCHEMES.map((c) => `theme.${c}`), "-", "preferences.raccourcis", "affichage.plus", "affichage.moins"],
    Aide: ["aide.lisezmoi", "aide.raccourcis"],
  };
  const runCmd = (id: string) => {
    setMenu(null);
    cmdRef.current.get(id)?.run();
  };

  // Raccourcis quand le curseur n'est pas dans l'éditeur (barre latérale, page vide…).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".monaco-editor")) return;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA") && !e.ctrlKey && !e.metaKey && !/^F\d/.test(e.key)) return;
      if (e.key === "Escape") {
        setPalette(null);
        setMenu(null);
        return;
      }
      const combo = eventCombo(e);
      const cmd = [...cmdRef.current.values()].find((c) => c.kb === combo);
      if (!cmd || (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA") && ["Ctrl+A", "Ctrl+Z", "Ctrl+Y"].includes(combo))) return;
      e.preventDefault();
      cmd.run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------- Éditeurs ----------
  const editorOptions = (path: string | null) => ({
    fontSize: settings.font_size,
    fontFamily: "var(--font-jetbrains), monospace",
    tabSize: settings.tab_size,
    insertSpaces: settings.translate_tabs_to_spaces,
    detectIndentation: false,
    wordWrap: settings.word_wrap || narrow ? ("on" as const) : ("off" as const),
    renderWhitespace: (settings.draw_white_space === "none" ? "none" : settings.draw_white_space) as "none" | "selection" | "all",
    rulers: settings.rulers,
    renderLineHighlight: settings.highlight_line ? ("line" as const) : ("none" as const),
    lineNumbers: settings.line_numbers ? ("on" as const) : ("off" as const),
    minimap: { enabled: settings.minimap && !distraction && !narrow, renderCharacters: true, showSlider: "always" as const, scale: 1 },
    quickSuggestions: settings.auto_complete,
    suggestOnTriggerCharacters: settings.auto_complete,
    autoClosingBrackets: settings.auto_close_brackets ? ("languageDefined" as const) : ("never" as const),
    autoClosingQuotes: settings.auto_close_brackets ? ("languageDefined" as const) : ("never" as const),
    scrollBeyondLastLine: settings.scroll_past_end,
    cursorBlinking: settings.caret_style,
    cursorSmoothCaretAnimation: settings.caret_style === "smooth" ? ("on" as const) : ("off" as const),
    showFoldingControls: settings.fold_buttons ? ("mouseover" as const) : ("never" as const),
    glyphMargin: !distraction,
    multiCursorModifier: "ctrlCmd" as const,
    occurrencesHighlight: "singleFile" as const,
    selectionHighlight: true,
    matchBrackets: "always" as const,
    bracketPairColorization: { enabled: false },
    guides: { indentation: true },
    smoothScrolling: true,
    mouseWheelZoom: true,
    automaticLayout: true,
    editContext: false,
    readOnly: !path,
    padding: { top: 6 },
    stickyScroll: { enabled: false },
  });
  const beforeMount = (monaco: Monaco) => {
    configureMonaco(monaco);
    defineTexteThemes(monaco);
    const json = (monaco.languages as unknown as { json?: { jsonDefaults?: { setDiagnosticsOptions(o: Record<string, unknown>): void } } }).json;
    json?.jsonDefaults?.setDiagnosticsOptions({ validate: true, allowComments: true, trailingCommas: "ignore" });
  };
  const onMount = (i: number) => (ed: MonacoEditor, monaco: Monaco) => {
    monacoRef.current = monaco;
    editors.current.set(i, ed);
    for (const c of cmdRef.current.values()) {
      if (!c.inEditor || !c.kb) continue;
      const key = toMonaco(monaco, c.kb);
      if (key !== null) ed.addCommand(key, () => cmdRef.current.get(c.id)?.run());
    }
    ed.onDidFocusEditorText(() => setWs((w) => (w.focused === i ? w : { ...w, focused: i })));
    const update = () => {
      const sels = ed.getSelections() ?? [];
      const pos = ed.getPosition();
      const model = ed.getModel();
      setStatus({ line: pos?.lineNumber ?? 1, column: pos?.column ?? 1, selections: sels.length, selected: model ? sels.reduce((n, s) => n + model.getValueLengthInRange(s), 0) : 0 });
    };
    ed.onDidChangeCursorSelection(update);
    // « save_on_focus_lost » : enregistrement en quittant l'éditeur.
    ed.onDidBlurEditorText(() => {
      if (settingsRef.current.save_on_focus_lost) cmdRef.current.get("fichier.tout")?.run();
    });
    attachTouchEditMenu(ed);
  };

  // ---------- Rendu ----------
  const tree = useMemo(() => buildTree(ws.project), [ws.project]);
  const openTabs = [...new Set(ws.groups.flatMap((g) => g.tabs))];
  const label = (p: string) => (p === SETTINGS_PATH ? "Préférences.json" : basename(p));

  const sidebar = (
    <aside className="flex h-full w-full flex-col overflow-hidden text-[13px]" style={{ background: ui.side, color: ui.text, borderRight: `1px solid ${ui.border}` }} data-testid="zt-barre-laterale">
      <div className="min-h-0 flex-1 overflow-auto py-2">
        <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider" style={{ color: ui.muted }}>
          FICHIERS OUVERTS
        </p>
        {openTabs.map((p) => (
          <button key={p} type="button" onClick={() => openFile(p)} className="flex w-full items-center gap-2 px-3 py-[3px] text-left" style={{ background: p === activePath ? ui.select : undefined }}>
            <span className="w-3 shrink-0 text-center" style={{ color: ui.muted }}>{isDirty(p) ? "●" : ""}</span>
            <span className="truncate">{label(p)}</span>
          </button>
        ))}
        <div className="mt-3 flex items-center px-3 pb-1 text-[11px] font-semibold tracking-wider" style={{ color: ui.muted }}>
          <span className="flex-1">DOSSIERS</span>
          <button type="button" title="Nouveau fichier" aria-label="Nouveau fichier" onClick={() => newFile("")} className="px-1 hover:opacity-80">
            +
          </button>
          <button type="button" title="Nouveau dossier" aria-label="Nouveau dossier" onClick={() => newFolder("")} className="px-1 hover:opacity-80">
            ▣
          </button>
        </div>
        <TreeView nodes={tree} depth={0} ui={ui} active={activePath} expanded={expanded} transient={transient} onToggle={(p) => setExpanded((e) => { const n = new Set(e); if (n.has(p)) n.delete(p); else n.add(p); return n; })} onOpen={(p, preview) => openFile(p, { preview })} onNewFile={newFile} onNewFolder={newFolder} onRename={renamePath} onDelete={removePath} />
      </div>
    </aside>
  );

  const groupView = (g: { tabs: string[]; active: string | null }, i: number) => (
    <div key={i} className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ borderLeft: i > 0 && ws.layout === "2col" ? `1px solid ${ui.border}` : undefined, borderTop: i > 0 && ws.layout === "2lig" ? `1px solid ${ui.border}` : undefined }} onMouseDown={() => ws.focused !== i && setWs((w) => ({ ...w, focused: i }))}>
      {!distraction && (
        <div className="flex h-[34px] shrink-0 items-end gap-[1px] overflow-x-auto px-1" style={{ background: ui.tabbar }} role="tablist" data-testid={`zt-onglets-${i}`}>
          {g.tabs.map((p) => {
            const active = p === g.active;
            return (
              <div
                key={p}
                role="tab"
                aria-selected={active}
                title={p}
                onMouseDown={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    closeTab(p, i);
                  }
                }}
                onClick={() => openFile(p, { group: i })}
                onDoubleClick={() => setTransient((t) => (t === p ? null : t))}
                className="group flex h-[28px] max-w-[200px] shrink-0 cursor-default items-center gap-2 rounded-t-md px-3 text-[13px]"
                style={{ background: active ? ui.editor : ui.chrome, color: active ? ui.text : ui.muted, fontStyle: transient === p ? "italic" : undefined, boxShadow: active && ws.focused === i && ws.groups.length > 1 ? `inset 0 2px ${ui.accent}` : undefined }}
              >
                <span className="truncate">{label(p)}</span>
                <button
                  type="button"
                  aria-label={`Fermer ${label(p)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(p, i);
                  }}
                  className="grid h-4 w-4 place-items-center rounded text-[11px]"
                  style={{ color: ui.muted }}
                >
                  <span className={isDirty(p) ? "group-hover:hidden" : "opacity-0 group-hover:opacity-100"}>{isDirty(p) ? "●" : "✕"}</span>
                  {isDirty(p) && <span className="hidden group-hover:inline">✕</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="relative min-h-0 flex-1" style={{ background: ui.editor }}>
        {g.active ? (
          <div className={distraction ? "mx-auto h-full w-full max-w-[920px]" : "h-full"}>
            <Editor
              key={`groupe-${i}`}
              path={g.active === SETTINGS_PATH ? "inmemory://zentech/preferences.json" : `inmemory://zentech/${g.active}`}
              language={syntaxOf(g.active)}
              value={contentOf(g.active)}
              theme={MONACO_THEME[settings.color_scheme]}
              beforeMount={beforeMount}
              onMount={onMount(i)}
              onChange={(v) => g.active && onEdit(g.active, v ?? "")}
              options={editorOptions(g.active)}
              loading={<div className="grid h-full place-items-center text-sm" style={{ color: ui.muted }}>Chargement de l&apos;éditeur…</div>}
            />
          </div>
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm" style={{ color: ui.muted }}>
            <div>
              <p>Aucun fichier ouvert.</p>
              <p className="mt-2">Ctrl+P : aller à un fichier · Ctrl+N : nouveau fichier · Ctrl+Maj+P : commandes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const selText = status.selections > 1 ? `${status.selections} sélections` : status.selected > 0 ? `${status.selected} caractère${status.selected > 1 ? "s" : ""} sélectionné${status.selected > 1 ? "s" : ""}` : `Ligne ${status.line}, Colonne ${status.column}`;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]" style={{ background: ui.chrome, color: ui.text }} data-testid="zentech-texte">
      <style>{`.zt-trouve{outline:1px solid #f9ae58;border-radius:2px}.zt-signet{background:${ui.accent};border-radius:50%;width:8px!important;height:8px!important;margin:6px 0 0 6px}`}</style>
      {!distraction && (
        <nav className="flex h-[30px] shrink-0 items-center text-[13px]" style={{ background: ui.chrome, borderBottom: `1px solid ${ui.border}` }} aria-label="Menus" data-testid="zt-menus">
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
            <span className="shrink-0 whitespace-nowrap px-3 font-semibold" style={{ color: ui.accent }}>
              <span className="max-md:hidden">ZENTECH Texte</span>
              <span className="md:hidden">ZT</span>
            </span>
            {(Object.keys(MENUS) as MenuName[]).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`zt-menu-${m}`}
                onClick={(e) => {
                  setMenuX(Math.max(8, Math.min(e.currentTarget.getBoundingClientRect().left, window.innerWidth - 316)));
                  setMenu((x) => (x === m ? null : m));
                }}
                onMouseEnter={(e) => {
                  if (!menu) return;
                  setMenuX(Math.max(8, Math.min(e.currentTarget.getBoundingClientRect().left, window.innerWidth - 316)));
                  setMenu(m);
                }}
                className="shrink-0 whitespace-nowrap px-2.5 py-1 hover:opacity-90"
                style={{ background: menu === m ? ui.select : undefined }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pl-1 pr-1 md:hidden" style={{ borderLeft: `1px solid ${ui.border}` }}>
            <IconButton label="Fichiers" onClick={() => setSideMobile((s) => !s)}>☰</IconButton>
            <IconButton label="Aller à (Ctrl+P)" onClick={() => setPalette({ kind: "aller", text: "" })}>⌕</IconButton>
            <IconButton label="Commandes (Ctrl+Maj+P)" onClick={() => setPalette({ kind: "commandes", text: "" })}>⌘</IconButton>
            <IconButton label="Exécuter (Ctrl+B)" onClick={() => void build()}>▶</IconButton>
          </div>
        </nav>
      )}
      {menu && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setMenu(null)} />
          <div role="menu" aria-label={menu} className="fixed top-[34px] z-[71] max-h-[75vh] w-[300px] max-w-[calc(100vw-16px)] overflow-auto rounded-md py-1 text-[13px] shadow-2xl" style={{ background: ui.panel, border: `1px solid ${ui.border}`, color: ui.text, left: menuX }} data-testid="zt-menu-ouvert">
            {MENUS[menu].map((id, k) =>
              id === "-" ? (
                <div key={k} className="my-1 h-px" style={{ background: ui.border }} />
              ) : (
                <button key={id} type="button" role="menuitem" data-testid={`zt-cmd-${id}`} onClick={() => runCmd(id)} className="flex w-full items-center gap-6 px-4 py-1 text-left hover:opacity-90" style={{}} onMouseEnter={(e) => (e.currentTarget.style.background = ui.select)} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                  <span className="flex-1 truncate">{byId.get(id)?.label}</span>
                  {byId.get(id)?.kb && <span className="shrink-0 text-[12px]" style={{ color: ui.muted }}>{byId.get(id)!.kb}</span>}
                </button>
              ),
            )}
          </div>
        </>
      )}

      <div className="relative flex min-h-0 flex-1">
        {!distraction && ws.sidebar && <div className="hidden w-[230px] shrink-0 md:block">{sidebar}</div>}
        {sideMobile && (
          <>
            <div className="fixed inset-0 z-[65] bg-black/40 md:hidden" onClick={() => setSideMobile(false)} />
            <div className="fixed inset-y-0 left-0 z-[66] w-[80vw] max-w-[300px] pt-[env(safe-area-inset-top)] md:hidden">{sidebar}</div>
          </>
        )}
        <div className={`flex min-h-0 min-w-0 flex-1 ${ws.layout === "2lig" ? "flex-col" : "flex-row"}`}>{ws.groups.map(groupView)}</div>
      </div>

      {find && (
        <FindPanel
          f={find}
          ui={ui}
          count={find.mode !== "fichiers" ? findCount : null}
          onChange={(f) => setFind(f)}
          onClose={() => {
            setFind(null);
            focused()?.focus();
          }}
          onNext={() => findStep(1)}
          onPrev={() => findStep(-1)}
          onAll={findAll}
          onReplace={replaceNext}
          onReplaceAll={replaceAll}
          onFindFiles={findInFiles}
          onReplaceFiles={replaceInFiles}
        />
      )}

      {outputOpen && output && (
        <section className="flex max-h-[45%] min-h-[120px] shrink-0 flex-col" style={{ background: ui.panel, borderTop: `1px solid ${ui.border}` }} aria-label="Sortie" data-testid="zt-sortie">
          <div className="flex shrink-0 items-center gap-2 px-3 py-1 text-[12px]" style={{ color: ui.muted }}>
            <span className="font-semibold">{output.title}</span>
            {output.error && <span style={{ color: "#ec5f66" }}>· erreur — Outils » Corriger le code…</span>}
            <button type="button" onClick={() => setOutputOpen(false)} aria-label="Fermer la console" className="ml-auto px-1">
              ✕
            </button>
          </div>
          {output.preview ? (
            <WebPreview doc={output.preview} className="min-h-0 flex-1 bg-white" onConsole={(l: PreviewConsoleLine) => setOutput((o) => (o ? { ...o, text: `${o.text}${l.text}\n` } : o))} />
          ) : output.results ? (
            <div className="min-h-0 flex-1 overflow-auto px-3 pb-2 font-mono text-[12.5px]" data-testid="zt-resultats">
              <p className="pb-1" style={{ color: ui.muted }}>{output.text}</p>
              {Object.entries(output.results.reduce<Record<string, typeof output.results>>((acc, r) => ((acc[r.path] ??= []).push(r), acc), {})).map(([path, rows]) => (
                <div key={path} className="pb-2">
                  <p style={{ color: ui.accent }}>{path} :</p>
                  {rows!.map((r) => (
                    <button key={`${r.line}-${r.column}`} type="button" onClick={() => openFile(r.path, { line: r.line, column: r.column, endColumn: r.column + (find?.query.length ?? 0) })} className="block w-full truncate text-left hover:underline">
                      <span className="inline-block w-12 text-right" style={{ color: ui.muted }}>{r.line}:</span> {r.text}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-1 px-3 pb-2">
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap font-mono text-[13px]" data-testid="zt-console">{output.running ? "Exécution…" : output.text}</pre>
              <input value={stdin} onChange={(e) => setStdin(e.target.value.replace(/\\n/g, "\n"))} placeholder="Entrées du programme (input, LIRE…) : séparez par des espaces ou des retours à la ligne" aria-label="Entrées du programme" className="shrink-0 rounded px-2 py-1 font-mono text-[12px] outline-none" style={{ background: ui.editor, color: ui.text, border: `1px solid ${ui.border}` }} />
            </div>
          )}
        </section>
      )}

      {!distraction && (
        <footer className="flex h-[24px] shrink-0 items-center gap-3 overflow-hidden px-3 text-[12px]" style={{ background: ui.chrome, color: ui.muted, borderTop: `1px solid ${ui.border}` }} data-testid="zt-statut">
          <button type="button" onClick={() => setWs((w) => ({ ...w, sidebar: !w.sidebar }))} aria-label="Barre latérale" className="hidden md:inline">
            ▤
          </button>
          <span data-testid="zt-position">{selText}</span>
          {flash && <span className="truncate" style={{ color: ui.text }} data-testid="zt-message">{flash}</span>}
          {parsed.error && <span className="truncate" style={{ color: "#ec5f66" }}>{parsed.error}</span>}
          <span className="ml-auto shrink-0">{settings.translate_tabs_to_spaces ? "Espaces" : "Tabulation"} : {settings.tab_size}</span>
          {activePath && (
            <button type="button" className="shrink-0" onClick={() => setPalette({ kind: "commandes", text: "Syntaxe : " })} data-testid="zt-syntaxe">
              {syntaxLabel(activePath)}
            </button>
          )}
        </footer>
      )}

      {palette && (
        <PaletteView
          palette={palette}
          ui={ui}
          onClose={() => {
            setPalette(null);
            window.setTimeout(() => focused()?.focus(), 20);
          }}
          onText={(text) => setPalette({ ...palette, text })}
          files={ws.project.files.map((f) => f.path)}
          active={activePath}
          contentOf={contentOf}
          commands={commands}
          onCommand={(id) => {
            setPalette(null);
            window.setTimeout(() => cmdRef.current.get(id)?.run(), 10);
          }}
          onGo={(path, line, column, endColumn) => {
            setPalette(null);
            openFile(path, { line: line ?? undefined, column: column ?? undefined, endColumn: endColumn ?? undefined });
          }}
        />
      )}
      {consoleScreen && output && !output.preview && !output.results && (
        <ConsoleScreen onBack={() => setConsoleScreen(false)} running={output.running} finished={false} title={output.title.startsWith("Sortie") ? "Console" : output.title}>
          {output.running ? "" : output.text}
        </ConsoleScreen>
      )}
      {ask && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4" role="presentation">
          <div role="dialog" aria-label={ask.title} className="w-full max-w-md rounded-lg p-4 shadow-2xl" style={{ background: ui.panel, color: ui.text, border: `1px solid ${ui.border}` }}>
            <h2 className="font-semibold">{ask.title}</h2>
            <p className="mt-2 text-sm" style={{ color: ui.muted }}>{ask.text}</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {ask.buttons.map((b) => (
                <button key={b.label} type="button" onClick={() => (setAsk(null), b.run())} className="rounded px-3 py-1.5 text-sm" style={{ background: b.primary ? ui.accent : ui.select, color: b.primary ? (ui.dark ? "#111" : "#fff") : ui.text }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {keysOpen && <KeysDialog commands={commands} ui={ui} onClose={() => setKeysOpen(false)} />}
      {fix && (
        <FixDialog
          fix={fix}
          title={basename(fix.path)}
          onClose={() => setFix(null)}
          onApply={() => {
            recordVersion(`texte:${fix.path}`, contentOf(fix.path), "Avant correction");
            onEdit(fix.path, fix.code);
            recordVersion(`texte:${fix.path}`, fix.code, "Correction automatique");
            setFix(null);
            say("Code corrigé — Ctrl+B pour l'exécuter");
          }}
        />
      )}
      {historyPath && (
        <HistoryDialog
          storageKey={`texte:${historyPath}`}
          title={basename(historyPath)}
          current={contentOf(historyPath)}
          theme={ui.dark ? "sombre" : "clair"}
          onClose={() => setHistoryPath(null)}
          onRestore={(code) => {
            recordVersion(`texte:${historyPath}`, contentOf(historyPath), "Avant restauration");
            onEdit(historyPath, code);
            setHistoryPath(null);
            say("Version restaurée");
          }}
        />
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid h-7 w-8 place-items-center rounded text-[15px] hover:bg-white/10">
      {children}
    </button>
  );
}

function TreeView(props: { nodes: TreeNode[]; depth: number; ui: UiColors; active: string | null; transient: string | null; expanded: Set<string>; onToggle: (p: string) => void; onOpen: (p: string, preview: boolean) => void; onNewFile: (folder: string) => void; onNewFolder: (parent: string) => void; onRename: (p: string) => void; onDelete: (p: string) => void }) {
  const { nodes, depth, ui } = props;
  const [menuFor, setMenuFor] = useState<string | null>(null);
  return (
    <>
      {nodes.map((n) => (
        <Fragment key={n.path}>
          <div className="group relative flex items-center" style={{ background: n.path === props.active ? ui.select : undefined }} onContextMenu={(e) => (e.preventDefault(), setMenuFor(n.path))}>
            <button
              type="button"
              onClick={() => (n.kind === "dossier" ? props.onToggle(n.path) : props.onOpen(n.path, true))}
              onDoubleClick={() => n.kind === "fichier" && props.onOpen(n.path, false)}
              className="flex min-w-0 flex-1 items-center gap-1.5 py-[3px] text-left"
              style={{ paddingLeft: 10 + depth * 14, fontStyle: props.transient === n.path ? "italic" : undefined }}
              data-testid={`zt-arbre-${n.path}`}
            >
              <span className="w-3 shrink-0 text-[10px]" style={{ color: ui.muted }}>{n.kind === "dossier" ? (props.expanded.has(n.path) ? "▾" : "▸") : ""}</span>
              <span className="truncate">{n.name}</span>
            </button>
            <button type="button" aria-label={`Actions pour ${n.name}`} onClick={() => setMenuFor((m) => (m === n.path ? null : n.path))} className="px-2 opacity-60 group-hover:opacity-100 md:opacity-0">
              ⋯
            </button>
            {menuFor === n.path && (
              <div className="absolute right-1 top-6 z-10 min-w-[170px] rounded py-1 text-[12.5px] shadow-xl" style={{ background: ui.panel, border: `1px solid ${ui.border}` }} onMouseLeave={() => setMenuFor(null)}>
                {(n.kind === "dossier"
                  ? [["Nouveau fichier ici", () => props.onNewFile(n.path)], ["Nouveau dossier ici", () => props.onNewFolder(n.path)], ["Renommer…", () => props.onRename(n.path)], ["Supprimer", () => props.onDelete(n.path)]]
                  : [["Ouvrir", () => props.onOpen(n.path, false)], ["Renommer…", () => props.onRename(n.path)], ["Supprimer", () => props.onDelete(n.path)]]
                ).map(([l, fn]) => (
                  <button key={l as string} type="button" onClick={() => (setMenuFor(null), (fn as () => void)())} className="block w-full px-3 py-1 text-left hover:opacity-80">
                    {l as string}
                  </button>
                ))}
              </div>
            )}
          </div>
          {n.kind === "dossier" && props.expanded.has(n.path) && <TreeView {...props} nodes={n.children} depth={depth + 1} />}
        </Fragment>
      ))}
    </>
  );
}

function Highlight({ text, query, ui }: { text: string; query: string; ui: UiColors }) {
  const pos = new Set(fuzzyPositions(query, text));
  return (
    <>
      {[...text].map((c, i) => (
        <span key={i} style={pos.has(i) ? { color: ui.accent, fontWeight: 700 } : undefined}>
          {c}
        </span>
      ))}
    </>
  );
}

function PaletteView(props: {
  palette: Palette;
  ui: UiColors;
  files: string[];
  active: string | null;
  contentOf: (p: string) => string;
  commands: Cmd[];
  onText: (t: string) => void;
  onClose: () => void;
  onCommand: (id: string) => void;
  onGo: (path: string, line?: number | null, column?: number | null, endColumn?: number | null) => void;
}) {
  const { palette, ui } = props;
  const [index, setIndex] = useState(0);
  type Item = { key: string; title: string; detail?: string; hl: string; go: () => void };
  const items: Item[] = useMemo(() => {
    if (palette.kind === "commandes") {
      return rank(palette.text, props.commands, (c) => c.label, 80).map((c) => ({ key: c.id, title: c.label, detail: c.kb, hl: palette.text, go: () => props.onCommand(c.id) }));
    }
    const q = parseGoto(palette.text);
    const fileList = rank(q.file, props.files, (f) => f, 60);
    const target = q.file ? fileList[0] : (props.active ?? fileList[0]);
    if (q.mode === "fichier") return fileList.map((f) => ({ key: f, title: basename(f), detail: f, hl: q.file, go: () => props.onGo(f) }));
    if (!target) return [];
    if (q.mode === "ligne") {
      const n = props.contentOf(target).split("\n").length;
      return q.line ? [{ key: "l", title: `Aller à la ligne ${Math.min(q.line, n)}${q.column ? `, colonne ${q.column}` : ""}`, detail: `${target} (${n} lignes)`, hl: "", go: () => props.onGo(target, Math.min(q.line!, n), q.column ?? 1) }] : [{ key: "l", title: `Tapez un numéro de ligne (1 à ${n})`, detail: target, hl: "", go: () => undefined }];
    }
    if (q.mode === "symbole") {
      const syms = symbolsOf(target, props.contentOf(target));
      return rank(q.rest, syms, (s) => s.name, 80).map((s) => ({ key: `${s.name}-${s.line}`, title: s.name, detail: `${s.kind} · ligne ${s.line}`, hl: q.rest, go: () => props.onGo(target, s.line, 1) }));
    }
    const lines = props.contentOf(target).split("\n").map((t, i) => ({ t, i }));
    return rank(q.rest, lines.filter((l) => l.t.trim()), (l) => l.t, 80).map((l) => ({ key: String(l.i), title: l.t.trim() || " ", detail: `ligne ${l.i + 1}`, hl: q.rest, go: () => props.onGo(target, l.i + 1, Math.max(1, l.t.toLowerCase().indexOf(q.rest.toLowerCase()) + 1), q.rest && l.t.toLowerCase().includes(q.rest.toLowerCase()) ? l.t.toLowerCase().indexOf(q.rest.toLowerCase()) + 1 + q.rest.length : null) }));
  }, [palette, props]);
  const current = Math.min(index, Math.max(0, items.length - 1));
  return (
    <div className="fixed inset-0 z-[85] flex justify-center bg-black/30 p-3 pt-[max(2.5rem,env(safe-area-inset-top))]" role="presentation" onClick={props.onClose}>
      <div role="dialog" aria-label={palette.kind === "aller" ? "Aller à n'importe quoi" : "Palette de commandes"} data-testid={palette.kind === "aller" ? "zt-aller" : "zt-palette"} className="h-fit w-full max-w-[620px] overflow-hidden rounded-md shadow-2xl" style={{ background: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }} onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={palette.text}
          onChange={(e) => {
            props.onText(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIndex((i) => Math.min(items.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              items[current]?.go();
            } else if (e.key === "Escape") props.onClose();
          }}
          placeholder={palette.kind === "aller" ? "Fichier… puis @symbole, :ligne ou #mot" : "Commande…"}
          aria-label={palette.kind === "aller" ? "Aller à" : "Commande"}
          className="m-2 w-[calc(100%-16px)] rounded px-3 py-2 text-base outline-none md:text-[14px]"
          style={{ background: ui.editor, color: ui.text, border: `1px solid ${ui.accent}` }}
        />
        <ul className="max-h-[55vh] overflow-y-auto pb-1" role="listbox">
          {!items.length && <li className="px-4 py-2 text-[13px]" style={{ color: ui.muted }}>Aucun résultat.</li>}
          {items.map((it, i) => (
            <li key={it.key} role="option" aria-selected={i === current}>
              <button type="button" onMouseEnter={() => setIndex(i)} onClick={it.go} className="flex w-full items-center gap-3 px-4 py-1.5 text-left text-[13.5px]" style={{ background: i === current ? ui.select : undefined }}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate"><Highlight text={it.title} query={it.hl} ui={ui} /></span>
                  {it.detail && palette.kind === "aller" && <span className="block truncate text-[12px]" style={{ color: ui.muted }}>{it.detail}</span>}
                </span>
                {it.detail && palette.kind === "commandes" && <span className="shrink-0 text-[12px]" style={{ color: ui.muted }}>{it.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Toggle({ on, label, title, onClick, ui }: { on: boolean; label: string; title: string; onClick: () => void; ui: UiColors }) {
  return (
    <button type="button" aria-pressed={on} title={title} aria-label={title} onClick={onClick} className="h-7 min-w-[30px] rounded px-1.5 font-mono text-[12px]" style={{ background: on ? ui.accent : ui.editor, color: on ? (ui.dark ? "#111" : "#fff") : ui.muted, border: `1px solid ${ui.border}` }}>
      {label}
    </button>
  );
}

function FindPanel(props: { f: FindState; ui: UiColors; count: number | null; onChange: (f: FindState) => void; onClose: () => void; onNext: () => void; onPrev: () => void; onAll: () => void; onReplace: () => void; onReplaceAll: () => void; onFindFiles: () => void; onReplaceFiles: () => void }) {
  const { f, ui } = props;
  const set = (patch: Partial<FindState>) => props.onChange({ ...f, ...patch });
  const btn = (label: string, run: () => void, testId?: string) => (
    <button type="button" onClick={run} data-testid={testId} className="h-7 shrink-0 rounded px-2.5 text-[12.5px]" style={{ background: ui.select, color: ui.text, border: `1px solid ${ui.border}` }}>
      {label}
    </button>
  );
  const inputCls = "h-7 min-w-0 flex-1 rounded px-2 font-mono text-base outline-none md:text-[13px]";
  const inputStyle = { background: ui.editor, color: ui.text, border: `1px solid ${ui.border}` };
  return (
    <section className="shrink-0 space-y-1.5 px-2 py-2" style={{ background: ui.panel, borderTop: `1px solid ${ui.border}` }} aria-label="Barre de recherche" data-testid="zt-recherche-panneau">
      <div className="flex flex-wrap items-center gap-1.5">
        <Toggle on={f.regex} label=".*" title="Expression régulière" onClick={() => set({ regex: !f.regex })} ui={ui} />
        <Toggle on={f.matchCase} label="Aa" title="Respecter la casse" onClick={() => set({ matchCase: !f.matchCase })} ui={ui} />
        <Toggle on={f.whole} label="“”" title="Mot entier" onClick={() => set({ whole: !f.whole })} ui={ui} />
        <input
          id="zt-recherche"
          value={f.query}
          onChange={(e) => set({ query: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Escape") props.onClose();
            else if (e.key === "Enter" && f.mode === "fichiers") props.onFindFiles();
            else if (e.key === "Enter") {
              e.preventDefault();
              if (e.altKey) props.onAll();
              else if (e.shiftKey) props.onPrev();
              else props.onNext();
            }
          }}
          placeholder={f.mode === "fichiers" ? "Rechercher dans tous les fichiers" : "Rechercher"}
          aria-label="Rechercher"
          className={inputCls}
          style={inputStyle}
        />
        {f.mode !== "fichiers" && props.count !== null && f.query && <span className="shrink-0 text-[12px]" style={{ color: ui.muted }} data-testid="zt-nb-trouves">{props.count} trouvé{props.count > 1 ? "s" : ""}</span>}
        {f.mode === "fichiers" ? btn("Rechercher", props.onFindFiles, "zt-chercher-fichiers") : (
          <>
            {btn("Suivant", props.onNext)}
            {btn("Précédent", props.onPrev)}
            {btn("Tout trouver", props.onAll, "zt-tout-trouver")}
          </>
        )}
        <button type="button" onClick={props.onClose} aria-label="Fermer la recherche" className="px-1.5" style={{ color: ui.muted }}>
          ✕
        </button>
      </div>
      {f.mode === "fichiers" && (
        <div className="flex items-center gap-1.5 pl-[110px] max-md:pl-0">
          <span className="w-14 shrink-0 text-[12px]" style={{ color: ui.muted }}>Où :</span>
          <input value={f.where} onChange={(e) => set({ where: e.target.value })} placeholder="tous les fichiers (ou une partie du chemin : web/, .py)" aria-label="Où rechercher" className={inputCls} style={inputStyle} />
        </div>
      )}
      {f.mode !== "rechercher" && (
        <div className="flex items-center gap-1.5 pl-[110px] max-md:pl-0">
          <input
            value={f.replace}
            onChange={(e) => set({ replace: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Escape") props.onClose();
              else if (e.key === "Enter") {
                e.preventDefault();
                if (f.mode === "fichiers") props.onReplaceFiles();
                else if (e.ctrlKey && e.altKey) props.onReplaceAll();
                else props.onReplace();
              }
            }}
            placeholder="Remplacer par"
            aria-label="Remplacer par"
            className={inputCls}
            style={inputStyle}
          />
          {f.mode === "fichiers" ? btn("Remplacer", props.onReplaceFiles) : (
            <>
              {btn("Remplacer", props.onReplace)}
              {btn("Tout remplacer", props.onReplaceAll, "zt-tout-remplacer")}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function KeysDialog({ commands, ui, onClose }: { commands: Cmd[]; ui: UiColors; onClose: () => void }) {
  const [q, setQ] = useState("");
  const list = commands.filter((c) => c.kb && (!q || `${c.label} ${c.kb}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-3" role="presentation" onClick={onClose}>
      <div role="dialog" aria-label="Raccourcis clavier" data-testid="zt-raccourcis" className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg shadow-2xl" style={{ background: ui.panel, color: ui.text, border: `1px solid ${ui.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-3" style={{ borderBottom: `1px solid ${ui.border}` }}>
          <h2 className="font-semibold">Raccourcis clavier</h2>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && onClose()} placeholder="Rechercher…" aria-label="Rechercher un raccourci" className="ml-auto w-44 rounded px-2 py-1 text-base outline-none md:text-sm" style={{ background: ui.editor, color: ui.text, border: `1px solid ${ui.border}` }} />
          <button type="button" onClick={onClose} aria-label="Fermer" className="px-2">✕</button>
        </div>
        <div className="overflow-y-auto p-2 text-[13px]">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-2 py-1">
              <span className="flex-1">{c.label}</span>
              <kbd className="rounded px-1.5 py-0.5 font-mono text-[12px]" style={{ background: ui.editor, border: `1px solid ${ui.border}` }}>{c.kb}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
