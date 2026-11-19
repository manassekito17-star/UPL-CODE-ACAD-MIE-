import { Button, Dialog, IconButton, useToasts } from "@zynora/design-system";
import { ArrowLeft, Plus, Redo2, Save, Sheet, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { errorText, useApp } from "../context";
import type { BookState, CellRange, CellView, FormatOp, FunctionInfo, SelectionStats, SheetInfo, StyleChange, WorkbookInfo } from "../ipc";
import { Grid, type GridHandle } from "./Grid";
import { Ribbon, type DialogKind, type RibbonActions, type Structure, type Tab } from "./Ribbon";
import { ribbonText } from "./ribbon-text";
import { SheetsDialog } from "./SheetsDialogs";
import { cellName, clampCell, isSingle, normalize, parseRange, rangeName, type Cell } from "./refs";

const AUTOSAVE_MS = 30_000;

interface Props {
  book: WorkbookInfo;
  onClose: () => void;
}

export function SheetsEditor({ book, onClose }: Props) {
  const { api, t, language } = useApp();
  const toast = useToasts();
  const r = useMemo(() => ribbonText(language), [language]);
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
  const [tab, setTab] = useState<Tab>("home");
  const [nameBox, setNameBox] = useState("A1");
  const [closing, setClosing] = useState(false);
  const [confirmDeleteSheet, setConfirmDeleteSheet] = useState(false);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [painter, setPainter] = useState<CellRange | null>(null);
  const [gridlines, setGridlines] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [formulaBar, setFormulaBar] = useState(true);
  const [headings, setHeadings] = useState(true);
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const grid = useRef<GridHandle>(null);
  const copiedText = useRef("");
  const cutPending = useRef(false);

  const selection: CellRange = useMemo(() => normalize(sheet, anchor, focus), [sheet, anchor, focus]);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  const fail = useCallback((error: unknown) => toast({ tone: "error", message: errorText(error, t) }), [t, toast]);
  const notify = useCallback((message: string, tone: "success" | "error" | "info" = "info") => toast({ tone, message }), [toast]);

  useEffect(() => {
    api.sheetsFunctions().then(setFunctions, fail);
  }, [api, fail]);

  useEffect(() => {
    api.sheetsGridlines(id, sheet).then(setGridlines, fail);
  }, [api, id, sheet, fail]);

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
    grid.current?.reveal(clampCell(a));
  }, []);

  function move(dRow: number, dCol: number, extend = false) {
    const next = clampCell({ row: focus.row + dRow, column: focus.column + dCol });
    if (extend) setFocus(next);
    else {
      setAnchor(next);
      setFocus(next);
    }
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
  const format = (op: FormatOp) => run(() => api.sheetsFormat(id, selection, op));

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

  const sum = language === "fr" ? "SOMME" : "SUM";

  /** Somme automatique : sous une sélection verticale, ou au-dessus des nombres contigus. */
  async function autosum() {
    if (!isSingle(selection)) {
      const target = { row: selection.bottom + 1, column: selection.left };
      await run(() => api.sheetsSetInput(id, sheet, target.row, target.column, `=${sum}(${rangeName({ ...selection, right: selection.left })})`));
      select(target);
      return;
    }
    const above = grid.current?.numbersAbove(focus) ?? 0;
    if (above === 0) {
      startEdit(`=${sum}(`);
      return;
    }
    const range = rangeName({ sheet, top: focus.row - above, left: focus.column, bottom: focus.row - 1, right: focus.column });
    await commit(`=${sum}(${range})`, [0, 0]);
  }

  async function structure(op: Structure) {
    const rows = op.endsWith("rows");
    await run(() =>
      api.sheetsStructure(id, {
        op,
        sheet,
        at: rows ? selection.top : selection.left,
        count: rows ? Math.min(selection.bottom - selection.top + 1, 10_000) : Math.min(selection.right - selection.left + 1, 1_000),
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

  async function deleteSheet() {
    setConfirmDeleteSheet(false);
    const updated = await run(() => api.sheetsSheet(id, { op: "delete", sheet }));
    if (updated) {
      setSheets(updated);
      setSheet(0);
      select({ row: 1, column: 1 });
    }
  }

  async function renameSheet(name: string) {
    const updated = await run(() => api.sheetsSheet(id, { op: "rename", sheet, name }));
    if (updated) setSheets(updated);
    return updated !== undefined;
  }

  async function sort(ascending: boolean) {
    if (isSingle(selection)) {
      notify(r("dlg.sortBy"), "info");
      setDialog("sort");
      return;
    }
    await run(() => api.sheetsData(id, { op: "sort", range: selection, key: focus.column, ascending, header: false }));
  }

  /** Texte inséré dans la saisie en cours (symbole), ou nouvelle saisie (fonction). */
  function insertText(text: string) {
    if (text.startsWith("=")) {
      startEdit(text);
      return;
    }
    setEditing((e) => ({ value: (e ? e.value : content) + text, from: e?.from ?? "grid" }));
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

  function onSelectionEnd(range: CellRange) {
    if (!painter) return;
    const source = painter;
    setPainter(null);
    void run(() => api.sheetsFormat(id, range, { op: "copy_styles", source }));
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
      f: () => setDialog("find"),
      h: () => setDialog("replace"),
      g: () => setDialog("goto"),
    };
    if (mod && shortcuts[key.toLowerCase()]) {
      event.preventDefault();
      shortcuts[key.toLowerCase()]?.();
      return;
    }
    if (mod && key === "Home") {
      event.preventDefault();
      select({ row: 1, column: 1 });
      return;
    }
    if (event.shiftKey && key === "F3") {
      event.preventDefault();
      setDialog("functions");
      return;
    }
    const arrows: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const arrow = arrows[key];
    if (arrow) {
      event.preventDefault();
      move(arrow[0], arrow[1], event.shiftKey);
      return;
    }
    if (key === "Escape" && painter) {
      setPainter(null);
    } else if (key === "Enter") {
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
    grid.current?.focus();
  }

  const categories = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const f of functions) groups.set(f.category, [...(groups.get(f.category) ?? []), language === "fr" ? f.fr : f.en]);
    return [...groups].map(([name, list]) => ({ name, functions: list }));
  }, [functions, language]);

  const actions: RibbonActions = {
    paste: () => void paste(),
    copy: (cut) => void copy(cut),
    painter: () => setPainter((p) => (p ? null : selection)),
    painterActive: painter !== null,
    style: (change) => void style(change),
    format: (op) => void format(op),
    merge: (on) => void run(() => api.sheetsStructure(id, { op: on ? "merge" : "unmerge", range: selection })),
    canMerge: !isSingle(selection),
    structure: (op) => void structure(op),
    addSheet: () => void addSheet(),
    deleteSheet: () => setConfirmDeleteSheet(true),
    canDeleteSheet: sheets.length > 1,
    autosum: () => void autosum(),
    insertFunction: (name) => startEdit(`=${name}(`),
    open: setDialog,
    sort: (ascending) => void sort(ascending),
    clear: (kind) =>
      void (kind === "contents" ? run(() => api.sheetsClear(id, selection)) : format({ op: kind === "all" ? "clear_all" : "clear_formats" })),
    recalculate: () =>
      void api.sheetsRecalculate(id).then(() => {
        refresh();
        notify(r("calculated"), "success");
      }, fail),
    gridlines,
    toggleGridlines: () =>
      void api.sheetsGridlines(id, sheet, !gridlines).then((value) => {
        setGridlines(value);
        setState((s) => ({ ...s, dirty: true }));
      }, fail),
    showFormulas,
    toggleFormulas: () => setShowFormulas((v) => !v),
    formulaBar,
    toggleFormulaBar: () => setFormulaBar((v) => !v),
    headings,
    toggleHeadings: () => setHeadings((v) => !v),
  };

  const number = (n: number) => new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 10 }).format(n);
  const status = book.recovered && state.dirty ? t("sheets.recovered") : state.dirty ? t("sheets.unsaved") : t("sheets.saved");
  const currentSheet = sheets.find((s) => s.index === sheet);

  return (
    <div className={`sheets${painter ? " sheets--painter" : ""}`}>
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

      <Ribbon r={r} tab={tab} onTab={setTab} cell={activeCell?.style} actions={actions} categories={categories} />

      {formulaBar && (
        <div className="formula-bar">
          <form onSubmit={goTo}>
            <label className="z-visually-hidden" htmlFor="name-box">
              {t("sheets.nameBox")}
            </label>
            <input id="name-box" className="formula-bar__name" value={nameBox} spellCheck={false} onChange={(e) => setNameBox(e.target.value)} onFocus={(e) => e.target.select()} />
          </form>
          <button type="button" className="formula-bar__fx" title={r("insertFunction")} aria-label={r("insertFunction")} onClick={() => setDialog("functions")}>
            fx
          </button>
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
      )}
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
        gridlines={gridlines}
        headings={headings}
        showFormulas={showFormulas}
        onSelect={select}
        onExtend={(cell) => setFocus(clampCell(cell))}
        onSelectionEnd={onSelectionEnd}
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
              onDoubleClick={() => setDialog("renameSheet")}
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

      {dialog && (
        <SheetsDialog
          kind={dialog}
          r={r}
          id={id}
          sheet={sheet}
          sheetName={currentSheet?.name ?? ""}
          selection={selection}
          functions={functions}
          onClose={() => {
            setDialog(null);
            grid.current?.focus();
          }}
          run={run}
          select={select}
          insertText={insertText}
          renameSheet={renameSheet}
          notify={notify}
        />
      )}

      <Dialog
        open={confirmDeleteSheet}
        role="alertdialog"
        title={`${r("deleteSheet")} « ${currentSheet?.name ?? ""} » ?`}
        onClose={() => setConfirmDeleteSheet(false)}
        actions={
          <>
            <Button onClick={() => setConfirmDeleteSheet(false)}>{r("dlg.cancel")}</Button>
            <Button variant="danger" onClick={() => void deleteSheet()}>
              {r("deleteSheet")}
            </Button>
          </>
        }
      />
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
    </div>
  );
}
