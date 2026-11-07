/**
 * Fichiers d'installation pour le SQL Editor de Supabase (sans ligne de commande) :
 *   1-structure.sql : toutes les migrations, dans l'ordre (tables, sécurité RLS, fonctions) ;
 *   2-contenu-NN.sql : les cours, exercices et quiz en petits morceaux (générés par npm run seed:generate).
 * Usage : npm run install:sql (régénérés automatiquement ; vérifiés par la CI).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = new URL("../supabase/migrations/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const parts = files.map((f) => `-- ===== ${f} =====\n${readFileSync(new URL(f, dir), "utf8").trim()}\n`);
writeFileSync(
  new URL("../supabase/installation/1-structure.sql", import.meta.url),
  `-- UPL CODE ACADEMY MK — installation, partie 1 sur 2 : structure et sécurité.\n-- À coller dans Supabase → SQL Editor → New query, puis « Run ». Une seule fois, sur un projet vide.\n-- Fichier généré par scripts/build-installation.mjs — ne pas modifier à la main.\n\n${parts.join("\n")}`,
);
console.log(`Installation générée : ${files.length} migrations.`);
