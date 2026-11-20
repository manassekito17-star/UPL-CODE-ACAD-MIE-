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

/** Tableau texte pour console.table (comme la console d'un navigateur). */
function table(data: unknown, columns?: string[]): string {
  if (typeof data !== "object" || data === null) return format(data) + "\n";
  const rows = Object.entries(data as Record<string, unknown>);
  const keys = columns ?? [...new Set(rows.flatMap(([, v]) => (typeof v === "object" && v !== null ? Object.keys(v as object) : ["Valeur"])))];
  const head = ["(index)", ...keys];
  const body = rows.map(([i, v]) => [i, ...keys.map((k) => (typeof v === "object" && v !== null ? ((v as Record<string, unknown>)[k] === undefined ? "" : format((v as Record<string, unknown>)[k])) : k === "Valeur" ? format(v) : ""))]);
  const widths = head.map((h, c) => Math.max(h.length, ...body.map((r) => r[c].length)));
  const line = (cells: string[]) => "│ " + cells.map((x, c) => x.padEnd(widths[c])).join(" │ ") + " │";
  const sep = (l: string, m: string, r: string) => l + widths.map((w) => "─".repeat(w + 2)).join(m) + r;
  return [sep("┌", "┬", "┐"), line(head), sep("├", "┼", "┤"), ...body.map(line), sep("└", "┴", "┘")].join("\n") + "\n";
}

/** Lignes ajoutées avant le code de l'élève par new Function (mesuré, car il varie selon le navigateur). */
const LINE_OFFSET = (() => {
  try {
    new Function("console", "lireLigne", "prompt", `"use strict";\nreturn (() => {\nthrow new Error("x")\n})();`)();
  } catch (x) {
    const m = /<anonymous>:(\d+)|Function:(\d+)|:(\d+):\d+\)?$/m.exec((x as Error).stack ?? "");
    const n = m ? Number(m[1] ?? m[2] ?? m[3]) : NaN;
    if (n > 0) return n - 1;
  }
  return 4;
})();

self.onmessage = async (e: MessageEvent<{ code: string; stdin: string }>) => {
  const out: string[] = [];
  const err: string[] = [];
  const lines = e.data.stdin.replace(/\r\n?/g, "\n").split("\n");
  let pos = 0;
  let indent = "";
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();
  const write = (to: string[], a: unknown[]) => to.push(indent + a.map(format).join(" ").replace(/\n/g, "\n" + indent) + "\n");
  // Mêmes fonctions que la console d'un navigateur ou de Node.js.
  const fakeConsole = {
    log: (...a: unknown[]) => write(out, a),
    info: (...a: unknown[]) => write(out, a),
    debug: (...a: unknown[]) => write(out, a),
    dir: (...a: unknown[]) => write(out, a),
    warn: (...a: unknown[]) => write(err, a),
    error: (...a: unknown[]) => write(err, a),
    trace: (...a: unknown[]) => write(err, ["Trace :", ...a]),
    table: (data: unknown, columns?: string[]) => out.push(table(data, columns)),
    group: (...a: unknown[]) => {
      if (a.length) write(out, a);
      indent += "  ";
    },
    groupCollapsed: (...a: unknown[]) => {
      if (a.length) write(out, a);
      indent += "  ";
    },
    groupEnd: () => {
      indent = indent.slice(2);
    },
    count: (label = "default") => {
      const n = (counts.get(label) ?? 0) + 1;
      counts.set(label, n);
      write(out, [`${label}: ${n}`]);
    },
    countReset: (label = "default") => counts.delete(label),
    time: (label = "default") => timers.set(label, performance.now()),
    timeLog: (label = "default") => write(out, [`${label}: ${(performance.now() - (timers.get(label) ?? performance.now())).toFixed(3)} ms`]),
    timeEnd: (label = "default") => {
      write(out, [`${label}: ${(performance.now() - (timers.get(label) ?? performance.now())).toFixed(3)} ms`]);
      timers.delete(label);
    },
    assert: (cond: unknown, ...a: unknown[]) => {
      if (!cond) write(err, ["Assertion échouée :", ...(a.length ? a : ["console.assert"])]);
    },
    clear: () => {
      out.length = 0;
    },
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
    const m = /<anonymous>:(\d+)|Function:(\d+)/.exec(error.stack ?? "");
    const line = m ? Number(m[1] ?? m[2]) - LINE_OFFSET : undefined;
    self.postMessage({
      ok: false,
      stdout: out.join(""),
      stderr: err.join("") + `${error.name ?? "Erreur"}: ${error.message}${line && line > 0 ? ` (ligne ${line})` : ""}`,
      errorLine: line && line > 0 ? line : undefined,
      timeMs: Math.round(performance.now() - started),
    });
  }
};
