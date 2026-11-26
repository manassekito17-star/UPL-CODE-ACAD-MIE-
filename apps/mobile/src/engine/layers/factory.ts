import type { GraphicDocument } from '@/engine/documents/types';

import type { ShapeLayer } from './types';

/** Couleur des nouveaux rectangles (accent de l'application). */
export const DEFAULT_SHAPE_FILL = '#3685FF';

/** « Rectangle 1 », « Rectangle 2 »… : premier numéro libre. */
export function nextLayerName(doc: Pick<GraphicDocument, 'layers'>, base: string): string {
  const taken = new Set(doc.layers.map((l) => l.name));
  let n = 1;
  while (taken.has(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

/** Nouveau rectangle centré, de 40 % du plus petit côté du document. */
export function createRectangleLayer(
  doc: Pick<GraphicDocument, 'width' | 'height' | 'layers'>,
  id: string,
  fill: string = DEFAULT_SHAPE_FILL,
): ShapeLayer {
  const side = Math.max(1, Math.round(Math.min(doc.width, doc.height) * 0.4));
  return {
    id,
    type: 'shape',
    shape: 'rectangle',
    name: nextLayerName(doc, 'Rectangle'),
    x: Math.round((doc.width - side) / 2),
    y: Math.round((doc.height - side) / 2),
    width: side,
    height: side,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill,
  };
}
