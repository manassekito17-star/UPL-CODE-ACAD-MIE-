import { create } from 'zustand';

import type { ToolId } from '@/engine/canvas/gestures';

export type EditorPanel = 'layers' | 'properties';

/**
 * État d'affichage de l'espace de travail (indépendant du document).
 * - Écran large : les panneaux sont empilés dans une colonne à droite, chacun
 *   repliable ; la colonne entière peut être masquée.
 * - Écran étroit : un seul panneau à la fois, en feuille au-dessus de la
 *   barre d'outils.
 */
export interface EditorUiState {
  /** Outil actif. « Vue » par défaut tant que la sélection n'existe pas (phase 4). */
  activeTool: ToolId;
  setTool: (tool: ToolId) => void;
  /** Calque sélectionné dans le document ouvert. */
  selectedLayerId: string | null;
  selectLayer: (id: string | null) => void;
  /** Message affiché après une action refusée (calque verrouillé…). */
  notice: string | null;
  setNotice: (message: string | null) => void;
  /** Réinitialise la sélection et le message à l'ouverture d'un document. */
  resetForDocument: () => void;
  sidePanelsVisible: boolean;
  expandedPanels: Record<EditorPanel, boolean>;
  compactSheet: EditorPanel | null;
  toggleSidePanels: () => void;
  togglePanelExpanded: (panel: EditorPanel) => void;
  toggleCompactSheet: (panel: EditorPanel) => void;
  closeCompactSheet: () => void;
}

const initialState = {
  activeTool: 'pan' as ToolId,
  selectedLayerId: null as string | null,
  notice: null as string | null,
  sidePanelsVisible: true,
  expandedPanels: { layers: true, properties: true },
  compactSheet: null,
} satisfies Partial<EditorUiState>;

export const useEditorUiStore = create<EditorUiState>()((set) => ({
  ...initialState,
  setTool: (tool) => set({ activeTool: tool }),
  selectLayer: (id) => set({ selectedLayerId: id }),
  setNotice: (message) => set({ notice: message }),
  resetForDocument: () => set({ selectedLayerId: null, notice: null }),
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
