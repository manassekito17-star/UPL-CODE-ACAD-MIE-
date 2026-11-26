import type { GraphicDocument } from '@/engine/documents/types';

import type { ImageAsset, ImageLayer, LayerBase, ShapeKind, ShapeLayer, TextLayer } from './types';

/** Couleur des nouvelles formes (accent de l'application). */
export const DEFAULT_SHAPE_FILL = '#3685FF';

type DocInfo = Pick<GraphicDocument, 'width' | 'height' | 'layers' | 'background'>;

const SHAPE_NAMES: Record<ShapeKind, string> = { rectangle: 'Rectangle', ellipse: 'Cercle', line: 'Ligne' };

/** « Rectangle 1 », « Rectangle 2 »… : premier numéro libre. */
export function nextLayerName(doc: Pick<GraphicDocument, 'layers'>, base: string): string {
  const taken = new Set(doc.layers.map((l) => l.name));
  let n = 1;
  while (taken.has(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

function base(doc: DocInfo, id: string, name: string, width: number, height: number): LayerBase {
  return {
    id,
    type: 'shape',
    name,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };
}

/**
 * Nouvelle forme centrée : rectangle et cercle de 40 % du plus petit côté,
 * ligne de 60 % de la largeur et d'épaisseur 2 % du plus petit côté.
 */
export function createShapeLayer(doc: DocInfo, kind: ShapeKind, id: string, fill: string = DEFAULT_SHAPE_FILL): ShapeLayer {
  const minSide = Math.min(doc.width, doc.height);
  const [w, h] =
    kind === 'line'
      ? [Math.max(2, Math.round(doc.width * 0.6)), Math.max(2, Math.round(minSide * 0.02))]
      : [Math.max(1, Math.round(minSide * 0.4)), Math.max(1, Math.round(minSide * 0.4))];
  return { ...base(doc, id, nextLayerName(doc, SHAPE_NAMES[kind]), w, h), type: 'shape', shape: kind, fill };
}

/** Compatibilité : rectangle par défaut. */
export function createRectangleLayer(doc: DocInfo, id: string, fill: string = DEFAULT_SHAPE_FILL): ShapeLayer {
  return createShapeLayer(doc, 'rectangle', id, fill);
}

export const DEFAULT_TEXT = 'Votre texte';

/**
 * Nouveau texte centré : 8 % du plus petit côté (au moins 12 px), boîte de
 * 60 % de la largeur ; couleur contrastée avec le fond.
 */
export function createTextLayer(doc: DocInfo, id: string): TextLayer {
  const fontSize = Math.max(12, Math.round(Math.min(doc.width, doc.height) * 0.08));
  const width = Math.max(fontSize * 2, Math.round(doc.width * 0.6));
  const height = Math.round(fontSize * 1.25);
  return {
    ...base(doc, id, nextLayerName(doc, 'Texte'), width, height),
    type: 'text',
    text: DEFAULT_TEXT,
    fontSize,
    color: doc.background === 'black' ? '#FFFFFF' : '#101114',
    align: 'center',
    bold: true,
    fontFamily: 'Inter',
  };
}

/**
 * Calque image centré, à sa taille réelle si elle tient dans 80 % du
 * document, sinon réduit en gardant ses proportions.
 */
export function createImageLayer(doc: DocInfo, asset: ImageAsset, id: string): ImageLayer {
  const scale = Math.min(1, (doc.width * 0.8) / asset.width, (doc.height * 0.8) / asset.height);
  const width = Math.max(1, Math.round(asset.width * scale));
  const height = Math.max(1, Math.round(asset.height * scale));
  return { ...base(doc, id, nextLayerName(doc, 'Image'), width, height), type: 'image', asset };
}
