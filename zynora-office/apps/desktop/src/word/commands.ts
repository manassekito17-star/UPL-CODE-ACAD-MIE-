/** Commandes d'édition de ZYNORA Word (toutes opèrent sur l'état ProseMirror, testables sans interface). */
import { baseKeymap, splitBlockAs, toggleMark } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { InputRule, inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import type { Attrs, MarkType, Node as PMNode } from "prosemirror-model";
import { type Command, type EditorState, type Plugin, TextSelection, type Transaction } from "prosemirror-state";
import { goToNextCell, isInTable } from "prosemirror-tables";

import { schema, type ListKind } from "./schema";

const S = schema.nodes;
const M = schema.marks;
export const INDENT_STEP_MM = 12.7;

/** Paragraphes touchés par la sélection (y compris dans les cellules de tableau). */
export function selectedParagraphs(state: EditorState): Array<{ node: PMNode; pos: number }> {
  const { from, to } = state.selection;
  const found: Array<{ node: PMNode; pos: number }> = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === S.paragraph) {
      found.push({ node, pos });
      return false;
    }
    return true;
  });
  if (found.length === 0) {
    const $from = state.selection.$from;
    if ($from.parent.type === S.paragraph) found.push({ node: $from.parent, pos: $from.before() });
  }
  return found;
}

export function setParagraphAttrs(attrs: Attrs | ((node: PMNode) => Attrs)): Command {
  return (state, dispatch) => {
    const paragraphs = selectedParagraphs(state);
    if (paragraphs.length === 0) return false;
    if (dispatch) {
      const tr = state.tr;
      for (const { node, pos } of paragraphs) {
        const next = typeof attrs === "function" ? attrs(node) : attrs;
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...next });
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function toggleList(kind: ListKind): Command {
  return (state, dispatch) => {
    const all = selectedParagraphs(state).every(({ node }) => node.attrs.list === kind);
    return setParagraphAttrs(all ? { list: null, level: 0 } : { list: kind, indentLeft: 0, firstLine: 0 })(state, dispatch);
  };
}

/** Augmente (+1) ou diminue (-1) le retrait : niveau de liste, sinon retrait gauche. */
export function changeIndent(delta: 1 | -1): Command {
  return setParagraphAttrs((node) =>
    node.attrs.list
      ? { level: Math.min(8, Math.max(0, node.attrs.level + delta)) }
      : { indentLeft: Math.max(0, Math.round((node.attrs.indentLeft + delta * INDENT_STEP_MM) * 10) / 10) },
  );
}

/** Applique une marque avec attributs (couleur, taille…) à la sélection, ou la retire (`null`). */
export function setMark(type: MarkType, attrs: Attrs | null): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (!dispatch) return true;
    const tr = state.tr;
    if (empty) {
      const marks = type.removeFromSet(state.storedMarks ?? state.selection.$from.marks());
      tr.setStoredMarks(attrs ? type.create(attrs).addToSet(marks) : marks);
    } else {
      tr.removeMark(from, to, type);
      if (attrs) tr.addMark(from, to, type.create(attrs));
    }
    dispatch(tr.scrollIntoView());
    return true;
  };
}

/** Marque active (au curseur, ou sur toute la sélection). */
export function markActive(state: EditorState, type: MarkType): boolean {
  const { from, to, empty, $from } = state.selection;
  if (empty) return !!type.isInSet(state.storedMarks ?? $from.marks());
  return state.doc.rangeHasMark(from, to, type);
}

export function markAttr<T>(state: EditorState, type: MarkType, key: string): T | null {
  const { empty, $from, from, to } = state.selection;
  const marks = empty ? (state.storedMarks ?? $from.marks()) : [];
  let mark = type.isInSet(marks);
  if (!empty)
    state.doc.nodesBetween(from, to, (node) => {
      mark ??= type.isInSet(node.marks) ?? undefined;
      return !mark;
    });
  return mark ? (mark.attrs[key] as T) : null;
}

/** Augmente ou réduit la taille de police selon l'échelle habituelle. */
export const FONT_SIZES = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
export function stepFontSize(current: number, delta: 1 | -1): number {
  if (delta > 0) return FONT_SIZES.find((s) => s > current) ?? Math.min(1638, current + 10);
  return [...FONT_SIZES].reverse().find((s) => s < current) ?? Math.max(1, current - 1);
}

export const clearFormatting: Command = (state, dispatch) => {
  const { from, to } = state.selection;
  if (dispatch) {
    const tr = state.tr;
    for (const type of Object.values(M)) if (type !== M.link) tr.removeMark(from, to, type);
    tr.setStoredMarks([]);
    for (const { node, pos } of selectedParagraphs(state)) tr.setNodeMarkup(pos, undefined, { ...node.attrs, style: "normal" });
    dispatch(tr);
  }
  return true;
};

export const insertPageBreak: Command = (state, dispatch) => {
  if (isInTable(state)) return false;
  if (dispatch) {
    const { $from } = state.selection;
    const tr = state.tr;
    // Coupe le paragraphe au curseur puis insère le saut entre les deux moitiés.
    tr.split($from.pos);
    const at = tr.mapping.map($from.pos);
    const breakPos = tr.doc.resolve(at).before();
    tr.insert(breakPos, S.page_break.create());
    tr.setSelection(TextSelection.create(tr.doc, breakPos + 2));
    dispatch(tr.scrollIntoView());
  }
  return true;
};

export function insertTable(rows: number, columns: number): Command {
  return (state, dispatch) => {
    if (isInTable(state)) return false;
    if (dispatch) {
      const cells = () => Array.from({ length: columns }, () => S.table_cell.createAndFill()!);
      const table = S.table.create(null, Array.from({ length: rows }, () => S.table_row.create(null, cells())));
      const tr = state.tr.replaceSelectionWith(table);
      // Place le curseur dans la première cellule.
      const start = tr.mapping.map(state.selection.from, -1);
      const $pos = tr.doc.resolve(Math.min(tr.doc.content.size, start + 3));
      tr.setSelection(TextSelection.near($pos));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function insertText(text: string): Command {
  return (state, dispatch) => {
    if (dispatch) dispatch(state.tr.insertText(text).scrollIntoView());
    return true;
  };
}

export const insertHardBreak: Command = (state, dispatch) => {
  if (dispatch) dispatch(state.tr.replaceSelectionWith(S.hard_break.create()).scrollIntoView());
  return true;
};

/** Entrée : un élément de liste vide sort de la liste ; après un titre, le paragraphe suivant est normal. */
const enter: Command = (state, dispatch) => {
  const { $from, empty } = state.selection;
  const para = $from.parent;
  if (empty && para.type === S.paragraph && para.attrs.list && para.content.size === 0) {
    return setParagraphAttrs({ list: null, level: 0 })(state, dispatch);
  }
  return splitBlockAs((node, atEnd) => {
    if (node.type !== S.paragraph) return null;
    const heading = node.attrs.style !== "normal" && node.attrs.style !== "quote";
    return { type: S.paragraph, attrs: atEnd && heading ? { ...node.attrs, style: "normal" } : node.attrs };
  })(state, dispatch);
};

const tab =
  (delta: 1 | -1): Command =>
  (state, dispatch) => {
    if (isInTable(state)) return goToNextCell(delta)(state, dispatch);
    const paragraphs = selectedParagraphs(state);
    if (paragraphs.some(({ node }) => node.attrs.list)) return changeIndent(delta)(state, dispatch);
    return delta > 0 ? insertText("\t")(state, dispatch) : changeIndent(-1)(state, dispatch);
  };

export interface EditorHooks {
  save: () => void;
  find: () => void;
  replace: () => void;
  link: () => void;
  print: () => void;
}

export function wordKeymap(hooks: EditorHooks): Plugin[] {
  const run = (fn: () => void): Command => () => {
    fn();
    return true;
  };
  return [
    keymap({
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
      "Mod-b": toggleMark(M.bold),
      "Mod-g": toggleMark(M.bold), // raccourci « Gras » des claviers français
      "Mod-i": toggleMark(M.italic),
      "Mod-u": toggleMark(M.underline),
      "Mod-=": (s, d) => setMark(M.script, markAttr(s, M.script, "kind") === "subscript" ? null : { kind: "subscript" })(s, d),
      "Mod-Shift-=": (s, d) => setMark(M.script, markAttr(s, M.script, "kind") === "superscript" ? null : { kind: "superscript" })(s, d),
      "Mod-+": (s, d) => setMark(M.script, markAttr(s, M.script, "kind") === "superscript" ? null : { kind: "superscript" })(s, d),
      "Mod-l": setParagraphAttrs({ align: "left" }),
      "Mod-e": setParagraphAttrs({ align: "center" }),
      "Mod-r": setParagraphAttrs({ align: "right" }),
      "Mod-j": setParagraphAttrs({ align: "justify" }),
      "Mod-Enter": insertPageBreak,
      "Shift-Enter": insertHardBreak,
      Enter: enter,
      Tab: tab(1),
      "Shift-Tab": tab(-1),
      "Mod-s": run(hooks.save),
      "Mod-f": run(hooks.find),
      "Mod-h": run(hooks.replace),
      "Mod-k": run(hooks.link),
      "Mod-p": run(hooks.print),
      "Mod-Space": clearFormatting,
    }),
    keymap(baseKeymap),
    inputRules({
      rules: [
        // « - » ou « * » suivi d'une espace en début de paragraphe : liste à puces ; « 1. » : numérotée.
        new InputRule(/^\s*([-*•])\s$/, (state, _m, start, end) => listRule(state, start, end, "bullet")),
        new InputRule(/^\s*1[.)]\s$/, (state, _m, start, end) => listRule(state, start, end, "ordered")),
      ],
    }),
  ];
}

function listRule(state: EditorState, start: number, end: number, kind: ListKind): Transaction | null {
  const $start = state.doc.resolve(start);
  if ($start.parent.type !== S.paragraph || $start.parent.attrs.list) return null;
  return state.tr.delete(start, end).setNodeMarkup($start.before(), undefined, { ...$start.parent.attrs, list: kind, level: 0 });
}


/** Occurrences d'un texte (dans chaque paragraphe, y compris à cheval sur plusieurs mises en forme). */
export function findAll(doc: PMNode, query: string, matchCase: boolean): Array<{ from: number; to: number }> {
  if (!query) return [];
  const needle = matchCase ? query : query.toLocaleLowerCase();
  const results: Array<{ from: number; to: number }> = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let text = "";
    const positions: number[] = [];
    node.forEach((child, offset) => {
      const t = child.isText ? (child.text ?? "") : "\n";
      for (let i = 0; i < t.length; i++) positions.push(pos + 1 + offset + i);
      text += t;
    });
    const haystack = matchCase ? text : text.toLocaleLowerCase();
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      results.push({ from: positions[index]!, to: positions[index + needle.length - 1]! + 1 });
      index = haystack.indexOf(needle, index + needle.length);
    }
    return false;
  });
  return results;
}

/** Remplace toutes les occurrences en une seule étape annulable ; renvoie le nombre de remplacements. */
export function replaceAll(state: EditorState, dispatch: (tr: Transaction) => void, query: string, replacement: string, matchCase: boolean): number {
  const matches = findAll(state.doc, query, matchCase);
  if (matches.length === 0) return 0;
  const tr = state.tr;
  for (const { from, to } of [...matches].reverse()) {
    const marks = state.doc.resolve(from + 1).marks();
    if (replacement) tr.replaceWith(from, to, schema.text(replacement, marks));
    else tr.delete(from, to);
  }
  dispatch(tr);
  return matches.length;
}

export type CaseMode = "upper" | "lower" | "sentence" | "title";

/** Transforme la casse du texte sélectionné en conservant la mise en forme de chaque portion. */
export function changeCase(mode: CaseMode): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) return false;
    if (dispatch) {
      const tr = state.tr;
      const edits: Array<{ start: number; end: number; text: string; marks: readonly import("prosemirror-model").Mark[] }> = [];
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isText || !node.text) return true;
        const start = Math.max(from, pos);
        const end = Math.min(to, pos + node.nodeSize);
        const original = node.text.slice(start - pos, end - pos);
        // Caractère précédent (dans le paragraphe) pour savoir si l'on commence un mot ou une phrase.
        const $start = state.doc.resolve(start);
        let before = state.doc.textBetween($start.start(), start, "\n", "\n");
        let text = "";
        for (const ch of original) {
          const prev = before.trimEnd();
          const startsWord = before === "" || /[\s(«"'’\-–—/]$/.test(before);
          const startsSentence = prev === "" || /[.!?…]$/.test(prev);
          const upper = mode === "upper" || (mode === "title" && startsWord) || (mode === "sentence" && startsSentence && /\p{L}/u.test(ch));
          const next = upper ? ch.toLocaleUpperCase() : ch.toLocaleLowerCase();
          text += next;
          before += ch;
        }
        if (text !== original) edits.push({ start, end, text, marks: node.marks });
        return false;
      });
      for (const e of edits.reverse()) tr.replaceWith(e.start, e.end, schema.text(e.text, e.marks));
      // La sélection couvre toujours le texte transformé (sa longueur peut changer : « ß » → « SS »).
      tr.setSelection(TextSelection.create(tr.doc, from, tr.mapping.map(to)));
      dispatch(tr);
    }
    return true;
  };
}
