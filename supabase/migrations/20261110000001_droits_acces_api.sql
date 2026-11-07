-- =====================================================================
-- Droits d'accès de l'API (PostgREST) aux objets du schéma public.
--
-- Les projets Supabase récents n'accordent plus automatiquement ces droits
-- aux rôles « anon », « authenticated » et « service_role » pour les tables
-- créées par SQL : sans eux, toute lecture échoue (« permission denied »,
-- code 42501). On déclare donc explicitement les droits habituels de
-- Supabase. La sécurité reste assurée par les politiques RLS, activées sur
-- toutes les tables, et par les restrictions de fonctions réappliquées
-- ci-dessous. Script idempotent : il peut être relancé sans risque.
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- Objets créés plus tard (migrations suivantes) : mêmes droits par défaut.
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

-- Restrictions voulues par les migrations précédentes (réappliquées après l'octroi global).
revoke execute on function public.has_role(public.app_role) from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.can_teach(text) from anon;
revoke execute on function public.is_staff() from anon;
revoke execute on function public.is_active_user() from anon;
revoke all on function public.consume_quota(text, uuid, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_quota(text, uuid, integer, integer, integer) to service_role;
revoke all on function public.platform_usage() from public, anon;
grant execute on function public.platform_usage() to authenticated, service_role;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
revoke all on function public.admin_daily_series(integer) from public, anon;
grant execute on function public.admin_daily_series(integer) to authenticated;
