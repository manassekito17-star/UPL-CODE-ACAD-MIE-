import { TOOL_FAMILIES } from '@/screens/editor/toolFamilies';

/**
 * Raccourcis clavier de l'application, sur le modèle des logiciels de
 * retouche. Chaque commande est réellement exécutée (voir useShortcuts) ;
 * un raccourci d'outil pas encore disponible l'annonce au lieu d'agir.
 */

export type CommandId =
  | 'file.new'
  | 'file.open'
  | 'file.save'
  | 'file.saveAs'
  | 'file.saveCopy'
  | 'file.close'
  | 'file.exportAs'
  | 'edit.undo'
  | 'edit.redo'
  | 'layer.duplicate'
  | 'layer.delete'
  | 'view.fit'
  | 'view.actual'
  | 'view.zoomIn'
  | 'view.zoomOut'
  | 'view.rulers'
  | 'view.panels'
  | 'color.default'
  | 'color.swap'
  | 'help.shortcuts';

export interface ShortcutDef {
  chord: string;
  command: CommandId;
  label: string;
  group: 'Fichier' | 'Édition' | 'Calque' | 'Affichage' | 'Couleurs' | 'Aide';
}

export const SHORTCUTS: readonly ShortcutDef[] = [
  { chord: 'mod+n', command: 'file.new', label: 'Nouveau document', group: 'Fichier' },
  { chord: 'mod+o', command: 'file.open', label: 'Ouvrir un fichier', group: 'Fichier' },
  { chord: 'mod+s', command: 'file.save', label: 'Enregistrer', group: 'Fichier' },
  { chord: 'mod+shift+s', command: 'file.saveAs', label: 'Enregistrer sous', group: 'Fichier' },
  { chord: 'mod+alt+s', command: 'file.saveCopy', label: 'Enregistrer une copie', group: 'Fichier' },
  { chord: 'mod+w', command: 'file.close', label: 'Fermer', group: 'Fichier' },
  { chord: 'mod+alt+shift+w', command: 'file.exportAs', label: 'Exporter sous', group: 'Fichier' },
  { chord: 'mod+z', command: 'edit.undo', label: 'Annuler', group: 'Édition' },
  { chord: 'mod+shift+z', command: 'edit.redo', label: 'Rétablir', group: 'Édition' },
  { chord: 'mod+y', command: 'edit.redo', label: 'Rétablir', group: 'Édition' },
  { chord: 'mod+j', command: 'layer.duplicate', label: 'Dupliquer le calque', group: 'Calque' },
  { chord: 'delete', command: 'layer.delete', label: 'Supprimer le calque', group: 'Calque' },
  { chord: 'backspace', command: 'layer.delete', label: 'Supprimer le calque', group: 'Calque' },
  { chord: 'mod+0', command: 'view.fit', label: 'Ajuster à l’écran', group: 'Affichage' },
  { chord: 'mod+1', command: 'view.actual', label: '100 %', group: 'Affichage' },
  { chord: 'mod+=', command: 'view.zoomIn', label: 'Zoom avant', group: 'Affichage' },
  { chord: 'mod+-', command: 'view.zoomOut', label: 'Zoom arrière', group: 'Affichage' },
  { chord: 'mod+r', command: 'view.rulers', label: 'Règles', group: 'Affichage' },
  { chord: 'tab', command: 'view.panels', label: 'Afficher / masquer les panneaux', group: 'Affichage' },
  { chord: 'f', command: 'view.panels', label: 'Mode plein écran', group: 'Affichage' },
  { chord: 'd', command: 'color.default', label: 'Couleurs par défaut', group: 'Couleurs' },
  { chord: 'x', command: 'color.swap', label: 'Permuter les couleurs', group: 'Couleurs' },
  { chord: 'mod+/', command: 'help.shortcuts', label: 'Raccourcis clavier', group: 'Aide' },
];

/** Raccourci affiché à côté d'une commande (premier défini). */
export function chordFor(command: CommandId): string | undefined {
  return SHORTCUTS.find((s) => s.command === command)?.chord;
}

/** Lettre (minuscule) de chaque famille d'outils : « v » → déplacement, « b » → pinceaux… */
export const TOOL_KEYS: ReadonlyMap<string, string> = new Map(TOOL_FAMILIES.map((f) => [f.shortcut.toLowerCase(), f.id]));

/** Combinaisons interceptées (le module natif Android ne retient que celles-ci). */
export function allChords(): string[] {
  const letters = [...TOOL_KEYS.keys()].flatMap((k) => [k, `shift+${k}`]);
  return [...new Set([...SHORTCUTS.map((s) => s.chord), ...letters])];
}
