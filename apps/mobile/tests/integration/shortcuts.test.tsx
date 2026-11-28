import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { addLayer, createShapeLayer } from '@/engine/layers';
import { dispatchChord } from '@/features/shortcuts/dispatcher';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));

const st = () => useDocumentStore.getState();
const press = async (chord: string) => {
  let handled = false;
  await act(async () => {
    handled = dispatchChord(chord);
  });
  return handled;
};

async function openStudio() {
  const doc = st().createDocument({ width: 1000, height: 500, background: 'white', name: 'Affiche' });
  await renderRouter('src/app', { initialUrl: `/editor/${doc.id}` });
  return doc.id;
}

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
});

describe('raccourcis clavier (lot D)', () => {
  it('outils : V, H, Maj+U (forme suivante) ; un outil pas encore disponible l’annonce', async () => {
    await openStudio();
    expect(await press('v')).toBe(true);
    expect(useEditorUiStore.getState().activeTool).toBe('select');
    expect(screen.getByRole('button', { name: 'Déplacement' })).toBeSelected();
    await press('h');
    expect(useEditorUiStore.getState().activeTool).toBe('pan');
    await press('u');
    expect(useWorkspaceStore.getState().railToolKey).toBe('shape-rectangle');
    await press('shift+u'); // outil suivant disponible de la famille Formes (le rectangle arrondi est prévu)
    expect(useWorkspaceStore.getState().railToolKey).toBe('shape-ellipse');
    await press('b');
    expect(screen.getByTestId('toast')).toHaveTextContent('Pinceau (B) : prévu au module M5, pas encore disponible.');
    expect(useEditorUiStore.getState().activeTool).toBe('select');
  });

  it('Ctrl+Z / Ctrl+Maj+Z, Ctrl+J, Suppr avec confirmation', async () => {
    const id = await openStudio();
    await act(async () => {
      st().mutateDocument(id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'r1', '#000000')), 'Nouveau calque de forme');
      useEditorUiStore.getState().selectLayer('r1');
    });
    await press('mod+j');
    expect(st().documents[id]?.layers).toHaveLength(2);
    await press('mod+z');
    expect(st().documents[id]?.layers).toHaveLength(1);
    await press('mod+shift+z');
    expect(st().documents[id]?.layers).toHaveLength(2);
    await act(async () => useEditorUiStore.getState().selectLayer('r1'));
    await press('delete');
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(st().documents[id]?.layers.map((l) => l.id)).not.toContain('r1');
  });

  it('Ctrl+S sur un document jamais enregistré ouvre « Enregistrer sous » ; Ctrl+Alt+Maj+W ouvre « Exporter sous »', async () => {
    await openStudio();
    await press('mod+s');
    expect(screen.getByTestId('save-as-dialog')).toBeTruthy();
    await fireEvent.press(within(screen.getByTestId('save-as-dialog')).getByRole('button', { name: 'Annuler' }));
    await press('mod+alt+shift+w');
    expect(screen.getByTestId('export-dialog')).toBeTruthy();
  });

  it('affichage et couleurs : Ctrl+1, Ctrl+R, Tab, X, D ; aide Ctrl+/', async () => {
    await openStudio();
    await act(async () => {
      fireEvent(screen.getByTestId('document-canvas'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 600, height: 500 } } });
    });
    await press('mod+1');
    expect(screen.getByTestId('status-zoom').props.value).toBe('100');
    await press('mod+0');
    expect(screen.getByTestId('status-zoom').props.value).toBe('110');
    await press('mod+r');
    expect(screen.queryByTestId('rulers')).toBeNull();
    await press('tab');
    expect(screen.queryByTestId('tool-rail')).toBeNull();
    await press('tab');
    await press('x');
    expect(useWorkspaceStore.getState()).toMatchObject({ foreground: '#FFFFFF', background: '#000000' });
    await press('d');
    expect(useWorkspaceStore.getState()).toMatchObject({ foreground: '#000000', background: '#FFFFFF' });
    await press('mod+/');
    // Jest simule iOS : raccourcis affichés à la manière d'Apple.
    expect(within(screen.getByTestId('shortcut-help')).getByLabelText(/^Enregistrer sous : (Ctrl\+Maj\+S|⌘⇧S)$/)).toBeTruthy();
  });

  it('les menus affichent les raccourcis', async () => {
    await openStudio();
    await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
    const menu = within(screen.getByTestId('menu-dropdown'));
    expect(menu.getByText(/^(Ctrl\+S|⌘S)$/)).toBeTruthy();
    expect(menu.getByText(/^(Ctrl\+Maj\+S|⌘⇧S)$/)).toBeTruthy();
  });

  it('accueil : Ctrl+N ouvre la fenêtre Nouveau document', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await press('mod+n');
    expect(await screen.findByTestId('new-document-screen')).toBeTruthy();
  });
});
