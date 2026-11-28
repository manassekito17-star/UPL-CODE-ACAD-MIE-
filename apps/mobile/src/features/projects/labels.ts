import type { DocumentBackground, Orientation } from '@/engine/documents';

export const BACKGROUND_LABELS: Record<DocumentBackground, string> = {
  white: 'Blanc',
  black: 'Noir',
  transparent: 'Transparent',
  color: 'Couleur personnalisée',
};

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  portrait: 'Portrait',
  landscape: 'Paysage',
};

/** « 1080 × 1920 px » */
export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height} px`;
}
