import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
// Les vraies routes de src/app (chemin relatif au dossier du paquet, d'où
// `npm test` est lancé) : le test échoue si une route disparaît ou change de nom.
const appDir = 'src/app';

describe('navigation', () => {
  it("affiche l'accueil au démarrage", async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    expect(screen).toHavePathname('/');
    expect(screen.getByTestId('home-screen')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nouveau projet' })).toBeTruthy();
  });

  it("n'annonce pas une importation qui n'existe pas encore : le bouton est désactivé", async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    const importButton = screen.getByRole('button', { name: 'Importer une image' });
    expect(importButton).toBeDisabled();
  });

  it('ouvre la création de document depuis « Nouveau projet »', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Nouveau projet' }));
    expect(await screen.findByTestId('new-document-screen')).toBeTruthy();
    expect(screen).toHavePathname('/new-document');
  });

  it("ouvre l'éditeur avec l'identifiant du projet dans l'URL", async () => {
    await renderRouter(appDir, { initialUrl: '/new-document' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir un espace de travail vide' }));
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen).toHavePathname('/editor/brouillon');
    expect(screen.getByText('Projet : brouillon')).toBeTruthy();
  });

  it('ouvre les paramètres', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Paramètres' }));
    expect(await screen.findByTestId('settings-screen')).toBeTruthy();
    expect(screen).toHavePathname('/settings');
  });

  it('affiche un écran dédié pour une adresse inconnue', async () => {
    await renderRouter(appDir, { initialUrl: '/inexistant' });
    expect(screen.getByTestId('not-found-screen')).toBeTruthy();
  });
});
