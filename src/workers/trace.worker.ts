/// <reference lib="webworker" />
import { traceExecution } from "../lib/pseudocode";

/** Trace détaillée pour le laboratoire, calculée hors du fil principal (aucun blocage de la page). */
self.onmessage = (e: MessageEvent<{ code: string; stdin: string; maxSteps: number }>) => {
  const started = performance.now();
  const result = traceExecution(e.data.code, e.data.stdin, e.data.maxSteps, {}, { detailed: true });
  self.postMessage({ ...result, timeMs: Math.round(performance.now() - started) });
};
