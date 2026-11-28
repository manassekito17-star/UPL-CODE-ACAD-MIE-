import type { Layer } from '@/engine/layers/types';

/**
 * Fond d'un document. `transparent` conserve le canal alpha à l'export ;
 * `color` utilise `backgroundColor`.
 */
export type DocumentBackground = 'white' | 'black' | 'transparent' | 'color';

export type Orientation = 'portrait' | 'landscape';

/** Caractéristiques validées d'un nouveau document (en pixels du document). */
export interface DocumentSpec {
  width: number;
  height: number;
  background: DocumentBackground;
  name: string;
  /** Pixels par pouce (métadonnée d'impression ; 72 par défaut). */
  resolution?: number;
  /** Couleur du fond `color` (« #RRGGBB »). */
  backgroundColor?: string;
}

/**
 * Version du format natif de document. À incrémenter à chaque changement
 * incompatible du modèle, avec une migration dans engine/project/serialization.ts.
 */
export const DOCUMENT_FORMAT_VERSION = 2 as const;

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
  /** Couleur effective du fond (« #RRGGBB ») : blanc, noir ou personnalisée ; ignorée si transparent. */
  backgroundColor: string;
  /**
   * Résolution en pixels par pouce. Ne change pas les pixels : elle relie la
   * taille en pixels à une taille d'impression (cm, mm, pouces) et est écrite
   * dans les fichiers exportés.
   */
  resolution: number;
  /** Pile de calques, du bas (index 0) vers le haut. */
  layers: Layer[];
  /** Horodatages en millisecondes depuis l'époque Unix. */
  createdAt: number;
  updatedAt: number;
}
