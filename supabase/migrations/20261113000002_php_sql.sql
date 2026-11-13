-- =====================================================================
-- Parcours PHP et SQL.
-- Le code PHP et SQL des étudiants n'est JAMAIS exécuté sur le serveur :
-- PHP 8.3 (php-wasm) et SQLite (sql.js) tournent en WebAssembly dans un
-- Web Worker isolé du navigateur de chaque étudiant (judge0_language_id nul).
-- Script idempotent : il peut être relancé dans le SQL Editor sans risque.
-- =====================================================================
insert into public.languages (id, name, description, monaco_language, file_extension, judge0_language_id, sort_order) values
  ('php', 'PHP', 'Langage serveur du web : pages dynamiques, formulaires, sessions, bases de données (PHP 8.3 exécuté dans le navigateur).', 'php', 'php', null, 8),
  ('sql', 'SQL', 'Langage des bases de données relationnelles (exécuté par SQLite dans le navigateur).', 'sql', 'sql', null, 9)
on conflict (id) do nothing;

insert into public.course_categories (slug, name, description, sort_order) values
  ('donnees', 'Bases de données', 'Conception et interrogation des bases de données relationnelles avec SQL.', 4)
on conflict (slug) do nothing;
