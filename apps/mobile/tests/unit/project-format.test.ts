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
    expect(JSON.parse(json)).toMatchObject({ kind: PROJECT_KIND, formatVersion: 3 });
    const parsed = parseProject(json);
    expect(parsed).toEqual({ ok: true, document: doc, migratedFrom: null });
  });

  it('migre un projet de la version 1 (avant la résolution et la couleur de fond)', () => {
    const v1 = JSON.parse(serializeDocument(sample()));
    v1.formatVersion = 1;
    delete v1.document.guides;
    delete v1.document.resolution;
    delete v1.document.backgroundColor;
    v1.document.background = 'black';
    const parsed = parseProject(JSON.stringify(v1));
    expect(parsed).toMatchObject({ ok: true, migratedFrom: 1, document: { formatVersion: 3, resolution: 72, backgroundColor: '#000000', background: 'black', guides: [] } });
  });

  it('migre un projet de la version 2 (sans repères) et relit les repères', () => {
    const v2 = JSON.parse(serializeDocument(sample()));
    v2.formatVersion = 2;
    delete v2.document.guides;
    expect(parseProject(JSON.stringify(v2))).toMatchObject({ ok: true, migratedFrom: 2, document: { formatVersion: 3, guides: [] } });

    const guides = [
      { id: 'g1', orientation: 'horizontal', position: 120 },
      { id: 'g2', orientation: 'vertical', position: -40 },
    ];
    expect(parseProject(withDoc((d) => (d.guides = guides)))).toMatchObject({ ok: true, document: { guides } });
    expect(parseProject(withDoc((d) => (d.guides = [{ id: 'g', orientation: 'diagonal', position: 1 }]))).ok).toBe(false);
    expect(parseProject(withDoc((d) => (d.guides = [{ id: 'g', orientation: 'vertical', position: 1e9 }]))).ok).toBe(false);
    expect(parseProject(withDoc((d) => (d.guides = [guides[0], guides[0]]))).ok).toBe(false);
    expect(parseProject(withDoc((d) => delete d.guides)).ok).toBe(false); // obligatoire en version 3
  });

  it('lit un fond de couleur personnalisée et refuse une résolution hors limites', () => {
    expect(parseProject(withDoc((d) => Object.assign(d, { background: 'color', backgroundColor: '#12ab34' })))).toMatchObject({
      ok: true,
      document: { background: 'color', backgroundColor: '#12AB34' },
    });
    expect(parseProject(withDoc((d) => (d.resolution = 0))).ok).toBe(false);
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
