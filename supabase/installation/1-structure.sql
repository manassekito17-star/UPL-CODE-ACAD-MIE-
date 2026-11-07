-- UPL CODE ACADEMY MK — installation, partie 1 sur 2 : structure et sécurité.
-- À coller dans Supabase → SQL Editor → New query, puis « Run ». Une seule fois, sur un projet vide.
-- Fichier généré par scripts/build-installation.mjs — ne pas modifier à la main.

-- ===== 20261104000001_schema.sql =====
-- =====================================================================
-- UPL CODE ACADEMY — Schéma principal
-- =====================================================================
-- Toutes les tables sont protégées par RLS (voir 20261104000002_rls.sql).
-- Les colonnes sensibles (solutions, corrigés, réponses des quiz) sont
-- isolées dans des tables réservées à l'équipe pédagogique.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Types ----------
create type public.app_role as enum ('etudiant', 'enseignant', 'administrateur');
create type public.account_status as enum ('actif', 'suspendu');
create type public.difficulty_level as enum ('debutant', 'intermediaire', 'avance');
create type public.content_status as enum ('brouillon', 'en_revision', 'publie', 'archive');
create type public.exercise_type as enum (
  'qcm', 'vrai_faux', 'completer', 'corriger', 'ecrire_algorithme',
  'ecrire_programme', 'probleme', 'mini_projet'
);
create type public.submission_status as enum ('reussi', 'partiel', 'echoue', 'erreur', 'en_attente');
create type public.progress_status as enum ('commence', 'termine');

-- ---------- Utilitaire : updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Comptes ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  username text unique check (username ~ '^[a-zA-Z0-9_.-]{3,32}$'),
  avatar_url text,
  student_number text check (char_length(student_number) <= 40),
  faculty text check (char_length(faculty) <= 120),
  level public.difficulty_level not null default 'debutant',
  bio text check (char_length(bio) <= 1000),
  learning_goal text check (char_length(learning_goal) <= 500),
  weekly_goal_minutes integer not null default 180 check (weekly_goal_minutes between 0 and 10080),
  status public.account_status not null default 'actif',
  suspended_reason text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  -- Permissions fines pour le rôle enseignant : 'contenus', 'corrections', 'suivi'
  permissions text[] not null default '{}',
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ---------- Catalogue ----------
create table public.languages (
  id text primary key check (id ~ '^[a-z0-9_-]{1,20}$'),
  name text not null,
  description text,
  monaco_language text not null,
  file_extension text not null,
  judge0_language_id integer,
  enabled boolean not null default true,
  sort_order integer not null default 0
);

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null,
  description text,
  sort_order integer not null default 0
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  language_id text not null references public.languages (id),
  category_id uuid references public.course_categories (id) on delete set null,
  code text, -- ex. « Parcours A »
  title text not null,
  tagline text,
  description text not null default '',
  level public.difficulty_level not null default 'debutant',
  prerequisites text[] not null default '{}',
  objectives text[] not null default '{}',
  duration_hours numeric(6, 1) not null default 0,
  cover_url text,
  status public.content_status not null default 'brouillon',
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]{2,80}$'),
  title text not null,
  description text,
  position integer not null default 0,
  unique (course_id, slug)
);
create index modules_course_idx on public.modules (course_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]{2,80}$'),
  title text not null,
  level public.difficulty_level not null default 'debutant',
  duration_minutes integer not null default 15 check (duration_minutes between 1 and 600),
  objectives text[] not null default '{}',
  prerequisites text[] not null default '{}',
  content text not null default '', -- Markdown
  summary text[] not null default '{}',
  examples jsonb not null default '[]', -- [{title, language, code, stdin?, explanation?}]
  status public.content_status not null default 'brouillon',
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index lessons_module_idx on public.lessons (module_id, position);
create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  kind text not null check (kind in ('video', 'document', 'lien', 'image')),
  title text not null,
  url text,
  storage_path text, -- chemin dans le bucket « ressources »
  position integer not null default 0
);

-- ---------- Exercices ----------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  course_id uuid references public.courses (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  language_id text not null references public.languages (id),
  title text not null,
  statement text not null, -- Markdown
  difficulty public.difficulty_level not null default 'debutant',
  type public.exercise_type not null default 'ecrire_programme',
  objectives text[] not null default '{}',
  examples jsonb not null default '[]', -- [{input, output, explanation?}]
  constraints text[] not null default '{}',
  starter_code text not null default '',
  hints text[] not null default '{}', -- indices progressifs
  points integer not null default 10 check (points between 0 and 1000),
  is_evaluated boolean not null default false, -- exercice noté : le professeur IA ne donne pas la solution
  time_limit_ms integer not null default 5000 check (time_limit_ms between 100 and 20000),
  memory_limit_kb integer not null default 128000 check (memory_limit_kb between 2048 and 512000),
  status public.content_status not null default 'brouillon',
  position integer not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index exercises_course_idx on public.exercises (course_id);
create trigger exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();

-- Solution et corrigé : jamais lisibles directement par un étudiant.
create table public.exercise_solutions (
  exercise_id uuid primary key references public.exercises (id) on delete cascade,
  solution_code text not null default '',
  correction text not null default '', -- corrigé pédagogique (Markdown)
  updated_at timestamptz not null default now()
);

create table public.exercise_test_cases (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  description text,
  input text not null default '',
  expected_output text not null default '',
  is_hidden boolean not null default false,
  weight integer not null default 1 check (weight between 1 and 100),
  position integer not null default 0
);
create index test_cases_exercise_idx on public.exercise_test_cases (exercise_id, position);

-- ---------- Programmes sauvegardés ----------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Sans titre' check (char_length(title) <= 120),
  language_id text not null references public.languages (id),
  files jsonb not null default '[]' check (jsonb_typeof(files) = 'array' and pg_column_size(files) < 300000),
  stdin text not null default '' check (char_length(stdin) <= 20000),
  exercise_id uuid references public.exercises (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index programs_user_idx on public.programs (user_id, updated_at desc);
create trigger programs_updated_at before update on public.programs
  for each row execute function public.set_updated_at();

-- ---------- Soumissions et exécutions ----------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  language_id text not null references public.languages (id),
  code text not null check (char_length(code) <= 100000),
  status public.submission_status not null,
  score numeric(5, 2) not null default 0 check (score between 0 and 100),
  passed_count integer not null default 0,
  total_count integer not null default 0,
  attempt_number integer not null default 1,
  teacher_feedback text,
  teacher_score numeric(5, 2) check (teacher_score between 0 and 100),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index submissions_user_idx on public.submissions (user_id, created_at desc);
create index submissions_exercise_idx on public.submissions (exercise_id, created_at desc);

create table public.execution_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  submission_id uuid references public.submissions (id) on delete cascade,
  program_id uuid references public.programs (id) on delete set null,
  language_id text not null references public.languages (id),
  source_excerpt text, -- 2 000 premiers caractères du code exécuté
  stdin text,
  stdout text,
  stderr text,
  compile_output text,
  status text not null,
  time_ms integer,
  memory_kb integer,
  created_at timestamptz not null default now()
);
create index execution_results_user_idx on public.execution_results (user_id, created_at desc);

-- ---------- Quiz ----------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,120}$'),
  title text not null,
  is_final boolean not null default false, -- évaluation finale du parcours
  pass_score integer not null default 60 check (pass_score between 0 and 100),
  status public.content_status not null default 'brouillon',
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  type text not null check (type in ('qcm', 'vrai_faux', 'choix_multiples')),
  prompt text not null,
  code text, -- extrait de code facultatif
  choices jsonb not null default '[]', -- ["choix A", "choix B", …]
  position integer not null default 0
);

-- Réponses attendues : réservées à l'équipe pédagogique (correction côté serveur).
create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions (id) on delete cascade,
  correct jsonb not null, -- [index, …]
  explanation text
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  answers jsonb not null,
  score numeric(5, 2) not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);
create index quiz_attempts_user_idx on public.quiz_attempts (user_id, created_at desc);

-- ---------- Progression ----------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  last_lesson_id uuid references public.lessons (id) on delete set null, -- reprise à la dernière position
  last_activity_at timestamptz not null default now(),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status public.progress_status not null default 'commence',
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_course_idx on public.lesson_progress (user_id, course_id);
create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.course_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  completed_lessons integer not null default 0,
  total_lessons integer not null default 0,
  percent numeric(5, 2) not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- Recalcule la progression d'un parcours quand une leçon change d'état.
create or replace function public.refresh_course_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := coalesce(new.user_id, old.user_id);
  v_course uuid := coalesce(new.course_id, old.course_id);
  v_total integer;
  v_done integer;
begin
  select count(*) into v_total from public.lessons
    where course_id = v_course and status = 'publie';
  select count(*) into v_done from public.lesson_progress lp
    join public.lessons l on l.id = lp.lesson_id
    where lp.user_id = v_user and lp.course_id = v_course
      and lp.status = 'termine' and l.status = 'publie';
  insert into public.course_progress (user_id, course_id, completed_lessons, total_lessons, percent, completed_at, updated_at)
  values (
    v_user, v_course, v_done, v_total,
    case when v_total = 0 then 0 else round(v_done * 100.0 / v_total, 2) end,
    case when v_total > 0 and v_done >= v_total then now() else null end,
    now()
  )
  on conflict (user_id, course_id) do update set
    completed_lessons = excluded.completed_lessons,
    total_lessons = excluded.total_lessons,
    percent = excluded.percent,
    completed_at = coalesce(public.course_progress.completed_at, excluded.completed_at),
    updated_at = now();
  return null;
end;
$$;
create trigger lesson_progress_refresh after insert or update or delete on public.lesson_progress
  for each row execute function public.refresh_course_progress();

-- ---------- Récompenses ----------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'award'
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  verification_code text not null unique default encode(gen_random_bytes(9), 'hex'),
  score numeric(5, 2),
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------- Professeur IA ----------
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Nouvelle conversation' check (char_length(title) <= 200),
  context jsonb not null default '{}', -- {exerciseSlug, lessonSlug, language}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_conversations_user_idx on public.ai_conversations (user_id, updated_at desc);
create trigger ai_conversations_updated_at before update on public.ai_conversations
  for each row execute function public.set_updated_at();

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  mode text,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);
create index ai_messages_user_day_idx on public.ai_messages (user_id, created_at);

-- ---------- Administration ----------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 200),
  body text not null,
  audience text not null default 'tous' check (audience in ('tous', 'etudiants', 'enseignants')),
  published boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb not null default '{}',
  ip text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

-- ===== 20261104000002_security.sql =====
-- =====================================================================
-- UPL CODE ACADEMY — Rôles, fonctions de sécurité et politiques RLS
-- =====================================================================
-- Principes :
--  * un étudiant ne voit que ses propres données privées ;
--  * les contenus publiés sont lisibles par tous ;
--  * les résultats officiels (soumissions, tentatives de quiz, certificats,
--    messages IA) sont écrits uniquement par le serveur (clé service_role),
--    jamais directement depuis le navigateur ;
--  * les enseignants gèrent la pédagogie selon leurs permissions ;
--  * seuls les administrateurs gèrent comptes, rôles et paramètres.
-- =====================================================================

-- ---------- Fonctions d'autorisation ----------
create or replace function public.has_role(p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and ur.role = p_role
      and p.status = 'actif'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('administrateur');
$$;

-- Administrateur, ou enseignant disposant de la permission demandée.
create or replace function public.can_teach(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and ur.role = 'enseignant'
      and p.status = 'actif'
      and p_permission = any (ur.permissions)
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('administrateur') or public.has_role('enseignant');
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'actif'
  );
$$;

revoke execute on function public.has_role(public.app_role) from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.can_teach(text) from anon;
revoke execute on function public.is_staff() from anon;
revoke execute on function public.is_active_user() from anon;

-- ---------- Création automatique du profil ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120));
  insert into public.user_roles (user_id, role) values (new.id, 'etudiant');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un utilisateur ne peut pas modifier lui-même son statut (suspension).
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- S'applique aux requêtes d'utilisateurs finaux (JWT avec « sub ») ; le
  -- serveur (service_role) et le SQL d'administration ne sont pas concernés.
  if (new.status is distinct from old.status or new.suspended_reason is distinct from old.suspended_reason)
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Seul un administrateur peut modifier le statut d''un compte.';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------- Activation RLS ----------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.languages enable row level security;
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_solutions enable row level security;
alter table public.exercise_test_cases enable row level security;
alter table public.programs enable row level security;
alter table public.submissions enable row level security;
alter table public.execution_results enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.certificates enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;

-- ---------- Profils et rôles ----------
create policy "profil : lecture du sien ou par l'équipe" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.can_teach('suivi'));
create policy "profil : mise à jour du sien" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and public.is_active_user())
  with check (id = (select auth.uid()));
create policy "profil : gestion par l'administrateur" on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "rôles : lecture des siens ou par l'administrateur" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy "rôles : gestion par l'administrateur" on public.user_roles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Catalogue (lecture publique des contenus publiés) ----------
create policy "langages : lecture publique" on public.languages
  for select to anon, authenticated using (true);
create policy "langages : gestion admin" on public.languages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "catégories : lecture publique" on public.course_categories
  for select to anon, authenticated using (true);
create policy "catégories : gestion admin" on public.course_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "cours : lecture publiés ou équipe" on public.courses
  for select to anon, authenticated
  using (status = 'publie' or public.can_teach('contenus'));
create policy "cours : gestion pédagogique" on public.courses
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "modules : lecture si cours visible" on public.modules
  for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'publie' or public.can_teach('contenus'))));
create policy "modules : gestion pédagogique" on public.modules
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "leçons : lecture publiées ou équipe" on public.lessons
  for select to anon, authenticated
  using (
    (status = 'publie' and exists (select 1 from public.courses c where c.id = course_id and c.status = 'publie'))
    or public.can_teach('contenus')
  );
create policy "leçons : gestion pédagogique" on public.lessons
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "ressources : lecture si leçon visible" on public.lesson_resources
  for select to anon, authenticated
  using (exists (select 1 from public.lessons l where l.id = lesson_id and (l.status = 'publie' or public.can_teach('contenus'))));
create policy "ressources : gestion pédagogique" on public.lesson_resources
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "exercices : lecture publiés ou équipe" on public.exercises
  for select to anon, authenticated
  using (status = 'publie' or public.can_teach('contenus'));
create policy "exercices : gestion pédagogique" on public.exercises
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

-- Solutions : équipe pédagogique uniquement (le serveur les lit avec service_role).
create policy "solutions : équipe pédagogique" on public.exercise_solutions
  for all to authenticated
  using (public.can_teach('contenus') or public.can_teach('corrections'))
  with check (public.can_teach('contenus'));

-- Tests : les tests cachés ne sont jamais envoyés au navigateur d'un étudiant.
create policy "tests : visibles publiés" on public.exercise_test_cases
  for select to anon, authenticated
  using (
    (not is_hidden and exists (select 1 from public.exercises e where e.id = exercise_id and e.status = 'publie'))
    or public.can_teach('contenus')
  );
create policy "tests : gestion pédagogique" on public.exercise_test_cases
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

-- ---------- Programmes de l'étudiant ----------
create policy "programmes : propriétaire" on public.programs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_active_user());

-- ---------- Résultats officiels : lecture seule côté client ----------
create policy "soumissions : lecture des siennes ou correction" on public.submissions
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('corrections') or public.can_teach('suivi'));
create policy "soumissions : annotation enseignant" on public.submissions
  for update to authenticated
  using (public.can_teach('corrections')) with check (public.can_teach('corrections'));

create policy "exécutions : lecture des siennes" on public.execution_results
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));

create policy "quiz : lecture publiés ou équipe" on public.quizzes
  for select to anon, authenticated using (status = 'publie' or public.can_teach('contenus'));
create policy "quiz : gestion pédagogique" on public.quizzes
  for all to authenticated using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "questions : lecture si quiz visible" on public.quiz_questions
  for select to anon, authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id and (q.status = 'publie' or public.can_teach('contenus'))));
create policy "questions : gestion pédagogique" on public.quiz_questions
  for all to authenticated using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "réponses quiz : équipe pédagogique" on public.quiz_answer_keys
  for all to authenticated using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "tentatives quiz : lecture des siennes" on public.quiz_attempts
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));

-- ---------- Progression ----------
create policy "inscriptions : propriétaire" on public.enrollments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "inscriptions : suivi" on public.enrollments
  for select to authenticated using (public.can_teach('suivi'));

create policy "progression leçon : propriétaire" on public.lesson_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "progression leçon : suivi" on public.lesson_progress
  for select to authenticated using (public.can_teach('suivi'));

create policy "progression cours : lecture" on public.course_progress
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));

-- ---------- Récompenses ----------
create policy "badges : lecture publique" on public.achievements
  for select to anon, authenticated using (true);
create policy "badges : gestion admin" on public.achievements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "badges obtenus : lecture des siens" on public.user_achievements
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));
create policy "certificats : lecture des siens" on public.certificates
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));

-- ---------- Professeur IA ----------
create policy "conversations IA : propriétaire" on public.ai_conversations
  for select to authenticated using (user_id = (select auth.uid()));
create policy "conversations IA : suppression" on public.ai_conversations
  for delete to authenticated using (user_id = (select auth.uid()));
create policy "messages IA : lecture des siens" on public.ai_messages
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------- Administration ----------
create policy "annonces : lecture des publiées" on public.announcements
  for select to anon, authenticated
  using (
    (published and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
    or public.is_staff()
  );
create policy "annonces : gestion" on public.announcements
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

create policy "journaux : lecture admin" on public.audit_logs
  for select to authenticated using (public.is_admin());

create policy "paramètres : lecture admin" on public.platform_settings
  for select to authenticated using (public.is_admin());
create policy "paramètres : gestion admin" on public.platform_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Stockage ----------
insert into storage.buckets (id, name, public)
values ('ressources', 'ressources', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "ressources : envoi par l'équipe" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ressources' and public.can_teach('contenus'));
create policy "ressources : modification par l'équipe" on storage.objects
  for update to authenticated
  using (bucket_id = 'ressources' and public.can_teach('contenus'));
create policy "ressources : suppression par l'équipe" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ressources' and public.can_teach('contenus'));

create policy "avatars : envoi du sien" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars : modification du sien" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars : suppression du sien" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ===== 20261104000003_reference_data.sql =====
-- =====================================================================
-- UPL CODE ACADEMY — Données de référence
-- =====================================================================

-- Identifiants Judge0 CE par défaut (modifiables depuis l'administration).
insert into public.languages (id, name, description, monaco_language, file_extension, judge0_language_id, sort_order) values
  ('pseudocode', 'Algorithmique', 'Pseudocode en français, exécuté par l''interpréteur de la plateforme.', 'pseudocode', 'algo', null, 1),
  ('python', 'Python', 'Langage polyvalent idéal pour débuter et pour la science des données.', 'python', 'py', 71, 2),
  ('c', 'Langage C', 'Langage système, compilé, proche de la machine.', 'c', 'c', 50, 3),
  ('javascript', 'JavaScript', 'Le langage du web, côté navigateur et serveur.', 'javascript', 'js', 63, 4),
  ('java', 'Java', 'Langage orienté objet, typé et portable.', 'java', 'java', 62, 5)
on conflict (id) do nothing;

insert into public.course_categories (slug, name, description, sort_order) values
  ('fondamentaux', 'Fondamentaux', 'Algorithmique et logique de programmation.', 1),
  ('programmation', 'Langages de programmation', 'Python, C, JavaScript et Java.', 2),
  ('web', 'Développement web', 'Pages, interactions et API.', 3)
on conflict (slug) do nothing;

insert into public.achievements (code, title, description, icon) values
  ('premier-programme', 'Premier programme', 'Exécuter son tout premier programme.', 'play'),
  ('premier-exercice', 'Premier exercice réussi', 'Réussir un premier exercice corrigé automatiquement.', 'check'),
  ('dix-exercices', 'Persévérant', 'Réussir 10 exercices.', 'flame'),
  ('premiere-lecon', 'Curieux', 'Terminer une première leçon.', 'book'),
  ('parcours-termine', 'Parcours terminé', 'Terminer toutes les leçons d''un parcours.', 'trophy'),
  ('quiz-parfait', 'Sans faute', 'Obtenir 100 % à un quiz.', 'star')
on conflict (code) do nothing;

insert into public.platform_settings (key, value, description) values
  ('ai', '{"enabled": true, "daily_messages_per_user": 40, "monthly_budget_usd": 50, "max_output_tokens": 2000, "effort": "medium"}',
   'Paramètres et limites de coût du professeur IA.'),
  ('execution', '{"enabled": true, "max_runs_per_minute": 20, "cpu_time_limit_s": 5, "memory_limit_kb": 128000}',
   'Limites d''exécution du code des étudiants.'),
  ('registration', '{"open": true, "allowed_email_domains": []}',
   'Inscriptions ouvertes et domaines e-mail autorisés (vide = tous).')
on conflict (key) do nothing;

-- ===== 20261104000004_profile_links.sql =====
-- Liens explicites vers public.profiles (profiles.id = auth.users.id) pour
-- permettre les jointures PostgREST (nom de l'étudiant dans les corrections,
-- auteur dans les journaux…).
alter table public.submissions
  add constraint submissions_user_profile_fk foreign key (user_id) references public.profiles (id) on delete cascade;
alter table public.audit_logs
  add constraint audit_logs_actor_profile_fk foreign key (actor_id) references public.profiles (id) on delete set null;
alter table public.course_progress
  add constraint course_progress_user_profile_fk foreign key (user_id) references public.profiles (id) on delete cascade;

-- ===== 20261105000001_formation_chapitres.sql =====
-- =====================================================================
-- Formation : structure pédagogique des chapitres, interrogations et
-- évaluations de chapitre.
-- =====================================================================

-- Définitions, algorithmes commentés, erreurs fréquentes, exercices corrigés,
-- TD et compétences d'un chapitre (format : ChapterPedagogy, sans les quiz).
alter table public.lessons add column if not exists pedagogy jsonb;

-- Nature du quiz : vérification (leçon), interrogation (minutée), évaluation
-- (valide le chapitre). Les évaluations finales de parcours restent is_final.
alter table public.quizzes
  add column if not exists kind text not null default 'verification'
    check (kind in ('verification', 'interrogation', 'evaluation')),
  add column if not exists duration_minutes integer check (duration_minutes between 1 and 240);

create index if not exists quizzes_lesson_idx on public.quizzes (lesson_id);
create index if not exists quiz_attempts_quiz_user_idx on public.quiz_attempts (quiz_id, user_id);

-- Un chapitre est validé par la réussite de son évaluation : le badge porte
-- désormais sur une activité vérifiée, pas sur un clic.
update public.achievements
  set title = 'Premier chapitre validé', description = 'Réussir l''évaluation d''un premier chapitre.'
  where code = 'premiere-lecon';

-- ===== 20261106000001_multiniveaux.sql =====
-- =====================================================================
-- UPL ACADEMY multiniveaux : quatre niveaux par parcours, test de
-- positionnement, examens de niveau, passage de niveau, certificats
-- internes par niveau, parcours HTML et CSS.
-- =====================================================================

-- ---------- Langages web ----------
-- HTML et CSS ne sont jamais exécutés côté serveur : aperçu isolé dans le
-- navigateur et correction par analyse structurelle du document.
insert into public.languages (id, name, description, monaco_language, file_extension, judge0_language_id, sort_order) values
  ('html', 'HTML', 'Langage de structure des pages web.', 'html', 'html', null, 6),
  ('css', 'CSS', 'Langage de présentation des pages web.', 'css', 'css', null, 7)
on conflict (id) do nothing;

-- ---------- Niveaux d'un parcours ----------
create table public.course_levels (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  number smallint not null check (number between 1 and 4),
  title text not null,
  description text not null default '',
  objectives text[] not null default '{}',
  -- Chapitres annoncés mais pas encore rédigés : affichés comme « au programme ».
  planned_chapters text[] not null default '{}',
  -- Critères de passage au niveau suivant.
  chapters_validated_pct integer not null default 100 check (chapters_validated_pct between 0 and 100),
  exam_pass_score integer not null default 70 check (exam_pass_score between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (course_id, number)
);
create trigger course_levels_updated_at before update on public.course_levels
  for each row execute function public.set_updated_at();

alter table public.modules
  add column if not exists level_number smallint check (level_number between 1 and 4);

-- ---------- Quiz : positionnement et examens de niveau ----------
alter table public.quizzes drop constraint if exists quizzes_kind_check;
alter table public.quizzes
  add constraint quizzes_kind_check
    check (kind in ('verification', 'interrogation', 'evaluation', 'positionnement', 'examen_niveau')),
  add column if not exists level_number smallint check (level_number between 1 and 4);
-- Un examen de niveau désigne toujours son niveau.
alter table public.quizzes
  add constraint quizzes_examen_niveau_check check (kind <> 'examen_niveau' or (level_number is not null and course_id is not null));
create unique index if not exists quizzes_level_exam_unique on public.quizzes (course_id, level_number) where kind = 'examen_niveau';
create unique index if not exists quizzes_placement_unique on public.quizzes (course_id) where kind = 'positionnement';

-- Niveau évalué par une question du test de positionnement.
alter table public.quiz_questions
  add column if not exists level_number smallint check (level_number between 1 and 4);

-- ---------- Exercices web ----------
-- Vérification structurelle (élément, texte, attribut, règle CSS).
alter table public.exercise_test_cases add column if not exists "check" jsonb;
-- Fichiers de départ d'un projet multi-fichiers et fichier ouvert par défaut.
alter table public.exercises
  add column if not exists starter_files jsonb,
  add column if not exists active_file text check (active_file is null or active_file ~ '^[A-Za-z0-9_.-]{1,60}$');

-- ---------- Résultats de positionnement ----------
create table public.placement_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  quiz_id uuid references public.quizzes (id) on delete set null,
  -- {"1": {"good": 3, "total": 3}, …}
  scores jsonb not null,
  recommended_level smallint not null check (recommended_level between 1 and 4),
  created_at timestamptz not null default now()
);
create index placement_results_user_idx on public.placement_results (user_id, course_id, created_at desc);

-- ---------- Progression par niveau ----------
-- en_cours : niveau ouvert ; valide : critères atteints ; dispense : niveau
-- reconnu acquis par le test de positionnement.
create table public.level_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  level_number smallint not null check (level_number between 1 and 4),
  status text not null default 'en_cours' check (status in ('en_cours', 'valide', 'dispense')),
  exam_score numeric(5, 2),
  validated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, level_number)
);
create trigger level_progress_updated_at before update on public.level_progress
  for each row execute function public.set_updated_at();

-- ---------- Certificats internes par niveau ----------
-- level_number null : certificat de parcours complet ; 1 à 4 : niveau validé.
alter table public.certificates
  add column if not exists level_number smallint check (level_number between 1 and 4);
alter table public.certificates drop constraint if exists certificates_user_id_course_id_key;
alter table public.certificates
  add constraint certificates_user_course_level_key unique nulls not distinct (user_id, course_id, level_number);

-- Vérification publique d'un certificat par son code : ne révèle que le
-- nom affiché, le parcours, le niveau, le score et la date.
create or replace function public.verify_certificate(p_code text)
returns table (full_name text, course_title text, level_number smallint, level_title text, score numeric, issued_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.full_name, c.title, ce.level_number, cl.title, ce.score, ce.issued_at
  from public.certificates ce
  join public.courses c on c.id = ce.course_id
  left join public.profiles p on p.id = ce.user_id
  left join public.course_levels cl on cl.course_id = ce.course_id and cl.number = ce.level_number
  where ce.verification_code = p_code
    and p_code ~ '^[a-f0-9]{8,64}$';
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ---------- Sécurité ----------
alter table public.course_levels enable row level security;
alter table public.placement_results enable row level security;
alter table public.level_progress enable row level security;

create policy "niveaux : lecture si cours visible" on public.course_levels
  for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'publie' or public.can_teach('contenus'))));
create policy "niveaux : gestion pédagogique" on public.course_levels
  for all to authenticated
  using (public.can_teach('contenus')) with check (public.can_teach('contenus'));

-- Résultats officiels : écrits par le serveur (service_role) après correction.
create policy "positionnement : lecture des siens ou suivi" on public.placement_results
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));
create policy "niveaux validés : lecture des siens ou suivi" on public.level_progress
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_teach('suivi'));

-- Badge de passage de niveau.
insert into public.achievements (code, title, description, icon) values
  ('niveau-valide', 'Niveau validé', 'Valider un premier niveau d''un parcours.', 'trophy')
on conflict (code) do nothing;

-- ===== 20261107000001_projets_ide.sql =====
-- =====================================================================
-- UPL IDE : projets à arborescence (dossiers + fichiers), révisions pour
-- la synchronisation entre appareils et historique des versions.
-- Accès strictement réservé au propriétaire (RLS).
-- =====================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  template text not null default 'vierge' check (template ~ '^[a-z0-9-]{2,40}$'),
  -- [{ "path": "src/main.py", "content": "…" }] : chemins relatifs, sans « .. »
  files jsonb not null default '[]' check (jsonb_typeof(files) = 'array' and pg_column_size(files) < 2500000),
  -- Dossiers vides éventuels (les autres se déduisent des chemins des fichiers)
  folders text[] not null default '{}' check (cardinality(folders) <= 500),
  -- Incrémentée à chaque enregistrement : détection des conflits entre appareils
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_idx on public.projects (user_id, updated_at desc);
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  revision integer not null,
  label text check (char_length(label) <= 120),
  files jsonb not null check (jsonb_typeof(files) = 'array' and pg_column_size(files) < 2500000),
  folders text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index project_versions_project_idx on public.project_versions (project_id, created_at desc);

alter table public.projects enable row level security;
alter table public.project_versions enable row level security;

create policy "projets : propriétaire" on public.projects
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_active_user());

-- L'historique est écrit par le serveur au moment de l'enregistrement, avec la
-- session de l'étudiant : lecture et ajout pour ses propres projets uniquement.
create policy "versions : lecture des siennes" on public.project_versions
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "versions : ajout pour ses projets" on public.project_versions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_active_user()
    and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
  );
create policy "versions : suppression des siennes" on public.project_versions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ===== 20261108000001_quotas_gratuits.sql =====
-- =====================================================================
-- Lancement gratuit : compteurs de consommation des services externes,
-- quotas atomiques (par utilisateur et global, par jour), offre de
-- l'utilisateur (gratuite par défaut) et mesure de l'espace utilisé.
-- =====================================================================

-- Consommation journalière par service (« judge0 », …) et par utilisateur.
-- user_id = uuid nul pour les appels sans compte.
create table public.service_usage (
  day date not null default (now() at time zone 'utc')::date,
  service text not null check (service ~ '^[a-z0-9_]{2,30}$'),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  units integer not null default 0 check (units >= 0),
  refused integer not null default 0 check (refused >= 0),
  primary key (day, service, user_id)
);
create index service_usage_day_idx on public.service_usage (service, day);

alter table public.service_usage enable row level security;
-- Lecture : chacun ses compteurs, l'administration tout ; écriture : serveur uniquement (fonction ci-dessous).
create policy "consommation : lecture des siennes ou admin" on public.service_usage
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Réserve `p_units` unités si les plafonds (utilisateur et global du jour) le
-- permettent. Atomique : verrou par service pour éviter les dépassements
-- concurrents. Un plafond <= 0 signifie « aucune limite ».
create or replace function public.consume_quota(p_service text, p_user uuid, p_units integer, p_user_limit integer, p_global_limit integer)
returns table (ok boolean, user_used integer, global_used integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_user uuid := coalesce(p_user, '00000000-0000-0000-0000-000000000000');
  v_user_used integer;
  v_global_used integer;
begin
  perform pg_advisory_xact_lock(hashtext('quota:' || p_service));
  select coalesce(sum(units), 0) into v_global_used from public.service_usage where day = v_day and service = p_service;
  select coalesce(units, 0) into v_user_used from public.service_usage where day = v_day and service = p_service and user_id = v_user;
  v_user_used := coalesce(v_user_used, 0);
  if (p_user_limit > 0 and v_user_used + p_units > p_user_limit) or (p_global_limit > 0 and v_global_used + p_units > p_global_limit) then
    insert into public.service_usage (day, service, user_id, units, refused) values (v_day, p_service, v_user, 0, 1)
      on conflict (day, service, user_id) do update set refused = public.service_usage.refused + 1;
    return query select false, v_user_used, v_global_used;
    return;
  end if;
  insert into public.service_usage (day, service, user_id, units) values (v_day, p_service, v_user, p_units)
    on conflict (day, service, user_id) do update set units = public.service_usage.units + p_units;
  return query select true, v_user_used + p_units, v_global_used + p_units;
end;
$$;
revoke all on function public.consume_quota(text, uuid, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_quota(text, uuid, integer, integer, integer) to service_role;

-- Offre de l'utilisateur : tout le monde est sur l'offre gratuite au lancement.
-- « premium » est prévu pour plus tard ; seul un administrateur peut changer l'offre.
alter table public.profiles
  add column if not exists plan text not null default 'gratuit' check (plan in ('gratuit', 'premium'));

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.status is distinct from old.status or new.suspended_reason is distinct from old.suspended_reason)
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Seul un administrateur peut modifier le statut d''un compte.';
  end if;
  if new.plan is distinct from old.plan and (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Seul un administrateur peut modifier l''offre d''un compte.';
  end if;
  return new;
end;
$$;

-- Espace utilisé (base et stockage de fichiers) : administrateur uniquement,
-- pour comparer aux limites de l'offre gratuite de l'hébergeur.
create or replace function public.platform_usage()
returns table (database_bytes bigint, storage_bytes bigint, users_total bigint, users_active_30d bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Réservé à l''administration.';
  end if;
  return query
    select
      pg_database_size(current_database())::bigint,
      coalesce((select sum(coalesce((o.metadata ->> 'size')::bigint, 0)) from storage.objects o), 0)::bigint,
      (select count(*) from auth.users)::bigint,
      (select count(*) from public.profiles p where p.last_seen_at > now() - interval '30 days')::bigint;
end;
$$;
revoke all on function public.platform_usage() from public, anon;
grant execute on function public.platform_usage() to authenticated, service_role;

-- Budget 0 par défaut : aucun fournisseur d'IA payant sans autorisation explicite
-- de l'administrateur, et Python/JavaScript exécutés dans le navigateur.
update public.platform_settings
  set value = value || '{"allow_paid_providers": false, "global_daily_messages": 300}'::jsonb
  where key = 'ai' and not (value ? 'allow_paid_providers');
update public.platform_settings
  set value = value || '{"browser_first": true, "server_runs_per_user_per_day": 30, "server_runs_global_per_day": 45}'::jsonb
  where key = 'execution' and not (value ? 'browser_first');

-- ===== 20261109000001_comptes_google_statistiques.sql =====
-- =====================================================================
-- Comptes Google et statistiques d'administration.
-- =====================================================================

-- Nom et photo repris du profil Google (« name », « full_name », « picture »,
-- « avatar_url » selon le fournisseur) ou du formulaire d'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avatar text := coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture');
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), ''), 120),
    case when v_avatar ~ '^https://' then left(v_avatar, 500) else null end
  );
  insert into public.user_roles (user_id, role) values (new.id, 'etudiant');
  return new;
end;
$$;

create index if not exists profiles_created_idx on public.profiles (created_at desc);
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);

-- Indicateurs du tableau de bord (administrateur uniquement). Définitions :
--   - inscription : création du compte (profiles.created_at) ;
--   - visite : page ouverte par un utilisateur connecté (profiles.last_seen_at,
--     mis à jour au plus toutes les 5 minutes) ;
--   - utilisateur actif un jour donné : au moins une activité d'apprentissage
--     enregistrée ce jour-là (chapitre ouvert, quiz, soumission, exécution,
--     question au professeur IA, projet enregistré).
create or replace function public.admin_overview()
returns table (
  accounts_total bigint, accounts_suspended bigint,
  signups_today bigint, signups_7d bigint, signups_month bigint,
  visitors_now bigint, visitors_24h bigint, visitors_7d bigint, visitors_30d bigint,
  google_accounts bigint, email_accounts bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_month timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administration.';
  end if;
  return query
    select
      (select count(*) from public.profiles),
      (select count(*) from public.profiles where status = 'suspendu'),
      (select count(*) from public.profiles where created_at >= v_today),
      (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
      (select count(*) from public.profiles where created_at >= v_month),
      (select count(*) from public.profiles where last_seen_at >= now() - interval '5 minutes'),
      (select count(*) from public.profiles where last_seen_at >= now() - interval '24 hours'),
      (select count(*) from public.profiles where last_seen_at >= now() - interval '7 days'),
      (select count(*) from public.profiles where last_seen_at >= now() - interval '30 days'),
      (select count(distinct i.user_id) from auth.identities i where i.provider = 'google'),
      (select count(distinct i.user_id) from auth.identities i where i.provider = 'email');
end;
$$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

create or replace function public.admin_daily_series(p_days integer default 30)
returns table (day date, signups bigint, active_users bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 366);
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administration.';
  end if;
  return query
    with days as (
      select generate_series(((now() at time zone 'utc')::date - (v_days - 1)), (now() at time zone 'utc')::date, interval '1 day')::date as d
    ),
    activity as (
      select user_id, (updated_at at time zone 'utc')::date as d from public.lesson_progress where updated_at >= now() - make_interval(days => v_days)
      union select user_id, (created_at at time zone 'utc')::date from public.quiz_attempts where created_at >= now() - make_interval(days => v_days)
      union select user_id, (created_at at time zone 'utc')::date from public.submissions where created_at >= now() - make_interval(days => v_days)
      union select user_id, (created_at at time zone 'utc')::date from public.execution_results where created_at >= now() - make_interval(days => v_days)
      union select user_id, (created_at at time zone 'utc')::date from public.ai_messages where role = 'user' and created_at >= now() - make_interval(days => v_days)
      union select user_id, (updated_at at time zone 'utc')::date from public.projects where updated_at >= now() - make_interval(days => v_days)
    )
    select
      days.d,
      (select count(*) from public.profiles p where (p.created_at at time zone 'utc')::date = days.d),
      (select count(distinct a.user_id) from activity a where a.d = days.d)
    from days
    order by days.d;
end;
$$;
revoke all on function public.admin_daily_series(integer) from public, anon;
grant execute on function public.admin_daily_series(integer) to authenticated;
