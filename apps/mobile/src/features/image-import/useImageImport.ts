import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { addLayer, createImageLayer, type ImageAsset } from '@/engine/layers';
import { ImageImportError, pickAndImportImage } from '@/services/imageImport';
import { useDocumentStore } from '@/stores/documentStore';
import { createLocalId } from '@/utils/id';

export interface ImageImport {
  /** Import en cours (le bouton est désactivé, l'opération n'est pas relancée). */
  importing: boolean;
  /** Dernière erreur à afficher, ou null. */
  error: string | null;
  /** Ouvre la galerie. `asset` est null si l'utilisateur annule ou en cas d'échec (`error` dit pourquoi). */
  pick: () => Promise<{ asset: ImageAsset | null; error: string | null }>;
}

/** Galerie → copie de l'original + copie de travail (voir services/imageImport). */
export function useImageImport(): ImageImport {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async () => {
    if (importing) return { asset: null, error: null };
    setImporting(true);
    setError(null);
    try {
      return { asset: await pickAndImportImage(), error: null };
    } catch (e) {
      const message = e instanceof ImageImportError ? e.message : "L'image n'a pas pu être importée.";
      setError(message);
      return { asset: null, error: message };
    } finally {
      setImporting(false);
    }
  }, [importing]);

  return { importing, error, pick };
}

/**
 * Crée un document aux dimensions de l'image (déjà bornées par l'import) et
 * l'y place en un calque qui le remplit, puis ouvre l'éditeur.
 */
export function openImageAsNewDocument(asset: ImageAsset): string {
  const store = useDocumentStore.getState();
  const name = (asset.fileName ?? 'Image importée').replace(/\.[a-z0-9]+$/i, '').slice(0, 80) || 'Image importée';
  const doc = store.createDocument({
    width: asset.width,
    height: asset.height,
    background: asset.uri.toLowerCase().endsWith('.png') ? 'transparent' : 'white',
    name,
  });
  const layer = { ...createImageLayer(doc, asset, createLocalId('layer')), x: 0, y: 0, width: asset.width, height: asset.height };
  store.mutateDocument(doc.id, (d) => addLayer(d, layer), 'Ouvrir');
  // Le document ouvert est l'état de départ : il n'y a rien à annuler.
  store.clearHistory(doc.id, 'Ouvrir');
  router.push({ pathname: '/editor/[projectId]', params: { projectId: doc.id } });
  return doc.id;
}
