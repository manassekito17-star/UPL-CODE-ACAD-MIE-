import { useMemo } from 'react';

import { findLayer } from '@/engine/layers';
import { canRedo, canUndo, redoLabel, undoLabel, type History } from '@/engine/history';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore } from '@/stores/editorUiStore';

export interface HistoryControls {
  history: History | undefined;
  canUndo: boolean;
  canRedo: boolean;
  /** Action que « Annuler » défait (« Déplacer »…), ou null. */
  undoLabel: string | null;
  redoLabel: string | null;
  undo: () => void;
  redo: () => void;
  goTo: (index: number) => void;
  deleteFrom: (index: number) => void;
  clear: () => void;
}

/**
 * Annuler, Rétablir et navigation dans l'historique d'un document. Après un
 * changement d'état, la sélection est retirée si son calque n'existe plus
 * dans l'état affiché, et l'éventuel message d'erreur est effacé.
 */
export function useHistory(documentId: string): HistoryControls {
  const history = useDocumentStore((s) => s.histories[documentId]);
  return useMemo(() => {
    const after = () => {
      const doc = useDocumentStore.getState().documents[documentId];
      const ui = useEditorUiStore.getState();
      if (ui.selectedLayerId && (!doc || !findLayer(doc, ui.selectedLayerId))) ui.selectLayer(null);
      ui.setNotice(null);
    };
    const store = () => useDocumentStore.getState();
    return {
      history,
      canUndo: history ? canUndo(history) : false,
      canRedo: history ? canRedo(history) : false,
      undoLabel: history ? undoLabel(history) : null,
      redoLabel: history ? redoLabel(history) : null,
      undo: () => {
        if (store().undo(documentId)) after();
      },
      redo: () => {
        if (store().redo(documentId)) after();
      },
      goTo: (index) => {
        if (store().goToHistoryState(documentId, index)) after();
      },
      deleteFrom: (index) => {
        if (store().deleteHistoryFrom(documentId, index)) after();
      },
      clear: () => store().clearHistory(documentId),
    };
  }, [documentId, history]);
}
