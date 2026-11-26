import { createDocument, type GraphicDocument } from '@/engine/documents';
import {
  LayerError,
  addLayer,
  createImageLayer,
  createShapeLayer,
  createTextLayer,
  duplicateLayer,
  handlePositions,
  hitHandle,
  normalizeHexColor,
  resizeFromCorner,
  rotateFromPointer,
  setLayerLocked,
  updateLayerStyle,
  type ImageAsset,
  type LayerGeometry,
  type ShapeLayer,
  type TextLayer,
} from '@/engine/layers';

const doc = (background: GraphicDocument['background'] = 'white'): GraphicDocument =>
  createDocument({ width: 1000, height: 500, background, name: 'Doc' }, { id: 'doc', now: 0 });

const asset = (width: number, height: number): ImageAsset => ({
  uri: 'file:///w.jpg',
  width,
  height,
  originalUri: 'file:///o.heic',
  originalWidth: width * 2,
  originalHeight: height * 2,
  fileName: 'o.heic',
});

function code(fn: () => unknown): LayerError['code'] | null {
  try {
    fn();
    return null;
  } catch (e) {
    return e instanceof LayerError ? e.code : null;
  }
}

describe('fabriques', () => {
  it('crée cercle et ligne centrés, numérotés par type', () => {
    const d = doc();
    const circle = createShapeLayer(d, 'ellipse', 'c');
    expect(circle).toMatchObject({ shape: 'ellipse', name: 'Cercle 1', width: 200, height: 200, x: 400, y: 150 });
    const line = createShapeLayer(d, 'line', 'l');
    expect(line).toMatchObject({ shape: 'line', name: 'Ligne 1', width: 600, height: 10, x: 200, y: 245 });
  });

  it('crée un texte modifiable contrasté avec le fond', () => {
    expect(createTextLayer(doc('white'), 't')).toMatchObject({
      type: 'text',
      text: 'Votre texte',
      fontSize: 40,
      color: '#101114',
      align: 'center',
      fontFamily: 'Inter',
      name: 'Texte 1',
    });
    expect(createTextLayer(doc('black'), 't').color).toBe('#FFFFFF');
  });

  it("place une image à sa taille si elle tient, sinon réduite à 80 % du document, proportions gardées", () => {
    expect(createImageLayer(doc(), asset(200, 100), 'i')).toMatchObject({ width: 200, height: 100, x: 400, y: 200 });
    const big = createImageLayer(doc(), asset(4000, 2000), 'i');
    expect(big.width / big.height).toBeCloseTo(2, 2);
    expect(big.width).toBeLessThanOrEqual(800);
    expect(big.height).toBeLessThanOrEqual(400);
  });

  it("une copie d'image partage les fichiers (aucune donnée binaire copiée)", () => {
    const image = createImageLayer(doc(), asset(200, 100), 'i');
    const d = duplicateLayer(addLayer(doc(), image), 'i', 'i2');
    expect(d.layers[1]?.type === 'image' && d.layers[1].asset).toBe(image.asset);
  });
});

describe('styles', () => {
  const withShape = () => addLayer(doc(), createShapeLayer(doc(), 'rectangle', 's'));
  const withText = () => addLayer(doc(), createTextLayer(doc(), 't'));
  const shape = (d: GraphicDocument) => d.layers[0] as ShapeLayer;
  const text = (d: GraphicDocument) => d.layers[0] as TextLayer;

  it('normalise les couleurs saisies', () => {
    expect(normalizeHexColor('3685ff')).toBe('#3685FF');
    expect(normalizeHexColor(' #abcdef ')).toBe('#ABCDEF');
    expect(normalizeHexColor('#12345')).toBeNull();
    expect(normalizeHexColor('bleu')).toBeNull();
  });

  it('change la couleur d’une forme et refuse une couleur invalide', () => {
    expect(shape(updateLayerStyle(withShape(), 's', { color: 'ff0000' })).fill).toBe('#FF0000');
    expect(code(() => updateLayerStyle(withShape(), 's', { color: 'rouge' }))).toBe('invalid');
    expect(code(() => updateLayerStyle(withShape(), 's', { text: 'x' }))).toBe('invalid');
  });

  it('modifie texte, taille, alignement, gras et couleur d’un texte', () => {
    const d = updateLayerStyle(withText(), 't', { text: 'Bonjour', fontSize: 64, align: 'right', bold: false, color: '#3685ff' });
    expect(text(d)).toMatchObject({ text: 'Bonjour', fontSize: 64, align: 'right', bold: false, color: '#3685FF' });
  });

  it('refuse un texte vide, une taille hors bornes, et toute modification d’un calque verrouillé', () => {
    expect(code(() => updateLayerStyle(withText(), 't', { text: '   ' }))).toBe('invalid');
    expect(code(() => updateLayerStyle(withText(), 't', { fontSize: 2 }))).toBe('invalid');
    expect(code(() => updateLayerStyle(withText(), 't', { fontSize: 5000 }))).toBe('invalid');
    expect(code(() => updateLayerStyle(setLayerLocked(withText(), 't', true), 't', { color: '#000000' }))).toBe('locked');
  });

  it("refuse un style sur une image", () => {
    const d = addLayer(doc(), createImageLayer(doc(), asset(10, 10), 'i'));
    expect(code(() => updateLayerStyle(d, 'i', { color: '#000000' }))).toBe('invalid');
  });
});

describe('poignées de transformation', () => {
  const box: LayerGeometry = { x: 100, y: 100, width: 200, height: 100, rotation: 0 };
  const corners = (g: LayerGeometry) => handlePositions(g, 1);
  const close = (a: [number, number], b: [number, number]) => {
    expect(a[0]).toBeCloseTo(b[0], 6);
    expect(a[1]).toBeCloseTo(b[1], 6);
  };

  it('agrandit par le coin bas-droit en gardant le coin haut-gauche fixe', () => {
    const g = resizeFromCorner(box, 'se', 50, 20, false);
    expect(g).toMatchObject({ width: 250, height: 120 });
    close(corners(g).nw, corners(box).nw);
  });

  it('garde le coin opposé fixe même quand le calque est tourné', () => {
    for (const rotation of [30, 90, -135]) {
      const start = { ...box, rotation };
      for (const corner of ['nw', 'ne', 'se', 'sw'] as const) {
        const opposite = ({ nw: 'se', ne: 'sw', se: 'nw', sw: 'ne' } as const)[corner];
        const g = resizeFromCorner(start, corner, 37, -21, false);
        close(corners(g)[opposite], corners(start)[opposite]);
      }
    }
  });

  it('conserve les proportions pour une image et ne descend pas sous la taille minimale', () => {
    const g = resizeFromCorner(box, 'se', 100, 0, true);
    expect(g.width / g.height).toBeCloseTo(2, 9);
    const tiny = resizeFromCorner(box, 'se', -1000, -1000, false);
    expect(tiny.width).toBe(4);
    expect(tiny.height).toBe(4);
  });

  it('tourne autour du centre selon l’angle balayé, aimanté aux multiples de 45°', () => {
    // Centre (200, 150) ; le doigt part à droite du centre et passe en dessous : +90°.
    const g = rotateFromPointer(box, 300, 150, 200, 250);
    expect(g.rotation).toBeCloseTo(90, 9);
    expect([g.x, g.y, g.width, g.height]).toEqual([100, 100, 200, 100]);
    // 88° s'aimante à 90° ; 80° reste à 80°.
    const near = rotateFromPointer(box, 300, 150, 200 + 100 * Math.cos((88 * Math.PI) / 180), 150 + 100 * Math.sin((88 * Math.PI) / 180));
    expect(near.rotation).toBeCloseTo(90, 9);
    const far = rotateFromPointer(box, 300, 150, 200 + 100 * Math.cos((80 * Math.PI) / 180), 150 + 100 * Math.sin((80 * Math.PI) / 180));
    expect(far.rotation).toBeCloseTo(80, 6);
    expect(rotateFromPointer(box, 300, 150, 200 + 100 * Math.cos(1.5358), 150 + 100 * Math.sin(1.5358), false).rotation).toBeCloseTo(88, 1);
  });

  it('place la poignée de rotation au-dessus du bord haut, à distance constante à l’écran', () => {
    expect(corners(box).rotate).toEqual([200, 64]); // 36 points au-dessus du bord (y = 100)
    expect(handlePositions(box, 2).rotate).toEqual([200, 82]); // zoom ×2 : 18 px du document
  });

  it('détecte la poignée touchée avec une tolérance tactile, en priorité la rotation', () => {
    expect(hitHandle(box, 305, 205, 1)).toBe('se');
    expect(hitHandle(box, 200, 70, 1)).toBe('rotate');
    expect(hitHandle(box, 200, 150, 1)).toBeNull();
    // Dézoomé (×0,25), la tolérance de 24 points couvre 96 px du document.
    expect(hitHandle(box, 380, 180, 0.25)).toBe('se');
  });
});
