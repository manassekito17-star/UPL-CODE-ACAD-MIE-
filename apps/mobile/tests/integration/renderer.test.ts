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

const rect = (over: Partial<import('@/engine/layers').ShapeLayer> = {}): import('@/engine/layers').ShapeLayer => ({
  id: 'r',
  type: 'shape',
  shape: 'rectangle',
  name: 'R',
  x: 10,
  y: 10,
  width: 20,
  height: 10,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#FF0000',
  ...over,
});

describe('rendu des calques', () => {
  const RED = [255, 0, 0, 255];
  const WHITE = [255, 255, 255, 255];

  it('place un rectangle à sa position exacte', () => {
    const image = renderer.renderDocumentToImage({ ...doc('white', 40, 30), layers: [rect()] });
    expect(pixelAt(image, 10, 10)).toEqual(RED);
    expect(pixelAt(image, 29, 19)).toEqual(RED);
    expect(pixelAt(image, 9, 10)).toEqual(WHITE);
    expect(pixelAt(image, 30, 15)).toEqual(WHITE);
    expect(pixelAt(image, 15, 20)).toEqual(WHITE);
  });

  it('tourne autour du centre (90° : la boîte 20 × 10 devient 10 × 20)', () => {
    // Centre (20, 15) : après rotation la boîte couvre x ∈ [15, 25], y ∈ [5, 25].
    const image = renderer.renderDocumentToImage({ ...doc('white', 40, 30), layers: [rect({ rotation: 90 })] });
    expect(pixelAt(image, 20, 6)).toEqual(RED);
    expect(pixelAt(image, 20, 24)).toEqual(RED);
    expect(pixelAt(image, 12, 15)).toEqual(WHITE);
    expect(pixelAt(image, 28, 15)).toEqual(WHITE);
  });

  it("applique l'opacité au calque entier", () => {
    const image = renderer.renderDocumentToImage({ ...doc('transparent'), layers: [rect({ opacity: 0.5 })] });
    const [r, g, b, a] = pixelAt(image, 15, 15);
    expect([r, g, b]).toEqual([255, 0, 0]);
    expect(a).toBeGreaterThanOrEqual(126);
    expect(a).toBeLessThanOrEqual(129);
  });

  it("n'affiche pas un calque masqué ni un calque d'opacité nulle", () => {
    for (const layer of [rect({ visible: false }), rect({ opacity: 0 })]) {
      const image = renderer.renderDocumentToImage({ ...doc('white'), layers: [layer] });
      expect(pixelAt(image, 15, 15)).toEqual(WHITE);
    }
  });

  it("respecte l'ordre : le calque du haut recouvre celui du bas", () => {
    const bottom = rect({ id: 'b', fill: '#FF0000' });
    const top = rect({ id: 't', fill: '#0000FF', x: 20 });
    const image = renderer.renderDocumentToImage({ ...doc('white'), layers: [bottom, top] });
    expect(pixelAt(image, 15, 15)).toEqual(RED);
    expect(pixelAt(image, 25, 15)).toEqual([0, 0, 255, 255]);
    const swapped = renderer.renderDocumentToImage({ ...doc('white'), layers: [top, bottom] });
    expect(pixelAt(swapped, 25, 15)).toEqual(RED);
  });

  it("l'écran (fond + contenus de calques placés par leur matrice) produit exactement l'image de l'export", () => {
    const layers = [
      rect({ id: 'a', x: 3, y: 4, width: 25, height: 12, rotation: 33, fill: '#12A0F0' }),
      rect({ id: 'b', x: 15, y: 9, width: 18, height: 18, rotation: -70, opacity: 0.6, fill: '#F0C010' }),
      rect({ id: 'c', x: 0, y: 0, width: 10, height: 10, visible: false }),
    ];
    const d = { ...doc('white', 48, 36), layers };
    const exported = renderer.renderDocumentToImage(d);

    // Composition de l'écran, telle que DocumentCanvas l'assemble avec des groupes Skia.
    const surface = Skia.Surface.Make(48, 36);
    if (!surface) throw new Error('surface indisponible');
    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('transparent'));
    canvas.drawPicture(renderer.recordBackgroundPicture(d));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { layerMatrix } = require('@/engine/layers') as typeof import('@/engine/layers');
    for (const layer of layers.filter((l) => l.visible)) {
      canvas.save();
      canvas.concat(layerMatrix(layer));
      const paint = renderer.opacityPaint(layer.opacity);
      if (paint) canvas.saveLayer(paint);
      canvas.drawPicture(renderer.recordLayerContentPicture(layer));
      if (paint) canvas.restore();
      canvas.restore();
    }
    surface.flush();
    const screen = surface.makeImageSnapshot();

    const read = (img: Image) =>
      Array.from(
        img.readPixels(0, 0, { width: 48, height: 36, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul }) ?? [],
      );
    expect(read(screen)).toEqual(read(exported));
  });
});

describe('formes, texte et image', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const fontDir = path.join(__dirname, '../../node_modules/@expo-google-fonts/inter');
  const fonts = Skia.TypefaceFontProvider.Make();
  for (const file of ['400Regular/Inter_400Regular.ttf', '700Bold/Inter_700Bold.ttf']) {
    const face = Skia.Typeface.MakeFreeTypeFaceFromData(Skia.Data.fromBytes(new Uint8Array(fs.readFileSync(path.join(fontDir, file)))));
    if (!face) throw new Error(`police illisible : ${file}`);
    fonts.registerFont(face, renderer.TEXT_FONT_FAMILY);
  }
  const resources = (images: Map<string, ReturnType<typeof renderer.renderDocumentToImage>> = new Map()) => ({ fonts, images });

  const base = { id: 'l', name: 'L', x: 0, y: 0, rotation: 0, opacity: 1, visible: true, locked: false };
  const RED = [255, 0, 0, 255];
  const WHITE = [255, 255, 255, 255];

  it('dessine un cercle inscrit dans la boîte (coins vides)', () => {
    const ellipse = { ...base, type: 'shape' as const, shape: 'ellipse' as const, width: 40, height: 40, fill: '#FF0000' };
    const image = renderer.renderDocumentToImage({ ...doc('white', 40, 40), layers: [ellipse] });
    expect(pixelAt(image, 20, 20)).toEqual(RED);
    expect(pixelAt(image, 2, 2)).toEqual(WHITE);
    expect(pixelAt(image, 37, 37)).toEqual(WHITE);
  });

  it('dessine une ligne aux extrémités arrondies', () => {
    const line = { ...base, type: 'shape' as const, shape: 'line' as const, width: 40, height: 10, fill: '#FF0000' };
    const image = renderer.renderDocumentToImage({ ...doc('white', 40, 10), layers: [line] });
    expect(pixelAt(image, 20, 5)).toEqual(RED);
    expect(pixelAt(image, 0, 0)).toEqual(WHITE); // coin arrondi
  });

  it("dessine l'image décodée redimensionnée dans la boîte du calque, et rien si elle n'est pas chargée", () => {
    // Image source 4 × 2 : moitié gauche rouge, moitié droite bleue.
    const src = Skia.Surface.Make(4, 2);
    if (!src) throw new Error('surface indisponible');
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#FF0000'));
    src.getCanvas().drawRect(Skia.XYWHRect(0, 0, 2, 2), paint);
    paint.setColor(Skia.Color('#0000FF'));
    src.getCanvas().drawRect(Skia.XYWHRect(2, 0, 2, 2), paint);
    src.flush();
    const png = src.makeImageSnapshot().encodeToBytes();
    const decoded = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(png));
    if (!decoded) throw new Error('décodage impossible');

    const asset = { uri: 'file:///work.png', width: 4, height: 2, originalUri: 'file:///orig.heic', originalWidth: 4, originalHeight: 2, fileName: 'photo.heic' };
    const layer = { ...base, type: 'image' as const, width: 40, height: 20, asset };
    const d = { ...doc('white', 40, 20), layers: [layer] };
    const image = renderer.renderDocumentToImage(d, { resources: resources(new Map([[asset.uri, decoded]])) });
    expect(pixelAt(image, 5, 10)).toEqual(RED);
    expect(pixelAt(image, 35, 10)).toEqual([0, 0, 255, 255]);

    const notLoaded = renderer.renderDocumentToImage(d, { resources: resources() });
    expect(pixelAt(notLoaded, 5, 10)).toEqual(WHITE);
  });

  const text = (over: Record<string, unknown>) => ({
    ...base,
    type: 'text' as const,
    text: 'HHHH',
    fontSize: 40,
    color: '#000000',
    align: 'left' as const,
    bold: false,
    fontFamily: 'Inter' as const,
    width: 300,
    height: 60,
    ...over,
  });
  const darkColumns = (image: ReturnType<typeof renderer.renderDocumentToImage>) => {
    const columns: number[] = [];
    for (let x = 0; x < 300; x += 2) {
      for (let y = 0; y < 60; y += 2) {
        if ((pixelAt(image, x, y)[0] ?? 255) < 128) {
          columns.push(x);
          break;
        }
      }
    }
    return columns;
  };

  it('écrit un vrai texte avec la police embarquée, aligné à gauche ou à droite', () => {
    const left = darkColumns(renderer.renderDocumentToImage({ ...doc('white', 300, 60), layers: [text({})] }, { resources: resources() }));
    expect(left.length).toBeGreaterThan(10);
    expect(Math.min(...left)).toBeLessThan(10);
    expect(Math.max(...left)).toBeLessThan(150);

    const right = darkColumns(
      renderer.renderDocumentToImage({ ...doc('white', 300, 60), layers: [text({ align: 'right' })] }, { resources: resources() }),
    );
    expect(Math.min(...right)).toBeGreaterThan(150);
    expect(Math.max(...right)).toBeGreaterThan(285);
  });

  it('le gras épaissit les traits ; sans police, rien n’est dessiné', () => {
    const count = (bold: boolean) =>
      darkColumns(renderer.renderDocumentToImage({ ...doc('white', 300, 60), layers: [text({ bold })] }, { resources: resources() })).length;
    expect(count(true)).toBeGreaterThan(count(false));
    const noFont = renderer.renderDocumentToImage({ ...doc('white', 300, 60), layers: [text({})] });
    expect(darkColumns(noFont)).toEqual([]);
  });

  it('mesure la hauteur du texte, retour à la ligne compris', () => {
    const one = renderer.measureTextHeight(text({}), fonts) ?? 0;
    const two = renderer.measureTextHeight(text({ width: 60 }), fonts) ?? 0; // « HHHH » ne tient pas sur une ligne
    expect(one).toBeGreaterThan(40);
    expect(one).toBeLessThan(60);
    expect(two).toBeGreaterThan(one * 1.8);
    expect(renderer.measureTextHeight(text({}), null)).toBeNull();
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
