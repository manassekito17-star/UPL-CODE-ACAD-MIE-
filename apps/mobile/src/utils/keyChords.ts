/**
 * Combinaisons de touches, sous une forme unique partagée par le web et le
 * module natif Android : « mod+alt+shift+touche », où « mod » est Ctrl (ou
 * Cmd sur un clavier Apple). Ex. « mod+shift+s », « v », « shift+b », « delete ».
 */

export interface KeyInput {
  /** Valeur de la touche (KeyboardEvent.key, ou équivalent natif). */
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

const NAMED: Record<string, string> = {
  delete: 'delete',
  del: 'delete',
  backspace: 'backspace',
  tab: 'tab',
  escape: 'escape',
  esc: 'escape',
  enter: 'enter',
  '+': '=',
  '=': '=',
  '-': '-',
  _: '-',
  '/': '/',
  '?': '/',
};

/** Normalise une touche ; null pour les touches sans raccourci (flèches, modificateurs seuls…). */
export function normalizeKey(key: string): string | null {
  const k = key.toLowerCase();
  if (k in NAMED) return NAMED[k] as string;
  if (/^[a-z0-9]$/.test(k)) return k;
  return null;
}

export function chordOf(e: KeyInput): string | null {
  const key = normalizeKey(e.key);
  if (!key) return null;
  const parts: string[] = [];
  if (e.ctrl || e.meta) parts.push('mod');
  if (e.alt) parts.push('alt');
  // Maj avec « + » (sur beaucoup de claviers) fait déjà partie de la touche.
  if (e.shift && key !== '=') parts.push('shift');
  parts.push(key);
  return parts.join('+');
}

const KEY_LABELS: Record<string, string> = { '/': '/', delete: 'Suppr', backspace: 'Retour arrière', tab: 'Tab', escape: 'Échap', enter: 'Entrée', '=': '+', '-': '−' };

/** « Ctrl+Maj+S » (Windows, Android, web) ou « ⌘⇧S » (Apple). */
export function formatChord(chord: string, apple = false): string {
  const parts = chord.split('+');
  const key = parts[parts.length - 1] as string;
  const label = KEY_LABELS[key] ?? key.toUpperCase();
  const mods = parts.slice(0, -1);
  if (apple) {
    const sym: Record<string, string> = { mod: '⌘', alt: '⌥', shift: '⇧' };
    return mods.map((m) => sym[m]).join('') + label;
  }
  const words: Record<string, string> = { mod: 'Ctrl', alt: 'Alt', shift: 'Maj' };
  return [...mods.map((m) => words[m]), label].join('+');
}
