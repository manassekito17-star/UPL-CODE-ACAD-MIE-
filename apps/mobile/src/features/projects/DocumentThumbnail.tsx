import { StyleSheet, View } from 'react-native';

import { BackgroundSwatch } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { colors, radius } from '@/theme';

export interface DocumentThumbnailProps {
  document: Pick<GraphicDocument, 'width' | 'height' | 'background'>;
  /** Côté de la case carrée dans laquelle la vignette est inscrite. */
  size?: number;
}

/**
 * Vignette respectant les proportions du document. Tant que les documents
 * n'ont pas de calques (phase 4), leur contenu se résume à leur fond : la
 * vignette est donc exacte. Le rendu Skia réel la remplacera (phases 3 et 7).
 */
export function DocumentThumbnail({ document, size = 64 }: DocumentThumbnailProps) {
  const scale = size / Math.max(document.width, document.height);
  const width = Math.max(4, Math.round(document.width * scale));
  const height = Math.max(4, Math.round(document.height * scale));
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <BackgroundSwatch background={document.background} style={{ width, height, borderRadius: 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
});
