import { useMemo } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import {
  addLayer,
  alignLayer,
  bringForward,
  bringToFront,
  createImageLayer,
  createShapeLayer,
  createTextLayer,
  duplicateLayer,
  findLayer,
  hitTest,
  removeLayer,
  renameLayer,
  sendBackward,
  sendToBack,
  setLayerLocked,
  setLayerVisibility,
  translateLayer,
  updateLayerGeometry,
  updateLayerStyle,
  type AlignEdge,
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
import { useWorkspaceStore } from '@/stores/workspaceStore';
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
  toFront: (id: string) => void;
  toBack: (id: string) => void;
  align: (id: string, edge: AlignEdge) => void;
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

/** Libellé d'historique d'une modification saisie dans un champ. */
export function geometryLabel(patch: LayerPatch): string {
  const keys = Object.keys(patch);
  if (keys.length === 1 && keys[0] === 'opacity') return 'Opacité du calque';
  if (keys.every((k) => k === 'x' || k === 'y')) return 'Déplacer';
  return 'Transformation manuelle';
}

/** « Déplacer » si seule la position change, sinon « Transformation manuelle ». */
export function transformLabel(doc: GraphicDocument | undefined, id: string, geometry: LayerGeometry): string {
  const layer = doc ? findLayer(doc, id) : undefined;
  if (layer && layer.width === geometry.width && layer.height === geometry.height && layer.rotation === geometry.rotation) {
    return 'Déplacer';
  }
  return 'Transformation manuelle';
}

function styleLabel(doc: GraphicDocument | undefined, id: string): string {
  const layer = doc ? findLayer(doc, id) : undefined;
  return layer?.type === 'text' ? 'Modifier le calque de texte' : 'Modifier le calque de forme';
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
    // Chaque modification réussie devient un état nommé de l'historique (M2).
    const run = (operation: (doc: GraphicDocument) => GraphicDocument, label: string): boolean => {
      const result = mutate(documentId, operation, label);
      setNotice(result.ok ? null : result.message);
      return result.ok;
    };
    /** Même chose, mais l'erreur est rendue à l'appelant (affichée sous un champ). */
    const runForField = (operation: (doc: GraphicDocument) => GraphicDocument, label: string): string | null => {
      const result = mutate(documentId, operation, label);
      return result.ok ? null : result.message;
    };
    const currentDoc = () => useDocumentStore.getState().documents[documentId];
    const foreground = () => useWorkspaceStore.getState().foreground.toUpperCase();

    /** Insère au-dessus du calque sélectionné (ou en haut), sélectionne et passe à l'outil Sélection. */
    const insert = (make: (doc: GraphicDocument) => Layer, label: string) => {
      const doc = currentDoc();
      if (!doc) return;
      const layer = make(doc);
      const ui = useEditorUiStore.getState();
      const above = ui.selectedLayerId && findLayer(doc, ui.selectedLayerId) ? ui.selectedLayerId : null;
      if (run(withTextFitted((d) => addLayer(d, layer, above), layer.id, fonts), label)) {
        selectLayer(layer.id);
        ui.setTool('select');
      }
    };

    return {
      // Les nouvelles formes et les nouveaux textes prennent la couleur de premier plan.
      addShape: (kind) => insert((doc) => createShapeLayer(doc, kind, createLocalId('layer'), foreground()), 'Nouveau calque de forme'),
      addRectangle: () =>
        insert((doc) => createShapeLayer(doc, 'rectangle', createLocalId('layer'), foreground()), 'Nouveau calque de forme'),
      addText: () =>
        insert((doc) => {
          const layer = createTextLayer(doc, createLocalId('layer'));
          const fg = foreground();
          // Un texte de la couleur du fond serait invisible : on garde alors la couleur contrastée.
          const invisible = (doc.background === 'white' && fg === '#FFFFFF') || (doc.background === 'black' && fg === '#000000');
          return invisible ? layer : { ...layer, color: fg };
        }, 'Nouveau calque de texte'),
      addImage: (asset) => insert((doc) => createImageLayer(doc, asset, createLocalId('layer')), 'Importer une image'),
      duplicate: (id) => {
        const newId = createLocalId('layer');
        if (run((d) => duplicateLayer(d, id, newId), 'Dupliquer le calque')) selectLayer(newId);
      },
      remove: (id) => {
        if (run((d) => removeLayer(d, id), 'Supprimer le calque') && useEditorUiStore.getState().selectedLayerId === id) {
          selectLayer(null);
        }
      },
      // L'erreur est affichée dans la boîte de saisie, pas dans le panneau derrière.
      rename: (id, name) => runForField((d) => renameLayer(d, id, name), 'Renommer le calque'),
      setVisible: (id, visible) => {
        run((d) => setLayerVisibility(d, id, visible), visible ? 'Afficher le calque' : 'Masquer le calque');
      },
      setLocked: (id, locked) => {
        run((d) => setLayerLocked(d, id, locked), locked ? 'Verrouiller le calque' : 'Déverrouiller le calque');
      },
      moveUp: (id) => {
        run((d) => bringForward(d, id), 'Disposition des calques');
      },
      moveDown: (id) => {
        run((d) => sendBackward(d, id), 'Disposition des calques');
      },
      toFront: (id) => {
        run((d) => bringToFront(d, id), 'Disposition des calques');
      },
      toBack: (id) => {
        run((d) => sendToBack(d, id), 'Disposition des calques');
      },
      align: (id, edge) => {
        run((d) => alignLayer(d, id, edge), 'Aligner');
      },
      // Une largeur de texte modifiée change le retour à la ligne : on réajuste la hauteur.
      update: (id, patch) =>
        runForField(
          patch.width !== undefined && patch.height === undefined
            ? withTextFitted((d) => updateLayerGeometry(d, id, patch), id, fonts)
            : (d) => updateLayerGeometry(d, id, patch),
          geometryLabel(patch),
        ),
      setStyle: (id, patch) =>
        runForField(withTextFitted((d) => updateLayerStyle(d, id, patch), id, fonts), styleLabel(currentDoc(), id)),
      translate: (id, dx, dy) => run((d) => translateLayer(d, id, dx, dy), 'Déplacer'),
      // Un texte redimensionné garde une hauteur ajustée à son contenu.
      transform: (id, geometry) =>
        run(withTextFitted((d) => updateLayerGeometry(d, id, geometry), id, fonts), transformLabel(currentDoc(), id, geometry)),
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
