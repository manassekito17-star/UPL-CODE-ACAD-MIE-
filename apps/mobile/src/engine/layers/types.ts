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
  /** Verrouillé : ni déplacement, ni transformation, ni suppression. */
  locked: boolean;
}

export type ShapeKind = 'rectangle';

/** Forme vectorielle. Phase 4 : rectangle ; cercle et ligne en phase 5. */
export interface ShapeLayer extends LayerBase {
  type: 'shape';
  shape: ShapeKind;
  /** Couleur de remplissage « #RRGGBB ». */
  fill: string;
}

/** Les calques texte et image s'ajouteront à cette union en phase 5. */
export type Layer = ShapeLayer;
