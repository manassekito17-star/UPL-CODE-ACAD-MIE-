import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

type Tone = 'primary' | 'secondary' | 'accent' | 'danger' | 'disabled';

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  accent: colors.accentText,
  danger: colors.danger,
  disabled: colors.textDisabled,
};

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
}

/** Texte de l'application : applique la typographie et les couleurs du thème. */
export function AppText({ variant = 'body', tone = 'primary', style, ...rest }: AppTextProps) {
  return (
    <Text
      // Le texte suit le réglage de taille de police du système, dans une limite
      // qui préserve la mise en page des barres d'outils.
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[styles.base, typography[variant], { color: toneColor[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
