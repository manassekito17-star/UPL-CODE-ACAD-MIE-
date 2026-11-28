import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { ExportResult } from '@/engine/renderer';

/** Où l'image exportée peut aller sur cette plateforme. */
export const exportTargets = { share: true, folder: true } as const;

function exportsDirectory(): Directory {
  const dir = new Directory(Paths.cache, 'exports');
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/**
 * Feuille de partage du système (Photos, Fichiers, messagerie…). Aucune
 * autorisation : c'est l'utilisateur qui choisit la destination. Le fichier
 * est écrit dans le cache de l'application, que le système peut vider.
 */
export async function shareExport(result: ExportResult): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Le partage n’est pas disponible sur cet appareil.');
  const file = new File(exportsDirectory(), result.fileName);
  if (file.exists) file.delete();
  await file.write(result.bytes);
  await Sharing.shareAsync(file.uri, {
    mimeType: result.mimeType,
    UTI: result.mimeType === 'image/png' ? 'public.png' : result.mimeType === 'image/webp' ? 'org.webmproject.webp' : 'public.jpeg',
    dialogTitle: `Exporter ${result.fileName}`,
  });
}

/**
 * Enregistre dans un dossier choisi par l'utilisateur (sélecteur du système :
 * accès à ce seul dossier, aucune autorisation générale). Renvoie le nom du
 * fichier écrit, ou null si l'utilisateur a annulé.
 */
export async function saveExportToFolder(result: ExportResult): Promise<string | null> {
  let dir: Directory;
  try {
    dir = await Directory.pickDirectoryAsync();
  } catch {
    return null; // sélection annulée
  }
  const file = dir.createFile(result.fileName, result.mimeType);
  await file.write(result.bytes);
  return file.name;
}
