import { ScrollView, StyleSheet } from 'react-native';

import { IconButton } from '@/components/ui';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { colors, spacing } from '@/theme';

import { TOOLS, isToolAvailable } from './tools';

export interface EditorToolbarProps {
  orientation: 'vertical' | 'horizontal';
}

/**
 * Barre d'outils. Les outils des phases non livrées restent visibles mais
 * désactivés, avec la phase annoncée aux lecteurs d'écran.
 */
export function EditorToolbar({ orientation }: EditorToolbarProps) {
  const horizontal = orientation === 'horizontal';
  const activeTool = useEditorUiStore((s) => s.activeTool);
  const setTool = useEditorUiStore((s) => s.setTool);
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
      {TOOLS.map((tool) => {
        const available = isToolAvailable(tool);
        return (
          <IconButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            showLabel
            disabled={!available}
            active={available && activeTool === tool.id}
            accessibilityHint={available ? tool.hint : `Disponible en phase ${tool.availableInPhase}`}
            onPress={() => setTool(tool.id)}
          />
        );
      })}
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
