import { getSettingsRepository } from '@/services/projects';
import { layoutOf, normalizeLayout } from '@/stores/workspaceLayout';
import { DEFAULT_WORKSPACE, WORKSPACE_NAME_MAX, useWorkspaceStore, type SavedWorkspace, type WorkspaceLayout } from '@/stores/workspaceStore';

/**
 * Espaces de travail conservés sur l'appareil (table des réglages) : la
 * disposition en cours, l'espace actuel et les espaces enregistrés. Lus une
 * fois par lancement, puis réécrits peu après chaque changement.
 */

const KEY = 'workspaces';
const FORMAT = 1;
const WRITE_DELAY_MS = 300;

export interface StoredWorkspaces {
  current: string;
  live: WorkspaceLayout;
  saved: SavedWorkspace[];
}

/** Lecture prudente : un espace mal formé est ignoré ; rien de lisible → null. */
export function parseStoredWorkspaces(json: string | null): StoredWorkspaces | null {
  if (!json) return null;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const o = data as Record<string, unknown>;
  if (o.format !== FORMAT) return null;
  const live = normalizeLayout(o.live);
  if (!live) return null;
  const saved: SavedWorkspace[] = [];
  for (const w of Array.isArray(o.saved) ? o.saved : []) {
    if (typeof w !== 'object' || w === null) continue;
    const name = (w as { name?: unknown }).name;
    const layout = normalizeLayout((w as { layout?: unknown }).layout);
    if (typeof name !== 'string' || name.trim() === '' || name.length > WORKSPACE_NAME_MAX || name === DEFAULT_WORKSPACE || !layout) continue;
    if (saved.some((s) => s.name === name)) continue;
    saved.push({ name, layout });
  }
  const current = typeof o.current === 'string' && saved.some((s) => s.name === o.current) ? o.current : DEFAULT_WORKSPACE;
  return { current, live, saved };
}

export function serializeWorkspaces(s: StoredWorkspaces): string {
  return JSON.stringify({ format: FORMAT, current: s.current, live: s.live, saved: s.saved });
}

let loading: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

/** Charge les espaces enregistrés (une fois), puis enregistre chaque changement. */
export function loadWorkspaces(): Promise<void> {
  loading ??= (async () => {
    try {
      const stored = parseStoredWorkspaces(await getSettingsRepository().get(KEY));
      if (stored) useWorkspaceStore.setState({ ...stored.live, savedWorkspaces: stored.saved, workspaceName: stored.current });
    } catch {
      // Réglages illisibles : on garde la disposition par défaut.
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    let last = '';
    unsubscribe = useWorkspaceStore.subscribe((s) => {
      const json = serializeWorkspaces({ current: s.workspaceName, live: layoutOf(s), saved: [...s.savedWorkspaces] });
      if (json === last) return;
      last = json;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        getSettingsRepository()
          .set(KEY, json)
          .catch(() => undefined);
      }, WRITE_DELAY_MS);
    });
  })();
  return loading;
}

/** Oublie le chargement (tests). */
export function resetWorkspacePersistence(): void {
  unsubscribe?.();
  unsubscribe = null;
  loading = null;
}
