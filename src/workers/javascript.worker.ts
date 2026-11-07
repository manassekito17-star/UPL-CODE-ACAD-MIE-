/// <reference lib="webworker" />
/**
 * Exécution de JavaScript dans un Web Worker dédié : pas d'accès à la page
 * (DOM, cookies, stockage), réseau désactivé, et le worker est détruit par
 * la page si le temps limite est dépassé.
 */
const scope = self as unknown as Record<string, unknown>;
for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel"]) {
  try {
    Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false });
  } catch {
    scope[name] = undefined;
  }
}

function format(v: unknown): string {
  if (typeof v === "string") return v;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (typeof v === "object" && v !== null) {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

self.onmessage = async (e: MessageEvent<{ code: string; stdin: string }>) => {
  const out: string[] = [];
  const err: string[] = [];
  const lines = e.data.stdin.replace(/\r\n?/g, "\n").split("\n");
  let pos = 0;
  const fakeConsole = {
    log: (...a: unknown[]) => out.push(a.map(format).join(" ") + "\n"),
    info: (...a: unknown[]) => out.push(a.map(format).join(" ") + "\n"),
    warn: (...a: unknown[]) => err.push(a.map(format).join(" ") + "\n"),
    error: (...a: unknown[]) => err.push(a.map(format).join(" ") + "\n"),
  };
  const lireLigne = () => (pos < lines.length ? lines[pos++] : null);
  const started = performance.now();
  try {
    const fn = new Function("console", "lireLigne", "prompt", `"use strict";\nreturn (async () => {\n${e.data.code}\n})();`);
    await fn(fakeConsole, lireLigne, lireLigne);
    // Laisse les minuteries courtes (setTimeout) se terminer.
    await new Promise((r) => setTimeout(r, 50));
    self.postMessage({ ok: true, stdout: out.join(""), stderr: err.join(""), timeMs: Math.round(performance.now() - started) });
  } catch (x) {
    const error = x as Error;
    const m = /<anonymous>:(\d+)/.exec(error.stack ?? "");
    const line = m ? Number(m[1]) - 3 : undefined;
    self.postMessage({
      ok: false,
      stdout: out.join(""),
      stderr: err.join("") + `${error.name ?? "Erreur"}: ${error.message}${line && line > 0 ? ` (ligne ${line})` : ""}`,
      errorLine: line && line > 0 ? line : undefined,
      timeMs: Math.round(performance.now() - started),
    });
  }
};
