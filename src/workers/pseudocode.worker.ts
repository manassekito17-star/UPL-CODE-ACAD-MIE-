/// <reference lib="webworker" />
import { runPseudocode } from "../lib/pseudocode";

self.onmessage = (e: MessageEvent<{ code: string; stdin: string; seed?: number }>) => {
  const started = performance.now();
  const result = runPseudocode(e.data.code, e.data.stdin, { seed: e.data.seed });
  self.postMessage({ ...result, timeMs: Math.round(performance.now() - started) });
};
