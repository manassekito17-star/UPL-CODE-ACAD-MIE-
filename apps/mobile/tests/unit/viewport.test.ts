import { oneFingerMovesView, resolveGestureTarget } from '@/engine/canvas/gestures';
import {
  FIT_PADDING,
  MIN_VISIBLE,
  clampPan,
  documentToScreen,
  fitToViewport,
  isFitted,
  panBy,
  scaleForPercent,
  screenToDocument,
  zoomAt,
  zoomLimits,
  zoomPercent,
  zoomTo,
  type ViewTransform,
} from '@/engine/transformations';

const view = { width: 400, height: 600 };
const doc = { width: 1920, height: 1080 };
const wide = { min: 0.001, max: 1000 };

describe('conversions document ↔ écran', () => {
  const t: ViewTransform = { scale: 0.5, x: 30, y: -12 };

  it('sont réciproques', () => {
    for (const p of [
      { x: 0, y: 0 },
      { x: 1919, y: 1079 },
      { x: 123.4, y: 567.8 },
    ]) {
      const back = screenToDocument(t, documentToScreen(t, p));
      expect(back.x).toBeCloseTo(p.x, 9);
      expect(back.y).toBeCloseTo(p.y, 9);
    }
  });

  it("appliquent l'échelle puis la translation", () => {
    expect(documentToScreen(t, { x: 100, y: 100 })).toEqual({ x: 80, y: 38 });
  });
});

describe('ajustement à l’écran', () => {
  it('fait tenir tout le document avec la marge, centré', () => {
    const fit = fitToViewport(doc, view);
    expect(fit.scale).toBeCloseTo((400 - 2 * FIT_PADDING) / 1920, 9);
    const topLeft = documentToScreen(fit, { x: 0, y: 0 });
    const bottomRight = documentToScreen(fit, { x: doc.width, y: doc.height });
    expect(topLeft.x).toBeCloseTo(FIT_PADDING, 9);
    expect(bottomRight.x).toBeCloseTo(400 - FIT_PADDING, 9);
    expect((topLeft.y + bottomRight.y) / 2).toBeCloseTo(300, 9);
  });

  it('utilise le côté contraignant (document vertical dans une vue large)', () => {
    const fit = fitToViewport({ width: 1080, height: 1920 }, { width: 1000, height: 500 });
    expect(fit.scale).toBeCloseTo((500 - 2 * FIT_PADDING) / 1920, 9);
  });

  it('évite les zones recouvertes par l’interface', () => {
    const insets = { top: 60, right: 0, bottom: 20, left: 0 };
    const fit = fitToViewport({ width: 100, height: 100 }, { width: 1000, height: 400 }, FIT_PADDING, insets);
    // Hauteur libre : 400 − 60 − 20 = 320, moins 2 × 24 de marge = 272.
    expect(fit.scale).toBeCloseTo(2.72, 9);
    const top = documentToScreen(fit, { x: 0, y: 0 }).y;
    const bottom = documentToScreen(fit, { x: 0, y: 100 }).y;
    expect(top).toBeCloseTo(60 + FIT_PADDING, 9);
    expect(bottom).toBeCloseTo(400 - 20 - FIT_PADDING, 9);
  });

  it('agrandit un tout petit document', () => {
    expect(fitToViewport({ width: 10, height: 10 }, view).scale).toBeCloseTo(35.2, 9);
  });

  it('reconnaît l’état ajusté', () => {
    const fit = fitToViewport(doc, view);
    expect(isFitted(fit, fit)).toBe(true);
    expect(isFitted(panBy(fit, 5, 0), fit)).toBe(false);
    expect(isFitted({ ...fit, scale: fit.scale * 1.1 }, fit)).toBe(false);
  });
});

describe('zoom', () => {
  it('garde immobile le point du document sous le doigt', () => {
    const t: ViewTransform = { scale: 0.3, x: 12, y: 40 };
    const focal = { x: 210, y: 333 };
    const before = screenToDocument(t, focal);
    const zoomed = zoomAt(t, 2.5, focal, wide);
    expect(zoomed.scale).toBeCloseTo(0.75, 9);
    const after = screenToDocument(zoomed, focal);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
  });

  it('respecte les bornes sans dériver', () => {
    const limits = { min: 0.1, max: 2 };
    const t: ViewTransform = { scale: 1, x: 0, y: 0 };
    expect(zoomAt(t, 100, { x: 50, y: 50 }, limits).scale).toBe(2);
    expect(zoomAt(t, 0.001, { x: 50, y: 50 }, limits).scale).toBe(0.1);
    // Au maximum, continuer à pincer ne déplace pas la vue.
    const atMax = zoomAt(t, 100, { x: 50, y: 50 }, limits);
    expect(zoomAt(atMax, 3, { x: 200, y: 10 }, limits)).toEqual(atMax);
  });

  it('va du quart de l’ajustement jusqu’à 32 pixels physiques par pixel du document', () => {
    expect(zoomLimits(0.2, 2)).toEqual({ min: 0.05, max: 16 });
    // Document minuscule : on peut toujours zoomer au-delà de l'ajustement.
    expect(zoomLimits(40, 3).max).toBe(80);
  });

  it('exprime 100 % en pixels physiques', () => {
    expect(zoomPercent(0.5, 2)).toBe(100);
    expect(scaleForPercent(100, 3)).toBeCloseTo(1 / 3, 9);
    const t = zoomTo({ scale: 0.2, x: 0, y: 0 }, scaleForPercent(100, 2), { x: 0, y: 0 }, wide);
    expect(zoomPercent(t.scale, 2)).toBeCloseTo(100, 9);
  });
});

describe('déplacement de la vue', () => {
  const fit = fitToViewport(doc, view);

  it('déplace de la distance du doigt', () => {
    expect(panBy(fit, 10, -4)).toEqual({ scale: fit.scale, x: fit.x + 10, y: fit.y - 4 });
  });

  it('ne laisse jamais le document sortir entièrement de la vue', () => {
    const zoomed: ViewTransform = { scale: 1, x: 0, y: 0 };
    const farLeft = clampPan(panBy(zoomed, -100_000, 0), doc, view);
    expect(farLeft.x + doc.width * zoomed.scale).toBeCloseTo(MIN_VISIBLE, 9);
    const farRight = clampPan(panBy(zoomed, 100_000, 0), doc, view);
    expect(farRight.x).toBeCloseTo(view.width - MIN_VISIBLE, 9);
    const farDown = clampPan(panBy(zoomed, 0, 100_000), doc, view);
    expect(farDown.y).toBeCloseTo(view.height - MIN_VISIBLE, 9);
  });

  it('garde visible un document plus petit que la marge minimale', () => {
    const tiny: ViewTransform = { scale: 1, x: -500, y: 0 };
    const kept = clampPan(tiny, { width: 10, height: 10 }, view);
    expect(kept.x).toBe(0);
  });

  it("ne modifie pas une vue déjà valable", () => {
    expect(clampPan(fit, doc, view)).toEqual(fit);
  });
});

describe('arbitrage des gestes', () => {
  it('deux doigts agissent toujours sur la vue, quel que soit l’outil', () => {
    for (const tool of ['select', 'pan', 'text', 'shape', 'image'] as const) {
      expect(resolveGestureTarget({ pointers: 2, tool, hitEditableLayer: true })).toBe('view');
    }
  });

  it('avec l’outil Vue, un doigt déplace la vue même sur un calque', () => {
    expect(resolveGestureTarget({ pointers: 1, tool: 'pan', hitEditableLayer: true })).toBe('view');
    expect(oneFingerMovesView('pan')).toBe(true);
  });

  it('avec l’outil Sélection, un doigt n’agit que sur un calque modifiable touché', () => {
    expect(resolveGestureTarget({ pointers: 1, tool: 'select', hitEditableLayer: true })).toBe('layer');
    expect(resolveGestureTarget({ pointers: 1, tool: 'select', hitEditableLayer: false })).toBe('none');
    expect(oneFingerMovesView('select')).toBe(false);
  });
});
