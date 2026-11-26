import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PANEL_GROUPS, useWorkspaceStore, type PanelGroupId, type PanelId } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { ColorPanel, SwatchesPanel } from './panels/ColorPanels';
import { LayersPanel } from './panels/LayersPanel';
import { AdjustmentsPanel, ChannelsPanel, HistoryPanel, PathsPanel } from './panels/PlannedPanels';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { WIconButton, WText } from './ui';
import { PANEL_LABELS } from './useMenus';

function PanelBody({ panel }: { panel: PanelId }) {
  switch (panel) {
    case 'color':
      return <ColorPanel />;
    case 'swatches':
      return <SwatchesPanel />;
    case 'properties':
      return <PropertiesPanel />;
    case 'adjustments':
      return <AdjustmentsPanel />;
    case 'layers':
      return <LayersPanel />;
    case 'channels':
      return <ChannelsPanel />;
    case 'paths':
      return <PathsPanel />;
    case 'history':
      return <HistoryPanel />;
  }
}

/** Les panneaux qui gèrent eux-mêmes leur défilement (listes, formulaires longs). */
const SELF_SCROLLING: readonly PanelId[] = ['properties', 'layers'];

const GROUP_STYLE: Record<PanelGroupId, { flex?: number }> = {
  color: {},
  properties: { flex: 1 },
  layers: { flex: 1.4 },
};

function PanelGroup({ group }: { group: PanelGroupId }) {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels);
  const active = useWorkspaceStore((s) => s.activeTab[group]);
  const collapsed = useWorkspaceStore((s) => s.collapsedGroups.includes(group));
  const showPanel = useWorkspaceStore((s) => s.showPanel);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleGroupCollapsed);
  const panels = PANEL_GROUPS[group].filter((p) => !hidden.includes(p));
  if (panels.length === 0) return null;
  const current = panels.includes(active) ? active : (panels[0] as PanelId);

  return (
    <View style={[styles.group, !collapsed && GROUP_STYLE[group]]} testID={`dock-group-${group}`}>
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flex} contentContainerStyle={styles.tabStrip} accessibilityRole="tablist">
        {panels.map((panel) => {
          const selected = panel === current && !collapsed;
          return (
            <Pressable
              key={panel}
              accessibilityRole="tab"
              accessibilityLabel={PANEL_LABELS[panel]}
              accessibilityState={{ selected }}
              onPress={() => showPanel(panel)}
              style={[styles.tab, selected && styles.tabActive]}
              testID={`dock-tab-${panel}`}
            >
              <WText dim={!selected} style={selected ? styles.tabTextActive : undefined}>
                {PANEL_LABELS[panel]}
              </WText>
            </Pressable>
          );
        })}
        </ScrollView>
        <WIconButton
          icon={collapsed ? 'chevron-down' : 'chevron-up'}
          label={collapsed ? `Déplier le groupe ${PANEL_LABELS[current]}` : `Replier le groupe ${PANEL_LABELS[current]}`}
          size={14}
          style={styles.collapse}
          onPress={() => toggleCollapsed(group)}
        />
      </View>
      {collapsed ? null : SELF_SCROLLING.includes(current) ? (
        <View style={styles.body}>
          <PanelBody panel={current} />
        </View>
      ) : (
        <ScrollView style={group === 'color' ? undefined : styles.body}>
          <PanelBody panel={current} />
        </ScrollView>
      )}
    </View>
  );
}

/** Dock de droite : trois groupes d'onglets, repliables, masquables depuis le menu Fenêtre. */
export function Dock({ width }: { width: number }) {
  return (
    <View style={[styles.dock, { width }]} testID="dock">
      {(Object.keys(PANEL_GROUPS) as PanelGroupId[]).map((group) => (
        <PanelGroup key={group} group={group} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dock: { backgroundColor: ws.border, borderLeftWidth: 1, borderLeftColor: ws.border, gap: 2 },
  group: { backgroundColor: ws.panel, overflow: 'hidden' },
  tabs: { height: wsMetrics.panelTabs, flexDirection: 'row', alignItems: 'stretch', backgroundColor: ws.header },
  tabStrip: { alignItems: 'stretch' },
  tab: { justifyContent: 'center', paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: ws.border },
  tabActive: { backgroundColor: ws.panel },
  tabTextActive: { fontWeight: '600' },
  collapse: { height: wsMetrics.panelTabs, minWidth: 26 },
  body: { flex: 1 },
});
