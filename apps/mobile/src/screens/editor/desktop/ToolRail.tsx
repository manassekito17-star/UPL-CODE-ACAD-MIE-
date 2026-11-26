import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { TOOL_FAMILIES, findTool, isUsable, type ToolFamily, type ToolItem } from '../toolFamilies';
import { useInsertMenu } from '../useInsertMenu';
import { Popover, WIconButton, WText, type Anchor, type ViewRef } from './ui';
import { measureAnchor } from './measure';
import { useWorkspace } from './WorkspaceContext';

/** Séparateurs entre groupes de familles, comme dans les logiciels de retouche. */
const GROUP_BREAKS = new Set(['marquee', 'crop', 'healing', 'pen', 'hand']);

/** Outil réellement actif : celui de la barre si son mode correspond au mode courant. */
export function useEffectiveToolKey(): string {
  const activeTool = useEditorUiStore((s) => s.activeTool);
  const railToolKey = useWorkspaceStore((s) => s.railToolKey);
  const tool = findTool(railToolKey);
  const mode = tool && tool.behavior.kind !== 'none' ? tool.behavior.mode : null;
  if (mode === activeTool) return railToolKey;
  return activeTool === 'select' ? 'move' : 'hand';
}

/** Choisir un outil : mode de la toile, ou insertion d'un calque puis outil Sélection. */
export function useActivateTool() {
  const { document } = useWorkspace();
  const setTool = useEditorUiStore((s) => s.setTool);
  const setRailTool = useWorkspaceStore((s) => s.setRailTool);
  const insertMenu = useInsertMenu(document.id);
  return (family: ToolFamily, tool: ToolItem) => {
    if (!isUsable(tool)) return;
    setRailTool(family.id, tool.key);
    if (tool.behavior.kind === 'mode') setTool(tool.behavior.mode);
    if (tool.behavior.kind === 'insert') void insertMenu.insert(tool.behavior.insert);
  };
}

function FamilyFlyout({ family, onChoose }: { family: ToolFamily; onChoose: (tool: ToolItem) => void }) {
  return (
    <View testID="tool-flyout">
      <WText dim style={styles.flyoutTitle}>
        {family.label}
      </WText>
      {family.items.map((tool) => {
        const usable = isUsable(tool);
        return (
          <Pressable
            key={tool.key}
            accessibilityRole="menuitem"
            accessibilityLabel={tool.label}
            accessibilityHint={tool.note ? (usable ? tool.note : `Prévu au module ${tool.note}`) : undefined}
            accessibilityState={{ disabled: !usable }}
            disabled={!usable}
            onPress={() => onChoose(tool)}
            style={({ pressed }) => [styles.flyoutRow, pressed && styles.flyoutPressed]}
          >
            <Icon name={tool.icon} size={18} color={usable ? ws.text : ws.textDisabled} />
            <View style={styles.flex}>
              <WText disabled={!usable}>{tool.label}</WText>
              {tool.note ? (
                <WText dim={usable} disabled={!usable} style={styles.note}>
                  {usable ? tool.note : `Prévu · ${tool.note}`}
                </WText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Barre d'outils verticale : 20 familles, couleurs de premier plan et d'arrière-plan. */
export function ToolRail() {
  const effective = useEffectiveToolKey();
  const familyChoice = useWorkspaceStore((s) => s.familyChoice);
  const foreground = useWorkspaceStore((s) => s.foreground);
  const background = useWorkspaceStore((s) => s.background);
  const swapColors = useWorkspaceStore((s) => s.swapColors);
  const resetColors = useWorkspaceStore((s) => s.resetColors);
  const showPanel = useWorkspaceStore((s) => s.showPanel);
  const double = useWorkspaceStore((s) => s.toolRailDouble);
  const toggleDouble = useWorkspaceStore((s) => s.toggleToolRailDouble);
  const panelsHidden = useWorkspaceStore((s) => s.panelsHidden);
  const togglePanelsHidden = useWorkspaceStore((s) => s.togglePanelsHidden);
  const activate = useActivateTool();
  const refs = useRef<Record<string, ViewRef | null>>({});
  const [flyout, setFlyout] = useState<{ family: ToolFamily; anchor: Anchor } | null>(null);

  const openFamily = (family: ToolFamily) => {
    const node = refs.current[family.id];
    const show = (anchor: Anchor) => setFlyout({ family, anchor });
    measureAnchor(node ?? null, show);
  };

  return (
    <View style={[styles.rail, double && styles.railDouble]} testID="tool-rail">
      <View style={styles.railBar}>
        <WIconButton
          icon={double ? 'chevron-double-left' : 'chevron-double-right'}
          label={double ? 'Barre d’outils sur une colonne' : 'Barre d’outils sur deux colonnes'}
          size={12}
          style={styles.railToggle}
          onPress={toggleDouble}
          testID="tool-rail-toggle"
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, double && styles.contentDouble]} showsVerticalScrollIndicator={false} accessibilityRole="toolbar" accessibilityLabel="Outils">
        {TOOL_FAMILIES.map((family) => {
          const shown = findTool(familyChoice[family.id] ?? '') ?? family.items[0];
          if (!shown) return null;
          const active = family.items.some((t) => t.key === effective);
          const usable = isUsable(shown);
          return (
            <View key={family.id} style={double ? styles.cellDouble : undefined}>
              {GROUP_BREAKS.has(family.id) && !double ? <View style={styles.groupBreak} /> : null}
              <WIconButton
                innerRef={(node) => {
                  refs.current[family.id] = node;
                }}
                icon={shown.icon}
                label={family.items.length > 1 ? `${family.label} : ${shown.label}` : shown.label}
                hint={usable ? (family.items.length > 1 ? 'Appui long : autres outils de la famille' : shown.note) : `Prévu au module ${shown.note ?? ''}`}
                active={active}
                family={family.items.length > 1}
                style={[styles.tool, !usable && styles.toolPlanned]}
                onPress={() => (usable && !(active && family.items.length > 1) ? activate(family, shown) : openFamily(family))}
                onLongPress={() => openFamily(family)}
                testID={`tool-${family.id}`}
              />
            </View>
          );
        })}

        <View style={styles.fullRow}>
          <WIconButton icon="dots-horizontal" label="Modifier la barre d’outils" hint="Prévu au module M1 (suite)" size={16} style={styles.tool} disabled />
        </View>
        <View style={[styles.fullRow, styles.colors]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Couleur de premier plan ${foreground}`}
            accessibilityHint="Ouvre le panneau Couleur"
            onPress={() => showPanel('color')}
            style={[styles.swatch, styles.fg, { backgroundColor: foreground }]}
            testID="foreground-swatch"
          />
          <View style={[styles.swatch, styles.bg, { backgroundColor: background }]} accessible accessibilityLabel={`Couleur d’arrière-plan ${background}`} />
          <WIconButton icon="swap-horizontal" label="Permuter les couleurs" size={11} onPress={swapColors} style={[styles.mini, styles.swap]} />
          <WIconButton icon="backup-restore" label="Couleurs par défaut (noir et blanc)" size={11} onPress={resetColors} style={[styles.mini, styles.reset]} />
        </View>
        <View style={styles.fullRow}>
          <WIconButton icon="circle-box-outline" label="Mode Masque" hint="Prévu au module M6" size={17} style={styles.tool} disabled />
        </View>
        <View style={styles.fullRow}>
          <WIconButton
            icon={panelsHidden ? 'fullscreen-exit' : 'monitor'}
            label={panelsHidden ? 'Mode d’affichage standard' : 'Mode plein écran avec barre de menus'}
            size={17}
            style={styles.tool}
            active={panelsHidden}
            onPress={togglePanelsHidden}
            testID="screen-mode"
          />
        </View>
      </ScrollView>

      <Popover anchor={flyout?.anchor ?? null} placement="right" onClose={() => setFlyout(null)} width={300}>
        {flyout ? (
          <FamilyFlyout
            family={flyout.family}
            onChoose={(tool) => {
              const family = flyout.family;
              setFlyout(null);
              activate(family, tool);
            }}
          />
        ) : null}
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rail: { width: wsMetrics.toolRail, backgroundColor: ws.chrome, borderRightWidth: 1, borderRightColor: ws.border },
  railDouble: { width: wsMetrics.toolButton * 2 + 8 },
  railBar: { height: 14, alignItems: 'flex-end', backgroundColor: ws.header },
  railToggle: { height: 14, minWidth: 20, paddingHorizontal: 0, borderRadius: 0 },
  content: { alignItems: 'center', paddingVertical: 4, gap: 1 },
  contentDouble: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cellDouble: { width: wsMetrics.toolButton, alignItems: 'center' },
  fullRow: { width: '100%', alignItems: 'center' },
  tool: { width: wsMetrics.toolButton, height: 27 },
  toolPlanned: { opacity: 0.55 },
  groupBreak: { height: 1, width: 24, backgroundColor: ws.divider, marginVertical: 3, alignSelf: 'center' },
  colors: { width: 34, height: 34, marginTop: 8, marginBottom: 2, alignSelf: 'center' },
  swatch: { position: 'absolute', width: 18, height: 18, borderWidth: 1, borderColor: '#000' },
  fg: { left: 2, top: 2, zIndex: 1, borderColor: '#9A9A9A' },
  bg: { left: 11, top: 11, borderColor: '#9A9A9A' },
  mini: { position: 'absolute', minWidth: 12, width: 12, height: 12, paddingHorizontal: 0 },
  swap: { right: -2, top: -2 },
  reset: { left: -2, bottom: -2 },
  flyoutTitle: { paddingHorizontal: 10, paddingVertical: 6, fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  flyoutRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 4, marginHorizontal: 4 },
  flyoutPressed: { backgroundColor: ws.accent },
  note: { fontSize: wsMetrics.smallFontSize },
});
