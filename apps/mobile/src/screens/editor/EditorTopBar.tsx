import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
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
  return (
    <View style={styles.bar} testID="editor-top-bar">
      <IconButton icon="arrow-left" label="Retour à l’accueil" onPress={goHome} />
      <View style={styles.title}>
        <AppText variant="subtitle" numberOfLines={1} accessibilityRole="header">
          {document.name}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {formatDimensions(document.width, document.height)}
        </AppText>
      </View>
      <IconButton icon="undo" label="Annuler" disabled accessibilityHint="Disponible en phase 6" />
      <IconButton icon="redo" label="Rétablir" disabled accessibilityHint="Disponible en phase 6" />
      {sidePanels ? (
        <IconButton
          icon="dock-right"
          label={sidePanels.visible ? 'Masquer les panneaux' : 'Afficher les panneaux'}
          active={sidePanels.visible}
          onPress={sidePanels.onToggle}
        />
      ) : null}
      <IconButton icon="export-variant" label="Exporter" disabled accessibilityHint="Disponible en phase 8" />
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
