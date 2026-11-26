/**
 * Limites de taille des documents, pour protéger la mémoire de l'appareil.
 *
 * Un calque matriciel pleine taille occupe largeur × hauteur × 4 octets (RGBA
 * 8 bits). Plafonner le document à 16,7 millions de pixels (4096 × 4096)
 * borne ce coût à 64 Mo par calque.
 *
 * Valeurs PROVISOIRES : elles n'ont pas encore été mesurées sur appareil. La
 * phase 9 les ajustera après des essais sur téléphones d'entrée, de milieu et
 * de haut de gamme.
 */
export const DOCUMENT_LIMITS = {
  minDimension: 1,
  /** Plus grand côté accepté (permet par exemple 8192 × 2048). */
  maxDimension: 8192,
  /** Nombre maximal de pixels (4096 × 4096). */
  maxPixels: 16_777_216,
  /** Au-delà, avertissement : le document peut être lent sur un appareil modeste. */
  warnPixels: 8_388_608,
  maxNameLength: 80,
} as const;

export const BYTES_PER_PIXEL = 4;

/** Mémoire occupée par un calque matriciel pleine taille. */
export function estimateLayerBytes(width: number, height: number): number {
  return width * height * BYTES_PER_PIXEL;
}

/** « 512 Ko », « 7,9 Mo »… (unités françaises, base 1024). */
export function formatBytes(bytes: number): string {
  const units = ['octets', 'Ko', 'Mo', 'Go'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace('.', ',');
  return `${rounded} ${units[unit]}`;
}
