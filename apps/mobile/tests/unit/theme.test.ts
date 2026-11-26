import { colors, touchTarget, ws } from '@/theme';
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

  it('les boutons destructifs sont lisibles et se distinguent du panneau', () => {
    expect(contrastRatio(colors.textOnAccent, colors.dangerSolid)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(colors.textOnAccent, colors.dangerSolidPressed)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(colors.dangerSolid, colors.panel)).toBeGreaterThanOrEqual(UI_AA);
  });

  it('le texte de danger reste lisible sur les panneaux', () => {
    expect(contrastRatio(colors.danger, colors.panel)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it('les cibles tactiles font au moins 48 dp', () => {
    expect(touchTarget).toBeGreaterThanOrEqual(48);
  });
});

describe('palette graphite de l’espace de travail', () => {
  const TEXT_AA = 4.5;
  const surfaces = { chrome: ws.chrome, panel: ws.panel, header: ws.header, raised: ws.raised, input: ws.input, pasteboard: ws.pasteboard };

  it.each(Object.entries(surfaces))('texte principal et secondaire lisibles sur %s', (_name, bg) => {
    expect(contrastRatio(ws.text, bg)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(ws.textDim, bg)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it('la ligne sélectionnée garde un texte principal lisible', () => {
    expect(contrastRatio(ws.text, ws.selected)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it("le texte d'accent est lisible sur les barres et les panneaux", () => {
    for (const bg of [ws.chrome, ws.panel, ws.header]) {
      expect(contrastRatio(ws.accentText, bg)).toBeGreaterThanOrEqual(TEXT_AA);
    }
  });

  it("l'accent reste visible comme élément d'interface sur les barres et les panneaux", () => {
    for (const bg of [ws.chrome, ws.panel, ws.header, ws.raised, ws.input]) {
      expect(contrastRatio(ws.accent, bg)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('conversions TSV (sélecteur de couleur)', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hexToHsv, hsvToHex } = require('@/utils/color') as typeof import('@/utils/color');

  it.each(['#FF0000', '#00FF00', '#0000FF', '#3685FF', '#101114', '#FFFFFF', '#000000', '#7B61FF'])('aller-retour exact pour %s', (hex) => {
    expect(hsvToHex(hexToHsv(hex))).toBe(hex);
  });

  it('donne les teintes de référence', () => {
    expect(hexToHsv('#FF0000')).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv('#00FF00').h).toBe(120);
    expect(hexToHsv('#0000FF').h).toBe(240);
    expect(hsvToHex({ h: 60, s: 1, v: 1 })).toBe('#FFFF00');
    expect(hsvToHex({ h: 0, s: 0, v: 0.5 })).toBe('#808080');
  });
});
