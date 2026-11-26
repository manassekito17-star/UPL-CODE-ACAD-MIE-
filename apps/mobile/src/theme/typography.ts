import type { TextStyle } from 'react-native';

/**
 * Styles typographiques. Police système : aucun fichier de police à
 * télécharger ni à embarquer en V0.1.
 */
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
