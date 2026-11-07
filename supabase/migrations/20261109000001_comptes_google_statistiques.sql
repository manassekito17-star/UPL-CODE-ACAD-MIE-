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
