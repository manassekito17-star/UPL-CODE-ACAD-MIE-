import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { colors, radius, spacing, touchTarget } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  /** Libellé accessible (obligatoire : l'icône seule n'est pas lue). */
  label: string;
  /** Affiche le libellé sous l'icône (barres d'outils). */
  showLabel?: boolean;
  /** Outil ou panneau actuellement actif. */
  active?: boolean;
  tone?: 'default' | 'danger';
}

/** Bouton carré à icône : 48 dp minimum, état actif, pressé et désactivé. */
export function IconButton({
  icon,
  label,
  showLabel = false,
  active = false,
  tone = 'default',
  disabled = false,
  accessibilityHint,
  ...rest
}: IconButtonProps) {
  const isDisabled = disabled === true;
  const iconColor = isDisabled
    ? colors.textDisabled
    : active
      ? colors.accentText
      : tone === 'danger'
        ? colors.danger
        : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, selected: active }}
      disabled={isDisabled}
      hitSlop={4}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        showLabel && styles.withLabel,
        active && styles.active,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Icon name={icon} size={22} color={iconColor} />
        {showLabel ? (
          <AppText variant="caption" style={{ color: iconColor }} numberOfLines={1}>
            {label}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  withLabel: { minWidth: 64, paddingVertical: spacing.xs },
  active: { backgroundColor: colors.panelPressed },
  pressed: { backgroundColor: colors.panel },
  content: { alignItems: 'center', gap: spacing.xxs },
});
