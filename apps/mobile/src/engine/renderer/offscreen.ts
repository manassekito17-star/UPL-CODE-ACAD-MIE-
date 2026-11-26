import { Skia, type SkImage } from '@shopify/react-native-skia';

import { DOCUMENT_LIMITS } from '@/engine/documents';

import { NO_RESOURCES, drawDocument, type DrawableDocument, type RenderResources } from './drawDocument';

export interface OffscreenOptions {
  /** Facteur appliqué aux dimensions du document (1 = taille réelle). */
  scale?: number;
  /** Police et images décodées (les mêmes qu'à l'écran). */
  resources?: RenderResources;
}

/**
 * Rend le document sur une surface hors écran (CPU) et renvoie l'image.
 * Base de l'export PNG (phase 8) et des vignettes (phase 7).
 *
 * Lève une erreur si l'image dépasse le budget mémoire des documents : on ne
 * tente jamais une allocation que la validation aurait refusée.
 */
export function renderDocumentToImage(
  doc: DrawableDocument,
  { scale = 1, resources = NO_RESOURCES }: OffscreenOptions = {},
): SkImage {
  const width = Math.max(1, Math.round(doc.width * scale));
  const height = Math.max(1, Math.round(doc.height * scale));
  if (width * height > DOCUMENT_LIMITS.maxPixels) {
    throw new Error(`Rendu refusé : ${width} × ${height} px dépasse la limite mémoire.`);
  }
  const surface = Skia.Surface.Make(width, height);
  if (!surface) {
    throw new Error(`Impossible de créer une surface de ${width} × ${height} px.`);
  }
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));
  canvas.save();
  canvas.scale(width / doc.width, height / doc.height);
  drawDocument(canvas, doc, resources);
  canvas.restore();
  surface.flush();
  const image = surface.makeImageSnapshot();
  // Libère tout de suite la mémoire de la surface (non suivie par le ramasse-miettes JS).
  surface.dispose();
  return image;
}
