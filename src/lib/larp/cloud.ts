/**
 * Enregistrement des projets de l'interface classique dans le compte de
 * l'étudiant. Réutilise l'API des projets de UPL IDE (table « projects »,
 * protégée par RLS, historique des versions, détection des conflits entre
 * appareils) avec le modèle « larp » : le projet est un seul fichier JSON.
 */
import type { LarpDoc, LarpProject } from "./project";

export const CLOUD_FILE = "projet.larp.json";

export interface CloudInfo {
  id: string;
  revision: number;
}

export interface CloudEntry {
  id: string;
  name: string;
  updated_at: string;
}

/** Contenu enregistré (sans les informations de synchronisation). */
export function serialize(p: LarpProject): string {
  return JSON.stringify({ format: "upl-larp", version: 1, name: p.name, docs: p.docs });
}

/** Relit un projet enregistré ; null si le contenu est invalide. */
export function deserialize(text: string, name: string): LarpProject | null {
  try {
    const raw = JSON.parse(text) as { docs?: unknown };
    if (!raw || !Array.isArray(raw.docs)) return null;
    const docs = raw.docs.filter(
      (d): d is LarpDoc =>
        !!d && typeof d === "object" && typeof (d as LarpDoc).id === "string" && typeof (d as LarpDoc).name === "string" && ["pseudo", "organigramme", "tampon"].includes((d as LarpDoc).kind),
    );
    if (docs.filter((d) => d.main).length !== 1) return null;
    return { name, docs };
  } catch {
    return null;
  }
}

const json = { "Content-Type": "application/json" };

async function message(res: Response, fallback: string) {
  try {
    const b = (await res.json()) as { error?: string };
    return b.error ?? fallback;
  } catch {
    return fallback;
  }
}

/** Liste des projets du compte ; « connexion » si l'étudiant n'est pas connecté. */
export async function listCloud(): Promise<{ ok: true; list: CloudEntry[] } | { ok: false; reason: "connexion" | "erreur"; message: string }> {
  try {
    const res = await fetch("/api/projects?type=larp", { cache: "no-store" });
    if (res.status === 401) return { ok: false, reason: "connexion", message: "Connectez-vous pour enregistrer vos projets dans votre compte." };
    if (!res.ok) return { ok: false, reason: "erreur", message: await message(res, "Projets du compte indisponibles.") };
    const b = (await res.json()) as { projects: CloudEntry[] };
    return { ok: true, list: b.projects };
  } catch {
    return { ok: false, reason: "erreur", message: "Pas de connexion Internet : projets du compte indisponibles." };
  }
}

export async function loadCloud(id: string): Promise<{ ok: true; project: LarpProject; info: CloudInfo } | { ok: false; message: string }> {
  try {
    const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return { ok: false, message: await message(res, "Projet introuvable.") };
    const { project } = (await res.json()) as { project: { id: string; name: string; revision: number; files: Array<{ path: string; content: string }> } };
    const file = project.files.find((f) => f.path === CLOUD_FILE);
    const p = file ? deserialize(file.content, project.name) : null;
    if (!p) return { ok: false, message: "Ce projet n'est pas un projet de l'interface classique." };
    return { ok: true, project: p, info: { id: project.id, revision: project.revision } };
  } catch {
    return { ok: false, message: "Pas de connexion Internet." };
  }
}

export type SaveResult = { ok: true; info: CloudInfo } | { ok: false; conflict: true; message: string } | { ok: false; conflict?: false; message: string; connexion?: boolean };

/** Crée le projet dans le compte (info absente) ou enregistre une nouvelle révision. */
export async function saveCloud(p: LarpProject, info: CloudInfo | null, force = false): Promise<SaveResult> {
  const snapshot = { files: [{ path: CLOUD_FILE, content: serialize(p) }], folders: [] };
  try {
    const res = info
      ? await fetch(`/api/projects/${info.id}`, { method: "PUT", headers: json, body: JSON.stringify({ ...snapshot, baseRevision: info.revision, force }) })
      : await fetch("/api/projects", { method: "POST", headers: json, body: JSON.stringify({ name: p.name, template: "larp", snapshot }) });
    if (res.status === 409) return { ok: false, conflict: true, message: "Ce projet a été modifié sur un autre appareil." };
    if (res.status === 401) return { ok: false, message: "Connectez-vous pour enregistrer dans votre compte.", connexion: true };
    if (!res.ok) return { ok: false, message: await message(res, "Enregistrement impossible.") };
    const { project } = (await res.json()) as { project: { id: string; revision: number } };
    return { ok: true, info: { id: project.id, revision: project.revision } };
  } catch {
    return { ok: false, message: "Pas de connexion Internet : projet gardé sur cet appareil." };
  }
}

export async function renameCloud(id: string, name: string) {
  try {
    await fetch(`/api/projects/${id}`, { method: "PATCH", headers: json, body: JSON.stringify({ name }) });
  } catch {
    /* le nom sera repris au prochain enregistrement */
  }
}

export async function deleteCloud(id: string): Promise<boolean> {
  try {
    return (await fetch(`/api/projects/${id}`, { method: "DELETE" })).ok;
  } catch {
    return false;
  }
}
