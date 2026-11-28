import {
  DEFAULT_GRID,
  MAX_GUIDES,
  addGuide,
  boundsOf,
  clearGuides,
  gridLines,
  hitGuide,
  isGuideDroppedOutside,
  moveGuide,
  removeGuide,
  snapGuidePosition,
  snapMove,
  snapTargets,
  validateGrid,
  validateGuidePosition,
  type Guide,
} from '@/engine/guides';

const doc = (guides: Guide[] = []) => ({ width: 1000, height: 500, guides });
const h = (id: string, position: number): Guide => ({ id, orientation: 'horizontal', position });
const v = (id: string, position: number): Guide => ({ id, orientation: 'vertical', position });

describe('repères : opérations', () => {
  it('ajoute (arrondi au pixel), déplace, retire et efface sans muter le document', () => {
    const d0 = doc();
    const d1 = addGuide(d0, h('a', 120.6));
    expect(d0.guides).toEqual([]);
    expect(d1.guides).toEqual([h('a', 121)]);
    const d2 = moveGuide(addGuide(d1, v('b', 40)), 'b', 300.2);
    expect(d2.guides).toEqual([h('a', 121), v('b', 300)]);
    expect(removeGuide(d2, 'a').guides).toEqual([v('b', 300)]);
    expect(clearGuides(d2).guides).toEqual([]);
  });

  it('renvoie le même document quand rien ne change (pas d’étape d’historique)', () => {
    const d = doc([h('a', 10)]);
    expect(moveGuide(d, 'a', 10.2)).toBe(d);
    expect(moveGuide(d, 'inconnu', 50)).toBe(d);
    expect(removeGuide(d, 'inconnu')).toBe(d);
    expect(clearGuides(doc())).toEqual(doc());
    expect(addGuide(d, h('x', Number.NaN))).toBe(d);
  });

  it('limite le nombre de repères et leur position', () => {
    const full = doc(Array.from({ length: MAX_GUIDES }, (_, i) => h(`g${i}`, i)));
    expect(addGuide(full, h('trop', 1))).toBe(full);
    expect(validateGuidePosition(250)).toBeNull();
    expect(validateGuidePosition(-30)).toBeNull();
    expect(validateGuidePosition(Number.NaN)).toMatch(/nombre/);
    expect(validateGuidePosition(1e9)).toMatch(/entre/);
  });

  it('retire un repère relâché hors du document (bords compris dedans)', () => {
    const size = { width: 1000, height: 500 };
    expect(isGuideDroppedOutside('horizontal', 0, size)).toBe(false);
    expect(isGuideDroppedOutside('horizontal', 500, size)).toBe(false);
    expect(isGuideDroppedOutside('horizontal', 501, size)).toBe(true);
    expect(isGuideDroppedOutside('vertical', 900, size)).toBe(false);
    expect(isGuideDroppedOutside('vertical', -1, size)).toBe(true);
  });
});

describe('repères : atteinte', () => {
  it('trouve le repère le plus proche à moins de 8 points écran', () => {
    const guides = [h('a', 100), v('b', 200), h('c', 106)];
    // Échelle 1 : 8 px du document.
    expect(hitGuide(guides, 50, 104, 1)?.id).toBe('c');
    expect(hitGuide(guides, 205, 0, 1)?.id).toBe('b');
    expect(hitGuide(guides, 50, 120, 1)).toBeNull();
    // Échelle 0,5 : 16 px du document.
    expect(hitGuide(guides, 50, 120, 0.5)?.id).toBe('c');
  });
});

describe('magnétisme', () => {
  const targets = snapTargets({ width: 1000, height: 500 }, [v('b', 300), h('a', 100)], null);

  it('cibles : bords et centre du document, puis repères', () => {
    expect(targets.xs).toEqual([0, 500, 1000, 300]);
    expect(targets.ys).toEqual([0, 250, 500, 100]);
    expect(snapTargets({ width: 10, height: 10 }, null, null).xs).toEqual([0, 5, 10]);
  });

  it('aligne le bord le plus proche dans la tolérance, sinon ne touche à rien', () => {
    // Bord gauche à 305 → repère 300 ; haut à 96 → repère 100.
    const r = snapMove({ x: 305, y: 96, width: 50, height: 40, rotation: 0 }, targets, 1);
    expect(r).toEqual({ dx: -5, dy: 4, lineX: 300, lineY: 100 });
    // Centre horizontal (473 + 25 = 498) → centre du document 500.
    expect(snapMove({ x: 473, y: 200, width: 50, height: 10, rotation: 0 }, targets, 1)).toMatchObject({ dx: 2, lineX: 500 });
    // Trop loin à l'échelle 1 (15 px), atteint à l'échelle 0,5 (16 px de tolérance).
    const far = { x: 315, y: 200, width: 50, height: 10, rotation: 0 };
    expect(snapMove(far, targets, 1)).toMatchObject({ dx: 0, lineX: null });
    expect(snapMove(far, targets, 0.5)).toMatchObject({ dx: -15, lineX: 300 });
  });

  it('tient compte de la rotation (boîte englobante) et de la grille affichée', () => {
    const b = boundsOf({ x: 0, y: 0, width: 100, height: 20, rotation: 90 });
    expect(b.left).toBeCloseTo(40);
    expect(b.top).toBeCloseTo(-40);
    const withGrid = snapTargets({ width: 1000, height: 500 }, [], { spacing: 100, subdivisions: 4 });
    // Pas de 25 px : bord gauche 127 → 125.
    expect(snapMove({ x: 127, y: 200, width: 30, height: 30, rotation: 0 }, withGrid, 1)).toMatchObject({ dx: -2, lineX: 125 });
  });

  it('attire un repère glissé vers les bords, le centre et la grille', () => {
    const size = { width: 1000, height: 500 };
    expect(snapGuidePosition('horizontal', 246, size, null, 1)).toBe(250);
    expect(snapGuidePosition('vertical', 995, size, null, 1)).toBe(1000);
    expect(snapGuidePosition('vertical', 640, size, null, 1)).toBe(640);
    expect(snapGuidePosition('vertical', 644, size, DEFAULT_GRID, 1)).toBe(650); // pas de 25 px
  });
});

describe('grille', () => {
  it('produit les lignes principales et les subdivisions', () => {
    expect(gridLines(250, { spacing: 100, subdivisions: 4 })).toEqual({ major: [0, 100, 200], minor: [25, 50, 75, 125, 150, 175, 225, 250] });
    expect(gridLines(100, { spacing: 50, subdivisions: 1 })).toEqual({ major: [0, 50, 100], minor: [] });
  });

  it('abandonne les subdivisions trop denses', () => {
    const lines = gridLines(10000, { spacing: 2, subdivisions: 2 });
    expect(lines.minor).toEqual([]);
    expect(lines.major).toHaveLength(5001);
  });

  it('valide les réglages', () => {
    expect(validateGrid(DEFAULT_GRID)).toBeNull();
    expect(validateGrid({ spacing: 1, subdivisions: 4 })).toMatch(/pas/);
    expect(validateGrid({ spacing: 100, subdivisions: 0 })).toMatch(/subdivisions/);
    expect(validateGrid({ spacing: 100, subdivisions: 2.5 })).toMatch(/subdivisions/);
  });
});
