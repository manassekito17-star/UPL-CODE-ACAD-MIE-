import { createDocument, type GraphicDocument } from '@/engine/documents';
import { Autosaver, type SaveStatus } from '@/features/persistence/autosave';
import type { ProjectRepository } from '@/services/projects';

const doc = (id: string, name = id): GraphicDocument =>
  createDocument({ width: 10, height: 10, background: 'white', name }, { id, now: 0 });

function setup(options: { failSave?: boolean } = {}) {
  const saved: string[] = [];
  const removed: string[] = [];
  let release: (() => void) | null = null;
  let hold = false;
  const repo: ProjectRepository = {
    loadAll: async () => ({ documents: [], unreadable: [] }),
    save: async (d) => {
      if (hold) await new Promise<void>((r) => (release = r));
      if (options.failSave) throw new Error('disque plein');
      saved.push(`${d.id}:${d.name}`);
    },
    remove: async (id) => {
      removed.push(id);
    },
  };
  const statuses: Record<string, SaveStatus | null> = {};
  const gone: string[] = [];
  const saver = new Autosaver({
    repo,
    delayMs: 500,
    now: () => 42,
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    onStatus: (id, s) => (statuses[id] = s),
    onRemoved: (d) => gone.push(d.id),
  });
  return { saver, saved, removed, statuses, gone, holdWrites: () => (hold = true), release: () => release?.() };
}

const settle = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

describe('sauvegarde automatique', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('regroupe les modifications rapprochées en une seule écriture', async () => {
    const { saver, saved, statuses } = setup();
    saver.update({ a: doc('a', 'v1') });
    jest.advanceTimersByTime(300);
    saver.update({ a: doc('a', 'v2') });
    expect(statuses.a).toEqual({ state: 'pending' });
    jest.advanceTimersByTime(300);
    expect(saved).toEqual([]);
    jest.advanceTimersByTime(300);
    await settle();
    expect(saved).toEqual(['a:v2']);
    expect(statuses.a).toEqual({ state: 'saved', at: 42 });
  });

  it('n’écrit pas un document déjà enregistré tel quel', async () => {
    const { saver, saved, statuses } = setup();
    const a = doc('a');
    saver.markWritten([a]);
    saver.update({ a });
    jest.advanceTimersByTime(1000);
    await settle();
    expect(saved).toEqual([]);
    expect(statuses.a).toEqual({ state: 'saved', at: a.updatedAt });
  });

  it('« Enregistrer » écrit tout de suite', async () => {
    const { saver, saved } = setup();
    saver.update({ a: doc('a'), b: doc('b') });
    await saver.flush();
    expect(saved.sort()).toEqual(['a:a', 'b:b']);
    expect(saver.hasPending()).toBe(false);
  });

  it('une modification pendant une écriture est écrite ensuite, la plus récente gagne', async () => {
    const { saver, saved, statuses, holdWrites, release } = setup();
    holdWrites();
    saver.update({ a: doc('a', 'v1') });
    jest.advanceTimersByTime(500);
    await settle();
    expect(statuses.a).toEqual({ state: 'saving' });
    saver.update({ a: doc('a', 'v2') });
    jest.advanceTimersByTime(500);
    release();
    await settle();
    release();
    await settle();
    expect(saved).toEqual(['a:v1', 'a:v2']);
    expect(statuses.a).toEqual({ state: 'saved', at: 42 });
  });

  it('un échec d’écriture est signalé, jamais caché', async () => {
    const { saver, statuses } = setup({ failSave: true });
    saver.update({ a: doc('a') });
    await saver.flush();
    expect(statuses.a).toEqual({ state: 'error', message: 'disque plein' });
  });

  it('un document supprimé du store est supprimé de l’appareil, puis ses fichiers', async () => {
    const { saver, removed, gone, statuses } = setup();
    saver.update({ a: doc('a'), b: doc('b') });
    await saver.flush();
    saver.update({ b: doc('b') });
    await settle();
    expect(removed).toEqual(['a']);
    expect(gone).toEqual(['a']);
    expect(statuses.a).toBeNull();
  });

  it('arrêtée, elle n’écrit plus', async () => {
    const { saver, saved } = setup();
    saver.update({ a: doc('a') });
    saver.stop();
    jest.advanceTimersByTime(1000);
    await settle();
    expect(saved).toEqual([]);
  });
});
