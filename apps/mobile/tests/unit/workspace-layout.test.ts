import { parseStoredWorkspaces, serializeWorkspaces } from '@/features/workspace/workspacePersistence';
import { ALL_PANELS, DEFAULT_LAYOUT, groupOf, moveGroup, movePanel, normalizeLayout, type WorkspaceLayout } from '@/stores/workspaceLayout';
import { DEFAULT_WORKSPACE, resetWorkspaceStore, useWorkspaceStore } from '@/stores/workspaceStore';

const ids = (l: WorkspaceLayout) => l.groups.map((g) => `${g.id}:${g.panels.join('+')}`);
/** Chaque panneau figure une seule fois, dans un groupe ou dans la colonne. */
const allOnce = (l: WorkspaceLayout) => [...l.groups.flatMap((g) => g.panels), ...l.strip].sort();

describe('disposition : déplacer les panneaux', () => {
  it('vers un autre groupe : il en devient l’onglet actif et redevient visible', () => {
    const hidden = { ...DEFAULT_LAYOUT, hiddenPanels: ['swatches' as const] };
    const l = movePanel(hidden, 'swatches', { group: 'layers' });
    expect(ids(l)).toEqual(['color:color', 'properties:properties+adjustments', 'layers:layers+channels+paths+swatches']);
    expect(l.activeTab.layers).toBe('swatches');
    expect(l.hiddenPanels).toEqual([]);
    expect(allOnce(l)).toEqual([...ALL_PANELS].sort());
  });

  it('un groupe vidé disparaît ; vers la colonne d’icônes et retour', () => {
    let l = movePanel(DEFAULT_LAYOUT, 'color', { strip: true });
    l = movePanel(l, 'swatches', { strip: true });
    expect(l.groups.map((g) => g.id)).toEqual(['properties', 'layers']);
    expect(l.activeTab.color).toBeUndefined();
    expect(l.strip).toEqual(['history', 'navigator', 'character', 'paragraph', 'color', 'swatches']);
    l = movePanel(l, 'history', { group: 'properties' });
    expect(groupOf(l, 'history')).toBe('properties');
    expect(l.strip).not.toContain('history');
    expect(allOnce(l)).toEqual([...ALL_PANELS].sort());
  });

  it('vers un nouveau groupe placé sous le groupe d’origine ; depuis la colonne, en bas du dock', () => {
    let l = movePanel(DEFAULT_LAYOUT, 'adjustments', { newGroup: true });
    expect(ids(l)).toEqual(['color:color+swatches', 'properties:properties', 'group-1:adjustments', 'layers:layers+channels+paths']);
    l = movePanel(l, 'navigator', { newGroup: true });
    expect(ids(l).at(-1)).toBe('group-2:navigator');
    // Seul onglet de son groupe : rien à faire.
    expect(movePanel(l, 'navigator', { newGroup: true })).toBe(l);
    expect(movePanel(l, 'navigator', { group: 'group-2' })).toBe(l);
    expect(movePanel(l, 'history', { strip: true })).toBe(l);
    expect(movePanel(l, 'history', { group: 'inconnu' })).toBe(l);
  });

  it('réordonne les groupes', () => {
    const l = moveGroup(DEFAULT_LAYOUT, 'layers', -1);
    expect(l.groups.map((g) => g.id)).toEqual(['color', 'layers', 'properties']);
    expect(moveGroup(l, 'color', -1)).toBe(l);
    expect(moveGroup(l, 'properties', 1)).toBe(l);
  });
});

describe('disposition : relecture', () => {
  it('relit une disposition valide à l’identique', () => {
    const l = movePanel(moveGroup(DEFAULT_LAYOUT, 'layers', -1), 'history', { newGroup: true });
    expect(normalizeLayout(JSON.parse(JSON.stringify(l)))).toEqual(l);
  });

  it('écarte doublons et inconnus, remet les panneaux manquants dans la colonne', () => {
    const l = normalizeLayout({
      groups: [
        { id: 'a', panels: ['layers', 'layers', 'brosses'] },
        { id: 'a', panels: ['color'] },
        { id: 'b', panels: [] },
        { id: 'c', panels: ['color'] },
      ],
      strip: ['layers', 'history'],
      activeTab: { a: 'color', c: 'color' },
      hiddenPanels: ['inconnu', 'history'],
      collapsedGroups: ['b', 'c'],
      dockCollapsed: 'oui',
    });
    expect(l).not.toBeNull();
    expect(ids(l as WorkspaceLayout)).toEqual(['a:layers', 'c:color']);
    expect(l?.activeTab).toEqual({ a: 'layers', c: 'color' });
    expect(l?.hiddenPanels).toEqual(['history']);
    expect(l?.collapsedGroups).toEqual(['c']);
    expect(l?.dockCollapsed).toBe(false);
    expect(allOnce(l as WorkspaceLayout)).toEqual([...ALL_PANELS].sort());
    expect(normalizeLayout(null)).toBeNull();
    expect(normalizeLayout({ strip: [] })).toBeNull();
  });

  it('espaces enregistrés : lecture prudente', () => {
    const live = movePanel(DEFAULT_LAYOUT, 'color', { strip: true });
    const json = serializeWorkspaces({ current: 'Retouche', live, saved: [{ name: 'Retouche', layout: live }] });
    expect(parseStoredWorkspaces(json)).toEqual({ current: 'Retouche', live, saved: [{ name: 'Retouche', layout: live }] });
    const data = JSON.parse(json);
    data.saved.push({ name: DEFAULT_WORKSPACE, layout: live }, { name: 'Retouche', layout: live }, { name: '', layout: live }, { name: 'Sans disposition' });
    data.current = 'Inconnu';
    expect(parseStoredWorkspaces(JSON.stringify(data))).toMatchObject({ current: DEFAULT_WORKSPACE, saved: [{ name: 'Retouche' }] });
    expect(parseStoredWorkspaces('{oups')).toBeNull();
    expect(parseStoredWorkspaces(JSON.stringify({ format: 99, live }))).toBeNull();
    expect(parseStoredWorkspaces(null)).toBeNull();
  });
});

describe('espaces de travail (magasin)', () => {
  const st = () => useWorkspaceStore.getState();
  beforeEach(resetWorkspaceStore);

  it('enregistre, applique, réinitialise et supprime', () => {
    expect(st().workspaceName).toBe(DEFAULT_WORKSPACE);
    st().movePanel('layers', { strip: true });
    st().toggleToolRailDouble();
    expect(st().saveWorkspace('  Retouche  ')).toBeNull();
    expect(st()).toMatchObject({ workspaceName: 'Retouche', savedWorkspaces: [{ name: 'Retouche' }] });

    st().applyWorkspace(DEFAULT_WORKSPACE);
    expect(groupOf(st(), 'layers')).toBe('layers');
    expect(st().toolRailDouble).toBe(false);

    st().applyWorkspace('Retouche');
    expect(groupOf(st(), 'layers')).toBeNull();
    expect(st().toolRailDouble).toBe(true);

    // Réinitialiser revient à la version enregistrée de l'espace actuel.
    st().moveGroup('layers', -1);
    st().movePanel('history', { group: 'color' });
    st().toggleRulers();
    st().resetWorkspace();
    expect(groupOf(st(), 'history')).toBeNull();
    expect(st().strip).toContain('layers');
    expect(st().rulersVisible).toBe(true);

    st().deleteWorkspace('Retouche');
    expect(st()).toMatchObject({ workspaceName: DEFAULT_WORKSPACE, savedWorkspaces: [] });
    st().applyWorkspace('Inconnu');
    expect(st().workspaceName).toBe(DEFAULT_WORKSPACE);
  });

  it('refuse un nom vide, trop long ou réservé ; un même nom remplace l’espace', () => {
    expect(st().saveWorkspace('  ')).toMatch(/nom/);
    expect(st().saveWorkspace('x'.repeat(41))).toMatch(/40/);
    expect(st().saveWorkspace('essentiels')).toMatch(/fourni par l’application/);
    st().saveWorkspace('A');
    st().movePanel('color', { strip: true });
    st().saveWorkspace('A');
    expect(st().savedWorkspaces).toHaveLength(1);
    expect(st().savedWorkspaces[0]?.layout.strip).toContain('color');
  });
});
