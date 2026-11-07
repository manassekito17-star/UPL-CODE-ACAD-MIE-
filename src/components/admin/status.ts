export const STATUS_TONES = { brouillon: "gris", en_revision: "orange", publie: "vert", archive: "rouge" } as const;
export type StatusKey = keyof typeof STATUS_TONES;
