"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { basename, languageOf, type ProjectFile } from "@/lib/ide/fs";
import { checkPseudocode } from "@/lib/pseudocode";
import { configureMonaco } from "../editor/code-editor";
import { cn } from "../ui";
import { Icon } from "./icons";

export type MonacoEditor = Parameters<OnMount>[0];

export interface EditorSettings {
  theme: "sombre" | "clair";
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autosave: boolean;
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
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col", focused && "ring-1 ring-inset ring-electrique-500/40")} onMouseDown={onFocus}>
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
              "group flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-[var(--ide-border)] pl-3 pr-1.5 text-[13px]",
              t === active ? "bg-[var(--ide-editor)] text-[var(--ide-text)] shadow-[inset_0_2px_0_var(--color-electrique-500)]" : "text-[var(--ide-muted)] hover:text-[var(--ide-text)]",
            )}
          >
            <span className="max-w-40 truncate">{basename(t)}</span>
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
                <span className="h-2 w-2 rounded-full bg-amber-400 group-hover:hidden" />
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
      <div className="relative min-h-0 flex-1 bg-[var(--ide-editor)]">
        {file ? (
          <Editor
            path={modelPath(projectKey, file.path)}
            defaultValue={file.content}
            language={languageOf(file.path).monaco}
            theme={settings.theme === "clair" ? "upl-clair" : "upl-nuit"}
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
              onReady(editor, monaco);
            }}
            loading={<div className="grid h-full place-items-center text-sm text-[var(--ide-muted)]">Chargement de l&apos;éditeur…</div>}
            options={{
              fontSize: settings.fontSize,
              fontFamily: "var(--font-jetbrains), monospace",
              tabSize: settings.tabSize,
              wordWrap: settings.wordWrap ? "on" : "off",
              minimap: { enabled: settings.minimap },
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
          <div className="grid h-full place-items-center p-6 text-center text-sm text-[var(--ide-muted)]">
            <div>
              <p className="font-semibold text-[var(--ide-text)]">Aucun fichier ouvert</p>
              <p className="mt-1">Choisissez un fichier dans l&apos;explorateur.</p>
              <p className="mt-3 text-xs">Ctrl + S : enregistrer · Ctrl + Entrée : exécuter · Ctrl + F / Ctrl + H : rechercher / remplacer · Maj + Alt + F : formater</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
