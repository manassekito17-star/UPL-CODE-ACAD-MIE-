import type { ReactNode } from 'react';

/** Android et iOS : Skia est natif et toujours prêt. (Web : voir SkiaGate.web.tsx.) */
export function SkiaGate({ children }: { children: ReactNode }) {
  return children;
}
