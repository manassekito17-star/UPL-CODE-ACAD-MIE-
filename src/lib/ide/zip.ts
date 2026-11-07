import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { normalizePath, PROJECT_LIMITS, validateSnapshot, type ProjectFile, type ProjectSnapshot } from "./fs";

/** Archive ZIP d'un projet (dossiers vides compris). */
export function exportZip(p: ProjectSnapshot): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const d of p.folders) entries[`${d}/`] = new Uint8Array(0);
  for (const f of p.files) entries[f.path] = strToU8(f.content);
  return zipSync(entries, { level: 6 });
}

const IGNORED = /(^|\/)(__MACOSX|\.git|node_modules|\.DS_Store|Thumbs\.db)(\/|$)/;

export interface ImportResult {
  ok: boolean;
  project?: ProjectSnapshot;
  error?: string;
  skipped: string[];
}

/** Texte UTF-8 valide, sinon null (fichier binaire). */
function decodeText(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return text.includes("\u0000") ? null : text;
  } catch {
    return null;
  }
}

/** Fichiers importés : chemins vérifiés, fichiers binaires et dossiers techniques écartés. */
export function importEntries(entries: Array<{ path: string; bytes: Uint8Array }>): ImportResult {
  const skipped: string[] = [];
  let files: ProjectFile[] = [];
  const folders: string[] = [];
  for (const e of entries) {
    if (IGNORED.test(e.path)) continue;
    if (e.path.endsWith("/")) {
      const d = normalizePath(e.path);
      if (d) folders.push(d);
      continue;
    }
    const path = normalizePath(e.path);
    if (!path) {
      skipped.push(`${e.path} (chemin refusé)`);
      continue;
    }
    if (e.bytes.length > PROJECT_LIMITS.maxFileChars * 4) {
      skipped.push(`${path} (trop volumineux)`);
      continue;
    }
    const text = decodeText(e.bytes);
    if (text === null) {
      skipped.push(`${path} (fichier binaire)`);
      continue;
    }
    files.push({ path, content: text });
  }
  // Archive avec un seul dossier racine (ex. téléchargement GitHub) : on le retire.
  const roots = new Set([...files.map((f) => f.path), ...folders].map((p) => p.split("/")[0]));
  if (roots.size === 1 && files.length && files.every((f) => f.path.includes("/"))) {
    const root = [...roots][0];
    files = files.map((f) => ({ ...f, path: f.path.slice(root.length + 1) }));
    for (let i = folders.length - 1; i >= 0; i--) {
      if (folders[i] === root) folders.splice(i, 1);
      else folders[i] = folders[i].slice(root.length + 1);
    }
  }
  if (!files.length && !folders.length) return { ok: false, error: "Aucun fichier texte à importer.", skipped };
  if (files.length > PROJECT_LIMITS.maxFiles) return { ok: false, error: `L'archive contient plus de ${PROJECT_LIMITS.maxFiles} fichiers texte.`, skipped };
  const v = validateSnapshot({ files, folders });
  return v.ok ? { ok: true, project: v.project, skipped } : { ok: false, error: v.error, skipped };
}

export function importZip(bytes: Uint8Array): ImportResult {
  let raw: Record<string, Uint8Array>;
  try {
    let count = 0;
    let total = 0;
    raw = unzipSync(bytes, {
      // Protection contre les archives piégées : nombre de fichiers et taille décompressée bornés.
      filter: (f) => {
        count++;
        total += f.originalSize;
        if (count > 2000 || total > 50_000_000) throw new Error("Archive trop volumineuse.");
        return !IGNORED.test(f.name);
      },
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message === "Archive trop volumineuse." ? "Archive trop volumineuse (50 Mo décompressés au maximum)." : "Archive ZIP illisible.", skipped: [] };
  }
  return importEntries(Object.entries(raw).map(([path, b]) => ({ path, bytes: b })));
}

export const textOf = strFromU8;
