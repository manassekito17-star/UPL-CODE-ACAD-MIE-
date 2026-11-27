import { createDocument, type GraphicDocument } from '@/engine/documents';
import { addLayer, createImageLayer, createShapeLayer, createTextLayer, type ImageAsset } from '@/engine/layers';
import { PROJECT_KIND, parseProject, referencedFiles, serializeDocument } from '@/engine/project';
import { orphanFiles, relocateAssets } from '@/services/projects/assetPaths';

const asset: ImageAsset = {
  uri: 'file:///var/mobile/Containers/Data/Application/OLD-UUID/Documents/assets/img_1.jpg',
  width: 400,
  height: 300,
  originalUri: 'file:///var/mobile/Containers/Data/Application/OLD-UUID/Documents/assets/img_1',
  originalWidth: 4000,
  originalHeight: 3000,
  fileName: 'IMG_0001.HEIC',
};

function sample(): GraphicDocument {
  let doc = createDocument({ width: 1080, height: 1080, background: 'transparent', name: 'Affiche' }, { id: 'doc_1', now: 1000 });
  doc = addLayer(doc, { ...createShapeLayer(doc, 'ellipse', 's1', '#C9645B'), opacity: 0.5, rotation: 30 });
  doc = addLayer(doc, { ...createTextLayer(doc, 't1'), text: 'Bonjour\nà tous', bold: true, align: 'right' });
  doc = addLayer(doc, { ...createImageLayer(doc, asset, 'i1'), locked: true, visible: false });
  return doc;
}

const withDoc = (mutate: (d: Record<string, unknown>) => void) => {
  const data = JSON.parse(serializeDocument(sample()));
  mutate(data.document);
  return JSON.stringify(data);
};

describe('format de projet', () => {
  it('relit exactement ce qu’il a écrit (forme, texte, image, propriétés)', () => {
    const doc = sample();
    const json = serializeDocument(doc);
    expect(JSON.parse(json)).toMatchObject({ kind: PROJECT_KIND, formatVersion: 1 });
    const parsed = parseProject(json);
    expect(parsed).toEqual({ ok: true, document: doc, migratedFrom: null });
  });

  it('refuse un fichier illisible, étranger ou d’une version plus récente', () => {
    expect(parseProject('{oups')).toEqual({ ok: false, message: 'Fichier de projet illisible (JSON invalide).' });
    expect(parseProject(JSON.stringify({ kind: 'autre', formatVersion: 1, document: {} })).ok).toBe(false);
    const newer = parseProject(JSON.stringify({ kind: PROJECT_KIND, formatVersion: 99, document: {} }));
    expect(newer).toMatchObject({ ok: false, message: expect.stringContaining('version plus récente') });
  });

  it('refuse un document endommagé au lieu de le charger à moitié', () => {
    const cases: [string, (d: Record<string, unknown>) => void][] = [
      ['dimensions', (d) => (d.width = 99999)],
      ['couleur', (d) => ((d.layers as Record<string, unknown>[])[0]!.fill = 'rouge')],
      ['type', (d) => ((d.layers as Record<string, unknown>[])[0]!.type = 'pinceau')],
      ['opacité', (d) => ((d.layers as Record<string, unknown>[])[1]!.opacity = 2)],
      ['image', (d) => delete (d.layers as Record<string, unknown>[])[2]!.asset],
      ['doublon', (d) => ((d.layers as Record<string, unknown>[])[1]!.id = 's1')],
      ['calques', (d) => (d.layers = 'aucun')],
    ];
    for (const [, mutate] of cases) {
      const result = parseProject(withDoc(mutate));
      expect(result).toMatchObject({ ok: false, message: expect.stringContaining('Projet endommagé') });
    }
  });

  it('ignore les champs inconnus', () => {
    const parsed = parseProject(withDoc((d) => (d.futurChamp = 42)));
    expect(parsed.ok && 'futurChamp' in parsed.document).toBe(false);
  });

  it('liste les fichiers d’images référencés', () => {
    expect(referencedFiles(sample())).toEqual([asset.uri, asset.originalUri]);
  });
});

describe('images du projet', () => {
  it('rattache les images au dossier actuel de l’application (iOS change ce chemin à chaque mise à jour)', () => {
    const moved = relocateAssets(sample(), 'file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/assets/');
    const image = moved.layers[2];
    expect(image?.type === 'image' && image.asset.uri).toBe('file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/assets/img_1.jpg');
    expect(image?.type === 'image' && image.asset.originalUri).toBe('file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/assets/img_1');
    const same = relocateAssets(moved, 'file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/assets');
    expect(same).toBe(moved);
  });

  it('repère les fichiers que plus aucun projet ne référence', () => {
    const files = ['file:///a/assets/img_1.jpg', 'file:///a/assets/img_1', 'file:///a/assets/img_2.jpg'];
    expect(orphanFiles(files, referencedFiles(sample()))).toEqual(['file:///a/assets/img_2.jpg']);
  });
});
