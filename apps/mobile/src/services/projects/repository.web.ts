import { createTextProjectRepository, createTextSettingsRepository, mapStorage, type TextStorage } from './memoryRepository';
import type { ProjectRepository, SettingsRepository } from './types';

function browserStorage(): TextStorage {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return mapStorage();
    return {
      getItem: (k) => ls.getItem(k),
      setItem: (k, v) => ls.setItem(k, v),
      removeItem: (k) => ls.removeItem(k),
      keys: () => Array.from({ length: ls.length }, (_, i) => ls.key(i)).filter((k): k is string => k !== null),
    };
  } catch {
    return mapStorage();
  }
}

let repository: ProjectRepository | null = null;
let settings: SettingsRepository | null = null;

export function getSettingsRepository(): SettingsRepository {
  settings ??= createTextSettingsRepository(browserStorage());
  return settings;
}

/**
 * Sur le web (aperçu de développement, pas une plateforme cible), les projets
 * sont gardés dans le stockage du navigateur, au même format.
 */
export function getProjectRepository(): ProjectRepository {
  repository ??= createTextProjectRepository(browserStorage());
  return repository;
}
