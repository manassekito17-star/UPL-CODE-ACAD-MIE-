import Constants from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Panel, Screen, SegmentedControl, type SegmentOption } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import { setAutoSave, usePersistenceStore } from '@/features/persistence';
import { spacing } from '@/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label} : ${value}`}>
      <AppText tone="secondary">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const AUTOSAVE_OPTIONS: readonly SegmentOption<'off' | '30' | '60' | '300'>[] = [
  { value: 'off', label: 'Désactivée' },
  { value: '30', label: '30 s' },
  { value: '60', label: '1 min' },
  { value: '300', label: '5 min' },
];

export function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? 'inconnue';
  const autoSave = usePersistenceStore((s) => s.preferences.autoSaveSeconds);
  return (
    <Screen testID="settings-screen">
      <Panel title="Application">
        <Row label="Nom" value={APP_NAME} />
        <Row label="Version" value={version} />
        <Row label="Plateforme" value={`${Platform.OS} ${String(Platform.Version)}`} />
      </Panel>

      <Panel title="Enregistrement">
        <SegmentedControl
          label="Sauvegarde automatique des projets déjà enregistrés"
          options={AUTOSAVE_OPTIONS}
          value={autoSave === null ? 'off' : (String(autoSave) as '30' | '60' | '300')}
          onChange={(v) => void setAutoSave(v === 'off' ? null : Number(v))}
        />
        <AppText variant="caption" tone="secondary">
          Désactivée, la version enregistrée ne change qu’avec Fichier › Enregistrer. Dans tous les cas, vos
          modifications sont copiées en continu : après une interruption (application fermée par le système,
          batterie vide), elles vous sont proposées à la réouverture.
        </AppText>
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
