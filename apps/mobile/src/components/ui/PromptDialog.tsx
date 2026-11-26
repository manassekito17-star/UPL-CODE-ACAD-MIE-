import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { TextField } from './TextField';

export interface PromptDialogProps {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  confirmLabel: string;
  maxLength?: number;
  /** Renvoie un message d'erreur pour garder la boîte ouverte, ou null si accepté. */
  onSubmit: (value: string) => string | null;
  onCancel: () => void;
}

/** Boîte de saisie modale (renommer…). Le contenu est remonté à chaque ouverture. */
export function PromptDialog(props: PromptDialogProps) {
  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onCancel} statusBarTranslucent>
      {props.visible ? <PromptBody {...props} /> : null}
    </Modal>
  );
}

function PromptBody({ title, label, initialValue, confirmLabel, maxLength, onSubmit, onCancel }: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = () => {
    const message = onSubmit(value);
    setError(message ?? undefined);
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityElementsHidden importantForAccessibility="no" />
      <View style={styles.dialog} accessibilityViewIsModal testID="prompt-dialog">
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        <View style={styles.field}>
          <TextField
            label={label}
            value={value}
            onChangeText={setValue}
            error={error}
            maxLength={maxLength}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            testID="prompt-input"
          />
        </View>
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button label="Annuler" variant="secondary" fullWidth onPress={onCancel} />
          </View>
          <View style={styles.action}>
            <Button label={confirmLabel} fullWidth onPress={submit} />
          </View>
        </View>
      </View>
    </View>
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
  field: { flexDirection: 'row' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  action: { flex: 1 },
});
