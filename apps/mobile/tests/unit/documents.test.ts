import {
  PRESET_CATALOG,
  PRESET_CATEGORIES,
  formatNumber,
  fromPixels,
  fromPpi,
  parsePositive,
  presetFits,
  presetPixels,
  toPpi,
  DOCUMENT_FORMAT_VERSION,
  DOCUMENT_LIMITS,
  FIXED_PRESETS,
  createDocument,
  estimateLayerBytes,
  formatBytes,
  normalizeDocumentName,
  orientationOf,
  screenPreset,
  validateDocumentInput,
  withOrientation,
  type DocumentFormInput,
} from '@/engine/documents';

const input = (over: Partial<DocumentFormInput> = {}): DocumentFormInput => ({
  width: '1080',
  height: '1920',
  background: 'white',
  name: '',
  ...over,
});

describe('validateDocumentInput', () => {
  it('accepte une saisie correcte et applique le nom par défaut', () => {
    const result = validateDocumentInput(input());
    expect(result).toEqual({
      ok: true,
      spec: { width: 1080, height: 1920, background: 'white', name: 'Sans titre', resolution: 72 },
      warnings: [],
    });
  });

  it('convertit centimètres, millimètres et pouces avec la résolution', () => {
    const a4 = validateDocumentInput({ ...input(), width: '210', height: '297', unit: 'mm', resolution: '300' });
    expect(a4).toMatchObject({ ok: true, spec: { width: 2480, height: 3508, resolution: 300 } });
    const photo = validateDocumentInput({ ...input(), width: '10', height: '15', unit: 'cm', resolution: '118,11', resolutionUnit: 'ppcm' });
    expect(photo).toMatchObject({ ok: true, spec: { width: 1181, height: 1772 } });
    const letter = validateDocumentInput({ ...input(), width: '8,5', height: '11', unit: 'in', resolution: '300' });
    expect(letter).toMatchObject({ ok: true, spec: { width: 2550, height: 3300 } });
    expect(letter.warnings).toContainEqual(expect.stringMatching(/^Taille en pixels : 2.550 × 3.300 px à 300 pixels\/pouce\.$/));
  });

  it('refuse une résolution invalide et une taille physique trop grande en pixels', () => {
    expect(validateDocumentInput({ ...input(), resolution: '0' })).toMatchObject({ ok: false, errors: [{ field: 'resolution' }] });
    const big = validateDocumentInput({ ...input(), width: '100', height: '10', unit: 'cm', resolution: '300' });
    expect(big).toMatchObject({ ok: false, errors: [{ field: 'width', message: expect.stringMatching(/11.811 px/) }] });
  });

  it('fond de couleur personnalisée : code obligatoire', () => {
    expect(validateDocumentInput({ ...input(), background: 'color', backgroundColor: '#12ab34' })).toMatchObject({
      ok: true,
      spec: { background: 'color', backgroundColor: '#12AB34' },
    });
    expect(validateDocumentInput({ ...input(), background: 'color', backgroundColor: 'vert' })).toMatchObject({ ok: false, errors: [{ field: 'background' }] });
  });

  it.each([
    ['', 'La largeur est obligatoire.'],
    ['  ', 'La largeur est obligatoire.'],
    ['12.5', 'La largeur doit être un nombre entier de pixels.'],
    ['-3', 'La largeur doit être un nombre entier de pixels.'],
    ['1e3', 'La largeur doit être un nombre entier de pixels.'],
    ['0', 'La largeur doit être comprise entre 1 et 8 192 px.'],
    ['8193', 'La largeur doit être comprise entre 1 et 8 192 px.'],
  ])('refuse la largeur « %s »', (width, message) => {
    const result = validateDocumentInput(input({ width }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContainEqual({ field: 'width', message });
  });

  it('signale les deux champs fautifs à la fois', () => {
    const result = validateDocumentInput(input({ width: 'abc', height: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.map((e) => e.field)).toEqual(['width', 'height']);
  });

  it('accepte les bornes exactes', () => {
    expect(validateDocumentInput(input({ width: '1', height: '1' })).ok).toBe(true);
    expect(validateDocumentInput(input({ width: '8192', height: '2048' })).ok).toBe(true);
    expect(validateDocumentInput(input({ width: '4096', height: '4096' })).ok).toBe(true);
  });

  it('refuse un document qui dépasse le budget mémoire même si chaque côté est valide', () => {
    const result = validateDocumentInput(input({ width: '8192', height: '8192' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe('size');
      expect(result.errors[0]?.message).toContain('Document trop grand');
      expect(result.errors[0]?.message).toContain('256 Mo');
    }
  });

  it('avertit sans bloquer pour un grand document', () => {
    const result = validateDocumentInput(input({ width: '3840', height: '3840' }));
    expect(result.ok).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('56 Mo');
  });

  it("n'avertit pas pour la 4K UHD (8,3 Mpx)", () => {
    expect(validateDocumentInput(input({ width: '3840', height: '2160' })).warnings).toEqual([]);
  });

  it('nettoie le nom et refuse un nom trop long', () => {
    expect(normalizeDocumentName('  Mon   affiche  ')).toBe('Mon affiche');
    const result = validateDocumentInput(input({ name: 'x'.repeat(DOCUMENT_LIMITS.maxNameLength + 1) }));
    expect(result.ok).toBe(false);
  });

  it('refuse un fond inconnu', () => {
    const result = validateDocumentInput({ ...input(), background: 'red' as never });
    expect(result.ok).toBe(false);
  });
});

describe('orientation', () => {
  it('déduit l’orientation (le carré est portrait)', () => {
    expect(orientationOf(1920, 1080)).toBe('landscape');
    expect(orientationOf(1080, 1920)).toBe('portrait');
    expect(orientationOf(500, 500)).toBe('portrait');
  });

  it('échange les dimensions selon l’orientation voulue', () => {
    expect(withOrientation(1080, 1920, 'landscape')).toEqual({ width: 1920, height: 1080 });
    expect(withOrientation(1920, 1080, 'portrait')).toEqual({ width: 1080, height: 1920 });
    expect(withOrientation(1080, 1920, 'portrait')).toEqual({ width: 1080, height: 1920 });
  });
});

describe('formats prédéfinis', () => {
  it('respectent tous les limites mémoire', () => {
    for (const p of FIXED_PRESETS) {
      expect(validateDocumentInput(input({ width: String(p.width), height: String(p.height) })).ok).toBe(true);
    }
  });

  it("calcule la résolution de l'écran en pixels physiques, en portrait", () => {
    expect(screenPreset(412, 915, 2.625)).toMatchObject({ width: 1082, height: 2402 });
    expect(screenPreset(915, 412, 2.625)).toMatchObject({ width: 1082, height: 2402 });
  });

  it("réduit proportionnellement un écran qui dépasserait les limites", () => {
    const preset = screenPreset(2000, 3000, 3); // 6000 × 9000 px
    expect(preset.width * preset.height).toBeLessThanOrEqual(DOCUMENT_LIMITS.maxPixels);
    expect(Math.max(preset.width, preset.height)).toBeLessThanOrEqual(DOCUMENT_LIMITS.maxDimension);
    expect(preset.height / preset.width).toBeCloseTo(1.5, 2);
  });

  it('résiste à une densité invalide', () => {
    expect(screenPreset(400, 800, 0)).toMatchObject({ width: 400, height: 800 });
    expect(screenPreset(400, 800, Number.NaN)).toMatchObject({ width: 400, height: 800 });
  });
});

describe('mémoire', () => {
  it('estime 4 octets par pixel', () => {
    expect(estimateLayerBytes(1080, 1920)).toBe(8_294_400);
  });

  it('formate en unités françaises', () => {
    expect(formatBytes(512)).toBe('512 octets');
    expect(formatBytes(1536)).toBe('1,5 Ko');
    expect(formatBytes(8_294_400)).toBe('7,9 Mo');
    expect(formatBytes(64 * 1024 * 1024)).toBe('64 Mo');
  });
});

describe('createDocument', () => {
  it('crée un document versionné avec identifiant et horodatages injectés', () => {
    const doc = createDocument(
      { width: 100, height: 50, background: 'transparent', name: 'Test' },
      { id: 'doc_1', now: 1_700_000_000_000 },
    );
    expect(doc).toEqual({
      formatVersion: DOCUMENT_FORMAT_VERSION,
      id: 'doc_1',
      name: 'Test',
      width: 100,
      height: 50,
      background: 'transparent',
      backgroundColor: '#FFFFFF',
      resolution: 72,
      layers: [],
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    });
  });
});

describe('préréglages par catégorie', () => {
  it('chaque préréglage tient dans les limites de l’appareil, aux tailles attendues', () => {
    for (const presets of Object.values(PRESET_CATALOG)) for (const preset of presets) expect([preset.id, presetFits(preset)]).toEqual([preset.id, true]);
    const find = (id: string) => Object.values(PRESET_CATALOG).flat().find((p) => p.id === id)!;
    expect(presetPixels(find('print-a4'))).toEqual({ width: 2480, height: 3508 });
    expect(presetPixels(find('photo-10x15'))).toEqual({ width: 1181, height: 1772 });
    expect(presetPixels(find('print-letter'))).toEqual({ width: 2550, height: 3300 });
    expect(PRESET_CATEGORIES.map((c) => c.label)).toEqual(['Récent', 'Enregistré', 'Photo', 'Impression', 'Illustration', 'Web', 'Mobile', 'Film et vidéo']);
  });

  it('convertit les unités dans les deux sens', () => {
    expect(fromPixels(2480, 'mm', 300)).toBeCloseTo(209.97, 1);
    expect(formatNumber(fromPixels(300, 'in', 300))).toBe('1');
    expect(toPpi(118.11, 'ppcm')).toBeCloseTo(300, 0);
    expect(fromPpi(300, 'ppcm')).toBeCloseTo(118.11, 2);
    expect(parsePositive('29,7')).toBe(29.7);
    expect(parsePositive('-1')).toBeNull();
  });
});
