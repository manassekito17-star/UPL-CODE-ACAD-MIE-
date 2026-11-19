#!/usr/bin/env node
// Vérifie la licence de TOUTES les dépendances (npm de production + toutes les crates Rust,
// toutes plateformes confondues). Échoue si une licence n'est pas dans la liste autorisée.
// Politique et justification : docs/LICENSES.md.
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");

/** Licences permissives (ou copyleft faible au niveau fichier, MPL-2.0) compatibles avec une redistribution. */
const ALLOWED = new Set([
  "MIT", "MIT-0", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Zlib", "0BSD", "BSL-1.0",
  "Unlicense", "CC0-1.0", "Unicode-3.0", "Unicode-DFS-2016", "MPL-2.0", "CDLA-Permissive-2.0", "CC-BY-4.0",
]);

/**
 * Exceptions nominatives : paquets qui ne sont JAMAIS livrés aux utilisateurs. Chaque entrée
 * est justifiée et documentée dans docs/LICENSES (LICENSES.md).
 */
export const EXCEPTIONS = [
  {
    pattern: /^@img\/sharp-libvips-/,
    reason:
      "dépendance facultative de Next.js pour l'optimisation d'images, désactivée dans le site (images.unoptimized) ; le site exporté ne contient que du HTML, du CSS et du JavaScript de Next/React",
  },
];

export function isException(name) {
  return EXCEPTIONS.some((e) => e.pattern.test(name));
}
const ALLOWED_EXCEPTIONS = new Set(["LLVM-exception"]);

/** Évalue une expression SPDX (OR, AND, WITH, parenthèses) : vraie si une option autorisée existe. */
export function spdxAllowed(expression) {
  const tokens = expression.replace(/\//g, " OR ").match(/\(|\)|[^\s()]+/g) ?? [];
  let i = 0;
  const peek = () => tokens[i];
  function primary() {
    if (peek() === "(") {
      i++;
      const value = or();
      if (tokens[i++] !== ")") throw new Error(`parenthèse manquante dans « ${expression} »`);
      return value;
    }
    const id = tokens[i++];
    if (!id) throw new Error(`expression incomplète : « ${expression} »`);
    if (peek() === "WITH") {
      i++;
      return ALLOWED.has(id.replace(/\+$/, "")) && ALLOWED_EXCEPTIONS.has(tokens[i++]);
    }
    return ALLOWED.has(id.replace(/\+$/, ""));
  }
  function and() {
    let value = primary();
    while (peek() === "AND") {
      i++;
      value = primary() && value;
    }
    return value;
  }
  function or() {
    let value = and();
    while (peek() === "OR") {
      i++;
      value = and() || value;
    }
    return value;
  }
  const result = or();
  if (i !== tokens.length) throw new Error(`expression SPDX invalide : « ${expression} »`);
  return result;
}

function main() {
  const problems = [];
  let checked = 0;
  let excepted = 0;

  // --- npm (dépendances de production uniquement : ce sont elles qui sont livrées) ---
  const npm = JSON.parse(execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], { cwd: root, encoding: "utf8" }) || "{}");
  for (const [license, packages] of Object.entries(npm)) {
    for (const pkg of packages) {
      for (const version of pkg.versions ?? [pkg.version]) {
        checked++;
        let ok = false;
        try {
          ok = spdxAllowed(license);
        } catch {
          ok = false;
        }
        if (!ok && isException(pkg.name)) {
          excepted++;
          continue;
        }
        if (!ok) problems.push(`npm   ${pkg.name}@${version} : ${license}`);
      }
    }
  }

  // --- Rust (toutes les crates, y compris celles propres à Windows et macOS) ---
  const metadata = JSON.parse(
    execFileSync("cargo", ["metadata", "--format-version", "1", "--locked"], { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 }),
  );
  for (const pkg of metadata.packages) {
    if (pkg.source === null) continue; // crates du projet
    checked++;
    let ok = false;
    try {
      ok = pkg.license ? spdxAllowed(pkg.license) : false;
    } catch {
      ok = false;
    }
    if (!ok) problems.push(`cargo ${pkg.name}@${pkg.version} : ${pkg.license ?? `aucune licence SPDX (${pkg.license_file ?? "?"})`}`);
  }

  if (problems.length > 0) {
    console.error(`✗ ${problems.length} dépendance(s) à licence non autorisée ou inconnue sur ${checked} :`);
    for (const p of problems.sort()) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`✓ ${checked} dépendances vérifiées : toutes sous licence autorisée${excepted ? ` (${excepted} exception(s) documentée(s), jamais livrée(s))` : ""}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
