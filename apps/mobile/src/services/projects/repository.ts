import { openDatabaseAsync } from 'expo-sqlite';

import { createSqlProjectRepository } from './sqlRepository';
import type { ProjectRepository } from './types';

/** Base locale de l'application (dossier privé de l'app, jamais synchronisée). */
export const DATABASE_NAME = 'zentech-design.db';

let repository: ProjectRepository | null = null;

/** Projets dans SQLite (Android, iOS). */
export function getProjectRepository(): ProjectRepository {
  repository ??= createSqlProjectRepository(async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    // WAL : une écriture interrompue (application tuée) ne corrompt pas la base.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    return db;
  });
  return repository;
}
