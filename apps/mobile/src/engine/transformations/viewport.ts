/**
 * Géométrie de la vue : passage entre coordonnées du document (pixels du
 * document) et coordonnées de l'écran (points de la zone de travail).
 *
 *   écran = document × scale + (x, y)
 *
 * Toutes les fonctions sont pures et marquées 'worklet' : elles s'exécutent
 * aussi bien dans les tests (thread JS) que dans les gestes (thread UI).
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Transformation de la vue : échelle uniforme puis translation (en points écran). */
export interface ViewTransform {
  scale: number;
  x: number;
  y: number;
}

/** Zones de la vue recouvertes par l'interface (barres flottantes), en points. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export interface ZoomLimits {
  min: number;
  max: number;
}

/** Marge (points) laissée autour du document quand il est ajusté à l'écran. */
export const FIT_PADDING = 24;

/**
 * Part minimale du document qui doit rester visible lors d'un déplacement
 * (points écran), pour ne jamais « perdre » le document hors de la vue.
 */
export const MIN_VISIBLE = 48;

/** Zoom maximal en pixels écran par pixel de document (inspection au pixel près). */
export const MAX_SCREEN_PIXELS_PER_DOC_PIXEL = 32;

export function documentToScreen(t: ViewTransform, p: Point): Point {
  'worklet';
  return { x: p.x * t.scale + t.x, y: p.y * t.scale + t.y };
}

export function screenToDocument(t: ViewTransform, p: Point): Point {
  'worklet';
  return { x: (p.x - t.x) / t.scale, y: (p.y - t.y) / t.scale };
}

/**
 * Échelle et position qui centrent le document entier dans la partie libre
 * de la vue (hors zones recouvertes `insets`), marges `padding` comprises.
 */
export function fitToViewport(
  doc: Size,
  view: Size,
  padding: number = FIT_PADDING,
  insets: Insets = NO_INSETS,
): ViewTransform {
  'worklet';
  const freeW = view.width - insets.left - insets.right;
  const freeH = view.height - insets.top - insets.bottom;
  const availableW = Math.max(1, freeW - padding * 2);
  const availableH = Math.max(1, freeH - padding * 2);
  const scale = Math.min(availableW / doc.width, availableH / doc.height);
  return {
    scale,
    x: insets.left + (freeW - doc.width * scale) / 2,
    y: insets.top + (freeH - doc.height * scale) / 2,
  };
}

/**
 * Bornes du zoom. On peut dézoomer jusqu'au quart de l'ajustement et zoomer
 * jusqu'à 32 pixels écran (physiques) par pixel du document.
 */
export function zoomLimits(fitScale: number, pixelRatio: number): ZoomLimits {
  'worklet';
  const max = Math.max(MAX_SCREEN_PIXELS_PER_DOC_PIXEL / pixelRatio, fitScale * 2);
  return { min: fitScale / 4, max };
}

export function clampScale(scale: number, limits: ZoomLimits): number {
  'worklet';
  return Math.min(limits.max, Math.max(limits.min, scale));
}

/**
 * Zoome d'un facteur autour d'un point de l'écran (centre du pincement ou de
 * la vue) : le point du document situé sous ce point ne bouge pas.
 */
export function zoomAt(t: ViewTransform, factor: number, focal: Point, limits: ZoomLimits): ViewTransform {
  'worklet';
  const scale = clampScale(t.scale * factor, limits);
  const ratio = scale / t.scale;
  return {
    scale,
    x: focal.x - (focal.x - t.x) * ratio,
    y: focal.y - (focal.y - t.y) * ratio,
  };
}

/** Fixe l'échelle exacte en gardant fixe le point de l'écran donné. */
export function zoomTo(t: ViewTransform, scale: number, focal: Point, limits: ZoomLimits): ViewTransform {
  'worklet';
  return zoomAt(t, clampScale(scale, limits) / t.scale, focal, limits);
}

/**
 * Empêche le document de sortir entièrement de la vue : au moins
 * MIN_VISIBLE points (ou tout le document s'il est plus petit) restent visibles.
 */
export function clampPan(t: ViewTransform, doc: Size, view: Size, minVisible: number = MIN_VISIBLE): ViewTransform {
  'worklet';
  const w = doc.width * t.scale;
  const h = doc.height * t.scale;
  const keepX = Math.min(minVisible, w);
  const keepY = Math.min(minVisible, h);
  return {
    scale: t.scale,
    x: Math.min(view.width - keepX, Math.max(keepX - w, t.x)),
    y: Math.min(view.height - keepY, Math.max(keepY - h, t.y)),
  };
}

export function panBy(t: ViewTransform, dx: number, dy: number): ViewTransform {
  'worklet';
  return { scale: t.scale, x: t.x + dx, y: t.y + dy };
}

/**
 * Zoom affiché à l'utilisateur, en pourcentage : 100 % = un pixel du document
 * par pixel physique de l'écran (convention des logiciels de retouche).
 */
export function zoomPercent(scale: number, pixelRatio: number): number {
  'worklet';
  return scale * pixelRatio * 100;
}

/** Échelle (points écran par pixel du document) correspondant à un pourcentage. */
export function scaleForPercent(percent: number, pixelRatio: number): number {
  'worklet';
  return percent / 100 / pixelRatio;
}

/** Vrai si la vue est (à 0,5 % près) dans l'état « ajusté à l'écran ». */
export function isFitted(t: ViewTransform, fit: ViewTransform): boolean {
  'worklet';
  return Math.abs(t.scale / fit.scale - 1) < 0.005 && Math.abs(t.x - fit.x) < 1 && Math.abs(t.y - fit.y) < 1;
}
