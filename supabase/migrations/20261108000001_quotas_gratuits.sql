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
