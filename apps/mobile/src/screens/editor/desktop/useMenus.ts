import { router } from 'expo-router';

import { findLayer } from '@/engine/layers';
import { openImageAsNewDocument, useImageImport } from '@/features/image-import/useImageImport';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore, type PanelId } from '@/stores/workspaceStore';

import { goHome } from '../EditorTopBar';
import { useInsertMenu } from '../useInsertMenu';
import type { MenuEntry } from './ui';
import { ZOOM_STEP, useWorkspace } from './WorkspaceContext';

export interface MenuDef {
  title: string;
  entries: MenuEntry[];
}

const planned = (label: string, module: string): MenuEntry => ({ type: 'item', label, planned: true, right: module });
const sep: MenuEntry = { type: 'separator' };

export const PANEL_LABELS: Record<PanelId, string> = {
  color: 'Couleur',
  swatches: 'Nuancier',
  properties: 'Propriétés',
  adjustments: 'Ajustements',
  layers: 'Calques',
  channels: 'Canaux',
  paths: 'Tracés',
  history: 'Historique',
};

/**
 * Contenu des menus. Une commande disponible déclenche une vraie action ;
 * une commande prévue est désactivée et affiche son module ; une commande
 * sans objet (aucun calque sélectionné…) est désactivée.
 */
export function useMenus(): MenuDef[] {
  const { document, controller } = useWorkspace();
  const actions = useLayerActions(document.id);
  const insertMenu = useInsertMenu(document.id);
  const imageImport = useImageImport();
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const setTool = useEditorUiStore((s) => s.setTool);
  const setNotice = useEditorUiStore((s) => s.setNotice);
  const ws = useWorkspaceStore();
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  const text = layer?.type === 'text' ? layer : undefined;

  const openImage = async () => {
    const { asset, error } = await imageImport.pick();
    if (asset) openImageAsNewDocument(asset);
    else if (error) setNotice(error);
  };

  return [
    {
      title: 'Fichier',
      entries: [
        { type: 'item', label: 'Nouveau…', icon: 'file-plus-outline', onPress: () => router.push('/new-document') },
        { type: 'item', label: 'Ouvrir une image…', icon: 'image-plus', onPress: () => void openImage() },
        sep,
        planned('Enregistrer', 'M3'),
        planned('Enregistrer sous…', 'M3'),
        planned('Exporter en PNG ou JPEG…', 'M4'),
        sep,
        { type: 'item', label: 'Fermer', onPress: goHome },
      ],
    },
    {
      title: 'Édition',
      entries: [
        planned('Annuler', 'M2'),
        planned('Rétablir', 'M2'),
        sep,
        planned('Couper', 'M6'),
        planned('Copier', 'M6'),
        planned('Coller', 'M6'),
        sep,
        planned('Remplir…', 'M5'),
        planned('Contour…', 'M7'),
        sep,
        {
          type: 'item',
          label: 'Transformation manuelle',
          disabled: !layer || layer.locked,
          onPress: () => {
            setTool('select');
            ws.setRailTool('move', 'move');
          },
        },
        planned('Torsion, perspective, déformation', 'M14'),
        sep,
        { type: 'item', label: 'Préférences…', onPress: () => router.push('/settings') },
      ],
    },
    {
      title: 'Image',
      entries: [
        planned('Réglages', 'M9'),
        sep,
        planned('Taille de l’image…', 'M14'),
        planned('Taille de la zone de travail…', 'M14'),
        planned('Rotation de l’image', 'M14'),
        planned('Recadrer', 'M14'),
        sep,
        planned('Dupliquer le document…', 'M3'),
      ],
    },
    {
      title: 'Calque',
      entries: [
        { type: 'header', label: 'Nouveau calque' },
        { type: 'item', label: 'Texte', icon: 'format-text', onPress: () => void insertMenu.insert('text') },
        { type: 'item', label: 'Rectangle', icon: 'square-outline', onPress: () => void insertMenu.insert('rectangle') },
        { type: 'item', label: 'Ellipse', icon: 'circle-outline', onPress: () => void insertMenu.insert('ellipse') },
        { type: 'item', label: 'Ligne', icon: 'minus', onPress: () => void insertMenu.insert('line') },
        { type: 'item', label: 'Image de la galerie…', icon: 'image-plus', onPress: () => void insertMenu.insert('image') },
        planned('Calque de pixels', 'M5'),
        sep,
        { type: 'item', label: 'Dupliquer le calque', disabled: !layer, onPress: () => layer && actions.duplicate(layer.id) },
        {
          type: 'item',
          label: 'Supprimer le calque…',
          disabled: !layer || layer.locked,
          onPress: () => layer && ws.requestDeleteLayer(layer.id),
        },
        { type: 'item', label: 'Renommer le calque…', disabled: !layer, onPress: () => layer && ws.requestRenameLayer(layer.id) },
        sep,
        {
          type: 'item',
          label: layer?.visible === false ? 'Afficher le calque' : 'Masquer le calque',
          disabled: !layer,
          onPress: () => layer && actions.setVisible(layer.id, !layer.visible),
        },
        {
          type: 'item',
          label: layer?.locked ? 'Déverrouiller le calque' : 'Verrouiller le calque',
          disabled: !layer,
          onPress: () => layer && actions.setLocked(layer.id, !layer.locked),
        },
        sep,
        { type: 'header', label: 'Disposition' },
        { type: 'item', label: 'Premier plan', disabled: !layer, onPress: () => layer && actions.toFront(layer.id) },
        { type: 'item', label: 'Avancer', disabled: !layer, onPress: () => layer && actions.moveUp(layer.id) },
        { type: 'item', label: 'Reculer', disabled: !layer, onPress: () => layer && actions.moveDown(layer.id) },
        { type: 'item', label: 'Arrière-plan', disabled: !layer, onPress: () => layer && actions.toBack(layer.id) },
        sep,
        planned('Grouper les calques', 'M7'),
        planned('Fusionner vers le bas', 'M7'),
        planned('Aplatir l’image', 'M7'),
        sep,
        planned('Masque de fusion', 'M7'),
        planned('Masque vectoriel', 'M12'),
        planned('Style de calque…', 'M7'),
      ],
    },
    {
      title: 'Texte',
      entries: [
        { type: 'item', label: 'Police : Inter', checked: true, disabled: true },
        {
          type: 'item',
          label: 'Gras',
          checked: text?.bold,
          disabled: !text || text.locked,
          onPress: () => text && actions.setStyle(text.id, { bold: !text.bold }),
        },
        sep,
        ...(['left', 'center', 'right'] as const).map(
          (align): MenuEntry => ({
            type: 'item',
            label: { left: 'Aligner à gauche', center: 'Centrer', right: 'Aligner à droite' }[align],
            checked: text?.align === align,
            disabled: !text || text.locked,
            onPress: () => text && actions.setStyle(text.id, { align }),
          }),
        ),
        sep,
        planned('Interlignage, approche, crénage', 'M13'),
        planned('Orientation verticale', 'M13'),
        planned('Autres polices', 'M13'),
      ],
    },
    {
      title: 'Sélection',
      entries: [
        planned('Tout sélectionner', 'M6'),
        planned('Désélectionner', 'M6'),
        planned('Intervertir', 'M6'),
        sep,
        planned('Sujet', 'M18'),
        planned('Plage de couleurs…', 'M6'),
        planned('Contour progressif, étendre, contracter…', 'M6'),
        planned('Mémoriser la sélection', 'M15'),
      ],
    },
    {
      title: 'Filtre',
      entries: [
        planned('Flou gaussien…', 'M10'),
        planned('Flou directionnel…', 'M10'),
        planned('Flou de profondeur…', 'M10'),
        planned('Accentuation…', 'M10'),
        planned('Réduction du bruit…', 'M10'),
        sep,
        planned('Filtres non destructifs', 'M10'),
      ],
    },
    {
      title: 'Affichage',
      entries: [
        { type: 'item', label: 'Zoom avant', icon: 'magnify-plus-outline', onPress: () => controller.current?.zoomBy(ZOOM_STEP) },
        { type: 'item', label: 'Zoom arrière', icon: 'magnify-minus-outline', onPress: () => controller.current?.zoomBy(1 / ZOOM_STEP) },
        { type: 'item', label: 'Ajuster à l’écran', icon: 'fit-to-screen-outline', onPress: () => controller.current?.fitToScreen() },
        { type: 'item', label: '100 %', onPress: () => controller.current?.setZoomPercent(100) },
        sep,
        { type: 'item', label: 'Règles', checked: ws.rulersVisible, onPress: ws.toggleRulers },
        planned('Repères', 'M16'),
        planned('Grille', 'M16'),
        planned('Magnétisme', 'M16'),
      ],
    },
    {
      title: 'Fenêtre',
      entries: [
        ...(['layers', 'properties', 'color', 'swatches', 'history', 'adjustments', 'channels', 'paths'] as const).map(
          (panel): MenuEntry => ({
            type: 'item',
            label: PANEL_LABELS[panel],
            checked: !ws.hiddenPanels.includes(panel),
            onPress: () => ws.togglePanelVisible(panel),
          }),
        ),
        sep,
        planned('Navigateur', 'M16'),
        planned('Caractère, Paragraphe', 'M13'),
        sep,
        planned('Espaces de travail enregistrés', 'M1 (suite)'),
        { type: 'item', label: 'Réinitialiser l’espace de travail', onPress: ws.resetWorkspace },
      ],
    },
    {
      title: 'Aide',
      entries: [
        { type: 'item', label: 'À propos de ZENTECH DESIGN', onPress: () => router.push('/settings') },
        planned('Raccourcis clavier', 'M17'),
        planned('Guide des outils', 'M1 (suite)'),
      ],
    },
  ];
}
