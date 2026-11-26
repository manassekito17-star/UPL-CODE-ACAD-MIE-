import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, touchTarget } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export interface Choice<T extends string> {
  value: T;
  label: string;
  icon: IconName;
  description?: string;
}

export interface ChoiceDialogProps<T extends string> {
  visible: boolean;
  title: string;
  choices: readonly Choice<T>[];
  onChoose: (value: T) => void;
  onCancel: () => void;
}

/** Liste de choix modale (menu d'insertion…). */
export function ChoiceDialog<T extends string>({ visible, title, choices, onChoose, onCancel }: ChoiceDialogProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityElementsHidden importantForAccessibility="no" />
        <View style={styles.dialog} accessibilityViewIsModal testID="choice-dialog">
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <View style={styles.list}>
            {choices.map((choice) => (
              <Pressable
                key={choice.value}
                accessibilityRole="button"
                accessibilityLabel={choice.label}
                accessibilityHint={choice.description}
                onPress={() => onChoose(choice.value)}
                style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
              >
                <Icon name={choice.icon} size={24} color={colors.accentText} />
                <View style={styles.text}>
                  <AppText variant="subtitle">{choice.label}</AppText>
                  {choice.description ? (
                    <AppText variant="caption" tone="secondary">
                      {choice.description}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
          <Button label="Annuler" variant="secondary" fullWidth onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
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
  list: { gap: spacing.xs },
  choice: {
    minHeight: touchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.panelPressed },
  text: { flex: 1, paddingVertical: spacing.sm },
});
