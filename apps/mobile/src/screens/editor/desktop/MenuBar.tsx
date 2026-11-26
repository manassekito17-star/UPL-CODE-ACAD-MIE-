import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ws, wsMetrics } from '@/theme';

import { MenuList, Popover, WText, type Anchor, type ViewRef } from './ui';
import { measureAnchor } from './measure';
import { useMenus } from './useMenus';

/** Barre de menus : Fichier, Édition, Image, Calque, Texte, Sélection, Filtre, Affichage, Fenêtre, Aide. */
export function MenuBar() {
  const menus = useMenus();
  const refs = useRef<(ViewRef | null)[]>([]);
  const [open, setOpen] = useState<{ index: number; anchor: Anchor } | null>(null);

  const openMenu = (index: number) => {
    const node = refs.current[index];
    const show = (anchor: Anchor) => setOpen({ index, anchor });
    measureAnchor(node ?? null, show);
  };
  const current = open ? menus[open.index] : undefined;

  return (
    <View style={styles.bar} accessibilityRole="menubar" testID="menu-bar">
      <View style={styles.brand} accessible accessibilityLabel="ZENTECH DESIGN">
        <View style={[styles.plate, { left: 0, top: 6, backgroundColor: '#4A4A4A' }]} />
        <View style={[styles.plate, { left: 3, top: 3, backgroundColor: '#1F68E0' }]} />
        <View style={[styles.plate, { left: 6, top: 0, backgroundColor: ws.accent }]} />
      </View>
      {menus.map((menu, index) => (
        <Pressable
          key={menu.title}
          ref={(node) => {
            refs.current[index] = node;
          }}
          accessibilityRole="button"
          accessibilityLabel={`Menu ${menu.title}`}
          accessibilityState={{ expanded: open?.index === index }}
          onPress={() => openMenu(index)}
          style={({ pressed }) => [styles.item, (pressed || open?.index === index) && styles.itemOpen]}
        >
          <WText>{menu.title}</WText>
        </Pressable>
      ))}
      <Popover anchor={open?.anchor ?? null} onClose={() => setOpen(null)} testID="menu-dropdown">
        {current ? <MenuList entries={current.entries} onClose={() => setOpen(null)} /> : null}
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: wsMetrics.menuBar,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: ws.chrome,
    borderBottomWidth: 1,
    borderBottomColor: ws.border,
  },
  brand: { width: 22, height: 18, marginRight: 8, marginLeft: 2 },
  plate: { position: 'absolute', width: 12, height: 12, borderRadius: 2, borderWidth: 1, borderColor: ws.chrome },
  item: { height: wsMetrics.menuBar - 4, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 3 },
  itemOpen: { backgroundColor: ws.raised },
});
