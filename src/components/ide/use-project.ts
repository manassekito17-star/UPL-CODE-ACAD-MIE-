"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectSnapshot } from "@/lib/ide/fs";

/**
 * Persistance d'un projet UPL IDE.
 *  - Compte connecté : projet enregistré en base (API /api/projects, RLS),
 *    avec révision pour détecter les conflits entre appareils.
 *  - Brouillon local permanent (localStorage) : rien n'est perdu si la
 *    connexion tombe ; synchronisation à la reconnexion.
 *  - Visiteur : projet local uniquement, clairement signalé.
 */

export interface IdeProject extends ProjectSnapshot {
  id: string | null;
  name: string;
  revision: number;
  updatedAt?: string;
}

export type SaveStatus = "enregistre" | "modifie" | "enregistrement" | "hors_ligne" | "conflit" | "local" | "erreur";

export interface LogEntry {
  at: string;
  level: "info" | "erreur" | "avertissement";
  text: string;
}

interface Draft {
  snapshot: ProjectSnapshot;
  baseRevision: number;
  name: string;
  at: string;
}

const draftKey = (id: string | null) => `upl:ide:brouillon:${id ?? "local"}`;
const sameSnapshot = (a: ProjectSnapshot, b: ProjectSnapshot) => JSON.stringify(a) === JSON.stringify(b);

function readDraft(id: string | null): Draft | null {
  try {
    return JSON.parse(localStorage.getItem(draftKey(id)) ?? "null");
  } catch {
    return null;
  }
}
function writeDraft(id: string | null, d: Draft | null) {
  try {
    if (d) localStorage.setItem(draftKey(id), JSON.stringify(d));
    else localStorage.removeItem(draftKey(id));
  } catch {
    /* stockage indisponible (navigation privée) */
  }
}

export function useProject({ initial, loggedIn, autosave }: { initial: IdeProject; loggedIn: boolean; autosave: boolean }) {
  const [project, setProject] = useState<IdeProject>(initial);
  const [saved, setSaved] = useState<ProjectSnapshot>({ files: initial.files, folders: initial.folders });
  const [status, setStatus] = useState<SaveStatus>(initial.id ? "enregistre" : "local");
  const [conflict, setConflict] = useState<IdeProject | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const savingRef = useRef(false);
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const addLog = useCallback((text: string, level: LogEntry["level"] = "info") => {
    setLog((l) => [...l.slice(-199), { at: new Date().toISOString(), level, text }]);
  }, []);

  // Brouillon local restauré au chargement (modifications faites hors ligne).
  useEffect(() => {
    const d = readDraft(initial.id);
    if (!d || sameSnapshot(d.snapshot, { files: initial.files, folders: initial.folders })) return;
    // Restauration après le montage (le stockage local n'existe pas au rendu serveur).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!initial.id || d.baseRevision === initial.revision) {
      setProject((p) => ({ ...p, files: d.snapshot.files, folders: d.snapshot.folders }));
      setStatus(initial.id ? "modifie" : "local");
      addLog(`Brouillon de cet appareil restauré (${new Date(d.at).toLocaleString("fr-FR")}).`);
    } else {
      setProject((p) => ({ ...p, files: d.snapshot.files, folders: d.snapshot.folders }));
      setConflict(initial);
      setStatus("conflit");
      addLog("Des modifications de cet appareil n'ont pas été synchronisées et le projet a changé ailleurs.", "avertissement");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initial, addLog]);

  /** Applique une modification au projet (brouillon local mis à jour aussitôt). */
  const update = useCallback(
    (next: ProjectSnapshot) => {
      setProject((p) => {
        const updated = { ...p, files: next.files, folders: next.folders };
        writeDraft(p.id, { snapshot: next, baseRevision: p.revision, name: p.name, at: new Date().toISOString() });
        return updated;
      });
      setStatus((s) => (s === "conflit" ? s : projectRef.current.id ? "modifie" : "local"));
    },
    [],
  );

  const save = useCallback(
    async (opts: { force?: boolean; checkpoint?: string } = {}) => {
      const p = projectRef.current;
      if (!p.id) {
        writeDraft(null, { snapshot: { files: p.files, folders: p.folders }, baseRevision: 0, name: p.name, at: new Date().toISOString() });
        setStatus("local");
        setSaved({ files: p.files, folders: p.folders });
        addLog(loggedIn ? "Projet enregistré sur cet appareil." : "Projet enregistré sur cet appareil (connectez-vous pour le synchroniser).");
        return true;
      }
      if (savingRef.current) return false;
      savingRef.current = true;
      setStatus("enregistrement");
      const body = { files: p.files, folders: p.folders, baseRevision: conflict && opts.force ? conflict.revision : p.revision, force: Boolean(opts.force), checkpoint: opts.checkpoint };
      try {
        const res = await fetch(`/api/projects/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data.server) {
          setConflict({ ...data.server, updatedAt: data.server.updated_at });
          setStatus("conflit");
          addLog("Conflit : le projet a été modifié sur un autre appareil.", "avertissement");
          return false;
        }
        if (!res.ok) {
          setStatus("erreur");
          addLog(data.error ?? "Enregistrement impossible.", "erreur");
          return false;
        }
        const sp = data.project as { revision: number; files: ProjectSnapshot["files"]; folders: string[]; updated_at: string };
        // Les frappes faites pendant l'envoi restent « modifiées ».
        setSaved({ files: body.files, folders: body.folders });
        setProject((cur) => ({ ...cur, revision: sp.revision, updatedAt: sp.updated_at }));
        const now = projectRef.current;
        const pending = !sameSnapshot({ files: now.files, folders: now.folders }, { files: body.files, folders: body.folders });
        writeDraft(p.id, pending ? { snapshot: { files: now.files, folders: now.folders }, baseRevision: sp.revision, name: now.name, at: new Date().toISOString() } : null);
        setConflict(null);
        setStatus(pending ? "modifie" : "enregistre");
        addLog(opts.checkpoint ? `Point de sauvegarde « ${opts.checkpoint} » créé (révision ${sp.revision}).` : `Projet enregistré (révision ${sp.revision}).`);
        return true;
      } catch {
        setStatus("hors_ligne");
        addLog("Hors ligne : les modifications sont conservées sur cet appareil et seront synchronisées à la reconnexion.", "avertissement");
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [addLog, conflict, loggedIn],
  );

  /** Abandonne la version locale au profit de celle du serveur. */
  const acceptServer = useCallback(() => {
    if (!conflict) return;
    setProject({ ...conflict });
    setSaved({ files: conflict.files, folders: conflict.folders });
    writeDraft(conflict.id, null);
    setConflict(null);
    setStatus("enregistre");
    addLog(`Version du serveur chargée (révision ${conflict.revision}).`);
  }, [conflict, addLog]);

  // Enregistrement automatique (2,5 s après la dernière modification)
  useEffect(() => {
    if (!autosave || status !== "modifie" || !project.id) return;
    const t = setTimeout(() => void save(), 2500);
    return () => clearTimeout(t);
  }, [autosave, status, project, save]);

  // Synchronisation au retour de la connexion
  useEffect(() => {
    const onOnline = () => {
      if (projectRef.current.id && (status === "hors_ligne" || status === "modifie")) {
        addLog("Connexion rétablie : synchronisation.");
        void save();
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [status, save, addLog]);

  // Avertissement avant de quitter avec des modifications non synchronisées
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (status === "modifie" || status === "enregistrement" || status === "hors_ligne" || status === "conflit") e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [status]);

  const isDirty = useCallback(
    (path: string) => {
      const a = project.files.find((f) => f.path === path)?.content;
      const b = saved.files.find((f) => f.path === path)?.content;
      return a !== b;
    },
    [project.files, saved.files],
  );

  return { project, setProject, saved, setSaved, update, save, status, setStatus, conflict, acceptServer, isDirty, log, addLog };
}
