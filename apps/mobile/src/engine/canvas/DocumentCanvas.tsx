import { Canvas, Circle, Group, Line, Picture, Rect, Skia, vec } from '@shopify/react-native-skia';
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

import {
  handlePositions,
  hitHandle,
  hitTest,
  layerMatrixForContent,
  resizeFromCorner,
  rotateFromPointer,
  type Corner,
  type HitCandidate,
  type Layer,
  type LayerGeometry,
} from '@/engine/layers';
import {
  NO_RESOURCES,
  checkerCellFor,
  createCheckerShader,
  opacityPaint,
  recordBackgroundPicture,
  recordLayerContentPicture,
  type DrawableDocument,
  type RenderResources,
} from '@/engine/renderer';
import {
  FIT_PADDING,
  NO_INSETS,
  clampPan,
  fitToViewport,
  isFitted,
  panBy,
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

import { oneFingerMovesView, pickDragLayer, type ToolId } from './gestures';

/** Commandes de la vue, appelées par les boutons de zoom de l'interface. */
export interface CanvasController {
  fitToScreen: () => void;
  zoomBy: (factor: number) => void;
  setZoomPercent: (percent: number) => void;
  /** Centre la vue sur le point (x, y) du document, sans changer le zoom. */
  centerOn: (x: number, y: number) => void;
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
  /** Police et images décodées : les mêmes que pour l'export. */
  resources?: RenderResources;
  /** Outil Sélection : tap au point (x, y) du document. */
  onTapDocument?: (x: number, y: number) => void;
  /** Outil Sélection : un calque modifiable commence à être déplacé au doigt. */
  onLayerDragStart?: (id: string) => void;
  /**
   * Fin d'une manipulation au doigt (déplacement, redimensionnement ou
   * rotation) : nouvelle géométrie arrondie. Renvoie faux si elle est refusée
   * (le calque revient alors en place).
   */
  onLayerTransformed?: (id: string, geometry: LayerGeometry) => boolean;
  /**
   * Valeurs de la vue fournies par le parent, pour que d'autres éléments
   * (règles) suivent le zoom et le déplacement sur le thread UI. Sinon le
   * canvas utilise les siennes.
   */
  view?: ViewSharedValues;
  /** Couleur de la table de travail autour du document. */
  pasteboardColor?: string;
  /**
   * Outil Sélection : un tap sélectionne et un glisser déplace le calque
   * touché (vrai par défaut). Faux : le tap ne change pas la sélection et le
   * glisser déplace le calque sélectionné.
   */
  autoSelect?: boolean;
  /** Poignées de redimensionnement et de rotation (vrai par défaut). */
  showTransformControls?: boolean;
}

export interface ViewSharedValues {
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  /** Taille de la zone de travail en points (0 tant qu'elle est inconnue). */
  width: SharedValue<number>;
  height: SharedValue<number>;
}

/** Valeurs de vue partagées entre le canvas et les éléments qui le suivent. */
export function useViewSharedValues(): ViewSharedValues {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  return useMemo(() => ({ scale, tx, ty, width, height }), [scale, tx, ty, width, height]);
}

type Mode = 'none' | 'move' | 'rotate' | Corner;

/**
 * Manipulation en cours, tenue sur le thread UI : la géométrie d'aperçu est
 * appliquée au calque et à son cadre sans aucun rendu React ; elle n'est
 * enregistrée dans le document qu'au relâchement.
 */
interface Manipulation {
  id: SharedValue<string>;
  mode: SharedValue<Mode>;
  start: SharedValue<LayerGeometry>;
  preview: SharedValue<LayerGeometry>;
  /** Point de départ du doigt (repère du document), pour la rotation. */
  origin: SharedValue<{ x: number; y: number }>;
}

/** Calque sélectionné, copié pour le thread UI (poignées). */
interface SelectedInfo extends LayerGeometry {
  id: string;
  editable: boolean;
  keepAspect: boolean;
}

const NO_LAYERS: readonly Layer[] = [];
const ANIMATION = { duration: 180 };
/** Déplacement maximal (points écran) d'un doigt pour qu'un geste compte comme un toucher. */
const TAP_MAX_DISTANCE = 10;
const INITIAL_GEOMETRY: LayerGeometry = { x: 0, y: 0, width: 1, height: 1, rotation: 0 };

function geometryOf(l: LayerGeometry): LayerGeometry {
  'worklet';
  return { x: l.x, y: l.y, width: l.width, height: l.height, rotation: l.rotation };
}

/**
 * Un calque à l'écran : son contenu en Picture (recalculée seulement si le
 * contenu change), placé par la même matrice que le rendu hors écran, avec
 * l'opacité appliquée par composition. Pendant un redimensionnement, le
 * contenu est étiré en aperçu puis réenregistré au relâchement.
 */
function LayerNode({ layer, m, resources }: { layer: Layer; m: Manipulation; resources: RenderResources }) {
  const { x: _x, y: _y, rotation: _r, opacity, ...content } = layer;
  const contentKey = JSON.stringify(content);
  const image = layer.type === 'image' ? resources.images.get(layer.asset.uri) : undefined;
  const picture = useMemo(
    () => recordLayerContentPicture(layer, resources),
    // Seul le contenu compte : déplacer ou tourner le calque ne réenregistre rien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentKey, resources.fonts, image],
  );
  const paint = useMemo(() => opacityPaint(opacity) ?? undefined, [opacity]);
  const matrix = useDerivedValue(() => {
    const g = m.id.get() === layer.id ? m.preview.get() : geometryOf(layer);
    return layerMatrixForContent(g, layer.width, layer.height);
  }, [layer]);
  return (
    <Group matrix={matrix} layer={paint}>
      <Picture picture={picture} />
    </Group>
  );
}

const HANDLE_RADIUS = 7;

/**
 * Cadre de sélection d'épaisseur constante à l'écran. Deux tons (bordure
 * blanche sous un trait d'accent) : visible sur toutes les couleurs. Avec
 * `handles`, quatre poignées de redimensionnement et une de rotation.
 */
function SelectionOutline({
  layer,
  m,
  scale,
  handles,
}: {
  layer: Layer;
  m: Manipulation;
  scale: SharedValue<number>;
  handles: boolean;
}) {
  const geometry = useDerivedValue(() => (m.id.get() === layer.id ? m.preview.get() : geometryOf(layer)), [layer]);
  const matrix = useDerivedValue(() => layerMatrixForContent(geometry.get(), geometry.get().width, geometry.get().height));
  // Le cadre est tracé juste à l'extérieur de la boîte pour ne pas mordre sur le contenu.
  const outset = useDerivedValue(() => 2 / scale.get());
  const negOutset = useDerivedValue(() => -outset.get());
  const w = useDerivedValue(() => geometry.get().width + 2 * outset.get());
  const h = useDerivedValue(() => geometry.get().height + 2 * outset.get());
  const halo = useDerivedValue(() => 4 / scale.get());
  const stroke = useDerivedValue(() => 2 / scale.get());
  const positions = useDerivedValue(() => handlePositions(geometry.get(), scale.get()));
  const r = useDerivedValue(() => HANDLE_RADIUS / scale.get());
  const nw = useDerivedValue(() => vec(...positions.get().nw));
  const ne = useDerivedValue(() => vec(...positions.get().ne));
  const se = useDerivedValue(() => vec(...positions.get().se));
  const sw = useDerivedValue(() => vec(...positions.get().sw));
  const rot = useDerivedValue(() => vec(...positions.get().rotate));
  const topMid = useDerivedValue(() => {
    const p = positions.get();
    return vec((p.nw[0] + p.ne[0]) / 2, (p.nw[1] + p.ne[1]) / 2);
  });
  return (
    <>
      <Group matrix={matrix}>
        <Rect x={negOutset} y={negOutset} width={w} height={h} style="stroke" strokeWidth={halo} color="#FFFFFF" />
        <Rect x={negOutset} y={negOutset} width={w} height={h} style="stroke" strokeWidth={stroke} color={colors.accent} />
      </Group>
      {handles ? (
        <Group>
          <Line p1={topMid} p2={rot} strokeWidth={stroke} color={colors.accent} />
          {[nw, ne, se, sw, rot].map((c, i) => (
            <Group key={i}>
              <Circle c={c} r={r} color="#FFFFFF" />
              <Circle c={c} r={r} style="stroke" strokeWidth={stroke} color={colors.accent} />
            </Group>
          ))}
        </Group>
      ) : null}
    </>
  );
}

/**
 * Canvas Skia du document.
 *
 * - Fond et contenu de chaque calque en Picture (cache) ; zoom et
 *   déplacement ne changent que les matrices.
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
  resources = NO_RESOURCES,
  onTapDocument,
  onLayerDragStart,
  onLayerTransformed,
  view: externalView,
  pasteboardColor,
  autoSelect = true,
  showTransformControls = true,
}: DocumentCanvasProps) {
  const pixelRatio = PixelRatio.get();
  const [viewSize, setViewSize] = useState<Size | null>(null);

  // État de la vue, partagé entre le thread JS et le thread UI.
  const ownView = useViewSharedValues();
  const { scale, tx, ty, width: viewWidth, height: viewHeight } = externalView ?? ownView;
  const limits = useSharedValue<ZoomLimits>({ min: 0.01, max: 32 });
  const view = useSharedValue<Size>({ width: 1, height: 1 });
  const docSize = useSharedValue<Size>({ width: document.width, height: document.height });
  const fitInsets = useSharedValue<Insets>(insets);
  const oneFingerPan = useSharedValue(oneFingerMovesView(tool));
  const selectTool = useSharedValue(tool === 'select');
  const auto = useSharedValue(autoSelect);
  const controls = useSharedValue(showTransformControls);
  const hitLayers = useSharedValue<HitCandidate[]>([]);
  const selected = useSharedValue<SelectedInfo | null>(null);
  const m: Manipulation = {
    id: useSharedValue(''),
    mode: useSharedValue<Mode>('none'),
    start: useSharedValue<LayerGeometry>(INITIAL_GEOMETRY),
    preview: useSharedValue<LayerGeometry>(INITIAL_GEOMETRY),
    origin: useSharedValue({ x: 0, y: 0 }),
  };

  useEffect(() => {
    oneFingerPan.set(oneFingerMovesView(tool));
    selectTool.set(tool === 'select');
    auto.set(autoSelect);
    controls.set(showTransformControls);
  }, [tool, oneFingerPan, selectTool, auto, autoSelect, controls, showTransformControls]);

  // Copies légères pour le thread UI : test d'atteinte et poignées.
  const selectedLayer = layers.find((l) => l.id === selectedLayerId && l.visible) ?? null;
  useEffect(() => {
    hitLayers.set(layers.map((l) => ({ id: l.id, ...geometryOf(l), visible: l.visible, locked: l.locked })));
    selected.set(
      selectedLayer
        ? {
            id: selectedLayer.id,
            ...geometryOf(selectedLayer),
            editable: !selectedLayer.locked,
            keepAspect: selectedLayer.type === 'image',
          }
        : null,
    );
  }, [layers, selectedLayer, hitLayers, selected]);

  // Fin d'une manipulation : l'aperçu reste affiché jusqu'à ce que la nouvelle
  // géométrie du calque soit rendue, puis il est retiré (pas de retour visuel
  // en arrière entre les deux).
  const pending = useRef<{ id: string; layer: Layer } | null>(null);
  const endManipulation = useCallback(() => {
    pending.current = null;
    m.id.set('');
    m.mode.set('none');
  }, [m.id, m.mode]);
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    if (layers.find((l) => l.id === p.id) !== p.layer) endManipulation();
  }, [layers, endManipulation]);

  const dragStart = useCallback((id: string) => onLayerDragStart?.(id), [onLayerDragStart]);
  const dragEnd = useCallback(
    (id: string, g: LayerGeometry) => {
      const layer = layers.find((l) => l.id === id);
      const rounded: LayerGeometry = {
        x: Math.round(g.x),
        y: Math.round(g.y),
        width: Math.max(1, Math.round(g.width)),
        height: Math.max(1, Math.round(g.height)),
        rotation: Math.round(g.rotation * 10) / 10,
      };
      const unchanged =
        layer !== undefined &&
        rounded.x === layer.x &&
        rounded.y === layer.y &&
        rounded.width === layer.width &&
        rounded.height === layer.height &&
        rounded.rotation === layer.rotation;
      if (!layer || !onLayerTransformed || unchanged) {
        endManipulation();
        return;
      }
      pending.current = { id, layer };
      if (!onLayerTransformed(id, rounded)) endManipulation();
    },
    [layers, onLayerTransformed, endManipulation],
  );
  const tapAt = useCallback((x: number, y: number) => onTapDocument?.(x, y), [onTapDocument]);

  // Cache du rendu : recalculé seulement quand le contenu change.
  const { width, height, background } = document;
  const backgroundPicture = useMemo(() => recordBackgroundPicture({ width, height, background }), [width, height, background]);
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
    viewWidth.set(viewSize.width);
    viewHeight.set(viewSize.height);
    docSize.set(doc);
    fitInsets.set(insets);
    limits.set(zoomLimits(fit.scale, pixelRatio));
    apply(wasFitted ? fit : clampPan(current(), doc, viewSize), false);
  }, [viewSize, width, height, pixelRatio, apply, current, view, viewWidth, viewHeight, docSize, limits, fitInsets, insets]);

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
        centerOn: (x, y) => {
          const now = current();
          apply(settle({ scale: now.scale, x: view.get().width / 2 - x * now.scale, y: view.get().height / 2 - y * now.scale }), false);
        },
      };
    },
    [apply, current, docSize, fitInsets, limits, pixelRatio, view],
  );

  // ---------- Gestes de la vue (thread UI) ----------
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
    maxDistance: TAP_MAX_DISTANCE,
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

  // ---------- Outil Sélection (thread UI) ----------
  // Un doigt : poignée du calque sélectionné (redimensionner / tourner), sinon
  // calque modifiable touché (déplacer), sinon rien. Deux doigts : la vue.
  const layerPan = usePanGesture({
    maxPointers: 1,
    enabled: selectTool,
    onBegin: (e) => {
      'worklet';
      const s = scale.get();
      const px = (e.x - tx.get()) / s;
      const py = (e.y - ty.get()) / s;
      m.mode.set('none');
      const sel = selected.get();
      if (sel && sel.editable && controls.get()) {
        const handle = hitHandle(sel, px, py, s);
        if (handle) {
          m.start.set(geometryOf(sel));
          m.preview.set(geometryOf(sel));
          m.origin.set({ x: px, y: py });
          m.mode.set(handle === 'rotate' ? 'rotate' : handle);
          m.id.set(sel.id);
          return;
        }
      }
      const hit = hitTest(hitLayers.get(), px, py);
      if (e.numberOfPointers > 1) return;
      const id = pickDragLayer({ autoSelect: auto.get(), hit, selected: sel });
      const target = id === null ? null : id === sel?.id ? sel : hit;
      if (id !== null && target) {
        m.start.set(geometryOf(target));
        m.preview.set(geometryOf(target));
        m.origin.set({ x: px, y: py });
        m.mode.set('move');
        m.id.set(id);
        scheduleOnRN(dragStart, id);
      }
    },
    onUpdate: (e) => {
      'worklet';
      const mode = m.mode.get();
      if (mode === 'none') return;
      const s = scale.get();
      const dx = e.translationX / s;
      const dy = e.translationY / s;
      const start = m.start.get();
      if (mode === 'move') {
        m.preview.set({ ...start, x: start.x + dx, y: start.y + dy });
      } else if (mode === 'rotate') {
        const o = m.origin.get();
        m.preview.set(rotateFromPointer(start, o.x, o.y, o.x + dx, o.y + dy));
      } else {
        m.preview.set(resizeFromCorner(start, mode, dx, dy, selected.get()?.keepAspect ?? false));
      }
    },
    onFinalize: () => {
      'worklet';
      if (m.mode.get() !== 'none' && m.id.get() !== '') scheduleOnRN(dragEnd, m.id.get(), m.preview.get());
    },
  });

  // Un toucher n'est pas un glisser : au-delà de TAP_MAX_DISTANCE points, le tap
  // échoue (sinon, relâcher un calque hors de sa boîte le désélectionnerait).
  const singleTap = useTapGesture({
    numberOfTaps: 1,
    maxDistance: TAP_MAX_DISTANCE,
    enabled: selectTool,
    onActivate: (e) => {
      'worklet';
      if (!auto.get()) return;
      const s = scale.get();
      scheduleOnRN(tapAt, (e.x - tx.get()) / s, (e.y - ty.get()) / s);
    },
  });

  const gesture = useSimultaneousGestures(pinch, twoFingerPan, singleFingerPan, layerPan, singleTap, doubleTap);

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
        style={pasteboardColor ? [styles.fill, { backgroundColor: pasteboardColor }] : styles.fill}
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
              {layers.map((layer) => (layer.visible ? <LayerNode key={layer.id} layer={layer} m={m} resources={resources} /> : null))}
              <Rect x={0} y={0} width={width} height={height} style="stroke" strokeWidth={borderWidth} color={colors.border} />
              {selectedLayer ? (
                <SelectionOutline layer={selectedLayer} m={m} scale={scale} handles={tool === 'select' && showTransformControls && !selectedLayer.locked} />
              ) : null}
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
