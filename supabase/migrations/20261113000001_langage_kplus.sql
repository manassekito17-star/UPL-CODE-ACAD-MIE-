-- =====================================================================
-- Langage K+ (programmation en français) — https://github.com/manassekito17-star/K-
-- Exécuté par son propre moteur (Python) : dans le navigateur, ou sur
-- Judge0 avec l'identifiant de Python (le moteur est joint au programme).
-- =====================================================================
insert into public.languages (id, name, description, monaco_language, file_extension, judge0_language_id, sort_order) values
  ('kplus', 'K+', 'Langage de programmation en français : bases de la programmation et sites web dynamiques (K+ Web).', 'kplus', 'kplus', 71, 8)
on conflict (id) do nothing;
