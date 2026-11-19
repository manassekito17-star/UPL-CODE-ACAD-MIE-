/**
 * Faux backend en mémoire qui reproduit le CONTRAT des commandes Rust (messages d'erreur
 * compris), pour tester l'interface seule. Le comportement réel (disque, sécurité, SQLite)
 * est couvert par les tests Rust et par le test de bout en bout sur l'application compilée.
 */
import { vi } from "vitest";

import {
  IpcError,
  type Api,
  type AuditEvent,
  type BookState,
  type CellStyle,
  type Entry,
  type EntryKind,
  type ImportOutcome,
  type RecoveryRecord,
  type Settings,
  type SheetInfo,
  type TrashItem,
} from "../ipc";

interface Options {
  settings?: Settings;
  files?: string[];
  folders?: string[];
  interrupted?: boolean;
  importOutcome?: ImportOutcome;
  /** Résultats affichés pour des formules données (le faux backend ne calcule rien). */
  formulaResults?: Record<string, string>;
  recoveries?: RecoveryRecord[];
}

function kindOf(name: string): EntryKind {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "docx" || ext === "odt" || ext === "txt") return "text";
  if (ext === "xlsx" || ext === "ods" || ext === "csv") return "spreadsheet";
  if (ext === "pptx" || ext === "odp") return "presentation";
  return "pdf";
}

const parent = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");
const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

export function fakeApi(options: Options = {}) {
  let settings: Settings = { ...(options.settings ?? { theme: "light", language: "fr" }) };
  const entries = new Map<string, Entry>();
  const favorites = new Set<string>();
  const recent: string[] = [];
  let trash: Array<TrashItem & { stored: Entry[] }> = [];
  let nextId = 1;
  const events: AuditEvent[] = [{ id: 1, at_ms: Date.UTC(2026, 10, 18, 9, 30), action: "app.start", detail: "0.1.0" }];
  const log = (action: string, detail: string) => events.unshift({ id: events.length + 1, at_ms: Date.now(), action, detail });

  const add = (path: string, kind: EntryKind) => entries.set(path, { path, name: baseName(path), kind, size: kind === "folder" ? 0 : 2048, modified_ms: Date.UTC(2026, 10, 17, 14, 5) });
  for (const f of options.folders ?? []) add(f, "folder");
  for (const f of options.files ?? []) add(f, kindOf(f));

  // --- Classeur en mémoire : saisies et styles par cellule « feuille:ligne:colonne ». ---
  const inputs = new Map<string, string>();
  const styles = new Map<string, CellStyle>();
  let sheets: SheetInfo[] = [{ index: 0, name: "Feuil1", visible: true }];
  let book: BookState = { dirty: false, can_undo: false, can_redo: false };
  const undo: Array<Map<string, string>> = [];
  let recoveries = [...(options.recoveries ?? [])];
  const key = (sheet: number, row: number, column: number) => `${sheet}:${row}:${column}`;
  const display = (input: string) => (input.startsWith("=") ? (options.formulaResults?.[input] ?? "#FAUX-BACKEND") : input);
  const changed = () => {
    book = { dirty: true, can_undo: undo.length > 0, can_redo: false };
    return { value: null, state: { ...book } };
  };
  const workbook = (path: string, recovered = false) => ({
    id: 7,
    path,
    name: baseName(path),
    format: (path.endsWith(".csv") ? "csv" : "xlsx") as "csv" | "xlsx",
    sheets: [...sheets],
    state: { ...book },
    recovered,
  });

  const view = (e: Entry) => ({ ...e, favorite: favorites.has(e.path) });
  const sorted = (list: Entry[]) =>
    [...list].sort((a, b) => Number(a.kind !== "folder") - Number(b.kind !== "folder") || a.name.localeCompare(b.name, "fr"));
  const within = (path: string, root: string) => path === root || path.startsWith(`${root}/`);

  const api: Api = {
    appInfo: vi.fn(async () => ({ name: "ZYNORA Office", version: "0.1.0", schema_version: 2, os: "linux", arch: "x86_64", previous_session_interrupted: options.interrupted ?? false })),
    getSettings: vi.fn(async () => ({ ...settings })),
    updateSetting: vi.fn(async (change) => {
      settings = { ...settings, [change.key]: change.value };
      log("settings.update", `${change.key}=${change.value}`);
      return { ...settings };
    }),
    recentEvents: vi.fn(async (limit: number) => events.slice(0, limit)),
    libraryInfo: vi.fn(async () => ({ path: "/home/test/Documents/ZYNORA", is_default: true })),
    chooseLibrary: vi.fn(async () => ({ path: "/data/Bureau", is_default: false })),
    dashboard: vi.fn(async () => ({
      recent: recent.filter((p) => entries.has(p)).map((p) => view(entries.get(p) as Entry)),
      favorites: sorted([...favorites].filter((p) => entries.has(p)).map((p) => entries.get(p) as Entry)).map(view),
    })),
    listFolder: vi.fn(async (path: string) => {
      if (path && entries.get(path)?.kind !== "folder") throw new IpcError("élément introuvable");
      return sorted([...entries.values()].filter((e) => parent(e.path) === path)).map(view);
    }),
    searchDocuments: vi.fn(async (query: string) => sorted([...entries.values()].filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))).map(view)),
    createFolder: vi.fn(async (parentPath: string, name: string) => {
      const path = parentPath ? `${parentPath}/${name}` : name;
      if (entries.has(path)) throw new IpcError(`« ${name} » existe déjà à cet endroit`);
      if (name.toUpperCase() === "CON") throw new IpcError("nom de fichier invalide : nom réservé par Windows");
      add(path, "folder");
      log("folder.create", path);
      return entries.get(path) as Entry;
    }),
    renameEntry: vi.fn(async (path: string, newName: string) => {
      const entry = entries.get(path);
      if (!entry) throw new IpcError("élément introuvable");
      const target = parent(path) ? `${parent(path)}/${newName}` : newName;
      if (entries.has(target)) throw new IpcError(`« ${newName} » existe déjà à cet endroit`);
      entries.delete(path);
      const renamed = { ...entry, path: target, name: newName };
      entries.set(target, renamed);
      return renamed;
    }),
    importDocuments: vi.fn(async (folder: string) => {
      const outcome = options.importOutcome ?? { cancelled: true, imported: [], rejected: [] };
      for (const e of outcome.imported) {
        const path = folder ? `${folder}/${e.name}` : e.name;
        add(path, e.kind);
        recent.unshift(path);
      }
      return outcome;
    }),
    setFavorite: vi.fn(async (path: string, favorite: boolean) => {
      if (favorite) favorites.add(path);
      else favorites.delete(path);
      return favorite;
    }),
    trashEntry: vi.fn(async (path: string) => {
      const entry = entries.get(path);
      if (!entry) throw new IpcError("élément introuvable");
      const stored = [...entries.values()].filter((e) => within(e.path, path));
      stored.forEach((e) => entries.delete(e.path));
      const item = { id: `${nextId++}`, original_path: path, name: entry.name, is_dir: entry.kind === "folder", size: entry.size, deleted_at_ms: Date.now(), stored };
      trash.unshift(item);
      return item;
    }),
    listTrash: vi.fn(async () => trash.map(({ stored: _stored, ...item }) => item)),
    restoreTrash: vi.fn(async (id: string) => {
      const item = trash.find((t) => t.id === id);
      if (!item) throw new IpcError("élément absent de la corbeille");
      trash = trash.filter((t) => t.id !== id);
      item.stored.forEach((e) => entries.set(e.path, e));
      return entries.get(item.original_path) as Entry;
    }),
    purgeTrash: vi.fn(async (id: string) => {
      trash = trash.filter((t) => t.id !== id);
      return null;
    }),
    emptyTrash: vi.fn(async () => {
      const n = trash.length;
      trash = [];
      return n;
    }),
    sheetsOpen: vi.fn(async (path: string) => {
      if (!entries.has(path)) throw new IpcError("élément introuvable");
      return workbook(path);
    }),
    sheetsCreate: vi.fn(async (folder: string) => {
      const path = folder ? `${folder}/Classeur.xlsx` : "Classeur.xlsx";
      add(path, "spreadsheet");
      return workbook(path);
    }),
    sheetsRange: vi.fn(async (_id, range) => {
      const cells = [];
      for (const [k, input] of inputs) {
        const [sheet = 0, row = 0, column = 0] = k.split(":").map(Number);
        if (sheet !== range.sheet || row < range.top || row > range.bottom || column < range.left || column > range.right) continue;
        const text = display(input);
        cells.push({ row, column, text, numeric: text !== "" && !Number.isNaN(Number(text.replace(",", "."))), style: styles.get(k) ?? { align: "general" as const } });
      }
      return {
        sheet: range.sheet,
        cells,
        column_widths: Array.from({ length: range.right - range.left + 1 }, () => 100),
        row_heights: Array.from({ length: range.bottom - range.top + 1 }, () => 24),
      };
    }),
    sheetsCell: vi.fn(async (_id, sheet, row, column) => {
      const input = inputs.get(key(sheet, row, column)) ?? "";
      return { content: input, display: display(input) };
    }),
    sheetsStats: vi.fn(async () => ({ count: 2, numeric_count: 2, sum: 30, average: 15, min: 10, max: 20 })),
    sheetsSetInput: vi.fn(async (_id, sheet, row, column, input) => {
      undo.push(new Map(inputs));
      inputs.set(key(sheet, row, column), input);
      return changed();
    }),
    sheetsClear: vi.fn(async (_id, range) => {
      undo.push(new Map(inputs));
      for (let r = range.top; r <= range.bottom; r++) for (let c = range.left; c <= range.right; c++) inputs.delete(key(range.sheet, r, c));
      return changed();
    }),
    sheetsStyle: vi.fn(async (_id, range, change) => {
      const k = key(range.sheet, range.top, range.left);
      const current = styles.get(k) ?? { align: "general" as const };
      const field = change.kind === "font_color" ? "color" : change.kind;
      styles.set(k, { ...current, [field]: change.value });
      if (!inputs.has(k)) inputs.set(k, "");
      return changed();
    }),
    sheetsStructure: vi.fn(async () => changed()),
    sheetsSheet: vi.fn(async (_id, change) => {
      if (change.op === "add") sheets = [...sheets, { index: sheets.length, name: `Feuil${sheets.length + 1}`, visible: true }];
      if (change.op === "rename") sheets = sheets.map((s) => (s.index === change.sheet ? { ...s, name: change.name } : s));
      if (change.op === "delete") sheets = sheets.filter((s) => s.index !== change.sheet).map((s, index) => ({ ...s, index }));
      return { value: [...sheets], state: changed().state };
    }),
    sheetsHistory: vi.fn(async (_id, redo) => {
      const previous = undo.pop();
      if (!redo && previous) {
        inputs.clear();
        previous.forEach((v, k) => inputs.set(k, v));
      }
      return { value: [...sheets], state: changed().state };
    }),
    sheetsCopy: vi.fn(async () => "10\t20"),
    sheetsPaste: vi.fn(async () => changed()),
    sheetsSave: vi.fn(async () => {
      book = { ...book, dirty: false };
      return { ...book };
    }),
    sheetsAutosave: vi.fn(async () => book.dirty),
    sheetsClose: vi.fn(async (_id, discard) => !book.dirty || discard),
    listRecoveries: vi.fn(async () => [...recoveries]),
    sheetsOpenRecovery: vi.fn(async (path: string) => {
      book = { dirty: true, can_undo: false, can_redo: false };
      return workbook(path, true);
    }),
    discardRecovery: vi.fn(async (path: string) => {
      recoveries = recoveries.filter((r) => r.path !== path);
      return null;
    }),
  };
  return api;
}
