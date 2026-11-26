import { Pressable, StyleSheet, View } from 'react-native';

import { estimateLayerBytes, formatBytes } from '@/engine/documents';
import { findLayer } from '@/engine/layers';
import { formatDimensions } from '@/features/projects/labels';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { ws, wsMetrics } from '@/theme';

import { goHome } from '../EditorTopBar';
import { WIconButton, WText } from './ui';
import { useWorkspace } from './WorkspaceContext';

/**
 * Onglet du document ouvert : nom, zoom, calque actif, mode colorimétrique.
 * Plusieurs documents ouverts en onglets arrivent avec M3.
 */
export function DocTabs() {
  const { document, zoom } = useWorkspace();
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  const title = `${document.name} @ ${zoom ?? '…'} % (${layer?.name ?? 'Arrière-plan'}, RVB/8)`;
  return (
    <View style={styles.tabs} testID="doc-tabs">
      <View style={styles.tab} accessible accessibilityRole="tab" accessibilityState={{ selected: true }} accessibilityLabel={`Document ${title}, non enregistré`}>
        <WText numberOfLines={1} style={styles.tabText}>
          {title} *
        </WText>
        <WIconButton icon="close" label={`Fermer ${document.name}`} size={13} style={styles.close} onPress={goHome} testID="doc-tab-close" />
      </View>
    </View>
  );
}

/** Barre d'état : zoom, mémoire, dimensions, état d'enregistrement. */
export function StatusBar() {
  const { document, zoom, controller } = useWorkspace();
  const bytes = estimateLayerBytes(document.width, document.height);
  return (
    <View style={styles.status} testID="status-bar">
      <Pressable accessibilityRole="button" accessibilityLabel={`Zoom ${zoom ?? ''} %`} accessibilityHint="Afficher à 100 %" onPress={() => controller.current?.setZoomPercent(100)} style={styles.zoom} testID="status-zoom">
        <WText>{zoom === null ? '…' : `${zoom} %`}</WText>
      </Pressable>
      <WText dim>{formatDimensions(document.width, document.height)}</WText>
      <WText dim>
        Doc : {formatBytes(bytes)} par calque · {document.layers.length} calque{document.layers.length > 1 ? 's' : ''}
      </WText>
      <View style={styles.flex} />
      <WText dim>Non enregistré · enregistrement prévu M3</WText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { height: wsMetrics.docTabs, flexDirection: 'row', backgroundColor: ws.header, borderBottomWidth: 1, borderBottomColor: ws.border },
  tab: { maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 12, paddingRight: 2, backgroundColor: ws.chrome, borderRightWidth: 1, borderRightColor: ws.border, borderTopWidth: 2, borderTopColor: ws.accent },
  tabText: { flexShrink: 1 },
  close: { minWidth: 24, width: 24, height: 24 },
  status: { height: wsMetrics.statusBar, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 8, backgroundColor: ws.chrome, borderTopWidth: 1, borderTopColor: ws.border },
  zoom: { minWidth: 52, height: '100%', justifyContent: 'center', paddingHorizontal: 4, backgroundColor: ws.input, borderRadius: 2 },
});
