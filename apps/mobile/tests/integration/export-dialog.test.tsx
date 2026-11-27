import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { DocumentSpec } from '@/engine/documents';
import type { Breakpoint } from '@/hooks/useBreakpoint';
import { exportDocument } from '@/engine/renderer';
import { resetExportStore } from '@/features/export';
import { saveExportToFolder, shareExport } from '@/services/export/exportFiles';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore } from '@/stores/editorUiStore';

let mockBreakpoint: Breakpoint = 'compact';
jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => mockBreakpoint,
}));
// Le rendu réel est vérifié pixel par pixel dans export.test.ts (vrai Skia) ;
// ici on vérifie l'interface et ce qu'elle demande au moteur.
jest.mock('@/engine/renderer', () => {
  const actual = jest.requireActual('@/engine/renderer');
  return {
    ...actual,
    exportDocument: jest.fn((doc: { name: string; width: number; height: number }, settings: { format: string; scale: number }) => {
      const plan = actual.planExport(doc, settings);
      if (plan.error) throw new Error(plan.error);
      return {
        bytes: new Uint8Array(2048),
        width: plan.width,
        height: plan.height,
        mimeType: settings.format === 'png' ? 'image/png' : 'image/jpeg',
        fileName: actual.exportFileName(doc.name, settings.format),
      };
    }),
  };
});
const exportMock = exportDocument as jest.MockedFunction<typeof exportDocument>;
const shareMock = shareExport as jest.MockedFunction<typeof shareExport>;
const folderMock = saveExportToFolder as jest.MockedFunction<typeof saveExportToFolder>;

async function open(breakpoint: Breakpoint, spec: DocumentSpec = { width: 1000, height: 500, background: 'transparent', name: 'Affiche' }) {
  mockBreakpoint = breakpoint;
  const doc = useDocumentStore.getState().createDocument(spec);
  await renderRouter('src/app', { initialUrl: `/editor/${doc.id}` });
  return doc;
}
const dialog = () => within(screen.getByTestId('export-dialog'));
/** L'export attend une image avant de calculer (affichage de « Export en cours… ») ; renderRouter simule les minuteurs. */
const finishExport = () =>
  act(async () => {
    jest.advanceTimersByTime(50);
  });

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
  resetExportStore();
  exportMock.mockClear();
  shareMock.mockClear();
  folderMock.mockClear();
});

describe('export (M4)', () => {
  it('téléphone : PNG taille réelle, transparence conservée, partage', async () => {
    const doc = await open('compact');
    await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Exporter' }));
    expect(dialog().getByText('Exporter « Affiche »')).toBeTruthy();
    expect(dialog().getByTestId('export-size')).toHaveTextContent('1000 × 500 px');
    expect(dialog().getByText('La transparence du document est conservée.')).toBeTruthy();

    await fireEvent.press(dialog().getByRole('button', { name: /^Partager…/ }));
    await finishExport();
    expect(exportMock).toHaveBeenCalledWith(expect.objectContaining({ id: doc.id }), { format: 'png', scale: 1, quality: 90, matte: '#FFFFFF' }, expect.anything());
    expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'Affiche.png', mimeType: 'image/png' }));
    expect(dialog().getByTestId('export-success')).toHaveTextContent('Image prête : Affiche.png — 1000 × 500 px, 2,0 Ko.');
    await fireEvent.press(dialog().getByRole('button', { name: 'Terminé' }));
    expect(screen.queryByTestId('export-dialog')).toBeNull();
  });

  it('JPEG : qualité, fond des zones transparentes, taille 50 %, enregistrement dans un dossier', async () => {
    await open('compact');
    await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Exporter' }));
    await fireEvent.press(dialog().getByRole('radio', { name: 'JPEG' }));
    expect(dialog().getByText(/Le JPEG ne garde pas la transparence/)).toBeTruthy();
    await fireEvent.press(dialog().getByRole('radio', { name: 'Noir' }));
    await fireEvent.press(dialog().getByRole('radio', { name: '50 %' }));
    expect(dialog().getByTestId('export-size')).toHaveTextContent('500 × 250 px');
    const quality = dialog().getByTestId('export-quality');
    await fireEvent.changeText(quality, '70');
    await fireEvent(quality, 'blur');

    await fireEvent.press(dialog().getByRole('button', { name: /^Enregistrer dans un dossier…/ }));
    await finishExport();
    expect(exportMock).toHaveBeenLastCalledWith(expect.anything(), { format: 'jpeg', scale: 0.5, quality: 70, matte: '#000000' }, expect.anything());
    expect(dialog().getByTestId('export-success')).toHaveTextContent('Enregistrée : Affiche.jpg — 500 × 250 px, 2,0 Ko.');
  });

  it('refuse une taille au-delà des limites, avant tout calcul', async () => {
    await open('compact', { width: 4096, height: 4096, background: 'white', name: 'Grand' });
    await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Exporter' }));
    await fireEvent.press(dialog().getByRole('radio', { name: '200 %' }));
    expect(dialog().getByTestId('export-error')).toHaveTextContent(/8192 × 8192 px dépasse la limite/);
    expect(dialog().getByRole('button', { name: /^Partager…/ })).toBeDisabled();
    expect(exportMock).not.toHaveBeenCalled();
  });

  it('un échec de partage est affiché, jamais caché', async () => {
    shareMock.mockRejectedValueOnce(new Error('Le partage n’est pas disponible sur cet appareil.'));
    await open('compact');
    await fireEvent.press(within(screen.getByTestId('editor-top-bar')).getByRole('button', { name: 'Exporter' }));
    await fireEvent.press(dialog().getByRole('button', { name: /^Partager…/ }));
    await finishExport();
    expect(dialog().getByTestId('export-error')).toHaveTextContent('Export impossible : Le partage n’est pas disponible sur cet appareil.');
  });

  it('tablette : Fichier › Exporter sous… et Exportation rapide au format PNG', async () => {
    await open('expanded');
    await fireEvent.press(screen.getByRole('button', { name: 'Menu Fichier' }));
    await fireEvent.press(within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name: 'Exportation rapide au format PNG' }));
    await finishExport();
    expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'Affiche.png' }));

    await fireEvent.press(screen.getByTestId('opt-export'));
    expect(dialog().getByText('Exporter « Affiche »')).toBeTruthy();
  });
});
