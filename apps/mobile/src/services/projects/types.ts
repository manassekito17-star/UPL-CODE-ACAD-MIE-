import type { GraphicDocument } from '@/engine/documents';

/** Projet enregistré qui n'a pas pu être lu (endommagé, ou d'une version plus récente). */
export interface UnreadableProject {
  id: string;
  name: string;
  message: string;
}

export interface LoadedProjects {
  /** Versions ENREGISTRÉES, du plus récemment modifié au plus ancien. */
  documents: GraphicDocument[];
  unreadable: UnreadableProject[];
  /**
   * Copies de récupération : modifications pas encore enregistrées, écrites
   * en continu pour survivre à une interruption (application tuée, batterie).
   */
  drafts: GraphicDocument[];
  /** Fichier « .zdesign » associé à un projet enregistré (URI), s'il y en a un. */
  locations: Record<string, string>;
}

/** Réglages de l'application (préréglages personnalisés, préférences), en texte. */
export interface SettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

/** Stockage des projets sur l'appareil. Chaque écriture est atomique. */
export interface ProjectRepository {
  loadAll(): Promise<LoadedProjects>;
  /** Enregistre la version de référence (et retire sa copie de récupération). */
  save(doc: GraphicDocument): Promise<void>;
  /** Supprime le projet ET sa copie de récupération. */
  remove(id: string): Promise<void>;
  saveDraft(doc: GraphicDocument): Promise<void>;
  removeDraft(id: string): Promise<void>;
  /** Associe (ou dissocie, avec null) un fichier « .zdesign » à un projet enregistré. */
  setLocation(id: string, uri: string | null): Promise<void>;
}
