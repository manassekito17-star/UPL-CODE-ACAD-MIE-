import { createDocument, type GraphicDocument } from '@/engine/documents';
import { LayerError, addLayer, alignLayer, createRectangleLayer, setLayerLocked, updateLayerGeometry } from '@/engine/layers';
import { rulerStep } from '@/screens/editor/desktop/Rulers';
import { ALL_TOOLS, TOOL_FAMILIES, familyOf, findTool, isUsable } from '@/screens/editor/toolFamilies';
import { PANEL_GROUPS, resetWorkspaceStore, useWorkspaceStore } from '@/stores/workspaceStore';

const doc = (): GraphicDocument => {
  const d = createDocument({ width: 1000, height: 500, background: 'white', name: 'Doc' }, { id: 'doc', now: 0 });
  return updateLayerGeometry(addLayer(d, createRectangleLayer(d, 'r')), 'r', { x: 100, y: 50, width: 200, height: 100, rotation: 0 });
};
const geom = (d: GraphicDocument) => d.layers[0] as { x: number; y: number };

describe('alignLayer', () => {
  it('aligne sur les bords et le centre du document', () => {
    expect(geom(alignLayer(doc(), 'r', 'left')).x).toBe(0);
    expect(geom(alignLayer(doc(), 'r', 'center')).x).toBe(400);
    expect(geom(alignLayer(doc(), 'r', 'right')).x).toBe(800);
    expect(geom(alignLayer(doc(), 'r', 'top')).y).toBe(0);
    expect(geom(alignLayer(doc(), 'r', 'middle')).y).toBe(200);
    expect(geom(alignLayer(doc(), 'r', 'bottom')).y).toBe(400);
  });

  it('utilise la boîte englobante d’un calque tourné', () => {
    // 200 × 100 tourné de 90° : la boîte fait 100 × 200, centrée sur le calque.
    const turned = updateLayerGeometry(doc(), 'r', { rotation: 90 });
    const left = alignLayer(turned, 'r', 'left').layers[0];
    expect(left).toMatchObject({ x: -50 }); // centre à x = 50, bord gauche de la boîte à 0
    const top = alignLayer(turned, 'r', 'top').layers[0];
    expect(top).toMatchObject({ y: 50 }); // centre à y = 100
  });

  it('refuse un calque verrouillé et un identifiant inconnu', () => {
    expect(() => alignLayer(setLayerLocked(doc(), 'r', true), 'r', 'left')).toThrow(LayerError);
    expect(() => alignLayer(doc(), 'absent', 'left')).toThrow(LayerError);
  });
});

describe('catalogue d’outils', () => {
  it('compte 51 outils en 20 familles, aux clés uniques', () => {
    expect(TOOL_FAMILIES).toHaveLength(20);
    expect(ALL_TOOLS).toHaveLength(51);
    expect(new Set(ALL_TOOLS.map((t) => t.key)).size).toBe(51);
  });

  it('un outil prévu n’a aucune action et nomme son module ; un outil utilisable agit', () => {
    for (const tool of ALL_TOOLS) {
      if (tool.status === 'todo') {
        expect(tool.behavior.kind).toBe('none');
        expect(tool.note).toMatch(/M\d+/);
        expect(isUsable(tool)).toBe(false);
      } else {
        expect(tool.behavior.kind).not.toBe('none');
        expect(isUsable(tool)).toBe(true);
      }
    }
    expect(ALL_TOOLS.filter(isUsable).map((t) => t.key).sort()).toEqual(
      ['hand', 'move', 'shape-ellipse', 'shape-line', 'shape-rectangle', 'type-horizontal', 'zoom'].sort(),
    );
  });

  it('retrouve un outil et sa famille', () => {
    expect(findTool('brush')?.label).toBe('Pinceau');
    expect(familyOf('pencil')?.id).toBe('brush');
    expect(findTool('inconnu')).toBeUndefined();
  });
});

describe('workspaceStore', () => {
  beforeEach(resetWorkspaceStore);
  const st = () => useWorkspaceStore.getState();

  it('retient l’outil choisi dans chaque famille', () => {
    st().setRailTool('shape', 'shape-ellipse');
    expect(st()).toMatchObject({ railToolKey: 'shape-ellipse', familyChoice: { shape: 'shape-ellipse' } });
  });

  it('permute et réinitialise les couleurs', () => {
    st().setForeground('#FF0000');
    st().swapColors();
    expect(st()).toMatchObject({ foreground: '#FFFFFF', background: '#FF0000' });
    st().resetColors();
    expect(st()).toMatchObject({ foreground: '#000000', background: '#FFFFFF' });
  });

  it('masquer l’onglet actif passe au suivant ; afficher un panneau déplie son groupe', () => {
    st().togglePanelVisible('layers');
    expect(st().hiddenPanels).toEqual(['layers']);
    expect(st().activeTab.layers).toBe('channels');
    st().toggleGroupCollapsed('layers');
    expect(st().collapsedGroups).toEqual(['layers']);
    st().showPanel('layers');
    expect(st()).toMatchObject({ hiddenPanels: [], collapsedGroups: [], activeTab: { layers: 'layers' } });
  });

  it('chaque panneau appartient à un seul groupe ; la réinitialisation restaure la disposition', () => {
    const all = Object.values(PANEL_GROUPS).flat();
    expect(new Set(all).size).toBe(all.length);
    st().togglePanelVisible('color');
    st().toggleRulers();
    st().resetWorkspace();
    expect(st()).toMatchObject({ hiddenPanels: [], rulersVisible: true, activeTab: { color: 'color' } });
  });
});

describe('règles', () => {
  it('choisit un pas 1, 2 ou 5 × 10ⁿ qui espace les graduations d’au moins 64 points', () => {
    expect(rulerStep(1)).toBe(100);
    expect(rulerStep(0.5)).toBe(200);
    expect(rulerStep(0.1)).toBe(1000);
    expect(rulerStep(2)).toBe(50);
    expect(rulerStep(8)).toBe(10);
    expect(rulerStep(0.02)).toBe(5000);
  });
});
