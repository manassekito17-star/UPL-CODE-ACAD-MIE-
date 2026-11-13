// PHP 8.3 dans le navigateur grâce à php-wasm (l'interpréteur PHP officiel
// compilé en WebAssembly). Ce n'est PAS une simulation en JavaScript : c'est
// le vrai moteur Zend qui exécute le code, dans un Web Worker isolé de la page
// et sans aucun accès au serveur de la plateforme.
// PDO SQLite est fourni par php-wasm-sqlite (bibliothèques partagées).
// Fichier servi tel quel (worker de type « module »).
const PHP_URL = "https://cdn.jsdelivr.net/npm/php-wasm@0.2.0/";
const SQLITE_URL = "https://cdn.jsdelivr.net/npm/php-wasm-sqlite@0.2.0/";
const ROOT = "/upl";

const INI = `
display_errors = 1
display_startup_errors = 1
html_errors = 0
error_reporting = E_ALL
memory_limit = 128M
max_execution_time = 10
date.timezone = Africa/Kinshasa
`;

// La version « web » de php-wasm référence `window` et `document` au chargement
// (gestion d'événements d'interface, inutilisée ici) : on fournit des objets
// neutres dans le worker, qui n'a pas de page.
globalThis.window ??= globalThis;
globalThis.document ??= {
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  body: null,
  currentScript: null,
};

let phpPromise = null;

async function createPhp() {
  const [{ PhpWeb }, sqlite] = await Promise.all([import(`${PHP_URL}PhpWeb.mjs`), import(`${SQLITE_URL}index.mjs`)]);
  const php = new PhpWeb({ version: "8.3", sharedLibs: [sqlite.default ?? sqlite], ini: INI, autoTransaction: false });
  const out = [];
  const err = [];
  php.addEventListener("output", (e) => out.push(...[].concat(e.detail)));
  php.addEventListener("error", (e) => err.push(...[].concat(e.detail)));
  await php.binary;
  return { php, out, err };
}

function getPhp() {
  phpPromise ??= createPhp();
  return phpPromise;
}

/** Ligne de la première erreur PHP signalée dans le fichier principal. */
function errorLineOf(text, mainName) {
  const re = /in ([^\s]+?)(?::| on line )(\d+)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1] === mainName) return Number(m[2]);
  }
  return undefined;
}

const phpString = (s) => `'${String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

self.onmessage = async (e) => {
  let rt;
  try {
    self.postMessage({ type: "statut", message: "Chargement de PHP 8.3…" });
    rt = await getPhp();
  } catch (x) {
    phpPromise = null;
    console.error("[php-worker]", x);
    self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: "Impossible de charger PHP dans le navigateur (connexion Internet requise la première fois)." });
    return;
  }
  if (e.data.warmup) return;
  // Chaque exécution utilise un interpréteur neuf (aucune variable, fonction ou
  // classe ne survit d'une exécution à l'autre) ; le suivant est préparé aussitôt.
  phpPromise = null;
  const { php, out, err } = rt;
  const files = e.data.files ?? [];
  const main = files[0]?.name.endsWith(".php") ? files[0] : files.find((f) => f.name.endsWith(".php"));
  if (!main) {
    self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: "Aucun fichier PHP à exécuter." });
    return;
  }
  try {
    const fs = await php.binary;
    // Vide le dossier du projet (il reste le dossier courant de PHP : on ne le supprime pas).
    const empty = (dir, keep) => {
      for (const name of fs.FS.readdir(dir)) {
        if (name === "." || name === "..") continue;
        const p = `${dir}/${name}`;
        if (fs.FS.isDir(fs.FS.stat(p).mode)) {
          empty(p, false);
        } else fs.FS.unlink(p);
      }
      if (!keep) fs.FS.rmdir(dir);
    };
    if (fs.FS.analyzePath(ROOT).exists) empty(ROOT, true);
    else fs.FS.mkdir(ROOT);
    for (const f of files) {
      const parts = f.name.split("/").filter(Boolean);
      let dir = ROOT;
      for (const p of parts.slice(0, -1)) {
        dir += `/${p}`;
        if (!fs.FS.analyzePath(dir).exists) fs.FS.mkdir(dir);
      }
      fs.FS.writeFile(`${ROOT}/${parts.join("/")}`, f.content);
    }
  } catch (x) {
    console.error("[php-worker]", x);
    self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: "Erreur interne du moteur PHP. Rechargez la page puis réessayez." });
    return;
  }
  out.length = 0;
  err.length = 0;
  if (e.data.stdin) php.inputString(e.data.stdin.endsWith("\n") ? e.data.stdin : `${e.data.stdin}\n`);
  const query = e.data.query && typeof e.data.query === "object" ? e.data.query : {};
  const assign = Object.entries(query)
    .map(([k, v]) => `$_GET[${phpString(k)}] = ${phpString(v)}; $_REQUEST[${phpString(k)}] = ${phpString(v)};`)
    .join(" ");
  self.postMessage({ type: "debut" });
  const started = performance.now();
  let exitCode = 0;
  try {
    exitCode = await php.run(
      `<?php if (!defined('STDIN')) { define('STDIN', fopen('php://stdin', 'r')); define('STDOUT', fopen('php://output', 'w')); define('STDERR', fopen('php://stderr', 'w')); } chdir(${phpString(`${ROOT}/${main.name}`.replace(/\/[^/]*$/, ""))}); $_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'] = ${phpString(`/${main.name}`)}; $_SERVER['REQUEST_METHOD'] = 'GET'; ${assign} include ${phpString(`${ROOT}/${main.name}`)};`,
    );
  } catch (x) {
    err.push(String(x?.message ?? x));
    exitCode = 1;
  }
  // Retire du rapport la ligne interne du lanceur (elle ne concerne pas l'étudiant).
  const clean = (t) => t.replace(/^#\d+ php-wasm run script.*\n/gm, "").replace(/(^|[\s('"])\/upl\//gm, "$1");
  const stdout = clean(out.join(""));
  const stderr = clean(err.join(""));
  const all = `${stdout}\n${stderr}`;
  const fatal = /(PHP )?(Parse error|Fatal error|Uncaught )/.test(all);
  self.postMessage({
    type: "resultat",
    ok: !fatal && !exitCode,
    parse: /Parse error/.test(all),
    stdout,
    stderr,
    errorLine: errorLineOf(all, main.name),
    timeMs: Math.round(performance.now() - started),
  });
  getPhp().catch(() => {
    phpPromise = null;
  });
};
