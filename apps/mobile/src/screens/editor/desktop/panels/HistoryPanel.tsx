import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog, Icon, type IconName } from '@/components/ui';
import { HISTORY_LIMIT } from '@/engine/history';
import { useHistory } from '@/features/history/useHistory';
import { ws, wsMetrics } from '@/theme';

import { Divider, WIconButton, WText } from '../ui';
import { useWorkspace } from '../WorkspaceContext';

const ICONS: Record<string, IconName> = {
  'Nouveau document': 'file-document-outline',
  Ouvrir: 'folder-open-outline',
  'Nouveau calque de forme': 'square-outline',
  'Nouveau calque de texte': 'format-text',
  'Importer une image': 'image-plus',
  'Dupliquer le calque': 'content-duplicate',
  'Supprimer le calque': 'delete-outline',
  'Renommer le calque': 'rename-box',
  'Afficher le calque': 'eye-outline',
  'Masquer le calque': 'eye-off-outline',
  'Verrouiller le calque': 'lock-outline',
  'Déverrouiller le calque': 'lock-open-variant-outline',
  'Disposition des calques': 'sort',
  Aligner: 'format-align-middle',
  Déplacer: 'cursor-move',
  'Transformation manuelle': 'vector-square-edit',
  'Opacité du calque': 'opacity',
  'Modifier le calque de texte': 'format-text',
  'Modifier le calque de forme': 'format-color-fill',
};

type Pending = { kind: 'delete'; index: number; label: string } | { kind: 'clear' } | null;

/**
 * Panneau Historique : un état par action, du plus ancien au plus récent.
 * Toucher un état y revient (les suivants, grisés, restent disponibles
 * jusqu'à la prochaine modification) ; la corbeille supprime l'état courant
 * et les suivants ; « Effacer » ne garde que l'état affiché.
 */
export function HistoryPanel() {
  const { document } = useWorkspace();
  const h = useHistory(document.id);
  const [pending, setPending] = useState<Pending>(null);
  if (!h.history) return null;
  const { states, index } = h.history;
  const current = states[index];

  return (
    <View style={styles.panel} testID="history-panel">
      <ScrollView style={styles.list} accessibilityLabel={`Historique : ${states.length} états sur ${HISTORY_LIMIT} au plus`}>
        {states.map((state, i) => {
          const isCurrent = i === index;
          const undone = i > index;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`État ${i + 1} : ${state.label}`}
              accessibilityHint={undone ? 'Annulé : toucher pour le rétablir' : isCurrent ? 'État affiché' : 'Toucher pour revenir à cet état'}
              accessibilityState={{ selected: isCurrent }}
              onPress={() => h.goTo(i)}
              style={[styles.row, isCurrent && styles.rowCurrent, i === 0 && styles.firstRow]}
              testID={`history-state-${i}`}
            >
              <Icon name={ICONS[state.label] ?? 'history'} size={15} color={undone ? ws.textDisabled : ws.textDim} />
              <WText numberOfLines={1} disabled={undone} style={[styles.label, undone && styles.undone]}>
                {i === 0 ? `${document.name} — ${state.label}` : state.label}
              </WText>
            </Pressable>
          );
        })}
      </ScrollView>
      <Divider />
      <View style={styles.footer} accessibilityRole="toolbar" accessibilityLabel="Actions de l’historique">
        <WText dim style={styles.count}>
          {states.length}/{HISTORY_LIMIT}
        </WText>
        <WIconButton icon="undo" label={h.undoLabel ? `Annuler : ${h.undoLabel}` : 'Annuler'} size={15} disabled={!h.canUndo} onPress={h.undo} testID="history-undo" />
        <WIconButton icon="redo" label={h.redoLabel ? `Rétablir : ${h.redoLabel}` : 'Rétablir'} size={15} disabled={!h.canRedo} onPress={h.redo} testID="history-redo" />
        <WIconButton icon="file-plus-outline" label="Nouveau document à partir de l’état" hint="Prévu au module M3" size={15} disabled />
        <WIconButton icon="broom" label="Effacer l’historique" size={15} disabled={states.length < 2} onPress={() => setPending({ kind: 'clear' })} testID="history-clear" />
        <WIconButton
          icon="delete-outline"
          label="Supprimer l’état courant et les suivants"
          size={15}
          disabled={index === 0}
          onPress={() => current && setPending({ kind: 'delete', index, label: current.label })}
          testID="history-delete"
        />
      </View>
      <ConfirmDialog
        visible={pending !== null}
        title={pending?.kind === 'clear' ? 'Effacer l’historique ?' : 'Supprimer des états ?'}
        message={
          pending?.kind === 'clear'
            ? 'Seul l’état affiché est conservé. Les étapes précédentes et suivantes ne pourront plus être rappelées.'
            : pending
              ? `« ${pending.label} » et les états suivants seront supprimés ; l’état précédent sera affiché.`
              : ''
        }
        confirmLabel={pending?.kind === 'clear' ? 'Effacer' : 'Supprimer'}
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind === 'clear') h.clear();
          else if (pending) h.deleteFrom(pending.index);
          setPending(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { minHeight: 160, maxHeight: 420 },
  list: { flexGrow: 0 },
  row: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  firstRow: { borderBottomWidth: 1, borderBottomColor: ws.header },
  rowCurrent: { backgroundColor: ws.selected },
  label: { flex: 1 },
  undone: { fontStyle: 'italic' },
  count: { flex: 1, fontSize: wsMetrics.smallFontSize, paddingLeft: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', height: 32, paddingHorizontal: 4 },
});
