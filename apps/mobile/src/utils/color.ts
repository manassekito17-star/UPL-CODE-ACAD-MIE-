/**
 * Outils de couleur purs (sans dépendance à React Native), réutilisables
 * par le thème, les tests d'accessibilité et, plus tard, le moteur.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Convertit « #RGB » ou « #RRGGBB » en composantes 0–255. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX.exec(hex.trim());
  if (!match?.[1]) {
    throw new Error(`Couleur hexadécimale invalide : « ${hex} »`);
  }
  const digits = match[1];
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((c) => c + c)
          .join('')
      : digits;
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG 2.x (0 = noir, 1 = blanc). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** Rapport de contraste WCAG entre deux couleurs (1 à 21). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}
