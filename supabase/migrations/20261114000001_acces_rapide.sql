-- =====================================================================
-- Accès rapide sans mot de passe (connexion anonyme de Supabase Auth).
-- Chaque accès rapide crée un vrai utilisateur (identifiant interne unique,
-- session sécurisée renouvelable), toujours avec le rôle « etudiant ».
-- Le poste déclaré (Étudiant, Enseignant, Autre) est une simple information :
-- il ne donne AUCUN droit. Nom et prénom ne prouvent pas l'identité.
-- Script idempotent : il peut être relancé dans le SQL Editor sans risque.
-- =====================================================================

alter table public.profiles add column if not exists first_name text check (char_length(first_name) <= 60);
alter table public.profiles add column if not exists last_name text check (char_length(last_name) <= 60);
alter table public.profiles add column if not exists position text check (position in ('etudiant', 'enseignant', 'autre'));
alter table public.profiles add column if not exists sex text check (sex in ('masculin', 'feminin'));

-- Création du profil : nom et photo (Google ou formulaire), et champs de l'accès rapide
-- (validés ici : une valeur inattendue est ignorée). Le rôle est toujours « etudiant ».
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_avatar text := coalesce(m ->> 'avatar_url', m ->> 'picture');
  v_first text := nullif(left(btrim(coalesce(m ->> 'first_name', '')), 60), '');
  v_last text := nullif(left(btrim(coalesce(m ->> 'last_name', '')), 60), '');
  v_position text := case when m ->> 'position' in ('etudiant', 'enseignant', 'autre') then m ->> 'position' end;
  v_sex text := case when m ->> 'sex' in ('masculin', 'feminin') then m ->> 'sex' end;
  v_faculty text := nullif(left(btrim(coalesce(m ->> 'faculty', '')), 120), '');
begin
  insert into public.profiles (id, full_name, avatar_url, first_name, last_name, position, sex, faculty)
  values (
    new.id,
    left(coalesce(
      nullif(m ->> 'full_name', ''),
      nullif(m ->> 'name', ''),
      nullif(btrim(concat_ws(' ', v_first, v_last)), ''),
      ''
    ), 120),
    case when v_avatar ~ '^https://' then left(v_avatar, 500) else null end,
    v_first, v_last, v_position, v_sex, v_faculty
  );
  insert into public.user_roles (user_id, role) values (new.id, 'etudiant');
  return new;
end;
$$;
