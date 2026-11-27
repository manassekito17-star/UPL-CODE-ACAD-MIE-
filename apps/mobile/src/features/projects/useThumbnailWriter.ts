import { useEffect } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import { exportDocument, missingResources } from '@/engine/renderer';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { thumbnailFiles } from '@/services/projects';

import { useThumbnailStore } from './thumbnailStore';

/** Côté le plus long d'une miniature, en pixels. */
export const THUMBNAIL_SIZE = 256;
const DELAY_MS = 1500;

/**
 * Met à jour la miniature du document après chaque modification (avec un
 * délai, pour ne pas rendre pendant une suite de gestes). Même rendu que
 * l'export ; rien n'est écrit tant qu'un calque n'est pas prêt.
 */
export function useThumbnailWriter(document: GraphicDocument): void {
  const resources = useRenderResources();
  const bump = useThumbnailStore((s) => s.bump);
  useEffect(() => {
    if (missingResources(document, resources).length > 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      try {
        const scale = Math.min(1, THUMBNAIL_SIZE / Math.max(document.width, document.height));
        const { bytes } = exportDocument(document, { format: 'png', scale, quality: 100, matte: '#FFFFFF' }, resources);
        void thumbnailFiles.write(document.id, bytes).then(() => {
          if (!cancelled) bump(document.id);
        });
      } catch {
        // Une miniature ratée n'empêche rien : la vignette simple reste affichée.
      }
    }, DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [document, resources, bump]);
}
