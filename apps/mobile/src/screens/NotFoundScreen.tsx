import { router } from 'expo-router';

import { AppText, Button, Screen } from '@/components/ui';

export function NotFoundScreen() {
  return (
    <Screen testID="not-found-screen">
      <AppText variant="title">Écran introuvable</AppText>
      <AppText tone="secondary">Ce lien ne correspond à aucun écran de l’application.</AppText>
      <Button label="Retour à l'accueil" onPress={() => router.replace('/')} />
    </Screen>
  );
}
