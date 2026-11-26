import { FilterMode, Skia, TileMode, type SkCanvas, type SkPaint, type SkPicture, type SkShader } from '@shopify/react-native-skia';

import type { DocumentBackground, GraphicDocument } from '@/engine/documents';
import { layerMatrix, type Layer } from '@/engine/layers';

/** Couleurs de fond exactes écrites dans le document (et donc dans l'export). */
export const BACKGROUND_FILL: Record<Exclude<DocumentBackground, 'transparent'>, string> = {
  white: '#FFFFFF',
  black: '#000000',
};

export type DrawableDocument = Pick<GraphicDocument, 'width' | 'height' | 'background'> & {
  layers?: readonly Layer[];
};

/** Fond seul (sans calques). Un fond transparent n'écrit aucun pixel. */
export function drawBackground(canvas: SkCanvas, doc: Pick<GraphicDocument, 'width' | 'height' | 'background'>): void {
  if (doc.background === 'transparent') return;
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(BACKGROUND_FILL[doc.background]));
  canvas.drawRect(Skia.XYWHRect(0, 0, doc.width, doc.height), paint);
}

/** Contenu d'un calque dans son repère local (0, 0) → (width, height), opacité non comprise. */
export function drawLayerContent(canvas: SkCanvas, layer: Layer): void {
  switch (layer.type) {
    case 'shape': {
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      paint.setColor(Skia.Color(layer.fill));
      canvas.drawRect(Skia.XYWHRect(0, 0, layer.width, layer.height), paint);
      return;
    }
  }
}

/** Peinture de composition appliquant l'opacité d'un calque (null si opaque). */
export function opacityPaint(opacity: number): SkPaint | null {
  if (opacity >= 1) return null;
  const paint = Skia.Paint();
  paint.setAlphaf(Math.max(0, opacity));
  return paint;
}

/**
 * Calque complet dans le repère du document : matrice du calque, opacité
 * appliquée au calque entier (composition isolée, comme les logiciels de
 * retouche), puis contenu. Les calques masqués ne sont pas dessinés.
 */
export function drawLayer(canvas: SkCanvas, layer: Layer): void {
  if (!layer.visible || layer.opacity <= 0) return;
  canvas.save();
  canvas.concat(layerMatrix(layer));
  const paint = opacityPaint(layer.opacity);
  if (paint) canvas.saveLayer(paint);
  drawLayerContent(canvas, layer);
  if (paint) canvas.restore();
  canvas.restore();
}

/**
 * Dessine le document complet dans son repère (0, 0) → (width, height) : le
 * fond puis les calques du bas vers le haut.
 *
 * C'est la RÉFÉRENCE du rendu : l'export (phase 8) l'utilise telle quelle et
 * l'écran en reprend les mêmes briques (drawBackground, drawLayerContent,
 * layerMatrix, opacité par composition) pour pouvoir déplacer un calque sans
 * tout réenregistrer. Le damier de transparence n'en fait pas partie.
 */
export function drawDocument(canvas: SkCanvas, doc: DrawableDocument): void {
  drawBackground(canvas, doc);
  for (const layer of doc.layers ?? []) drawLayer(canvas, layer);
}

function record(width: number, height: number, draw: (canvas: SkCanvas) => void): SkPicture {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, Math.max(1, width), Math.max(1, height)));
  draw(canvas);
  return recorder.finishRecordingAsPicture();
}

/**
 * Enregistre le document entier dans une Picture : une liste de commandes
 * rejouée par le GPU sans repasser par JavaScript.
 */
export function recordDocumentPicture(doc: DrawableDocument): SkPicture {
  return record(doc.width, doc.height, (canvas) => drawDocument(canvas, doc));
}

/** Fond seul, en Picture (cache de l'écran). */
export function recordBackgroundPicture(doc: Pick<GraphicDocument, 'width' | 'height' | 'background'>): SkPicture {
  return record(doc.width, doc.height, (canvas) => drawBackground(canvas, doc));
}

/**
 * Contenu d'un calque en Picture, dans son repère local. Recalculée seulement
 * quand le contenu change (pas quand le calque est déplacé ou tourné).
 */
export function recordLayerContentPicture(layer: Layer): SkPicture {
  return record(layer.width, layer.height, (canvas) => drawLayerContent(canvas, layer));
}

/**
 * Motif de damier (deux tons) répété à l'infini, pour signaler les zones
 * transparentes. `cell` : côté d'une case, dans le repère où le motif est peint.
 */
export function createCheckerShader(cell: number, light: string, dark: string): SkShader {
  const size = cell * 2;
  const tile = record(size, size, (canvas) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(dark));
    canvas.drawRect(Skia.XYWHRect(0, 0, size, size), paint);
    paint.setColor(Skia.Color(light));
    canvas.drawRect(Skia.XYWHRect(0, 0, cell, cell), paint);
    canvas.drawRect(Skia.XYWHRect(cell, cell, cell, cell), paint);
  });
  return tile.makeShader(TileMode.Repeat, TileMode.Repeat, FilterMode.Nearest, undefined, Skia.XYWHRect(0, 0, size, size));
}

/**
 * Taille d'une case du damier dans le repère du document : environ 80 cases
 * sur le grand côté, au moins 8 px, pour éviter le moiré quand on dézoome.
 */
export function checkerCellFor(doc: Pick<GraphicDocument, 'width' | 'height'>): number {
  return Math.max(8, Math.round(Math.max(doc.width, doc.height) / 80));
}
