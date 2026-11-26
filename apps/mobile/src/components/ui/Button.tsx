import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { colors, radius, spacing, touchTarget } from '@/theme';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  /** Texte secondaire sous le libellé (ex. : raison d'une désactivation). */
  hint?: string;
  fullWidth?: boolean;
}

const background: Record<ButtonVariant, { idle: string; pressed: string }> = {
  primary: { idle: colors.accentSolid, pressed: colors.accentSolidPressed },
  secondary: { idle: colors.panel, pressed: colors.panelPressed },
  ghost: { idle: 'transparent', pressed: colors.panel },
  danger: { idle: colors.panel, pressed: colors.panelPressed },
};

/** Bouton tactile du thème : cible d'au moins 48 dp, états pressé et désactivé. */
export function Button({
  label,
  variant = 'primary',
  hint,
  fullWidth = false,
  disabled = false,
  accessibilityHint,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint ?? hint}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={4}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'secondary' && styles.bordered,
        { backgroundColor: pressed ? background[variant].pressed : background[variant].idle },
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        <AppText
          variant="subtitle"
          tone={isDisabled ? 'disabled' : variant === 'danger' ? 'danger' : 'primary'}
          style={variant === 'primary' && !isDisabled ? { color: colors.textOnAccent } : null}
        >
          {label}
        </AppText>
        {hint ? (
          <AppText variant="caption" tone={isDisabled ? 'disabled' : 'secondary'}>
            {hint}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  bordered: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  disabled: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  content: { alignItems: 'center', gap: spacing.xxs },
});
