import { requireOptionalNativeModule, type EventSubscription } from 'expo';

/**
 * Clavier matériel sur Android (module local modules/zentech-keyboard) :
 * le module natif intercepte les combinaisons déclarées et les envoie ici.
 * Sur iOS, le module ne capte encore rien (voir son code).
 */
type NativeKeyboard = {
  setShortcuts(chords: string[]): void;
  addListener(event: 'onShortcut', listener: (e: { chord: string }) => void): EventSubscription;
};

const native = requireOptionalNativeModule<NativeKeyboard>('ZentechKeyboard');

export const keyboardAvailable = native !== null;

/** Déclare les combinaisons à intercepter et reçoit celles qui sont tapées. */
export function listenShortcuts(chords: readonly string[], onChord: (chord: string) => void): () => void {
  if (!native) return () => undefined;
  native.setShortcuts([...chords]);
  const sub = native.addListener('onShortcut', (e) => onChord(e.chord));
  return () => sub.remove();
}
