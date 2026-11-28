import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { colors, spacing } from '@/theme';

import { startPersistence, usePersistenceStore } from './persistence';

/** Affiche l'application une fois les projets de l'appareil chargés. */
export function PersistenceGate({ children }: { children: ReactNode }) {
  const phase = usePersistenceStore((s) => s.phase);
  const loadError = usePersistenceStore((s) => s.loadError);
  useEffect(() => {
    void startPersistence();
  }, []);

  if (phase === 'ready') return children;
  if (phase === 'failed') {
    return (
      <View style={styles.center} testID="persistence-failed">
        <AppText variant="title" accessibilityRole="header">
          Projets inaccessibles
        </AppText>
        <AppText tone="secondary" style={styles.text}>
          Les projets enregistrés sur l’appareil n’ont pas pu être lus : {loadError}. Rien n’a été modifié ni supprimé.
        </AppText>
        <Button label="Réessayer" onPress={() => void startPersistence()} />
      </View>
    );
  }
  // Avant le premier démarrage : rien (l'effet ci-dessus le lance aussitôt).
  if (phase === 'idle') return null;
  return (
    <View style={styles.center} testID="persistence-loading" accessibilityLabel="Chargement des projets">
      <ActivityIndicator color={colors.accent} />
      <AppText tone="secondary">Chargement des projets…</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.background },
  text: { textAlign: 'center' },
});
