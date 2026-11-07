/**
 * Donne le rôle administrateur à un compte EXISTANT (créé normalement par
 * l'inscription, avec Google ou e-mail). Aucun mot de passe n'est créé ni
 * affiché. À lancer depuis votre ordinateur, jamais depuis le navigateur :
 *
 *   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run admin:creer -- votre.adresse@gmail.com
 *
 * (ou avec un fichier .env.local contenant ces deux variables).
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const env = { ...process.env };
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Usage : npm run admin:creer -- adresse@exemple.com");
  process.exit(1);
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const admin = createClient(url, key, { auth: { persistSession: false } });

let user = null;
for (let page = 1; page <= 50 && !user; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) {
    console.error("Lecture des comptes impossible :", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => u.email?.toLowerCase() === email) ?? null;
  if (data.users.length < 1000) break;
}
if (!user) {
  console.error(`Aucun compte pour ${email}. Créez d'abord votre compte sur le site (bouton « Continuer avec Google » ou inscription), puis relancez.`);
  process.exit(1);
}
const { error } = await admin.from("user_roles").upsert({ user_id: user.id, role: "administrateur", permissions: [] }, { onConflict: "user_id,role" });
if (error) {
  console.error("Attribution du rôle impossible :", error.message);
  process.exit(1);
}
await admin.from("audit_logs").insert({ actor_id: user.id, action: "administrateur.cree_par_script", entity_type: "utilisateur", entity_id: user.id, details: { email } });
console.log(`✓ ${email} est administrateur. Ouvrez /admin après vous être reconnecté.`);
