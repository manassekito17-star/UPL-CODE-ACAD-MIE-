import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui';
import { findLayer, type AlignEdge, type Layer } from '@/engine/layers';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { findTool } from '../toolFamilies';
import { useEffectiveToolKey } from './ToolRail';
import { Divider, WIconButton, WNumberField, WSelect, WText } from './ui';
import { ZOOM_STEP, useWorkspace } from './WorkspaceContext';

const ALIGN: { edge: AlignEdge; icon: 'align-horizontal-left' | 'align-horizontal-center' | 'align-horizontal-right' | 'align-vertical-top' | 'align-vertical-center' | 'align-vertical-bottom'; label: string }[] = [
  { edge: 'left', icon: 'align-horizontal-left', label: 'Aligner à gauche du document' },
  { edge: 'center', icon: 'align-horizontal-center', label: 'Centrer horizontalement' },
  { edge: 'right', icon: 'align-horizontal-right', label: 'Aligner à droite du document' },
  { edge: 'top', icon: 'align-vertical-top', label: 'Aligner en haut du document' },
  { edge: 'middle', icon: 'align-vertical-center', label: 'Centrer verticalement' },
  { edge: 'bottom', icon: 'align-vertical-bottom', label: 'Aligner en bas du document' },
];

/** Pastille « appliquer la couleur de premier plan » au calque sélectionné. */
function ColorChip({ label, color, onApply, disabled }: { label: string; color: string; onApply: () => void; disabled: boolean }) {
  const foreground = useWorkspaceStore((s) => s.foreground);
  return (
    <View style={styles.group}>
      <WText dim>{label}</WText>
      <View style={[styles.chip, { backgroundColor: color }]} accessible accessibilityLabel={`${label} actuelle ${color}`} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Appliquer la couleur de premier plan (${foreground})`}
        disabled={disabled}
        onPress={onApply}
        style={({ pressed }) => [styles.applyButton, pressed && styles.pressed, disabled && styles.off]}
      >
        <View style={[styles.miniChip, { backgroundColor: foreground }]} />
        <Icon name="arrow-right" size={12} color={ws.textDim} />
      </Pressable>
    </View>
  );
}

function GeometryFields({ layer, onCommit }: { layer: Layer | undefined; onCommit: (patch: Record<string, number>) => string | null }) {
  const editable = !!layer && !layer.locked;
  const v = layer ?? { x: 0, y: 0, width: 0, height: 0, rotation: 0 };
  return (
    <>
      <WNumberField label="X" value={v.x} suffix="px" editable={editable} onCommit={(x) => onCommit({ x })} testID="opt-x" />
      <WNumberField label="Y" value={v.y} suffix="px" editable={editable} onCommit={(y) => onCommit({ y })} testID="opt-y" />
      <WNumberField label="L" value={v.width} suffix="px" editable={editable} onCommit={(width) => onCommit({ width })} testID="opt-width" />
      <WNumberField label="H" value={v.height} suffix="px" editable={editable} onCommit={(height) => onCommit({ height })} testID="opt-height" />
      <WNumberField label="Angle" value={v.rotation} suffix="°" decimals={1} width={60} editable={editable} onCommit={(rotation) => onCommit({ rotation })} testID="opt-angle" />
    </>
  );
}

/** Barre d'options : son contenu suit l'outil actif. */
export function OptionsBar() {
  const { document, controller } = useWorkspace();
  const key = useEffectiveToolKey();
  const tool = findTool(key);
  const actions = useLayerActions(document.id);
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const foreground = useWorkspaceStore((s) => s.foreground);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  const update = (patch: Record<string, number>) => (layer ? actions.update(layer.id, patch) : null);

  let content: React.ReactNode = null;
  if (!tool) content = null;
  else if (tool.status === 'todo') {
    content = <WText dim>Outil prévu au module {tool.note} : il n’est pas encore disponible.</WText>;
  } else if (key === 'move') {
    content = (
      <>
        <WText dim>Sélection auto : calque le plus haut sous le doigt</WText>
        <Divider vertical />
        <GeometryFields layer={layer} onCommit={update} />
        <Divider vertical />
        {ALIGN.map((a) => (
          <WIconButton key={a.edge} icon={a.icon} label={a.label} disabled={!layer || layer.locked} onPress={() => layer && actions.align(layer.id, a.edge)} />
        ))}
      </>
    );
  } else if (key === 'hand' || key === 'zoom') {
    content = (
      <>
        <WIconButton icon="magnify-minus-outline" label="Zoom arrière" onPress={() => controller.current?.zoomBy(1 / ZOOM_STEP)} />
        <WIconButton icon="magnify-plus-outline" label="Zoom avant" onPress={() => controller.current?.zoomBy(ZOOM_STEP)} />
        <Divider vertical />
        <Pressable accessibilityRole="button" accessibilityLabel="100 %" onPress={() => controller.current?.setZoomPercent(100)} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
          <WText>100 %</WText>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Ajuster à l’écran" onPress={() => controller.current?.fitToScreen()} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
          <WText>Ajuster à l’écran</WText>
        </Pressable>
        <Divider vertical />
        <WText dim>Un doigt déplace la vue ; deux doigts zooment ; double tap : ajuster ou 100 %</WText>
      </>
    );
  } else if (key === 'type-horizontal') {
    const text = layer?.type === 'text' ? layer : undefined;
    const off = !text || text.locked;
    content = (
      <>
        <WSelect label="Police" value="Inter" width={110} entries={[{ type: 'item', label: 'Inter', checked: true, disabled: true }, { type: 'item', label: 'Autres polices', planned: true, right: 'M13' }]} />
        <WSelect
          label="Graisse"
          value={text?.bold ? 'Gras' : 'Normal'}
          width={96}
          entries={[
            { type: 'item', label: 'Normal', checked: text ? !text.bold : false, disabled: off, onPress: () => text && actions.setStyle(text.id, { bold: false }) },
            { type: 'item', label: 'Gras', checked: text?.bold, disabled: off, onPress: () => text && actions.setStyle(text.id, { bold: true }) },
          ]}
        />
        <WNumberField label="Taille" value={text?.fontSize ?? 0} suffix="px" editable={!off} onCommit={(fontSize) => (text ? actions.setStyle(text.id, { fontSize }) : null)} testID="opt-font-size" />
        <Divider vertical />
        {(['left', 'center', 'right'] as const).map((align) => (
          <WIconButton
            key={align}
            icon={`format-align-${align}`}
            label={{ left: 'Aligner le texte à gauche', center: 'Centrer le texte', right: 'Aligner le texte à droite' }[align]}
            active={text?.align === align}
            disabled={off}
            onPress={() => text && actions.setStyle(text.id, { align })}
          />
        ))}
        <Divider vertical />
        <ColorChip label="Couleur" color={text?.color ?? foreground} disabled={off} onApply={() => text && actions.setStyle(text.id, { color: foreground })} />
        {!text ? <WText dim>Touchez l’outil pour ajouter un texte ; sélectionnez un texte pour le modifier.</WText> : null}
      </>
    );
  } else if (key.startsWith('shape-')) {
    const shape = layer?.type === 'shape' ? layer : undefined;
    const off = !shape || shape.locked;
    content = (
      <>
        <ColorChip label="Remplissage" color={shape?.fill ?? foreground} disabled={off} onApply={() => shape && actions.setStyle(shape.id, { color: foreground })} />
        <WText disabled>Contour : prévu · M12</WText>
        <Divider vertical />
        <GeometryFields layer={shape} onCommit={update} />
      </>
    );
  }

  return (
    <View style={styles.bar} testID="options-bar">
      {tool ? (
        <View style={styles.toolName}>
          <Icon name={tool.icon} size={18} color={ws.accentText} />
          <WText>{tool.label}</WText>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {content}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: wsMetrics.optionsBar, flexDirection: 'row', alignItems: 'center', backgroundColor: ws.chrome, borderBottomWidth: 1, borderBottomColor: ws.border },
  toolName: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: '100%', borderRightWidth: 1, borderRightColor: ws.divider },
  content: { alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  group: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { width: 22, height: 22, borderRadius: 3, borderWidth: 1, borderColor: ws.border },
  miniChip: { width: 14, height: 14, borderRadius: 2, borderWidth: 1, borderColor: ws.border },
  applyButton: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 26, paddingHorizontal: 6, borderRadius: 3, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  textButton: { height: 26, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 3, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  pressed: { backgroundColor: ws.raised },
  off: { opacity: 0.45 },
});
