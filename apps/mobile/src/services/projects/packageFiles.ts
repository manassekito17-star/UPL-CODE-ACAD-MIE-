import { Directory, File, Paths } from 'expo-file-system';

import { PACKAGE_MIME } from '@/engine/project';
import { createLocalId } from '@/utils/id';

import { ASSETS_FOLDER } from './assetPaths';

/** Lecture et écriture des fichiers « .zdesign » et des images (Android, iOS). */
export const packageFiles = {
  /** Octets d'une image de l'application. */
  readAsset(uri: string): Uint8Array {
    return new File(uri).bytesSync();
  },
  /** Copie une image d'un projet ouvert dans le dossier d'images, sous un nom unique ; renvoie son URI. */
  writeAsset(packagePath: string, bytes: Uint8Array): string {
    const dir = new Directory(Paths.document, ASSETS_FOLDER);
    dir.create({ intermediates: true, idempotent: true });
    const ext = packagePath.includes('.') ? packagePath.slice(packagePath.lastIndexOf('.')) : '';
    const file = new File(dir, `${createLocalId('img')}${ext}`);
    file.write(bytes);
    return file.uri;
  },
  /**
   * Enregistre dans un dossier choisi par l'utilisateur (sélecteur du système).
   * Renvoie l'URI et le nom du fichier, ou null si l'utilisateur annule.
   */
  async saveToFolder(fileName: string, bytes: Uint8Array): Promise<{ uri: string; name: string } | null> {
    let dir: Directory;
    try {
      dir = await Directory.pickDirectoryAsync();
    } catch {
      return null;
    }
    const file = dir.createFile(fileName, PACKAGE_MIME);
    await file.write(bytes);
    return { uri: file.uri, name: file.name };
  },
  /**
   * Réécrit un fichier déjà enregistré. Peut échouer si le système a retiré
   * l'accès (sur iOS, l'accès à un dossier choisi ne dure que la session).
   */
  async overwrite(uri: string, bytes: Uint8Array): Promise<void> {
    await new File(uri).write(bytes);
  },
  /** Choisir un fichier « .zdesign » (sélecteur du système) ; null si annulé. */
  async pick(): Promise<{ uri: string; name: string; bytes: Uint8Array } | null> {
    const picked = await File.pickFileAsync({ mimeTypes: ['*/*'] });
    if (picked.canceled || !picked.result) return null;
    const file = picked.result;
    return { uri: file.uri, name: file.name, bytes: await file.bytes() };
  },
};
