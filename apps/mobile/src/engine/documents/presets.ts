import { DOCUMENT_LIMITS } from './limits';

export interface DocumentPreset {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
}

/** Formats courants (pixels). Tous respectent DOCUMENT_LIMITS. */
export const FIXED_PRESETS: readonly DocumentPreset[] = [
  { id: 'square', label: 'Carré', description: 'Publication 1:1', width: 1080, height: 1080 },
  { id: 'story', label: 'Story', description: 'Format vertical 9:16', width: 1080, height: 1920 },
  { id: 'full-hd', label: 'Full HD', description: 'Écran 16:9', width: 1920, height: 1080 },
  { id: 'uhd-4k', label: '4K UHD', description: 'Écran 16:9 haute définition', width: 3840, height: 2160 },
  { id: 'a4-300', label: 'A4 300 dpi', description: 'Impression 21 × 29,7 cm', width: 2480, height: 3508 },
];

export const SCREEN_PRESET_ID = 'screen';

/**
 * Format « écran de l'appareil » : la taille de la fenêtre en pixels physiques
 * (points × densité), en portrait, réduite proportionnellement si elle dépasse
 * les limites mémoire.
 */
export function screenPreset(widthDp: number, heightDp: number, pixelRatio: number): DocumentPreset {
  const ratio = Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
  let width = Math.round(Math.min(widthDp, heightDp) * ratio);
  let height = Math.round(Math.max(widthDp, heightDp) * ratio);

  const pixels = width * height;
  const sideScale = DOCUMENT_LIMITS.maxDimension / Math.max(width, height, 1);
  const areaScale = Math.sqrt(DOCUMENT_LIMITS.maxPixels / Math.max(pixels, 1));
  const scale = Math.min(1, sideScale, areaScale);
  if (scale < 1) {
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }
  width = Math.max(DOCUMENT_LIMITS.minDimension, width);
  height = Math.max(DOCUMENT_LIMITS.minDimension, height);

  return {
    id: SCREEN_PRESET_ID,
    label: 'Écran',
    description: 'Résolution de cet appareil',
    width,
    height,
  };
}
