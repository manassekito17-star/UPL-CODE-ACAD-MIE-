import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';

const appDir = 'src/app';

async function openForm() {
  await renderRouter(appDir, { initialUrl: '/new-document' });
  expect(screen.getByTestId('new-document-screen')).toBeTruthy();
}

const createButton = () => screen.getByRole('button', { name: 'Créer le document' });
const summary = () => screen.getByTestId('summary-dimensions');

beforeEach(resetDocumentStore);

describe('création de document', () => {
  it("propose par défaut la résolution de l'écran, en portrait, fond blanc", async () => {
    await openForm();
    // Écran simulé par Jest : 750 × 1334 points, densité 2.
    expect(screen.getByTestId('input-width').props.value).toBe('1500');
    expect(screen.getByTestId('input-height').props.value).toBe('2668');
    expect(screen.getByTestId('preset-screen').props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByRole('radio', { name: 'Portrait' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Blanc' })).toBeChecked();
    expect(createButton()).toBeEnabled();
  });

  it('applique un format prédéfini', async () => {
    await openForm();
    await fireEvent.press(screen.getByTestId('preset-full-hd'));
    expect(summary()).toHaveTextContent('1920 × 1080 px');
    expect(screen.getByRole('radio', { name: 'Paysage' })).toBeChecked();
  });

  it("échange largeur et hauteur quand on change l'orientation", async () => {
    await openForm();
    await fireEvent.press(screen.getByTestId('preset-story'));
    expect(summary()).toHaveTextContent('1080 × 1920 px');
    await fireEvent.press(screen.getByRole('radio', { name: 'Paysage' }));
    expect(screen.getByTestId('input-width').props.value).toBe('1920');
    expect(screen.getByTestId('input-height').props.value).toBe('1080');
    // Le format reste reconnu dans son autre orientation.
    expect(screen.getByTestId('preset-story').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('bloque la création et explique pourquoi quand une dimension est invalide', async () => {
    await openForm();
    await fireEvent.changeText(screen.getByTestId('input-width'), '0');
    expect(screen.getByText('La largeur doit être comprise entre 1 et 8 192 px.')).toBeTruthy();
    expect(createButton()).toBeDisabled();

    await fireEvent.press(createButton());
    expect(useDocumentStore.getState().order).toHaveLength(0);
  });

  it('refuse un document trop lourd pour la mémoire', async () => {
    await openForm();
    await fireEvent.changeText(screen.getByTestId('input-width'), '8000');
    await fireEvent.changeText(screen.getByTestId('input-height'), '8000');
    expect(screen.getByText(/Document trop grand/)).toBeTruthy();
    expect(createButton()).toBeDisabled();
  });

  it('crée un document transparent avec les valeurs saisies', async () => {
    await openForm();
    await fireEvent.changeText(screen.getByTestId('input-width'), '800');
    await fireEvent.changeText(screen.getByTestId('input-height'), '600');
    await fireEvent.press(screen.getByRole('radio', { name: 'Transparent' }));
    await fireEvent.changeText(screen.getByTestId('input-name'), '  Logo  ');
    await fireEvent.press(createButton());

    const { order, documents } = useDocumentStore.getState();
    expect(order).toHaveLength(1);
    expect(documents[order[0] ?? '']).toMatchObject({ width: 800, height: 600, background: 'transparent', name: 'Logo' });
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen).toHavePathname(`/editor/${order[0]}`);
  });
});
