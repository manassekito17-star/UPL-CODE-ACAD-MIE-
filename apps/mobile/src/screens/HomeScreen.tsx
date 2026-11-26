import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { AppText, Button, Icon, IconButton, Panel, Screen } from '@/components/ui';
import { RecentProjects } from '@/features/projects/RecentProjects';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, spacing } from '@/theme';

export function HomeScreen() {
  const breakpoint = useBreakpoint();
  const actionsInRow = breakpoint !== 'compact';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} testID="home-screen">
      <View style={styles.header}>
        <Logo />
        <IconButton
          icon="cog-outline"
          label="Paramètres"
          accessibilityHint="Ouvre les paramètres de l’application"
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={styles.intro}>
        <AppText variant="display" accessibilityRole="header">
          Créer
        </AppText>
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
            grow={actionsInRow}
            accessibilityHint="Choisir les dimensions et le fond d’un nouveau document"
            onPress={() => router.push('/new-document')}
          />
        </View>
        <View style={actionsInRow ? styles.actionCell : null}>
          <Button label="Importer une image" variant="secondary" fullWidth grow={actionsInRow} disabled hint="Disponible en phase 5" />
        </View>
      </View>

      <Panel title="Projets récents">
        <View style={styles.notice} accessible>
          <Icon name="information-outline" size={18} color={colors.warning} />
          <AppText variant="caption" tone="secondary" style={styles.noticeText}>
            Les projets restent en mémoire tant que l’application est ouverte. L’enregistrement sur l’appareil
            arrive en phase 7.
          </AppText>
        </View>
        <RecentProjects
          onOpen={(id) => router.push({ pathname: '/editor/[projectId]', params: { projectId: id } })}
        />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  intro: { gap: spacing.sm },
  actions: { gap: spacing.md },
  // Les deux actions gardent la même hauteur côte à côte.
  actionsRow: { flexDirection: 'row', alignItems: 'stretch' },
  actionCell: { flex: 1 },
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  noticeText: { flex: 1 },
});
