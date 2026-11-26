import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import {
  AppText,
  BackgroundSwatch,
  Button,
  Chip,
  Icon,
  Panel,
  Screen,
  SegmentedControl,
  TextField,
  type SegmentOption,
} from '@/components/ui';
import {
  DOCUMENT_LIMITS,
  FIXED_PRESETS,
  estimateLayerBytes,
  formatBytes,
  orientationOf,
  screenPreset,
  validateDocumentInput,
  withOrientation,
  type DocumentBackground,
  type DocumentPreset,
  type Orientation,
} from '@/engine/documents';
import { DocumentThumbnail } from '@/features/projects/DocumentThumbnail';
import { BACKGROUND_LABELS, ORIENTATION_LABELS, formatDimensions } from '@/features/projects/labels';
import { useDocumentStore } from '@/stores/documentStore';
import { colors, spacing } from '@/theme';

const INTEGER = /^\d+$/;

function parseIfInteger(text: string): number | null {
  const trimmed = text.trim();
  return INTEGER.test(trimmed) ? Number.parseInt(trimmed, 10) : null;
}

const swatchStyle = { width: 20, height: 20, borderRadius: 4 } as const;

const BACKGROUND_OPTIONS: readonly SegmentOption<DocumentBackground>[] = (
  ['white', 'black', 'transparent'] as const
).map((value) => ({
  value,
  label: BACKGROUND_LABELS[value],
  leading: <BackgroundSwatch background={value} style={swatchStyle} />,
}));

const ORIENTATION_OPTIONS: readonly SegmentOption<Orientation>[] = [
  { value: 'portrait', label: ORIENTATION_LABELS.portrait, icon: 'crop-portrait' },
  { value: 'landscape', label: ORIENTATION_LABELS.landscape, icon: 'crop-landscape' },
];

export function NewDocumentScreen() {
  const createDocument = useDocumentStore((s) => s.createDocument);
  const window = useWindowDimensions();

  // « Résolution adaptée à l'écran » : format par défaut calculé une fois.
  const [devicePreset] = useState(() => screenPreset(window.width, window.height, window.scale));
  const presets: readonly DocumentPreset[] = useMemo(() => [devicePreset, ...FIXED_PRESETS], [devicePreset]);

  const [width, setWidth] = useState(String(devicePreset.width));
  const [height, setHeight] = useState(String(devicePreset.height));
  const [background, setBackground] = useState<DocumentBackground>('white');
  const [name, setName] = useState('');
  // Orientation retenue quand les champs ne contiennent pas des nombres valides.
  const [fallbackOrientation, setFallbackOrientation] = useState<Orientation>('portrait');

  const w = parseIfInteger(width);
  const h = parseIfInteger(height);
  const orientation = w !== null && h !== null ? orientationOf(w, h) : fallbackOrientation;
  const selectedPresetId =
    w !== null && h !== null
      ? presets.find((p) => (p.width === w && p.height === h) || (p.width === h && p.height === w))?.id
      : undefined;

  const validation = validateDocumentInput({ width, height, background, name });
  const fieldError = (field: 'width' | 'height' | 'size') =>
    validation.ok ? undefined : validation.errors.find((e) => e.field === field)?.message;

  const applyDimensions = (nextW: number, nextH: number) => {
    setWidth(String(nextW));
    setHeight(String(nextH));
  };

  // Un format s'applique tel qu'affiché sur sa puce ; l'orientation peut
  // ensuite être inversée (le format reste alors reconnu).
  const selectPreset = (preset: DocumentPreset) => applyDimensions(preset.width, preset.height);

  const changeOrientation = (next: Orientation) => {
    setFallbackOrientation(next);
    if (w !== null && h !== null) {
      const oriented = withOrientation(w, h, next);
      applyDimensions(oriented.width, oriented.height);
    }
  };

  const submit = () => {
    if (!validation.ok) return;
    const doc = createDocument(validation.spec);
    // `replace` : le retour depuis l'éditeur ramène à l'accueil, pas au formulaire.
    router.replace({ pathname: '/editor/[projectId]', params: { projectId: doc.id } });
  };

  const sizeError = fieldError('size');
  const memory = w !== null && h !== null ? formatBytes(estimateLayerBytes(w, h)) : null;

  return (
    <Screen testID="new-document-screen">
      <Panel title="Format">
        <View style={styles.chips}>
          {presets.map((preset) => (
            <Chip
              key={preset.id}
              testID={`preset-${preset.id}`}
              label={preset.label}
              detail={formatDimensions(preset.width, preset.height)}
              selected={preset.id === selectedPresetId}
              onPress={() => selectPreset(preset)}
            />
          ))}
        </View>

        <View style={styles.dimensions}>
          <TextField
            label="Largeur"
            suffix="px"
            value={width}
            onChangeText={setWidth}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={5}
            error={fieldError('width')}
            testID="input-width"
          />
          <TextField
            label="Hauteur"
            suffix="px"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={5}
            error={fieldError('height')}
            testID="input-height"
          />
        </View>

        <SegmentedControl label="Orientation" options={ORIENTATION_OPTIONS} value={orientation} onChange={changeOrientation} />
      </Panel>

      <Panel title="Arrière-plan">
        <SegmentedControl
          label="Fond du document"
          layout="stacked"
          options={BACKGROUND_OPTIONS}
          value={background}
          onChange={setBackground}
        />
      </Panel>

      <Panel title="Nom">
        <TextField
          label="Nom du projet (facultatif)"
          placeholder="Sans titre"
          value={name}
          onChangeText={setName}
          maxLength={DOCUMENT_LIMITS.maxNameLength}
          autoCapitalize="sentences"
          returnKeyType="done"
          testID="input-name"
        />
      </Panel>

      <Panel title="Aperçu">
        <View style={styles.preview}>
          <DocumentThumbnail document={{ width: w ?? 1, height: h ?? 1, background }} size={112} />
          <View style={styles.previewInfo}>
            <AppText variant="subtitle" testID="summary-dimensions">
              {w !== null && h !== null ? formatDimensions(w, h) : 'Dimensions à corriger'}
            </AppText>
            <AppText tone="secondary">
              {ORIENTATION_LABELS[orientation]} · Fond {BACKGROUND_LABELS[background].toLowerCase()}
            </AppText>
            {memory ? (
              <AppText variant="caption" tone="secondary">
                Mémoire par calque : {memory}
              </AppText>
            ) : null}
          </View>
        </View>
        {sizeError ? (
          <View style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Icon name="alert-circle-outline" size={18} color={colors.danger} />
            <AppText variant="caption" tone="danger" style={styles.messageText}>
              {sizeError}
            </AppText>
          </View>
        ) : null}
        {validation.warnings.map((warning) => (
          <View key={warning} style={styles.message} accessibilityLiveRegion="polite">
            <Icon name="information-outline" size={18} color={colors.warning} />
            <AppText variant="caption" tone="secondary" style={styles.messageText}>
              {warning}
            </AppText>
          </View>
        ))}
      </Panel>

      <Button
        label="Créer le document"
        disabled={!validation.ok}
        hint={validation.ok ? undefined : 'Corrigez les champs signalés'}
        onPress={submit}
      />
    </Screen>
  );
}


const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dimensions: { flexDirection: 'row', gap: spacing.md },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  previewInfo: { flex: 1, gap: spacing.xs },
  message: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  messageText: { flex: 1 },
});
