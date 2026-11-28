import { SHORTCUTS, TOOL_KEYS, allChords } from '@/features/shortcuts/catalog';
import { TOOL_FAMILIES } from '@/screens/editor/toolFamilies';
import { listenShortcuts } from '@/services/keyboard/keyboard.web';
import { chordOf, formatChord, normalizeKey } from '@/utils/keyChords';

const key = (k: string, mods: Partial<{ ctrl: boolean; meta: boolean; shift: boolean; alt: boolean }> = {}) => ({ key: k, ctrl: false, meta: false, shift: false, alt: false, ...mods });

describe('combinaisons de touches', () => {
  it('normalise Ctrl et Cmd, Maj, Alt, et les touches nommées', () => {
    expect(chordOf(key('s', { ctrl: true }))).toBe('mod+s');
    expect(chordOf(key('S', { meta: true, shift: true }))).toBe('mod+shift+s');
    expect(chordOf(key('W', { ctrl: true, alt: true, shift: true }))).toBe('mod+alt+shift+w');
    expect(chordOf(key('+', { ctrl: true, shift: true }))).toBe('mod+='); // Maj fait partie du « + »
    expect(chordOf(key('Delete'))).toBe('delete');
    expect(chordOf(key('Tab'))).toBe('tab');
    expect(chordOf(key('ArrowLeft'))).toBeNull();
    expect(normalizeKey('Shift')).toBeNull();
  });

  it('affiche les raccourcis à la manière de chaque système', () => {
    expect(formatChord('mod+shift+s')).toBe('Ctrl+Maj+S');
    expect(formatChord('mod+shift+s', true)).toBe('⌘⇧S');
    expect(formatChord('mod+alt+shift+w', true)).toBe('⌘⌥⇧W');
    expect(formatChord('mod+=')).toBe('Ctrl++');
    expect(formatChord('delete')).toBe('Suppr');
  });
});

describe('catalogue des raccourcis', () => {
  it('une combinaison ne déclenche qu’une commande ; une lettre par famille d’outils', () => {
    const byChord = new Map<string, string>();
    for (const s of SHORTCUTS) {
      expect([s.chord, byChord.get(s.chord) ?? s.command]).toEqual([s.chord, s.command]);
      byChord.set(s.chord, s.command);
    }
    expect(TOOL_KEYS.size).toBe(TOOL_FAMILIES.length);
    for (const letter of TOOL_KEYS.keys()) expect(byChord.has(letter)).toBe(false);
    expect(TOOL_KEYS.get('v')).toBe('move');
    expect(TOOL_KEYS.get('b')).toBe('brush');
    expect(allChords()).toEqual(expect.arrayContaining(['mod+s', 'mod+shift+s', 'mod+z', 'mod+shift+z', 'v', 'shift+u', 'e', 't', 'm', 'c', 'z']));
  });
});

describe('écoute du clavier dans le navigateur', () => {
  it('transmet les raccourcis, mais pas une lettre seule pendant une saisie', () => {
    let listener: ((e: unknown) => void) | null = null;
    const g = globalThis as unknown as { window: unknown };
    const previous = g.window;
    g.window = { addEventListener: (_: string, l: (e: unknown) => void) => (listener = l), removeEventListener: () => (listener = null) };
    const got: string[] = [];
    const stop = listenShortcuts(['mod+s', 'v'], (c) => got.push(c));
    const fire = (k: string, mods: Record<string, boolean>, tagName = 'DIV') => {
      const e = { key: k, ctrlKey: !!mods.ctrl, metaKey: !!mods.meta, shiftKey: !!mods.shift, altKey: !!mods.alt, repeat: false, target: { tagName, isContentEditable: false }, prevented: false, preventDefault() { this.prevented = true; } };
      listener?.(e);
      return e.prevented;
    };
    expect(fire('s', { ctrl: true })).toBe(true);
    expect(fire('v', {})).toBe(true);
    expect(fire('v', {}, 'INPUT')).toBe(false); // on tape un « v » dans un champ
    expect(fire('s', { meta: true }, 'TEXTAREA')).toBe(true); // Cmd+S marche aussi pendant une saisie
    expect(fire('q', {})).toBe(false);
    expect(got).toEqual(['mod+s', 'v', 'mod+s']);
    stop();
    expect(listener).toBeNull();
    g.window = previous;
  });
});
