import { Canvas, Group, Path, Skia, Text, useFont, type SkFont } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { ViewSharedValues } from '@/engine/canvas';
import { snapGuidePosition, type GridSettings, type GuideOrientation } from '@/engine/guides';
import { ws, wsMetrics } from '@/theme';

/** Nombre maximal de graduations numérotées affichées sur une règle. */
const LABEL_POOL = 32;
/** Écart visé entre deux nombres, en points écran. */
const TARGET_SPACING = 64;

/**
 * Pas des graduations numérotées, en pixels du document : 1, 2 ou 5 × 10ⁿ,
 * le plus petit qui laisse au moins TARGET_SPACING points entre deux nombres.
 */
export function rulerStep(scale: number): number {
  'worklet';
  const target = TARGET_SPACING / Math.max(scale, 1e-6);
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  for (const m of [1, 2, 5, 10]) if (pow * m >= target) return pow * m;
  return pow * 10;
}

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  view: ViewSharedValues;
  length: number;
  font: SkFont | null;
}

function Label({ index, labels, font, vertical }: { index: number; labels: SharedValue<{ p: number; t: string }[]>; font: SkFont | null; vertical: boolean }) {
  const text = useDerivedValue(() => labels.get()[index]?.t ?? '');
  const transform = useDerivedValue(() => {
    const label = labels.get()[index];
    const p = label?.p ?? -1000;
    if (!vertical) return [{ translateX: p + 3 }, { translateY: 9 }];
    // Texte vertical lu de bas en haut, placé juste sous sa graduation.
    const w = font && label ? font.getTextWidth(label.t) : 0;
    return [{ translateX: 11 }, { translateY: p + 3 + w }, { rotate: -Math.PI / 2 }];
  });
  if (!font) return null;
  return (
    <Group transform={transform}>
      <Text x={0} y={0} text={text} font={font} color={ws.textDim} />
    </Group>
  );
}

function Ruler({ orientation, view, length, font }: RulerProps) {
  const vertical = orientation === 'vertical';
  const size = wsMetrics.ruler;

  // Graduations : majeures (pas), moyennes (pas / 2) et mineures (pas / 10).
  const ticks = useDerivedValue(() => {
    const s = view.scale.get();
    const origin = vertical ? view.ty.get() : view.tx.get();
    const step = rulerStep(s);
    const minor = step / 10;
    const first = Math.floor(-origin / s / minor) * minor;
    const path = Skia.PathBuilder.Make();
    for (let v = first, i = 0; i < 2000; v += minor, i += 1) {
      const p = origin + v * s;
      if (p > length) break;
      const k = Math.round(v / minor);
      const h = k % 10 === 0 ? size : k % 5 === 0 ? size * 0.45 : size * 0.25;
      if (vertical) {
        path.moveTo(size - h, p);
        path.lineTo(size, p);
      } else {
        path.moveTo(p, size - h);
        path.lineTo(p, size);
      }
    }
    return path.build();
  });

  const labels = useDerivedValue(() => {
    const s = view.scale.get();
    const origin = vertical ? view.ty.get() : view.tx.get();
    const step = rulerStep(s);
    const first = Math.floor(-origin / s / step) * step;
    const out: { p: number; t: string }[] = [];
    for (let v = first; out.length < LABEL_POOL; v += step) {
      const p = origin + v * s;
      if (p > length) break;
      if (p >= -40) out.push({ p, t: String(Math.round(v)) });
    }
    return out;
  });

  return (
    <Canvas style={vertical ? { width: size, height: length } : { width: length, height: size }}>
      <Path path={ticks} style="stroke" strokeWidth={1} color={ws.rulerTick} />
      {Array.from({ length: LABEL_POOL }, (_, i) => (
        <Label key={i} index={i} labels={labels} font={font} vertical={vertical} />
      ))}
    </Canvas>
  );
}

/** Création de repères en glissant depuis les règles. */
export interface RulerGuideOptions {
  docWidth: number;
  docHeight: number;
  grid: GridSettings | null;
  snap: boolean;
  onCreate: (orientation: GuideOrientation, position: number) => void;
}

/**
 * Glisser depuis une règle vers la zone de travail crée un repère : la règle
 * du haut un repère horizontal, celle de gauche un repère vertical. Relâché
 * sur la règle, il est abandonné.
 */
function useRulerGuidePan(orientation: GuideOrientation, view: ViewSharedValues, options: RulerGuideOptions | undefined) {
  const size = wsMetrics.ruler;
  const doc = useSharedValue({ width: options?.docWidth ?? 1, height: options?.docHeight ?? 1 });
  const grid = useSharedValue<GridSettings | null>(options?.grid ?? null);
  const snap = useSharedValue(options?.snap ?? false);
  const inside = useSharedValue(false);
  const docWidth = options?.docWidth ?? 1;
  const docHeight = options?.docHeight ?? 1;
  const gridValue = options?.grid ?? null;
  const snapValue = options?.snap ?? false;
  useEffect(() => {
    doc.set({ width: docWidth, height: docHeight });
    grid.set(gridValue);
    snap.set(snapValue);
  }, [doc, grid, snap, docWidth, docHeight, gridValue, snapValue]);
  const create = options?.onCreate;
  const finish = (position: number) => {
    create?.(orientation, position);
    view.guideDraft.set(null);
  };
  return usePanGesture({
    maxPointers: 1,
    enabled: !!create,
    onUpdate: (e) => {
      'worklet';
      const horizontal = orientation === 'horizontal';
      // Position dans la zone de travail (sous la règle du haut, à droite de celle de gauche).
      const local = horizontal ? e.y - size : e.x - size;
      const s = Math.max(view.scale.get(), 1e-6);
      const raw = (local - (horizontal ? view.ty.get() : view.tx.get())) / s;
      const position = snap.get() ? snapGuidePosition(orientation, raw, doc.get(), grid.get(), s) : raw;
      inside.set(local > 0);
      view.guideDraft.set(local > 0 ? { id: '', orientation, position } : null);
    },
    onFinalize: () => {
      'worklet';
      const draft = view.guideDraft.get();
      if (inside.get() && draft && draft.id === '') scheduleOnRN(finish, draft.position);
      else view.guideDraft.set(null);
      inside.set(false);
    },
  });
}

/**
 * Règles horizontale et verticale (en pixels du document), qui suivent le
 * zoom et le déplacement de la vue sur le thread UI. `children` est la zone
 * de travail, placée sous la règle horizontale et à droite de la verticale.
 */
export function RulersFrame({ view, visible, guides, children }: { view: ViewSharedValues; visible: boolean; guides?: RulerGuideOptions; children: React.ReactNode }) {
  const hPan = useRulerGuidePan('horizontal', view, guides);
  const vPan = useRulerGuidePan('vertical', view, guides);
  const font = useFont(require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'), 9);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => setArea(e.nativeEvent.layout);

  // Même arbre affiché ou non : masquer les règles ne recrée pas le canvas.
  return (
    <View style={styles.fill} testID={visible ? 'rulers' : undefined}>
      <View style={[styles.topRow, !visible && styles.hidden]}>
        <View style={styles.corner} />
        <GestureDetector gesture={hPan}>
          <View style={styles.hRuler} testID="ruler-horizontal" accessibilityHint={guides ? 'Glisser vers le document pour créer un repère horizontal' : undefined}>
            {visible && area.width > 0 ? <Ruler orientation="horizontal" view={view} length={area.width} font={font} /> : null}
          </View>
        </GestureDetector>
      </View>
      <View style={styles.bottomRow}>
        <GestureDetector gesture={vPan}>
          <View style={[styles.vRuler, !visible && styles.hidden]} testID="ruler-vertical" accessibilityHint={guides ? 'Glisser vers le document pour créer un repère vertical' : undefined}>
            {visible && area.height > 0 ? <Ruler orientation="vertical" view={view} length={area.height} font={font} /> : null}
          </View>
        </GestureDetector>
        <View style={styles.fill} onLayout={onLayout}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topRow: { flexDirection: 'row', height: wsMetrics.ruler },
  corner: { width: wsMetrics.ruler, height: wsMetrics.ruler, backgroundColor: ws.chrome, borderRightWidth: 1, borderBottomWidth: 1, borderColor: ws.border },
  hRuler: { flex: 1, backgroundColor: ws.chrome, borderBottomWidth: 1, borderColor: ws.border, overflow: 'hidden' },
  bottomRow: { flex: 1, flexDirection: 'row' },
  hidden: { height: 0, width: 0, borderWidth: 0, overflow: 'hidden' },
  vRuler: { width: wsMetrics.ruler, backgroundColor: ws.chrome, borderRightWidth: 1, borderColor: ws.border, overflow: 'hidden' },
});
