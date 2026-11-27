import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, NumberField, SegmentedControl, type SegmentOption } from '@/components/ui';
import { formatBytes, type GraphicDocument } from '@/engine/documents';
import { missingResources, planExport, type ExportFormat } from '@/engine/renderer';
import { exportTargets } from '@/services/export/exportFiles';
import { useDocumentStore } from '@/stores/documentStore';
import { colors, radius, spacing } from '@/theme';

import { useExportStore } from './exportStore';
import { useExport, type ExportOutcome } from './useExport';

const FORMATS: readonly SegmentOption<ExportFormat>[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
];
const SCALES: readonly SegmentOption<'0.25' | '0.5' | '1' | '2'>[] = [
  { value: '0.25', label: '25 %' },
  { value: '0.5', label: '50 %' },
  { value: '1', label: '100 %' },
  { value: '2', label: '200 %' },
];
const MATTES: readonly SegmentOption<'#FFFFFF' | '#000000'>[] = [
  { value: '#FFFFFF', label: 'Blanc' },
  { value: '#000000', label: 'Noir' },
];

function Body({ document, onClose }: { document: GraphicDocument; onClose: () => void }) {
  const settings = useExportStore((s) => s.settings);
  const update = useExportStore((s) => s.update);
  const { busy, run, resources } = useExport();
  const [outcome, setOutcome] = useState<ExportOutcome>({ ok: null });
  const plan = planExport(document, settings);
  const missing = missingResources(document, resources);
  const blocked = plan.error !== null || missing.length > 0 || busy;
  const scaleValue = (SCALES.find((s) => Number(s.value) === settings.scale)?.value ?? '1') as (typeof SCALES)[number]['value'];

  const go = async (destination: 'share' | 'folder') => setOutcome(await run(document, settings, destination));

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <AppText variant="title" accessibilityRole="header">
        Exporter « {document.name} »
      </AppText>
      <SegmentedControl label="Format" options={FORMATS} value={settings.format} onChange={(format) => update({ format })} />
      <SegmentedControl label="Taille de l’image" options={SCALES} value={scaleValue} onChange={(v) => update({ scale: Number(v) })} />
      <AppText tone="secondary" testID="export-size">
        {plan.width} × {plan.height} px
      </AppText>
      {settings.format === 'jpeg' ? (
        <NumberField
          label="Qualité (1 à 100)"
          value={settings.quality}
          onCommit={(quality) => (Number.isInteger(quality) && quality >= 1 && quality <= 100 ? (update({ quality }), null) : 'Entre 1 et 100.')}
          testID="export-quality"
        />
      ) : null}
      {plan.losesTransparency ? (
        <>
          <SegmentedControl label="Fond des zones transparentes" options={MATTES} value={settings.matte === '#000000' ? '#000000' : '#FFFFFF'} onChange={(matte) => update({ matte })} />
          <AppText variant="caption" tone="secondary">
            Le JPEG ne garde pas la transparence : ces zones prendront la couleur choisie. Utilisez le PNG pour la conserver.
          </AppText>
        </>
      ) : settings.format === 'png' && document.background === 'transparent' ? (
        <AppText variant="caption" tone="secondary">
          La transparence du document est conservée.
        </AppText>
      ) : null}
      <AppText variant="caption" tone="secondary">
        Calques visibles seulement, dans l’ordre de la pile. Le damier de transparence n’est pas exporté.
      </AppText>

      {plan.error ? (
        <AppText tone="danger" accessibilityRole="alert" testID="export-error">
          {plan.error}
        </AppText>
      ) : missing.length > 0 ? (
        <AppText tone="secondary" accessibilityRole="alert">
          Préparation des calques : {missing.join(', ')}…
        </AppText>
      ) : null}
      {outcome.ok === false ? (
        <AppText tone="danger" accessibilityRole="alert" testID="export-error">
          Export impossible : {outcome.message}
        </AppText>
      ) : null}
      {outcome.ok === true ? (
        <AppText tone="secondary" accessibilityRole="alert" testID="export-success">
          {outcome.savedAs ? `Enregistrée : ${outcome.savedAs}` : `Image prête : ${outcome.result.fileName}`} — {outcome.result.width} × {outcome.result.height} px,{' '}
          {formatBytes(outcome.result.bytes.length)}.
        </AppText>
      ) : null}
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.accent} />
          <AppText tone="secondary">Export en cours…</AppText>
        </View>
      ) : null}

      <View style={styles.actions}>
        {exportTargets.share ? <Button label="Partager…" hint="Photos, Fichiers, applications" disabled={blocked} onPress={() => void go('share')} /> : null}
        {exportTargets.folder ? <Button label="Enregistrer dans un dossier…" variant="secondary" disabled={blocked} onPress={() => void go('folder')} /> : null}
        <Button label={outcome.ok === true ? 'Terminé' : 'Annuler'} variant="secondary" disabled={busy} onPress={onClose} />
      </View>
    </ScrollView>
  );
}

/** Boîte « Exporter » : format, taille, qualité, fond, puis partage ou dossier. */
export function ExportDialog() {
  const openFor = useExportStore((s) => s.openFor);
  const close = useExportStore((s) => s.close);
  const document = useDocumentStore((s) => (openFor ? s.documents[openFor] : undefined));
  return (
    <Modal visible={!!document} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityElementsHidden importantForAccessibility="no" />
        <View style={styles.dialog} accessibilityViewIsModal testID="export-dialog">
          {document ? <Body key={document.id} document={document} onClose={close} /> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  dialog: { width: '100%', maxWidth: 480, maxHeight: '90%', borderRadius: radius.lg, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  body: { gap: spacing.md, padding: spacing.xl },
  busy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
