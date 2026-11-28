import { DOCUMENT_FORMAT_VERSION, type DocumentBackground, type DocumentSpec, type GraphicDocument } from './types';

export const DEFAULT_RESOLUTION = 72;

/** Couleur effective d'un fond (celle de `color`, sinon blanc ou noir). */
export function backgroundColorOf(background: DocumentBackground, custom?: string): string {
  if (background === 'black') return '#000000';
  if (background === 'color' && custom) return custom.toUpperCase();
  return '#FFFFFF';
}

export interface CreateDocumentDeps {
  id: string;
  now: number;
}

/**
 * Crée un document à partir d'une spécification déjà validée
 * (voir validateDocumentInput). L'identifiant et l'horloge sont injectés pour
 * que la fonction reste pure et testable.
 */
export function createDocument(spec: DocumentSpec, { id, now }: CreateDocumentDeps): GraphicDocument {
  return {
    formatVersion: DOCUMENT_FORMAT_VERSION,
    id,
    name: spec.name,
    width: spec.width,
    height: spec.height,
    background: spec.background,
    backgroundColor: backgroundColorOf(spec.background, spec.backgroundColor),
    resolution: spec.resolution ?? DEFAULT_RESOLUTION,
    layers: [],
    guides: [],
    createdAt: now,
    updatedAt: now,
  };
}
