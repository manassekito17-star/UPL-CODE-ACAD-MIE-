import { Button, Dialog, IconButton, TextField, useToasts } from "@zynora/design-system";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  ClipboardPaste,
  Copy,
  Eraser,
  Italic,
  Merge,
  PaintBucket,
  Plus,
  Redo2,
  Save,
  Scissors,
  Sheet,
  Sigma,
  Split,
  Strikethrough,
  Type,
  Underline,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import { errorText, useApp } from "../context";
import type { MessageKey } from "../i18n";
import type { BookState, CellRange, CellView, SelectionStats, SheetInfo, StyleChange, WorkbookInfo } from "../ipc";
import { Grid, type GridHandle } from "./Grid";
import { cellName, clampCell, isSingle, normalize, parseRange, rangeName, type Cell } from "./refs";

const AUTOSAVE_MS = 30_000;

const NUMBER_FORMATS: Array<{ key: MessageKey; code: string }> = [
  { key: "sheets.fmt.general", code: "general" },
  { key: "sheets.fmt.number", code: "#,##0.00" },
  { key: "sheets.fmt.percent", code: "0.00%" },
  { key: "sheets.fmt.currency", code: '#,##0.00 "€"' },
  { key: "sheets.fmt.date", code: "dd/mm/yyyy" },
];

type RibbonTab = "home" | "insert" | "layout";

interface Props {
  book: WorkbookInfo;
  onClose: () => void;
}

export function SheetsEditor({ book, onClose }: Props) {
  const { api, t, language } = useApp();
  const toast = useToasts();
  const id = book.id;
  const [sheets, setSheets] = useState<SheetInfo[]>(book.sheets);
  const [sheet, setSheet] = useState(0);
  const [state, setState] = useState<BookState>(book.state);
  const [anchor, setAnchor] = useState<Cell>({ row: 1, column: 1 });
  const [focus, setFocus] = useState<Cell>({ row: 1, column: 1 });
  const [content, setContent] = useState("");
  const [activeCell, setActiveCell] = useState<CellView | null>(null);
  const [editing, setEditing] = useState<{ value: string; from: "grid" | "bar" } | null>(null);
  const [stats, setStats] = useState<SelectionStats | null>(null);
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState<RibbonTab>("home");
  const [nameBox, setNameBox] = useState("A1");
  const [closing, setClosing] = useState(false);
  const [sheetDialog, setSheetDialog] = useState<SheetInfo | null>(null);
  const grid = useRef<GridHandle>(null);
  const copiedText = useRef("");
  const cutPending = useRef(false);

  const selection: CellRange = useMemo(() => normalize(sheet, anchor, focus), [sheet, anchor, focus]);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  const fail = useCallback((error: unknown) => toast({ tone: "error", message: errorText(error, t) }), [t, toast]);

  // Contenu (formule) de la cellule active, et statistiques de la sélection, lus dans le moteur.
  useEffect(() => {
    let active = true;
    api.sheetsCell(id, sheet, focus.row, focus.column).then((c) => active && setContent(c.content), fail);
    return () => {
      active = false;
    };
  }, [api, id, sheet, focus, revision, fail]);

  useEffect(() => {
    setNameBox(rangeName(selection));
    if (isSingle(selection)) {
      setStats(null);
      return;
    }
    let active = true;
    api.sheetsStats(id, selection).then((s) => active && setStats(s), fail);
    return () => {
      active = false;
    };
  }, [api, id, selection, revision, fail]);

  // Sauvegarde automatique : copie de récupération, jamais à la place du document.
  useEffect(() => {
    if (!state.dirty) return;
    const timer = setInterval(() => void api.sheetsAutosave(id).catch(fail), AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, [api, id, state.dirty, fail]);

  const run = useCallback(
    async <T,>(action: () => Promise<{ value: T; state: BookState }>): Promise<T | undefined> => {
      try {
        const result = await action();
        setState(result.state);
        refresh();
        return result.value;
      } catch (error) {
        fail(error);
        return undefined;
      }
    },
    [fail, refresh],
  );

  const select = useCallback((a: Cell, f: Cell = a) => {
    setAnchor(clampCell(a));
    setFocus(clampCell(f));
  }, []);

  function move(dRow: number, dCol: number, extend = false) {
    const next = clampCell({ row: focus.row + dRow, column: focus.column + dCol });
    if (extend) setFocus(next);
    else select(next);
    grid.current?.reveal(next);
  }

  async function commit(value: string, then: [number, number] = [1, 0]) {
    setEditing(null);
    await run(() => api.sheetsSetInput(id, sheet, focus.row, focus.column, value));
    move(...then);
    grid.current?.focus();
  }

  function startEdit(initial?: string) {
    setEditing({ value: initial ?? content, from: "grid" });
  }

  const style = (change: StyleChange) => run(() => api.sheetsStyle(id, selection, change));

  async function save() {
    try {
      setState(await api.sheetsSave(id));
      toast({ tone: "success", message: t("sheets.saved") });
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  }

  async function history(redo: boolean) {
    const updated = await run(() => api.sheetsHistory(id, redo));
    if (updated) setSheets(updated);
  }

  async function copy(cut: boolean) {
    try {
      const text = await api.sheetsCopy(id, selection, cut);
      copiedText.current = text;
      cutPending.current = cut;
      await navigator.clipboard?.writeText(text).catch(() => undefined);
    } catch (error) {
      fail(error);
    }
  }

  async function paste() {
    let text = copiedText.current;
    try {
      text = (await navigator.clipboard?.readText()) || text;
    } catch {
      // Presse-papiers du système indisponible : le presse-papiers interne est utilisé.
    }
    if (!text) return;
    const cut = cutPending.current && text.trimEnd() === copiedText.current.trimEnd();
    await run(() => api.sheetsPaste(id, selection, text, cut));
    cutPending.current = false;
  }

  /** Somme automatique : sous une sélection verticale, ou au-dessus des nombres contigus. */
  async function autosum() {
    if (!isSingle(selection)) {
      const target = { row: selection.bottom + 1, column: selection.left };
      const formula = `=${language === "fr" ? "SOMME" : "SUM"}(${rangeName({ ...selection, right: selection.left })})`;
      await run(() => api.sheetsSetInput(id, sheet, target.row, target.column, formula));
      select(target);
      return;
    }
    const above = grid.current?.numbersAbove(focus) ?? 0;
    if (above === 0) {
      startEdit(`=${language === "fr" ? "SOMME" : "SUM"}(`);
      return;
    }
    const range = rangeName({ sheet, top: focus.row - above, left: focus.column, bottom: focus.row - 1, right: focus.column });
    await commit(`=${language === "fr" ? "SOMME" : "SUM"}(${range})`, [0, 0]);
  }

  async function structure(op: "insert_rows" | "delete_rows" | "insert_columns" | "delete_columns") {
    const rows = op.endsWith("rows");
    await run(() =>
      api.sheetsStructure(id, {
        op,
        sheet,
        at: rows ? selection.top : selection.left,
        count: rows ? selection.bottom - selection.top + 1 : selection.right - selection.left + 1,
      }),
    );
    grid.current?.reloadLayout();
  }

  async function addSheet() {
    const updated = await run(() => api.sheetsSheet(id, { op: "add" }));
    if (updated) {
      setSheets(updated);
      setSheet(updated.length - 1);
      select({ row: 1, column: 1 });
    }
  }

  async function requestClose() {
    if (!state.dirty) {
      await api.sheetsClose(id, false).catch(fail);
      onClose();
      return;
    }
    setClosing(true);
  }

  async function closeWith(saveFirst: boolean) {
    if (saveFirst && !(await save())) return;
    try {
      await api.sheetsClose(id, true);
      onClose();
    } catch (error) {
      fail(error);
    }
  }

  function onGridKey(event: KeyboardEvent<HTMLDivElement>) {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key;
    const shortcuts: Record<string, () => void> = {
      z: () => void history(false),
      y: () => void history(true),
      b: () => void style({ kind: "bold", value: !activeCell?.style.bold }),
      i: () => void style({ kind: "italic", value: !activeCell?.style.italic }),
      u: () => void style({ kind: "underline", value: !activeCell?.style.underline }),
      c: () => void copy(false),
      x: () => void copy(true),
      v: () => void paste(),
      s: () => void save(),
    };
    if (mod && shortcuts[key.toLowerCase()]) {
      event.preventDefault();
      shortcuts[key.toLowerCase()]?.();
      return;
    }
    if (mod && key === "Home") {
      event.preventDefault();
      select({ row: 1, column: 1 });
      grid.current?.reveal({ row: 1, column: 1 });
      return;
    }
    const arrows: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const arrow = arrows[key];
    if (arrow) {
      event.preventDefault();
      move(arrow[0], arrow[1], event.shiftKey);
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      move(event.shiftKey ? -1 : 1, 0);
    } else if (key === "Tab") {
      event.preventDefault();
      move(0, event.shiftKey ? -1 : 1);
    } else if (key === "F2") {
      event.preventDefault();
      startEdit();
    } else if (key === "Delete" || key === "Backspace") {
      event.preventDefault();
      void run(() => api.sheetsClear(id, selection));
    } else if (key.length === 1 && !mod && !event.altKey) {
      event.preventDefault();
      startEdit(key);
    }
  }

  function onEditorKey(event: KeyboardEvent<HTMLInputElement>) {
    if (!editing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      void commit(editing.value, [event.shiftKey ? -1 : 1, 0]);
    } else if (event.key === "Tab") {
      event.preventDefault();
      void commit(editing.value, [0, event.shiftKey ? -1 : 1]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditing(null);
      grid.current?.focus();
    }
  }

  function goTo(event: FormEvent) {
    event.preventDefault();
    const range = parseRange(nameBox, sheet);
    if (!range) {
      setNameBox(rangeName(selection));
      return;
    }
    select({ row: range.top, column: range.left }, { row: range.bottom, column: range.right });
    grid.current?.reveal({ row: range.top, column: range.left });
    grid.current?.focus();
  }

  const number = (n: number) => new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 10 }).format(n);
  const status = book.recovered && state.dirty ? t("sheets.recovered") : state.dirty ? t("sheets.unsaved") : t("sheets.saved");

  return (
    <div className="sheets">
      <header className="sheets__titlebar">
        <IconButton label={t("sheets.back")} onClick={() => void requestClose()}>
          <ArrowLeft size={18} aria-hidden />
        </IconButton>
        <span className="sheets__app">
          <Sheet size={16} aria-hidden /> Sheets
        </span>
        <h1 className="sheets__name">{book.name}</h1>
        <span className={`sheets__status${state.dirty ? " sheets__status--dirty" : ""}`} role="status">
          {status}
        </span>
        <span className="sheets__spacer" />
        <IconButton label={t("sheets.undo")} disabled={!state.can_undo} onClick={() => void history(false)}>
          <Undo2 size={18} aria-hidden />
        </IconButton>
        <IconButton label={t("sheets.redo")} disabled={!state.can_redo} onClick={() => void history(true)}>
          <Redo2 size={18} aria-hidden />
        </IconButton>
        <Button size="sm" variant="primary" icon={<Save size={14} aria-hidden />} onClick={() => void save()}>
          {t("sheets.save")}
        </Button>
      </header>

      <div className="ribbon">
        <div className="ribbon__tabs" role="tablist" aria-label="Ruban">
          {(["home", "insert", "layout"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`ribbon-tab-${key}`}
              aria-selected={tab === key}
              aria-controls="ribbon-panel"
              className="ribbon__tab"
              onClick={() => setTab(key)}
            >
              {t(`sheets.tab.${key}`)}
            </button>
          ))}
        </div>
        <div className="ribbon__panel" id="ribbon-panel" role="tabpanel" aria-labelledby={`ribbon-tab-${tab}`}>
          {tab === "home" && (
            <>
              <Group label={t("sheets.group.clipboard")}>
                <Tool label={t("sheets.paste")} icon={<ClipboardPaste size={18} />} onClick={() => void paste()} />
                <Tool label={t("sheets.cut")} icon={<Scissors size={16} />} onClick={() => void copy(true)} />
                <Tool label={t("sheets.copy")} icon={<Copy size={16} />} onClick={() => void copy(false)} />
              </Group>
              <Group label={t("sheets.group.font")}>
                <Tool label={t("sheets.bold")} icon={<Bold size={16} />} pressed={!!activeCell?.style.bold} onClick={() => void style({ kind: "bold", value: !activeCell?.style.bold })} />
                <Tool label={t("sheets.italic")} icon={<Italic size={16} />} pressed={!!activeCell?.style.italic} onClick={() => void style({ kind: "italic", value: !activeCell?.style.italic })} />
                <Tool label={t("sheets.underline")} icon={<Underline size={16} />} pressed={!!activeCell?.style.underline} onClick={() => void style({ kind: "underline", value: !activeCell?.style.underline })} />
                <Tool label={t("sheets.strike")} icon={<Strikethrough size={16} />} pressed={!!activeCell?.style.strike} onClick={() => void style({ kind: "strike", value: !activeCell?.style.strike })} />
                <ColorTool label={t("sheets.fontColor")} icon={<Type size={16} />} value={activeCell?.style.color ?? "#000000"} onPick={(c) => void style({ kind: "font_color", value: c })} />
                <ColorTool label={t("sheets.fill")} icon={<PaintBucket size={16} />} value={activeCell?.style.fill ?? "#ffffff"} onPick={(c) => void style({ kind: "fill", value: c })} />
              </Group>
              <Group label={t("sheets.group.alignment")}>
                <Tool label={t("sheets.alignLeft")} icon={<AlignLeft size={16} />} pressed={!!activeCell?.style.align_set && activeCell.style.align === "left"} onClick={() => void style({ kind: "align", value: "left" })} />
                <Tool label={t("sheets.alignCenter")} icon={<AlignCenter size={16} />} pressed={!!activeCell?.style.align_set && activeCell.style.align === "center"} onClick={() => void style({ kind: "align", value: "center" })} />
                <Tool label={t("sheets.alignRight")} icon={<AlignRight size={16} />} pressed={!!activeCell?.style.align_set && activeCell.style.align === "right"} onClick={() => void style({ kind: "align", value: "right" })} />
                <Tool label={t("sheets.merge")} icon={<Merge size={16} />} disabled={isSingle(selection)} onClick={() => void run(() => api.sheetsStructure(id, { op: "merge", range: selection }))} />
                <Tool label={t("sheets.unmerge")} icon={<Split size={16} />} onClick={() => void run(() => api.sheetsStructure(id, { op: "unmerge", range: selection }))} />
              </Group>
              <Group label={t("sheets.group.number")}>
                <label className="z-visually-hidden" htmlFor="number-format">
                  {t("sheets.numberFormat")}
                </label>
                <select id="number-format" className="ribbon__select" defaultValue="" onChange={(e) => {
                  if (e.target.value) void style({ kind: "number_format", value: e.target.value });
                  e.target.value = "";
                }}>
                  <option value="" disabled>
                    {t("sheets.numberFormat")}
                  </option>
                  {NUMBER_FORMATS.map((f) => (
                    <option key={f.code} value={f.code}>
                      {t(f.key)}
                    </option>
                  ))}
                </select>
              </Group>
              <Group label={t("sheets.group.cells")}>
                <Tool label={t("sheets.autosum")} icon={<Sigma size={16} />} onClick={() => void autosum()} />
                <Tool label={t("sheets.clear")} icon={<Eraser size={16} />} onClick={() => void run(() => api.sheetsClear(id, selection))} />
              </Group>
            </>
          )}
          {tab === "insert" && (
            <>
              <Group label={t("sheets.group.cells")}>
                <Tool label={t("sheets.insertRow")} wide onClick={() => void structure("insert_rows")} />
                <Tool label={t("sheets.insertColumn")} wide onClick={() => void structure("insert_columns")} />
              </Group>
              <Group label={t("sheets.group.functions")}>
                <Tool label={t("sheets.autosum")} icon={<Sigma size={16} />} wide onClick={() => void autosum()} />
              </Group>
              <Group label={t("sheets.group.sheets")}>
                <Tool label={t("sheets.addSheet")} icon={<Plus size={16} />} wide onClick={() => void addSheet()} />
              </Group>
            </>
          )}
          {tab === "layout" && (
            <Group label={t("sheets.group.cells")}>
              <Tool label={t("sheets.deleteRow")} wide onClick={() => void structure("delete_rows")} />
              <Tool label={t("sheets.deleteColumn")} wide onClick={() => void structure("delete_columns")} />
            </Group>
          )}
        </div>
      </div>

      <div className="formula-bar">
        <form onSubmit={goTo}>
          <label className="z-visually-hidden" htmlFor="name-box">
            {t("sheets.nameBox")}
          </label>
          <input id="name-box" className="formula-bar__name" value={nameBox} spellCheck={false} onChange={(e) => setNameBox(e.target.value)} onFocus={(e) => e.target.select()} />
        </form>
        <span className="formula-bar__fx" aria-hidden>
          fx
        </span>
        <label className="z-visually-hidden" htmlFor="formula-input">
          {t("sheets.formulaBar")}
        </label>
        <input
          id="formula-input"
          className="formula-bar__input"
          spellCheck={false}
          value={editing ? editing.value : content}
          onFocus={() => !editing && setEditing({ value: content, from: "bar" })}
          onChange={(e) => setEditing({ value: e.target.value, from: "bar" })}
          onKeyDown={onEditorKey}
        />
      </div>
      {book.format === "csv" && <p className="sheets__note">{t("sheets.csvNote")}</p>}

      <Grid
        ref={grid}
        id={id}
        sheet={sheet}
        revision={revision}
        selection={selection}
        focusCell={focus}
        editing={editing?.from === "grid" ? editing.value : null}
        label={t("sheets.grid")}
        onSelect={select}
        onExtend={(cell) => setFocus(clampCell(cell))}
        onEdit={() => startEdit()}
        onEditChange={(value) => setEditing({ value, from: "grid" })}
        onEditorKey={onEditorKey}
        onKeyDown={onGridKey}
        onActiveCell={setActiveCell}
        onError={fail}
      />

      <footer className="sheets__footer">
        <div className="sheet-tabs" role="tablist" aria-label={t("sheets.sheetTabs")}>
          {sheets.map((s) => (
            <button
              key={s.index}
              type="button"
              role="tab"
              aria-selected={s.index === sheet}
              className="sheet-tab"
              title={t("sheets.renameSheet")}
              onClick={() => {
                setSheet(s.index);
                select({ row: 1, column: 1 });
              }}
              onDoubleClick={() => setSheetDialog(s)}
            >
              {s.name}
            </button>
          ))}
          <IconButton label={t("sheets.addSheet")} onClick={() => void addSheet()}>
            <Plus size={16} aria-hidden />
          </IconButton>
        </div>
        <div className="sheets__stats" aria-live="polite">
          {stats && stats.count > 0 && (
            <>
              {stats.average !== null && (
                <span>
                  {t("sheets.stats.average")} : {number(stats.average)}
                </span>
              )}
              <span>
                {t("sheets.stats.count")} : {stats.count}
              </span>
              {stats.numeric_count > 0 && (
                <span>
                  {t("sheets.stats.sum")} : {number(stats.sum)}
                </span>
              )}
            </>
          )}
          <span className="sheets__cell">{cellName(focus)}</span>
        </div>
      </footer>

      <Dialog
        open={closing}
        role="alertdialog"
        title={t("sheets.close.title", { name: book.name })}
        description={t("sheets.close.desc")}
        onClose={() => setClosing(false)}
        actions={
          <>
            <Button onClick={() => setClosing(false)}>{t("dialog.cancel")}</Button>
            <Button onClick={() => void closeWith(false)}>{t("sheets.close.discard")}</Button>
            <Button variant="primary" onClick={() => void closeWith(true)}>
              {t("sheets.close.save")}
            </Button>
          </>
        }
      />
      {sheetDialog && (
        <SheetDialog
          info={sheetDialog}
          canDelete={sheets.length > 1}
          onClose={() => setSheetDialog(null)}
          onRename={async (name) => {
            const updated = await run(() => api.sheetsSheet(id, { op: "rename", sheet: sheetDialog.index, name }));
            if (updated) setSheets(updated);
            return updated !== undefined;
          }}
          onDelete={async () => {
            const updated = await run(() => api.sheetsSheet(id, { op: "delete", sheet: sheetDialog.index }));
            if (updated) {
              setSheets(updated);
              setSheet(0);
            }
            return updated !== undefined;
          }}
        />
      )}
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

function Tool({
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

function SheetDialog({
  info,
  canDelete,
  onClose,
  onRename,
  onDelete,
}: {
  info: SheetInfo;
  canDelete: boolean;
  onClose: () => void;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const { t } = useApp();
  const [name, setName] = useState(info.name);
  return (
    <Dialog
      open
      title={t("sheets.renameSheet")}
      onClose={onClose}
      actions={
        <>
          {canDelete && (
            <Button variant="danger" onClick={() => void onDelete().then((ok) => ok && onClose())}>
              {t("sheets.deleteSheet")}
            </Button>
          )}
          <Button onClick={onClose}>{t("dialog.cancel")}</Button>
          <Button variant="primary" type="submit" form="sheet-dialog-form" disabled={!name.trim()}>
            {t("dialog.save")}
          </Button>
        </>
      }
    >
      <form
        id="sheet-dialog-form"
        onSubmit={(e) => {
          e.preventDefault();
          void onRename(name.trim()).then((ok) => ok && onClose());
        }}
      >
        <TextField label={t("sheets.sheetName")} value={name} data-autofocus onChange={(e) => setName(e.target.value)} />
      </form>
    </Dialog>
  );
}
