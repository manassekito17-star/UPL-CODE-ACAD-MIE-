import { router } from 'expo-router';
import { create } from 'zustand';

import { discardChanges, isDirty, openPackageFile, saveDocument, type SaveResult } from '@/features/persistence';
import { useDocumentStore } from '@/stores/documentStore';

/**
 * Fenêtres du menu Fichier, partagées par le téléphone et la tablette :
 * « Enregistrer sous » / « Enregistrer une copie », confirmation avant
 * fermeture, informations du document, messages.
 */
export interface FileDialogsState {
  saveAs: { documentId: string; mode: 'saveAs' | 'copy'; then?: (newId: string) => void } | null;
  /** Documents à fermer, dans l'ordre ; ceux qui ont des modifications sont proposés un par un. */
  closing: { queue: string[]; discard: string[]; after: (discarded: string[]) => void } | null;
  infoFor: string | null;
  message: string | null;
}

export const useFileDialogs = create<FileDialogsState>()(() => ({ saveAs: null, closing: null, infoFor: null, message: null }));

export function resetFileDialogs(): void {
  useFileDialogs.setState({ saveAs: null, closing: null, infoFor: null, message: null });
}

export function showFileMessage(message: string | null): void {
  useFileDialogs.setState({ message });
}

export function openProject(id: string, replace = false): void {
  const target = { pathname: '/editor/[projectId]', params: { projectId: id } } as const;
  if (replace) router.replace(target);
  else router.push(target);
}

/** Fichier › Enregistrer : enregistre, ou ouvre « Enregistrer sous » pour un document jamais enregistré. */
export async function commandSave(id: string, then?: (newId: string) => void): Promise<SaveResult> {
  const result = await saveDocument(id);
  if (!result.ok && result.reason === 'needsSaveAs') useFileDialogs.setState({ saveAs: { documentId: id, mode: 'saveAs', then } });
  else if (!result.ok && result.reason === 'error') showFileMessage(`Enregistrement impossible : ${result.message}`);
  else if (result.ok) then?.(result.id);
  return result;
}

export function commandSaveAs(id: string, then?: (newId: string) => void): void {
  useFileDialogs.setState({ saveAs: { documentId: id, mode: 'saveAs', then } });
}

export function commandSaveCopy(id: string): void {
  useFileDialogs.setState({ saveAs: { documentId: id, mode: 'copy' } });
}

export function commandInfo(id: string): void {
  useFileDialogs.setState({ infoFor: id });
}

/**
 * Fermer des documents. Ceux qui ont des modifications non enregistrées
 * sont proposés un par un (Enregistrer / Ne pas enregistrer / Annuler) ;
 * `after` est appelé quand tout est réglé, puis les documents à abandonner
 * le sont. Annuler arrête tout.
 */
export function commandClose(ids: readonly string[], after: () => void): void {
  const queue = ids.filter((id) => useDocumentStore.getState().documents[id] && isDirty(id));
  if (queue.length === 0) {
    after();
    return;
  }
  useFileDialogs.setState({
    closing: {
      queue,
      discard: [],
      after: (discarded) => {
        after();
        // Après la navigation : l'écran du document abandonné n'est plus affiché.
        setTimeout(() => {
          for (const id of discarded) void discardChanges(id);
        }, 0);
      },
    },
  });
}

/** Fichier › Ouvrir : un fichier « .zdesign » choisi par l'utilisateur. */
export async function commandOpenFile(): Promise<void> {
  const result = await openPackageFile();
  if (!result) return;
  if (!result.ok) showFileMessage(`Ouverture impossible : ${result.message}`);
  else openProject(result.id);
}
