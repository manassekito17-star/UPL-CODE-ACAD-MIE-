import { useRef, useState, type ReactNode, type Ref } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui';
import { ws, wsMetrics } from '@/theme';

import { measureAnchor, type Anchor, type ViewRef } from './measure';

/**
 * Contrôles denses de l'espace de travail tablette et grand écran (palette
 * graphite). Cibles d'au moins 30 points : adaptées à la souris et au stylet,
 * encore utilisables au doigt sur tablette.
 */

export function WText({
  children,
  dim,
  disabled,
  style,
  numberOfLines,
  testID,
  accessibilityRole,
}: {
  children: ReactNode;
  dim?: boolean;
  disabled?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  testID?: string;
  accessibilityRole?: 'header' | 'alert' | 'text';
}) {
  return (
    <Text
      testID={testID}
      accessibilityRole={accessibilityRole}
      maxFontSizeMultiplier={1.3}
      numberOfLines={numberOfLines}
      style={[styles.text, dim && { color: ws.textDim }, disabled && { color: ws.textDisabled }, style]}
    >
      {children}
    </Text>
  );
}

export interface WIconButtonProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  active?: boolean;
  size?: number;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  innerRef?: Ref<ViewRef>;
  /** Petit triangle en bas à droite : l'outil appartient à une famille. */
  family?: boolean;
}

export function WIconButton({ icon, label, onPress, onLongPress, disabled, active, size = 18, hint, style, testID, innerRef, family }: WIconButtonProps) {
  return (
    <Pressable
      ref={innerRef}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      testID={testID}
      style={({ pressed }) => [styles.iconButton, active && styles.iconActive, pressed && !disabled && styles.iconPressed, style]}
    >
      <Icon name={icon} size={size} color={disabled ? ws.textDisabled : active ? ws.accentText : ws.text} />
      {family ? <View style={styles.familyMark} /> : null}
    </Pressable>
  );
}

export type { Anchor, ViewRef } from './measure';

export function useAnchor() {
  const ref = useRef<ViewRef | null>(null);
  const measure = () => new Promise<Anchor>((resolve) => measureAnchor(ref.current, resolve));
  return { ref, measure };
}

/** Fenêtre flottante ancrée (menus, familles d'outils, listes). Toucher à côté la ferme. */
export function Popover({ anchor, placement = 'below', onClose, children, testID, width = 280 }: { anchor: Anchor | null; placement?: 'below' | 'right' | 'left'; onClose: () => void; children: ReactNode; testID?: string; width?: number }) {
  const position: ViewStyle =
    anchor === null
      ? {}
      : placement === 'below'
        ? { left: Math.max(4, anchor.x), top: anchor.y + anchor.height + 2 }
        : placement === 'right'
          ? { left: anchor.x + anchor.width + 4, top: Math.max(4, anchor.y) }
          : { left: Math.max(4, anchor.x - width - 4), top: Math.max(4, anchor.y) };
  return (
    <Modal visible={anchor !== null} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer le menu" />
      <View style={[styles.popover, { width }, position]} testID={testID} accessibilityViewIsModal>
        <ScrollView style={styles.popoverScroll}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

export type MenuEntry =
  | {
      type: 'item';
      label: string;
      /** Raccourci affiché (actions disponibles) ou module (actions prévues). */
      right?: string;
      onPress?: () => void;
      /** Prévu : désactivé, le module est affiché à droite. */
      planned?: boolean;
      /** Disponible mais sans objet dans l'état actuel (aucun calque sélectionné…). */
      disabled?: boolean;
      checked?: boolean;
      icon?: IconName;
    }
  | { type: 'separator' }
  | { type: 'header'; label: string };

export function MenuList({ entries, onClose }: { entries: readonly MenuEntry[]; onClose: () => void }) {
  return (
    <View style={styles.menuList} accessibilityRole="menu">
      {entries.map((entry, i) => {
        if (entry.type === 'separator') return <View key={i} style={styles.separator} />;
        if (entry.type === 'header')
          return (
            <WText key={i} dim style={styles.menuHeader}>
              {entry.label}
            </WText>
          );
        const off = entry.planned || entry.disabled || !entry.onPress;
        return (
          <Pressable
            key={i}
            accessibilityRole="menuitem"
            accessibilityLabel={entry.label}
            accessibilityHint={entry.planned ? `Prévu au module ${entry.right ?? ''}` : undefined}
            accessibilityState={{ disabled: off, checked: entry.checked }}
            disabled={off}
            onPress={() => {
              onClose();
              entry.onPress?.();
            }}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <View style={styles.menuCheck}>
              {entry.checked ? <Icon name="check" size={14} color={ws.text} /> : entry.icon ? <Icon name={entry.icon} size={15} color={off ? ws.textDisabled : ws.textDim} /> : null}
            </View>
            <WText disabled={off} style={styles.menuLabel} numberOfLines={1}>
              {entry.label}
            </WText>
            {entry.right ? (
              <WText dim={!entry.planned} disabled={entry.planned} style={entry.planned ? styles.menuModule : styles.menuShortcut}>
                {entry.planned ? `Prévu · ${entry.right}` : entry.right}
              </WText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Champ numérique compact (barre d'options, panneaux) : validé en fin de saisie, une seule fois. */
export function WNumberField({ label, value, suffix, onCommit, editable = true, width = 64, testID, decimals = 0, hint, hideLabel }: { label: string; value: number; suffix?: string; onCommit: (v: number) => string | null; editable?: boolean; width?: number; testID?: string; decimals?: number; hint?: string; hideLabel?: boolean }) {
  const shownValue = decimals === 0 ? String(Math.round(value)) : String(Math.round(value * 10 ** decimals) / 10 ** decimals).replace('.', ',');
  const [text, setText] = useState(shownValue);
  const [shown, setShown] = useState(shownValue);
  const [error, setError] = useState(false);
  if (shown !== shownValue) {
    setShown(shownValue);
    setText(shownValue);
  }
  const last = useRef<string | null>(null);
  const commit = () => {
    if (last.current === text) return;
    last.current = text;
    const parsed = Number(text.replace(',', '.').trim());
    if (text.trim() === '' || !Number.isFinite(parsed)) {
      setError(true);
      setText(shownValue);
      return;
    }
    if (Math.abs(parsed - value) < 1e-9) return;
    const message = onCommit(parsed);
    setError(message !== null);
    if (message) setText(shownValue);
  };
  return (
    <View style={styles.fieldWrap}>
      {hideLabel ? null : <WText dim>{label}</WText>}
      <View style={[styles.field, { width }, error && styles.fieldError, !editable && styles.fieldOff]}>
        <TextInput
          accessibilityLabel={label.replace(/\s*:$/, '')}
          accessibilityHint={hint}
          value={text}
          editable={editable}
          onChangeText={(t) => {
            last.current = null;
            setText(t);
          }}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="numbers-and-punctuation"
          inputMode="decimal"
          returnKeyType="done"
          selectTextOnFocus
          testID={testID}
          style={styles.fieldInput}
          maxFontSizeMultiplier={1.3}
        />
        {suffix ? <WText dim>{suffix}</WText> : null}
      </View>
    </View>
  );
}

/** Liste déroulante compacte : un bouton qui ouvre un MenuList ancré. */
export function WSelect({ label, value, entries, width = 120, testID, icon }: { label: string; value: string; entries: readonly MenuEntry[]; width?: number; testID?: string; icon?: IconName }) {
  const { ref, measure } = useAnchor();
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${value}`}
        onPress={async () => setAnchor(await measure())}
        style={[styles.select, { width }]}
        testID={testID}
      >
        {icon ? <Icon name={icon} size={14} color={ws.textDim} /> : null}
        <WText numberOfLines={1} style={styles.flex}>
          {value}
        </WText>
        <Icon name="chevron-down" size={14} color={ws.textDim} />
      </Pressable>
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={Math.max(width, 220)} testID="select-dropdown">
        <MenuList entries={entries} onClose={() => setAnchor(null)} />
      </Popover>
    </>
  );
}

/** Case à cocher compacte, avec son libellé. */
export function WCheckbox({ label, checked, onChange, disabled, testID }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.checkbox}
      testID={testID}
    >
      <Icon name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={16} color={disabled ? ws.textDisabled : checked ? ws.accentText : ws.textDim} />
      <WText disabled={disabled}>{label}</WText>
    </Pressable>
  );
}

export function Divider({ vertical }: { vertical?: boolean }) {
  return <View style={vertical ? styles.vDivider : styles.hDivider} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  text: { color: ws.text, fontSize: wsMetrics.fontSize, lineHeight: 16 },
  iconButton: { minWidth: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 4, paddingHorizontal: 4 },
  iconActive: { backgroundColor: ws.raised },
  iconPressed: { backgroundColor: ws.raised },
  familyMark: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: ws.textDim,
  },
  popover: {
    position: 'absolute',
    maxHeight: '80%',
    backgroundColor: ws.panel,
    borderWidth: 1,
    borderColor: ws.border,
    borderRadius: 6,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  popoverScroll: { flexGrow: 0 },
  menuList: { paddingHorizontal: 4 },
  menuHeader: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4, fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  menuItem: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, borderRadius: 4 },
  menuItemPressed: { backgroundColor: ws.accent },
  menuCheck: { width: 18, alignItems: 'center' },
  menuLabel: { flex: 1 },
  menuShortcut: { fontSize: wsMetrics.smallFontSize },
  menuModule: { fontSize: wsMetrics.smallFontSize },
  separator: { height: 1, backgroundColor: ws.divider, marginVertical: 4, marginHorizontal: 6 },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  field: { height: 26, flexDirection: 'row', alignItems: 'center', backgroundColor: ws.input, borderRadius: 3, borderWidth: 1, borderColor: ws.border, paddingHorizontal: 6 },
  fieldError: { borderColor: '#FF5C5C' },
  fieldOff: { opacity: 0.5 },
  fieldInput: { flex: 1, minWidth: 0, color: ws.text, fontSize: wsMetrics.fontSize, paddingVertical: 0 },
  select: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ws.input, borderRadius: 3, borderWidth: 1, borderColor: ws.border, paddingHorizontal: 8 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30 },
  vDivider: { width: 1, alignSelf: 'stretch', backgroundColor: ws.divider, marginVertical: 6 },
  hDivider: { height: 1, alignSelf: 'stretch', backgroundColor: ws.divider },
});
