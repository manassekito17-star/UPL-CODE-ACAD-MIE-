-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 13 sur 14.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
values ('kplus-bonjour', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-introduction'), 'kplus', 'Bonjour en K+', 'Lisez un prénom avec `demander()` et affichez :

~~~text
Bonjour <prénom>, bienvenue dans K+ !
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Amani","output":"Bonjour Amani, bienvenue dans K+ !"}]'::jsonb, '{}'::text[], 'variable prenom = demander()
# Affichez le message', array['Assemblez les textes avec +.', 'afficher("Bonjour " + prenom + ", bienvenue dans K+ !")']::text[], 5, false, 'publie', 107, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-bonjour'), null, 'Amani', 'Bonjour Amani, bienvenue dans K+ !', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-bonjour'), null, 'Grâce', 'Bonjour Grâce, bienvenue dans K+ !', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-bonjour'), 'variable prenom = demander()
afficher("Bonjour " + prenom + ", bienvenue dans K+ !")', 'Le signe + assemble les textes. Avec afficher("Bonjour", prenom, …), K+ ajouterait une espace entre chaque valeur, y compris avant la virgule.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-presentation', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-variables'), 'kplus', 'Se présenter', 'Lisez un nom puis un âge (un par ligne) et affichez :

~~~text
<nom> a <âge> ans.
Dans 10 ans, <nom> aura <âge + 10> ans.
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Awa\n20","output":"Awa a 20 ans.\nDans 10 ans, Awa aura 30 ans."}]'::jsonb, '{}'::text[], 'variable nom = demander()
variable age = demander()', array['demander renvoie un texte : convertissez l''âge avec entier(…).', 'Pour assembler un nombre et un texte, utilisez texte(…) ou plusieurs valeurs dans afficher.']::text[], 5, false, 'publie', 108, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-presentation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-presentation'), null, 'Awa
20', 'Awa a 20 ans.
Dans 10 ans, Awa aura 30 ans.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-presentation'), null, 'Koffi
7', 'Koffi a 7 ans.
Dans 10 ans, Koffi aura 17 ans.', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-presentation'), 'variable nom = demander()
variable age = entier(demander())
afficher(nom + " a " + texte(age) + " ans.")
afficher("Dans 10 ans, " + nom + " aura " + texte(age + 10) + " ans.")', 'Sans entier(…), l''âge reste un texte et age + 10 provoque une erreur de type : K+ ne mélange pas texte et nombre sans conversion.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-moyenne', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-calculs'), 'kplus', 'Moyenne de trois notes', 'Lisez trois notes entières (une par ligne) et affichez leur moyenne arrondie à 2 chiffres après la virgule :

~~~text
Moyenne : <moyenne>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"12\n15\n10","output":"Moyenne : 12.33"}]'::jsonb, '{}'::text[], '', array['La division / donne un décimal.', 'arrondir(x, 2) garde deux chiffres après la virgule.']::text[], 10, false, 'publie', 109, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-moyenne');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-moyenne'), null, '12
15
10', 'Moyenne : 12.33', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-moyenne'), null, '10
10
10', 'Moyenne : 10.0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-moyenne'), null, '20
19
0', 'Moyenne : 13.0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-moyenne'), 'variable a = entier(demander())
variable b = entier(demander())
variable c = entier(demander())
afficher("Moyenne :", arrondir((a + b + c) / 3, 2))', 'Les parenthèses sont indispensables : a + b + c / 3 ne diviserait que c. La division / donne toujours un décimal, d''où 10.0.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-mention', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-conditions'), 'kplus', 'Mention au bac', 'Lisez une note entière sur 20 et affichez la mention :

- moins de 0 ou plus de 20 : `Note invalide` ;
- 16 ou plus : `Très bien` ;
- 14 ou plus : `Bien` ;
- 12 ou plus : `Assez bien` ;
- 10 ou plus : `Admis` ;
- sinon : `Ajourné`.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"15","output":"Bien"}]'::jsonb, '{}'::text[], '', array['Testez d''abord la note invalide, puis du plus grand au plus petit.', 'Utilisez sinon si pour enchaîner les cas avec un seul fin.']::text[], 10, false, 'publie', 110, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '15', 'Bien', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '16', 'Très bien', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '9', 'Ajourné', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '12', 'Assez bien', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '10', 'Admis', true, 1, 4, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '21', 'Note invalide', true, 1, 5, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '-1', 'Note invalide', true, 1, 6, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-mention'), 'variable note = entier(demander())
si note < 0 ou note > 20 alors
    afficher("Note invalide")
sinon si note >= 16 alors
    afficher("Très bien")
sinon si note >= 14 alors
    afficher("Bien")
sinon si note >= 12 alors
    afficher("Assez bien")
sinon si note >= 10 alors
    afficher("Admis")
sinon
    afficher("Ajourné")
fin', 'L''ordre compte : si l''on testait note >= 10 en premier, une note de 18 afficherait « Admis ». Les limites (16, 14, 12, 10) appartiennent à la mention supérieure : on utilise >=.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-table', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-boucles'), 'kplus', 'Table de multiplication', 'Lisez un entier n et affichez sa table de multiplication de 1 à 10, une ligne par opération :

~~~text
n x 1 = …
…
n x 10 = …
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['pour i de 1 à 10 faire … fin : les deux bornes sont incluses.', 'afficher(n, "x", i, "=", n * i) sépare les valeurs par des espaces.']::text[], 10, false, 'publie', 111, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '0', '0 x 1 = 0
0 x 2 = 0
0 x 3 = 0
0 x 4 = 0
0 x 5 = 0
0 x 6 = 0
0 x 7 = 0
0 x 8 = 0
0 x 9 = 0
0 x 10 = 0', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '-2', '-2 x 1 = -2
-2 x 2 = -4
-2 x 3 = -6
-2 x 4 = -8
-2 x 5 = -10
-2 x 6 = -12
-2 x 7 = -14
-2 x 8 = -16
-2 x 9 = -18
-2 x 10 = -20', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-table'), 'variable n = entier(demander())
pour i de 1 à 10 faire
    afficher(n, "x", i, "=", n * i)
fin', 'La boucle pour compte de 1 à 10 inclus. afficher sépare ses valeurs par une espace, ce qui donne exactement le format demandé.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-maximum', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-fonctions-listes'), 'kplus', 'Plus grande note', 'Lisez un entier n, puis n notes entières (une par ligne). Écrivez une **fonction** `maximum(liste)` qui renvoie la plus grande valeur d''une liste, puis affichez :

~~~text
Plus grande note : <maximum>
~~~

Si n vaut 0, affichez `Aucune note`.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"3\n12\n17\n9","output":"Plus grande note : 17"}]'::jsonb, '{}'::text[], 'fonction maximum(liste)
    # À compléter
fin

variable n = entier(demander())
variable notes = []', array['Remplissez la liste avec ajouter(notes, …) dans une boucle.', 'Partez du premier élément (liste[0]) et comparez-le aux suivants.']::text[], 15, false, 'publie', 112, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-maximum');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '3
12
17
9', 'Plus grande note : 17', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '0', 'Aucune note', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '4
-5
-2
-9
-3', 'Plus grande note : -2', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '1
14', 'Plus grande note : 14', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-maximum'), 'fonction maximum(liste)
    variable max = liste[0]
    pour chaque x dans liste faire
        si x > max alors
            max = x
        fin
    fin
    retourner max
fin

variable n = entier(demander())
variable notes = []
pour i de 1 à n faire
    ajouter(notes, entier(demander()))
fin
si n == 0 alors
    afficher("Aucune note")
sinon
    afficher("Plus grande note :", maximum(notes))
fin', 'Partir de 0 au lieu de liste[0] donnerait un résultat faux pour des notes toutes négatives. Le cas n = 0 est traité à part : liste[0] provoquerait une erreur d''indice sur une liste vide.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-page', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-premiere-page'), 'kplus', 'Page de présentation', '    Créez une page web (`utiliser web`) qui contient, dans cet ordre :

    1. le titre **Mon école** ;
    2. le paragraphe **Bienvenue sur notre site.** ;
    3. le sous-titre **Nos matières** ;
    4. une liste avec les lignes **Mathématiques**, **Français** et **Informatique** ;
    5. un lien **Le langage K+** vers `https://manassekito17-star.github.io/K-/`.

    Description attendue :

    ~~~text
    titre: Mon école
    paragraphe: Bienvenue sur notre site.
    sous_titre: Nos matières
    liste:
      ligne: Mathématiques
      ligne: Français
      ligne: Informatique
    lien: Le langage K+ -> https://manassekito17-star.github.io/K-/
    ~~~
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.

    Ici, le visiteur ne fait rien : seule la page de départ est vérifiée.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"titre: Mon école\nparagraphe: Bienvenue sur notre site.\nsous_titre: Nos matières\nliste:\n  ligne: Mathématiques\n  ligne: Français\n  ligne: Informatique\nlien: Le langage K+ -> https://manassekito17-star.github.io/K-/"}]'::jsonb, '{}'::text[], 'utiliser web

titre("Mon école")', array['variable matieres = liste() crée la liste ; ajouter_ligne(matieres, …) ajoute une ligne.', 'lien(texte, adresse).']::text[], 10, false, 'publie', 113, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-page');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-page'), null, '', 'titre: Mon école
paragraphe: Bienvenue sur notre site.
sous_titre: Nos matières
liste:
  ligne: Mathématiques
  ligne: Français
  ligne: Informatique
lien: Le langage K+ -> https://manassekito17-star.github.io/K-/', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-page'), 'utiliser web

titre("Mon école")
paragraphe("Bienvenue sur notre site.")
sous_titre("Nos matières")
variable matieres = liste()
ajouter_ligne(matieres, "Mathématiques")
ajouter_ligne(matieres, "Français")
ajouter_ligne(matieres, "Informatique")
lien("Le langage K+", "https://manassekito17-star.github.io/K-/")', 'Les éléments apparaissent dans l''ordre où le programme les crée. Les lignes sont rangées dans la liste qu''on donne à ajouter_ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-salutation', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-interactions'), 'kplus', 'Formulaire de salutation', '    Créez une page avec :

    - le titre **Salutation** ;
    - un champ d''étiquette **Votre nom** ;
    - un paragraphe vide (`paragraphe("")`) qui affichera la réponse ;
    - un bouton **Saluer**.

    Quand on clique sur **Saluer** :

    - si le champ est vide, le paragraphe affiche `Écrivez votre nom.` ;
    - sinon, il affiche `Bonjour <nom> !`.

    Exemple de visite :

    ~~~text
    saisir "Votre nom" "Awa"
    cliquer "Saluer"
    ~~~

    Description attendue :

    ~~~text
    titre: Salutation
    champ: Votre nom = "Awa"
    paragraphe: Bonjour Awa !
    bouton: Saluer
    ~~~
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"saisir \"Votre nom\" \"Awa\"\ncliquer \"Saluer\"","output":"titre: Salutation\nchamp: Votre nom = \"Awa\"\nparagraphe: Bonjour Awa !\nbouton: Saluer"}]'::jsonb, '{}'::text[], 'utiliser web

titre("Salutation")
variable nom = champ("Votre nom")
variable reponse = paragraphe("")

fonction saluer()
    # À compléter
fin

bouton("Saluer", saluer)', array['valeur(nom) donne le texte tapé.', 'changer_texte(reponse, …) modifie le paragraphe.']::text[], 10, false, 'publie', 114, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-salutation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'saisir "Votre nom" "Awa"
cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = "Awa"
paragraphe: Bonjour Awa !
bouton: Saluer', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = ""
paragraphe: Écrivez votre nom.
bouton: Saluer', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'saisir "Votre nom" "Awa"
cliquer "Saluer"
saisir "Votre nom" "Koffi"
cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = "Koffi"
paragraphe: Bonjour Koffi !
bouton: Saluer', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, '', 'titre: Salutation
champ: Votre nom = ""
paragraphe: 
bouton: Saluer', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-salutation'), 'utiliser web

titre("Salutation")
variable nom = champ("Votre nom")
variable reponse = paragraphe("")

fonction saluer()
    si valeur(nom) == "" alors
        changer_texte(reponse, "Écrivez votre nom.")
    sinon
        changer_texte(reponse, "Bonjour " + valeur(nom) + " !")
    fin
fin

bouton("Saluer", saluer)', 'On lit le champ **au moment du clic**, dans la fonction : lu au début du programme, il serait toujours vide. Le bouton reçoit le nom de la fonction, sans parenthèses.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-compteur', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-listes'), 'kplus', 'Liste de courses', '    Créez une page de liste de courses avec, dans cet ordre :

    - le titre **Courses** ;
    - un champ **Article** ;
    - un bouton **Ajouter** ;
    - un paragraphe compteur qui affiche `0 article(s)` au départ ;
    - une liste (vide au départ).

    Un clic sur **Ajouter** ajoute le texte du champ comme nouvelle ligne de la liste (sauf s''il est vide), vide le champ et met à jour le compteur. Un clic sur une **ligne** la supprime et met à jour le compteur.

    Exemple de visite :

    ~~~text
    saisir "Article" "Riz"
    cliquer "Ajouter"
    saisir "Article" "Huile"
    cliquer "Ajouter"
    cliquer "Riz"
    ~~~

    Description attendue :

    ~~~text
    titre: Courses
    champ: Article = ""
    bouton: Ajouter
    paragraphe: 1 article(s)
    liste:
      ligne: Huile
    ~~~
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"saisir \"Article\" \"Riz\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Huile\"\ncliquer \"Ajouter\"\ncliquer \"Riz\"","output":"titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 1 article(s)\nliste:\n  ligne: Huile"}]'::jsonb, '{}'::text[], '', array['Gardez le nombre d''articles dans une variable du programme : elle reste en mémoire entre deux clics.', 'ajouter_ligne renvoie la ligne : quand_clic(ligne, retirer) ; la fonction retirer(ligne) reçoit la ligne cliquée.']::text[], 15, false, 'publie', 115, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-compteur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Riz"
cliquer "Ajouter"
saisir "Article" "Huile"
cliquer "Ajouter"
cliquer "Riz"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 1 article(s)
liste:
  ligne: Huile', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'cliquer "Ajouter"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 0 article(s)
liste:', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Sel"
cliquer "Ajouter"
saisir "Article" "Sucre"
cliquer "Ajouter"
saisir "Article" "Pain"
cliquer "Ajouter"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 3 article(s)
liste:
  ligne: Sel
  ligne: Sucre
  ligne: Pain', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Sel"
cliquer "Ajouter"
cliquer "Sel"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 0 article(s)
liste:', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-compteur'), 'utiliser web

titre("Courses")
variable article = champ("Article")
variable nombre = 0

fonction afficher_nombre()
    changer_texte(compteur, texte(nombre) + " article(s)")
fin

fonction retirer(ligne)
    supprimer(ligne)
    nombre = nombre - 1
    afficher_nombre()
fin

fonction ajouter_article()
    si valeur(article) == "" alors
        retourner
    fin
    variable ligne = ajouter_ligne(courses, valeur(article))
    quand_clic(ligne, retirer)
    changer_valeur(article, "")
    nombre = nombre + 1
    afficher_nombre()
fin

bouton("Ajouter", ajouter_article)
variable compteur = paragraphe("0 article(s)")
variable courses = liste()', 'Le compteur est une variable du programme, modifiée à chaque ajout et à chaque suppression. Les fonctions peuvent utiliser compteur et courses, créés plus bas : elles ne sont appelées qu''au moment des clics, quand la page est déjà construite.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-minuteur', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-minuteries'), 'kplus', 'Minuteur', '    Créez un minuteur de 3 secondes :

    - le titre **Minuteur** ;
    - un paragraphe qui affiche `3` au départ ;
    - un bouton **Démarrer**.

    Un clic sur **Démarrer** lance une minuterie d''une seconde (`toutes_les(1000, …)`) qui diminue le nombre de 1 à chaque tour. Quand il atteint 0, la minuterie s''arrête et le paragraphe affiche `Terminé !`. Cliquer plusieurs fois sur Démarrer ne doit pas lancer plusieurs minuteries.

    Exemple de visite (`minuterie 2` = deux tours de minuterie) :

    ~~~text
    cliquer "Démarrer"
    minuterie 2
    ~~~

    Description attendue :

    ~~~text
    titre: Minuteur
    paragraphe: 1
    bouton: Démarrer
    ~~~
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"cliquer \"Démarrer\"\nminuterie 2","output":"titre: Minuteur\nparagraphe: 1\nbouton: Démarrer"}]'::jsonb, '{}'::text[], '', array['Gardez la minuterie dans une variable initialisée à nul, et ne la lancez que si elle vaut nul.', 'arreter_minuterie(m) arrête la minuterie.']::text[], 15, false, 'publie', 116, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-minuteur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 2', 'titre: Minuteur
paragraphe: 1
bouton: Démarrer', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 3', 'titre: Minuteur
paragraphe: Terminé !
bouton: Démarrer', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'minuterie 2', 'titre: Minuteur
paragraphe: 3
bouton: Démarrer', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
cliquer "Démarrer"
minuterie 1', 'titre: Minuteur
paragraphe: 2
bouton: Démarrer', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 10', 'titre: Minuteur
paragraphe: Terminé !
bouton: Démarrer', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-minuteur'), 'utiliser web

titre("Minuteur")
variable affichage = paragraphe("3")
variable reste = 3
variable minuterie = nul

fonction tic()
    reste = reste - 1
    changer_texte(affichage, texte(reste))
    si reste == 0 alors
        arreter_minuterie(minuterie)
        changer_texte(affichage, "Terminé !")
    fin
fin

fonction demarrer()
    si minuterie == nul alors
        minuterie = toutes_les(1000, tic)
    fin
fin

bouton("Démarrer", demarrer)', 'La variable minuterie vaut nul tant que rien n''est lancé : le test si minuterie == nul empêche un second clic de lancer une deuxième minuterie, qui ferait descendre le nombre deux fois plus vite. arreter_minuterie évite de passer sous zéro.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-bonjour', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-introduction'), 'php', 'Bonjour en PHP', 'Affichez exactement deux lignes :

~~~text
Bonjour UPL
Je programme en PHP
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL\nJe programme en PHP"}]'::jsonb, '{}'::text[], '<?php
// Votre code ici', array['echo affiche du texte : echo "Bonjour UPL\n";', '\n passe à la ligne entre guillemets doubles.']::text[], 5, false, 'publie', 117, null, null)
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
// Affichez la fiche', array['Entre guillemets doubles, $prenom est remplacé par sa valeur.', 'Calculez $age + 5 avant de l''afficher, ou utilisez la concaténation.']::text[], 10, false, 'publie', 118, null, null)
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('php-calculs', (select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-operateurs'), 'php', 'Quatre opérations', 'Lisez deux entiers **a** et **b** (b différent de 0) et affichez :

~~~text
Somme : <a + b>
Produit : <a × b>
Quotient entier : <quotient>
Reste : <reste>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"17\n5","output":"Somme : 22\nProduit : 85\nQuotient entier : 3\nReste : 2"}]'::jsonb, '{}'::text[], '', array['intdiv(a, b) donne le quotient entier.', '% donne le reste.']::text[], 10, false, 'publie', 119, null, null)
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
commit;
