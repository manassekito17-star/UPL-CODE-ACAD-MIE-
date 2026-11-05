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
