import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, IconButton } from '@/components/ui';
import { DocumentCanvasHost, type CanvasController } from '@/engine/canvas';
import type { GraphicDocument } from '@/engine/documents';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { colors, radius, spacing, touchTarget } from '@/theme';

export interface CanvasAreaProps {
  document: GraphicDocument;
}

/** Facteur d'un clic sur les boutons de zoom (√2 : deux clics doublent le zoom). */
const ZOOM_STEP = Math.SQRT2;

/** La barre de zoom flotte en haut : l'ajustement à l'écran laisse cette bande libre. */
const CANVAS_INSETS = { top: touchTarget + spacing.sm, right: 0, bottom: 0, left: 0 } as const;

/** Zone centrale de travail : canvas Skia et commandes de zoom. */
export function CanvasArea({ document }: CanvasAreaProps) {
  const tool = useEditorUiStore((s) => s.activeTool);
  const selectedLayerId = useEditorUiStore((s) => s.selectedLayerId);
  const actions = useLayerActions(document.id);
  const resources = useRenderResources();
  const controller = useRef<CanvasController>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  return (
    <View style={styles.area} testID="canvas-area">
      <DocumentCanvasHost
        document={document}
        tool={tool}
        onZoomChange={setZoom}
        controllerRef={controller}
        insets={CANVAS_INSETS}
        layers={document.layers}
        selectedLayerId={selectedLayerId}
        onTapDocument={actions.selectAt}
        onLayerDragStart={actions.select}
        resources={resources}
        onLayerTransformed={actions.transform}
      />

      <View style={styles.zoomBar} accessibilityRole="toolbar" accessibilityLabel="Zoom">
        <IconButton icon="magnify-minus-outline" label="Dézoomer" onPress={() => controller.current?.zoomBy(1 / ZOOM_STEP)} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={zoom === null ? 'Zoom' : `Zoom ${zoom} %`}
          accessibilityHint="Afficher à 100 %"
          onPress={() => controller.current?.setZoomPercent(100)}
          style={({ pressed }) => [styles.zoomValue, pressed && styles.pressed]}
          testID="zoom-value"
        >
          <AppText variant="label">{zoom === null ? '…' : `${zoom} %`}</AppText>
        </Pressable>
        <IconButton icon="magnify-plus-outline" label="Zoomer" onPress={() => controller.current?.zoomBy(ZOOM_STEP)} />
        <IconButton icon="fit-to-screen-outline" label="Ajuster à l’écran" onPress={() => controller.current?.fitToScreen()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: colors.background },
  zoomBar: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  zoomValue: { minWidth: 64, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  pressed: { backgroundColor: colors.panelPressed },
});
