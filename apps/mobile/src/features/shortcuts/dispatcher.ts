import { create } from 'zustand';

import type { CanvasController } from '@/engine/canvas';

/**
 * Répartition des raccourcis : l'écran au premier plan (le dernier monté :
 * l'éditeur au-dessus de l'accueil) reçoit les combinaisons tapées.
 */
type Handler = (chord: string) => boolean;
const handlers: Handler[] = [];

export function pushShortcutHandler(handler: Handler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Transmet une combinaison au gestionnaire du premier plan ; vrai si elle a été traitée. */
export function dispatchChord(chord: string): boolean {
  const top = handlers[handlers.length - 1];
  return top ? top(chord) : false;
}

/** Toile visible (téléphone ou studio), pour les raccourcis de zoom. */
let activeCanvas: { current: CanvasController | null } | null = null;
export function registerCanvas(ref: { current: CanvasController | null }): () => void {
  activeCanvas = ref;
  return () => {
    if (activeCanvas === ref) activeCanvas = null;
  };
}
export function activeCanvasController(): CanvasController | null {
  return activeCanvas?.current ?? null;
}

/** Message bref (outil pas encore disponible, commande sans objet…). */
export const useToast = create<{ message: string | null; show: (m: string) => void; hide: () => void }>()((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));

/** Aide « Raccourcis clavier » ouverte. */
export const useShortcutHelp = create<{ open: boolean; setOpen: (v: boolean) => void }>()((set) => ({ open: false, setOpen: (open) => set({ open }) }));
