import { Canvas, Circle, Group, Line, Path, Picture, Rect, Skia, vec } from '@shopify/react-native-skia';
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
  boundsOf,
  gridLines,
  hitGuide,
  isGuideDroppedOutside,
  snapGuidePosition,
  snapMove,
  type GridSettings,
  type Guide,
  type GuideOrientation,
} from '@/engine/guides';
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
  /** Repères du document ; affichés si `guidesVisible` (vrai par défaut). */
  guides?: readonly Guide[];
  guidesVisible?: boolean;
  /** Repères verrouillés : l'outil Sélection ne les déplace pas. */
  guidesLocked?: boolean;
  /** Grille affichée (null : masquée). */
  grid?: GridSettings | null;
  /** Magnétisme : bords du document, repères, autres calques et grille affichée. */
  snap?: boolean;
  /**
   * Fin du glisser d'un repère à l'outil Sélection : position (non arrondie)
   * où il a été relâché, éventuellement hors du document.
   */
  onGuideDropped?: (id: string, position: number) => void;
}

/** Repère en cours de glisser (depuis une règle : id vide), affiché à la place du repère. */
export type GuideDraft = { id: string; orientation: GuideOrientation; position: number } | null;

export interface ViewSharedValues {
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  /** Taille de la zone de travail en points (0 tant qu'elle est inconnue). */
  width: SharedValue<number>;
  height: SharedValue<number>;
  /** Repère glissé depuis une règle ou à l'outil Sélection. */
  guideDraft: SharedValue<GuideDraft>;
}

/** Valeurs de vue partagées entre le canvas et les éléments qui le suivent. */
export function useViewSharedValues(): ViewSharedValues {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const guideDraft = useSharedValue<GuideDraft>(null);
  return useMemo(() => ({ scale, tx, ty, width, height, guideDraft }), [scale, tx, ty, width, height, guideDraft]);
}

type Mode = 'none' | 'move' | 'rotate' | 'guide' | Corner;

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
/** Couleurs des repères et des repères commentés (alignement en cours). */
const GUIDE_COLOR = '#00B8F0';
const SMART_GUIDE_COLOR = '#FF2FD0';
const GRID_MAJOR = 'rgba(140, 140, 140, 0.75)';
const GRID_MINOR = 'rgba(140, 140, 140, 0.35)';
const NO_GUIDES: readonly Guide[] = [];

/** Bords et centre d'un calque, pour le magnétisme entre calques. */
interface LayerSnapLines {
  id: string;
  xs: number[];
  ys: number[];
}

/** Grille du document : lignes principales et subdivisions, d'un point écran d'épaisseur. */
function GridOverlay({ width, height, grid, scale }: { width: number; height: number; grid: GridSettings; scale: SharedValue<number> }) {
  const paths = useMemo(() => {
    const build = (vertical: number[], horizontal: number[]) => {
      const b = Skia.PathBuilder.Make();
      for (const x of vertical) {
        b.moveTo(x, 0);
        b.lineTo(x, height);
      }
      for (const y of horizontal) {
        b.moveTo(0, y);
        b.lineTo(width, y);
      }
      return b.build();
    };
    const xs = gridLines(width, grid);
    const ys = gridLines(height, grid);
    return { major: build(xs.major, ys.major), minor: build(xs.minor, ys.minor) };
  }, [width, height, grid]);
  const stroke = useDerivedValue(() => 1 / scale.get());
  return (
    <>
      <Path path={paths.minor} style="stroke" strokeWidth={stroke} color={GRID_MINOR} />
      <Path path={paths.major} style="stroke" strokeWidth={stroke} color={GRID_MAJOR} />
    </>
  );
}

/**
 * Repères (lignes d'un point écran sur toute la zone visible), le repère en
 * cours de glisser et les lignes d'alignement du magnétisme.
 */
function GuidesOverlay({
  guides,
  visible,
  view,
  snapLines,
  docSize,
}: {
  guides: SharedValue<readonly Guide[]>;
  visible: SharedValue<boolean>;
  view: ViewSharedValues;
  snapLines: SharedValue<{ x: number | null; y: number | null }>;
  docSize: SharedValue<Size>;
}) {
  const stroke = useDerivedValue(() => 1 / view.scale.get());
  const area = () => {
    'worklet';
    const s = Math.max(view.scale.get(), 1e-6);
    return {
      left: -view.tx.get() / s,
      top: -view.ty.get() / s,
      right: (view.width.get() - view.tx.get()) / s,
      bottom: (view.height.get() - view.ty.get()) / s,
    };
  };
  const guidePath = useDerivedValue(() => {
    const a = area();
    const draft = view.guideDraft.get();
    const b = Skia.PathBuilder.Make();
    const add = (o: GuideOrientation, p: number) => {
      if (o === 'horizontal') {
        b.moveTo(a.left, p);
        b.lineTo(a.right, p);
      } else {
        b.moveTo(p, a.top);
        b.lineTo(p, a.bottom);
      }
    };
    if (visible.get()) for (const g of guides.get()) if (!draft || draft.id !== g.id) add(g.orientation, g.position);
    if (draft) add(draft.orientation, draft.position);
    return b.build();
  });
  const smartPath = useDerivedValue(() => {
    const l = snapLines.get();
    const d = docSize.get();
    const b = Skia.PathBuilder.Make();
    if (l.x !== null) {
      b.moveTo(l.x, Math.min(0, area().top));
      b.lineTo(l.x, Math.max(d.height, area().bottom));
    }
    if (l.y !== null) {
      b.moveTo(Math.min(0, area().left), l.y);
      b.lineTo(Math.max(d.width, area().right), l.y);
    }
    return b.build();
  });
  return (
    <>
      <Path path={guidePath} style="stroke" strokeWidth={stroke} color={GUIDE_COLOR} />
      <Path path={smartPath} style="stroke" strokeWidth={stroke} color={SMART_GUIDE_COLOR} />
    </>
  );
}

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
  guides = NO_GUIDES,
  guidesVisible = true,
  guidesLocked = false,
  grid = null,
  snap = false,
  onGuideDropped,
}: DocumentCanvasProps) {
  const pixelRatio = PixelRatio.get();
  const [viewSize, setViewSize] = useState<Size | null>(null);

  // État de la vue, partagé entre le thread JS et le thread UI.
  const ownView = useViewSharedValues();
  const viewValues = externalView ?? ownView;
  const { scale, tx, ty, width: viewWidth, height: viewHeight, guideDraft } = viewValues;
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
  // Repères et magnétisme, copiés pour le thread UI.
  const guidesSV = useSharedValue<readonly Guide[]>(guides);
  const guidesShown = useSharedValue(guidesVisible);
  const guidesMovable = useSharedValue(guidesVisible && !guidesLocked);
  const snapOn = useSharedValue(snap);
  const gridSV = useSharedValue<GridSettings | null>(grid);
  const layerLines = useSharedValue<LayerSnapLines[]>([]);
  /** Lignes d'attraction du déplacement en cours (fixées au début du geste). */
  const moveTargets = useSharedValue<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });
  const snapLines = useSharedValue<{ x: number | null; y: number | null }>({ x: null, y: null });
  const guideStart = useSharedValue(0);
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

  useEffect(() => {
    guidesSV.set(guides);
    guidesShown.set(guidesVisible);
    guidesMovable.set(guidesVisible && !guidesLocked);
    snapOn.set(snap);
    gridSV.set(grid);
  }, [guides, guidesVisible, guidesLocked, snap, grid, guidesSV, guidesShown, guidesMovable, snapOn, gridSV]);

  // Fin du glisser d'un repère : le repère glissé reste affiché à sa
  // nouvelle place jusqu'à ce que le document modifié soit rendu.
  const pendingGuide = useRef(false);
  useLayoutEffect(() => {
    if (pendingGuide.current) {
      pendingGuide.current = false;
      guideDraft.set(null);
    }
  }, [guides, guideDraft]);
  const guideDrop = useCallback(
    (id: string, position: number) => {
      const guide = guides.find((g) => g.id === id);
      const changed =
        guide !== undefined &&
        onGuideDropped !== undefined &&
        (Math.round(position) !== guide.position || isGuideDroppedOutside(guide.orientation, position, document));
      if (!changed) {
        guideDraft.set(null);
        return;
      }
      pendingGuide.current = true;
      onGuideDropped(id, position);
    },
    [guides, onGuideDropped, guideDraft, document],
  );

  // Copies légères pour le thread UI : test d'atteinte et poignées.
  const selectedLayer = layers.find((l) => l.id === selectedLayerId && l.visible) ?? null;
  useEffect(() => {
    hitLayers.set(layers.map((l) => ({ id: l.id, ...geometryOf(l), visible: l.visible, locked: l.locked })));
    layerLines.set(
      layers
        .filter((l) => l.visible)
        .map((l) => {
          const b = boundsOf(l);
          return { id: l.id, xs: [b.left, (b.left + b.right) / 2, b.right], ys: [b.top, (b.top + b.bottom) / 2, b.bottom] };
        }),
    );
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
  }, [layers, selectedLayer, hitLayers, selected, layerLines]);

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
  const backgroundColor = document.backgroundColor;
  const backgroundPicture = useMemo(
    () => recordBackgroundPicture({ width, height, background, backgroundColor }),
    [width, height, background, backgroundColor],
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
      if (guidesMovable.get()) {
        const g = hitGuide(guidesSV.get(), px, py, s);
        if (g) {
          guideStart.set(g.position);
          guideDraft.set({ id: g.id, orientation: g.orientation, position: g.position });
          m.mode.set('guide');
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
        // Cibles du magnétisme : document, repères visibles, autres calques.
        const d = docSize.get();
        const xs = [0, d.width / 2, d.width];
        const ys = [0, d.height / 2, d.height];
        if (guidesShown.get()) for (const g of guidesSV.get()) (g.orientation === 'vertical' ? xs : ys).push(g.position);
        for (const l of layerLines.get()) {
          if (l.id === id) continue;
          for (const v of l.xs) xs.push(v);
          for (const v of l.ys) ys.push(v);
        }
        moveTargets.set({ xs, ys });
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
      if (mode === 'guide') {
        const draft = guideDraft.get();
        if (!draft) return;
        const raw = guideStart.get() + (draft.orientation === 'horizontal' ? dy : dx);
        const position = snapOn.get() ? snapGuidePosition(draft.orientation, raw, docSize.get(), gridSV.get(), s) : raw;
        guideDraft.set({ ...draft, position });
        return;
      }
      const start = m.start.get();
      if (mode === 'move') {
        const moved = { ...start, x: start.x + dx, y: start.y + dy };
        if (snapOn.get()) {
          const t = moveTargets.get();
          const r = snapMove(moved, { xs: t.xs, ys: t.ys, grid: gridSV.get() }, s);
          m.preview.set({ ...moved, x: moved.x + r.dx, y: moved.y + r.dy });
          snapLines.set({ x: r.lineX, y: r.lineY });
        } else {
          m.preview.set(moved);
        }
      } else if (mode === 'rotate') {
        const o = m.origin.get();
        m.preview.set(rotateFromPointer(start, o.x, o.y, o.x + dx, o.y + dy));
      } else {
        m.preview.set(resizeFromCorner(start, mode, dx, dy, selected.get()?.keepAspect ?? false));
      }
    },
    onFinalize: () => {
      'worklet';
      snapLines.set({ x: null, y: null });
      if (m.mode.get() === 'guide') {
        m.mode.set('none');
        const draft = guideDraft.get();
        if (draft) scheduleOnRN(guideDrop, draft.id, draft.position);
        return;
      }
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
              {grid ? <GridOverlay width={width} height={height} grid={grid} scale={scale} /> : null}
              <GuidesOverlay guides={guidesSV} visible={guidesShown} view={viewValues} snapLines={snapLines} docSize={docSize} />
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
