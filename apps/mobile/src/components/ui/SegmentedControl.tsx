import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, touchTarget } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  /** Élément visuel personnalisé à gauche du libellé (ex. pastille de couleur). */
  leading?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** Nom du groupe, lu par les lecteurs d'écran. */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `stacked` : visuel au-dessus du libellé, pour les libellés longs sur petit écran. */
  layout?: 'row' | 'stacked';
}

/** Choix exclusif entre quelques options (groupe de boutons radio). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  layout = 'row',
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" tone="secondary">
        {label}
      </AppText>
      <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selected, selected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.segment,
                layout === 'stacked' && styles.stacked,
                selected && styles.selected,
                pressed && !selected && styles.pressed,
              ]}
            >
              {option.leading}
              {option.icon ? (
                <Icon name={option.icon} size={20} color={selected ? colors.textPrimary : colors.textSecondary} />
              ) : null}
              <AppText variant="label" tone={selected ? 'primary' : 'secondary'} numberOfLines={1}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  track: {
    flexDirection: 'row',
    padding: spacing.xxs,
    gap: spacing.xxs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  stacked: { flexDirection: 'column', paddingVertical: spacing.sm, paddingHorizontal: spacing.xxs },
  selected: { backgroundColor: colors.accentSolid },
  pressed: { backgroundColor: colors.panel },
});
