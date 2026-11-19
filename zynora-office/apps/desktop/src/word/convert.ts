/** Conversion entre le modèle du moteur Rust (JSON) et le document ProseMirror. */
import type { Mark, Node as PMNode } from "prosemirror-model";

import type { DocBlock, DocModel, DocParagraph, DocRun } from "../ipc";
import { schema } from "./schema";

function marksFor(run: DocRun): Mark[] {
  const m = schema.marks;
  const marks: Mark[] = [];
  if (run.link) marks.push(m.link.create({ href: run.link }));
  if (run.bold) marks.push(m.bold.create());
  if (run.italic) marks.push(m.italic.create());
  if (run.underline) marks.push(m.underline.create());
  if (run.strike) marks.push(m.strike.create());
  if (run.script) marks.push(m.script.create({ kind: run.script }));
  if (run.color) marks.push(m.color.create({ value: run.color }));
  if (run.highlight) marks.push(m.highlight.create({ value: run.highlight }));
  if (run.size_pt) marks.push(m.size.create({ pt: run.size_pt }));
  if (run.font) marks.push(m.font.create({ name: run.font }));
  return marks;
}

function paragraphNode(p: DocParagraph): PMNode {
  const inline: PMNode[] = [];
  for (const run of p.runs ?? []) {
    const marks = marksFor(run);
    run.text.split("\n").forEach((part, i) => {
      if (i > 0) inline.push(schema.nodes.hard_break.create());
      if (part) inline.push(schema.text(part, marks));
    });
  }
  return schema.nodes.paragraph.create(
    {
      style: p.style ?? "normal",
      align: p.align ?? "left",
      list: p.list?.kind ?? null,
      level: p.list?.level ?? 0,
      indentLeft: p.indent_left_mm ?? 0,
      firstLine: p.first_line_mm ?? 0,
      spaceBefore: p.space_before_pt ?? null,
      spaceAfter: p.space_after_pt ?? null,
      lineSpacing: p.line_spacing ?? null,
    },
    inline,
  );
}

export function toProseMirror(doc: DocModel): PMNode {
  const blocks: PMNode[] = doc.blocks.map((b) => {
    if (b.type === "page_break") return schema.nodes.page_break.create();
    if (b.type === "table") {
      const width = Math.max(1, ...b.rows.map((r) => r.length));
      const rows = b.rows.map((row) => {
        const cells = row.map((c) => schema.nodes.table_cell.create(null, (c.paragraphs.length ? c.paragraphs : [{ runs: [] }]).map(paragraphNode)));
        // prosemirror-tables exige des lignes de même largeur.
        while (cells.length < width) cells.push(schema.nodes.table_cell.createAndFill()!);
        return schema.nodes.table_row.create(null, cells);
      });
      return schema.nodes.table.create(null, rows);
    }
    return paragraphNode(b);
  });
  if (blocks.length === 0) blocks.push(schema.nodes.paragraph.create());
  return schema.nodes.doc.create(null, blocks);
}

function runFor(text: string, marks: readonly Mark[]): DocRun {
  const run: DocRun = { text };
  for (const mark of marks) {
    switch (mark.type.name) {
      case "link":
        run.link = mark.attrs.href;
        break;
      case "bold":
      case "italic":
      case "underline":
      case "strike":
        run[mark.type.name] = true;
        break;
      case "script":
        run.script = mark.attrs.kind;
        break;
      case "color":
        run.color = mark.attrs.value;
        break;
      case "highlight":
        run.highlight = mark.attrs.value;
        break;
      case "size":
        run.size_pt = mark.attrs.pt;
        break;
      case "font":
        run.font = mark.attrs.name;
        break;
    }
  }
  return run;
}

const sameFormat = (a: DocRun, b: DocRun) => JSON.stringify({ ...a, text: "" }) === JSON.stringify({ ...b, text: "" });

function paragraphModel(node: PMNode): DocParagraph {
  const a = node.attrs;
  const runs: DocRun[] = [];
  node.forEach((child) => {
    const run = child.isText ? runFor(child.text ?? "", child.marks) : child.type.name === "hard_break" ? runFor("\n", child.marks) : null;
    if (!run) return;
    const last = runs[runs.length - 1];
    // Un retour à la ligne s'accole au texte qui le précède (comme dans le moteur).
    if (last && (sameFormat(last, run) || run.text === "\n")) last.text += run.text;
    else runs.push(run);
  });
  const p: DocParagraph = { style: a.style, align: a.align, runs };
  if (a.list) p.list = { kind: a.list, level: a.level };
  if (a.indentLeft) p.indent_left_mm = a.indentLeft;
  if (a.firstLine) p.first_line_mm = a.firstLine;
  if (a.spaceBefore != null) p.space_before_pt = a.spaceBefore;
  if (a.spaceAfter != null) p.space_after_pt = a.spaceAfter;
  if (a.lineSpacing != null) p.line_spacing = a.lineSpacing;
  return p;
}

export function fromProseMirror(doc: PMNode, page: DocModel["page"]): DocModel {
  const blocks: DocBlock[] = [];
  doc.forEach((node) => {
    if (node.type.name === "page_break") blocks.push({ type: "page_break" });
    else if (node.type.name === "table") {
      const rows: Array<Array<{ paragraphs: DocParagraph[] }>> = [];
      node.forEach((row) => {
        const cells: Array<{ paragraphs: DocParagraph[] }> = [];
        row.forEach((cell) => {
          const paragraphs: DocParagraph[] = [];
          cell.forEach((p) => paragraphs.push(paragraphModel(p)));
          cells.push({ paragraphs });
        });
        rows.push(cells);
      });
      blocks.push({ type: "table", rows });
    } else blocks.push({ type: "paragraph", ...paragraphModel(node) });
  });
  return { page, blocks };
}

/** Nombre de mots et de caractères (mêmes règles que le moteur : espaces compris, sauts exclus). */
export function countWords(doc: PMNode): { words: number; characters: number; charactersNoSpaces: number; paragraphs: number } {
  let words = 0;
  let characters = 0;
  let charactersNoSpaces = 0;
  let paragraphs = 0;
  doc.descendants((node) => {
    if (node.type.name !== "paragraph") return true;
    const text = node.textContent;
    if (text.trim()) paragraphs++;
    words += text.split(/\s+/).filter(Boolean).length;
    characters += [...text].length;
    charactersNoSpaces += [...text.replace(/\s/g, "")].length;
    return false;
  });
  return { words, characters, charactersNoSpaces, paragraphs };
}
