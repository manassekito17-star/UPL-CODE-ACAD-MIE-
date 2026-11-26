import { create } from 'zustand';

/**
 * État de l'espace de travail tablette et grand écran : outil choisi dans
 * chaque famille, options de l'outil Déplacement, couleurs de premier plan et
 * d'arrière-plan, panneaux (onglet actif, visibilité, repli, dock réduit en
 * icônes, colonne d'icônes), règles, mode d'écran, barre d'état, et boîtes de
 * dialogue ouvertes depuis les menus.
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

export type PanelGroupId = 'color' | 'properties' | 'layers';

/** Disposition par défaut du dock, de haut en bas. */
export const PANEL_GROUPS: Record<PanelGroupId, readonly PanelId[]> = {
  color: ['color', 'swatches'],
  properties: ['properties', 'adjustments'],
  layers: ['layers', 'channels', 'paths'],
};

/** Panneaux réduits en icônes, dans la colonne à gauche du dock : ils s'ouvrent en fenêtre flottante. */
export const STRIP_PANELS: readonly PanelId[] = ['history', 'navigator', 'character', 'paragraph'];

/** Information affichée dans la barre d'état. */
export type StatusInfo = 'docSize' | 'dimensions' | 'layers' | 'tool';

export const DEFAULT_FOREGROUND = '#000000';
export const DEFAULT_BACKGROUND = '#FFFFFF';

export interface WorkspaceState {
  /** Outil désigné dans la barre d'outils (clé de toolFamilies). */
  railToolKey: string;
  /** Dernier outil choisi dans chaque famille (icône affichée dans la barre). */
  familyChoice: Record<string, string>;
  setRailTool: (familyId: string, toolKey: string) => void;
  /** Barre d'outils sur deux colonnes. */
  toolRailDouble: boolean;
  toggleToolRailDouble: () => void;

  /** Outil Déplacement : sélection du calque touché. */
  autoSelect: boolean;
  /** Outil Déplacement : poignées de transformation. */
  showTransformControls: boolean;
  setAutoSelect: (value: boolean) => void;
  setShowTransformControls: (value: boolean) => void;

  foreground: string;
  background: string;
  setForeground: (color: string) => void;
  swapColors: () => void;
  resetColors: () => void;

  activeTab: Record<PanelGroupId, PanelId>;
  hiddenPanels: readonly PanelId[];
  collapsedGroups: readonly PanelGroupId[];
  /** Dock réduit à une colonne d'icônes. */
  dockCollapsed: boolean;
  /** Panneau de la colonne d'icônes ouvert en fenêtre flottante. */
  openStripPanel: PanelId | null;
  showPanel: (panel: PanelId) => void;
  togglePanelVisible: (panel: PanelId) => void;
  closeGroup: (group: PanelGroupId) => void;
  toggleGroupCollapsed: (group: PanelGroupId) => void;
  toggleDockCollapsed: () => void;
  setOpenStripPanel: (panel: PanelId | null) => void;
  resetWorkspace: () => void;

  rulersVisible: boolean;
  toggleRulers: () => void;
  /** Mode d'écran : panneaux, barre d'outils et barre d'options masqués. */
  panelsHidden: boolean;
  togglePanelsHidden: () => void;
  statusInfo: StatusInfo;
  setStatusInfo: (info: StatusInfo) => void;

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
  dockCollapsed: false,
  openStripPanel: null as PanelId | null,
  toolRailDouble: false,
  rulersVisible: true,
  panelsHidden: false,
};

const initialState = {
  railToolKey: 'hand',
  familyChoice: {} as Record<string, string>,
  autoSelect: true,
  showTransformControls: true,
  foreground: DEFAULT_FOREGROUND,
  background: DEFAULT_BACKGROUND,
  ...layout,
  statusInfo: 'docSize' as StatusInfo,
  pendingDeleteLayerId: null as string | null,
  renameLayerId: null as string | null,
};

/** Groupe du dock d'un panneau, ou null pour un panneau de la colonne d'icônes. */
export function groupOf(panel: PanelId): PanelGroupId | null {
  return (Object.keys(PANEL_GROUPS) as PanelGroupId[]).find((g) => PANEL_GROUPS[g].includes(panel)) ?? null;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  ...initialState,
  setRailTool: (familyId, toolKey) =>
    set((s) => ({ railToolKey: toolKey, familyChoice: { ...s.familyChoice, [familyId]: toolKey } })),
  toggleToolRailDouble: () => set((s) => ({ toolRailDouble: !s.toolRailDouble })),

  setAutoSelect: (autoSelect) => set({ autoSelect }),
  setShowTransformControls: (showTransformControls) => set({ showTransformControls }),

  setForeground: (color) => set({ foreground: color }),
  swapColors: () => set((s) => ({ foreground: s.background, background: s.foreground })),
  resetColors: () => set({ foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND }),

  // Afficher un panneau : il redevient visible ; dans le dock, son groupe se
  // déplie et son onglet passe devant ; dans la colonne d'icônes, il s'ouvre.
  showPanel: (panel) =>
    set((s) => {
      const group = groupOf(panel);
      const hiddenPanels = s.hiddenPanels.filter((p) => p !== panel);
      if (group === null) return { hiddenPanels, openStripPanel: panel, panelsHidden: false };
      return {
        hiddenPanels,
        collapsedGroups: s.collapsedGroups.filter((g) => g !== group),
        activeTab: { ...s.activeTab, [group]: panel },
        dockCollapsed: false,
        panelsHidden: false,
      };
    }),
  togglePanelVisible: (panel) =>
    set((s) => {
      const group = groupOf(panel);
      if (s.hiddenPanels.includes(panel)) {
        const hiddenPanels = s.hiddenPanels.filter((p) => p !== panel);
        if (group === null) return { hiddenPanels };
        return {
          hiddenPanels,
          activeTab: { ...s.activeTab, [group]: panel },
          collapsedGroups: s.collapsedGroups.filter((g) => g !== group),
        };
      }
      const hiddenPanels = [...s.hiddenPanels, panel];
      if (group === null) return { hiddenPanels, openStripPanel: s.openStripPanel === panel ? null : s.openStripPanel };
      // L'onglet masqué cède sa place au premier onglet encore visible du groupe.
      const fallback = PANEL_GROUPS[group].find((p) => !hiddenPanels.includes(p));
      return {
        hiddenPanels,
        activeTab: s.activeTab[group] === panel && fallback ? { ...s.activeTab, [group]: fallback } : s.activeTab,
      };
    }),
  closeGroup: (group) =>
    set((s) => ({ hiddenPanels: [...s.hiddenPanels.filter((p) => !PANEL_GROUPS[group].includes(p)), ...PANEL_GROUPS[group]] })),
  toggleGroupCollapsed: (group) =>
    set((s) => ({
      collapsedGroups: s.collapsedGroups.includes(group)
        ? s.collapsedGroups.filter((g) => g !== group)
        : [...s.collapsedGroups, group],
    })),
  toggleDockCollapsed: () => set((s) => ({ dockCollapsed: !s.dockCollapsed })),
  setOpenStripPanel: (openStripPanel) => set({ openStripPanel }),
  resetWorkspace: () => set({ ...layout }),

  toggleRulers: () => set((s) => ({ rulersVisible: !s.rulersVisible })),
  togglePanelsHidden: () => set((s) => ({ panelsHidden: !s.panelsHidden, openStripPanel: null })),
  setStatusInfo: (statusInfo) => set({ statusInfo }),

  requestDeleteLayer: (id) => set({ pendingDeleteLayerId: id }),
  requestRenameLayer: (id) => set({ renameLayerId: id }),
}));

/** Remet l'espace de travail par défaut (tests). */
export function resetWorkspaceStore(): void {
  useWorkspaceStore.setState(initialState);
}
