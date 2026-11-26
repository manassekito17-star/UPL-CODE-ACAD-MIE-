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
