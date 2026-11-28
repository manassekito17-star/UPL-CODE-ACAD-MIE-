import type { GraphicDocument } from '@/engine/documents';
import { parseProject, serializeDocument } from '@/engine/project';

import type { LoadedProjects, ProjectRepository, SettingsRepository } from './types';

type Param = string | number | null;

/** Le sous-ensemble d'expo-sqlite utilisé ici (aussi fourni par sql.js dans les tests). */
export interface SqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: Param[]): Promise<unknown>;
  getAllAsync<T>(source: string, params: Param[]): Promise<T[]>;
}

/** Version du schéma de la base (PRAGMA user_version). */
export const SCHEMA_VERSION = 3;

/**
 * Migrations du schéma : SCHEMA_MIGRATIONS[v] fait passer la base de la
 * version v à v + 1. La version 0 est une base vide.
 */
const SCHEMA_MIGRATIONS: Record<number, string> = {
  0: `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        format_version INTEGER NOT NULL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS projects_updated_at ON projects (updated_at DESC);`,
  1: `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);`,
  2: `CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY NOT NULL, updated_at INTEGER NOT NULL, data TEXT NOT NULL);
      ALTER TABLE projects ADD COLUMN file_uri TEXT;`,
};

export async function migrateSchema(db: SqlDatabase): Promise<number> {
  const rows = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version', []);
  let version = rows[0]?.user_version ?? 0;
  if (version > SCHEMA_VERSION) {
    throw new Error(`Base de projets créée par une version plus récente de l’application (schéma ${version}).`);
  }
  while (version < SCHEMA_VERSION) {
    const step = SCHEMA_MIGRATIONS[version];
    if (!step) throw new Error(`Migration de la base impossible depuis la version ${version}.`);
    // Une migration et le changement de version forment une seule transaction.
    try {
      await db.execAsync(`BEGIN; ${step} PRAGMA user_version = ${version + 1}; COMMIT;`);
    } catch (error) {
      await db.execAsync('ROLLBACK;').catch(() => undefined);
      throw error;
    }
    version += 1;
  }
  return version;
}

interface Row {
  id: string;
  name: string;
  data: string;
}

/**
 * Projets dans une base SQLite : une ligne par projet, le document en JSON
 * versionné. `INSERT … ON CONFLICT` est une instruction unique, donc
 * atomique : une interruption pendant l'enregistrement laisse l'ancienne
 * version intacte, jamais un mélange.
 */
export function createSqlProjectRepository(open: () => Promise<SqlDatabase>): ProjectRepository {
  return createSqlStores(open).projects;
}

/** Projets et réglages dans la même base, ouverte et migrée une seule fois. */
export function createSqlStores(open: () => Promise<SqlDatabase>): { projects: ProjectRepository; settings: SettingsRepository } {
  let ready: Promise<SqlDatabase> | null = null;
  const db = () => {
    ready ??= open().then(async (database) => {
      await migrateSchema(database);
      return database;
    });
    // Un échec d'ouverture n'est pas mémorisé : « Réessayer » rouvre la base.
    ready.catch(() => {
      ready = null;
    });
    return ready;
  };

  const settings: SettingsRepository = {
    async get(key) {
      const rows = await (await db()).getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
      return rows[0]?.value ?? null;
    },
    async set(key, value) {
      await (await db()).runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
    },
  };

  const projects: ProjectRepository = {
    async loadAll(): Promise<LoadedProjects> {
      const database = await db();
      const rows = await database.getAllAsync<Row & { file_uri: string | null }>('SELECT id, name, data, file_uri FROM projects ORDER BY updated_at DESC', []);
      const result: LoadedProjects = { documents: [], unreadable: [], drafts: [], locations: {} };
      for (const row of rows) {
        const parsed = parseProject(row.data);
        if (parsed.ok && parsed.document.id === row.id) {
          result.documents.push(parsed.document);
          if (row.file_uri) result.locations[row.id] = row.file_uri;
        } else result.unreadable.push({ id: row.id, name: row.name, message: parsed.ok ? 'Identifiant incohérent.' : parsed.message });
      }
      const drafts = await database.getAllAsync<{ id: string; data: string }>('SELECT id, data FROM drafts ORDER BY updated_at DESC', []);
      for (const row of drafts) {
        const parsed = parseProject(row.data);
        if (parsed.ok && parsed.document.id === row.id) result.drafts.push(parsed.document);
        else result.unreadable.push({ id: row.id, name: `Copie de récupération ${row.id}`, message: parsed.ok ? 'Identifiant incohérent.' : parsed.message });
      }
      return result;
    },
    async save(doc: GraphicDocument) {
      const database = await db();
      // Version enregistrée et retrait de la copie de récupération : une seule transaction.
      await database.execAsync('BEGIN;');
      try {
        await database.runAsync(
          `INSERT INTO projects (id, name, width, height, created_at, updated_at, format_version, data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET name = excluded.name, width = excluded.width, height = excluded.height,
             updated_at = excluded.updated_at, format_version = excluded.format_version, data = excluded.data`,
          [doc.id, doc.name, doc.width, doc.height, doc.createdAt, doc.updatedAt, doc.formatVersion, serializeDocument(doc)],
        );
        await database.runAsync('DELETE FROM drafts WHERE id = ?', [doc.id]);
        await database.execAsync('COMMIT;');
      } catch (error) {
        await database.execAsync('ROLLBACK;').catch(() => undefined);
        throw error;
      }
    },
    async remove(id: string) {
      const database = await db();
      await database.runAsync('DELETE FROM projects WHERE id = ?', [id]);
      await database.runAsync('DELETE FROM drafts WHERE id = ?', [id]);
    },
    async saveDraft(doc: GraphicDocument) {
      await (await db()).runAsync(
        'INSERT INTO drafts (id, updated_at, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at, data = excluded.data',
        [doc.id, doc.updatedAt, serializeDocument(doc)],
      );
    },
    async removeDraft(id: string) {
      await (await db()).runAsync('DELETE FROM drafts WHERE id = ?', [id]);
    },
    async setLocation(id: string, uri: string | null) {
      await (await db()).runAsync('UPDATE projects SET file_uri = ? WHERE id = ?', [uri, id]);
    },
  };
  return { projects, settings };
}
