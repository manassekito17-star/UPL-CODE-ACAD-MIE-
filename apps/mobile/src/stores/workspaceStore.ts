import { create } from 'zustand';

import { DEFAULT_GRID, type GridSettings } from '@/engine/guides';

import {
  DEFAULT_LAYOUT,
  groupOf as groupIn,
  layoutOf,
  moveGroup,
  movePanel,
  type PanelGroupId,
  type PanelId,
  type PanelTarget,
  type WorkspaceLayout,
} from './workspaceLayout';

/**
 * État de l'espace de travail tablette et grand écran : outil choisi dans
 * chaque famille, options de l'outil Déplacement, couleurs de premier plan et
 * d'arrière-plan, panneaux (onglet actif, visibilité, repli, dock réduit en
 * icônes, colonne d'icônes), règles, mode d'écran, barre d'état, et boîtes de
 * dialogue ouvertes depuis les menus.
 */

export {
  ALL_PANELS,
  DEFAULT_LAYOUT,
  PANEL_GROUPS,
  STRIP_PANELS,
  type DockGroup,
  type PanelGroupId,
  type PanelId,
  type PanelTarget,
  type WorkspaceLayout,
} from './workspaceLayout';

/** Espace de travail fourni par l'application (disposition par défaut). */
export const DEFAULT_WORKSPACE = 'Essentiels';
export const WORKSPACE_NAME_MAX = 40;

export interface SavedWorkspace {
  name: string;
  layout: WorkspaceLayout;
}

/** Information affichée dans la barre d'état. */
export type StatusInfo = 'docSize' | 'dimensions' | 'layers' | 'tool';

export const DEFAULT_FOREGROUND = '#000000';
export const DEFAULT_BACKGROUND = '#FFFFFF';

export interface WorkspaceState extends WorkspaceLayout {
  /** Outil désigné dans la barre d'outils (clé de toolFamilies). */
  railToolKey: string;
  /** Dernier outil choisi dans chaque famille (icône affichée dans la barre). */
  familyChoice: Record<string, string>;
  setRailTool: (familyId: string, toolKey: string) => void;
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

  /** Panneau de la colonne d'icônes ouvert en fenêtre flottante. */
  openStripPanel: PanelId | null;
  showPanel: (panel: PanelId) => void;
  togglePanelVisible: (panel: PanelId) => void;
  closeGroup: (group: PanelGroupId) => void;
  toggleGroupCollapsed: (group: PanelGroupId) => void;
  toggleDockCollapsed: () => void;
  setOpenStripPanel: (panel: PanelId | null) => void;
  /** Déplace un panneau vers un groupe d'onglets, la colonne d'icônes ou un nouveau groupe. */
  movePanel: (panel: PanelId, target: PanelTarget) => void;
  /** Monte (-1) ou descend (+1) un groupe d'onglets dans le dock. */
  moveGroup: (group: PanelGroupId, direction: -1 | 1) => void;
  /** Remet la disposition enregistrée de l'espace de travail actuel. */
  resetWorkspace: () => void;

  /** Espace de travail actuel (DEFAULT_WORKSPACE ou un espace enregistré). */
  workspaceName: string;
  /** Espaces enregistrés par l'utilisateur, dans l'ordre de création. */
  savedWorkspaces: readonly SavedWorkspace[];
  /** Enregistre la disposition actuelle sous ce nom (remplace un espace du même nom) ; renvoie une erreur ou null. */
  saveWorkspace: (name: string) => string | null;
  applyWorkspace: (name: string) => void;
  deleteWorkspace: (name: string) => void;
  /** Boîte ouverte depuis Fenêtre › Espace de travail. */
  workspaceDialog: 'new' | 'delete' | null;
  setWorkspaceDialog: (dialog: 'new' | 'delete' | null) => void;

  rulersVisible: boolean;
  toggleRulers: () => void;
  /** Mode d'écran : panneaux, barre d'outils et barre d'options masqués. */
  panelsHidden: boolean;
  togglePanelsHidden: () => void;
  statusInfo: StatusInfo;
  setStatusInfo: (info: StatusInfo) => void;

  /** Affichage › Afficher › Grille. */
  gridVisible: boolean;
  /** Affichage › Afficher › Repères. */
  guidesVisible: boolean;
  /** Affichage › Verrouiller les repères : ils ne se déplacent plus à l'outil Déplacement. */
  guidesLocked: boolean;
  /** Affichage › Magnétisme. */
  snapEnabled: boolean;
  grid: GridSettings;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleGuidesLocked: () => void;
  toggleSnap: () => void;
  setGrid: (grid: GridSettings) => void;
  /** Boîte ouverte depuis le menu Affichage. */
  viewDialog: 'newGuide' | 'grid' | null;
  setViewDialog: (dialog: 'newGuide' | 'grid' | null) => void;

  /** Documents ouverts en onglets (espace studio), dans l'ordre des onglets. */
  openDocuments: readonly string[];
  openDocument: (id: string) => void;
  /** Retire l'onglet ; renvoie le document à afficher ensuite (onglet voisin), ou null. */
  closeDocument: (id: string) => string | null;
  closeAllDocuments: () => void;
  /** Boîte « Enregistrer sous » / « Dupliquer » ouverte depuis le menu Fichier. */
  saveAsRequest: { documentId: string; mode: 'saveAs' | 'duplicate' } | null;
  requestSaveAs: (request: { documentId: string; mode: 'saveAs' | 'duplicate' } | null) => void;

  /** Calque visé par une suppression ou un renommage demandé depuis un menu. */
  pendingDeleteLayerId: string | null;
  renameLayerId: string | null;
  requestDeleteLayer: (id: string | null) => void;
  requestRenameLayer: (id: string | null) => void;
}

/** Affichage remis par « Réinitialiser l'espace de travail », en plus de la disposition. */
const resetView = {
  openStripPanel: null as PanelId | null,
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
  ...DEFAULT_LAYOUT,
  ...resetView,
  workspaceName: DEFAULT_WORKSPACE,
  savedWorkspaces: [] as readonly SavedWorkspace[],
  workspaceDialog: null as 'new' | 'delete' | null,
  statusInfo: 'docSize' as StatusInfo,
  gridVisible: false,
  guidesVisible: true,
  guidesLocked: false,
  snapEnabled: true,
  grid: DEFAULT_GRID,
  viewDialog: null as 'newGuide' | 'grid' | null,
  openDocuments: [] as readonly string[],
  saveAsRequest: null as { documentId: string; mode: 'saveAs' | 'duplicate' } | null,
  pendingDeleteLayerId: null as string | null,
  renameLayerId: null as string | null,
};

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
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
      const group = groupIn(s, panel);
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
      const group = groupIn(s, panel);
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
      const fallback = s.groups.find((g) => g.id === group)?.panels.find((p) => !hiddenPanels.includes(p));
      return {
        hiddenPanels,
        activeTab: s.activeTab[group] === panel && fallback ? { ...s.activeTab, [group]: fallback } : s.activeTab,
      };
    }),
  closeGroup: (group) =>
    set((s) => {
      const panels = s.groups.find((g) => g.id === group)?.panels ?? [];
      return { hiddenPanels: [...s.hiddenPanels.filter((p) => !panels.includes(p)), ...panels] };
    }),
  toggleGroupCollapsed: (group) =>
    set((s) => ({
      collapsedGroups: s.collapsedGroups.includes(group)
        ? s.collapsedGroups.filter((g) => g !== group)
        : [...s.collapsedGroups, group],
    })),
  toggleDockCollapsed: () => set((s) => ({ dockCollapsed: !s.dockCollapsed })),
  setOpenStripPanel: (openStripPanel) => set({ openStripPanel }),
  movePanel: (panel, target) => set((s) => ({ ...movePanel(layoutOf(s), panel, target), openStripPanel: s.openStripPanel === panel ? null : s.openStripPanel })),
  moveGroup: (group, direction) => set((s) => moveGroup(layoutOf(s), group, direction)),
  resetWorkspace: () =>
    set((s) => ({ ...(s.savedWorkspaces.find((w) => w.name === s.workspaceName)?.layout ?? DEFAULT_LAYOUT), ...resetView })),

  saveWorkspace: (raw) => {
    const name = raw.trim();
    if (name === '') return 'Donnez un nom à l’espace de travail.';
    if (name.length > WORKSPACE_NAME_MAX) return `Le nom ne doit pas dépasser ${WORKSPACE_NAME_MAX} caractères.`;
    if (name.toLocaleLowerCase('fr') === DEFAULT_WORKSPACE.toLocaleLowerCase('fr')) return `« ${DEFAULT_WORKSPACE} » est l’espace fourni par l’application : choisissez un autre nom.`;
    set((s) => {
      const entry = { name, layout: layoutOf(s) };
      const exists = s.savedWorkspaces.some((w) => w.name === name);
      return {
        savedWorkspaces: exists ? s.savedWorkspaces.map((w) => (w.name === name ? entry : w)) : [...s.savedWorkspaces, entry],
        workspaceName: name,
      };
    });
    return null;
  },
  applyWorkspace: (name) =>
    set((s) => {
      const saved = s.savedWorkspaces.find((w) => w.name === name);
      if (!saved && name !== DEFAULT_WORKSPACE) return s;
      return { ...(saved?.layout ?? DEFAULT_LAYOUT), openStripPanel: null, workspaceName: name };
    }),
  deleteWorkspace: (name) =>
    set((s) => ({
      savedWorkspaces: s.savedWorkspaces.filter((w) => w.name !== name),
      workspaceName: s.workspaceName === name ? DEFAULT_WORKSPACE : s.workspaceName,
    })),
  setWorkspaceDialog: (workspaceDialog) => set({ workspaceDialog }),

  toggleRulers: () => set((s) => ({ rulersVisible: !s.rulersVisible })),
  togglePanelsHidden: () => set((s) => ({ panelsHidden: !s.panelsHidden, openStripPanel: null })),
  setStatusInfo: (statusInfo) => set({ statusInfo }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleGuides: () => set((s) => ({ guidesVisible: !s.guidesVisible })),
  toggleGuidesLocked: () => set((s) => ({ guidesLocked: !s.guidesLocked })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setGrid: (grid) => set({ grid, gridVisible: true }),
  setViewDialog: (viewDialog) => set({ viewDialog }),

  openDocument: (id) => set((s) => (s.openDocuments.includes(id) ? s : { openDocuments: [...s.openDocuments, id] })),
  closeDocument: (id) => {
    const open = get().openDocuments;
    const at = open.indexOf(id);
    const rest = open.filter((d) => d !== id);
    set({ openDocuments: rest });
    return rest[Math.min(Math.max(at, 0), rest.length - 1)] ?? null;
  },
  closeAllDocuments: () => set({ openDocuments: [] }),
  requestSaveAs: (saveAsRequest) => set({ saveAsRequest }),

  requestDeleteLayer: (id) => set({ pendingDeleteLayerId: id }),
  requestRenameLayer: (id) => set({ renameLayerId: id }),
}));

/** Remet l'espace de travail par défaut (tests). */
export function resetWorkspaceStore(): void {
  useWorkspaceStore.setState(initialState);
}
