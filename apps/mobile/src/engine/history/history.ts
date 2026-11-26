import type { GraphicDocument } from '@/engine/documents/types';

/**
 * Historique d'un document : une suite d'états nommés (« Nouveau calque de
 * forme », « Déplacer »…) et la position courante.
 *
 * Chaque opération du moteur renvoie un NOUVEAU document sans modifier
 * l'ancien : un état est donc ce document lui-même, et revenir en arrière
 * consiste à le réafficher. Les calques inchangés sont partagés entre les
 * états (aucune copie) et les images ne sont que des références à des
 * fichiers : un état coûte quelques objets, jamais une image.
 */

/** Nombre d'états conservés (valeur par défaut des logiciels de retouche). */
export const HISTORY_LIMIT = 50;

export interface HistoryState {
  label: string;
  doc: GraphicDocument;
}

export interface History {
  /** Du plus ancien au plus récent. */
  states: readonly HistoryState[];
  /** Position de l'état affiché dans `states`. */
  index: number;
}

export function createHistory(doc: GraphicDocument, label: string): History {
  return { states: [{ label, doc }], index: 0 };
}

export function currentState(history: History): HistoryState {
  return history.states[history.index] as HistoryState;
}

/**
 * Ajoute un état après l'état courant. Les états « rétablissables » (après la
 * position courante) sont abandonnés, comme dans tout historique linéaire ;
 * au-delà de `limit`, les plus anciens sont oubliés.
 */
export function record(history: History, label: string, doc: GraphicDocument, limit = HISTORY_LIMIT): History {
  const kept = history.states.slice(0, history.index + 1);
  const states = [...kept, { label, doc }];
  const overflow = Math.max(0, states.length - Math.max(1, limit));
  return { states: states.slice(overflow), index: states.length - 1 - overflow };
}

export const canUndo = (history: History): boolean => history.index > 0;
export const canRedo = (history: History): boolean => history.index < history.states.length - 1;

/** Revient à l'état `index` (les états suivants restent disponibles pour Rétablir). */
export function goTo(history: History, index: number): History {
  if (!Number.isInteger(index) || index < 0 || index >= history.states.length) return history;
  return index === history.index ? history : { ...history, index };
}

export const undo = (history: History): History => goTo(history, history.index - 1);
export const redo = (history: History): History => goTo(history, history.index + 1);

/** Libellé de l'action que « Annuler » défait, ou null. */
export function undoLabel(history: History): string | null {
  return canUndo(history) ? currentState(history).label : null;
}

/** Libellé de l'action que « Rétablir » refait, ou null. */
export function redoLabel(history: History): string | null {
  return canRedo(history) ? (history.states[history.index + 1] as HistoryState).label : null;
}

/**
 * Supprime l'état `index` et tous les suivants ; l'état précédent devient
 * l'état courant. Le premier état ne peut pas être supprimé.
 */
export function deleteFrom(history: History, index: number): History {
  if (!Number.isInteger(index) || index < 1 || index >= history.states.length) return history;
  return { states: history.states.slice(0, index), index: Math.min(history.index, index - 1) };
}

/** Efface l'historique : seul l'état courant est conservé. */
export function clearHistory(history: History): History {
  return { states: [currentState(history)], index: 0 };
}
