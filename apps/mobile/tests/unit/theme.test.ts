import { colors, touchTarget } from '@/theme';
import { contrastRatio, hexToRgb } from '@/utils/color';

describe('outils de couleur', () => {
  it('convertit les notations courte et longue', () => {
    expect(hexToRgb('#3685FF')).toEqual({ r: 0x36, g: 0x85, b: 0xff });
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('refuse une couleur invalide', () => {
    expect(() => hexToRgb('#12')).toThrow('Couleur hexadécimale invalide');
  });

  it('calcule les rapports de contraste de référence WCAG', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});

describe('palette du cahier des charges', () => {
  it('reprend exactement les valeurs imposées', () => {
    expect(colors.background).toBe('#101114');
    expect(colors.surface).toBe('#191B20');
    expect(colors.panel).toBe('#22252C');
    expect(colors.accent).toBe('#3685FF');
    expect(colors.textPrimary).toBe('#FFFFFF');
    expect(colors.textSecondary).toBe('#A5AAB5');
  });
});

describe('accessibilité des contrastes (WCAG 2.2 AA)', () => {
  const TEXT_AA = 4.5;
  const UI_AA = 3;
  const backgrounds = {
    background: colors.background,
    surface: colors.surface,
    panel: colors.panel,
    panelPressed: colors.panelPressed,
  };

  it.each(Object.entries(backgrounds))('le texte principal et secondaire est lisible sur %s', (_name, bg) => {
    expect(contrastRatio(colors.textPrimary, bg)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(colors.textSecondary, bg)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it.each(Object.entries(backgrounds))("le texte d'accent est lisible sur %s", (_name, bg) => {
    expect(contrastRatio(colors.accentText, bg)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it.each(Object.entries(backgrounds))("l'accent imposé reste visible comme élément d'interface sur %s", (_name, bg) => {
    expect(contrastRatio(colors.accent, bg)).toBeGreaterThanOrEqual(UI_AA);
  });

  it('le libellé blanc des boutons principaux est lisible sur accentSolid (pressé ou non)', () => {
    expect(contrastRatio(colors.textOnAccent, colors.accentSolid)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(colors.textOnAccent, colors.accentSolidPressed)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it('les boutons principaux se distinguent du fond', () => {
    expect(contrastRatio(colors.accentSolid, colors.background)).toBeGreaterThanOrEqual(UI_AA);
  });

  it('le texte de danger reste lisible sur les panneaux', () => {
    expect(contrastRatio(colors.danger, colors.panel)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it('les cibles tactiles font au moins 48 dp', () => {
    expect(touchTarget).toBeGreaterThanOrEqual(48);
  });
});
