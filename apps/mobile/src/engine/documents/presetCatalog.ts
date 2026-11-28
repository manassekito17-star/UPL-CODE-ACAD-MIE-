import type { DocumentBackground } from './types';
import { DOCUMENT_LIMITS } from './limits';
import { toPixels, type LengthUnit } from './units';

/**
 * Préréglages de la fenêtre « Nouveau document », par catégorie. Les tailles
 * physiques (cm, mm, pouces) sont converties en pixels avec la résolution du
 * préréglage. Tous respectent les limites mémoire de l'appareil (vérifié par
 * les tests) : un format qui les dépasserait à 300 ppp est proposé à une
 * résolution plus basse, et le libellé le dit.
 */

export type PresetCategory = 'recent' | 'saved' | 'photo' | 'print' | 'illustration' | 'web' | 'mobile' | 'film';

export const PRESET_CATEGORIES: readonly { id: PresetCategory; label: string }[] = [
  { id: 'recent', label: 'Récent' },
  { id: 'saved', label: 'Enregistré' },
  { id: 'photo', label: 'Photo' },
  { id: 'print', label: 'Impression' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'film', label: 'Film et vidéo' },
];

export interface SizePreset {
  id: string;
  label: string;
  /** Dans `unit`. */
  width: number;
  height: number;
  unit: LengthUnit;
  /** Pixels par pouce. */
  resolution: number;
  background?: DocumentBackground;
  backgroundColor?: string;
  /** Précision affichée sous le nom (ex. limite mémoire). */
  note?: string;
}

const p = (id: string, label: string, width: number, height: number, unit: LengthUnit, resolution: number, note?: string): SizePreset => ({
  id,
  label,
  width,
  height,
  unit,
  resolution,
  ...(note ? { note } : {}),
});

export const PRESET_CATALOG: Record<Exclude<PresetCategory, 'recent' | 'saved'>, readonly SizePreset[]> = {
  photo: [
    p('photo-10x15', '10 × 15 cm', 10, 15, 'cm', 300),
    p('photo-13x18', '13 × 18 cm', 13, 18, 'cm', 300),
    p('photo-20x30', '20 × 30 cm', 20, 30, 'cm', 300),
    p('photo-3000x2000', '3000 × 2000 px', 3000, 2000, 'px', 300),
  ],
  print: [
    p('print-a4', 'A4', 210, 297, 'mm', 300),
    p('print-a3', 'A3', 297, 420, 'mm', 250, '250 ppp : limite mémoire de l’appareil'),
    p('print-a5', 'A5', 148, 210, 'mm', 300),
    p('print-letter', 'Lettre US', 8.5, 11, 'in', 300),
    p('print-poster', 'Affiche 50 × 70 cm', 50, 70, 'cm', 150),
  ],
  illustration: [
    p('illu-a4', 'Illustration A4', 210, 297, 'mm', 300),
    p('illu-square', 'Carré 3000 px', 3000, 3000, 'px', 300),
    p('illu-tablet', 'Tablette 2732 × 2048 px', 2732, 2048, 'px', 264),
    p('illu-cover', 'Couverture 1600 × 2400 px', 1600, 2400, 'px', 300),
  ],
  web: [
    p('web-1920', 'Grand écran 1920 × 1080', 1920, 1080, 'px', 72),
    p('web-1366', 'Ordinateur portable 1366 × 768', 1366, 768, 'px', 72),
    p('web-1080', 'Publication carrée 1080 × 1080', 1080, 1080, 'px', 72),
    p('web-story', 'Story 1080 × 1920', 1080, 1920, 'px', 72),
    p('web-banner', 'Bannière 1500 × 500', 1500, 500, 'px', 72),
  ],
  mobile: [
    p('mobile-390', 'Téléphone 390 × 844', 390, 844, 'px', 72),
    p('mobile-1080', 'Android 1080 × 1920', 1080, 1920, 'px', 72),
    p('mobile-1290', 'iPhone 1290 × 2796', 1290, 2796, 'px', 72),
    p('mobile-tablet', 'Tablette 1640 × 2360', 1640, 2360, 'px', 72),
  ],
  film: [
    p('film-hd', 'HD 1280 × 720', 1280, 720, 'px', 72),
    p('film-fullhd', 'Full HD 1920 × 1080', 1920, 1080, 'px', 72),
    p('film-4k', '4K UHD 3840 × 2160', 3840, 2160, 'px', 72),
    p('film-vertical', 'Vertical 1080 × 1920', 1080, 1920, 'px', 72),
  ],
};

/** Taille en pixels d'un préréglage. */
export function presetPixels(preset: Pick<SizePreset, 'width' | 'height' | 'unit' | 'resolution'>): { width: number; height: number } {
  return { width: toPixels(preset.width, preset.unit, preset.resolution), height: toPixels(preset.height, preset.unit, preset.resolution) };
}

/** Le préréglage tient-il dans les limites de l'appareil ? */
export function presetFits(preset: SizePreset): boolean {
  const { width, height } = presetPixels(preset);
  return width >= 1 && height >= 1 && width <= DOCUMENT_LIMITS.maxDimension && height <= DOCUMENT_LIMITS.maxDimension && width * height <= DOCUMENT_LIMITS.maxPixels;
}
