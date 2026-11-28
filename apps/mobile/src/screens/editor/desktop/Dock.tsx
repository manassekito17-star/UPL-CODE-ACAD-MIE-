import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PANEL_GROUPS, STRIP_PANELS, useWorkspaceStore, type PanelGroupId, type PanelId } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { measureAnchor, type Anchor, type ViewRef } from '@/components/workspace/measure';
import { PANEL_META } from './panelMeta';
import { ColorPanel, SwatchesPanel } from './panels/ColorPanels';
import { LayersPanel } from './panels/LayersPanel';
import { NavigatorPanel } from './panels/NavigatorPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { AdjustmentsPanel, ChannelsPanel, CharacterPanel, ParagraphPanel, PathsPanel } from './panels/PlannedPanels';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { MenuList, Popover, WIconButton, WText, type MenuEntry } from '@/components/workspace/ui';

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
    case 'navigator':
      return <NavigatorPanel />;
    case 'character':
      return <CharacterPanel />;
    case 'paragraph':
      return <ParagraphPanel />;
  }
}

/** Les panneaux qui gèrent eux-mêmes leur défilement (listes, formulaires longs). */
const SELF_SCROLLING: readonly PanelId[] = ['properties', 'layers'];

const GROUP_STYLE: Record<PanelGroupId, { flex?: number }> = {
  color: {},
  properties: { flex: 1 },
  layers: { flex: 1.4 },
};

/** Bouton « ≡ » d'un groupe : menu du panneau (réduire, fermer, fermer le groupe). */
function PanelMenu({ group, current, collapsed }: { group: PanelGroupId; current: PanelId; collapsed: boolean }) {
  const ref = useRef<ViewRef | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleGroupCollapsed);
  const togglePanelVisible = useWorkspaceStore((s) => s.togglePanelVisible);
  const closeGroup = useWorkspaceStore((s) => s.closeGroup);
  const label = PANEL_META[current].label;
  const entries: MenuEntry[] = [
    { type: 'item', label: collapsed ? 'Développer le groupe' : 'Réduire le groupe', onPress: () => toggleCollapsed(group) },
    { type: 'separator' },
    { type: 'item', label: `Fermer ${label}`, onPress: () => togglePanelVisible(current) },
    { type: 'item', label: 'Fermer le groupe d’onglets', onPress: () => closeGroup(group) },
  ];
  return (
    <>
      <WIconButton
        innerRef={(node) => {
          ref.current = node;
        }}
        icon="menu"
        label={`Menu du panneau ${label}`}
        size={14}
        style={styles.headerButton}
        onPress={() => measureAnchor(ref.current, setAnchor)}
        testID={`panel-menu-${group}`}
      />
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={230} testID="panel-menu">
        <MenuList entries={entries} onClose={() => setAnchor(null)} />
      </Popover>
    </>
  );
}

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
                accessibilityLabel={PANEL_META[panel].label}
                accessibilityHint="Toucher l’onglet actif réduit ou développe le groupe"
                accessibilityState={{ selected }}
                onPress={() => (panel === current ? toggleCollapsed(group) : showPanel(panel))}
                style={[styles.tab, selected && styles.tabActive]}
                testID={`dock-tab-${panel}`}
              >
                <WText dim={!selected} style={selected ? styles.tabTextActive : undefined}>
                  {PANEL_META[panel].label}
                </WText>
              </Pressable>
            );
          })}
        </ScrollView>
        <PanelMenu group={group} current={current} collapsed={collapsed} />
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

/** Colonne d'icônes : panneaux réduits qui s'ouvrent en fenêtre flottante à gauche. */
function PanelStrip() {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels);
  const open = useWorkspaceStore((s) => s.openStripPanel);
  const setOpen = useWorkspaceStore((s) => s.setOpenStripPanel);
  const refs = useRef<Partial<Record<PanelId, ViewRef | null>>>({});
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const panels = STRIP_PANELS.filter((p) => !hidden.includes(p));
  if (panels.length === 0) return null;

  const toggle = (panel: PanelId) => {
    if (open === panel) {
      setOpen(null);
      return;
    }
    measureAnchor(refs.current[panel] ?? null, (a) => {
      setAnchor(a);
      setOpen(panel);
    });
  };
  const shown = open && panels.includes(open) ? open : null;

  return (
    <View style={styles.strip} testID="panel-strip">
      {panels.map((panel) => (
        <WIconButton
          key={panel}
          innerRef={(node) => {
            refs.current[panel] = node;
          }}
          icon={PANEL_META[panel].icon}
          label={PANEL_META[panel].label}
          active={shown === panel}
          size={17}
          style={styles.stripButton}
          onPress={() => toggle(panel)}
          testID={`strip-${panel}`}
        />
      ))}
      <Popover anchor={shown ? (anchor ?? { x: 0, y: 0, width: 0, height: 0 }) : null} placement="left" onClose={() => setOpen(null)} width={260} testID="strip-popover">
        {shown ? (
          <View>
            <View style={styles.floatingHeader}>
              <WText style={styles.tabTextActive}>{PANEL_META[shown].label}</WText>
              <WIconButton icon="chevron-double-right" label={`Réduire ${PANEL_META[shown].label}`} size={14} style={styles.headerButton} onPress={() => setOpen(null)} />
            </View>
            <PanelBody panel={shown} />
          </View>
        ) : null}
      </Popover>
    </View>
  );
}

/** Dock réduit : une icône par panneau visible ; toucher développe le dock sur ce panneau. */
function CollapsedDock() {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels);
  const showPanel = useWorkspaceStore((s) => s.showPanel);
  return (
    <View style={styles.collapsedDock} testID="dock-collapsed">
      {(Object.keys(PANEL_GROUPS) as PanelGroupId[]).map((group) => {
        const panels = PANEL_GROUPS[group].filter((p) => !hidden.includes(p));
        if (panels.length === 0) return null;
        return (
          <View key={group} style={styles.collapsedGroup}>
            {panels.map((panel) => (
              <WIconButton key={panel} icon={PANEL_META[panel].icon} label={PANEL_META[panel].label} size={17} style={styles.stripButton} onPress={() => showPanel(panel)} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Zone des panneaux à droite : colonne d'icônes (Historique, Navigateur,
 * Caractère, Paragraphe) puis dock à trois groupes d'onglets, réductible en
 * icônes avec « << / >> ».
 */
export function Dock({ width }: { width: number }) {
  const collapsed = useWorkspaceStore((s) => s.dockCollapsed);
  const toggleDock = useWorkspaceStore((s) => s.toggleDockCollapsed);
  return (
    <View style={styles.area} testID="dock-area">
      <PanelStrip />
      <View style={[styles.dock, collapsed ? styles.dockNarrow : { width }]} testID="dock">
        <View style={styles.dockBar}>
          <WIconButton
            icon={collapsed ? 'chevron-double-left' : 'chevron-double-right'}
            label={collapsed ? 'Développer les panneaux' : 'Réduire les panneaux en icônes'}
            size={12}
            style={styles.dockToggle}
            onPress={toggleDock}
            testID="dock-toggle"
          />
        </View>
        {collapsed ? (
          <CollapsedDock />
        ) : (
          (Object.keys(PANEL_GROUPS) as PanelGroupId[]).map((group) => <PanelGroup key={group} group={group} />)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  area: { flexDirection: 'row' },
  strip: { width: 36, alignItems: 'center', paddingTop: 16, gap: 2, backgroundColor: ws.chrome, borderLeftWidth: 1, borderLeftColor: ws.border },
  stripButton: { width: 30, height: 30 },
  dock: { backgroundColor: ws.border, borderLeftWidth: 1, borderLeftColor: ws.border, gap: 2 },
  dockNarrow: { width: 38 },
  dockBar: { height: 14, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: ws.header },
  dockToggle: { height: 14, minWidth: 22, paddingHorizontal: 0, borderRadius: 0 },
  collapsedDock: { backgroundColor: ws.chrome, flex: 1, alignItems: 'center', paddingTop: 2, gap: 6 },
  collapsedGroup: { alignItems: 'center', gap: 2, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: ws.divider },
  group: { backgroundColor: ws.panel, overflow: 'hidden' },
  tabs: { height: wsMetrics.panelTabs, flexDirection: 'row', alignItems: 'stretch', backgroundColor: ws.header },
  tabStrip: { alignItems: 'stretch' },
  tab: { justifyContent: 'center', paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: ws.border },
  tabActive: { backgroundColor: ws.panel },
  tabTextActive: { fontWeight: '600' },
  headerButton: { height: wsMetrics.panelTabs, minWidth: 26 },
  floatingHeader: { height: wsMetrics.panelTabs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10, backgroundColor: ws.header },
  body: { flex: 1 },
});
