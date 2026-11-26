import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, ConfirmDialog, Icon, IconButton } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { useDocumentStore } from '@/stores/documentStore';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/date';

import { DocumentThumbnail } from './DocumentThumbnail';
import { BACKGROUND_LABELS, formatDimensions } from './labels';

export interface RecentProjectsProps {
  onOpen: (id: string) => void;
}

/** Liste des projets, du plus récent au plus ancien, avec suppression confirmée. */
export function RecentProjects({ onOpen }: RecentProjectsProps) {
  const documents = useDocumentStore((s) => s.documents);
  const order = useDocumentStore((s) => s.order);
  const removeDocument = useDocumentStore((s) => s.removeDocument);
  const items = useMemo(
    () => order.map((id) => documents[id]).filter((d): d is GraphicDocument => d !== undefined),
    [documents, order],
  );

  // On mémorise le document entier (et pas un index) : la confirmation porte
  // toujours sur l'élément affiché dans la boîte, même si la liste change.
  const [pendingDeletion, setPendingDeletion] = useState<GraphicDocument | null>(null);

  if (items.length === 0) {
    return (
      <View style={styles.empty} testID="recent-projects-empty">
        <Icon name="file-image-outline" size={32} color={colors.textSecondary} />
        <AppText tone="secondary" style={styles.center}>
          Aucun projet pour l’instant. Créez un document pour commencer.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((doc) => (
        <View key={doc.id} style={styles.row} testID={`project-${doc.id}`}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir ${doc.name}`}
            accessibilityHint={`${formatDimensions(doc.width, doc.height)}, modifié le ${formatDateTime(doc.updatedAt)}`}
            onPress={() => onOpen(doc.id)}
            style={({ pressed }) => [styles.open, pressed && styles.pressed]}
          >
            <DocumentThumbnail document={doc} />
            <View style={styles.meta}>
              <AppText variant="subtitle" numberOfLines={1}>
                {doc.name}
              </AppText>
              <AppText variant="caption" tone="secondary" numberOfLines={2}>
                {formatDimensions(doc.width, doc.height)} · Fond {BACKGROUND_LABELS[doc.background].toLowerCase()}
              </AppText>
              <AppText variant="caption" tone="secondary" numberOfLines={2}>
                Modifié le {formatDateTime(doc.updatedAt)}
              </AppText>
            </View>
          </Pressable>
          <IconButton
            icon="delete-outline"
            label={`Supprimer ${doc.name}`}
            tone="danger"
            onPress={() => setPendingDeletion(doc)}
          />
        </View>
      ))}

      <ConfirmDialog
        visible={pendingDeletion !== null}
        title="Supprimer le projet ?"
        message={
          pendingDeletion
            ? `« ${pendingDeletion.name} » (${formatDimensions(pendingDeletion.width, pendingDeletion.height)}) sera supprimé définitivement.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPendingDeletion(null)}
        onConfirm={() => {
          if (pendingDeletion) removeDocument(pendingDeletion.id);
          setPendingDeletion(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingRight: spacing.xs,
  },
  open: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  pressed: { backgroundColor: colors.panelPressed },
  meta: { flex: 1, gap: spacing.xxs },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
});
