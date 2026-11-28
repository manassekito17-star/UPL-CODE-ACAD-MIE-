import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { MenuList, WText, type MenuEntry } from '@/components/workspace/ui';
import { useEditorUiStore, type EditorPanel } from '@/stores/editorUiStore';
import { ws } from '@/theme';

import { useMenus } from './desktop/useMenus';
import { PHONE_PANELS } from './phonePanels';

/**
 * Menus complets sur téléphone : les mêmes que la barre de menus de la
 * tablette (Fichier, Édition, Image, Calque, Texte, Sélection, Filtre,
 * Affichage, Aide), dans un tiroir à gauche. « Fenêtre » ouvre les panneaux
 * du téléphone.
 */
export function MenuDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const menus = useMenus();
  const openSheet = useEditorUiStore((s) => s.toggleCompactSheet);
  const current = useEditorUiStore((s) => s.compactSheet);
  const [open, setOpen] = useState<string | null>('Fichier');

  const phoneMenus = menus
    .filter((m) => !m.studioOnly)
    .map((m) => ({ ...m, entries: m.entries.filter((e) => !(e.type === 'item' && e.studioOnly)) }));
  const panels: MenuEntry[] = (Object.keys(PHONE_PANELS) as EditorPanel[]).map((p) => ({
    type: 'item',
    label: PHONE_PANELS[p].title,
    icon: PHONE_PANELS[p].icon,
    checked: current === p,
    onPress: () => {
      if (current !== p) openSheet(p);
    },
  }));
  const all = [...phoneMenus.slice(0, -1), { title: 'Fenêtre', entries: panels }, ...phoneMenus.slice(-1)];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['top', 'bottom', 'left']} style={styles.drawer} testID="menu-drawer">
          <View style={styles.header}>
            <WText style={styles.title} accessibilityRole="header">
              Menus
            </WText>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer les menus" onPress={onClose} style={styles.close}>
              <Icon name="close" size={22} color={ws.text} />
            </Pressable>
          </View>
          <ScrollView>
            {all.map((menu) => {
              const expanded = open === menu.title;
              return (
                <View key={menu.title}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Menu ${menu.title}`}
                    accessibilityState={{ expanded }}
                    onPress={() => setOpen(expanded ? null : menu.title)}
                    style={[styles.section, expanded && styles.sectionOn]}
                  >
                    <WText style={styles.sectionTitle}>{menu.title}</WText>
                    <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={ws.textDim} />
                  </Pressable>
                  {expanded ? <MenuList entries={menu.entries} onClose={onClose} touch /> : null}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
        <Pressable style={styles.flex} onPress={onClose} accessible={false} testID="menu-drawer-backdrop" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { width: '82%', maxWidth: 360, backgroundColor: ws.panel, borderRightWidth: 1, borderRightColor: ws.border },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: ws.border },
  title: { fontSize: 16, fontWeight: '600' },
  close: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  section: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: ws.header },
  sectionOn: { backgroundColor: ws.raised },
  sectionTitle: { fontSize: 15, fontWeight: '600' },
});
