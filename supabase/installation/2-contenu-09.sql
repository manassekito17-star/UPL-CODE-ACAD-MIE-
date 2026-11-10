-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 9 sur 11.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-squelette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Accueil</title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>', 'Le squelette complet garantit le mode standard, la langue, l''encodage et un titre d''onglet.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-meta-viewport', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Page adaptée au téléphone', 'Complétez l''en-tête avec la **meta viewport** (content="width=device-width, initial-scale=1") et donnez à la page le titre « Horaires — Bibliothèque ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<meta name="viewport" content="width=device-width, initial-scale=1">']::text[], 5, false, 'publie', 51, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-meta-viewport');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'meta viewport avec width=device-width', '', '', false, 1, 0, '{"type":"attribute","selector":"head meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport avec width=device-width"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'Titre « Horaires — Bibliothèque »', '', '', false, 1, 1, '{"type":"text","selector":"title","equals":"Horaires — Bibliothèque","message":"Titre « Horaires — Bibliothèque »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'L''encodage utf-8 est conservé', '', '', true, 1, 2, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"L''encodage utf-8 est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-meta-viewport'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Horaires — Bibliothèque</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>

</body>
</html>', 'La meta viewport est indispensable pour un affichage correct sur téléphone.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-commentaire-titre', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Contenu au bon endroit', 'Le code de départ place le titre visible dans head. Corrigez-le : le **h1** « Club informatique » doit être dans **body**, et head ne doit contenir aucun h1.', 'debutant', 'corriger', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
  <h1>Club informatique</h1>
</head>
<body>
  <p>Réunion le vendredi.</p>
</body>
</html>', array['Déplacez la ligne du h1 juste après <body>.']::text[], 5, false, 'publie', 52, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-commentaire-titre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le h1 est dans body', '', '', false, 1, 0, '{"type":"text","selector":"body h1","equals":"Club informatique","message":"Le h1 est dans body"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'head ne contient pas de h1', '', '', false, 1, 1, '{"type":"element","selector":"head h1","min":0,"max":0,"message":"head ne contient pas de h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le paragraphe existant est conservé', '', '', true, 1, 2, '{"type":"text","selector":"body p","contains":"vendredi","message":"Le paragraphe existant est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-commentaire-titre'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
</head>
<body>
  <h1>Club informatique</h1>
  <p>Réunion le vendredi.</p>
</body>
</html>', 'head ne contient que des métadonnées. Le navigateur déplace parfois le h1 de lui-même, mais le code doit être correct.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-accueil', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Projet : page d''accueil d''un département', 'Créez la page d''accueil du département d''informatique : document complet en français, encodage utf-8, meta viewport, titre « Département d''informatique — UPL », un h1 et deux paragraphes.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Reprenez le squelette complet du cours.', 'Le titre de l''onglet et le h1 peuvent différer.']::text[], 15, false, 'publie', 53, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-accueil');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Langue française', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"Langue française"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Encodage utf-8', '', '', false, 1, 1, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"Encodage utf-8"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'meta viewport', '', '', false, 1, 2, '{"type":"attribute","selector":"meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Titre de l''onglet exact', '', '', false, 1, 3, '{"type":"text","selector":"title","equals":"Département d''informatique — UPL","message":"Titre de l''onglet exact"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Deux paragraphes', '', '', true, 1, 4, '{"type":"element","selector":"body p","min":2,"message":"Deux paragraphes"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Un seul h1', '', '', true, 1, 5, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-accueil'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Département d''informatique — UPL</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Département d''informatique</h1>
  <p>Formations en informatique et en intelligence artificielle.</p>
  <p>Secrétariat ouvert du lundi au vendredi.</p>
</body>
</html>', 'Toutes les métadonnées essentielles sont présentes : la page est prête à être publiée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-langages', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste de langages', 'Ajoutez un titre **h2** « Langages » suivi d''une **liste à puces** de trois éléments : Python, C et Java.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['ul pour une liste sans ordre, li pour chaque élément.']::text[], 5, false, 'publie', 54, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-langages');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Un h2 « Langages »', '', '', false, 1, 0, '{"type":"text","selector":"h2","equals":"Langages","message":"Un h2 « Langages »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Une liste ul de trois éléments', '', '', false, 1, 1, '{"type":"element","selector":"ul > li","min":3,"max":3,"message":"Une liste ul de trois éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Java fait partie de la liste', '', '', true, 1, 2, '{"type":"text","selector":"ul > li","equals":"Java","message":"Java fait partie de la liste"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-langages'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h2>Langages</h2>
  <ul>
    <li>Python</li>
    <li>C</li>
    <li>Java</li>
  </ul>
</body>
</html>', 'L''ordre des langages n''a pas d''importance : on choisit ul.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-recette', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Une recette structurée', 'Créez une page avec un **h1** « Fufu », un **h2** « Ingrédients » suivi d''une liste **ul** d''au moins 2 ingrédients, puis un **h2** « Étapes » suivi d''une liste **ol** d''au moins 3 étapes.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Les ingrédients n''ont pas d''ordre ; les étapes, si.', 'Respectez la hiérarchie h1 puis h2.']::text[], 10, false, 'publie', 55, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-recette');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Un h1 « Fufu »', '', '', false, 1, 0, '{"type":"text","selector":"h1","equals":"Fufu","message":"Un h1 « Fufu »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Deux sections h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Deux sections h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins deux ingrédients dans un ul', '', '', false, 1, 2, '{"type":"element","selector":"ul > li","min":2,"message":"Au moins deux ingrédients dans un ul"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins trois étapes dans un ol', '', '', false, 1, 3, '{"type":"element","selector":"ol > li","min":3,"message":"Au moins trois étapes dans un ol"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-recette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Fufu</h1>
  <h2>Ingrédients</h2>
  <ul>
    <li>Farine de manioc</li>
    <li>Eau</li>
  </ul>
  <h2>Étapes</h2>
  <ol>
    <li>Faire bouillir l''eau.</li>
    <li>Verser la farine progressivement.</li>
    <li>Remuer jusqu''à obtenir une pâte ferme.</li>
  </ol>
</body>
</html>', 'ul pour les ingrédients, ol pour les étapes : le choix exprime le sens du contenu.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-imbriquee', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste imbriquée', 'Créez une liste **ul** de deux éléments, « Web » et « Programmation ». L''élément « Web » contient une **sous-liste ul** avec « HTML » et « CSS ».', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['La sous-liste se place à l''intérieur du li « Web », avant sa balise fermante.']::text[], 10, false, 'publie', 56, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-imbriquee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'La liste principale a deux éléments', '', '', false, 1, 0, '{"type":"element","selector":"body > ul > li","min":2,"max":2,"message":"La liste principale a deux éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Une sous-liste de deux éléments dans un li', '', '', false, 1, 1, '{"type":"element","selector":"ul > li > ul > li","min":2,"message":"Une sous-liste de deux éléments dans un li"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Aucune liste directement dans un ul', '', '', true, 1, 2, '{"type":"element","selector":"ul > ul","min":0,"max":0,"message":"Aucune liste directement dans un ul"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-imbriquee'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <ul>
    <li>Web
      <ul>
        <li>HTML</li>
        <li>CSS</li>
      </ul>
    </li>
    <li>Programmation</li>
  </ul>
</body>
</html>', 'La sous-liste détaille l''élément « Web » : elle est donc à l''intérieur de son li.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-fiche-revision', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Projet : fiche de révision', 'Créez une fiche de révision sur un sujet de votre choix : un **h1**, au moins **deux h2**, au moins un **h3**, un paragraphe avec un mot en **strong**, une liste **ul** et une liste **ol**.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Construisez d''abord le plan avec les titres.', 'Pas de saut de niveau : un h3 se place sous un h2.']::text[], 15, false, 'publie', 57, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-fiche-revision');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un seul h1', '', '', false, 1, 0, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins deux h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Au moins deux h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins un h3', '', '', false, 1, 2, '{"type":"element","selector":"h3","min":1,"message":"Au moins un h3"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un mot important dans un paragraphe', '', '', false, 1, 3, '{"type":"element","selector":"p strong","message":"Un mot important dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste à puces', '', '', true, 1, 4, '{"type":"element","selector":"ul > li","min":1,"message":"Une liste à puces"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste numérotée', '', '', true, 1, 5, '{"type":"element","selector":"ol > li","min":1,"message":"Une liste numérotée"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Révision : les boucles</h1>
  <h2>Définition</h2>
  <p>Une boucle répète des instructions ; elle doit <strong>toujours</strong> se terminer.</p>
  <h2>Les types de boucles</h2>
  <h3>Boucles conditionnelles</h3>
  <ul>
    <li>TANT QUE</li>
    <li>RÉPÉTER</li>
  </ul>
  <h3>Méthode</h3>
  <ol>
    <li>Initialiser</li>
    <li>Tester</li>
    <li>Mettre à jour</li>
  </ol>
</body>
</html>', 'Le plan (h1, h2, h3) structure la fiche ; les listes choisies selon que l''ordre compte ou non.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-image-alt', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Image accessible', 'Insérez l''image **https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg** avec un texte alternatif contenant « HTML5 », une largeur de **120** et une hauteur de **120**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<img src="…" alt="…" width="120" height="120">', 'img n''a pas de balise fermante.']::text[], 5, false, 'publie', 58, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-image-alt');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'L''image a la bonne source', '', '', false, 1, 0, '{"type":"attribute","selector":"img","name":"src","contains":"HTML5_logo","message":"L''image a la bonne source"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Le texte alternatif mentionne HTML5', '', '', false, 1, 1, '{"type":"attribute","selector":"img","name":"alt","contains":"HTML5","message":"Le texte alternatif mentionne HTML5"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Largeur 120', '', '', false, 1, 2, '{"type":"attribute","selector":"img","name":"width","equals":"120","message":"Largeur 120"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Hauteur 120', '', '', true, 1, 3, '{"type":"attribute","selector":"img","name":"height","equals":"120","message":"Hauteur 120"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-image-alt'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5" width="120" height="120">
</body>
</html>', 'alt décrit l''image pour les lecteurs d''écran ; width et height réservent sa place.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-menu-navigation', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Menu de navigation', 'Créez un élément **nav** contenant trois liens : « Accueil » vers **index.html**, « Cours » vers **cours/index.html** et « MDN » vers **https://developer.mozilla.org/fr/**, ce dernier ouvert dans un nouvel onglet avec **rel="noopener"**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Trois éléments a dans nav.', 'target="_blank" rel="noopener" sur le lien externe.']::text[], 10, false, 'publie', 59, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-menu-navigation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Trois liens dans nav', '', '', false, 1, 0, '{"type":"element","selector":"nav a","min":3,"message":"Trois liens dans nav"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien relatif vers index.html', '', '', false, 1, 1, '{"type":"attribute","selector":"nav a[href=''index.html'']","name":"href","equals":"index.html","message":"Un lien relatif vers index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien vers cours/index.html', '', '', false, 1, 2, '{"type":"attribute","selector":"nav a[href=''cours/index.html'']","name":"href","equals":"cours/index.html","message":"Un lien vers cours/index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Le lien en nouvel onglet a rel="noopener"', '', '', false, 1, 3, '{"type":"attribute","selector":"nav a[target=''_blank'']","name":"rel","contains":"noopener","message":"Le lien en nouvel onglet a rel=\"noopener\""}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-menu-navigation'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <nav>
    <a href="index.html">Accueil</a>
    <a href="cours/index.html">Cours</a>
    <a href="https://developer.mozilla.org/fr/" target="_blank" rel="noopener">MDN</a>
  </nav>
</body>
</html>', 'Liens relatifs à l''intérieur du site, URL absolue pour le site externe, protégée par rel="noopener".')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-ancre-section', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Lien vers une section', 'Créez un lien « Voir les horaires » qui mène à un titre **h2** « Horaires » de la même page, identifié par **id="horaires"**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['href="#horaires" sur le lien, id="horaires" sur le h2.']::text[], 5, false, 'publie', 60, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-ancre-section');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Le lien pointe vers #horaires', '', '', false, 1, 0, '{"type":"attribute","selector":"a","name":"href","equals":"#horaires","message":"Le lien pointe vers #horaires"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Un h2 « Horaires » avec id="horaires"', '', '', false, 1, 1, '{"type":"text","selector":"h2#horaires","equals":"Horaires","message":"Un h2 « Horaires » avec id=\"horaires\""}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Texte du lien exact', '', '', true, 1, 2, '{"type":"text","selector":"a[href=''#horaires'']","equals":"Voir les horaires","message":"Texte du lien exact"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-ancre-section'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <p><a href="#horaires">Voir les horaires</a></p>
  <h2 id="horaires">Horaires</h2>
  <p>De 8 h à 16 h.</p>
</body>
</html>', 'Le dièse dans href désigne l''identifiant d''un élément de la page.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-club', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Projet : page du club informatique', 'Créez la page de présentation du club informatique : document complet en français avec titre d''onglet, un **nav** d''au moins deux liens, un **h1**, un paragraphe de présentation, une liste **ul** d''activités (au moins 3), une **image avec alt non vide**, et un lien **mailto:** pour écrire au club.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Commencez par le squelette, puis ajoutez les éléments un à un en surveillant l''aperçu.', 'Le lien de contact commence par mailto:.']::text[], 25, true, 'publie', 61, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-club');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Document en français', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"Document en français"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un titre d''onglet', '', '', false, 1, 1, '{"type":"element","selector":"head title","message":"Un titre d''onglet"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un menu d''au moins deux liens', '', '', false, 1, 2, '{"type":"element","selector":"nav a","min":2,"message":"Un menu d''au moins deux liens"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un seul h1', '', '', false, 1, 3, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Au moins trois activités', '', '', false, 1, 4, '{"type":"element","selector":"ul > li","min":3,"message":"Au moins trois activités"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Une image avec un texte alternatif non vide', '', '', true, 1, 5, '{"type":"attribute","selector":"img[alt]:not([alt=''''])","name":"alt","message":"Une image avec un texte alternatif non vide"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un lien mailto: de contact', '', '', true, 1, 6, '{"type":"attribute","selector":"a[href^=''mailto:'']","name":"href","contains":"@","message":"Un lien mailto: de contact"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-club'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club informatique — UPL</title>
</head>
<body>
  <nav>
    <a href="index.html">Accueil</a>
    <a href="#activites">Activités</a>
  </nav>
  <h1>Club informatique de l''UPL</h1>
  <p>Le club réunit les étudiants passionnés de programmation.</p>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5, langage étudié au club" width="100" height="100">
  <h2 id="activites">Activités</h2>
  <ul>
    <li>Ateliers de code</li>
    <li>Concours d''algorithmique</li>
    <li>Conférences</li>
  </ul>
  <p><a href="mailto:club@exemple.cd">Écrire au club</a></p>
</body>
</html>', 'La page réunit toutes les notions du niveau : structure, titres, listes, liens et images accessibles.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-titre-couleur', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Colorer le titre', 'Dans **style.css**, donnez au **h1** la couleur **navy** et centrez-le (**text-align: center**).', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Sélecteur de type : h1 { … }', 'Deux déclarations, chacune terminée par un point-virgule.']::text[], 5, false, 'publie', 62, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-titre-couleur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 { color: navy }', '', '', false, 1, 0, '{"type":"css","selector":"h1","property":"color","equals":"navy","message":"h1 { color: navy }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 { text-align: center }', '', '', false, 1, 1, '{"type":"css","selector":"h1","property":"text-align","equals":"center","message":"h1 { text-align: center }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 {
  color: navy;
  text-align: center;
}', 'Une règle, un sélecteur de type, deux déclarations.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-classe-alerte', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Une classe d''alerte', 'Les éléments de classe **alerte** doivent être rouges (**color: red**) et en gras (**font-weight: bold**).', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Le sélecteur de classe commence par un point : .alerte']::text[], 5, false, 'publie', 63, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-classe-alerte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte { color: red }', '', '', false, 1, 0, '{"type":"css","selector":".alerte","property":"color","oneOf":["red","#ff0000","#f00"],"message":".alerte { color: red }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte { font-weight: bold }', '', '', false, 1, 1, '{"type":"css","selector":".alerte","property":"font-weight","oneOf":["bold","700"],"message":".alerte { font-weight: bold }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte {
  color: red;
  font-weight: bold;
}', 'Sans le point, « alerte » chercherait un élément HTML nommé alerte.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-menu-liens', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Les liens du menu', 'Seuls les liens **situés dans nav** doivent être verts (**color: green**). Utilisez un sélecteur **descendant**. Donnez aussi à tout le **body** la police **Arial, sans-serif**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['nav a { … }', 'body { font-family: Arial, sans-serif; }']::text[], 10, false, 'publie', 64, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-menu-liens');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-menu-liens'), 'nav a { color: green }', '', '', false, 1, 0, '{"type":"css","selector":"nav a","property":"color","oneOf":["green","#008000"],"message":"nav a { color: green }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-menu-liens'), 'body { font-family: Arial, sans-serif }', '', '', false, 1, 1, '{"type":"css","selector":"body","property":"font-family","equals":"arial,sans-serif","message":"body { font-family: Arial, sans-serif }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-menu-liens'), 'body {
  font-family: Arial, sans-serif;
}

nav a {
  color: green;
}', 'L''espace dans « nav a » signifie « a situé dans nav ». La police définie sur body est héritée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-projet-annonce', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Projet : habiller la page d''annonces', 'Habillez la page : police **Arial, sans-serif** sur body ; h1 de couleur **#1d5fe0** ; liens du nav **sans soulignement** (text-decoration: none) ; classe **alerte** en **red**.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Quatre règles : body, h1, nav a, .alerte.']::text[], 15, false, 'publie', 65, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-projet-annonce');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-annonce'), 'Police du body', '', '', false, 1, 0, '{"type":"css","selector":"body","property":"font-family","equals":"arial,sans-serif","message":"Police du body"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-annonce'), 'Couleur du h1', '', '', false, 1, 1, '{"type":"css","selector":"h1","property":"color","equals":"#1d5fe0","message":"Couleur du h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-annonce'), 'Liens du menu sans soulignement', '', '', false, 1, 2, '{"type":"css","selector":"nav a","property":"text-decoration","equals":"none","message":"Liens du menu sans soulignement"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-annonce'), 'Alerte en rouge', '', '', true, 1, 3, '{"type":"css","selector":".alerte","property":"color","oneOf":["red","#ff0000","#f00"],"message":"Alerte en rouge"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-projet-annonce'), 'body { font-family: Arial, sans-serif; }
h1 { color: #1d5fe0; }
nav a { text-decoration: none; }
.alerte { color: red; }', 'Chaque règle cible précisément un groupe d''éléments : type, descendant ou classe.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-typographie-body', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css', 'Typographie de base', 'Sur **body** : police **Georgia, serif**, taille **1.125rem**, hauteur de ligne **1.6**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['font-family, font-size, line-height.']::text[], 5, false, 'publie', 66, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Rentrée académique</h1>\n  <p class=\"chapeau\">Les cours reprennent lundi.</p>\n  <p>Consultez votre emploi du temps. <a href=\"#\">Calendrier</a></p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-typographie-body');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-typographie-body'), 'Police Georgia, serif', '', '', false, 1, 0, '{"type":"css","selector":"body","property":"font-family","equals":"georgia,serif","message":"Police Georgia, serif"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-typographie-body'), 'Taille 1.125rem', '', '', false, 1, 1, '{"type":"css","selector":"body","property":"font-size","equals":"1.125rem","message":"Taille 1.125rem"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-typographie-body'), 'Hauteur de ligne 1.6', '', '', false, 1, 2, '{"type":"css","selector":"body","property":"line-height","equals":"1.6","message":"Hauteur de ligne 1.6"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-typographie-body'), 'body {
  font-family: Georgia, serif;
  font-size: 1.125rem;
  line-height: 1.6;
}', 'La famille générique serif termine la liste ; rem suit le réglage de l''utilisateur.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-bandeau-couleurs', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css', 'Un titre en bandeau', 'Le **h1** doit avoir un fond **#0a1a3a**, un texte **white**, être en **majuscules** (text-transform) et centré.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['background-color, color, text-transform, text-align.']::text[], 10, false, 'publie', 67, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Rentrée académique</h1>\n  <p class=\"chapeau\">Les cours reprennent lundi.</p>\n  <p>Consultez votre emploi du temps. <a href=\"#\">Calendrier</a></p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-bandeau-couleurs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-bandeau-couleurs'), 'Fond #0a1a3a', '', '', false, 1, 0, '{"type":"css","selector":"h1","property":"background-color","equals":"#0a1a3a","message":"Fond #0a1a3a"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-bandeau-couleurs'), 'Texte blanc', '', '', false, 1, 1, '{"type":"css","selector":"h1","property":"color","oneOf":["white","#fff","#ffffff"],"message":"Texte blanc"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-bandeau-couleurs'), 'Majuscules', '', '', false, 1, 2, '{"type":"css","selector":"h1","property":"text-transform","equals":"uppercase","message":"Majuscules"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-bandeau-couleurs'), 'Centré', '', '', true, 1, 3, '{"type":"css","selector":"h1","property":"text-align","equals":"center","message":"Centré"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-bandeau-couleurs'), 'h1 {
  background-color: #0a1a3a;
  color: white;
  text-transform: uppercase;
  text-align: center;
}', 'Blanc sur bleu nuit offre un contraste très élevé.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-liens-etats', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css', 'États d''un lien', 'Les liens sont **#1d5fe0** et **sans soulignement** ; au **survol** (:hover) ils sont **soulignés** ; au **focus** (:focus) ils ont un contour **2px solid orange**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Trois règles : a, a:hover, a:focus.', 'outline: 2px solid orange;']::text[], 10, false, 'publie', 68, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Rentrée académique</h1>\n  <p class=\"chapeau\">Les cours reprennent lundi.</p>\n  <p>Consultez votre emploi du temps. <a href=\"#\">Calendrier</a></p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-liens-etats');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-liens-etats'), 'Couleur des liens', '', '', false, 1, 0, '{"type":"css","selector":"a","property":"color","equals":"#1d5fe0","message":"Couleur des liens"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-liens-etats'), 'Liens sans soulignement', '', '', false, 1, 1, '{"type":"css","selector":"a","property":"text-decoration","equals":"none","message":"Liens sans soulignement"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-liens-etats'), 'Soulignés au survol', '', '', false, 1, 2, '{"type":"css","selector":"a:hover","property":"text-decoration","equals":"underline","message":"Soulignés au survol"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-liens-etats'), 'Contour visible au focus', '', '', false, 1, 3, '{"type":"css","selector":"a:focus","property":"outline","equals":"2px solid orange","message":"Contour visible au focus"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-liens-etats'), 'a {
  color: #1d5fe0;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:focus {
  outline: 2px solid orange;
}', 'Le contour au focus garantit la navigation au clavier : ne le supprimez jamais sans le remplacer.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-projet-article', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css', 'Projet : mise en forme d''un article', 'Mettez en forme l''article : body en **Arial, sans-serif**, couleur **#1f2937**, hauteur de ligne **1.5** ; h1 en **2rem** et **#1d5fe0** ; classe **chapeau** en **italic** ; liens soulignés au **:hover**.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Quatre règles : body, h1, .chapeau, a:hover.']::text[], 15, false, 'publie', 69, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Rentrée académique</h1>\n  <p class=\"chapeau\">Les cours reprennent lundi.</p>\n  <p>Consultez votre emploi du temps. <a href=\"#\">Calendrier</a></p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-projet-article');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Police du body', '', '', false, 1, 0, '{"type":"css","selector":"body","property":"font-family","equals":"arial,sans-serif","message":"Police du body"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Couleur du texte', '', '', false, 1, 1, '{"type":"css","selector":"body","property":"color","equals":"#1f2937","message":"Couleur du texte"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Hauteur de ligne', '', '', false, 1, 2, '{"type":"css","selector":"body","property":"line-height","equals":"1.5","message":"Hauteur de ligne"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Taille du h1', '', '', false, 1, 3, '{"type":"css","selector":"h1","property":"font-size","equals":"2rem","message":"Taille du h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Chapeau en italique', '', '', true, 1, 4, '{"type":"css","selector":".chapeau","property":"font-style","equals":"italic","message":"Chapeau en italique"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-article'), 'Liens soulignés au survol', '', '', true, 1, 5, '{"type":"css","selector":"a:hover","property":"text-decoration","equals":"underline","message":"Liens soulignés au survol"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-projet-article'), 'body {
  font-family: Arial, sans-serif;
  color: #1f2937;
  line-height: 1.5;
}

h1 {
  font-size: 2rem;
  color: #1d5fe0;
}

.chapeau {
  font-style: italic;
}

a:hover {
  text-decoration: underline;
}', 'La typographie de base sur body est héritée ; les règles suivantes ne précisent que ce qui change.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-carte-boite', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css', 'Une carte aérée', 'La classe **carte** reçoit un padding de **16px**, une bordure **1px solid #dfe5ee** et des coins arrondis de **8px**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['padding, border, border-radius.']::text[], 5, false, 'publie', 70, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Amani Kasongo</h2>\n    <p>Filière : Informatique</p>\n  </div>\n  <ul class=\"liste\">\n    <li>Python</li>\n    <li>HTML</li>\n  </ul>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-carte-boite');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-carte-boite'), 'padding: 16px', '', '', false, 1, 0, '{"type":"css","selector":".carte","property":"padding","equals":"16px","message":"padding: 16px"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-carte-boite'), 'border: 1px solid #dfe5ee', '', '', false, 1, 1, '{"type":"css","selector":".carte","property":"border","equals":"1px solid #dfe5ee","message":"border: 1px solid #dfe5ee"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-carte-boite'), 'border-radius: 8px', '', '', false, 1, 2, '{"type":"css","selector":".carte","property":"border-radius","equals":"8px","message":"border-radius: 8px"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-carte-boite'), '.carte {
  padding: 16px;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
}', 'Le padding éloigne le texte de la bordure ; border-radius arrondit les coins.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-conteneur-centre', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css', 'Centrer la carte', 'Appliquez **box-sizing: border-box** à tous les éléments (sélecteur **\***), puis centrez la classe **carte** : largeur maximale **360px**, marges **0 auto**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['* { box-sizing: border-box; }', '.carte { max-width: 360px; margin: 0 auto; }']::text[], 10, false, 'publie', 71, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Amani Kasongo</h2>\n    <p>Filière : Informatique</p>\n  </div>\n  <ul class=\"liste\">\n    <li>Python</li>\n    <li>HTML</li>\n  </ul>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-conteneur-centre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-conteneur-centre'), '* { box-sizing: border-box }', '', '', false, 1, 0, '{"type":"css","selector":"*","property":"box-sizing","equals":"border-box","message":"* { box-sizing: border-box }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-conteneur-centre'), 'max-width: 360px', '', '', false, 1, 1, '{"type":"css","selector":".carte","property":"max-width","equals":"360px","message":"max-width: 360px"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-conteneur-centre'), 'margin: 0 auto', '', '', false, 1, 2, '{"type":"css","selector":".carte","property":"margin","equals":"0 auto","message":"margin: 0 auto"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-conteneur-centre'), '* {
  box-sizing: border-box;
}

.carte {
  max-width: 360px;
  margin: 0 auto;
}', 'Les marges latérales automatiques se partagent l''espace restant : le bloc est centré.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-espacements-liste', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css', 'Espacer une liste', 'Les éléments **li** de la liste de classe **liste** (sélecteur **.liste li**) ont une marge basse de **8px** (margin-bottom) et un padding de **8px 12px** ; la liste elle-même (**.liste**) a un fond **#eef2f7**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['.liste li { … } et .liste { … }']::text[], 10, false, 'publie', 72, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Amani Kasongo</h2>\n    <p>Filière : Informatique</p>\n  </div>\n  <ul class=\"liste\">\n    <li>Python</li>\n    <li>HTML</li>\n  </ul>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-espacements-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-espacements-liste'), '.liste li { margin-bottom: 8px }', '', '', false, 1, 0, '{"type":"css","selector":".liste li","property":"margin-bottom","equals":"8px","message":".liste li { margin-bottom: 8px }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-espacements-liste'), '.liste li { padding: 8px 12px }', '', '', false, 1, 1, '{"type":"css","selector":".liste li","property":"padding","equals":"8px 12px","message":".liste li { padding: 8px 12px }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-espacements-liste'), '.liste { background-color: #eef2f7 }', '', '', false, 1, 2, '{"type":"css","selector":".liste","property":"background-color","equals":"#eef2f7","message":".liste { background-color: #eef2f7 }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-espacements-liste'), '.liste {
  background-color: #eef2f7;
}

.liste li {
  margin-bottom: 8px;
  padding: 8px 12px;
}', '« .liste li » cible les li situés dans un élément de classe liste. padding avec deux valeurs : vertical puis horizontal.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-projet-profil', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css', 'Projet : carte de profil étudiant', 'Mettez en forme la carte de profil : **box-sizing: border-box** pour tous ; **.carte** avec max-width **400px**, margin **24px auto**, padding **20px**, fond **white**, bordure arrondie de **12px** ; body avec un fond **#eef2f7** ; titre **.carte h2** de couleur **#1d5fe0**.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Quatre règles : *, body, .carte, .carte h2.']::text[], 25, true, 'publie', 73, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Amani Kasongo</h2>\n    <p>Filière : Informatique</p>\n  </div>\n  <ul class=\"liste\">\n    <li>Python</li>\n    <li>HTML</li>\n  </ul>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-projet-profil');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'box-sizing global', '', '', false, 1, 0, '{"type":"css","selector":"*","property":"box-sizing","equals":"border-box","message":"box-sizing global"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Largeur maximale', '', '', false, 1, 1, '{"type":"css","selector":".carte","property":"max-width","equals":"400px","message":"Largeur maximale"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Carte centrée', '', '', false, 1, 2, '{"type":"css","selector":".carte","property":"margin","equals":"24px auto","message":"Carte centrée"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Padding', '', '', false, 1, 3, '{"type":"css","selector":".carte","property":"padding","equals":"20px","message":"Padding"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Coins arrondis', '', '', true, 1, 4, '{"type":"css","selector":".carte","property":"border-radius","equals":"12px","message":"Coins arrondis"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Fond de page', '', '', true, 1, 5, '{"type":"css","selector":"body","property":"background-color","equals":"#eef2f7","message":"Fond de page"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-projet-profil'), 'Couleur du titre', '', '', true, 1, 6, '{"type":"css","selector":".carte h2","property":"color","equals":"#1d5fe0","message":"Couleur du titre"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-projet-profil'), '* {
  box-sizing: border-box;
}

body {
  background-color: #eef2f7;
}

.carte {
  max-width: 400px;
  margin: 24px auto;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
}

.carte h2 {
  color: #1d5fe0;
}', 'Le projet combine sélecteurs, couleurs et modèle de boîte : c''est le socle de toute mise en page.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-bonjour', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'syntaxe-fondamentale'), 'python', 'Bonjour en Python', 'Lisez un prénom et affichez :

~~~text
Bonjour <prénom>, bienvenue en Python !
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Amani","output":"Bonjour Amani, bienvenue en Python !"}]'::jsonb, '{}'::text[], 'prenom = input()
# Affichez le message', array['Utilisez print avec une f-string.', 'print(f"Bonjour {prenom}, …")']::text[], 5, false, 'publie', 74, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-bonjour'), null, 'Amani', 'Bonjour Amani, bienvenue en Python !', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-bonjour'), null, 'Grâce', 'Bonjour Grâce, bienvenue en Python !', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-bonjour'), 'prenom = input()
print(f"Bonjour {prenom}, bienvenue en Python !")', 'Une f-string insère la valeur de la variable entre accolades. Attention à la virgule et à l''espace avant le point d''exclamation.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-somme', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'variables-types'), 'python', 'Somme et produit', 'Lisez deux entiers (un par ligne) et affichez leur somme puis leur produit :

~~~text
Somme : <a + b>
Produit : <a * b>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4\n5","output":"Somme : 9\nProduit : 20"}]'::jsonb, '{}'::text[], '', array['input() renvoie une chaîne : convertissez avec int().', 'Sans conversion, "4" + "5" donne "45" !']::text[], 5, false, 'publie', 75, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-somme'), null, '4
5', 'Somme : 9
Produit : 20', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-somme'), null, '-3
7', 'Somme : 4
Produit : -21', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-somme'), null, '0
123', 'Somme : 123
Produit : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-somme'), 'a = int(input())
b = int(input())
print("Somme :", a + b)
print("Produit :", a * b)', 'L''erreur classique est d''oublier **int()** : les chaînes seraient concaténées au lieu d''être additionnées. print sépare ses arguments par un espace.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-conversion-temps', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'operateurs'), 'python', 'Conversion de secondes', 'Lisez un nombre de secondes et affichez-le au format **HH:MM:SS** (avec deux chiffres pour chaque partie).', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3725","output":"01:02:05"}]'::jsonb, '{}'::text[], '', array['// donne le quotient, % le reste.', 'f"{h:02d}" affiche un entier sur deux chiffres.']::text[], 10, false, 'publie', 76, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-conversion-temps');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '3725', '01:02:05', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '59', '00:00:59', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '86399', '23:59:59', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-conversion-temps'), 'total = int(input())
h = total // 3600
m = total % 3600 // 60
s = total % 60
print(f"{h:02d}:{m:02d}:{s:02d}")', 'Le format **:02d** complète avec un zéro à gauche pour obtenir deux chiffres.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-pair-impair', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'python', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"10","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 vaut 0 pour un nombre pair.']::text[], 5, false, 'publie', 77, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-pair-impair');
commit;
