import { DarkTheme, type Theme } from 'expo-router';

import { colors } from './colors';

/** Thème transmis à la navigation (en-têtes, fonds d'écran, transitions). */
export const navigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
};
