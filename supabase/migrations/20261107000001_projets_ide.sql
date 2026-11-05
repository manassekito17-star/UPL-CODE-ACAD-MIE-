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
