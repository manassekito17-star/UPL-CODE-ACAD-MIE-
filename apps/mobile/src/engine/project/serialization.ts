import { DOCUMENT_LIMITS } from '@/engine/documents/limits';
import { DOCUMENT_FORMAT_VERSION, type DocumentBackground, type GraphicDocument } from '@/engine/documents/types';
import type { ImageAsset, Layer, ShapeKind, TextAlignment } from '@/engine/layers/types';

/**
 * Format de projet ZENTECH DESIGN : JSON versionné.
 *
 * { "kind": "zentech-design/project", "formatVersion": 1, "document": { … } }
 *
 * Lecture stricte : chaque champ est vérifié et le document est reconstruit
 * champ par champ (un champ inconnu est ignoré, un champ invalide fait
 * refuser le projet entier avec un message). Les anciennes versions sont
 * migrées pas à pas ; une version plus récente que l'application est refusée
 * plutôt que lue de travers.
 */

export const PROJECT_KIND = 'zentech-design/project';

export type ParseResult = { ok: true; document: GraphicDocument; migratedFrom: number | null } | { ok: false; message: string };

/** Migrations : MIGRATIONS[v] transforme un document de la version v en version v + 1. */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // Version 2 : résolution (72 ppp jusque-là) et couleur de fond explicite.
  1: (raw) => ({ ...raw, resolution: 72, backgroundColor: raw.background === 'black' ? '#000000' : '#FFFFFF' }),
};

/** Résolution acceptée, en pixels par pouce. */
export const RESOLUTION_RANGE = { min: 1, max: 9999 } as const;

export function serializeDocument(doc: GraphicDocument): string {
  return JSON.stringify({ kind: PROJECT_KIND, formatVersion: DOCUMENT_FORMAT_VERSION, document: doc });
}

class InvalidProject extends Error {}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function str(o: Record<string, unknown>, key: string, where: string, max = 10_000): string {
  const v = o[key];
  if (typeof v !== 'string' || v.length > max) throw new InvalidProject(`${where} : « ${key} » invalide.`);
  return v;
}
function num(o: Record<string, unknown>, key: string, where: string): number {
  const v = o[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new InvalidProject(`${where} : « ${key} » invalide.`);
  return v;
}
function bool(o: Record<string, unknown>, key: string, where: string): boolean {
  const v = o[key];
  if (typeof v !== 'boolean') throw new InvalidProject(`${where} : « ${key} » invalide.`);
  return v;
}
function oneOf<T extends string>(o: Record<string, unknown>, key: string, values: readonly T[], where: string): T {
  const v = o[key];
  if (typeof v !== 'string' || !(values as readonly string[]).includes(v)) throw new InvalidProject(`${where} : « ${key} » invalide.`);
  return v as T;
}
const HEX = /^#[0-9A-Fa-f]{6}$/;
function color(o: Record<string, unknown>, key: string, where: string): string {
  const v = str(o, key, where, 7);
  if (!HEX.test(v)) throw new InvalidProject(`${where} : couleur « ${key} » invalide.`);
  return v.toUpperCase();
}

function parseAsset(raw: unknown, where: string): ImageAsset {
  if (!isObject(raw)) throw new InvalidProject(`${where} : image manquante.`);
  const fileName = raw.fileName;
  if (fileName !== null && typeof fileName !== 'string') throw new InvalidProject(`${where} : nom de fichier invalide.`);
  return {
    uri: str(raw, 'uri', where),
    width: num(raw, 'width', where),
    height: num(raw, 'height', where),
    originalUri: str(raw, 'originalUri', where),
    originalWidth: num(raw, 'originalWidth', where),
    originalHeight: num(raw, 'originalHeight', where),
    fileName: fileName as string | null,
  };
}

function parseLayer(raw: unknown, index: number): Layer {
  const where = `Calque ${index + 1}`;
  if (!isObject(raw)) throw new InvalidProject(`${where} : format invalide.`);
  const base = {
    id: str(raw, 'id', where, 200),
    name: str(raw, 'name', where, 500),
    x: num(raw, 'x', where),
    y: num(raw, 'y', where),
    width: num(raw, 'width', where),
    height: num(raw, 'height', where),
    rotation: num(raw, 'rotation', where),
    opacity: num(raw, 'opacity', where),
    visible: bool(raw, 'visible', where),
    locked: bool(raw, 'locked', where),
  };
  if (base.width <= 0 || base.height <= 0) throw new InvalidProject(`${where} : dimensions invalides.`);
  if (base.opacity < 0 || base.opacity > 1) throw new InvalidProject(`${where} : opacité invalide.`);
  const type = oneOf(raw, 'type', ['shape', 'text', 'image'] as const, where);
  if (type === 'shape') {
    return { ...base, type, shape: oneOf<ShapeKind>(raw, 'shape', ['rectangle', 'ellipse', 'line'], where), fill: color(raw, 'fill', where) };
  }
  if (type === 'text') {
    return {
      ...base,
      type,
      text: str(raw, 'text', where),
      fontSize: num(raw, 'fontSize', where),
      color: color(raw, 'color', where),
      align: oneOf<TextAlignment>(raw, 'align', ['left', 'center', 'right'], where),
      bold: bool(raw, 'bold', where),
      fontFamily: oneOf(raw, 'fontFamily', ['Inter'] as const, where),
    };
  }
  return { ...base, type, asset: parseAsset(raw.asset, where) };
}

function resolution(raw: Record<string, unknown>): number {
  const v = num(raw, 'resolution', 'Document');
  if (v < RESOLUTION_RANGE.min || v > RESOLUTION_RANGE.max) throw new InvalidProject('Document : résolution invalide.');
  return v;
}

function parseDocumentObject(raw: Record<string, unknown>): GraphicDocument {
  const where = 'Document';
  const width = num(raw, 'width', where);
  const height = num(raw, 'height', where);
  const { minDimension: min, maxDimension: max, maxPixels } = DOCUMENT_LIMITS;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < min || height < min || width > max || height > max || width * height > maxPixels) {
    throw new InvalidProject('Document : dimensions hors limites.');
  }
  if (!Array.isArray(raw.layers)) throw new InvalidProject('Document : liste des calques manquante.');
  const layers = raw.layers.map(parseLayer);
  if (new Set(layers.map((l) => l.id)).size !== layers.length) throw new InvalidProject('Document : deux calques portent le même identifiant.');
  return {
    formatVersion: DOCUMENT_FORMAT_VERSION,
    id: str(raw, 'id', where, 200),
    name: str(raw, 'name', where, 500),
    width,
    height,
    background: oneOf<DocumentBackground>(raw, 'background', ['white', 'black', 'transparent', 'color'], where),
    backgroundColor: color(raw, 'backgroundColor', where),
    resolution: resolution(raw),
    layers,
    createdAt: num(raw, 'createdAt', where),
    updatedAt: num(raw, 'updatedAt', where),
  };
}

/** Lit un projet enregistré. Ne lève jamais : un projet illisible renvoie un message. */
export function parseProject(json: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, message: 'Fichier de projet illisible (JSON invalide).' };
  }
  if (!isObject(data) || data.kind !== PROJECT_KIND) return { ok: false, message: 'Ce fichier n’est pas un projet ZENTECH DESIGN.' };
  const version = data.formatVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return { ok: false, message: 'Version de format invalide.' };
  if (version > DOCUMENT_FORMAT_VERSION) {
    return { ok: false, message: `Projet créé par une version plus récente de l’application (format ${version}). Mettez l’application à jour pour l’ouvrir.` };
  }
  if (!isObject(data.document)) return { ok: false, message: 'Document manquant dans le projet.' };
  try {
    let raw = data.document;
    for (let v = version; v < DOCUMENT_FORMAT_VERSION; v += 1) {
      const migrate = MIGRATIONS[v];
      if (!migrate) throw new InvalidProject(`Aucune migration depuis le format ${v}.`);
      raw = migrate(raw);
    }
    return { ok: true, document: parseDocumentObject(raw), migratedFrom: version < DOCUMENT_FORMAT_VERSION ? version : null };
  } catch (error) {
    if (error instanceof InvalidProject) return { ok: false, message: `Projet endommagé — ${error.message}` };
    throw error;
  }
}

/** Fichiers d'images référencés par un document (copies de travail et originaux). */
export function referencedFiles(doc: GraphicDocument): string[] {
  return doc.layers.flatMap((l) => (l.type === 'image' ? [l.asset.uri, l.asset.originalUri] : []));
}
