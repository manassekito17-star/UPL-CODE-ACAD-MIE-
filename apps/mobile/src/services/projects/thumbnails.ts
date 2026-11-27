import { Directory, File, Paths } from 'expo-file-system';

/** Miniatures PNG des projets (Android, iOS), dans le dossier privé de l'application. */
function dir(): Directory {
  const d = new Directory(Paths.document, 'thumbnails');
  d.create({ intermediates: true, idempotent: true });
  return d;
}

export const thumbnailFiles = {
  /** URI de la miniature, ou null si elle n'existe pas encore. */
  uri(id: string): string | null {
    try {
      const file = new File(dir(), `${id}.png`);
      return file.exists ? file.uri : null;
    } catch {
      return null;
    }
  },
  async write(id: string, bytes: Uint8Array): Promise<void> {
    const file = new File(dir(), `${id}.png`);
    if (file.exists) file.delete();
    await file.write(bytes);
  },
  remove(id: string): void {
    try {
      const file = new File(dir(), `${id}.png`);
      if (file.exists) file.delete();
    } catch {
      // Au mieux : repris au prochain démarrage.
    }
  },
  /** Identifiants des projets qui ont une miniature. */
  list(): string[] {
    try {
      return dir()
        .list()
        .filter((e): e is File => e instanceof File && e.name.endsWith('.png'))
        .map((f) => f.name.slice(0, -4));
    } catch {
      return [];
    }
  },
};
