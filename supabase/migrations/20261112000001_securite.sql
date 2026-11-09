-- =====================================================================
-- Renforcement de la sécurité (audit de novembre 2026).
-- Script idempotent : il peut être relancé dans le SQL Editor sans risque.
-- Retour arrière : voir docs/SECURITE.md (section « Retour arrière »).
-- =====================================================================

-- ---------- 1. Limitation des tentatives (connexion, inscription, réinitialisation) ----------
-- Compteurs partagés par toutes les instances du serveur (la limite en mémoire ne suffit pas sur Vercel).
-- Les clés sont des empreintes (adresse IP ou e-mail hachés côté serveur) : aucune donnée en clair.
create table if not exists public.rate_limits (
  key text primary key check (char_length(key) between 8 and 200),
  window_start timestamptz not null default now(),
  hits integer not null default 0 check (hits >= 0),
  blocked_until timestamptz
);
alter table public.rate_limits enable row level security;
-- Aucune politique : ni les visiteurs ni les utilisateurs connectés n'y accèdent ; seul le serveur (service_role).
revoke all on table public.rate_limits from anon, authenticated;

-- Compte une tentative (p_consume) ou consulte seulement l'état. Au-delà de p_max tentatives dans la
-- fenêtre, la clé est bloquée pendant p_block_seconds, doublé à chaque récidive (24 h au plus) :
-- blocage progressif, jamais définitif.
create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer, p_block_seconds integer, p_consume boolean default true)
returns table (ok boolean, retry_after integer, hits integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.rate_limits%rowtype;
  v_now timestamptz := now();
  v_block interval;
begin
  insert into public.rate_limits (key) values (p_key) on conflict (key) do nothing;
  select * into r from public.rate_limits where key = p_key for update;
  if r.blocked_until is not null and r.blocked_until > v_now then
    return query select false, ceil(extract(epoch from r.blocked_until - v_now))::integer, r.hits;
    return;
  end if;
  if r.window_start < v_now - make_interval(secs => p_window_seconds) then
    r.window_start := v_now;
    r.hits := 0;
  end if;
  if not p_consume then
    update public.rate_limits set window_start = r.window_start, hits = r.hits where key = p_key;
    return query select true, 0, r.hits;
    return;
  end if;
  r.hits := r.hits + 1;
  if r.hits > p_max then
    -- Durée doublée si la clé a déjà été bloquée récemment (récidive), plafonnée à 24 h.
    v_block := least(make_interval(secs => p_block_seconds) * case when r.blocked_until is not null and r.blocked_until > v_now - interval '1 day' then 2 else 1 end, interval '24 hours');
    update public.rate_limits set window_start = v_now, hits = 0, blocked_until = v_now + v_block where key = p_key;
    return query select false, ceil(extract(epoch from v_block))::integer, r.hits;
    return;
  end if;
  update public.rate_limits set window_start = r.window_start, hits = r.hits where key = p_key;
  return query select true, 0, r.hits;
end;
$$;
revoke all on function public.rate_limit_hit(text, integer, integer, integer, boolean) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer, integer, boolean) to service_role;

-- Après une connexion réussie : les échecs comptés pour ce compte sont effacés.
create or replace function public.rate_limit_reset(p_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limits where key = p_key;
$$;
revoke all on function public.rate_limit_reset(text) from public, anon, authenticated;
grant execute on function public.rate_limit_reset(text) to service_role;

-- ---------- 2. Rôles : suspension temporaire expirée = compte actif (comme is_active_user) ----------
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
      and (p.status = 'actif' or (p.status = 'suspendu' and p.suspended_until is not null and p.suspended_until <= now()))
  );
$$;
revoke execute on function public.has_role(public.app_role) from anon;

-- ---------- 3. Administration : second facteur (MFA) imposé par la base ----------
-- Un administrateur qui a activé un code de vérification (TOTP) n'a ses droits que si sa session
-- a été validée avec ce code (niveau « aal2 »). Sans facteur activé, rien ne change.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('administrateur') and (
    coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    or not exists (select 1 from auth.mfa_factors f where f.user_id = (select auth.uid()) and f.status = 'verified')
  );
$$;
revoke execute on function public.is_admin() from anon;

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
      and (p.status = 'actif' or (p.status = 'suspendu' and p.suspended_until is not null and p.suspended_until <= now()))
      and p_permission = any (ur.permissions)
  );
$$;
revoke execute on function public.can_teach(text) from anon;

-- ---------- 4. Stockage : types et tailles autorisés, imposés par Supabase ----------
update storage.buckets
   set file_size_limit = 20 * 1024 * 1024,
       allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'video/mp4',
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                  'application/vnd.openxmlformats-officedocument.presentationml.presentation']
 where id = 'ressources';
update storage.buckets
   set file_size_limit = 2 * 1024 * 1024,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
 where id = 'avatars';
