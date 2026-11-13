import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, readdirSync } from "node:fs";
/**
 * Vérification de la base de données sans serveur (PGlite) :
 * applique les migrations et le seed, puis teste les politiques RLS
 * (isolation des données entre étudiants, rôles, résultats officiels).
 * Usage : npm run test:db
 */
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const db = new PGlite({ extensions: { pgcrypto } });
const stub = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'); create table auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid, provider text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create table auth.mfa_factors (id uuid primary key default gen_random_uuid(), user_id uuid, factor_type text default 'totp', status text);
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, metadata jsonb);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
`;
await db.exec(stub);
for (const f of readdirSync(`${root}/supabase/migrations`).sort()) {
  try { await db.exec(readFileSync(`${root}/supabase/migrations/${f}`, "utf8")); console.log("OK", f); }
  catch (e) { console.error("ERREUR", f, e.message); process.exit(1); }
}
await db.exec(`grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role; grant usage on all sequences in schema public to authenticated, service_role;`);
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));
const c = await db.query("select (select count(*) from public.courses) c, (select count(*) from public.lessons) l, (select count(*) from public.exercises) e, (select count(*) from public.exercise_test_cases) t, (select count(*) from public.quiz_questions) q");
console.log("seed", c.rows[0]);
// seed idempotent
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));
console.log("seed relancé", (await db.query("select count(*) from public.lessons")).rows[0]);

// --- Scénarios RLS ---
const A = "11111111-1111-1111-1111-111111111111", B = "22222222-2222-2222-2222-222222222222", ADM = "33333333-3333-3333-3333-333333333333";
for (const [id, name] of [[A, "Alice"], [B, "Bob"], [ADM, "Admin"]]) await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${name}@x.cd`, { full_name: name }]);
await db.query(`insert into public.user_roles (user_id, role) values ($1, 'administrateur')`, [ADM]);
const as = async (uid, sql, params = []) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); select set_config('request.jwt.claim.role', '${uid ? "authenticated" : "anon"}', false); set role ${uid ? "authenticated" : "anon"};`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role"); }
};
const check = (label, cond) => { console.log(cond ? "✓" : "✗ ÉCHEC", label); if (!cond) process.exitCode = 1; };
console.log("\nPolitiques de sécurité (RLS) :");

const lang = "python";
await as(A, `insert into public.programs (user_id, title, language_id, files) values ($1, 'secret A', $2, '[]')`, [A, lang]);
check("Bob ne voit pas les programmes d'Alice", (await as(B, "select * from public.programs")).rows.length === 0);
check("Alice voit son programme", (await as(A, "select * from public.programs")).rows.length === 1);
let denied = false; try { await as(B, `insert into public.programs (user_id, title, language_id, files) values ($1, 'x', 'python', '[]')`, [A]); } catch { denied = true; }
check("Bob ne peut pas créer un programme au nom d'Alice", denied);
check("Bob ne peut pas modifier le programme d'Alice", (await as(B, "update public.programs set title = 'pirate' returning id")).rows.length === 0);
denied = false; try { await as(A, `insert into public.submissions (user_id, exercise_id, language_id, code, status, score) select $1, id, 'python', 'x', 'reussi', 100 from public.exercises limit 1`, [A]); } catch { denied = true; }
check("Un étudiant ne peut pas s'attribuer une note (soumission)", denied);
check("Solutions invisibles pour un étudiant", (await as(A, "select * from public.exercise_solutions")).rows.length === 0);
check("Solutions invisibles pour un visiteur", (await as(null, "select * from public.exercise_solutions")).rows.length === 0);
check("Réponses des quiz invisibles", (await as(A, "select * from public.quiz_answer_keys")).rows.length === 0);
const hiddenVisible = (await as(A, "select * from public.exercise_test_cases where is_hidden")).rows.length;
check("Tests cachés invisibles pour un étudiant", hiddenVisible === 0);
check("Tests visibles lisibles", (await as(null, "select * from public.exercise_test_cases")).rows.length > 0);
check("Cours publiés lisibles par un visiteur", (await as(null, "select * from public.courses")).rows.length === 10);
check("Bob ne voit pas le profil d'Alice", (await as(B, "select * from public.profiles where id = $1", [A])).rows.length === 0);
denied = false; try { await as(A, "update public.profiles set status = 'actif', suspended_reason = 'x' where id = $1", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas modifier son statut", denied);
denied = false; try { await as(A, "insert into public.user_roles (user_id, role) values ($1, 'administrateur')", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas s'attribuer le rôle administrateur", denied);
check("Un étudiant ne lit pas les journaux", (await as(A, "select * from public.audit_logs")).rows.length === 0);
check("L'administrateur voit les solutions", (await as(ADM, "select * from public.exercise_solutions")).rows.length > 0);
check("L'administrateur voit tous les profils", (await as(ADM, "select * from public.profiles")).rows.length === 3);
await as(ADM, "update public.profiles set status = 'suspendu' where id = $1", [B]);
check("Un compte suspendu ne peut plus enregistrer de programme", await (async () => { try { await as(B, `insert into public.programs (user_id, title, language_id, files) values ($1, 'x', 'python', '[]')`, [B]); return false; } catch { return true; } })());
// Progression : trigger
const l = (await db.query("select id, course_id from public.lessons where status='publie' limit 1")).rows[0];
await as(A, "insert into public.lesson_progress (user_id, lesson_id, course_id, status) values ($1, $2, $3, 'termine')", [A, l.id, l.course_id]);
const cp = (await as(A, "select * from public.course_progress")).rows[0];
check(`Progression du parcours recalculée (${cp?.completed_lessons}/${cp?.total_lessons})`, cp && cp.completed_lessons === 1 && cp.total_lessons > 1);
check("Bob ne voit pas la progression d'Alice", (await as(B, "select * from public.course_progress")).rows.length === 0);
// Enseignant avec permission « contenus » seulement
await db.query(`insert into public.user_roles (user_id, role, permissions) values ($1, 'enseignant', '{contenus}')`, [B]);
await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);"); await db.query(`update public.profiles set status='actif' where id=$1`, [B]);
check("Enseignant (contenus) voit les solutions", (await as(B, "select * from public.exercise_solutions")).rows.length > 0);
check("Enseignant (contenus) ne voit pas les profils (pas de « suivi »)", (await as(B, "select * from public.profiles where id = $1", [A])).rows.length === 0);
check("Enseignant ne lit pas les paramètres", (await as(B, "select * from public.platform_settings")).rows.length === 0);

console.log("\nMultiniveaux :");
const lv = (await db.query("select c.slug, count(cl.*)::int n from public.courses c left join public.course_levels cl on cl.course_id = c.id group by c.slug")).rows;
check("Chaque parcours a quatre niveaux", lv.length === 10 && lv.every((r) => r.n === 4));
check("Chaque module est rattaché à un niveau", (await db.query("select count(*)::int n from public.modules where level_number is null")).rows[0].n === 0);
check("Aucun module vide hérité de l'ancienne organisation", (await db.query("select count(*)::int n from public.modules m where not exists (select 1 from public.lessons l where l.module_id = m.id)")).rows[0].n === 0);
check("Un test de positionnement par parcours", (await db.query("select count(*)::int n from public.quizzes where kind = 'positionnement'")).rows[0].n === 10);
check("Questions de positionnement étiquetées par niveau", (await db.query("select count(*)::int n from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id where q.kind = 'positionnement' and qq.level_number is null")).rows[0].n === 0);
check("Examens de niveau rattachés à un niveau", (await db.query("select count(*)::int n from public.quizzes where kind = 'examen_niveau' and level_number is not null")).rows[0].n >= 7);
check("Vérifications web enregistrées", (await db.query(`select count(*)::int n from public.exercise_test_cases where "check" is not null`)).rows[0].n > 0);
const course = (await db.query("select id from public.courses where slug = 'algorithmique'")).rows[0].id;
denied = false; try { await as(A, "insert into public.level_progress (user_id, course_id, level_number, status) values ($1, $2, 1, 'valide')", [A, course]); } catch { denied = true; }
check("Un étudiant ne peut pas valider lui-même un niveau", denied);
denied = false; try { await as(A, "insert into public.placement_results (user_id, course_id, scores, recommended_level) values ($1, $2, '{}', 4)", [A, course]); } catch { denied = true; }
check("Un étudiant ne peut pas écrire son résultat de positionnement", denied);
denied = false; try { await as(A, "insert into public.certificates (user_id, course_id, level_number) values ($1, $2, 1)", [A, course]); } catch { denied = true; }
check("Un étudiant ne peut pas s'attribuer un certificat", denied);
await db.query("insert into public.level_progress (user_id, course_id, level_number, status, exam_score) values ($1, $2, 1, 'valide', 85)", [A, course]);
await db.query("insert into public.certificates (user_id, course_id, level_number, score) values ($1, $2, 1, 85)", [A, course]);
await db.query("insert into public.certificates (user_id, course_id, level_number, score) values ($1, $2, 2, 80)", [A, course]);
denied = false; try { await db.query("insert into public.certificates (user_id, course_id, level_number) values ($1, $2, 1)", [A, course]); } catch { denied = true; }
check("Un seul certificat par niveau", denied);
await db.query("insert into public.certificates (user_id, course_id, level_number) values ($1, $2, null)", [A, course]);
denied = false; try { await db.query("insert into public.certificates (user_id, course_id, level_number) values ($1, $2, null)", [A, course]); } catch { denied = true; }
check("Un seul certificat de parcours complet", denied);
check("Alice voit son niveau validé", (await as(A, "select * from public.level_progress")).rows.length === 1);
check("Bob ne voit pas les niveaux d'Alice", (await as(B, "select * from public.level_progress where user_id = $1", [A])).rows.length === 0);
const code = (await db.query("select verification_code from public.certificates where user_id = $1 and level_number = 1", [A])).rows[0].verification_code;
const v = (await as(null, "select * from public.verify_certificate($1)", [code])).rows;
check("Certificat vérifiable publiquement par son code", v.length === 1 && v[0].level_number === 1 && v[0].course_title.length > 0);
check("La vérification ne révèle ni identifiant ni e-mail", v.length === 1 && !("user_id" in v[0]) && !("email" in v[0]));
check("Code de certificat inconnu → aucun résultat", (await as(null, "select * from public.verify_certificate('deadbeefdeadbeef')")).rows.length === 0);
check("Un visiteur ne lit pas la table des certificats", (await as(null, "select * from public.certificates")).rows.length === 0);

console.log("\nProjets UPL IDE :");
const C = "44444444-4444-4444-4444-444444444444";
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'c@x.cd', '{"full_name":"Chloé"}')`, [C]);
const proj = (await as(C, `insert into public.projects (user_id, name, files) values ($1, 'Mon site', '[{"path":"index.html","content":"<p>secret</p>"}]') returning id`, [C])).rows[0].id;
check("Chloé crée un projet", Boolean(proj));
check("Alice ne voit pas le projet de Chloé", (await as(A, "select * from public.projects where id = $1", [proj])).rows.length === 0);
check("Alice ne peut pas modifier le projet de Chloé", (await as(A, "update public.projects set name = 'pirate' where id = $1 returning id", [proj])).rows.length === 0);
check("Alice ne peut pas supprimer le projet de Chloé", (await as(A, "delete from public.projects where id = $1 returning id", [proj])).rows.length === 0);
denied = false; try { await as(A, `insert into public.projects (user_id, name) values ($1, 'au nom de Chloé')`, [C]); } catch { denied = true; }
check("Alice ne peut pas créer un projet au nom de Chloé", denied);
await as(C, `insert into public.project_versions (project_id, user_id, revision, files) values ($1, $2, 1, '[]')`, [proj, C]);
check("Chloé voit l'historique de son projet", (await as(C, "select * from public.project_versions where project_id = $1", [proj])).rows.length === 1);
check("Alice ne voit pas l'historique de Chloé", (await as(A, "select * from public.project_versions where project_id = $1", [proj])).rows.length === 0);
denied = false; try { await as(A, `insert into public.project_versions (project_id, user_id, revision, files) values ($1, $2, 9, '[]')`, [proj, A]); } catch { denied = true; }
check("Alice ne peut pas ajouter une version au projet de Chloé", denied);
check("L'équipe « suivi » ne lit pas les projets des étudiants", (await as(ADM, "select * from public.projects where id = $1", [proj])).rows.length === 0);
await db.query(`update public.profiles set status = 'suspendu' where id = $1`, [C]);
denied = false; try { await as(C, `update public.projects set name = 'x' where id = $1`, [proj]); } catch { denied = true; }
check("Un compte suspendu ne peut plus modifier ses projets", denied);

console.log("\nQuotas et consommation :");
await db.exec("reset role");
const q = async (user, units, ul, gl) => (await db.query("select * from public.consume_quota('judge0', $1, $2, $3, $4)", [user, units, ul, gl])).rows[0];
check("Quota : réservation acceptée sous les plafonds", (await q(A, 3, 5, 10)).ok === true);
check("Quota : plafond par utilisateur respecté", (await q(A, 3, 5, 10)).ok === false);
check("Quota : un autre utilisateur garde son quota", (await q(B, 5, 5, 10)).ok === true);
const g = await q(ADM, 3, 5, 10);
check("Quota : plafond global du jour respecté", g.ok === false && g.global_used === 8);
check("Quota : refus comptabilisés", (await db.query("select sum(refused)::int n from public.service_usage")).rows[0].n === 2);
check("Quota : plafond 0 = illimité", (await q(A, 100, 0, 0)).ok === true);
denied = false; try { await as(A, "select * from public.consume_quota('judge0', $1, 1, 0, 0)", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas appeler la réservation de quota", denied);
denied = false; try { await as(A, "insert into public.service_usage (service, user_id, units) values ('judge0', $1, 0)", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas écrire ses compteurs", denied);
check("Un étudiant ne lit que ses compteurs", (await as(A, "select distinct user_id from public.service_usage")).rows.every((r) => r.user_id === A));
denied = false; try { await as(A, "update public.profiles set plan = 'premium' where id = $1", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas s'attribuer l'offre premium", denied);
denied = false; try { await as(A, "select * from public.platform_usage()"); } catch { denied = true; }
check("Mesure de l'espace réservée à l'administration", denied);
check("L'administration mesure l'espace utilisé", Number((await as(ADM, "select * from public.platform_usage()")).rows[0].database_bytes) > 0);

console.log("\nComptes Google et statistiques :");
const G = "55555555-5555-5555-5555-555555555555";
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'g@gmail.com', $2)`, [G, { name: "Grâce Google", picture: "https://lh3.googleusercontent.com/a/photo", email_verified: true }]);
await db.query(`insert into auth.identities (user_id, provider) values ($1, 'google'), ($2, 'email')`, [G, A]);
const gp = (await db.query("select full_name, avatar_url from public.profiles where id = $1", [G])).rows[0];
check("Compte Google : nom et photo repris du profil Google", gp.full_name === "Grâce Google" && gp.avatar_url === "https://lh3.googleusercontent.com/a/photo");
check("Compte Google : rôle étudiant attribué", (await db.query("select role from public.user_roles where user_id = $1", [G])).rows.map((r) => r.role).join() === "etudiant");
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ('66666666-6666-6666-6666-666666666666', 'x@x.cd', '{"avatar_url":"javascript:alert(1)"}')`);
check("Photo non https refusée", (await db.query("select avatar_url from public.profiles where id = '66666666-6666-6666-6666-666666666666'")).rows[0].avatar_url === null);
await db.query("update public.profiles set last_seen_at = now() where id = $1", [G]);
denied = false; try { await as(A, "select * from public.admin_overview()"); } catch { denied = true; }
check("Statistiques d'administration refusées à un étudiant", denied);
denied = false; try { await as(null, "select * from public.admin_daily_series(30)"); } catch { denied = true; }
check("Statistiques refusées à un visiteur", denied);
const ov = (await as(ADM, "select * from public.admin_overview()")).rows[0];
check(`Statistiques : comptes (${ov.accounts_total}), inscrits du jour (${ov.signups_today}), en ligne (${ov.visitors_now}), Google (${ov.google_accounts})`, Number(ov.accounts_total) >= 6 && Number(ov.signups_today) >= 6 && Number(ov.visitors_now) >= 1 && Number(ov.google_accounts) === 1);
const series = (await as(ADM, "select * from public.admin_daily_series(30)")).rows;
check("Série quotidienne sur 30 jours, inscriptions du jour comptées", series.length === 30 && Number(series[29].signups) === Number(ov.signups_today));
check("Série : utilisateurs actifs du jour mesurés", Number(series[29].active_users) >= 1);
// Administration des utilisateurs : suspension temporaire et journal d'activité.
const newProgram = async (u) => { try { await as(u, `insert into public.programs (user_id, title, language_id, files) values ($1, 'x', 'python', '[]')`, [u]); return true; } catch { return false; } };
await as(ADM, "update public.profiles set status = 'suspendu', suspended_until = now() + interval '1 day' where id = $1", [B]);
check("Suspension temporaire en cours : le compte est bloqué", !(await newProgram(B)));
await as(ADM, "update public.profiles set suspended_until = now() - interval '1 minute' where id = $1", [B]);
check("Suspension temporaire expirée : le compte redevient actif automatiquement", await newProgram(B));
await as(ADM, "update public.profiles set status = 'actif', suspended_until = null where id = $1", [B]);
denied = false; try { await as(A, "update public.profiles set suspended_until = now() where id = $1", [A]); } catch { denied = true; }
check("Un étudiant ne peut pas modifier sa fin de suspension", denied);
denied = false; try { await as(A, "select * from public.admin_user_activity(null, 50)"); } catch { denied = true; }
check("Journal d'activité refusé à un étudiant", denied);
denied = false; try { await as(null, "select * from public.admin_user_summary($1)", [A]); } catch { denied = true; }
check("Résumé d'un utilisateur refusé à un visiteur", denied);
const actA = (await as(ADM, "select * from public.admin_user_activity($1, 50)", [A])).rows;
check(`Journal d'activité d'un étudiant (${actA.length} événement(s), dont chapitre terminé)`, actA.length > 0 && actA.every((r) => r.user_id === A) && actA.some((r) => r.kind === "chapitre" && /terminé/.test(r.label)));
const actAll = (await as(ADM, "select * from public.admin_user_activity(null, 50)")).rows;
check("Journal d'activité global : plusieurs utilisateurs, du plus récent au plus ancien", new Set(actAll.map((r) => r.user_id)).size >= 2 && actAll.every((r, i) => i === 0 || new Date(actAll[i - 1].at) >= new Date(r.at)));
const sumA = (await as(ADM, "select * from public.admin_user_summary($1)", [A])).rows[0];
check(`Résumé d'un étudiant (${sumA.chapters_done} chapitre(s) terminé(s))`, Number(sumA.chapters_done) >= 1);
// Sécurité (audit de novembre 2026) : limitation des tentatives, MFA des administrateurs, stockage.
const asSvc = async (sql, params = []) => { await db.exec("set role service_role"); try { return await db.query(sql, params); } finally { await db.exec("reset role"); } };
denied = false; try { await as(A, "select * from public.rate_limit_hit('cle-de-test-1', 3, 600, 60)"); } catch { denied = true; }
check("Limitation des tentatives : fonction refusée aux utilisateurs", denied);
await asSvc("select * from public.rate_limit_hit('cle-de-test-0', 3, 600, 60)");
check("Limitation : table illisible pour un utilisateur (aucune ligne visible)", await (async () => { try { return (await as(A, "select * from public.rate_limits")).rows.length === 0; } catch { return true; } })());
const hits = [];
for (let i = 0; i < 4; i++) hits.push((await asSvc("select * from public.rate_limit_hit('cle-de-test-1', 3, 600, 60)")).rows[0]);
check(`Limitation : 3 tentatives acceptées, la 4e bloquée (${hits.map((h) => h.ok).join(",")})`, hits.slice(0, 3).every((h) => h.ok) && !hits[3].ok && hits[3].retry_after > 0);
check("Limitation : la clé reste bloquée pendant la durée prévue", !(await asSvc("select * from public.rate_limit_hit('cle-de-test-1', 3, 600, 60, false)")).rows[0].ok);
await asSvc("select public.rate_limit_reset('cle-de-test-1')");
check("Limitation : réinitialisée après une connexion réussie", (await asSvc("select * from public.rate_limit_hit('cle-de-test-1', 3, 600, 60)")).rows[0].ok);
const asAal = async (uid, aal, sql) => { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false); select set_config('request.jwt.claim.role', 'authenticated', false); select set_config('request.jwt.claims', '{"aal":"${aal}"}', false); set role authenticated;`); try { return await db.query(sql); } finally { await db.exec("reset role; select set_config('request.jwt.claims', '', false)"); } };
check("Administrateur sans second facteur : droits inchangés", (await asAal(ADM, "aal1", "select public.is_admin() a")).rows[0].a === true);
await db.query("insert into auth.mfa_factors (user_id, status) values ($1, 'verified')", [ADM]);
check("Administrateur avec MFA, session non validée par le code : aucun droit", (await asAal(ADM, "aal1", "select public.is_admin() a")).rows[0].a === false);
check("… et ne lit plus les profils des autres", (await asAal(ADM, "aal1", "select count(*)::int n from public.profiles")).rows[0].n === 1);
check("Administrateur avec MFA, session validée (aal2) : droits rétablis", (await asAal(ADM, "aal2", "select public.is_admin() a")).rows[0].a === true);
await db.query("delete from auth.mfa_factors where user_id = $1", [ADM]);
const bk = Object.fromEntries((await db.query("select id, file_size_limit, allowed_mime_types from storage.buckets")).rows.map((r) => [r.id, r]));
check("Stockage : avatars limités aux images de 2 Mo", Number(bk.avatars.file_size_limit) === 2097152 && !bk.avatars.allowed_mime_types.includes("text/html"));
check("Stockage : ressources limitées à 20 Mo et aux types autorisés", Number(bk.ressources.file_size_limit) === 20971520 && bk.ressources.allowed_mime_types.includes("application/pdf") && !bk.ressources.allowed_mime_types.includes("image/svg+xml"));
await as(ADM, "update public.profiles set status = 'suspendu', suspended_until = now() - interval '1 minute' where id = $1", [B]);
check("Enseignant dont la suspension est terminée : droits rétablis automatiquement", (await as(B, "select public.can_teach('contenus') c")).rows[0].c === true);

// --- Accès rapide (utilisateur anonyme de Supabase Auth) ---
const Q = "a7a7a7a7-0000-4000-8000-00000000a001";
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, null, $2)`, [Q, { first_name: "Grace", last_name: "Mbuyi", position: "enseignant", sex: "feminin", faculty: "Droit", role: "administrateur" }]);
const qp = (await db.query("select full_name, first_name, last_name, position, sex, faculty from public.profiles where id = $1", [Q])).rows[0];
check("Accès rapide : profil créé avec nom, prénom, poste, sexe et filière", qp.full_name === "Grace Mbuyi" && qp.first_name === "Grace" && qp.position === "enseignant" && qp.sex === "feminin" && qp.faculty === "Droit");
const qr = (await db.query("select role from public.user_roles where user_id = $1", [Q])).rows.map((r) => r.role);
check("Accès rapide : rôle étudiant uniquement, même si « enseignant » ou « administrateur » est déclaré", qr.length === 1 && qr[0] === "etudiant");
const Q2 = "a7a7a7a7-0000-4000-8000-00000000a002";
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, null, $2)`, [Q2, { first_name: "X", position: "administrateur", sex: "autre" }]);
const qp2 = (await db.query("select position, sex from public.profiles where id = $1", [Q2])).rows[0];
check("Accès rapide : poste et sexe hors liste ignorés", qp2.position === null && qp2.sex === null);
denied = false; try { await as(Q, `insert into public.user_roles (user_id, role) values ($1, 'administrateur')`, [Q]); } catch { denied = true; }
check("Accès rapide : impossible de s'attribuer le rôle administrateur", denied && (await db.query("select count(*)::int n from public.user_roles where user_id = $1 and role = 'administrateur'", [Q])).rows[0].n === 0);
check("Accès rapide : modifie ses informations", (await as(Q, "update public.profiles set first_name = 'Grâce', faculty = 'Informatique' where id = $1 returning id", [Q])).rows.length === 1);
check("Accès rapide : ne modifie pas le profil d'un autre", (await as(Q, "update public.profiles set first_name = 'pirate' where id = $1 returning id", [A])).rows.length === 0);
denied = false; try { await as(Q, "update public.profiles set id = $1 where id = $2", [B, Q]); } catch { denied = true; }
check("Accès rapide : ne peut pas prendre l'identifiant interne d'un autre", denied || (await db.query("select count(*)::int n from public.profiles where id = $1", [Q])).rows[0].n === 1);
check("Accès rapide : ne lit pas les profils des autres", (await as(Q, "select id from public.profiles")).rows.every((r) => r.id === Q));
await as(ADM, "update public.profiles set status = 'actif', suspended_until = null where id = $1", [B]);
