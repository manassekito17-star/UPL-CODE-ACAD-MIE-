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

// Propriétés qu'inspectent Jest (affichage des objets) et les promesses : sans
// elles, afficher un objet neutre dans un message d'échec bouclerait sans fin.
const INSPECTED = new Set<PropertyKey>(['then', 'toJSON', 'asymmetricMatch', '$$typeof', 'nodeType', 'tagName', 'constructor', '@@__IMMUTABLE_ITERABLE__@@', '@@__IMMUTABLE_RECORD__@@', 'length']);

const neutral: Neutral = new Proxy(function neutralFn() {} as unknown as Neutral, {
  get: (_target, prop) => (typeof prop === 'symbol' || INSPECTED.has(prop) ? undefined : neutral),
  apply: () => neutral,
});

const Nothing = () => null;

export const Canvas = ({ children: _children, ...rest }: { children?: ReactNode }) => (
  <View testID="skia-canvas" {...rest} />
);
export const Group = Nothing;
export const Picture = Nothing;
export const Image = Nothing;
export const Rect = Nothing;
export const Fill = Nothing;
export const Path = Nothing;
export const Text = Nothing;
export const Circle = Nothing;
export const Line = Nothing;
export const LinearGradient = Nothing;
export const vec = (x: number, y: number) => ({ x, y });
export const Skia = neutral;
export const ImageFormat = { JPEG: 3, PNG: 4, WEBP: 6 };
export const TileMode = { Clamp: 0, Repeat: 1, Mirror: 2, Decal: 3 };
export const FilterMode = { Nearest: 0, Linear: 1 };
export const MipmapMode = { None: 0, Nearest: 1, Linear: 2 };
export const TextAlign = { Left: 0, Right: 1, Center: 2, Justify: 3, Start: 4, End: 5 };
/** Pas de police ni d'image dans les tests d'interface : textes et images non dessinés. */
export const useFonts = () => null;
export const useImage = () => null;
export const useFont = () => null;
