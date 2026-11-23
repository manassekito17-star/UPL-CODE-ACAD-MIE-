import type { Monaco } from "@monaco-editor/react";

/**
 * Raccourcis écrits comme dans les menus (« Ctrl+Maj+P », « Ctrl+K Ctrl+B ») : conversion vers les
 * codes de l'éditeur, et reconnaissance d'une touche pressée hors de l'éditeur.
 */
const NAMED: Record<string, string> = {
  Entrée: "Enter",
  Espace: "Space",
  Échap: "Escape",
  Suppr: "Delete",
  "Retour arrière": "Backspace",
  Tab: "Tab",
  Haut: "UpArrow",
  Bas: "DownArrow",
  Gauche: "LeftArrow",
  Droite: "RightArrow",
  PgSuiv: "PageDown",
  PgPréc: "PageUp",
  "`": "Backquote",
  "/": "Slash",
  "[": "BracketLeft",
  "]": "BracketRight",
  "=": "Equal",
  "-": "Minus",
  ";": "Semicolon",
  ",": "Comma",
  ".": "Period",
};

function keyCode(monaco: Monaco, key: string): number | null {
  const name = NAMED[key] ?? (/^[A-Z]$/.test(key) ? `Key${key}` : /^[0-9]$/.test(key) ? `Digit${key}` : /^F\d{1,2}$/.test(key) ? key : null);
  if (!name) return null;
  const code = (monaco.KeyCode as unknown as Record<string, number>)[name];
  return typeof code === "number" ? code : null;
}

function part(monaco: Monaco, combo: string): number | null {
  const bits = combo.split("+");
  const key = bits.pop()!;
  let k = keyCode(monaco, key === "" ? "+" : key);
  if (k === null) return null;
  for (const m of bits) {
    if (m === "Ctrl") k |= monaco.KeyMod.CtrlCmd;
    else if (m === "Maj") k |= monaco.KeyMod.Shift;
    else if (m === "Alt") k |= monaco.KeyMod.Alt;
    else return null;
  }
  return k;
}

/** « Ctrl+K Ctrl+B » → code d'accord de l'éditeur ; null si la touche n'est pas reconnue. */
export function toMonaco(monaco: Monaco, kb: string): number | null {
  const [a, b] = kb.split(" ");
  const first = part(monaco, a);
  if (first === null) return null;
  if (!b) return first;
  const second = part(monaco, b);
  return second === null ? null : monaco.KeyMod.chord(first, second);
}

const CODE_NAME: Record<string, string> = { Enter: "Entrée", Space: "Espace", Escape: "Échap", Delete: "Suppr", Backspace: "Retour arrière", Tab: "Tab", ArrowUp: "Haut", ArrowDown: "Bas", ArrowLeft: "Gauche", ArrowRight: "Droite", PageDown: "PgSuiv", PageUp: "PgPréc", Backquote: "`", Slash: "/", BracketLeft: "[", BracketRight: "]", Equal: "=", Minus: "-", Semicolon: ";", Comma: ",", Period: "." };

/** Touche pressée (hors éditeur) écrite comme dans les menus : « Ctrl+Maj+P ». */
export function eventCombo(e: KeyboardEvent): string {
  const key = /^Key[A-Z]$/.test(e.code) ? e.code.slice(3) : /^Digit\d$/.test(e.code) ? e.code.slice(5) : /^F\d{1,2}$/.test(e.code) ? e.code : (CODE_NAME[e.code] ?? e.key);
  return [(e.ctrlKey || e.metaKey) && "Ctrl", e.shiftKey && "Maj", e.altKey && "Alt", key].filter(Boolean).join("+");
}
