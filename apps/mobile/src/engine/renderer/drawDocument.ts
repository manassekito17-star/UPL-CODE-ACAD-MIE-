import {
  FilterMode,
  MipmapMode,
  Skia,
  TextAlign,
  TileMode,
  type SkCanvas,
  type SkImage,
  type SkPaint,
  type SkPicture,
  type SkShader,
  type SkTypefaceFontProvider,
} from '@shopify/react-native-skia';

import type { DocumentBackground, GraphicDocument } from '@/engine/documents';
import { layerMatrix, type ImageLayer, type Layer, type ShapeLayer, type TextLayer } from '@/engine/layers';

/** Couleurs de fond exactes écrites dans le document (et donc dans l'export). */
export const BACKGROUND_FILL: Record<Exclude<DocumentBackground, 'transparent' | 'color'>, string> = {
  white: '#FFFFFF',
  black: '#000000',
};

export type DrawableDocument = Pick<GraphicDocument, 'width' | 'height' | 'background'> & { backgroundColor?: string } & {
  layers?: readonly Layer[];
};

/**
 * Ressources nécessaires au rendu, fournies explicitement (jamais globales)
 * pour que l'écran et l'export utilisent exactement les mêmes :
 * - la police embarquée des textes ;
 * - les images décodées, indexées par l'URI de leur copie de travail.
 * Une ressource absente (police ou image encore en chargement) n'est pas
 * dessinée : l'export (M4) vérifie qu'elles sont toutes prêtes (missingResources).
 */
export interface RenderResources {
  fonts: SkTypefaceFontProvider | null;
  images: ReadonlyMap<string, SkImage>;
}

export const NO_RESOURCES: RenderResources = { fonts: null, images: new Map() };

/** Familles de police déclarées dans le fournisseur de polices. */
export const TEXT_FONT_FAMILY = 'Inter';

const TEXT_ALIGN: Record<TextLayer['align'], TextAlign> = {
  left: TextAlign.Left,
  center: TextAlign.Center,
  right: TextAlign.Right,
};

/** Paragraphe Skia mis en page dans la largeur du calque (null sans police). */
export function layoutText(layer: Pick<TextLayer, 'text' | 'fontSize' | 'color' | 'align' | 'bold' | 'width'>, fonts: SkTypefaceFontProvider | null) {
  if (!fonts) return null;
  const paragraph = Skia.ParagraphBuilder.Make({ textAlign: TEXT_ALIGN[layer.align] }, fonts)
    .pushStyle({
      color: Skia.Color(layer.color),
      fontFamilies: [TEXT_FONT_FAMILY],
      fontSize: layer.fontSize,
      fontStyle: { weight: layer.bold ? 700 : 400 },
    })
    .addText(layer.text)
    .pop()
    .build();
  paragraph.layout(layer.width);
  return paragraph;
}

/** Hauteur occupée par le texte dans la largeur du calque (null sans police). */
export function measureTextHeight(
  layer: Pick<TextLayer, 'text' | 'fontSize' | 'color' | 'align' | 'bold' | 'width'>,
  fonts: SkTypefaceFontProvider | null,
): number | null {
  const paragraph = layoutText(layer, fonts);
  return paragraph ? paragraph.getHeight() : null;
}

function drawShape(canvas: SkCanvas, layer: ShapeLayer): void {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(layer.fill));
  const rect = Skia.XYWHRect(0, 0, layer.width, layer.height);
  switch (layer.shape) {
    case 'rectangle':
      canvas.drawRect(rect, paint);
      return;
    case 'ellipse':
      canvas.drawOval(rect, paint);
      return;
    case 'line': {
      const radius = layer.height / 2;
      canvas.drawRRect(Skia.RRectXY(rect, radius, radius), paint);
      return;
    }
  }
}

function drawText(canvas: SkCanvas, layer: TextLayer, resources: RenderResources): void {
  layoutText(layer, resources.fonts)?.paint(canvas, 0, 0);
}

function drawImage(canvas: SkCanvas, layer: ImageLayer, resources: RenderResources): void {
  const image = resources.images.get(layer.asset.uri);
  if (!image) return;
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  canvas.drawImageRectOptions(
    image,
    Skia.XYWHRect(0, 0, image.width(), image.height()),
    Skia.XYWHRect(0, 0, layer.width, layer.height),
    FilterMode.Linear,
    // Réduction de qualité quand une photo est affichée en petit.
    MipmapMode.Linear,
    paint,
  );
}

/** Fond seul (sans calques). Un fond transparent n'écrit aucun pixel. */
export function drawBackground(canvas: SkCanvas, doc: Pick<GraphicDocument, 'width' | 'height' | 'background'> & { backgroundColor?: string }): void {
  if (doc.background === 'transparent') return;
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(doc.background === 'color' ? (doc.backgroundColor ?? '#FFFFFF') : BACKGROUND_FILL[doc.background]));
  canvas.drawRect(Skia.XYWHRect(0, 0, doc.width, doc.height), paint);
}

/** Contenu d'un calque dans son repère local (0, 0) → (width, height), opacité non comprise. */
export function drawLayerContent(canvas: SkCanvas, layer: Layer, resources: RenderResources = NO_RESOURCES): void {
  switch (layer.type) {
    case 'shape':
      drawShape(canvas, layer);
      return;
    case 'text':
      drawText(canvas, layer, resources);
      return;
    case 'image':
      drawImage(canvas, layer, resources);
      return;
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
export function drawLayer(canvas: SkCanvas, layer: Layer, resources: RenderResources = NO_RESOURCES): void {
  if (!layer.visible || layer.opacity <= 0) return;
  canvas.save();
  canvas.concat(layerMatrix(layer));
  const paint = opacityPaint(layer.opacity);
  if (paint) canvas.saveLayer(paint);
  drawLayerContent(canvas, layer, resources);
  if (paint) canvas.restore();
  canvas.restore();
}

/**
 * Dessine le document complet dans son repère (0, 0) → (width, height) : le
 * fond puis les calques du bas vers le haut.
 *
 * C'est la RÉFÉRENCE du rendu : l'export (M4) l'utilise telle quelle et
 * l'écran en reprend les mêmes briques (drawBackground, drawLayerContent,
 * layerMatrix, opacité par composition) pour pouvoir déplacer un calque sans
 * tout réenregistrer. Le damier de transparence n'en fait pas partie.
 */
export function drawDocument(canvas: SkCanvas, doc: DrawableDocument, resources: RenderResources = NO_RESOURCES): void {
  drawBackground(canvas, doc);
  for (const layer of doc.layers ?? []) drawLayer(canvas, layer, resources);
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
export function recordDocumentPicture(doc: DrawableDocument, resources: RenderResources = NO_RESOURCES): SkPicture {
  return record(doc.width, doc.height, (canvas) => drawDocument(canvas, doc, resources));
}

/** Fond seul, en Picture (cache de l'écran). */
export function recordBackgroundPicture(doc: Pick<GraphicDocument, 'width' | 'height' | 'background'> & { backgroundColor?: string }): SkPicture {
  return record(doc.width, doc.height, (canvas) => drawBackground(canvas, doc));
}

/**
 * Contenu d'un calque en Picture, dans son repère local. Recalculée seulement
 * quand le contenu change (pas quand le calque est déplacé ou tourné).
 */
export function recordLayerContentPicture(layer: Layer, resources: RenderResources = NO_RESOURCES): SkPicture {
  return record(layer.width, layer.height, (canvas) => drawLayerContent(canvas, layer, resources));
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
