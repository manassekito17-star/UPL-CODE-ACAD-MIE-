import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { AppText, Button, Panel, PlannedFeature, Screen } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { spacing } from '@/theme';

export function HomeScreen() {
  const breakpoint = useBreakpoint();
  const actionsInRow = breakpoint !== 'compact';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} testID="home-screen">
      <View style={styles.header}>
        <Logo />
        <Button
          label="Paramètres"
          variant="ghost"
          accessibilityHint="Ouvre les paramètres de l'application"
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={styles.intro}>
        <AppText variant="display">Créer</AppText>
        <AppText tone="secondary">
          Studio graphique mobile : documents multicalques, textes, formes et retouches, sans compte et sans
          connexion.
        </AppText>
      </View>

      <View style={[styles.actions, actionsInRow && styles.actionsRow]}>
        <View style={actionsInRow ? styles.actionCell : null}>
          <Button
            label="Nouveau projet"
            fullWidth
            accessibilityHint="Choisir les dimensions et le fond d'un nouveau document"
            onPress={() => router.push('/new-document')}
          />
        </View>
        <View style={actionsInRow ? styles.actionCell : null}>
          <Button label="Importer une image" variant="secondary" fullWidth disabled hint="Disponible en phase 5" />
        </View>
      </View>

      <Panel title="Projets récents">
        <PlannedFeature
          phase={7}
          title="Liste des projets enregistrés"
          description="Miniatures, date de dernière modification, ouverture et suppression avec confirmation arriveront avec la sauvegarde locale."
        />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  intro: { gap: spacing.sm },
  actions: { gap: spacing.md },
  actionsRow: { flexDirection: 'row' },
  actionCell: { flex: 1 },
});
