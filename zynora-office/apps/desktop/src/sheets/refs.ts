import type { CellRange } from "../ipc";

export const MAX_ROWS = 1_048_576;
export const MAX_COLUMNS = 16_384;

export interface Cell {
  row: number;
  column: number;
}

/** 1 → « A », 27 → « AA ». */
export function columnName(column: number): string {
  let name = "";
  let n = column;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

export function cellName(cell: Cell): string {
  return `${columnName(cell.column)}${cell.row}`;
}

/** « B12 » ou « $B$12 » → cellule ; `null` si la référence est invalide ou hors limites. */
export function parseCell(text: string): Cell | null {
  const match = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(text.trim());
  if (!match) return null;
  const [, letters = "", digits = ""] = match;
  const column = [...letters.toUpperCase()].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
  const row = Number(digits);
  if (row < 1 || row > MAX_ROWS || column > MAX_COLUMNS) return null;
  return { row, column };
}

/** « A1:C3 » ou « B2 » → plage normalisée (sur la feuille donnée). */
export function parseRange(text: string, sheet: number): CellRange | null {
  const [a, b, ...rest] = text.split(":");
  if (rest.length > 0 || a === undefined) return null;
  const start = parseCell(a);
  const end = b === undefined ? start : parseCell(b);
  if (!start || !end) return null;
  return normalize(sheet, start, end);
}

export function normalize(sheet: number, a: Cell, b: Cell): CellRange {
  return {
    sheet,
    top: Math.min(a.row, b.row),
    left: Math.min(a.column, b.column),
    bottom: Math.max(a.row, b.row),
    right: Math.max(a.column, b.column),
  };
}

export function rangeName(range: CellRange): string {
  const start = cellName({ row: range.top, column: range.left });
  if (range.top === range.bottom && range.left === range.right) return start;
  return `${start}:${cellName({ row: range.bottom, column: range.right })}`;
}

export function clampCell(cell: Cell): Cell {
  return { row: Math.min(Math.max(cell.row, 1), MAX_ROWS), column: Math.min(Math.max(cell.column, 1), MAX_COLUMNS) };
}

export function isSingle(range: CellRange): boolean {
  return range.top === range.bottom && range.left === range.right;
}
