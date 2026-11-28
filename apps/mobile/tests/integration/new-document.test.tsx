import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { useSavedPresets, resetSavedPresets } from '@/features/presets/savedPresets';
import { getSettingsRepository } from '@/services/projects';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';

const appDir = 'src/app';

async function openForm() {
  await renderRouter(appDir, { initialUrl: '/new-document' });
  expect(screen.getByTestId('new-document-screen')).toBeTruthy();
}

const createButton = () => screen.getByRole('button', { name: 'Créer' });
const summary = () => screen.getByTestId('summary-dimensions');
const value = (id: string) => screen.getByTestId(id).props.value;
const pick = async (selectLabel: RegExp, item: string) => {
  await fireEvent.press(screen.getByRole('button', { name: selectLabel }));
  await fireEvent.press(within(screen.getByTestId('select-dropdown')).getByRole('menuitem', { name: item }));
};

beforeEach(() => {
  resetDocumentStore();
  resetSavedPresets();
});

describe('fenêtre Nouveau document', () => {
  it('ouvre sur les préréglages Web, 1920 × 1080 px à 72 ppp, fond blanc ; toutes les catégories', async () => {
    await openForm();
    for (const tab of ['Récent', 'Enregistré', 'Photo', 'Impression', 'Illustration', 'Web', 'Mobile', 'Film et vidéo']) {
      expect(screen.getByRole('tab', { name: tab })).toBeTruthy();
    }
    expect(screen.getByRole('tab', { name: 'Web' })).toBeSelected();
    expect([value('input-width'), value('input-height'), value('input-resolution')]).toEqual(['1920', '1080', '72']);
    expect(screen.getByTestId('preset-web-1920')).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Paysage' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Contenu de l’arrière-plan : Blanc' })).toBeTruthy();
    expect(summary()).toHaveTextContent('1920 × 1080 px');
    expect(createButton()).toBeEnabled();
  });

  it('ne propose que ce que le moteur gère : RVB 8 bits (CMJN, niveaux de gris, 16 et 32 bits désactivés)', async () => {
    await openForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Mode colorimétrique : Couleurs RVB' }));
    const menu = within(screen.getByTestId('select-dropdown'));
    expect(menu.getByRole('menuitem', { name: 'Couleurs CMJN — non pris en charge par le moteur' })).toBeDisabled();
    expect(menu.getByRole('menuitem', { name: 'Niveaux de gris — non pris en charge par le moteur' })).toBeDisabled();
  });

  it('Impression › A4 : 210 × 297 mm à 300 ppp, soit 2480 × 3508 px en portrait', async () => {
    await openForm();
    await fireEvent.press(screen.getByRole('tab', { name: 'Impression' }));
    await fireEvent.press(screen.getByTestId('preset-print-a4'));
    expect([value('input-width'), value('input-height'), value('input-resolution')]).toEqual(['210', '297', '300']);
    expect(screen.getByRole('button', { name: 'Unité : Millimètres' })).toBeTruthy();
    expect(summary()).toHaveTextContent('2480 × 3508 px');
    expect(screen.getByRole('radio', { name: 'Portrait' })).toBeChecked();
  });

  it('change d’unité sans changer les pixels ; l’orientation échange largeur et hauteur', async () => {
    await openForm();
    await pick(/^Unité : /, 'Centimètres');
    expect([value('input-width'), value('input-height')]).toEqual(['67,73', '38,1']);
    expect(summary()).toHaveTextContent('1920 × 1080 px');
    await fireEvent.press(screen.getByRole('radio', { name: 'Portrait' }));
    expect([value('input-width'), value('input-height')]).toEqual(['38,1', '67,73']);
    expect(summary()).toHaveTextContent('1080 × 1920 px');
  });

  it('bloque la création et explique pourquoi quand une valeur est invalide', async () => {
    await openForm();
    await fireEvent.changeText(screen.getByTestId('input-width'), '0');
    expect(screen.getByText('La largeur doit être comprise entre 1 et 8 192 px.')).toBeTruthy();
    expect(createButton()).toBeDisabled();
    await fireEvent.changeText(screen.getByTestId('input-width'), '8000');
    await fireEvent.changeText(screen.getByTestId('input-height'), '8000');
    expect(screen.getByTestId('size-error')).toHaveTextContent(/Document trop grand/);
    await fireEvent.changeText(screen.getByTestId('input-resolution'), '0');
    expect(screen.getByText(/La résolution doit être comprise entre 1 et/)).toBeTruthy();
    await fireEvent.press(createButton());
    expect(useDocumentStore.getState().order).toHaveLength(0);
  });

  it('TEST 1 : 1920 × 1080 px, RVB, fond transparent, Créer → éditeur', async () => {
    await openForm();
    await pick(/^Contenu de l’arrière-plan/, 'Transparent');
    await fireEvent.changeText(screen.getByTestId('input-name'), '  Bannière  ');
    await fireEvent.press(createButton());
    const { order, documents } = useDocumentStore.getState();
    expect(documents[order[0] ?? '']).toMatchObject({ width: 1920, height: 1080, background: 'transparent', name: 'Bannière', resolution: 72 });
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen).toHavePathname(`/editor/${order[0]}`);
  });

  it('fond de couleur personnalisée', async () => {
    await openForm();
    await pick(/^Contenu de l’arrière-plan/, 'Couleur personnalisée');
    await fireEvent.changeText(screen.getByTestId('input-background-color'), '#c9645b');
    await fireEvent.press(createButton());
    const { order, documents } = useDocumentStore.getState();
    expect(documents[order[0] ?? '']).toMatchObject({ background: 'color', backgroundColor: '#C9645B' });
  });

  it('enregistre un préréglage personnel, le retrouve dans « Enregistré », le supprime', async () => {
    await openForm();
    await fireEvent.changeText(screen.getByTestId('input-width'), '1200');
    await fireEvent.changeText(screen.getByTestId('input-height'), '628');
    await fireEvent.press(screen.getByTestId('save-preset'));
    const prompt = within(screen.getByTestId('prompt-dialog'));
    await fireEvent.changeText(prompt.getByLabelText('Nom du préréglage'), 'Lien partagé');
    await fireEvent.press(prompt.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByRole('button', { name: 'Préréglage Lien partagé' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Enregistré' })).toBeSelected();
    expect(JSON.parse((await getSettingsRepository().get('documentPresets')) ?? '[]')).toMatchObject([{ label: 'Lien partagé', width: 1200, height: 628, unit: 'px' }]);

    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer le préréglage Lien partagé' }));
    expect(useSavedPresets.getState().presets).toEqual([]);
    expect(screen.getByTestId('presets-empty')).toBeTruthy();
  });

  it('« Récent » reprend les tailles des derniers documents', async () => {
    useDocumentStore.getState().createDocument({ width: 640, height: 480, background: 'black', name: 'Vieux format', resolution: 96 });
    await openForm();
    expect(screen.getByRole('tab', { name: 'Récent' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Préréglage Vieux format' })).toBeSelected();
    expect([value('input-width'), value('input-height'), value('input-resolution')]).toEqual(['640', '480', '96']);
  });
});
