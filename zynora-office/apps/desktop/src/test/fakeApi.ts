/**
 * Faux backend en mémoire qui reproduit le CONTRAT des commandes Rust (messages d'erreur
 * compris), pour tester l'interface seule. Le comportement réel (disque, sécurité, SQLite)
 * est couvert par les tests Rust et par le test de bout en bout sur l'application compilée.
 */
import { vi } from "vitest";

import { IpcError, type Api, type AuditEvent, type Entry, type EntryKind, type ImportOutcome, type Settings, type TrashItem } from "../ipc";

interface Options {
  settings?: Settings;
  files?: string[];
  folders?: string[];
  interrupted?: boolean;
  importOutcome?: ImportOutcome;
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
  };
  return api;
}
