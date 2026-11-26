import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { colors, radius, spacing } from '@/theme';

export interface LogoProps {
  size?: number;
  showName?: boolean;
}

/**
 * Logo ZENTECH DESIGN : trois plaques décalées évoquant une pile de calques.
 * Dessiné avec de simples vues pour ne dépendre d'aucun fichier image.
 */
export function Logo({ size = 44, showName = true }: LogoProps) {
  const plate = size * 0.62;
  const step = (size - plate) / 2;
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={`Logo ${APP_NAME}`}>
      <View style={{ width: size, height: size }}>
        {[colors.panelPressed, colors.accentSolid, colors.accent].map((color, i) => (
          <View
            key={color}
            style={[
              styles.plate,
              { width: plate, height: plate, left: step * i, top: step * (2 - i), backgroundColor: color },
            ]}
          />
        ))}
      </View>
      {showName ? (
        <View>
          <AppText variant="title" style={styles.name}>
            {APP_NAME}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {APP_TAGLINE}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  plate: { position: 'absolute', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.background },
  name: { letterSpacing: 0.5 },
});
