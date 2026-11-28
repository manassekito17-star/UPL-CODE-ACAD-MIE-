import type { GraphicDocument } from '@/engine/documents';
import { parseProject, serializeDocument } from '@/engine/project';

import type { ProjectRepository, SettingsRepository } from './types';

/** Stockage clé → texte (localStorage sur le web, Map dans les tests). */
export interface TextStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

const PREFIX = 'zentech-design/project/';
const SETTING = 'zentech-design/setting/';

export function createTextSettingsRepository(storage: TextStorage): SettingsRepository {
  return {
    get: async (key) => storage.getItem(SETTING + key),
    set: async (key, value) => storage.setItem(SETTING + key, value),
  };
}

export function mapStorage(map = new Map<string, string>()): TextStorage {
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    keys: () => [...map.keys()],
  };
}

/**
 * Projets dans un stockage clé → texte, au même format que la base SQLite.
 * Sert sur le web (aperçu, captures) et dans les tests d'interface.
 */
const DRAFT = 'zentech-design/draft/';
const LOCATION = 'zentech-design/location/';

export function createTextProjectRepository(storage: TextStorage): ProjectRepository {
  const read = (prefix: string, unreadableName: (id: string) => string) => {
    const documents: GraphicDocument[] = [];
    const unreadable: { id: string; name: string; message: string }[] = [];
    for (const key of storage.keys()) {
      if (!key.startsWith(prefix)) continue;
      const id = key.slice(prefix.length);
      const parsed = parseProject(storage.getItem(key) ?? '');
      if (parsed.ok && parsed.document.id === id) documents.push(parsed.document);
      else unreadable.push({ id, name: unreadableName(id), message: parsed.ok ? 'Identifiant incohérent.' : parsed.message });
    }
    documents.sort((a, b) => b.updatedAt - a.updatedAt);
    return { documents, unreadable };
  };
  return {
    async loadAll() {
      const saved = read(PREFIX, (id) => id);
      const drafts = read(DRAFT, (id) => `Copie de récupération ${id}`);
      const locations: Record<string, string> = {};
      for (const doc of saved.documents) {
        const uri = storage.getItem(LOCATION + doc.id);
        if (uri) locations[doc.id] = uri;
      }
      return { documents: saved.documents, unreadable: [...saved.unreadable, ...drafts.unreadable], drafts: drafts.documents, locations };
    },
    async save(doc) {
      storage.setItem(PREFIX + doc.id, serializeDocument(doc));
      storage.removeItem(DRAFT + doc.id);
    },
    async remove(id) {
      storage.removeItem(PREFIX + id);
      storage.removeItem(DRAFT + id);
      storage.removeItem(LOCATION + id);
    },
    async saveDraft(doc) {
      storage.setItem(DRAFT + doc.id, serializeDocument(doc));
    },
    async removeDraft(id) {
      storage.removeItem(DRAFT + id);
    },
    async setLocation(id, uri) {
      if (uri) storage.setItem(LOCATION + id, uri);
      else storage.removeItem(LOCATION + id);
    },
  };
}
