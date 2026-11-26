import type { GraphicDocument } from '@/engine/documents/types';

import { normalizeRotation } from './geometry';
import type { Layer, TextAlignment } from './types';

/**
 * Opérations sur la pile de calques. Toutes sont PURES : elles renvoient un
 * nouveau document (les calques non touchés sont partagés, jamais copiés) ou
 * lèvent une LayerError explicite. Aucune opération n'agit « au mieux » sur
 * un autre calque que celui demandé.
 *
 * Ces fonctions serviront de base aux commandes réversibles de l'historique
 * (phase 6).
 */

export class LayerError extends Error {
  constructor(
    message: string,
    readonly code: 'not-found' | 'locked' | 'invalid' | 'duplicate-id',
  ) {
    super(message);
    this.name = 'LayerError';
  }
}

export const LAYER_NAME_MAX = 60;
export const MIN_LAYER_SIZE = 1;

type Layers = GraphicDocument['layers'];

function indexOrThrow(layers: Layers, id: string): number {
  const index = layers.findIndex((l) => l.id === id);
  if (index < 0) throw new LayerError('Calque introuvable.', 'not-found');
  return index;
}

function withLayers(doc: GraphicDocument, layers: Layers): GraphicDocument {
  return { ...doc, layers };
}

function replaceAt(layers: Layers, index: number, layer: Layer): Layers {
  const next = layers.slice();
  next[index] = layer;
  return next;
}

export function findLayer(doc: GraphicDocument, id: string): Layer | undefined {
  return doc.layers.find((l) => l.id === id);
}

/** Position d'affichage : 0 = tout en bas. */
export function layerOrder(doc: GraphicDocument, id: string): number {
  return indexOrThrow(doc.layers, id);
}

/** Ajoute un calque juste au-dessus de `aboveId`, ou tout en haut. */
export function addLayer(doc: GraphicDocument, layer: Layer, aboveId?: string | null): GraphicDocument {
  if (doc.layers.some((l) => l.id === layer.id)) {
    throw new LayerError('Un calque porte déjà cet identifiant.', 'duplicate-id');
  }
  const at = aboveId ? indexOrThrow(doc.layers, aboveId) + 1 : doc.layers.length;
  const next = doc.layers.slice();
  next.splice(at, 0, layer);
  return withLayers(doc, next);
}

/** Supprime exactement ce calque. Refusé s'il est verrouillé. */
export function removeLayer(doc: GraphicDocument, id: string): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  if (doc.layers[index]?.locked) {
    throw new LayerError('Calque verrouillé : déverrouillez-le pour le supprimer.', 'locked');
  }
  return withLayers(
    doc,
    doc.layers.filter((_, i) => i !== index),
  );
}

export function normalizeLayerName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

export function renameLayer(doc: GraphicDocument, id: string, rawName: string): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const name = normalizeLayerName(rawName);
  if (name === '') throw new LayerError('Le nom du calque ne peut pas être vide.', 'invalid');
  if (name.length > LAYER_NAME_MAX) {
    throw new LayerError(`Le nom du calque ne doit pas dépasser ${LAYER_NAME_MAX} caractères.`, 'invalid');
  }
  const layer = doc.layers[index] as Layer;
  return withLayers(doc, replaceAt(doc.layers, index, { ...layer, name }));
}

/** « Rectangle » → « Rectangle copie », « Rectangle copie » → « Rectangle copie 2 »… */
export function copyName(name: string, existing: readonly string[]): string {
  const base = name.replace(/ copie( \d+)?$/, '');
  const taken = new Set(existing);
  let candidate = `${base} copie`;
  for (let n = 2; taken.has(candidate); n += 1) candidate = `${base} copie ${n}`;
  return candidate.slice(0, LAYER_NAME_MAX);
}

/** Décalage d'une copie, pour qu'elle ne masque pas exactement l'original. */
export const DUPLICATE_OFFSET = 24;

/** Duplique le calque juste au-dessus de l'original (déverrouillé, légèrement décalé). */
export function duplicateLayer(doc: GraphicDocument, id: string, newId: string): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const source = doc.layers[index] as Layer;
  const copy: Layer = {
    ...source,
    id: newId,
    name: copyName(
      source.name,
      doc.layers.map((l) => l.name),
    ),
    x: source.x + DUPLICATE_OFFSET,
    y: source.y + DUPLICATE_OFFSET,
    locked: false,
  };
  return addLayer(doc, copy, id);
}

export function setLayerVisibility(doc: GraphicDocument, id: string, visible: boolean): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const layer = doc.layers[index] as Layer;
  return layer.visible === visible ? doc : withLayers(doc, replaceAt(doc.layers, index, { ...layer, visible }));
}

export function setLayerLocked(doc: GraphicDocument, id: string, locked: boolean): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const layer = doc.layers[index] as Layer;
  return layer.locked === locked ? doc : withLayers(doc, replaceAt(doc.layers, index, { ...layer, locked }));
}

/** Opacité bornée à [0, 1] ; refusée sur un calque verrouillé (elle modifie le rendu). */
export function setLayerOpacity(doc: GraphicDocument, id: string, opacity: number): GraphicDocument {
  return updateLayerGeometry(doc, id, { opacity });
}

export interface LayerPatch {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
}

/**
 * Modifie position, taille, rotation ou opacité. Refusé sur un calque
 * verrouillé ; les valeurs sont validées (nombres finis) et normalisées.
 */
export function updateLayerGeometry(doc: GraphicDocument, id: string, patch: LayerPatch): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const layer = doc.layers[index] as Layer;
  if (layer.locked) throw new LayerError('Calque verrouillé : déverrouillez-le pour le modifier.', 'locked');
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new LayerError(`Valeur invalide pour « ${key} ».`, 'invalid');
    }
  }
  if ((patch.width !== undefined && patch.width < MIN_LAYER_SIZE) || (patch.height !== undefined && patch.height < MIN_LAYER_SIZE)) {
    throw new LayerError(`La largeur et la hauteur doivent être d'au moins ${MIN_LAYER_SIZE} px.`, 'invalid');
  }
  const next: Layer = {
    ...layer,
    ...patch,
    rotation: normalizeRotation(patch.rotation ?? layer.rotation),
    opacity: Math.min(1, Math.max(0, patch.opacity ?? layer.opacity)),
  };
  return withLayers(doc, replaceAt(doc.layers, index, next));
}

export function translateLayer(doc: GraphicDocument, id: string, dx: number, dy: number): GraphicDocument {
  const layer = doc.layers[indexOrThrow(doc.layers, id)] as Layer;
  return updateLayerGeometry(doc, id, { x: layer.x + dx, y: layer.y + dy });
}

/** Déplace le calque à la position d'affichage `toIndex` (bornée). */
export function moveLayerTo(doc: GraphicDocument, id: string, toIndex: number): GraphicDocument {
  const from = indexOrThrow(doc.layers, id);
  const to = Math.min(doc.layers.length - 1, Math.max(0, Math.trunc(toIndex)));
  if (from === to) return doc;
  const next = doc.layers.slice();
  const [layer] = next.splice(from, 1);
  next.splice(to, 0, layer as Layer);
  return withLayers(doc, next);
}

export const bringForward = (doc: GraphicDocument, id: string) => moveLayerTo(doc, id, layerOrder(doc, id) + 1);
export const sendBackward = (doc: GraphicDocument, id: string) => moveLayerTo(doc, id, layerOrder(doc, id) - 1);
export const bringToFront = (doc: GraphicDocument, id: string) => moveLayerTo(doc, id, doc.layers.length - 1);
export const sendToBack = (doc: GraphicDocument, id: string) => moveLayerTo(doc, id, 0);

export const TEXT_MAX_LENGTH = 2000;
export const MIN_FONT_SIZE = 4;
export const MAX_FONT_SIZE = 1000;
const HEX_COLOR = /^#[0-9A-F]{6}$/i;

/** Normalise une couleur saisie (« 3685ff », « #3685FF ») ou renvoie null si invalide. */
export function normalizeHexColor(raw: string): string | null {
  const value = raw.trim().replace(/^#?/, '#').toUpperCase();
  return HEX_COLOR.test(value) ? value : null;
}

export interface LayerStylePatch {
  /** Remplissage d'une forme ou couleur d'un texte. */
  color?: string;
  text?: string;
  fontSize?: number;
  align?: TextAlignment;
  bold?: boolean;
}

/**
 * Modifie le style d'un calque (couleur, texte, taille, alignement, gras).
 * Refusé sur un calque verrouillé ; chaque champ est validé et ne s'applique
 * qu'aux types de calque qui le possèdent.
 */
export function updateLayerStyle(doc: GraphicDocument, id: string, patch: LayerStylePatch): GraphicDocument {
  const index = indexOrThrow(doc.layers, id);
  const layer = doc.layers[index] as Layer;
  if (layer.locked) throw new LayerError('Calque verrouillé : déverrouillez-le pour le modifier.', 'locked');

  let color: string | undefined;
  if (patch.color !== undefined) {
    const normalized = normalizeHexColor(patch.color);
    if (!normalized) throw new LayerError('Couleur invalide : format attendu #RRVVBB.', 'invalid');
    color = normalized;
  }

  if (layer.type === 'shape') {
    if (patch.text !== undefined || patch.fontSize !== undefined || patch.align !== undefined || patch.bold !== undefined) {
      throw new LayerError('Cette propriété ne concerne que les textes.', 'invalid');
    }
    return color === undefined ? doc : withLayers(doc, replaceAt(doc.layers, index, { ...layer, fill: color }));
  }

  if (layer.type === 'text') {
    if (patch.text !== undefined) {
      if (patch.text.trim() === '') throw new LayerError('Le texte ne peut pas être vide.', 'invalid');
      if (patch.text.length > TEXT_MAX_LENGTH) {
        throw new LayerError(`Le texte ne doit pas dépasser ${TEXT_MAX_LENGTH} caractères.`, 'invalid');
      }
    }
    if (
      patch.fontSize !== undefined &&
      (!Number.isFinite(patch.fontSize) || patch.fontSize < MIN_FONT_SIZE || patch.fontSize > MAX_FONT_SIZE)
    ) {
      throw new LayerError(`La taille du texte doit être comprise entre ${MIN_FONT_SIZE} et ${MAX_FONT_SIZE} px.`, 'invalid');
    }
    return withLayers(
      doc,
      replaceAt(doc.layers, index, {
        ...layer,
        ...(color !== undefined ? { color } : {}),
        ...(patch.text !== undefined ? { text: patch.text } : {}),
        ...(patch.fontSize !== undefined ? { fontSize: patch.fontSize } : {}),
        ...(patch.align !== undefined ? { align: patch.align } : {}),
        ...(patch.bold !== undefined ? { bold: patch.bold } : {}),
      }),
    );
  }

  throw new LayerError("Une image n'a pas de couleur ni de texte à modifier.", 'invalid');
}

export type AlignEdge = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

/**
 * Aligne un calque sur le document, d'après sa boîte englobante visible
 * (rotation comprise), comme le font les logiciels de retouche.
 */
export function alignLayer(doc: GraphicDocument, id: string, edge: AlignEdge): GraphicDocument {
  const layer = doc.layers[indexOrThrow(doc.layers, id)] as Layer;
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  // Demi-dimensions de la boîte englobante du calque tourné.
  const ex = (layer.width / 2) * cos + (layer.height / 2) * sin;
  const ey = (layer.width / 2) * sin + (layer.height / 2) * cos;
  let cx = layer.x + layer.width / 2;
  let cy = layer.y + layer.height / 2;
  if (edge === 'left') cx = ex;
  if (edge === 'center') cx = doc.width / 2;
  if (edge === 'right') cx = doc.width - ex;
  if (edge === 'top') cy = ey;
  if (edge === 'middle') cy = doc.height / 2;
  if (edge === 'bottom') cy = doc.height - ey;
  return updateLayerGeometry(doc, id, { x: Math.round(cx - layer.width / 2), y: Math.round(cy - layer.height / 2) });
}
