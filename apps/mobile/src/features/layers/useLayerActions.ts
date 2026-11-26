import { useMemo } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import {
  addLayer,
  bringForward,
  createRectangleLayer,
  duplicateLayer,
  findLayer,
  hitTest,
  removeLayer,
  renameLayer,
  sendBackward,
  setLayerLocked,
  setLayerVisibility,
  translateLayer,
  updateLayerGeometry,
  type LayerPatch,
} from '@/engine/layers';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { createLocalId } from '@/utils/id';

export interface LayerActions {
  addRectangle: () => void;
  duplicate: (id: string) => void;
  /** Supprime CE calque (appelé seulement après confirmation dans l'interface). */
  remove: (id: string) => void;
  /** Renvoie le message d'erreur à afficher dans la boîte de saisie, ou null si renommé. */
  rename: (id: string, name: string) => string | null;
  setVisible: (id: string, visible: boolean) => void;
  setLocked: (id: string, locked: boolean) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  /** Renvoie le message d'erreur à afficher dans le champ concerné, ou null si appliqué. */
  update: (id: string, patch: LayerPatch) => string | null;
  translate: (id: string, dx: number, dy: number) => boolean;
  select: (id: string | null) => void;
  /** Sélectionne le calque visible le plus haut au point du document, ou rien. */
  selectAt: (x: number, y: number) => void;
}

/**
 * Actions sur les calques du document `documentId`. Chaque action passe par
 * une opération pure du moteur ; un refus (calque verrouillé, valeur
 * invalide) est affiché à l'utilisateur, jamais ignoré.
 */
export function useLayerActions(documentId: string): LayerActions {
  const mutate = useDocumentStore((s) => s.mutateDocument);
  const selectLayer = useEditorUiStore((s) => s.selectLayer);
  const setNotice = useEditorUiStore((s) => s.setNotice);

  return useMemo(() => {
    const run = (operation: (doc: GraphicDocument) => GraphicDocument): boolean => {
      const result = mutate(documentId, operation);
      setNotice(result.ok ? null : result.message);
      return result.ok;
    };
    const currentDoc = () => useDocumentStore.getState().documents[documentId];

    return {
      addRectangle: () => {
        const doc = currentDoc();
        if (!doc) return;
        const layer = createRectangleLayer(doc, createLocalId('layer'));
        const above = useEditorUiStore.getState().selectedLayerId;
        const aboveExisting = above && findLayer(doc, above) ? above : null;
        if (run((d) => addLayer(d, layer, aboveExisting))) selectLayer(layer.id);
      },
      duplicate: (id) => {
        const newId = createLocalId('layer');
        if (run((d) => duplicateLayer(d, id, newId))) selectLayer(newId);
      },
      remove: (id) => {
        if (run((d) => removeLayer(d, id)) && useEditorUiStore.getState().selectedLayerId === id) {
          selectLayer(null);
        }
      },
      rename: (id, name) => {
        // L'erreur est affichée dans la boîte de saisie, pas dans le panneau derrière.
        const result = mutate(documentId, (d) => renameLayer(d, id, name));
        return result.ok ? null : result.message;
      },
      setVisible: (id, visible) => {
        run((d) => setLayerVisibility(d, id, visible));
      },
      setLocked: (id, locked) => {
        run((d) => setLayerLocked(d, id, locked));
      },
      moveUp: (id) => {
        run((d) => bringForward(d, id));
      },
      moveDown: (id) => {
        run((d) => sendBackward(d, id));
      },
      update: (id, patch) => {
        // L'erreur s'affiche sous le champ modifié, pas en double dans le panneau.
        const result = mutate(documentId, (d) => updateLayerGeometry(d, id, patch));
        return result.ok ? null : result.message;
      },
      translate: (id, dx, dy) => run((d) => translateLayer(d, id, dx, dy)),
      select: (id) => {
        selectLayer(id);
        setNotice(null);
      },
      selectAt: (x, y) => {
        const doc = currentDoc();
        if (!doc) return;
        selectLayer(hitTest(doc.layers, x, y)?.id ?? null);
        setNotice(null);
      },
    };
  }, [documentId, mutate, selectLayer, setNotice]);
}
