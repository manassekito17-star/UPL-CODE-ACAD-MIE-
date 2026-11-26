import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

export interface PanelProps extends ViewProps {
  title?: string;
  children: ReactNode;
}

/** Bloc de contenu sur fond « panneau », avec titre facultatif. */
export function Panel({ title, children, style, ...rest }: PanelProps) {
  return (
    <View style={[styles.panel, style]} {...rest}>
      {title ? (
        <AppText variant="subtitle" accessibilityRole="header">
          {title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
