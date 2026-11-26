import { Stack } from 'expo-router';

import { NotFoundScreen } from '@/screens/NotFoundScreen';

export default function NotFoundRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable' }} />
      <NotFoundScreen />
    </>
  );
}
