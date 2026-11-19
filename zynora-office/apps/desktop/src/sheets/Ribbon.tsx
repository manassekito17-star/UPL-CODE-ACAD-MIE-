import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ArrowDownAZ,
  ArrowDownZA,
  Bold,
  Calculator,
  ChevronDown,
  ClipboardPaste,
  Copy,
  Eraser,
  Eye,
  FunctionSquare,
  Grid3x3,
  Italic,
  ListX,
  Merge,
  Minus,
  Omega,
  PaintBucket,
  Paintbrush,
  Percent,
  Plus,
  Scissors,
  Search,
  Sigma,
  Split,
  Strikethrough,
  Tags,
  Type,
  Underline,
  WrapText,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { CellStyle, FormatOp, StyleChange } from "../ipc";
import { FONT_SIZES, FONTS, NUMBER_FORMATS, type RibbonKey, type RibbonText } from "./ribbon-text";

export type Tab = "home" | "insert" | "formulas" | "data" | "view";
export type DialogKind = "find" | "replace" | "goto" | "sort" | "duplicates" | "functions" | "names" | "symbols" | "columnWidth" | "renameSheet";
export type Structure = "insert_rows" | "delete_rows" | "insert_columns" | "delete_columns";

export interface RibbonActions {
  paste: () => void;
  copy: (cut: boolean) => void;
  painter: () => void;
  painterActive: boolean;
  style: (change: StyleChange) => void;
  format: (op: FormatOp) => void;
  merge: (on: boolean) => void;
  structure: (op: Structure) => void;
  addSheet: () => void;
  deleteSheet: () => void;
  canDeleteSheet: boolean;
  autosum: () => void;
  insertFunction: (name: string) => void;
  open: (dialog: DialogKind) => void;
  sort: (ascending: boolean) => void;
  clear: (kind: "contents" | "formats" | "all") => void;
  recalculate: () => void;
  gridlines: boolean;
  toggleGridlines: () => void;
  showFormulas: boolean;
  toggleFormulas: () => void;
  formulaBar: boolean;
  toggleFormulaBar: () => void;
  headings: boolean;
  toggleHeadings: () => void;
  canMerge: boolean;
}

interface Props {
  r: RibbonText;
  tab: Tab;
  onTab: (tab: Tab) => void;
  cell: CellStyle | undefined;
  actions: RibbonActions;
  categories: Array<{ name: string; functions: string[] }>;
}

const TABS: Tab[] = ["home", "insert", "formulas", "data", "view"];

export function Ribbon({ r, tab, onTab, cell, actions: a, categories }: Props) {
  const style = cell;
  const toggle = (kind: "bold" | "italic" | "underline" | "strike") => a.style({ kind, value: !style?.[kind] });
  const aligned = (value: "left" | "center" | "right") => !!style?.align_set && style.align === value;
  return (
    <div className="ribbon">
      <div className="ribbon__tabs" role="tablist" aria-label="Ruban">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`ribbon-tab-${key}`}
            aria-selected={tab === key}
            aria-controls="ribbon-panel"
            className="ribbon__tab"
            onClick={() => onTab(key)}
          >
            {r(`tab.${key}` as RibbonKey)}
          </button>
        ))}
      </div>
      <div className="ribbon__panel" id="ribbon-panel" role="tabpanel" aria-labelledby={`ribbon-tab-${tab}`}>
        {tab === "home" && (
          <>
            <Group label={r("group.clipboard")}>
              <Tool label={r("paste")} icon={<ClipboardPaste size={18} />} onClick={a.paste} />
              <Tool label={r("cut")} icon={<Scissors size={16} />} onClick={() => a.copy(true)} />
              <Tool label={r("copy")} icon={<Copy size={16} />} onClick={() => a.copy(false)} />
              <Tool label={r("painter")} icon={<Paintbrush size={16} />} pressed={a.painterActive} onClick={a.painter} />
            </Group>
            <Group label={r("group.font")}>
              <Select label={r("fontName")} value={style?.font_name ?? "Calibri"} options={FONTS.map((f) => ({ value: f, label: f }))} onChange={(name) => a.format({ op: "font_name", name })} wide />
              <Select
                label={r("fontSize")}
                value={String(style?.font_size ?? 11)}
                options={FONT_SIZES.map((s) => ({ value: String(s), label: String(s) }))}
                onChange={(size) => a.style({ kind: "font_size", value: Number(size) })}
              />
              <Tool label={r("grow")} icon={<Plus size={14} />} onClick={() => a.style({ kind: "font_size_delta", value: 1 })} />
              <Tool label={r("shrink")} icon={<Minus size={14} />} onClick={() => a.style({ kind: "font_size_delta", value: -1 })} />
              <Tool label={r("bold")} icon={<Bold size={16} />} pressed={!!style?.bold} onClick={() => toggle("bold")} />
              <Tool label={r("italic")} icon={<Italic size={16} />} pressed={!!style?.italic} onClick={() => toggle("italic")} />
              <Tool label={r("underline")} icon={<Underline size={16} />} pressed={!!style?.underline} onClick={() => toggle("underline")} />
              <Tool label={r("strike")} icon={<Strikethrough size={16} />} pressed={!!style?.strike} onClick={() => toggle("strike")} />
              <Menu
                label={r("borders")}
                icon={<Grid3x3 size={16} />}
                items={[
                  { label: r("border.bottom"), run: () => a.format({ op: "borders", preset: "bottom", line: "thin", color: "#000000" }) },
                  { label: r("border.top"), run: () => a.format({ op: "borders", preset: "top", line: "thin", color: "#000000" }) },
                  { label: r("border.left"), run: () => a.format({ op: "borders", preset: "left", line: "thin", color: "#000000" }) },
                  { label: r("border.right"), run: () => a.format({ op: "borders", preset: "right", line: "thin", color: "#000000" }) },
                  { label: r("border.none"), run: () => a.format({ op: "borders", preset: "none", line: "thin", color: "" }) },
                  { label: r("border.all"), run: () => a.format({ op: "borders", preset: "all", line: "thin", color: "#000000" }) },
                  { label: r("border.outer"), run: () => a.format({ op: "borders", preset: "outer", line: "thin", color: "#000000" }) },
                  { label: r("border.inner"), run: () => a.format({ op: "borders", preset: "inner", line: "thin", color: "#000000" }) },
                  { label: r("border.thick"), run: () => a.format({ op: "borders", preset: "outer", line: "thick", color: "#000000" }) },
                  { label: r("border.double"), run: () => a.format({ op: "borders", preset: "bottom", line: "double", color: "#000000" }) },
                ]}
              />
              <ColorTool label={r("fill")} icon={<PaintBucket size={16} />} value={style?.fill ?? "#ffffff"} onPick={(c) => a.style({ kind: "fill", value: c })} />
              <ColorTool label={r("fontColor")} icon={<Type size={16} />} value={style?.color ?? "#000000"} onPick={(c) => a.style({ kind: "font_color", value: c })} />
            </Group>
            <Group label={r("group.alignment")}>
              <Tool label={r("top")} icon={<AlignVerticalJustifyStart size={16} />} pressed={style?.v_align === "top"} onClick={() => a.style({ kind: "vertical_align", value: "top" })} />
              <Tool label={r("middle")} icon={<AlignVerticalJustifyCenter size={16} />} pressed={style?.v_align === "center"} onClick={() => a.style({ kind: "vertical_align", value: "center" })} />
              <Tool label={r("bottom")} icon={<AlignVerticalJustifyEnd size={16} />} pressed={style?.v_align === "bottom" || !style?.v_align} onClick={() => a.style({ kind: "vertical_align", value: "bottom" })} />
              <Tool label={r("left")} icon={<AlignLeft size={16} />} pressed={aligned("left")} onClick={() => a.style({ kind: "align", value: "left" })} />
              <Tool label={r("center")} icon={<AlignCenter size={16} />} pressed={aligned("center")} onClick={() => a.style({ kind: "align", value: "center" })} />
              <Tool label={r("right")} icon={<AlignRight size={16} />} pressed={aligned("right")} onClick={() => a.style({ kind: "align", value: "right" })} />
              <Tool label={r("wrap")} icon={<WrapText size={16} />} pressed={!!style?.wrap} onClick={() => a.style({ kind: "wrap", value: !style?.wrap })} />
              <Menu
                label={r("merge")}
                icon={<Merge size={16} />}
                items={[
                  { label: r("merge"), run: () => a.merge(true), disabled: !a.canMerge },
                  { label: r("unmerge"), run: () => a.merge(false) },
                ]}
              />
            </Group>
            <Group label={r("group.number")}>
              <Select
                label={r("numberFormat")}
                value=""
                placeholder={r("numberFormat")}
                options={NUMBER_FORMATS.map((f) => ({ value: f.code, label: r(f.key) }))}
                onChange={(code) => a.style({ kind: "number_format", value: code })}
                wide
              />
              <Tool label={r("currency")} icon={<span className="tool__glyph">€</span>} onClick={() => a.style({ kind: "number_format", value: '#,##0.00 "€"' })} />
              <Tool label={r("percent")} icon={<Percent size={16} />} onClick={() => a.style({ kind: "number_format", value: "0%" })} />
              <Tool label={r("thousands")} icon={<span className="tool__glyph">000</span>} onClick={() => a.format({ op: "thousands" })} />
              <Tool label={r("incDecimals")} icon={<span className="tool__glyph">,0→</span>} onClick={() => a.format({ op: "decimals", delta: 1 })} />
              <Tool label={r("decDecimals")} icon={<span className="tool__glyph">←,0</span>} onClick={() => a.format({ op: "decimals", delta: -1 })} />
            </Group>
            <Group label={r("group.cells")}>
              <Menu
                label={r("insert")}
                text
                items={[
                  { label: r("insertRow"), run: () => a.structure("insert_rows") },
                  { label: r("insertColumn"), run: () => a.structure("insert_columns") },
                  { label: r("insertSheet"), run: a.addSheet },
                ]}
              />
              <Menu
                label={r("delete")}
                text
                items={[
                  { label: r("deleteRow"), run: () => a.structure("delete_rows") },
                  { label: r("deleteColumn"), run: () => a.structure("delete_columns") },
                  { label: r("deleteSheet"), run: a.deleteSheet, disabled: !a.canDeleteSheet },
                ]}
              />
              <Menu
                label={r("format")}
                text
                items={[
                  { label: r("columnWidth"), run: () => a.open("columnWidth") },
                  { label: r("renameSheet"), run: () => a.open("renameSheet") },
                ]}
              />
            </Group>
            <Group label={r("group.editing")}>
              <Tool label={r("autosum")} icon={<Sigma size={16} />} onClick={a.autosum} />
              <Menu
                label={r("clear")}
                icon={<Eraser size={16} />}
                items={[
                  { label: r("clearAll"), run: () => a.clear("all") },
                  { label: r("clearFormats"), run: () => a.clear("formats") },
                  { label: r("clearContents"), run: () => a.clear("contents") },
                ]}
              />
              <Menu
                label={r("sortFilter")}
                icon={<ArrowDownAZ size={16} />}
                items={[
                  { label: r("sortAsc"), run: () => a.sort(true) },
                  { label: r("sortDesc"), run: () => a.sort(false) },
                  { label: r("sortCustom"), run: () => a.open("sort") },
                ]}
              />
              <Menu
                label={r("find")}
                icon={<Search size={16} />}
                items={[
                  { label: r("findItem"), run: () => a.open("find") },
                  { label: r("replaceItem"), run: () => a.open("replace") },
                  { label: r("goTo"), run: () => a.open("goto") },
                ]}
              />
            </Group>
          </>
        )}

        {tab === "insert" && (
          <>
            <Group label={r("group.tables")}>
              <Tool label={r("insertRow")} wide onClick={() => a.structure("insert_rows")} />
              <Tool label={r("insertColumn")} wide onClick={() => a.structure("insert_columns")} />
              <Tool label={r("insertSheet")} icon={<Plus size={16} />} wide onClick={a.addSheet} />
            </Group>
            <Group label={r("group.symbols")}>
              <Tool label={r("symbol")} icon={<Omega size={16} />} wide onClick={() => a.open("symbols")} />
              <Tool label={r("insertFunction")} icon={<FunctionSquare size={16} />} wide onClick={() => a.open("functions")} />
            </Group>
          </>
        )}

        {tab === "formulas" && (
          <>
            <Group label={r("group.library")}>
              <Tool label={r("insertFunction")} icon={<FunctionSquare size={18} />} wide onClick={() => a.open("functions")} />
              <Tool label={r("autosum")} icon={<Sigma size={16} />} wide onClick={a.autosum} />
              {categories.map((category) => (
                <Menu key={category.name} label={category.name} text items={category.functions.map((name) => ({ label: name, run: () => a.insertFunction(name) }))} />
              ))}
            </Group>
            <Group label={r("group.names")}>
              <Tool label={r("names")} icon={<Tags size={16} />} wide onClick={() => a.open("names")} />
            </Group>
            <Group label={r("group.auditing")}>
              <Tool label={r("showFormulas")} icon={<Eye size={16} />} wide pressed={a.showFormulas} onClick={a.toggleFormulas} />
            </Group>
            <Group label={r("group.calculation")}>
              <Tool label={r("calcNow")} icon={<Calculator size={16} />} wide onClick={a.recalculate} />
            </Group>
          </>
        )}

        {tab === "data" && (
          <>
            <Group label={r("group.sort")}>
              <Tool label={r("sortAsc")} icon={<ArrowDownAZ size={16} />} onClick={() => a.sort(true)} />
              <Tool label={r("sortDesc")} icon={<ArrowDownZA size={16} />} onClick={() => a.sort(false)} />
              <Tool label={r("sortCustom")} wide onClick={() => a.open("sort")} />
            </Group>
            <Group label={r("group.tools")}>
              <Tool label={r("duplicates")} icon={<ListX size={16} />} wide onClick={() => a.open("duplicates")} />
            </Group>
          </>
        )}

        {tab === "view" && (
          <Group label={r("group.show")}>
            <Check label={r("gridlines")} checked={a.gridlines} onChange={a.toggleGridlines} />
            <Check label={r("formulaBar")} checked={a.formulaBar} onChange={a.toggleFormulaBar} />
            <Check label={r("headings")} checked={a.headings} onChange={a.toggleHeadings} />
            <Check label={r("showFormulas")} checked={a.showFormulas} onChange={a.toggleFormulas} />
          </Group>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ribbon__group" role="group" aria-label={label}>
      <div className="ribbon__tools">{children}</div>
      <div className="ribbon__label">{label}</div>
    </div>
  );
}

export function Tool({
  label,
  icon,
  onClick,
  pressed,
  disabled,
  wide,
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      className={`tool${wide ? " tool--wide" : ""}`}
      aria-label={wide ? undefined : label}
      title={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {wide && <span>{label}</span>}
    </button>
  );
}

function ColorTool({ label, icon, value, onPick }: { label: string; icon: ReactNode; value: string; onPick: (color: string) => void }) {
  return (
    <label className="tool tool--color" title={label}>
      <span aria-hidden>{icon}</span>
      <span className="tool__swatch" style={{ background: value }} aria-hidden />
      <input type="color" aria-label={label} value={value} onChange={(e) => onPick(e.target.value)} />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  wide,
  placeholder,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  wide?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const known = options.some((o) => o.value === value);
  return (
    <>
      <label className="z-visually-hidden" htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`ribbon__select${wide ? " ribbon__select--wide" : ""}`} title={label} value={known ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value)}>
        {!known && (
          <option value="" disabled>
            {placeholder ?? value}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="ribbon__check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

interface MenuItem {
  label: string;
  run: () => void;
  disabled?: boolean;
}

/**
 * Menu déroulant accessible (bouton « menu », flèches, Échap, clic extérieur). La liste est
 * rendue au-dessus de la page, sous son bouton : le ruban, qui défile, ne peut pas la rogner.
 */
export function Menu({ label, icon, items, text }: { label: string; icon?: ReactNode; items: MenuItem[]; text?: boolean }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!root.current?.contains(target) && !list.current?.contains(target)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    const rect = button.current?.getBoundingClientRect();
    if (rect) {
      // Le menu reste dans la fenêtre, même près du bord droit.
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 240));
      setPosition({ top: rect.bottom + 4, left });
    }
    setOpen((o) => !o);
  }

  function onKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const entries = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? []);
    const index = entries.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      entries[(index + step + entries.length) % entries.length]?.focus();
    }
  }

  return (
    <div className="menu" ref={root}>
      <button
        ref={button}
        type="button"
        className={`tool${text ? " tool--wide" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={text ? undefined : label}
        title={label}
        onClick={toggle}
      >
        {icon && <span aria-hidden>{icon}</span>}
        {text && <span>{label}</span>}
        <ChevronDown size={12} aria-hidden />
      </button>
      {open &&
        createPortal(
        <div ref={list} className="menu__list" role="menu" id={menuId} aria-label={label} style={position} onKeyDown={onKey}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className="menu__item"
              onClick={() => {
                setOpen(false);
                item.run();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>,
          document.body,
        )}
    </div>
  );
}
