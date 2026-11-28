import { DOCUMENT_LIMITS, estimateLayerBytes, formatBytes } from './limits';
import type { DocumentBackground, DocumentSpec } from './types';
import { formatNumber, parsePositive, toPixels, toPpi, type LengthUnit, type ResolutionUnit } from './units';

/** Saisie brute du formulaire de création (les champs texte restent des chaînes). */
export interface DocumentFormInput {
  width: string;
  height: string;
  background: DocumentBackground;
  name: string;
  /** Unité de largeur et hauteur (pixels par défaut). */
  unit?: LengthUnit;
  /** Résolution saisie (72 par défaut). */
  resolution?: string;
  resolutionUnit?: ResolutionUnit;
  /** Couleur du fond `color`. */
  backgroundColor?: string;
}

/** Résolution acceptée, en pixels par pouce. */
export const RESOLUTION_LIMITS = { min: 1, max: 9999 } as const;

export type ValidationField = 'width' | 'height' | 'size' | 'name' | 'resolution' | 'background';

export interface ValidationIssue {
  field: ValidationField;
  message: string;
}

export type DocumentValidation =
  | { ok: true; spec: DocumentSpec; warnings: string[] }
  | { ok: false; errors: ValidationIssue[]; warnings: string[] };

export const DEFAULT_DOCUMENT_NAME = 'Sans titre';

const INTEGER = /^\d+$/;
const BACKGROUNDS: readonly DocumentBackground[] = ['white', 'black', 'transparent', 'color'];
const HEX = /^#[0-9A-Fa-f]{6}$/;

function fmt(n: number): string {
  // Séparateur de milliers français (espace insécable fine).
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function parseDimension(raw: string, field: 'width' | 'height', errors: ValidationIssue[], unit: LengthUnit, ppi: number | null): number | null {
  const label = field === 'width' ? 'La largeur' : 'La hauteur';
  const text = raw.trim();
  if (text === '') {
    errors.push({ field, message: `${label} est obligatoire.` });
    return null;
  }
  let value: number;
  if (unit === 'px') {
    if (!INTEGER.test(text)) {
      errors.push({ field, message: `${label} doit être un nombre entier de pixels.` });
      return null;
    }
    value = Number.parseInt(text, 10);
  } else {
    const n = parsePositive(text);
    if (n === null) {
      errors.push({ field, message: `${label} doit être un nombre positif.` });
      return null;
    }
    if (ppi === null) return null; // la résolution invalide est signalée à part
    value = toPixels(n, unit, ppi);
  }
  if (value < DOCUMENT_LIMITS.minDimension || value > DOCUMENT_LIMITS.maxDimension) {
    errors.push({
      field,
      message:
        unit === 'px'
          ? `${label} doit être comprise entre ${DOCUMENT_LIMITS.minDimension} et ${fmt(DOCUMENT_LIMITS.maxDimension)} px.`
          : `${label} donne ${fmt(value)} px à cette résolution : elle doit être comprise entre ${DOCUMENT_LIMITS.minDimension} et ${fmt(DOCUMENT_LIMITS.maxDimension)} px.`,
    });
    return null;
  }
  return value;
}

function parseResolution(input: DocumentFormInput, errors: ValidationIssue[]): number | null {
  const text = input.resolution ?? '72';
  const n = parsePositive(text);
  const ppi = n === null ? null : toPpi(n, input.resolutionUnit ?? 'ppi');
  if (ppi === null || ppi < RESOLUTION_LIMITS.min || ppi > RESOLUTION_LIMITS.max) {
    errors.push({ field: 'resolution', message: `La résolution doit être comprise entre ${RESOLUTION_LIMITS.min} et ${fmt(RESOLUTION_LIMITS.max)} pixels/pouce.` });
    return null;
  }
  return Math.round(ppi * 1000) / 1000;
}

/** Nom nettoyé : espaces superflus retirés, « Sans titre » si vide. */
export function normalizeDocumentName(raw: string): string {
  const name = raw.replace(/\s+/g, ' ').trim();
  return name === '' ? DEFAULT_DOCUMENT_NAME : name;
}

/**
 * Valide la saisie du formulaire. Refuse les tailles qui mettraient la
 * mémoire de l'appareil en danger (voir DOCUMENT_LIMITS).
 */
export function validateDocumentInput(input: DocumentFormInput): DocumentValidation {
  const errors: ValidationIssue[] = [];
  const warnings: string[] = [];

  const unit = input.unit ?? 'px';
  const resolution = parseResolution(input, errors);
  const width = parseDimension(input.width, 'width', errors, unit, resolution);
  const height = parseDimension(input.height, 'height', errors, unit, resolution);

  if (width !== null && height !== null) {
    const pixels = width * height;
    if (pixels > DOCUMENT_LIMITS.maxPixels) {
      errors.push({
        field: 'size',
        message:
          `Document trop grand : ${fmt(pixels)} pixels pour un maximum de ${fmt(DOCUMENT_LIMITS.maxPixels)} ` +
          `(4096 × 4096). Chaque calque occuperait ${formatBytes(estimateLayerBytes(width, height))} de mémoire.`,
      });
    } else if (pixels > DOCUMENT_LIMITS.warnPixels) {
      warnings.push(
        `Grand document : chaque calque occupera ${formatBytes(estimateLayerBytes(width, height))} de mémoire. ` +
          `L'édition peut être lente sur un appareil modeste.`,
      );
    }
  }

  if (!BACKGROUNDS.includes(input.background)) {
    errors.push({ field: 'background', message: 'Fond de document inconnu.' });
  } else if (input.background === 'color' && !HEX.test(input.backgroundColor ?? '')) {
    errors.push({ field: 'background', message: 'Couleur de fond invalide (ex. #3685FF).' });
  }

  const name = normalizeDocumentName(input.name);
  if (name.length > DOCUMENT_LIMITS.maxNameLength) {
    errors.push({ field: 'name', message: `Le nom ne doit pas dépasser ${DOCUMENT_LIMITS.maxNameLength} caractères.` });
  }

  if (errors.length > 0 || width === null || height === null || resolution === null) {
    return { ok: false, errors, warnings };
  }
  const spec: DocumentSpec = { width, height, background: input.background, name, resolution };
  if (input.background === 'color') spec.backgroundColor = (input.backgroundColor ?? '').toUpperCase();
  if (unit !== 'px') warnings.push(`Taille en pixels : ${fmt(width)} × ${fmt(height)} px à ${formatNumber(resolution)} pixels/pouce.`);
  return { ok: true, spec, warnings };
}
