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
 * incompatible du modèle ; les migrations arriveront avec la sauvegarde (phase 7).
 */
export const DOCUMENT_FORMAT_VERSION = 1 as const;

/**
 * Document graphique. Le format n'a encore jamais été enregistré (phase 7) :
 * il peut évoluer sans migration jusque-là.
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
