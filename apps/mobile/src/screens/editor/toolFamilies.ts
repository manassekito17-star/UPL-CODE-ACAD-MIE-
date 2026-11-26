import type { IconName } from '@/components/ui';
import type { ToolId } from '@/engine/canvas';

/**
 * Les 51 outils de l'espace de travail, en 20 familles (une icône par famille
 * dans la barre d'outils, la famille s'ouvre par un appui long ou un second
 * appui). Chaque outil déclare honnêtement son état :
 * - `ok` : fonctionnel ;
 * - `partial` : fonctionnel avec une limite décrite dans `note` ;
 * - `todo` : non développé, désactivé, avec le module qui le livrera.
 */

export type ToolStatus = 'ok' | 'partial' | 'todo';

/** Ce que fait l'outil quand on le choisit. */
export type ToolBehavior =
  | { kind: 'mode'; mode: ToolId }
  | { kind: 'insert'; insert: 'text' | 'rectangle' | 'ellipse' | 'line'; mode: ToolId }
  | { kind: 'none' };

export interface ToolItem {
  key: string;
  label: string;
  icon: IconName;
  status: ToolStatus;
  /** Module du plan qui livrera l'outil (état `todo`) ou limite actuelle (`partial`). */
  note?: string;
  behavior: ToolBehavior;
}

export interface ToolFamily {
  id: string;
  label: string;
  shortcut: string;
  items: readonly ToolItem[];
}

const todo = (key: string, label: string, icon: IconName, module: string): ToolItem => ({
  key,
  label,
  icon,
  status: 'todo',
  note: module,
  behavior: { kind: 'none' },
});

export const TOOL_FAMILIES: readonly ToolFamily[] = [
  {
    id: 'move',
    label: 'Déplacement',
    shortcut: 'V',
    items: [{ key: 'move', label: 'Déplacement', icon: 'cursor-move', status: 'ok', behavior: { kind: 'mode', mode: 'select' } }],
  },
  {
    id: 'marquee',
    label: 'Sélections de forme',
    shortcut: 'M',
    items: [
      todo('marquee-rect', 'Sélection rectangulaire', 'select', 'M6'),
      todo('marquee-ellipse', 'Sélection elliptique', 'selection-ellipse', 'M6'),
      todo('marquee-row', 'Sélection de ligne', 'dots-horizontal', 'M6'),
      todo('marquee-column', 'Sélection de colonne', 'dots-vertical', 'M6'),
    ],
  },
  {
    id: 'lasso',
    label: 'Lassos',
    shortcut: 'L',
    items: [
      todo('lasso', 'Lasso', 'lasso', 'M6'),
      todo('lasso-polygon', 'Lasso polygonal', 'vector-polygon', 'M6'),
      todo('lasso-magnetic', 'Lasso magnétique', 'magnet', 'M6'),
    ],
  },
  {
    id: 'smart-select',
    label: 'Sélection intelligente',
    shortcut: 'W',
    items: [
      todo('quick-select', 'Sélection rapide', 'auto-fix', 'M6'),
      todo('magic-wand', 'Baguette magique', 'magic-staff', 'M6'),
      todo('select-subject', 'Sélection de sujet', 'account-box-outline', 'M18'),
    ],
  },
  {
    id: 'crop',
    label: 'Recadrage',
    shortcut: 'C',
    items: [todo('crop', 'Recadrage', 'crop', 'M14'), todo('slice', 'Tranche', 'knife', 'M14')],
  },
  {
    id: 'eyedropper',
    label: 'Pipettes',
    shortcut: 'I',
    items: [todo('eyedropper', 'Pipette', 'eyedropper', 'M8'), todo('color-sampler', 'Échantillonneur de couleurs', 'eyedropper-plus', 'M8')],
  },
  {
    id: 'healing',
    label: 'Correcteurs',
    shortcut: 'J',
    items: [todo('spot-healing', 'Correcteur localisé', 'bandage', 'M11'), todo('healing', 'Correcteur', 'medical-bag', 'M11')],
  },
  {
    id: 'stamp',
    label: 'Tampons',
    shortcut: 'S',
    items: [todo('clone-stamp', 'Tampon de duplication', 'stamper', 'M11'), todo('pattern-stamp', 'Tampon de motif', 'texture-box', 'M11')],
  },
  {
    id: 'brush',
    label: 'Pinceaux',
    shortcut: 'B',
    items: [
      todo('brush', 'Pinceau', 'brush', 'M5'),
      todo('pencil', 'Crayon', 'pencil', 'M5'),
      todo('color-replace', 'Remplacement de couleur', 'brush-variant', 'M11'),
      todo('mixer-brush', 'Pinceau mélangeur', 'water-outline', 'M11'),
    ],
  },
  { id: 'history-brush', label: 'Pinceau historique', shortcut: 'Y', items: [todo('history-brush', 'Pinceau historique', 'history', 'M5 + M2')] },
  {
    id: 'eraser',
    label: 'Gommes',
    shortcut: 'E',
    items: [
      todo('eraser', 'Gomme', 'eraser', 'M5'),
      todo('magic-eraser', 'Gomme magique', 'eraser-variant', 'M6'),
      todo('background-eraser', 'Gomme d’arrière-plan', 'image-filter-center-focus-weak', 'M11'),
    ],
  },
  {
    id: 'fill',
    label: 'Remplissages',
    shortcut: 'G',
    items: [todo('gradient', 'Dégradé', 'gradient-horizontal', 'M5'), todo('paint-bucket', 'Pot de peinture', 'format-color-fill', 'M5')],
  },
  {
    id: 'blur',
    label: 'Flou, netteté, doigt',
    shortcut: 'R',
    items: [todo('blur', 'Flou', 'water', 'M11'), todo('sharpen', 'Netteté', 'triangle-outline', 'M11'), todo('smudge', 'Doigt', 'gesture-tap', 'M11')],
  },
  {
    id: 'dodge',
    label: 'Densité',
    shortcut: 'O',
    items: [todo('dodge', 'Densité moins', 'circle-half-full', 'M11'), todo('burn', 'Densité plus', 'fire', 'M11'), todo('sponge', 'Éponge', 'water-opacity', 'M11')],
  },
  {
    id: 'pen',
    label: 'Plumes',
    shortcut: 'P',
    items: [
      todo('pen', 'Plume', 'fountain-pen-tip', 'M12'),
      todo('freeform-pen', 'Plume libre', 'draw', 'M12'),
      todo('curvature-pen', 'Plume de courbure', 'vector-curve', 'M12'),
    ],
  },
  {
    id: 'type',
    label: 'Texte',
    shortcut: 'T',
    items: [
      {
        key: 'type-horizontal',
        label: 'Texte horizontal',
        icon: 'format-text',
        status: 'partial',
        note: 'insère un texte au centre ; placement au doigt : M13',
        behavior: { kind: 'insert', insert: 'text', mode: 'select' },
      },
      todo('type-vertical', 'Texte vertical', 'format-text-rotation-vertical', 'M13'),
      todo('type-mask', 'Masque de texte', 'format-text-variant-outline', 'M13'),
    ],
  },
  {
    id: 'path-select',
    label: 'Sélection de tracé',
    shortcut: 'A',
    items: [todo('path-select', 'Sélection de tracé', 'cursor-default', 'M12'), todo('direct-select', 'Sélection directe', 'cursor-default-outline', 'M12')],
  },
  {
    id: 'shape',
    label: 'Formes',
    shortcut: 'U',
    items: [
      {
        key: 'shape-rectangle',
        label: 'Rectangle',
        icon: 'square-outline',
        status: 'partial',
        note: 'insère au centre ; tracé au doigt : M12',
        behavior: { kind: 'insert', insert: 'rectangle', mode: 'select' },
      },
      todo('shape-rounded', 'Rectangle arrondi', 'square-rounded-outline', 'M12'),
      {
        key: 'shape-ellipse',
        label: 'Ellipse',
        icon: 'circle-outline',
        status: 'partial',
        note: 'insère au centre ; tracé au doigt : M12',
        behavior: { kind: 'insert', insert: 'ellipse', mode: 'select' },
      },
      todo('shape-polygon', 'Polygone', 'hexagon-outline', 'M12'),
      {
        key: 'shape-line',
        label: 'Ligne',
        icon: 'minus',
        status: 'partial',
        note: 'insère au centre ; tracé au doigt : M12',
        behavior: { kind: 'insert', insert: 'line', mode: 'select' },
      },
      todo('shape-custom', 'Forme personnalisée', 'shape-outline', 'M12'),
    ],
  },
  {
    id: 'hand',
    label: 'Main',
    shortcut: 'H',
    items: [{ key: 'hand', label: 'Main', icon: 'hand-back-right-outline', status: 'ok', behavior: { kind: 'mode', mode: 'pan' } }],
  },
  {
    id: 'zoom',
    label: 'Zoom',
    shortcut: 'Z',
    items: [
      {
        key: 'zoom',
        label: 'Zoom',
        icon: 'magnify',
        status: 'partial',
        note: 'commandes de zoom dans la barre d’options ; clic pour zoomer : M16',
        behavior: { kind: 'mode', mode: 'pan' },
      },
    ],
  },
];

export const ALL_TOOLS: readonly ToolItem[] = TOOL_FAMILIES.flatMap((f) => f.items);

export function findTool(key: string): ToolItem | undefined {
  return ALL_TOOLS.find((t) => t.key === key);
}

export function familyOf(key: string): ToolFamily | undefined {
  return TOOL_FAMILIES.find((f) => f.items.some((t) => t.key === key));
}

export function isUsable(tool: ToolItem): boolean {
  return tool.status !== 'todo';
}
