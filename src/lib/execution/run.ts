import "server-only";

import { runPseudocode } from "../pseudocode";
import { isJudge0Configured } from "../server-env";
import { fromKPlusRunner } from "../kplus/runner";
import { runOnJudge0 } from "./judge0";
import { EXECUTION_LIMITS, LANGUAGES } from "./languages";
import type { ExecutionRequest, ExecutionResult } from "./types";

export class ExecutionUnavailableError extends Error {
  constructor(public browserFallback: boolean) {
    super("Service d'exécution non configuré.");
  }
}

/** Exécute un programme côté serveur (interpréteur pour le pseudocode, Judge0 pour les autres). */
export async function executeOnServer(req: ExecutionRequest, limits: { cpuTimeLimitSeconds?: number; memoryLimitKb?: number } = {}): Promise<ExecutionResult> {
  if (LANGUAGES[req.language].preview) throw new Error("Les projets web ne s'exécutent pas sur le serveur.");
  // PHP et SQL : jamais exécutés côté serveur (ni sur la plateforme ni sur Judge0) ;
  // ils tournent dans le navigateur de l'étudiant (WebAssembly isolé).
  if (req.language === "php" || req.language === "sql") throw new ExecutionUnavailableError(true);
  if (req.language === "pseudocode") {
    const started = performance.now();
    // L'interpréteur ne fait aucun appel système : il ne lit et n'écrit que
    // des valeurs en mémoire, avec une limite d'instructions et de récursivité.
    const r = runPseudocode(req.files[0]?.content ?? "", req.stdin, {
      maxSteps: EXECUTION_LIMITS.pseudocodeMaxSteps,
      maxOutput: EXECUTION_LIMITS.maxOutputChars,
    });
    const timeMs = Math.round(performance.now() - started);
    if (r.ok) {
      return { status: "ok", stdout: r.stdout, stderr: "", compileOutput: "", timeMs, memoryKb: null, engine: "interpreteur" };
    }
    const e = r.error!;
    const message = `${e.kind === "syntaxe" ? "Erreur de syntaxe" : "Erreur"}${e.line ? ` (ligne ${e.line})` : ""} : ${e.message}`;
    const limit = /Limite d'exécution/.test(e.message);
    return {
      status: limit ? "temps_depasse" : e.kind === "syntaxe" ? "erreur_compilation" : "erreur_execution",
      stdout: r.stdout,
      stderr: e.kind === "syntaxe" ? "" : message,
      compileOutput: e.kind === "syntaxe" ? message : "",
      timeMs,
      memoryKb: null,
      engine: "interpreteur",
      errorLine: e.line || undefined,
      hint: e.hint,
    };
  }
  if (!isJudge0Configured()) throw new ExecutionUnavailableError(LANGUAGES[req.language].browserFallback);
  const r = await runOnJudge0(req, limits);
  return req.language === "kplus" ? fromKPlusRunner(r) : r;
}
