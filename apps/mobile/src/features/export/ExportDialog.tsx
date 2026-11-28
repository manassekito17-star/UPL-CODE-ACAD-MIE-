import { Canvas, Image as SkiaImage } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import { BackgroundSwatch, Icon } from '@/components/ui';
import { WText } from '@/components/workspace/ui';
import { DOCUMENT_LIMITS, formatBytes, formatNumber, fromPixels, parsePositive, type GraphicDocument } from '@/engine/documents';
import {
  FORMAT_LABELS,
  exportDocument,
  hasQuality,
  missingResources,
  planExport,
  renderDocumentToImage,
  supportsTransparency,
  type ExportFormat,
  type ExportResult,
  type ExportSettings,
} from '@/engine/renderer';
import { exportTargets, shareExport } from '@/services/export/exportFiles';
import { useDocumentStore } from '@/stores/documentStore';
import { ws, wsMetrics } from '@/theme';

import { useExportStore } from './exportStore';
import { useExport, type ExportOutcome } from './useExport';

const PREVIEW_MAX = 420;
const SCALES = [25, 50, 100, 200];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <WText dim style={styles.sectionTitle}>
        {title}
      </WText>
      {children}
    </View>
  );
}

function Chip({ label, on, onPress, testID }: { label: string; on: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: on }} onPress={onPress} style={[styles.chip, on && styles.chipOn]} testID={testID}>
      <WText style={on ? styles.chipTextOn : undefined}>{label}</WText>
    </Pressable>
  );
}

/** Champ numérique validé en fin de saisie. */
function NumberInput({ label, value, suffix, onCommit, testID }: { label: string; value: number; suffix: string; onCommit: (v: number) => void; testID?: string }) {
  const shown = formatNumber(value, 0);
  const [text, setText] = useState(shown);
  const [last, setLast] = useState(shown);
  if (last !== shown) {
    setLast(shown);
    setText(shown);
  }
  const commit = () => {
    const n = parsePositive(text);
    if (n === null) setText(shown);
    else if (Math.round(n) !== Math.round(value)) onCommit(n);
  };
  return (
    <View style={styles.numberRow}>
      <WText dim style={styles.numberLabel}>
        {label}
      </WText>
      <TextInput
        accessibilityLabel={label}
        value={text}
        onChangeText={setText}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        inputMode="numeric"
        selectTextOnFocus
        style={styles.input}
        testID={testID}
      />
      <WText dim style={styles.suffix}>
        {suffix}
      </WText>
    </View>
  );
}

/** Clé des réglages : un calcul ne sert que pour ces réglages exacts et ce document. */
const keyOf = (doc: GraphicDocument, s: ExportSettings) => JSON.stringify([doc.updatedAt, doc.id, s]);

function Body({ document, onClose }: { document: GraphicDocument; onClose: () => void }) {
  const stored = useExportStore((s) => s.settings);
  const update = useExportStore((s) => s.update);
  const { busy, run, resources } = useExport();
  const { width: windowWidth } = useWindowDimensions();
  const wide = windowWidth >= 760;
  const [outcome, setOutcome] = useState<ExportOutcome>({ ok: null });
  const [estimate, setEstimate] = useState<{ key: string; result: ExportResult | null; error: string | null } | null>(null);

  // Réglages complets pour ce document : la résolution par défaut est celle du document.
  const settings: ExportSettings = { ...stored, resolution: stored.resolution ?? document.resolution };
  const plan = planExport(document, settings);
  const missing = missingResources(document, resources);
  const keepsAlpha = supportsTransparency(settings.format) && settings.transparency !== false;
  const key = keyOf(document, settings);
  const ready = estimate?.key === key ? estimate.result : null;

  // Taille réelle du fichier : il est vraiment encodé (et réutilisé à l'export), après une courte pause.
  useEffect(() => {
    if (plan.error || missing.length > 0) return;
    const timer = setTimeout(() => {
      try {
        setEstimate({ key, result: exportDocument(document, settings, resources), error: null });
      } catch (e) {
        setEstimate({ key, result: null, error: e instanceof Error ? e.message : String(e) });
      }
    }, 350);
    return () => clearTimeout(timer);
    // `settings` et `document` sont résumés par `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resources, plan.error, missing.length]);

  // Aperçu : le même rendu, réduit, avec le fond choisi si la transparence n'est pas gardée.
  const preview = useMemo(() => {
    if (missing.length > 0) return null;
    try {
      const scale = Math.min(1, PREVIEW_MAX / Math.max(document.width, document.height));
      return renderDocumentToImage(document, { scale, resources, matte: keepsAlpha ? undefined : settings.matte });
    } catch {
      return null;
    }
  }, [document, resources, keepsAlpha, settings.matte, missing.length]);
  const previewScale = Math.min(1, PREVIEW_MAX / Math.max(document.width, document.height));
  const previewSize = { width: Math.max(1, Math.round(document.width * previewScale)), height: Math.max(1, Math.round(document.height * previewScale)) };
  const fit = Math.min(1, (wide ? 460 : windowWidth - 72) / previewSize.width, 300 / previewSize.height);

  const setWidth = (w: number) => update({ scale: Math.max(1, Math.round(w)) / document.width });
  const setHeight = (h: number) => update({ scale: Math.max(1, Math.round(h)) / document.height });
  const percent = Math.round(settings.scale * 1000) / 10;
  const go = async (destination: 'share' | 'folder') => setOutcome(await run(document, settings, destination, ready));
  const blocked = plan.error !== null || missing.length > 0 || busy;
  const size = ready ? formatBytes(ready.bytes.length) : null;

  const previewPane = (
    <View style={styles.previewPane}>
      <View style={[styles.previewBox, { width: previewSize.width * fit, height: previewSize.height * fit }]} accessible accessibilityLabel={`Aperçu de ${document.name}`} testID="export-preview">
        {keepsAlpha && document.background === 'transparent' ? <BackgroundSwatch background="transparent" style={StyleSheet.absoluteFill} /> : null}
        {preview ? (
          <Canvas style={StyleSheet.absoluteFill}>
            <SkiaImage image={preview} x={0} y={0} width={previewSize.width * fit} height={previewSize.height * fit} fit="contain" />
          </Canvas>
        ) : null}
      </View>
      <View style={styles.summary} testID="export-summary">
        <WText testID="export-size">
          {plan.width} × {plan.height} px · {FORMAT_LABELS[settings.format]}
        </WText>
        <WText dim style={styles.small} testID="export-file-size">
          {plan.error ? '—' : missing.length > 0 ? `Préparation des calques : ${missing.join(', ')}…` : size ? `Taille du fichier : ${size}` : 'Calcul de la taille…'}
        </WText>
      </View>
    </View>
  );

  const settingsPane = (
    <View style={styles.settingsPane}>
      <Section title="Paramètres du fichier">
        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Format">
          {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((f) => (
            <Chip key={f} label={FORMAT_LABELS[f]} on={settings.format === f} onPress={() => update({ format: f })} testID={`export-format-${f}`} />
          ))}
        </View>
        {hasQuality(settings.format) ? (
          <>
            <NumberInput label="Qualité" value={settings.quality} suffix="/ 100" onCommit={(q) => update({ quality: Math.min(100, Math.max(1, Math.round(q))) })} testID="export-quality" />
            <View style={styles.chips}>
              {[60, 80, 90, 100].map((q) => (
                <Chip key={q} label={String(q)} on={settings.quality === q} onPress={() => update({ quality: q })} />
              ))}
            </View>
          </>
        ) : null}
        {supportsTransparency(settings.format) ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Transparence"
            accessibilityState={{ checked: keepsAlpha }}
            onPress={() => update({ transparency: !keepsAlpha })}
            style={styles.check}
            testID="export-transparency"
          >
            <Icon name={keepsAlpha ? 'checkbox-marked' : 'checkbox-blank-outline'} size={18} color={keepsAlpha ? ws.accentText : ws.textDim} />
            <WText>Transparence</WText>
          </Pressable>
        ) : null}
        {plan.losesTransparency ? (
          <>
            <WText dim style={styles.small}>
              {settings.format === 'jpeg' ? 'Le JPEG ne garde pas la transparence.' : 'Transparence désactivée.'} Les zones transparentes prendront la couleur :
            </WText>
            <View style={styles.chips}>
              {(
                [
                  ['#FFFFFF', 'Blanc'],
                  ['#000000', 'Noir'],
                ] as const
              ).map(([c, l]) => (
                <Chip key={c} label={l} on={settings.matte === c} onPress={() => update({ matte: c })} />
              ))}
            </View>
          </>
        ) : null}
      </Section>

      <Section title="Taille de l’image">
        <NumberInput label="Largeur" value={plan.width} suffix="px" onCommit={setWidth} testID="export-width" />
        <NumberInput label="Hauteur" value={plan.height} suffix="px" onCommit={setHeight} testID="export-height" />
        <NumberInput label="Échelle" value={percent} suffix="%" onCommit={(p) => update({ scale: p / 100 })} testID="export-scale" />
        <View style={styles.chips}>
          {SCALES.map((p) => (
            <Chip key={p} label={`${p} %`} on={Math.abs(percent - p) < 0.05} onPress={() => update({ scale: p / 100 })} />
          ))}
        </View>
        <WText dim style={styles.small}>
          Proportions conservées. Limite de l’appareil : {DOCUMENT_LIMITS.maxDimension} px par côté.
        </WText>
      </Section>

      <Section title="Résolution">
        <NumberInput label="Résolution" value={settings.resolution ?? document.resolution} suffix="ppp" onCommit={(r) => update({ resolution: Math.round(r) })} testID="export-resolution" />
        <WText dim style={styles.small}>
          {settings.format === 'webp'
            ? 'Le WebP ne prévoit pas de champ de résolution : elle n’est pas écrite dans le fichier.'
            : `Écrite dans le fichier : impression à ${formatNumber(fromPixels(plan.width, 'cm', settings.resolution ?? 72))} × ${formatNumber(fromPixels(plan.height, 'cm', settings.resolution ?? 72))} cm.`}
        </WText>
      </Section>

      <Section title="Espace colorimétrique et métadonnées">
        <WText dim style={styles.small}>sRGB (seul espace géré par le moteur). Aucune métadonnée : ni auteur, ni position, ni appareil.</WText>
      </Section>
    </View>
  );

  return (
    <View style={styles.frame}>
      <View style={styles.header}>
        <WText style={styles.title} accessibilityRole="header">
          Exporter sous
        </WText>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={styles.close}>
          <Icon name="close" size={20} color={ws.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={wide ? styles.columns : styles.stack}>
        {previewPane}
        {settingsPane}
      </ScrollView>

      {plan.error || estimate?.error || outcome.ok === false ? (
        <WText style={styles.error} accessibilityRole="alert" testID="export-error">
          {plan.error ?? (outcome.ok === false ? `Export impossible : ${outcome.message}` : `Export impossible : ${estimate?.error}`)}
        </WText>
      ) : null}
      {outcome.ok === true ? (
        <View style={styles.success} accessibilityRole="alert" testID="export-success">
          <Icon name="check-circle-outline" size={20} color="#5BD68A" />
          <View style={styles.flex}>
            <WText>
              Image exportée : {outcome.result.fileName} — {outcome.result.width} × {outcome.result.height} px, {formatBytes(outcome.result.bytes.length)}.
            </WText>
            <WText dim style={styles.small}>
              {outcome.savedAs ? `Emplacement : dossier choisi, fichier « ${outcome.savedAs} ».` : 'Emplacement : celui choisi dans la feuille de partage.'}
            </WText>
          </View>
          {outcome.savedAs && exportTargets.share ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Partager ce fichier" onPress={() => void shareExport(outcome.result)} style={styles.secondary}>
              <WText>Partager…</WText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.footer}>
        {busy ? <ActivityIndicator color={ws.accent} /> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={outcome.ok === true ? 'Terminé' : 'Annuler'} disabled={busy} onPress={onClose} style={styles.secondary}>
          <WText>{outcome.ok === true ? 'Terminé' : 'Annuler'}</WText>
        </Pressable>
        {exportTargets.share ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Partager…" accessibilityState={{ disabled: blocked }} disabled={blocked} onPress={() => void go('share')} style={[styles.secondary, blocked && styles.off]} testID="export-share">
            <WText>Partager…</WText>
          </Pressable>
        ) : null}
        {exportTargets.folder ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Exporter" accessibilityHint="Choisir le dossier où enregistrer l’image" accessibilityState={{ disabled: blocked }} disabled={blocked} onPress={() => void go('folder')} style={[styles.primary, blocked && styles.off]} testID="export-folder">
            <WText style={styles.primaryText}>Exporter</WText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Fenêtre « Exporter sous » : aperçu, format, qualité, transparence, taille, résolution, taille du fichier. */
export function ExportDialog() {
  const openFor = useExportStore((s) => s.openFor);
  const close = useExportStore((s) => s.close);
  const document = useDocumentStore((s) => (openFor ? s.documents[openFor] : undefined));
  return (
    <Modal visible={!!document} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal testID="export-dialog">
          {document ? <Body key={document.id} document={document} onClose={close} /> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 14 },
  dialog: { width: '100%', maxWidth: 980, maxHeight: '94%', borderRadius: 8, backgroundColor: ws.panel, borderWidth: 1, borderColor: ws.border, overflow: 'hidden' },
  frame: { flexShrink: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, backgroundColor: ws.chrome, borderBottomWidth: 1, borderBottomColor: ws.border },
  title: { fontSize: 16, fontWeight: '600' },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  columns: { flexDirection: 'row', gap: 16, padding: 16 },
  stack: { gap: 16, padding: 16 },
  previewPane: { flex: 1, alignItems: 'center', gap: 10, minHeight: 200, justifyContent: 'center', backgroundColor: ws.pasteboard, borderRadius: 6, padding: 12 },
  previewBox: { overflow: 'hidden', backgroundColor: ws.pasteboard },
  summary: { alignItems: 'center', gap: 2 },
  settingsPane: { width: 330, maxWidth: '100%', gap: 14 },
  section: { gap: 8 },
  sectionTitle: { fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 34, minWidth: 48, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  chipOn: { borderColor: ws.accent, backgroundColor: ws.raised },
  chipTextOn: { fontWeight: '600' },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numberLabel: { width: 80 },
  input: { flex: 1, minWidth: 0, height: 38, paddingHorizontal: 10, color: ws.text, fontSize: 14, backgroundColor: ws.input, borderRadius: 4, borderWidth: 1, borderColor: ws.border },
  suffix: { width: 44 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36 },
  small: { fontSize: wsMetrics.smallFontSize },
  error: { color: '#FF7A7A', paddingHorizontal: 16, paddingTop: 8 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 6, backgroundColor: ws.input },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: ws.border, flexWrap: 'wrap' },
  primary: { height: 42, minWidth: 110, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: ws.accent },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },
  secondary: { height: 42, minWidth: 96, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 21, borderWidth: 1, borderColor: ws.textDim },
  off: { opacity: 0.45 },
});
