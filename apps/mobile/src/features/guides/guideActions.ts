import { addGuide, clearGuides, isGuideDroppedOutside, moveGuide, removeGuide, type GuideOrientation } from '@/engine/guides';
import { useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { createLocalId } from '@/utils/id';

/**
 * Commandes sur les repères d'un document. Chacune est une étape de
 * l'historique (Annuler la défait) et marque le document comme modifié.
 */
export const guideActions = {
  add(documentId: string, orientation: GuideOrientation, position: number): void {
    // Un repère créé alors que les repères sont masqués les fait réapparaître.
    if (!useWorkspaceStore.getState().guidesVisible) useWorkspaceStore.getState().toggleGuides();
    useDocumentStore
      .getState()
      .mutateDocument(documentId, (d) => addGuide(d, { id: createLocalId('guide'), orientation, position }), 'Nouveau repère');
  },
  /** Fin du glisser d'un repère : déplacé, ou retiré s'il est relâché hors du document. */
  drop(documentId: string, id: string, position: number): void {
    const store = useDocumentStore.getState();
    const doc = store.documents[documentId];
    const guide = doc?.guides.find((g) => g.id === id);
    if (!doc || !guide) return;
    if (isGuideDroppedOutside(guide.orientation, position, doc)) store.mutateDocument(documentId, (d) => removeGuide(d, id), 'Supprimer le repère');
    else store.mutateDocument(documentId, (d) => moveGuide(d, id, position), 'Déplacer le repère');
  },
  clear(documentId: string): void {
    useDocumentStore.getState().mutateDocument(documentId, clearGuides, 'Effacer les repères');
  },
};
