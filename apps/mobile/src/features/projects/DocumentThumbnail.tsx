import { Image, StyleSheet, View } from 'react-native';

import { BackgroundSwatch } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { thumbnailFiles } from '@/services/projects';
import { colors, radius } from '@/theme';

import { useThumbnailStore } from './thumbnailStore';

export interface DocumentThumbnailProps {
  /** Sans identifiant (aperçu d'un document pas encore créé) : vignette du fond seulement. */
  document: Pick<GraphicDocument, 'width' | 'height' | 'background'> & { backgroundColor?: string } & { id?: string };
  /** Côté de la case carrée dans laquelle la vignette est inscrite. */
  size?: number;
}

/**
 * Miniature du projet : l'image rendue par l'éditeur (même rendu que
 * l'export) ; à défaut, une vignette du fond aux proportions du document.
 */
export function DocumentThumbnail({ document, size = 64 }: DocumentThumbnailProps) {
  const version = useThumbnailStore((s) => (document.id ? (s.versions[document.id] ?? 0) : 0));
  const scale = size / Math.max(document.width, document.height);
  const width = Math.max(4, Math.round(document.width * scale));
  const height = Math.max(4, Math.round(document.height * scale));
  const uri = document.id ? thumbnailFiles.uri(document.id) : null;
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <BackgroundSwatch background={document.background} style={{ width, height, borderRadius: 2 }} />
      {uri ? (
        <Image
          source={{ uri: uri.startsWith('data:') ? uri : `${uri}?v=${version}` }}
          style={[styles.image, { width, height }]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          testID="project-thumbnail-image"
        />
      ) : null}
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
  image: { position: 'absolute', borderRadius: 2 },
});
