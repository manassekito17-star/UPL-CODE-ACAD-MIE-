import type { GraphicDocument } from '@/engine/documents';

/** Projet enregistré qui n'a pas pu être lu (endommagé, ou d'une version plus récente). */
export interface UnreadableProject {
  id: string;
  name: string;
  message: string;
}

export interface LoadedProjects {
  /** Du plus récemment modifié au plus ancien. */
  documents: GraphicDocument[];
  unreadable: UnreadableProject[];
}

/** Stockage des projets sur l'appareil. Chaque écriture est atomique. */
export interface ProjectRepository {
  loadAll(): Promise<LoadedProjects>;
  save(doc: GraphicDocument): Promise<void>;
  remove(id: string): Promise<void>;
}
