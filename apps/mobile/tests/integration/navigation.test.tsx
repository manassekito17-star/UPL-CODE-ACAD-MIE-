import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { resetDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore } from '@/stores/editorUiStore';

// Les vraies routes de src/app (chemin relatif au dossier du paquet, d'où
// `npm test` est lancé) : le test échoue si une route disparaît ou change de nom.
const appDir = 'src/app';

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
});

describe('navigation', () => {
  it("affiche l'accueil au démarrage", async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    expect(screen).toHavePathname('/');
    expect(screen.getByTestId('home-screen')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nouveau projet' })).toBeTruthy();
  });

  it("n'annonce pas une importation qui n'existe pas encore : le bouton est désactivé", async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    expect(screen.getByRole('button', { name: 'Importer une image' })).toBeDisabled();
  });

  it('crée un document puis ouvre l’éditeur ; le retour ramène à l’accueil où le projet est listé', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Nouveau projet' }));
    expect(await screen.findByTestId('new-document-screen')).toBeTruthy();
    expect(screen).toHavePathname('/new-document');

    await fireEvent.press(screen.getByTestId('preset-square'));
    await fireEvent.changeText(screen.getByTestId('input-name'), 'Affiche');
    await fireEvent.press(screen.getByRole('button', { name: 'Créer le document' }));

    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen.getByText('Affiche')).toBeTruthy();
    expect(screen.getAllByText('1080 × 1080 px').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Retour à l’accueil' }));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
    expect(screen).toHavePathname('/');
    expect(screen.getByRole('button', { name: 'Ouvrir Affiche' })).toBeTruthy();
  });

  it('ouvre les paramètres', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Paramètres' }));
    expect(await screen.findByTestId('settings-screen')).toBeTruthy();
    expect(screen).toHavePathname('/settings');
  });

  it("signale un projet introuvable au lieu d'afficher un éditeur vide", async () => {
    await renderRouter(appDir, { initialUrl: '/editor/doc_inexistant' });
    expect(screen.getByTestId('editor-missing')).toBeTruthy();
    expect(screen.getByText('Projet introuvable')).toBeTruthy();
  });

  it('affiche un écran dédié pour une adresse inconnue', async () => {
    await renderRouter(appDir, { initialUrl: '/inexistant' });
    expect(screen.getByTestId('not-found-screen')).toBeTruthy();
  });
});
