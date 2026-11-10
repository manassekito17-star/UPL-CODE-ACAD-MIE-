-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 12 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '5 2 9 1 5 6', '1 2 5 5 6 9', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '1', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '3 -1 0 -7 8', '-7 -1 0 3 8', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-tri-insertion'), 'L = list(map(int, input().split()))
for i in range(1, len(L)):
    cle = L[i]
    j = i - 1
    while j >= 0 and L[j] > cle:
        L[j + 1] = L[j]
        j -= 1
    L[j + 1] = cle
print(" ".join(map(str, L)))', 'La partie gauche L[0..i-1] est toujours triée. On y insère L[i] en décalant les éléments plus grands. Complexité : O(n²) dans le pire cas, O(n) si la liste est déjà triée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-dichotomie', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'recherche-tri'), 'python', 'Recherche dichotomique', 'La première ligne contient des entiers **triés** ; la seconde une valeur x. Affichez l''indice (à partir de 0) de x dans la liste, ou **-1** s''il est absent. Utilisez une recherche **dichotomique**.', 'avance', 'ecrire_programme', '{}'::text[], '[{"input":"1 3 5 7 9 11\n7","output":"3"}]'::jsonb, '{}'::text[], '', array['Gardez deux bornes debut et fin.', 'milieu = (debut + fin) // 2']::text[], 10, false, 'publie', 90, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-dichotomie');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-dichotomie'), null, '1 3 5 7 9 11
7', '3', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-dichotomie'), null, '1 3 5 7 9 11
4', '-1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-dichotomie'), null, '2
2', '0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-dichotomie'), null, '10 20 30 40 50 60 70 80
80', '7', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-dichotomie'), 'L = list(map(int, input().split()))
x = int(input())
debut, fin = 0, len(L) - 1
position = -1
while debut <= fin:
    milieu = (debut + fin) // 2
    if L[milieu] == x:
        position = milieu
        break
    elif x < L[milieu]:
        fin = milieu - 1
    else:
        debut = milieu + 1
print(position)', 'À chaque tour, la zone de recherche est divisée par deux : complexité O(log n).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('py-statistiques', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'science-donnees-ia'), 'python', 'Statistiques descriptives', 'Lisez une ligne de notes (réels) et affichez, arrondis à 2 décimales :

~~~text
Moyenne : …
Médiane : …
Écart type : …
~~~

L''écart type est la racine de la moyenne des carrés des écarts à la moyenne (écart type de population). Programmez les calculs vous-même, sans le module statistics.', 'avance', 'mini_projet', '{}'::text[], '[{"input":"10 12 14 16","output":"Moyenne : 13.0\nMédiane : 13.0\nÉcart type : 2.24"}]'::jsonb, '{}'::text[], '', array['La médiane d''une liste triée de taille paire est la moyenne des deux valeurs centrales.', 'variance = sum((x - moyenne) ** 2 for x in notes) / n', 'round(valeur, 2)']::text[], 25, false, 'publie', 91, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-statistiques');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-statistiques'), null, '10 12 14 16', 'Moyenne : 13.0
Médiane : 13.0
Écart type : 2.24', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-statistiques'), null, '5 18 9', 'Moyenne : 10.67
Médiane : 9.0
Écart type : 5.44', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'py-statistiques'), null, '12', 'Moyenne : 12.0
Médiane : 12.0
Écart type : 0.0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-statistiques'), 'notes = list(map(float, input().split()))
n = len(notes)
moyenne = sum(notes) / n
triees = sorted(notes)
if n % 2 == 1:
    mediane = triees[n // 2]
else:
    mediane = (triees[n // 2 - 1] + triees[n // 2]) / 2
ecart = (sum((x - moyenne) ** 2 for x in notes) / n) ** 0.5
print("Moyenne :", round(moyenne, 2))
print("Médiane :", round(mediane, 2))
print("Écart type :", round(ecart, 2))', 'On trie une copie pour la médiane, en distinguant taille paire et impaire. L''écart type mesure la dispersion des notes autour de la moyenne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-bonjour', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'structure-programme'), 'c', 'Bonjour en C', 'Affichez exactement **Bonjour UPL** suivi d''un retour à la ligne.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], '#include <stdio.h>

int main(void) {
    // Votre code ici
    return 0;
}', array['printf affiche du texte.', '\n passe à la ligne : printf("Bonjour UPL\n");']::text[], 5, false, 'publie', 92, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-bonjour'), null, '', 'Bonjour UPL', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-bonjour'), '#include <stdio.h>

int main(void) {
    printf("Bonjour UPL\n");
    return 0;
}', 'Une seule instruction printf ; n''oubliez pas le point-virgule ni le \n final.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-somme', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'entrees-sorties'), 'c', 'Somme et moyenne', 'Lisez deux entiers et affichez :

~~~text
Somme : <a + b>
Moyenne : <moyenne avec 1 décimale>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"7 8","output":"Somme : 15\nMoyenne : 7.5"}]'::jsonb, '{}'::text[], '', array['scanf("%d %d", &a, &b);', 'Divisez par 2.0 pour obtenir un réel.', '%.1f affiche une décimale.']::text[], 10, false, 'publie', 93, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-somme'), null, '7 8', 'Somme : 15
Moyenne : 7.5', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-somme'), null, '10 10', 'Somme : 20
Moyenne : 10.0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-somme'), null, '-3 4', 'Somme : 1
Moyenne : 0.5', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-somme'), '#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Somme : %d\n", a + b);
    printf("Moyenne : %.1f\n", (a + b) / 2.0);
    return 0;
}', '(a + b) / 2 serait une division entière (7 au lieu de 7.5) : on divise par **2.0**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-pair-impair', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'conditions'), 'c', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"8","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 == 0 pour un nombre pair.']::text[], 5, false, 'publie', 94, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-pair-impair'), null, '8', 'pair', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-pair-impair'), null, '13', 'impair', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-pair-impair'), null, '-7', 'impair', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-pair-impair'), '#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) printf("pair\n");
    else printf("impair\n");
    return 0;
}', 'En C, -7 % 2 vaut -1 : tester == 0 fonctionne pour tous les signes.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-table', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'boucles'), 'c', 'Table de multiplication', 'Lisez n et affichez sa table de 1 à 10 au format **n x i = résultat**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4","output":"4 x 1 = 4\n…\n4 x 10 = 40"}]'::jsonb, '{}'::text[], '', array['for (int i = 1; i <= 10; i++)']::text[], 10, false, 'publie', 95, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-table'), null, '4', '4 x 1 = 4
4 x 2 = 8
4 x 3 = 12
4 x 4 = 16
4 x 5 = 20
4 x 6 = 24
4 x 7 = 28
4 x 8 = 32
4 x 9 = 36
4 x 10 = 40', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-table'), null, '11', '11 x 1 = 11
11 x 2 = 22
11 x 3 = 33
11 x 4 = 44
11 x 5 = 55
11 x 6 = 66
11 x 7 = 77
11 x 8 = 88
11 x 9 = 99
11 x 10 = 110', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-table'), '#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= 10; i++) {
        printf("%d x %d = %d\n", n, i, n * i);
    }
    return 0;
}', 'La boucle for regroupe initialisation, condition et incrémentation sur une ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-puissance', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'fonctions'), 'c', 'Fonction puissance', 'Écrivez une fonction **long long puissance(int x, int n)** (boucle, sans pow). Lisez x et n (n ≥ 0) et affichez x^n.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"2 20","output":"1048576"}]'::jsonb, array['Ne pas utiliser pow() de math.h.']::text[], '', array['Initialisez le résultat à 1.', 'Utilisez %lld pour afficher un long long.']::text[], 10, false, 'publie', 96, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-puissance');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-puissance'), null, '2 20', '1048576', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-puissance'), null, '7 0', '1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-puissance'), null, '3 30', '205891132094649', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-puissance'), '#include <stdio.h>

long long puissance(int x, int n) {
    long long r = 1;
    for (int i = 0; i < n; i++) r *= x;
    return r;
}

int main(void) {
    int x, n;
    scanf("%d %d", &x, &n);
    printf("%lld\n", puissance(x, n));
    return 0;
}', 'Le type long long évite le dépassement de capacité d''un int (3^30 dépasse 2 milliards).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-inverser-tableau', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'tableaux'), 'c', 'Inverser un tableau', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Inversez le tableau **sur place** (en échangeant les éléments) puis affichez-le sur une ligne, séparé par des espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"5\n1 2 3 4 5","output":"5 4 3 2 1"}]'::jsonb, '{}'::text[], '', array['Échangez t[i] et t[n - 1 - i] pour i allant de 0 à n/2 - 1.', 'Attention à l''espace final : affichez l''espace avant chaque élément sauf le premier.']::text[], 10, false, 'publie', 97, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-inverser-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '5
1 2 3 4 5', '5 4 3 2 1', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '1
9', '9', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '4
10 -2 7 0', '0 7 -2 10', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-inverser-tableau'), '#include <stdio.h>

int main(void) {
    int n, t[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &t[i]);
    for (int i = 0; i < n / 2; i++) {
        int tmp = t[i];
        t[i] = t[n - 1 - i];
        t[n - 1 - i] = tmp;
    }
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", t[i]);
    printf("\n");
    return 0;
}', 'On ne parcourt que la moitié du tableau ; sinon chaque paire serait échangée deux fois et le tableau retrouverait son ordre initial.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('c-echange-pointeurs', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'pointeurs'), 'c', 'Échange par pointeurs', 'Complétez la fonction **echanger** pour qu''elle échange les valeurs pointées par a et b.', 'avance', 'completer', '{}'::text[], '[{"input":"3 9","output":"9 3"}]'::jsonb, '{}'::text[], '#include <stdio.h>

void echanger(int *a, int *b) {
    // À compléter
}

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    echanger(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}', array['*a désigne la valeur pointée par a.', 'Utilisez une variable temporaire int t = *a;']::text[], 10, true, 'publie', 98, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-echange-pointeurs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '3 9', '9 3', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '0 0', '0 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '-5 12', '12 -5', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-echange-pointeurs'), '#include <stdio.h>

void echanger(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    echanger(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}', 'La fonction reçoit les **adresses** de x et y : en modifiant *a et *b, elle modifie directement les variables de main.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('js-bonjour', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'introduction'), 'javascript', 'Bonjour en JavaScript', 'Lisez un prénom avec **lireLigne()** et affichez **Bonjour <prénom> !**', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Amani","output":"Bonjour Amani !"}]'::jsonb, '{}'::text[], 'const prenom = lireLigne();
// Affichez le message', array['console.log affiche une valeur.', 'Concaténez avec + : "Bonjour " + prenom + " !"']::text[], 5, false, 'publie', 99, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-bonjour'), null, 'Amani', 'Bonjour Amani !', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-bonjour'), null, 'Josué', 'Bonjour Josué !', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-bonjour'), 'const prenom = lireLigne();
console.log("Bonjour " + prenom + " !");', 'lireLigne() renvoie la ligne suivante de l''entrée ; console.log l''affiche après concaténation.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('js-fizzbuzz', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'boucles'), 'javascript', 'FizzBuzz', 'Lisez n et affichez les nombres de 1 à n, un par ligne, en remplaçant :

- les multiples de 3 par **Fizz** ;
- les multiples de 5 par **Buzz** ;
- les multiples de 3 et de 5 par **FizzBuzz**.', 'debutant', 'probleme', '{}'::text[], '[{"input":"5","output":"1\n2\nFizz\n4\nBuzz"}]'::jsonb, '{}'::text[], '', array['Testez d''abord le cas « multiple de 15 ».', 'i % 3 === 0 teste un multiple de 3.']::text[], 10, false, 'publie', 100, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-fizzbuzz');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-fizzbuzz'), null, '5', '1
2
Fizz
4
Buzz', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-fizzbuzz'), null, '15', '1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-fizzbuzz'), 'const n = Number(lireLigne());
for (let i = 1; i <= n; i++) {
  if (i % 15 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}', 'L''ordre des tests est essentiel : si l''on teste « multiple de 3 » en premier, 15 afficherait Fizz.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('js-somme-tableau', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'tableaux-objets'), 'javascript', 'Statistiques avec reduce', 'Lisez une ligne de nombres séparés par des espaces et affichez :

~~~text
Somme : …
Pairs : … (les nombres pairs, séparés par une virgule et un espace)
~~~', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"3 8 5 12 7","output":"Somme : 35\nPairs : 8, 12"}]'::jsonb, '{}'::text[], '', array['lireLigne().split(" ").map(Number)', 'reduce((s, x) => s + x, 0)', 'filter puis join(", ")']::text[], 10, false, 'publie', 101, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-somme-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '3 8 5 12 7', 'Somme : 35
Pairs : 8, 12', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '2 4', 'Somme : 6
Pairs : 2, 4', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '1 3 5', 'Somme : 9
Pairs : ', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-somme-tableau'), 'const nombres = lireLigne().trim().split(/\s+/).map(Number);
const somme = nombres.reduce((s, x) => s + x, 0);
const pairs = nombres.filter((x) => x % 2 === 0);
console.log("Somme : " + somme);
console.log("Pairs : " + pairs.join(", "));', 'map convertit les chaînes en nombres, reduce les additionne, filter sélectionne les pairs et join les assemble.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('java-bonjour', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'presentation'), 'java', 'Bonjour en Java', 'Affichez exactement **Bonjour UPL**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], 'public class Main {
    public static void main(String[] args) {
        // Votre code ici
    }
}', array['System.out.println affiche une ligne.']::text[], 5, false, 'publie', 102, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-bonjour'), null, '', 'Bonjour UPL', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-bonjour'), 'public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour UPL");
    }
}', 'System.out.println affiche le texte puis passe à la ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('java-somme', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'variables-types'), 'java', 'Somme de deux entiers', 'Lisez deux entiers avec Scanner et affichez **Somme : <a + b>**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4 6","output":"Somme : 10"}]'::jsonb, '{}'::text[], '', array['Scanner sc = new Scanner(System.in);', 'Attention : "Somme : " + a + b concatène ! Mettez (a + b) entre parenthèses.']::text[], 10, false, 'publie', 103, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-somme'), null, '4 6', 'Somme : 10', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-somme'), null, '-8 3', 'Somme : -5', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-somme'), 'import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Somme : " + (a + b));
    }
}', 'Sans parenthèses, "Somme : " + a + b produit "Somme : 46" : l''expression est évaluée de gauche à droite et la chaîne absorbe les nombres.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('java-pair-impair', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'conditions-boucles'), 'java', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"12","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 == 0']::text[], 5, false, 'publie', 104, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-pair-impair'), null, '12', 'pair', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-pair-impair'), null, '5', 'impair', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-pair-impair'), null, '-1', 'impair', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-pair-impair'), 'import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        System.out.println(n % 2 == 0 ? "pair" : "impair");
    }
}', 'L''opérateur ternaire choisit entre deux valeurs selon la condition.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('java-classe-compte', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'classes-objets'), 'java', 'Classe CompteBancaire', 'Écrivez une classe **CompteBancaire** avec un solde privé, une méthode **deposer(double)**, une méthode **retirer(double)** qui renvoie false si le solde est insuffisant, et **getSolde()**.

Entrée : une suite de lignes « D montant » (dépôt) ou « R montant » (retrait), terminée par « FIN ». Affichez **REFUS** pour chaque retrait impossible (texte sans accent), puis à la fin **Solde : <solde>** avec 2 décimales.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"D 100\nR 30\nR 100\nFIN","output":"REFUS\nSolde : 70.00"}]'::jsonb, '{}'::text[], '', array['Lisez chaque ligne avec sc.next() pour l''opération puis sc.nextDouble() pour le montant.', 'System.out.printf("Solde : %.2f%n", c.getSolde());']::text[], 10, false, 'publie', 105, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-classe-compte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'D 100
R 30
R 100
FIN', 'REFUS
Solde : 70.00', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'FIN', 'Solde : 0.00', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'D 50.5
D 49.5
R 100
R 1
FIN', 'REFUS
Solde : 0.00', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-classe-compte'), 'import java.util.Locale;
import java.util.Scanner;

class CompteBancaire {
    private double solde;

    void deposer(double m) { solde += m; }

    boolean retirer(double m) {
        if (m > solde) return false;
        solde -= m;
        return true;
    }

    double getSolde() { return solde; }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in).useLocale(Locale.US);
        CompteBancaire c = new CompteBancaire();
        while (sc.hasNext()) {
            String op = sc.next();
            if (op.equals("FIN")) break;
            double m = sc.nextDouble();
            if (op.equals("D")) c.deposer(m);
            else if (!c.retirer(m)) System.out.println("REFUS");
        }
        System.out.println(String.format(Locale.US, "Solde : %.2f", c.getSolde()));
    }
}', 'Le solde est **private** : on ne peut le modifier qu''à travers deposer et retirer, qui garantissent qu''il ne devient jamais négatif. Locale.US garantit le point décimal.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('java-moyenne-liste', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'collections'), 'java', 'Moyenne avec ArrayList', 'Lisez des entiers jusqu''à la fin de l''entrée, stockez-les dans une **ArrayList<Integer>** et affichez **Nombre : n** puis **Moyenne : m** (2 décimales, point décimal).', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"12 15 9","output":"Nombre : 3\nMoyenne : 12.00"}]'::jsonb, '{}'::text[], '', array['while (sc.hasNextInt()) liste.add(sc.nextInt());', 'String.format(Locale.US, "%.2f", moyenne)']::text[], 10, false, 'publie', 106, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-moyenne-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '12 15 9', 'Nombre : 3
Moyenne : 12.00', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '7', 'Nombre : 1
Moyenne : 7.00', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '10 11', 'Nombre : 2
Moyenne : 10.50', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-moyenne-liste'), 'import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> notes = new ArrayList<>();
        while (sc.hasNextInt()) notes.add(sc.nextInt());
        double somme = 0;
        for (int n : notes) somme += n;
        System.out.println("Nombre : " + notes.size());
        System.out.println(String.format(Locale.US, "Moyenne : %.2f", somme / notes.size()));
    }
}', 'hasNextInt() permet de lire jusqu''à la fin de l''entrée. La somme est un double pour que la division soit réelle.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-bonjour', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-introduction'), 'php', 'Bonjour en PHP', 'Affichez exactement deux lignes :

~~~text
Bonjour UPL
Je programme en PHP
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL\nJe programme en PHP"}]'::jsonb, '{}'::text[], '<?php
// Votre code ici', array['echo affiche du texte : echo "Bonjour UPL\n";', '\n passe à la ligne entre guillemets doubles.']::text[], 5, false, 'publie', 107, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-bonjour'), null, '', 'Bonjour UPL
Je programme en PHP', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-bonjour'), '<?php
echo "Bonjour UPL\n";
echo "Je programme en PHP\n";', 'Deux instructions **echo**, chacune terminée par un point-virgule. Le **\n** entre guillemets doubles passe à la ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-presentation', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-variables-types'), 'php', 'Fiche de présentation', 'Lisez un **prénom** puis un **âge** (une valeur par ligne) et affichez :

~~~text
Je m''appelle <prénom> et j''ai <âge> ans.
Dans 5 ans, j''aurai <âge + 5> ans.
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Grace\n19","output":"Je m''appelle Grace et j''ai 19 ans.\nDans 5 ans, j''aurai 24 ans."}]'::jsonb, '{}'::text[], '<?php
$prenom = trim((string) fgets(STDIN));
$age = (int) trim((string) fgets(STDIN));
// Affichez la fiche', array['Entre guillemets doubles, $prenom est remplacé par sa valeur.', 'Calculez $age + 5 avant de l''afficher, ou utilisez la concaténation.']::text[], 10, false, 'publie', 108, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'php-presentation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-presentation'), null, 'Grace
19', 'Je m''appelle Grace et j''ai 19 ans.
Dans 5 ans, j''aurai 24 ans.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-presentation'), null, 'Kito
21', 'Je m''appelle Kito et j''ai 21 ans.
Dans 5 ans, j''aurai 26 ans.', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'php-presentation'), null, 'Ana
0', 'Je m''appelle Ana et j''ai 0 ans.
Dans 5 ans, j''aurai 5 ans.', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'php-presentation'), '<?php
$prenom = trim((string) fgets(STDIN));
$age = (int) trim((string) fgets(STDIN));
echo "Je m''appelle $prenom et j''ai $age ans.\n";
echo "Dans 5 ans, j''aurai " . ($age + 5) . " ans.\n";', 'L''âge lu est une chaîne : **(int)** le convertit. Les parenthèses autour de **$age + 5** sont nécessaires avec la concaténation.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
commit;
