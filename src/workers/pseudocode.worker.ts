/// <reference lib="webworker" />
import { runPseudocode } from "../lib/pseudocode";

self.onmessage = (e: MessageEvent<{ code: string; stdin: string }>) => {
  const started = performance.now();
  const result = runPseudocode(e.data.code, e.data.stdin);
  self.postMessage({ ...result, timeMs: Math.round(performance.now() - started) });
};
