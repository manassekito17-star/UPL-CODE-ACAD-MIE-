import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { GraphicDocument } from '@/engine/documents';
import { findLayer } from '@/engine/layers';
import { formatDimensions } from '@/features/projects/labels';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore, type StatusInfo } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { goHome } from '../EditorTopBar';
import { findTool } from '../toolFamilies';
import { measureAnchor, type Anchor, type ViewRef } from './measure';
import { useEffectiveToolKey } from './ToolRail';
import { MenuList, Popover, WIconButton, WNumberField, WText } from './ui';
import { useWorkspace } from './WorkspaceContext';

/** « 5,93M » : mégaoctets (2²⁰ octets) à deux décimales, comme les barres d'état des logiciels de retouche. */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1048576).toFixed(bytes >= 100 * 1048576 ? 1 : 2).replace('.', ',')}M`;
}

/**
 * Taille du document : aplatie (RVB 8 bits, 3 octets par pixel) / avec ses
 * calques (chaque calque compté à 4 octets par pixel de sa surface, bornée au
 * document). C'est une estimation de la mémoire de travail, pas la taille
 * d'un fichier (l'enregistrement arrive avec M3).
 */
export function documentSizes(doc: GraphicDocument): { flattened: number; layered: number } {
  const flattened = doc.width * doc.height * 3;
  const layers = doc.layers.reduce((sum, l) => sum + Math.min(doc.width * doc.height, Math.round(l.width * l.height)) * 4, 0);
  return { flattened, layered: flattened + layers };
}

/**
 * Onglet du document ouvert : nom, zoom, calque actif, mode colorimétrique.
 * Plusieurs documents ouverts en onglets arrivent avec M3.
 */
export function DocTabs() {
  const { document, zoom } = useWorkspace();
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  const title = `${document.name} @ ${zoom ?? '…'}% (${layer?.name ?? 'Arrière-plan'}, RVB/8)`;
  return (
    <View style={styles.tabs} testID="doc-tabs">
      <View style={styles.tab} accessible accessibilityRole="tab" accessibilityState={{ selected: true }} accessibilityLabel={`Document ${title}, non enregistré`}>
        <WIconButton icon="close" label={`Fermer ${document.name}`} size={13} style={styles.close} onPress={goHome} testID="doc-tab-close" />
        <WText numberOfLines={1} style={styles.tabText}>
          {title} *
        </WText>
      </View>
    </View>
  );
}

const STATUS_LABELS: Record<StatusInfo, string> = {
  docSize: 'Taille du document',
  dimensions: 'Dimensions du document',
  layers: 'Nombre de calques',
  tool: 'Outil actif',
};

/** Barre d'état : zoom modifiable, information choisie dans le menu « > », état d'enregistrement. */
export function StatusBar() {
  const { document, zoom, controller } = useWorkspace();
  const info = useWorkspaceStore((s) => s.statusInfo);
  const setInfo = useWorkspaceStore((s) => s.setStatusInfo);
  const toolKey = useEffectiveToolKey();
  const ref = useRef<ViewRef | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const sizes = documentSizes(document);
  const text =
    info === 'docSize'
      ? `Doc : ${formatMegabytes(sizes.flattened)}/${formatMegabytes(sizes.layered)}`
      : info === 'dimensions'
        ? formatDimensions(document.width, document.height)
        : info === 'layers'
          ? `${document.layers.length} calque${document.layers.length > 1 ? 's' : ''}`
          : (findTool(toolKey)?.label ?? '');

  return (
    <View style={styles.status} testID="status-bar">
      <WNumberField
        label="Zoom"
        hideLabel
        value={zoom ?? 100}
        suffix="%"
        width={62}
        decimals={zoom !== null && zoom < 10 ? 1 : 0}
        editable={zoom !== null}
        onCommit={(percent) => {
          if (percent <= 0) return 'Zoom invalide.';
          controller.current?.setZoomPercent(percent);
          return null;
        }}
        hint="Saisir un zoom en pour cent"
        testID="status-zoom"
      />
      <Pressable
        ref={(node) => {
          ref.current = node;
        }}
        accessibilityRole="button"
        accessibilityLabel={`${STATUS_LABELS[info]} : ${text}`}
        accessibilityHint="Choisir l’information affichée"
        onPress={() => measureAnchor(ref.current, setAnchor)}
        style={styles.info}
        testID="status-info"
      >
        <WText dim numberOfLines={1}>
          {text}
        </WText>
        <WText dim>{'›'}</WText>
      </Pressable>
      <View style={styles.flex} />
      <WText dim>Non enregistré · enregistrement prévu M3</WText>
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={240} testID="status-menu">
        <MenuList
          entries={(Object.keys(STATUS_LABELS) as StatusInfo[]).map((key) => ({ type: 'item', label: STATUS_LABELS[key], checked: key === info, onPress: () => setInfo(key) }))}
          onClose={() => setAnchor(null)}
        />
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { height: wsMetrics.docTabs, flexDirection: 'row', backgroundColor: ws.header, borderBottomWidth: 1, borderBottomColor: ws.border },
  tab: { maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 2, paddingRight: 12, backgroundColor: ws.raised, borderRightWidth: 1, borderRightColor: ws.border },
  tabText: { flexShrink: 1, fontWeight: '600' },
  close: { minWidth: 24, width: 24, height: 24 },
  status: { height: wsMetrics.statusBar, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, backgroundColor: ws.chrome, borderTopWidth: 1, borderTopColor: ws.border },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, height: '100%', paddingHorizontal: 6, maxWidth: 320 },
});
