import { router } from 'expo-router';

import { findLayer } from '@/engine/layers';
import { DEFAULT_EXPORT } from '@/engine/renderer';
import { useExport, useExportStore } from '@/features/export';
import { useHistory } from '@/features/history/useHistory';
import { openImageAsNewDocument, useImageImport } from '@/features/image-import/useImageImport';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

import { commandClose, commandInfo, commandOpenFile, commandSave, commandSaveAs, commandSaveCopy } from '@/features/files/fileCommands';
import { chordFor, type CommandId } from '@/features/shortcuts/catalog';
import { useShortcutHelp } from '@/features/shortcuts/dispatcher';
import { isApple } from '@/features/shortcuts/ShortcutsRoot';
import { useDocumentStore } from '@/stores/documentStore';
import { formatChord } from '@/utils/keyChords';

import { goHome } from '../EditorTopBar';
import { requestCloseTab, showDocument } from './DocChrome';
import { useInsertMenu } from '../useInsertMenu';
import { PANEL_LABELS } from './panelMeta';
import type { MenuEntry } from '@/components/workspace/ui';
import { ZOOM_STEP, useWorkspace } from './WorkspaceContext';

export interface MenuDef {
  title: string;
  entries: MenuEntry[];
}

const planned = (label: string, module: string): MenuEntry => ({ type: 'item', label, planned: true, right: module });
const sep: MenuEntry = { type: 'separator' };
/** Raccourci affiché à droite d'une commande. */
const k = (command: CommandId): string | undefined => {
  const chord = chordFor(command);
  return chord ? formatChord(chord, isApple) : undefined;
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
  const history = useHistory(document.id);
  const quickExport = useExport();
  const openExport = useExportStore((s) => s.open);
  const imageImport = useImageImport();
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const setTool = useEditorUiStore((s) => s.setTool);
  const setNotice = useEditorUiStore((s) => s.setNotice);
  const ws = useWorkspaceStore();
  const documents = useDocumentStore((s) => s.documents);
  const order = useDocumentStore((s) => s.order);
  const recent = order
    .slice(0, 8)
    .map((id) => documents[id])
    .filter((d): d is NonNullable<typeof d> => !!d);
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
        { type: 'item', label: 'Nouveau…', icon: 'file-plus-outline', right: k('file.new'), onPress: () => router.push('/new-document') },
        { type: 'item', label: 'Ouvrir…', icon: 'folder-open-outline', right: k('file.open'), onPress: () => void commandOpenFile() },
        { type: 'header', label: 'Ouvrir récent' },
        ...recent.map(
          (d): MenuEntry => ({ type: 'item', label: d.name, icon: 'file-outline', checked: d.id === document.id, onPress: () => showDocument(d.id) }),
        ),
        sep,
        { type: 'item', label: 'Fermer', right: k('file.close'), onPress: () => requestCloseTab(document.id, document.id) },
        {
          type: 'item',
          label: 'Fermer tout',
          onPress: () =>
            commandClose(ws.openDocuments.includes(document.id) ? ws.openDocuments : [...ws.openDocuments, document.id], () => {
              ws.closeAllDocuments();
              goHome();
            }),
        },
        sep,
        { type: 'item', label: 'Enregistrer', icon: 'content-save-outline', right: k('file.save'), onPress: () => void commandSave(document.id) },
        { type: 'item', label: 'Enregistrer sous…', right: k('file.saveAs'), onPress: () => commandSaveAs(document.id, (id) => (id !== document.id ? showDocument(id) : undefined)) },
        { type: 'item', label: 'Enregistrer une copie…', right: k('file.saveCopy'), onPress: () => commandSaveCopy(document.id) },
        { type: 'header', label: 'Exporter' },
        {
          type: 'item',
          label: 'Exportation rapide au format PNG',
          icon: 'export-variant',
          onPress: () =>
            void quickExport.run(document, { ...DEFAULT_EXPORT, format: 'png', scale: 1 }, 'share').then((o) => {
              if (o.ok === false) setNotice(`Export impossible : ${o.message}`);
            }),
        },
        { type: 'item', label: 'Exporter sous…', right: k('file.exportAs'), onPress: () => openExport(document.id) },
        { type: 'header', label: 'Importer' },
        { type: 'item', label: 'Image comme nouveau calque…', icon: 'image-plus', onPress: () => void insertMenu.insert('image') },
        { type: 'item', label: 'Image comme nouveau document…', onPress: () => void openImage() },
        sep,
        { type: 'item', label: 'Informations du document…', icon: 'information-outline', onPress: () => commandInfo(document.id) },
      ],
    },
    {
      title: 'Édition',
      entries: [
        {
          type: 'item',
          label: history.undoLabel ? `Annuler : ${history.undoLabel}` : 'Annuler',
          icon: 'undo',
          right: k('edit.undo'),
          disabled: !history.canUndo,
          onPress: history.undo,
        },
        {
          type: 'item',
          label: history.redoLabel ? `Rétablir : ${history.redoLabel}` : 'Rétablir',
          icon: 'redo',
          right: k('edit.redo'),
          disabled: !history.canRedo,
          onPress: history.redo,
        },
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
        { type: 'item', label: 'Dupliquer…', onPress: () => ws.requestSaveAs({ documentId: document.id, mode: 'duplicate' }) },
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
        { type: 'item', label: 'Dupliquer le calque', right: k('layer.duplicate'), disabled: !layer, onPress: () => layer && actions.duplicate(layer.id) },
        {
          type: 'item',
          label: 'Supprimer le calque…',
          right: k('layer.delete'),
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
        { type: 'item', label: 'Zoom avant', icon: 'magnify-plus-outline', right: k('view.zoomIn'), onPress: () => controller.current?.zoomBy(ZOOM_STEP) },
        { type: 'item', label: 'Zoom arrière', icon: 'magnify-minus-outline', right: k('view.zoomOut'), onPress: () => controller.current?.zoomBy(1 / ZOOM_STEP) },
        { type: 'item', label: 'Ajuster à l’écran', icon: 'fit-to-screen-outline', right: k('view.fit'), onPress: () => controller.current?.fitToScreen() },
        { type: 'item', label: '100 %', right: k('view.actual'), onPress: () => controller.current?.setZoomPercent(100) },
        sep,
        { type: 'item', label: 'Règles', right: k('view.rulers'), checked: ws.rulersVisible, onPress: ws.toggleRulers },
        { type: 'item', label: 'Mode plein écran avec barre de menus', right: 'F', checked: ws.panelsHidden, onPress: ws.togglePanelsHidden },
        planned('Repères', 'M16'),
        planned('Grille', 'M16'),
        planned('Magnétisme', 'M16'),
      ],
    },
    {
      title: 'Fenêtre',
      entries: [
        ...(['adjustments', 'paragraph', 'character', 'color', 'channels', 'layers', 'history', 'navigator', 'swatches', 'properties', 'paths'] as const).map(
          (panel): MenuEntry => ({
            type: 'item',
            label: PANEL_LABELS[panel],
            checked: !ws.hiddenPanels.includes(panel),
            onPress: () => ws.togglePanelVisible(panel),
          }),
        ),
        sep,
        { type: 'header', label: 'Espace de travail' },
        { type: 'item', label: 'Essentiels (par défaut)', checked: true, disabled: true },
        { type: 'item', label: 'Réinitialiser l’espace de travail', onPress: ws.resetWorkspace },
        planned('Nouvel espace de travail…', 'M1 (suite)'),
      ],
    },
    {
      title: 'Aide',
      entries: [
        { type: 'item', label: 'À propos de ZENTECH DESIGN', onPress: () => router.push('/settings') },
        { type: 'item', label: 'Raccourcis clavier…', icon: 'keyboard-outline', right: k('help.shortcuts'), onPress: () => useShortcutHelp.getState().setOpen(true) },
        planned('Guide des outils', 'M1 (suite)'),
      ],
    },
  ];
}
