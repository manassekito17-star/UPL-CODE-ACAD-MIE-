import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Action destructive : bouton de confirmation rouge. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Boîte de confirmation modale. Toute suppression passe par elle : le
 * message doit nommer précisément l'élément concerné.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* Toucher le fond annule, comme le bouton retour d'Android. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityElementsHidden importantForAccessibility="no" />
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert" testID="confirm-dialog">
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText tone="secondary">{message}</AppText>
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={cancelLabel} variant="secondary" fullWidth onPress={onCancel} />
            </View>
            <View style={styles.action}>
              <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} fullWidth onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  action: { flex: 1 },
});
