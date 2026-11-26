import { ScrollView, StyleSheet } from 'react-native';

import { IconButton } from '@/components/ui';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { colors, spacing } from '@/theme';

import { TOOLS, isToolAvailable } from './tools';
import { useInsertMenu } from './useInsertMenu';

export interface EditorToolbarProps {
  orientation: 'vertical' | 'horizontal';
  documentId: string;
}

/**
 * Barre d'outils : deux modes (Sélection, Vue) et trois insertions (Texte,
 * Formes, Image). Les outils des phases non livrées restent visibles mais
 * désactivés, avec la phase annoncée aux lecteurs d'écran.
 */
export function EditorToolbar({ orientation, documentId }: EditorToolbarProps) {
  const horizontal = orientation === 'horizontal';
  const activeTool = useEditorUiStore((s) => s.activeTool);
  const setTool = useEditorUiStore((s) => s.setTool);
  const menu = useInsertMenu(documentId);

  const press = (id: (typeof TOOLS)[number]['id']) => {
    if (id === 'text') menu.insert('text');
    else if (id === 'shape') menu.openShapes();
    else if (id === 'image') void menu.insert('image');
    else setTool(id);
  };

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
        const available = isToolAvailable(tool) && !(tool.id === 'image' && menu.importing);
        return (
          <IconButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            showLabel
            disabled={!available}
            active={tool.kind === 'mode' && available && activeTool === tool.id}
            accessibilityHint={isToolAvailable(tool) ? tool.hint : `Disponible en phase ${tool.availableInPhase}`}
            onPress={() => press(tool.id)}
          />
        );
      })}
      {menu.dialog}
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
