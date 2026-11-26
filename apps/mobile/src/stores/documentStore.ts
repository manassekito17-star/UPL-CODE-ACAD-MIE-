import { create } from "zustand";

import {
  createDocument,
  type DocumentSpec,
  type GraphicDocument,
} from "@/engine/documents";
import * as historyOps from "@/engine/history";
import type { History } from "@/engine/history";
import { LayerError } from "@/engine/layers";
import { createLocalId } from "@/utils/id";

/**
 * Documents ouverts pendant la session.
 *
 * ATTENTION : ils sont seulement en mémoire jusqu'à la phase 7 (sauvegarde
 * SQLite + fichiers). L'interface le signale à l'utilisateur.
 */
export interface DocumentState {
  documents: Record<string, GraphicDocument>;
  /** Historique Annuler / Rétablir de chaque document (en mémoire, comme le document). */
  histories: Record<string, History>;
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
  mutateDocument: (
    id: string,
    operation: (doc: GraphicDocument) => GraphicDocument,
    label?: string,
  ) => MutationResult;
  /** Affiche l'état `index` de l'historique (Annuler, Rétablir, clic dans le panneau Historique). */
  goToHistoryState: (id: string, index: number) => boolean;
  undo: (id: string) => boolean;
  redo: (id: string) => boolean;
  /** Supprime l'état `index` et les suivants. */
  deleteHistoryFrom: (id: string, index: number) => boolean;
  /** Ne garde que l'état courant, avec le libellé donné s'il y en a un. */
  clearHistory: (id: string, label?: string) => void;
}

export type MutationResult = { ok: true } | { ok: false; message: string };

export const useDocumentStore = create<DocumentState>()((set, get) => {
  /** Affiche l'état courant d'un historique modifié (date de modification mise à jour). */
  const show = (id: string, history: History): boolean => {
    const state = get();
    const previous = state.histories[id];
    if (!previous || !state.documents[id] || history === previous) return false;
    const doc = historyOps.currentState(history).doc;
    set((s) => ({
      documents: { ...s.documents, [id]: { ...doc, updatedAt: Date.now() } },
      histories: { ...s.histories, [id]: history },
      order: [id, ...s.order.filter((other) => other !== id)],
    }));
    return true;
  };
  const historyOf = (id: string) => get().histories[id];

  return {
    documents: {},
    histories: {},
    order: [],

    createDocument: (spec) => {
      const now = Date.now();
      const doc = createDocument(spec, { id: createLocalId("doc", now), now });
      set((state) => ({
        documents: { ...state.documents, [doc.id]: doc },
        histories: {
          ...state.histories,
          [doc.id]: historyOps.createHistory(doc, "Nouveau document"),
        },
        order: [doc.id, ...state.order],
      }));
      return doc;
    },

    removeDocument: (id) => {
      if (!(id in get().documents)) return false;
      set((state) => {
        const { [id]: _removed, ...documents } = state.documents;
        const { [id]: _history, ...histories } = state.histories;
        return {
          documents,
          histories,
          order: state.order.filter((other) => other !== id),
        };
      });
      return true;
    },

    mutateDocument: (id, operation, label = "Modification") => {
      const current = get().documents[id];
      if (!current) return { ok: false, message: "Projet introuvable." };
      let next: GraphicDocument;
      try {
        next = operation(current);
      } catch (error) {
        if (error instanceof LayerError)
          return { ok: false, message: error.message };
        throw error;
      }
      if (next !== current) {
        const saved = { ...next, updatedAt: Date.now() };
        set((state) => {
          const history =
            state.histories[id] ??
            historyOps.createHistory(current, "Nouveau document");
          return {
            documents: { ...state.documents, [id]: saved },
            histories: {
              ...state.histories,
              [id]: historyOps.record(history, label, saved),
            },
            order: [id, ...state.order.filter((other) => other !== id)],
          };
        });
      }
      return { ok: true };
    },

    goToHistoryState: (id, index) => {
      const history = historyOf(id);
      return history ? show(id, historyOps.goTo(history, index)) : false;
    },
    undo: (id) => {
      const history = historyOf(id);
      return history ? show(id, historyOps.undo(history)) : false;
    },
    redo: (id) => {
      const history = historyOf(id);
      return history ? show(id, historyOps.redo(history)) : false;
    },
    deleteHistoryFrom: (id, index) => {
      const history = historyOf(id);
      return history ? show(id, historyOps.deleteFrom(history, index)) : false;
    },
    clearHistory: (id, label) => {
      const history = historyOf(id);
      if (!history) return;
      const cleared = historyOps.clearHistory(history);
      const only = historyOps.currentState(cleared);
      set((s) => ({
        histories: {
          ...s.histories,
          [id]: label ? { states: [{ ...only, label }], index: 0 } : cleared,
        },
      }));
    },
  };
});

/** Remet le store à zéro (tests). */
export function resetDocumentStore(): void {
  useDocumentStore.setState({ documents: {}, histories: {}, order: [] });
}
