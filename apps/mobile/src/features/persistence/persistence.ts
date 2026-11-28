import { AppState } from 'react-native';
import { create } from 'zustand';

import { DOCUMENT_LIMITS, type GraphicDocument } from '@/engine/documents';
import { attachAssets, buildPackage, packageFileName, readPackage, referencedFiles } from '@/engine/project';
import {
  assetFiles,
  getProjectRepository,
  getSettingsRepository,
  orphanFiles,
  packageFiles,
  relocateAssets,
  thumbnailFiles,
  type UnreadableProject,
} from '@/services/projects';
import { useDocumentStore } from '@/stores/documentStore';
import { createLocalId } from '@/utils/id';

import { Autosaver, type SaveStatus } from './autosave';

/**
 * Enregistrement, sur le modèle des logiciels de bureau :
 *
 * - Un nouveau document n'est PAS enregistré : le premier « Enregistrer »
 *   ouvre « Enregistrer sous » (nom, emplacement).
 * - La version enregistrée ne change qu'à « Enregistrer » (ou par la
 *   sauvegarde automatique, si elle est activée dans les préférences).
 * - En attendant, chaque modification est copiée en continu dans une copie
 *   de récupération : une interruption (application tuée, batterie) ne fait
 *   rien perdre, et le document est proposé à la récupération au démarrage.
 * - Un projet peut aussi vivre dans un fichier « .zdesign » choisi par
 *   l'utilisateur : « Enregistrer » le réécrit.
 */

export interface FileInfo {
  /** Enregistré au moins une fois (sinon « Enregistrer » ouvre « Enregistrer sous »). */
  savedOnce: boolean;
  /** Fichier « .zdesign » associé, s'il y en a un. */
  location: { uri: string; name: string } | null;
  savedAt: number | null;
  /** Écriture en cours ou échouée. */
  status: SaveStatus | null;
  /** Modifications retrouvées dans une copie de récupération au démarrage. */
  recovered: boolean;
}

export interface Preferences {
  /** Sauvegarde automatique des projets déjà enregistrés : délai en secondes, ou null (désactivée). */
  autoSaveSeconds: number | null;
}

export const AUTOSAVE_CHOICES: readonly (number | null)[] = [null, 30, 60, 300];
const PREFERENCES_KEY = 'preferences';

export interface PersistenceState {
  phase: 'idle' | 'loading' | 'ready' | 'failed';
  loadError: string | null;
  /** Projets présents sur l'appareil mais illisibles (gardés tels quels, jamais écrasés). */
  unreadable: readonly UnreadableProject[];
  files: Readonly<Record<string, FileInfo>>;
  /** Version enregistrée de chaque document (référence : « modifié » = document différent de celle-ci). */
  clean: Readonly<Record<string, GraphicDocument>>;
  preferences: Preferences;
}

const INITIAL: Omit<PersistenceState, 'phase'> = { loadError: null, unreadable: [], files: {}, clean: {}, preferences: { autoSaveSeconds: null } };

export const usePersistenceStore = create<PersistenceState>()(() => ({ phase: 'idle', ...INITIAL }));

const NEW_FILE: FileInfo = { savedOnce: false, location: null, savedAt: null, status: null, recovered: false };

export function fileInfoOf(id: string): FileInfo {
  return usePersistenceStore.getState().files[id] ?? NEW_FILE;
}

/** Le document a-t-il des modifications non enregistrées ? (un document jamais enregistré en a toujours) */
export function isDirty(id: string): boolean {
  const doc = useDocumentStore.getState().documents[id];
  const clean = usePersistenceStore.getState().clean[id];
  return !!doc && (!clean || clean !== doc);
}

function setFile(id: string, patch: Partial<FileInfo>) {
  usePersistenceStore.setState((s) => ({ files: { ...s.files, [id]: { ...(s.files[id] ?? NEW_FILE), ...patch } } }));
}
function setClean(id: string, doc: GraphicDocument | null) {
  usePersistenceStore.setState((s) => {
    const { [id]: _old, ...rest } = s.clean;
    return { clean: doc ? { ...rest, [id]: doc } : rest };
  });
}

/** Délai d'écriture des copies de récupération ; null coupe l'écriture différée (tests). */
let draftDelayMs: number | null = 600;
let drafts: Autosaver | null = null;
let stopFns: (() => void)[] = [];
let starting: Promise<void> | null = null;
const autoSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function configurePersistence(options: { autosaveDelayMs: number | null }): void {
  draftDelayMs = options.autosaveDelayMs;
}

/** Toutes les URI d'images encore utilisées : documents, versions enregistrées ET états d'historique. */
function filesInUse(): string[] {
  const { documents, histories } = useDocumentStore.getState();
  const docs: GraphicDocument[] = [
    ...Object.values(documents),
    ...Object.values(usePersistenceStore.getState().clean),
    ...Object.values(histories).flatMap((h) => h.states.map((st) => st.doc)),
  ];
  return docs.flatMap(referencedFiles);
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Écrit l'archive « .zdesign » du document (images comprises, miniature si elle existe). */
function packageOf(doc: GraphicDocument): Uint8Array {
  let thumbnail: Uint8Array | null = null;
  const thumbUri = thumbnailFiles.uri(doc.id);
  if (thumbUri && !thumbUri.startsWith('data:')) {
    try {
      thumbnail = packageFiles.readAsset(thumbUri);
    } catch {
      thumbnail = null;
    }
  }
  return buildPackage(doc, packageFiles.readAsset, thumbnail);
}

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------

/**
 * Charge les projets enregistrés et les copies de récupération, rattache les
 * images au dossier actuel, nettoie les fichiers orphelins, puis écrit les
 * copies de récupération au fil des modifications. Idempotent.
 */
export function startPersistence(): Promise<void> {
  starting ??= (async () => {
    usePersistenceStore.setState({ phase: 'loading', loadError: null });
    const repo = getProjectRepository();
    let loaded;
    try {
      loaded = await repo.loadAll();
    } catch (error) {
      starting = null;
      usePersistenceStore.setState({ phase: 'failed', loadError: errorMessage(error) });
      return;
    }
    try {
      const raw = await getSettingsRepository().get(PREFERENCES_KEY);
      const prefs = raw ? (JSON.parse(raw) as Partial<Preferences>) : {};
      if (AUTOSAVE_CHOICES.includes(prefs.autoSaveSeconds ?? null)) {
        usePersistenceStore.setState({ preferences: { autoSaveSeconds: prefs.autoSaveSeconds ?? null } });
      }
    } catch {
      // Préférences illisibles : valeurs par défaut.
    }

    const dir = assetFiles.directoryUri();
    const saved = loaded.documents.map((d) => relocateAssets(d, dir));
    const store = useDocumentStore.getState();
    store.hydrate(saved);
    const files: Record<string, FileInfo> = {};
    const clean: Record<string, GraphicDocument> = {};
    for (const doc of saved) {
      const uri = loaded.locations[doc.id];
      files[doc.id] = { ...NEW_FILE, savedOnce: true, savedAt: doc.updatedAt, location: uri ? { uri, name: decodeURIComponent(uri.slice(uri.lastIndexOf('/') + 1)) } : null };
      clean[doc.id] = useDocumentStore.getState().documents[doc.id] ?? doc;
    }
    // Copies de récupération : elles remplacent la version enregistrée (signalée « récupérée »).
    for (const draft of loaded.drafts.map((d) => relocateAssets(d, dir))) {
      if (clean[draft.id]) store.replaceDocument(draft, 'Récupération');
      else store.hydrate([draft]);
      files[draft.id] = { ...(files[draft.id] ?? NEW_FILE), recovered: true };
    }
    usePersistenceStore.setState((s) => ({ files: { ...s.files, ...files }, clean: { ...s.clean, ...clean } }));

    // Au démarrage seulement, avant toute importation : une image que plus aucun projet ne référence est supprimée.
    assetFiles.remove(orphanFiles(assetFiles.list(), filesInUse()));
    const known = useDocumentStore.getState().documents;
    for (const id of thumbnailFiles.list()) if (!known[id] && !loaded.unreadable.some((u) => u.id === id)) thumbnailFiles.remove(id);

    if (draftDelayMs !== null) {
      const writer = new Autosaver({
        // Copie de récupération tant que le document diffère de sa version enregistrée.
        write: async (doc) => (isDirty(doc.id) ? repo.saveDraft(doc) : repo.removeDraft(doc.id)),
        remove: (id) => repo.remove(id),
        delayMs: draftDelayMs,
        now: Date.now,
        setTimer: (fn, ms) => setTimeout(fn, ms),
        clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
        onStatus: () => undefined,
        onRemoved: (doc) => {
          setClean(doc.id, null);
          usePersistenceStore.setState((s) => {
            const { [doc.id]: _gone, ...rest } = s.files;
            return { files: rest };
          });
          const inUse = new Set(filesInUse());
          assetFiles.remove(referencedFiles(doc).filter((uri) => !inUse.has(uri)));
          thumbnailFiles.remove(doc.id);
        },
      });
      writer.markWritten(Object.values(clean));
      drafts = writer;
      writer.update(useDocumentStore.getState().documents);
      stopFns.push(
        useDocumentStore.subscribe((s) => {
          writer.update(s.documents);
          scheduleAutoSaves();
        }),
      );
      const sub = AppState.addEventListener('change', (next) => {
        if (next !== 'active') void writer.flush();
      });
      stopFns.push(() => sub.remove());
    }
    usePersistenceStore.setState({ phase: 'ready', unreadable: loaded.unreadable });
  })();
  return starting;
}

/** Sauvegarde automatique (préférence) : les projets déjà enregistrés et modifiés le sont après le délai choisi. */
function scheduleAutoSaves() {
  const seconds = usePersistenceStore.getState().preferences.autoSaveSeconds;
  if (seconds === null) return;
  for (const id of Object.keys(useDocumentStore.getState().documents)) {
    if (!fileInfoOf(id).savedOnce || !isDirty(id)) continue;
    const old = autoSaveTimers.get(id);
    if (old) clearTimeout(old);
    autoSaveTimers.set(
      id,
      setTimeout(() => {
        autoSaveTimers.delete(id);
        if (isDirty(id)) void saveDocument(id);
      }, seconds * 1000),
    );
  }
}

export async function setAutoSave(seconds: number | null): Promise<void> {
  usePersistenceStore.setState({ preferences: { autoSaveSeconds: seconds } });
  for (const t of autoSaveTimers.values()) clearTimeout(t);
  autoSaveTimers.clear();
  scheduleAutoSaves();
  await getSettingsRepository().set(PREFERENCES_KEY, JSON.stringify({ autoSaveSeconds: seconds }));
}

// ---------------------------------------------------------------------------
// Commandes du menu Fichier
// ---------------------------------------------------------------------------

export type SaveResult = { ok: true; id: string } | { ok: false; reason: 'needsSaveAs' | 'cancelled' } | { ok: false; reason: 'error'; message: string };

/** Écrit la version de référence (base de l'application, et fichier « .zdesign » s'il y en a un). */
async function writeSaved(doc: GraphicDocument, location: FileInfo['location']): Promise<void> {
  const repo = getProjectRepository();
  setFile(doc.id, { status: { state: 'saving' } });
  await repo.save(doc);
  if (location) {
    try {
      await packageFiles.overwrite(location.uri, packageOf(doc));
    } catch (e) {
      throw new Error(`le fichier « ${location.name} » n’est plus accessible (${errorMessage(e)}). Utilisez « Enregistrer sous ».`);
    }
  }
  setClean(doc.id, doc);
  setFile(doc.id, { savedOnce: true, savedAt: Date.now(), status: null, recovered: false, location });
}

/** Fichier › Enregistrer. Un document jamais enregistré demande « Enregistrer sous ». */
export async function saveDocument(id: string): Promise<SaveResult> {
  const doc = useDocumentStore.getState().documents[id];
  if (!doc) return { ok: false, reason: 'error', message: 'Projet introuvable.' };
  const info = fileInfoOf(id);
  if (!info.savedOnce) return { ok: false, reason: 'needsSaveAs' };
  try {
    await writeSaved(doc, info.location);
    return { ok: true, id };
  } catch (e) {
    const message = errorMessage(e);
    setFile(id, { status: { state: 'error', message } });
    return { ok: false, reason: 'error', message };
  }
}

export type SaveTarget = 'device' | 'folder';

function validName(raw: string): string | null {
  const name = raw.replace(/\s+/g, ' ').trim();
  return name === '' || name.length > DOCUMENT_LIMITS.maxNameLength ? null : name;
}

/**
 * Fichier › Enregistrer sous. Un document jamais enregistré est enregistré
 * sous ce nom. Un document déjà enregistré donne un NOUVEAU projet (comme un
 * nouveau fichier) : c'est lui qui reste ouvert, et l'original garde sa
 * dernière version enregistrée.
 */
export async function saveDocumentAs(id: string, rawName: string, target: SaveTarget): Promise<SaveResult> {
  const store = useDocumentStore.getState();
  const current = store.documents[id];
  const name = validName(rawName);
  if (!current) return { ok: false, reason: 'error', message: 'Projet introuvable.' };
  if (!name) return { ok: false, reason: 'error', message: `Le nom doit contenir 1 à ${DOCUMENT_LIMITS.maxNameLength} caractères.` };
  const info = fileInfoOf(id);
  try {
    let doc: GraphicDocument;
    if (!info.savedOnce) {
      if (name !== current.name) store.renameDocument(id, name);
      doc = useDocumentStore.getState().documents[id] as GraphicDocument;
    } else {
      doc = { ...current, id: createLocalId('doc'), name, createdAt: Date.now(), updatedAt: Date.now() };
    }
    let location: FileInfo['location'] = null;
    if (target === 'folder') {
      const written = await packageFiles.saveToFolder(packageFileName(name), packageOf(doc));
      if (!written) return { ok: false, reason: 'cancelled' };
      location = written;
    }
    if (info.savedOnce) {
      // Nouveau projet ; l'original revient à sa version enregistrée.
      const clean = usePersistenceStore.getState().clean[id];
      useDocumentStore.getState().hydrate([doc]);
      if (clean) {
        useDocumentStore.getState().replaceDocument(clean, 'Ouvrir');
        await getProjectRepository().removeDraft(id);
      }
    }
    await writeSaved(doc, location);
    await getProjectRepository().setLocation(doc.id, location?.uri ?? null);
    return { ok: true, id: doc.id };
  } catch (e) {
    const message = errorMessage(e);
    setFile(id, { status: { state: 'error', message } });
    return { ok: false, reason: 'error', message };
  }
}

/**
 * Fichier › Enregistrer une copie : écrit une copie (projet de l'appareil ou
 * fichier « .zdesign ») sans rien changer au document ouvert.
 */
export async function saveCopy(id: string, rawName: string, target: SaveTarget): Promise<SaveResult> {
  const current = useDocumentStore.getState().documents[id];
  const name = validName(rawName);
  if (!current) return { ok: false, reason: 'error', message: 'Projet introuvable.' };
  if (!name) return { ok: false, reason: 'error', message: `Le nom doit contenir 1 à ${DOCUMENT_LIMITS.maxNameLength} caractères.` };
  const copy: GraphicDocument = { ...current, id: createLocalId('doc'), name, createdAt: Date.now(), updatedAt: Date.now() };
  try {
    if (target === 'folder') {
      const written = await packageFiles.saveToFolder(packageFileName(name), packageOf(copy));
      return written ? { ok: true, id: copy.id } : { ok: false, reason: 'cancelled' };
    }
    useDocumentStore.getState().hydrate([copy]);
    await writeSaved(copy, null);
    return { ok: true, id: copy.id };
  } catch (e) {
    return { ok: false, reason: 'error', message: errorMessage(e) };
  }
}

/**
 * « Ne pas enregistrer » à la fermeture : un document déjà enregistré revient
 * à sa version enregistrée ; un document jamais enregistré est abandonné.
 */
export async function discardChanges(id: string): Promise<void> {
  const clean = usePersistenceStore.getState().clean[id];
  if (clean) {
    useDocumentStore.getState().replaceDocument(clean, 'Ouvrir');
    setFile(id, { recovered: false, status: null });
    await getProjectRepository().removeDraft(id);
  } else {
    useDocumentStore.getState().removeDocument(id);
    await getProjectRepository().remove(id);
  }
}

/**
 * Fichier › Ouvrir : choisir un fichier « .zdesign ». Ses images sont copiées
 * dans l'application ; si le même projet est déjà ouvert, le fichier est
 * ouvert comme un nouveau projet. Renvoie l'identifiant, null si annulé.
 */
export async function openPackageFile(): Promise<{ ok: true; id: string } | { ok: false; message: string } | null> {
  const picked = await packageFiles.pick();
  if (!picked) return null;
  const read = readPackage(picked.bytes);
  if (!read.ok) return { ok: false, message: read.message };
  const written = new Map<string, string>();
  for (const [path, bytes] of Object.entries(read.assets)) written.set(path, packageFiles.writeAsset(path, bytes));
  let doc = attachAssets(read.document, (p) => written.get(p) ?? p);
  if (useDocumentStore.getState().documents[doc.id]) doc = { ...doc, id: createLocalId('doc') };
  useDocumentStore.getState().hydrate([doc]);
  if (read.thumbnail) void thumbnailFiles.write(doc.id, read.thumbnail);
  const location = picked.uri.startsWith('upload:') ? null : { uri: picked.uri, name: picked.name };
  try {
    await getProjectRepository().save(doc);
    await getProjectRepository().setLocation(doc.id, location?.uri ?? null);
  } catch (e) {
    return { ok: false, message: `Projet ouvert mais non copié sur l’appareil : ${errorMessage(e)}` };
  }
  setClean(doc.id, doc);
  setFile(doc.id, { savedOnce: true, savedAt: doc.updatedAt, location, status: null, recovered: false });
  return { ok: true, id: doc.id };
}

/** Écrit tout de suite les copies de récupération en attente. */
export async function flushDrafts(): Promise<void> {
  await drafts?.flush();
}

/** Supprime de l'appareil un projet illisible (choix explicite de l'utilisateur). */
export async function removeUnreadable(id: string): Promise<void> {
  await getProjectRepository().remove(id);
  usePersistenceStore.setState((s) => ({ unreadable: s.unreadable.filter((u) => u.id !== id) }));
}

/** Arrête tout et revient à l'état initial (tests). */
export function stopPersistence(): void {
  drafts?.stop();
  drafts = null;
  for (const fn of stopFns) fn();
  stopFns = [];
  for (const t of autoSaveTimers.values()) clearTimeout(t);
  autoSaveTimers.clear();
  starting = null;
  usePersistenceStore.setState({ phase: 'idle', ...INITIAL });
}

/** Le document est enregistré tel quel (tests : simule un projet existant). */
export function markSaved(id: string): void {
  const doc = useDocumentStore.getState().documents[id];
  if (!doc) return;
  setClean(id, doc);
  setFile(id, { savedOnce: true, savedAt: doc.updatedAt });
}
