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
    expect(within(topBar).getByRole('button', { name: 'Annuler' })).toBeDisabled();
    expect(within(topBar).getByRole('button', { name: 'Exporter' })).toBeDisabled();
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
    for (const tool of ['Texte', 'Formes', 'Image']) {
      expect(within(toolbar).getByRole('button', { name: tool })).toBeDisabled();
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

  describe('grand écran', () => {
    it('affiche les deux panneaux côte à côte, repliables et masquables', async () => {
      await openEditor('expanded');
      expect(screen.getByTestId('side-panels')).toBeTruthy();
      expect(screen.getByTestId('layers-panel-content')).toBeTruthy();
      expect(screen.getByTestId('properties-panel-content')).toBeTruthy();

      const layersHeader = within(screen.getByTestId('panel-layers')).getByRole('button', { name: 'Calques' });
      expect(layersHeader).toBeExpanded();
      await fireEvent.press(layersHeader);
      expect(screen.queryByTestId('layers-panel-content')).toBeNull();
      expect(screen.getByTestId('properties-panel-content')).toBeTruthy();

      await fireEvent.press(screen.getByRole('button', { name: 'Masquer les panneaux' }));
      expect(screen.queryByTestId('side-panels')).toBeNull();
      expect(screen.getByRole('button', { name: 'Afficher les panneaux' })).toBeTruthy();
    });
  });
});
