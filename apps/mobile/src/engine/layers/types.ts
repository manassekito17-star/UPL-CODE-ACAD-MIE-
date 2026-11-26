/**
 * Modèle des calques.
 *
 * Géométrie : (x, y) est le coin supérieur gauche de la boîte du calque NON
 * tournée, dans le repère du document ; la rotation (degrés, sens horaire)
 * s'applique autour du centre de cette boîte.
 *
 * Ordre d'affichage : c'est l'index du calque dans `GraphicDocument.layers`
 * (0 = tout en bas, dernier = tout en haut). Un champ « ordre » séparé
 * pourrait se désynchroniser du tableau ; `layerOrder()` le donne à la demande.
 */

export type LayerType = 'shape' | 'text' | 'image';

export interface LayerBase {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrés, sens horaire, autour du centre ; normalisée dans ]-180, 180]. */
  rotation: number;
  /** 0 (invisible) à 1 (opaque). */
  opacity: number;
  visible: boolean;
  /** Verrouillé : ni déplacement, ni transformation, ni suppression, ni changement de style. */
  locked: boolean;
}

/**
 * Formes vectorielles, inscrites dans la boîte du calque :
 * - rectangle : la boîte ;
 * - ellipse : l'ellipse inscrite (un cercle si la boîte est carrée) ;
 * - ligne : segment horizontal de longueur `width` et d'épaisseur `height`,
 *   extrémités arrondies ; la rotation donne son angle.
 */
export type ShapeKind = 'rectangle' | 'ellipse' | 'line';

export interface ShapeLayer extends LayerBase {
  type: 'shape';
  shape: ShapeKind;
  /** Couleur « #RRGGBB ». */
  fill: string;
}

export type TextAlignment = 'left' | 'center' | 'right';

/**
 * Texte éditable (jamais aplati en image). Le texte revient à la ligne dans la
 * largeur du calque ; la hauteur suit le contenu quand le texte change.
 */
export interface TextLayer extends LayerBase {
  type: 'text';
  text: string;
  /** Taille en pixels du document. */
  fontSize: number;
  /** Couleur « #RRGGBB ». */
  color: string;
  align: TextAlignment;
  bold: boolean;
  /** Police embarquée (rendu identique sur toutes les plateformes et à l'export). */
  fontFamily: 'Inter';
}

/** Image importée : deux fichiers locaux, jamais l'image de la galerie elle-même. */
export interface ImageAsset {
  /** Copie de travail (JPEG ou PNG, taille bornée) affichée et exportée. */
  uri: string;
  /** Dimensions en pixels de la copie de travail. */
  width: number;
  height: number;
  /** Copie octet pour octet du fichier choisi, conservée intacte. */
  originalUri: string;
  originalWidth: number;
  originalHeight: number;
  /** Nom du fichier d'origine, s'il est connu. */
  fileName: string | null;
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  asset: ImageAsset;
}

export type Layer = ShapeLayer | TextLayer | ImageLayer;
