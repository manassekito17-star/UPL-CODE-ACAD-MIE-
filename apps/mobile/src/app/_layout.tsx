import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SkiaGate } from '@/components/SkiaGate';
import { FileDialogs } from '@/features/files/FileDialogs';
import { PersistenceGate } from '@/features/persistence';
import { ShortcutsRoot } from '@/features/shortcuts/ShortcutsRoot';
import { colors } from '@/theme';
import { navigationTheme } from '@/theme/navigationTheme';

/**
 * Racine de l'application.
 * - GestureHandlerRootView : obligatoire pour les gestes du canvas (phase 3).
 * - PersistenceGate : charge les projets de l'appareil puis les enregistre
 *   automatiquement (module M3).
 * - ThemeProvider : thème sombre pour la navigation.
 * Les écrans eux-mêmes vivent dans src/screens ; les fichiers de src/app ne
 * font que déclarer les routes.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SkiaGate>
        <PersistenceGate>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { color: colors.textPrimary },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false, title: 'Accueil' }} />
              <Stack.Screen name="new-document" options={{ headerShown: false, title: 'Nouveau document' }} />
              <Stack.Screen name="editor/[projectId]" options={{ headerShown: false, title: 'Éditeur' }} />
              <Stack.Screen name="settings" options={{ title: 'Paramètres' }} />
            </Stack>
            <FileDialogs />
            <ShortcutsRoot />
          </ThemeProvider>
        </PersistenceGate>
      </SkiaGate>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
