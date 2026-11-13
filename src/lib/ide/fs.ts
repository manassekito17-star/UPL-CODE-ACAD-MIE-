import type { LanguageId } from "@/content/types";

/**
 * Système de fichiers d'un projet UPL IDE (fonctions pures, partagées par le
 * navigateur, l'API et les tests). Un projet = une liste de fichiers à
 * chemins relatifs (« src/main.py ») + d'éventuels dossiers vides.
 */

export interface ProjectFile {
  path: string;
  content: string;
}

export interface ProjectSnapshot {
  files: ProjectFile[];
  folders: string[];
}

export const PROJECT_LIMITS = {
  maxFiles: 200,
  maxFolders: 500,
  maxFileChars: 300_000,
  maxTotalChars: 2_000_000,
  maxPathLength: 200,
};

const SEGMENT = /^[A-Za-z0-9_\-.()@+ ]{1,80}$/;

/** Chemin normalisé et sûr (pas de « .. », pas d'absolu), ou null si invalide. */
export function normalizePath(input: string): string | null {
  const parts = input.replace(/\\/g, "/").split("/").filter((p) => p !== "" && p !== ".");
  if (!parts.length) return null;
  for (const p of parts) {
    if (p === ".." || !SEGMENT.test(p) || p.trim() !== p) return null;
  }
  const path = parts.join("/");
  return path.length <= PROJECT_LIMITS.maxPathLength ? path : null;
}

export const dirname = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");
export const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);
export const extension = (path: string) => {
  const b = basename(path);
  return b.includes(".") ? b.slice(b.lastIndexOf(".") + 1).toLowerCase() : "";
};
const join = (dir: string, name: string) => (dir ? `${dir}/${name}` : name);
const isInside = (path: string, folder: string) => path === folder || path.startsWith(`${folder}/`);

/** Tous les dossiers (déclarés ou déduits des fichiers). */
export function allFolders(p: ProjectSnapshot): string[] {
  const set = new Set<string>();
  const add = (dir: string) => {
    while (dir) {
      set.add(dir);
      dir = dirname(dir);
    }
  };
  for (const f of p.folders) add(f);
  for (const f of p.files) add(dirname(f.path));
  return [...set].sort();
}

export const exists = (p: ProjectSnapshot, path: string) => p.files.some((f) => f.path === path) || allFolders(p).includes(path);

export interface TreeNode {
  name: string;
  path: string;
  kind: "dossier" | "fichier";
  children: TreeNode[];
}

/** Arborescence triée : dossiers d'abord, puis fichiers, par ordre alphabétique. */
export function buildTree(p: ProjectSnapshot): TreeNode[] {
  const root: TreeNode = { name: "", path: "", kind: "dossier", children: [] };
  const folders = new Map<string, TreeNode>([["", root]]);
  for (const dir of allFolders(p)) {
    const node: TreeNode = { name: basename(dir), path: dir, kind: "dossier", children: [] };
    folders.set(dir, node);
  }
  for (const [dir, node] of folders) if (dir) folders.get(dirname(dir))!.children.push(node);
  for (const f of p.files) folders.get(dirname(f.path))!.children.push({ name: basename(f.path), path: f.path, kind: "fichier", children: [] });
  const sort = (n: TreeNode) => {
    n.children.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name, "fr") : a.kind === "dossier" ? -1 : 1));
    n.children.forEach(sort);
  };
  sort(root);
  return root.children;
}

export type FsResult = { ok: true; project: ProjectSnapshot } | { ok: false; error: string };
const fail = (error: string): FsResult => ({ ok: false, error });

function checkLimits(p: ProjectSnapshot): string | null {
  if (p.files.length > PROJECT_LIMITS.maxFiles) return `Un projet compte au plus ${PROJECT_LIMITS.maxFiles} fichiers.`;
  if (p.folders.length > PROJECT_LIMITS.maxFolders) return "Trop de dossiers.";
  if (p.files.some((f) => f.content.length > PROJECT_LIMITS.maxFileChars)) return "Un fichier dépasse la taille maximale (300 000 caractères).";
  if (p.files.reduce((n, f) => n + f.content.length, 0) > PROJECT_LIMITS.maxTotalChars) return "Le projet dépasse la taille maximale (2 millions de caractères).";
  return null;
}

/** Ne garde que les dossiers vides (les autres se déduisent des fichiers). */
function compactFolders(files: ProjectFile[], folders: string[]): string[] {
  const used = new Set<string>();
  for (const f of files) {
    let d = dirname(f.path);
    while (d) {
      used.add(d);
      d = dirname(d);
    }
  }
  const declared = new Set(folders);
  // Un dossier déclaré est inutile s'il contient un fichier ou un autre dossier déclaré.
  return [...declared].filter((d) => !used.has(d) && ![...declared].some((o) => o !== d && o.startsWith(`${d}/`))).sort();
}

function done(files: ProjectFile[], folders: string[]): FsResult {
  const project = { files, folders: compactFolders(files, folders) };
  const err = checkLimits(project);
  return err ? fail(err) : { ok: true, project };
}

export function createFile(p: ProjectSnapshot, rawPath: string, content = ""): FsResult {
  const path = normalizePath(rawPath);
  if (!path) return fail("Nom de fichier invalide (lettres, chiffres, - _ . ; pas de « .. »).");
  if (exists(p, path)) return fail(`« ${path} » existe déjà.`);
  if (p.files.some((f) => isInside(dirname(path), f.path))) return fail("Un fichier ne peut pas contenir d'autres fichiers.");
  return done([...p.files, { path, content }], p.folders);
}

export function createFolder(p: ProjectSnapshot, rawPath: string): FsResult {
  const path = normalizePath(rawPath);
  if (!path) return fail("Nom de dossier invalide.");
  if (exists(p, path)) return fail(`« ${path} » existe déjà.`);
  if (p.files.some((f) => isInside(path, f.path))) return fail("Un fichier porte déjà ce nom.");
  return done(p.files, [...p.folders, path]);
}

export function updateFile(p: ProjectSnapshot, path: string, content: string): FsResult {
  if (!p.files.some((f) => f.path === path)) return fail(`Fichier introuvable : ${path}`);
  return done(p.files.map((f) => (f.path === path ? { path, content } : f)), p.folders);
}

/** Déplace ou renomme un fichier ou un dossier (avec tout son contenu). */
export function movePath(p: ProjectSnapshot, from: string, rawTo: string): FsResult {
  const to = normalizePath(rawTo);
  if (!to) return fail("Nom ou destination invalide.");
  if (from === to) return { ok: true, project: p };
  const isFile = p.files.some((f) => f.path === from);
  const isFolder = !isFile && allFolders(p).includes(from);
  if (!isFile && !isFolder) return fail(`Introuvable : ${from}`);
  if (exists(p, to)) return fail(`« ${to} » existe déjà.`);
  if (isFolder && isInside(to, from)) return fail("Impossible de déplacer un dossier dans lui-même.");
  if (p.files.some((f) => isInside(dirname(to), f.path))) return fail("La destination est un fichier.");
  const re = (path: string) => (isInside(path, from) ? to + path.slice(from.length) : path);
  return done(
    p.files.map((f) => ({ ...f, path: re(f.path) })),
    p.folders.map(re),
  );
}

/** Copie un fichier ou un dossier ; le nom de la copie est choisi automatiquement. */
export function copyPath(p: ProjectSnapshot, from: string, intoFolder = dirname(from)): FsResult {
  const isFile = p.files.some((f) => f.path === from);
  const isFolder = !isFile && allFolders(p).includes(from);
  if (!isFile && !isFolder) return fail(`Introuvable : ${from}`);
  const base = basename(from);
  const ext = isFile && base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
  const stem = ext ? base.slice(0, -ext.length) : base;
  let target = join(intoFolder, base);
  for (let i = 1; exists(p, target); i++) target = join(intoFolder, `${stem} (copie${i > 1 ? ` ${i}` : ""})${ext}`);
  if (isFolder && isInside(target, from)) return fail("Impossible de copier un dossier dans lui-même.");
  const copies = p.files.filter((f) => isInside(f.path, from)).map((f) => ({ path: target + f.path.slice(from.length), content: f.content }));
  const folderCopies = p.folders.filter((d) => isInside(d, from)).map((d) => target + d.slice(from.length));
  return done([...p.files, ...copies], [...p.folders, ...folderCopies, ...(isFolder ? [target] : [])]);
}

export function deletePath(p: ProjectSnapshot, path: string): FsResult {
  if (!exists(p, path)) return fail(`Introuvable : ${path}`);
  return done(
    p.files.filter((f) => !isInside(f.path, path)),
    p.folders.filter((d) => !isInside(d, path)),
  );
}

/** Nombre de fichiers concernés (pour la confirmation de suppression). */
export const countInside = (p: ProjectSnapshot, path: string) => p.files.filter((f) => isInside(f.path, path)).length;

// ---------------- Langages ----------------

/** Langages exécutables dans UPL IDE (ceux de la plateforme, K+ compris). */
export type RunLanguage = LanguageId;

export interface FileLanguage {
  /** Identifiant Monaco (coloration, autocomplétion). */
  monaco: string;
  label: string;
  /** Langage exécutable par la plateforme, s'il existe. */
  run?: RunLanguage;
  /** Fichier affichable dans l'aperçu web. */
  preview?: boolean;
  /** Formatage intégré de l'éditeur disponible. */
  format?: boolean;
}

const LANG_BY_EXT: Record<string, FileLanguage> = {
  algo: { monaco: "pseudocode", label: "Pseudocode", run: "pseudocode" },
  kplus: { monaco: "kplus", label: "K+", run: "kplus" },
  py: { monaco: "python", label: "Python", run: "python" },
  js: { monaco: "javascript", label: "JavaScript", run: "javascript", format: true },
  mjs: { monaco: "javascript", label: "JavaScript", run: "javascript", format: true },
  ts: { monaco: "typescript", label: "TypeScript", format: true },
  c: { monaco: "c", label: "C", run: "c" },
  h: { monaco: "c", label: "C (en-tête)" },
  java: { monaco: "java", label: "Java", run: "java" },
  html: { monaco: "html", label: "HTML", preview: true, format: true },
  htm: { monaco: "html", label: "HTML", preview: true, format: true },
  css: { monaco: "css", label: "CSS", format: true },
  json: { monaco: "json", label: "JSON", format: true },
  md: { monaco: "markdown", label: "Markdown" },
  sql: { monaco: "sql", label: "SQL (SQLite)", run: "sql" },
  php: { monaco: "php", label: "PHP", run: "php" },
  txt: { monaco: "plaintext", label: "Texte" },
};

export function languageOf(path: string): FileLanguage {
  return LANG_BY_EXT[extension(path)] ?? { monaco: "plaintext", label: "Texte" };
}

/**
 * Fichiers transmis à l'exécution : le fichier actif en premier (fichier
 * principal), puis les fichiers du même langage situés dans le même dossier
 * (modules Python, classes Java…), désignés par leur nom simple.
 */
export function runFiles(p: ProjectSnapshot, activePath: string): { language: RunLanguage; files: { name: string; content: string }[] } | null {
  const lang = languageOf(activePath).run;
  const active = p.files.find((f) => f.path === activePath);
  if (!lang || !active) return null;
  // PHP : tout le projet est copié (include, require, style.css…), avec ses dossiers ;
  // le fichier actif est le script principal.
  if (lang === "php") {
    return { language: lang, files: [active, ...p.files.filter((f) => f.path !== activePath)].map((f) => ({ name: f.path, content: f.content })) };
  }
  // SQL : seul le script actif est exécuté (sur une base neuve).
  if (lang === "sql") return { language: lang, files: [{ name: basename(active.path), content: active.content }] };
  const dir = dirname(activePath);
  const siblings = p.files.filter((f) => f.path !== activePath && dirname(f.path) === dir && languageOf(f.path).run === lang);
  return { language: lang, files: [active, ...siblings].map((f) => ({ name: basename(f.path), content: f.content })) };
}

/** Chemin de `target` relatif au dossier `fromDir` (pour résoudre les liens d'une page HTML). */
export function relativePath(fromDir: string, target: string): string {
  const a = fromDir ? fromDir.split("/") : [];
  const b = target.split("/");
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  return [...a.slice(i).map(() => ".."), ...b.slice(i)].join("/");
}

/** Fichiers d'un projet web vus depuis une page HTML (liens relatifs à son dossier). */
export function previewFiles(p: ProjectSnapshot, htmlPath: string): { name: string; content: string }[] {
  const dir = dirname(htmlPath);
  // La page affichée devient « index.html » ; une autre index.html du même dossier est écartée.
  return p.files
    .filter((f) => f.path === htmlPath || relativePath(dir, f.path) !== "index.html")
    .map((f) => ({ name: f.path === htmlPath ? "index.html" : relativePath(dir, f.path), content: f.content }));
}

/** Recherche plein texte dans le projet. */
export function searchProject(p: ProjectSnapshot, query: string, opts: { caseSensitive?: boolean } = {}, max = 200) {
  const results: { path: string; line: number; column: number; text: string }[] = [];
  if (!query) return results;
  const q = opts.caseSensitive ? query : query.toLowerCase();
  for (const f of p.files) {
    const lines = f.content.split("\n");
    for (let i = 0; i < lines.length && results.length < max; i++) {
      const hay = opts.caseSensitive ? lines[i] : lines[i].toLowerCase();
      const col = hay.indexOf(q);
      if (col >= 0) results.push({ path: f.path, line: i + 1, column: col + 1, text: lines[i].trim().slice(0, 160) });
    }
  }
  return results;
}

/** Validation d'un instantané reçu (API, import). */
export function validateSnapshot(input: ProjectSnapshot): { ok: true; project: ProjectSnapshot } | { ok: false; error: string } {
  const seen = new Set<string>();
  const files: ProjectFile[] = [];
  for (const f of input.files) {
    const path = normalizePath(f.path);
    if (!path) return { ok: false, error: `Chemin invalide : ${f.path.slice(0, 80)}` };
    if (seen.has(path)) return { ok: false, error: `Fichier en double : ${path}` };
    seen.add(path);
    files.push({ path, content: f.content });
  }
  const folders: string[] = [];
  for (const d of input.folders) {
    const path = normalizePath(d);
    if (!path) return { ok: false, error: `Dossier invalide : ${d.slice(0, 80)}` };
    folders.push(path);
  }
  if (files.some((f) => files.some((g) => g.path.startsWith(`${f.path}/`)))) return { ok: false, error: "Un fichier ne peut pas contenir d'autres fichiers." };
  return done(files, folders) as { ok: true; project: ProjectSnapshot } | { ok: false; error: string };
}

// ---------------- Symboles (navigation entre les fonctions) ----------------

export interface CodeSymbol {
  name: string;
  kind: "fonction" | "classe" | "procédure" | "algorithme" | "titre" | "sélecteur";
  line: number;
}

const SYMBOL_RULES: Record<string, Array<[RegExp, CodeSymbol["kind"]]>> = {
  python: [
    [/^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/, "fonction"],
    [/^\s*class\s+([A-Za-z_]\w*)/, "classe"],
  ],
  javascript: [
    [/^\s*(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/, "fonction"],
    [/^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/, "fonction"],
    [/^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/, "classe"],
  ],
  c: [[/^\s*(?:static\s+|inline\s+)*[A-Za-z_][\w\s*]*?\b([A-Za-z_]\w*)\s*\([^;]*\)\s*\{?\s*$/, "fonction"]],
  java: [
    [/^\s*(?:public|private|protected)?\s*(?:abstract\s+|final\s+)*(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/, "classe"],
    [/^\s*(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?[\w<>[\], ]+\s+([A-Za-z_]\w*)\s*\(/, "fonction"],
  ],
  pseudocode: [
    [/^\s*ALGORITHME\s+([A-Za-z_À-ÿ][\wÀ-ÿ]*)/i, "algorithme"],
    [/^\s*FONCTION\s+([A-Za-z_À-ÿ][\wÀ-ÿ]*)/i, "fonction"],
    [/^\s*PROCEDURE\s+([A-Za-z_À-ÿ][\wÀ-ÿ]*)/i, "procédure"],
  ],
  kplus: [[/^\s*fonction\s+([\p{L}_][\p{L}\p{N}_]*)/u, "fonction"]],
  markdown: [[/^#{1,3}\s+(.+)$/, "titre"]],
  css: [[/^([^\s@{][^{]*?)\s*\{/, "sélecteur"]],
};
SYMBOL_RULES.typescript = SYMBOL_RULES.javascript;

/** Fonctions, classes, titres… d'un fichier, pour y naviguer. */
export function symbolsOf(path: string, content: string): CodeSymbol[] {
  const rules = SYMBOL_RULES[languageOf(path).monaco];
  if (!rules) return [];
  const out: CodeSymbol[] = [];
  const KEYWORDS = new Set(["if", "for", "while", "switch", "return", "else", "sizeof"]);
  content.split("\n").forEach((line, i) => {
    for (const [re, kind] of rules) {
      const m = line.match(re);
      if (m && !KEYWORDS.has(m[1])) {
        out.push({ name: m[1].trim().slice(0, 80), kind, line: i + 1 });
        break;
      }
    }
  });
  return out.slice(0, 300);
}
