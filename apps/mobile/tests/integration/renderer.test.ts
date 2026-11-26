/**
 * @jest-environment @shopify/react-native-skia/jestEnv.js
 */
// Moteur de rendu exécuté avec le vrai Skia (CanvasKit) : on vérifie les pixels.
import type * as SkiaModule from '@shopify/react-native-skia';

import type { DrawableDocument } from '@/engine/renderer';

jest.mock('@shopify/react-native-skia', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Mock } = require('@shopify/react-native-skia/lib/module/mock');
  return Mock((globalThis as unknown as { CanvasKit: unknown }).CanvasKit);
});

/* eslint-disable @typescript-eslint/no-require-imports */
const { Skia, AlphaType, ColorType } = require('@shopify/react-native-skia') as typeof SkiaModule;
const renderer = require('@/engine/renderer') as typeof import('@/engine/renderer');
/* eslint-enable @typescript-eslint/no-require-imports */

type Image = ReturnType<typeof renderer.renderDocumentToImage>;

function pixelAt(image: Image, x: number, y: number): number[] {
  const pixels = image.readPixels(x, y, {
    width: 1,
    height: 1,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels) throw new Error('lecture des pixels impossible');
  return Array.from(pixels);
}

const doc = (background: DrawableDocument['background'], width = 40, height = 30): DrawableDocument => ({
  width,
  height,
  background,
});

describe('rendu du document', () => {
  it.each([
    ['white', [255, 255, 255, 255]],
    ['black', [0, 0, 0, 255]],
    ['transparent', [0, 0, 0, 0]],
  ] as const)('fond %s : pixels exacts, aux coins comme au centre', (background, expected) => {
    const image = renderer.renderDocumentToImage(doc(background));
    expect(image.width()).toBe(40);
    expect(image.height()).toBe(30);
    for (const [x, y] of [
      [0, 0],
      [39, 29],
      [20, 15],
    ] as const) {
      expect(pixelAt(image, x, y)).toEqual(expected);
    }
  });

  it("n'ajoute pas le damier de transparence dans l'image rendue", () => {
    const image = renderer.renderDocumentToImage(doc('transparent', 64, 64));
    const alphas = new Set<number>();
    for (let i = 0; i < 64; i += 7) alphas.add(pixelAt(image, i, i)[3] ?? -1);
    expect([...alphas]).toEqual([0]);
  });

  it('rend à une échelle donnée (vignettes, export réduit)', () => {
    const image = renderer.renderDocumentToImage(doc('white', 1000, 500), { scale: 0.1 });
    expect([image.width(), image.height()]).toEqual([100, 50]);
    expect(pixelAt(image, 99, 49)).toEqual([255, 255, 255, 255]);
  });

  it('refuse un rendu qui dépasserait le budget mémoire', () => {
    expect(() => renderer.renderDocumentToImage(doc('white', 4096, 4096), { scale: 2 })).toThrow(
      'dépasse la limite mémoire',
    );
  });

  it('enregistre une Picture rejouable identique au rendu direct', () => {
    const picture = renderer.recordDocumentPicture(doc('black', 20, 10));
    const surface = Skia.Surface.Make(20, 10);
    if (!surface) throw new Error('surface indisponible');
    surface.getCanvas().drawPicture(picture);
    surface.flush();
    expect(pixelAt(surface.makeImageSnapshot(), 10, 5)).toEqual([0, 0, 0, 255]);
  });
});

describe('damier de transparence', () => {
  it('alterne les deux tons case par case et se répète', () => {
    const shader = renderer.createCheckerShader(4, '#FFFFFF', '#000000');
    const surface = Skia.Surface.Make(16, 16);
    if (!surface) throw new Error('surface indisponible');
    const paint = Skia.Paint();
    paint.setShader(shader);
    surface.getCanvas().drawRect(Skia.XYWHRect(0, 0, 16, 16), paint);
    surface.flush();
    const image = surface.makeImageSnapshot();
    const white = [255, 255, 255, 255];
    const black = [0, 0, 0, 255];
    expect(pixelAt(image, 1, 1)).toEqual(white);
    expect(pixelAt(image, 5, 1)).toEqual(black);
    expect(pixelAt(image, 5, 5)).toEqual(white);
    expect(pixelAt(image, 9, 9)).toEqual(white); // case répétée
    expect(pixelAt(image, 13, 9)).toEqual(black);
  });

  it('adapte la taille des cases à la taille du document', () => {
    expect(renderer.checkerCellFor({ width: 100, height: 100 })).toBe(8);
    expect(renderer.checkerCellFor({ width: 4000, height: 2000 })).toBe(50);
  });
});
