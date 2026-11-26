import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

export interface PlannedFeatureProps {
  /** Phase du plan de développement qui livrera la fonctionnalité. */
  phase: number;
  title: string;
  description: string;
}

/**
 * Signale honnêtement une fonctionnalité pas encore développée.
 * Chaque occurrence doit disparaître quand la phase indiquée est livrée :
 * `grep -r PlannedFeature src` donne la liste de ce qui reste à faire.
 */
export function PlannedFeature({ phase, title, description }: PlannedFeatureProps) {
  return (
    <View style={styles.box} accessible accessibilityLabel={`${title}. Prévu en phase ${phase}. ${description}`}>
      <View style={styles.badge}>
        <AppText variant="caption" tone="accent">
          Phase {phase}
        </AppText>
      </View>
      <AppText variant="label">{title}</AppText>
      <AppText variant="caption" tone="secondary">
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
});
