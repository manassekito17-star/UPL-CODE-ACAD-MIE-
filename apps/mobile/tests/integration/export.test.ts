/**
 * @jest-environment @shopify/react-native-skia/jestEnv.js
 */
// Export exécuté avec le vrai Skia (CanvasKit) : on encode, on DÉCODE le
// fichier produit, et on vérifie ses pixels.
import type * as SkiaModule from '@shopify/react-native-skia';

import type { GraphicDocument } from '@/engine/documents';
import type { Layer, ShapeLayer } from '@/engine/layers';

jest.mock('@shopify/react-native-skia', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Mock } = require('@shopify/react-native-skia/lib/module/mock');
  return Mock((globalThis as unknown as { CanvasKit: unknown }).CanvasKit);
});

/* eslint-disable @typescript-eslint/no-require-imports */
const { Skia, AlphaType, ColorType } = require('@shopify/react-native-skia') as typeof SkiaModule;
const renderer = require('@/engine/renderer') as typeof import('@/engine/renderer');
/* eslint-enable @typescript-eslint/no-require-imports */

const { DEFAULT_EXPORT, NO_RESOURCES, exportDocument, exportFileName, missingResources, planExport } = renderer;

const rect = (id: string, x: number, fill: string, extra: Partial<ShapeLayer> = {}): ShapeLayer => ({
  id,
  name: id,
  type: 'shape',
  shape: 'rectangle',
  fill,
  x,
  y: 0,
  width: 20,
  height: 20,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  ...extra,
});

const doc = (layers: Layer[], background: GraphicDocument['background'] = 'transparent'): GraphicDocument => ({
  formatVersion: 1,
  id: 'd',
  name: 'Affiche: été/2026',
  width: 40,
  height: 20,
  background,
  layers,
  createdAt: 0,
  updatedAt: 0,
});

function decode(bytes: Uint8Array) {
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
  if (!image) throw new Error('fichier exporté illisible');
  return image;
}
function pixel(image: ReturnType<typeof decode>, x: number, y: number): number[] {
  const p = image.readPixels(x, y, { width: 1, height: 1, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
  if (!p) throw new Error('lecture impossible');
  return Array.from(p);
}
const near = (actual: number[], expected: number[], tolerance: number) =>
  actual.every((v, i) => Math.abs(v - (expected[i] ?? 0)) <= tolerance);

describe('export PNG', () => {
  it('produit un vrai PNG aux dimensions exactes, transparence et calques visibles seulement', () => {
    const d = doc([rect('rouge', 0, '#FF0000'), rect('cache', 20, '#00FF00', { visible: false })]);
    const result = exportDocument(d, DEFAULT_EXPORT, NO_RESOURCES);
    expect(Array.from(result.bytes.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]); // signature PNG
    expect(result).toMatchObject({ width: 40, height: 20, mimeType: 'image/png', fileName: 'Affiche- été-2026.png' });
    const image = decode(result.bytes);
    expect([image.width(), image.height()]).toEqual([40, 20]);
    expect(pixel(image, 10, 10)).toEqual([255, 0, 0, 255]);
    expect(pixel(image, 30, 10)).toEqual([0, 0, 0, 0]); // calque masqué absent, fond transparent conservé
  });

  it('respecte l’ordre, l’opacité, la rotation et l’échelle', () => {
    const d = doc(
      [rect('bas', 0, '#0000FF', { width: 40 }), rect('haut', 0, '#FFFFFF', { opacity: 0.5 }), rect('tourne', 20, '#00FF00', { x: 20, rotation: 45, width: 10, height: 10, y: 5 })],
      'black',
    );
    const image = decode(exportDocument(d, { ...DEFAULT_EXPORT, scale: 2 }, NO_RESOURCES).bytes);
    expect([image.width(), image.height()]).toEqual([80, 40]);
    expect(near(pixel(image, 20, 20), [128, 128, 255, 255], 2)).toBe(true); // blanc à 50 % sur bleu
    expect(pixel(image, 50, 20)).toEqual([0, 255, 0, 255]); // centre du carré tourné
    expect(pixel(image, 41, 11)).toEqual([0, 0, 255, 255]); // coin de la boîte non tournée : hors du losange
  });
});

describe('export JPEG', () => {
  it('pose la couleur de fond choisie sous un document transparent', () => {
    const d = doc([rect('rouge', 0, '#FF0000')]);
    const result = exportDocument(d, { ...DEFAULT_EXPORT, format: 'jpeg', quality: 95, matte: '#FFFFFF' }, NO_RESOURCES);
    expect(Array.from(result.bytes.slice(0, 3))).toEqual([0xff, 0xd8, 0xff]); // signature JPEG
    expect(result.fileName).toBe('Affiche- été-2026.jpg');
    const image = decode(result.bytes);
    expect(near(pixel(image, 30, 10), [255, 255, 255, 255], 6)).toBe(true);
    expect(near(pixel(image, 5, 10), [255, 0, 0, 255], 12)).toBe(true);
  });

  it('une qualité plus basse donne un fichier plus léger', () => {
    const d = doc([rect('a', 0, '#336699'), rect('b', 20, '#CC9933')], 'white');
    const high = exportDocument(d, { ...DEFAULT_EXPORT, format: 'jpeg', quality: 100 }, NO_RESOURCES).bytes.length;
    const low = exportDocument(d, { ...DEFAULT_EXPORT, format: 'jpeg', quality: 10 }, NO_RESOURCES).bytes.length;
    expect(low).toBeLessThan(high);
  });
});

describe('garde-fous', () => {
  it('refuse une taille au-delà des limites de l’appareil, et une qualité invalide', () => {
    const big = { width: 4096, height: 4096, background: 'white' as const };
    expect(planExport(big, DEFAULT_EXPORT).error).toBeNull();
    expect(planExport(big, { ...DEFAULT_EXPORT, scale: 2 }).error).toMatch(/dépasse la limite/);
    expect(planExport(big, { ...DEFAULT_EXPORT, format: 'jpeg', quality: 0 }).error).toMatch(/qualité/);
    expect(planExport({ ...big, background: 'transparent' }, { ...DEFAULT_EXPORT, format: 'jpeg' }).losesTransparency).toBe(true);
    expect(() => exportDocument({ ...doc([]), width: 4096, height: 4096 }, { ...DEFAULT_EXPORT, scale: 3 }, NO_RESOURCES)).toThrow(/dépasse/);
  });

  it('n’omet jamais en silence un texte sans police ou une image non décodée', () => {
    const image: Layer = { ...rect('photo', 0, '#000000'), type: 'image', asset: { uri: 'file:///x.jpg', originalUri: 'file:///x', width: 1, height: 1, originalWidth: 1, originalHeight: 1, fileName: null } } as Layer;
    const hidden = { ...image, id: 'h', name: 'cachée', visible: false } as Layer;
    expect(missingResources(doc([image, hidden]), NO_RESOURCES)).toEqual(['photo']);
    expect(() => exportDocument(doc([image]), DEFAULT_EXPORT, NO_RESOURCES)).toThrow(/pas encore prêts : photo/);
  });

  it('nomme le fichier sans caractères interdits', () => {
    expect(exportFileName('  ..Mon/projet* ', 'png')).toBe('Mon-projet-.png');
    expect(exportFileName('', 'jpeg')).toBe('Sans titre.jpg');
  });
});
