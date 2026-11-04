-- =====================================================================
-- UPL CODE ACADEMY — Données de référence
-- =====================================================================

-- Identifiants Judge0 CE par défaut (modifiables depuis l'administration).
insert into public.languages (id, name, description, monaco_language, file_extension, judge0_language_id, sort_order) values
  ('pseudocode', 'Algorithmique', 'Pseudocode en français, exécuté par l''interpréteur de la plateforme.', 'pseudocode', 'algo', null, 1),
  ('python', 'Python', 'Langage polyvalent idéal pour débuter et pour la science des données.', 'python', 'py', 71, 2),
  ('c', 'Langage C', 'Langage système, compilé, proche de la machine.', 'c', 'c', 50, 3),
  ('javascript', 'JavaScript', 'Le langage du web, côté navigateur et serveur.', 'javascript', 'js', 63, 4),
  ('java', 'Java', 'Langage orienté objet, typé et portable.', 'java', 'java', 62, 5)
on conflict (id) do nothing;

insert into public.course_categories (slug, name, description, sort_order) values
  ('fondamentaux', 'Fondamentaux', 'Algorithmique et logique de programmation.', 1),
  ('programmation', 'Langages de programmation', 'Python, C, JavaScript et Java.', 2),
  ('web', 'Développement web', 'Pages, interactions et API.', 3)
on conflict (slug) do nothing;

insert into public.achievements (code, title, description, icon) values
  ('premier-programme', 'Premier programme', 'Exécuter son tout premier programme.', 'play'),
  ('premier-exercice', 'Premier exercice réussi', 'Réussir un premier exercice corrigé automatiquement.', 'check'),
  ('dix-exercices', 'Persévérant', 'Réussir 10 exercices.', 'flame'),
  ('premiere-lecon', 'Curieux', 'Terminer une première leçon.', 'book'),
  ('parcours-termine', 'Parcours terminé', 'Terminer toutes les leçons d''un parcours.', 'trophy'),
  ('quiz-parfait', 'Sans faute', 'Obtenir 100 % à un quiz.', 'star')
on conflict (code) do nothing;

insert into public.platform_settings (key, value, description) values
  ('ai', '{"enabled": true, "daily_messages_per_user": 40, "monthly_budget_usd": 50, "max_output_tokens": 2000, "effort": "medium"}',
   'Paramètres et limites de coût du professeur IA.'),
  ('execution', '{"enabled": true, "max_runs_per_minute": 20, "cpu_time_limit_s": 5, "memory_limit_kb": 128000}',
   'Limites d''exécution du code des étudiants.'),
  ('registration', '{"open": true, "allowed_email_domains": []}',
   'Inscriptions ouvertes et domaines e-mail autorisés (vide = tous).')
on conflict (key) do nothing;
