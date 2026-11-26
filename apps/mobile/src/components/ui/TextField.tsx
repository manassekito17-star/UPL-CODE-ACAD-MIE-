import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Unité affichée à droite (ex. « px »). */
  suffix?: string;
  error?: string;
  testID?: string;
}

/** Champ de saisie du thème : libellé, unité, message d'erreur annoncé. */
export function TextField({ label, suffix, error, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" tone="secondary">
        {label}
      </AppText>
      <View style={[styles.box, focused && styles.focused, error ? styles.invalid : null]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={colors.textDisabled}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardAppearance="dark"
          maxFontSizeMultiplier={1.6}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
        {suffix ? (
          <AppText variant="label" tone="secondary">
            {suffix}
          </AppText>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs, flex: 1 },
  box: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  focused: { borderColor: colors.accent },
  invalid: { borderColor: colors.danger },
  input: {
    flex: 1,
    // Sans minWidth, le champ réclame sa largeur intrinsèque et pousse l'unité hors du cadre.
    minWidth: 0,
    // Le cadre du thème signale déjà le focus : pas de contour navigateur en plus.
    ...Platform.select({ web: { outlineStyle: 'none' } as object, default: {} }),
    color: colors.textPrimary,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
});
