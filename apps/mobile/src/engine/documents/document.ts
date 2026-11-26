import { DOCUMENT_FORMAT_VERSION, type DocumentSpec, type GraphicDocument } from './types';

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
    layers: [],
    createdAt: now,
    updatedAt: now,
  };
}
