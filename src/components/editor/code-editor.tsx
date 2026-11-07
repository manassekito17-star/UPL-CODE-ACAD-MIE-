"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { LanguageId } from "@/content/types";
import { LANGUAGES } from "@/lib/execution/languages";
import { checkPseudocode } from "@/lib/pseudocode";
import { registerPseudocode } from "./pseudocode-language";

type MonacoEditor = Parameters<OnMount>[0];

/** Langage pseudocode et thèmes de la plateforme (partagés par l'éditeur, le laboratoire et UPL IDE). */
export function configureMonaco(monaco: Monaco) {
  registerPseudocode(monaco);
  const rules = [
    { token: "keyword", foreground: "5B93FF", fontStyle: "bold" },
    { token: "type", foreground: "22D3EE" },
    { token: "predefined", foreground: "C4B5FD" },
    { token: "string", foreground: "FBBF24" },
    { token: "number", foreground: "86EFAC" },
    { token: "comment", foreground: "6B778C", fontStyle: "italic" },
  ];
  monaco.editor.defineTheme("upl-nuit", {
    base: "vs-dark",
    inherit: true,
    rules,
    colors: { "editor.background": "#050D1F", "editorLineNumber.foreground": "#3A4559", "editor.lineHighlightBackground": "#0A1A3A" },
  });
  // Thème « studio » de UPL IDE : fond gris neutre, couleurs syntaxiques sobres.
  monaco.editor.defineTheme("upl-studio", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword.pseudocode", foreground: "569CD6", fontStyle: "bold" },
      { token: "type.pseudocode", foreground: "4EC9B0" },
      { token: "predefined.pseudocode", foreground: "DCDCAA" },
    ],
    colors: {
      "editor.background": "#1F1F1F",
      "editor.lineHighlightBackground": "#2A2A2A80",
      "editor.lineHighlightBorder": "#282828",
      "editorLineNumber.foreground": "#6E7681",
      "editorLineNumber.activeForeground": "#CCCCCC",
      "editorGutter.background": "#1F1F1F",
      "minimap.background": "#1F1F1F",
      "editorWidget.background": "#202020",
      "editorIndentGuide.background1": "#404040",
    },
  });
  monaco.editor.defineTheme("upl-clair", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "1D5FE0", fontStyle: "bold" },
      { token: "type", foreground: "0E7490" },
      { token: "predefined", foreground: "6D28D9" },
      { token: "string", foreground: "B45309" },
      { token: "number", foreground: "15803D" },
      { token: "comment", foreground: "6B778C", fontStyle: "italic" },
    ],
    colors: { "editor.background": "#FFFFFF", "editor.lineHighlightBackground": "#F1F5FB" },
  });
}

export interface EditorMarker {
  line: number;
  message: string;
}

/** Éditeur Monaco : coloration, numéros de ligne, indentation, suggestions et erreurs soulignées. */
export function CodeEditor({
  language,
  value,
  onChange,
  markers = [],
  height = "100%",
  readOnly = false,
  path,
  highlightLine,
}: {
  language: LanguageId;
  value: string;
  onChange?: (v: string) => void;
  markers?: EditorMarker[];
  height?: string;
  readOnly?: boolean;
  path?: string;
  /** Ligne mise en évidence (exécution pas à pas du laboratoire). */
  highlightLine?: number | null;
}) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<ReturnType<MonacoEditor["createDecorationsCollection"]> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ligne courante de l'exécution pas à pas
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!mounted || !editor || !monaco) return;
    decorationsRef.current ??= editor.createDecorationsCollection();
    const model = editor.getModel();
    if (!highlightLine || !model || highlightLine > model.getLineCount()) {
      decorationsRef.current.clear();
      return;
    }
    decorationsRef.current.set([
      {
        range: new monaco.Range(highlightLine, 1, highlightLine, 1),
        options: { isWholeLine: true, className: "upl-ligne-courante", glyphMarginClassName: "upl-ligne-courante-marge", linesDecorationsClassName: "upl-ligne-courante-marge" },
      },
    ]);
    editor.revealLineInCenterIfOutsideViewport(highlightLine);
  }, [highlightLine, mounted, value]);

  // Vérification de syntaxe du pseudocode en direct
  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    const timer = setTimeout(() => {
      const list = [...markers];
      if (language === "pseudocode") {
        const err = checkPseudocode(value);
        if (err && err.line) list.push({ line: err.line, message: err.hint ? `${err.message}\n💡 ${err.hint}` : err.message });
      }
      monaco.editor.setModelMarkers(
        model,
        "upl",
        list
          .filter((m) => m.line >= 1 && m.line <= model.getLineCount())
          .map((m) => ({
            startLineNumber: m.line,
            endLineNumber: m.line,
            startColumn: model.getLineFirstNonWhitespaceColumn(m.line) || 1,
            endColumn: model.getLineMaxColumn(m.line),
            message: m.message,
            severity: monaco.MarkerSeverity.Error,
          })),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [value, markers, language]);

  return (
    <Editor
      height={height}
      language={LANGUAGES[language].monaco}
      path={path}
      value={value}
      theme="upl-nuit"
      onChange={(v) => onChange?.(v ?? "")}
      beforeMount={configureMonaco}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setMounted(true);
      }}
      loading={<div className="grid h-full place-items-center bg-nuit-950 text-sm text-gray-400">Chargement de l&apos;éditeur…</div>}
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: "var(--font-jetbrains), monospace",
        minimap: { enabled: false },
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: language === "pseudocode" ? 2 : 4,
        wordWrap: "on",
        padding: { top: 12 },
        renderLineHighlight: "line",
        quickSuggestions: true,
        autoIndent: "full",
        formatOnType: true,
      }}
    />
  );
}
