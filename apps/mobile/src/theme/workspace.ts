/**
 * Palette « graphite » de l'espace de travail tablette et grand écran,
 * dense et neutre comme les logiciels de retouche de bureau. Le téléphone
 * garde la palette générale (colors.ts). Contrastes vérifiés par
 * tests/unit/theme.test.ts.
 */
export const ws = {
  /** Barres de menus, d'options et d'état, barre d'outils. */
  chrome: '#2B2B2B',
  /** Corps des panneaux. */
  panel: '#323232',
  /** Bandeau d'onglets des panneaux, onglet inactif. */
  header: '#262626',
  /** Élément survolé ou pressé, boutons d'outils actifs. */
  raised: '#3B3B3B',
  /** Ligne de calque sélectionnée (texte principal uniquement). */
  selected: '#4A4A4A',
  /** Champs de saisie, menus déroulants fermés. */
  input: '#1E1E1E',
  /** Plan de travail autour du document. */
  pasteboard: '#202020',
  /** Séparateurs entre zones. */
  border: '#161616',
  /** Séparateurs à l'intérieur d'un panneau. */
  divider: '#404040',
  text: '#DADADA',
  textDim: '#AAAAAA',
  textDisabled: '#6E6E6E',
  /** Accent (sélection, focus) et texte d'accent. */
  accent: '#3685FF',
  accentText: '#5C9DFF',
  /** Règles. */
  rulerTick: '#7A7A7A',
} as const;

/** Mesures denses (points). Les cibles tactiles restent ≥ 32 points sur tablette. */
export const wsMetrics = {
  menuBar: 28,
  optionsBar: 36,
  toolRail: 40,
  toolButton: 34,
  statusBar: 24,
  docTabs: 28,
  ruler: 18,
  panelTabs: 28,
  row: 32,
  dockWidth: 300,
  dockWidthMedium: 248,
  fontSize: 12,
  smallFontSize: 11,
} as const;
