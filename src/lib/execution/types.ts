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
  /** Nom précis du moteur (ex. « PHP 8.3 (WebAssembly) », « SQLite 3.49 »). */
  engineLabel?: string;
  /** SQL : résultats des requêtes SELECT, affichés sous forme de tableaux. */
  tables?: SqlResultSet[];
  /** SQL : structure de la base après exécution (tables, colonnes, relations). */
  schema?: SqlTableInfo[];
  /** SQL : journal ordonné des instructions (message, ou numéro de tableau de résultats). */
  log?: Array<{ table?: number; message?: string }>;
}

export interface SqlResultSet {
  sql: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
  truncated?: boolean;
}

export interface SqlTableInfo {
  name: string;
  type: "table" | "view";
  rows: number | null;
  columns: Array<{ name: string; type: string; notNull: boolean; pk: boolean }>;
  foreignKeys: Array<{ from: string; table: string; to: string }>;
}

/** Nom du moteur affiché dans la console. */
export function engineName(r: Pick<ExecutionResult, "engine" | "engineLabel">, long = false): string {
  if (r.engineLabel) return r.engineLabel;
  if (r.engine === "serveur") return long ? "bac à sable serveur (Judge0)" : "bac à sable serveur";
  if (r.engine === "interpreteur") return "interpréteur UPL";
  return long ? "navigateur (Web Worker isolé)" : "navigateur";
}

export const STATUS_LABELS: Record<ExecutionStatus, string> = {
  ok: "Exécution terminée",
  erreur_compilation: "Erreur de compilation",
  erreur_execution: "Erreur à l'exécution",
  temps_depasse: "Temps limite dépassé",
  memoire_depassee: "Mémoire limite dépassée",
  erreur_interne: "Erreur du service d'exécution",
};
