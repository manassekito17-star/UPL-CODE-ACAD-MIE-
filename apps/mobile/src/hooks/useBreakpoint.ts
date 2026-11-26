import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

/** Classe de largeur d'écran (fonction pure, testable sans rendu). */
export function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.expanded) return 'expanded';
  if (width >= breakpoints.medium) return 'medium';
  return 'compact';
}

/**
 * Classe de largeur courante, recalculée à la rotation de l'écran.
 * Les panneaux de l'éditeur s'en serviront pour se replier sur petit écran.
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return getBreakpoint(width);
}
