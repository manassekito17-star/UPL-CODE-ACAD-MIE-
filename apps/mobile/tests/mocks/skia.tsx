/**
 * Doublure de @shopify/react-native-skia pour les tests d'INTERFACE
 * (environnement React Native simulé, sans GPU ni CanvasKit).
 *
 * - Canvas est une simple vue ; les nœuds de dessin ne rendent rien.
 * - L'API impérative (Skia.Paint(), PictureRecorder…) est un objet neutre qui
 *   accepte n'importe quel appel.
 *
 * Le rendu réel est vérifié ailleurs, pixel par pixel, avec le vrai Skia
 * (tests/integration/renderer.test.ts et skia-headless.test.ts).
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

type Neutral = ((...args: unknown[]) => Neutral) & { [key: string]: Neutral };

const neutral: Neutral = new Proxy(function neutralFn() {} as unknown as Neutral, {
  get: (_target, prop) => (prop === 'then' || prop === Symbol.toPrimitive ? undefined : neutral),
  apply: () => neutral,
});

const Nothing = () => null;

export const Canvas = ({ children: _children, ...rest }: { children?: ReactNode }) => (
  <View testID="skia-canvas" {...rest} />
);
export const Group = Nothing;
export const Picture = Nothing;
export const Rect = Nothing;
export const Fill = Nothing;
export const Skia = neutral;
export const TileMode = { Clamp: 0, Repeat: 1, Mirror: 2, Decal: 3 };
export const FilterMode = { Nearest: 0, Linear: 1 };
