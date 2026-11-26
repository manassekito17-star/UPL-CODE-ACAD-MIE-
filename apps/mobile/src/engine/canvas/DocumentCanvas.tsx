import { Canvas, Group, Picture, Rect, Skia } from '@shopify/react-native-skia';
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react';
import { PixelRatio, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { hitTest, layerMatrix, type HitCandidate, type Layer } from '@/engine/layers';
import {
  checkerCellFor,
  createCheckerShader,
  opacityPaint,
  recordBackgroundPicture,
  recordLayerContentPicture,
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

import { oneFingerMovesView, resolveGestureTarget, type ToolId } from './gestures';

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
  /** Pile de calques (du bas vers le haut). */
  layers?: readonly Layer[];
  selectedLayerId?: string | null;
  /** Outil Sélection : tap au point (x, y) du document. */
  onTapDocument?: (x: number, y: number) => void;
  /** Outil Sélection : un calque modifiable commence à être déplacé au doigt. */
  onLayerDragStart?: (id: string) => void;
  /**
   * Fin du déplacement au doigt : décalage en pixels entiers du document.
   * Renvoie faux si le déplacement est refusé (le calque revient en place).
   */
  onLayerMoved?: (id: string, dx: number, dy: number) => boolean;
}

/** Déplacement en cours d'un calque, tenu sur le thread UI. */
interface DragState {
  id: SharedValue<string>;
  x: SharedValue<number>;
  y: SharedValue<number>;
}

const NO_LAYERS: readonly Layer[] = [];

/**
 * Un calque à l'écran : son contenu en Picture (recalculée seulement si le
 * contenu change), placé par la même matrice que le rendu hors écran, avec
 * l'opacité appliquée par composition. Le décalage du glisser en cours
 * s'ajoute sur le thread UI, sans rendu React.
 */
function LayerNode({ layer, drag }: { layer: Layer; drag: DragState }) {
  const { type, width, height, fill, opacity } = layer;
  const picture = useMemo(
    () => recordLayerContentPicture({ ...layer, type, width, height, fill }),
    // Seul le contenu compte ici : déplacer ou tourner le calque ne réenregistre rien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, width, height, fill],
  );
  const paint = useMemo(() => opacityPaint(opacity) ?? undefined, [opacity]);
  const matrix = useDerivedValue(() => {
    const dragging = drag.id.get() === layer.id;
    return layerMatrix(layer, dragging ? drag.x.get() : 0, dragging ? drag.y.get() : 0);
  }, [layer]);
  return (
    <Group matrix={matrix} layer={paint}>
      <Picture picture={picture} />
    </Group>
  );
}

/**
 * Contour de sélection, d'épaisseur constante à l'écran, qui suit le glisser.
 * Deux tons (bordure blanche sous un trait d'accent) : il reste visible sur
 * n'importe quelle couleur, y compris un calque de la couleur d'accent.
 */
function SelectionOutline({ layer, drag, scale }: { layer: Layer; drag: DragState; scale: SharedValue<number> }) {
  const matrix = useDerivedValue(() => {
    const dragging = drag.id.get() === layer.id;
    return layerMatrix(layer, dragging ? drag.x.get() : 0, dragging ? drag.y.get() : 0);
  }, [layer]);
  const haloWidth = useDerivedValue(() => 4 / scale.get());
  const strokeWidth = useDerivedValue(() => 2 / scale.get());
  return (
    <Group matrix={matrix}>
      <Rect x={0} y={0} width={layer.width} height={layer.height} style="stroke" strokeWidth={haloWidth} color="#FFFFFF" />
      <Rect x={0} y={0} width={layer.width} height={layer.height} style="stroke" strokeWidth={strokeWidth} color={colors.accent} />
    </Group>
  );
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
export function DocumentCanvas({
  document,
  tool,
  onZoomChange,
  controllerRef,
  insets = NO_INSETS,
  layers = NO_LAYERS,
  selectedLayerId = null,
  onTapDocument,
  onLayerDragStart,
  onLayerMoved,
}: DocumentCanvasProps) {
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
  const selectTool = useSharedValue(tool === 'select');
  const hitLayers = useSharedValue<HitCandidate[]>([]);
  const drag: DragState = {
    id: useSharedValue(''),
    x: useSharedValue(0),
    y: useSharedValue(0),
  };

  useEffect(() => {
    oneFingerPan.set(oneFingerMovesView(tool));
    selectTool.set(tool === 'select');
  }, [tool, oneFingerPan, selectTool]);

  // Copie légère de la géométrie des calques pour le test d'atteinte sur le thread UI.
  useEffect(() => {
    hitLayers.set(
      layers.map(({ id, x, y, width: w, height: h, rotation, visible, locked }) => ({
        id,
        x,
        y,
        width: w,
        height: h,
        rotation,
        visible,
        locked,
      })),
    );
  }, [layers, hitLayers]);

  // Fin d'un glisser : le décalage visuel reste appliqué jusqu'à ce que la
  // nouvelle position du calque soit rendue, puis il est remis à zéro (pas
  // de retour visuel en arrière entre les deux).
  const pendingMove = useRef<{ id: string; x: number; y: number } | null>(null);
  const resetDrag = useCallback(() => {
    pendingMove.current = null;
    drag.id.set('');
    drag.x.set(0);
    drag.y.set(0);
  }, [drag.id, drag.x, drag.y]);
  useLayoutEffect(() => {
    const pending = pendingMove.current;
    if (!pending) return;
    const layer = layers.find((l) => l.id === pending.id);
    if (!layer || layer.x !== pending.x || layer.y !== pending.y) resetDrag();
  }, [layers, resetDrag]);

  const dragStart = useCallback((id: string) => onLayerDragStart?.(id), [onLayerDragStart]);
  const dragEnd = useCallback(
    (id: string, dx: number, dy: number) => {
      const layer = layers.find((l) => l.id === id);
      const rx = Math.round(dx);
      const ry = Math.round(dy);
      if (!layer || !onLayerMoved || (rx === 0 && ry === 0)) {
        resetDrag();
        return;
      }
      pendingMove.current = { id, x: layer.x, y: layer.y };
      // Accepté : le décalage sera remis à zéro quand la nouvelle position sera
      // rendue (useLayoutEffect ci-dessus). Refusé : le calque revient en place.
      if (!onLayerMoved(id, rx, ry)) resetDrag();
    },
    [layers, onLayerMoved, resetDrag],
  );
  const tapAt = useCallback((x: number, y: number) => onTapDocument?.(x, y), [onTapDocument]);

  // Cache du rendu : recalculé seulement quand le contenu du document change.
  const { width, height, background } = document;
  const backgroundPicture = useMemo(
    () => recordBackgroundPicture({ width, height, background }),
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

  // Outil Sélection : un doigt sur un calque modifiable le déplace ; ailleurs, rien.
  const layerPan = usePanGesture({
    maxPointers: 1,
    enabled: selectTool,
    onBegin: (e) => {
      'worklet';
      const s = scale.get();
      const hit = hitTest(hitLayers.get(), (e.x - tx.get()) / s, (e.y - ty.get()) / s);
      const target = resolveGestureTarget({
        pointers: e.numberOfPointers,
        tool: 'select',
        hitEditableLayer: hit !== null && !hit.locked,
      });
      if (target === 'layer' && hit) {
        drag.x.set(0);
        drag.y.set(0);
        drag.id.set(hit.id);
        scheduleOnRN(dragStart, hit.id);
      } else {
        drag.id.set('');
      }
    },
    onUpdate: (e) => {
      'worklet';
      if (drag.id.get() === '') return;
      const s = scale.get();
      drag.x.set(drag.x.get() + e.changeX / s);
      drag.y.set(drag.y.get() + e.changeY / s);
    },
    onFinalize: () => {
      'worklet';
      const id = drag.id.get();
      if (id !== '') scheduleOnRN(dragEnd, id, drag.x.get(), drag.y.get());
    },
  });

  const singleTap = useTapGesture({
    numberOfTaps: 1,
    enabled: selectTool,
    onActivate: (e) => {
      'worklet';
      const s = scale.get();
      scheduleOnRN(tapAt, (e.x - tx.get()) / s, (e.y - ty.get()) / s);
    },
  });

  const gesture = useSimultaneousGestures(pinch, twoFingerPan, singleFingerPan, layerPan, singleTap, doubleTap);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId && l.visible);

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
        accessibilityLabel={`Document de ${width} × ${height} pixels, ${layers.length} calque${layers.length > 1 ? 's' : ''}`}
      >
        {viewSize ? (
          <Canvas style={StyleSheet.absoluteFill}>
            <Group transform={transform}>
              {checkerPicture ? <Picture picture={checkerPicture} /> : null}
              <Picture picture={backgroundPicture} />
              {layers.map((layer) => (layer.visible ? <LayerNode key={layer.id} layer={layer} drag={drag} /> : null))}
              <Rect x={0} y={0} width={width} height={height} style="stroke" strokeWidth={borderWidth} color={colors.border} />
              {selectedLayer ? <SelectionOutline layer={selectedLayer} drag={drag} scale={scale} /> : null}
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
