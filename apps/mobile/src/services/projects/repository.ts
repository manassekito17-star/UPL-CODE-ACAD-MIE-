import { openDatabaseAsync } from 'expo-sqlite';

import { createSqlStores } from './sqlRepository';
import type { ProjectRepository, SettingsRepository } from './types';

/** Base locale de l'application (dossier privé de l'app, jamais synchronisée). */
export const DATABASE_NAME = 'zentech-design.db';

let stores: ReturnType<typeof createSqlStores> | null = null;

function getStores() {
  stores ??= createSqlStores(async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    // WAL : une écriture interrompue (application tuée) ne corrompt pas la base.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    return db;
  });
  return stores;
}

/** Projets dans SQLite (Android, iOS). */
export function getProjectRepository(): ProjectRepository {
  return getStores().projects;
}

/** Réglages dans la même base. */
export function getSettingsRepository(): SettingsRepository {
  return getStores().settings;
}
