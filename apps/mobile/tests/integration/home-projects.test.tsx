import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';

const appDir = 'src/app';
const add = (name: string, width = 1080, height = 1080) =>
  useDocumentStore.getState().createDocument({ width, height, background: 'white', name });

beforeEach(resetDocumentStore);

describe('projets récents', () => {
  it('affiche un état vide explicite', async () => {
    await renderRouter(appDir, { initialUrl: '/' });
    expect(screen.getByTestId('recent-projects-empty')).toBeTruthy();
  });

  it('liste les projets du plus récent au plus ancien, avec dimensions et date', async () => {
    add('Ancien', 800, 600);
    add('Récent', 1080, 1920);
    await renderRouter(appDir, { initialUrl: '/' });
    const names = screen.getAllByRole('button', { name: /^Ouvrir / }).map((b) => b.props.accessibilityLabel);
    expect(names).toEqual(['Ouvrir Récent', 'Ouvrir Ancien']);
    expect(screen.getByText(/1080 × 1920 px · Fond blanc/)).toBeTruthy();
    expect(screen.getAllByText(/^Modifié le \d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}$/)).toHaveLength(2);
  });

  it('ouvre un projet dans l’éditeur', async () => {
    const doc = add('Carte');
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Ouvrir Carte' }));
    expect(await screen.findByTestId('editor-screen')).toBeTruthy();
    expect(screen).toHavePathname(`/editor/${doc.id}`);
  });

  it("demande confirmation en nommant le projet, et n'efface rien si l'on annule", async () => {
    add('A garder');
    await renderRouter(appDir, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer A garder' }));

    const dialog = screen.getByTestId('confirm-dialog');
    expect(within(dialog).getByText(/« A garder » \(1080 × 1080 px\) sera supprimé définitivement\./)).toBeTruthy();
    expect(useDocumentStore.getState().order).toHaveLength(1);

    await fireEvent.press(within(dialog).getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    expect(useDocumentStore.getState().order).toHaveLength(1);
  });

  it('supprime exactement le projet confirmé, pas ses voisins', async () => {
    const a = add('Premier');
    const b = add('Deuxième');
    const c = add('Troisième');
    await renderRouter(appDir, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer Deuxième' }));
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));

    expect(useDocumentStore.getState().order).toEqual([c.id, a.id]);
    expect(screen.queryByRole('button', { name: 'Ouvrir Deuxième' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Ouvrir Premier' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ouvrir Troisième' })).toBeTruthy();
    expect(useDocumentStore.getState().documents[b.id]).toBeUndefined();
  });
});
