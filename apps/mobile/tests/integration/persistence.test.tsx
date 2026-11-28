import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { addLayer, createImageLayer, createShapeLayer, createTextLayer, type ImageAsset } from '@/engine/layers';
import {
  configurePersistence,
  flushDrafts,
  markSaved,
  saveDocument,
  setAutoSave,
  startPersistence,
  stopPersistence,
  usePersistenceStore,
} from '@/features/persistence';
import { createTextProjectRepository, mapStorage } from '@/services/projects/memoryRepository';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));

const repoModule = jest.requireMock('@/services/projects/repository') as { __setRepository: (r: unknown) => void };
const folderModule = jest.requireMock('@/services/projects/packageFiles') as {
  __folder: Map<string, Uint8Array>;
  __assets: Map<string, Uint8Array>;
  __setNextPick: (uri: string | null) => void;
};
const st = () => useDocumentStore.getState();
const files = () => usePersistenceStore.getState().files;
const menuItem = (name: string) => within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name });

/** Démarre l'enregistrement avec un « appareil » donné (stockage clé → texte). */
async function boot(storage = mapStorage()) {
  // renderRouter active les minuteurs simulés de Jest : les copies de récupération ont besoin des vrais.
  jest.useRealTimers();
  stopPersistence();
  resetDocumentStore();
  useWorkspaceStore.getState().closeAllDocuments();
  configurePersistence({ autosaveDelayMs: 5 });
  repoModule.__setRepository(createTextProjectRepository(storage));
  await act(async () => {
    await startPersistence();
  });
  return storage;
}

const wait = (ms: number) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });

function newPoster(name = 'Affiche') {
  const doc = st().createDocument({ width: 1000, height: 500, background: 'white', name });
  st().mutateDocument(doc.id, (d) => addLayer(d, createShapeLayer(d, 'ellipse', 'e1', '#C9645B')), 'Nouveau calque de forme');
  return doc.id;
}

async function fileMenu(item: string) {
  await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
  await fireEvent.press(menuItem(item));
}

afterEach(() => {
  stopPersistence();
  configurePersistence({ autosaveDelayMs: null });
  folderModule.__setNextPick(null);
});

describe('parcours d’enregistrement (lot B)', () => {
  it('TEST 2 et 3 : image, texte, forme → Enregistrer (premier : Enregistrer sous) → fermer → rouvrir après redémarrage', async () => {
    const device = await boot();
    const asset: ImageAsset = { uri: 'file:///app/Documents/assets/img_1.jpg', width: 40, height: 30, originalUri: 'file:///app/Documents/assets/img_1', originalWidth: 400, originalHeight: 300, fileName: 'photo.jpg' };
    const doc = st().createDocument({ width: 1920, height: 1080, background: 'transparent', name: 'Sans titre' });
    st().mutateDocument(doc.id, (d) => addLayer(d, createImageLayer(d, asset, 'img')), 'Importer une image');
    st().mutateDocument(doc.id, (d) => addLayer(d, { ...createTextLayer(d, 'txt'), text: 'Bonjour' }), 'Nouveau calque de texte');
    st().mutateDocument(doc.id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'rect', '#112233')), 'Nouveau calque de forme');
    await renderRouter('src/app', { initialUrl: `/editor/${doc.id}` });
    expect(within(screen.getByTestId('status-bar')).getByText('Jamais enregistré')).toBeTruthy();

    await fileMenu('Enregistrer');
    const dialog = within(screen.getByTestId('save-as-dialog'));
    expect(dialog.getByText('Enregistrer sous')).toBeTruthy();
    await fireEvent.changeText(dialog.getByLabelText('Nom du projet'), 'Carte postale');
    await fireEvent.press(dialog.getByTestId('save-as-confirm'));
    expect(screen.queryByTestId('save-as-dialog')).toBeNull();
    expect(files()[doc.id]).toMatchObject({ savedOnce: true });
    expect(within(screen.getByTestId('status-bar')).getByText(/^Enregistré à \d\d:\d\d$/)).toBeTruthy();

    // Fermer : rien à enregistrer, aucune question.
    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Carte postale' }));
    expect(screen.queryByTestId('close-dialog')).toBeNull();

    // Ce qui est écrit sur l'appareil : la version enregistrée, complète, sans copie de récupération.
    const stored = await createTextProjectRepository(device).loadAll();
    expect(stored.drafts).toEqual([]);
    expect(stored.documents.find((d) => d.id === doc.id)?.layers.map((l) => [l.id, l.type])).toEqual([
      ['img', 'image'],
      ['txt', 'text'],
      ['rect', 'shape'],
    ]);
  });

  it('TEST 3 : après un redémarrage, l’accueil liste le projet ; le rouvrir rend tous ses calques', async () => {
    const device = await boot();
    const id = newPoster('Carte postale');
    st().mutateDocument(id, (d) => addLayer(d, { ...createTextLayer(d, 'txt'), name: 'Titre' }), 'Nouveau calque de texte');
    await act(async () => {
      markSaved(id);
      await saveDocument(id);
    });
    await boot(device); // l'application redémarre : mémoire vide, même appareil
    expect(files()[id]).toMatchObject({ savedOnce: true, recovered: false });
    await renderRouter('src/app', { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir Carte postale' }));
    expect(await screen.findByTestId('desktop-workspace')).toBeTruthy();
    const panel = within(screen.getByTestId('layers-panel'));
    expect(panel.getByRole('button', { name: 'Calque Titre' })).toBeTruthy();
    expect(panel.getByRole('button', { name: 'Calque Cercle 1' })).toBeTruthy();
    expect(within(screen.getByTestId('status-bar')).getByText(/^Enregistré à \d\d:\d\d$/)).toBeTruthy();
  });

  it('TEST 6 : fermer un document modifié demande quoi faire ; Annuler reste, Ne pas enregistrer revient à la version enregistrée', async () => {
    await boot();
    const id = newPoster();
    markSaved(id);
    await renderRouter('src/app', { initialUrl: `/editor/${id}` });
    await act(async () => {
      st().mutateDocument(id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'r2', '#000000')), 'Nouveau calque de forme');
    });
    expect(screen.getByLabelText(/modifications non enregistrées$/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Affiche' }));
    const dialog = within(screen.getByTestId('close-dialog'));
    expect(dialog.getByText('Enregistrer les modifications apportées au document « Affiche » avant de fermer ?')).toBeTruthy();
    await fireEvent.press(dialog.getByRole('button', { name: 'Annuler' }));
    expect(screen.getByTestId('desktop-workspace')).toBeTruthy();
    expect(st().documents[id]?.layers).toHaveLength(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Affiche' }));
    await fireEvent.press(within(screen.getByTestId('close-dialog')).getByRole('button', { name: 'Ne pas enregistrer' }));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(st().documents[id]?.layers.map((l) => l.id)).toEqual(['e1']);
  });

  it('« Ne pas enregistrer » sur un document jamais enregistré l’abandonne', async () => {
    await boot();
    const id = newPoster('Brouillon');
    await renderRouter('src/app', { initialUrl: `/editor/${id}` });
    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Brouillon' }));
    await fireEvent.press(within(screen.getByTestId('close-dialog')).getByRole('button', { name: 'Ne pas enregistrer' }));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(st().documents[id]).toBeUndefined();
  });

  it('récupération après interruption : les modifications non enregistrées reviennent au redémarrage', async () => {
    const device = await boot();
    const saved = newPoster('Enregistré');
    await act(async () => {
      markSaved(saved);
      await saveDocument(saved);
    });
    const draft = newPoster('Jamais enregistré');
    await act(async () => {
      st().mutateDocument(saved, (d) => addLayer(d, createShapeLayer(d, 'line', 'l1', '#FFFFFF')), 'Nouveau calque de forme');
    });
    await wait(40);
    await act(async () => {
      await flushDrafts();
    });

    await boot(device); // l'application avait été tuée
    expect(st().documents[saved]?.layers.map((l) => l.id)).toEqual(['e1', 'l1']);
    expect(files()[saved]).toMatchObject({ savedOnce: true, recovered: true });
    expect(st().documents[draft]?.name).toBe('Jamais enregistré');
    expect(files()[draft]).toMatchObject({ savedOnce: false, recovered: true });

    await renderRouter('src/app', { initialUrl: '/' });
    expect(within(screen.getByTestId('recovered-notice')).getByText(/2 documents ont été récupérés/)).toBeTruthy();
  });

  it('Enregistrer sous un projet déjà enregistré : nouveau projet ouvert, l’original garde sa version enregistrée', async () => {
    await boot();
    const id = newPoster();
    await act(async () => {
      markSaved(id);
      await saveDocument(id);
    });
    await renderRouter('src/app', { initialUrl: `/editor/${id}` });
    await act(async () => {
      st().mutateDocument(id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'r2', '#000000')), 'Nouveau calque de forme');
    });
    await fileMenu('Enregistrer sous…');
    await fireEvent.changeText(screen.getByTestId('save-as-name'), 'Affiche v2');
    await fireEvent.press(screen.getByTestId('save-as-confirm'));
    expect(await screen.findByLabelText(/^Document Affiche v2 @/)).toBeTruthy();
    const copy = Object.values(st().documents).find((d) => d.name === 'Affiche v2');
    expect(copy?.layers.map((l) => l.id)).toEqual(['e1', 'r2']);
    expect(st().documents[id]?.layers.map((l) => l.id)).toEqual(['e1']);
  });

  it('Enregistrer une copie ne change rien au document ouvert', async () => {
    await boot();
    const id = newPoster();
    await renderRouter('src/app', { initialUrl: `/editor/${id}` });
    await fileMenu('Enregistrer une copie…');
    await fireEvent.press(screen.getByTestId('save-as-confirm'));
    expect(within(screen.getByTestId('file-message')).getByText('Copie enregistrée sur l’appareil : Affiche copie')).toBeTruthy();
    const copy = Object.values(st().documents).find((d) => d.name === 'Affiche copie');
    expect(copy && files()[copy.id]).toMatchObject({ savedOnce: true });
    expect(files()[id]?.savedOnce ?? false).toBe(false);
  });

  it('fichier .zdesign : Enregistrer sous dans un dossier, Enregistrer le réécrit, Ouvrir le relit', async () => {
    await boot();
    const id = newPoster();
    await renderRouter('src/app', { initialUrl: `/editor/${id}` });
    await fileMenu('Enregistrer sous…');
    await fireEvent.press(screen.getByRole('radio', { name: 'Dans un dossier…' }));
    await fireEvent.press(screen.getByTestId('save-as-confirm'));
    expect(folderModule.__folder.has('content://dossier/Affiche.zdesign')).toBe(true);
    expect(files()[id]?.location).toEqual({ uri: 'content://dossier/Affiche.zdesign', name: 'Affiche.zdesign' });
    expect(within(screen.getByTestId('status-bar')).getByText(/· Affiche\.zdesign$/)).toBeTruthy();

    const before = folderModule.__folder.get('content://dossier/Affiche.zdesign');
    await act(async () => {
      st().mutateDocument(id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'r2', '#000000')), 'Nouveau calque de forme');
    });
    await fileMenu('Enregistrer');
    expect(folderModule.__folder.get('content://dossier/Affiche.zdesign')).not.toBe(before);

    // Ouvrir ce fichier : le projet est déjà ouvert, il arrive comme un nouveau projet.
    folderModule.__setNextPick('content://dossier/Affiche.zdesign');
    await fileMenu('Ouvrir…');
    const opened = Object.values(st().documents).filter((d) => d.name === 'Affiche');
    expect(opened).toHaveLength(2);
    expect(opened.map((d) => d.layers.map((l) => l.id))).toEqual([
      ['e1', 'r2'],
      ['e1', 'r2'],
    ]);
  });

  it('un fichier qui n’est pas un projet est refusé avec un message', async () => {
    await boot();
    folderModule.__folder.set('content://dossier/photo.zdesign', new Uint8Array([1, 2, 3]));
    folderModule.__setNextPick('content://dossier/photo.zdesign');
    await renderRouter('src/app', { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir' }));
    expect(await screen.findByText(/Ouverture impossible : Ce fichier n’est pas un projet ZENTECH DESIGN/)).toBeTruthy();
  });

  it('sauvegarde automatique (préférence) : un projet enregistré et modifié l’est après le délai choisi', async () => {
    const device = await boot();
    const id = newPoster();
    await act(async () => {
      markSaved(id);
      await saveDocument(id);
    });
    jest.useFakeTimers();
    await act(async () => {
      await setAutoSave(30);
      st().mutateDocument(id, (d) => addLayer(d, createShapeLayer(d, 'rectangle', 'r2', '#000000')), 'Nouveau calque de forme');
    });
    await act(async () => {
      jest.advanceTimersByTime(31_000);
    });
    jest.useRealTimers();
    await wait(10);
    const reloaded = await createTextProjectRepository(device).loadAll();
    expect(reloaded.documents.find((d) => d.id === id)?.layers.map((l) => l.id)).toEqual(['e1', 'r2']);
  });
});

describe('appareil (M3)', () => {
  it('signale un projet illisible sur l’accueil, le garde, et ne le supprime que sur demande', async () => {
    const device = mapStorage();
    device.setItem('zentech-design/project/abime', '{"kind":"zentech-design/project","formatVersion":1,"document":{"id":"abime"}}');
    await boot(device);
    await renderRouter('src/app', { initialUrl: '/' });
    const notice = within(screen.getByTestId('unreadable-projects'));
    expect(notice.getByText(/n’a pas pu être ouvert : Projet endommagé/)).toBeTruthy();
    await fireEvent.press(notice.getByRole('button', { name: 'Supprimer le projet illisible abime' }));
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(device.getItem('zentech-design/project/abime')).toBeNull();
  });

  it('un échec de lecture bloque l’accès sans rien effacer ; « Réessayer » relit', async () => {
    stopPersistence();
    let fail = true;
    const good = createTextProjectRepository(mapStorage());
    repoModule.__setRepository({ ...good, loadAll: () => (fail ? Promise.reject(new Error('base verrouillée')) : good.loadAll()) });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByTestId('persistence-failed')).toBeTruthy();
    fail = false;
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });

  it('documents en onglets : passer de l’un à l’autre, fermer', async () => {
    await boot();
    const a = newPoster();
    const b = st().createDocument({ width: 300, height: 300, background: 'black', name: 'Logo' }).id;
    markSaved(b);
    await renderRouter('src/app', { initialUrl: `/editor/${a}` });
    await act(async () => useWorkspaceStore.getState().openDocument(b));
    await fireEvent.press(screen.getByTestId(`doc-tab-${b}`));
    expect(await screen.findByLabelText(/^Document Logo @/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Fermer Logo' }));
    expect(await screen.findByLabelText(/^Document Affiche @/)).toBeTruthy();
    expect(useWorkspaceStore.getState().openDocuments).toEqual([a]);
  });

  it('Image › Dupliquer ajoute une copie non enregistrée', async () => {
    await boot();
    const a = newPoster();
    await renderRouter('src/app', { initialUrl: `/editor/${a}` });
    await fireEvent.press(screen.getByRole('button', { name: 'Menu Image' }));
    await fireEvent.press(menuItem('Dupliquer…'));
    await fireEvent.press(within(screen.getByTestId('prompt-dialog')).getByRole('button', { name: 'Dupliquer' }));
    expect(await screen.findByLabelText(/^Document Affiche copie @/)).toBeTruthy();
  });
});
