import type { LayerBase } from './types';

/** Géométrie minimale d'un calque (suffisante pour le rendu et le test d'atteinte). */
export type LayerGeometry = Pick<LayerBase, 'x' | 'y' | 'width' | 'height' | 'rotation'>;

/**
 * Matrice 3 × 3 (ligne par ligne, convention Skia) qui place le contenu du
 * calque — dessiné dans son repère local (0, 0) → (width, height) — dans le
 * document : translation au centre, rotation, retour au coin.
 *
 * Partagée par l'écran (prop `matrix` des groupes Skia) et par le rendu hors
 * écran (`canvas.concat`) : les deux appliquent exactement la même transformation.
 */
export function layerMatrix(g: LayerGeometry, offsetX = 0, offsetY = 0): number[] {
  'worklet';
  const rad = (g.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = g.x + offsetX + g.width / 2;
  const cy = g.y + offsetY + g.height / 2;
  const hw = g.width / 2;
  const hh = g.height / 2;
  // M = T(cx, cy) · R(θ) · T(−w/2, −h/2)
  return [cos, -sin, cx - cos * hw + sin * hh, sin, cos, cy - sin * hw - cos * hh, 0, 0, 1];
}

/** Le point du document (px, py) est-il dans la boîte (tournée) du calque ? */
export function containsPoint(g: LayerGeometry, px: number, py: number): boolean {
  'worklet';
  const rad = (-g.rotation * Math.PI) / 180;
  const dx = px - (g.x + g.width / 2);
  const dy = py - (g.y + g.height / 2);
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return Math.abs(lx) <= g.width / 2 && Math.abs(ly) <= g.height / 2;
}

export interface HitCandidate extends LayerGeometry {
  id: string;
  visible: boolean;
  locked: boolean;
}

/**
 * Calque visible le plus haut sous le point (les calques sont fournis du bas
 * vers le haut, comme dans le document). Les calques masqués sont ignorés ;
 * un calque verrouillé peut être désigné (pour le sélectionner) mais pas déplacé.
 */
export function hitTest(layers: readonly HitCandidate[], px: number, py: number): HitCandidate | null {
  'worklet';
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i];
    if (layer && layer.visible && containsPoint(layer, px, py)) return layer;
  }
  return null;
}

/** Ramène un angle en degrés dans ]-180, 180]. */
export function normalizeRotation(degrees: number): number {
  'worklet';
  const r = ((((degrees + 180) % 360) + 360) % 360) - 180;
  return r === -180 ? 180 : r;
}

/**
 * Comme layerMatrix, pour un contenu dessiné à une autre taille
 * (contentWidth × contentHeight) : il est étiré pour remplir la boîte `g`.
 * Sert à l'aperçu d'un redimensionnement en cours, sans réenregistrer le contenu.
 */
export function layerMatrixForContent(g: LayerGeometry, contentWidth: number, contentHeight: number): number[] {
  'worklet';
  const m = layerMatrix(g);
  const sx = g.width / Math.max(1e-6, contentWidth);
  const sy = g.height / Math.max(1e-6, contentHeight);
  return [
    (m[0] ?? 1) * sx,
    (m[1] ?? 0) * sy,
    m[2] ?? 0,
    (m[3] ?? 0) * sx,
    (m[4] ?? 1) * sy,
    m[5] ?? 0,
    0,
    0,
    1,
  ];
}

// ---------------------------------------------------------------------------
// Poignées de transformation
// ---------------------------------------------------------------------------

export type Corner = 'nw' | 'ne' | 'se' | 'sw';
export type Handle = Corner | 'rotate';

/** Signe de chaque coin dans le repère local centré (x vers la droite, y vers le bas). */
const CORNER_SIGNS: Record<Corner, [number, number]> = { nw: [-1, -1], ne: [1, -1], se: [1, 1], sw: [-1, 1] };

/** Distance (points écran) entre le bord supérieur et la poignée de rotation. */
export const ROTATE_HANDLE_OFFSET = 36;
/** Rayon de prise (points écran) des poignées : au moins la moitié d'une cible tactile. */
export const HANDLE_TOUCH_RADIUS = 24;
/** Taille minimale d'un calque pendant un redimensionnement (px du document). */
export const MIN_RESIZE = 4;
/** La rotation s'aimante aux multiples de 45° à moins de 3°. */
export const ROTATION_SNAP_STEP = 45;
export const ROTATION_SNAP_TOLERANCE = 3;

function rotate(x: number, y: number, degrees: number): [number, number] {
  'worklet';
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [x * c - y * s, x * s + y * c];
}

/** Point du document correspondant à un point local centré (lx, ly) du calque. */
function localToDocument(g: LayerGeometry, lx: number, ly: number): [number, number] {
  'worklet';
  const [rx, ry] = rotate(lx, ly, g.rotation);
  return [g.x + g.width / 2 + rx, g.y + g.height / 2 + ry];
}

/**
 * Positions (repère du document) des quatre coins et de la poignée de
 * rotation, placée à ROTATE_HANDLE_OFFSET points écran au-dessus du bord haut.
 */
export function handlePositions(g: LayerGeometry, viewScale: number): Record<Handle, [number, number]> {
  'worklet';
  const hw = g.width / 2;
  const hh = g.height / 2;
  return {
    nw: localToDocument(g, -hw, -hh),
    ne: localToDocument(g, hw, -hh),
    se: localToDocument(g, hw, hh),
    sw: localToDocument(g, -hw, hh),
    rotate: localToDocument(g, 0, -hh - ROTATE_HANDLE_OFFSET / viewScale),
  };
}

/** Poignée sous le point du document (px, py), ou null. La rotation est prioritaire. */
export function hitHandle(
  g: LayerGeometry,
  px: number,
  py: number,
  viewScale: number,
  touchRadius: number = HANDLE_TOUCH_RADIUS,
): Handle | null {
  'worklet';
  const positions = handlePositions(g, viewScale);
  const r = touchRadius / viewScale;
  const order: Handle[] = ['rotate', 'nw', 'ne', 'se', 'sw'];
  let best: Handle | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const handle of order) {
    const [hx, hy] = positions[handle];
    const d = Math.hypot(px - hx, py - hy);
    if (d <= r && d < bestDistance) {
      best = handle;
      bestDistance = d;
    }
  }
  return best;
}

/**
 * Redimensionne en tirant un coin d'un déplacement (dx, dy) exprimé dans le
 * repère du document. Le coin opposé reste fixe, y compris quand le calque
 * est tourné. `keepAspect` conserve les proportions (images).
 */
export function resizeFromCorner(
  start: LayerGeometry,
  corner: Corner,
  dx: number,
  dy: number,
  keepAspect: boolean,
  minSize: number = MIN_RESIZE,
): LayerGeometry {
  'worklet';
  const [sx, sy] = CORNER_SIGNS[corner];
  // Déplacement exprimé dans le repère local (non tourné) du calque.
  const [ldx, ldy] = rotate(dx, dy, -start.rotation);
  let width = Math.max(minSize, start.width + sx * ldx);
  let height = Math.max(minSize, start.height + sy * ldy);
  if (keepAspect) {
    const ratio = start.width / start.height;
    // On suit l'axe le plus tiré, l'autre s'en déduit.
    if (Math.abs(width / start.width - 1) >= Math.abs(height / start.height - 1)) {
      height = Math.max(minSize, width / ratio);
      width = height * ratio;
    } else {
      width = Math.max(minSize, height * ratio);
      height = width / ratio;
    }
  }
  // Le centre se déplace de la moitié de l'agrandissement, vers le coin tiré.
  const [cdx, cdy] = rotate((sx * (width - start.width)) / 2, (sy * (height - start.height)) / 2, start.rotation);
  const cx = start.x + start.width / 2 + cdx;
  const cy = start.y + start.height / 2 + cdy;
  return { x: cx - width / 2, y: cy - height / 2, width, height, rotation: start.rotation };
}

/**
 * Rotation autour du centre, suivant l'angle balayé par le doigt entre
 * `from` et `to` (repère du document). Aimantée aux multiples de 45°.
 */
export function rotateFromPointer(
  start: LayerGeometry,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  snap: boolean = true,
): LayerGeometry {
  'worklet';
  const cx = start.x + start.width / 2;
  const cy = start.y + start.height / 2;
  const a0 = Math.atan2(fromY - cy, fromX - cx);
  const a1 = Math.atan2(toY - cy, toX - cx);
  let rotation = normalizeRotation(start.rotation + ((a1 - a0) * 180) / Math.PI);
  if (snap) {
    const nearest = Math.round(rotation / ROTATION_SNAP_STEP) * ROTATION_SNAP_STEP;
    if (Math.abs(rotation - nearest) <= ROTATION_SNAP_TOLERANCE) rotation = normalizeRotation(nearest);
  }
  return { x: start.x, y: start.y, width: start.width, height: start.height, rotation };
}
