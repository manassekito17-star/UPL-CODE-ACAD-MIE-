/**
 * Copie le moteur du langage K+ dans UPL :
 *   - public/workers/kplus-moteur.json : le moteur (Python) et le pont ;
 *   - src/lib/kplus/rendu-web.js : l'affichage des pages K+ Web.
 *
 * K+ est développé dans son propre dépôt (manassekito17-star/K-). Ce script
 * rassemble ses fichiers Python (le vrai moteur + le pont pour le navigateur)
 * en un seul fichier JSON, chargé par public/workers/kplus-worker.mjs.
 *
 *   node scripts/sync-kplus.mjs                 depuis le site publié de K+
 *   node scripts/sync-kplus.mjs ../K-           depuis une copie locale du dépôt K+
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://manassekito17-star.github.io/K-/";
const SORTIE = new URL("../public/workers/kplus-moteur.json", import.meta.url);
const SORTIE_RENDU = new URL("../src/lib/kplus/rendu-web.js", import.meta.url);

async function depuisLeSite() {
  const lire = async (chemin) => {
    const r = await fetch(new URL(chemin, SITE));
    if (!r.ok) throw new Error(`${chemin} : HTTP ${r.status}`);
    return r.text();
  };
  const manifeste = JSON.parse(await lire("manifeste.json"));
  const fichiers = {};
  for (const nom of manifeste.moteur) fichiers[`kplus/${nom}`] = await lire(`kplus/${nom}`);
  fichiers["pont.py"] = await lire("pont.py");
  return { version: manifeste.version, source: SITE, fichiers, rendu: await lire("rendu_web.js") };
}

function depuisUnDossier(dossier) {
  const fichiers = {};
  for (const nom of readdirSync(join(dossier, "kplus")).filter((n) => n.endsWith(".py")).sort()) {
    fichiers[`kplus/${nom}`] = readFileSync(join(dossier, "kplus", nom), "utf8");
  }
  fichiers["pont.py"] = readFileSync(join(dossier, "studio", "pont.py"), "utf8");
  const version = /__version__ = "([^"]+)"/.exec(fichiers["kplus/__init__.py"])?.[1];
  if (!version) throw new Error("Version de K+ introuvable dans kplus/__init__.py");
  const rendu = readFileSync(join(dossier, "kplus", "rendu_web.js"), "utf8");
  return { version, source: "https://github.com/manassekito17-star/K-", fichiers, rendu };
}

const { rendu, ...paquet } = process.argv[2] ? depuisUnDossier(process.argv[2]) : await depuisLeSite();
writeFileSync(SORTIE, JSON.stringify(paquet, null, 1) + "\n");
writeFileSync(SORTIE_RENDU, "// Copie de kplus/rendu_web.js (dépôt K+) — ne pas modifier ici : npm run kplus:sync.\n" + rendu);
console.log(`Moteur K+ ${paquet.version} copié (${Object.keys(paquet.fichiers).length} fichiers) dans public/workers/kplus-moteur.json`);
