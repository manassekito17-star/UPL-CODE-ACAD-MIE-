import { Directory, File, Paths } from 'expo-file-system';

import { ASSETS_FOLDER } from './assetPaths';

/** Fichiers d'images de l'application (Android, iOS). */
export const assetFiles = {
  directoryUri(): string {
    return new Directory(Paths.document, ASSETS_FOLDER).uri;
  },
  list(): string[] {
    const dir = new Directory(Paths.document, ASSETS_FOLDER);
    if (!dir.exists) return [];
    return dir.list().filter((entry): entry is File => entry instanceof File).map((f) => f.uri);
  },
  remove(uris: readonly string[]): void {
    for (const uri of uris) {
      try {
        const file = new File(uri);
        if (file.exists) file.delete();
      } catch {
        // Au mieux : un fichier qui n'a pas pu être supprimé le sera au prochain démarrage.
      }
    }
  },
};
