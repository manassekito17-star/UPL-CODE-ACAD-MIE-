import { ImageFormat } from '@shopify/react-native-skia';

import { DOCUMENT_LIMITS, type GraphicDocument } from '@/engine/documents';

import type { RenderResources } from './drawDocument';
import { renderDocumentToImage } from './offscreen';

/**
 * Export d'un document en PNG ou JPEG : le MÊME code de dessin que la toile
 * (drawDocument), sur une surface hors écran, puis encodage par Skia. Seuls
 * les calques visibles sont dessinés, dans l'ordre de la pile, avec leurs
 * transformations et leur opacité ; le damier de transparence n'est jamais
 * exporté.
 */

export type ExportFormat = 'png' | 'jpeg';

export interface ExportSettings {
  format: ExportFormat;
  /** Échelle appliquée aux dimensions du document (1 = taille réelle). */
  scale: number;
  /** Qualité JPEG, 1 à 100 (ignorée en PNG, format sans perte). */
  quality: number;
  /** Couleur de fond d'un JPEG là où le document est transparent. */
  matte: string;
}

export const DEFAULT_EXPORT: ExportSettings = { format: 'png', scale: 1, quality: 90, matte: '#FFFFFF' };

export interface ExportPlan {
  width: number;
  height: number;
  /** Raison du refus, ou null si l'export est possible. */
  error: string | null;
  /** Le format ne garde pas la transparence du document. */
  losesTransparency: boolean;
}

export function planExport(doc: Pick<GraphicDocument, 'width' | 'height' | 'background'>, settings: ExportSettings): ExportPlan {
  const width = Math.max(1, Math.round(doc.width * settings.scale));
  const height = Math.max(1, Math.round(doc.height * settings.scale));
  const losesTransparency = settings.format === 'jpeg' && doc.background === 'transparent';
  let error: string | null = null;
  if (!Number.isFinite(settings.scale) || settings.scale <= 0) error = 'Échelle invalide.';
  else if (width > DOCUMENT_LIMITS.maxDimension || height > DOCUMENT_LIMITS.maxDimension || width * height > DOCUMENT_LIMITS.maxPixels) {
    error = `${width} × ${height} px dépasse la limite de l’appareil (${DOCUMENT_LIMITS.maxDimension} px par côté, 16,7 millions de pixels).`;
  } else if (settings.format === 'jpeg' && (!Number.isInteger(settings.quality) || settings.quality < 1 || settings.quality > 100)) {
    error = 'La qualité JPEG va de 1 à 100.';
  }
  return { width, height, error, losesTransparency };
}

/**
 * Noms des calques visibles qui ne peuvent pas encore être dessinés : texte
 * sans police chargée, image non décodée. Un export ne doit jamais les omettre
 * en silence.
 */
export function missingResources(doc: GraphicDocument, resources: RenderResources): string[] {
  return doc.layers
    .filter((l) => l.visible && ((l.type === 'text' && !resources.fonts) || (l.type === 'image' && !resources.images.has(l.asset.uri))))
    .map((l) => l.name);
}

/** « Affiche d'été » → « Affiche d'été.png » ; caractères interdits par les systèmes de fichiers remplacés. */
export function exportFileName(name: string, format: ExportFormat): string {
  const base = name.replace(/[\\/:*?"<>|\u0000-\u001F]/g, '-').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, 80) || 'Sans titre';
  return `${base}.${format === 'png' ? 'png' : 'jpg'}`;
}

export interface ExportResult {
  bytes: Uint8Array;
  width: number;
  height: number;
  mimeType: 'image/png' | 'image/jpeg';
  fileName: string;
}

export function exportDocument(doc: GraphicDocument, settings: ExportSettings, resources: RenderResources): ExportResult {
  const plan = planExport(doc, settings);
  if (plan.error) throw new Error(plan.error);
  const missing = missingResources(doc, resources);
  if (missing.length > 0) throw new Error(`Calques pas encore prêts : ${missing.join(', ')}. Réessayez dans un instant.`);
  const jpeg = settings.format === 'jpeg';
  const image = renderDocumentToImage(doc, { scale: settings.scale, resources, matte: jpeg ? settings.matte : undefined });
  const bytes = image.encodeToBytes(jpeg ? ImageFormat.JPEG : ImageFormat.PNG, jpeg ? settings.quality : 100);
  if (!bytes || bytes.length === 0) throw new Error('L’encodage de l’image a échoué.');
  return { bytes, width: image.width(), height: image.height(), mimeType: jpeg ? 'image/jpeg' : 'image/png', fileName: exportFileName(doc.name, settings.format) };
}
