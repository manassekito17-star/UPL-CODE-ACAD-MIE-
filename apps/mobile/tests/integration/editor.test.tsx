import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { Breakpoint } from '@/hooks/useBreakpoint';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore } from '@/stores/editorUiStore';

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
  it('affiche la barre supérieure, la zone de travail et des outils désactivés tant que leur phase n’est pas livrée', async () => {
    await openEditor('compact');
    const topBar = screen.getByTestId('editor-top-bar');
    expect(within(topBar).getByText('Bannière')).toBeTruthy();
    expect(within(topBar).getByRole('button', { name: 'Annuler' })).toBeDisabled();
    expect(within(topBar).getByRole('button', { name: 'Exporter' })).toBeDisabled();
    expect(screen.getByTestId('canvas-area')).toBeTruthy();

    const toolbar = screen.getByTestId('editor-toolbar');
    for (const tool of ['Sélection', 'Vue', 'Texte', 'Formes', 'Image']) {
      expect(within(toolbar).getByRole('button', { name: tool })).toBeDisabled();
    }
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
