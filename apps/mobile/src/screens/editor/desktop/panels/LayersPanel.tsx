import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackgroundSwatch, Icon, type IconName } from '@/components/ui';
import { findLayer, type Layer } from '@/engine/layers';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { BACKGROUND_LABELS } from '@/features/projects/labels';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { layerTypeLabel } from '../../panels';
import { useInsertMenu } from '../../useInsertMenu';
import { Divider, WIconButton, WNumberField, WSelect, WText } from '../ui';
import { useWorkspace } from '../WorkspaceContext';

/** Filtres par type, dans l'ordre habituel : pixels, réglages, textes, formes, objets dynamiques. */
const KIND_FILTERS: readonly { label: string; icon: IconName; kind: Layer['type'] | null; module?: string }[] = [
  { label: 'calques d’image', icon: 'image-outline', kind: 'image' },
  { label: 'calques de réglage', icon: 'circle-half-full', kind: null, module: 'M9' },
  { label: 'calques de texte', icon: 'format-text', kind: 'text' },
  { label: 'calques de forme', icon: 'vector-square', kind: 'shape' },
  { label: 'objets dynamiques', icon: 'file-image-outline', kind: null, module: 'M7' },
];

/** Modes de fusion : seul « Normal » est rendu aujourd'hui ; les autres arrivent avec M7. */
const BLEND_MODES = ['Produit', 'Superposition', 'Lumière tamisée', 'Écran', 'Différence', 'Teinte', 'Saturation', 'Couleur', 'Luminosité'];

function Thumb({ layer }: { layer: Layer }) {
  return (
    <View style={[styles.thumb, !layer.visible && styles.dimmed]}>
      {layer.type === 'image' ? (
        <Image source={{ uri: layer.asset.uri }} style={styles.thumbImage} resizeMode="contain" accessibilityIgnoresInvertColors />
      ) : layer.type === 'shape' ? (
        <View
          style={[
            layer.shape === 'line' ? styles.thumbLine : styles.thumbFill,
            { backgroundColor: layer.fill, opacity: layer.opacity },
            layer.shape === 'ellipse' && styles.thumbEllipse,
          ]}
        />
      ) : (
        <WText style={styles.thumbText}>T</WText>
      )}
    </View>
  );
}

function LayerRow({ layer, selected }: { layer: Layer; selected: boolean }) {
  const { document } = useWorkspace();
  const actions = useLayerActions(document.id);
  const requestRename = useWorkspaceStore((s) => s.requestRenameLayer);
  return (
    <View style={[styles.row, selected && styles.rowSelected]} testID={`layer-row-${layer.id}`}>
      <WIconButton
        icon={layer.visible ? 'eye-outline' : 'eye-off-outline'}
        label={layer.visible ? `Masquer ${layer.name}` : `Afficher ${layer.name}`}
        size={16}
        style={styles.eye}
        onPress={() => actions.setVisible(layer.id, !layer.visible)}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Calque ${layer.name}`}
        accessibilityHint={`${layerTypeLabel(layer)}${layer.visible ? '' : ', masqué'}${layer.locked ? ', verrouillé' : ''}. Appui long : renommer.`}
        accessibilityState={{ selected }}
        onPress={() => actions.select(layer.id)}
        onLongPress={() => requestRename(layer.id)}
        delayLongPress={400}
        style={styles.rowMain}
      >
        <Thumb layer={layer} />
        <WText numberOfLines={1} style={styles.name} disabled={!layer.visible}>
          {layer.name}
        </WText>
        {layer.opacity < 1 ? <WText dim style={styles.small}>{Math.round(layer.opacity * 100)} %</WText> : null}
      </Pressable>
      {layer.locked ? (
        <WIconButton icon="lock" label={`Déverrouiller ${layer.name}`} size={14} style={styles.lock} onPress={() => actions.setLocked(layer.id, false)} />
      ) : null}
    </View>
  );
}

/** Panneau Calques : filtre, mode de fusion, opacité, verrous, pile, fond, actions. */
export function LayersPanel() {
  const { document } = useWorkspace();
  const actions = useLayerActions(document.id);
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const notice = useEditorUiStore((s) => s.notice);
  const requestDelete = useWorkspaceStore((s) => s.requestDeleteLayer);
  const insertMenu = useInsertMenu(document.id);
  const [kinds, setKinds] = useState<readonly Layer['type'][]>([]);
  const [filterOn, setFilterOn] = useState(true);
  const selected = selectedId ? findLayer(document, selectedId) : undefined;
  const filtering = filterOn && kinds.length > 0;
  const shown = [...document.layers].reverse().filter((l) => !filtering || kinds.includes(l.type));
  const toggleKind = (kind: Layer['type']) => {
    setFilterOn(true);
    setKinds((k) => (k.includes(kind) ? k.filter((x) => x !== kind) : [...k, kind]));
  };
  const editable = !!selected && !selected.locked;

  return (
    <View style={styles.panel} testID="layers-panel">
      <View style={styles.toolbar}>
        <WSelect
          label="Type de filtre"
          value="Type"
          icon="magnify"
          width={84}
          testID="layers-filter-kind"
          entries={[
            { type: 'item', label: 'Type', checked: true, disabled: true },
            ...['Nom', 'Effet', 'Mode', 'Attribut', 'Couleur', 'Sélectionnés'].map((label) => ({ type: 'item' as const, label, planned: true, right: 'M7' })),
          ]}
        />
        {KIND_FILTERS.map((f) => (
          <WIconButton
            key={f.label}
            icon={f.icon}
            label={f.kind ? `Filtrer : ${f.label}` : `Filtrer : ${f.label}`}
            hint={f.kind ? undefined : `Prévu au module ${f.module}`}
            size={15}
            style={styles.lockButton}
            active={!!f.kind && filtering && kinds.includes(f.kind)}
            disabled={!f.kind}
            onPress={() => f.kind && toggleKind(f.kind)}
            testID={f.kind ? `layers-filter-${f.kind}` : undefined}
          />
        ))}
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Filtrage des calques"
          accessibilityState={{ checked: filtering }}
          disabled={kinds.length === 0}
          onPress={() => setFilterOn((on) => !on)}
          style={[styles.switch, filtering && styles.switchOn]}
          testID="layers-filter-switch"
        >
          <View style={[styles.knob, filtering && styles.knobOn]} />
        </Pressable>
      </View>
      <Divider />
      <View style={styles.toolbar}>
        <WSelect
          label="Mode de fusion"
          value="Normal"
          width={112}
          entries={[{ type: 'item', label: 'Normal', checked: true, disabled: true }, { type: 'separator' }, ...BLEND_MODES.map((label) => ({ type: 'item' as const, label, planned: true, right: 'M7' }))]}
        />
        <View style={styles.spacer} />
        <WNumberField
          label="Opacité :"
          value={selected ? selected.opacity * 100 : 100}
          suffix="%"
          width={58}
          editable={editable}
          onCommit={(p) => (!selected ? null : p < 0 || p > 100 ? 'Entre 0 et 100 %.' : actions.update(selected.id, { opacity: p / 100 }))}
          testID="layers-opacity"
        />
      </View>
      <View style={styles.toolbar}>
        <WText dim>Verrou :</WText>
        <WIconButton icon="checkerboard" label="Verrouiller les pixels transparents" hint="Prévu au module M5" size={15} style={styles.lockButton} disabled />
        <WIconButton icon="brush" label="Verrouiller les pixels" hint="Prévu au module M5" size={15} style={styles.lockButton} disabled />
        <WIconButton icon="arrow-all" label="Verrouiller la position" hint="Prévu au module M7" size={15} style={styles.lockButton} disabled />
        <WIconButton
          icon="lock"
          label={selected ? (selected.locked ? `Tout déverrouiller : ${selected.name}` : `Tout verrouiller : ${selected.name}`) : 'Tout verrouiller'}
          size={15}
          style={styles.lockButton}
          active={selected?.locked}
          disabled={!selected}
          onPress={() => selected && actions.setLocked(selected.id, !selected.locked)}
          testID="layers-lock"
        />
        <View style={styles.spacer} />
        <WNumberField label="Fond :" value={100} suffix="%" width={52} editable={false} onCommit={() => null} hint="Prévu au module M7 (avec les styles de calque)" />
      </View>
      <Divider />

      {notice ? (
        <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="layer-notice">
          <Icon name="alert-circle-outline" size={14} color="#F5B342" />
          <WText dim style={styles.flexText}>
            {notice}
          </WText>
        </View>
      ) : null}

      <ScrollView style={styles.list} accessibilityLabel="Pile des calques, du haut vers le bas">
        {shown.map((layer) => (
          <LayerRow key={layer.id} layer={layer} selected={layer.id === selectedId} />
        ))}
        {document.layers.length > 0 && shown.length === 0 ? (
          <WText dim style={styles.empty}>
            Aucun calque de ce type.
          </WText>
        ) : null}
        {!filtering ? (
          <View style={styles.row} accessible accessibilityLabel={`Arrière-plan : ${BACKGROUND_LABELS[document.background]}, verrouillé`} testID="layer-background">
            <View style={styles.eye}>
              <Icon name="eye-outline" size={16} color={ws.textDim} />
            </View>
            <View style={styles.rowMain}>
              <BackgroundSwatch background={document.background} style={styles.thumb} />
              <WText numberOfLines={1} style={[styles.name, styles.italic]}>
                Arrière-plan
              </WText>
            </View>
            <View style={styles.lock}>
              <Icon name="lock" size={14} color={ws.textDim} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Divider />
      <View style={styles.footer} accessibilityRole="toolbar" accessibilityLabel="Actions sur les calques">
        <WIconButton icon="link-variant" label="Lier les calques" hint="Prévu au module M7" size={16} disabled />
        <WIconButton icon="function-variant" label="Style de calque" hint="Prévu au module M7" size={16} disabled />
        <WIconButton icon="rectangle-outline" label="Ajouter un masque" hint="Prévu au module M7" size={16} disabled />
        <WIconButton icon="circle-half-full" label="Nouveau calque de réglage" hint="Prévu au module M9" size={16} disabled />
        <WIconButton icon="folder-outline" label="Nouveau groupe" hint="Prévu au module M7" size={16} disabled />
        <WIconButton icon="plus-box-outline" label="Ajouter un calque" size={16} onPress={insertMenu.openAll} testID="layers-add" />
        <WIconButton
          icon="trash-can-outline"
          label="Supprimer le calque"
          hint={selected?.locked ? 'Déverrouillez le calque pour le supprimer' : undefined}
          size={16}
          disabled={!selected || selected.locked}
          onPress={() => selected && requestDelete(selected.id)}
          testID="layers-delete"
        />
      </View>
      {insertMenu.dialog}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexText: { flex: 1, fontSize: wsMetrics.smallFontSize },
  panel: { flex: 1 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3 },
  notice: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', padding: 6 },
  list: { flex: 1 },
  row: { height: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: ws.header },
  rowSelected: { backgroundColor: ws.selected },
  eye: { width: 30, minWidth: 30, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 0, borderRightWidth: 1, borderRightColor: ws.header },
  rowMain: { flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  thumb: { width: 30, height: 30, padding: 3, borderWidth: 1, borderColor: ws.border, backgroundColor: '#EDEDED', borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  thumbImage: { width: 24, height: 24 },
  thumbFill: { width: 22, height: 22 },
  thumbEllipse: { borderRadius: 11 },
  thumbLine: { width: 22, height: 3 },
  thumbText: { color: '#222', fontWeight: '700', fontSize: 15 },
  dimmed: { opacity: 0.4 },
  name: { flex: 1 },
  italic: { fontStyle: 'italic' },
  small: { fontSize: wsMetrics.smallFontSize },
  lock: { width: 28, minWidth: 28, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 10 },
  spacer: { flexGrow: 1 },
  switch: { width: 22, height: 12, borderRadius: 6, borderWidth: 1, borderColor: ws.textDim, justifyContent: 'center', paddingHorizontal: 1, marginLeft: 2 },
  switchOn: { borderColor: ws.accent, backgroundColor: ws.accent },
  knob: { width: 8, height: 8, borderRadius: 4, backgroundColor: ws.textDim },
  knobOn: { alignSelf: 'flex-end', backgroundColor: '#FFFFFF' },
  lockButton: { minWidth: 24, paddingHorizontal: 1 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 4, height: 32 },
});
