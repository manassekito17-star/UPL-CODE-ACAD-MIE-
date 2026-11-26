import { FilterMode, Skia, TileMode, type SkCanvas, type SkPicture, type SkShader } from '@shopify/react-native-skia';

import type { DocumentBackground, GraphicDocument } from '@/engine/documents';

/** Couleurs de fond exactes écrites dans le document (et donc dans l'export). */
export const BACKGROUND_FILL: Record<Exclude<DocumentBackground, 'transparent'>, string> = {
  white: '#FFFFFF',
  black: '#000000',
};

export type DrawableDocument = Pick<GraphicDocument, 'width' | 'height' | 'background'>;

/**
 * Dessine le contenu du document dans son propre repère (0, 0) → (width, height).
 *
 * C'est l'UNIQUE code de dessin du document : l'écran l'enregistre dans une
 * Picture rejouée par le GPU, l'export (phase 8) le rejoue sur une surface
 * hors écran. L'image exportée correspond donc par construction à l'affichage.
 *
 * Un fond transparent n'écrit aucun pixel : le damier de transparence est un
 * repère d'affichage, ajouté par la vue et jamais exporté.
 */
export function drawDocument(canvas: SkCanvas, doc: DrawableDocument): void {
  if (doc.background !== 'transparent') {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(BACKGROUND_FILL[doc.background]));
    canvas.drawRect(Skia.XYWHRect(0, 0, doc.width, doc.height), paint);
  }
  // Phase 4 : les calques seront dessinés ici, du bas vers le haut de la pile.
}

/**
 * Enregistre le dessin du document dans une Picture : une liste de commandes
 * rejouée à chaque image par le GPU sans repasser par JavaScript. Elle n'est
 * recalculée que lorsque le document change (cache du rendu).
 */
export function recordDocumentPicture(doc: DrawableDocument): SkPicture {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, doc.width, doc.height));
  drawDocument(canvas, doc);
  return recorder.finishRecordingAsPicture();
}

/**
 * Motif de damier (deux tons) répété à l'infini, pour signaler les zones
 * transparentes. `cell` : côté d'une case, dans le repère où le motif est peint.
 */
export function createCheckerShader(cell: number, light: string, dark: string): SkShader {
  const size = cell * 2;
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(dark));
  canvas.drawRect(Skia.XYWHRect(0, 0, size, size), paint);
  paint.setColor(Skia.Color(light));
  canvas.drawRect(Skia.XYWHRect(0, 0, cell, cell), paint);
  canvas.drawRect(Skia.XYWHRect(cell, cell, cell, cell), paint);
  const tile = recorder.finishRecordingAsPicture();
  return tile.makeShader(TileMode.Repeat, TileMode.Repeat, FilterMode.Nearest, undefined, Skia.XYWHRect(0, 0, size, size));
}

/**
 * Taille d'une case du damier dans le repère du document : environ 80 cases
 * sur le grand côté, au moins 8 px, pour éviter le moiré quand on dézoome.
 */
export function checkerCellFor(doc: Pick<GraphicDocument, 'width' | 'height'>): number {
  return Math.max(8, Math.round(Math.max(doc.width, doc.height) / 80));
}
