import { create } from 'zustand';

import { DEFAULT_EXPORT, type ExportSettings } from '@/engine/renderer';

export interface ExportState {
  /** Document dont la boîte « Exporter » est ouverte. */
  openFor: string | null;
  /** Derniers réglages choisis (repris à la prochaine ouverture). */
  settings: ExportSettings;
  open: (documentId: string) => void;
  close: () => void;
  update: (patch: Partial<ExportSettings>) => void;
}

export const useExportStore = create<ExportState>()((set) => ({
  openFor: null,
  settings: DEFAULT_EXPORT,
  open: (openFor) => set({ openFor }),
  close: () => set({ openFor: null }),
  update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
}));

export function resetExportStore(): void {
  useExportStore.setState({ openFor: null, settings: DEFAULT_EXPORT });
}
