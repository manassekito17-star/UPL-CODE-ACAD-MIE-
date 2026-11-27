import type { GraphicDocument } from '@/engine/documents';
import type { ProjectRepository } from '@/services/projects';

export type SaveStatus =
  | { state: 'saved'; at: number }
  | { state: 'pending' }
  | { state: 'saving' }
  | { state: 'error'; message: string };

export interface AutosaverDeps {
  repo: ProjectRepository;
  /** Délai après la dernière modification avant d'écrire (regroupe les modifications rapprochées). */
  delayMs: number;
  now: () => number;
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (handle: unknown) => void;
  onStatus: (id: string, status: SaveStatus | null) => void;
  /** Un document a disparu du store et de l'appareil (pour nettoyer ses fichiers). */
  onRemoved: (doc: GraphicDocument) => void;
}

/**
 * Sauvegarde automatique : compare les documents du store à la dernière
 * version écrite (par identité d'objet : les documents sont immuables) et
 * écrit chaque document modifié après `delayMs` sans nouvelle modification.
 * Les écritures d'un même document sont mises en file : jamais deux en même
 * temps, et la plus récente gagne toujours.
 */
export class Autosaver {
  private written = new Map<string, GraphicDocument>();
  private latest = new Map<string, GraphicDocument>();
  private timers = new Map<string, unknown>();
  private queues = new Map<string, Promise<void>>();
  private stopped = false;

  constructor(private readonly deps: AutosaverDeps) {}

  /** Documents chargés depuis l'appareil : déjà enregistrés tels quels. */
  markWritten(docs: readonly GraphicDocument[]): void {
    for (const doc of docs) {
      this.written.set(doc.id, doc);
      this.latest.set(doc.id, doc);
      // Heure réelle de la dernière modification enregistrée, pas celle du chargement.
      this.deps.onStatus(doc.id, { state: 'saved', at: doc.updatedAt });
    }
  }

  /** À appeler à chaque changement du store des documents. */
  update(documents: Readonly<Record<string, GraphicDocument>>): void {
    if (this.stopped) return;
    for (const [id, doc] of Object.entries(documents)) {
      if (this.latest.get(id) === doc) continue;
      this.latest.set(id, doc);
      if (this.written.get(id) === doc) continue;
      this.deps.onStatus(id, { state: 'pending' });
      this.schedule(id);
    }
    for (const [id, doc] of [...this.latest]) {
      if (documents[id]) continue;
      this.latest.delete(id);
      this.cancel(id);
      void this.enqueue(id, async () => {
        await this.deps.repo.remove(id);
        this.written.delete(id);
        this.deps.onStatus(id, null);
        this.deps.onRemoved(doc);
      });
    }
  }

  /** Écrit tout de suite tout ce qui attend (Enregistrer, passage en arrière-plan). */
  async flush(): Promise<void> {
    for (const id of [...this.timers.keys()]) {
      this.cancel(id);
      void this.write(id);
    }
    await Promise.all([...this.queues.values()]);
  }

  /** Arrête les écritures différées (les écritures en cours se terminent). */
  stop(): void {
    this.stopped = true;
    for (const id of [...this.timers.keys()]) this.cancel(id);
  }

  hasPending(): boolean {
    return this.timers.size > 0;
  }

  private schedule(id: string) {
    this.cancel(id);
    this.timers.set(
      id,
      this.deps.setTimer(() => {
        this.timers.delete(id);
        void this.write(id);
      }, this.deps.delayMs),
    );
  }

  private cancel(id: string) {
    const handle = this.timers.get(id);
    if (handle !== undefined) this.deps.clearTimer(handle);
    this.timers.delete(id);
  }

  private write(id: string): Promise<void> {
    return this.enqueue(id, async () => {
      const doc = this.latest.get(id);
      if (!doc || this.written.get(id) === doc) return;
      this.deps.onStatus(id, { state: 'saving' });
      try {
        await this.deps.repo.save(doc);
        this.written.set(id, doc);
        // Une modification arrivée pendant l'écriture reste « en attente ».
        if (this.latest.get(id) === doc) this.deps.onStatus(id, { state: 'saved', at: this.deps.now() });
        else this.deps.onStatus(id, { state: 'pending' });
      } catch (error) {
        this.deps.onStatus(id, { state: 'error', message: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  private enqueue(id: string, task: () => Promise<void>): Promise<void> {
    const next = (this.queues.get(id) ?? Promise.resolve()).then(task, task);
    this.queues.set(id, next);
    void next.then(() => {
      if (this.queues.get(id) === next) this.queues.delete(id);
    });
    return next;
  }
}
