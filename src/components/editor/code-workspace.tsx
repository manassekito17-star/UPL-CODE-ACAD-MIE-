"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LanguageId } from "@/content/types";
import { runProgram, warmupPython } from "@/lib/execution/browser";
import { LANGUAGE_IDS, LANGUAGES } from "@/lib/execution/languages";
import { STATUS_LABELS, type ExecutionResult, type SourceFile } from "@/lib/execution/types";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import { Button, cn, inputClass } from "../ui";
import { WebPreview, type PreviewConsoleLine } from "./web-preview";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-nuit-950 text-sm text-gray-400">Chargement de l&apos;éditeur…</div>,
});

interface HistoryEntry {
  at: string;
  language: LanguageId;
  status: ExecutionResult["status"];
  timeMs: number | null;
  preview: string;
}

const HISTORY_KEY = "upl:historique-executions";

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export interface WorkspaceApi {
  files: SourceFile[];
  stdin: string;
  language: LanguageId;
  setResult: (r: ExecutionResult | null) => void;
  setMarkers: (m: Array<{ line: number; message: string }>) => void;
}

export function CodeWorkspace({
  initialLanguage = "pseudocode",
  initialFiles,
  initialStdin = "",
  initialActiveFile,
  languageLocked = false,
  instructions,
  toolbarExtra,
  belowConsole,
  canSave = false,
  programId: initialProgramId,
  programTitle = "",
  storageKey,
  className,
  height = "calc(100dvh - 9rem)",
  variant = "standard",
}: {
  initialLanguage?: LanguageId;
  initialFiles?: SourceFile[];
  initialStdin?: string;
  /** Fichier ouvert au départ (ex. style.css pour un exercice CSS). */
  initialActiveFile?: string;
  languageLocked?: boolean;
  instructions?: ReactNode;
  toolbarExtra?: (api: WorkspaceApi) => ReactNode;
  belowConsole?: ReactNode;
  canSave?: boolean;
  programId?: string;
  programTitle?: string;
  /** Clé de brouillon local (sauvegarde automatique dans le navigateur). */
  storageKey?: string;
  className?: string;
  height?: string;
  /** « interpreteur » : barre de boutons-icônes, éditeur sur toute la largeur et console en dessous (page Éditeur). */
  variant?: "standard" | "interpreteur";
}) {
  const defaultFiles = useCallback(
    (lang: LanguageId): SourceFile[] => LANGUAGES[lang].defaultFiles?.map((f) => ({ ...f })) ?? [{ name: LANGUAGES[lang].mainFile, content: LANGUAGES[lang].template }],
    [],
  );
  const [language, setLanguage] = useState<LanguageId>(initialLanguage);
  const [files, setFiles] = useState<SourceFile[]>(initialFiles?.length ? initialFiles : defaultFiles(initialLanguage));
  const [active, setActive] = useState(() => Math.max(0, (initialFiles ?? []).findIndex((f) => f.name === initialActiveFile)));
  const [stdin, setStdin] = useState(initialStdin);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [markers, setMarkers] = useState<Array<{ line: number; message: string }>>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mobileTab, setMobileTab] = useState<"consignes" | "code" | "console">(instructions ? "consignes" : "code");
  const [programId, setProgramId] = useState(initialProgramId);
  const [title, setTitle] = useState(programTitle);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Brouillon local + historique
  useEffect(() => {
    // Lecture du stockage local après le montage (indisponible au rendu serveur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
    if (!storageKey) return;
    try {
      const draft = JSON.parse(localStorage.getItem(`upl:brouillon:${storageKey}`) ?? "null");
      if (draft?.files?.length) {
        setFiles(draft.files);
        if (typeof draft.stdin === "string") setStdin(draft.stdin);
      }
    } catch {
      /* brouillon illisible : ignoré */
    }
  }, [storageKey]);
  useEffect(() => {
    if (!storageKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`upl:brouillon:${storageKey}`, JSON.stringify({ files, stdin }));
      } catch {
        /* stockage indisponible */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [files, stdin, storageKey]);

  useEffect(() => {
    if (language === "python") warmupPython();
  }, [language]);

  const lang = LANGUAGES[language];
  const current = files[Math.min(active, files.length - 1)];
  // Projets web : aperçu en direct (mis à jour 600 ms après la dernière frappe).
  const isWeb = Boolean(lang.preview);
  const [previewDoc, setPreviewDoc] = useState(() => (isWeb ? buildPreviewDocument(files) : ""));
  const [previewConsole, setPreviewConsole] = useState<PreviewConsoleLine[]>([]);
  const [livePreview, setLivePreview] = useState(true);
  useEffect(() => {
    if (!isWeb || !livePreview) return;
    const t = setTimeout(() => {
      setPreviewConsole([]);
      setPreviewDoc(buildPreviewDocument(files));
    }, 600);
    return () => clearTimeout(t);
  }, [files, isWeb, livePreview]);
  const onPreviewConsole = useCallback((l: PreviewConsoleLine) => setPreviewConsole((c) => [...c.slice(-199), l]), []);

  const updateContent = (v: string) => {
    setFiles((fs) => fs.map((f, i) => (i === active ? { ...f, content: v } : f)));
    if (markers.length) setMarkers([]);
  };

  const changeLanguage = (next: LanguageId) => {
    if (next === language) return;
    const modified = files.some((f) => f.content !== LANGUAGES[language].template) && files[0].content.trim() !== "";
    if (modified && !confirm("Changer de langage remplacera le code actuel par un modèle. Continuer ?")) return;
    setLanguage(next);
    setFiles(defaultFiles(next));
    setActive(0);
    setResult(null);
    setMarkers([]);
  };

  const run = async () => {
    if (isWeb) {
      setPreviewConsole([]);
      setPreviewDoc(buildPreviewDocument(files));
      setMobileTab("console");
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    setStatus(null);
    setMobileTab("console");
    const { result: r, error: e } = await runProgram(language, files, stdin, { programId, onStatus: setStatus });
    setRunning(false);
    setStatus(null);
    if (e) setError(e);
    if (r) {
      setResult(r);
      setMarkers(r.errorLine ? [{ line: r.errorLine, message: [r.compileOutput, r.stderr].filter(Boolean).join("\n") }] : []);
      const entry: HistoryEntry = { at: new Date().toISOString(), language, status: r.status, timeMs: r.timeMs, preview: (r.stdout || r.stderr || r.compileOutput).slice(0, 80) };
      const next = [entry, ...history].slice(0, 15);
      setHistory(next);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignoré */
      }
    }
  };

  const reset = () => {
    if (!confirm("Réinitialiser le code ? Vos modifications seront perdues.")) return;
    setFiles(initialFiles?.length ? initialFiles : defaultFiles(language));
    setActive(0);
    setResult(null);
    setMarkers([]);
    setError(null);
  };

  const addFile = () => {
    const name = prompt("Nom du nouveau fichier (ex. outils.py) :");
    if (!name) return;
    if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(name) || files.some((f) => f.name === name)) {
      alert("Nom invalide ou déjà utilisé.");
      return;
    }
    setFiles((fs) => [...fs, { name, content: "" }]);
    setActive(files.length);
  };

  const removeFile = (i: number) => {
    if (i === 0) return;
    if (!confirm(`Supprimer le fichier ${files[i].name} ?`)) return;
    setFiles((fs) => fs.filter((_, k) => k !== i));
    setActive(0);
  };

  const save = async () => {
    const t = title.trim() || prompt("Titre du programme :", "Mon programme")?.trim();
    if (!t) return;
    setTitle(t);
    setSaveMessage("Enregistrement…");
    const res = await fetch(programId ? `/api/programs/${programId}` : "/api/programs", {
      method: programId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, language, files, stdin }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setProgramId(data.id);
      setSaveMessage("Programme enregistré ✓");
      if (!programId) window.history.replaceState(null, "", `/editeur?programme=${data.id}`);
    } else {
      setSaveMessage(data.error ?? "Échec de l'enregistrement.");
    }
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const api: WorkspaceApi = useMemo(() => ({ files, stdin, language, setResult, setMarkers }), [files, stdin, language]);

  const previewBody = (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Aperçu</span>
        <label className="flex items-center gap-1.5 text-xs text-gray-300">
          <input type="checkbox" checked={livePreview} onChange={(e) => setLivePreview(e.target.checked)} />
          mise à jour automatique
        </label>
      </div>
      <WebPreview doc={previewDoc} onConsole={onPreviewConsole} className="min-h-[45dvh] w-full flex-1 rounded-md border border-white/10 bg-white lg:min-h-[22rem]" />
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Console de la page</span>
        <pre className="mt-1 max-h-32 min-h-10 overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/60 p-2 font-mono text-xs text-gray-100" aria-live="polite" data-testid="console-apercu">
          {previewConsole.length === 0 && <span className="text-gray-500">Les messages de console.log() de script.js s&apos;afficheront ici.</span>}
          {previewConsole.map((l, i) => (
            <span key={i} className={cn("block", l.level === "error" && "text-red-300", l.level === "warn" && "text-amber-300")}>
              {l.text}
            </span>
          ))}
        </pre>
      </div>
      <p className="text-[11px] text-gray-500">Page affichée dans un cadre isolé : aucun accès au réseau, aux cookies ni à la plateforme.</p>
      {belowConsole}
    </div>
  );

  const consoleBody = (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <label htmlFor="stdin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
          Entrée (une valeur par ligne)
        </label>
        <textarea
          id="stdin"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          rows={3}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-white/10 bg-nuit-950 px-3 py-2 font-mono text-sm text-gray-100 focus:border-electrique-400 focus:outline-none"
          placeholder="Valeurs lues par LIRE / input() / scanf…"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Console</span>
          {result && (
            <span className={cn("text-xs font-medium", result.status === "ok" ? "text-green-400" : "text-red-400")}>
              {STATUS_LABELS[result.status]}
              {result.timeMs !== null && ` · ${result.timeMs} ms`}
              {result.memoryKb ? ` · ${Math.round(result.memoryKb / 1024)} Mo` : ""}
              {` · ${result.engine === "serveur" ? "bac à sable serveur" : result.engine === "interpreteur" ? "interpréteur UPL" : "navigateur"}`}
            </span>
          )}
        </div>
        <pre
          className="min-h-32 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/60 p-3 font-mono text-[13px] leading-relaxed text-gray-100"
          aria-live="polite"
        >
          {running && <span className="text-cyan-accent">{status ?? "Exécution en cours…"}</span>}
          {!running && !result && !error && <span className="text-gray-500">Cliquez sur « Exécuter » pour lancer votre programme.</span>}
          {error && <span className="text-red-300">{error}</span>}
          {result?.compileOutput && <span className="text-red-300">{result.compileOutput}{"\n"}</span>}
          {result?.stdout}
          {result?.stderr && <span className="text-red-300">{result.stdout && !result.stdout.endsWith("\n") ? "\n" : ""}{result.stderr}</span>}
          {result?.hint && <span className="mt-2 block text-amber-300">💡 {result.hint}</span>}
        </pre>
      </div>
      {belowConsole}
      <div>
        <button className="text-xs text-gray-400 underline hover:text-white" onClick={() => setShowHistory((s) => !s)}>
          {showHistory ? "Masquer" : "Afficher"} l&apos;historique des exécutions ({history.length})
        </button>
        {showHistory && (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-gray-300">
            {history.length === 0 && <li className="text-gray-500">Aucune exécution pour l&apos;instant.</li>}
            {history.map((h, i) => (
              <li key={i} className="flex gap-2 rounded bg-white/5 px-2 py-1">
                <span className={h.status === "ok" ? "text-green-400" : "text-red-400"}>●</span>
                <span className="shrink-0 text-gray-500">{new Date(h.at).toLocaleTimeString("fr-FR")}</span>
                <span className="shrink-0">{LANGUAGES[h.language].shortLabel}</span>
                <span className="truncate text-gray-400">{h.preview}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const [fullscreen, setFullscreen] = useState(false);
  const [toolMessage, setToolMessage] = useState<string | null>(null);
  const flash = (m: string) => {
    setToolMessage(m);
    setTimeout(() => setToolMessage(null), 2500);
  };
  const download = () => {
    if (!current) return;
    const url = URL.createObjectURL(new Blob([current.content], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: current.name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(current?.content ?? "");
      flash("Code copié ✓");
    } catch {
      flash("Copie impossible : sélectionnez le code puis copiez-le.");
    }
  };
  const share = async () => {
    const text = current?.content ?? "";
    if (navigator.share) {
      try {
        await navigator.share({ title: title || current?.name || "Mon programme", text });
        return;
      } catch {
        /* partage annulé : rien à faire */
        return;
      }
    }
    await copyCode();
  };
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // Sur téléphone, la console est sous l'éditeur : on la fait apparaître après « Exécuter ».
  const runAndShow = () => {
    if (running) return;
    run();
    if (window.innerWidth < 1024 && !fullscreen) document.getElementById("console-editeur")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (variant === "interpreteur") {
    const tools: Array<{ label: string; icon: ReactNode; onClick: () => void; disabled?: boolean; title: string; aria?: string }> = [
      { label: running ? "…" : isWeb ? "Aperçu" : "Exécuter", icon: <span aria-hidden>{isWeb ? "↻" : "▶"}</span>, onClick: runAndShow, aria: isWeb ? "↻ Actualiser l'aperçu" : "▶ Exécuter", title: isWeb ? "Actualiser l'aperçu (Ctrl + Entrée)" : "Exécuter (Ctrl + Entrée)" },
      { label: "Enregistrer", icon: <ToolIcon d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7" />, onClick: () => (canSave ? save() : flash("Connectez-vous pour enregistrer vos programmes.")), title: "Enregistrer dans mon compte" },
      { label: "Télécharger", icon: <ToolIcon d="M12 4v11M7 10l5 5 5-5M5 20h14" />, onClick: download, title: "Télécharger le fichier" },
      { label: "Réinitialiser", icon: <ToolIcon d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5" />, onClick: reset, title: "Réinitialiser le code" },
      { label: "Copier", icon: <ToolIcon d="M9 9h11v11H9zM5 15H4V4h11v1" />, onClick: copyCode, title: "Copier tout le code" },
      { label: fullscreen ? "Réduire" : "Plein écran", icon: <ToolIcon d={fullscreen ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"} />, onClick: () => setFullscreen((f) => !f), title: fullscreen ? "Quitter le plein écran" : "Plein écran" },
      { label: "Partager", icon: <ToolIcon d="M14 5l6 6-6 6M20 11H10a6 6 0 0 0-6 6v2" />, onClick: share, title: "Partager le code" },
    ];
    return (
      <div
        className={cn("flex flex-col overflow-hidden border border-nuit-800 bg-[#1e1f22] text-white shadow-lg", fullscreen ? "fixed inset-0 z-50" : "rounded-xl", className)}
        data-testid="editeur-interpreteur"
      >
        <div className="flex flex-wrap items-center gap-2 bg-[#2b2d31] px-2 py-1.5">
          {languageLocked ? (
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-medium">{lang.label}</span>
          ) : (
            <select aria-label="Langage" value={language} onChange={(e) => changeLanguage(e.target.value as LanguageId)} className="h-8 min-w-0 flex-1 rounded border border-white/15 bg-[#1e1f22] px-2 text-sm text-white sm:flex-none">
              {LANGUAGE_IDS.map((id) => (
                <option key={id} value={id}>
                  {LANGUAGES[id].label}
                </option>
              ))}
            </select>
          )}
          {title && <span className="truncate text-xs text-gray-400">{title}</span>}
          {(saveMessage || toolMessage) && <span className="text-xs text-emerald-300" role="status">{saveMessage ?? toolMessage}</span>}
        </div>
        {/* Barre de boutons verts : une icône par action, le nom écrit en dessous. */}
        <div className="grid grid-cols-7 gap-0.5 bg-[#1e1f22] p-0.5" role="toolbar" aria-label="Actions de l'éditeur">
          {tools.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={t.onClick}
              title={t.title}
              aria-label={t.aria ?? t.title}
              aria-keyshortcuts={t.title.startsWith("Exécuter") || t.title.startsWith("Actualiser") ? "Control+Enter" : undefined}
              disabled={t.disabled}
              className="flex h-11 flex-col items-center justify-center gap-0.5 bg-[#4caf50] text-white hover:bg-[#43a047] active:bg-[#388e3c] disabled:opacity-60"
            >
              <span className="grid h-4 place-items-center text-sm leading-none">{t.icon}</span>
              <span className="w-full truncate px-0.5 text-[8.5px] leading-none tracking-tight sm:text-[11px] sm:tracking-normal">{t.label}</span>
            </button>
          ))}
        </div>
        {(lang.multiFile || files.length > 1) && (
          <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-[#1e1f22] px-2">
            {files.map((f, i) => (
              <div key={f.name} className={cn("flex items-center rounded-t-md text-xs", i === active ? "bg-[#2b2d31] text-white" : "text-gray-400")}>
                <button className="px-3 py-2 font-mono" onClick={() => setActive(i)}>
                  {f.name}
                </button>
                {i > 0 && (
                  <button className="pr-2 text-gray-500 hover:text-red-400" aria-label={`Supprimer ${f.name}`} onClick={() => removeFile(i)}>
                    ×
                  </button>
                )}
              </div>
            ))}
            {lang.multiFile && files.length < 10 && (
              <button className="px-2 py-2 text-sm text-gray-400 hover:text-white" onClick={addFile} aria-label="Ajouter un fichier">
                +
              </button>
            )}
          </div>
        )}
        <div
          className={cn("min-h-0", fullscreen ? "flex-1" : "")}
          style={fullscreen ? undefined : { height }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (!running) run();
            }
          }}
        >
          <CodeEditor language={language} value={current?.content ?? ""} onChange={updateContent} markers={markers} path={`${language}/${current?.name}`} />
        </div>
        <div className={cn("scroll-mt-24 border-t-2 border-[#4caf50] bg-[#25262a] p-3", fullscreen && "max-h-[40dvh] overflow-auto")} id="console-editeur">
          {isWeb ? previewBody : consoleBody}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-nuit-800 bg-nuit-900 text-white shadow-lg", className)}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        {languageLocked ? (
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-medium">{lang.label}</span>
        ) : (
          <select
            aria-label="Langage"
            value={language}
            onChange={(e) => changeLanguage(e.target.value as LanguageId)}
            className="h-9 rounded-md border border-white/15 bg-nuit-950 px-2 text-sm text-white"
          >
            {LANGUAGE_IDS.map((id) => (
              <option key={id} value={id}>
                {LANGUAGES[id].label}
              </option>
            ))}
          </select>
        )}
        <Button size="sm" onClick={run} disabled={running} aria-keyshortcuts="Control+Enter">
          {running ? "Exécution…" : isWeb ? "↻ Actualiser l'aperçu" : "▶ Exécuter"}
        </Button>
        <Button size="sm" variant="sombre" onClick={reset}>
          Réinitialiser
        </Button>
        {canSave && (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du programme"
              aria-label="Titre du programme"
              className={cn(inputClass, "h-9 w-40 border-white/15 bg-nuit-950 text-white sm:w-52")}
            />
            <Button size="sm" variant="sombre" onClick={save}>
              💾 Enregistrer
            </Button>
          </>
        )}
        {saveMessage && <span className="text-xs text-cyan-accent">{saveMessage}</span>}
        <div className="ml-auto flex items-center gap-2">{toolbarExtra?.(api)}</div>
      </div>

      {/* Onglets mobiles */}
      <div className="flex border-b border-white/10 lg:hidden" role="tablist">
        {(instructions ? (["consignes", "code", "console"] as const) : (["code", "console"] as const)).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={mobileTab === t}
            onClick={() => setMobileTab(t)}
            className={cn("flex-1 py-2.5 text-sm font-medium capitalize", mobileTab === t ? "border-b-2 border-cyan-accent text-white" : "text-gray-400")}
          >
            {t === "console" && isWeb ? "aperçu" : t}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,38%)]" style={{ height }}>
        {instructions && (
          <div className={cn("min-h-0 overflow-auto bg-white p-4 text-nuit-900 lg:hidden", mobileTab !== "consignes" && "hidden")}>{instructions}</div>
        )}
        <div className={cn("flex min-h-0 flex-col", mobileTab !== "code" && "max-lg:hidden")}>
          {(lang.multiFile || files.length > 1) && (
            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-nuit-950 px-2">
              {files.map((f, i) => (
                <div key={f.name} className={cn("flex items-center rounded-t-md text-xs", i === active ? "bg-nuit-900 text-white" : "text-gray-400")}>
                  <button className="px-3 py-2 font-mono" onClick={() => setActive(i)}>
                    {f.name}
                  </button>
                  {i > 0 && (
                    <button className="pr-2 text-gray-500 hover:text-red-400" aria-label={`Supprimer ${f.name}`} onClick={() => removeFile(i)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {lang.multiFile && files.length < 10 && (
                <button className="px-2 py-2 text-sm text-gray-400 hover:text-white" onClick={addFile} aria-label="Ajouter un fichier">
                  +
                </button>
              )}
            </div>
          )}
          <div
            className="min-h-[50dvh] flex-1 lg:min-h-0"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (!running) run();
              }
            }}
          >
            <CodeEditor language={language} value={current?.content ?? ""} onChange={updateContent} markers={markers} path={`${language}/${current?.name}`} />
          </div>
        </div>
        <div className={cn("min-h-0 overflow-auto border-white/10 p-3 lg:border-l", mobileTab !== "console" && "max-lg:hidden")}>{isWeb ? previewBody : consoleBody}</div>
      </div>
    </div>
  );
}

function ToolIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
