import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';

const appDir = 'src/app';
const add = (name: string, width = 1080, height = 1080) =>
  useDocumentStore.getState().createDocument({ width, height, background: 'white', name });
const names = () => screen.getAllByRole('button', { name: /^Ouvrir (?!…)/ }).map((b) => String(b.props.accessibilityLabel).replace('Ouvrir ', ''));
const openMenuOf = async (id: string, item: string) => {
  await fireEvent.press(screen.getByTestId(`project-menu-${id}`));
  await fireEvent.press(within(screen.getByTestId('project-menu')).getByRole('menuitem', { name: item }));
};

beforeEach(resetDocumentStore);

describe('accueil', () => {
  it('affiche les actions principales et un état vide explicite', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    for (const label of ['Nouveau projet', 'Ouvrir', 'Importer une image', 'Paramètres']) expect(screen.getByRole('button', { name: label })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Accueil' })).toBeSelected();
    expect(screen.getByTestId('recent-projects-empty')).toBeTruthy();
  });

  it('création rapide : un format courant crée et ouvre le document', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByTestId('quick-print-a4'));
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    const doc = Object.values(useDocumentStore.getState().documents)[0];
    expect(doc).toMatchObject({ width: 2480, height: 3508, resolution: 300, name: 'Sans titre' });
  });

  it('liste les projets du plus récent au plus ancien : dimensions, format, date', async () => {
    add('Ancien', 800, 600);
    add('Récent', 1080, 1920);
    await renderRouter(appDir, { initialUrl: '/' });
    expect(names()).toEqual(['Récent', 'Ancien']);
    expect(screen.getByText('1080 × 1920 px · Projet ZENTECH')).toBeTruthy();
    expect(screen.getAllByText('Modifié à l’instant')).toHaveLength(2);
  });

  it('ouvre un projet dans l’éditeur', async () => {
    const doc = add('Carte');
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir Carte' }));
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen).toHavePathname(`/editor/${doc.id}`);
  });

  it('supprime exactement le projet confirmé, et rien si l’on annule', async () => {
    const a = add('Premier');
    const b = add('Deuxième');
    const c = add('Troisième');
    await renderRouter(appDir, { initialUrl: '/' });
    await openMenuOf(b.id, 'Supprimer…');
    const dialog = within(screen.getByTestId('confirm-dialog'));
    expect(dialog.getByText(/« Deuxième » \(1080 × 1080 px\) sera supprimé définitivement\./)).toBeTruthy();
    await fireEvent.press(dialog.getByRole('button', { name: 'Annuler' }));
    expect(useDocumentStore.getState().order).toHaveLength(3);

    await openMenuOf(b.id, 'Supprimer…');
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(useDocumentStore.getState().order).toEqual([c.id, a.id]);
    expect(names()).toEqual(['Troisième', 'Premier']);
  });

  it('renomme et duplique un projet depuis son menu', async () => {
    const a = add('Affiche');
    await renderRouter(appDir, { initialUrl: '/' });
    await openMenuOf(a.id, 'Renommer…');
    await fireEvent.changeText(within(screen.getByTestId('prompt-dialog')).getByLabelText('Nom du projet'), 'Affiche finale');
    await fireEvent.press(within(screen.getByTestId('prompt-dialog')).getByRole('button', { name: 'Renommer' }));
    expect(useDocumentStore.getState().documents[a.id]?.name).toBe('Affiche finale');

    await openMenuOf(a.id, 'Dupliquer');
    expect(names()).toEqual(['Affiche finale copie', 'Affiche finale']);
  });

  it('affiche les informations du document', async () => {
    const a = useDocumentStore.getState().createDocument({ width: 2480, height: 3508, background: 'transparent', name: 'A4', resolution: 300 });
    await renderRouter(appDir, { initialUrl: '/' });
    await openMenuOf(a.id, 'Informations');
    const info = within(screen.getByTestId('project-info'));
    expect(info.getByLabelText('Dimensions : 2480 × 3508 px')).toBeTruthy();
    expect(info.getByLabelText('Taille d’impression : 21 × 29,7 cm')).toBeTruthy();
    expect(info.getByLabelText('Résolution : 300 pixels/pouce')).toBeTruthy();
    expect(info.getByLabelText('Mode : Couleurs RVB, 8 bits/couche')).toBeTruthy();
    expect(info.getByLabelText('Arrière-plan : Transparent')).toBeTruthy();
  });

  it('filtre par nom, trie par nom, passe en liste ; « Fichiers » montre tous les projets', async () => {
    add('Zèbre');
    add('Affiche');
    add('Logo');
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.changeText(screen.getByTestId('projects-filter'), 'aff');
    expect(names()).toEqual(['Affiche']);
    await fireEvent.changeText(screen.getByTestId('projects-filter'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'Trier par : Récent' }));
    await fireEvent.press(within(screen.getByTestId('sort-menu')).getByRole('menuitem', { name: 'Nom' }));
    expect(names()).toEqual(['Affiche', 'Logo', 'Zèbre']);
    await fireEvent.press(screen.getByRole('button', { name: 'Affichage en liste' }));
    expect(screen.getByRole('button', { name: 'Affichage en liste' })).toBeSelected();

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir' }));
    expect(screen.getByRole('tab', { name: 'Fichiers' })).toBeSelected();
    expect(names()).toHaveLength(3);
  });
});
