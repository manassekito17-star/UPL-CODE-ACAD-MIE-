import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import type { ImageAsset } from '@/engine/layers';
import { pickAndImportImage } from '@/services/imageImport';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore } from '@/stores/editorUiStore';

// La galerie et le système de fichiers sont natifs : le service d'import est simulé ici
// (sa logique est testée à part, dans tests/unit/imageImport.test.ts).
jest.mock('@/services/imageImport', () => ({
  ...jest.requireActual('@/services/imageImport'),
  pickAndImportImage: jest.fn(),
}));
const pickMock = pickAndImportImage as jest.MockedFunction<typeof pickAndImportImage>;

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

  it("importe une image dans un nouveau document à ses dimensions, puis ouvre l'éditeur", async () => {
    const asset: ImageAsset = {
      uri: 'file:///app/assets/img_1.jpg',
      width: 1600,
      height: 1200,
      originalUri: 'file:///app/assets/img_1-original.heic',
      originalWidth: 4032,
      originalHeight: 3024,
      fileName: 'Vacances.HEIC',
    };
    pickMock.mockResolvedValueOnce(asset);
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Importer une image' }));
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();

    const [docId] = useDocumentStore.getState().order;
    const doc = useDocumentStore.getState().documents[docId ?? ''];
    expect(doc).toMatchObject({ name: 'Vacances', width: 1600, height: 1200, background: 'white' });
    expect(doc?.layers).toHaveLength(1);
    expect(doc?.layers[0]).toMatchObject({ type: 'image', x: 0, y: 0, width: 1600, height: 1200, asset });
  });

  it("n'ouvre rien si l'utilisateur annule, et affiche l'erreur d'un import raté", async () => {
    pickMock.mockResolvedValueOnce(null);
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Importer une image' }));
    expect(screen.getByTestId('home-screen')).toBeTruthy();
    expect(useDocumentStore.getState().order).toHaveLength(0);

    const { ImageImportError } = jest.requireActual('@/services/imageImport');
    pickMock.mockRejectedValueOnce(new ImageImportError("L'image n'a pas pu être importée (format non pris en charge ou fichier illisible)."));
    await fireEvent.press(screen.getByRole('button', { name: 'Importer une image' }));
    expect(await screen.findByText("L'image n'a pas pu être importée (format non pris en charge ou fichier illisible).")).toBeTruthy();
    expect(useDocumentStore.getState().order).toHaveLength(0);
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
    // Écran de test de 750 points de large : espace studio, document en onglet.
    expect(screen.getByTestId('desktop-workspace')).toBeTruthy();
    expect(screen.getByLabelText(/^Document Affiche @/)).toBeTruthy();
    expect(screen.getAllByText('1080 × 1080 px').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Affiche' }));
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
