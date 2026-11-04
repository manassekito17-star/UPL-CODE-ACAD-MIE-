"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type { LanguageId } from "@/content/types";
import { LANGUAGES } from "@/lib/execution/languages";
import { checkPseudocode } from "@/lib/pseudocode";
import { registerPseudocode } from "./pseudocode-language";

type MonacoEditor = Parameters<OnMount>[0];

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
}: {
  language: LanguageId;
  value: string;
  onChange?: (v: string) => void;
  markers?: EditorMarker[];
  height?: string;
  readOnly?: boolean;
  path?: string;
}) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

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
      beforeMount={(monaco) => {
        registerPseudocode(monaco);
        monaco.editor.defineTheme("upl-nuit", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "keyword", foreground: "5B93FF", fontStyle: "bold" },
            { token: "type", foreground: "22D3EE" },
            { token: "predefined", foreground: "C4B5FD" },
            { token: "string", foreground: "FBBF24" },
            { token: "number", foreground: "86EFAC" },
            { token: "comment", foreground: "6B778C", fontStyle: "italic" },
          ],
          colors: { "editor.background": "#050D1F", "editorLineNumber.foreground": "#3A4559", "editor.lineHighlightBackground": "#0A1A3A" },
        });
      }}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
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
