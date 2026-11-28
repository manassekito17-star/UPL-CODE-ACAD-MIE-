import { chordOf } from '@/utils/keyChords';

export const keyboardAvailable = true;

/** Navigateur : écoute du clavier de la page ; une lettre seule n'agit pas pendant une saisie. */
export function listenShortcuts(chords: readonly string[], onChord: (chord: string) => void): () => void {
  const wanted = new Set(chords);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const chord = chordOf({ key: e.key, ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey });
    if (!chord || !wanted.has(chord)) return;
    const target = e.target as HTMLElement | null;
    const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (typing && !chord.startsWith('mod+')) return;
    e.preventDefault();
    onChord(chord);
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
