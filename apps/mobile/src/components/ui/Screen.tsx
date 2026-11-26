import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (formulaires, listes courtes). Faux pour l'éditeur plein écran. */
  scroll?: boolean;
  /**
   * Bords protégés par la zone sûre. Sous un en-tête de navigation, le bord
   * supérieur est déjà géré par l'en-tête.
   */
  edges?: Edge[];
  testID?: string;
}

/** Conteneur d'écran : fond du thème, zone sûre, marges et largeur de lecture. */
export function Screen({ children, scroll = true, edges = ['bottom', 'left', 'right'], testID }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safe} testID={testID}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: spacing.lg, alignItems: 'center' },
  // Sur tablette, le contenu reste lisible au lieu de s'étirer sur toute la largeur.
  column: { width: '100%', maxWidth: 720, gap: spacing.xl },
});
