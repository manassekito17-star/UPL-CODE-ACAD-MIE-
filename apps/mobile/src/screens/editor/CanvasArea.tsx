import { StyleSheet, View } from 'react-native';

import { PlannedFeature } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { formatDimensions } from '@/features/projects/labels';
import { colors, spacing } from '@/theme';

export interface CanvasAreaProps {
  document: GraphicDocument;
}

/** Zone centrale de travail. Le canvas Skia y sera monté en phase 3. */
export function CanvasArea({ document }: CanvasAreaProps) {
  return (
    <View style={styles.area} testID="canvas-area" accessibilityLabel="Zone de travail">
      <View style={styles.notice}>
        <PlannedFeature
          phase={3}
          title="Canvas Skia"
          description={`Le document (${formatDimensions(document.width, document.height)}) s’affichera ici, rendu par le GPU, avec zoom, déplacement de la vue et ajustement à l’écran.`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  notice: { width: '100%', maxWidth: 420 },
});
