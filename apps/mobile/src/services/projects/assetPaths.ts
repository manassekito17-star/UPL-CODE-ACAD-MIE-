import type { GraphicDocument } from '@/engine/documents';

/** Nom du dossier des images importées, dans le dossier privé de l'application. */
export const ASSETS_FOLDER = 'assets';

/**
 * Rattache les images d'un document au dossier d'images ACTUEL.
 *
 * Sur iOS, le chemin du dossier de l'application change à chaque mise à jour :
 * un chemin absolu enregistré deviendrait invalide. Toute URI qui passe par
 * « …/assets/ » est donc reconstruite à partir du dossier courant. Les autres
 * URI sont laissées telles quelles. Renvoie le même objet si rien ne change.
 */
export function relocateAssets(doc: GraphicDocument, assetsDirUri: string): GraphicDocument {
  const base = assetsDirUri.endsWith('/') ? assetsDirUri : `${assetsDirUri}/`;
  const marker = `/${ASSETS_FOLDER}/`;
  const fix = (uri: string) => {
    const at = uri.lastIndexOf(marker);
    return at < 0 ? uri : base + uri.slice(at + marker.length);
  };
  let changed = false;
  const layers = doc.layers.map((layer) => {
    if (layer.type !== 'image') return layer;
    const uri = fix(layer.asset.uri);
    const originalUri = fix(layer.asset.originalUri);
    if (uri === layer.asset.uri && originalUri === layer.asset.originalUri) return layer;
    changed = true;
    return { ...layer, asset: { ...layer.asset, uri, originalUri } };
  });
  return changed ? { ...doc, layers } : doc;
}

/** Fichiers du dossier d'images qu'aucune URI connue ne référence (comparés par nom). */
export function orphanFiles(files: readonly string[], referenced: readonly string[]): string[] {
  const name = (uri: string) => uri.slice(uri.lastIndexOf('/') + 1);
  const used = new Set(referenced.map(name));
  return files.filter((f) => !used.has(name(f)));
}
