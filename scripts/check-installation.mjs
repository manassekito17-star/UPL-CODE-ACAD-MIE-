/**
 * Vérifie les fichiers d'installation du SQL Editor (supabase/installation) sur une base vide :
 * 1-structure.sql puis chaque morceau 2-contenu-NN.sql dans l'ordre, puis relance d'un morceau.
 * Usage : node scripts/check-installation.mjs
 */
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(`${root}/scripts/check-database.mjs`, "utf8");
const stub = src.slice(src.indexOf("const stub = `") + 14, src.indexOf("`;", src.indexOf("const stub = `")));
const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(stub);
const dir = `${root}/supabase/installation`;
const run = async (f) => {
  try {
    await db.exec(readFileSync(`${dir}/${f}`, "utf8"));
    console.log("OK", f);
  } catch (e) {
    console.error("ERREUR", f, e.message);
    process.exit(1);
  }
};
await run("1-structure.sql");
await db.exec(`grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;`);
const parts = readdirSync(dir).filter((f) => /^2-contenu-\d+\.sql$/.test(f)).sort();
for (const f of parts) await run(f);
await run(parts[Math.floor(parts.length / 2)]); // relance sans risque
const r = (await db.query("select (select count(*) from public.courses)::int c, (select count(*) from public.lessons)::int l, (select count(*) from public.exercises)::int e, (select count(*) from public.course_levels)::int n")).rows[0];
console.log("contenu", r);
if (r.c !== 7 || r.e < 100 || r.n !== 28) {
  console.error("Contenu incomplet");
  process.exit(1);
}
console.log(`✓ Installation par le SQL Editor vérifiée (${parts.length} morceaux).`);
