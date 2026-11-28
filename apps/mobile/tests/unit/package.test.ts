import { strToU8, unzipSync, zipSync } from 'fflate';

import { createDocument, type GraphicDocument } from '@/engine/documents';
import { addLayer, createImageLayer, createTextLayer, type ImageAsset } from '@/engine/layers';
import { PACKAGE_LIMITS, attachAssets, buildPackage, packageFileName, readPackage, serializeDocument } from '@/engine/project';

const asset: ImageAsset = {
  uri: 'file:///data/app/Documents/assets/img_1.jpg',
  width: 400,
  height: 300,
  originalUri: 'file:///data/app/Documents/assets/img_1',
  originalWidth: 4000,
  originalHeight: 3000,
  fileName: 'IMG_0001.HEIC',
};
const files: Record<string, Uint8Array> = { [asset.uri]: new Uint8Array([1, 2, 3]), [asset.originalUri]: new Uint8Array([9, 9, 9, 9]) };

function sample(): GraphicDocument {
  let doc = createDocument({ width: 1080, height: 1080, background: 'color', backgroundColor: '#112233', name: 'Affiche', resolution: 300 }, { id: 'doc_1', now: 5 });
  doc = addLayer(doc, { ...createTextLayer(doc, 't1'), text: 'Texte éditable' });
  doc = addLayer(doc, createImageLayer(doc, asset, 'i1'));
  doc = addLayer(doc, { ...createImageLayer(doc, asset, 'i2'), x: 50 }); // même image : stockée une fois
  return doc;
}

describe('fichier .zdesign', () => {
  it('conserve le document entier et ses images, chemins relatifs dans l’archive', () => {
    const bytes = buildPackage(sample(), (uri) => files[uri] as Uint8Array, new Uint8Array([7]));
    const entries = unzipSync(bytes);
    expect(Object.keys(entries).sort()).toEqual(['assets/img_1', 'assets/img_1.jpg', 'document.json', 'manifest.json', 'thumbnail.png']);

    const read = readPackage(bytes);
    if (!read.ok) throw new Error(read.message);
    expect(Array.from(read.assets['assets/img_1.jpg'] ?? [])).toEqual([1, 2, 3]);
    expect(Array.from(read.assets['assets/img_1'] ?? [])).toEqual([9, 9, 9, 9]);
    expect(Array.from(read.thumbnail ?? [])).toEqual([7]);
    const restored = attachAssets(read.document, (p) => `file:///new/assets/${p.slice(7)}`);
    const expected = attachAssets(sample(), (uri) => `file:///new/assets/${uri.slice(uri.lastIndexOf('/') + 1)}`);
    expect(restored).toEqual(expected);
    expect(restored).toMatchObject({ resolution: 300, background: 'color', backgroundColor: '#112233', layers: [{ type: 'text', text: 'Texte éditable' }, {}, { x: 50 }] });
  });

  it('refuse un fichier étranger, sans manifeste, ou d’une version plus récente', () => {
    expect(readPackage(strToU8('pas une archive'))).toMatchObject({ ok: false, message: expect.stringContaining('archive illisible') });
    expect(readPackage(zipSync({ 'autre.txt': strToU8('x') }))).toMatchObject({ ok: false, message: expect.stringContaining('manifeste absent') });
    const newer = zipSync({
      'manifest.json': strToU8(JSON.stringify({ kind: 'zentech-design/package', packageVersion: 9 })),
      'document.json': strToU8(serializeDocument(sample())),
    });
    expect(readPackage(newer)).toMatchObject({ ok: false, message: expect.stringContaining('version plus récente') });
  });

  it('refuse un chemin d’image hostile ou une image manquante', () => {
    const manifest = strToU8(JSON.stringify({ kind: 'zentech-design/package', packageVersion: 1 }));
    const withPath = (p: string) => {
      const d = sample();
      const layers = d.layers.map((l) => (l.type === 'image' ? { ...l, asset: { ...l.asset, uri: p, originalUri: p } } : l));
      return zipSync({ 'manifest.json': manifest, 'document.json': strToU8(serializeDocument({ ...d, layers })) });
    };
    expect(readPackage(withPath('../../etc/passwd'))).toMatchObject({ ok: false, message: expect.stringContaining('chemin d’image invalide') });
    expect(readPackage(withPath('file:///absolu.jpg'))).toMatchObject({ ok: false });
    expect(readPackage(withPath('assets/absente.jpg'))).toMatchObject({ ok: false, message: expect.stringContaining('image manquante') });
  });

  it('refuse une archive démesurée (trop d’entrées)', () => {
    const many: Record<string, Uint8Array> = {};
    for (let i = 0; i <= PACKAGE_LIMITS.maxEntries; i += 1) many[`f${i}`] = new Uint8Array(0);
    expect(readPackage(zipSync(many))).toMatchObject({ ok: false, message: 'Fichier trop volumineux pour être ouvert.' });
  });

  it('nomme le fichier', () => {
    expect(packageFileName('Mon/projet*')).toBe('Mon-projet-.zdesign');
  });
});
