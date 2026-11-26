import { create } from 'zustand';

/**
 * État de l'espace de travail tablette et grand écran : outil choisi dans
 * chaque famille, couleurs de premier plan et d'arrière-plan, panneaux
 * (onglet actif, visibilité, repli), règles, et boîtes de dialogue ouvertes
 * depuis les menus.
 */

export type PanelId =
  | 'color'
  | 'swatches'
  | 'properties'
  | 'adjustments'
  | 'layers'
  | 'channels'
  | 'paths'
  | 'history';

export type PanelGroupId = 'color' | 'properties' | 'layers';

/** Disposition par défaut du dock, de haut en bas. */
export const PANEL_GROUPS: Record<PanelGroupId, readonly PanelId[]> = {
  color: ['color', 'swatches'],
  properties: ['properties', 'adjustments'],
  layers: ['layers', 'channels', 'paths', 'history'],
};

export const DEFAULT_FOREGROUND = '#000000';
export const DEFAULT_BACKGROUND = '#FFFFFF';

export interface WorkspaceState {
  /** Outil désigné dans la barre d'outils (clé de toolFamilies). */
  railToolKey: string;
  /** Dernier outil choisi dans chaque famille (icône affichée dans la barre). */
  familyChoice: Record<string, string>;
  setRailTool: (familyId: string, toolKey: string) => void;

  foreground: string;
  background: string;
  setForeground: (color: string) => void;
  swapColors: () => void;
  resetColors: () => void;

  activeTab: Record<PanelGroupId, PanelId>;
  hiddenPanels: readonly PanelId[];
  collapsedGroups: readonly PanelGroupId[];
  showPanel: (panel: PanelId) => void;
  togglePanelVisible: (panel: PanelId) => void;
  toggleGroupCollapsed: (group: PanelGroupId) => void;
  resetWorkspace: () => void;

  rulersVisible: boolean;
  toggleRulers: () => void;

  /** Calque visé par une suppression ou un renommage demandé depuis un menu. */
  pendingDeleteLayerId: string | null;
  renameLayerId: string | null;
  requestDeleteLayer: (id: string | null) => void;
  requestRenameLayer: (id: string | null) => void;
}

const layout = {
  activeTab: { color: 'color', properties: 'properties', layers: 'layers' } as Record<PanelGroupId, PanelId>,
  hiddenPanels: [] as readonly PanelId[],
  collapsedGroups: [] as readonly PanelGroupId[],
};

const initialState = {
  railToolKey: 'hand',
  familyChoice: {} as Record<string, string>,
  foreground: DEFAULT_FOREGROUND,
  background: DEFAULT_BACKGROUND,
  ...layout,
  rulersVisible: true,
  pendingDeleteLayerId: null as string | null,
  renameLayerId: null as string | null,
};

function groupOf(panel: PanelId): PanelGroupId {
  return (Object.keys(PANEL_GROUPS) as PanelGroupId[]).find((g) => PANEL_GROUPS[g].includes(panel)) ?? 'layers';
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  ...initialState,
  setRailTool: (familyId, toolKey) =>
    set((s) => ({ railToolKey: toolKey, familyChoice: { ...s.familyChoice, [familyId]: toolKey } })),

  setForeground: (color) => set({ foreground: color }),
  swapColors: () => set((s) => ({ foreground: s.background, background: s.foreground })),
  resetColors: () => set({ foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND }),

  // Afficher un panneau : il redevient visible, son groupe se déplie et son onglet passe devant.
  showPanel: (panel) =>
    set((s) => {
      const group = groupOf(panel);
      return {
        hiddenPanels: s.hiddenPanels.filter((p) => p !== panel),
        collapsedGroups: s.collapsedGroups.filter((g) => g !== group),
        activeTab: { ...s.activeTab, [group]: panel },
      };
    }),
  togglePanelVisible: (panel) =>
    set((s) => {
      const group = groupOf(panel);
      if (s.hiddenPanels.includes(panel)) {
        return {
          hiddenPanels: s.hiddenPanels.filter((p) => p !== panel),
          activeTab: { ...s.activeTab, [group]: panel },
          collapsedGroups: s.collapsedGroups.filter((g) => g !== group),
        };
      }
      const hiddenPanels = [...s.hiddenPanels, panel];
      // L'onglet masqué cède sa place au premier onglet encore visible du groupe.
      const fallback = PANEL_GROUPS[group].find((p) => !hiddenPanels.includes(p));
      return {
        hiddenPanels,
        activeTab: s.activeTab[group] === panel && fallback ? { ...s.activeTab, [group]: fallback } : s.activeTab,
      };
    }),
  toggleGroupCollapsed: (group) =>
    set((s) => ({
      collapsedGroups: s.collapsedGroups.includes(group)
        ? s.collapsedGroups.filter((g) => g !== group)
        : [...s.collapsedGroups, group],
    })),
  resetWorkspace: () => set({ ...layout, rulersVisible: true }),

  toggleRulers: () => set((s) => ({ rulersVisible: !s.rulersVisible })),

  requestDeleteLayer: (id) => set({ pendingDeleteLayerId: id }),
  requestRenameLayer: (id) => set({ renameLayerId: id }),
}));

/** Remet l'espace de travail par défaut (tests). */
export function resetWorkspaceStore(): void {
  useWorkspaceStore.setState(initialState);
}
