import { ScrollView, StyleSheet } from 'react-native';

import { IconButton } from '@/components/ui';
import { colors, spacing } from '@/theme';

import { TOOLS } from './tools';

export interface EditorToolbarProps {
  orientation: 'vertical' | 'horizontal';
}

/**
 * Barre d'outils. Les outils sont visibles pour annoncer l'organisation de
 * l'espace de travail, mais désactivés tant que leur phase n'est pas livrée.
 */
export function EditorToolbar({ orientation }: EditorToolbarProps) {
  const horizontal = orientation === 'horizontal';
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={horizontal ? styles.horizontal : styles.vertical}
      contentContainerStyle={[styles.content, horizontal && styles.contentRow]}
      accessibilityRole="toolbar"
      accessibilityLabel="Outils"
      testID="editor-toolbar"
    >
      {TOOLS.map((tool) => (
        <IconButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          showLabel
          disabled
          accessibilityHint={`Disponible en phase ${tool.availableInPhase}`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  vertical: {
    flexGrow: 0,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  horizontal: { flexGrow: 1 },
  content: { padding: spacing.xs, gap: spacing.xs, alignItems: 'center' },
  contentRow: { flexDirection: 'row' },
});
