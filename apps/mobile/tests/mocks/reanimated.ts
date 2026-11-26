/**
 * Doublure minimale de react-native-reanimated pour Jest.
 *
 * Pourquoi : avec le préréglage jest-expo (plateforme iOS simulée), la
 * doublure officielle de Reanimated 4.7 charge `initializers.native.ts` sur
 * l'implémentation JavaScript et lève « setCSSEventHandler is not available in
 * JSReanimated ». Expo Router remplace alors Reanimated par un objet vide.
 *
 * Cette doublure couvre l'API utilisée par l'application : les valeurs
 * partagées sont synchrones et les animations atteignent immédiatement leur
 * cible. À réévaluer à chaque mise à jour de Reanimated (supprimer si la
 * doublure officielle refonctionne).
 */
import { useMemo, useRef } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';

export class MockSharedValue<T> {
  constructor(public value: T) {}
  get(): T {
    return this.value;
  }
  set(next: T | ((previous: T) => T)): void {
    this.value = typeof next === 'function' ? (next as (p: T) => T)(this.value) : next;
  }
  modify(fn: (value: T) => T): void {
    this.value = fn(this.value);
  }
  addListener(): void {}
  removeListener(): void {}
}

export function useSharedValue<T>(initial: T): MockSharedValue<T> {
  const ref = useRef<MockSharedValue<T> | null>(null);
  if (ref.current === null) ref.current = new MockSharedValue(initial);
  return ref.current;
}

export function makeMutable<T>(initial: T): MockSharedValue<T> {
  return new MockSharedValue(initial);
}

/** Valeur dérivée recalculée à chaque lecture. */
export function useDerivedValue<T>(compute: () => T) {
  return useMemo(
    () => ({
      get value() {
        return compute();
      },
      get: () => compute(),
    }),
    [compute],
  );
}

export const withTiming = <T>(target: T): T => target;
export const withSpring = <T>(target: T): T => target;
export const withDecay = () => 0;
export const cancelAnimation = () => {};
export const isSharedValue = (value: unknown): boolean => value instanceof MockSharedValue;
export const useAnimatedStyle = <T>(fn: () => T): T => fn();
export const useAnimatedProps = <T>(fn: () => T): T => fn();
export const useEvent = () => () => {};
export const useHandler = () => ({ context: {}, doDependenciesDiffer: false, useWeb: false });
export const useComposedEventHandler = () => () => {};
export const runOnJS =
  <A extends unknown[], R>(fn: (...args: A) => R) =>
  (...args: A) =>
    fn(...args);
export const runOnUI = runOnJS;
export const Easing = { linear: (t: number) => t, bezier: () => (t: number) => t, inOut: () => (t: number) => t };

const createAnimatedComponent = <C>(component: C): C => component;

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent,
  call: () => {},
};

export { createAnimatedComponent };
export default Animated;
