import Constants from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Panel, Screen } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import { spacing } from '@/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label} : ${value}`}>
      <AppText tone="secondary">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

export function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? 'inconnue';
  return (
    <Screen testID="settings-screen">
      <Panel title="Application">
        <Row label="Nom" value={APP_NAME} />
        <Row label="Version" value={version} />
        <Row label="Plateforme" value={`${Platform.OS} ${String(Platform.Version)}`} />
      </Panel>

      <Panel title="Confidentialité">
        <AppText tone="secondary">
          Aucun compte n’est nécessaire. Vos projets et vos photos restent sur cet appareil : l’application
          n’envoie rien sur Internet et ne collecte aucune donnée d’utilisation.
        </AppText>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
});
