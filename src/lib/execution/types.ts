import type { LanguageId } from "@/content/types";

export interface SourceFile {
  name: string;
  content: string;
}

export interface ExecutionRequest {
  language: LanguageId;
  files: SourceFile[];
  stdin: string;
}

export type ExecutionStatus =
  | "ok"
  | "erreur_compilation"
  | "erreur_execution"
  | "temps_depasse"
  | "memoire_depassee"
  | "erreur_interne";

export interface ExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  compileOutput: string;
  timeMs: number | null;
  memoryKb: number | null;
  /** Où le programme a été exécuté. */
  engine: "serveur" | "navigateur" | "interpreteur";
  /** Ligne de l'erreur (pseudocode), pour la souligner dans l'éditeur. */
  errorLine?: number;
  hint?: string;
}

export const STATUS_LABELS: Record<ExecutionStatus, string> = {
  ok: "Exécution terminée",
  erreur_compilation: "Erreur de compilation",
  erreur_execution: "Erreur à l'exécution",
  temps_depasse: "Temps limite dépassé",
  memoire_depassee: "Mémoire limite dépassée",
  erreur_interne: "Erreur du service d'exécution",
};
