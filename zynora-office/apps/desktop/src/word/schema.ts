/**
 * Schéma ProseMirror de ZYNORA Word. Il reflète exactement le modèle du moteur Rust
 * (packages/document-engine) : paragraphes « à plat » portant style, alignement, liste,
 * retraits et espacements ; marques de caractère ; tableaux simples ; sauts de page.
 */
import { Schema, type DOMOutputSpec, type Mark, type Node as PMNode } from "prosemirror-model";
import { tableNodes } from "prosemirror-tables";

export type ParagraphStyle = "normal" | "title" | "heading1" | "heading2" | "heading3" | "quote";
export type Align = "left" | "center" | "right" | "justify";
export type ListKind = "bullet" | "ordered";

export const STYLE_TAGS: Record<ParagraphStyle, string> = {
  normal: "p",
  title: "p",
  heading1: "h1",
  heading2: "h2",
  heading3: "h3",
  quote: "blockquote",
};

/** Surlignages autorisés par le format DOCX (nom Word → couleur affichée). */
export const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: "#ffff00",
  green: "#00ff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  blue: "#0000ff",
  red: "#ff0000",
  darkBlue: "#000080",
  darkCyan: "#008080",
  darkGreen: "#008000",
  darkMagenta: "#800080",
  darkRed: "#800000",
  darkYellow: "#808000",
  darkGray: "#808080",
  lightGray: "#c0c0c0",
  black: "#000000",
};

function num(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function paragraphDom(node: PMNode): DOMOutputSpec {
  const a = node.attrs;
  const style: string[] = [];
  if (a.align !== "left") style.push(`text-align:${a.align}`);
  // Les retraits d'une liste sont gérés par la feuille de style (niveaux).
  if (!a.list) {
    if (a.indentLeft) style.push(`margin-left:${a.indentLeft}mm`);
    if (a.firstLine) style.push(`text-indent:${a.firstLine}mm`);
  }
  if (a.spaceBefore != null) style.push(`margin-top:${a.spaceBefore}pt`);
  if (a.spaceAfter != null) style.push(`margin-bottom:${a.spaceAfter}pt`);
  if (a.lineSpacing != null) style.push(`line-height:${(a.lineSpacing * 1.15).toFixed(3)}`);
  const attrs: Record<string, string> = { class: `wp wp--${a.style}` };
  if (style.length) attrs.style = style.join(";");
  if (a.list) {
    attrs["data-list"] = a.list;
    attrs["data-level"] = String(a.level);
  }
  return [STYLE_TAGS[a.style as ParagraphStyle], attrs, 0];
}

function paragraphAttrs(dom: HTMLElement, style: ParagraphStyle) {
  const s = dom.style;
  const align = (["center", "right", "justify"] as const).find((v) => s.textAlign === v) ?? "left";
  const list = dom.getAttribute("data-list");
  return {
    style: (dom.className.match(/wp--(\w+)/)?.[1] as ParagraphStyle | undefined) ?? style,
    align,
    list: list === "bullet" || list === "ordered" ? list : null,
    level: Math.min(8, Math.max(0, num(dom.getAttribute("data-level")) ?? 0)),
  };
}

const [table, tableRow, tableCell, tableHeader] = (() => {
  const nodes = tableNodes({ tableGroup: "block", cellContent: "paragraph+", cellAttributes: {} });
  return [nodes.table, nodes.table_row, nodes.table_cell, nodes.table_header];
})();

export const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: {
      group: "block",
      content: "inline*",
      attrs: {
        style: { default: "normal" },
        align: { default: "left" },
        list: { default: null },
        level: { default: 0 },
        indentLeft: { default: 0 },
        firstLine: { default: 0 },
        spaceBefore: { default: null },
        spaceAfter: { default: null },
        lineSpacing: { default: null },
      },
      parseDOM: [
        { tag: "h1", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "heading1") },
        { tag: "h2", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "heading2") },
        { tag: "h3", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "heading3") },
        { tag: "h4", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "heading3") },
        { tag: "blockquote", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "quote") },
        { tag: "p", getAttrs: (d) => paragraphAttrs(d as HTMLElement, "normal") },
        { tag: "li", getAttrs: (d) => ({ ...paragraphAttrs(d as HTMLElement, "normal"), list: (d as HTMLElement).closest("ol") ? "ordered" : "bullet" }) },
      ],
      toDOM: paragraphDom,
    },
    page_break: {
      group: "block",
      atom: true,
      selectable: true,
      parseDOM: [{ tag: "hr.wp-page-break" }],
      toDOM: () => ["hr", { class: "wp-page-break" }],
    },
    table,
    table_row: tableRow,
    table_cell: tableCell,
    table_header: tableHeader,
    text: { group: "inline" },
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      leafText: () => "\n",
      parseDOM: [{ tag: "br" }],
      toDOM: () => ["br"],
    },
  },
  marks: {
    link: {
      attrs: { href: {} },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: (d) => {
            const href = (d as HTMLElement).getAttribute("href") ?? "";
            return isSafeLink(href) ? { href } : false;
          },
        },
      ],
      // Lien affiché mais jamais suivi par un simple clic dans l'éditeur.
      toDOM: (m: Mark) => ["a", { href: m.attrs.href, title: m.attrs.href, rel: "noopener noreferrer" }, 0],
    },
    bold: {
      parseDOM: [{ tag: "strong" }, { tag: "b" }, { style: "font-weight", getAttrs: (v) => (/^(bold(er)?|[6-9]\d\d)$/.test(v as string) ? null : false) }],
      toDOM: () => ["strong", 0],
    },
    italic: { parseDOM: [{ tag: "em" }, { tag: "i" }, { style: "font-style=italic" }], toDOM: () => ["em", 0] },
    underline: { parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }], toDOM: () => ["u", 0] },
    strike: { parseDOM: [{ tag: "s" }, { tag: "del" }, { style: "text-decoration=line-through" }], toDOM: () => ["s", 0] },
    script: {
      attrs: { kind: {} },
      excludes: "script",
      parseDOM: [
        { tag: "sup", attrs: { kind: "superscript" } },
        { tag: "sub", attrs: { kind: "subscript" } },
      ],
      toDOM: (m: Mark) => [m.attrs.kind === "superscript" ? "sup" : "sub", 0],
    },
    color: {
      attrs: { value: {} },
      parseDOM: [{ tag: "span[data-color]", getAttrs: (d) => ({ value: (d as HTMLElement).getAttribute("data-color") }) }],
      toDOM: (m: Mark) => ["span", { "data-color": m.attrs.value, style: `color:${m.attrs.value}` }, 0],
    },
    highlight: {
      attrs: { value: {} },
      parseDOM: [
        {
          tag: "mark[data-highlight]",
          getAttrs: (d) => {
            const v = (d as HTMLElement).getAttribute("data-highlight") ?? "";
            return v in HIGHLIGHT_COLORS ? { value: v } : false;
          },
        },
      ],
      toDOM: (m: Mark) => ["mark", { "data-highlight": m.attrs.value, style: `background:${HIGHLIGHT_COLORS[m.attrs.value as string] ?? "#ffff00"}` }, 0],
    },
    size: {
      attrs: { pt: {} },
      parseDOM: [{ tag: "span[data-size]", getAttrs: (d) => ({ pt: num((d as HTMLElement).getAttribute("data-size")) ?? 11 }) }],
      toDOM: (m: Mark) => ["span", { "data-size": String(m.attrs.pt), style: `font-size:${m.attrs.pt}pt` }, 0],
    },
    font: {
      attrs: { name: {} },
      parseDOM: [{ tag: "span[data-font]", getAttrs: (d) => ({ name: (d as HTMLElement).getAttribute("data-font") }) }],
      toDOM: (m: Mark) => ["span", { "data-font": m.attrs.name, style: `font-family:${cssFont(m.attrs.name as string)}` }, 0],
    },
  },
});

/** Nom de police sûr pour une déclaration CSS. */
export function cssFont(name: string): string {
  return `"${name.replace(/["\;<>{}]/g, "")}", sans-serif`;
}

/** Même règle que le moteur Rust : liens web ou adresses électroniques uniquement. */
export function isSafeLink(url: string): boolean {
  const lower = url.trim().toLowerCase();
  // eslint-disable-next-line no-control-regex
  return (lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("mailto:")) && !/[\u0000-\u001f\u007f]/.test(url) && url.length <= 2048;
}
