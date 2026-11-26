import { createDocument, type GraphicDocument } from '@/engine/documents';
import {
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  clearHistory,
  createHistory,
  currentState,
  deleteFrom,
  goTo,
  record,
  redo,
  redoLabel,
  undo,
  undoLabel,
} from '@/engine/history';
import { addLayer, createRectangleLayer, translateLayer } from '@/engine/layers';
import { geometryLabel, transformLabel } from '@/features/layers/useLayerActions';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';

const base = (): GraphicDocument => createDocument({ width: 100, height: 100, background: 'white', name: 'D' }, { id: 'd', now: 0 });
const withLayer = (d: GraphicDocument) => addLayer(d, createRectangleLayer(d, 'r'));

describe('historique (moteur)', () => {
  it('enregistre, annule, rétablit et nomme les actions', () => {
    const d0 = base();
    const d1 = withLayer(d0);
    const d2 = translateLayer(d1, 'r', 5, 0);
    let h = record(record(createHistory(d0, 'Nouveau document'), 'Nouveau calque de forme', d1), 'Déplacer', d2);
    expect(currentState(h).doc).toBe(d2);
    expect(undoLabel(h)).toBe('Déplacer');
    expect(canRedo(h)).toBe(false);
    h = undo(h);
    expect(currentState(h).doc).toBe(d1);
    expect(redoLabel(h)).toBe('Déplacer');
    h = undo(h);
    expect(canUndo(h)).toBe(false);
    expect(undo(h)).toBe(h); // rien avant le premier état
    h = redo(redo(h));
    expect(currentState(h).doc).toBe(d2);
    expect(redo(h)).toBe(h);
  });

  it('une nouvelle action après un retour abandonne les états rétablissables', () => {
    const d0 = base();
    const d1 = withLayer(d0);
    let h = record(createHistory(d0, 'A'), 'B', d1);
    h = undo(h);
    const d2 = translateLayer(d1, 'r', 1, 1);
    h = record(h, 'C', d2);
    expect(h.states.map((s) => s.label)).toEqual(['A', 'C']);
    expect(canRedo(h)).toBe(false);
  });

  it(`garde au plus ${HISTORY_LIMIT} états, en oubliant les plus anciens`, () => {
    let doc = withLayer(base());
    let h = createHistory(doc, 'Départ');
    for (let i = 1; i <= 60; i += 1) {
      doc = translateLayer(doc, 'r', 1, 0);
      h = record(h, `Pas ${i}`, doc);
    }
    expect(h.states).toHaveLength(HISTORY_LIMIT);
    expect(h.states[0]?.label).toBe('Pas 11');
    expect(h.index).toBe(HISTORY_LIMIT - 1);
    expect(currentState(h).doc).toBe(doc);
  });

  it('les états partagent les calques inchangés (aucune copie)', () => {
    const d1 = withLayer(base());
    const d2 = addLayer(d1, createRectangleLayer(d1, 's'));
    const d3 = translateLayer(d2, 's', 3, 0);
    expect(d3.layers[0]).toBe(d2.layers[0]);
  });

  it('aller à un état, supprimer depuis un état, effacer', () => {
    const d0 = base();
    const d1 = withLayer(d0);
    const d2 = translateLayer(d1, 'r', 1, 0);
    const d3 = translateLayer(d2, 'r', 1, 0);
    let h = record(record(record(createHistory(d0, 'A'), 'B', d1), 'C', d2), 'D', d3);
    expect(goTo(h, 9)).toBe(h);
    h = goTo(h, 1);
    expect(currentState(h).label).toBe('B');
    const cut = deleteFrom(record(h, 'E', d2), 2);
    expect(cut.states.map((s) => s.label)).toEqual(['A', 'B']);
    expect(cut.index).toBe(1);
    expect(deleteFrom(h, 0)).toBe(h); // le premier état reste
    const cleared = clearHistory(h);
    expect(cleared.states.map((s) => s.label)).toEqual(['B']);
    expect(canUndo(cleared)).toBe(false);
  });
});

describe('libellés des actions', () => {
  it('nomme les modifications de champs et les manipulations', () => {
    expect(geometryLabel({ opacity: 0.5 })).toBe('Opacité du calque');
    expect(geometryLabel({ x: 3 })).toBe('Déplacer');
    expect(geometryLabel({ width: 3 })).toBe('Transformation manuelle');
    const doc = withLayer(base());
    const r = doc.layers[0] as { x: number; y: number; width: number; height: number; rotation: number };
    expect(transformLabel(doc, 'r', { ...r, x: r.x + 4 })).toBe('Déplacer');
    expect(transformLabel(doc, 'r', { ...r, rotation: 45 })).toBe('Transformation manuelle');
  });
});

describe('historique (store des documents)', () => {
  beforeEach(resetDocumentStore);
  const st = () => useDocumentStore.getState();

  it('chaque modification réussie est un état ; un refus ou une opération sans effet n’en crée pas', () => {
    const doc = st().createDocument({ width: 100, height: 100, background: 'white', name: 'D' });
    expect(st().histories[doc.id]?.states.map((s) => s.label)).toEqual(['Nouveau document']);
    st().mutateDocument(doc.id, withLayer, 'Nouveau calque de forme');
    st().mutateDocument(doc.id, (d) => d, 'Rien');
    st().mutateDocument(doc.id, () => translateLayer(st().documents[doc.id] as GraphicDocument, 'absent', 1, 1), 'Refus');
    expect(st().histories[doc.id]?.states.map((s) => s.label)).toEqual(['Nouveau document', 'Nouveau calque de forme']);

    expect(st().undo(doc.id)).toBe(true);
    expect(st().documents[doc.id]?.layers).toHaveLength(0);
    expect(st().undo(doc.id)).toBe(false);
    expect(st().redo(doc.id)).toBe(true);
    expect(st().documents[doc.id]?.layers).toHaveLength(1);
  });

  it('supprimer le document supprime son historique', () => {
    const doc = st().createDocument({ width: 100, height: 100, background: 'white', name: 'D' });
    st().removeDocument(doc.id);
    expect(st().histories[doc.id]).toBeUndefined();
  });

  it('effacer l’historique peut renommer l’état de départ', () => {
    const doc = st().createDocument({ width: 100, height: 100, background: 'white', name: 'D' });
    st().mutateDocument(doc.id, withLayer, 'Ouvrir');
    st().clearHistory(doc.id, 'Ouvrir');
    expect(st().histories[doc.id]).toMatchObject({ index: 0, states: [{ label: 'Ouvrir' }] });
    expect(st().histories[doc.id]?.states[0]?.doc.layers).toHaveLength(1);
  });
});
