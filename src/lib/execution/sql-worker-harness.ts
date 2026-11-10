/**
 * Banc d'essai (tests uniquement) : charge le VRAI fichier public/workers/sql-worker.js
 * dans un contexte isolé de Node, avec le moteur sql.js installé en dépendance
 * de développement (même version que celle chargée par le navigateur).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const root = process.cwd();

export interface SqlWorkerResult {
  type: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  errorLine?: number;
  hint?: string;
  tables?: Array<{ sql: string; columns: string[]; rows: unknown[][] }>;
  log?: Array<{ table?: number; message?: string }>;
  schema?: Array<{ name: string; columns: Array<{ name: string; pk: boolean }>; foreignKeys: Array<{ from: string; table: string; to: string }> }>;
  engineLabel?: string;
}

type Ctx = { onmessage: (e: { data: unknown }) => Promise<void>; posted: SqlWorkerResult[] };
let ctx: Ctx | null = null;

function load(): Ctx {
  if (ctx) return ctx;
  const initSqlJs = require("sql.js") as (cfg: object) => Promise<unknown>;
  const dist = join(root, "node_modules/sql.js/dist");
  const posted: SqlWorkerResult[] = [];
  const self: Record<string, unknown> = {
    postMessage: (m: SqlWorkerResult) => posted.push(m),
    initSqlJs: (cfg: { locateFile: (f: string) => string }) => initSqlJs({ ...cfg, locateFile: (f: string) => join(dist, f) }),
  };
  const sandbox = { self, importScripts: () => {}, console, performance, Uint8Array, String, Number, Boolean, Math };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(root, "public/workers/sql-worker.js"), "utf8"), sandbox);
  ctx = { onmessage: self.onmessage as Ctx["onmessage"], posted };
  return ctx;
}

/** Exécute un message comme le ferait la page (runInBrowser) et renvoie le résultat final du worker. */
export async function runSqlWorker(message: { files?: Array<{ name: string; content: string }>; setup?: string; mode?: string; reset?: boolean; sql?: string }): Promise<SqlWorkerResult> {
  const c = load();
  c.posted.length = 0;
  await c.onmessage({ data: message });
  const last = c.posted.filter((m) => m.type === "resultat").at(-1);
  if (!last) throw new Error("Aucun résultat du worker SQL");
  return last;
}
