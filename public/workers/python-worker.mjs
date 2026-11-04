// Python dans le navigateur grâce à Pyodide (CPython compilé en WebAssembly).
// Fichier servi tel quel (worker de type « module », exigé par Pyodide) :
// il n'est pas transformé par le bundler.
// Utilisé quand le service d'exécution serveur n'est pas configuré, ou sans compte.
const PYODIDE_URL = "https://cdn.jsdelivr.net/npm/pyodide@314.0.7/";

let pyodidePromise = null;
function getPyodide() {
  pyodidePromise ??= import(`${PYODIDE_URL}pyodide.mjs`).then((m) => m.loadPyodide({ indexURL: PYODIDE_URL }));
  return pyodidePromise;
}

self.onmessage = async (e) => {
  let py;
  try {
    self.postMessage({ type: "statut", message: "Chargement de Python…" });
    py = await getPyodide();
  } catch (x) {
    pyodidePromise = null;
    console.error("[python-worker]", x);
    self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: "Impossible de charger Python dans le navigateur (connexion internet requise la première fois)." });
    return;
  }
  if (e.data.warmup) return;
  const out = [];
  const err = [];
  const lines = e.data.stdin.replace(/\r\n?/g, "\n").split("\n");
  let pos = 0;
  py.setStdin({ stdin: () => (pos < lines.length ? lines[pos++] + "\n" : null), autoEOF: true });
  py.setStdout({ raw: (c) => void out.push(c) });
  py.setStderr({ raw: (c) => void err.push(c) });
  const dec = (bytes) => new TextDecoder().decode(new Uint8Array(bytes));
  const [main, ...others] = e.data.files;
  for (const f of others) py.FS.writeFile(f.name, f.content);
  self.postMessage({ type: "debut" });
  const started = performance.now();
  try {
    // Réinitialise l'espace de noms entre deux exécutions
    await py.runPythonAsync(main.content, { filename: main.name, globals: py.toPy({ __name__: "__main__" }) });
    self.postMessage({ type: "resultat", ok: true, stdout: dec(out), stderr: dec(err), timeMs: Math.round(performance.now() - started) });
  } catch (x) {
    const message = String(x?.message ?? x);
    const idx = message.indexOf(`File "${main.name}"`);
    const trimmed = idx >= 0 ? `Traceback (most recent call last):\n  ${message.slice(idx)}` : message;
    const m = new RegExp(`File "${main.name.replace(".", "\\.")}", line (\\d+)`).exec(message);
    self.postMessage({
      type: "resultat",
      ok: false,
      stdout: dec(out),
      stderr: dec(err) + trimmed.trim(),
      errorLine: m ? Number(m[1]) : undefined,
      timeMs: Math.round(performance.now() - started),
    });
  }
};
