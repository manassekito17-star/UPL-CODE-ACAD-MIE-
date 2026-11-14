-- =====================================================================
-- Avis des utilisateurs sur la plateforme (note de 1 à 5 étoiles et
-- commentaire facultatif), donnés depuis le message d'accueil.
-- Un avis par utilisateur (modifiable). Chacun ne lit que le sien ;
-- les administrateurs lisent tous les avis (Administration » Avis).
-- Script idempotent : il peut être relancé dans le SQL Editor sans risque.
-- =====================================================================

create table if not exists public.app_ratings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_ratings_updated_idx on public.app_ratings (updated_at desc);

drop trigger if exists app_ratings_updated_at on public.app_ratings;
create trigger app_ratings_updated_at before update on public.app_ratings
  for each row execute function public.set_updated_at();

alter table public.app_ratings enable row level security;

drop policy if exists "avis : lecture du sien ou administrateur" on public.app_ratings;
create policy "avis : lecture du sien ou administrateur" on public.app_ratings
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "avis : dépôt du sien" on public.app_ratings;
create policy "avis : dépôt du sien" on public.app_ratings
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_active_user());

drop policy if exists "avis : modification du sien" on public.app_ratings;
create policy "avis : modification du sien" on public.app_ratings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_active_user());

drop policy if exists "avis : suppression par un administrateur" on public.app_ratings;
create policy "avis : suppression par un administrateur" on public.app_ratings
  for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.app_ratings to authenticated, service_role;
revoke all on public.app_ratings from anon;
