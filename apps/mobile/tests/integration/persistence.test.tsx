import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { addLayer, createShapeLayer } from '@/engine/layers';
import { configurePersistence, saveNow, startPersistence, stopPersistence, usePersistenceStore } from '@/features/persistence';
import { createTextProjectRepository, mapStorage } from '@/services/projects/memoryRepository';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));

const repoModule = jest.requireMock('@/services/projects/repository') as { __setRepository: (r: unknown) => void };
const st = () => useDocumentStore.getState();

/** Démarre l'enregistrement avec un « appareil » donné (stockage clé → texte). */
async function boot(storage = mapStorage()) {
  // renderRouter active les minuteurs simulés de Jest : la sauvegarde automatique a besoin des vrais.
  jest.useRealTimers();
  stopPersistence();
  resetDocumentStore();
  configurePersistence({ autosaveDelayMs: 5 });
  repoModule.__setRepository(createTextProjectRepository(storage));
  await act(async () => {
    await startPersistence();
  });
  return storage;
}

function newPoster() {
  const doc = st().createDocument({ width: 1000, height: 500, background: 'white', name: 'Affiche' });
  st().mutateDocument(doc.id, (d) => addLayer(d, createShapeLayer(d, 'ellipse', 'e1', '#C9645B')), 'Nouveau calque de forme');
  return doc.id;
}

afterEach(() => {
  stopPersistence();
  configurePersistence({ autosaveDelayMs: null });
});

describe('enregistrement sur l’appareil (M3)', () => {
  it('retrouve un projet et ses calques après un redémarrage', async () => {
    const device = await boot();
    const id = newPoster();
    await act(async () => {
      await saveNow();
    });
    expect(usePersistenceStore.getState().saves[id]).toMatchObject({ state: 'saved' });

    await boot(device); // l'application redémarre : mémoire vide, même appareil
    expect(st().documents[id]?.layers[0]).toMatchObject({ id: 'e1', shape: 'ellipse', fill: '#C9645B' });
    expect(st().histories[id]?.states.map((s) => s.label)).toEqual(['Ouvrir']);

    await renderRouter('src/app', { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir Affiche' }));
    expect(await screen.findByTestId('desktop-workspace')).toBeTruthy();
    expect(within(screen.getByTestId('status-bar')).getByText(/^Enregistré à \d\d:\d\d$/)).toBeTruthy();
  });

  it('enregistre automatiquement après une modification, et les suppressions', async () => {
    const device = await boot();
    const id = newPoster();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect((await createTextProjectRepository(device).loadAll()).documents.map((d) => d.id)).toEqual([id]);
    await act(async () => {
      st().removeDocument(id);
      await new Promise((r) => setTimeout(r, 10));
    });
    expect((await createTextProjectRepository(device).loadAll()).documents).toEqual([]);
  });

  it('signale un projet illisible sur l’accueil, le garde, et ne le supprime que sur demande', async () => {
    const device = mapStorage();
    device.setItem('zentech-design/project/abime', '{"kind":"zentech-design/project","formatVersion":1,"document":{"id":"abime"}}');
    await boot(device);
    await renderRouter('src/app', { initialUrl: '/' });
    const notice = within(screen.getByTestId('unreadable-projects'));
    expect(notice.getByText(/n’a pas pu être ouvert : Projet endommagé/)).toBeTruthy();
    expect(device.getItem('zentech-design/project/abime')).not.toBeNull();

    await fireEvent.press(notice.getByRole('button', { name: 'Supprimer le projet illisible abime' }));
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(device.getItem('zentech-design/project/abime')).toBeNull();
    expect(screen.queryByTestId('unreadable-projects')).toBeNull();
  });

  it('un échec de lecture bloque l’accès sans rien effacer ; « Réessayer » relit', async () => {
    stopPersistence();
    let fail = true;
    const device = mapStorage();
    const good = createTextProjectRepository(device);
    repoModule.__setRepository({
      ...good,
      loadAll: () => (fail ? Promise.reject(new Error('base verrouillée')) : good.loadAll()),
    });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByTestId('persistence-failed')).toBeTruthy();
    expect(screen.getByText(/base verrouillée/)).toBeTruthy();
    fail = false;
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });
});

describe('documents en onglets, Enregistrer sous, Dupliquer (M3)', () => {
  const menuItem = (name: string) => within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name });

  it('ouvre plusieurs documents en onglets, passe de l’un à l’autre, ferme', async () => {
    await boot();
    const a = newPoster();
    const b = st().createDocument({ width: 300, height: 300, background: 'black', name: 'Logo' }).id;
    await renderRouter('src/app', { initialUrl: `/editor/${a}` });
    await act(async () => useWorkspaceStore.getState().openDocument(b));
    await fireEvent.press(screen.getByTestId(`doc-tab-${b}`));
    expect(await screen.findByLabelText(/^Document Logo @/)).toBeTruthy();
    expect(screen.getByTestId(`doc-tab-${a}`)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Logo' }));
    expect(await screen.findByLabelText(/^Document Affiche @/)).toBeTruthy();
    expect(useWorkspaceStore.getState().openDocuments).toEqual([a]);
  });

  it('Enregistrer sous crée une copie nommée qui remplace l’onglet ; Dupliquer en ajoute une', async () => {
    await boot();
    const a = newPoster();
    await renderRouter('src/app', { initialUrl: `/editor/${a}` });

    await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
    await fireEvent.press(menuItem('Enregistrer sous…'));
    const prompt = within(screen.getByTestId('prompt-dialog'));
    await fireEvent.changeText(prompt.getByLabelText('Nom du document'), '  Affiche v2 ');
    await fireEvent.press(prompt.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByLabelText(/^Document Affiche v2 @/)).toBeTruthy();
    const copy = Object.values(st().documents).find((d) => d.name === 'Affiche v2');
    expect(copy?.layers).toEqual(st().documents[a]?.layers);
    expect(useWorkspaceStore.getState().openDocuments).toEqual([copy?.id]);
    expect(st().documents[a]).toBeDefined(); // l'original reste dans les projets

    await fireEvent.press(screen.getByRole('button', { name: 'Menu Image' }));
    await fireEvent.press(menuItem('Dupliquer…'));
    await fireEvent.press(within(screen.getByTestId('prompt-dialog')).getByRole('button', { name: 'Dupliquer' }));
    expect(await screen.findByLabelText(/^Document Affiche v2 copie @/)).toBeTruthy();
    expect(useWorkspaceStore.getState().openDocuments).toHaveLength(2);
  });

  it('Historique : nouveau document à partir d’un état', async () => {
    await boot();
    const a = newPoster();
    await renderRouter('src/app', { initialUrl: `/editor/${a}` });
    await fireEvent.press(screen.getByTestId('strip-history'));
    await fireEvent.press(screen.getByRole('button', { name: 'État 1 : Nouveau document' }));
    await fireEvent.press(screen.getByTestId('history-new-document'));
    expect(await screen.findByLabelText(/^Document Affiche — Nouveau document @/)).toBeTruthy();
    const created = Object.values(st().documents).find((d) => d.name === 'Affiche — Nouveau document');
    expect(created?.layers).toEqual([]);
  });
});
