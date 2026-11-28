/**
 * Unités de taille et de résolution. Les documents sont toujours en pixels ;
 * pouces, centimètres et millimètres sont convertis avec la résolution
 * (pixels par pouce), comme dans les logiciels de retouche.
 */

export type LengthUnit = 'px' | 'in' | 'cm' | 'mm';
export type ResolutionUnit = 'ppi' | 'ppcm';

export const LENGTH_UNIT_LABELS: Record<LengthUnit, string> = { px: 'Pixels', in: 'Pouces', cm: 'Centimètres', mm: 'Millimètres' };
export const RESOLUTION_UNIT_LABELS: Record<ResolutionUnit, string> = { ppi: 'Pixels/pouce', ppcm: 'Pixels/cm' };

const PER_INCH: Record<Exclude<LengthUnit, 'px'>, number> = { in: 1, cm: 2.54, mm: 25.4 };

/** Valeur dans `unit` → pixels (arrondis), pour une résolution en pixels par pouce. */
export function toPixels(value: number, unit: LengthUnit, ppi: number): number {
  if (unit === 'px') return Math.round(value);
  return Math.round((value / PER_INCH[unit]) * ppi);
}

/** Pixels → valeur dans `unit`. */
export function fromPixels(px: number, unit: LengthUnit, ppi: number): number {
  if (unit === 'px') return px;
  return (px / ppi) * PER_INCH[unit];
}

export function toPpi(value: number, unit: ResolutionUnit): number {
  return unit === 'ppi' ? value : value * 2.54;
}

export function fromPpi(ppi: number, unit: ResolutionUnit): number {
  return unit === 'ppi' ? ppi : ppi / 2.54;
}

/** « 21 », « 29,7 », « 8,5 » : deux décimales au plus, virgule française. */
export function formatNumber(value: number, decimals = 2): string {
  const factor = 10 ** decimals;
  return String(Math.round(value * factor) / factor).replace('.', ',');
}

/** Saisie « 29,7 » ou « 29.7 » → 29.7 ; null si ce n'est pas un nombre positif. */
export function parsePositive(text: string): number | null {
  const n = Number(text.replace(',', '.').trim());
  return text.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
}
