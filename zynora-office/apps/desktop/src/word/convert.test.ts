import { describe, expect, it } from "vitest";

import type { DocModel } from "../ipc";
import { countWords, fromProseMirror, toProseMirror } from "./convert";

const page: DocModel["page"] = {
  orientation: "portrait",
  width_mm: 210,
  height_mm: 297,
  margin_top_mm: 25,
  margin_right_mm: 25,
  margin_bottom_mm: 25,
  margin_left_mm: 25,
};

const model: DocModel = {
  page,
  blocks: [
    { type: "paragraph", style: "title", align: "center", runs: [{ text: "Rapport" }] },
    {
      type: "paragraph",
      style: "normal",
      align: "justify",
      indent_left_mm: 10,
      first_line_mm: -5,
      space_after_pt: 6,
      line_spacing: 1.5,
      runs: [
        { text: "Texte " },
        { text: "gras", bold: true },
        { text: " lien", link: "https://exemple.fr", underline: true },
        { text: " H" },
        { text: "2", script: "subscript" },
        { text: "O\nligne\tsuivante" },
        { text: "rouge", color: "#c00000", highlight: "yellow", size_pt: 14, font: "Arial", italic: true, strike: true },
      ],
    },
    { type: "paragraph", style: "normal", align: "left", list: { kind: "bullet", level: 1 }, runs: [{ text: "puce" }] },
    { type: "page_break" },
    {
      type: "table",
      rows: [
        [{ paragraphs: [{ style: "normal", align: "left", runs: [{ text: "a" }] }] }, { paragraphs: [{ style: "normal", align: "right", runs: [] }] }],
      ],
    },
    { type: "paragraph", style: "heading2", align: "left", runs: [] },
  ],
};

describe("conversion modèle ↔ ProseMirror", () => {
  it("fait l'aller-retour sans perte", () => {
    const doc = toProseMirror(model);
    expect(fromProseMirror(doc, page)).toEqual(model);
  });

  it("compte les mots et caractères", () => {
    const counts = countWords(toProseMirror(model));
    expect(counts.words).toBe(9);
    expect(counts.paragraphs).toBe(4);
  });

  it("produit toujours un document éditable", () => {
    const doc = toProseMirror({ page, blocks: [] });
    expect(doc.childCount).toBe(1);
    expect(doc.firstChild?.type.name).toBe("paragraph");
  });
});
