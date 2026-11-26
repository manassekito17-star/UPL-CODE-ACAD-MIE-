import { StyleSheet, View } from 'react-native';

import { AppText, PlannedFeature, Screen } from '@/components/ui';
import { colors, spacing } from '@/theme';

export interface EditorScreenProps {
  projectId: string;
}

export function EditorScreen({ projectId }: EditorScreenProps) {
  return (
    <Screen scroll={false} testID="editor-screen">
      <View style={styles.workspace}>
        <AppText variant="caption" tone="secondary">
          Projet : {projectId}
        </AppText>
        <PlannedFeature
          phase={2}
          title="Espace de travail"
          description="Barre supérieure, barre d'outils, panneaux des calques et des propriétés repliables."
        />
        <PlannedFeature
          phase={3}
          title="Canvas Skia"
          description="Rendu GPU du document, zoom, déplacement de la vue et ajustement à l'écran."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
});
