/** Échelle d'espacement (multiples de 4 px). */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

/**
 * Taille minimale d'une cible tactile : 48 dp (Material Design),
 * au-dessus des 44 pt recommandés par Apple.
 */
export const touchTarget = 48;

/** Largeur à partir de laquelle les panneaux restent ouverts côte à côte. */
export const breakpoints = {
  /** Téléphone en portrait. */
  compact: 0,
  /** Grand téléphone en paysage, petite tablette. */
  medium: 600,
  /** Tablette. */
  expanded: 900,
} as const;
