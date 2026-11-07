-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 7 sur 10.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2023', 'non bissextile', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2400', 'bissextile', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), 'ALGORITHME Bissextile
VARIABLES
  annee : ENTIER
DEBUT
  LIRE(annee)
  SI (annee MOD 4 = 0 ET annee MOD 100 <> 0) OU annee MOD 400 = 0 ALORS
    ECRIRE("bissextile")
  SINON
    ECRIRE("non bissextile")
  FINSI
FIN', 'La règle se traduit directement en une condition combinée. Vérifiez les trois cas pièges : 2024 (divisible par 4), 1900 (divisible par 100 mais pas 400) et 2000 (divisible par 400).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-table-multiplication', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'pseudocode', 'Table de multiplication', 'Lisez un entier n et affichez sa table de multiplication de 1 à 10, au format :

~~~text
n x 1 = …
…
n x 10 = …
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n3 x 2 = 6\n…\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['Le nombre de lignes est connu : 10. Quelle boucle choisir ?', 'ECRIRE(n, " x ", i, " = ", n * i)']::text[], 10, false, 'publie', 9, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-table-multiplication');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-multiplication'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-multiplication'), null, '12', '12 x 1 = 12
12 x 2 = 24
12 x 3 = 36
12 x 4 = 48
12 x 5 = 60
12 x 6 = 72
12 x 7 = 84
12 x 8 = 96
12 x 9 = 108
12 x 10 = 120', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-table-multiplication'), 'ALGORITHME Table
VARIABLES
  n, i : ENTIER
DEBUT
  LIRE(n)
  POUR i DE 1 A 10 FAIRE
    ECRIRE(n, " x ", i, " = ", n * i)
  FINPOUR
FIN', 'Le nombre de répétitions étant connu à l''avance, la boucle **POUR** est la plus adaptée. Le compteur i sert à la fois de multiplicateur et d''affichage.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-somme-n-premiers', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'pseudocode', 'Somme des n premiers entiers', 'Lisez un entier n ≥ 0 et affichez la somme 1 + 2 + … + n (0 si n = 0).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"10","output":"55"}]'::jsonb, '{}'::text[], '', array['Utilisez un accumulateur initialisé à 0.', 'Une boucle POUR de 1 à n ajoute i à la somme.']::text[], 10, false, 'publie', 10, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-n-premiers');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '10', '55', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '0', '0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '100', '5050', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), 'ALGORITHME SommeN
VARIABLES
  n, i, s : ENTIER
DEBUT
  LIRE(n)
  s ← 0
  POUR i DE 1 A n FAIRE
    s ← s + i
  FINPOUR
  ECRIRE(s)
FIN', 'L''accumulateur s est initialisé à 0 avant la boucle. Si n = 0, la boucle POUR de 1 à 0 ne s''exécute pas et s reste à 0. Pour aller plus loin : la formule n × (n + 1) / 2 donne le résultat sans boucle.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-compter-positifs', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'compteurs-accumulateurs'), 'pseudocode', 'Compter les nombres positifs', 'Lisez des entiers jusqu''à la valeur sentinelle **0** (non comptée). Affichez :

~~~text
Positifs : <nombre de valeurs strictement positives>
Négatifs : <nombre de valeurs strictement négatives>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n-2\n8\n-1\n3\n0","output":"Positifs : 3\nNégatifs : 2"}]'::jsonb, '{}'::text[], '', array['Le nombre de valeurs n''est pas connu : utilisez TANT QUE.', 'Lisez une première valeur avant la boucle, puis relisez à la fin du corps de boucle.']::text[], 10, false, 'publie', 11, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-compter-positifs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '5
-2
8
-1
3
0', 'Positifs : 3
Négatifs : 2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '0', 'Positifs : 0
Négatifs : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '-4
-4
-4
0', 'Positifs : 0
Négatifs : 3', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-compter-positifs'), 'ALGORITHME CompterSignes
VARIABLES
  x, pos, neg : ENTIER
DEBUT
  pos ← 0
  neg ← 0
  LIRE(x)
  TANT QUE x <> 0 FAIRE
    SI x > 0 ALORS
      pos ← pos + 1
    SINON
      neg ← neg + 1
    FINSI
    LIRE(x)
  FINTANTQUE
  ECRIRE("Positifs : ", pos)
  ECRIRE("Négatifs : ", neg)
FIN', 'C''est le schéma classique de la **valeur sentinelle** : une lecture avant la boucle, une lecture à la fin de chaque tour. Ainsi la valeur 0 n''est jamais comptée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-factorielle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'compteurs-accumulateurs'), 'pseudocode', 'Factorielle', 'Lisez un entier n (0 ≤ n ≤ 15) et affichez n! = 1 × 2 × … × n (avec 0! = 1).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"5","output":"120"}]'::jsonb, '{}'::text[], '', array['C''est un accumulateur de produit : à quelle valeur l''initialiser ?', 'Un produit s''initialise à 1, pas à 0.']::text[], 10, false, 'publie', 12, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-factorielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-factorielle'), null, '5', '120', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-factorielle'), null, '0', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-factorielle'), null, '10', '3628800', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-factorielle'), 'ALGORITHME Factorielle
VARIABLES
  n, i, f : ENTIER
DEBUT
  LIRE(n)
  f ← 1
  POUR i DE 2 A n FAIRE
    f ← f * i
  FINPOUR
  ECRIRE(f)
FIN', 'L''accumulateur de produit est initialisé à **1** (élément neutre de la multiplication). Initialisé à 0, le résultat serait toujours 0.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-inverser-tableau', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'pseudocode', 'Afficher un tableau à l''envers', 'Lisez un entier n (1 ≤ n ≤ 100), puis n entiers que vous rangez dans un tableau. Affichez-les dans l''ordre inverse, **un par ligne**.', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"3\n10\n20\n30","output":"30\n20\n10"}]'::jsonb, '{}'::text[], '', array['Déclarez un tableau de 100 cases.', 'Une boucle POUR avec PAS -1 parcourt de n à 1.']::text[], 10, false, 'publie', 13, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-inverser-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '3
10
20
30', '30
20
10', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '1
42', '42', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '5
1
2
3
4
5', '5
4
3
2
1', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-inverser-tableau'), 'ALGORITHME Inverser
VARIABLES
  T : TABLEAU[1..100] DE ENTIER
  n, i : ENTIER
DEBUT
  LIRE(n)
  POUR i DE 1 A n FAIRE
    LIRE(T[i])
  FINPOUR
  POUR i DE n A 1 PAS -1 FAIRE
    ECRIRE(T[i])
  FINPOUR
FIN', 'Le tableau est déclaré avec la taille maximale (100) ; seules les n premières cases sont utilisées. La seconde boucle utilise un **pas négatif**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-maximum-tableau', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'pseudocode', 'Maximum et sa position', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Affichez la plus grande valeur et la position de sa **première** apparition :

~~~text
Maximum : <valeur> en position <indice>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n4\n9\n2\n9\n1","output":"Maximum : 9 en position 2"}]'::jsonb, '{}'::text[], '', array['Initialisez le maximum avec la première case.', 'Gardez aussi en mémoire l''indice du maximum.', 'Comparez avec > (strictement) pour conserver la première position.']::text[], 10, false, 'publie', 14, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-maximum-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '5
4
9
2
9
1', 'Maximum : 9 en position 2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '1
-7', 'Maximum : -7 en position 1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '4
-5
-2
-9
-2', 'Maximum : -2 en position 2', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-maximum-tableau'), 'ALGORITHME MaxTableau
VARIABLES
  T : TABLEAU[1..100] DE ENTIER
  n, i, iMax : ENTIER
DEBUT
  LIRE(n)
  POUR i DE 1 A n FAIRE
    LIRE(T[i])
  FINPOUR
  iMax ← 1
  POUR i DE 2 A n FAIRE
    SI T[i] > T[iMax] ALORS
      iMax ← i
    FINSI
  FINPOUR
  ECRIRE("Maximum : ", T[iMax], " en position ", iMax)
FIN', 'Il suffit de mémoriser l''**indice** du maximum : la valeur s''obtient par T[iMax]. Initialiser le maximum à 0 serait une erreur si toutes les valeurs sont négatives.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-compter-voyelles', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'chaines-caracteres'), 'pseudocode', 'Compter les voyelles', 'Lisez une phrase et affichez le nombre de voyelles qu''elle contient (a, e, i, o, u, y, en majuscules ou minuscules, sans accents).', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"Bonjour UPL","output":"4"}]'::jsonb, '{}'::text[], '', array['Parcourez la chaîne avec POUR i DE 1 A LONGUEUR(phrase).', 'MINUSCULE(phrase) évite de tester les majuscules.', 'Une condition avec plusieurs OU teste chaque voyelle.']::text[], 10, false, 'publie', 15, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-compter-voyelles');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'Bonjour UPL', '4', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'rythme', '2', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'AEIOUY aeiouy', '12', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'xyz', '1', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-compter-voyelles'), 'ALGORITHME Voyelles
VARIABLES
  phrase : CHAINE
  c : CARACTERE
  i, nb : ENTIER
DEBUT
  LIRE(phrase)
  phrase ← MINUSCULE(phrase)
  nb ← 0
  POUR i DE 1 A LONGUEUR(phrase) FAIRE
    c ← phrase[i]
    SI c = "a" OU c = "e" OU c = "i" OU c = "o" OU c = "u" OU c = "y" ALORS
      nb ← nb + 1
    FINSI
  FINPOUR
  ECRIRE(nb)
FIN', 'On convertit d''abord la phrase en minuscules pour n''avoir que six cas à tester. Le compteur nb est augmenté à chaque voyelle rencontrée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-fonction-puissance', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fonctions-procedures'), 'pseudocode', 'Fonction puissance', 'Écrivez une **fonction** puissance(x : ENTIER, n : ENTIER) : ENTIER qui calcule x^n **avec une boucle** (sans utiliser ^). Le programme principal lit x puis n (n ≥ 0) et affiche le résultat.', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"2\n10","output":"1024"}]'::jsonb, array['Ne pas utiliser l''opérateur ^ ni la fonction PUISSANCE.']::text[], 'ALGORITHME Puissance

FONCTION puissance(x : ENTIER, n : ENTIER) : ENTIER
VARIABLES
  i, r : ENTIER
DEBUT
  // À compléter
FIN

VARIABLES
  a, b : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE(puissance(a, b))
FIN', array['x^n = x × x × … × x (n fois).', 'Initialisez r à 1, multipliez-le n fois par x, puis RETOURNER r.']::text[], 10, false, 'publie', 16, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-fonction-puissance');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '2
10', '1024', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '5
0', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '-3
3', '-27', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-fonction-puissance'), 'ALGORITHME Puissance

FONCTION puissance(x : ENTIER, n : ENTIER) : ENTIER
VARIABLES
  i, r : ENTIER
DEBUT
  r ← 1
  POUR i DE 1 A n FAIRE
    r ← r * x
  FINPOUR
  RETOURNER r
FIN

VARIABLES
  a, b : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE(puissance(a, b))
FIN', 'La fonction utilise un accumulateur de produit r initialisé à 1. Pour n = 0, la boucle ne s''exécute pas et la fonction retourne 1, ce qui est correct (x^0 = 1).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-somme-chiffres-recursive', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recursivite'), 'pseudocode', 'Somme des chiffres (récursive)', 'Écrivez une fonction **récursive** sommeChiffres(n : ENTIER) : ENTIER qui retourne la somme des chiffres d''un entier n ≥ 0. Le programme lit n et affiche le résultat.', 'avance', 'ecrire_algorithme', '{}'::text[], '[{"input":"4096","output":"19"}]'::jsonb, array['La fonction doit être récursive (pas de boucle).']::text[], '', array['Le dernier chiffre de n est n MOD 10 ; le reste du nombre est n DIV 10.', 'Cas de base : si n < 10, la somme des chiffres est n lui-même.', 'Cas récursif : (n MOD 10) + sommeChiffres(n DIV 10).']::text[], 10, true, 'publie', 17, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-chiffres-recursive');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '4096', '19', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '7', '7', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '0', '0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '999999', '54', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), 'ALGORITHME SommeChiffres

FONCTION sommeChiffres(n : ENTIER) : ENTIER
DEBUT
  SI n < 10 ALORS
    RETOURNER n
  FINSI
  RETOURNER (n MOD 10) + sommeChiffres(n DIV 10)
FIN

VARIABLES
  n : ENTIER
DEBUT
  LIRE(n)
  ECRIRE(sommeChiffres(n))
FIN', '- **Cas de base** : un nombre à un seul chiffre.
- **Cas récursif** : on isole le dernier chiffre (MOD 10) et on rappelle la fonction sur le nombre privé de ce chiffre (DIV 10), qui est plus petit : on se rapproche du cas de base.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-recherche-sequentielle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'pseudocode', 'Recherche séquentielle', 'Lisez n (1 ≤ n ≤ 100), puis n entiers, puis une valeur x. Affichez la position de la **première** occurrence de x, ou **absent** si x n''est pas dans le tableau.', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"4\n7\n3\n9\n3\n3","output":"2"}]'::jsonb, '{}'::text[], '', array['Parcourez le tableau tant que vous n''avez pas trouvé et que vous n''êtes pas à la fin.', 'Une boucle TANT QUE avec deux conditions combinées par ET convient bien.']::text[], 10, false, 'publie', 18, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-recherche-sequentielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '4
7
3
9
3
3', '2', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '3
1
2
3
5', 'absent', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '1
8
8', '1', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), 'ALGORITHME Recherche
VARIABLES
  T : TABLEAU[1..100] DE ENTIER
  n, i, x : ENTIER
DEBUT
  LIRE(n)
  POUR i DE 1 A n FAIRE
    LIRE(T[i])
  FINPOUR
  LIRE(x)
  i ← 1
  TANT QUE i <= n ET T[i] <> x FAIRE
    i ← i + 1
  FINTANTQUE
  SI i <= n ALORS
    ECRIRE(i)
  SINON
    ECRIRE("absent")
  FINSI
FIN', 'La condition **i <= n ET T[i] <> x** est évaluée de gauche à droite : si i dépasse n, la seconde partie n''est pas évaluée, ce qui évite un accès hors limites. À la sortie, i <= n signifie que x a été trouvé.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-tri-bulles', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'pseudocode', 'Tri à bulles', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Triez-les par ordre croissant avec le **tri à bulles** et affichez-les sur une seule ligne, séparés par un espace.', 'avance', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n5\n1\n4\n2\n8","output":"1 2 4 5 8"}]'::jsonb, '{}'::text[], '', array['Comparez chaque paire de voisins T[j] et T[j + 1] ; échangez-les s''ils sont mal ordonnés.', 'Après le passage numéro i, les i plus grands éléments sont à leur place.', 'Construisez la ligne de sortie avec une chaîne : ligne ← ligne + CHAINE(T[i]).']::text[], 10, true, 'publie', 19, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-tri-bulles');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '5
5
1
4
2
8', '1 2 4 5 8', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '1
3', '3', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '6
3
3
-1
0
10
-5', '-5 -1 0 3 3 10', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-tri-bulles'), 'ALGORITHME TriBulles
VARIABLES
  T : TABLEAU[1..100] DE ENTIER
  n, i, j, tmp : ENTIER
  ligne : CHAINE
DEBUT
  LIRE(n)
  POUR i DE 1 A n FAIRE
    LIRE(T[i])
  FINPOUR
  POUR i DE 1 A n - 1 FAIRE
    POUR j DE 1 A n - i FAIRE
      SI T[j] > T[j + 1] ALORS
        tmp ← T[j]
        T[j] ← T[j + 1]
        T[j + 1] ← tmp
      FINSI
    FINPOUR
  FINPOUR
  ligne ← CHAINE(T[1])
  POUR i DE 2 A n FAIRE
    ligne ← ligne + " " + CHAINE(T[i])
  FINPOUR
  ECRIRE(ligne)
FIN', 'La boucle interne s''arrête à n - i car les i derniers éléments sont déjà triés. Pour l''affichage, on commence la ligne par le premier élément afin d''éviter un espace en trop.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-nombres-premiers', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'resolution-problemes'), 'pseudocode', 'Nombres premiers', 'Lisez un entier n ≥ 2 et affichez tous les nombres premiers inférieurs ou égaux à n, séparés par un espace, sur une seule ligne.

Un nombre est premier s''il a exactement deux diviseurs : 1 et lui-même.', 'avance', 'probleme', '{}'::text[], '[{"input":"20","output":"2 3 5 7 11 13 17 19"}]'::jsonb, '{}'::text[], '', array['Écrivez d''abord une fonction estPremier(k : ENTIER) : BOOLEEN.', 'Il suffit de tester les diviseurs d de 2 tant que d * d <= k.', 'Construisez la ligne de résultat avec une chaîne.']::text[], 10, false, 'publie', 20, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-nombres-premiers');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '20', '2 3 5 7 11 13 17 19', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '2', '2', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '50', '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-nombres-premiers'), 'ALGORITHME Premiers

FONCTION estPremier(k : ENTIER) : BOOLEEN
VARIABLES
  d : ENTIER
DEBUT
  SI k < 2 ALORS
    RETOURNER FAUX
  FINSI
  d ← 2
  TANT QUE d * d <= k FAIRE
    SI k MOD d = 0 ALORS
      RETOURNER FAUX
    FINSI
    d ← d + 1
  FINTANTQUE
  RETOURNER VRAI
FIN

VARIABLES
  n, k : ENTIER
  ligne : CHAINE
DEBUT
  LIRE(n)
  ligne ← ""
  POUR k DE 2 A n FAIRE
    SI estPremier(k) ALORS
      SI ligne = "" ALORS
        ligne ← CHAINE(k)
      SINON
        ligne ← ligne + " " + CHAINE(k)
      FINSI
    FINSI
  FINPOUR
  ECRIRE(ligne)
FIN', 'La décomposition en une fonction **estPremier** rend le programme lisible. Tester les diviseurs jusqu''à la racine carrée (d × d <= k) suffit : si k = a × b avec a <= b, alors a <= √k.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-caisse', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'resolution-problemes'), 'pseudocode', 'Mini-projet : caisse de la cafétéria', 'La cafétéria de l''université veut un programme de caisse.

**Entrées** : une suite de lignes, chacune contenant un prix unitaire (réel) puis, sur la ligne suivante, une quantité (entier). La saisie se termine par un prix égal à **0**.

**Sorties** :

~~~text
Articles : <quantité totale>
Total : <montant total>
Remise : <montant de la remise>
A payer : <montant final>
~~~

Une remise de **10 %** est accordée si le total dépasse **strictement 50**.', 'avance', 'mini_projet', '{}'::text[], '[{"input":"2.5\n4\n30\n1\n0","output":"Articles : 5\nTotal : 40\nRemise : 0\nA payer : 40"}]'::jsonb, '{}'::text[], '', array['Utilisez une valeur sentinelle (prix = 0) avec TANT QUE.', 'Deux accumulateurs : la quantité totale et le montant total.', 'Calculez la remise après la boucle, avec un SI.']::text[], 30, true, 'publie', 21, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-caisse');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '2.5
4
30
1
0', 'Articles : 5
Total : 40
Remise : 0
A payer : 40', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '20
3
0', 'Articles : 3
Total : 60
Remise : 6
A payer : 54', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '0', 'Articles : 0
Total : 0
Remise : 0
A payer : 0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '50
1
0', 'Articles : 1
Total : 50
Remise : 0
A payer : 50', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-caisse'), 'ALGORITHME Caisse
VARIABLES
  prix, total, remise : REEL
  qte, articles : ENTIER
DEBUT
  total ← 0
  articles ← 0
  LIRE(prix)
  TANT QUE prix <> 0 FAIRE
    LIRE(qte)
    total ← total + prix * qte
    articles ← articles + qte
    LIRE(prix)
  FINTANTQUE
  SI total > 50 ALORS
    remise ← total * 0.1
  SINON
    remise ← 0
  FINSI
  ECRIRE("Articles : ", articles)
  ECRIRE("Total : ", total)
  ECRIRE("Remise : ", remise)
  ECRIRE("A payer : ", total - remise)
FIN', 'Le programme combine une **boucle à sentinelle**, deux **accumulateurs** et une **condition** finale. Le cas limite « total = 50 » ne donne pas de remise car la condition est « strictement supérieur ».')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-trois-lignes', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Présentation en trois lignes', 'Lisez un prénom puis une filière et affichez exactement ces trois lignes :

~~~text
Bienvenue <prénom> !
Filière : <filière>
Bon courage pour cette année.
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Amani\nInformatique","output":"Bienvenue Amani !\nFilière : Informatique\nBon courage pour cette année."}]'::jsonb, '{}'::text[], '', array['Deux LIRE, puis trois ECRIRE, dans cet ordre.', 'Attention à l''espace avant le point d''exclamation : ECRIRE("Bienvenue ", prenom, " !").']::text[], 5, false, 'publie', 22, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-trois-lignes');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-trois-lignes'), null, 'Amani
Informatique', 'Bienvenue Amani !
Filière : Informatique
Bon courage pour cette année.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-trois-lignes'), null, 'Grâce
Intelligence Artificielle', 'Bienvenue Grâce !
Filière : Intelligence Artificielle
Bon courage pour cette année.', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-trois-lignes'), 'ALGORITHME Presentation
VARIABLES
  prenom, filiere : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(filiere)
  ECRIRE("Bienvenue ", prenom, " !")
  ECRIRE("Filière : ", filiere)
  ECRIRE("Bon courage pour cette année.")
FIN', 'Exécution séquentielle : les deux lectures d''abord, puis les trois affichages dans l''ordre demandé. Une filière peut contenir des espaces : une variable CHAINE reçoit toute la ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-carre-perimetre', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Périmètre et aire d''un carré', 'Lisez la longueur du côté d''un carré (un réel) et affichez :

~~~text
Périmètre : <4 × côté>
Aire : <côté × côté>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3","output":"Périmètre : 12\nAire : 9"}]'::jsonb, '{}'::text[], '', array['Entrée : le côté. Sorties : le périmètre et l''aire.', 'Le côté peut être décimal : choisissez le type REEL.']::text[], 5, false, 'publie', 23, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-carre-perimetre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '3', 'Périmètre : 12
Aire : 9', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '2.5', 'Périmètre : 10
Aire : 6.25', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '0', 'Périmètre : 0
Aire : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-carre-perimetre'), 'ALGORITHME Carre
VARIABLES
  cote : REEL
DEBUT
  LIRE(cote)
  ECRIRE("Périmètre : ", 4 * cote)
  ECRIRE("Aire : ", cote * cote)
FIN', 'Les expressions sont calculées directement dans ECRIRE. Le cas limite côté = 0 est valide et donne 0 pour les deux résultats.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-intervalle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Appartenance à un intervalle', 'Lisez un nombre x (réel). Affichez **VRAI** si x appartient à l''intervalle [10 ; 20] (bornes incluses), **FAUX** sinon. N''utilisez pas de structure SI : affichez directement la valeur d''une condition.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"15","output":"VRAI"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['Une condition a une valeur VRAI ou FAUX : on peut l''afficher avec ECRIRE.', 'Deux comparaisons reliées par ET : (x >= 10) ET (x <= 20).']::text[], 10, false, 'publie', 24, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-intervalle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '15', 'VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '25', 'FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '10', 'VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '20', 'VRAI', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '9.99', 'FAUX', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-intervalle'), 'ALGORITHME Intervalle
VARIABLES
  x : REEL
DEBUT
  LIRE(x)
  ECRIRE((x >= 10) ET (x <= 20))
FIN', 'Les bornes sont incluses : on utilise >= et <=. Les tests cachés vérifient précisément les cas limites 10 et 20.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-table-verite', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Calculateur de connecteurs logiques', 'Lisez deux booléens a et b (saisis VRAI ou FAUX) et affichez :

~~~text
a ET b : <valeur>
a OU b : <valeur>
NON a : <valeur>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"VRAI\nFAUX","output":"a ET b : FAUX\na OU b : VRAI\nNON a : FAUX"}]'::jsonb, '{}'::text[], '', array['Déclarez a et b de type BOOLEEN : LIRE convertit VRAI/FAUX.', 'ECRIRE("a ET b : ", a ET b)']::text[], 10, false, 'publie', 25, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-table-verite');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'VRAI
FAUX', 'a ET b : FAUX
a OU b : VRAI
NON a : FAUX', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'VRAI
VRAI', 'a ET b : VRAI
a OU b : VRAI
NON a : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'FAUX
FAUX', 'a ET b : FAUX
a OU b : FAUX
NON a : VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'FAUX
VRAI', 'a ET b : FAUX
a OU b : VRAI
NON a : VRAI', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-table-verite'), 'ALGORITHME Connecteurs
VARIABLES
  a, b : BOOLEEN
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE("a ET b : ", a ET b)
  ECRIRE("a OU b : ", a OU b)
  ECRIRE("NON a : ", NON a)
FIN', 'Les quatre tests correspondent aux quatre lignes de la table de vérité : c''est un jeu d''essai **exhaustif**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-de-morgan', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Vérifier une loi de De Morgan', 'Lisez deux booléens a et b. Affichez la valeur de NON (a ET b), puis celle de (NON a) OU (NON b), puis si les deux sont égales :

~~~text
NON (a ET b) : <valeur>
NON a OU NON b : <valeur>
Égales : <valeur>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"VRAI\nFAUX","output":"NON (a ET b) : VRAI\nNON a OU NON b : VRAI\nÉgales : VRAI"}]'::jsonb, '{}'::text[], '', array['Deux booléens se comparent avec =.', 'Mettez des parenthèses : (NON (a ET b)) = ((NON a) OU (NON b)).']::text[], 10, false, 'publie', 26, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-de-morgan');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'VRAI
FAUX', 'NON (a ET b) : VRAI
NON a OU NON b : VRAI
Égales : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'VRAI
VRAI', 'NON (a ET b) : FAUX
NON a OU NON b : FAUX
Égales : VRAI', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'FAUX
FAUX', 'NON (a ET b) : VRAI
NON a OU NON b : VRAI
Égales : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-de-morgan'), 'ALGORITHME VerifDeMorgan
VARIABLES
  a, b, g, d : BOOLEEN
DEBUT
  LIRE(a)
  LIRE(b)
  g ← NON (a ET b)
  d ← (NON a) OU (NON b)
  ECRIRE("NON (a ET b) : ", g)
  ECRIRE("NON a OU NON b : ", d)
  ECRIRE("Égales : ", g = d)
FIN', 'Pour toutes les entrées, les deux expressions sont égales : c''est exactement ce qu''affirme la loi de De Morgan. Ranger chaque expression dans une variable rend l''algorithme plus lisible.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-prix-ttc', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Prix toutes taxes comprises', 'Un magasin applique une TVA de **16 %**. Lisez le prix unitaire hors taxes (réel) puis la quantité (entier) et affichez :

~~~text
Total HT : <prix × quantité>
TVA : <16 % du total HT>
Total TTC : <total HT + TVA>
~~~', 'debutant', 'probleme', '{}'::text[], '[{"input":"1000\n3","output":"Total HT : 3000\nTVA : 480\nTotal TTC : 3480"}]'::jsonb, '{}'::text[], '', array['Commencez par écrire les données, les résultats et un jeu d''essai.', 'Déclarez TAUX_TVA = 0.16 dans la section CONSTANTES.', 'Calculez d''abord le total HT, puis la TVA à partir de ce total.']::text[], 10, false, 'publie', 27, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-prix-ttc');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '1000
3', 'Total HT : 3000
TVA : 480
Total TTC : 3480', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '2500
0', 'Total HT : 0
TVA : 0
Total TTC : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '125
4', 'Total HT : 500
TVA : 80
Total TTC : 580', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-prix-ttc'), 'ALGORITHME PrixTTC
CONSTANTES
  TAUX_TVA = 0.16
VARIABLES
  prix, totalHT, tva : REEL
  quantite : ENTIER
DEBUT
  LIRE(prix)
  LIRE(quantite)
  totalHT ← prix * quantite
  tva ← totalHT * TAUX_TVA
  ECRIRE("Total HT : ", totalHT)
  ECRIRE("TVA : ", tva)
  ECRIRE("Total TTC : ", totalHT + tva)
FIN', 'Décomposition : total HT, puis TVA, puis total TTC. La constante TAUX_TVA permet de changer le taux en une seule ligne. Le cas quantité = 0 est un cas limite valide.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-rendu-monnaie', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Rendu de monnaie', 'Lisez un montant m en francs congolais (entier, multiple de 100). Décomposez-le avec le moins de coupures possible en billets de 5 000, 1 000 et 500 FC et en pièces de 100 FC. Affichez :

~~~text
5000 FC : <nombre>
1000 FC : <nombre>
500 FC : <nombre>
100 FC : <nombre>
~~~', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"7600","output":"5000 FC : 1\n1000 FC : 2\n500 FC : 1\n100 FC : 1"}]'::jsonb, '{}'::text[], '', array['Le nombre de billets de 5 000 est le quotient m DIV 5000.', 'Il reste alors m MOD 5000 à rendre : recommencez avec 1 000.', 'Utilisez une variable reste mise à jour après chaque coupure.']::text[], 10, true, 'publie', 28, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-rendu-monnaie');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '7600', '5000 FC : 1
1000 FC : 2
500 FC : 1
100 FC : 1', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '0', '5000 FC : 0
1000 FC : 0
500 FC : 0
100 FC : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '5000', '5000 FC : 1
1000 FC : 0
500 FC : 0
100 FC : 0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '400', '5000 FC : 0
1000 FC : 0
500 FC : 0
100 FC : 4', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '23900', '5000 FC : 4
1000 FC : 3
500 FC : 1
100 FC : 4', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), 'ALGORITHME Monnaie
VARIABLES
  m, reste : ENTIER
DEBUT
  LIRE(m)
  ECRIRE("5000 FC : ", m DIV 5000)
  reste ← m MOD 5000
  ECRIRE("1000 FC : ", reste DIV 1000)
  reste ← reste MOD 1000
  ECRIRE("500 FC : ", reste DIV 500)
  reste ← reste MOD 500
  ECRIRE("100 FC : ", reste DIV 100)
FIN', 'À chaque étape, le quotient donne le nombre de coupures et le reste ce qu''il reste à rendre. Le jeu d''essai du cours (0, 5 000, 400) couvre les cas limites.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-semaines-jours', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Semaines, jours et heures', 'Lisez une durée en heures (entier ≥ 0) et affichez-la en semaines, jours et heures :

~~~text
<s> semaine(s) <j> jour(s) <h> heure(s)
~~~', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"200","output":"1 semaine(s) 1 jour(s) 8 heure(s)"}]'::jsonb, '{}'::text[], '', array['Une semaine = 168 heures, un jour = 24 heures.', 'Semaines : total DIV 168 ; il reste total MOD 168 heures.']::text[], 10, false, 'publie', 29, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-semaines-jours');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '200', '1 semaine(s) 1 jour(s) 8 heure(s)', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '23', '0 semaine(s) 0 jour(s) 23 heure(s)', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '168', '1 semaine(s) 0 jour(s) 0 heure(s)', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '0', '0 semaine(s) 0 jour(s) 0 heure(s)', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-semaines-jours'), 'ALGORITHME DureeHeures
CONSTANTES
  H_SEMAINE = 168
  H_JOUR = 24
VARIABLES
  total, s, j, h : ENTIER
DEBUT
  LIRE(total)
  s ← total DIV H_SEMAINE
  j ← (total MOD H_SEMAINE) DIV H_JOUR
  h ← total MOD H_JOUR
  ECRIRE(s, " semaine(s) ", j, " jour(s) ", h, " heure(s)")
FIN', 'Les heures restantes se calculent directement par total MOD 24, car 168 est un multiple de 24.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-permutation-circulaire', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Permutation circulaire', 'Lisez trois entiers a, b et c. Faites tourner leurs valeurs : a reçoit l''ancienne valeur de b, b celle de c, c celle de a. Affichez ensuite a, b et c séparés par un espace.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"1\n2\n3","output":"2 3 1"}]'::jsonb, array['Utilisez exactement une variable auxiliaire.', 'Les valeurs doivent réellement être échangées dans les variables (pas seulement affichées dans un autre ordre).']::text[], '', array['Sauvegardez d''abord la valeur qui va être écrasée en premier.', 'temp ← a, puis a ← b, b ← c, c ← temp.']::text[], 10, false, 'publie', 30, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-permutation-circulaire');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '1
2
3', '2 3 1', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '7
7
0', '7 0 7', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '-5
10
20', '10 20 -5', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), 'ALGORITHME Rotation
VARIABLES
  a, b, c, temp : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  LIRE(c)
  temp ← a
  a ← b
  b ← c
  c ← temp
  ECRIRE(a, " ", b, " ", c)
FIN', 'Chaque affectation écrase une valeur : on sauvegarde **a** avant tout. Faites la trace : avec 1, 2, 3, temp = 1, puis a = 2, b = 3, c = 1.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-solde-compte', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Suivi d''un compte', 'Lisez le solde initial d''un compte, puis le montant d''un dépôt, puis le montant d''un retrait (des réels). Mettez à jour **une seule variable solde** après chaque opération et affichez :

~~~text
Après dépôt : <solde>
Après retrait : <solde>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"10000\n2500\n4000","output":"Après dépôt : 12500\nAprès retrait : 8500"}]'::jsonb, '{}'::text[], '', array['solde ← solde + depot', 'Affichez le solde juste après chaque mise à jour.']::text[], 10, false, 'publie', 31, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-solde-compte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '10000
2500
4000', 'Après dépôt : 12500
Après retrait : 8500', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '0
0
0', 'Après dépôt : 0
Après retrait : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '150.5
49.5
200', 'Après dépôt : 200
Après retrait : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-solde-compte'), 'ALGORITHME Compte
VARIABLES
  solde, depot, retrait : REEL
DEBUT
  LIRE(solde)
  LIRE(depot)
  LIRE(retrait)
  solde ← solde + depot
  ECRIRE("Après dépôt : ", solde)
  solde ← solde - retrait
  ECRIRE("Après retrait : ", solde)
FIN', 'La même variable évolue : sa valeur dépend du moment où on l''affiche. C''est ce que montre un tableau de suivi.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-celsius-fahrenheit', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Conversion Celsius → Fahrenheit', 'Lisez une température en degrés Celsius (réel) et affichez-la en degrés Fahrenheit, sachant que F = C × 9 / 5 + 32 :

~~~text
<F> °F
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"100","output":"212 °F"}]'::jsonb, '{}'::text[], '', array['La division produit un réel : déclarez des variables REEL.', 'ECRIRE(f, " °F")']::text[], 10, false, 'publie', 32, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-celsius-fahrenheit');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '100', '212 °F', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '0', '32 °F', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '-40', '-40 °F', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '36.6', '97.88 °F', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), 'ALGORITHME Fahrenheit
VARIABLES
  c, f : REEL
DEBUT
  LIRE(c)
  f ← c * 9 / 5 + 32
  ECRIRE(f, " °F")
FIN', 'Avec des variables ENTIER, 36.6 ne pourrait pas être lu et c × 9 / 5 ne pourrait pas être rangé : le type REEL s''impose. −40 est la température où les deux échelles coïncident.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-initiales', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Initiales', 'Lisez un prénom puis un nom et affichez les initiales en majuscules, chacune suivie d''un point (exemple : « Grâce » et « mutombo » → **G.M.**).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Grâce\nmutombo","output":"G.M."}]'::jsonb, '{}'::text[], '', array['Le premier caractère d''une chaîne s s''obtient par s[1].', 'MAJUSCULE transforme un texte en majuscules ; + concatène des chaînes.']::text[], 10, false, 'publie', 33, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-initiales');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'Grâce
mutombo', 'G.M.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'jean
Kabila', 'J.K.', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'élise
ngoy', 'É.N.', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-initiales'), 'ALGORITHME Initiales
VARIABLES
  prenom, nom : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(nom)
  ECRIRE(MAJUSCULE(prenom[1] + "." + nom[1] + "."))
FIN', 'prenom[1] est un caractère, que l''on concatène avec "." pour former une chaîne, puis MAJUSCULE s''applique à l''ensemble.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-majeur', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Majeur ou mineur ?', 'Lisez l''année de naissance d''une personne. Calculez son âge en 2026 et rangez dans une variable **BOOLEEN** le fait qu''elle soit majeure (18 ans ou plus). Affichez :

~~~text
Âge : <âge>
Majeur : <VRAI ou FAUX>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"2005","output":"Âge : 21\nMajeur : VRAI"}]'::jsonb, '{}'::text[], '', array['majeur ← age >= 18', 'Pas besoin de SI : une comparaison produit déjà un booléen.']::text[], 10, false, 'publie', 34, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-majeur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2005', 'Âge : 21
Majeur : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2010', 'Âge : 16
Majeur : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2008', 'Âge : 18
Majeur : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-majeur'), 'ALGORITHME Majorite
CONSTANTES
  ANNEE = 2026
VARIABLES
  naissance, age : ENTIER
  majeur : BOOLEEN
DEBUT
  LIRE(naissance)
  age ← ANNEE - naissance
  majeur ← age >= 18
  ECRIRE("Âge : ", age)
  ECRIRE("Majeur : ", majeur)
FIN', 'Le cas limite 18 ans doit donner VRAI : la comparaison est **>=**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-chiffres', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Somme et inversion des chiffres', 'Lisez un entier n compris entre 100 et 999. Affichez la somme de ses chiffres, puis le nombre obtenu en inversant ses chiffres :

~~~text
Somme : <somme>
Inversé : <nombre inversé>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"375","output":"Somme : 15\nInversé : 573"}]'::jsonb, '{}'::text[], '', array['Unités : n MOD 10 ; dizaines : (n DIV 10) MOD 10 ; centaines : n DIV 100.', 'Nombre inversé : u × 100 + d × 10 + c.']::text[], 10, true, 'publie', 35, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-chiffres');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '375', 'Somme : 15
Inversé : 573', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '100', 'Somme : 1
Inversé : 1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '999', 'Somme : 27
Inversé : 999', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '120', 'Somme : 3
Inversé : 21', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-chiffres'), 'ALGORITHME Chiffres
VARIABLES
  n, c, d, u : ENTIER
DEBUT
  LIRE(n)
  u ← n MOD 10
  d ← (n DIV 10) MOD 10
  c ← n DIV 100
  ECRIRE("Somme : ", c + d + u)
  ECRIRE("Inversé : ", u * 100 + d * 10 + c)
FIN', 'DIV et MOD par 10 isolent les chiffres. Pour 100, l''inversé est 001, c''est-à-dire le nombre 1 : un entier n''a pas de zéros en tête.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-divisibilite', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Tests de divisibilité', 'Lisez un entier n et affichez, sans structure SI :

~~~text
Pair : <VRAI/FAUX>
Multiple de 3 : <VRAI/FAUX>
Multiple de 6 : <VRAI/FAUX>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"12","output":"Pair : VRAI\nMultiple de 3 : VRAI\nMultiple de 6 : VRAI"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['n est un multiple de k si n MOD k = 0.', 'Un multiple de 6 est un nombre pair ET multiple de 3 (ou simplement n MOD 6 = 0).']::text[], 10, false, 'publie', 36, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-divisibilite');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '12', 'Pair : VRAI
Multiple de 3 : VRAI
Multiple de 6 : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '9', 'Pair : FAUX
Multiple de 3 : VRAI
Multiple de 6 : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '0', 'Pair : VRAI
Multiple de 3 : VRAI
Multiple de 6 : VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '-4', 'Pair : VRAI
Multiple de 3 : FAUX
Multiple de 6 : FAUX', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-divisibilite'), 'ALGORITHME Divisibilite
VARIABLES
  n : ENTIER
DEBUT
  LIRE(n)
  ECRIRE("Pair : ", n MOD 2 = 0)
  ECRIRE("Multiple de 3 : ", n MOD 3 = 0)
  ECRIRE("Multiple de 6 : ", (n MOD 2 = 0) ET (n MOD 3 = 0))
FIN', '0 est un multiple de tous les entiers (0 MOD k = 0). Pour −4, le reste de la division par 2 est 0 : on teste « = 0 », ce qui fonctionne quel que soit le signe.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-facture', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Facture formatée', 'Lisez le nom d''un article, son prix unitaire (réel) et la quantité (entier). Affichez exactement :

~~~text
===== FACTURE =====
Article : <nom>
Quantité : <quantité> x <prix> FC
Total : <total> FC
===================
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Cahier\n1500\n4","output":"===== FACTURE =====\nArticle : Cahier\nQuantité : 4 x 1500 FC\nTotal : 6000 FC\n==================="}]'::jsonb, '{}'::text[], '', array['Cinq ECRIRE ; respectez les espaces autour de « : » et de « x ».', 'Le total est prix × quantité.']::text[], 10, false, 'publie', 37, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-facture');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-facture'), null, 'Cahier
1500
4', '===== FACTURE =====
Article : Cahier
Quantité : 4 x 1500 FC
Total : 6000 FC
===================', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-facture'), null, 'Stylo bleu
250.5
2', '===== FACTURE =====
Article : Stylo bleu
Quantité : 2 x 250.5 FC
Total : 501 FC
===================', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-facture'), 'ALGORITHME Facture
VARIABLES
  article : CHAINE
  prix : REEL
  quantite : ENTIER
DEBUT
  LIRE(article)
  LIRE(prix)
  LIRE(quantite)
  ECRIRE("===== FACTURE =====")
  ECRIRE("Article : ", article)
  ECRIRE("Quantité : ", quantite, " x ", prix, " FC")
  ECRIRE("Total : ", prix * quantite, " FC")
  ECRIRE("===================")
FIN', 'L''essentiel est le **format** : la sortie est comparée ligne par ligne. Le nom de l''article peut contenir des espaces.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
commit;
