import { createDocument, type GraphicDocument } from '@/engine/documents';
import {
  DUPLICATE_OFFSET,
  LayerError,
  addLayer,
  bringForward,
  bringToFront,
  containsPoint,
  copyName,
  createRectangleLayer,
  duplicateLayer,
  hitTest,
  layerMatrix,
  layerOrder,
  moveLayerTo,
  nextLayerName,
  normalizeRotation,
  removeLayer,
  renameLayer,
  sendBackward,
  sendToBack,
  setLayerLocked,
  setLayerOpacity,
  setLayerVisibility,
  translateLayer,
  updateLayerGeometry,
  type ShapeLayer,
} from '@/engine/layers';

const baseDoc = (): GraphicDocument =>
  createDocument({ width: 1000, height: 500, background: 'white', name: 'Doc' }, { id: 'doc', now: 0 });

function docWith(...ids: string[]): GraphicDocument {
  let doc = baseDoc();
  for (const id of ids) doc = addLayer(doc, { ...createRectangleLayer(doc, id), name: id.toUpperCase() });
  return doc;
}
const ids = (doc: GraphicDocument) => doc.layers.map((l) => l.id);
const layer = (doc: GraphicDocument, id: string) => doc.layers.find((l) => l.id === id) as ShapeLayer;

function expectLayerError(fn: () => unknown, code: LayerError['code']) {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(LayerError);
    expect((error as LayerError).code).toBe(code);
    return;
  }
  throw new Error('Une LayerError était attendue.');
}

describe('création', () => {
  it('crée un rectangle centré de 40 % du plus petit côté, avec toutes les propriétés exigées', () => {
    const r = createRectangleLayer(baseDoc(), 'r1');
    expect(r).toEqual({
      id: 'r1',
      type: 'shape',
      shape: 'rectangle',
      name: 'Rectangle 1',
      x: 400,
      y: 150,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fill: '#3685FF',
    });
  });

  it('numérote les noms avec le premier numéro libre', () => {
    const doc = { layers: [{ name: 'Rectangle 1' }, { name: 'Rectangle 3' }] } as unknown as GraphicDocument;
    expect(nextLayerName(doc, 'Rectangle')).toBe('Rectangle 2');
  });
});

describe('ajout et ordre', () => {
  it('ajoute en haut par défaut, ou juste au-dessus du calque indiqué', () => {
    let doc = docWith('a', 'b');
    expect(ids(doc)).toEqual(['a', 'b']);
    doc = addLayer(doc, createRectangleLayer(doc, 'c'), 'a');
    expect(ids(doc)).toEqual(['a', 'c', 'b']);
    expect(layerOrder(doc, 'c')).toBe(1);
  });

  it('refuse un identifiant déjà utilisé', () => {
    const doc = docWith('a');
    expectLayerError(() => addLayer(doc, createRectangleLayer(doc, 'a')), 'duplicate-id');
  });

  it('monte, descend, met au premier et à l’arrière-plan', () => {
    const doc = docWith('a', 'b', 'c');
    expect(ids(bringForward(doc, 'a'))).toEqual(['b', 'a', 'c']);
    expect(ids(sendBackward(doc, 'c'))).toEqual(['a', 'c', 'b']);
    expect(ids(bringToFront(doc, 'a'))).toEqual(['b', 'c', 'a']);
    expect(ids(sendToBack(doc, 'c'))).toEqual(['c', 'a', 'b']);
  });

  it('borne les déplacements et renvoie le même document si rien ne change', () => {
    const doc = docWith('a', 'b');
    expect(bringForward(doc, 'b')).toBe(doc);
    expect(sendBackward(doc, 'a')).toBe(doc);
    expect(ids(moveLayerTo(doc, 'a', 99))).toEqual(['b', 'a']);
  });

  it("ne modifie jamais le document d'origine (opérations pures, calques partagés)", () => {
    const doc = docWith('a', 'b');
    const snapshot = JSON.stringify(doc);
    const next = bringForward(doc, 'a');
    expect(JSON.stringify(doc)).toBe(snapshot);
    expect(next.layers[1]).toBe(doc.layers[0]); // même objet, déplacé
  });
});

describe('suppression', () => {
  it('supprime exactement le calque demandé', () => {
    const doc = removeLayer(docWith('a', 'b', 'c'), 'b');
    expect(ids(doc)).toEqual(['a', 'c']);
  });

  it("lève une erreur explicite au lieu de supprimer autre chose quand l'identifiant est inconnu", () => {
    expectLayerError(() => removeLayer(docWith('a', 'b'), 'zzz'), 'not-found');
  });

  it('refuse de supprimer un calque verrouillé', () => {
    const doc = setLayerLocked(docWith('a'), 'a', true);
    expectLayerError(() => removeLayer(doc, 'a'), 'locked');
  });
});

describe('renommage', () => {
  it('nettoie les espaces et refuse un nom vide ou trop long', () => {
    expect(layer(renameLayer(docWith('a'), 'a', '  Fond   bleu '), 'a').name).toBe('Fond bleu');
    expectLayerError(() => renameLayer(docWith('a'), 'a', '   '), 'invalid');
    expectLayerError(() => renameLayer(docWith('a'), 'a', 'x'.repeat(61)), 'invalid');
  });

  it('nomme les copies sans collision', () => {
    expect(copyName('Logo', ['Logo'])).toBe('Logo copie');
    expect(copyName('Logo', ['Logo', 'Logo copie'])).toBe('Logo copie 2');
    expect(copyName('Logo copie', ['Logo', 'Logo copie'])).toBe('Logo copie 2');
  });
});

describe('duplication', () => {
  it('place une copie décalée juste au-dessus, déverrouillée, avec un nouvel identifiant', () => {
    let doc = docWith('a', 'b');
    doc = setLayerLocked(doc, 'a', true);
    doc = duplicateLayer(doc, 'a', 'a2');
    expect(ids(doc)).toEqual(['a', 'a2', 'b']);
    const copy = layer(doc, 'a2');
    const original = layer(doc, 'a');
    expect(copy.name).toBe('A copie');
    expect(copy.x).toBe(original.x + DUPLICATE_OFFSET);
    expect(copy.locked).toBe(false);
    expect(copy.fill).toBe(original.fill);
  });
});

describe('visibilité, verrouillage, opacité', () => {
  it('masque et affiche', () => {
    const hidden = setLayerVisibility(docWith('a'), 'a', false);
    expect(layer(hidden, 'a').visible).toBe(false);
    expect(layer(setLayerVisibility(hidden, 'a', true), 'a').visible).toBe(true);
  });

  it("borne l'opacité entre 0 et 1", () => {
    expect(layer(setLayerOpacity(docWith('a'), 'a', 0.25), 'a').opacity).toBe(0.25);
    expect(layer(setLayerOpacity(docWith('a'), 'a', 7), 'a').opacity).toBe(1);
    expect(layer(setLayerOpacity(docWith('a'), 'a', -1), 'a').opacity).toBe(0);
  });

  it('un calque verrouillé ne peut être ni déplacé ni transformé, mais peut être masqué ou renommé', () => {
    const doc = setLayerLocked(docWith('a'), 'a', true);
    expectLayerError(() => translateLayer(doc, 'a', 5, 5), 'locked');
    expectLayerError(() => updateLayerGeometry(doc, 'a', { rotation: 10 }), 'locked');
    expectLayerError(() => setLayerOpacity(doc, 'a', 0.5), 'locked');
    expect(layer(setLayerVisibility(doc, 'a', false), 'a').visible).toBe(false);
    expect(layer(renameLayer(doc, 'a', 'Nouveau'), 'a').name).toBe('Nouveau');
  });
});

describe('transformations', () => {
  it('déplace du décalage demandé', () => {
    const doc = translateLayer(docWith('a'), 'a', 15, -7);
    expect([layer(doc, 'a').x, layer(doc, 'a').y]).toEqual([415, 143]);
  });

  it('normalise la rotation et refuse les tailles nulles ou les valeurs non finies', () => {
    expect(layer(updateLayerGeometry(docWith('a'), 'a', { rotation: 270 }), 'a').rotation).toBe(-90);
    expectLayerError(() => updateLayerGeometry(docWith('a'), 'a', { width: 0 }), 'invalid');
    expectLayerError(() => updateLayerGeometry(docWith('a'), 'a', { x: Number.NaN }), 'invalid');
  });

  it.each([
    [0, 0],
    [180, 180],
    [-180, 180],
    [190, -170],
    [-190, 170],
    [720, 0],
    [359.5, -0.5],
  ])('normalise %s° en %s°', (input, expected) => {
    expect(normalizeRotation(input)).toBeCloseTo(expected, 9);
  });
});

describe('géométrie et test d’atteinte', () => {
  const g = { x: 10, y: 10, width: 20, height: 10, rotation: 0 };
  const apply = (m: number[], x: number, y: number) => [
    (m[0] ?? 0) * x + (m[1] ?? 0) * y + (m[2] ?? 0),
    (m[3] ?? 0) * x + (m[4] ?? 0) * y + (m[5] ?? 0),
  ];

  it('la matrice place le repère local du calque dans le document', () => {
    expect(apply(layerMatrix(g), 0, 0)).toEqual([10, 10]);
    expect(apply(layerMatrix(g), 20, 10)).toEqual([30, 20]);
    expect(apply(layerMatrix(g, 5, -3), 0, 0)).toEqual([15, 7]);
  });

  it('la rotation se fait autour du centre, dans le sens horaire', () => {
    const m = layerMatrix({ ...g, rotation: 90 });
    const center = apply(m, 10, 5);
    expect(center[0]).toBeCloseTo(20, 9);
    expect(center[1]).toBeCloseTo(15, 9);
    // Le coin haut-gauche local passe en haut à droite après 90° horaire.
    const corner = apply(m, 0, 0);
    expect(corner[0]).toBeCloseTo(25, 9);
    expect(corner[1]).toBeCloseTo(5, 9);
  });

  it('teste l’appartenance dans la boîte tournée', () => {
    expect(containsPoint(g, 29, 19)).toBe(true);
    expect(containsPoint(g, 31, 15)).toBe(false);
    const rotated = { ...g, rotation: 90 }; // couvre x ∈ [15, 25], y ∈ [5, 25]
    expect(containsPoint(rotated, 20, 6)).toBe(true);
    expect(containsPoint(rotated, 12, 15)).toBe(false);
  });

  it('désigne le calque visible le plus haut, ignore les calques masqués', () => {
    const bottom = { ...g, id: 'bottom', visible: true, locked: false };
    const top = { ...g, id: 'top', visible: true, locked: true };
    expect(hitTest([bottom, top], 15, 15)?.id).toBe('top');
    expect(hitTest([bottom, { ...top, visible: false }], 15, 15)?.id).toBe('bottom');
    expect(hitTest([bottom, top], 500, 500)).toBeNull();
  });
});
