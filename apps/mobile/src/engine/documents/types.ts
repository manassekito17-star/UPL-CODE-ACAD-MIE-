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
 * Document graphique. Les calques s'ajouteront en phase 4 : le modèle évoluera
 * avant d'être enregistré pour la première fois (phase 7).
 */
export interface GraphicDocument {
  formatVersion: typeof DOCUMENT_FORMAT_VERSION;
  id: string;
  name: string;
  width: number;
  height: number;
  background: DocumentBackground;
  /** Horodatages en millisecondes depuis l'époque Unix. */
  createdAt: number;
  updatedAt: number;
}
