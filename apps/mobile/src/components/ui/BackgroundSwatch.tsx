import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { DocumentBackground } from '@/engine/documents';
import { colors } from '@/theme';

export interface BackgroundSwatchProps {
  background: DocumentBackground;
  /** Couleur du fond `color`. */
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

const FILL: Record<Exclude<DocumentBackground, 'transparent' | 'color'>, string> = {
  white: '#FFFFFF',
  black: '#000000',
};

/**
 * Aperçu d'un fond de document. La transparence est représentée par un
 * damier, convention des logiciels graphiques.
 */
export function BackgroundSwatch({ background, color, style, testID }: BackgroundSwatchProps) {
  if (background !== 'transparent') {
    const fill = background === 'color' ? (color ?? '#FFFFFF') : FILL[background];
    return <View testID={testID} style={[styles.base, { backgroundColor: fill }, style]} />;
  }
  // React Native n'a pas de motif répété : le damier est une grille fixe de
  // 8 × 8 cases qui s'étire avec la vignette (64 vues, coût négligeable).
  const cells = 8;
  return (
    <View testID={testID} style={[styles.base, styles.checkerBase, style]}>
      {Array.from({ length: cells }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: cells }, (__, col) => (
            <View
              key={col}
              style={[styles.cell, (row + col) % 2 === 0 ? styles.light : styles.dark]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  checkerBase: { backgroundColor: colors.checkerDark },
  row: { flex: 1, flexDirection: 'row' },
  cell: { flex: 1 },
  light: { backgroundColor: colors.checkerLight },
  dark: { backgroundColor: colors.checkerDark },
});
