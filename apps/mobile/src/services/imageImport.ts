import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { DOCUMENT_LIMITS } from '@/engine/documents';
import type { ImageAsset } from '@/engine/layers';
import { createLocalId } from '@/utils/id';

/**
 * Import d'une image depuis la galerie.
 *
 * 1. L'utilisateur choisit une image (aucune autorisation n'est demandée :
 *    le sélecteur système d'Android 13+ et d'iOS 14+ n'en exige pas).
 * 2. Le fichier choisi est copié TEL QUEL dans le dossier de l'application :
 *    l'original n'est jamais modifié, ni dans la galerie ni dans la copie.
 * 3. Une copie de travail est produite par le décodeur natif : JPEG ou PNG
 *    (Skia ne lit pas tous les formats, HEIC notamment), réduite si l'image
 *    dépasse les limites mémoire. C'est elle qui est affichée et exportée.
 */

/** Plus grand côté de la copie de travail. */
export const MAX_IMAGE_SIDE = 4096;

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface ImportPlan {
  /** Dimensions de la copie de travail. */
  width: number;
  height: number;
  /** Faux si l'image tient déjà dans les limites. */
  resized: boolean;
  /** PNG conserve la transparence ; JPEG pour les photos. */
  format: 'png' | 'jpeg';
}

export class ImageImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageImportError';
  }
}

const TRANSPARENT_FORMATS = /(png|webp|gif)$/i;

/** Décide de la copie de travail : taille bornée (côté et pixels), format selon la transparence possible. */
export function planImageImport(picked: PickedImage): ImportPlan {
  if (!(picked.width > 0 && picked.height > 0)) {
    throw new ImageImportError("Dimensions de l'image inconnues : import impossible.");
  }
  const sideScale = MAX_IMAGE_SIDE / Math.max(picked.width, picked.height);
  const areaScale = Math.sqrt(DOCUMENT_LIMITS.maxPixels / (picked.width * picked.height));
  const scale = Math.min(1, sideScale, areaScale);
  // Le type MIME fait foi ; à défaut, l'extension du nom ou de l'URI (testés séparément).
  const transparent =
    TRANSPARENT_FORMATS.test(picked.mimeType ?? '') ||
    [picked.fileName ?? '', picked.uri].some((name) => /\.(png|webp|gif)(\?|$)/i.test(name));
  return {
    width: Math.max(1, Math.floor(picked.width * scale)),
    height: Math.max(1, Math.floor(picked.height * scale)),
    resized: scale < 1,
    format: transparent ? 'png' : 'jpeg',
  };
}

/** Accès natifs, injectables pour les tests. */
export interface ImportDeps {
  newId: () => string;
  /** Copie octet pour octet ; renvoie l'URI de la copie. */
  copyOriginal: (sourceUri: string, baseName: string) => Promise<string>;
  /** Décode, redimensionne si besoin, encode ; renvoie l'URI et les dimensions réelles. */
  makeWorkingCopy: (sourceUri: string, plan: ImportPlan, baseName: string) => Promise<{ uri: string; width: number; height: number }>;
  /** Supprime un fichier créé par un import qui a échoué. */
  remove: (uri: string) => void;
}

function extensionOf(picked: PickedImage): string {
  const match = /\.([a-z0-9]{2,5})(\?|$)/i.exec(picked.fileName ?? picked.uri);
  return (match?.[1] ?? 'bin').toLowerCase();
}

export async function importPickedImage(picked: PickedImage, deps: ImportDeps = nativeImportDeps): Promise<ImageAsset> {
  const plan = planImageImport(picked);
  const id = deps.newId();
  let originalUri: string | null = null;
  try {
    originalUri = await deps.copyOriginal(picked.uri, `${id}-original.${extensionOf(picked)}`);
    const working = await deps.makeWorkingCopy(picked.uri, plan, id);
    return {
      uri: working.uri,
      width: working.width,
      height: working.height,
      originalUri,
      originalWidth: picked.width,
      originalHeight: picked.height,
      fileName: picked.fileName ?? null,
    };
  } catch (error) {
    if (originalUri) deps.remove(originalUri);
    if (error instanceof ImageImportError) throw error;
    throw new ImageImportError("L'image n'a pas pu être importée (format non pris en charge ou fichier illisible).");
  }
}

/** Ouvre la galerie ; renvoie null si l'utilisateur annule. */
export async function pickAndImportImage(deps: ImportDeps = nativeImportDeps): Promise<ImageAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
    exif: false,
  });
  const picked = result.canceled ? undefined : result.assets[0];
  if (!picked) return null;
  return importPickedImage(
    { uri: picked.uri, width: picked.width, height: picked.height, fileName: picked.fileName, mimeType: picked.mimeType },
    deps,
  );
}

// ---------------------------------------------------------------------------
// Implémentation native (expo-file-system, expo-image-manipulator)
// ---------------------------------------------------------------------------

/** Dossier des images importées (voir services/projects/assetPaths). */
function assetsDirectory(): Directory {
  const dir = new Directory(Paths.document, 'assets');
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export const nativeImportDeps: ImportDeps = {
  newId: () => createLocalId('img'),
  copyOriginal: async (sourceUri, baseName) => {
    const destination = new File(assetsDirectory(), baseName);
    await new File(sourceUri).copy(destination);
    return destination.uri;
  },
  makeWorkingCopy: async (sourceUri, plan, baseName) => {
    const context = ImageManipulator.manipulate(sourceUri);
    if (plan.resized) context.resize({ width: plan.width, height: plan.height });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      format: plan.format === 'png' ? SaveFormat.PNG : SaveFormat.JPEG,
      compress: plan.format === 'png' ? 1 : 0.92,
    });
    // Le résultat est écrit dans le cache : on le déplace dans le dossier de l'application.
    const destination = new File(assetsDirectory(), `${baseName}.${plan.format === 'png' ? 'png' : 'jpg'}`);
    await new File(saved.uri).move(destination);
    return { uri: destination.uri, width: saved.width, height: saved.height };
  },
  remove: (uri) => {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      // Nettoyage au mieux : un fichier orphelin est supprimé au prochain démarrage.
    }
  },
};
