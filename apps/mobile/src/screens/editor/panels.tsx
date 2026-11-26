import { StyleSheet, View } from 'react-native';

import { AppText, BackgroundSwatch, PlannedFeature } from '@/components/ui';
import { estimateLayerBytes, formatBytes, orientationOf, type GraphicDocument } from '@/engine/documents';
import { BACKGROUND_LABELS, ORIENTATION_LABELS, formatDimensions } from '@/features/projects/labels';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/date';

interface PanelContentProps {
  document: GraphicDocument;
}

/** Contenu du panneau Calques. Le fond est affiché en bas de pile, non déplaçable. */
export function LayersPanelContent({ document }: PanelContentProps) {
  return (
    <View style={styles.stack} testID="layers-panel-content">
      <PlannedFeature
        phase={4}
        title="Pile de calques"
        description="Ajout, sélection, renommage, duplication, visibilité, opacité, ordre et suppression confirmée."
      />
      <View
        style={styles.backgroundRow}
        accessible
        accessibilityLabel={`Fond du document : ${BACKGROUND_LABELS[document.background]}`}
      >
        <BackgroundSwatch background={document.background} style={styles.swatch} />
        <View style={styles.rowText}>
          <AppText variant="label">Fond du document</AppText>
          <AppText variant="caption" tone="secondary">
            {BACKGROUND_LABELS[document.background]}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function Property({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.property} accessible accessibilityLabel={`${label} : ${value}`}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="label" style={styles.propertyValue}>
        {value}
      </AppText>
    </View>
  );
}

/** Contenu du panneau Propriétés : document (réel) puis calque sélectionné (phase 4). */
export function PropertiesPanelContent({ document }: PanelContentProps) {
  return (
    <View style={styles.stack} testID="properties-panel-content">
      <View style={styles.group}>
        <AppText variant="caption" tone="accent">
          DOCUMENT
        </AppText>
        <Property label="Dimensions" value={formatDimensions(document.width, document.height)} />
        <Property label="Orientation" value={ORIENTATION_LABELS[orientationOf(document.width, document.height)]} />
        <Property label="Fond" value={BACKGROUND_LABELS[document.background]} />
        <Property label="Mémoire par calque" value={formatBytes(estimateLayerBytes(document.width, document.height))} />
        <Property label="Créé le" value={formatDateTime(document.createdAt)} />
      </View>
      <PlannedFeature
        phase={4}
        title="Propriétés du calque"
        description="Position, taille, rotation, opacité et verrouillage du calque sélectionné."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  backgroundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  swatch: { width: 36, height: 36, borderRadius: radius.sm },
  rowText: { flex: 1 },
  group: { gap: spacing.sm },
  property: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  propertyValue: { flexShrink: 1, textAlign: 'right' },
});
