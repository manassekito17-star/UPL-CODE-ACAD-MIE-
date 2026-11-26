import { DOCUMENT_LIMITS, estimateLayerBytes, formatBytes } from './limits';
import type { DocumentBackground, DocumentSpec } from './types';

/** Saisie brute du formulaire de création (les champs texte restent des chaînes). */
export interface DocumentFormInput {
  width: string;
  height: string;
  background: DocumentBackground;
  name: string;
}

export type ValidationField = 'width' | 'height' | 'size' | 'name';

export interface ValidationIssue {
  field: ValidationField;
  message: string;
}

export type DocumentValidation =
  | { ok: true; spec: DocumentSpec; warnings: string[] }
  | { ok: false; errors: ValidationIssue[]; warnings: string[] };

export const DEFAULT_DOCUMENT_NAME = 'Sans titre';

const INTEGER = /^\d+$/;
const BACKGROUNDS: readonly DocumentBackground[] = ['white', 'black', 'transparent'];

function fmt(n: number): string {
  // Séparateur de milliers français (espace insécable fine).
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function parseDimension(raw: string, field: 'width' | 'height', errors: ValidationIssue[]): number | null {
  const label = field === 'width' ? 'La largeur' : 'La hauteur';
  const text = raw.trim();
  if (text === '') {
    errors.push({ field, message: `${label} est obligatoire.` });
    return null;
  }
  if (!INTEGER.test(text)) {
    errors.push({ field, message: `${label} doit être un nombre entier de pixels.` });
    return null;
  }
  const value = Number.parseInt(text, 10);
  if (value < DOCUMENT_LIMITS.minDimension || value > DOCUMENT_LIMITS.maxDimension) {
    errors.push({
      field,
      message: `${label} doit être comprise entre ${DOCUMENT_LIMITS.minDimension} et ${fmt(DOCUMENT_LIMITS.maxDimension)} px.`,
    });
    return null;
  }
  return value;
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

  const width = parseDimension(input.width, 'width', errors);
  const height = parseDimension(input.height, 'height', errors);

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
    errors.push({ field: 'size', message: 'Fond de document inconnu.' });
  }

  const name = normalizeDocumentName(input.name);
  if (name.length > DOCUMENT_LIMITS.maxNameLength) {
    errors.push({ field: 'name', message: `Le nom ne doit pas dépasser ${DOCUMENT_LIMITS.maxNameLength} caractères.` });
  }

  if (errors.length > 0 || width === null || height === null) {
    return { ok: false, errors, warnings };
  }
  return { ok: true, spec: { width, height, background: input.background, name }, warnings };
}
