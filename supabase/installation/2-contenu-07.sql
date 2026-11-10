-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 7 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-conditions-simples-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'qcm', 'Que vaut $x = 8 >= 10 ? "A" : "B"; ?', null, '["A","B","true","false"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'qcm', 'Laquelle de ces valeurs est considérée comme vraie ?', null, '["0","\"\"","\"0\"","\"non\""]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[3]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'vrai_faux', 'La condition d''un if s''écrit entre parenthèses.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-controle-donnees', 'Structures de contrôle, tableaux et fonctions', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-conditions-switch-match', 'if / elseif, switch et match', 'debutant', 30, array['Enchaîner plusieurs cas avec elseif.', 'Utiliser switch.', 'Utiliser l''expression match de PHP 8.']::text[], array['Premières conditions']::text[], '## elseif

~~~php
<?php
if ($note >= 16) {
    $mention = "Très bien";
} elseif ($note >= 14) {
    $mention = "Bien";
} elseif ($note >= 12) {
    $mention = "Assez bien";
} elseif ($note >= 10) {
    $mention = "Passable";
} else {
    $mention = "Ajourné";
}
~~~

Les conditions sont testées **dans l''ordre** : la première vraie l''emporte. Placez donc les cas les plus restrictifs en premier.

## switch

**switch** compare une valeur à une liste de cas. N''oubliez pas **break**, sinon l''exécution continue dans le cas suivant :

~~~php
<?php
switch ($jour) {
    case "samedi":
    case "dimanche":
        echo "Week-end";
        break;
    default:
        echo "Jour de cours";
}
~~~

## match (PHP 8)

**match** est une expression : elle **renvoie** une valeur, compare avec **===**, n''a pas besoin de break et lève une erreur si aucun cas ne correspond (sauf default).

~~~php
<?php
$libelle = match ($code) {
    "INF" => "Informatique",
    "DRT" => "Droit",
    "ECO", "GES" => "Économie et gestion",
    default => "Filière inconnue",
};
~~~

Avec **match (true)**, chaque branche peut être une condition : c''est une autre façon d''écrire le calcul d''une mention.', array['elseif enchaîne les cas, testés dans l''ordre.', 'switch exige break à la fin de chaque cas.', 'match renvoie une valeur, compare avec === et n''a pas besoin de break.']::text[], '[{"language":"php","title":"Mention avec match (true)","code":"<?php\nforeach ([17, 13, 9] as $note) {\n    $mention = match (true) {\n        $note >= 16 => \"Très bien\",\n        $note >= 14 => \"Bien\",\n        $note >= 12 => \"Assez bien\",\n        $note >= 10 => \"Passable\",\n        default => \"Ajourné\",\n    };\n    echo \"$note/20 : $mention\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-switch-match'), 'php-switch-match-quiz', 'Vérification — elseif, switch et match', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-switch-match-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'qcm', 'Que se passe-t-il si on oublie break dans un switch ?', null, '["Erreur de syntaxe","L''exécution continue dans le cas suivant","Rien","Le switch recommence"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'qcm', 'Quelle comparaison utilise match ?', null, '["==","===","<=>","aucune"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'vrai_faux', 'match peut renvoyer une valeur directement dans une variable.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-boucles', 'Les boucles : while, for et foreach', 'debutant', 35, array['Répéter des instructions avec while, do…while et for.', 'Parcourir un tableau avec foreach.', 'Contrôler une boucle avec break et continue.']::text[], array['if / elseif, switch et match']::text[], '## while

Répète tant que la condition est vraie. La condition est testée **avant** chaque tour :

~~~php
<?php
$i = 1;
while ($i <= 5) {
    echo $i, " ";
    $i++;
}
~~~

Oublier **$i++** crée une **boucle infinie** : sur la plateforme, l''exécution est arrêtée au bout de 10 secondes.

## do … while

Le corps s''exécute **au moins une fois**, la condition est testée après.

## for

Idéal quand on connaît le nombre de tours : **for (initialisation; condition; pas)**.

~~~php
<?php
for ($i = 1; $i <= 10; $i++) {
    echo "7 x $i = ", 7 * $i, "\n";
}
~~~

## foreach

La boucle la plus utilisée en PHP : elle parcourt un tableau élément par élément.

~~~php
<?php
foreach ($etudiants as $nom) { … }
foreach ($notes as $matiere => $note) { … }
~~~

## break et continue

**break** sort de la boucle ; **continue** passe directement au tour suivant.

## Générer du HTML avec une boucle

Une boucle permet de produire une liste ou un tableau HTML à partir de données : c''est ainsi qu''un site affiche la liste des étudiants, des produits ou des articles.', array['while teste avant, do…while après (au moins un tour).', 'for convient quand le nombre de tours est connu.', 'foreach parcourt un tableau, avec ou sans les clés.']::text[], '[{"language":"php","title":"Table de multiplication et liste HTML","code":"<?php\nfor ($i = 1; $i <= 5; $i++) {\n    echo \"3 x $i = \", 3 * $i, \"\\n\";\n}\n$filieres = [\"Informatique\", \"Droit\", \"Médecine\"];\necho \"<ul>\\n\";\nforeach ($filieres as $f) {\n    echo \"  <li>\", htmlspecialchars($f), \"</li>\\n\";\n}\necho \"</ul>\\n\";"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-boucles'), 'php-boucles-quiz', 'Vérification — Boucles', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Combien de tours fait for ($i = 0; $i < 5; $i++) ?', null, '["4","5","6","infini"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Quelle boucle s''exécute au moins une fois ?', null, '["while","for","do … while","foreach"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Que fait continue ?', null, '["Sort de la boucle","Passe au tour suivant","Recommence au premier tour","Arrête le script"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-tableaux', 'Tableaux simples et associatifs', 'debutant', 40, array['Créer et modifier un tableau indexé.', 'Utiliser un tableau associatif clé ⇒ valeur.', 'Employer les fonctions de tableaux courantes.']::text[], array['Les boucles']::text[], '## Tableaux indexés

~~~php
<?php
$notes = [12, 15, 9];
echo $notes[0];      // 12 : les indices commencent à 0
$notes[] = 18;       // ajoute à la fin
echo count($notes);  // 4
~~~

## Tableaux associatifs

Chaque valeur est rangée sous une **clé** (souvent un texte) :

~~~php
<?php
$etudiant = [
    "nom" => "Kito",
    "filiere" => "Informatique",
    "age" => 21,
];
echo $etudiant["nom"];
~~~

## Tableaux à plusieurs dimensions

Une liste d''étudiants est un tableau de tableaux associatifs — exactement ce que renvoie une base de données :

~~~php
<?php
$etudiants = [
    ["nom" => "Kito", "moyenne" => 14.5],
    ["nom" => "Mbuyi", "moyenne" => 11.0],
];
echo $etudiants[1]["nom"]; // Mbuyi
~~~

## Fonctions utiles

| Fonction | Rôle |
|---|---|
| count($t) | nombre d''éléments |
| in_array($v, $t, true) | la valeur est-elle présente ? |
| array_key_exists($k, $t) | la clé existe-t-elle ? |
| array_sum($t), max($t), min($t) | somme, maximum, minimum |
| sort / rsort | trie les valeurs (croissant / décroissant) |
| asort / arsort | trie en gardant les clés |
| ksort | trie par clé |
| implode(", ", $t) | joint en une chaîne |
| explode(" ", $texte) | découpe une chaîne en tableau |
| array_map / array_filter | transforme / filtre |

## Afficher un tableau pour déboguer

**print_r($t)** affiche la structure lisiblement ; **var_dump($t)** donne en plus les types.', array['Les indices commencent à 0 ; $t[] = … ajoute à la fin.', 'Un tableau associatif range les valeurs sous des clés.', 'count, in_array, sort, implode et explode sont à connaître.']::text[], '[{"language":"php","title":"Notes d''un étudiant","code":"<?php\n$notes = [\"Algorithmique\" => 15, \"Mathématiques\" => 11, \"Anglais\" => 13];\nforeach ($notes as $matiere => $note) {\n    echo str_pad($matiere, 15), \" : $note\\n\";\n}\n$moyenne = array_sum($notes) / count($notes);\necho \"Moyenne : \", round($moyenne, 2), \"\\n\";\narsort($notes);\necho \"Meilleure matière : \", array_key_first($notes), \"\\n\";\necho \"Liste : \", implode(\", \", array_keys($notes)), \"\\n\";"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-tableaux'), 'php-tableaux-quiz', 'Vérification — Tableaux', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-tableaux-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Avec $t = [4, 8, 15], que vaut $t[1] ?', null, '["4","8","15","erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Quelle fonction donne le nombre d''éléments ?', null, '["length()","size()","count()","len()"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Que renvoie explode(",", "a,b,c") ?', null, '["\"abc\"","[\"a\", \"b\", \"c\"]","3","\"a b c\""]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-fonctions-chaines-dates', 'Fonctions, chaînes de caractères et dates', 'debutant', 45, array['Écrire des fonctions typées avec paramètres et valeur de retour.', 'Manipuler les chaînes avec les fonctions natives.', 'Afficher et calculer des dates.']::text[], array['Tableaux simples et associatifs']::text[], '## Déclarer une fonction

~~~php
<?php
function moyenne(array $notes): float
{
    return array_sum($notes) / count($notes);
}
echo moyenne([12, 14, 16]); // 14
~~~

- les **paramètres** reçoivent les valeurs passées à l''appel ;
- **return** renvoie le résultat et termine la fonction ;
- les **types** (array, float, int, string, bool, ?string pour « chaîne ou null ») documentent le code et détectent les erreurs. Avec **declare(strict_types=1);** en première ligne, PHP refuse les conversions implicites.

## Valeurs par défaut et paramètres nommés

~~~php
<?php
function saluer(string $nom, string $formule = "Bonjour"): string
{
    return "$formule, $nom !";
}
echo saluer("Kito");
echo saluer(nom: "Grace", formule: "Bonsoir");
~~~

## Portée des variables

Une variable créée dans une fonction est **locale** : elle n''existe pas à l''extérieur, et la fonction ne voit pas les variables extérieures. On transmet les données par **paramètres**, pas par variables globales.

## Fonctions anonymes et fléchées

~~~php
<?php
$carres = array_map(fn($x) => $x * $x, [1, 2, 3]);
~~~

## Fonctions de chaînes

| Fonction | Exemple | Résultat |
|---|---|---|
| strlen | strlen("UPL") | 3 (en octets) |
| strtoupper / strtolower | strtoupper("upl") | UPL |
| ucfirst / ucwords | ucwords("jean paul") | Jean Paul |
| trim | trim("  a  ") | a |
| str_replace | str_replace("a", "o", "papa") | popo |
| substr | substr("Kinshasa", 0, 4) | Kins |
| str_contains | str_contains("UPL Code", "Code") | true |
| strrev, str_repeat | str_repeat("-", 5) | ----- |
| sprintf | sprintf("%05.1f", 3.14159) | 003.1 |

Les accents comptent pour plusieurs octets : strlen("é") vaut 2. Les fonctions **mb_strlen**, **mb_strtoupper** (extension mbstring) comptent les caractères ; elles existent sur la plupart des serveurs, mais pas dans le PHP du navigateur de la plateforme.

## Dates

**date("d/m/Y H:i")** formate la date courante. La classe **DateTime** calcule : ajout de jours, différence entre deux dates.

~~~php
<?php
$debut = new DateTime("2026-10-01");
$fin = new DateTime("2026-12-20");
echo $debut->diff($fin)->days, " jours";
~~~', array['function nom(type $param): typeRetour { … return … }', 'Les variables d''une fonction sont locales ; on passe les données en paramètres.', 'strlen, strtoupper, str_replace, substr, trim, sprintf manipulent les chaînes.', 'date() formate ; DateTime calcule des écarts et des décalages.']::text[], '[{"language":"php","title":"Fonctions et chaînes","code":"<?php\ndeclare(strict_types=1);\n\nfunction initiales(string $nomComplet): string\n{\n    $mots = explode(\" \", trim($nomComplet));\n    $lettres = array_map(fn(string $m): string => strtoupper(substr($m, 0, 1)), $mots);\n    return implode(\".\", $lettres) . \".\";\n}\n\nfunction mention(float $moyenne): string\n{\n    return match (true) {\n        $moyenne >= 14 => \"Bien\",\n        $moyenne >= 10 => \"Passable\",\n        default => \"Ajourné\",\n    };\n}\n\necho initiales(\"jean paul kabila\"), \"\\n\";\necho mention(15.2), \"\\n\";\necho sprintf(\"Moyenne : %.2f/20\", 13.456), \"\\n\";"},{"language":"php","title":"Calculer avec des dates","code":"<?php\n$rentree = new DateTime(\"2026-10-05\");\n$examens = new DateTime(\"2027-01-18\");\n$jours = $rentree->diff($examens)->days;\necho \"Rentrée : \", $rentree->format(\"d/m/Y\"), \"\\n\";\necho \"Il reste $jours jours avant les examens.\\n\";\n$rentree->modify(\"+7 days\");\necho \"Une semaine après la rentrée : \", $rentree->format(\"l d/m/Y\"), \"\\n\";"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-fonctions-chaines-dates'), 'php-fonctions-quiz', 'Vérification — Fonctions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que renvoie une fonction sans return ?', null, '["0","false","null","une erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Une variable créée dans une fonction est…', null, '["globale","locale à la fonction","constante","partagée"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que vaut substr("Kinshasa", 0, 3) ?', null, '["Kin","Kins","asa","Kinshasa"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que vaut ucfirst("upl") ?', null, '["UPL","Upl","upL","upl"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-web', 'PHP et le web : formulaires et sessions', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-web'), (select id from public.courses where slug = 'php'), 'php-formulaires', 'Formulaires GET et POST, validation et sécurité', 'debutant', 45, array['Recevoir des données avec $_GET et $_POST.', 'Valider et nettoyer les entrées.', 'Protéger l''affichage contre le XSS avec htmlspecialchars.']::text[], array['Fonctions, chaînes et dates', 'Formulaires HTML (parcours HTML)']::text[], '## Le cycle d''un formulaire

~~~html
<form method="post" action="inscription.php">
  <input name="nom">
  <input name="age" type="number">
  <button>Envoyer</button>
</form>
~~~

À l''envoi, le navigateur transmet les champs au fichier **action**. PHP les range dans des **tableaux superglobaux** :

- **$_GET** : données dans l''adresse (inscription.php?nom=Kito) — pour rechercher, filtrer, paginer ;
- **$_POST** : données dans le corps de la requête — pour créer, modifier, se connecter ;
- **$_SERVER["REQUEST_METHOD"]** indique la méthode utilisée.

## Ne jamais faire confiance aux données reçues

Un utilisateur peut envoyer **n''importe quoi** : champ vide, texte au lieu d''un nombre, code HTML ou JavaScript. Trois règles :

1. **vérifier la présence** : $_POST["nom"] ?? "" ;
2. **valider** : longueur, format, plage de valeurs ; **filter_var($email, FILTER_VALIDATE_EMAIL)**, **filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 15]])** ;
3. **échapper à l''affichage** : **htmlspecialchars($texte)** transforme < > " '' & en entités HTML. Sans cela, un visiteur peut injecter un script dans votre page : c''est la faille **XSS**.

## Collecter les erreurs

On accumule les messages d''erreur dans un tableau ; si le tableau est vide, le formulaire est valide :

~~~php
<?php
$erreurs = [];
if ($nom === "") {
    $erreurs["nom"] = "Le nom est obligatoire.";
}
if (!$erreurs) {
    // enregistrer, puis rediriger
}
~~~

## Rediriger après un POST

Après un traitement réussi, on redirige avec **header("Location: merci.php"); exit;** : actualiser la page ne renverra pas le formulaire une deuxième fois (motif « Post/Redirect/Get »).

## Sur la plateforme

Dans l''éditeur, il n''y a pas de vrai navigateur qui envoie le formulaire : les exemples **simulent** les données reçues en remplissant $_POST au début du script. Sur un vrai serveur, PHP remplit ces tableaux tout seul. Dans UPL IDE, les paramètres d''adresse peuvent aussi être fournis à $_GET.', array['$_GET lit l''adresse, $_POST le corps de la requête.', 'Toujours vérifier, valider (filter_var) puis échapper (htmlspecialchars).', 'Après un POST réussi : redirection avec header("Location: …").']::text[], '[{"language":"php","title":"Validation d''un formulaire d''inscription","code":"<?php\n// Simulation des données envoyées par le formulaire (sur un vrai serveur, PHP les remplit).\n$_POST = [\"nom\" => \"  Kito  \", \"email\" => \"kito@exemple\", \"age\" => \"17\", \"commentaire\" => \"<script>alert(1)</script>\"];\n\n$nom = trim($_POST[\"nom\"] ?? \"\");\n$email = trim($_POST[\"email\"] ?? \"\");\n$age = filter_var($_POST[\"age\"] ?? \"\", FILTER_VALIDATE_INT, [\"options\" => [\"min_range\" => 18, \"max_range\" => 99]]);\n$erreurs = [];\nif ($nom === \"\") {\n    $erreurs[] = \"Le nom est obligatoire.\";\n}\nif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    $erreurs[] = \"Adresse e-mail invalide.\";\n}\nif ($age === false) {\n    $erreurs[] = \"L''âge doit être un entier entre 18 et 99.\";\n}\nforeach ($erreurs as $e) {\n    echo \"Erreur : $e\\n\";\n}\necho \"Commentaire affiché sans danger : \", htmlspecialchars($_POST[\"commentaire\"]), \"\\n\";"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-formulaires'), 'php-formulaires-quiz', 'Vérification — Formulaires', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-formulaires-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Quelle méthode utiliser pour envoyer un mot de passe ?', null, '["GET","POST"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Quelle fonction protège l''affichage contre le XSS ?', null, '["trim","htmlspecialchars","strip","addslashes"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'vrai_faux', 'Un champ number du navigateur garantit que $_POST contient un nombre.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Les données peuvent être modifiées avant l''envoi : on valide toujours côté serveur.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Que renvoie filter_var("abc", FILTER_VALIDATE_INT) ?', null, '["0","false","null","\"abc\""]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-web'), (select id from public.courses where slug = 'php'), 'php-sessions-cookies-include', 'Sessions, cookies, include et gestion des erreurs', 'debutant', 40, array['Conserver des informations entre les pages avec les sessions.', 'Utiliser les cookies à bon escient.', 'Découper un site en fichiers avec include et require.', 'Lire et corriger les messages d''erreur de PHP.']::text[], array['Formulaires GET et POST']::text[], '## Pourquoi les sessions ?

HTTP « oublie » tout entre deux pages. Pour qu''un étudiant reste connecté, PHP crée une **session** : un identifiant aléatoire est stocké dans un cookie du navigateur, et les données restent **sur le serveur**.

~~~php
<?php
session_start();                 // au tout début, avant tout affichage
$_SESSION["utilisateur"] = "Kito";
echo $_SESSION["utilisateur"] ?? "invité";
~~~

Pour se déconnecter : **session_destroy()** (et vider $_SESSION). Après une connexion réussie, appelez **session_regenerate_id(true)** pour changer l''identifiant (protection contre la fixation de session).

## Les cookies

Un cookie est un petit texte stocké **dans le navigateur** : **setcookie("theme", "sombre", ["expires" => time() + 86400, "httponly" => true, "samesite" => "Lax"])**. On le relit avec **$_COOKIE["theme"]**. Ne stockez jamais d''information sensible dans un cookie : l''utilisateur peut le lire et le modifier.

## Découper avec include et require

Un site réel répète l''en-tête, le menu et le pied de page sur chaque page. On les place dans des fichiers séparés :

~~~php
<?php
require __DIR__ . "/includes/config.php";
include __DIR__ . "/includes/entete.php";
~~~

- **require** arrête le script si le fichier manque (pour les fichiers indispensables) ;
- **include** affiche seulement un avertissement ;
- **require_once** évite de charger deux fois le même fichier (fonctions, classes).

Dans UPL IDE, créez un projet **Site PHP** : index.php inclut includes/config.php, includes/functions.php et includes/database.php.

## Les erreurs de PHP

| Message | Signification |
|---|---|
| Parse error | erreur de syntaxe (point-virgule, accolade, guillemet manquant) — le script ne démarre pas |
| Fatal error | erreur grave pendant l''exécution (fonction inconnue, division par zéro) — le script s''arrête |
| Warning | problème non bloquant (fichier introuvable avec include) |
| Notice / Deprecated | variable inconnue, fonction dépréciée |

Le message donne toujours le **fichier** et la **ligne** : commencez par lire la ligne indiquée et celle d''avant. En production, on n''affiche pas les erreurs aux visiteurs (**display_errors = Off**) : on les écrit dans un journal.

## Sur la plateforme

Chaque exécution est une **nouvelle requête** : les sessions et cookies ne sont donc pas conservés d''une exécution à l''autre dans l''éditeur. Les exemples montrent le fonctionnement à l''intérieur d''une seule exécution.', array['session_start() puis $_SESSION conserve des données côté serveur.', 'Les cookies sont stockés dans le navigateur : jamais de données sensibles.', 'require (indispensable), include (facultatif), *_once (une seule fois).', 'Parse error = syntaxe ; Fatal error = exécution ; lire la ligne indiquée.']::text[], '[{"language":"php","title":"Panier en session (une requête)","code":"<?php\nsession_start();\n$_SESSION[\"panier\"] ??= [];\n$_SESSION[\"panier\"][] = [\"article\" => \"Cahier\", \"prix\" => 1500];\n$_SESSION[\"panier\"][] = [\"article\" => \"Stylo\", \"prix\" => 500];\n$total = array_sum(array_column($_SESSION[\"panier\"], \"prix\"));\necho count($_SESSION[\"panier\"]), \" articles, total : $total FC\\n\";"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-sessions-cookies-include'), 'php-sessions-quiz', 'Vérification — Sessions et include', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-sessions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Où sont stockées les données de $_SESSION ?', null, '["Dans le navigateur","Sur le serveur","Dans l''adresse","Dans le HTML"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Quelle instruction arrête le script si le fichier est absent ?', null, '["include","require","import","use"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Quand appeler session_start() ?', null, '["À la fin du script","Avant tout affichage","Seulement à la déconnexion","Jamais"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-objet', 'Programmation orientée objet', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-classes-objets', 'Classes, objets, constructeurs et encapsulation', 'intermediaire', 45, array['Définir une classe avec propriétés et méthodes.', 'Créer des objets avec un constructeur.', 'Protéger les données avec private et des méthodes d''accès.']::text[], array['Fonctions (niveau 2)']::text[], '## Classe et objet

Une **classe** est un modèle (le plan d''une maison) ; un **objet** est un exemplaire construit à partir de ce modèle. La classe regroupe des **propriétés** (données) et des **méthodes** (fonctions qui agissent sur ces données).

~~~php
<?php
class Etudiant
{
    public string $nom;
    public array $notes = [];

    public function moyenne(): float
    {
        return $this->notes ? array_sum($this->notes) / count($this->notes) : 0.0;
    }
}

$e = new Etudiant();
$e->nom = "Kito";
$e->notes = [12, 16];
echo $e->moyenne();
~~~

**$this** désigne l''objet courant ; **->** accède à une propriété ou appelle une méthode.

## Le constructeur

**__construct** s''exécute à la création de l''objet. Depuis PHP 8, la **promotion des propriétés** déclare et remplit les propriétés directement dans les paramètres :

~~~php
<?php
class Etudiant
{
    public function __construct(
        private string $matricule,
        private string $nom,
    ) {}
}
~~~

## Encapsulation et visibilité

| Mot-clé | Accessible depuis |
|---|---|
| public | partout |
| protected | la classe et ses classes filles |
| private | la classe seulement |

On rend les propriétés **private** et on expose des **méthodes** qui contrôlent les modifications : une note doit rester entre 0 et 20, un solde ne peut pas devenir négatif. L''objet garantit ainsi sa propre cohérence.

## Membres statiques et constantes de classe

Une propriété **static** appartient à la classe (compteur d''objets créés) ; on y accède avec **self::$compteur** ou **NomClasse::$compteur**. Les constantes de classe s''écrivent **const NOTE_MAX = 20;**.

## Propriétés en lecture seule

**readonly** (PHP 8.1) interdit de modifier une propriété après la construction : idéal pour un matricule.', array['Une classe décrit, un objet existe (new).', 'Le constructeur initialise l''objet ; la promotion évite la répétition.', 'private + méthodes de contrôle = encapsulation.']::text[], '[{"language":"php","title":"Classe Etudiant encapsulée","code":"<?php\ndeclare(strict_types=1);\n\nclass Etudiant\n{\n    public const NOTE_MAX = 20;\n    private array $notes = [];\n\n    public function __construct(public readonly string $matricule, private string $nom) {}\n\n    public function ajouterNote(float $note): void\n    {\n        if ($note < 0 || $note > self::NOTE_MAX) {\n            throw new InvalidArgumentException(\"Note invalide : $note\");\n        }\n        $this->notes[] = $note;\n    }\n\n    public function moyenne(): float\n    {\n        return $this->notes ? array_sum($this->notes) / count($this->notes) : 0.0;\n    }\n\n    public function getNom(): string\n    {\n        return $this->nom;\n    }\n}\n\n$e = new Etudiant(\"UPL-2026-001\", \"Kito\");\n$e->ajouterNote(14);\n$e->ajouterNote(17);\necho $e->getNom(), \" (\", $e->matricule, \") : \", $e->moyenne(), \"/20\\n\";\ntry {\n    $e->ajouterNote(25);\n} catch (InvalidArgumentException $ex) {\n    echo \"Refusé : \", $ex->getMessage(), \"\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-classes-objets'), 'php-classes-quiz', 'Vérification — Classes et objets', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-classes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Que désigne $this dans une méthode ?', null, '["La classe","L''objet courant","La classe mère","Le fichier"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Quelle visibilité limite l''accès à la classe elle-même ?', null, '["public","protected","private","static"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Quand s''exécute __construct ?', null, '["À la destruction","À la création avec new","À chaque appel de méthode","Jamais automatiquement"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-heritage-interfaces', 'Héritage, polymorphisme, interfaces, traits et namespaces', 'intermediaire', 45, array['Réutiliser du code par héritage.', 'Exploiter le polymorphisme.', 'Définir des contrats avec les interfaces.', 'Partager du code avec les traits et organiser avec les namespaces.']::text[], array['Classes et objets']::text[], '## Héritage

Une classe **fille** hérite des propriétés et méthodes de sa classe **mère** avec **extends**. Elle peut ajouter des éléments ou **redéfinir** une méthode ; **parent::methode()** appelle la version de la mère.

~~~php
<?php
class Personne
{
    public function __construct(protected string $nom) {}
    public function presenter(): string { return "Je suis {$this->nom}"; }
}

class Enseignant extends Personne
{
    public function __construct(string $nom, private string $cours) { parent::__construct($nom); }
    public function presenter(): string { return parent::presenter() . ", j''enseigne {$this->cours}"; }
}
~~~

## Classes abstraites

Une classe **abstract** ne peut pas être instanciée ; elle peut déclarer des méthodes **abstract** que chaque fille doit écrire.

## Polymorphisme

Des objets de classes différentes répondent au **même appel** chacun à leur manière. Une boucle peut appeler **->presenter()** sur une liste mêlant étudiants et enseignants : chaque objet utilise sa propre version.

## Interfaces

Une **interface** est un contrat : la liste des méthodes qu''une classe s''engage à fournir (**implements**). Une classe peut implémenter plusieurs interfaces. Le code qui reçoit un objet typé par l''interface fonctionne avec toutes les implémentations : c''est la base des architectures professionnelles (un « dépôt » de données en mémoire pour les tests, en base de données en production).

## Traits

Un **trait** regroupe des méthodes à copier dans plusieurs classes sans lien d''héritage (par exemple un horodatage de création) : **use Horodatable;** dans la classe.

## Namespaces

Les **espaces de noms** évitent les conflits de noms entre bibliothèques : **namespace App\Modeles;** en tête du fichier, puis **use App\Modeles\Etudiant;** ailleurs. Composer s''appuie dessus pour charger automatiquement les classes (norme PSR-4).', array['extends hérite ; parent:: appelle la version de la mère.', 'Une interface est un contrat ; implements s''y engage.', 'Polymorphisme : même appel, comportements différents.', 'Traits : partage de méthodes ; namespaces : organisation des classes.']::text[], '[{"language":"php","title":"Polymorphisme avec une interface","code":"<?php\ninterface Payable\n{\n    public function montant(): float;\n}\n\nabstract class Personne implements Payable\n{\n    public function __construct(protected string $nom) {}\n    abstract public function role(): string;\n    public function fiche(): string\n    {\n        return sprintf(\"%-8s %-12s %8.2f $\", $this->nom, $this->role(), $this->montant());\n    }\n}\n\ntrait Prime\n{\n    public function prime(float $base): float { return $base * 0.1; }\n}\n\nclass Enseignant extends Personne\n{\n    use Prime;\n    public function __construct(string $nom, private float $salaire) { parent::__construct($nom); }\n    public function role(): string { return \"enseignant\"; }\n    public function montant(): float { return $this->salaire + $this->prime($this->salaire); }\n}\n\nclass Etudiant extends Personne\n{\n    public function __construct(string $nom, private float $frais) { parent::__construct($nom); }\n    public function role(): string { return \"étudiant\"; }\n    public function montant(): float { return -$this->frais; }\n}\n\n$personnes = [new Enseignant(\"Mukendi\", 800), new Etudiant(\"Kito\", 450)];\nforeach ($personnes as $p) {\n    echo $p->fiche(), \"\\n\";\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-heritage-interfaces'), 'php-heritage-quiz', 'Vérification — Héritage et interfaces', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-heritage-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Quel mot-clé crée une classe fille ?', null, '["implements","extends","use","inherits"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Peut-on instancier une classe abstraite ?', null, '["Oui","Non"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Combien d''interfaces une classe peut-elle implémenter ?', null, '["Une seule","Deux au plus","Plusieurs","Aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-exceptions', 'Exceptions et gestion des erreurs', 'intermediaire', 30, array['Lever et intercepter des exceptions.', 'Créer ses propres exceptions.', 'Utiliser finally pour libérer les ressources.']::text[], array['Héritage et interfaces']::text[], '## Lever une exception

Quand une situation empêche une fonction de faire son travail, elle **lève** une exception avec **throw** :

~~~php
<?php
function diviser(float $a, float $b): float
{
    if ($b == 0) {
        throw new DivisionByZeroError("Division par zéro");
    }
    return $a / $b;
}
~~~

## Intercepter avec try / catch

~~~php
<?php
try {
    echo diviser(10, 0);
} catch (DivisionByZeroError $e) {
    echo "Erreur : ", $e->getMessage();
} finally {
    echo "Toujours exécuté";
}
~~~

Le bloc **finally** s''exécute dans tous les cas (fermeture d''un fichier, d''une transaction…).

## La hiérarchie

Tout ce qui peut être levé implémente **Throwable**. Deux familles : **Exception** (erreurs prévisibles de l''application : donnée invalide, ressource introuvable) et **Error** (erreurs du moteur : TypeError, DivisionByZeroError). On intercepte du plus précis au plus général.

## Exceptions personnalisées

~~~php
<?php
class NoteInvalideException extends InvalidArgumentException {}
~~~

Une exception propre au métier rend le code lisible et permet de réagir précisément (afficher un message à l''utilisateur, journaliser, annuler une transaction).

## En production

Les messages techniques (requête SQL, chemin des fichiers) ne doivent pas être montrés aux visiteurs : on affiche un message générique et on enregistre le détail dans un journal (**error_log**).', array['throw lève, try/catch intercepte, finally s''exécute toujours.', 'Exception = erreurs de l''application ; Error = erreurs du moteur.', 'Créer ses exceptions rend le traitement précis.']::text[], '[{"language":"php","title":"Exception personnalisée","code":"<?php\nclass NoteInvalideException extends InvalidArgumentException {}\n\nfunction verifierNote(mixed $saisie): float\n{\n    if (!is_numeric($saisie)) {\n        throw new NoteInvalideException(\"« $saisie » n''est pas un nombre\");\n    }\n    $note = (float) $saisie;\n    if ($note < 0 || $note > 20) {\n        throw new NoteInvalideException(\"$note est hors de l''intervalle 0–20\");\n    }\n    return $note;\n}\n\nforeach ([\"15\", \"abc\", \"23\", \"9.5\"] as $saisie) {\n    try {\n        echo \"Note acceptée : \", verifierNote($saisie), \"\\n\";\n    } catch (NoteInvalideException $e) {\n        echo \"Refusée : \", $e->getMessage(), \"\\n\";\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-exceptions'), 'php-exceptions-quiz', 'Vérification — Exceptions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-exceptions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'qcm', 'Quel bloc s''exécute même si une exception est levée ?', null, '["catch","finally","else","default"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'qcm', 'Quelle interface est commune à Exception et Error ?', null, '["Countable","Throwable","Stringable","Iterator"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'vrai_faux', 'On peut afficher le message SQL complet d''une exception aux visiteurs en production.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-donnees-api', 'Bases de données avec PDO, JSON et API', null, 5, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-donnees-api'), (select id from public.courses where slug = 'php'), 'php-pdo', 'PDO : se connecter et interroger une base de données', 'intermediaire', 50, array['Se connecter à une base avec PDO.', 'Exécuter des requêtes préparées (CRUD).', 'Comprendre et empêcher l''injection SQL.', 'Utiliser les transactions.']::text[], array['Exceptions', 'Parcours SQL, niveau 1']::text[], '## PDO, une interface unique

**PDO** (PHP Data Objects) dialogue avec MySQL, MariaDB, PostgreSQL, SQLite… avec le même code. Seule la **chaîne de connexion** (DSN) change :

~~~php
<?php
// MySQL / MariaDB sur un serveur
$pdo = new PDO("mysql:host=localhost;dbname=universite;charset=utf8mb4", "utilisateur", "mot_de_passe");
// SQLite (fichier ou mémoire) — utilisé sur la plateforme
$pdo = new PDO("sqlite::memory:");
~~~

Options recommandées : **PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION** (les erreurs SQL deviennent des exceptions) et **PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC** (lignes sous forme de tableaux associatifs).

Sur la plateforme, PHP tourne dans votre navigateur : il n''y a pas de serveur MySQL. Les exemples utilisent **SQLite** avec PDO. Le code PDO est identique ; seules quelques syntaxes SQL diffèrent (AUTO_INCREMENT en MySQL, AUTOINCREMENT en SQLite).

## L''injection SQL

Ne construisez **jamais** une requête en collant une donnée de l''utilisateur :

~~~php
<?php
// DANGEREUX
$sql = "SELECT * FROM utilisateurs WHERE email = ''" . $_POST["email"] . "''";
~~~

Avec l''e-mail **'' OR ''1''=''1**, la condition devient toujours vraie : l''attaquant lit toute la table, voire la supprime.

## Les requêtes préparées

La requête et les données voyagent **séparément** : la donnée ne peut jamais être interprétée comme du SQL.

~~~php
<?php
$stmt = $pdo->prepare("SELECT * FROM etudiants WHERE filiere = :filiere AND age >= :age");
$stmt->execute(["filiere" => $filiere, "age" => 18]);
$lignes = $stmt->fetchAll();
~~~

**fetch()** lit une ligne, **fetchAll()** toutes, **fetchColumn()** une seule valeur ; **rowCount()** donne le nombre de lignes modifiées et **lastInsertId()** l''identifiant créé.

## CRUD

| Opération | SQL | Méthode PDO |
|---|---|---|
| Créer | INSERT | prepare + execute, lastInsertId |
| Lire | SELECT | prepare + execute, fetch / fetchAll |
| Modifier | UPDATE | prepare + execute, rowCount |
| Supprimer | DELETE | prepare + execute, rowCount |

## Transactions

Plusieurs requêtes qui doivent réussir **ensemble** (virement : débit puis crédit) se placent dans une transaction : **beginTransaction()**, puis **commit()** si tout va bien, **rollBack()** en cas d''exception.', array['PDO : même code pour MySQL, PostgreSQL, SQLite ; seule la DSN change.', 'Jamais de donnée collée dans le SQL : requêtes préparées obligatoires.', 'fetch, fetchAll, fetchColumn, rowCount, lastInsertId.', 'beginTransaction / commit / rollBack : tout ou rien.']::text[], '[{"language":"php","title":"CRUD complet avec PDO et SQLite","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [\n    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n]);\n$pdo->exec(\"CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, filiere TEXT NOT NULL, moyenne REAL)\");\n\n$ajout = $pdo->prepare(\"INSERT INTO etudiants (nom, filiere, moyenne) VALUES (:nom, :filiere, :moyenne)\");\nforeach ([[\"Kito\", \"Informatique\", 14.5], [\"Mbuyi\", \"Droit\", 11], [\"Kabila\", \"Informatique\", 9.5]] as [$nom, $filiere, $moyenne]) {\n    $ajout->execute(compact(\"nom\", \"filiere\", \"moyenne\"));\n}\necho \"Dernier identifiant : \", $pdo->lastInsertId(), \"\\n\";\n\n$maj = $pdo->prepare(\"UPDATE etudiants SET moyenne = :m WHERE nom = :n\");\n$maj->execute([\"m\" => 10.5, \"n\" => \"Kabila\"]);\necho \"Lignes modifiées : \", $maj->rowCount(), \"\\n\";\n\n$liste = $pdo->prepare(\"SELECT nom, moyenne FROM etudiants WHERE filiere = ? ORDER BY moyenne DESC\");\n$liste->execute([\"Informatique\"]);\nforeach ($liste->fetchAll() as $e) {\n    echo $e[\"nom\"], \" : \", $e[\"moyenne\"], \"\\n\";\n}\n\n// Tentative d''injection : traitée comme un simple texte\n$liste->execute([\"'' OR ''1''=''1\"]);\necho \"Résultats de l''injection : \", count($liste->fetchAll()), \"\\n\";"},{"language":"php","title":"Transaction : tout ou rien","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);\n$pdo->exec(\"CREATE TABLE comptes (nom TEXT PRIMARY KEY, solde INTEGER NOT NULL CHECK (solde >= 0))\");\n$pdo->exec(\"INSERT INTO comptes VALUES (''A'', 100), (''B'', 50)\");\n\nfunction virement(PDO $pdo, string $de, string $vers, int $montant): void\n{\n    $pdo->beginTransaction();\n    try {\n        $pdo->prepare(\"UPDATE comptes SET solde = solde + ? WHERE nom = ?\")->execute([$montant, $vers]);\n        $pdo->prepare(\"UPDATE comptes SET solde = solde - ? WHERE nom = ?\")->execute([$montant, $de]);\n        $pdo->commit();\n        echo \"Virement de $montant réussi\\n\";\n    } catch (PDOException $e) {\n        $pdo->rollBack();\n        echo \"Virement de $montant annulé (solde insuffisant)\\n\";\n    }\n}\n\nvirement($pdo, \"A\", \"B\", 30);\nvirement($pdo, \"A\", \"B\", 500);\nforeach ($pdo->query(\"SELECT nom, solde FROM comptes\") as $c) {\n    echo $c[\"nom\"], \" : \", $c[\"solde\"], \"\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-pdo'), 'php-pdo-quiz', 'Vérification — PDO', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-pdo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Qu''est-ce qui protège contre l''injection SQL ?', null, '["htmlspecialchars","Les requêtes préparées","trim","Un mot de passe long"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Quelle méthode renvoie l''identifiant de la dernière ligne insérée ?', null, '["rowCount()","lastInsertId()","fetch()","insertId"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Que fait rollBack() ?', null, '["Valide la transaction","Annule les modifications de la transaction","Ferme la connexion","Supprime la table"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'vrai_faux', 'Le code PDO change complètement entre MySQL et SQLite.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Seules la chaîne de connexion et quelques syntaxes SQL changent.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-donnees-api'), (select id from public.courses where slug = 'php'), 'php-json-api', 'JSON et API REST en PHP', 'intermediaire', 35, array['Encoder et décoder du JSON.', 'Comprendre les principes d''une API REST.', 'Produire une réponse d''API avec le bon code HTTP.']::text[], array['PDO']::text[], '## JSON

**JSON** est le format d''échange des API : objets {"cle": valeur}, listes [ … ], nombres, textes, true/false/null.

- **json_encode($tableau)** produit du JSON ; l''option **JSON_PRETTY_PRINT** l''indente, **JSON_UNESCAPED_UNICODE** garde les accents lisibles ;
- **json_decode($texte, true)** renvoie un tableau associatif ; avec **JSON_THROW_ON_ERROR**, un JSON invalide lève une exception.

## Une API REST

Une API expose des **ressources** (étudiants, produits) à des adresses, et l''action dépend de la **méthode HTTP** :

| Méthode | Adresse | Action | Code de réponse |
|---|---|---|---|
| GET | /api/etudiants | liste | 200 |
| GET | /api/etudiants/7 | détail | 200 ou 404 |
| POST | /api/etudiants | création | 201 |
| PUT / PATCH | /api/etudiants/7 | modification | 200 |
| DELETE | /api/etudiants/7 | suppression | 204 |

Codes d''erreur courants : **400** (données invalides), **401** (non connecté), **403** (interdit), **404** (introuvable), **422** (validation), **500** (erreur serveur).

## Répondre en JSON

~~~php
<?php
header("Content-Type: application/json; charset=utf-8");
http_response_code(201);
echo json_encode(["id" => 7, "nom" => "Kito"]);
~~~

Le corps d''une requête POST en JSON se lit avec **file_get_contents("php://input")** puis json_decode. On valide ces données exactement comme un formulaire.

## Routage simple

Un **routeur** associe méthode + chemin à une fonction. Les frameworks (Laravel, Symfony, Slim) fournissent des routeurs complets ; écrire le sien une fois aide à comprendre leur fonctionnement.', array['json_encode / json_decode(…, true).', 'REST : ressource + méthode HTTP + code de réponse.', 'Content-Type: application/json et http_response_code().']::text[], '[{"language":"php","title":"Mini API avec routeur","code":"<?php\n$etudiants = [1 => [\"id\" => 1, \"nom\" => \"Kito\"], 2 => [\"id\" => 2, \"nom\" => \"Mbuyi\"]];\n\nfunction repondre(int $code, mixed $donnees): void\n{\n    echo \"HTTP $code\\n\", json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), \"\\n\\n\";\n}\n\nfunction traiter(string $methode, string $chemin, array &$etudiants, ?string $corps = null): void\n{\n    if ($methode === \"GET\" && $chemin === \"/api/etudiants\") {\n        repondre(200, array_values($etudiants));\n    } elseif ($methode === \"GET\" && preg_match(\"#^/api/etudiants/(\\d+)$#\", $chemin, $m)) {\n        isset($etudiants[(int) $m[1]]) ? repondre(200, $etudiants[(int) $m[1]]) : repondre(404, [\"erreur\" => \"Étudiant introuvable\"]);\n    } elseif ($methode === \"POST\" && $chemin === \"/api/etudiants\") {\n        $donnees = json_decode($corps ?? \"\", true);\n        if (!is_array($donnees) || trim($donnees[\"nom\"] ?? \"\") === \"\") {\n            repondre(422, [\"erreur\" => \"Le nom est obligatoire\"]);\n            return;\n        }\n        $id = max(array_keys($etudiants)) + 1;\n        $etudiants[$id] = [\"id\" => $id, \"nom\" => trim($donnees[\"nom\"])];\n        repondre(201, $etudiants[$id]);\n    } else {\n        repondre(404, [\"erreur\" => \"Route inconnue\"]);\n    }\n}\n\ntraiter(\"GET\", \"/api/etudiants/2\", $etudiants);\ntraiter(\"POST\", \"/api/etudiants\", $etudiants, ''{\"nom\": \"Kabila\"}'');\ntraiter(\"POST\", \"/api/etudiants\", $etudiants, ''{\"nom\": \"\"}'');\ntraiter(\"GET\", \"/api/etudiants/9\", $etudiants);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-json-api'), 'php-json-quiz', 'Vérification — JSON et API', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-json-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Quel code HTTP pour une ressource créée ?', null, '["200","201","204","404"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Que renvoie json_decode(''{"a":1}'', true) ?', null, '["un objet stdClass","un tableau associatif","une chaîne","null"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Quelle méthode HTTP pour supprimer ?', null, '["GET","POST","DELETE","PATCH"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-professionnel', 'PHP professionnel : sécurité, architecture et tests', null, 6, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-professionnel'), (select id from public.courses where slug = 'php'), 'php-securite', 'Sécurité d''une application PHP', 'avance', 50, array['Stocker les mots de passe avec password_hash.', 'Se protéger du XSS, de l''injection SQL et du CSRF.', 'Sécuriser les sessions et les téléversements de fichiers.']::text[], array['PDO', 'Formulaires et sessions']::text[], '## Les mots de passe

On ne stocke **jamais** un mot de passe en clair, ni avec md5 ou sha1 (trop rapides à casser). On utilise :

~~~php
<?php
$empreinte = password_hash($motDePasse, PASSWORD_DEFAULT); // bcrypt ou argon2, avec sel aléatoire
if (password_verify($saisie, $empreinte)) { /* connecté */ }
~~~

**password_needs_rehash()** permet de renforcer l''empreinte lorsque l''algorithme évolue.

## Les principales failles

| Faille | Principe | Protection |
|---|---|---|
| Injection SQL | une donnée modifie la requête | requêtes préparées (PDO) |
| XSS | un script injecté s''exécute chez les visiteurs | htmlspecialchars à l''affichage, en-tête Content-Security-Policy |
| CSRF | un autre site fait envoyer un formulaire à la victime connectée | jeton aléatoire en session, vérifié à chaque POST ; cookies SameSite |
| Fixation / vol de session | l''identifiant de session est deviné ou volé | session_regenerate_id(true) à la connexion ; cookies httponly, secure, samesite |
| Téléversement malveillant | un fichier .php déguisé est envoyé puis exécuté | vérifier taille et type réel, renommer avec un nom aléatoire, stocker hors du dossier public |
| Force brute | essais répétés de mots de passe | limiter les tentatives, délai progressif |

## Le jeton CSRF

~~~php
<?php
$_SESSION["csrf"] ??= bin2hex(random_bytes(32));
// dans le formulaire : <input type="hidden" name="csrf" value="…">
if (!hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "")) {
    http_response_code(403);
    exit("Requête refusée");
}
~~~

**hash_equals** compare en temps constant ; **random_bytes** produit un aléa cryptographique (jamais rand()).

## Téléversement de fichiers

Avec **$_FILES** : vérifier **error === UPLOAD_ERR_OK**, la **taille**, le **type réel** (extension fileinfo : finfo_file), générer un nom aléatoire et déplacer avec **move_uploaded_file** dans un dossier où PHP ne s''exécute pas. Ne jamais faire confiance au nom ni au type envoyés par le navigateur.

## Principes généraux

- **moindre privilège** : l''utilisateur de la base n''a que les droits nécessaires ;
- **défense en profondeur** : plusieurs protections indépendantes ;
- **secrets hors du code** : mots de passe de base et clés dans des variables d''environnement, jamais dans Git ;
- **mises à jour** : PHP et les dépendances (composer audit).', array['password_hash / password_verify, jamais md5 ni mot de passe en clair.', 'Préparer (SQL), échapper (HTML), jeton (CSRF), régénérer (session).', 'Fichiers téléversés : taille, type réel, nom aléatoire, hors du dossier public.']::text[], '[{"language":"php","title":"Inscription et connexion sécurisées","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);\n$pdo->exec(\"CREATE TABLE utilisateurs (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, mot_de_passe TEXT NOT NULL)\");\n\nfunction inscrire(PDO $pdo, string $email, string $mdp): string\n{\n    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($mdp) < 10) {\n        return \"Inscription refusée : e-mail invalide ou mot de passe trop court\";\n    }\n    $pdo->prepare(\"INSERT INTO utilisateurs (email, mot_de_passe) VALUES (?, ?)\")->execute([$email, password_hash($mdp, PASSWORD_DEFAULT)]);\n    return \"Compte créé pour $email\";\n}\n\nfunction connecter(PDO $pdo, string $email, string $mdp): string\n{\n    $stmt = $pdo->prepare(\"SELECT mot_de_passe FROM utilisateurs WHERE email = ?\");\n    $stmt->execute([$email]);\n    $empreinte = $stmt->fetchColumn();\n    // Même message dans les deux cas : on ne révèle pas si l''e-mail existe.\n    return $empreinte !== false && password_verify($mdp, $empreinte) ? \"Connexion réussie\" : \"Identifiants incorrects\";\n}\n\necho inscrire($pdo, \"kito@upl.cd\", \"court\"), \"\\n\";\necho inscrire($pdo, \"kito@upl.cd\", \"Un-mot-de-passe-solide\"), \"\\n\";\necho connecter($pdo, \"kito@upl.cd\", \"mauvais\"), \"\\n\";\necho connecter($pdo, \"kito@upl.cd\", \"Un-mot-de-passe-solide\"), \"\\n\";\n$stocke = $pdo->query(\"SELECT mot_de_passe FROM utilisateurs\")->fetchColumn();\necho \"Stocké en base : \", substr($stocke, 0, 7), \"… (\", strlen($stocke), \" caractères, jamais le mot de passe)\\n\";\necho \"Jeton CSRF : \", strlen(bin2hex(random_bytes(32))), \" caractères aléatoires\\n\";"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-securite'), 'php-securite-quiz', 'Vérification — Sécurité', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-securite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Quelle fonction pour stocker un mot de passe ?', null, '["md5","sha1","password_hash","base64_encode"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Contre quelle attaque protège un jeton dans les formulaires ?', null, '["XSS","CSRF","Injection SQL","Force brute"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Quelle fonction pour générer un jeton de sécurité ?', null, '["rand()","uniqid()","random_bytes()","time()"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'vrai_faux', 'On peut se fier au type MIME envoyé par le navigateur pour un fichier téléversé.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-professionnel'), (select id from public.courses where slug = 'php'), 'php-architecture-tests', 'Architecture MVC, middleware et tests automatisés', 'avance', 50, array['Organiser une application en couches (MVC).', 'Comprendre le rôle d''un routeur et des middlewares.', 'Écrire des tests automatisés.']::text[], array['Sécurité d''une application PHP', 'Héritage et interfaces']::text[], '## Pourquoi une architecture ?

Un script de 2 000 lignes qui mélange SQL, HTML et règles métier devient impossible à maintenir. On sépare les **responsabilités** :

- **Modèle** : les données et les règles métier (classes Etudiant, dépôts d''accès à la base) ;
- **Vue** : l''affichage (gabarits HTML, sans requêtes SQL) ;
- **Contrôleur** : reçoit la requête, appelle le modèle, choisit la vue.

## Arborescence type

~~~text
public/index.php        ← point d''entrée unique (front controller)
src/Controleurs/        ← EtudiantControleur.php
src/Modeles/            ← Etudiant.php, EtudiantDepot.php
src/Middlewares/        ← Authentification.php
vues/                   ← etudiants/liste.php
config/                 ← paramètres (sans secrets)
tests/                  ← tests automatisés
vendor/                 ← dépendances installées par Composer
~~~

Seul le dossier **public/** est accessible depuis le web : le code et la configuration restent hors d''atteinte.

## Composer et l''autochargement

**Composer** installe les bibliothèques (composer require) et génère un **autochargeur** : avec la norme **PSR-4**, la classe App\Modeles\Etudiant est cherchée dans src/Modeles/Etudiant.php ; un seul **require "vendor/autoload.php"** suffit.

## Routeur et middlewares

Le **routeur** associe une adresse à une action de contrôleur. Un **middleware** est une couche traversée par chaque requête avant le contrôleur : vérifier la connexion, le rôle (étudiant, enseignant, administrateur), limiter le débit, journaliser. Chaque middleware peut laisser passer la requête ou répondre lui-même (403, redirection).

## Injection de dépendances

Une classe **reçoit** ce dont elle a besoin (dans son constructeur) au lieu de le créer : un contrôleur reçoit un **EtudiantDepot** (interface). En test, on lui donne un dépôt en mémoire ; en production, un dépôt PDO.

## Tests automatisés

Un **test unitaire** vérifie une petite unité (une fonction, une méthode) ; un **test d''intégration** vérifie plusieurs couches ensemble (contrôleur + base). En PHP, l''outil standard est **PHPUnit** (installé avec Composer) : **$this->assertSame(14.0, $e->moyenne());**. Les tests s''exécutent à chaque modification, souvent automatiquement (intégration continue).

## Vers Laravel

**Laravel** fournit tout cela prêt à l''emploi : routeur, contrôleurs, modèles Eloquent, vues Blade, middlewares, migrations, validation, authentification et tests. Comprendre les briques ci-dessus permet de l''utiliser en sachant ce qui se passe.', array['MVC : Modèle (données), Vue (affichage), Contrôleur (orchestration).', 'public/ seul exposé ; Composer + PSR-4 chargent les classes.', 'Routeur et middlewares filtrent les requêtes ; on injecte les dépendances.', 'Tests unitaires et d''intégration (PHPUnit) à chaque modification.']::text[], '[{"language":"php","title":"Mini-framework : routeur, middleware, contrôleur et tests","code":"<?php\ndeclare(strict_types=1);\n\ninterface EtudiantDepot { public function tous(): array; }\n\nfinal class DepotMemoire implements EtudiantDepot\n{\n    public function __construct(private array $donnees) {}\n    public function tous(): array { return $this->donnees; }\n}\n\nfinal class EtudiantControleur\n{\n    public function __construct(private EtudiantDepot $depot) {}\n    public function liste(): string\n    {\n        return implode(\", \", array_map(fn(array $e): string => $e[\"nom\"], $this->depot->tous()));\n    }\n}\n\n/** Middleware : refuse la requête si l''utilisateur n''a pas le rôle demandé. */\nfunction exigerRole(string $role, callable $suivant): callable\n{\n    return fn(array $requete): string => ($requete[\"role\"] ?? \"\") === $role ? $suivant($requete) : \"403 Accès refusé\";\n}\n\n$controleur = new EtudiantControleur(new DepotMemoire([[\"nom\" => \"Kito\"], [\"nom\" => \"Mbuyi\"]]));\n$routes = [\"GET /admin/etudiants\" => exigerRole(\"administrateur\", fn(array $r): string => \"200 \" . $controleur->liste())];\n\nfunction dispatcher(array $routes, array $requete): string\n{\n    return isset($routes[$requete[\"route\"]]) ? $routes[$requete[\"route\"]]($requete) : \"404 Introuvable\";\n}\n\necho dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"administrateur\"]), \"\\n\";\necho dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"etudiant\"]), \"\\n\";\necho dispatcher($routes, [\"route\" => \"GET /inconnu\"]), \"\\n\";\n\n// Tests unitaires minimalistes (PHPUnit fait la même chose, en plus complet)\nfunction verifier(string $nom, bool $condition): void { echo ($condition ? \"✓ \" : \"✗ \"), $nom, \"\\n\"; }\nverifier(\"la liste contient Kito\", str_contains($controleur->liste(), \"Kito\"));\nverifier(\"un étudiant est refusé\", dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"etudiant\"]) === \"403 Accès refusé\");"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-architecture-tests'), 'php-architecture-quiz', 'Vérification — Architecture', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-architecture-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Dans MVC, qui contient les requêtes SQL ?', null, '["La vue","Le modèle (ou le dépôt)","Le contrôleur uniquement","Le fichier CSS"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Quel est le rôle d''un middleware d''authentification ?', null, '["Afficher la page","Filtrer les requêtes avant le contrôleur","Créer les tables","Compiler PHP"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Quel outil installe les dépendances PHP ?', null, '["npm","pip","Composer","Maven"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'php') and m.slug not in ('php-premiers-pas', 'php-controle-donnees', 'php-web', 'php-objet', 'php-donnees-api', 'php-professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 1, 'Niveau 1 — Très débutant : premières pages dynamiques', 'Comprendre le rôle de PHP côté serveur et écrire ses premiers scripts : echo, variables, types, constantes, opérateurs, concaténation et premières conditions. Projet : une page personnalisée.', array['Expliquer le fonctionnement client / serveur.', 'Écrire et exécuter un script PHP.', 'Manipuler variables, types, constantes et opérateurs.', 'Produire une page HTML qui change selon les données.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-1', 'Examen du niveau 1 — Premiers pas en PHP', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que reçoit le navigateur quand il demande une page PHP ?', null, '["Le code PHP","Le HTML produit par PHP","Un fichier binaire","Le code et le HTML"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Quel symbole commence le nom d''une variable ?', null, '["@","#","$","&"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Qu''affiche echo "Total : " . 2 + 3; en PHP 8 ?', null, '["Total : 5","Total : 23","une erreur","5"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, 'En PHP 8, + et - sont prioritaires sur le point : 2 + 3 est calculé d''abord.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que vaut 7 % 3 ?', null, '["2","1","2.33","0"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que vaut "7" === 7 ?', null, '["true","false"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Comment déclarer une constante ?', null, '["$TAUX = 0.16;","const TAUX = 0.16;","constant TAUX 0.16;","let TAUX = 0.16;"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Quelle forme affiche une valeur au milieu du HTML ?', null, '["<? echo ?>","<?= $valeur ?>","{{ $valeur }}","<%= valeur %>"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'vrai_faux', 'Une donnée saisie au clavier ou dans un formulaire arrive sous forme de chaîne.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 2, 'Niveau 2 — Débutant : programmes et formulaires', 'Structures de contrôle, tableaux, fonctions, chaînes et dates, puis le web : formulaires GET/POST, validation, sécurité de l''affichage, sessions, cookies et inclusion de fichiers. Projets : inscription, calculatrice, gestion de notes.', array['Choisir la bonne structure de contrôle.', 'Organiser les données en tableaux associatifs.', 'Écrire des fonctions réutilisables.', 'Traiter un formulaire de façon sûre et conserver un état avec les sessions.']::text[], array['Projet guidé : formulaire de connexion complet (pages, session, déconnexion)', 'Projet guidé : formulaire de contact avec validation et message de confirmation']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-2', 'Examen du niveau 2 — Programmes et formulaires', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Que se passe-t-il sans break dans un case de switch ?', null, '["Erreur","L''exécution continue dans le cas suivant","Le switch s''arrête","Rien"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle boucle pour parcourir un tableau associatif ?', null, '["for","foreach ($t as $cle => $valeur)","while","do…while"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Que renvoie count([3, 5, 8]) ?', null, '["8","3","16","2"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle fonction découpe une chaîne en tableau ?', null, '["implode","explode","split","substr"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Une variable créée dans une fonction est visible…', null, '["partout","dans la fonction seulement","dans les fichiers inclus","dans la session"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quel tableau contient les champs d''un formulaire method="post" ?', null, '["$_GET","$_POST","$_FORM","$_REQUEST_POST"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Avant d''afficher une saisie dans une page, on utilise…', null, '["htmlspecialchars","trim","intval","json_encode"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Où sont conservées les données de $_SESSION ?', null, '["Dans le navigateur","Sur le serveur","Dans l''URL","Dans le cache"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
commit;
