import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { Breakpoint } from '@/hooks/useBreakpoint';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';

// La largeur d'écran est simulée en remplaçant le hook de classe de largeur.
let mockBreakpoint: Breakpoint = 'compact';
jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => mockBreakpoint,
}));

const appDir = 'src/app';

async function openEditor(breakpoint: Breakpoint) {
  mockBreakpoint = breakpoint;
  const doc = useDocumentStore
    .getState()
    .createDocument({ width: 1920, height: 1080, background: 'transparent', name: 'Bannière' });
  await renderRouter(appDir, { initialUrl: `/editor/${doc.id}` });
  expect(screen.getByTestId('editor-screen')).toBeTruthy();
  return doc;
}

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
});

describe('espace de travail', () => {
  it('affiche la barre supérieure, le canvas et les outils selon leur phase', async () => {
    await openEditor('compact');
    const topBar = screen.getByTestId('editor-top-bar');
    expect(within(topBar).getByText('Bannière')).toBeTruthy();
    expect(within(topBar).getByRole('button', { name: 'Annuler' })).toBeDisabled(); // rien à annuler
    expect(within(topBar).getByRole('button', { name: 'Exporter' })).toBeEnabled();
    expect(screen.getByTestId('canvas-area')).toBeTruthy();
    expect(screen.getByLabelText('Document de 1920 × 1080 pixels, 0 calque')).toBeTruthy();

    const toolbar = screen.getByTestId('editor-toolbar');
    // Vue (phase 3) actif par défaut ; Sélection (phase 4) disponible.
    const panTool = within(toolbar).getByRole('button', { name: 'Vue' });
    expect(panTool).toBeEnabled();
    expect(panTool).toBeSelected();
    const selectTool = within(toolbar).getByRole('button', { name: 'Sélection' });
    expect(selectTool).toBeEnabled();
    await fireEvent.press(selectTool);
    expect(useEditorUiStore.getState().activeTool).toBe('select');
    expect(selectTool).toBeSelected();
    await fireEvent.press(panTool);
    // Phase 5 : les insertions sont disponibles (ce ne sont pas des modes).
    for (const tool of ['Texte', 'Formes', 'Image']) {
      expect(within(toolbar).getByRole('button', { name: tool })).toBeEnabled();
    }
    expect(useEditorUiStore.getState().activeTool).toBe('pan');
  });

  it('ajuste le document à la zone de travail puis obéit aux commandes de zoom', async () => {
    await openEditor('compact');
    const zoomValue = () => screen.getByTestId('zoom-value');
    expect(zoomValue()).toHaveTextContent('…'); // taille de la zone encore inconnue

    // Zone de 400 × 600 points, densité 2 : 1920 px tiennent dans 352 points
    // (marges de 24) → échelle 0,1833 → 36,7 % → affiché 37 %.
    await act(async () => {
      fireEvent(screen.getByTestId('document-canvas'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 600 } },
      });
    });
    expect(zoomValue()).toHaveTextContent('37 %');

    await fireEvent.press(screen.getByRole('button', { name: 'Zoomer' }));
    expect(zoomValue()).toHaveTextContent('52 %');
    await fireEvent.press(screen.getByRole('button', { name: 'Dézoomer' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Dézoomer' }));
    expect(zoomValue()).toHaveTextContent('26 %');

    await fireEvent.press(zoomValue());
    expect(zoomValue()).toHaveTextContent('100 %');
    await fireEvent.press(screen.getByRole('button', { name: 'Ajuster à l’écran' }));
    expect(zoomValue()).toHaveTextContent('37 %');
  });

  it('ne dézoome pas au-delà du quart de l’ajustement', async () => {
    await openEditor('compact');
    await act(async () => {
      fireEvent(screen.getByTestId('document-canvas'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 600 } },
      });
    });
    for (let i = 0; i < 10; i += 1) {
      await fireEvent.press(screen.getByRole('button', { name: 'Dézoomer' }));
    }
    // 36,67 % / 4 = 9,2 %.
    expect(screen.getByTestId('zoom-value')).toHaveTextContent('9 %');
  });

  describe('petit écran', () => {
    it('Annuler et Rétablir de la barre supérieure suivent l’historique', async () => {
      const doc = await openEditor('compact');
      const topBar = within(screen.getByTestId('editor-top-bar'));
      expect(topBar.getByRole('button', { name: 'Annuler' })).toBeDisabled();
      await fireEvent.press(within(screen.getByTestId('editor-toolbar')).getByRole('button', { name: 'Texte' }));
      expect(useDocumentStore.getState().documents[doc.id]?.layers).toHaveLength(1);
      const undo = topBar.getByRole('button', { name: 'Annuler' });
      expect(undo).toBeEnabled();
      expect(undo.props.accessibilityHint).toBe('Annuler : Nouveau calque de texte');
      await fireEvent.press(undo);
      expect(useDocumentStore.getState().documents[doc.id]?.layers).toHaveLength(0);
      await fireEvent.press(topBar.getByRole('button', { name: 'Rétablir' }));
      expect(useDocumentStore.getState().documents[doc.id]?.layers).toHaveLength(1);
    });

    it('ouvre un seul panneau à la fois, en feuille refermable', async () => {
      await openEditor('compact');
      expect(screen.queryByTestId('side-panels')).toBeNull();
      expect(screen.queryByTestId('sheet-layers')).toBeNull();

      await fireEvent.press(screen.getByRole('button', { name: 'Calques' }));
      expect(screen.getByTestId('sheet-layers')).toBeTruthy();
      expect(screen.getByText('Fond du document')).toBeTruthy();

      await fireEvent.press(screen.getByRole('button', { name: 'Propriétés' }));
      expect(screen.queryByTestId('sheet-layers')).toBeNull();
      const sheet = screen.getByTestId('sheet-properties');
      expect(within(sheet).getByLabelText('Dimensions : 1920 × 1080 px')).toBeTruthy();
      expect(within(sheet).getByLabelText('Orientation : Paysage')).toBeTruthy();
      expect(within(sheet).getByLabelText('Fond : Transparent')).toBeTruthy();
      expect(within(sheet).getByLabelText('Mémoire par calque : 7,9 Mo')).toBeTruthy();

      await fireEvent.press(screen.getByRole('button', { name: 'Fermer le panneau Propriétés' }));
      expect(screen.queryByTestId('sheet-properties')).toBeNull();
    });
  });

  describe('menus du téléphone', () => {
    it('ouvre les menus complets dans un tiroir, sans les commandes propres à la tablette', async () => {
      await openEditor('compact');
      expect(screen.queryByTestId('menu-drawer')).toBeNull();
      await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Menus' }));
      const drawer = within(screen.getByTestId('menu-drawer'));
      for (const title of ['Fichier', 'Édition', 'Image', 'Calque', 'Texte', 'Sélection', 'Filtre', 'Affichage', 'Fenêtre', 'Aide']) {
        expect(drawer.getByRole('button', { name: `Menu ${title}` })).toBeTruthy();
      }
      // Fichier est déplié par défaut.
      expect(drawer.getByRole('menuitem', { name: 'Enregistrer' })).toBeTruthy();
      expect(drawer.getByRole('menuitem', { name: 'Exporter sous…' })).toBeTruthy();

      await fireEvent.press(drawer.getByRole('button', { name: 'Menu Affichage' }));
      expect(drawer.queryByRole('menuitem', { name: 'Enregistrer' })).toBeNull(); // un seul menu déplié
      expect(drawer.getByRole('menuitem', { name: 'Zoom avant' })).toBeEnabled();
      expect(drawer.queryByRole('menuitem', { name: 'Règles' })).toBeNull();
      expect(drawer.queryByRole('menuitem', { name: 'Mode plein écran avec barre de menus' })).toBeNull();

      await fireEvent.press(drawer.getByRole('button', { name: 'Fermer les menus' }));
      expect(screen.queryByTestId('menu-drawer')).toBeNull();
    });

    it('exécute les commandes du menu : Calque › Nouveau calque de texte', async () => {
      const doc = await openEditor('compact');
      await fireEvent.press(screen.getByRole('button', { name: 'Menus' }));
      const drawer = within(screen.getByTestId('menu-drawer'));
      await fireEvent.press(drawer.getByRole('button', { name: 'Menu Calque' }));
      const entries = drawer.getAllByRole('menuitem').map((e) => e.props.accessibilityLabel as string);
      const textEntry = entries.find((l) => /texte/i.test(l));
      expect(textEntry).toBeDefined();
      await fireEvent.press(drawer.getByRole('menuitem', { name: textEntry! }));
      expect(screen.queryByTestId('menu-drawer')).toBeNull(); // le tiroir se referme
      expect(useDocumentStore.getState().documents[doc.id]?.layers.map((l) => l.type)).toEqual(['text']);
    });

    it('Fenêtre ouvre chaque panneau du téléphone en feuille', async () => {
      await openEditor('compact');
      const panels = [
        ['Couleur', 'color'],
        ['Nuancier', 'swatches'],
        ['Historique', 'history'],
        ['Navigateur', 'navigator'],
        ['Calques', 'layers'],
        ['Propriétés', 'properties'],
      ] as const;
      for (const [title, id] of panels) {
        await fireEvent.press(screen.getByRole('button', { name: 'Menus' }));
        const drawer = within(screen.getByTestId('menu-drawer'));
        // Le tiroir rouvre le dernier menu déplié.
        const section = drawer.getByRole('button', { name: 'Menu Fenêtre' });
        if (!section.props.accessibilityState?.expanded) await fireEvent.press(section);
        await fireEvent.press(drawer.getByRole('menuitem', { name: title }));
        expect(screen.getByTestId(`sheet-${id}`)).toBeTruthy();
        expect(within(screen.getByTestId(`sheet-${id}`)).getByRole('header', { name: title })).toBeTruthy();
      }
      // L'entrée du panneau ouvert est cochée ; la choisir de nouveau ne le referme pas.
      await fireEvent.press(screen.getByRole('button', { name: 'Menus' }));
      const drawer = within(screen.getByTestId('menu-drawer'));
      expect(drawer.getByRole('button', { name: 'Menu Fenêtre' })).toBeExpanded();
      const item = drawer.getByRole('menuitem', { name: 'Propriétés' });
      expect(item.props.accessibilityState).toMatchObject({ checked: true });
      await fireEvent.press(item);
      expect(screen.getByTestId('sheet-properties')).toBeTruthy();
    });
  });

  describe('grand écran', () => {
    it('affiche l’espace studio (détaillé dans studio-workspace.test.tsx)', async () => {
      await openEditor('expanded');
      expect(screen.getByTestId('desktop-workspace')).toBeTruthy();
      expect(screen.queryByTestId('editor-toolbar')).toBeNull();
      expect(screen.getByTestId('layers-panel')).toBeTruthy();
      expect(screen.getByTestId('properties-panel')).toBeTruthy();
    });
  });
});
