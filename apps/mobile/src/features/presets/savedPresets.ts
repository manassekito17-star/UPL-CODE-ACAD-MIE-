import { create } from 'zustand';

import { RESOLUTION_LIMITS, presetFits, type SizePreset } from '@/engine/documents';
import { getSettingsRepository } from '@/services/projects';
import { createLocalId } from '@/utils/id';

const KEY = 'documentPresets';
const UNITS = ['px', 'in', 'cm', 'mm'];
const BACKGROUNDS = ['white', 'black', 'transparent', 'color'];

/** Lecture prudente : une entrée mal formée est ignorée, jamais chargée à moitié. */
export function parseSavedPresets(json: string | null): SizePreset[] {
  if (!json) return [];
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.filter((p): p is SizePreset => {
    if (typeof p !== 'object' || p === null) return false;
    const o = p as Record<string, unknown>;
    const ok =
      typeof o.id === 'string' &&
      typeof o.label === 'string' &&
      typeof o.width === 'number' &&
      typeof o.height === 'number' &&
      typeof o.unit === 'string' &&
      UNITS.includes(o.unit) &&
      typeof o.resolution === 'number' &&
      o.resolution >= RESOLUTION_LIMITS.min &&
      o.resolution <= RESOLUTION_LIMITS.max &&
      (o.background === undefined || (typeof o.background === 'string' && BACKGROUNDS.includes(o.background))) &&
      (o.backgroundColor === undefined || (typeof o.backgroundColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(o.backgroundColor)));
    return ok && presetFits(p as SizePreset);
  });
}

interface SavedPresetsState {
  presets: readonly SizePreset[];
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  /** Enregistre un préréglage ; renvoie un message d'erreur ou null. */
  add: (preset: Omit<SizePreset, 'id'>) => Promise<string | null>;
  remove: (id: string) => Promise<void>;
}

export const useSavedPresets = create<SavedPresetsState>()((set, get) => {
  const persist = async (presets: readonly SizePreset[]) => {
    await getSettingsRepository().set(KEY, JSON.stringify(presets));
    set({ presets, error: null });
  };
  return {
    presets: [],
    loaded: false,
    error: null,
    load: async () => {
      try {
        set({ presets: parseSavedPresets(await getSettingsRepository().get(KEY)), loaded: true, error: null });
      } catch (e) {
        set({ loaded: true, error: e instanceof Error ? e.message : String(e) });
      }
    },
    add: async (preset) => {
      const label = preset.label.trim();
      if (label === '') return 'Donnez un nom au préréglage.';
      const full: SizePreset = { ...preset, label, id: createLocalId('preset') };
      if (!presetFits(full)) return 'Ce format dépasse les limites de l’appareil.';
      try {
        await persist([...get().presets.filter((p) => p.label !== label), full]);
        return null;
      } catch (e) {
        return `Préréglage non enregistré : ${e instanceof Error ? e.message : String(e)}`;
      }
    },
    remove: async (id) => {
      await persist(get().presets.filter((p) => p.id !== id));
    },
  };
});

export function resetSavedPresets(): void {
  useSavedPresets.setState({ presets: [], loaded: false, error: null });
}
