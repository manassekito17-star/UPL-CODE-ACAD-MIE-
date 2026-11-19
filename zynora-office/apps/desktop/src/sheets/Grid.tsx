import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useApp } from "../context";
import type { CellRange, CellView } from "../ipc";
import { columnName, MAX_COLUMNS, MAX_ROWS, type Cell } from "./refs";

const ROW_HEADER_SIZE = 48;
const COLUMN_HEADER_SIZE = 24;
const BUFFER_ROWS = 10;
const BUFFER_COLUMNS = 4;
const INITIAL_ROWS = 1000;
const INITIAL_COLUMNS = 52;

export interface GridHandle {
  focus: () => void;
  reveal: (cell: Cell) => void;
  reloadLayout: () => void;
  /** Nombre de cellules numériques contiguës juste au-dessus (somme automatique). */
  numbersAbove: (cell: Cell) => number;
}

interface Props {
  id: number;
  sheet: number;
  revision: number;
  selection: CellRange;
  focusCell: Cell;
  editing: string | null;
  label: string;
  gridlines: boolean;
  headings: boolean;
  showFormulas: boolean;
  onSelect: (anchor: Cell, focus?: Cell) => void;
  onExtend: (cell: Cell) => void;
  /** Fin d'une sélection à la souris (relâchement) : sert à « Reproduire la mise en forme ». */
  onSelectionEnd: (range: CellRange) => void;
  onEdit: () => void;
  onEditChange: (value: string) => void;
  onEditorKey: (event: KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onActiveCell: (cell: CellView | null) => void;
  onError: (error: unknown) => void;
}

/**
 * Grille virtualisée : seules les cellules visibles (plus une marge) sont demandées au moteur
 * et rendues. Les largeurs de colonnes viennent du classeur ; la hauteur des lignes est celle
 * de la ligne 1 (hauteurs de ligne personnalisées : limite connue, voir COMPATIBILITY.md).
 */
export const Grid = forwardRef<GridHandle, Props>(function Grid(props, ref) {
  const { api } = useApp();
  const { id, sheet, revision, selection, focusCell, editing, label, gridlines, headings, showFormulas } = props;
  const { onSelect, onExtend, onSelectionEnd, onEdit, onEditChange, onEditorKey, onKeyDown, onActiveCell, onError } = props;
  // En-têtes masqués (« Affichage → En-têtes ») : largeur et hauteur nulles.
  const ROW_HEADER = headings ? ROW_HEADER_SIZE : 0;
  const COLUMN_HEADER = headings ? COLUMN_HEADER_SIZE : 0;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const scroller = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [widths, setWidths] = useState<number[]>(() => Array.from({ length: INITIAL_COLUMNS }, () => 100));
  const [rowHeight, setRowHeight] = useState(24);
  const [extent, setExtent] = useState({ rows: INITIAL_ROWS, columns: INITIAL_COLUMNS });
  const [viewport, setViewport] = useState({ top: 0, left: 0, width: 1200, height: 700 });
  const [cells, setCells] = useState<Map<string, CellView>>(new Map());
  const [layoutRevision, setLayoutRevision] = useState(0);

  // Positions cumulées des colonnes (offsets[c-1] = bord gauche de la colonne c).
  const offsets = useMemo(() => {
    const result = [0];
    for (const w of widths) result.push((result[result.length - 1] ?? 0) + w);
    return result;
  }, [widths]);
  const totalWidth = offsets[offsets.length - 1] ?? 0;
  const totalHeight = extent.rows * rowHeight;

  // Largeurs des colonnes et hauteur de ligne, lues dans le classeur.
  useEffect(() => {
    let active = true;
    api
      .sheetsRange(id, { sheet, top: 1, bottom: 1, left: 1, right: extent.columns })
      .then((view) => {
        if (!active) return;
        if (view.column_widths.length > 0) setWidths(view.column_widths);
        const height = view.row_heights[0];
        if (height && height > 0) setRowHeight(height);
      })
      .catch(onError);
    return () => {
      active = false;
    };
  }, [api, id, sheet, extent.columns, layoutRevision, onError]);

  const firstColumn = Math.max(1, upperBound(offsets, viewport.left));
  const lastColumn = Math.min(extent.columns, upperBound(offsets, viewport.left + viewport.width) + 1);
  const firstRow = Math.max(1, Math.floor(viewport.top / rowHeight) + 1);
  const lastRow = Math.min(extent.rows, Math.ceil((viewport.top + viewport.height) / rowHeight) + 1);

  const visible = useMemo(
    () => ({
      top: Math.max(1, firstRow - BUFFER_ROWS),
      bottom: Math.min(MAX_ROWS, lastRow + BUFFER_ROWS),
      left: Math.max(1, firstColumn - BUFFER_COLUMNS),
      right: Math.min(MAX_COLUMNS, lastColumn + BUFFER_COLUMNS),
    }),
    [firstRow, lastRow, firstColumn, lastColumn],
  );

  // Valeurs calculées par le moteur pour la fenêtre visible.
  useEffect(() => {
    let active = true;
    api
      .sheetsRange(id, { sheet, ...visible }, showFormulas)
      .then((view) => {
        if (!active) return;
        setCells(new Map(view.cells.map((c) => [`${c.row}:${c.column}`, c])));
      })
      .catch(onError);
    return () => {
      active = false;
    };
  }, [api, id, sheet, visible, revision, showFormulas, onError]);

  useEffect(() => {
    onActiveCell(cells.get(`${focusCell.row}:${focusCell.column}`) ?? null);
  }, [cells, focusCell, onActiveCell]);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const next = { top: el.scrollTop, left: el.scrollLeft, width: el.clientWidth, height: el.clientHeight };
    setViewport(next);
    // Grille « infinie » : elle s'agrandit quand on approche du bord.
    setExtent((e) => ({
      rows: next.top + next.height > e.rows * rowHeight - 200 ? Math.min(MAX_ROWS, e.rows + 500) : e.rows,
      columns: next.left + next.width > totalWidth - 300 ? Math.min(MAX_COLUMNS, e.columns + 26) : e.columns,
    }));
  }, [rowHeight, totalWidth]);

  useEffect(() => {
    onScroll();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(onScroll) : null;
    if (scroller.current) observer?.observe(scroller.current);
    return () => observer?.disconnect();
  }, [onScroll]);

  const cellAt = useCallback(
    (event: { clientX: number; clientY: number }): Cell => {
      const rect = layer.current?.getBoundingClientRect();
      const x = event.clientX - (rect?.left ?? 0);
      const y = event.clientY - (rect?.top ?? 0);
      return { row: Math.max(1, Math.floor(y / rowHeight) + 1), column: Math.max(1, upperBound(offsets, x)) };
    },
    [offsets, rowHeight],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: () => scroller.current?.focus(),
      reloadLayout: () => setLayoutRevision((r) => r + 1),
      reveal: (cell) => {
        const el = scroller.current;
        if (!el) return;
        if (cell.row > extent.rows - 20 || cell.column > extent.columns - 5) {
          setExtent((e) => ({ rows: Math.max(e.rows, cell.row + 100), columns: Math.min(MAX_COLUMNS, Math.max(e.columns, cell.column + 10)) }));
        }
        const top = (cell.row - 1) * rowHeight;
        const left = offsets[cell.column - 1] ?? (cell.column - 1) * 100;
        const right = offsets[cell.column] ?? left + 100;
        if (top < el.scrollTop) el.scrollTop = top;
        else if (top + rowHeight > el.scrollTop + el.clientHeight - COLUMN_HEADER) el.scrollTop = top + rowHeight - el.clientHeight + COLUMN_HEADER;
        if (left < el.scrollLeft) el.scrollLeft = left;
        else if (right > el.scrollLeft + el.clientWidth - ROW_HEADER) el.scrollLeft = right - el.clientWidth + ROW_HEADER;
      },
      numbersAbove: (cell) => {
        let count = 0;
        for (let row = cell.row - 1; row >= 1; row--) {
          if (!cells.get(`${row}:${cell.column}`)?.numeric) break;
          count++;
        }
        return count;
      },
    }),
    [cells, extent, offsets, rowHeight, ROW_HEADER, COLUMN_HEADER],
  );

  function onMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const cell = cellAt(event);
    if (event.shiftKey) onExtend(cell);
    else onSelect(cell);
    dragging.current = true;
    scroller.current?.focus();
    const move = (e: MouseEvent) => dragging.current && onExtend(cellAt(e));
    const up = () => {
      if (dragging.current) {
        // La sélection est mise à jour de façon asynchrone : on lit la dernière valeur au tour suivant.
        setTimeout(() => onSelectionEnd(selectionRef.current), 0);
      }
      dragging.current = false;
      window_.removeEventListener("mousemove", move);
      window_.removeEventListener("mouseup", up);
    };
    window_.addEventListener("mousemove", move);
    window_.addEventListener("mouseup", up);
  }

  const rows = range(firstRow, lastRow);
  const columns = range(firstColumn, lastColumn);
  const box = (top: number, left: number, bottom: number, right: number) => ({
    top: (top - 1) * rowHeight,
    left: offsets[left - 1] ?? 0,
    height: (bottom - top + 1) * rowHeight,
    width: (offsets[right] ?? 0) - (offsets[left - 1] ?? 0),
  });
  const active = box(focusCell.row, focusCell.column, focusCell.row, focusCell.column);
  const activeView = cells.get(`${focusCell.row}:${focusCell.column}`);

  return (
    <div
      ref={scroller}
      className={`grid${gridlines ? "" : " grid--no-lines"}`}
      tabIndex={0}
      role="grid"
      aria-label={label}
      aria-rowcount={MAX_ROWS}
      aria-colcount={MAX_COLUMNS}
      aria-activedescendant={`cell-${focusCell.row}-${focusCell.column}`}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
    >
      <div style={{ width: totalWidth + ROW_HEADER, height: totalHeight + COLUMN_HEADER, position: "relative" }}>
        {headings && (
        <div className="grid__col-headers" style={{ width: totalWidth + ROW_HEADER, height: COLUMN_HEADER }}>
          <div className="grid__corner" style={{ width: ROW_HEADER, height: COLUMN_HEADER }} />
          {columns.map((c) => (
            <div
              key={c}
              className={`grid__col-header${c >= selection.left && c <= selection.right ? " is-selected" : ""}`}
              style={{ left: ROW_HEADER + (offsets[c - 1] ?? 0), width: widths[c - 1] ?? 100, height: COLUMN_HEADER }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect({ row: 1, column: c }, { row: MAX_ROWS, column: c });
              }}
            >
              {columnName(c)}
            </div>
          ))}
        </div>
        )}
        {headings && (
        <div className="grid__row-headers" style={{ width: ROW_HEADER, height: totalHeight }}>
          {rows.map((r) => (
            <div
              key={r}
              className={`grid__row-header${r >= selection.top && r <= selection.bottom ? " is-selected" : ""}`}
              style={{ top: (r - 1) * rowHeight, height: rowHeight, width: ROW_HEADER }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect({ row: r, column: 1 }, { row: r, column: MAX_COLUMNS });
              }}
            >
              {r}
            </div>
          ))}
        </div>
        )}
        <div
          ref={layer}
          className="grid__cells"
          style={{ left: ROW_HEADER, top: COLUMN_HEADER, width: totalWidth, height: totalHeight }}
          onMouseDown={onMouseDown}
          onDoubleClick={onEdit}
        >
          {rows.map((r) =>
            columns.map((c) => {
              const view = cells.get(`${r}:${c}`);
              const s = view?.style;
              return (
                <div
                  key={`${r}:${c}`}
                  id={`cell-${r}-${c}`}
                  role="gridcell"
                  aria-rowindex={r}
                  aria-colindex={c}
                  aria-selected={r >= selection.top && r <= selection.bottom && c >= selection.left && c <= selection.right}
                  className={`grid__cell grid__cell--${s?.align ?? "general"} grid__cell--v-${s?.v_align ?? "bottom"}${s?.wrap ? " grid__cell--wrap" : ""}`}
                  style={{
                    top: (r - 1) * rowHeight,
                    left: offsets[c - 1] ?? 0,
                    width: widths[c - 1] ?? 100,
                    height: rowHeight,
                    fontWeight: s?.bold ? 700 : undefined,
                    fontStyle: s?.italic ? "italic" : undefined,
                    textDecoration: [s?.underline && "underline", s?.strike && "line-through"].filter(Boolean).join(" ") || undefined,
                    color: s?.color,
                    background: s?.fill,
                    fontSize: s?.font_size ? `${s.font_size}pt` : undefined,
                    fontFamily: s?.font_name ? `"${s.font_name}", var(--z-font-sans)` : undefined,
                    borderTop: s?.borders?.top,
                    borderLeft: s?.borders?.left,
                    ...(s?.borders?.right ? { borderRight: s.borders.right } : {}),
                    ...(s?.borders?.bottom ? { borderBottom: s.borders.bottom } : {}),
                  }}
                >
                  {view?.text}
                </div>
              );
            }),
          )}
          <div className="grid__selection" style={box(selection.top, selection.left, Math.min(selection.bottom, extent.rows), Math.min(selection.right, extent.columns))} aria-hidden />
          <div className="grid__active" style={active} aria-hidden />
          {editing !== null && (
            <input
              className="grid__editor"
              aria-label={columnName(focusCell.column) + focusCell.row}
              style={{ ...active, minWidth: active.width, fontWeight: activeView?.style.bold ? 700 : undefined }}
              value={editing}
              autoFocus
              spellCheck={false}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={onEditorKey}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    </div>
  );
});

const window_ = globalThis as unknown as Window;

/** Premier indice `i` tel que offsets[i] > x (colonne contenant x, 1-indexée). */
function upperBound(offsets: number[], x: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((offsets[mid] ?? 0) <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}
