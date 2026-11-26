import { Canvas, Group, Picture, Rect, Skia } from '@shopify/react-native-skia';
import { useCallback, useEffect, useImperativeHandle, useMemo, useState, type Ref } from 'react';
import { PixelRatio, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  checkerCellFor,
  createCheckerShader,
  recordDocumentPicture,
  type DrawableDocument,
} from '@/engine/renderer';
import {
  clampPan,
  fitToViewport,
  isFitted,
  panBy,
  FIT_PADDING,
  NO_INSETS,
  scaleForPercent,
  zoomAt,
  zoomLimits,
  zoomPercent,
  zoomTo,
  type Insets,
  type Size,
  type ViewTransform,
  type ZoomLimits,
} from '@/engine/transformations';
import { colors } from '@/theme';

import { oneFingerMovesView, type ToolId } from './gestures';

/** Commandes de la vue, appelées par les boutons de zoom de l'interface. */
export interface CanvasController {
  fitToScreen: () => void;
  zoomBy: (factor: number) => void;
  setZoomPercent: (percent: number) => void;
}

export interface DocumentCanvasProps {
  document: DrawableDocument;
  tool: ToolId;
  /** Zoom affiché (100 % = un pixel du document par pixel physique), après chaque geste ou commande. */
  onZoomChange?: (percent: number) => void;
  controllerRef?: Ref<CanvasController>;
  /** Zones recouvertes par l'interface : l'ajustement à l'écran les évite. */
  insets?: Insets;
}

const ANIMATION = { duration: 180 };

/**
 * Canvas Skia du document.
 *
 * - Le document est enregistré une fois dans une Picture (cache) ; zoom et
 *   déplacement ne changent que la matrice de transformation.
 * - Les gestes tournent sur le thread UI (worklets) et pilotent directement
 *   des valeurs partagées lues par Skia : aucun rendu React pendant un geste.
 * - Arbitrage des gestes : voir ./gestures.ts.
 */
export function DocumentCanvas({ document, tool, onZoomChange, controllerRef, insets = NO_INSETS }: DocumentCanvasProps) {
  const pixelRatio = PixelRatio.get();
  const [viewSize, setViewSize] = useState<Size | null>(null);

  // État de la vue, partagé entre le thread JS et le thread UI.
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const limits = useSharedValue<ZoomLimits>({ min: 0.01, max: 32 });
  const view = useSharedValue<Size>({ width: 1, height: 1 });
  const docSize = useSharedValue<Size>({ width: document.width, height: document.height });
  const fitInsets = useSharedValue<Insets>(insets);
  const oneFingerPan = useSharedValue(oneFingerMovesView(tool));

  useEffect(() => {
    oneFingerPan.set(oneFingerMovesView(tool));
  }, [tool, oneFingerPan]);

  // Cache du rendu : recalculé seulement quand le contenu du document change.
  const { width, height, background } = document;
  const documentPicture = useMemo(
    () => recordDocumentPicture({ width, height, background }),
    [width, height, background],
  );
  const checkerPicture = useMemo(() => {
    if (background !== 'transparent') return null;
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
    const paint = Skia.Paint();
    paint.setShader(createCheckerShader(checkerCellFor({ width, height }), colors.checkerLight, colors.checkerDark));
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
    return recorder.finishRecordingAsPicture();
  }, [width, height, background]);

  const reportZoom = useCallback(
    (s: number) => onZoomChange?.(Math.round(zoomPercent(s, pixelRatio))),
    [onZoomChange, pixelRatio],
  );

  const current = useCallback((): ViewTransform => ({ scale: scale.get(), x: tx.get(), y: ty.get() }), [scale, tx, ty]);

  const apply = useCallback(
    (t: ViewTransform, animate: boolean) => {
      if (animate) {
        scale.set(withTiming(t.scale, ANIMATION));
        tx.set(withTiming(t.x, ANIMATION));
        ty.set(withTiming(t.y, ANIMATION));
      } else {
        scale.set(t.scale);
        tx.set(t.x);
        ty.set(t.y);
      }
      reportZoom(t.scale);
    },
    [scale, tx, ty, reportZoom],
  );

  // Ajustement initial, puis à chaque changement de taille de la zone (rotation,
  // ouverture d'un panneau) : on réajuste si la vue était ajustée, sinon on
  // garde le zoom en s'assurant que le document reste visible.
  useEffect(() => {
    if (!viewSize) return;
    const doc = { width, height };
    const previousFit = fitToViewport(doc, view.get(), FIT_PADDING, fitInsets.get());
    const wasFitted = view.get().width <= 1 || isFitted(current(), previousFit);
    const fit = fitToViewport(doc, viewSize, FIT_PADDING, insets);
    view.set(viewSize);
    docSize.set(doc);
    fitInsets.set(insets);
    limits.set(zoomLimits(fit.scale, pixelRatio));
    apply(wasFitted ? fit : clampPan(current(), doc, viewSize), false);
  }, [viewSize, width, height, pixelRatio, apply, current, view, docSize, limits, fitInsets, insets]);

  useImperativeHandle(
    controllerRef,
    () => {
      const center = () => ({ x: view.get().width / 2, y: view.get().height / 2 });
      const settle = (t: ViewTransform) => clampPan(t, docSize.get(), view.get());
      return {
        fitToScreen: () => apply(fitToViewport(docSize.get(), view.get(), FIT_PADDING, fitInsets.get()), true),
        zoomBy: (factor) => apply(settle(zoomAt(current(), factor, center(), limits.get())), true),
        setZoomPercent: (percent) =>
          apply(settle(zoomTo(current(), scaleForPercent(percent, pixelRatio), center(), limits.get())), true),
      };
    },
    [apply, current, docSize, fitInsets, limits, pixelRatio, view],
  );

  // ---------- Gestes (thread UI) ----------
  const pinch = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      const t = zoomAt({ scale: scale.get(), x: tx.get(), y: ty.get() }, e.scaleChange, { x: e.focalX, y: e.focalY }, limits.get());
      scale.set(t.scale);
      tx.set(t.x);
      ty.set(t.y);
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(reportZoom, scale.get());
    },
  });

  const movePan = (dx: number, dy: number) => {
    'worklet';
    const t = clampPan(panBy({ scale: scale.get(), x: tx.get(), y: ty.get() }, dx, dy), docSize.get(), view.get());
    tx.set(t.x);
    ty.set(t.y);
  };

  const twoFingerPan = usePanGesture({
    minPointers: 2,
    onUpdate: (e) => {
      'worklet';
      movePan(e.changeX, e.changeY);
    },
  });

  const singleFingerPan = usePanGesture({
    maxPointers: 1,
    enabled: oneFingerPan,
    onUpdate: (e) => {
      'worklet';
      movePan(e.changeX, e.changeY);
    },
  });

  // Double tap : ajuste à l'écran, ou zoome à 100 % sous le doigt si la vue est déjà ajustée.
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: (e) => {
      'worklet';
      const now = { scale: scale.get(), x: tx.get(), y: ty.get() };
      const fit = fitToViewport(docSize.get(), view.get(), FIT_PADDING, fitInsets.get());
      const target = isFitted(now, fit)
        ? clampPan(zoomTo(now, scaleForPercent(100, pixelRatio), { x: e.x, y: e.y }, limits.get()), docSize.get(), view.get())
        : fit;
      scale.set(withTiming(target.scale, ANIMATION));
      tx.set(withTiming(target.x, ANIMATION));
      ty.set(withTiming(target.y, ANIMATION));
      scheduleOnRN(reportZoom, target.scale);
    },
  });

  const gesture = useSimultaneousGestures(pinch, twoFingerPan, singleFingerPan, doubleTap);

  // ---------- Rendu Skia ----------
  const transform = useDerivedValue(() => [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: scale.get() }]);
  // Bordure d'un point écran quel que soit le zoom.
  const borderWidth = useDerivedValue(() => 1 / scale.get());

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && h > 0) setViewSize({ width: w, height: h });
  };

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.fill}
        onLayout={onLayout}
        testID="document-canvas"
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Document de ${width} × ${height} pixels`}
      >
        {viewSize ? (
          <Canvas style={StyleSheet.absoluteFill}>
            <Group transform={transform}>
              {checkerPicture ? <Picture picture={checkerPicture} /> : null}
              <Picture picture={documentPicture} />
              <Rect x={0} y={0} width={width} height={height} style="stroke" strokeWidth={borderWidth} color={colors.border} />
            </Group>
          </Canvas>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
});
