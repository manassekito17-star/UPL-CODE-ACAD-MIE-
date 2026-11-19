import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  CalendarClock,
  ClipboardPaste,
  Copy,
  Eraser,
  FileText,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Omega,
  Paintbrush,
  Pilcrow,
  Plus,
  Printer,
  Replace,
  Scissors,
  Search,
  SeparatorHorizontal,
  SpellCheck,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TextSelect,
  Underline,
  Unlink,
  WrapText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { EditorState } from "prosemirror-state";

import type { DocPage } from "../ipc";
import { Check, ColorTool, Group, Menu, Select, Tool } from "../ribbon/controls";
import { FONTS } from "../sheets/ribbon-text";
import { FONT_SIZES, markActive, markAttr, selectedParagraphs } from "./commands";
import { HIGHLIGHT_COLORS, schema } from "./schema";
import { LINE_SPACINGS, MARGIN_PRESETS, PAGE_SIZES, PARAGRAPH_SPACINGS, STYLES, type WordText } from "./word-text";

export type WordTab = "home" | "insert" | "layout" | "review" | "view";
export type WordDialogKind = "find" | "replace" | "link" | "symbol" | "table" | "margins" | "paragraph" | "wordCount" | "saveCopy";
const TABS: WordTab[] = ["home", "insert", "layout", "review", "view"];
const M = schema.marks;

export interface WordActions {
  clipboard: (kind: "cut" | "copy" | "paste") => void;
  painter: () => void;
  painterActive: boolean;
  toggle: (mark: "bold" | "italic" | "underline" | "strike") => void;
  script: (kind: "superscript" | "subscript") => void;
  font: (name: string) => void;
  size: (pt: number) => void;
  sizeStep: (delta: 1 | -1) => void;
  color: (value: string) => void;
  highlight: (value: string | null) => void;
  clear: () => void;
  list: (kind: "bullet" | "ordered") => void;
  indent: (delta: 1 | -1) => void;
  paragraph: (attrs: Record<string, unknown>) => void;
  open: (dialog: WordDialogKind) => void;
  selectAll: () => void;
  pageBreak: () => void;
  lineBreak: () => void;
  table: (op: "insert2x2" | "insert3x3" | "insert4x4" | "rowBefore" | "rowAfter" | "colBefore" | "colAfter" | "deleteRow" | "deleteCol" | "delete") => void;
  inTable: boolean;
  unlink: () => void;
  insertDate: (format: "short" | "long" | "time") => void;
  page: (change: Partial<DocPage>) => void;
  pageInfo: DocPage;
  marks: boolean;
  toggleMarks: () => void;
  spellcheck: boolean;
  toggleSpellcheck: () => void;
  zoom: number;
  setZoom: (zoom: number | "page") => void;
  print: () => void;
}

interface Props {
  w: WordText;
  tab: WordTab;
  onTab: (tab: WordTab) => void;
  state: EditorState;
  actions: WordActions;
  language: "fr" | "en";
}

export function WordRibbon({ w, tab, onTab, state, actions: a, language }: Props) {
  const para = selectedParagraphs(state)[0]?.node.attrs;
  const align = (value: string) => para?.align === value;
  const font = markAttr<string>(state, M.font, "name") ?? "Calibri";
  const size = markAttr<number>(state, M.size, "pt") ?? 11;
  const color = markAttr<string>(state, M.color, "value") ?? "#000000";
  const script = markAttr<string>(state, M.script, "kind");
  const now = new Date();
  const locale = language === "fr" ? "fr-FR" : "en-GB";
  const sizeLabel = PAGE_SIZES.find((s) => Math.abs(Math.min(s.width, s.height) - Math.min(a.pageInfo.width_mm, a.pageInfo.height_mm)) < 1 && Math.abs(Math.max(s.width, s.height) - Math.max(a.pageInfo.width_mm, a.pageInfo.height_mm)) < 1);
  return (
    <div className="ribbon">
      <div className="ribbon__tabs" role="tablist" aria-label="Ruban">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`word-tab-${key}`}
            aria-selected={tab === key}
            aria-controls="word-ribbon-panel"
            className="ribbon__tab"
            onClick={() => onTab(key)}
          >
            {w(`tab.${key}`)}
          </button>
        ))}
      </div>
      <div className="ribbon__panel" id="word-ribbon-panel" role="tabpanel" aria-labelledby={`word-tab-${tab}`}>
        {tab === "home" && (
          <>
            <Group label={w("group.clipboard")}>
              <Tool label={w("paste")} icon={<ClipboardPaste size={18} />} onClick={() => a.clipboard("paste")} />
              <Tool label={w("cut")} icon={<Scissors size={16} />} onClick={() => a.clipboard("cut")} />
              <Tool label={w("copy")} icon={<Copy size={16} />} onClick={() => a.clipboard("copy")} />
              <Tool label={w("painter")} icon={<Paintbrush size={16} />} pressed={a.painterActive} onClick={a.painter} />
            </Group>
            <Group label={w("group.font")}>
              <Select label={w("fontName")} value={font} options={FONTS.map((f) => ({ value: f, label: f }))} onChange={a.font} wide />
              <Select label={w("fontSize")} value={String(size)} options={FONT_SIZES.map((s) => ({ value: String(s), label: String(s).replace(".", language === "fr" ? "," : ".") }))} onChange={(v) => a.size(Number(v))} />
              <Tool label={w("grow")} icon={<Plus size={14} />} onClick={() => a.sizeStep(1)} />
              <Tool label={w("shrink")} icon={<Minus size={14} />} onClick={() => a.sizeStep(-1)} />
              <Tool label={w("bold")} icon={<Bold size={16} />} pressed={markActive(state, M.bold)} onClick={() => a.toggle("bold")} />
              <Tool label={w("italic")} icon={<Italic size={16} />} pressed={markActive(state, M.italic)} onClick={() => a.toggle("italic")} />
              <Tool label={w("underline")} icon={<Underline size={16} />} pressed={markActive(state, M.underline)} onClick={() => a.toggle("underline")} />
              <Tool label={w("strike")} icon={<Strikethrough size={16} />} pressed={markActive(state, M.strike)} onClick={() => a.toggle("strike")} />
              <Tool label={w("subscript")} icon={<Subscript size={16} />} pressed={script === "subscript"} onClick={() => a.script("subscript")} />
              <Tool label={w("superscript")} icon={<Superscript size={16} />} pressed={script === "superscript"} onClick={() => a.script("superscript")} />
              <ColorTool label={w("color")} icon={<Baseline size={16} />} value={color} onPick={a.color} />
              <Menu
                label={w("highlight")}
                icon={<Highlighter size={16} />}
                items={[
                  { label: w("highlight.none"), run: () => a.highlight(null) },
                  ...Object.keys(HIGHLIGHT_COLORS).map((name) => ({ label: name, run: () => a.highlight(name) })),
                ]}
              />
              <Tool label={w("clear")} icon={<Eraser size={16} />} onClick={a.clear} />
            </Group>
            <Group label={w("group.paragraph")}>
              <Tool label={w("bullets")} icon={<List size={16} />} pressed={para?.list === "bullet"} onClick={() => a.list("bullet")} />
              <Tool label={w("numbering")} icon={<ListOrdered size={16} />} pressed={para?.list === "ordered"} onClick={() => a.list("ordered")} />
              <Tool label={w("outdent")} icon={<IndentDecrease size={16} />} onClick={() => a.indent(-1)} />
              <Tool label={w("indent")} icon={<IndentIncrease size={16} />} onClick={() => a.indent(1)} />
              <Tool label={w("left")} icon={<AlignLeft size={16} />} pressed={align("left")} onClick={() => a.paragraph({ align: "left" })} />
              <Tool label={w("center")} icon={<AlignCenter size={16} />} pressed={align("center")} onClick={() => a.paragraph({ align: "center" })} />
              <Tool label={w("right")} icon={<AlignRight size={16} />} pressed={align("right")} onClick={() => a.paragraph({ align: "right" })} />
              <Tool label={w("justify")} icon={<AlignJustify size={16} />} pressed={align("justify")} onClick={() => a.paragraph({ align: "justify" })} />
              <Menu
                label={w("lineSpacing")}
                icon={<WrapText size={16} />}
                items={[
                  ...LINE_SPACINGS.map((v) => ({ label: `${para?.lineSpacing === v ? "✓ " : ""}${v.toLocaleString(locale)}`, run: () => a.paragraph({ lineSpacing: v }) })),
                  { label: w("spacing.default"), run: () => a.paragraph({ lineSpacing: null }) },
                  { label: w("paragraphDialog"), run: () => a.open("paragraph") },
                ]}
              />
              <Tool label={w("marks")} icon={<Pilcrow size={16} />} pressed={a.marks} onClick={a.toggleMarks} />
            </Group>
            <Group label={w("group.styles")}>
              <div className="word-styles" role="listbox" aria-label={w("group.styles")}>
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={para?.style === s}
                    className={`word-style word-style--${s}`}
                    onClick={() => a.paragraph({ style: s })}
                  >
                    {w(`style.${s}`)}
                  </button>
                ))}
              </div>
            </Group>
            <Group label={w("group.editing")}>
              <Tool label={w("find")} icon={<Search size={16} />} onClick={() => a.open("find")} />
              <Tool label={w("replace")} icon={<Replace size={16} />} onClick={() => a.open("replace")} />
              <Tool label={w("selectAll")} icon={<TextSelect size={16} />} onClick={a.selectAll} />
            </Group>
          </>
        )}

        {tab === "insert" && (
          <>
            <Group label={w("group.pages")}>
              <Tool label={w("pageBreak")} icon={<SeparatorHorizontal size={16} />} onClick={a.pageBreak} wide />
              <Tool label={w("lineBreak")} icon={<WrapText size={16} />} onClick={a.lineBreak} />
            </Group>
            <Group label={w("group.tables")}>
              <Menu
                label={w("table")}
                icon={<Table size={16} />}
                text
                items={[
                  { label: w("table.insert", { rows: 2, columns: 2 }), run: () => a.table("insert2x2"), disabled: a.inTable },
                  { label: w("table.insert", { rows: 3, columns: 3 }), run: () => a.table("insert3x3"), disabled: a.inTable },
                  { label: w("table.insert", { rows: 4, columns: 4 }), run: () => a.table("insert4x4"), disabled: a.inTable },
                  { label: w("table.custom"), run: () => a.open("table"), disabled: a.inTable },
                  { label: w("table.rowBefore"), run: () => a.table("rowBefore"), disabled: !a.inTable },
                  { label: w("table.rowAfter"), run: () => a.table("rowAfter"), disabled: !a.inTable },
                  { label: w("table.colBefore"), run: () => a.table("colBefore"), disabled: !a.inTable },
                  { label: w("table.colAfter"), run: () => a.table("colAfter"), disabled: !a.inTable },
                  { label: w("table.deleteRow"), run: () => a.table("deleteRow"), disabled: !a.inTable },
                  { label: w("table.deleteCol"), run: () => a.table("deleteCol"), disabled: !a.inTable },
                  { label: w("table.delete"), run: () => a.table("delete"), disabled: !a.inTable },
                ]}
              />
            </Group>
            <Group label={w("group.links")}>
              <Tool label={w("link")} icon={<Link size={16} />} onClick={() => a.open("link")} wide />
              <Tool label={w("unlink")} icon={<Unlink size={16} />} disabled={!markActive(state, M.link)} onClick={a.unlink} />
            </Group>
            <Group label={w("group.text")}>
              <Menu
                label={w("date")}
                icon={<CalendarClock size={16} />}
                text
                items={[
                  { label: now.toLocaleDateString(locale), run: () => a.insertDate("short") },
                  { label: now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), run: () => a.insertDate("long") },
                  { label: now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }), run: () => a.insertDate("time") },
                ]}
              />
            </Group>
            <Group label={w("group.symbols")}>
              <Tool label={w("symbol")} icon={<Omega size={16} />} onClick={() => a.open("symbol")} wide />
            </Group>
          </>
        )}

        {tab === "layout" && (
          <>
            <Group label={w("group.page")}>
              <Menu
                label={w("margins")}
                text
                items={[
                  ...MARGIN_PRESETS.map((m) => ({
                    label: w(m.key),
                    run: () => a.page({ margin_top_mm: m.top, margin_right_mm: m.right, margin_bottom_mm: m.bottom, margin_left_mm: m.left }),
                  })),
                  { label: w("margins.custom"), run: () => a.open("margins") },
                ]}
              />
              <Menu
                label={w("orientation")}
                text
                items={[
                  { label: `${a.pageInfo.orientation === "portrait" ? "✓ " : ""}${w("portrait")}`, run: () => a.page({ orientation: "portrait" }) },
                  { label: `${a.pageInfo.orientation === "landscape" ? "✓ " : ""}${w("landscape")}`, run: () => a.page({ orientation: "landscape" }) },
                ]}
              />
              <Menu
                label={`${w("size")}${sizeLabel ? ` : ${sizeLabel.label.split(" ")[0]}` : ""}`}
                text
                items={PAGE_SIZES.map((s) => ({ label: s.label, run: () => a.page({ width_mm: s.width, height_mm: s.height }) }))}
              />
            </Group>
            <Group label={w("group.indent")}>
              <Tool label={w("outdent")} icon={<IndentDecrease size={16} />} onClick={() => a.indent(-1)} />
              <Tool label={w("indent")} icon={<IndentIncrease size={16} />} onClick={() => a.indent(1)} />
              <Tool label={w("paragraphDialog")} wide onClick={() => a.open("paragraph")} />
            </Group>
            <Group label={w("group.spacing")}>
              <Menu
                label={w("spaceBefore")}
                text
                items={[
                  ...PARAGRAPH_SPACINGS.map((v) => ({ label: `${para?.spaceBefore === v ? "✓ " : ""}${v} pt`, run: () => a.paragraph({ spaceBefore: v }) })),
                  { label: w("spacing.default"), run: () => a.paragraph({ spaceBefore: null }) },
                ]}
              />
              <Menu
                label={w("spaceAfter")}
                text
                items={[
                  ...PARAGRAPH_SPACINGS.map((v) => ({ label: `${para?.spaceAfter === v ? "✓ " : ""}${v} pt`, run: () => a.paragraph({ spaceAfter: v }) })),
                  { label: w("spacing.default"), run: () => a.paragraph({ spaceAfter: null }) },
                ]}
              />
            </Group>
          </>
        )}

        {tab === "review" && (
          <>
            <Group label={w("group.proofing")}>
              <Check label={w("spellcheck")} checked={a.spellcheck} onChange={a.toggleSpellcheck} />
              <Tool label={w("wordCount")} icon={<FileText size={16} />} wide onClick={() => a.open("wordCount")} />
            </Group>
          </>
        )}

        {tab === "view" && (
          <>
            <Group label={w("group.zoom")}>
              <Tool label={w("zoomOut")} icon={<ZoomOut size={16} />} disabled={a.zoom <= 50} onClick={() => a.setZoom(Math.max(50, a.zoom - 10))} />
              <Tool label={w("zoom100")} wide pressed={a.zoom === 100} onClick={() => a.setZoom(100)} />
              <Tool label={w("zoomIn")} icon={<ZoomIn size={16} />} disabled={a.zoom >= 200} onClick={() => a.setZoom(Math.min(200, a.zoom + 10))} />
              <Tool label={w("pageWidth")} wide onClick={() => a.setZoom("page")} />
            </Group>
            <Group label={w("group.show")}>
              <Check label={w("marks")} checked={a.marks} onChange={a.toggleMarks} />
            </Group>
            <Group label={w("group.print")}>
              <Tool label={w("print")} icon={<Printer size={16} />} wide onClick={a.print} />
            </Group>
          </>
        )}
      </div>
    </div>
  );
}
