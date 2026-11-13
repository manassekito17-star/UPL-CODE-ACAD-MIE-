-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 12 sur 14.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pair-impair'), null, '10', 'pair', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pair-impair'), null, '7', 'impair', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pair-impair'), null, '-3', 'impair', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pair-impair'), null, '0', 'pair', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-pair-impair'), 'n = int(input())
if n % 2 == 0:
    print("pair")
else:
    print("impair")', 'On teste le reste de la division par 2 avec l''opérateur **%** et la comparaison **==** (deux signes égal).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-mention', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'python', 'Mention', 'Lisez une note (réel) et affichez **Note invalide** (hors de 0–20), **Très bien** (≥ 16), **Bien** (≥ 14), **Passable** (≥ 10) ou **Ajourné**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"14.5","output":"Bien"}]'::jsonb, '{}'::text[], '', array['Utilisez if / elif / else.', 'Python permet d''écrire 0 <= note <= 20.']::text[], 10, false, 'publie', 78, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-mention'), null, '14.5', 'Bien', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-mention'), null, '20', 'Très bien', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-mention'), null, '9.99', 'Ajourné', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-mention'), null, '-1', 'Note invalide', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-mention'), null, '10', 'Passable', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-mention'), 'note = float(input())
if not 0 <= note <= 20:
    print("Note invalide")
elif note >= 16:
    print("Très bien")
elif note >= 14:
    print("Bien")
elif note >= 10:
    print("Passable")
else:
    print("Ajourné")', 'On traite d''abord le cas invalide, puis les mentions de la plus haute à la plus basse.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-table', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'python', 'Table de multiplication', 'Lisez un entier n et affichez sa table de 1 à 10 au format **n x i = résultat**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n…\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['range(1, 11) produit les nombres de 1 à 10.']::text[], 10, false, 'publie', 79, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-table'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-table'), null, '9', '9 x 1 = 9
9 x 2 = 18
9 x 3 = 27
9 x 4 = 36
9 x 5 = 45
9 x 6 = 54
9 x 7 = 63
9 x 8 = 72
9 x 9 = 81
9 x 10 = 90', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-table'), 'n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")', 'range(1, 11) s''arrête **avant** 11 : la boucle s''exécute pour i = 1 à 10.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-factorielle', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'python', 'Factorielle', 'Lisez un entier n ≥ 0 et affichez n!. Python gère les grands entiers : testez avec n = 30 !', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"5","output":"120"}]'::jsonb, '{}'::text[], '', array['Initialisez le produit à 1.', 'for i in range(2, n + 1): …']::text[], 10, false, 'publie', 80, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-factorielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-factorielle'), null, '5', '120', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-factorielle'), null, '0', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-factorielle'), null, '30', '265252859812191058636308480000000', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-factorielle'), 'n = int(input())
f = 1
for i in range(2, n + 1):
    f *= i
print(f)', 'Les entiers Python ont une précision illimitée, contrairement au C ou au Java où l''on aurait un dépassement de capacité pour 30!.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-maximum-liste', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'python', 'Maximum sans max()', 'Lisez une ligne d''entiers séparés par des espaces et affichez le plus grand **sans utiliser max()** ni **sorted()**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"4 9 -2 7","output":"9"}]'::jsonb, array['Interdiction d''utiliser max(), sorted() ou sort().']::text[], '', array['valeurs = list(map(int, input().split()))', 'Initialisez le maximum avec le premier élément, pas avec 0.']::text[], 10, false, 'publie', 81, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-maximum-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '4 9 -2 7', '9', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '-5 -1 -8', '-1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '42', '42', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-maximum-liste'), 'valeurs = list(map(int, input().split()))
plus_grand = valeurs[0]
for v in valeurs[1:]:
    if v > plus_grand:
        plus_grand = v
print(plus_grand)', 'Initialiser à 0 serait faux pour une liste de nombres tous négatifs : on part du premier élément.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-inverser-liste', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'python', 'Inverser une liste', 'Lisez une ligne de mots séparés par des espaces et affichez-les dans l''ordre inverse, séparés par un espace.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"le code est beau","output":"beau est code le"}]'::jsonb, '{}'::text[], '', array['input().split() découpe la ligne en liste.', 'Une tranche avec un pas négatif [::-1] inverse une liste.', '" ".join(liste) recolle les mots.']::text[], 10, false, 'publie', 82, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-inverser-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'le code est beau', 'beau est code le', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'UPL', 'UPL', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'a b c d e', 'e d c b a', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-inverser-liste'), 'mots = input().split()
print(" ".join(mots[::-1]))', '**[::-1]** parcourt la liste avec un pas de -1 ; **join** assemble les éléments avec le séparateur choisi.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-frequences', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'dictionnaires-ensembles'), 'python', 'Fréquence des lettres', 'Lisez un mot (en minuscules) et affichez chaque lettre distincte avec son nombre d''occurrences, **dans l''ordre alphabétique**, au format **lettre:nombre**, une par ligne.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"banane","output":"a:2\nb:1\ne:1\nn:2"}]'::jsonb, '{}'::text[], '', array['Un dictionnaire associe chaque lettre à un compteur.', 'compte[c] = compte.get(c, 0) + 1', 'sorted(compte) donne les clés triées.']::text[], 10, false, 'publie', 83, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-frequences');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-frequences'), null, 'banane', 'a:2
b:1
e:1
n:2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-frequences'), null, 'aaa', 'a:3', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-frequences'), null, 'programmation', 'a:2
g:1
i:1
m:2
n:1
o:2
p:1
r:2
t:1', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-frequences'), 'mot = input().strip()
compte = {}
for c in mot:
    compte[c] = compte.get(c, 0) + 1
for c in sorted(compte):
    print(f"{c}:{compte[c]}")', 'Le dictionnaire évite d''écrire 26 compteurs. **get(c, 0)** renvoie 0 pour une lettre pas encore rencontrée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-fonction-premier', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'python', 'Fonction est_premier', 'Écrivez une fonction **est_premier(n)** qui retourne True si n est premier. Le programme lit un entier n et affiche le nombre de nombres premiers inférieurs ou égaux à n.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"20","output":"8"}]'::jsonb, '{}'::text[], 'def est_premier(n):
    # À compléter
    pass

n = int(input())
print(sum(1 for k in range(2, n + 1) if est_premier(k)))', array['0 et 1 ne sont pas premiers.', 'Testez les diviseurs d tant que d * d <= n.']::text[], 10, false, 'publie', 84, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-fonction-premier');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '20', '8', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '1', '0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '1000', '168', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-fonction-premier'), 'def est_premier(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

n = int(input())
print(sum(1 for k in range(2, n + 1) if est_premier(k)))', 'On s''arrête à la racine carrée de n : si n avait un diviseur plus grand, il en aurait forcément un plus petit.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-pgcd', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'python', 'PGCD d''Euclide (récursif)', 'Écrivez une fonction **récursive pgcd(a, b)** utilisant l''algorithme d''Euclide : pgcd(a, 0) = a et pgcd(a, b) = pgcd(b, a % b). Lisez deux entiers positifs et affichez leur PGCD.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"48\n18","output":"6"}]'::jsonb, array['Ne pas utiliser math.gcd.']::text[], '', array['Cas de base : b == 0.', 'Cas récursif : return pgcd(b, a % b).']::text[], 10, true, 'publie', 85, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-pgcd');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pgcd'), null, '48
18', '6', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pgcd'), null, '17
5', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-pgcd'), null, '1071
462', '21', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-pgcd'), 'def pgcd(a, b):
    if b == 0:
        return a
    return pgcd(b, a % b)

a = int(input())
b = int(input())
print(pgcd(a, b))', 'À chaque appel, le second argument diminue strictement (a % b < b) : on atteint forcément le cas de base b = 0.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-division-securisee', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'exceptions'), 'python', 'Division sécurisée', 'Lisez deux valeurs a et b (une par ligne) et affichez a / b arrondi à 2 décimales. Gérez les erreurs :

- si une valeur n''est pas un nombre : **Erreur : valeur invalide**
- si b vaut 0 : **Erreur : division par zéro**', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"7\n2","output":"3.5"}]'::jsonb, '{}'::text[], '', array['float() lève ValueError si la conversion échoue.', 'Utilisez plusieurs blocs except.', 'round(x, 2) arrondit.']::text[], 10, false, 'publie', 86, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-division-securisee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-division-securisee'), null, '7
2', '3.5', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-division-securisee'), null, '1
0', 'Erreur : division par zéro', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-division-securisee'), null, 'abc
2', 'Erreur : valeur invalide', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-division-securisee'), null, '10
3', '3.33', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-division-securisee'), 'try:
    a = float(input())
    b = float(input())
    print(round(a / b, 2))
except ValueError:
    print("Erreur : valeur invalide")
except ZeroDivisionError:
    print("Erreur : division par zéro")', 'Chaque type d''erreur a son propre **except**. On intercepte des exceptions précises plutôt qu''un except général.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-classe-rectangle', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'programmation-orientee-objet'), 'python', 'Classe Rectangle', 'Écrivez une classe **Rectangle** avec un constructeur (largeur, hauteur) et les méthodes **aire()**, **perimetre()** et **est_carre()**. Le programme lit la largeur et la hauteur (entiers) et affiche :

~~~text
Aire : …
Périmètre : …
Carré : True ou False
~~~', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"4\n5","output":"Aire : 20\nPérimètre : 18\nCarré : False"}]'::jsonb, '{}'::text[], 'class Rectangle:
    def __init__(self, largeur, hauteur):
        pass

r = Rectangle(int(input()), int(input()))
print("Aire :", r.aire())
print("Périmètre :", r.perimetre())
print("Carré :", r.est_carre())', array['Stockez les dimensions dans self.largeur et self.hauteur.', 'Chaque méthode reçoit self en premier paramètre.']::text[], 10, false, 'publie', 87, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-classe-rectangle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-classe-rectangle'), null, '4
5', 'Aire : 20
Périmètre : 18
Carré : False', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-classe-rectangle'), null, '3
3', 'Aire : 9
Périmètre : 12
Carré : True', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-classe-rectangle'), 'class Rectangle:
    def __init__(self, largeur, hauteur):
        self.largeur = largeur
        self.hauteur = hauteur

    def aire(self):
        return self.largeur * self.hauteur

    def perimetre(self):
        return 2 * (self.largeur + self.hauteur)

    def est_carre(self):
        return self.largeur == self.hauteur

r = Rectangle(int(input()), int(input()))
print("Aire :", r.aire())
print("Périmètre :", r.perimetre())
print("Carré :", r.est_carre())', 'Les attributs sont enregistrés dans le constructeur, puis utilisés par les méthodes via **self**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-parentheses', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-de-donnees'), 'python', 'Parenthèses équilibrées', 'Lisez une expression et affichez **OK** si les parenthèses (), crochets [] et accolades {} sont correctement équilibrés et imbriqués, **ERREUR** sinon.', 'avance', 'probleme', '{}'::text[], '[{"input":"{[(a+b)*c]}","output":"OK"},{"input":"(a]","output":"ERREUR"}]'::jsonb, '{}'::text[], '', array['Utilisez une pile : empilez chaque symbole ouvrant.', 'À chaque fermant, le sommet de la pile doit être l''ouvrant correspondant.', 'À la fin, la pile doit être vide.']::text[], 10, true, 'publie', 88, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-parentheses');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-parentheses'), null, '{[(a+b)*c]}', 'OK', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-parentheses'), null, '(a]', 'ERREUR', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-parentheses'), null, '((x)', 'ERREUR', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-parentheses'), null, 'x)(', 'ERREUR', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-parentheses'), null, 'sans symbole', 'OK', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-parentheses'), 'expr = input()
paires = {")": "(", "]": "[", "}": "{"}
pile = []
ok = True
for c in expr:
    if c in "([{":
        pile.append(c)
    elif c in paires:
        if not pile or pile.pop() != paires[c]:
            ok = False
            break
print("OK" if ok and not pile else "ERREUR")', 'La pile mémorise les ouvrants en attente. Trois cas d''erreur : un fermant sans ouvrant, un fermant qui ne correspond pas, des ouvrants restants à la fin.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-tri-insertion', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'recherche-tri'), 'python', 'Tri par insertion', 'Lisez une ligne d''entiers et affichez-les triés par ordre croissant en programmant le **tri par insertion** (sans sorted() ni sort()).', 'avance', 'ecrire_programme', '{}'::text[], '[{"input":"5 2 9 1 5 6","output":"1 2 5 5 6 9"}]'::jsonb, array['Interdiction d''utiliser sorted() et sort().']::text[], '', array['Pour chaque indice i à partir de 1, mémorisez cle = L[i].', 'Décalez vers la droite les éléments plus grands que cle situés avant i.', 'Placez cle dans la case libérée.']::text[], 10, true, 'publie', 89, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-tri-insertion');
commit;
