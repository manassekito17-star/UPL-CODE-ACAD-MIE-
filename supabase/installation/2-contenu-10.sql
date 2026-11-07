-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 10 sur 10.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
commit;
