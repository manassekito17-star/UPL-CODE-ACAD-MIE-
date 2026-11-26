/**
 * Palette du thème sombre professionnel.
 *
 * Les six premières valeurs viennent du cahier des charges. Les autres en
 * dérivent ; leurs contrastes sont vérifiés par tests/unit/theme.test.ts
 * (WCAG 2.2 AA : 4,5:1 pour le texte courant, 3:1 pour les éléments d'interface).
 */
export const colors = {
  /** Fond principal de l'application. */
  background: '#101114',
  /** Fond secondaire : barres, en-têtes. */
  surface: '#191B20',
  /** Panneaux, cartes, champs. */
  panel: '#22252C',
  /** Panneau survolé / pressé. */
  panelPressed: '#2B2F38',
  /** Bordures discrètes entre zones. */
  border: '#2E323B',

  /**
   * Accent imposé : sélection, focus, bordures actives, remplissages.
   * Comme texte, il n'atteint pas 4,5:1 sur les panneaux : utiliser accentText.
   */
  accent: '#3685FF',
  /** Texte coloré d'accent (liens, badges), lisible sur tous les fonds. */
  accentText: '#5C9DFF',
  /**
   * Accent plein pour les boutons portant du texte blanc. #3685FF avec du
   * blanc n'atteint que ~3,5:1, insuffisant pour un libellé de 16 px.
   */
  accentSolid: '#1F68E0',
  accentSolidPressed: '#1A58BF',

  textPrimary: '#FFFFFF',
  textSecondary: '#A5AAB5',
  /** Texte d'un contrôle désactivé (volontairement moins contrasté). */
  textDisabled: '#6B707B',
  /** Texte posé sur accentSolid. */
  textOnAccent: '#FFFFFF',

  danger: '#FF5C5C',
  success: '#3DD68C',
  warning: '#F5B841',

  /** Damier de transparence du canvas (utilisé à partir de la phase 3). */
  checkerLight: '#3A3E47',
  checkerDark: '#2A2D34',
} as const;

export type ColorToken = keyof typeof colors;
