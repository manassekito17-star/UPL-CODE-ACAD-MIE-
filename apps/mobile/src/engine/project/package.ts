import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';

import { DOCUMENT_FORMAT_VERSION, type GraphicDocument } from '@/engine/documents/types';
import type { Layer } from '@/engine/layers/types';

import { parseProject, serializeDocument } from './serialization';

/**
 * Fichier natif « .zdesign » : une archive zip contenant
 *   manifest.json   type de paquet, version, application ;
 *   document.json   le projet au format versionné (calques, textes éditables,
 *                   transformations, propriétés, informations du document) ;
 *   assets/…        les images : copie de travail ET original intact ;
 *   thumbnail.png   la miniature, si elle existe.
 * Les chemins d'images du document sont relatifs à l'archive.
 */

export const PACKAGE_EXTENSION = 'zdesign';
export const PACKAGE_MIME = 'application/x-zentech-design';
export const PACKAGE_KIND = 'zentech-design/package';
export const PACKAGE_VERSION = 1;

/** Garde-fous à la lecture (archive piégée : décompression démesurée, chemins hostiles). */
export const PACKAGE_LIMITS = { maxEntries: 2000, maxTotalBytes: 512 * 1024 * 1024 } as const;

const baseName = (uri: string) => uri.slice(uri.lastIndexOf('/') + 1).split('?')[0] ?? 'asset';

function mapAssets(doc: GraphicDocument, map: (uri: string) => string): GraphicDocument {
  return {
    ...doc,
    layers: doc.layers.map((l: Layer) => (l.type === 'image' ? { ...l, asset: { ...l.asset, uri: map(l.asset.uri), originalUri: map(l.asset.originalUri) } } : l)),
  };
}

/**
 * Construit l'archive. `readFile` lit un fichier d'image de l'application ;
 * deux URI identiques ne sont stockées qu'une fois.
 */
export function buildPackage(doc: GraphicDocument, readFile: (uri: string) => Uint8Array, thumbnail?: Uint8Array | null): Uint8Array {
  const files: Zippable = {};
  const paths = new Map<string, string>();
  const pathOf = (uri: string) => {
    let p = paths.get(uri);
    if (!p) {
      let name = baseName(uri) || 'asset';
      while ([...paths.values()].includes(`assets/${name}`)) name = `_${name}`;
      p = `assets/${name}`;
      paths.set(uri, p);
      files[p] = [readFile(uri), { level: 0 }]; // images déjà compressées
    }
    return p;
  };
  const relative = mapAssets(doc, pathOf);
  files['manifest.json'] = strToU8(
    JSON.stringify({ kind: PACKAGE_KIND, packageVersion: PACKAGE_VERSION, formatVersion: DOCUMENT_FORMAT_VERSION, application: 'ZENTECH DESIGN', savedAt: doc.updatedAt }),
  );
  files['document.json'] = strToU8(serializeDocument(relative));
  if (thumbnail && thumbnail.length > 0) files['thumbnail.png'] = [thumbnail, { level: 0 }];
  return zipSync(files, { level: 6 });
}

export type ReadPackageResult =
  | { ok: true; document: GraphicDocument; assets: Record<string, Uint8Array>; thumbnail: Uint8Array | null; migratedFrom: number | null }
  | { ok: false; message: string };

/** Lit une archive « .zdesign ». Ne lève jamais : un fichier refusé renvoie un message. */
export function readPackage(bytes: Uint8Array): ReadPackageResult {
  let entries: Record<string, Uint8Array>;
  try {
    let count = 0;
    let total = 0;
    entries = unzipSync(bytes, {
      filter: (f) => {
        count += 1;
        total += f.originalSize;
        if (count > PACKAGE_LIMITS.maxEntries || total > PACKAGE_LIMITS.maxTotalBytes) throw new Error('trop volumineux');
        return true;
      },
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error && e.message === 'trop volumineux' ? 'Fichier trop volumineux pour être ouvert.' : 'Ce fichier n’est pas un projet ZENTECH DESIGN (archive illisible).' };
  }
  const manifestBytes = entries['manifest.json'];
  const documentBytes = entries['document.json'];
  if (!manifestBytes || !documentBytes) return { ok: false, message: 'Ce fichier n’est pas un projet ZENTECH DESIGN (manifeste absent).' };
  let manifest: Record<string, unknown>;
  try {
    manifest = JSON.parse(strFromU8(manifestBytes));
  } catch {
    return { ok: false, message: 'Manifeste du projet illisible.' };
  }
  if (manifest.kind !== PACKAGE_KIND) return { ok: false, message: 'Ce fichier n’est pas un projet ZENTECH DESIGN.' };
  if (typeof manifest.packageVersion !== 'number' || manifest.packageVersion > PACKAGE_VERSION) {
    return { ok: false, message: 'Fichier créé par une version plus récente de l’application. Mettez l’application à jour pour l’ouvrir.' };
  }
  const parsed = parseProject(strFromU8(documentBytes));
  if (!parsed.ok) return parsed;
  const assets: Record<string, Uint8Array> = {};
  for (const layer of parsed.document.layers) {
    if (layer.type !== 'image') continue;
    for (const p of [layer.asset.uri, layer.asset.originalUri]) {
      // Seuls des chemins internes « assets/nom » sont acceptés (jamais « ../ » ni absolus).
      if (!/^assets\/[^/\\]+$/.test(p) || p.includes('..')) return { ok: false, message: `Projet endommagé — chemin d’image invalide (« ${p} »).` };
      const data = entries[p];
      if (!data) return { ok: false, message: `Projet incomplet — image manquante (« ${p} »).` };
      assets[p] = data;
    }
  }
  return { ok: true, document: parsed.document, assets, thumbnail: entries['thumbnail.png'] ?? null, migratedFrom: parsed.migratedFrom };
}

/** Rattache les images d'un document lu à leurs nouveaux emplacements dans l'application. */
export function attachAssets(doc: GraphicDocument, uriOf: (packagePath: string) => string): GraphicDocument {
  return mapAssets(doc, uriOf);
}

/** « Affiche d'été » → « Affiche d'été.zdesign » (caractères interdits remplacés). */
export function packageFileName(name: string): string {
  const base = name.replace(/[\\/:*?"<>|\u0000-\u001F]/g, '-').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, 80) || 'Sans titre';
  return `${base}.${PACKAGE_EXTENSION}`;
}
