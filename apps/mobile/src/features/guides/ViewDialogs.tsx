import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { AppText, DialogFrame, SegmentedControl, TextField } from '@/components/ui';
import { validateGrid, validateGuidePosition, type GuideOrientation } from '@/engine/guides';
import type { GraphicDocument } from '@/engine/documents';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { spacing } from '@/theme';

import { guideActions } from './guideActions';

const parse = (text: string) => Number(text.replace(',', '.').trim() || 'NaN');

/** Affichage › Nouveau repère… : orientation et position en pixels du document. */
function NewGuideBody({ document, onClose }: { document: GraphicDocument; onClose: () => void }) {
  const [orientation, setOrientation] = useState<GuideOrientation>('horizontal');
  const [text, setText] = useState('0');
  const [error, setError] = useState<string | undefined>(undefined);
  const submit = () => {
    const position = parse(text);
    const message = validateGuidePosition(position);
    if (message) {
      setError(message);
      return;
    }
    guideActions.add(document.id, orientation, position);
    onClose();
  };
  const extent = orientation === 'horizontal' ? document.height : document.width;
  return (
    <DialogFrame title="Nouveau repère" confirmLabel="OK" onConfirm={submit} onCancel={onClose} testID="new-guide-dialog">
      <SegmentedControl
        label="Orientation"
        value={orientation}
        onChange={setOrientation}
        options={[
          { value: 'horizontal', label: 'Horizontale' },
          { value: 'vertical', label: 'Verticale' },
        ]}
      />
      <View style={styles.row}>
        <TextField
          label="Position"
          suffix="px"
          value={text}
          onChangeText={setText}
          keyboardType="numbers-and-punctuation"
          error={error}
          selectTextOnFocus
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
          testID="guide-position"
        />
      </View>
      <AppText variant="caption" tone="secondary">
        {orientation === 'horizontal' ? `Distance depuis le bord haut (le document mesure ${extent} px de haut).` : `Distance depuis le bord gauche (le document mesure ${extent} px de large).`}
      </AppText>
    </DialogFrame>
  );
}

/** Affichage › Grille… : pas des lignes principales et subdivisions. */
function GridBody({ onClose }: { onClose: () => void }) {
  const grid = useWorkspaceStore((s) => s.grid);
  const setGrid = useWorkspaceStore((s) => s.setGrid);
  const [spacingText, setSpacingText] = useState(String(grid.spacing));
  const [subText, setSubText] = useState(String(grid.subdivisions));
  const [error, setError] = useState<string | undefined>(undefined);
  const submit = () => {
    const next = { spacing: parse(spacingText), subdivisions: parse(subText) };
    const message = validateGrid(next);
    if (message) {
      setError(message);
      return;
    }
    setGrid(next);
    onClose();
  };
  return (
    <DialogFrame title="Grille" confirmLabel="OK" onConfirm={submit} onCancel={onClose} testID="grid-dialog">
      <View style={styles.row}>
        <TextField label="Une ligne tous les" suffix="px" value={spacingText} onChangeText={setSpacingText} keyboardType="decimal-pad" selectTextOnFocus testID="grid-spacing" />
      </View>
      <View style={styles.row}>
        <TextField label="Subdivisions" value={subText} onChangeText={setSubText} keyboardType="number-pad" selectTextOnFocus error={error} testID="grid-subdivisions" />
      </View>
    </DialogFrame>
  );
}

/** Boîtes du menu Affichage (repère, grille), communes au téléphone et à la tablette. */
export function ViewDialogs({ document }: { document: GraphicDocument }) {
  const dialog = useWorkspaceStore((s) => s.viewDialog);
  const setDialog = useWorkspaceStore((s) => s.setViewDialog);
  const close = () => setDialog(null);
  return (
    <>
      <Modal visible={dialog === 'newGuide'} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        {dialog === 'newGuide' ? <NewGuideBody document={document} onClose={close} /> : null}
      </Modal>
      <Modal visible={dialog === 'grid'} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        {dialog === 'grid' ? <GridBody onClose={close} /> : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
});
