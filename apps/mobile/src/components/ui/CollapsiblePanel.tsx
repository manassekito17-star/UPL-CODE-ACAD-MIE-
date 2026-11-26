import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing, touchTarget } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export interface CollapsiblePanelProps {
  title: string;
  icon: IconName;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  testID?: string;
}

/** Panneau d'outils repliable (calques, propriétés…). */
export function CollapsiblePanel({ title, icon, expanded, onToggle, children, testID }: CollapsiblePanelProps) {
  return (
    <View style={[styles.panel, expanded && styles.expandedPanel]} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={expanded ? 'Replier le panneau' : 'Déplier le panneau'}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <Icon name={icon} size={20} color={colors.textSecondary} />
        <AppText variant="label" style={styles.title}>
          {title}
        </AppText>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  expandedPanel: { flexShrink: 1 },
  header: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: colors.panelPressed },
  title: { flex: 1 },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md },
});
