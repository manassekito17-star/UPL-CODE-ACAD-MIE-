import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { TextField } from './TextField';

/** Nuancier proposé (la saisie hexadécimale permet toute autre couleur). */
export const SWATCHES = [
  '#FFFFFF', '#C8CCD4', '#6B707B', '#101114',
  '#FF5C5C', '#FF9F43', '#F5D547', '#3DD68C',
  '#2EC4B6', '#3685FF', '#7B61FF', '#E056FD',
] as const;

export interface ColorFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  /** Renvoie un message d'erreur, ou null si la couleur est appliquée. */
  onCommit: (color: string) => string | null;
  testID?: string;
}

/** Choix de couleur : nuancier tactile et saisie « #RRVVBB ». */
export function ColorField({ label, value, editable = true, onCommit, testID }: ColorFieldProps) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | undefined>(undefined);
  const [shown, setShown] = useState(value);
  // Couleur changée ailleurs (nuancier, annulation) : on réaffiche (pendant le rendu).
  if (value !== shown) {
    setShown(value);
    setText(value);
  }
  const lastHandled = useRef<string | null>(null);

  const commit = (color: string) => {
    if (lastHandled.current === color) return;
    lastHandled.current = color;
    const message = onCommit(color);
    setError(message ?? undefined);
    if (message) setText(value);
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <AppText variant="label" tone="secondary">
        {label}
      </AppText>
      <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {SWATCHES.map((swatch) => {
          const selected = swatch.toUpperCase() === value.toUpperCase();
          return (
            <Pressable
              key={swatch}
              accessibilityRole="radio"
              accessibilityLabel={`Couleur ${swatch}`}
              accessibilityState={{ checked: selected, disabled: !editable }}
              disabled={!editable}
              hitSlop={4}
              onPress={() => {
                lastHandled.current = null;
                commit(swatch);
              }}
              style={[styles.swatch, { backgroundColor: swatch }, selected && styles.selected, !editable && styles.disabled]}
            />
          );
        })}
      </View>
      <TextField
        label="Code hexadécimal"
        value={text}
        editable={editable}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        error={error}
        onChangeText={(next) => {
          lastHandled.current = null;
          setText(next);
        }}
        onSubmitEditing={() => commit(text)}
        onBlur={() => commit(text)}
        testID={testID ? `${testID}-hex` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // 40 + 2 × 4 de marge de toucher = 48 dp.
  swatch: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  selected: { borderWidth: 3, borderColor: colors.accent },
  disabled: { opacity: 0.4 },
});
