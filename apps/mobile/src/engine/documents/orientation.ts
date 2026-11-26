import type { Orientation } from './types';

/** Un document carré est considéré comme portrait. */
export function orientationOf(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

/** Échange largeur et hauteur si nécessaire pour obtenir l'orientation voulue. */
export function withOrientation(
  width: number,
  height: number,
  orientation: Orientation,
): { width: number; height: number } {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  return orientation === 'landscape' ? { width: long, height: short } : { width: short, height: long };
}
