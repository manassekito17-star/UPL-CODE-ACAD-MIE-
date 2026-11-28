import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useExportStore } from '@/features/export';
import { commandClose, commandOpenFile, commandSave, commandSaveAs, commandSaveCopy } from '@/features/files/fileCommands';
import { useHistory } from '@/features/history/useHistory';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { SHORTCUTS, TOOL_KEYS } from '@/features/shortcuts/catalog';
import { activeCanvasController, pushShortcutHandler, useShortcutHelp, useToast } from '@/features/shortcuts/dispatcher';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

import { closeDocumentTab, showDocument } from './desktop/DocChrome';
import { goHome } from './EditorTopBar';
import { TOOL_FAMILIES, isUsable } from './toolFamilies';

const ZOOM_STEP = Math.SQRT2;

/**
 * Raccourcis de l'éditeur. `studio` : espace tablette (barre d'outils par
 * familles, panneaux) ; sinon, téléphone (Déplacement et Main seulement).
 */
export function useEditorShortcuts(documentId: string, studio: boolean): void {
  const actions = useLayerActions(documentId);
  const history = useHistory(documentId);
  // Les valeurs courantes, sans réinscrire le gestionnaire à chaque rendu.
  const latest = useRef({ actions, history, studio });
  useEffect(() => {
    latest.current = { actions, history, studio };
  });

  useEffect(() => {
    const toast = (m: string) => useToast.getState().show(m);
    const selected = () => useEditorUiStore.getState().selectedLayerId;
    const ws = () => useWorkspaceStore.getState();

    const tool = (letter: string, next: boolean): boolean => {
      const familyId = TOOL_KEYS.get(letter);
      const family = TOOL_FAMILIES.find((f) => f.id === familyId);
      if (!family) return false;
      const items = family.items;
      const currentKey = ws().familyChoice[family.id] ?? items[0]?.key;
      let target = items.find((t) => t.key === currentKey) ?? items[0];
      if (next && items.length > 1) {
        // Maj + lettre : outil suivant de la famille, en sautant ceux qui ne sont pas encore disponibles.
        const i = items.findIndex((t) => t.key === currentKey);
        const following = Array.from({ length: items.length - 1 }, (_, k) => items[(i + 1 + k) % items.length]);
        target = following.find((t) => t && isUsable(t)) ?? following[0];
      }
      if (!target) return false;
      if (!isUsable(target)) {
        toast(`${target.label} (${family.shortcut}) : prévu au module ${target.note ?? ''}, pas encore disponible.`);
        return true;
      }
      if (target.behavior.kind === 'none') return true;
      if (!latest.current.studio && !['move', 'hand'].includes(target.key)) {
        toast(`${target.label} : utilisez la barre d’outils en bas de l’écran.`);
        return true;
      }
      ws().setRailTool(family.id, target.key);
      // Texte et formes : l'outil est choisi ; le calque s'ajoute par la barre d'outils ou le menu Calque.
      useEditorUiStore.getState().setTool(target.behavior.mode);
      return true;
    };

    const run = (command: string): boolean => {
      const { actions: a, history: h, studio: isStudio } = latest.current;
      const zoom = activeCanvasController();
      switch (command) {
        case 'file.new':
          router.push('/new-document');
          return true;
        case 'file.open':
          void commandOpenFile();
          return true;
        case 'file.save':
          void commandSave(documentId);
          return true;
        case 'file.saveAs':
          commandSaveAs(documentId, (id) => (id !== documentId ? showDocument(id) : undefined));
          return true;
        case 'file.saveCopy':
          commandSaveCopy(documentId);
          return true;
        case 'file.close':
          commandClose([documentId], () => (isStudio ? closeDocumentTab(documentId, documentId) : goHome()));
          return true;
        case 'file.exportAs':
          useExportStore.getState().open(documentId);
          return true;
        case 'edit.undo':
          if (h.canUndo) h.undo();
          else toast('Rien à annuler.');
          return true;
        case 'edit.redo':
          if (h.canRedo) h.redo();
          else toast('Rien à rétablir.');
          return true;
        case 'layer.duplicate': {
          const id = selected();
          if (id) a.duplicate(id);
          else toast('Sélectionnez d’abord un calque.');
          return true;
        }
        case 'layer.delete': {
          const id = selected();
          if (!id) return false;
          ws().requestDeleteLayer(id);
          return true;
        }
        case 'view.fit':
          zoom?.fitToScreen();
          return true;
        case 'view.actual':
          zoom?.setZoomPercent(100);
          return true;
        case 'view.zoomIn':
          zoom?.zoomBy(ZOOM_STEP);
          return true;
        case 'view.zoomOut':
          zoom?.zoomBy(1 / ZOOM_STEP);
          return true;
        case 'view.rulers':
          if (isStudio) ws().toggleRulers();
          return isStudio;
        case 'view.grid':
          ws().toggleGrid();
          return true;
        case 'view.guides':
          ws().toggleGuides();
          return true;
        case 'view.snap':
          ws().toggleSnap();
          return true;
        case 'view.lockGuides':
          ws().toggleGuidesLocked();
          return true;
        case 'view.panels':
          if (isStudio) ws().togglePanelsHidden();
          return isStudio;
        case 'color.default':
          ws().resetColors();
          return true;
        case 'color.swap':
          ws().swapColors();
          return true;
        case 'help.shortcuts':
          useShortcutHelp.getState().setOpen(true);
          return true;
        default:
          return false;
      }
    };

    return pushShortcutHandler((chord) => {
      const def = SHORTCUTS.find((s) => s.chord === chord);
      if (def) return run(def.command);
      const m = /^(shift\+)?([a-z])$/.exec(chord);
      return m ? tool(m[2] as string, !!m[1]) : false;
    });
  }, [documentId]);
}
