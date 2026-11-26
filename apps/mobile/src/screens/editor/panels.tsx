import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  BackgroundSwatch,
  ColorField,
  ConfirmDialog,
  Icon,
  IconButton,
  NumberField,
  PromptDialog,
  SegmentedControl,
  TextField,
  type SegmentOption,
} from '@/components/ui';
import { estimateLayerBytes, formatBytes, orientationOf, type GraphicDocument } from '@/engine/documents';
import { LAYER_NAME_MAX, TEXT_MAX_LENGTH, findLayer, type Layer, type TextAlignment, type TextLayer } from '@/engine/layers';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { BACKGROUND_LABELS, ORIENTATION_LABELS, formatDimensions } from '@/features/projects/labels';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/date';

import { useInsertMenu } from './useInsertMenu';

interface PanelContentProps {
  document: GraphicDocument;
}

const SHAPE_LABELS = { rectangle: 'Rectangle', ellipse: 'Cercle', line: 'Ligne' } as const;

export function layerTypeLabel(layer: Layer): string {
  if (layer.type === 'shape') return SHAPE_LABELS[layer.shape];
  return layer.type === 'text' ? 'Texte' : 'Image';
}

/** Vignette d'un calque dans la liste : couleur de la forme, ou icône du type. */
function LayerThumb({ layer }: { layer: Layer }) {
  return (
    <View style={[styles.layerThumb, !layer.visible && styles.dimmed]}>
      {layer.type === 'shape' ? (
        <View
          style={[
            layer.shape === 'line' ? styles.thumbLine : styles.layerThumbFill,
            { backgroundColor: layer.fill, opacity: layer.opacity },
            layer.shape === 'ellipse' && styles.thumbEllipse,
          ]}
        />
      ) : (
        <View style={styles.thumbIcon}>
          <Icon name={layer.type === 'text' ? 'format-text' : 'image-outline'} size={20} color={colors.textPrimary} />
        </View>
      )}
    </View>
  );
}

function Notice() {
  const notice = useEditorUiStore((s) => s.notice);
  if (!notice) return null;
  return (
    <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="layer-notice">
      <Icon name="alert-circle-outline" size={18} color={colors.warning} />
      <AppText variant="caption" tone="secondary" style={styles.flex}>
        {notice}
      </AppText>
    </View>
  );
}

function LayerRow({ layer, selected, documentId }: { layer: Layer; selected: boolean; documentId: string }) {
  const actions = useLayerActions(documentId);
  return (
    <View style={[styles.layerRow, selected && styles.layerRowSelected]} testID={`layer-row-${layer.id}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Calque ${layer.name}`}
        accessibilityHint={`${layerTypeLabel(layer)}${layer.visible ? '' : ', masqué'}${layer.locked ? ', verrouillé' : ''}`}
        accessibilityState={{ selected }}
        onPress={() => actions.select(layer.id)}
        style={styles.layerSelect}
      >
        <LayerThumb layer={layer} />
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1} tone={layer.visible ? 'primary' : 'secondary'}>
            {layer.name}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {layerTypeLabel(layer)} · {Math.round(layer.opacity * 100)} %
          </AppText>
        </View>
      </Pressable>
      <IconButton
        icon={layer.locked ? 'lock-outline' : 'lock-open-variant-outline'}
        label={layer.locked ? `Déverrouiller ${layer.name}` : `Verrouiller ${layer.name}`}
        active={layer.locked}
        onPress={() => actions.setLocked(layer.id, !layer.locked)}
      />
      <IconButton
        icon={layer.visible ? 'eye-outline' : 'eye-off-outline'}
        label={layer.visible ? `Masquer ${layer.name}` : `Afficher ${layer.name}`}
        onPress={() => actions.setVisible(layer.id, !layer.visible)}
      />
    </View>
  );
}

/** Panneau Calques : pile (le haut en premier), actions sur le calque sélectionné, fond. */
export function LayersPanelContent({ document }: PanelContentProps) {
  const actions = useLayerActions(document.id);
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const selected = selectedId ? findLayer(document, selectedId) : undefined;
  const index = selected ? document.layers.indexOf(selected) : -1;

  // Le calque visé est mémorisé à l'ouverture de la boîte : la confirmation ne
  // peut porter que sur celui-là, même si la sélection change entre-temps.
  const [pendingDelete, setPendingDelete] = useState<Layer | null>(null);
  const [renaming, setRenaming] = useState<Layer | null>(null);
  const insertMenu = useInsertMenu(document.id);

  return (
    <View style={styles.stack} testID="layers-panel-content">
      <View style={styles.actionsRow} accessibilityRole="toolbar" accessibilityLabel="Actions sur les calques">
        <IconButton icon="layers-plus" label="Ajouter un calque" onPress={insertMenu.openAll} />
        <IconButton icon="content-copy" label="Dupliquer le calque" disabled={!selected} onPress={() => selected && actions.duplicate(selected.id)} />
        <IconButton
          icon="arrow-up"
          label="Monter le calque"
          disabled={!selected || index === document.layers.length - 1}
          onPress={() => selected && actions.moveUp(selected.id)}
        />
        <IconButton
          icon="arrow-down"
          label="Descendre le calque"
          disabled={!selected || index <= 0}
          onPress={() => selected && actions.moveDown(selected.id)}
        />
        <IconButton icon="pencil-outline" label="Renommer le calque" disabled={!selected} onPress={() => selected && setRenaming(selected)} />
        <IconButton
          icon="delete-outline"
          label="Supprimer le calque"
          tone="danger"
          disabled={!selected || selected.locked}
          accessibilityHint={selected?.locked ? 'Déverrouillez le calque pour le supprimer' : undefined}
          onPress={() => selected && setPendingDelete(selected)}
        />
      </View>

      <Notice />

      {document.layers.length === 0 ? (
        <AppText variant="caption" tone="secondary" testID="layers-empty">
          Aucun calque. Ajoutez un texte, une forme ou une image pour commencer.
        </AppText>
      ) : (
        <View style={styles.list} accessibilityLabel="Pile des calques, du haut vers le bas">
          {[...document.layers].reverse().map((layer) => (
            <LayerRow key={layer.id} layer={layer} selected={layer.id === selectedId} documentId={document.id} />
          ))}
        </View>
      )}

      <View style={styles.backgroundRow} accessible accessibilityLabel={`Fond du document : ${BACKGROUND_LABELS[document.background]}`}>
        <BackgroundSwatch background={document.background} style={styles.swatch} />
        <View style={styles.flex}>
          <AppText variant="label">Fond du document</AppText>
          <AppText variant="caption" tone="secondary">
            {BACKGROUND_LABELS[document.background]}
          </AppText>
        </View>
      </View>

      {insertMenu.dialog}
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Supprimer le calque ?"
        message={pendingDelete ? `« ${pendingDelete.name} » sera supprimé du document.` : ''}
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) actions.remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
      <PromptDialog
        visible={renaming !== null}
        title="Renommer le calque"
        label="Nom du calque"
        initialValue={renaming?.name ?? ''}
        confirmLabel="Renommer"
        maxLength={LAYER_NAME_MAX}
        onCancel={() => setRenaming(null)}
        onSubmit={(name) => {
          if (!renaming) return null;
          const error = actions.rename(renaming.id, name);
          if (error === null) setRenaming(null);
          return error;
        }}
      />
    </View>
  );
}

function Property({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.property} accessible accessibilityLabel={`${label} : ${value}`}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="label" style={styles.propertyValue}>
        {value}
      </AppText>
    </View>
  );
}

function LayerProperties({ document, layer }: { document: GraphicDocument; layer: Layer }) {
  const actions = useLayerActions(document.id);
  const editable = !layer.locked;
  const commit = (patch: Parameters<typeof actions.update>[1]) => actions.update(layer.id, patch);

  return (
    <View style={styles.group} testID="layer-properties">
      <AppText variant="caption" tone="accent">
        CALQUE · {layer.name.toUpperCase()}
      </AppText>
      {layer.locked ? (
        <AppText variant="caption" tone="secondary">
          Calque verrouillé : déverrouillez-le pour le modifier.
        </AppText>
      ) : null}
      <View style={styles.fieldRow}>
        <NumberField label="X" suffix="px" value={layer.x} editable={editable} onCommit={(x) => commit({ x })} testID="field-x" />
        <NumberField label="Y" suffix="px" value={layer.y} editable={editable} onCommit={(y) => commit({ y })} testID="field-y" />
      </View>
      <View style={styles.fieldRow}>
        <NumberField label="Largeur" suffix="px" value={layer.width} editable={editable} onCommit={(width) => commit({ width })} testID="field-width" />
        <NumberField label="Hauteur" suffix="px" value={layer.height} editable={editable} onCommit={(height) => commit({ height })} testID="field-height" />
      </View>
      <View style={styles.fieldRow}>
        <NumberField label="Rotation" suffix="°" decimals={1} value={layer.rotation} editable={editable} onCommit={(rotation) => commit({ rotation })} testID="field-rotation" />
        <NumberField
          label="Opacité"
          suffix="%"
          value={layer.opacity * 100}
          editable={editable}
          onCommit={(percent) => (percent < 0 || percent > 100 ? 'Entre 0 et 100 %.' : commit({ opacity: percent / 100 }))}
          testID="field-opacity"
        />
      </View>
      <LayerStyle document={document} layer={layer} />
    </View>
  );
}

const ALIGN_OPTIONS: readonly SegmentOption<TextAlignment>[] = [
  { value: 'left', label: 'Gauche', icon: 'format-align-left' },
  { value: 'center', label: 'Centre', icon: 'format-align-center' },
  { value: 'right', label: 'Droite', icon: 'format-align-right' },
];
const WEIGHT_OPTIONS: readonly SegmentOption<'regular' | 'bold'>[] = [
  { value: 'regular', label: 'Normal' },
  { value: 'bold', label: 'Gras', icon: 'format-bold' },
];

/** Contenu du texte : appliqué en fin de saisie (perte du focus), une seule fois. */
function TextContentField({ layer, onCommit }: { layer: TextLayer; onCommit: (text: string) => string | null }) {
  const [text, setText] = useState(layer.text);
  const [shown, setShown] = useState(layer.text);
  const [error, setError] = useState<string | undefined>(undefined);
  if (layer.text !== shown) {
    setShown(layer.text);
    setText(layer.text);
  }
  const commit = () => {
    if (text === layer.text) return;
    const message = onCommit(text);
    setError(message ?? undefined);
    if (message) setText(layer.text);
  };
  return (
    <View style={styles.fieldRow}>
      <TextField
        label="Texte"
        value={text}
        onChangeText={setText}
        onBlur={commit}
        multiline
        maxLength={TEXT_MAX_LENGTH}
        editable={!layer.locked}
        error={error}
        testID="field-text"
      />
    </View>
  );
}

/** Style propre au type : couleur (formes, textes), typographie (textes), source (images). */
function LayerStyle({ document, layer }: { document: GraphicDocument; layer: Layer }) {
  const actions = useLayerActions(document.id);
  const editable = !layer.locked;
  const setStyle = (patch: Parameters<typeof actions.setStyle>[1]) => actions.setStyle(layer.id, patch);

  if (layer.type === 'image') {
    const a = layer.asset;
    const resized = a.width !== a.originalWidth || a.height !== a.originalHeight;
    return (
      <View style={styles.group} testID="image-properties">
        <Property label="Image d'origine" value={formatDimensions(a.originalWidth, a.originalHeight)} />
        {resized ? <Property label="Copie de travail" value={formatDimensions(a.width, a.height)} /> : null}
        <AppText variant="caption" tone="secondary">
          L’original est conservé intact ; la copie de travail est affichée et exportée.
        </AppText>
      </View>
    );
  }

  if (layer.type === 'shape') {
    return <ColorField label="Couleur" value={layer.fill} editable={editable} onCommit={(color) => setStyle({ color })} testID="field-color" />;
  }

  return (
    <View style={styles.group} testID="text-properties">
      <TextContentField layer={layer} onCommit={(text) => setStyle({ text })} />
      <View style={styles.fieldRow}>
        <NumberField
          label="Taille du texte"
          suffix="px"
          value={layer.fontSize}
          editable={editable}
          onCommit={(fontSize) => setStyle({ fontSize })}
          testID="field-font-size"
        />
      </View>
      <SegmentedControl label="Alignement" options={ALIGN_OPTIONS} value={layer.align} onChange={(align) => editable && setStyle({ align })} />
      <SegmentedControl
        label="Graisse"
        options={WEIGHT_OPTIONS}
        value={layer.bold ? 'bold' : 'regular'}
        onChange={(weight) => editable && setStyle({ bold: weight === 'bold' })}
      />
      <ColorField label="Couleur du texte" value={layer.color} editable={editable} onCommit={(color) => setStyle({ color })} testID="field-color" />
    </View>
  );
}

/** Panneau Propriétés : calque sélectionné (modifiable) puis document. */
export function PropertiesPanelContent({ document }: PanelContentProps) {
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  return (
    <View style={styles.stack} testID="properties-panel-content">
      {layer ? (
        <LayerProperties document={document} layer={layer} />
      ) : (
        <AppText variant="caption" tone="secondary">
          Sélectionnez un calque pour modifier sa position, sa taille, sa rotation, son opacité et son style.
        </AppText>
      )}
      <View style={styles.group}>
        <AppText variant="caption" tone="accent">
          DOCUMENT
        </AppText>
        <Property label="Dimensions" value={formatDimensions(document.width, document.height)} />
        <Property label="Orientation" value={ORIENTATION_LABELS[orientationOf(document.width, document.height)]} />
        <Property label="Fond" value={BACKGROUND_LABELS[document.background]} />
        <Property label="Calques" value={String(document.layers.length)} />
        <Property label="Mémoire par calque" value={formatBytes(estimateLayerBytes(document.width, document.height))} />
        <Property label="Créé le" value={formatDateTime(document.createdAt)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.md },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs, marginHorizontal: -spacing.xs },
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  list: { gap: spacing.xxs },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  layerRowSelected: { borderColor: colors.accent, backgroundColor: colors.panelPressed },
  layerSelect: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, minHeight: 48 },
  layerThumb: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.checkerDark,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  layerThumbFill: { flex: 1, borderRadius: 2 },
  thumbEllipse: { borderRadius: 999 },
  thumbLine: { height: 4, marginTop: 10, borderRadius: 2 },
  thumbIcon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dimmed: { opacity: 0.4 },
  backgroundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  swatch: { width: 32, height: 32, borderRadius: radius.sm },
  group: { gap: spacing.sm },
  fieldRow: { flexDirection: 'row', gap: spacing.sm },
  property: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  propertyValue: { flexShrink: 1, textAlign: 'right' },
});
