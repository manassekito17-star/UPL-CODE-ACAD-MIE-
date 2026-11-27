import type { GraphicDocument } from '@/engine/documents';
import { parseProject, serializeDocument } from '@/engine/project';

import type { ProjectRepository } from './types';

/** Stockage clé → texte (localStorage sur le web, Map dans les tests). */
export interface TextStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

const PREFIX = 'zentech-design/project/';

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
export function createTextProjectRepository(storage: TextStorage): ProjectRepository {
  return {
    async loadAll() {
      const documents: GraphicDocument[] = [];
      const unreadable: { id: string; name: string; message: string }[] = [];
      for (const key of storage.keys()) {
        if (!key.startsWith(PREFIX)) continue;
        const id = key.slice(PREFIX.length);
        const parsed = parseProject(storage.getItem(key) ?? '');
        if (parsed.ok && parsed.document.id === id) documents.push(parsed.document);
        else unreadable.push({ id, name: id, message: parsed.ok ? 'Identifiant incohérent.' : parsed.message });
      }
      documents.sort((a, b) => b.updatedAt - a.updatedAt);
      return { documents, unreadable };
    },
    async save(doc) {
      storage.setItem(PREFIX + doc.id, serializeDocument(doc));
    },
    async remove(id) {
      storage.removeItem(PREFIX + id);
    },
  };
}
