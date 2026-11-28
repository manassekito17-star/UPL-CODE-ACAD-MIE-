import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { DocumentSpec } from '@/engine/documents';
import { exportDocument } from '@/engine/renderer';
import { resetExportStore } from '@/features/export';
import type { Breakpoint } from '@/hooks/useBreakpoint';
import { saveExportToFolder, shareExport } from '@/services/export/exportFiles';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore } from '@/stores/editorUiStore';

let mockBreakpoint: Breakpoint = 'compact';
jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => mockBreakpoint,
}));
// Le rendu et l'encodage réels sont vérifiés sur de vrais fichiers dans
// export.test.ts (vrai Skia) ; ici : l'interface et ce qu'elle demande.
jest.mock('@/engine/renderer', () => {
  const actual = jest.requireActual('@/engine/renderer');
  return {
    ...actual,
    exportDocument: jest.fn((doc: { name: string; width: number; height: number; background: string }, settings: { format: 'png' | 'jpeg' | 'webp' }) => {
      const plan = actual.planExport(doc, settings);
      if (plan.error) throw new Error(plan.error);
      return {
        bytes: new Uint8Array(2048),
        width: plan.width,
        height: plan.height,
        format: settings.format,
        mimeType: { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }[settings.format],
        fileName: actual.exportFileName(doc.name, settings.format),
      };
    }),
  };
});
const exportMock = exportDocument as jest.MockedFunction<typeof exportDocument>;
const shareMock = shareExport as jest.MockedFunction<typeof shareExport>;
const folderMock = saveExportToFolder as jest.MockedFunction<typeof saveExportToFolder>;

async function open(breakpoint: Breakpoint, spec: DocumentSpec = { width: 1000, height: 500, background: 'transparent', name: 'Affiche', resolution: 300 }) {
  mockBreakpoint = breakpoint;
  const doc = useDocumentStore.getState().createDocument(spec);
  await renderRouter('src/app', { initialUrl: `/editor/${doc.id}` });
  if (breakpoint === 'compact') await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Exporter' }));
  return doc;
}
const dialog = () => within(screen.getByTestId('export-dialog'));
/** L'estimation attend une courte pause ; l'export attend une image (minuteurs simulés par renderRouter). */
const settle = () =>
  act(async () => {
    jest.advanceTimersByTime(400);
  });
const commit = async (testID: string, value: string) => {
  const input = dialog().getByTestId(testID);
  await fireEvent.changeText(input, value);
  await fireEvent(input, 'blur');
};

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
  resetExportStore();
  exportMock.mockClear();
  shareMock.mockClear();
  folderMock.mockClear();
});

describe('Exporter sous (lot C)', () => {
  it('PNG taille réelle, transparence, résolution du document ; le fichier calculé pour l’estimation est celui partagé', async () => {
    const doc = await open('compact');
    expect(dialog().getByText('Exporter sous')).toBeTruthy();
    expect(dialog().getByTestId('export-size')).toHaveTextContent('1000 × 500 px · PNG');
    expect(dialog().getByRole('checkbox', { name: 'Transparence' })).toBeChecked();
    await settle();
    expect(dialog().getByTestId('export-file-size')).toHaveTextContent('Taille du fichier : 2,0 Ko');
    expect(exportMock).toHaveBeenCalledTimes(1);
    expect(exportMock).toHaveBeenLastCalledWith(expect.objectContaining({ id: doc.id }), { format: 'png', scale: 1, quality: 90, matte: '#FFFFFF', transparency: true, resolution: 300 }, expect.anything());

    await fireEvent.press(dialog().getByTestId('export-share'));
    await settle();
    expect(exportMock).toHaveBeenCalledTimes(1); // pas de second calcul
    expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'Affiche.png', mimeType: 'image/png' }));
    expect(dialog().getByText('Image exportée : Affiche.png — 1000 × 500 px, 2,0 Ko.')).toBeTruthy();
    expect(dialog().getByText('Emplacement : celui choisi dans la feuille de partage.')).toBeTruthy();
  });

  it('TEST 4 : largeur, hauteur et échelle liées ; Exporter dans un dossier ; emplacement affiché', async () => {
    await open('compact');
    await commit('export-width', '500');
    expect(dialog().getByTestId('export-height').props.value).toBe('250');
    expect(dialog().getByTestId('export-scale').props.value).toBe('50');
    await commit('export-height', '1000');
    expect(dialog().getByTestId('export-width').props.value).toBe('2000');
    await fireEvent.press(dialog().getByRole('radio', { name: '100 %' }));
    await settle();
    await fireEvent.press(dialog().getByTestId('export-folder'));
    await settle();
    expect(folderMock).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'Affiche.png', width: 1000, height: 500 }));
    expect(dialog().getByText('Emplacement : dossier choisi, fichier « Affiche.png ».')).toBeTruthy();
    expect(dialog().getByRole('button', { name: 'Partager ce fichier' })).toBeTruthy();
  });

  it('TEST 5 : JPEG (qualité, fond) puis WebP (transparence désactivable, résolution non écrite)', async () => {
    await open('compact');
    await fireEvent.press(dialog().getByTestId('export-format-jpeg'));
    expect(dialog().queryByRole('checkbox', { name: 'Transparence' })).toBeNull();
    expect(dialog().getByText(/Le JPEG ne garde pas la transparence/)).toBeTruthy();
    await fireEvent.press(dialog().getByRole('radio', { name: 'Noir' }));
    await commit('export-quality', '70');
    await settle();
    await fireEvent.press(dialog().getByTestId('export-folder'));
    await settle();
    expect(exportMock).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ format: 'jpeg', quality: 70, matte: '#000000' }), expect.anything());
    expect(folderMock).toHaveBeenLastCalledWith(expect.objectContaining({ fileName: 'Affiche.jpg', mimeType: 'image/jpeg' }));

    await fireEvent.press(dialog().getByTestId('export-format-webp'));
    expect(dialog().getByText(/Le WebP ne prévoit pas de champ de résolution/)).toBeTruthy();
    await fireEvent.press(dialog().getByTestId('export-transparency'));
    expect(dialog().getByText(/Transparence désactivée/)).toBeTruthy();
    await settle();
    await fireEvent.press(dialog().getByTestId('export-folder'));
    await settle();
    expect(folderMock).toHaveBeenLastCalledWith(expect.objectContaining({ fileName: 'Affiche.webp', mimeType: 'image/webp' }));
  });

  it('refuse une taille au-delà des limites, avant tout calcul', async () => {
    await open('compact', { width: 4096, height: 4096, background: 'white', name: 'Grand' });
    await fireEvent.press(dialog().getByRole('radio', { name: '200 %' }));
    await settle();
    expect(dialog().getByTestId('export-error')).toHaveTextContent(/8192 × 8192 px dépasse la limite/);
    expect(dialog().getByTestId('export-folder')).toBeDisabled();
    expect(exportMock).not.toHaveBeenCalled();
  });

  it('un échec de partage est affiché, jamais caché', async () => {
    shareMock.mockRejectedValueOnce(new Error('Le partage n’est pas disponible sur cet appareil.'));
    await open('compact');
    await settle();
    await fireEvent.press(dialog().getByTestId('export-share'));
    await settle();
    expect(dialog().getByTestId('export-error')).toHaveTextContent('Export impossible : Le partage n’est pas disponible sur cet appareil.');
  });

  it('tablette : Fichier › Exportation rapide au format PNG et Exporter sous…', async () => {
    await open('expanded');
    await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
    await fireEvent.press(within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name: 'Exportation rapide au format PNG' }));
    await settle();
    expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'Affiche.png' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
    await fireEvent.press(within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name: 'Exporter sous…' }));
    expect(dialog().getByText('Exporter sous')).toBeTruthy();
  });
});
