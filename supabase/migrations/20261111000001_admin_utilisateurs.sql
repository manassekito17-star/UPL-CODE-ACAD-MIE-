-- =====================================================================
-- Administration des utilisateurs : suspension temporaire et suivi d'activité.
-- Script idempotent (peut être relancé dans le SQL Editor sans risque).
-- =====================================================================

-- Fin de suspension : null = suspension sans limite de durée.
alter table public.profiles add column if not exists suspended_until timestamptz;

-- Un compte suspendu jusqu'à une date passée redevient actif automatiquement (mêmes règles côté site).
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and (status = 'actif' or (status = 'suspendu' and suspended_until is not null and suspended_until <= now()))
  );
$$;
revoke execute on function public.is_active_user() from anon;

-- Seul un administrateur modifie le statut, le motif, la fin de suspension et l'offre d'un compte.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.status is distinct from old.status
      or new.suspended_reason is distinct from old.suspended_reason
      or new.suspended_until is distinct from old.suspended_until)
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

-- Journal d'activité (administrateur uniquement) : d'un utilisateur (p_user) ou de toute la plateforme (null).
-- Activités réellement enregistrées : chapitres, quiz, exercices, exécutions, questions au professeur IA,
-- projets de UPL IDE et actions du compte (inscription, mot de passe).
create or replace function public.admin_user_activity(p_user uuid default null, p_limit integer default 100)
returns table (at timestamptz, user_id uuid, user_name text, kind text, label text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 500);
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administration.';
  end if;
  return query
    with ev as (
      (select lp.updated_at as at, lp.user_id as uid, 'chapitre'::text as kind,
              coalesce(l.title, 'Chapitre') || case when lp.status = 'termine' then ' — terminé' else ' — consulté' end as label
         from public.lesson_progress lp left join public.lessons l on l.id = lp.lesson_id
        where p_user is null or lp.user_id = p_user
        order by lp.updated_at desc limit v_limit)
      union all
      (select qa.created_at, qa.user_id, 'quiz', coalesce(q.title, 'Quiz') || ' — ' || round(qa.score)::text || ' %' || case when qa.passed then ' (réussi)' else '' end
         from public.quiz_attempts qa left join public.quizzes q on q.id = qa.quiz_id
        where p_user is null or qa.user_id = p_user
        order by qa.created_at desc limit v_limit)
      union all
      (select s.created_at, s.user_id, 'exercice', coalesce(e.title, 'Exercice') || ' — ' || coalesce(s.passed_count, 0)::text || '/' || coalesce(s.total_count, 0)::text || ' tests (' || s.status::text || ')'
         from public.submissions s left join public.exercises e on e.id = s.exercise_id
        where p_user is null or s.user_id = p_user
        order by s.created_at desc limit v_limit)
      union all
      (select x.created_at, x.user_id, 'execution', 'Programme ' || x.language_id::text || ' exécuté (' || x.status::text || ')'
         from public.execution_results x
        where x.user_id is not null and (p_user is null or x.user_id = p_user)
        order by x.created_at desc limit v_limit)
      union all
      (select m.created_at, m.user_id, 'ia', 'Question au professeur IA'
         from public.ai_messages m
        where m.role = 'user' and (p_user is null or m.user_id = p_user)
        order by m.created_at desc limit v_limit)
      union all
      (select p.updated_at, p.user_id, 'projet', 'Projet « ' || p.name || ' » (UPL IDE) — révision ' || p.revision::text
         from public.projects p
        where p_user is null or p.user_id = p_user
        order by p.updated_at desc limit v_limit)
      union all
      (select a.created_at, a.actor_id, 'compte', a.action
         from public.audit_logs a
        where a.actor_id is not null and a.action like 'compte.%' and (p_user is null or a.actor_id = p_user)
        order by a.created_at desc limit v_limit)
    )
    select ev.at, ev.uid, pr.full_name, ev.kind, ev.label
      from ev left join public.profiles pr on pr.id = ev.uid
     order by ev.at desc
     limit v_limit;
end;
$$;
revoke all on function public.admin_user_activity(uuid, integer) from public, anon;
grant execute on function public.admin_user_activity(uuid, integer) to authenticated;

-- Résumé chiffré d'un utilisateur (administrateur uniquement).
create or replace function public.admin_user_summary(p_user uuid)
returns table (chapters_done bigint, chapters_seen bigint, quizzes bigint, quizzes_passed bigint, submissions bigint, exercises_passed bigint, executions bigint, ai_questions bigint, projects bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administration.';
  end if;
  return query
    select
      (select count(*) from public.lesson_progress where user_id = p_user and status = 'termine'),
      (select count(*) from public.lesson_progress where user_id = p_user),
      (select count(*) from public.quiz_attempts where user_id = p_user),
      (select count(*) from public.quiz_attempts where user_id = p_user and passed),
      (select count(*) from public.submissions where user_id = p_user),
      (select count(distinct exercise_id) from public.submissions where user_id = p_user and status = 'reussi'),
      (select count(*) from public.execution_results where user_id = p_user),
      (select count(*) from public.ai_messages where user_id = p_user and role = 'user'),
      (select count(*) from public.projects where user_id = p_user);
end;
$$;
revoke all on function public.admin_user_summary(uuid) from public, anon;
grant execute on function public.admin_user_summary(uuid) to authenticated;
