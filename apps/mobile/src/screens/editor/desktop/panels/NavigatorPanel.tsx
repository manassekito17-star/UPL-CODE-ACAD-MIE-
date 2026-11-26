import { Canvas, Group, Picture, Rect } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { recordDocumentPicture } from '@/engine/renderer';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { ws, wsMetrics } from '@/theme';

import { Divider, WIconButton, WText } from '../ui';
import { ZOOM_STEP, useWorkspace } from '../WorkspaceContext';

const BOX = { width: 228, height: 150 };

/**
 * Navigateur : vignette du document (même rendu que la toile) et cadre rouge
 * de la partie visible. Toucher ou glisser dans la vignette déplace la vue.
 */
export function NavigatorPanel() {
  const { document, view, controller, zoom } = useWorkspace();
  const resources = useRenderResources();
  const k = Math.min(BOX.width / document.width, BOX.height / document.height);
  const w = document.width * k;
  const h = document.height * k;
  const picture = useMemo(() => recordDocumentPicture(document, resources), [document, resources]);

  const frame = useDerivedValue(() => {
    const s = view.scale.get();
    const x0 = Math.max(0, -view.tx.get() / s);
    const y0 = Math.max(0, -view.ty.get() / s);
    const x1 = Math.min(document.width, (view.width.get() - view.tx.get()) / s);
    const y1 = Math.min(document.height, (view.height.get() - view.ty.get()) / s);
    // Cadre tracé à l'intérieur de la vignette (le trait de 2 points ne doit pas être rogné).
    const x = Math.max(1, x0 * k);
    const y = Math.max(1, y0 * k);
    return { x, y, width: Math.max(0, Math.min(w - 1, x1 * k) - x), height: Math.max(0, Math.min(h - 1, y1 * k) - y) };
  });
  const fx = useDerivedValue(() => frame.get().x);
  const fy = useDerivedValue(() => frame.get().y);
  const fw = useDerivedValue(() => frame.get().width);
  const fh = useDerivedValue(() => frame.get().height);

  const moveTo = (e: GestureResponderEvent) => controller.current?.centerOn(e.nativeEvent.locationX / k, e.nativeEvent.locationY / k);

  return (
    <View style={styles.panel} testID="navigator-panel">
      <View
        style={[styles.box, { width: w, height: h }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Vignette du document : toucher pour centrer la vue"
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={moveTo}
        onResponderMove={moveTo}
        testID="navigator-thumb"
      >
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Group transform={[{ scale: k }]}>
            <Picture picture={picture} />
          </Group>
          <Rect x={fx} y={fy} width={fw} height={fh} style="stroke" strokeWidth={2} color="#FF3B30" />
        </Canvas>
      </View>
      <Divider />
      <View style={styles.zoomRow}>
        <WText style={styles.zoom}>{zoom === null ? '…' : `${zoom} %`}</WText>
        <WIconButton icon="minus" label="Zoom arrière" size={14} onPress={() => controller.current?.zoomBy(1 / ZOOM_STEP)} />
        <WIconButton icon="plus" label="Zoom avant" size={14} onPress={() => controller.current?.zoomBy(ZOOM_STEP)} />
        <WIconButton icon="fit-to-screen-outline" label="Ajuster à l’écran" size={14} onPress={() => controller.current?.fitToScreen()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 8, gap: 6, alignItems: 'center' },
  box: { backgroundColor: ws.pasteboard, overflow: 'hidden' },
  zoomRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  zoom: { flex: 1, fontSize: wsMetrics.smallFontSize },
});
