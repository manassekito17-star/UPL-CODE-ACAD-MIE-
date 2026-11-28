/**
 * Disposition des panneaux de l'espace studio : groupes d'onglets du dock
 * (de haut en bas), colonne d'icônes, onglet actif de chaque groupe, panneaux
 * masqués, groupes repliés. Fonctions pures : le magasin les applique, et les
 * espaces de travail enregistrés sont des copies de cette disposition.
 */

export type PanelId =
  | 'color'
  | 'swatches'
  | 'properties'
  | 'adjustments'
  | 'layers'
  | 'channels'
  | 'paths'
  | 'history'
  | 'navigator'
  | 'character'
  | 'paragraph';

export const ALL_PANELS: readonly PanelId[] = [
  'color',
  'swatches',
  'properties',
  'adjustments',
  'layers',
  'channels',
  'paths',
  'history',
  'navigator',
  'character',
  'paragraph',
];

/** Identifiant d'un groupe d'onglets (« color », « properties », « layers » au départ, puis « group-N »). */
export type PanelGroupId = string;

export interface DockGroup {
  id: PanelGroupId;
  panels: readonly PanelId[];
}

export interface WorkspaceLayout {
  groups: readonly DockGroup[];
  /** Colonne d'icônes à gauche du dock : panneaux ouverts en fenêtre flottante. */
  strip: readonly PanelId[];
  activeTab: Readonly<Record<PanelGroupId, PanelId>>;
  hiddenPanels: readonly PanelId[];
  collapsedGroups: readonly PanelGroupId[];
  /** Dock réduit à une colonne d'icônes. */
  dockCollapsed: boolean;
  /** Barre d'outils sur deux colonnes. */
  toolRailDouble: boolean;
}

/** Disposition par défaut du dock (espace « Essentiels »), de haut en bas. */
export const PANEL_GROUPS: Readonly<Record<'color' | 'properties' | 'layers', readonly PanelId[]>> = {
  color: ['color', 'swatches'],
  properties: ['properties', 'adjustments'],
  layers: ['layers', 'channels', 'paths'],
};

export const STRIP_PANELS: readonly PanelId[] = ['history', 'navigator', 'character', 'paragraph'];

export const DEFAULT_LAYOUT: WorkspaceLayout = {
  groups: (Object.keys(PANEL_GROUPS) as (keyof typeof PANEL_GROUPS)[]).map((id) => ({ id, panels: PANEL_GROUPS[id] })),
  strip: STRIP_PANELS,
  activeTab: { color: 'color', properties: 'properties', layers: 'layers' },
  hiddenPanels: [],
  collapsedGroups: [],
  dockCollapsed: false,
  toolRailDouble: false,
};

/** Groupe du dock d'un panneau, ou null pour un panneau de la colonne d'icônes. */
export function groupOf(layout: Pick<WorkspaceLayout, 'groups'>, panel: PanelId): PanelGroupId | null {
  return layout.groups.find((g) => g.panels.includes(panel))?.id ?? null;
}

export type PanelTarget = { group: PanelGroupId } | { strip: true } | { newGroup: true };

/** Identifiant d'un nouveau groupe, absent de la disposition. */
function newGroupId(layout: WorkspaceLayout): PanelGroupId {
  for (let n = 1; ; n += 1) {
    const id = `group-${n}`;
    if (!layout.groups.some((g) => g.id === id)) return id;
  }
}

/** Retire les groupes vides et les références à des groupes disparus. */
function tidy(layout: WorkspaceLayout): WorkspaceLayout {
  const groups = layout.groups.filter((g) => g.panels.length > 0);
  const ids = new Set(groups.map((g) => g.id));
  const activeTab: Record<PanelGroupId, PanelId> = {};
  for (const g of groups) {
    const current = layout.activeTab[g.id];
    activeTab[g.id] = current && g.panels.includes(current) ? current : (g.panels[0] as PanelId);
  }
  return { ...layout, groups, activeTab, collapsedGroups: layout.collapsedGroups.filter((id) => ids.has(id)) };
}

/**
 * Déplace un panneau vers un autre groupe d'onglets (dont il devient
 * l'onglet actif), vers la colonne d'icônes, ou dans un nouveau groupe placé
 * sous son groupe d'origine. Le panneau redevient visible. Un groupe vidé
 * disparaît.
 */
export function movePanel(layout: WorkspaceLayout, panel: PanelId, target: PanelTarget): WorkspaceLayout {
  const from = groupOf(layout, panel);
  if ('group' in target && (target.group === from || !layout.groups.some((g) => g.id === target.group))) return layout;
  if ('strip' in target && from === null) return layout;
  const without = layout.groups.map((g) => ({ ...g, panels: g.panels.filter((p) => p !== panel) }));
  const strip = layout.strip.filter((p) => p !== panel);
  const hiddenPanels = layout.hiddenPanels.filter((p) => p !== panel);
  if ('strip' in target) return tidy({ ...layout, groups: without, strip: [...strip, panel], hiddenPanels });
  if ('group' in target) {
    return tidy({
      ...layout,
      groups: without.map((g) => (g.id === target.group ? { ...g, panels: [...g.panels, panel] } : g)),
      strip,
      hiddenPanels,
      activeTab: { ...layout.activeTab, [target.group]: panel },
      collapsedGroups: layout.collapsedGroups.filter((id) => id !== target.group),
    });
  }
  // Nouveau groupe : seul onglet d'un groupe, le panneau y est déjà.
  if (from !== null && layout.groups.find((g) => g.id === from)?.panels.length === 1) return layout;
  const id = newGroupId(layout);
  const at = from === null ? without.length : without.findIndex((g) => g.id === from) + 1;
  const groups = [...without.slice(0, at), { id, panels: [panel] }, ...without.slice(at)];
  return tidy({ ...layout, groups, strip, hiddenPanels, activeTab: { ...layout.activeTab, [id]: panel } });
}

/** Monte (-1) ou descend (+1) un groupe dans le dock. */
export function moveGroup(layout: WorkspaceLayout, id: PanelGroupId, direction: -1 | 1): WorkspaceLayout {
  const i = layout.groups.findIndex((g) => g.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= layout.groups.length) return layout;
  const groups = [...layout.groups];
  [groups[i], groups[j]] = [groups[j] as DockGroup, groups[i] as DockGroup];
  return { ...layout, groups };
}

const isPanel = (v: unknown): v is PanelId => typeof v === 'string' && (ALL_PANELS as readonly string[]).includes(v);

/**
 * Relit une disposition enregistrée. Chaque panneau doit figurer une seule
 * fois : un doublon ou un identifiant inconnu est ignoré, un panneau absent
 * est remis dans la colonne d'icônes. Renvoie null si l'entrée n'est pas
 * une disposition.
 */
export function normalizeLayout(raw: unknown): WorkspaceLayout | null {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as { groups?: unknown }).groups)) return null;
  const o = raw as Record<string, unknown>;
  const seen = new Set<PanelId>();
  const take = (list: unknown): PanelId[] =>
    (Array.isArray(list) ? list : []).filter((p): p is PanelId => {
      if (!isPanel(p) || seen.has(p)) return false;
      seen.add(p);
      return true;
    });
  const groupIds = new Set<string>();
  const groups: DockGroup[] = [];
  for (const g of o.groups as unknown[]) {
    if (typeof g !== 'object' || g === null) continue;
    const id = (g as { id?: unknown }).id;
    if (typeof id !== 'string' || id === '' || id.length > 40 || groupIds.has(id)) continue;
    const panels = take((g as { panels?: unknown }).panels);
    if (panels.length === 0) continue;
    groupIds.add(id);
    groups.push({ id, panels });
  }
  const strip = take(o.strip);
  for (const p of ALL_PANELS) if (!seen.has(p)) strip.push(p);
  const activeIn = typeof o.activeTab === 'object' && o.activeTab !== null ? (o.activeTab as Record<string, unknown>) : {};
  const activeTab: Record<PanelGroupId, PanelId> = {};
  for (const g of groups) {
    const a = activeIn[g.id];
    if (isPanel(a)) activeTab[g.id] = a;
  }
  return tidy({
    groups,
    strip,
    activeTab,
    hiddenPanels: Array.isArray(o.hiddenPanels) ? o.hiddenPanels.filter(isPanel) : [],
    collapsedGroups: Array.isArray(o.collapsedGroups) ? o.collapsedGroups.filter((id): id is string => typeof id === 'string' && groupIds.has(id)) : [],
    dockCollapsed: o.dockCollapsed === true,
    toolRailDouble: o.toolRailDouble === true,
  });
}

/** Copie de la disposition (sans les autres champs du magasin). */
export function layoutOf(s: WorkspaceLayout): WorkspaceLayout {
  return {
    groups: s.groups,
    strip: s.strip,
    activeTab: s.activeTab,
    hiddenPanels: s.hiddenPanels,
    collapsedGroups: s.collapsedGroups,
    dockCollapsed: s.dockCollapsed,
    toolRailDouble: s.toolRailDouble,
  };
}
