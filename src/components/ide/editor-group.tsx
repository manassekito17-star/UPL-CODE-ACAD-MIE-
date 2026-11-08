"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { basename, languageOf, type ProjectFile } from "@/lib/ide/fs";
import { tagToClose } from "@/lib/ide/html-close";
import { checkPseudocode } from "@/lib/pseudocode";
import { configureMonaco } from "../editor/code-editor";
import { cn } from "../ui";
import { FileIcon } from "./file-icon";
import { Icon } from "./icons";

export type MonacoEditor = Parameters<OnMount>[0];

export interface EditorSettings {
  theme: "studio" | "sombre" | "clair";
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autosave: boolean;
}

export const MONACO_THEMES: Record<EditorSettings["theme"], string> = { studio: "upl-studio", sombre: "upl-nuit", clair: "upl-clair" };

/** Actions de la page d'accueil affichée quand aucun fichier n'est ouvert. */
export interface WelcomeAction {
  label: string;
  onClick: () => void;
}

export const modelPath = (projectKey: string, path: string) => `ide/${projectKey}/${path}`;

export function EditorGroup({
  projectKey,
  tabs,
  active,
  files,
  focused,
  dirty,
  settings,
  onFocus,
  onSelect,
  onClose,
  onChange,
  onCursor,
  onReady,
  onRun,
  onSave,
  welcome,
}: {
  projectKey: string;
  tabs: string[];
  active: string | null;
  files: ProjectFile[];
  focused: boolean;
  dirty: (path: string) => boolean;
  settings: EditorSettings;
  onFocus: () => void;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onChange: (path: string, value: string) => void;
  onCursor: (line: number, column: number) => void;
  onReady: (editor: MonacoEditor, monaco: Monaco) => void;
  onRun: () => void;
  onSave: () => void;
  welcome?: { start: WelcomeAction[]; recent: WelcomeAction[] };
}) {
  const file = files.find((f) => f.path === active);
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const handlers = useRef({ onRun, onSave, onCursor, onFocus });
  useEffect(() => {
    handlers.current = { onRun, onSave, onCursor, onFocus };
  }, [onRun, onSave, onCursor, onFocus]);

  // Erreurs du pseudocode signalées en direct (les autres langages ont leurs propres analyseurs Monaco).
  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model || !file || languageOf(file.path).monaco !== "pseudocode") return;
    const t = setTimeout(() => {
      const err = checkPseudocode(file.content);
      monaco.editor.setModelMarkers(
        model,
        "upl",
        err && err.line && err.line <= model.getLineCount()
          ? [{ startLineNumber: err.line, endLineNumber: err.line, startColumn: 1, endColumn: model.getLineMaxColumn(err.line), message: err.hint ? `${err.message} — ${err.hint}` : err.message, severity: monaco.MarkerSeverity.Error }]
          : [],
      );
    }, 300);
    return () => clearTimeout(t);
  }, [file]);

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col", focused && "ring-1 ring-inset ring-[var(--ide-accent)]/40")} onMouseDown={onFocus}>
      <div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-[var(--ide-border)] bg-[var(--ide-tabs)]" role="tablist" aria-label="Fichiers ouverts">
        {tabs.map((t) => (
          <div
            key={t}
            role="tab"
            aria-selected={t === active}
            tabIndex={0}
            title={t}
            onClick={() => onSelect(t)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(t)}
            onAuxClick={(e) => e.button === 1 && onClose(t)}
            className={cn(
              "group flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-[var(--ide-border)] pl-2.5 pr-1.5 text-[13px]",
              t === active ? "bg-[var(--ide-tab-active)] text-[var(--ide-text)] shadow-[inset_0_1px_0_var(--ide-accent)]" : "text-[var(--ide-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
            )}
          >
            <FileIcon path={t} />
            <span className={cn("max-w-40 truncate", dirty(t) && "italic")}>{basename(t)}</span>
            {dirty(t) ? (
              <button
                type="button"
                className="grid h-5 w-5 place-items-center rounded hover:bg-[var(--ide-hover)]"
                aria-label={`Fermer ${basename(t)} (modifications non enregistrées)`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t);
                }}
              >
                <span className="h-2 w-2 rounded-full bg-[var(--ide-text)] group-hover:hidden" />
                <Icon name="fermer" className="hidden h-3.5 w-3.5 group-hover:block" />
              </button>
            ) : (
              <button
                type="button"
                className="grid h-5 w-5 place-items-center rounded opacity-60 hover:bg-[var(--ide-hover)] group-hover:opacity-100"
                aria-label={`Fermer ${basename(t)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t);
                }}
              >
                <Icon name="fermer" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {file && (
        <nav aria-label="Fil d'Ariane" className="flex h-6 shrink-0 items-center gap-0.5 overflow-x-auto bg-[var(--ide-editor)] px-3 text-xs text-[var(--ide-muted)]" data-testid="ide-fil-ariane">
          {file.path.split("/").map((seg, i, all) => (
            <span key={i} className="flex shrink-0 items-center gap-0.5">
              {i > 0 && <Icon name="chevron" className="h-3 w-3 opacity-70" />}
              {i === all.length - 1 ? (
                <span className="flex items-center gap-1 text-[var(--ide-text)]">
                  <FileIcon path={file.path} />
                  {seg}
                </span>
              ) : (
                <span>{seg}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="relative min-h-0 flex-1 bg-[var(--ide-editor)]">
        {file ? (
          <Editor
            path={modelPath(projectKey, file.path)}
            defaultValue={file.content}
            language={languageOf(file.path).monaco}
            theme={MONACO_THEMES[settings.theme] ?? "upl-studio"}
            beforeMount={configureMonaco}
            onChange={(v) => onChange(file.path, v ?? "")}
            keepCurrentModel
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              editor.onDidChangeCursorPosition((e) => handlers.current.onCursor(e.position.lineNumber, e.position.column));
              editor.onDidFocusEditorText(() => handlers.current.onFocus());
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handlers.current.onSave());
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handlers.current.onRun());
              // HTML : « <p> » tapé → « </p> » ajouté après le curseur (comme Sublime Text).
              editor.onDidChangeModelContent((e) => {
                if (e.isUndoing || e.isRedoing || e.isFlush) return;
                const model = editor.getModel();
                const last = e.changes[e.changes.length - 1];
                if (!model || model.getLanguageId() !== "html" || !last || !last.text.endsWith(">") || last.text.length > 2) return;
                const pos = editor.getPosition();
                if (!pos) return;
                const line = model.getLineContent(pos.lineNumber);
                const tag = tagToClose(line.slice(0, pos.column - 1), line.slice(pos.column - 1));
                if (!tag) return;
                editor.executeEdits("upl-balise", [{ range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column), text: `</${tag}>` }]);
                editor.setPosition(pos);
              });
              onReady(editor, monaco);
            }}
            loading={<div className="grid h-full place-items-center text-sm text-[var(--ide-muted)]">Chargement de l&apos;éditeur…</div>}
            options={{
              fontSize: settings.fontSize,
              fontFamily: "var(--font-jetbrains), monospace",
              tabSize: settings.tabSize,
              wordWrap: settings.wordWrap ? "on" : "off",
              // Minicarte masquée sur téléphone (place trop réduite).
              minimap: { enabled: settings.minimap && typeof window !== "undefined" && window.innerWidth >= 768 },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderLineHighlight: "line",
              quickSuggestions: true,
              autoIndent: "full",
              formatOnPaste: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              padding: { top: 8 },
            }}
          />
        ) : (
          <div className="h-full overflow-auto p-6 text-sm text-[var(--ide-muted)] md:p-12" data-testid="ide-bienvenue">
            <p className="text-2xl font-light text-[var(--ide-text)]">UPL IDE</p>
            <p className="mt-1">Éditer, exécuter et prévisualiser vos projets.</p>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {welcome && (
                <div className="space-y-6">
                  <section>
                    <h2 className="mb-2 text-base text-[var(--ide-text)]">Démarrer</h2>
                    <ul className="space-y-1.5">
                      {welcome.start.map((a) => (
                        <li key={a.label}>
                          <button type="button" onClick={a.onClick} className="text-[var(--ide-accent)] hover:underline">{a.label}</button>
                        </li>
                      ))}
                    </ul>
                  </section>
                  {welcome.recent.length > 0 && (
                    <section>
                      <h2 className="mb-2 text-base text-[var(--ide-text)]">Fichiers du projet</h2>
                      <ul className="space-y-1.5">
                        {welcome.recent.map((a) => (
                          <li key={a.label}>
                            <button type="button" onClick={a.onClick} className="text-[var(--ide-accent)] hover:underline">{a.label}</button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
              <section>
                <h2 className="mb-2 text-base text-[var(--ide-text)]">Raccourcis</h2>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                  {[
                    ["Ctrl + S", "Enregistrer"],
                    ["Ctrl + Entrée", "Exécuter le fichier"],
                    ["Ctrl + B", "Afficher / masquer la barre latérale"],
                    ["Ctrl + J", "Afficher / masquer le panneau"],
                    ["Ctrl + \\", "Vue fractionnée"],
                    ["Ctrl + F / Ctrl + H", "Rechercher / remplacer"],
                    ["Maj + Alt + F", "Formater le document"],
                    ["F1", "Palette de commandes de l'éditeur"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt><kbd className="rounded border border-[var(--ide-border)] px-1.5 py-0.5 font-mono">{k}</kbd></dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
