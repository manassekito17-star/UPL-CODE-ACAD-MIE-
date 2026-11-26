import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/**
 * Web (vérification visuelle uniquement, ce n'est pas une plateforme cible) :
 * Skia y tourne via CanvasKit (WebAssembly), chargé une fois avant
 * l'application. canvaskit.wasm est copié dans public/ par `npm run web:setup`.
 */
export function SkiaGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    LoadSkiaWeb({ locateFile: (file: string) => `/${file}` }).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
