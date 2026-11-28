import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { useExportStore } from '@/features/export';
import { commandClose, commandSave } from '@/features/files/fileCommands';
import { useHistory } from '@/features/history/useHistory';
import { useSaveStatus } from '@/features/persistence';
import { formatDimensions } from '@/features/projects/labels';
import { colors, spacing } from '@/theme';

export interface EditorTopBarProps {
  document: GraphicDocument;
  /** Bouton d'affichage de la colonne de panneaux (écrans larges seulement). */
  sidePanels?: { visible: boolean; onToggle: () => void };
}

export function goHome(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function EditorTopBar({ document, sidePanels }: EditorTopBarProps) {
  const history = useHistory(document.id);
  const save = useSaveStatus(document.id);
  const openExport = useExportStore((s) => s.open);
  return (
    <View style={styles.bar} testID="editor-top-bar">
      <IconButton
        icon="arrow-left"
        label="Fermer le document"
        accessibilityHint="Revient à l’accueil ; propose d’enregistrer les modifications"
        onPress={() => commandClose([document.id], goHome)}
      />
      <View style={styles.title}>
        <AppText variant="subtitle" numberOfLines={1} accessibilityRole="header">
          {document.name}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {formatDimensions(document.width, document.height)} · {save.text}
        </AppText>
      </View>
      <IconButton
        icon="undo"
        label="Annuler"
        disabled={!history.canUndo}
        accessibilityHint={history.undoLabel ? `Annuler : ${history.undoLabel}` : 'Rien à annuler'}
        onPress={history.undo}
      />
      <IconButton
        icon="redo"
        label="Rétablir"
        disabled={!history.canRedo}
        accessibilityHint={history.redoLabel ? `Rétablir : ${history.redoLabel}` : 'Rien à rétablir'}
        onPress={history.redo}
      />
      {sidePanels ? (
        <IconButton
          icon="dock-right"
          label={sidePanels.visible ? 'Masquer les panneaux' : 'Afficher les panneaux'}
          active={sidePanels.visible}
          onPress={sidePanels.onToggle}
        />
      ) : null}
      <IconButton
        icon="content-save-outline"
        label="Enregistrer"
        accessibilityHint={save.neverSaved ? 'Premier enregistrement : choisir le nom et l’emplacement' : save.text}
        onPress={() => void commandSave(document.id)}
      />
      <IconButton
        icon="export-variant"
        label="Exporter"
        accessibilityHint="Image PNG ou JPEG, à partager ou enregistrer"
        onPress={() => openExport(document.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, paddingHorizontal: spacing.xs },
});
