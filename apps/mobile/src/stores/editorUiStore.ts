import { create } from 'zustand';

export type EditorPanel = 'layers' | 'properties';

/**
 * État d'affichage de l'espace de travail (indépendant du document).
 * - Écran large : les panneaux sont empilés dans une colonne à droite, chacun
 *   repliable ; la colonne entière peut être masquée.
 * - Écran étroit : un seul panneau à la fois, en feuille au-dessus de la
 *   barre d'outils.
 */
export interface EditorUiState {
  sidePanelsVisible: boolean;
  expandedPanels: Record<EditorPanel, boolean>;
  compactSheet: EditorPanel | null;
  toggleSidePanels: () => void;
  togglePanelExpanded: (panel: EditorPanel) => void;
  toggleCompactSheet: (panel: EditorPanel) => void;
  closeCompactSheet: () => void;
}

const initialState = {
  sidePanelsVisible: true,
  expandedPanels: { layers: true, properties: true },
  compactSheet: null,
} satisfies Partial<EditorUiState>;

export const useEditorUiStore = create<EditorUiState>()((set) => ({
  ...initialState,
  toggleSidePanels: () => set((s) => ({ sidePanelsVisible: !s.sidePanelsVisible })),
  togglePanelExpanded: (panel) =>
    set((s) => ({ expandedPanels: { ...s.expandedPanels, [panel]: !s.expandedPanels[panel] } })),
  toggleCompactSheet: (panel) => set((s) => ({ compactSheet: s.compactSheet === panel ? null : panel })),
  closeCompactSheet: () => set({ compactSheet: null }),
}));

/** Remet l'affichage par défaut (tests). */
export function resetEditorUiStore(): void {
  useEditorUiStore.setState(initialState);
}
