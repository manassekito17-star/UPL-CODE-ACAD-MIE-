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
