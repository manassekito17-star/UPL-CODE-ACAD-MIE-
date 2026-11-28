import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { estimateLayerBytes, formatBytes, orientationOf } from '@/engine/documents';
import { TEXT_MAX_LENGTH, findLayer, normalizeHexColor, type Layer, type TextLayer } from '@/engine/layers';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { BACKGROUND_LABELS, ORIENTATION_LABELS, formatDimensions } from '@/features/projects/labels';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { layerTypeLabel } from '../../panels';
import { Divider, WIconButton, WNumberField, WText } from '@/components/workspace/ui';
import { useWorkspace } from '../WorkspaceContext';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <WText style={styles.sectionTitle} dim>
        {title}
      </WText>
      {children}
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info} accessible accessibilityLabel={`${label} : ${value}`}>
      <WText dim>{label}</WText>
      <WText style={styles.infoValue} numberOfLines={1}>
        {value}
      </WText>
    </View>
  );
}

/** Couleur : pastille, code hexadécimal modifiable, bouton « couleur de premier plan ». */
function ColorRow({ label, value, editable, onCommit, testID }: { label: string; value: string; editable: boolean; onCommit: (hex: string) => string | null; testID?: string }) {
  const foreground = useWorkspaceStore((s) => s.foreground);
  const [text, setText] = useState(value);
  const [shown, setShown] = useState(value);
  const [error, setError] = useState<string | null>(null);
  if (shown !== value) {
    setShown(value);
    setText(value);
  }
  const commit = () => {
    if (text === value) return;
    const hex = normalizeHexColor(text);
    const message = hex ? onCommit(hex) : 'Code couleur invalide (ex. #3685FF).';
    setError(message);
    if (message) setText(value);
  };
  return (
    <View>
      <View style={styles.colorRow}>
        <WText dim style={styles.colorLabel}>
          {label}
        </WText>
        <View style={[styles.chip, { backgroundColor: value }]} />
        <TextInput
          accessibilityLabel={`${label} (code hexadécimal)`}
          value={text}
          editable={editable}
          onChangeText={setText}
          onBlur={commit}
          onSubmitEditing={commit}
          autoCapitalize="characters"
          maxLength={7}
          style={[styles.hex, !editable && styles.off]}
          testID={testID}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Appliquer la couleur de premier plan (${foreground})`}
          disabled={!editable}
          onPress={() => setError(onCommit(foreground.toUpperCase()))}
          style={({ pressed }) => [styles.fgButton, pressed && styles.pressed, !editable && styles.off]}
        >
          <View style={[styles.miniChip, { backgroundColor: foreground }]} />
        </Pressable>
      </View>
      {error ? <WText style={styles.error}>{error}</WText> : null}
    </View>
  );
}

function TextContent({ layer, onCommit }: { layer: TextLayer; onCommit: (text: string) => string | null }) {
  const [text, setText] = useState(layer.text);
  const [shown, setShown] = useState(layer.text);
  const [error, setError] = useState<string | null>(null);
  if (shown !== layer.text) {
    setShown(layer.text);
    setText(layer.text);
  }
  const commit = () => {
    if (text === layer.text) return;
    const message = onCommit(text);
    setError(message);
    if (message) setText(layer.text);
  };
  return (
    <View>
      <TextInput
        accessibilityLabel="Texte du calque"
        value={text}
        onChangeText={setText}
        onBlur={commit}
        multiline
        maxLength={TEXT_MAX_LENGTH}
        editable={!layer.locked}
        style={[styles.textArea, layer.locked && styles.off]}
        testID="prop-text"
      />
      {error ? <WText style={styles.error}>{error}</WText> : null}
    </View>
  );
}

function LayerSections({ layer }: { layer: Layer }) {
  const { document } = useWorkspace();
  const actions = useLayerActions(document.id);
  const editable = !layer.locked;
  const update = (patch: Parameters<typeof actions.update>[1]) => actions.update(layer.id, patch);
  const setStyle = (patch: Parameters<typeof actions.setStyle>[1]) => actions.setStyle(layer.id, patch);

  return (
    <>
      <View style={styles.layerHead}>
        <WText numberOfLines={1} style={styles.layerName}>
          {layer.name}
        </WText>
        <WText dim>{layerTypeLabel(layer)}</WText>
      </View>
      {layer.locked ? <WText dim style={styles.pad}>Calque verrouillé : déverrouillez-le pour le modifier.</WText> : null}
      <Section title="Transformation">
        <View style={styles.grid}>
          <WNumberField label="L" value={layer.width} suffix="px" editable={editable} onCommit={(width) => update({ width })} testID="prop-width" />
          <WNumberField label="H" value={layer.height} suffix="px" editable={editable} onCommit={(height) => update({ height })} testID="prop-height" />
          <WNumberField label="X" value={layer.x} suffix="px" editable={editable} onCommit={(x) => update({ x })} testID="prop-x" />
          <WNumberField label="Y" value={layer.y} suffix="px" editable={editable} onCommit={(y) => update({ y })} testID="prop-y" />
          <WNumberField label="Angle" value={layer.rotation} suffix="°" decimals={1} editable={editable} onCommit={(rotation) => update({ rotation })} testID="prop-rotation" />
          <WNumberField
            label="Opacité"
            value={layer.opacity * 100}
            suffix="%"
            editable={editable}
            onCommit={(p) => (p < 0 || p > 100 ? 'Entre 0 et 100 %.' : update({ opacity: p / 100 }))}
            testID="prop-opacity"
          />
        </View>
      </Section>

      {layer.type === 'shape' ? (
        <Section title="Aspect">
          <ColorRow label="Remplissage" value={layer.fill} editable={editable} onCommit={(color) => setStyle({ color })} testID="prop-color" />
          <WText disabled>Contour, coins arrondis : prévu · M12</WText>
        </Section>
      ) : null}

      {layer.type === 'text' ? (
        <Section title="Texte">
          <TextContent layer={layer} onCommit={(text) => setStyle({ text })} />
          <View style={styles.inline}>
            <WNumberField label="Taille" value={layer.fontSize} suffix="px" editable={editable} onCommit={(fontSize) => setStyle({ fontSize })} testID="prop-font-size" />
            <WIconButton icon="format-bold" label="Gras" active={layer.bold} disabled={!editable} onPress={() => setStyle({ bold: !layer.bold })} />
            <Divider vertical />
            {(['left', 'center', 'right'] as const).map((align) => (
              <WIconButton
                key={align}
                icon={`format-align-${align}`}
                label={{ left: 'Aligner le texte à gauche', center: 'Centrer le texte', right: 'Aligner le texte à droite' }[align]}
                active={layer.align === align}
                disabled={!editable}
                onPress={() => setStyle({ align })}
              />
            ))}
          </View>
          <ColorRow label="Couleur" value={layer.color} editable={editable} onCommit={(color) => setStyle({ color })} testID="prop-color" />
          <WText disabled>Interlignage, approche, paragraphe : prévu · M13</WText>
        </Section>
      ) : null}

      {layer.type === 'image' ? (
        <Section title="Image">
          <Info label="Original" value={formatDimensions(layer.asset.originalWidth, layer.asset.originalHeight)} />
          {layer.asset.width !== layer.asset.originalWidth || layer.asset.height !== layer.asset.originalHeight ? (
            <Info label="Copie de travail" value={formatDimensions(layer.asset.width, layer.asset.height)} />
          ) : null}
          <WText dim style={styles.small}>
            L’original est conservé intact ; la copie de travail est affichée et exportée.
          </WText>
        </Section>
      ) : null}
    </>
  );
}

/** Panneau Propriétés : calque sélectionné, puis document. */
export function PropertiesPanel() {
  const { document } = useWorkspace();
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content} testID="properties-panel">
      {layer ? <LayerSections layer={layer} /> : <WText dim style={styles.pad}>Aucun calque sélectionné.</WText>}
      <Section title="Document">
        <Info label="Dimensions" value={formatDimensions(document.width, document.height)} />
        <Info label="Orientation" value={ORIENTATION_LABELS[orientationOf(document.width, document.height)]} />
        <Info label="Fond" value={BACKGROUND_LABELS[document.background]} />
        <Info label="Calques" value={String(document.layers.length)} />
        <Info label="Mémoire par calque" value={formatBytes(estimateLayerBytes(document.width, document.height))} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 8 },
  pad: { padding: 8 },
  section: { gap: 6, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: ws.header },
  sectionTitle: { fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  layerHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingTop: 8 },
  layerName: { flex: 1, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  info: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  infoValue: { flexShrink: 1, textAlign: 'right' },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorLabel: { width: 78 },
  chip: { width: 22, height: 22, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  hex: { width: 80, height: 26, paddingVertical: 0, paddingHorizontal: 6, color: ws.text, fontSize: wsMetrics.fontSize, backgroundColor: ws.input, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  fgButton: { width: 30, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 3, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  miniChip: { width: 14, height: 14, borderRadius: 2, borderWidth: 1, borderColor: ws.border },
  pressed: { backgroundColor: ws.raised },
  off: { opacity: 0.5 },
  textArea: { minHeight: 56, maxHeight: 120, padding: 6, color: ws.text, fontSize: wsMetrics.fontSize, backgroundColor: ws.input, borderRadius: 3, borderWidth: 1, borderColor: ws.border, textAlignVertical: 'top' },
  error: { color: '#FF7A7A', fontSize: wsMetrics.smallFontSize, marginTop: 2 },
  small: { fontSize: wsMetrics.smallFontSize },
});
