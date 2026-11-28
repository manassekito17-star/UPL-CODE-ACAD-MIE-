import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { GraphicDocument } from '@/engine/documents';
import { findLayer } from '@/engine/layers';
import { formatDimensions } from '@/features/projects/labels';
import { commandClose } from '@/features/files/fileCommands';
import { useSaveStatus } from '@/features/persistence';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore, type StatusInfo } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { goHome } from '../EditorTopBar';
import { findTool } from '../toolFamilies';
import { measureAnchor, type Anchor, type ViewRef } from '@/components/workspace/measure';
import { useEffectiveToolKey } from './ToolRail';
import { MenuList, Popover, WIconButton, WNumberField, WText } from '@/components/workspace/ui';
import { useWorkspace } from './WorkspaceContext';

/** « 5,93M » : mégaoctets (2²⁰ octets) à deux décimales, comme les barres d'état des logiciels de retouche. */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1048576).toFixed(bytes >= 100 * 1048576 ? 1 : 2).replace('.', ',')}M`;
}

/**
 * Taille du document : aplatie (RVB 8 bits, 3 octets par pixel) / avec ses
 * calques (chaque calque compté à 4 octets par pixel de sa surface, bornée au
 * document). C'est une estimation de la mémoire de travail, pas la taille
 * d'un fichier.
 */
export function documentSizes(doc: GraphicDocument): { flattened: number; layered: number } {
  const flattened = doc.width * doc.height * 3;
  const layers = doc.layers.reduce((sum, l) => sum + Math.min(doc.width * doc.height, Math.round(l.width * l.height)) * 4, 0);
  return { flattened, layered: flattened + layers };
}

/** Afficher un autre document ouvert (sans empiler d'écrans). */
export function showDocument(id: string): void {
  router.replace({ pathname: '/editor/[projectId]', params: { projectId: id } });
}

/** Ferme l'onglet `id` ; si c'était le document affiché, montre l'onglet voisin ou l'accueil. */
export function closeDocumentTab(id: string, currentId: string): void {
  // Les onglets de documents supprimés entre-temps sont oubliés au passage.
  const { documents } = useDocumentStore.getState();
  const ws = useWorkspaceStore.getState();
  for (const stale of ws.openDocuments.filter((d) => !documents[d])) ws.closeDocument(stale);
  const next = useWorkspaceStore.getState().closeDocument(id);
  if (id !== currentId) return;
  if (next) showDocument(next);
  else goHome();
}

/** Fermer un onglet : demande d'abord quoi faire des modifications non enregistrées. */
export function requestCloseTab(id: string, currentId: string): void {
  commandClose([id], () => closeDocumentTab(id, currentId));
}

function InactiveTab({ id, currentId }: { id: string; currentId: string }) {
  const doc = useDocumentStore((s) => s.documents[id]);
  const save = useSaveStatus(id);
  if (!doc) return null;
  return (
    <View style={[styles.tab, styles.tabInactive]}>
      <WIconButton icon="close" label={`Fermer ${doc.name}`} size={13} style={styles.close} onPress={() => requestCloseTab(id, currentId)} />
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: false }}
        accessibilityLabel={`Document ${doc.name}${save.unsaved ? ', modifications non enregistrées' : ''}`}
        onPress={() => showDocument(id)}
        style={styles.tabPress}
        testID={`doc-tab-${id}`}
      >
        <WText dim numberOfLines={1}>
          {doc.name}
          {save.unsaved ? ' *' : ''}
        </WText>
      </Pressable>
    </View>
  );
}

/** Onglets des documents ouverts ; l'onglet actif donne zoom, calque actif et mode colorimétrique. */
export function DocTabs() {
  const { document, zoom } = useWorkspace();
  const open = useWorkspaceStore((s) => s.openDocuments);
  const selectedId = useEditorUiStore((s) => s.selectedLayerId);
  const save = useSaveStatus(document.id);
  const layer = selectedId ? findLayer(document, selectedId) : undefined;
  const title = `${document.name} @ ${zoom ?? '…'}% (${layer?.name ?? 'Arrière-plan'}, RVB/8)`;
  const ids = open.includes(document.id) ? open : [...open, document.id];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent} testID="doc-tabs">
      {ids.map((id) =>
        id === document.id ? (
          <View
            key={id}
            style={styles.tab}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: true }}
            accessibilityLabel={`Document ${title}${save.unsaved ? ', modifications non enregistrées' : ', enregistré'}`}
          >
            <WIconButton icon="close" label={`Fermer ${document.name}`} size={13} style={styles.close} onPress={() => requestCloseTab(id, document.id)} testID="doc-tab-close" />
            <WText numberOfLines={1} style={styles.tabText}>
              {title}
              {save.unsaved ? ' *' : ''}
            </WText>
          </View>
        ) : (
          <InactiveTab key={id} id={id} currentId={document.id} />
        ),
      )}
    </ScrollView>
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
  const save = useSaveStatus(document.id);
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
      <WText dim={!save.failed} style={save.failed ? styles.failed : undefined} numberOfLines={1}>
        {save.text}
      </WText>
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
  tabs: { height: wsMetrics.docTabs, flexGrow: 0, backgroundColor: ws.header, borderBottomWidth: 1, borderBottomColor: ws.border },
  tabsContent: { flexDirection: 'row' },
  tabInactive: { backgroundColor: ws.header, paddingRight: 0 },
  tabPress: { height: '100%', justifyContent: 'center', paddingRight: 12 },
  failed: { color: '#FF7A7A' },
  tab: { maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 2, paddingRight: 12, backgroundColor: ws.raised, borderRightWidth: 1, borderRightColor: ws.border },
  tabText: { flexShrink: 1, fontWeight: '600' },
  close: { minWidth: 24, width: 24, height: 24 },
  status: { height: wsMetrics.statusBar, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, backgroundColor: ws.chrome, borderTopWidth: 1, borderTopColor: ws.border },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, height: '100%', paddingHorizontal: 6, maxWidth: 320 },
});
