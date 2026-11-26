import { create } from 'zustand';

import { createDocument, type DocumentSpec, type GraphicDocument } from '@/engine/documents';
import { LayerError } from '@/engine/layers';
import { createLocalId } from '@/utils/id';

/**
 * Documents ouverts pendant la session.
 *
 * ATTENTION : ils sont seulement en mémoire jusqu'à la phase 7 (sauvegarde
 * SQLite + fichiers). L'interface le signale à l'utilisateur.
 */
export interface DocumentState {
  documents: Record<string, GraphicDocument>;
  /** Identifiants, du plus récemment modifié au plus ancien. */
  order: string[];
  createDocument: (spec: DocumentSpec) => GraphicDocument;
  /** Supprime exactement ce document. Renvoie faux s'il n'existe pas. */
  removeDocument: (id: string) => boolean;
  /**
   * Applique une opération pure au document (voir engine/layers). Met à jour
   * la date de modification seulement si le document a changé. Une
   * LayerError est renvoyée sous forme de message, jamais avalée.
   */
  mutateDocument: (id: string, operation: (doc: GraphicDocument) => GraphicDocument) => MutationResult;
}

export type MutationResult = { ok: true } | { ok: false; message: string };

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  documents: {},
  order: [],

  createDocument: (spec) => {
    const now = Date.now();
    const doc = createDocument(spec, { id: createLocalId('doc', now), now });
    set((state) => ({
      documents: { ...state.documents, [doc.id]: doc },
      order: [doc.id, ...state.order],
    }));
    return doc;
  },

  removeDocument: (id) => {
    if (!(id in get().documents)) return false;
    set((state) => {
      const { [id]: _removed, ...documents } = state.documents;
      return { documents, order: state.order.filter((other) => other !== id) };
    });
    return true;
  },

  mutateDocument: (id, operation) => {
    const current = get().documents[id];
    if (!current) return { ok: false, message: 'Projet introuvable.' };
    let next: GraphicDocument;
    try {
      next = operation(current);
    } catch (error) {
      if (error instanceof LayerError) return { ok: false, message: error.message };
      throw error;
    }
    if (next !== current) {
      set((state) => ({
        documents: { ...state.documents, [id]: { ...next, updatedAt: Date.now() } },
        order: [id, ...state.order.filter((other) => other !== id)],
      }));
    }
    return { ok: true };
  },
}));

/** Remet le store à zéro (tests). */
export function resetDocumentStore(): void {
  useDocumentStore.setState({ documents: {}, order: [] });
}
