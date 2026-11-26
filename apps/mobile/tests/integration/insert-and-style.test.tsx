import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { ImageAsset, ShapeLayer, TextLayer } from '@/engine/layers';
import { pickAndImportImage } from '@/services/imageImport';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';

jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));
jest.mock('@/services/imageImport', () => ({
  ...jest.requireActual('@/services/imageImport'),
  pickAndImportImage: jest.fn(),
}));
const pickMock = pickAndImportImage as jest.MockedFunction<typeof pickAndImportImage>;

let docId = '';
const layers = () => useDocumentStore.getState().documents[docId]?.layers ?? [];
const button = (name: string) => screen.getByRole('button', { name });
const toolbar = () => within(screen.getByTestId('editor-toolbar'));

async function openEditor() {
  docId = useDocumentStore.getState().createDocument({ width: 1000, height: 500, background: 'white', name: 'Affiche' }).id;
  await renderRouter('src/app', { initialUrl: `/editor/${docId}` });
}

async function insertFromMenu(label: string) {
  await fireEvent.press(button('Ajouter un calque'));
  await fireEvent.press(within(screen.getByTestId('choice-dialog')).getByRole('button', { name: label }));
}

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
  pickMock.mockReset();
});

describe('insertion', () => {
  it('ajoute texte, rectangle, cercle et ligne depuis le menu, et passe en outil Sélection', async () => {
    await openEditor();
    expect(useEditorUiStore.getState().activeTool).toBe('pan');
    for (const label of ['Texte', 'Rectangle', 'Cercle', 'Ligne']) await insertFromMenu(label);
    expect(layers().map((l) => (l.type === 'shape' ? l.shape : l.type))).toEqual(['text', 'rectangle', 'ellipse', 'line']);
    expect(layers().map((l) => l.name)).toEqual(['Texte 1', 'Rectangle 1', 'Cercle 1', 'Ligne 1']);
    expect(useEditorUiStore.getState().activeTool).toBe('select');
    expect(useEditorUiStore.getState().selectedLayerId).toBe(layers()[3]?.id);
  });

  it('les outils Texte et Formes de la barre insèrent directement', async () => {
    await openEditor();
    await fireEvent.press(toolbar().getByRole('button', { name: 'Texte' }));
    await fireEvent.press(toolbar().getByRole('button', { name: 'Formes' }));
    const dialog = within(screen.getByTestId('choice-dialog'));
    expect(dialog.queryByRole('button', { name: 'Texte' })).toBeNull(); // menu des formes seulement
    await fireEvent.press(dialog.getByRole('button', { name: 'Cercle' }));
    expect(layers().map((l) => l.type)).toEqual(['text', 'shape']);
  });

  it("importe une image de la galerie dans le document, et ne fait rien si l'on annule", async () => {
    const asset: ImageAsset = {
      uri: 'file:///app/assets/img_2.png',
      width: 400,
      height: 200,
      originalUri: 'file:///app/assets/img_2-original.png',
      originalWidth: 400,
      originalHeight: 200,
      fileName: 'logo.png',
    };
    await openEditor();
    pickMock.mockResolvedValueOnce(null);
    await fireEvent.press(toolbar().getByRole('button', { name: 'Image' }));
    expect(layers()).toHaveLength(0);

    pickMock.mockResolvedValueOnce(asset);
    await fireEvent.press(toolbar().getByRole('button', { name: 'Image' }));
    expect(await screen.findByTestId('image-properties')).toBeTruthy();
    expect(layers()[0]).toMatchObject({ type: 'image', name: 'Image 1', width: 400, height: 200, x: 300, y: 150, asset });
    expect(screen.getByText('L’original est conservé intact ; la copie de travail est affichée et exportée.')).toBeTruthy();
  });

  it("signale un import raté sans rien ajouter", async () => {
    const { ImageImportError } = jest.requireActual('@/services/imageImport');
    pickMock.mockRejectedValueOnce(new ImageImportError('Fichier illisible.'));
    await openEditor();
    await fireEvent.press(toolbar().getByRole('button', { name: 'Image' }));
    expect(await screen.findByText('Fichier illisible.')).toBeTruthy();
    expect(layers()).toHaveLength(0);
  });
});

describe('propriétés de style', () => {
  it("change la couleur d'une forme par le nuancier et par code, et refuse un code invalide", async () => {
    await openEditor();
    await insertFromMenu('Cercle');
    await fireEvent.press(screen.getByRole('radio', { name: 'Couleur #FF5C5C' }));
    expect((layers()[0] as ShapeLayer).fill).toBe('#FF5C5C');

    await fireEvent.changeText(screen.getByTestId('field-color-hex'), '00aa77');
    await fireEvent(screen.getByTestId('field-color-hex'), 'submitEditing');
    expect((layers()[0] as ShapeLayer).fill).toBe('#00AA77');

    await fireEvent.changeText(screen.getByTestId('field-color-hex'), 'vert');
    await fireEvent(screen.getByTestId('field-color-hex'), 'submitEditing');
    expect(screen.getByText('Couleur invalide : format attendu #RRVVBB.')).toBeTruthy();
    expect((layers()[0] as ShapeLayer).fill).toBe('#00AA77');
  });

  it('modifie le texte, sa taille, son alignement, sa graisse et sa couleur', async () => {
    await openEditor();
    await insertFromMenu('Texte');
    await fireEvent.changeText(screen.getByTestId('field-text'), 'Grand concert');
    await fireEvent(screen.getByTestId('field-text'), 'blur');
    await fireEvent.changeText(screen.getByTestId('field-font-size'), '72');
    await fireEvent(screen.getByTestId('field-font-size'), 'submitEditing');
    await fireEvent.press(screen.getByRole('radio', { name: 'Droite' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Normal' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Couleur #3685FF' }));
    expect(layers()[0] as TextLayer).toMatchObject({
      text: 'Grand concert',
      fontSize: 72,
      align: 'right',
      bold: false,
      color: '#3685FF',
    });
  });

  it('refuse un texte vide en gardant le texte précédent', async () => {
    await openEditor();
    await insertFromMenu('Texte');
    await fireEvent.changeText(screen.getByTestId('field-text'), '   ');
    await fireEvent(screen.getByTestId('field-text'), 'blur');
    expect(screen.getByText('Le texte ne peut pas être vide.')).toBeTruthy();
    expect((layers()[0] as TextLayer).text).toBe('Votre texte');
  });

  it('un calque verrouillé ne change pas de style', async () => {
    await openEditor();
    await insertFromMenu('Rectangle');
    await fireEvent.press(button('Verrouiller Rectangle 1'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Couleur #FF5C5C' }));
    expect((layers()[0] as ShapeLayer).fill).toBe('#3685FF');
  });
});
