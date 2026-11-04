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
