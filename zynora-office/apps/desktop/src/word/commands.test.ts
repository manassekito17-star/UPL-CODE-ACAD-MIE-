import { EditorState, TextSelection } from "prosemirror-state";
import { describe, expect, it } from "vitest";

import { changeIndent, findAll, insertPageBreak, replaceAll, stepFontSize, toggleList } from "./commands";
import { schema } from "./schema";

const p = (text: string, attrs: Record<string, unknown> = {}) => schema.nodes.paragraph.create(attrs, text ? schema.text(text) : []);

function state(...paragraphs: ReturnType<typeof p>[]) {
  return EditorState.create({ doc: schema.nodes.doc.create(null, paragraphs) });
}

function run(s: EditorState, command: (s: EditorState, d: (tr: import("prosemirror-state").Transaction) => void) => boolean) {
  let next = s;
  command(s, (tr) => (next = s.apply(tr)));
  return next;
}

describe("commandes de ZYNORA Word", () => {
  it("bascule une liste et règle les niveaux (0 à 8) ou le retrait", () => {
    let s = state(p("a"));
    s = run(s, toggleList("bullet"));
    expect(s.doc.firstChild?.attrs).toMatchObject({ list: "bullet", level: 0 });
    for (let i = 0; i < 12; i++) s = run(s, changeIndent(1));
    expect(s.doc.firstChild?.attrs.level).toBe(8);
    s = run(s, toggleList("bullet"));
    expect(s.doc.firstChild?.attrs.list).toBeNull();
    s = run(s, changeIndent(1));
    expect(s.doc.firstChild?.attrs.indentLeft).toBe(12.7);
    s = run(s, changeIndent(-1));
    s = run(s, changeIndent(-1));
    expect(s.doc.firstChild?.attrs.indentLeft).toBe(0);
  });

  it("trouve le texte à cheval sur plusieurs mises en forme et remplace tout", () => {
    const bold = schema.marks.bold.create();
    const doc = schema.nodes.doc.create(null, [schema.nodes.paragraph.create(null, [schema.text("Bon"), schema.text("jour", [bold]), schema.text(" bonjour")])]);
    let s = EditorState.create({ doc });
    expect(findAll(s.doc, "bonjour", false)).toEqual([
      { from: 1, to: 8 },
      { from: 9, to: 16 },
    ]);
    expect(findAll(s.doc, "bonjour", true)).toHaveLength(1);
    const n = replaceAll(s, (tr) => (s = s.apply(tr)), "bonjour", "salut", false);
    expect(n).toBe(2);
    expect(s.doc.textContent).toBe("salut salut");
  });

  it("insère un saut de page au curseur", () => {
    let s = state(p("avantaprès"));
    s = s.apply(s.tr.setSelection(TextSelection.create(s.doc, 6)));
    s = run(s, insertPageBreak);
    expect(s.doc.childCount).toBe(3);
    expect(s.doc.child(1).type.name).toBe("page_break");
    expect(s.doc.child(0).textContent).toBe("avant");
    expect(s.doc.child(2).textContent).toBe("après");
  });

  it("augmente et réduit la taille de police selon l'échelle", () => {
    expect(stepFontSize(11, 1)).toBe(12);
    expect(stepFontSize(12, -1)).toBe(11);
    expect(stepFontSize(72, 1)).toBe(82);
    expect(stepFontSize(8, -1)).toBe(7);
  });
});

describe("modifier la casse", () => {
  const sel = (s: EditorState) => s.apply(s.tr.setSelection(TextSelection.create(s.doc, 1, s.doc.content.size - 1)));
  const bold = schema.marks.bold.create();
  const doc = () => EditorState.create({ doc: schema.nodes.doc.create(null, [schema.nodes.paragraph.create(null, [schema.text("bonjour le "), schema.text("MONDE", [bold]), schema.text(". encore ici")])]) });

  it("majuscules, minuscules, phrase et mots, mise en forme conservée", async () => {
    const { changeCase } = await import("./commands");
    const apply = (mode: Parameters<typeof changeCase>[0]) => run(sel(doc()), changeCase(mode)).doc;
    expect(apply("upper").textContent).toBe("BONJOUR LE MONDE. ENCORE ICI");
    expect(apply("lower").textContent).toBe("bonjour le monde. encore ici");
    expect(apply("sentence").textContent).toBe("Bonjour le monde. Encore ici");
    expect(apply("title").textContent).toBe("Bonjour Le Monde. Encore Ici");
    const marked = apply("lower").firstChild!.child(1);
    expect(marked.text).toBe("monde");
    expect(marked.marks.map((m) => m.type.name)).toEqual(["bold"]);
  });
});
