import { useEffect } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { WText } from '@/components/workspace/ui';
import { TOOL_FAMILIES } from '@/screens/editor/toolFamilies';
import { keyboardAvailable, listenShortcuts } from '@/services/keyboard/keyboard';
import { ws, wsMetrics } from '@/theme';
import { formatChord } from '@/utils/keyChords';

import { SHORTCUTS, allChords } from './catalog';
import { dispatchChord, useShortcutHelp, useToast } from './dispatcher';

export const isApple = Platform.OS === 'ios' || Platform.OS === 'macos' || (Platform.OS === 'web' && typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? ''));

/** Fenêtre Aide › Raccourcis clavier. */
function ShortcutHelp() {
  const open = useShortcutHelp((s) => s.open);
  const setOpen = useShortcutHelp((s) => s.setOpen);
  if (!open) return null;
  const groups = [...new Set(SHORTCUTS.map((s) => s.group))];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal testID="shortcut-help">
          <WText style={styles.title} accessibilityRole="header">
            Raccourcis clavier
          </WText>
          <WText dim style={styles.small}>
            {Platform.OS === 'ios'
              ? 'Sur iPhone et iPad, le clavier matériel n’est pas encore pris en charge : utilisez les menus et la barre d’outils.'
              : keyboardAvailable
                ? 'Avec un clavier (Bluetooth, USB ou ordinateur). Une lettre seule n’agit pas pendant une saisie de texte.'
                : 'Clavier matériel indisponible sur cet appareil.'}
          </WText>
          <ScrollView style={styles.list}>
            {groups.map((g) => (
              <View key={g} style={styles.group}>
                <WText dim style={styles.groupTitle}>
                  {g}
                </WText>
                {SHORTCUTS.filter((s) => s.group === g).map((s) => (
                  <View key={s.chord} style={styles.row} accessible accessibilityLabel={`${s.label} : ${formatChord(s.chord, isApple)}`}>
                    <WText style={styles.flex}>{s.label}</WText>
                    <WText style={styles.key}>{formatChord(s.chord, isApple)}</WText>
                  </View>
                ))}
              </View>
            ))}
            <View style={styles.group}>
              <WText dim style={styles.groupTitle}>
                Outils (Maj + lettre : outil suivant de la famille)
              </WText>
              {TOOL_FAMILIES.map((f) => (
                <View key={f.id} style={styles.row} accessible accessibilityLabel={`${f.label} : ${f.shortcut}`}>
                  <WText style={styles.flex}>{f.label}</WText>
                  <WText style={styles.key}>{f.shortcut}</WText>
                </View>
              ))}
            </View>
          </ScrollView>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setOpen(false)} style={styles.close}>
            <WText>Fermer</WText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Toast() {
  const message = useToast((s) => s.message);
  const hide = useToast((s) => s.hide);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 2800);
    return () => clearTimeout(t);
  }, [message, hide]);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="toast">
        <WText>{message}</WText>
      </View>
    </View>
  );
}

/** Écoute du clavier (une fois, à la racine), aide et messages brefs. */
export function ShortcutsRoot() {
  useEffect(() => listenShortcuts(allChords(), (chord) => void dispatchChord(chord)), []);
  return (
    <>
      <ShortcutHelp />
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 520, maxHeight: '90%', gap: 10, padding: 20, borderRadius: 8, backgroundColor: ws.panel, borderWidth: 1, borderColor: ws.border },
  title: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: wsMetrics.smallFontSize },
  list: { flexGrow: 0 },
  group: { gap: 4, marginBottom: 12 },
  groupTitle: { fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 26 },
  key: { fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: ws.input, overflow: 'hidden' },
  close: { alignSelf: 'flex-end', height: 40, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: ws.textDim },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 48, alignItems: 'center' },
  toast: { maxWidth: 520, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: ws.raised, borderWidth: 1, borderColor: ws.border },
});
