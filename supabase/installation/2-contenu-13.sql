-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 13 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-calculs', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-operateurs'), 'php', 'Quatre opérations', 'Lisez deux entiers **a** et **b** (b différent de 0) et affichez :

~~~text
Somme : <a + b>
Produit : <a × b>
Quotient entier : <quotient>
Reste : <reste>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"17\n5","output":"Somme : 22\nProduit : 85\nQuotient entier : 3\nReste : 2"}]'::jsonb, '{}'::text[], '', array['intdiv(a, b) donne le quotient entier.', '% donne le reste.']::text[], 10, false, 'publie', 109, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-calculs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculs'), null, '17
5', 'Somme : 22
Produit : 85
Quotient entier : 3
Reste : 2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculs'), null, '20
4', 'Somme : 24
Produit : 80
Quotient entier : 5
Reste : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculs'), null, '7
9', 'Somme : 16
Produit : 63
Quotient entier : 0
Reste : 7', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-calculs'), '<?php
$a = (int) trim((string) fgets(STDIN));
$b = (int) trim((string) fgets(STDIN));
echo "Somme : ", $a + $b, "\n";
echo "Produit : ", $a * $b, "\n";
echo "Quotient entier : ", intdiv($a, $b), "\n";
echo "Reste : ", $a % $b, "\n";', '**/** donnerait 3.4 : pour le quotient entier on utilise **intdiv()**, et **%** pour le reste.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-admis', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-simples'), 'php', 'Admis ou ajourné', 'Lisez une note sur 20 et affichez **Admis** si elle est supérieure ou égale à 10, sinon **Ajourné**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"12","output":"Admis"}]'::jsonb, '{}'::text[], '', array['Convertissez la note avec (float).', 'if ($note >= 10) { … } else { … }']::text[], 10, false, 'publie', 110, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-admis');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-admis'), null, '12', 'Admis', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-admis'), null, '9.5', 'Ajourné', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-admis'), null, '10', 'Admis', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-admis'), '<?php
$note = (float) trim((string) fgets(STDIN));
echo $note >= 10 ? "Admis" : "Ajourné", "\n";', 'Attention au cas limite **10** : la condition est **>=**, pas **>**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-page-personnalisee', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-simples'), 'php', 'Projet : page personnalisée', 'Lisez un **prénom** et une **heure** (0 à 23). Générez ce fragment HTML :

~~~html
<h1>Bonjour, Grace !</h1>
<p>Bonne journée à l''UPL.</p>
~~~

- « Bonjour » si l''heure est avant 18, sinon « Bonsoir » ;
- « Bonne journée à l''UPL. » si l''heure est avant 18, sinon « Bonne soirée à l''UPL. » ;
- le prénom doit être **échappé** avec htmlspecialchars (un prénom peut contenir des caractères spéciaux).', 'debutant', 'mini_projet', '{}'::text[], '[{"input":"Grace\n9","output":"<h1>Bonjour, Grace !</h1>\n<p>Bonne journée à l''UPL.</p>"}]'::jsonb, '{}'::text[], '', array['$jour = $heure < 18;', 'htmlspecialchars("<b>") donne &lt;b&gt;']::text[], 20, false, 'publie', 111, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-page-personnalisee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-page-personnalisee'), null, 'Grace
9', '<h1>Bonjour, Grace !</h1>
<p>Bonne journée à l''UPL.</p>', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-page-personnalisee'), null, 'Kito
20', '<h1>Bonsoir, Kito !</h1>
<p>Bonne soirée à l''UPL.</p>', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-page-personnalisee'), null, '<b>Ana</b>
18', '<h1>Bonsoir, &lt;b&gt;Ana&lt;/b&gt; !</h1>
<p>Bonne soirée à l''UPL.</p>', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-page-personnalisee'), '<?php
$prenom = trim((string) fgets(STDIN));
$heure = (int) trim((string) fgets(STDIN));
$jour = $heure < 18;
echo "<h1>", $jour ? "Bonjour" : "Bonsoir", ", ", htmlspecialchars($prenom), " !</h1>\n";
echo "<p>", $jour ? "Bonne journée" : "Bonne soirée", " à l''UPL.</p>\n";', 'Le test caché envoie un prénom contenant du HTML : sans **htmlspecialchars**, la page serait vulnérable au XSS.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-mention', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-switch-match'), 'php', 'Mention avec match', 'Lisez une moyenne sur 20 et affichez la mention : **Très bien** (≥ 16), **Bien** (≥ 14), **Assez bien** (≥ 12), **Passable** (≥ 10), sinon **Ajourné**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"14.5","output":"Bien"}]'::jsonb, '{}'::text[], '', array['match (true) { $m >= 16 => "Très bien", … default => "Ajourné" }', 'Testez de la plus haute mention à la plus basse.']::text[], 10, false, 'publie', 112, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mention'), null, '14.5', 'Bien', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mention'), null, '17', 'Très bien', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mention'), null, '9.99', 'Ajourné', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mention'), null, '12', 'Assez bien', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mention'), null, '10', 'Passable', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-mention'), '<?php
$m = (float) trim((string) fgets(STDIN));
echo match (true) {
    $m >= 16 => "Très bien",
    $m >= 14 => "Bien",
    $m >= 12 => "Assez bien",
    $m >= 10 => "Passable",
    default => "Ajourné",
}, "\n";', 'Avec **match (true)**, la première branche vraie est retenue : l''ordre des conditions est essentiel.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-table-multiplication', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-boucles'), 'php', 'Table de multiplication', 'Lisez un entier **n** et affichez sa table de 1 à 10, une ligne par produit : **n x i = résultat**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"7","output":"7 x 1 = 7\n7 x 2 = 14\n…\n7 x 10 = 70"}]'::jsonb, '{}'::text[], '', array['for ($i = 1; $i <= 10; $i++)', 'echo "$n x $i = ", $n * $i, "\n";']::text[], 10, false, 'publie', 113, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-table-multiplication');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-table-multiplication'), null, '7', '7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-table-multiplication'), null, '12', '12 x 1 = 12
12 x 2 = 24
12 x 3 = 36
12 x 4 = 48
12 x 5 = 60
12 x 6 = 72
12 x 7 = 84
12 x 8 = 96
12 x 9 = 108
12 x 10 = 120', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-table-multiplication'), '<?php
$n = (int) trim((string) fgets(STDIN));
for ($i = 1; $i <= 10; $i++) {
    echo "$n x $i = ", $n * $i, "\n";
}', 'Une boucle **for** de 1 à 10 inclus ; l''interpolation affiche $n et $i.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-somme-entiers', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-boucles'), 'php', 'Somme jusqu''à zéro', 'Lisez des entiers, un par ligne, jusqu''à lire **0** (non compté). Affichez **Somme : …** puis **Nombre : …** (le nombre de valeurs lues avant 0).', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4\n7\n1\n0","output":"Somme : 12\nNombre : 3"}]'::jsonb, '{}'::text[], '', array['Une boucle while qui s''arrête quand la valeur lue vaut 0.', 'Un compteur et un accumulateur initialisés à 0.']::text[], 10, false, 'publie', 114, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-somme-entiers');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-somme-entiers'), null, '4
7
1
0', 'Somme : 12
Nombre : 3', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-somme-entiers'), null, '0', 'Somme : 0
Nombre : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-somme-entiers'), null, '-5
5
10
0', 'Somme : 10
Nombre : 3', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-somme-entiers'), '<?php
$somme = 0;
$nombre = 0;
while (($x = (int) trim((string) fgets(STDIN))) !== 0) {
    $somme += $x;
    $nombre++;
}
echo "Somme : $somme\n";
echo "Nombre : $nombre\n";', 'Le motif « lire puis tester » dans la condition du while évite de compter la valeur d''arrêt.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-moyenne-notes', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-tableaux'), 'php', 'Moyenne, minimum et maximum', 'Lisez une ligne de notes séparées par des espaces. Affichez **Moyenne : x** (2 décimales), **Minimum : x** et **Maximum : x**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"12 15 9 18","output":"Moyenne : 13.50\nMinimum : 9\nMaximum : 18"}]'::jsonb, '{}'::text[], '', array['explode(" ", $ligne) découpe la ligne.', 'array_sum, count, min, max ; sprintf("%.2f", …).']::text[], 10, false, 'publie', 115, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-moyenne-notes');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-moyenne-notes'), null, '12 15 9 18', 'Moyenne : 13.50
Minimum : 9
Maximum : 18', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-moyenne-notes'), null, '10', 'Moyenne : 10.00
Minimum : 10
Maximum : 10', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-moyenne-notes'), null, '7 8 8', 'Moyenne : 7.67
Minimum : 7
Maximum : 8', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-moyenne-notes'), '<?php
$notes = array_map("intval", explode(" ", trim((string) fgets(STDIN))));
echo "Moyenne : ", sprintf("%.2f", array_sum($notes) / count($notes)), "\n";
echo "Minimum : ", min($notes), "\n";
echo "Maximum : ", max($notes), "\n";', 'explode découpe, array_map("intval", …) convertit chaque élément ; sprintf("%.2f") impose deux décimales.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-plus-grand', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-tableaux'), 'php', 'Meilleur étudiant (tableau associatif)', 'Chaque ligne contient **nom;moyenne**. La dernière ligne est **FIN**. Affichez le meilleur étudiant puis la liste triée par moyenne décroissante :

~~~text
Meilleur : Kito (15.5)
1. Kito 15.5
2. Mbuyi 12
~~~', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"Mbuyi;12\nKito;15.5\nFIN","output":"Meilleur : Kito (15.5)\n1. Kito 15.5\n2. Mbuyi 12"}]'::jsonb, '{}'::text[], '', array['Rangez les moyennes dans $t[$nom] = (float) $moyenne.', 'arsort($t) trie par valeur décroissante en gardant les clés.', 'array_key_first donne la première clé.']::text[], 15, false, 'publie', 116, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-plus-grand');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-plus-grand'), null, 'Mbuyi;12
Kito;15.5
FIN', 'Meilleur : Kito (15.5)
1. Kito 15.5
2. Mbuyi 12', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-plus-grand'), null, 'Ana;9
Beni;14
Carl;11.25
FIN', 'Meilleur : Beni (14)
1. Beni 14
2. Carl 11.25
3. Ana 9', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-plus-grand'), '<?php
$t = [];
while (($ligne = trim((string) fgets(STDIN))) !== "FIN" && $ligne !== "") {
    [$nom, $moyenne] = explode(";", $ligne);
    $t[$nom] = (float) $moyenne;
}
arsort($t);
$premier = array_key_first($t);
echo "Meilleur : $premier ({$t[$premier]})\n";
$rang = 1;
foreach ($t as $nom => $moyenne) {
    echo $rang++, ". $nom $moyenne\n";
}', 'Un tableau associatif nom ⇒ moyenne, trié avec **arsort** (et non sort, qui perdrait les noms).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-fonction-mention', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-fonctions-chaines-dates'), 'php', 'Fonctions typées : bulletin', 'Complétez les fonctions **moyenne(array $notes): float** et **mention(float $m): string** (mêmes seuils que l''exercice « Mention ») puis affichez pour la ligne de notes lue :

~~~text
Moyenne : 13.67
Mention : Assez bien
~~~', 'intermediaire', 'completer', '{}'::text[], '[{"input":"12 14 15","output":"Moyenne : 13.67\nMention : Assez bien"}]'::jsonb, '{}'::text[], '<?php
declare(strict_types=1);

function moyenne(array $notes): float
{
    // à compléter
}

function mention(float $m): string
{
    // à compléter
}

$notes = array_map("floatval", explode(" ", trim((string) fgets(STDIN))));
$m = moyenne($notes);
echo "Moyenne : ", sprintf("%.2f", $m), "\n";
echo "Mention : ", mention($m), "\n";', array['return array_sum($notes) / count($notes);', 'Réutilisez un match (true).']::text[], 15, false, 'publie', 117, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-fonction-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-fonction-mention'), null, '12 14 15', 'Moyenne : 13.67
Mention : Assez bien', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-fonction-mention'), null, '16 18', 'Moyenne : 17.00
Mention : Très bien', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-fonction-mention'), null, '8 11', 'Moyenne : 9.50
Mention : Ajourné', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-fonction-mention'), '<?php
declare(strict_types=1);

function moyenne(array $notes): float
{
    return array_sum($notes) / count($notes);
}

function mention(float $m): string
{
    return match (true) {
        $m >= 16 => "Très bien",
        $m >= 14 => "Bien",
        $m >= 12 => "Assez bien",
        $m >= 10 => "Passable",
        default => "Ajourné",
    };
}

$notes = array_map("floatval", explode(" ", trim((string) fgets(STDIN))));
$m = moyenne($notes);
echo "Moyenne : ", sprintf("%.2f", $m), "\n";
echo "Mention : ", mention($m), "\n";', 'Deux fonctions courtes, chacune avec une seule responsabilité ; le type de retour **float** / **string** est vérifié par PHP.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-chaines', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-fonctions-chaines-dates'), 'php', 'Nom d''utilisateur et initiales', 'Lisez un nom complet (prénom puis nom, en lettres sans accent, avec d''éventuels espaces en trop). Affichez :

~~~text
Nom : Jean Paul Kabila
Initiales : J.P.K.
Identifiant : jean.kabila
~~~

- **Nom** : chaque mot avec une majuscule initiale, séparés par un seul espace ;
- **Identifiant** : premier mot et dernier mot en minuscules, séparés par un point.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"  jean  paul KABILA ","output":"Nom : Jean Paul Kabila\nInitiales : J.P.K.\nIdentifiant : jean.kabila"}]'::jsonb, '{}'::text[], '', array['preg_split(''/\s+/'', trim($texte)) découpe sur un ou plusieurs espaces.', 'ucfirst(strtolower($mot))', 'end($mots) ou $mots[count($mots) - 1].']::text[], 15, false, 'publie', 118, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-chaines');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-chaines'), null, '  jean  paul KABILA ', 'Nom : Jean Paul Kabila
Initiales : J.P.K.
Identifiant : jean.kabila', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-chaines'), null, 'grace mbuyi', 'Nom : Grace Mbuyi
Initiales : G.M.
Identifiant : grace.mbuyi', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-chaines'), null, 'ANA', 'Nom : Ana
Initiales : A.
Identifiant : ana.ana', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-chaines'), '<?php
$mots = preg_split(''/\s+/'', trim(trim((string) fgets(STDIN))));
$mots = array_map(fn(string $m): string => ucfirst(strtolower($m)), $mots);
echo "Nom : ", implode(" ", $mots), "\n";
echo "Initiales : ", implode("", array_map(fn(string $m): string => $m[0] . ".", $mots)), "\n";
echo "Identifiant : ", strtolower($mots[0] . "." . $mots[count($mots) - 1]), "\n";', 'explode(" ") laisserait des mots vides à cause des espaces multiples : **preg_split(''/\s+/'')** après **trim** est plus robuste.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-validation-age', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-formulaires'), 'php', 'Valider un formulaire d''inscription', 'Les trois lignes de l''entrée simulent les champs **nom**, **email** et **age** d''un formulaire. Affichez chaque erreur détectée, dans cet ordre :

- **Erreur : nom obligatoire** si le nom (sans espaces autour) est vide ;
- **Erreur : email invalide** si filter_var(…, FILTER_VALIDATE_EMAIL) échoue ;
- **Erreur : âge entre 16 et 99** si l''âge n''est pas un entier dans cet intervalle.

S''il n''y a aucune erreur, affichez **Inscription valide : <nom échappé>**.', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"Kito\nkito@upl.cd\n21","output":"Inscription valide : Kito"}]'::jsonb, '{}'::text[], '', array['filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 16, "max_range" => 99]])', 'Accumulez les erreurs dans un tableau.']::text[], 20, false, 'publie', 119, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-validation-age');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-validation-age'), null, 'Kito
kito@upl.cd
21', 'Inscription valide : Kito', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-validation-age'), null, '  
kito@
15', 'Erreur : nom obligatoire
Erreur : email invalide
Erreur : âge entre 16 et 99', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-validation-age'), null, 'Ana
ana@upl.cd
vingt', 'Erreur : âge entre 16 et 99', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-validation-age'), null, '<i>Bo</i>
bo@upl.cd
30', 'Inscription valide : &lt;i&gt;Bo&lt;/i&gt;', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-validation-age'), '<?php
$nom = trim((string) fgets(STDIN));
$email = trim((string) fgets(STDIN));
$age = trim((string) fgets(STDIN));
$erreurs = [];
if ($nom === "") {
    $erreurs[] = "nom obligatoire";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erreurs[] = "email invalide";
}
if (filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 16, "max_range" => 99]]) === false) {
    $erreurs[] = "âge entre 16 et 99";
}
if ($erreurs) {
    foreach ($erreurs as $e) {
        echo "Erreur : $e\n";
    }
} else {
    echo "Inscription valide : ", htmlspecialchars($nom), "\n";
}', 'On valide **toutes** les données et on échappe le nom à l''affichage : le test caché contient du HTML.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-calculatrice', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-formulaires'), 'php', 'Projet : calculatrice', 'L''entrée simule un formulaire : **a**, **operation** (+, -, *, /) et **b**, une valeur par ligne. Affichez **a op b = résultat** (résultat arrondi à 2 décimales au plus, sans zéros inutiles grâce à round). Cas d''erreur :

- **Erreur : nombres invalides** si a ou b n''est pas numérique ;
- **Erreur : division par zéro** ;
- **Erreur : opération inconnue**.', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"7\n/\n2","output":"7 / 2 = 3.5"}]'::jsonb, '{}'::text[], '', array['is_numeric() vérifie une saisie.', 'match ($op) { "+" => $a + $b, … }', 'round($resultat, 2)']::text[], 25, false, 'publie', 120, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-calculatrice');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, '7
/
2', '7 / 2 = 3.5', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, '3
*
4', '3 * 4 = 12', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, '1
/
0', 'Erreur : division par zéro', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, 'a
+
2', 'Erreur : nombres invalides', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, '2
%
2', 'Erreur : opération inconnue', true, 1, 4, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-calculatrice'), null, '10
/
3', '10 / 3 = 3.33', true, 1, 5, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-calculatrice'), '<?php
$a = trim((string) fgets(STDIN));
$op = trim((string) fgets(STDIN));
$b = trim((string) fgets(STDIN));
if (!is_numeric($a) || !is_numeric($b)) {
    echo "Erreur : nombres invalides\n";
} elseif (!in_array($op, ["+", "-", "*", "/"], true)) {
    echo "Erreur : opération inconnue\n";
} elseif ($op === "/" && (float) $b == 0) {
    echo "Erreur : division par zéro\n";
} else {
    $x = (float) $a;
    $y = (float) $b;
    $resultat = match ($op) {
        "+" => $x + $y,
        "-" => $x - $y,
        "*" => $x * $y,
        "/" => $x / $y,
    };
    echo "$a $op $b = ", round($resultat, 2), "\n";
}', 'Valider d''abord (nombres, opération, division par zéro), calculer ensuite : chaque cas d''erreur a son message.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-erreurs-corriger', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-sessions-cookies-include'), 'php', 'Corriger un script (Parse error et Fatal error)', 'Le script ci-dessous contient **trois erreurs** (une erreur de syntaxe, une fonction mal nommée et une variable mal orthographiée). Exécutez-le, lisez les messages de PHP et corrigez-le pour qu''il affiche, pour l''entrée **3** :

~~~text
Panier : 3 article(s)
Total : 4500 FC
~~~', 'intermediaire', 'corriger', '{}'::text[], '[{"input":"3","output":"Panier : 3 article(s)\nTotal : 4500 FC"}]'::jsonb, '{}'::text[], '<?php
$prixUnitaire = 1500
$quantite = (int) trim((string) fgets(STDIN));
$total = $prixUnitaire * $quantite;
echo "Panier : $quantite article(s)\n";
ecrire("Total : $totale FC\n");', array['Parse error : regardez la fin de la ligne 2.', 'La fonction d''affichage s''appelle echo.', 'Warning : Undefined variable $totale.']::text[], 10, false, 'publie', 121, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-erreurs-corriger');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-erreurs-corriger'), null, '3', 'Panier : 3 article(s)
Total : 4500 FC', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-erreurs-corriger'), null, '1', 'Panier : 1 article(s)
Total : 1500 FC', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-erreurs-corriger'), '<?php
$prixUnitaire = 1500;
$quantite = (int) trim((string) fgets(STDIN));
$total = $prixUnitaire * $quantite;
echo "Panier : $quantite article(s)\n";
echo "Total : $total FC\n";', 'Point-virgule manquant ligne 2 (Parse error signalée ligne 3), **ecrire** n''existe pas en PHP (Fatal error : Call to undefined function), et **$totale** n''existe pas (Warning : Undefined variable).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-classe-compte', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-classes-objets'), 'php', 'Classe CompteBancaire', 'Écrivez une classe **CompteBancaire** avec un titulaire et un solde **privé** (initialisé à 0), et les méthodes **deposer(float $m)**, **retirer(float $m): bool** (refuse si le solde est insuffisant ou le montant ≤ 0) et **getSolde()**.

L''entrée contient le titulaire, puis des opérations **D montant** ou **R montant**, puis **FIN**. Affichez une ligne par opération (**Dépôt : 100**, **Retrait : 30**, **Retrait refusé : 500**) puis **Solde de <titulaire> : <solde>**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"Kito\nD 100\nR 30\nR 500\nFIN","output":"Dépôt : 100\nRetrait : 30\nRetrait refusé : 500\nSolde de Kito : 70"}]'::jsonb, '{}'::text[], '', array['private float $solde = 0;', 'Le constructeur reçoit le titulaire.', '[$type, $montant] = explode(" ", $ligne);']::text[], 20, false, 'publie', 122, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-classe-compte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-classe-compte'), null, 'Kito
D 100
R 30
R 500
FIN', 'Dépôt : 100
Retrait : 30
Retrait refusé : 500
Solde de Kito : 70', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-classe-compte'), null, 'Ana
R 10
D 50.5
FIN', 'Retrait refusé : 10
Dépôt : 50.5
Solde de Ana : 50.5', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-classe-compte'), '<?php
class CompteBancaire
{
    private float $solde = 0;

    public function __construct(private string $titulaire) {}

    public function deposer(float $m): void
    {
        if ($m > 0) {
            $this->solde += $m;
        }
    }

    public function retirer(float $m): bool
    {
        if ($m <= 0 || $m > $this->solde) {
            return false;
        }
        $this->solde -= $m;
        return true;
    }

    public function getSolde(): float
    {
        return $this->solde;
    }

    public function getTitulaire(): string
    {
        return $this->titulaire;
    }
}

$compte = new CompteBancaire(trim((string) fgets(STDIN)));
while (($ligne = trim((string) fgets(STDIN))) !== "FIN" && $ligne !== "") {
    [$type, $montant] = explode(" ", $ligne);
    if ($type === "D") {
        $compte->deposer((float) $montant);
        echo "Dépôt : $montant\n";
    } else {
        echo $compte->retirer((float) $montant) ? "Retrait : $montant\n" : "Retrait refusé : $montant\n";
    }
}
echo "Solde de ", $compte->getTitulaire(), " : ", $compte->getSolde(), "\n";', 'Le solde est **private** : seules les méthodes peuvent le modifier, et **retirer** garantit qu''il ne devient jamais négatif.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-formes-polymorphisme', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-heritage-interfaces'), 'php', 'Formes géométriques (interface et polymorphisme)', 'Définissez une interface **Forme** (méthodes **aire(): float** et **nom(): string**) et deux classes **Rectangle** et **Cercle**. Chaque ligne de l''entrée est **R largeur hauteur** ou **C rayon**, jusqu''à **FIN**. Affichez pour chaque forme **<nom> : <aire à 2 décimales>** puis **Total : …**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"R 3 4\nC 1\nFIN","output":"Rectangle : 12.00\nCercle : 3.14\nTotal : 15.14"}]'::jsonb, '{}'::text[], '', array['interface Forme { public function aire(): float; public function nom(): string; }', 'M_PI vaut π.', 'number_format($x, 2, ".", "") ou sprintf("%.2f", $x).']::text[], 20, false, 'publie', 123, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-formes-polymorphisme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-formes-polymorphisme'), null, 'R 3 4
C 1
FIN', 'Rectangle : 12.00
Cercle : 3.14
Total : 15.14', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-formes-polymorphisme'), null, 'C 2
C 0.5
R 1 1
FIN', 'Cercle : 12.57
Cercle : 0.79
Rectangle : 1.00
Total : 14.35', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-formes-polymorphisme'), '<?php
interface Forme
{
    public function aire(): float;
    public function nom(): string;
}

class Rectangle implements Forme
{
    public function __construct(private float $l, private float $h) {}
    public function aire(): float { return $this->l * $this->h; }
    public function nom(): string { return "Rectangle"; }
}

class Cercle implements Forme
{
    public function __construct(private float $r) {}
    public function aire(): float { return M_PI * $this->r ** 2; }
    public function nom(): string { return "Cercle"; }
}

$formes = [];
while (($ligne = trim((string) fgets(STDIN))) !== "FIN" && $ligne !== "") {
    $p = explode(" ", $ligne);
    $formes[] = $p[0] === "R" ? new Rectangle((float) $p[1], (float) $p[2]) : new Cercle((float) $p[1]);
}
$total = 0;
foreach ($formes as $f) {
    echo $f->nom(), " : ", sprintf("%.2f", $f->aire()), "\n";
    $total += $f->aire();
}
echo "Total : ", sprintf("%.2f", $total), "\n";', 'La boucle d''affichage ignore le type réel de chaque forme : elle appelle **aire()** et **nom()**, garantis par l''interface (polymorphisme).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-exception-retrait', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-exceptions'), 'php', 'Exceptions personnalisées', 'Complétez la fonction **retirer** : elle lève une **MontantInvalideException** si le montant est ≤ 0 et une **SoldeInsuffisantException** s''il dépasse le solde, sinon elle renvoie le nouveau solde. Le programme principal (fourni) affiche le résultat de chaque retrait.', 'intermediaire', 'completer', '{}'::text[], '[{"input":"100\n30\n-5\n500","output":"Nouveau solde : 70\nMontant invalide : -5\nSolde insuffisant : 500 > 70"}]'::jsonb, '{}'::text[], '<?php
class MontantInvalideException extends InvalidArgumentException {}
class SoldeInsuffisantException extends RuntimeException {}

function retirer(float $solde, float $montant): float
{
    // à compléter
}

$solde = (float) trim((string) fgets(STDIN));
while (($ligne = trim((string) fgets(STDIN))) !== "") {
    try {
        $solde = retirer($solde, (float) $ligne);
        echo "Nouveau solde : $solde\n";
    } catch (MontantInvalideException $e) {
        echo "Montant invalide : ", $e->getMessage(), "\n";
    } catch (SoldeInsuffisantException $e) {
        echo "Solde insuffisant : ", $e->getMessage(), "\n";
    }
}', array['throw new MontantInvalideException((string) $montant);', 'Le message attendu du solde insuffisant est « 500 > 70 ».']::text[], 15, false, 'publie', 124, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-exception-retrait');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-exception-retrait'), null, '100
30
-5
500', 'Nouveau solde : 70
Montant invalide : -5
Solde insuffisant : 500 > 70', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-exception-retrait'), null, '10
0
10
1', 'Montant invalide : 0
Nouveau solde : 0
Solde insuffisant : 1 > 0', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-exception-retrait'), '<?php
class MontantInvalideException extends InvalidArgumentException {}
class SoldeInsuffisantException extends RuntimeException {}

function retirer(float $solde, float $montant): float
{
    if ($montant <= 0) {
        throw new MontantInvalideException((string) $montant);
    }
    if ($montant > $solde) {
        throw new SoldeInsuffisantException("$montant > $solde");
    }
    return $solde - $montant;
}

$solde = (float) trim((string) fgets(STDIN));
while (($ligne = trim((string) fgets(STDIN))) !== "") {
    try {
        $solde = retirer($solde, (float) $ligne);
        echo "Nouveau solde : $solde\n";
    } catch (MontantInvalideException $e) {
        echo "Montant invalide : ", $e->getMessage(), "\n";
    } catch (SoldeInsuffisantException $e) {
        echo "Solde insuffisant : ", $e->getMessage(), "\n";
    }
}', 'Chaque situation anormale a sa propre exception : l''appelant réagit précisément avec un **catch** par type.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-pdo-liste', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-pdo'), 'php', 'PDO : étudiants d''une filière', 'La base (SQLite en mémoire) est créée par le code de départ. Lisez le nom d''une **filière** et affichez ses étudiants triés par nom, au format **nom (âge ans)**, avec une **requête préparée**. Si aucun étudiant ne correspond, affichez **Aucun étudiant**. Terminez par **Total : n**.', 'intermediaire', 'completer', '{}'::text[], '[{"input":"Informatique","output":"Kabila (21 ans)\nKito (23 ans)\nTotal : 2"}]'::jsonb, '{}'::text[], '<?php
$pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, age INTEGER, filiere TEXT)");
$pdo->exec("INSERT INTO etudiants (nom, age, filiere) VALUES (''Kito'', 23, ''Informatique''), (''Mbuyi'', 19, ''Droit''), (''Kabila'', 21, ''Informatique'')");

$filiere = trim((string) fgets(STDIN));
// Requête préparée, puis affichage', array['$stmt = $pdo->prepare("SELECT nom, age FROM etudiants WHERE filiere = ? ORDER BY nom");', '$stmt->execute([$filiere]); $lignes = $stmt->fetchAll();']::text[], 20, false, 'publie', 125, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-pdo-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-pdo-liste'), null, 'Informatique', 'Kabila (21 ans)
Kito (23 ans)
Total : 2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-pdo-liste'), null, 'Droit', 'Mbuyi (19 ans)
Total : 1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-pdo-liste'), null, ''' OR ''1''=''1', 'Aucun étudiant
Total : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-pdo-liste'), '<?php
$pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, age INTEGER, filiere TEXT)");
$pdo->exec("INSERT INTO etudiants (nom, age, filiere) VALUES (''Kito'', 23, ''Informatique''), (''Mbuyi'', 19, ''Droit''), (''Kabila'', 21, ''Informatique'')");

$filiere = trim((string) fgets(STDIN));
$stmt = $pdo->prepare("SELECT nom, age FROM etudiants WHERE filiere = ? ORDER BY nom");
$stmt->execute([$filiere]);
$lignes = $stmt->fetchAll();
if (!$lignes) {
    echo "Aucun étudiant\n";
}
foreach ($lignes as $e) {
    echo $e["nom"], " (", $e["age"], " ans)\n";
}
echo "Total : ", count($lignes), "\n";', 'Le test caché tente une **injection SQL** : avec une requête préparée, elle est traitée comme un nom de filière inexistant.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-json-resume', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-json-api'), 'php', 'Décoder du JSON', 'L''entrée est un tableau JSON d''étudiants (**nom**, **notes**). Affichez un objet JSON (sur une ligne, accents non échappés) donnant pour chaque nom sa moyenne arrondie à 2 décimales, puis le nombre d''étudiants. Si le JSON est invalide, affichez **{"erreur":"JSON invalide"}**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"[{\"nom\":\"Kito\",\"notes\":[12,15]},{\"nom\":\"Élise\",\"notes\":[18]}]","output":"{\"moyennes\":{\"Kito\":13.5,\"Élise\":18},\"nombre\":2}"}]'::jsonb, '{}'::text[], '', array['json_decode($texte, true) ; null si invalide.', 'json_encode($donnees, JSON_UNESCAPED_UNICODE).']::text[], 15, false, 'publie', 126, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-json-resume');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-json-resume'), null, '[{"nom":"Kito","notes":[12,15]},{"nom":"Élise","notes":[18]}]', '{"moyennes":{"Kito":13.5,"Élise":18},"nombre":2}', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-json-resume'), null, '{pas du json', '{"erreur":"JSON invalide"}', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-json-resume'), null, '[{"nom":"Ana","notes":[10,11,11]}]', '{"moyennes":{"Ana":10.67},"nombre":1}', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-json-resume'), '<?php
$donnees = json_decode(trim((string) fgets(STDIN)), true);
if (!is_array($donnees)) {
    echo json_encode(["erreur" => "JSON invalide"]), "\n";
} else {
    $moyennes = [];
    foreach ($donnees as $e) {
        $moyennes[$e["nom"]] = round(array_sum($e["notes"]) / count($e["notes"]), 2);
    }
    echo json_encode(["moyennes" => $moyennes, "nombre" => count($moyennes)], JSON_UNESCAPED_UNICODE), "\n";
}', 'json_decode renvoie **null** pour un JSON invalide ; **JSON_UNESCAPED_UNICODE** garde « Élise » lisible au lieu de \u00c9lise.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-mot-de-passe-robuste', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-securite'), 'php', 'Politique de mots de passe et hachage', 'Lisez un mot de passe. Vérifiez qu''il a **au moins 10 caractères**, **une majuscule**, **une minuscule**, **un chiffre** et **un caractère spécial**. Affichez chaque règle non respectée (dans cet ordre) :

~~~text
Refusé : 10 caractères minimum
Refusé : une majuscule
Refusé : une minuscule
Refusé : un chiffre
Refusé : un caractère spécial
~~~

Sinon, hachez-le avec **password_hash** et affichez **Accepté** puis **Vérification : oui** (résultat de password_verify) — jamais le mot de passe lui-même.', 'avance', 'probleme', '{}'::text[], '[{"input":"Kinshasa2026!","output":"Accepté\nVérification : oui"}]'::jsonb, '{}'::text[], '', array['preg_match(''/[A-Z]/'', $mdp)', 'preg_match(''/[^A-Za-z0-9]/'', $mdp) pour un caractère spécial.']::text[], 20, false, 'publie', 127, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-mot-de-passe-robuste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mot-de-passe-robuste'), null, 'Kinshasa2026!', 'Accepté
Vérification : oui', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mot-de-passe-robuste'), null, 'abc', 'Refusé : 10 caractères minimum
Refusé : une majuscule
Refusé : un chiffre
Refusé : un caractère spécial', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-mot-de-passe-robuste'), null, 'MOTDEPASSE123', 'Refusé : une minuscule
Refusé : un caractère spécial', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-mot-de-passe-robuste'), '<?php
$mdp = trim((string) fgets(STDIN));
$regles = [
    "10 caractères minimum" => strlen($mdp) >= 10,
    "une majuscule" => (bool) preg_match(''/[A-Z]/'', $mdp),
    "une minuscule" => (bool) preg_match(''/[a-z]/'', $mdp),
    "un chiffre" => (bool) preg_match(''/[0-9]/'', $mdp),
    "un caractère spécial" => (bool) preg_match(''/[^A-Za-z0-9]/'', $mdp),
];
$refus = array_keys(array_filter($regles, fn(bool $ok): bool => !$ok));
if ($refus) {
    foreach ($refus as $r) {
        echo "Refusé : $r\n";
    }
} else {
    $empreinte = password_hash($mdp, PASSWORD_DEFAULT);
    echo "Accepté\n";
    echo "Vérification : ", password_verify($mdp, $empreinte) ? "oui" : "non", "\n";
}', 'Les règles sont décrites dans un tableau (lisible et facile à étendre). Le mot de passe n''est stocké que sous forme d''empreinte **password_hash**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-panier-tests', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-architecture-tests'), 'php', 'Projet : panier testé automatiquement', 'Écrivez une classe **Panier** : **ajouter(string $article, float $prix, int $quantite = 1)**, **total(): float**, **appliquerRemise(int $pourcent)** (refuse hors de 0–50 avec une InvalidArgumentException) et **nombreArticles(): int**.

Le code de départ contient une petite suite de tests : votre classe doit les faire **tous réussir** (« 5/5 tests réussis »).', 'avance', 'mini_projet', '{}'::text[], '[{"input":"","output":"✓ panier vide\n✓ total\n✓ quantités\n✓ remise\n✓ remise refusée\n5/5 tests réussis"}]'::jsonb, '{}'::text[], '<?php
declare(strict_types=1);

final class Panier
{
    // à compléter
}

// ---- Tests (ne pas modifier) ----
$reussis = 0;
function test(string $nom, bool $ok, int &$reussis): void { echo $ok ? "✓" : "✗", " $nom\n"; $reussis += (int) $ok; }
$p = new Panier();
test("panier vide", $p->total() === 0.0 && $p->nombreArticles() === 0, $reussis);
$p->ajouter("Cahier", 1500);
$p->ajouter("Stylo", 500, 3);
test("total", $p->total() === 3000.0, $reussis);
test("quantités", $p->nombreArticles() === 4, $reussis);
$p->appliquerRemise(10);
test("remise", abs($p->total() - 2700.0) < 0.001, $reussis);
try { $p->appliquerRemise(80); $refus = false; } catch (InvalidArgumentException) { $refus = true; }
test("remise refusée", $refus, $reussis);
echo "$reussis/5 tests réussis\n";', array['Stockez les lignes : [article, prix, quantité].', 'total = somme(prix × quantité) × (1 − remise / 100).', 'throw new InvalidArgumentException("Remise invalide");']::text[], 25, false, 'publie', 128, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-panier-tests');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-panier-tests'), null, '', '✓ panier vide
✓ total
✓ quantités
✓ remise
✓ remise refusée
5/5 tests réussis', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-panier-tests'), '<?php
declare(strict_types=1);

final class Panier
{
    private array $lignes = [];
    private int $remise = 0;

    public function ajouter(string $article, float $prix, int $quantite = 1): void
    {
        $this->lignes[] = ["article" => $article, "prix" => $prix, "quantite" => $quantite];
    }

    public function total(): float
    {
        $brut = array_sum(array_map(fn(array $l): float => $l["prix"] * $l["quantite"], $this->lignes));
        return (float) $brut * (1 - $this->remise / 100);
    }

    public function appliquerRemise(int $pourcent): void
    {
        if ($pourcent < 0 || $pourcent > 50) {
            throw new InvalidArgumentException("Remise invalide");
        }
        $this->remise = $pourcent;
    }

    public function nombreArticles(): int
    {
        return array_sum(array_column($this->lignes, "quantite"));
    }
}

// ---- Tests (ne pas modifier) ----
$reussis = 0;
function test(string $nom, bool $ok, int &$reussis): void { echo $ok ? "✓" : "✗", " $nom\n"; $reussis += (int) $ok; }
$p = new Panier();
test("panier vide", $p->total() === 0.0 && $p->nombreArticles() === 0, $reussis);
$p->ajouter("Cahier", 1500);
$p->ajouter("Stylo", 500, 3);
test("total", $p->total() === 3000.0, $reussis);
test("quantités", $p->nombreArticles() === 4, $reussis);
$p->appliquerRemise(10);
test("remise", abs($p->total() - 2700.0) < 0.001, $reussis);
try { $p->appliquerRemise(80); $refus = false; } catch (InvalidArgumentException) { $refus = true; }
test("remise refusée", $refus, $reussis);
echo "$reussis/5 tests réussis\n";', 'C''est le principe du développement piloté par les tests : la spécification est écrite sous forme de tests, la classe est terminée quand ils réussissent tous.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
commit;
