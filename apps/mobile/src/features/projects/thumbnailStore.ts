import { create } from 'zustand';

/** Version de la miniature de chaque projet : change à chaque réécriture (relecture de l'image). */
export const useThumbnailStore = create<{ versions: Record<string, number>; bump: (id: string) => void; drop: (id: string) => void }>()(
  (set) => ({
    versions: {},
    bump: (id) => set((s) => ({ versions: { ...s.versions, [id]: (s.versions[id] ?? 0) + 1 } })),
    drop: (id) =>
      set((s) => {
        const { [id]: _gone, ...versions } = s.versions;
        return { versions };
      }),
  }),
);
