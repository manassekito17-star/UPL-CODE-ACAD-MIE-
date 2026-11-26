/**
 * Arbitrage des gestes entre la vue (zoom, déplacement de la zone de travail)
 * et les éléments du document (sélection, déplacement de calques).
 *
 * Règles :
 * 1. Deux doigts ou plus agissent TOUJOURS sur la vue (pincer pour zoomer,
 *    glisser à deux doigts pour déplacer). Un calque ne peut donc jamais être
 *    bougé par erreur en zoomant.
 * 2. Un doigt agit sur la vue avec l'outil « Vue ».
 * 3. Un doigt agit sur les calques avec l'outil « Sélection » (phase 4) :
 *    seulement s'il touche un calque déverrouillé ; sinon il ne fait rien
 *    (pas de déplacement de vue surprise pendant une retouche).
 * 4. Le double tap ajuste la vue avec tous les outils.
 */

export type ToolId = 'select' | 'pan' | 'text' | 'shape' | 'image';

export type GestureTarget = 'view' | 'layer' | 'none';

export interface PointerContext {
  pointers: number;
  tool: ToolId;
  /** Calque sous le doigt et modifiable (déverrouillé), s'il y en a un. */
  hitEditableLayer: boolean;
}

export function resolveGestureTarget({ pointers, tool, hitEditableLayer }: PointerContext): GestureTarget {
  'worklet';
  if (pointers >= 2) return 'view';
  if (tool === 'pan') return 'view';
  if (tool === 'select') return hitEditableLayer ? 'layer' : 'none';
  return 'none';
}

/** Le déplacement à un doigt est-il réservé à la vue pour cet outil ? */
export function oneFingerMovesView(tool: ToolId): boolean {
  'worklet';
  return resolveGestureTarget({ pointers: 1, tool, hitEditableLayer: false }) === 'view';
}
