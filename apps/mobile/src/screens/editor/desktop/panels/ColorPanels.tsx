import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';

import { SWATCHES } from '@/components/ui';
import { normalizeHexColor } from '@/engine/layers';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';
import { hexToHsv, hexToRgb, hsvToHex, type Hsv } from '@/utils/color';

import { WText } from '@/components/workspace/ui';

const HUES = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function hsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(hexToHsv(hex).h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Zone tactile : renvoie la position du doigt rapportée à la taille de la zone (0–1). */
function useTouchArea(onMove: (fx: number, fy: number) => void) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const handle = (e: GestureResponderEvent) => onMove(clamp01(e.nativeEvent.locationX / size.width), clamp01(e.nativeEvent.locationY / size.height));
  return {
    size,
    props: {
      onLayout: (e: LayoutChangeEvent) => setSize(e.nativeEvent.layout),
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: handle,
      onResponderMove: handle,
    },
  };
}

/**
 * Panneau Couleur : sélecteur teinte / saturation / valeur de la couleur de
 * premier plan, code hexadécimal modifiable, valeurs RVB et TSL.
 */
export function ColorPanel() {
  const foreground = useWorkspaceStore((s) => s.foreground);
  const setForeground = useWorkspaceStore((s) => s.setForeground);
  // La teinte est gardée à part : une couleur grise ne la porte plus.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(foreground));
  const [shown, setShown] = useState(foreground);
  const [hexText, setHexText] = useState(foreground);
  if (foreground !== shown) {
    setShown(foreground);
    setHexText(foreground);
    if (hsvToHex(hsv) !== foreground) setHsv(hexToHsv(foreground));
  }

  const apply = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setShown(hex);
    setHexText(hex);
    setForeground(hex);
  };

  const sv = useTouchArea((fx, fy) => apply({ h: hsv.h, s: fx, v: 1 - fy }));
  const hue = useTouchArea((_fx, fy) => apply({ ...hsv, h: Math.min(359.9, fy * 360) }));
  const pure = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const { r, g, b } = hexToRgb(foreground);
  const l = hsl(foreground);

  return (
    <View style={styles.stack} testID="color-panel">
      <View style={styles.pickerRow}>
        <View style={styles.sv} accessibilityLabel={`Saturation ${Math.round(hsv.s * 100)} %, valeur ${Math.round(hsv.v * 100)} %`} {...sv.props} testID="color-sv">
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={sv.size.width} height={sv.size.height}>
              <LinearGradient start={vec(0, 0)} end={vec(sv.size.width, 0)} colors={['#FFFFFF', pure]} />
            </Rect>
            <Rect x={0} y={0} width={sv.size.width} height={sv.size.height}>
              <LinearGradient start={vec(0, 0)} end={vec(0, sv.size.height)} colors={['#00000000', '#000000']} />
            </Rect>
          </Canvas>
          <View pointerEvents="none" style={[styles.marker, { left: hsv.s * sv.size.width - 6, top: (1 - hsv.v) * sv.size.height - 6 }]} />
        </View>
        <View style={styles.hue} accessibilityLabel={`Teinte ${Math.round(hsv.h)}°`} {...hue.props} testID="color-hue">
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={hue.size.width} height={hue.size.height}>
              <LinearGradient start={vec(0, 0)} end={vec(0, hue.size.height)} colors={HUES} />
            </Rect>
          </Canvas>
          <View pointerEvents="none" style={[styles.hueMarker, { top: (hsv.h / 360) * hue.size.height - 2 }]} />
        </View>
      </View>
      <View style={styles.values}>
        <View style={[styles.preview, { backgroundColor: foreground }]} />
        <TextInput
          accessibilityLabel="Code hexadécimal de la couleur de premier plan"
          value={hexText}
          onChangeText={setHexText}
          onSubmitEditing={() => {
            const hex = normalizeHexColor(hexText);
            if (hex) setForeground(hex);
            else setHexText(foreground);
          }}
          onBlur={() => {
            const hex = normalizeHexColor(hexText);
            if (hex) setForeground(hex);
            else setHexText(foreground);
          }}
          autoCapitalize="characters"
          maxLength={7}
          style={styles.hexInput}
          testID="color-hex"
        />
        <WText dim style={styles.small}>
          R {r}  V {g}  B {b}
        </WText>
      </View>
      <WText dim style={styles.small}>
        T {l.h}°  S {l.s} %  L {l.l} %
      </WText>
    </View>
  );
}

const EXTRA = ['#FFE7B0', '#F7B25B', '#C9645B', '#3B3A6B', '#141A2E', '#8B5E3C', '#2E7D32', '#B0BEC5', '#FFC1CC', '#00BCD4', '#9C27B0', '#795548'];

/** Nuancier : toucher une couleur en fait la couleur de premier plan. */
export function SwatchesPanel() {
  const foreground = useWorkspaceStore((s) => s.foreground);
  const setForeground = useWorkspaceStore((s) => s.setForeground);
  return (
    <View style={styles.grid} testID="swatches-panel">
      {[...SWATCHES, ...EXTRA].map((c) => (
        <Pressable
          key={c}
          accessibilityRole="button"
          accessibilityLabel={`Nuance ${c}`}
          accessibilityState={{ selected: c === foreground }}
          onPress={() => setForeground(c)}
          style={[styles.swatch, { backgroundColor: c }, c === foreground && styles.swatchOn]}
        />
      ))}
      <WText dim style={styles.note}>
        Palettes enregistrées : prévu · M8
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 6, padding: 8 },
  pickerRow: { flexDirection: 'row', gap: 8, height: 110 },
  sv: { flex: 1, borderRadius: 3, overflow: 'hidden', backgroundColor: '#888' },
  hue: { width: 16, borderRadius: 3, overflow: 'hidden', backgroundColor: '#888' },
  marker: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF' },
  hueMarker: { position: 'absolute', left: -1, right: -1, height: 4, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: 'transparent' },
  values: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  preview: { width: 22, height: 22, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  hexInput: { width: 84, height: 26, paddingVertical: 0, paddingHorizontal: 6, color: ws.text, fontSize: wsMetrics.fontSize, backgroundColor: ws.input, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  small: { fontSize: wsMetrics.smallFontSize },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 8 },
  swatch: { width: 28, height: 28, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  swatchOn: { borderWidth: 2, borderColor: ws.accent },
  note: { width: '100%', fontSize: wsMetrics.smallFontSize, marginTop: 4 },
});
