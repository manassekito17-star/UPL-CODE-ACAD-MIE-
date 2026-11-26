import type { ComponentRef } from 'react';
import type { View } from 'react-native';

/** Mesure d'un élément à l'écran, pour ancrer un menu sous lui. */
export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ViewRef = ComponentRef<typeof View>;

export const NO_ANCHOR: Anchor = { x: 0, y: 0, width: 0, height: 0 };

/**
 * Position de l'élément dans la fenêtre. Module à part : les tests le
 * remplacent, la doublure native de Jest ne répondant jamais à la mesure.
 */
export function measureAnchor(node: ViewRef | null, done: (anchor: Anchor) => void): void {
  if (!node || typeof node.measureInWindow !== 'function') {
    done(NO_ANCHOR);
    return;
  }
  node.measureInWindow((x, y, width, height) => done({ x, y, width, height }));
}
