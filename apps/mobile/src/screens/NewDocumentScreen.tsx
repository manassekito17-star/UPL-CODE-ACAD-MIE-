import { router } from 'expo-router';

import { AppText, Button, Panel, PlannedFeature, Screen } from '@/components/ui';

export function NewDocumentScreen() {
  return (
    <Screen testID="new-document-screen">
      <AppText tone="secondary">Définissez le format de votre document avant d’ouvrir l’espace de travail.</AppText>

      <Panel title="Format du document">
        <PlannedFeature
          phase={2}
          title="Dimensions, orientation et fond"
          description="Largeur et hauteur personnalisées, portrait ou paysage, fond blanc, noir ou transparent, avec limites de taille pour protéger la mémoire."
        />
      </Panel>

      <Button
        label="Ouvrir un espace de travail vide"
        variant="secondary"
        accessibilityHint="Ouvre l'éditeur sans document, pour tester la navigation"
        onPress={() => router.push({ pathname: '/editor/[projectId]', params: { projectId: 'brouillon' } })}
      />
    </Screen>
  );
}
