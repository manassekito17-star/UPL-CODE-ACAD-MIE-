import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { AppText, Button, ConfirmDialog, Icon, IconButton, Panel, Screen } from '@/components/ui';
import { openImageAsNewDocument, useImageImport } from '@/features/image-import/useImageImport';
import { removeUnreadable, usePersistenceStore } from '@/features/persistence';
import { RecentProjects } from '@/features/projects/RecentProjects';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { UnreadableProject } from '@/services/projects';
import { colors, spacing } from '@/theme';

export function HomeScreen() {
  const breakpoint = useBreakpoint();
  const actionsInRow = breakpoint !== 'compact';
  const imageImport = useImageImport();

  const importImage = async () => {
    const { asset } = await imageImport.pick();
    if (asset) openImageAsNewDocument(asset);
  };

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
          Documents multicalques, textes, formes et retouches, sans compte et sans connexion.
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
          <Button
            label="Importer une image"
            variant="secondary"
            fullWidth
            grow={actionsInRow}
            disabled={imageImport.importing}
            hint={imageImport.importing ? 'Import en cours…' : 'Nouveau document aux dimensions de la photo'}
            accessibilityHint="Ouvre la galerie ; l’original de la photo n’est jamais modifié"
            onPress={() => void importImage()}
          />
        </View>
      </View>

      {imageImport.error ? (
        <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" size={18} color={colors.danger} />
          <AppText variant="caption" tone="danger" style={styles.noticeText}>
            {imageImport.error}
          </AppText>
        </View>
      ) : null}

      <Panel title="Projets récents">
        <UnreadableProjects />
        <RecentProjects
          onOpen={(id) => router.push({ pathname: '/editor/[projectId]', params: { projectId: id } })}
        />
      </Panel>
    </Screen>
  );
}

/** Projets présents sur l'appareil mais illisibles : signalés, conservés, supprimables sur demande. */
function UnreadableProjects() {
  const unreadable = usePersistenceStore((s) => s.unreadable);
  const [pending, setPending] = useState<UnreadableProject | null>(null);
  if (unreadable.length === 0) return null;
  return (
    <View style={styles.unreadable} testID="unreadable-projects">
      {unreadable.map((p) => (
        <View key={p.id} style={styles.notice} accessibilityRole="alert">
          <Icon name="alert-circle-outline" size={18} color={colors.warning} />
          <AppText variant="caption" tone="secondary" style={styles.noticeText}>
            « {p.name} » n’a pas pu être ouvert : {p.message} Il est conservé tel quel sur l’appareil.
          </AppText>
          <IconButton icon="delete-outline" label={`Supprimer le projet illisible ${p.name}`} tone="danger" onPress={() => setPending(p)} />
        </View>
      ))}
      <ConfirmDialog
        visible={pending !== null}
        title="Supprimer le projet illisible ?"
        message={pending ? `« ${pending.name} » sera supprimé définitivement de l’appareil.` : ''}
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void removeUnreadable(pending.id);
          setPending(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  unreadable: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  intro: { gap: spacing.sm },
  actions: { gap: spacing.md },
  // Les deux actions gardent la même hauteur côte à côte.
  actionsRow: { flexDirection: 'row', alignItems: 'stretch' },
  actionCell: { flex: 1 },
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  noticeText: { flex: 1 },
});
