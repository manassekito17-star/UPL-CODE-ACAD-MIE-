import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useWorkspaceStore, type DockGroup, type PanelGroupId, type PanelId } from '@/stores/workspaceStore';
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

/** Panneaux de hauteur fixe : leur groupe prend la hauteur de son contenu. */
const AUTO_HEIGHT: readonly PanelId[] = ['color', 'swatches'];

/** Hauteur relative d'un groupe : contenu (Couleur, Nuancier), sinon partage de la hauteur, plus pour les Calques. */
function groupFlex(panels: readonly PanelId[]): { flex?: number } {
  if (panels.every((p) => AUTO_HEIGHT.includes(p))) return {};
  return { flex: panels.includes('layers') ? 1.4 : 1 };
}

/** Nom d'un groupe dans les menus : ses onglets (« Couleur, Nuancier »). */
export function groupLabel(group: DockGroup): string {
  return group.panels.map((p) => PANEL_META[p].label).join(', ');
}

/** Commandes de déplacement d'un panneau : vers un autre groupe, un nouveau groupe ou la colonne d'icônes. */
function moveEntries(panel: PanelId, from: PanelGroupId | null): MenuEntry[] {
  const { groups, movePanel } = useWorkspaceStore.getState();
  const label = PANEL_META[panel].label;
  const alone = from !== null && groups.find((g) => g.id === from)?.panels.length === 1;
  return [
    { type: 'header', label: `Déplacer ${label}` },
    ...groups
      .filter((g) => g.id !== from)
      .map((g): MenuEntry => ({ type: 'item', label: `Vers le groupe ${groupLabel(g)}`, onPress: () => movePanel(panel, { group: g.id }) })),
    { type: 'item', label: 'Vers un nouveau groupe', disabled: alone, onPress: () => movePanel(panel, { newGroup: true }) },
    ...(from === null ? [] : [{ type: 'item', label: 'Vers la colonne d’icônes', onPress: () => movePanel(panel, { strip: true }) } as MenuEntry]),
  ];
}

/** Bouton « ≡ » d'un groupe : menu du panneau (réduire, déplacer, réordonner, fermer). */
function PanelMenu({ group, current, collapsed }: { group: PanelGroupId; current: PanelId; collapsed: boolean }) {
  const ref = useRef<ViewRef | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleGroupCollapsed);
  const togglePanelVisible = useWorkspaceStore((s) => s.togglePanelVisible);
  const closeGroup = useWorkspaceStore((s) => s.closeGroup);
  const moveGroup = useWorkspaceStore((s) => s.moveGroup);
  const groups = useWorkspaceStore((s) => s.groups);
  const index = groups.findIndex((g) => g.id === group);
  const label = PANEL_META[current].label;
  const entries: MenuEntry[] = anchor
    ? [
        { type: 'item', label: collapsed ? 'Développer le groupe' : 'Réduire le groupe', onPress: () => toggleCollapsed(group) },
        { type: 'separator' },
        ...moveEntries(current, group),
        { type: 'separator' },
        { type: 'item', label: 'Monter le groupe', disabled: index <= 0, onPress: () => moveGroup(group, -1) },
        { type: 'item', label: 'Descendre le groupe', disabled: index < 0 || index >= groups.length - 1, onPress: () => moveGroup(group, 1) },
        { type: 'separator' },
        { type: 'item', label: `Fermer ${label}`, onPress: () => togglePanelVisible(current) },
        { type: 'item', label: 'Fermer le groupe d’onglets', onPress: () => closeGroup(group) },
      ]
    : [];
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
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={260} testID="panel-menu">
        <MenuList entries={entries} onClose={() => setAnchor(null)} />
      </Popover>
    </>
  );
}

function PanelGroup({ group: { id: group, panels: all } }: { group: DockGroup }) {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels);
  const active = useWorkspaceStore((s) => s.activeTab[group]);
  const collapsed = useWorkspaceStore((s) => s.collapsedGroups.includes(group));
  const showPanel = useWorkspaceStore((s) => s.showPanel);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleGroupCollapsed);
  const panels = all.filter((p) => !hidden.includes(p));
  const first = panels[0];
  if (first === undefined) return null;
  const current = active !== undefined && panels.includes(active) ? active : first;
  const autoHeight = panels.every((p) => AUTO_HEIGHT.includes(p));

  return (
    <View style={[styles.group, !collapsed && groupFlex(panels)]} testID={`dock-group-${group}`}>
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
        <ScrollView style={autoHeight ? undefined : styles.body}>
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
  const strip = useWorkspaceStore((s) => s.strip);
  const panels = strip.filter((p) => !hidden.includes(p));
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
              <WText style={[styles.tabTextActive, styles.flex]}>{PANEL_META[shown].label}</WText>
              <StripPanelMenu panel={shown} />
              <WIconButton icon="chevron-double-right" label={`Réduire ${PANEL_META[shown].label}`} size={14} style={styles.headerButton} onPress={() => setOpen(null)} />
            </View>
            <PanelBody panel={shown} />
          </View>
        ) : null}
      </Popover>
    </View>
  );
}

/** Menu « ≡ » d'un panneau flottant de la colonne d'icônes : l'ancrer dans le dock, le fermer. */
function StripPanelMenu({ panel }: { panel: PanelId }) {
  const ref = useRef<ViewRef | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const togglePanelVisible = useWorkspaceStore((s) => s.togglePanelVisible);
  const label = PANEL_META[panel].label;
  const entries: MenuEntry[] = anchor ? [...moveEntries(panel, null), { type: 'separator' }, { type: 'item', label: `Fermer ${label}`, onPress: () => togglePanelVisible(panel) }] : [];
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
        testID="strip-panel-menu"
      />
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={260} testID="panel-menu">
        <MenuList entries={entries} onClose={() => setAnchor(null)} />
      </Popover>
    </>
  );
}

/** Dock réduit : une icône par panneau visible ; toucher développe le dock sur ce panneau. */
function CollapsedDock() {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels);
  const showPanel = useWorkspaceStore((s) => s.showPanel);
  const groups = useWorkspaceStore((s) => s.groups);
  return (
    <View style={styles.collapsedDock} testID="dock-collapsed">
      {groups.map(({ id: group, panels: all }) => {
        const panels = all.filter((p) => !hidden.includes(p));
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
 * Zone des panneaux à droite : colonne d'icônes (au départ Historique,
 * Navigateur, Caractère, Paragraphe) puis dock de groupes d'onglets,
 * réductible en icônes avec « << / >> ». Le menu « ≡ » de chaque panneau le
 * déplace vers un autre groupe, un nouveau groupe ou la colonne d'icônes, et
 * réordonne les groupes.
 */
export function Dock({ width }: { width: number }) {
  const collapsed = useWorkspaceStore((s) => s.dockCollapsed);
  const groups = useWorkspaceStore((s) => s.groups);
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
          groups.map((group) => <PanelGroup key={group.id} group={group} />)
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
