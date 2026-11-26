import { useMemo } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import {
  addLayer,
  bringForward,
  createImageLayer,
  createShapeLayer,
  createTextLayer,
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
  updateLayerStyle,
  type ImageAsset,
  type Layer,
  type LayerGeometry,
  type LayerPatch,
  type LayerStylePatch,
  type ShapeKind,
} from '@/engine/layers';
import { measureTextHeight } from '@/engine/renderer';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { createLocalId } from '@/utils/id';

export interface LayerActions {
  addShape: (kind: ShapeKind) => void;
  addText: () => void;
  addImage: (asset: ImageAsset) => void;
  /** Compatibilité phase 4. */
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
  /** Couleur, texte, taille, alignement, gras. Même convention que `update`. */
  setStyle: (id: string, patch: LayerStylePatch) => string | null;
  translate: (id: string, dx: number, dy: number) => boolean;
  /** Géométrie issue d'une manipulation au doigt (déplacer, redimensionner, tourner). */
  transform: (id: string, geometry: LayerGeometry) => boolean;
  select: (id: string | null) => void;
  /** Sélectionne le calque visible le plus haut au point du document, ou rien. */
  selectAt: (x: number, y: number) => void;
}

/**
 * Pour un texte, ajuste la hauteur du calque à celle du texte mis en page
 * (dans la même opération que la modification : une seule étape
 * d'historique en phase 6). Sans police chargée, la hauteur est laissée telle quelle.
 */
function withTextFitted(
  operation: (doc: GraphicDocument) => GraphicDocument,
  id: string,
  fonts: Parameters<typeof measureTextHeight>[1],
): (doc: GraphicDocument) => GraphicDocument {
  return (doc) => {
    const next = operation(doc);
    const layer = findLayer(next, id);
    if (!layer || layer.type !== 'text' || layer.locked) return next;
    const measured = measureTextHeight(layer, fonts);
    if (measured === null) return next;
    const height = Math.max(Math.ceil(measured), Math.ceil(layer.fontSize));
    return height === layer.height ? next : updateLayerGeometry(next, id, { height });
  };
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
  const { fonts } = useRenderResources();

  return useMemo(() => {
    const run = (operation: (doc: GraphicDocument) => GraphicDocument): boolean => {
      const result = mutate(documentId, operation);
      setNotice(result.ok ? null : result.message);
      return result.ok;
    };
    /** Même chose, mais l'erreur est rendue à l'appelant (affichée sous un champ). */
    const runForField = (operation: (doc: GraphicDocument) => GraphicDocument): string | null => {
      const result = mutate(documentId, operation);
      return result.ok ? null : result.message;
    };
    const currentDoc = () => useDocumentStore.getState().documents[documentId];

    /** Insère au-dessus du calque sélectionné (ou en haut), sélectionne et passe à l'outil Sélection. */
    const insert = (make: (doc: GraphicDocument) => Layer) => {
      const doc = currentDoc();
      if (!doc) return;
      const layer = make(doc);
      const ui = useEditorUiStore.getState();
      const above = ui.selectedLayerId && findLayer(doc, ui.selectedLayerId) ? ui.selectedLayerId : null;
      if (run(withTextFitted((d) => addLayer(d, layer, above), layer.id, fonts))) {
        selectLayer(layer.id);
        ui.setTool('select');
      }
    };

    return {
      addShape: (kind) => insert((doc) => createShapeLayer(doc, kind, createLocalId('layer'))),
      addRectangle: () => insert((doc) => createShapeLayer(doc, 'rectangle', createLocalId('layer'))),
      addText: () => insert((doc) => createTextLayer(doc, createLocalId('layer'))),
      addImage: (asset) => insert((doc) => createImageLayer(doc, asset, createLocalId('layer'))),
      duplicate: (id) => {
        const newId = createLocalId('layer');
        if (run((d) => duplicateLayer(d, id, newId))) selectLayer(newId);
      },
      remove: (id) => {
        if (run((d) => removeLayer(d, id)) && useEditorUiStore.getState().selectedLayerId === id) {
          selectLayer(null);
        }
      },
      // L'erreur est affichée dans la boîte de saisie, pas dans le panneau derrière.
      rename: (id, name) => runForField((d) => renameLayer(d, id, name)),
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
      // Une largeur de texte modifiée change le retour à la ligne : on réajuste la hauteur.
      update: (id, patch) =>
        runForField(
          patch.width !== undefined && patch.height === undefined
            ? withTextFitted((d) => updateLayerGeometry(d, id, patch), id, fonts)
            : (d) => updateLayerGeometry(d, id, patch),
        ),
      setStyle: (id, patch) => runForField(withTextFitted((d) => updateLayerStyle(d, id, patch), id, fonts)),
      translate: (id, dx, dy) => run((d) => translateLayer(d, id, dx, dy)),
      // Un texte redimensionné garde une hauteur ajustée à son contenu.
      transform: (id, geometry) => run(withTextFitted((d) => updateLayerGeometry(d, id, geometry), id, fonts)),
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
  }, [documentId, mutate, selectLayer, setNotice, fonts]);
}
