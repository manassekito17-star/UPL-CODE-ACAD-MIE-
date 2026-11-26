/**
 * @jest-environment @shopify/react-native-skia/jestEnv.js
 */
// Vérifie que la pile Skia installée fonctionne réellement : CanvasKit (le
// même moteur C++ Skia que sur Android et iOS, compilé en WebAssembly) dessine
// hors écran et encode un PNG. Ce test sert de socle aux futurs tests du
// moteur de rendu (phase 3) et de l'export PNG (phase 8).
import type * as SkiaModule from '@shopify/react-native-skia';

jest.mock('@shopify/react-native-skia', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Mock } = require('@shopify/react-native-skia/lib/module/mock');
  return Mock((globalThis as unknown as { CanvasKit: unknown }).CanvasKit);
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Skia, AlphaType, ColorType, ImageFormat } = require('@shopify/react-native-skia') as typeof SkiaModule;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe('Skia hors écran', () => {
  it('dessine sur une surface transparente et relit les pixels', () => {
    const surface = Skia.Surface.Make(40, 20);
    expect(surface).not.toBeNull();
    if (!surface) return;

    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('transparent'));
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#3685FF'));
    canvas.drawRect(Skia.XYWHRect(0, 0, 20, 20), paint);
    surface.flush();

    const image = surface.makeImageSnapshot();
    expect(image.width()).toBe(40);
    expect(image.height()).toBe(20);

    const pixels = image.readPixels(0, 0, {
      width: 40,
      height: 20,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    });
    expect(pixels).not.toBeNull();
    if (!pixels) return;
    const at = (x: number, y: number) => Array.from(pixels.slice((y * 40 + x) * 4, (y * 40 + x) * 4 + 4));

    // Moitié gauche : bleu d'accent opaque. Moitié droite : transparence conservée.
    expect(at(5, 10)).toEqual([0x36, 0x85, 0xff, 255]);
    expect(at(30, 10)).toEqual([0, 0, 0, 0]);
  });

  it('encode un PNG valide', () => {
    const surface = Skia.Surface.Make(8, 8);
    if (!surface) throw new Error('Surface Skia indisponible');
    surface.getCanvas().clear(Skia.Color('white'));
    const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.PNG, 100);
    expect(Array.from(bytes.slice(0, 8))).toEqual(PNG_SIGNATURE);

    const decoded = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
    expect(decoded?.width()).toBe(8);
    expect(decoded?.height()).toBe(8);
  });
});
