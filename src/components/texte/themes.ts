import type { Monaco } from "@monaco-editor/react";
import type { ColorScheme } from "@/lib/texte/settings";

/** Couleurs de l'interface (barres, onglets, barre latérale) pour chaque thème. */
export interface UiColors {
  editor: string;
  chrome: string;
  tabbar: string;
  side: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  hover: string;
  select: string;
  panel: string;
  dark: boolean;
}

export const UI: Record<ColorScheme, UiColors> = {
  "Nuit marine": { editor: "#303841", chrome: "#262c33", tabbar: "#1f2429", side: "#262c33", text: "#d8dee9", muted: "#8f9aa6", accent: "#5fb4b4", border: "#1a1e23", hover: "#343c45", select: "#3f4a56", panel: "#23292f", dark: true },
  Monokai: { editor: "#272822", chrome: "#1e1f1c", tabbar: "#191a17", side: "#1e1f1c", text: "#f8f8f2", muted: "#90908a", accent: "#a6e22e", border: "#141512", hover: "#2c2d27", select: "#3e3d32", panel: "#1b1c18", dark: true },
  Clair: { editor: "#fbfbfb", chrome: "#eeeeee", tabbar: "#e2e2e2", side: "#f2f2f2", text: "#333333", muted: "#777777", accent: "#1e66f5", border: "#d0d0d0", hover: "#e6e6e6", select: "#d6e4ff", panel: "#f4f4f4", dark: false },
};

export const MONACO_THEME: Record<ColorScheme, string> = { "Nuit marine": "zt-nuit-marine", Monokai: "zt-monokai", Clair: "zt-clair" };

/** Thèmes de coloration du code (inspirés des thèmes classiques des éditeurs de texte). */
export function defineTexteThemes(monaco: Monaco) {
  monaco.editor.defineTheme("zt-nuit-marine", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "a7adba", fontStyle: "italic" },
      { token: "keyword", foreground: "c695c6" },
      { token: "string", foreground: "99c794" },
      { token: "number", foreground: "f9ae58" },
      { token: "type", foreground: "fac863" },
      { token: "type.identifier", foreground: "fac863" },
      { token: "identifier", foreground: "d8dee9" },
      { token: "operator", foreground: "f97b58" },
      { token: "delimiter", foreground: "a7adba" },
      { token: "tag", foreground: "ec5f66" },
      { token: "attribute.name", foreground: "c695c6" },
      { token: "attribute.value", foreground: "99c794" },
      { token: "predefined", foreground: "5fb4b4" },
      { token: "constant", foreground: "f9ae58" },
      { token: "variable", foreground: "f97b58" },
    ],
    colors: {
      "editor.background": "#303841",
      "editor.foreground": "#d8dee9",
      "editorLineNumber.foreground": "#6b7682",
      "editorLineNumber.activeForeground": "#d8dee9",
      "editor.lineHighlightBackground": "#2b323a",
      "editor.selectionBackground": "#4f5b66",
      "editor.inactiveSelectionBackground": "#434c56",
      "editorCursor.foreground": "#f9ae58",
      "editorIndentGuide.background1": "#3e4751",
      "editorWhitespace.foreground": "#4f5b66",
      "editorRuler.foreground": "#4f5b66",
      "minimap.background": "#303841",
      "editorGutter.background": "#303841",
      "editor.findMatchBackground": "#f9ae5866",
      "editor.findMatchHighlightBackground": "#f9ae5833",
    },
  });
  monaco.editor.defineTheme("zt-monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "type.identifier", foreground: "a6e22e" },
      { token: "identifier", foreground: "f8f8f2" },
      { token: "operator", foreground: "f92672" },
      { token: "delimiter", foreground: "f8f8f2" },
      { token: "tag", foreground: "f92672" },
      { token: "attribute.name", foreground: "a6e22e" },
      { token: "attribute.value", foreground: "e6db74" },
      { token: "predefined", foreground: "66d9ef" },
      { token: "constant", foreground: "ae81ff" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#90908a",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editor.selectionBackground": "#49483e",
      "editorCursor.foreground": "#f8f8f0",
      "editorIndentGuide.background1": "#464741",
      "editorWhitespace.foreground": "#464741",
      "editorRuler.foreground": "#464741",
      "minimap.background": "#272822",
      "editorGutter.background": "#272822",
    },
  });
  monaco.editor.defineTheme("zt-clair", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b8b8b", fontStyle: "italic" },
      { token: "keyword", foreground: "a626a4" },
      { token: "string", foreground: "50a14f" },
      { token: "number", foreground: "c18401" },
      { token: "type", foreground: "c18401" },
      { token: "tag", foreground: "e45649" },
      { token: "attribute.name", foreground: "986801" },
    ],
    colors: {
      "editor.background": "#fbfbfb",
      "editor.lineHighlightBackground": "#f0f0f0",
      "editorGutter.background": "#fbfbfb",
      "minimap.background": "#fbfbfb",
    },
  });
}
