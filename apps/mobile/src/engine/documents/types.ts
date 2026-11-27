import type { Layer } from '@/engine/layers/types';

/** Fond d'un document. `transparent` conserve le canal alpha à l'export. */
export type DocumentBackground = 'white' | 'black' | 'transparent';

export type Orientation = 'portrait' | 'landscape';

/** Caractéristiques validées d'un nouveau document (en pixels du document). */
export interface DocumentSpec {
  width: number;
  height: number;
  background: DocumentBackground;
  name: string;
}

/**
 * Version du format natif de document. À incrémenter à chaque changement
 * incompatible du modèle, avec une migration dans engine/project/serialization.ts.
 */
export const DOCUMENT_FORMAT_VERSION = 1 as const;

/**
 * Document graphique, enregistré au format de engine/project (module M3).
 */
export interface GraphicDocument {
  formatVersion: typeof DOCUMENT_FORMAT_VERSION;
  id: string;
  name: string;
  width: number;
  height: number;
  background: DocumentBackground;
  /** Pile de calques, du bas (index 0) vers le haut. */
  layers: Layer[];
  /** Horodatages en millisecondes depuis l'époque Unix. */
  createdAt: number;
  updatedAt: number;
}
