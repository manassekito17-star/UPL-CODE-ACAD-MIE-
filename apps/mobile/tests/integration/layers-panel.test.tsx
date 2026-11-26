import { act, fireEvent, renderHook, renderRouter, screen, within } from 'expo-router/testing-library';

import type { ShapeLayer } from '@/engine/layers';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';

// Grand écran : panneaux Calques et Propriétés affichés côte à côte.
jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));

let docId = '';
const doc = () => useDocumentStore.getState().documents[docId];
const layers = () => doc()?.layers ?? [];
const names = () => layers().map((l) => l.name);
const button = (name: string) => screen.getByRole('button', { name });

async function openEditor() {
  docId = useDocumentStore.getState().createDocument({ width: 1000, height: 500, background: 'white', name: 'Affiche' }).id;
  await renderRouter('src/app', { initialUrl: `/editor/${docId}` });
}

async function addRectangles(count: number) {
  for (let i = 0; i < count; i += 1) {
    await fireEvent.press(button('Ajouter un calque'));
    await fireEvent.press(within(screen.getByTestId('choice-dialog')).getByRole('button', { name: 'Rectangle' }));
  }
}

/** Ordre affiché dans la liste (le haut de la pile en premier). */
const listedNames = () =>
  screen.getAllByRole('button', { name: /^Calque / }).map((b) => String(b.props.accessibilityLabel).replace('Calque ', ''));

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
});

describe('panneau Calques', () => {
  it("affiche un état vide, puis ajoute un rectangle sélectionné et l'affiche dans le canvas", async () => {
    await openEditor();
    expect(screen.getByTestId('layers-empty')).toBeTruthy();
    expect(button('Supprimer le calque')).toBeDisabled();

    await addRectangles(1);
    expect(names()).toEqual(['Rectangle 1']);
    expect(button('Calque Rectangle 1')).toBeSelected();
    expect(screen.getByLabelText('Document de 1000 × 500 pixels, 1 calque')).toBeTruthy();
    expect(screen.getByTestId('layer-properties')).toBeTruthy();
  });

  it('liste les calques du haut vers le bas et ajoute au-dessus de la sélection', async () => {
    await openEditor();
    await addRectangles(2);
    expect(listedNames()).toEqual(['Rectangle 2', 'Rectangle 1']);
    await fireEvent.press(button('Calque Rectangle 1'));
    await addRectangles(1);
    expect(names()).toEqual(['Rectangle 1', 'Rectangle 3', 'Rectangle 2']);
  });

  it('monte et descend le calque sélectionné, boutons désactivés aux extrémités', async () => {
    await openEditor();
    await addRectangles(2);
    // « Rectangle 2 » est sélectionné et déjà tout en haut.
    expect(button('Monter le calque')).toBeDisabled();
    await fireEvent.press(button('Descendre le calque'));
    expect(names()).toEqual(['Rectangle 2', 'Rectangle 1']);
    expect(button('Descendre le calque')).toBeDisabled();
    await fireEvent.press(button('Monter le calque'));
    expect(names()).toEqual(['Rectangle 1', 'Rectangle 2']);
  });

  it('renomme via une boîte de saisie qui refuse un nom vide', async () => {
    await openEditor();
    await addRectangles(1);
    await fireEvent.press(button('Renommer le calque'));
    const dialog = screen.getByTestId('prompt-dialog');
    await fireEvent.changeText(within(dialog).getByTestId('prompt-input'), '   ');
    await fireEvent.press(within(dialog).getByRole('button', { name: 'Renommer' }));
    expect(screen.getByText('Le nom du calque ne peut pas être vide.')).toBeTruthy();
    expect(names()).toEqual(['Rectangle 1']);

    await fireEvent.changeText(within(screen.getByTestId('prompt-dialog')).getByTestId('prompt-input'), 'Bandeau');
    await fireEvent.press(within(screen.getByTestId('prompt-dialog')).getByRole('button', { name: 'Renommer' }));
    expect(screen.queryByTestId('prompt-dialog')).toBeNull();
    expect(names()).toEqual(['Bandeau']);
  });

  it('duplique au-dessus et sélectionne la copie', async () => {
    await openEditor();
    await addRectangles(1);
    await fireEvent.press(button('Dupliquer le calque'));
    expect(names()).toEqual(['Rectangle 1', 'Rectangle 1 copie']);
    expect(button('Calque Rectangle 1 copie')).toBeSelected();
  });

  it('masque et affiche un calque', async () => {
    await openEditor();
    await addRectangles(1);
    await fireEvent.press(button('Masquer Rectangle 1'));
    expect(layers()[0]?.visible).toBe(false);
    await fireEvent.press(button('Afficher Rectangle 1'));
    expect(layers()[0]?.visible).toBe(true);
  });

  it('un calque verrouillé ne peut être ni supprimé ni modifié dans les propriétés', async () => {
    await openEditor();
    await addRectangles(1);
    await fireEvent.press(button('Verrouiller Rectangle 1'));
    expect(button('Supprimer le calque')).toBeDisabled();
    expect(screen.getByText('Calque verrouillé : déverrouillez-le pour le modifier.')).toBeTruthy();
    expect(screen.getByTestId('field-x').props.editable).toBe(false);

    await fireEvent.press(button('Déverrouiller Rectangle 1'));
    expect(button('Supprimer le calque')).toBeEnabled();
    expect(screen.getByTestId('field-x').props.editable).toBe(true);
  });
});

describe('suppression confirmée', () => {
  it("n'efface rien si l'on annule", async () => {
    await openEditor();
    await addRectangles(1);
    await fireEvent.press(button('Supprimer le calque'));
    const dialog = screen.getByTestId('confirm-dialog');
    expect(within(dialog).getByText('« Rectangle 1 » sera supprimé du document.')).toBeTruthy();
    await fireEvent.press(within(dialog).getByRole('button', { name: 'Annuler' }));
    expect(names()).toEqual(['Rectangle 1']);
  });

  it('supprime le calque nommé dans la boîte, même si la sélection change entre-temps', async () => {
    await openEditor();
    await addRectangles(3);
    await fireEvent.press(button('Calque Rectangle 2'));
    await fireEvent.press(button('Supprimer le calque'));
    // La sélection bouge pendant que la boîte est ouverte (geste sur le canvas, par exemple).
    await act(async () => useEditorUiStore.getState().selectLayer(layers()[2]?.id ?? null));
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(names()).toEqual(['Rectangle 1', 'Rectangle 3']);
  });
});

describe('panneau Propriétés', () => {
  it('modifie position, taille, rotation et opacité, et refuse les valeurs invalides', async () => {
    await openEditor();
    await addRectangles(1);
    const commit = async (testID: string, text: string) => {
      await fireEvent.changeText(screen.getByTestId(testID), text);
      await fireEvent(screen.getByTestId(testID), 'submitEditing');
    };
    await commit('field-x', '12');
    await commit('field-y', '-30');
    await commit('field-width', '300');
    await commit('field-rotation', '370');
    await commit('field-opacity', '40');
    expect(layers()[0]).toMatchObject({ x: 12, y: -30, width: 300, rotation: 10, opacity: 0.4 });

    await commit('field-opacity', '150');
    expect(screen.getByText('Entre 0 et 100 %.')).toBeTruthy();
    await commit('field-height', '0');
    expect(screen.getByText("La largeur et la hauteur doivent être d'au moins 1 px.")).toBeTruthy();
    expect(layers()[0]).toMatchObject({ height: 200, opacity: 0.4 });
  });

  it('ne valide pas deux fois la même saisie (Entrée puis perte du focus)', async () => {
    await openEditor();
    await addRectangles(1);
    let changes = 0;
    const unsubscribe = useDocumentStore.subscribe(() => {
      changes += 1;
    });
    await fireEvent.changeText(screen.getByTestId('field-x'), '55');
    await fireEvent(screen.getByTestId('field-x'), 'submitEditing');
    await fireEvent(screen.getByTestId('field-x'), 'blur');
    unsubscribe();
    expect(layers()[0]?.x).toBe(55);
    expect(changes).toBe(1);
  });
});

describe('sélection au doigt (logique appelée par le canvas)', () => {
  it('sélectionne le calque visible le plus haut au point touché, ou rien', async () => {
    await openEditor();
    await addRectangles(2); // deux rectangles superposés au centre
    const { result } = await renderHook(() => useLayerActions(docId));
    const [bottom, top] = layers() as ShapeLayer[];
    await act(async () => result.current.selectAt(500, 250));
    expect(useEditorUiStore.getState().selectedLayerId).toBe(top?.id);
    await act(async () => result.current.setVisible(top?.id ?? '', false));
    await act(async () => result.current.selectAt(500, 250));
    expect(useEditorUiStore.getState().selectedLayerId).toBe(bottom?.id);
    await act(async () => result.current.selectAt(5, 5));
    expect(useEditorUiStore.getState().selectedLayerId).toBeNull();
  });

  it('un glisser sur le canvas déplace le calque ; refusé sur un calque verrouillé', async () => {
    await openEditor();
    await addRectangles(1);
    const { result } = await renderHook(() => useLayerActions(docId));
    const id = layers()[0]?.id ?? '';
    await act(async () => {
      expect(result.current.translate(id, 25, -10)).toBe(true);
    });
    expect(layers()[0]).toMatchObject({ x: 425, y: 140 });
    await act(async () => result.current.setLocked(id, true));
    await act(async () => {
      expect(result.current.translate(id, 5, 5)).toBe(false);
    });
    expect(layers()[0]).toMatchObject({ x: 425, y: 140 });
    expect(useEditorUiStore.getState().notice).toBe('Calque verrouillé : déverrouillez-le pour le modifier.');
  });
});
