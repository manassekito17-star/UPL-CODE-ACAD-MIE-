import { AppState } from 'react-native';
import { create } from 'zustand';

import type { GraphicDocument } from '@/engine/documents';
import { referencedFiles } from '@/engine/project';
import { assetFiles, getProjectRepository, orphanFiles, relocateAssets, thumbnailFiles, type UnreadableProject } from '@/services/projects';
import { useDocumentStore } from '@/stores/documentStore';

import { Autosaver, type SaveStatus } from './autosave';

export interface PersistenceState {
  phase: 'idle' | 'loading' | 'ready' | 'failed';
  loadError: string | null;
  /** Projets présents sur l'appareil mais illisibles (gardés tels quels, jamais écrasés). */
  unreadable: readonly UnreadableProject[];
  saves: Readonly<Record<string, SaveStatus>>;
}

export const usePersistenceStore = create<PersistenceState>()(() => ({
  phase: 'idle',
  loadError: null,
  unreadable: [],
  saves: {},
}));

/** Délai de regroupement des modifications avant écriture ; null désactive l'écriture automatique (tests). */
let autosaveDelayMs: number | null = 600;
let autosaver: Autosaver | null = null;
let stopFns: (() => void)[] = [];
let starting: Promise<void> | null = null;

export function configurePersistence(options: { autosaveDelayMs: number | null }): void {
  autosaveDelayMs = options.autosaveDelayMs;
}

function setSave(id: string, status: SaveStatus | null) {
  usePersistenceStore.setState((s) => {
    const { [id]: _old, ...rest } = s.saves;
    return { saves: status ? { ...rest, [id]: status } : rest };
  });
}

/** Toutes les URI d'images encore utilisées : documents ET états d'historique (Annuler peut les ramener). */
function filesInUse(): string[] {
  const { documents, histories } = useDocumentStore.getState();
  const docs: GraphicDocument[] = [...Object.values(documents), ...Object.values(histories).flatMap((h) => h.states.map((st) => st.doc))];
  return docs.flatMap(referencedFiles);
}

/**
 * Démarre l'enregistrement : charge les projets de l'appareil, rattache leurs
 * images au dossier actuel, supprime les images orphelines, puis enregistre
 * automatiquement chaque modification. Idempotent.
 */
export function startPersistence(): Promise<void> {
  starting ??= (async () => {
    usePersistenceStore.setState({ phase: 'loading', loadError: null });
    const repo = getProjectRepository();
    let loaded;
    try {
      loaded = await repo.loadAll();
    } catch (error) {
      starting = null;
      usePersistenceStore.setState({ phase: 'failed', loadError: error instanceof Error ? error.message : String(error) });
      return;
    }
    const dir = assetFiles.directoryUri();
    const relocated = loaded.documents.map((d) => relocateAssets(d, dir));
    useDocumentStore.getState().hydrate(relocated);

    // Au démarrage seulement, avant toute importation : une image que plus
    // aucun projet ne référence est supprimée.
    assetFiles.remove(orphanFiles(assetFiles.list(), filesInUse()));
    const known = useDocumentStore.getState().documents;
    for (const id of thumbnailFiles.list()) if (!known[id] && !loaded.unreadable.some((u) => u.id === id)) thumbnailFiles.remove(id);

    if (autosaveDelayMs !== null) {
      const saver = new Autosaver({
        repo,
        delayMs: autosaveDelayMs,
        now: Date.now,
        setTimer: (fn, ms) => setTimeout(fn, ms),
        clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
        onStatus: setSave,
        onRemoved: (doc) => {
          const inUse = new Set(filesInUse());
          assetFiles.remove(referencedFiles(doc).filter((uri) => !inUse.has(uri)));
          thumbnailFiles.remove(doc.id);
        },
      });
      // Les documents relocalisés diffèrent de ceux de l'appareil : ils seront réécrits.
      saver.markWritten(loaded.documents.filter((d, i) => relocated[i] === d));
      autosaver = saver;
      saver.update(useDocumentStore.getState().documents);
      stopFns.push(useDocumentStore.subscribe((s) => saver.update(s.documents)));
      const sub = AppState.addEventListener('change', (next) => {
        if (next !== 'active') void saver.flush();
      });
      stopFns.push(() => sub.remove());
    }
    usePersistenceStore.setState({ phase: 'ready', unreadable: loaded.unreadable });
  })();
  return starting;
}

/** Enregistre tout de suite (menu Fichier › Enregistrer). */
export async function saveNow(): Promise<void> {
  await autosaver?.flush();
}

/** Supprime de l'appareil un projet illisible (choix explicite de l'utilisateur). */
export async function removeUnreadable(id: string): Promise<void> {
  await getProjectRepository().remove(id);
  usePersistenceStore.setState((s) => ({ unreadable: s.unreadable.filter((u) => u.id !== id) }));
}

/** Arrête tout et revient à l'état initial (tests). */
export function stopPersistence(): void {
  autosaver?.stop();
  autosaver = null;
  for (const fn of stopFns) fn();
  stopFns = [];
  starting = null;
  usePersistenceStore.setState({ phase: 'idle', loadError: null, unreadable: [], saves: {} });
}
