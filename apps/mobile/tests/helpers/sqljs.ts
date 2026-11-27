import path from 'node:path';

import initSqlJs, { type Database } from 'sql.js';

import type { SqlDatabase } from '@/services/projects/sqlRepository';

/**
 * Vraie base SQLite (sql.js, compilé en WebAssembly) derrière l'interface
 * utilisée par l'application avec expo-sqlite.
 */
export async function openSqlJs(bytes?: Uint8Array): Promise<{ db: SqlDatabase; raw: Database }> {
  const SQL = await initSqlJs({ locateFile: (f: string) => path.join(path.dirname(require.resolve('sql.js')), f) });
  const raw = bytes ? new SQL.Database(bytes) : new SQL.Database();
  const db: SqlDatabase = {
    async execAsync(source) {
      raw.exec(source);
    },
    async runAsync(source, params) {
      raw.run(source, params);
    },
    async getAllAsync<T>(source: string, params: (string | number | null)[]) {
      const stmt = raw.prepare(source);
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      stmt.free();
      return rows;
    },
  };
  return { db, raw };
}
