import type { LayerGeometry } from '@/engine/layers/geometry';

/**
 * Repères, grille et magnétisme.
 *
 * - Un repère est une ligne horizontale ou verticale du document, à une
 *   position en pixels du document. Les repères sont enregistrés avec le
 *   document (format 3) et leurs changements entrent dans l'historique.
 * - La grille est un réglage d'affichage (pas une donnée du document).
 * - Le magnétisme aligne les bords et le centre d'un calque déplacé sur les
 *   repères, les bords et le centre du document et, si elle est affichée, la
 *   grille.
 *
 * Les fonctions de calcul sont des worklets : elles tournent aussi sur le
 * thread UI pendant un geste.
 */

export type GuideOrientation = 'horizontal' | 'vertical';

export interface Guide {
  id: string;
  /** Horizontal : ligne y = position. Vertical : ligne x = position. */
  orientation: GuideOrientation;
  /** En pixels du document ; peut sortir du document (table de travail). */
  position: number;
}

/** Nombre maximal de repères par document. */
export const MAX_GUIDES = 200;
/** Position acceptée d'un repère, en pixels du document (au-delà : illisible). */
export const GUIDE_POSITION_LIMIT = 100_000;

export interface GridSettings {
  /** Pas des lignes principales, en pixels du document. */
  spacing: number;
  /** Nombre de subdivisions entre deux lignes principales (1 = aucune). */
  subdivisions: number;
}

export const DEFAULT_GRID: GridSettings = { spacing: 100, subdivisions: 4 };
export const GRID_LIMITS = { minSpacing: 2, maxSpacing: 10_000, maxSubdivisions: 20 } as const;

/** Distance d'attraction du magnétisme et de saisie d'un repère, en points écran. */
export const SNAP_DISTANCE = 8;
export const GUIDE_HIT_DISTANCE = 8;

// ---------------------------------------------------------------------------
// Opérations sur le document (pures)
// ---------------------------------------------------------------------------

interface WithGuides {
  guides: readonly Guide[];
}

/** Valide une position saisie ; renvoie un message ou null. */
export function validateGuidePosition(position: number): string | null {
  if (!Number.isFinite(position)) return 'Saisissez un nombre.';
  if (Math.abs(position) > GUIDE_POSITION_LIMIT) return `La position doit rester entre −${GUIDE_POSITION_LIMIT} et ${GUIDE_POSITION_LIMIT} px.`;
  return null;
}

/** Ajoute un repère (position arrondie au pixel). Sans effet au-delà de MAX_GUIDES. */
export function addGuide<D extends WithGuides>(doc: D, guide: Guide): D {
  if (doc.guides.length >= MAX_GUIDES || validateGuidePosition(guide.position) !== null) return doc;
  return { ...doc, guides: [...doc.guides, { ...guide, position: Math.round(guide.position) }] };
}

export function moveGuide<D extends WithGuides>(doc: D, id: string, position: number): D {
  const rounded = Math.round(position);
  const guide = doc.guides.find((g) => g.id === id);
  if (!guide || guide.position === rounded || validateGuidePosition(rounded) !== null) return doc;
  return { ...doc, guides: doc.guides.map((g) => (g.id === id ? { ...g, position: rounded } : g)) };
}

export function removeGuide<D extends WithGuides>(doc: D, id: string): D {
  if (!doc.guides.some((g) => g.id === id)) return doc;
  return { ...doc, guides: doc.guides.filter((g) => g.id !== id) };
}

export function clearGuides<D extends WithGuides>(doc: D): D {
  return doc.guides.length === 0 ? doc : { ...doc, guides: [] };
}

/**
 * Un repère relâché hors du document est retiré (comme lorsqu'on le
 * ramène sur la règle). La marge laisse le placer exactement sur un bord.
 */
export function isGuideDroppedOutside(orientation: GuideOrientation, position: number, doc: { width: number; height: number }): boolean {
  'worklet';
  const extent = orientation === 'horizontal' ? doc.height : doc.width;
  return position < 0 || position > extent;
}

// ---------------------------------------------------------------------------
// Atteinte et magnétisme (worklets)
// ---------------------------------------------------------------------------

/** Repère le plus proche du point (px, py) du document, à moins de GUIDE_HIT_DISTANCE points écran. */
export function hitGuide(guides: readonly Guide[], px: number, py: number, scale: number): Guide | null {
  'worklet';
  const tolerance = GUIDE_HIT_DISTANCE / Math.max(scale, 1e-6);
  let best: Guide | null = null;
  let bestDistance = tolerance;
  for (const g of guides) {
    const d = Math.abs((g.orientation === 'horizontal' ? py : px) - g.position);
    if (d <= bestDistance) {
      best = g;
      bestDistance = d;
    }
  }
  return best;
}

/** Boîte englobante (alignée sur les axes) d'un calque, rotation comprise. */
export function boundsOf(g: LayerGeometry): { left: number; top: number; right: number; bottom: number } {
  'worklet';
  const rad = (g.rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  const hw = (g.width * c + g.height * s) / 2;
  const hh = (g.width * s + g.height * c) / 2;
  const cx = g.x + g.width / 2;
  const cy = g.y + g.height / 2;
  return { left: cx - hw, top: cy - hh, right: cx + hw, bottom: cy + hh };
}

export interface SnapTargets {
  /** Lignes verticales (x) et horizontales (y) d'attraction, en pixels du document. */
  xs: readonly number[];
  ys: readonly number[];
  /** Grille affichée : ses lignes (principales et subdivisions) attirent aussi. */
  grid: GridSettings | null;
}

/**
 * Cibles d'attraction : bords et centre du document, puis repères visibles.
 */
export function snapTargets(doc: { width: number; height: number }, guides: readonly Guide[] | null, grid: GridSettings | null): SnapTargets {
  const xs = [0, doc.width / 2, doc.width];
  const ys = [0, doc.height / 2, doc.height];
  for (const g of guides ?? []) (g.orientation === 'vertical' ? xs : ys).push(g.position);
  return { xs, ys, grid };
}

function nearestOnAxis(values: readonly number[], lines: readonly number[], grid: GridSettings | null, tolerance: number): { delta: number; line: number } | null {
  'worklet';
  let bestDelta = Infinity;
  let bestLine = 0;
  const step = grid ? grid.spacing / Math.max(1, grid.subdivisions) : 0;
  for (const v of values) {
    for (let i = 0; i <= lines.length; i += 1) {
      // Dernier tour : la ligne de grille la plus proche.
      const line = i < lines.length ? (lines[i] ?? 0) : step > 0 ? Math.round(v / step) * step : NaN;
      const delta = line - v;
      if (Math.abs(delta) <= tolerance && Math.abs(delta) < Math.abs(bestDelta)) {
        bestDelta = delta;
        bestLine = line;
      }
    }
  }
  return bestDelta === Infinity ? null : { delta: bestDelta, line: bestLine };
}

export interface SnapResult {
  /** Correction à ajouter au déplacement, en pixels du document. */
  dx: number;
  dy: number;
  /** Lignes atteintes (pour les afficher), ou null. */
  lineX: number | null;
  lineY: number | null;
}

/**
 * Magnétisme d'un calque déplacé : ses bords gauche, droit et son centre
 * horizontal s'alignent sur la ligne verticale la plus proche ; ses bords
 * haut, bas et son centre vertical sur la ligne horizontale la plus proche ;
 * chacun à moins de SNAP_DISTANCE points écran.
 */
export function snapMove(g: LayerGeometry, targets: SnapTargets, scale: number): SnapResult {
  'worklet';
  const tolerance = SNAP_DISTANCE / Math.max(scale, 1e-6);
  const b = boundsOf(g);
  const sx = nearestOnAxis([b.left, (b.left + b.right) / 2, b.right], targets.xs, targets.grid, tolerance);
  const sy = nearestOnAxis([b.top, (b.top + b.bottom) / 2, b.bottom], targets.ys, targets.grid, tolerance);
  return { dx: sx ? sx.delta : 0, dy: sy ? sy.delta : 0, lineX: sx ? sx.line : null, lineY: sy ? sy.line : null };
}

/** Magnétisme d'un repère déplacé : bords et centre du document, puis grille. */
export function snapGuidePosition(orientation: GuideOrientation, position: number, doc: { width: number; height: number }, grid: GridSettings | null, scale: number): number {
  'worklet';
  const extent = orientation === 'horizontal' ? doc.height : doc.width;
  const hit = nearestOnAxis([position], [0, extent / 2, extent], grid, SNAP_DISTANCE / Math.max(scale, 1e-6));
  return hit ? hit.line : position;
}

/** Positions des lignes de la grille dans [0, extent] : principales et subdivisions. */
export function gridLines(extent: number, grid: GridSettings): { major: number[]; minor: number[] } {
  const major: number[] = [];
  const minor: number[] = [];
  const sub = Math.max(1, Math.round(grid.subdivisions));
  const step = grid.spacing / sub;
  // Au-delà, la grille deviendrait illisible et coûteuse : les subdivisions sont abandonnées.
  const withMinor = extent / step <= 4000;
  for (let k = 0; k * step <= extent + 1e-6; k += 1) {
    if (k % sub === 0) major.push(k * step);
    else if (withMinor) minor.push(k * step);
    if (k > 20000) break;
  }
  return { major, minor };
}

/** Valide les réglages de la grille ; renvoie un message ou null. */
export function validateGrid(grid: GridSettings): string | null {
  if (!Number.isFinite(grid.spacing) || grid.spacing < GRID_LIMITS.minSpacing || grid.spacing > GRID_LIMITS.maxSpacing) {
    return `Le pas de la grille doit être compris entre ${GRID_LIMITS.minSpacing} et ${GRID_LIMITS.maxSpacing} px.`;
  }
  if (!Number.isInteger(grid.subdivisions) || grid.subdivisions < 1 || grid.subdivisions > GRID_LIMITS.maxSubdivisions) {
    return `Les subdivisions doivent être un entier entre 1 et ${GRID_LIMITS.maxSubdivisions}.`;
  }
  return null;
}
