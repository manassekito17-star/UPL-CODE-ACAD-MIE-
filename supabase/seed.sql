-- Fichier généré par scripts/generate-seed.ts — ne pas modifier à la main.
-- Contenu pédagogique de référence d'UPL Code Academy.
begin;

-- ===== Algorithmique et pseudocode =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('algorithmique', 'pseudocode', (select id from public.course_categories where slug = 'fondamentaux'), 'Parcours A', 'Algorithmique et pseudocode', 'Apprendre à raisonner avant de programmer.', 'Le parcours obligatoire de base : de la notion d''algorithme jusqu''à la résolution de problèmes complexes, en passant par les structures de contrôle, les tableaux, les sous-programmes, la récursivité, le tri et la complexité. Chaque notion est illustrée par du pseudocode exécutable directement dans le navigateur.', 'debutant', array['Aucun prérequis : ce parcours part de zéro.']::text[], array['Décomposer un problème en étapes précises et non ambiguës.', 'Écrire des algorithmes corrects en pseudocode français.', 'Maîtriser variables, conditions, boucles, tableaux et chaînes.', 'Structurer un algorithme avec des fonctions et des procédures.', 'Comprendre la récursivité, la recherche, le tri et la complexité.']::text[], 30, 'publie', 1, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'algorithmique'), 'fondements', 'Module 1 — Les fondements', 'Ce qu''est un algorithme, comment on manipule des données et comment un programme communique avec l''utilisateur.', 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'introduction-algorithmique', 'Introduction à l''algorithmique', 'debutant', 20, array['Comprendre le rôle de l''algorithmique en informatique.', 'Distinguer problème, algorithme et programme.', 'Exécuter un premier algorithme dans l''éditeur.']::text[], '{}'::text[], '## Pourquoi l''algorithmique ?

Un ordinateur exécute des instructions **très simples**, très vite, sans jamais réfléchir. Pour lui faire résoudre un problème, il faut lui décrire **exactement** quoi faire, étape par étape. L''algorithmique est l''art de concevoir ces étapes.

Avant d''écrire du Python, du C ou du Java, un informaticien réfléchit à la **méthode** : c''est l''algorithme. Le langage de programmation n''est ensuite qu''une traduction.

## Problème, algorithme, programme

| Notion | Définition | Exemple |
|---|---|---|
| Problème | Ce que l''on veut obtenir | Calculer la moyenne de trois notes |
| Algorithme | La méthode, indépendante du langage | Additionner les notes puis diviser par 3 |
| Programme | L''algorithme traduit dans un langage | Le même calcul écrit en Python |

## Le pseudocode

Le **pseudocode** est une façon d''écrire un algorithme en langage presque naturel, ici en français. Il est assez précis pour être exécuté, mais assez simple pour se concentrer sur la logique plutôt que sur la syntaxe.

Sur UPL Code Academy, le pseudocode est **exécutable** : vous pouvez lancer chaque exemple avec le bouton **Exécuter**.

## Structure générale

~~~pseudocode
ALGORITHME NomDeLAlgorithme
VARIABLES
  // déclaration des variables
DEBUT
  // instructions
FIN
~~~

Les mots-clés (ALGORITHME, DEBUT, ECRIRE…) peuvent être écrits en majuscules ou minuscules, avec ou sans accents.', array['Un algorithme est une méthode précise pour résoudre un problème.', 'Le programme est la traduction de l''algorithme dans un langage.', 'Le pseudocode permet de se concentrer sur la logique.']::text[], '[{"language":"pseudocode","title":"Premier algorithme","code":"ALGORITHME Bonjour\nDEBUT\n  ECRIRE(\"Bonjour et bienvenue à UPL Code Academy !\")\n  ECRIRE(\"Je suis votre premier algorithme.\")\nFIN","explanation":"ECRIRE affiche un message à l''écran. Les instructions s''exécutent dans l''ordre, de haut en bas."}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'intro-algo-quiz', 'Vérifier sa compréhension', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'intro-algo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'intro-algo-quiz'), 'qcm', 'Qu''est-ce qu''un algorithme ?', null, '["Un langage de programmation","Une suite finie d''instructions précises pour résoudre un problème","Un composant de l''ordinateur","Un logiciel de traitement de texte"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Un algorithme est une méthode : une suite finie et non ambiguë d''étapes.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'intro-algo-quiz'), 'vrai_faux', 'Un même algorithme peut être traduit dans plusieurs langages de programmation.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, 'L''algorithme est indépendant du langage : on peut l''écrire en Python, en C, en Java…' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'notion-algorithme', 'Notion d''algorithme', 'debutant', 25, array['Connaître les propriétés d''un bon algorithme.', 'Identifier les entrées, le traitement et les sorties.']::text[], '{}'::text[], '## Définition

Un **algorithme** est une suite **finie** d''instructions **non ambiguës** qui, à partir de données d''**entrée**, produit un **résultat** en un temps fini.

## Les propriétés d''un bon algorithme

1. **Fini** : il se termine toujours.
2. **Précis** : chaque étape a un seul sens possible.
3. **Correct** : il donne le bon résultat pour toutes les entrées valides.
4. **Efficace** : il n''utilise pas plus de temps ni de mémoire que nécessaire.

## Le schéma entrée → traitement → sortie

Presque tout algorithme suit ce schéma :

- **Entrées** : les données fournies (par exemple deux nombres).
- **Traitement** : les calculs et décisions (les additionner).
- **Sorties** : le résultat communiqué (afficher la somme).

## Exemple de la vie courante

Préparer un thé : faire bouillir l''eau, mettre un sachet dans la tasse, verser l''eau, attendre trois minutes, retirer le sachet. L''ordre compte : verser l''eau **avant** de la faire bouillir ne donne pas le résultat attendu !

## Analyser avant d''écrire

Avant d''écrire un algorithme, posez-vous trois questions :

1. De quelles données ai-je besoin ?
2. Quel résultat dois-je produire ?
3. Quelles étapes transforment les données en résultat ?', array['Un algorithme est fini, précis, correct et si possible efficace.', 'Il transforme des entrées en sorties grâce à un traitement.', 'L''ordre des instructions est essentiel.']::text[], '[{"language":"pseudocode","title":"Entrée, traitement, sortie","code":"ALGORITHME Double\nVARIABLES\n  n, resultat : ENTIER\nDEBUT\n  LIRE(n)                 // entrée\n  resultat ← n * 2        // traitement\n  ECRIRE(\"Le double de \", n, \" est \", resultat)   // sortie\nFIN","stdin":"21","explanation":"La valeur 21 est lue depuis la zone « Entrée »."}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'notion-algorithme'), 'notion-algo-quiz', 'Propriétés d''un algorithme', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'notion-algo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'notion-algo-quiz'), 'qcm', 'Laquelle de ces propriétés n''est PAS exigée d''un algorithme ?', null, '["Se terminer en un temps fini","Être écrit en anglais","Être non ambigu","Produire un résultat correct"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'notion-algo-quiz'), 'vrai_faux', 'Un algorithme qui ne se termine jamais pour certaines entrées est correct.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Un algorithme doit se terminer pour toutes les entrées valides.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'variables-constantes', 'Variables et constantes', 'debutant', 30, array['Déclarer des variables et des constantes.', 'Utiliser l''affectation ←.', 'Comprendre l''état de la mémoire pendant l''exécution.']::text[], '{}'::text[], '## La variable : une boîte nommée

Une **variable** est un emplacement de la mémoire qui porte un **nom** et contient une **valeur** qui peut changer pendant l''exécution. Elle a aussi un **type** (entier, réel, chaîne…).

## Déclaration

Toute variable doit être déclarée dans la section VARIABLES :

~~~pseudocode
VARIABLES
  age : ENTIER
  prix, total : REEL
  nom : CHAINE
~~~

## L''affectation

L''affectation donne une valeur à une variable. Elle s''écrit avec la flèche **←** (on peut aussi taper **<-**) :

~~~pseudocode
age ← 19
total ← prix * 2
~~~

On lit « age **reçoit** 19 ». La partie droite est calculée d''abord, puis le résultat est rangé dans la variable de gauche. L''ancienne valeur est **perdue**.

> Attention : le signe **=** sert à **comparer**, pas à affecter.

## Les constantes

Une **constante** a une valeur fixée une fois pour toutes :

~~~pseudocode
CONSTANTES
  PI = 3.14159
  TAUX_TVA = 0.16
~~~

Essayer de modifier une constante provoque une erreur. Les constantes rendent les algorithmes plus lisibles et plus faciles à modifier.

## Règles de nommage

- Commencer par une lettre ; utiliser lettres, chiffres et « _ ».
- Pas d''espace, pas de mot-clé (SI, POUR, FIN…).
- Choisir des noms parlants : **moyenne** plutôt que **m**.

## Trace d''exécution

Pour comprendre un algorithme, on suit l''évolution des variables ligne par ligne :

| Instruction | a | b |
|---|---|---|
| a ← 5 | 5 | ? |
| b ← a + 2 | 5 | 7 |
| a ← b * 2 | 14 | 7 |', array['Une variable a un nom, un type et une valeur qui peut changer.', 'L''affectation s''écrit ← ; le signe = sert à comparer.', 'Une constante ne peut pas être modifiée.']::text[], '[{"language":"pseudocode","title":"Échanger deux variables","code":"ALGORITHME Echange\nVARIABLES\n  a, b, temp : ENTIER\nDEBUT\n  a ← 5\n  b ← 8\n  ECRIRE(\"Avant : a = \", a, \", b = \", b)\n  temp ← a\n  a ← b\n  b ← temp\n  ECRIRE(\"Après : a = \", a, \", b = \", b)\nFIN","explanation":"Sans la variable temp, la valeur de a serait écrasée et perdue."},{"language":"pseudocode","title":"Utiliser une constante","code":"ALGORITHME Cercle\nCONSTANTES\n  PI = 3.14159\nVARIABLES\n  rayon, surface : REEL\nDEBUT\n  rayon ← 2\n  surface ← PI * rayon * rayon\n  ECRIRE(\"Surface : \", surface)\nFIN"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'variables-quiz', 'Variables et affectation', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'variables-quiz'), 'qcm', 'Après a ← 3 ; b ← a ; a ← 10, que vaut b ?', null, '["3","10","13","La variable b n''a pas de valeur"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, 'b a reçu une copie de la valeur de a (3) ; modifier a ensuite ne change pas b.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'variables-quiz'), 'vrai_faux', 'On peut modifier la valeur d''une constante dans le programme principal.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'variables-quiz'), 'qcm', 'Quel nom de variable est valide ?', null, '["2nombre","note finale","note_finale","SI"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'types-donnees', 'Types de données', 'debutant', 25, array['Connaître les types ENTIER, REEL, CHAINE, CARACTERE et BOOLEEN.', 'Choisir le bon type pour chaque donnée.']::text[], '{}'::text[], '## Pourquoi des types ?

Le **type** d''une variable indique quelles valeurs elle peut contenir et quelles opérations sont possibles. On peut multiplier deux nombres, mais pas deux prénoms !

## Les types simples

| Type | Valeurs | Exemples |
|---|---|---|
| ENTIER | nombres sans virgule | -3, 0, 42 |
| REEL | nombres à virgule | 3.14, -0.5, 12.0 |
| CHAINE | texte | "Kinshasa", "UPL" |
| CARACTERE | un seul caractère | ''A'', ''7'', ''?'' |
| BOOLEEN | VRAI ou FAUX | VRAI |

> En pseudocode, la virgule décimale s''écrit avec un **point** : 3.14.

## Vérification des types

L''interpréteur de la plateforme vérifie les types : ranger 7 / 2 (qui vaut 3.5, un réel) dans une variable ENTIER provoque une erreur. C''est volontaire : cela vous aide à repérer les erreurs de raisonnement.

## Choisir le bon type

- Un âge, un nombre d''étudiants : **ENTIER**.
- Une moyenne, un prix : **REEL**.
- Un nom, une adresse : **CHAINE**.
- Une réponse oui/non, « est admis » : **BOOLEEN**.

## Conversions

Les fonctions **ENTIER(x)**, **REEL(x)** et **CHAINE(x)** convertissent une valeur. **ARRONDI(x)** arrondit et **ENT(x)** donne la partie entière.', array['Cinq types simples : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN.', 'Le type détermine les valeurs et opérations autorisées.', 'On convertit avec ENTIER(), REEL(), CHAINE().']::text[], '[{"language":"pseudocode","title":"Les cinq types","code":"ALGORITHME Types\nVARIABLES\n  annee : ENTIER\n  moyenne : REEL\n  ville : CHAINE\n  initiale : CARACTERE\n  admis : BOOLEEN\nDEBUT\n  annee ← 2026\n  moyenne ← 14.5\n  ville ← \"Lubumbashi\"\n  initiale ← ''U''\n  admis ← moyenne >= 10\n  ECRIRE(annee, \" | \", moyenne, \" | \", ville, \" | \", initiale, \" | \", admis)\nFIN","explanation":"La comparaison moyenne >= 10 produit une valeur booléenne."}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'types-quiz', 'Types de données', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'types-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'types-quiz'), 'qcm', 'Quel type convient pour stocker le prix d''un livre (ex. 12.50) ?', null, '["ENTIER","REEL","BOOLEEN","CARACTERE"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'types-quiz'), 'qcm', 'Quelle est la valeur de 15 >= 10 ?', null, '["15","10","VRAI","FAUX"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'types-quiz'), 'vrai_faux', 'Une variable de type CARACTERE peut contenir le texte "Bonjour".', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Un CARACTERE contient exactement un caractère. Pour un texte, on utilise CHAINE.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'operateurs', 'Opérateurs arithmétiques et logiques', 'debutant', 30, array['Utiliser les opérateurs arithmétiques, DIV et MOD.', 'Écrire des comparaisons et des expressions logiques avec ET, OU, NON.', 'Connaître les priorités des opérateurs.']::text[], '{}'::text[], '## Opérateurs arithmétiques

| Opérateur | Rôle | Exemple | Résultat |
|---|---|---|---|
| + | addition | 7 + 2 | 9 |
| - | soustraction | 7 - 2 | 5 |
| * | multiplication | 7 * 2 | 14 |
| / | division réelle | 7 / 2 | 3.5 |
| DIV | quotient entier | 7 DIV 2 | 3 |
| MOD | reste de la division | 7 MOD 2 | 1 |
| ^ | puissance | 2 ^ 3 | 8 |

**MOD** est très utile : un nombre n est **pair** si n MOD 2 = 0.

## Opérateurs de comparaison

=, <> (différent), <, >, <= (inférieur ou égal), >= (supérieur ou égal). Le résultat est un **booléen**.

## Opérateurs logiques

| A | B | A ET B | A OU B | NON A |
|---|---|---|---|---|
| VRAI | VRAI | VRAI | VRAI | FAUX |
| VRAI | FAUX | FAUX | VRAI | FAUX |
| FAUX | VRAI | FAUX | VRAI | VRAI |
| FAUX | FAUX | FAUX | FAUX | VRAI |

Pour tester qu''une note est comprise entre 0 et 20 : **(note >= 0) ET (note <= 20)**. On ne peut pas écrire 0 <= note <= 20.

## Priorités

Du plus prioritaire au moins prioritaire :

1. Parenthèses
2. ^
3. *, /, DIV, MOD
4. +, -
5. Comparaisons
6. NON, puis ET, puis OU

En cas de doute, **ajoutez des parenthèses** : 2 + 3 * 4 vaut 14, mais (2 + 3) * 4 vaut 20.', array['DIV donne le quotient entier, MOD le reste.', 'Les comparaisons produisent des booléens.', 'ET, OU, NON combinent des conditions ; les parenthèses lèvent les ambiguïtés.']::text[], '[{"language":"pseudocode","title":"Quotient et reste","code":"ALGORITHME Conversion\nVARIABLES\n  secondes, minutes, reste : ENTIER\nDEBUT\n  secondes ← 200\n  minutes ← secondes DIV 60\n  reste ← secondes MOD 60\n  ECRIRE(secondes, \" s = \", minutes, \" min \", reste, \" s\")\nFIN"},{"language":"pseudocode","title":"Expressions logiques","code":"ALGORITHME Logique\nVARIABLES\n  n : ENTIER\n  pair, valide : BOOLEEN\nDEBUT\n  n ← 14\n  pair ← n MOD 2 = 0\n  valide ← (n >= 0) ET (n <= 20)\n  ECRIRE(\"Pair : \", pair, \" ; note valide : \", valide, \" ; impair : \", NON pair)\nFIN"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'operateurs-quiz', 'Opérateurs', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'operateurs-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'operateurs-quiz'), 'qcm', 'Que vaut 17 MOD 5 ?', null, '["3","2","3.4","12"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'operateurs-quiz'), 'qcm', 'Que vaut 2 + 3 * 4 ?', null, '["20","14","24","9"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'operateurs-quiz'), 'qcm', 'Quelle condition teste qu''un âge est compris entre 18 et 25 inclus ?', null, '["18 <= age <= 25","(age >= 18) OU (age <= 25)","(age >= 18) ET (age <= 25)","age = 18 ET 25"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'entrees-sorties', 'Entrées et sorties', 'debutant', 20, array['Lire des données avec LIRE.', 'Afficher des résultats clairs avec ECRIRE.']::text[], '{}'::text[], '## Afficher : ECRIRE

**ECRIRE** affiche des valeurs puis passe à la ligne. On peut afficher plusieurs éléments séparés par des virgules :

~~~pseudocode
ECRIRE("La moyenne est ", moyenne, " sur 20")
~~~

## Lire : LIRE

**LIRE(variable)** attend une donnée de l''utilisateur et la range dans la variable. Sur la plateforme, les données sont saisies à l''avance dans la zone **Entrée**, **une valeur par ligne**.

~~~pseudocode
LIRE(nom)
LIRE(age)
~~~

La valeur lue est convertie dans le type de la variable : si la variable est un ENTIER et que l''on saisit « abc », une erreur est signalée.

## Bonnes pratiques

- Afficher un message avant de lire, pour guider l''utilisateur.
- Afficher des résultats explicites : « Moyenne : 12.5 » plutôt que « 12.5 ».
- Pour les exercices corrigés automatiquement, respectez **exactement** le format de sortie demandé.', array['ECRIRE affiche ; LIRE range une donnée saisie dans une variable.', 'Sur la plateforme, saisissez les entrées une par ligne.', 'Respectez le format de sortie demandé par les exercices.']::text[], '[{"language":"pseudocode","title":"Saluer l''utilisateur","code":"ALGORITHME Salutation\nVARIABLES\n  nom : CHAINE\n  annee, age : ENTIER\nDEBUT\n  ECRIRE(\"Quel est votre nom ?\")\n  LIRE(nom)\n  ECRIRE(\"Votre année de naissance ?\")\n  LIRE(annee)\n  age ← 2026 - annee\n  ECRIRE(\"Bonjour \", nom, \", vous avez environ \", age, \" ans.\")\nFIN","stdin":"Grâce\n2005"}]'::jsonb, 'publie', 6, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'algorithmique'), 'structures-controle', 'Module 2 — Structures de contrôle', 'Prendre des décisions et répéter des actions.', 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-controle'), (select id from public.courses where slug = 'algorithmique'), 'structures-conditionnelles', 'Structures conditionnelles', 'debutant', 30, array['Écrire des tests avec SI … ALORS … SINON … FINSI.', 'Utiliser SELON pour des choix multiples.']::text[], '{}'::text[], '## SI … ALORS … FINSI

Une condition permet d''exécuter des instructions **seulement si** une condition est vraie.

~~~pseudocode
SI note >= 10 ALORS
  ECRIRE("Admis")
FINSI
~~~

## SI … ALORS … SINON … FINSI

~~~pseudocode
SI note >= 10 ALORS
  ECRIRE("Admis")
SINON
  ECRIRE("Ajourné")
FINSI
~~~

## Plusieurs cas : SINON SI

~~~pseudocode
SI note >= 16 ALORS
  ECRIRE("Très bien")
SINON SI note >= 14 ALORS
  ECRIRE("Bien")
SINON SI note >= 10 ALORS
  ECRIRE("Passable")
SINON
  ECRIRE("Insuffisant")
FINSI
~~~

Les conditions sont testées **dans l''ordre** : dès qu''une est vraie, les suivantes sont ignorées.

## SELON : choix selon une valeur

~~~pseudocode
SELON jour
  CAS 1 : ECRIRE("Lundi")
  CAS 6, 7 : ECRIRE("Week-end")
  AUTRE : ECRIRE("Jour de semaine")
FINSELON
~~~

**SELON** compare une valeur à des constantes. Il rend le code plus lisible qu''une longue suite de SINON SI.

## Indentation

Décalez les instructions à l''intérieur d''un bloc. L''interpréteur ne l''exige pas, mais vos lecteurs (et vos enseignants !) vous remercieront.', array['SI … ALORS … SINON … FINSI exécute un bloc selon une condition.', 'SINON SI enchaîne plusieurs cas testés dans l''ordre.', 'SELON compare une valeur à plusieurs constantes.']::text[], '[{"language":"pseudocode","title":"Mention d''un étudiant","code":"ALGORITHME Mention\nVARIABLES\n  note : REEL\nDEBUT\n  LIRE(note)\n  SI note >= 16 ALORS\n    ECRIRE(\"Très bien\")\n  SINON SI note >= 14 ALORS\n    ECRIRE(\"Bien\")\n  SINON SI note >= 10 ALORS\n    ECRIRE(\"Passable\")\n  SINON\n    ECRIRE(\"Insuffisant\")\n  FINSI\nFIN","stdin":"14.5"},{"language":"pseudocode","title":"SELON","code":"ALGORITHME Jour\nVARIABLES\n  jour : ENTIER\nDEBUT\n  LIRE(jour)\n  SELON jour\n    CAS 1 : ECRIRE(\"Lundi\")\n    CAS 2 : ECRIRE(\"Mardi\")\n    CAS 3 : ECRIRE(\"Mercredi\")\n    CAS 4 : ECRIRE(\"Jeudi\")\n    CAS 5 : ECRIRE(\"Vendredi\")\n    CAS 6, 7 : ECRIRE(\"Week-end\")\n    AUTRE : ECRIRE(\"Numéro invalide\")\n  FINSELON\nFIN","stdin":"6"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'conditions-quiz', 'Conditions', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'conditions-quiz'), 'qcm', 'Avec note = 15, que affiche l''algorithme « Mention » ?', null, '["Très bien","Bien","Passable","Bien puis Passable"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, '15 >= 16 est faux, 15 >= 14 est vrai : « Bien » est affiché et les autres cas sont ignorés.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'conditions-quiz'), 'vrai_faux', 'Le bloc SINON est obligatoire dans un SI.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-controle'), (select id from public.courses where slug = 'algorithmique'), 'conditions-imbriquees', 'Conditions imbriquées', 'debutant', 25, array['Placer un SI à l''intérieur d''un autre SI.', 'Simplifier des conditions avec ET / OU.']::text[], '{}'::text[], '## Imbriquer des conditions

Un bloc SI peut contenir un autre SI. Exemple : déterminer le signe d''un produit sans le calculer.

~~~pseudocode
SI a = 0 OU b = 0 ALORS
  ECRIRE("nul")
SINON
  SI (a > 0 ET b > 0) OU (a < 0 ET b < 0) ALORS
    ECRIRE("positif")
  SINON
    ECRIRE("négatif")
  FINSI
FINSI
~~~

Chaque **SI** doit être fermé par son **FINSI**. L''indentation permet de vérifier visuellement l''appariement.

## Imbriquer ou combiner ?

Ces deux écritures sont équivalentes :

~~~pseudocode
SI age >= 18 ALORS
  SI inscrit ALORS
    ECRIRE("Accès autorisé")
  FINSI
FINSI
~~~

~~~pseudocode
SI age >= 18 ET inscrit ALORS
  ECRIRE("Accès autorisé")
FINSI
~~~

La seconde est plus lisible. On imbrique quand chaque niveau a ses propres actions (par exemple un SINON différent).

## Erreurs fréquentes

- Oublier un FINSI : l''interpréteur signale « FINSI attendu ».
- Tester des cas qui se chevauchent dans le mauvais ordre.
- Écrire 0 < x < 10 au lieu de (x > 0) ET (x < 10).', array['Un SI peut contenir d''autres SI ; chacun a son FINSI.', 'ET / OU permettent souvent d''éviter des imbrications.', 'L''ordre des tests compte quand les cas se chevauchent.']::text[], '[{"language":"pseudocode","title":"Le plus grand de trois nombres","code":"ALGORITHME Maximum3\nVARIABLES\n  a, b, c, max : ENTIER\nDEBUT\n  LIRE(a)\n  LIRE(b)\n  LIRE(c)\n  SI a >= b ALORS\n    SI a >= c ALORS\n      max ← a\n    SINON\n      max ← c\n    FINSI\n  SINON\n    SI b >= c ALORS\n      max ← b\n    SINON\n      max ← c\n    FINSI\n  FINSI\n  ECRIRE(\"Maximum : \", max)\nFIN","stdin":"12\n45\n7"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-controle'), (select id from public.courses where slug = 'algorithmique'), 'boucles', 'Boucles POUR, TANT QUE et RÉPÉTER', 'debutant', 40, array['Répéter des instructions avec POUR, TANT QUE et RÉPÉTER.', 'Choisir la boucle adaptée à la situation.', 'Éviter les boucles infinies.']::text[], '{}'::text[], '## La boucle POUR

Quand on connaît **à l''avance** le nombre de répétitions :

~~~pseudocode
POUR i DE 1 A 5 FAIRE
  ECRIRE(i)
FINPOUR
~~~

Le compteur **i** prend successivement les valeurs 1, 2, 3, 4, 5. On peut préciser un pas : **POUR i DE 10 A 0 PAS -2 FAIRE**.

## La boucle TANT QUE

Quand on répète **tant qu''une condition est vraie**, sans connaître le nombre de tours :

~~~pseudocode
TANT QUE solde < objectif FAIRE
  solde ← solde * 1.05
  annees ← annees + 1
FINTANTQUE
~~~

La condition est testée **avant** chaque tour : si elle est fausse au départ, la boucle ne s''exécute jamais.

## La boucle RÉPÉTER … JUSQU''À

La condition est testée **après** chaque tour : le corps s''exécute **au moins une fois**. Idéal pour contrôler une saisie :

~~~pseudocode
REPETER
  LIRE(note)
JUSQU''A (note >= 0) ET (note <= 20)
~~~

Attention : RÉPÉTER s''arrête quand la condition devient **vraie**, TANT QUE s''arrête quand elle devient **fausse**.

## Quelle boucle choisir ?

| Situation | Boucle |
|---|---|
| Nombre de tours connu | POUR |
| Condition testée avant, 0 tour possible | TANT QUE |
| Au moins un tour | RÉPÉTER |

## Boucles infinies

Si la condition de sortie n''est jamais atteinte, la boucle ne s''arrête pas. La plateforme interrompt automatiquement le programme après un grand nombre d''instructions. Vérifiez toujours que **la condition finit par changer** dans le corps de la boucle.', array['POUR : nombre de tours connu.', 'TANT QUE : condition testée avant chaque tour.', 'RÉPÉTER … JUSQU''À : au moins un tour, s''arrête quand la condition est vraie.']::text[], '[{"language":"pseudocode","title":"Table de multiplication","code":"ALGORITHME Table\nVARIABLES\n  n, i : ENTIER\nDEBUT\n  LIRE(n)\n  POUR i DE 1 A 10 FAIRE\n    ECRIRE(n, \" x \", i, \" = \", n * i)\n  FINPOUR\nFIN","stdin":"7"},{"language":"pseudocode","title":"Épargne avec TANT QUE","code":"ALGORITHME Epargne\nVARIABLES\n  solde : REEL\n  annees : ENTIER\nDEBUT\n  solde ← 1000\n  annees ← 0\n  TANT QUE solde < 2000 FAIRE\n    solde ← solde * 1.08\n    annees ← annees + 1\n  FINTANTQUE\n  ECRIRE(\"Capital doublé après \", annees, \" ans\")\nFIN"},{"language":"pseudocode","title":"Saisie contrôlée avec RÉPÉTER","code":"ALGORITHME SaisieNote\nVARIABLES\n  note : REEL\nDEBUT\n  REPETER\n    ECRIRE(\"Entrez une note entre 0 et 20 :\")\n    LIRE(note)\n  JUSQU''A (note >= 0) ET (note <= 20)\n  ECRIRE(\"Note acceptée : \", note)\nFIN","stdin":"25\n-3\n12"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'boucles-quiz', 'Boucles', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'qcm', 'Combien de fois s''exécute le corps de POUR i DE 3 A 7 FAIRE ?', null, '["4","5","7","3"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'qcm', 'Quelle boucle s''exécute toujours au moins une fois ?', null, '["POUR","TANT QUE","RÉPÉTER … JUSQU''À","Aucune"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'vrai_faux', 'Une boucle TANT QUE dont la condition est fausse au départ ne s''exécute pas.', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-controle'), (select id from public.courses where slug = 'algorithmique'), 'compteurs-accumulateurs', 'Compteurs et accumulateurs', 'debutant', 30, array['Utiliser un compteur pour dénombrer.', 'Utiliser un accumulateur pour calculer une somme ou un produit.', 'Rechercher un minimum ou un maximum au fil d''une saisie.']::text[], '{}'::text[], '## Le compteur

Un **compteur** est une variable entière que l''on augmente de 1 à chaque fois qu''un événement se produit.

~~~pseudocode
nbAdmis ← 0              // initialisation AVANT la boucle
...
SI note >= 10 ALORS
  nbAdmis ← nbAdmis + 1  // incrémentation
FINSI
~~~

## L''accumulateur

Un **accumulateur** cumule des valeurs : somme (initialisée à 0) ou produit (initialisé à 1).

~~~pseudocode
somme ← 0
POUR i DE 1 A n FAIRE
  LIRE(x)
  somme ← somme + x
FINPOUR
~~~

## Minimum et maximum

On initialise le maximum avec la **première valeur** lue, puis on compare chaque nouvelle valeur.

## La règle d''or

**Toujours initialiser** compteurs et accumulateurs avant la boucle. Une variable utilisée sans valeur provoque une erreur : « utilisée avant d''avoir reçu une valeur ».

## La valeur sentinelle

Pour lire une série dont on ne connaît pas la longueur, on convient d''une valeur d''arrêt (par exemple -1) :

~~~pseudocode
LIRE(x)
TANT QUE x <> -1 FAIRE
  somme ← somme + x
  LIRE(x)
FINTANTQUE
~~~', array['Compteur : +1 à chaque événement, initialisé à 0.', 'Accumulateur : somme (0) ou produit (1).', 'Toujours initialiser avant la boucle.']::text[], '[{"language":"pseudocode","title":"Statistiques d''une promotion","code":"ALGORITHME Statistiques\nVARIABLES\n  n, i, nbAdmis : ENTIER\n  note, somme, meilleure : REEL\nDEBUT\n  LIRE(n)\n  somme ← 0\n  nbAdmis ← 0\n  POUR i DE 1 A n FAIRE\n    LIRE(note)\n    somme ← somme + note\n    SI note >= 10 ALORS\n      nbAdmis ← nbAdmis + 1\n    FINSI\n    SI i = 1 OU note > meilleure ALORS\n      meilleure ← note\n    FINSI\n  FINPOUR\n  ECRIRE(\"Moyenne : \", somme / n)\n  ECRIRE(\"Admis : \", nbAdmis, \" sur \", n)\n  ECRIRE(\"Meilleure note : \", meilleure)\nFIN","stdin":"5\n12\n8.5\n15\n9\n17","explanation":"Le OU est évalué de gauche à droite : au premier tour, i = 1 est vrai et meilleure n''est pas encore lue."}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'algorithmique'), 'donnees-structurees', 'Module 3 — Tableaux et chaînes', 'Manipuler des collections de valeurs et du texte.', 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'donnees-structurees'), (select id from public.courses where slug = 'algorithmique'), 'tableaux', 'Tableaux', 'intermediaire', 40, array['Déclarer et parcourir un tableau.', 'Accéder à une case par son indice.', 'Utiliser des tableaux à deux dimensions.']::text[], '{}'::text[], '## Pourquoi des tableaux ?

Pour stocker les notes de 50 étudiants, déclarer 50 variables serait absurde. Un **tableau** regroupe plusieurs valeurs **du même type** sous un seul nom ; chaque case est repérée par un **indice**.

## Déclaration

~~~pseudocode
VARIABLES
  notes : TABLEAU[1..50] DE REEL
~~~

Les indices vont ici de 1 à 50. On accède à une case avec **notes[i]**.

## Parcourir un tableau

La boucle POUR est l''outil naturel :

~~~pseudocode
POUR i DE 1 A 50 FAIRE
  LIRE(notes[i])
FINPOUR
~~~

## Débordement

Accéder à **notes[51]** provoque l''erreur « indice hors limites ». C''est l''une des erreurs les plus fréquentes : vérifiez les bornes de vos boucles.

## Tableaux à deux dimensions

Une matrice (tableau de lignes et de colonnes) se déclare ainsi :

~~~pseudocode
M : TABLEAU[1..3, 1..4] DE ENTIER
M[2, 3] ← 7
~~~

On la parcourt avec deux boucles imbriquées : une pour les lignes, une pour les colonnes.

## Passage à un sous-programme

Un tableau passé à une fonction l''est **par référence** : la fonction travaille directement sur le tableau d''origine.', array['Un tableau regroupe des valeurs de même type, repérées par un indice.', 'On le parcourt avec une boucle POUR.', 'Attention aux indices hors limites.']::text[], '[{"language":"pseudocode","title":"Notes au-dessus de la moyenne","code":"ALGORITHME AuDessus\nCONSTANTES\n  N = 5\nVARIABLES\n  notes : TABLEAU[1..N] DE REEL\n  i : ENTIER\n  somme, moyenne : REEL\nDEBUT\n  somme ← 0\n  POUR i DE 1 A N FAIRE\n    LIRE(notes[i])\n    somme ← somme + notes[i]\n  FINPOUR\n  moyenne ← somme / N\n  ECRIRE(\"Moyenne : \", moyenne)\n  POUR i DE 1 A N FAIRE\n    SI notes[i] > moyenne ALORS\n      ECRIRE(\"Étudiant \", i, \" : \", notes[i])\n    FINSI\n  FINPOUR\nFIN","stdin":"12\n7\n15\n10\n16"},{"language":"pseudocode","title":"Matrice et boucles imbriquées","code":"ALGORITHME Matrice\nVARIABLES\n  M : TABLEAU[1..3, 1..3] DE ENTIER\n  i, j : ENTIER\n  ligne : CHAINE\nDEBUT\n  POUR i DE 1 A 3 FAIRE\n    ligne ← \"\"\n    POUR j DE 1 A 3 FAIRE\n      M[i, j] ← i * j\n      ligne ← ligne + CHAINE(M[i, j]) + \" \"\n    FINPOUR\n    ECRIRE(ligne)\n  FINPOUR\nFIN"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'tableaux-quiz', 'Tableaux', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'tableaux-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'tableaux-quiz'), 'qcm', 'T : TABLEAU[1..10] DE ENTIER. Combien de cases contient T ?', null, '["9","10","11","1"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'tableaux-quiz'), 'vrai_faux', 'Un tableau peut contenir à la fois des entiers et des chaînes.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'donnees-structurees'), (select id from public.courses where slug = 'algorithmique'), 'chaines-caracteres', 'Chaînes de caractères', 'intermediaire', 30, array['Concaténer des chaînes.', 'Accéder aux caractères d''une chaîne.', 'Utiliser les fonctions prédéfinies sur les chaînes.']::text[], '{}'::text[], '## Concaténation

L''opérateur **+** colle deux chaînes : "Bon" + "jour" donne "Bonjour". Pour coller un nombre, convertissez-le : "Note : " + CHAINE(15).

## Accès aux caractères

Une chaîne se comporte comme un tableau de caractères indicé **à partir de 1** : si s ← "UPL", alors s[1] vaut ''U'' et s[3] vaut ''L''.

## Fonctions utiles

| Fonction | Rôle | Exemple | Résultat |
|---|---|---|---|
| LONGUEUR(s) | nombre de caractères | LONGUEUR("code") | 4 |
| MAJUSCULE(s) | en majuscules | MAJUSCULE("upl") | "UPL" |
| MINUSCULE(s) | en minuscules | MINUSCULE("UPL") | "upl" |
| SOUSCHAINE(s, d, n) | n caractères à partir de d | SOUSCHAINE("algorithme", 1, 4) | "algo" |
| ORD(c) / CHR(n) | code d''un caractère et inverse | ORD("A") | 65 |

## Parcours d''une chaîne

~~~pseudocode
POUR i DE 1 A LONGUEUR(s) FAIRE
  SI s[i] = "a" ALORS
    nb ← nb + 1
  FINSI
FINPOUR
~~~

## Comparaison

Les chaînes se comparent avec = et <>, et aussi avec < ou > (ordre alphabétique). La comparaison distingue majuscules et minuscules : utilisez MINUSCULE pour comparer sans en tenir compte.', array['+ concatène ; CHAINE(x) convertit un nombre en texte.', 's[i] donne le i-ème caractère (à partir de 1).', 'LONGUEUR, MAJUSCULE, MINUSCULE, SOUSCHAINE sont prédéfinies.']::text[], '[{"language":"pseudocode","title":"Palindrome","code":"ALGORITHME Palindrome\nVARIABLES\n  mot, envers : CHAINE\n  i : ENTIER\nDEBUT\n  LIRE(mot)\n  mot ← MINUSCULE(mot)\n  envers ← \"\"\n  POUR i DE LONGUEUR(mot) A 1 PAS -1 FAIRE\n    envers ← envers + mot[i]\n  FINPOUR\n  SI mot = envers ALORS\n    ECRIRE(mot, \" est un palindrome\")\n  SINON\n    ECRIRE(mot, \" n''est pas un palindrome\")\n  FINSI\nFIN","stdin":"Radar"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'algorithmique'), 'modularite', 'Module 4 — Sous-programmes', 'Découper un algorithme en fonctions et procédures réutilisables.', 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'modularite'), (select id from public.courses where slug = 'algorithmique'), 'fonctions-procedures', 'Fonctions et procédures', 'intermediaire', 45, array['Définir et appeler une fonction qui retourne une valeur.', 'Définir et appeler une procédure.', 'Distinguer passage par valeur et par référence.']::text[], '{}'::text[], '## Pourquoi découper ?

Un algorithme long devient vite illisible. Les **sous-programmes** permettent de :

- donner un nom à une tâche précise ;
- réutiliser le même code plusieurs fois ;
- tester chaque partie séparément.

## La fonction

Une **fonction** calcule et **retourne** une valeur :

~~~pseudocode
FONCTION carre(x : REEL) : REEL
DEBUT
  RETOURNER x * x
FIN
~~~

On l''utilise dans une expression : **y ← carre(3) + 1**.

## La procédure

Une **procédure** effectue une action mais ne retourne pas de valeur :

~~~pseudocode
PROCEDURE afficherLigne(n : ENTIER)
VARIABLES
  i : ENTIER
  ligne : CHAINE
DEBUT
  ligne ← ""
  POUR i DE 1 A n FAIRE
    ligne ← ligne + "-"
  FINPOUR
  ECRIRE(ligne)
FIN
~~~

On l''appelle comme une instruction : **afficherLigne(20)**.

## Paramètres et variables locales

- Les **paramètres** reçoivent les valeurs transmises à l''appel.
- Les **variables locales** (section VARIABLES du sous-programme) n''existent que pendant l''appel.

## Passage par valeur ou par référence

Par défaut, un paramètre reçoit une **copie** : le modifier ne change pas la variable de l''appelant. Avec le mot-clé **VAR** (ou E/S), le paramètre est passé **par référence** : le sous-programme modifie directement la variable d''origine.

~~~pseudocode
PROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)
~~~

## Où placer les sous-programmes ?

Avant ou après le bloc DEBUT … FIN principal. Une fonction peut se terminer par FIN ou FINFONCTION.', array['Une fonction retourne une valeur avec RETOURNER ; une procédure non.', 'Les variables locales n''existent que pendant l''appel.', 'VAR passe un paramètre par référence.']::text[], '[{"language":"pseudocode","title":"Fonction et procédure","code":"ALGORITHME Sousprogrammes\n\nFONCTION estPair(n : ENTIER) : BOOLEEN\nDEBUT\n  RETOURNER n MOD 2 = 0\nFIN\n\nPROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)\nVARIABLES\n  t : ENTIER\nDEBUT\n  t ← a\n  a ← b\n  b ← t\nFIN\n\nVARIABLES\n  x, y : ENTIER\nDEBUT\n  x ← 4\n  y ← 9\n  ECRIRE(\"4 est pair : \", estPair(x))\n  echanger(x, y)\n  ECRIRE(\"Après échange : x = \", x, \", y = \", y)\nFIN"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fonctions-procedures'), 'fonctions-quiz', 'Sous-programmes', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'fonctions-quiz'), 'qcm', 'Quelle est la différence principale entre fonction et procédure ?', null, '["La fonction ne prend pas de paramètres","La fonction retourne une valeur, la procédure non","La procédure est plus rapide","Il n''y a aucune différence"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'fonctions-quiz'), 'vrai_faux', 'Sans VAR, modifier un paramètre dans une procédure modifie la variable de l''appelant.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'modularite'), (select id from public.courses where slug = 'algorithmique'), 'recursivite', 'Récursivité', 'avance', 40, array['Comprendre le principe d''une fonction récursive.', 'Identifier le cas de base et le cas récursif.', 'Suivre l''exécution d''appels récursifs.']::text[], '{}'::text[], '## Définition

Une fonction est **récursive** lorsqu''elle s''appelle elle-même. C''est une façon élégante de résoudre un problème en le ramenant à une **version plus petite** du même problème.

## Les deux ingrédients indispensables

1. **Le cas de base** : une situation simple où l''on connaît la réponse directement.
2. **Le cas récursif** : on résout le problème en appelant la fonction sur un problème plus petit, qui se rapproche du cas de base.

## Exemple : la factorielle

n! = n × (n-1)! et 0! = 1.

~~~pseudocode
FONCTION fact(n : ENTIER) : ENTIER
DEBUT
  SI n = 0 ALORS
    RETOURNER 1               // cas de base
  FINSI
  RETOURNER n * fact(n - 1)   // cas récursif
FIN
~~~

## Ce qui se passe en mémoire

fact(3) appelle fact(2), qui appelle fact(1), qui appelle fact(0). fact(0) retourne 1, puis les résultats « remontent » : 1 × 1 = 1, 2 × 1 = 2, 3 × 2 = 6. Chaque appel en attente occupe de la mémoire dans la **pile d''appels**.

## Le danger : la récursivité infinie

Sans cas de base, ou si le cas de base n''est jamais atteint, la fonction s''appelle indéfiniment. La plateforme l''arrête et affiche « Trop d''appels imbriqués ».

## Récursif ou itératif ?

Tout algorithme récursif peut s''écrire avec des boucles. La récursivité est naturelle pour les problèmes qui se décomposent (tours de Hanoï, parcours d''arbres, tri fusion), mais elle peut être coûteuse : la version récursive naïve de Fibonacci recalcule de nombreuses fois les mêmes valeurs.', array['Une fonction récursive s''appelle elle-même.', 'Il faut un cas de base et un cas récursif qui s''en rapproche.', 'Chaque appel en attente occupe la pile d''appels.']::text[], '[{"language":"pseudocode","title":"Factorielle et Fibonacci","code":"ALGORITHME Recursivite\n\nFONCTION fact(n : ENTIER) : ENTIER\nDEBUT\n  SI n = 0 ALORS\n    RETOURNER 1\n  FINSI\n  RETOURNER n * fact(n - 1)\nFIN\n\nFONCTION fib(n : ENTIER) : ENTIER\nDEBUT\n  SI n <= 1 ALORS\n    RETOURNER n\n  FINSI\n  RETOURNER fib(n - 1) + fib(n - 2)\nFIN\n\nVARIABLES\n  i : ENTIER\nDEBUT\n  ECRIRE(\"5! = \", fact(5))\n  POUR i DE 0 A 10 FAIRE\n    ECRIRE(\"fib(\", i, \") = \", fib(i))\n  FINPOUR\nFIN"},{"language":"pseudocode","title":"Tours de Hanoï","code":"ALGORITHME Hanoi\n\nPROCEDURE hanoi(n : ENTIER, depart : CHAINE, arrivee : CHAINE, inter : CHAINE)\nDEBUT\n  SI n > 0 ALORS\n    hanoi(n - 1, depart, inter, arrivee)\n    ECRIRE(\"Déplacer le disque \", n, \" de \", depart, \" vers \", arrivee)\n    hanoi(n - 1, inter, arrivee, depart)\n  FINSI\nFIN\n\nDEBUT\n  hanoi(3, \"A\", \"C\", \"B\")\nFIN"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recursivite'), 'recursivite-quiz', 'Récursivité', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'recursivite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'recursivite-quiz'), 'qcm', 'Que se passe-t-il si une fonction récursive n''a pas de cas de base ?', null, '["Elle retourne 0","Elle s''appelle indéfiniment jusqu''à saturer la mémoire","Elle s''exécute une seule fois","Le compilateur ajoute un cas de base automatiquement"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'algorithmique'), 'algorithmes-classiques', 'Module 5 — Algorithmes classiques et méthodes', 'Rechercher, trier, mesurer l''efficacité et résoudre des problèmes complets.', 5)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'algorithmes-classiques'), (select id from public.courses where slug = 'algorithmique'), 'recherche-tri', 'Recherche et tri', 'intermediaire', 50, array['Programmer une recherche séquentielle et une recherche dichotomique.', 'Programmer le tri par sélection et le tri à bulles.']::text[], '{}'::text[], '## Recherche séquentielle

On parcourt le tableau case par case jusqu''à trouver la valeur. Simple et valable pour tout tableau, mais il faut parfois parcourir **toutes** les cases.

## Recherche dichotomique

Si le tableau est **trié**, on compare la valeur cherchée avec l''élément du **milieu** :

- égale : trouvée ;
- plus petite : on cherche dans la moitié gauche ;
- plus grande : dans la moitié droite.

À chaque étape, la zone de recherche est divisée par deux. Pour 1 000 000 d''éléments, une vingtaine de comparaisons suffisent !

## Tri par sélection

Pour chaque position i, on cherche le plus petit élément entre i et la fin, puis on l''échange avec la case i.

## Tri à bulles

On parcourt le tableau en échangeant les voisins mal ordonnés. Après chaque passage, le plus grand élément restant « remonte » à sa place définitive, comme une bulle.

## Comparaison

| Algorithme | Condition | Coût (pire cas) |
|---|---|---|
| Recherche séquentielle | aucune | n comparaisons |
| Recherche dichotomique | tableau trié | environ log2(n) |
| Tri par sélection | aucune | environ n²/2 comparaisons |
| Tri à bulles | aucune | environ n²/2 comparaisons |

Des tris plus rapides existent (tri fusion, tri rapide) ; ils utilisent la récursivité.', array['Recherche séquentielle : tout tableau, jusqu''à n comparaisons.', 'Recherche dichotomique : tableau trié, environ log2(n) comparaisons.', 'Tri par sélection et tri à bulles : environ n² comparaisons.']::text[], '[{"language":"pseudocode","title":"Recherche dichotomique","code":"ALGORITHME Dichotomie\nVARIABLES\n  T : TABLEAU[1..10] DE ENTIER\n  i, x, gauche, droite, milieu : ENTIER\n  trouve : BOOLEEN\nDEBUT\n  POUR i DE 1 A 10 FAIRE\n    T[i] ← i * 3        // tableau trié : 3, 6, 9, …, 30\n  FINPOUR\n  LIRE(x)\n  gauche ← 1\n  droite ← 10\n  trouve ← FAUX\n  TANT QUE gauche <= droite ET NON trouve FAIRE\n    milieu ← (gauche + droite) DIV 2\n    SI T[milieu] = x ALORS\n      trouve ← VRAI\n    SINON SI x < T[milieu] ALORS\n      droite ← milieu - 1\n    SINON\n      gauche ← milieu + 1\n    FINSI\n  FINTANTQUE\n  SI trouve ALORS\n    ECRIRE(x, \" trouvé à la position \", milieu)\n  SINON\n    ECRIRE(x, \" absent du tableau\")\n  FINSI\nFIN","stdin":"21"},{"language":"pseudocode","title":"Tri par sélection","code":"ALGORITHME TriSelection\nCONSTANTES\n  N = 6\nVARIABLES\n  T : TABLEAU[1..N] DE ENTIER\n  i, j, iMin, temp : ENTIER\n  ligne : CHAINE\nDEBUT\n  POUR i DE 1 A N FAIRE\n    LIRE(T[i])\n  FINPOUR\n  POUR i DE 1 A N - 1 FAIRE\n    iMin ← i\n    POUR j DE i + 1 A N FAIRE\n      SI T[j] < T[iMin] ALORS\n        iMin ← j\n      FINSI\n    FINPOUR\n    temp ← T[i]\n    T[i] ← T[iMin]\n    T[iMin] ← temp\n  FINPOUR\n  ligne ← \"\"\n  POUR i DE 1 A N FAIRE\n    ligne ← ligne + CHAINE(T[i]) + \" \"\n  FINPOUR\n  ECRIRE(\"Tableau trié : \", ligne)\nFIN","stdin":"42\n7\n19\n3\n25\n11"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'tri-quiz', 'Recherche et tri', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'tri-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'tri-quiz'), 'vrai_faux', 'La recherche dichotomique fonctionne sur un tableau non trié.', null, '["Vrai","Faux"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'tri-quiz'), 'qcm', 'Combien de comparaisons au maximum pour une recherche dichotomique dans 1 024 éléments ?', null, '["environ 10","environ 100","512","1 024"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, '1 024 = 2^10 : on divise 10 fois la zone par deux.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'algorithmes-classiques'), (select id from public.courses where slug = 'algorithmique'), 'complexite', 'Complexité algorithmique', 'avance', 35, array['Estimer le nombre d''opérations d''un algorithme.', 'Connaître les notations O(1), O(log n), O(n), O(n log n), O(n²).']::text[], '{}'::text[], '## Pourquoi mesurer ?

Deux algorithmes corrects peuvent avoir des performances très différentes. La **complexité** mesure comment le temps (ou la mémoire) évolue quand la taille des données **n** grandit.

## Compter les opérations

On compte les opérations élémentaires (affectations, comparaisons) dans le **pire cas** :

- une boucle de 1 à n contenant k opérations : environ k × n ;
- deux boucles imbriquées de 1 à n : environ n × n = n².

## La notation O (grand O)

On ne garde que le terme qui domine quand n devient grand, sans les constantes : 3n² + 5n + 2 s''écrit **O(n²)**.

| Complexité | Nom | Exemple | n = 1 000 |
|---|---|---|---|
| O(1) | constante | accès à T[i] | 1 |
| O(log n) | logarithmique | recherche dichotomique | ~10 |
| O(n) | linéaire | recherche séquentielle | 1 000 |
| O(n log n) | quasi linéaire | tri fusion | ~10 000 |
| O(n²) | quadratique | tri par sélection | 1 000 000 |
| O(2^n) | exponentielle | Fibonacci récursif naïf | astronomique |

## En pratique

- Avant d''optimiser, assurez-vous que l''algorithme est **correct**.
- Une boucle imbriquée sur les mêmes données est souvent le signe d''un O(n²).
- Pour de grandes données, passer de O(n²) à O(n log n) change tout.', array['La complexité décrit l''évolution du coût en fonction de n.', 'On garde le terme dominant : 3n² + 5n devient O(n²).', 'O(log n) < O(n) < O(n log n) < O(n²) < O(2^n).']::text[], '[{"language":"pseudocode","title":"Compter les opérations","code":"ALGORITHME CompterOperations\nVARIABLES\n  n, i, j, compteur : ENTIER\nDEBUT\n  POUR n DE 10 A 40 PAS 10 FAIRE\n    compteur ← 0\n    POUR i DE 1 A n FAIRE\n      POUR j DE 1 A n FAIRE\n        compteur ← compteur + 1\n      FINPOUR\n    FINPOUR\n    ECRIRE(\"n = \", n, \" -> \", compteur, \" opérations\")\n  FINPOUR\nFIN","explanation":"Quand n double, le nombre d''opérations est multiplié par 4 : c''est la signature d''un O(n²)."}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'complexite'), 'complexite-quiz', 'Complexité', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'complexite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'complexite-quiz'), 'qcm', 'Quelle est la complexité de deux boucles POUR imbriquées de 1 à n ?', null, '["O(n)","O(log n)","O(n²)","O(1)"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'complexite-quiz'), 'qcm', 'Comment s''écrit 5n + 100 en notation O ?', null, '["O(5n)","O(n)","O(100)","O(n + 100)"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'algorithmes-classiques'), (select id from public.courses where slug = 'algorithmique'), 'organigrammes', 'Organigrammes', 'debutant', 25, array['Lire et dessiner un organigramme.', 'Passer d''un organigramme au pseudocode et inversement.']::text[], '{}'::text[], '## Qu''est-ce qu''un organigramme ?

Un **organigramme** (ou logigramme) représente un algorithme sous forme de **schéma**. Il est utile pour visualiser le cheminement d''un algorithme, en particulier les conditions et les boucles.

## Les symboles normalisés

| Symbole | Forme | Signification |
|---|---|---|
| Terminal | ovale | Début ou fin |
| Traitement | rectangle | Calcul, affectation |
| Entrée / sortie | parallélogramme | LIRE ou ECRIRE |
| Décision | losange | Condition (deux sorties : oui / non) |
| Flèche | ligne fléchée | Ordre d''exécution |

## Exemple : pair ou impair

~~~text
   ( DÉBUT )
       |
  / LIRE n /
       |
  < n MOD 2 = 0 ? >
   oui |      | non
/ ÉCRIRE    / ÉCRIRE
  "pair" /    "impair" /
       |      |
    ( FIN ) <-
~~~

## Représenter une boucle

Une boucle apparaît comme une **flèche qui remonte** vers un losange de décision. Une boucle TANT QUE teste la condition avant le traitement ; une boucle RÉPÉTER la teste après.

## Du schéma au pseudocode

- Chaque losange devient un **SI** ou la condition d''une **boucle**.
- Chaque rectangle devient une **affectation**.
- Chaque parallélogramme devient **LIRE** ou **ECRIRE**.

Pour les problèmes plus longs, le pseudocode est plus compact ; l''organigramme reste précieux pour expliquer la logique à l''oral ou en examen.', array['Ovale : début/fin ; rectangle : traitement ; parallélogramme : entrée/sortie ; losange : décision.', 'Une boucle est une flèche qui remonte vers une décision.', 'Chaque symbole se traduit par une instruction de pseudocode.']::text[], '[{"language":"pseudocode","title":"Traduction de l''organigramme « pair ou impair »","code":"ALGORITHME PairImpair\nVARIABLES\n  n : ENTIER\nDEBUT\n  LIRE(n)\n  SI n MOD 2 = 0 ALORS\n    ECRIRE(\"pair\")\n  SINON\n    ECRIRE(\"impair\")\n  FINSI\nFIN","stdin":"7"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'organigrammes'), 'organigramme-quiz', 'Organigrammes', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'organigramme-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'organigramme-quiz'), 'qcm', 'Quel symbole représente une condition ?', null, '["Le rectangle","L''ovale","Le losange","Le parallélogramme"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'algorithmes-classiques'), (select id from public.courses where slug = 'algorithmique'), 'resolution-problemes', 'Résolution de problèmes complexes', 'avance', 50, array['Appliquer une méthode de résolution en étapes.', 'Décomposer un problème en sous-problèmes.', 'Tester un algorithme avec des cas limites.']::text[], '{}'::text[], '## Une méthode en cinq étapes

1. **Comprendre** : reformuler l''énoncé, identifier entrées et sorties, traiter un exemple à la main.
2. **Décomposer** : découper en sous-problèmes plus simples (chacun deviendra souvent une fonction).
3. **Concevoir** : choisir les structures de données (variables, tableaux) et les algorithmes (recherche, tri…).
4. **Écrire** : rédiger le pseudocode, sous-problème par sous-problème.
5. **Tester** : vérifier avec des cas normaux et des **cas limites** (tableau vide, valeur négative, zéro, valeurs égales…).

## Exemple : gestion des résultats d''une promotion

Énoncé : lire les notes de n étudiants, afficher la moyenne, le nombre d''admis, la meilleure note et les notes triées.

Décomposition :

- lire les notes → procédure **lireNotes** ;
- calculer la moyenne → fonction **moyenne** ;
- compter les admis → fonction **nbAdmis** ;
- trier → procédure **trier** ;
- afficher → programme principal.

## Tester avec des cas limites

| Cas | Pourquoi |
|---|---|
| n = 1 | un seul élément |
| toutes les notes égales | égalités dans les comparaisons |
| notes 0 et 20 | bornes |

## Déboguer

Quand le résultat est faux : ajoutez des ECRIRE pour suivre les variables, faites une trace à la main sur un petit exemple, ou demandez au **professeur IA** de vous aider à analyser l''erreur.', array['Comprendre, décomposer, concevoir, écrire, tester.', 'Chaque sous-problème devient une fonction ou une procédure.', 'Testez toujours les cas limites.']::text[], '[{"language":"pseudocode","title":"Programme complet décomposé","code":"ALGORITHME Promotion\nCONSTANTES\n  MAX = 100\nVARIABLES\n  notes : TABLEAU[1..MAX] DE REEL\n  n, i : ENTIER\n  ligne : CHAINE\n\nPROCEDURE lireNotes(T : TABLEAU DE REEL, n : ENTIER)\nVARIABLES\n  i : ENTIER\nDEBUT\n  POUR i DE 1 A n FAIRE\n    LIRE(T[i])\n  FINPOUR\nFIN\n\nFONCTION moyenne(T : TABLEAU DE REEL, n : ENTIER) : REEL\nVARIABLES\n  i : ENTIER\n  s : REEL\nDEBUT\n  s ← 0\n  POUR i DE 1 A n FAIRE\n    s ← s + T[i]\n  FINPOUR\n  RETOURNER s / n\nFIN\n\nFONCTION nbAdmis(T : TABLEAU DE REEL, n : ENTIER) : ENTIER\nVARIABLES\n  i, c : ENTIER\nDEBUT\n  c ← 0\n  POUR i DE 1 A n FAIRE\n    SI T[i] >= 10 ALORS\n      c ← c + 1\n    FINSI\n  FINPOUR\n  RETOURNER c\nFIN\n\nPROCEDURE trier(T : TABLEAU DE REEL, n : ENTIER)\nVARIABLES\n  i, j : ENTIER\n  tmp : REEL\nDEBUT\n  POUR i DE 1 A n - 1 FAIRE\n    POUR j DE 1 A n - i FAIRE\n      SI T[j] > T[j + 1] ALORS\n        tmp ← T[j]\n        T[j] ← T[j + 1]\n        T[j + 1] ← tmp\n      FINSI\n    FINPOUR\n  FINPOUR\nFIN\n\nDEBUT\n  LIRE(n)\n  lireNotes(notes, n)\n  ECRIRE(\"Moyenne : \", moyenne(notes, n))\n  ECRIRE(\"Admis : \", nbAdmis(notes, n), \"/\", n)\n  trier(notes, n)\n  ECRIRE(\"Meilleure note : \", notes[n])\n  ligne ← \"\"\n  POUR i DE 1 A n FAIRE\n    ligne ← ligne + CHAINE(notes[i]) + \" \"\n  FINPOUR\n  ECRIRE(\"Notes triées : \", ligne)\nFIN","stdin":"6\n12\n8\n15.5\n10\n6.5\n18"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-evaluation-finale', 'Évaluation finale — Algorithmique', true, 70, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Que vaut x après : x ← 5 ; x ← x * 2 + 1 ?', null, '["5","10","11","12"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Que vaut 23 DIV 4 ?', null, '["5","5.75","3","6"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Combien de fois s''affiche « * » ?', 'POUR i DE 1 A 3 FAIRE
  POUR j DE 1 A 4 FAIRE
    ECRIRE("*")
  FINPOUR
FINPOUR', '["3","4","12","7"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'vrai_faux', 'RÉPÉTER … JUSQU''À exécute toujours son corps au moins une fois.', null, '["Vrai","Faux"]'::jsonb, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quel est l''indice de la dernière case de T : TABLEAU[1..20] DE ENTIER ?', null, '["19","20","21","0"]'::jsonb, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quelle est la complexité de la recherche dichotomique ?', null, '["O(n)","O(n²)","O(log n)","O(1)"]'::jsonb, 5) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'vrai_faux', 'Une fonction récursive doit avoir un cas de base.', null, '["Vrai","Faux"]'::jsonb, 6) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quelle condition teste qu''un nombre n est pair ?', null, '["n DIV 2 = 0","n MOD 2 = 0","n / 2 = 0","n MOD 2 = 1"]'::jsonb, 7) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Python =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('python', 'python', (select id from public.course_categories where slug = 'programmation'), 'Parcours B', 'Python', 'Le langage idéal pour passer de l''algorithme au programme.', 'Un parcours complet pour apprendre Python : syntaxe, structures de contrôle, structures de données, fonctions, modules, exceptions, fichiers, programmation orientée objet, algorithmes classiques, jusqu''à une introduction à la science des données et à l''intelligence artificielle.', 'debutant', array['Avoir suivi le module 1 et 2 du parcours Algorithmique (recommandé).']::text[], array['Écrire des programmes Python lisibles et corrects.', 'Utiliser listes, tuples, dictionnaires et ensembles.', 'Structurer un programme avec des fonctions, des modules et des classes.', 'Gérer les erreurs et manipuler des fichiers.', 'Implémenter des algorithmes de recherche et de tri.']::text[], 36, 'publie', 2, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'python'), 'bases', 'Module 1 — Les bases du langage', null, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'syntaxe-fondamentale', 'Syntaxe fondamentale', 'debutant', 25, array['Écrire et exécuter un premier programme Python.', 'Comprendre l''indentation et les commentaires.']::text[], '{}'::text[], '## Pourquoi Python ?

Python est un langage **lisible**, **polyvalent** et très utilisé : développement web, automatisation, science des données, intelligence artificielle. Sa syntaxe proche du pseudocode en fait un excellent premier langage.

## Premier programme

~~~python
print("Bonjour UPL !")
~~~

**print** affiche une valeur puis passe à la ligne.

## Pas de DEBUT / FIN : l''indentation

En Python, les blocs sont délimités par l''**indentation** (4 espaces par convention), après un deux-points :

~~~python
if note >= 10:
    print("Admis")
print("Fin")   # hors du bloc
~~~

Une indentation incorrecte provoque une **IndentationError**.

## Commentaires

Tout ce qui suit **#** est ignoré par Python. Commentez le **pourquoi**, pas l''évidence.

## Du pseudocode à Python

| Pseudocode | Python |
|---|---|
| ECRIRE("x = ", x) | print("x =", x) |
| x ← 5 | x = 5 |
| SI … ALORS … FINSI | if …: (bloc indenté) |
| ET, OU, NON | and, or, not |', array['print affiche des valeurs.', 'Les blocs sont définis par l''indentation.', '# introduit un commentaire.']::text[], '[{"language":"python","title":"Premier programme","code":"# Mon premier programme Python\nprint(\"Bonjour UPL !\")\nprint(\"2 + 3 =\", 2 + 3)"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'syntaxe-fondamentale'), 'py-syntaxe-quiz', 'Syntaxe', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-syntaxe-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'qcm', 'Comment Python délimite-t-il les blocs ?', null, '["Avec DEBUT et FIN","Avec des accolades","Avec l''indentation","Avec des points-virgules"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'vrai_faux', 'En Python, # commence un commentaire.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'variables-types', 'Variables et types', 'debutant', 30, array['Créer des variables.', 'Connaître int, float, str, bool.', 'Convertir entre types.']::text[], '{}'::text[], '## Variables

En Python, une variable est créée lors de sa **première affectation**, avec le signe **=** :

~~~python
age = 19
moyenne = 13.5
nom = "Amani"
admis = True
~~~

Pas besoin de déclarer le type : Python le déduit (**typage dynamique**).

## Les types de base

| Type | Exemple | Pseudocode |
|---|---|---|
| int | 42 | ENTIER |
| float | 3.14 | REEL |
| str | "UPL" | CHAINE |
| bool | True, False | BOOLEEN |

La fonction **type(x)** donne le type d''une valeur.

## Conversions

- **int("42")** → 42
- **float("3.5")** → 3.5
- **str(10)** → "10"

## Lire au clavier

**input()** lit une ligne de texte. Le résultat est **toujours une chaîne** : il faut le convertir pour calculer.

~~~python
age = int(input())
~~~

## Conventions de nommage

Utilisez le style **snake_case** : note_finale, nombre_etudiants. Les constantes s''écrivent en majuscules : TAUX_TVA = 0.16.', array['= crée ou modifie une variable.', 'int, float, str, bool sont les types de base.', 'input() renvoie toujours une chaîne.']::text[], '[{"language":"python","title":"Types et conversions","code":"nom = input()\nannee = int(input())\nage = 2026 - annee\nprint(\"Bonjour\", nom)\nprint(\"Âge :\", age, type(age))\nprint(\"Moyenne :\", 27 / 2, type(27 / 2))","stdin":"Amani\n2006"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'variables-types'), 'py-variables-quiz', 'Variables', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que renvoie input() ?', null, '["Un int","Une str","Un float","Cela dépend de ce qui est tapé"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que vaut int("7") + 3 ?', null, '["\"73\"","10","Erreur","\"10\""]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'operateurs', 'Opérateurs', 'debutant', 25, array['Utiliser les opérateurs arithmétiques, de comparaison et logiques.', 'Formater l''affichage avec les f-strings.']::text[], '{}'::text[], '## Arithmétique

| Opérateur | Rôle | Exemple | Résultat |
|---|---|---|---|
| + - * | classiques | 7 * 2 | 14 |
| / | division réelle | 7 / 2 | 3.5 |
| // | division entière (DIV) | 7 // 2 | 3 |
| % | reste (MOD) | 7 % 2 | 1 |
| ** | puissance | 2 ** 10 | 1024 |

## Comparaisons et logique

==, !=, <, >, <=, >= ; puis **and**, **or**, **not**. Python autorise les comparaisons enchaînées : **0 <= note <= 20**.

## Affectations composées

x += 1 équivaut à x = x + 1 (de même -=, *=, //=…).

## Les f-strings

Pour insérer des valeurs dans un texte :

~~~python
moyenne = 13.456
print(f"Moyenne : {moyenne:.2f}")   # Moyenne : 13.46
~~~

Le **:.2f** affiche deux décimales.', array['// et % correspondent à DIV et MOD.', '** est la puissance.', 'Les f-strings formatent l''affichage.']::text[], '[{"language":"python","title":"Opérateurs","code":"secondes = 3725\nh = secondes // 3600\nm = secondes % 3600 // 60\ns = secondes % 60\nprint(f\"{h} h {m} min {s} s\")\nnote = 14\nprint(\"Valide :\", 0 <= note <= 20, \"| Pair :\", note % 2 == 0)"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'conditions', 'Conditions', 'debutant', 25, array['Écrire des tests avec if, elif, else.', 'Utiliser match pour des choix multiples.']::text[], '{}'::text[], '## if / elif / else

~~~python
if note >= 16:
    print("Très bien")
elif note >= 14:
    print("Bien")
elif note >= 10:
    print("Passable")
else:
    print("Insuffisant")
~~~

**elif** correspond à SINON SI. N''oubliez pas les **deux-points**.

## Valeurs « vraies » et « fausses »

0, 0.0, "" (chaîne vide), [] (liste vide) et None sont considérés comme **faux** dans un if.

## L''expression conditionnelle

~~~python
statut = "admis" if note >= 10 else "ajourné"
~~~

## match (Python 3.10+)

Équivalent de SELON :

~~~python
match jour:
    case 6 | 7:
        print("Week-end")
    case _:
        print("Semaine")
~~~', array['if / elif / else avec deux-points et indentation.', 'and, or, not combinent les conditions.', 'match remplace SELON.']::text[], '[{"language":"python","title":"Année bissextile","code":"annee = int(input())\nif (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:\n    print(\"bissextile\")\nelse:\n    print(\"non bissextile\")","stdin":"2024"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'py-conditions-quiz', 'Conditions', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'qcm', 'Quel mot-clé correspond à SINON SI ?', null, '["else if","elseif","elif","sinon_si"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'vrai_faux', 'Une liste vide est considérée comme fausse dans un if.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'boucles', 'Boucles', 'debutant', 35, array['Utiliser for avec range.', 'Utiliser while.', 'Contrôler une boucle avec break et continue.']::text[], '{}'::text[], '## for et range

~~~python
for i in range(1, 6):   # 1, 2, 3, 4, 5
    print(i)
~~~

**range(début, fin, pas)** : la valeur de **fin est exclue**. range(5) donne 0, 1, 2, 3, 4.

## for sur une collection

~~~python
for lettre in "UPL":
    print(lettre)
~~~

## while

~~~python
solde = 1000
annees = 0
while solde < 2000:
    solde *= 1.08
    annees += 1
~~~

Python n''a pas de RÉPÉTER … JUSQU''À : on utilise **while True** avec **break**.

## break et continue

- **break** sort immédiatement de la boucle.
- **continue** passe directement au tour suivant.

~~~python
while True:
    note = float(input())
    if 0 <= note <= 20:
        break
~~~', array['range(a, b) va de a à b-1.', 'while répète tant que la condition est vraie.', 'break sort, continue passe au tour suivant.']::text[], '[{"language":"python","title":"Table et somme","code":"n = int(input())\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n * i}\")\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(\"Somme de 1 à\", n, \":\", total)","stdin":"7"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'py-boucles-quiz', 'Boucles', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Quelles valeurs produit range(2, 8, 2) ?', null, '["2, 4, 6, 8","2, 4, 6","2, 8","0, 2, 4, 6"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Que fait break ?', null, '["Passe au tour suivant","Arrête le programme","Sort de la boucle","Recommence la boucle"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'python'), 'structures-donnees', 'Module 2 — Collections', null, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-donnees'), (select id from public.courses where slug = 'python'), 'listes-tuples', 'Listes et tuples', 'debutant', 40, array['Créer et modifier des listes.', 'Parcourir une liste.', 'Utiliser les tuples.']::text[], '{}'::text[], '## Les listes

Une **liste** est une collection ordonnée et **modifiable** :

~~~python
notes = [12, 15.5, 9, 17]
print(notes[0])      # 12 (les indices commencent à 0 !)
print(notes[-1])     # 17 (dernier élément)
notes.append(11)     # ajout à la fin
notes[2] = 10        # modification
print(len(notes))    # 5
~~~

> Contrairement au pseudocode de la plateforme, les indices Python commencent à **0**.

## Opérations utiles

| Opération | Rôle |
|---|---|
| len(L) | nombre d''éléments |
| sum(L), min(L), max(L) | somme, minimum, maximum |
| L.append(x) | ajouter à la fin |
| L.insert(i, x) | insérer à la position i |
| L.remove(x), L.pop() | supprimer |
| x in L | test d''appartenance |
| L.sort(), sorted(L) | trier |
| L[a:b] | tranche (de a à b-1) |

## Parcours

~~~python
for i, note in enumerate(notes):
    print(i, note)
~~~

## Listes en compréhension

~~~python
carres = [x ** 2 for x in range(1, 6)]           # [1, 4, 9, 16, 25]
admis = [n for n in notes if n >= 10]
~~~

## Les tuples

Un **tuple** est comme une liste mais **non modifiable** : point = (3, 4). On l''utilise pour des données fixes, ou pour retourner plusieurs valeurs d''une fonction.

## Lire une liste au clavier

~~~python
valeurs = list(map(int, input().split()))
~~~', array['Les indices commencent à 0 ; -1 désigne le dernier.', 'append, sort, len, sum, in sont essentiels.', 'Un tuple ne peut pas être modifié.']::text[], '[{"language":"python","title":"Manipuler une liste","code":"notes = list(map(float, input().split()))\nprint(\"Notes :\", notes)\nprint(\"Moyenne :\", round(sum(notes) / len(notes), 2))\nprint(\"Admis :\", [n for n in notes if n >= 10])\nprint(\"Triées :\", sorted(notes))","stdin":"12 8.5 15 9 17"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'py-listes-quiz', 'Listes', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-listes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'L = [4, 8, 15]. Que vaut L[1] ?', null, '["4","8","15","Erreur"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'Que vaut [x * 2 for x in range(3)] ?', null, '["[2, 4, 6]","[0, 2, 4]","[0, 1, 2]","[1, 2, 3]"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'vrai_faux', 'On peut modifier un élément d''un tuple.', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-donnees'), (select id from public.courses where slug = 'python'), 'dictionnaires-ensembles', 'Dictionnaires et ensembles', 'debutant', 35, array['Associer des clés à des valeurs avec un dictionnaire.', 'Éliminer les doublons avec un ensemble.']::text[], '{}'::text[], '## Les dictionnaires

Un **dictionnaire** associe des **clés** à des **valeurs** :

~~~python
etudiant = {"nom": "Amani", "age": 20, "faculte": "Informatique"}
print(etudiant["nom"])
etudiant["age"] = 21          # modification
etudiant["moyenne"] = 14.2    # ajout
~~~

- **d.get(cle, defaut)** évite une erreur si la clé n''existe pas.
- **cle in d** teste la présence d''une clé.

## Parcourir un dictionnaire

~~~python
for cle, valeur in etudiant.items():
    print(cle, ":", valeur)
~~~

## Compter des occurrences

~~~python
compte = {}
for mot in texte.split():
    compte[mot] = compte.get(mot, 0) + 1
~~~

## Les ensembles

Un **ensemble** (set) contient des éléments **uniques**, sans ordre :

~~~python
vus = {1, 2, 3}
vus.add(2)            # ignoré : déjà présent
print(len(set([1, 1, 2, 3, 3])))   # 3
~~~

Opérations : union (|), intersection (&), différence (-). Le test **x in ensemble** est très rapide.', array['Un dictionnaire associe clé → valeur.', 'get() fournit une valeur par défaut.', 'Un set élimine les doublons.']::text[], '[{"language":"python","title":"Fréquence des mots","code":"texte = input().lower()\ncompte = {}\nfor mot in texte.split():\n    compte[mot] = compte.get(mot, 0) + 1\nfor mot in sorted(compte):\n    print(mot, compte[mot])\nprint(\"Mots distincts :\", len(set(texte.split())))","stdin":"le code le plus simple est le meilleur code"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'python'), 'structuration', 'Module 3 — Structurer ses programmes', null, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'fonctions', 'Fonctions', 'debutant', 40, array['Définir des fonctions avec def.', 'Utiliser paramètres par défaut et valeurs de retour multiples.', 'Comprendre la portée des variables.']::text[], '{}'::text[], '## Définir une fonction

~~~python
def carre(x):
    return x * x

print(carre(5))   # 25
~~~

Une fonction sans **return** renvoie **None** : c''est l''équivalent d''une procédure.

## Paramètres par défaut et nommés

~~~python
def saluer(nom, message="Bonjour"):
    print(f"{message}, {nom} !")

saluer("Amani")
saluer("Grâce", message="Bonsoir")
~~~

## Retourner plusieurs valeurs

~~~python
def min_max(liste):
    return min(liste), max(liste)

petit, grand = min_max([4, 9, 1])
~~~

## Portée des variables

Les variables créées dans une fonction sont **locales**. Une fonction peut lire une variable globale, mais pour la modifier il faudrait **global** — à éviter : préférez passer des paramètres et retourner des résultats.

## Objets modifiables

Une liste passée à une fonction peut être modifiée par celle-ci (comme un passage par référence). Les nombres et chaînes, eux, ne sont jamais modifiés.

## Documenter

~~~python
def moyenne(notes):
    """Retourne la moyenne d''une liste non vide de notes."""
    return sum(notes) / len(notes)
~~~

## Récursivité

~~~python
def fact(n):
    return 1 if n == 0 else n * fact(n - 1)
~~~', array['def définit une fonction, return renvoie le résultat.', 'Les paramètres peuvent avoir des valeurs par défaut.', 'Les variables d''une fonction sont locales.']::text[], '[{"language":"python","title":"Fonctions","code":"def est_premier(n):\n    \"\"\"Retourne True si n est un nombre premier.\"\"\"\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\npremiers = [k for k in range(2, 50) if est_premier(k)]\nprint(premiers)"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'py-fonctions-quiz', 'Fonctions', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'Que renvoie une fonction sans instruction return ?', null, '["0","None","False","Une erreur"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'def f(a, b=2): return a * b. Que vaut f(5) ?', null, '["5","7","10","Erreur"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'modules', 'Modules', 'debutant', 25, array['Importer des modules de la bibliothèque standard.', 'Créer son propre module.']::text[], '{}'::text[], '## Importer un module

Un **module** est un fichier Python réutilisable. La bibliothèque standard en contient des centaines :

~~~python
import math
print(math.sqrt(16), math.pi)

from random import randint
print(randint(1, 6))
~~~

## Modules utiles

| Module | Usage |
|---|---|
| math | fonctions mathématiques |
| random | nombres aléatoires |
| datetime | dates et heures |
| statistics | moyenne, médiane, écart type |
| collections | Counter, deque… |

## Créer son module

Placez des fonctions dans un fichier **outils.py** puis, dans **main.py** : **import outils**. Dans l''éditeur de la plateforme, ajoutez un fichier avec le bouton **+** pour essayer.

## Le bloc principal

~~~python
if __name__ == "__main__":
    main()
~~~

Ce code ne s''exécute que si le fichier est lancé directement, pas lorsqu''il est importé.

## Paquets externes

Avec **pip**, on installe des bibliothèques comme numpy ou pandas (voir le dernier module).', array['import charge un module.', 'La bibliothèque standard est très riche.', 'if __name__ == "__main__" protège le code principal.']::text[], '[{"language":"python","title":"Bibliothèque standard","code":"import math\nimport statistics\nfrom collections import Counter\n\nnotes = [12, 15, 9, 15, 17, 12, 15]\nprint(\"Racine de 2 :\", round(math.sqrt(2), 4))\nprint(\"Moyenne :\", round(statistics.mean(notes), 2))\nprint(\"Médiane :\", statistics.median(notes))\nprint(\"Note la plus fréquente :\", Counter(notes).most_common(1))"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'exceptions', 'Gestion des exceptions', 'intermediaire', 30, array['Lire un message d''erreur Python.', 'Intercepter des erreurs avec try / except.', 'Lever ses propres exceptions.']::text[], '{}'::text[], '## Lire une erreur

Quand une erreur survient, Python affiche un **traceback** : la dernière ligne indique le **type** d''erreur et le message, les lignes précédentes indiquent **où** elle s''est produite.

| Exception | Cause fréquente |
|---|---|
| SyntaxError | faute de syntaxe (deux-points oubliés…) |
| NameError | variable non définie |
| TypeError | opération entre types incompatibles ("2" + 3) |
| ValueError | conversion impossible (int("abc")) |
| IndexError | indice hors de la liste |
| KeyError | clé absente d''un dictionnaire |
| ZeroDivisionError | division par zéro |

## try / except

~~~python
try:
    age = int(input())
except ValueError:
    print("Veuillez saisir un nombre entier.")
~~~

On peut ajouter **else** (exécuté si aucune erreur) et **finally** (exécuté dans tous les cas).

## Lever une exception

~~~python
def racine(x):
    if x < 0:
        raise ValueError("x doit être positif")
    return x ** 0.5
~~~

## Bonne pratique

Interceptez des exceptions **précises**. Un **except:** sans type masque les vraies erreurs et rend le débogage difficile.', array['Le traceback indique le type et la ligne de l''erreur.', 'try / except intercepte une erreur précise.', 'raise lève une exception.']::text[], '[{"language":"python","title":"Saisie robuste","code":"valeurs = [\"12\", \"abc\", \"0\", \"4\"]\nfor v in valeurs:\n    try:\n        n = int(v)\n        print(f\"100 / {n} = {100 / n}\")\n    except ValueError:\n        print(f\"''{v}'' n''est pas un entier\")\n    except ZeroDivisionError:\n        print(\"Division par zéro impossible\")"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'exceptions'), 'py-exceptions-quiz', 'Exceptions', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-exceptions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-exceptions-quiz'), 'qcm', 'Quelle exception provoque int("douze") ?', null, '["TypeError","ValueError","NameError","SyntaxError"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Lire et écrire des fichiers texte.', 'Utiliser with pour fermer automatiquement un fichier.', 'Manipuler un fichier CSV.']::text[], '{}'::text[], '## Écrire dans un fichier

~~~python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Amani;15\n")
    f.write("Grâce;17\n")
~~~

Le mode **"w"** crée (ou écrase) le fichier, **"a"** ajoute à la fin, **"r"** lit (par défaut).

## Lire un fichier

~~~python
with open("notes.txt", encoding="utf-8") as f:
    for ligne in f:
        nom, note = ligne.strip().split(";")
        print(nom, float(note))
~~~

Le bloc **with** ferme automatiquement le fichier, même en cas d''erreur.

## Le module csv

~~~python
import csv
with open("notes.csv", newline="", encoding="utf-8") as f:
    for ligne in csv.reader(f):
        print(ligne)
~~~

## Erreurs fréquentes

- **FileNotFoundError** : le fichier n''existe pas (vérifiez le chemin).
- Oublier **strip()** laisse le caractère de fin de ligne.
- Oublier **encoding="utf-8"** peut corrompre les accents.', array['open() ouvre un fichier ; with le ferme automatiquement.', 'Modes : r (lire), w (écrire), a (ajouter).', 'strip() et split() découpent les lignes.']::text[], '[{"language":"python","title":"Écrire puis relire","code":"etudiants = [(\"Amani\", 15), (\"Grâce\", 17), (\"Josué\", 9)]\nwith open(\"notes.txt\", \"w\", encoding=\"utf-8\") as f:\n    for nom, note in etudiants:\n        f.write(f\"{nom};{note}\\n\")\n\nwith open(\"notes.txt\", encoding=\"utf-8\") as f:\n    for ligne in f:\n        nom, note = ligne.strip().split(\";\")\n        statut = \"admis\" if int(note) >= 10 else \"ajourné\"\n        print(f\"{nom} : {note} ({statut})\")"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'python'), 'poo-algorithmes', 'Module 4 — Objets et algorithmes', null, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'programmation-orientee-objet', 'Programmation orientée objet', 'intermediaire', 45, array['Définir une classe avec attributs et méthodes.', 'Créer des objets.', 'Utiliser l''héritage.']::text[], '{}'::text[], '## Classes et objets

Une **classe** est un modèle ; un **objet** est un exemplaire construit à partir de ce modèle.

~~~python
class Etudiant:
    def __init__(self, nom, notes=None):
        self.nom = nom                  # attribut
        self.notes = notes or []

    def ajouter_note(self, note):       # méthode
        self.notes.append(note)

    def moyenne(self):
        return sum(self.notes) / len(self.notes) if self.notes else 0

e = Etudiant("Amani")
e.ajouter_note(15)
print(e.moyenne())
~~~

- **__init__** est le constructeur, appelé à la création de l''objet.
- **self** désigne l''objet lui-même.

## Représentation textuelle

La méthode **__str__** définit ce qu''affiche print(objet).

## Héritage

Une classe peut **hériter** d''une autre et redéfinir certaines méthodes :

~~~python
class Boursier(Etudiant):
    def __init__(self, nom, montant):
        super().__init__(nom)
        self.montant = montant
~~~

## Encapsulation

Par convention, un attribut préfixé par **_** est « privé » : il ne doit pas être utilisé hors de la classe.', array['Une classe définit attributs et méthodes.', '__init__ initialise l''objet ; self le désigne.', 'L''héritage réutilise une classe existante.']::text[], '[{"language":"python","title":"Compte bancaire","code":"class Compte:\n    def __init__(self, titulaire, solde=0):\n        self.titulaire = titulaire\n        self._solde = solde\n\n    def deposer(self, montant):\n        if montant <= 0:\n            raise ValueError(\"Le montant doit être positif\")\n        self._solde += montant\n\n    def retirer(self, montant):\n        if montant > self._solde:\n            raise ValueError(\"Solde insuffisant\")\n        self._solde -= montant\n\n    def __str__(self):\n        return f\"Compte de {self.titulaire} : {self._solde} FC\"\n\nc = Compte(\"Amani\", 5000)\nc.deposer(2500)\nc.retirer(1000)\nprint(c)\ntry:\n    c.retirer(100000)\nexcept ValueError as e:\n    print(\"Erreur :\", e)"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'programmation-orientee-objet'), 'py-poo-quiz', 'Objets', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-poo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'py-poo-quiz'), 'qcm', 'Quel est le rôle de __init__ ?', null, '["Détruire l''objet","Initialiser l''objet à sa création","Afficher l''objet","Importer la classe"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'structures-de-donnees', 'Structures de données', 'intermediaire', 35, array['Implémenter une pile et une file.', 'Choisir la structure adaptée à un problème.']::text[], '{}'::text[], '## La pile (LIFO)

Dernier entré, premier sorti, comme une pile d''assiettes. En Python, une liste suffit : **append** pour empiler, **pop** pour dépiler.

Usages : annuler une action, vérifier des parenthèses, appels de fonctions.

## La file (FIFO)

Premier entré, premier sorti, comme une file d''attente. On utilise **collections.deque** : **append** pour enfiler, **popleft** pour défiler (rapide, contrairement à list.pop(0)).

## Quelle structure choisir ?

| Besoin | Structure | Coût d''accès |
|---|---|---|
| Accès par position | list | O(1) |
| Recherche par clé | dict | O(1) en moyenne |
| Test d''appartenance, unicité | set | O(1) en moyenne |
| Ajout/retrait aux deux bouts | deque | O(1) |
| Données fixes | tuple | O(1) |

Tester **x in liste** coûte O(n), alors que **x in ensemble** coûte O(1) en moyenne : pour de grandes données, la différence est énorme.', array['Pile : append / pop (LIFO).', 'File : deque.append / popleft (FIFO).', 'dict et set offrent des recherches rapides.']::text[], '[{"language":"python","title":"Parenthèses équilibrées avec une pile","code":"def equilibre(expr):\n    paires = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    pile = []\n    for c in expr:\n        if c in \"([{\":\n            pile.append(c)\n        elif c in paires:\n            if not pile or pile.pop() != paires[c]:\n                return False\n    return not pile\n\nfor e in [\"(a + b) * [c]\", \"((a)\", \"{[()]}\", \"(]\"]:\n    print(e, \"->\", equilibre(e))"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'recherche-tri', 'Algorithmes de recherche et de tri', 'avance', 45, array['Implémenter la recherche dichotomique.', 'Implémenter le tri par insertion et le tri fusion.', 'Comparer avec sorted().']::text[], '{}'::text[], '## Recherche dichotomique

~~~python
def dichotomie(liste, x):
    debut, fin = 0, len(liste) - 1
    while debut <= fin:
        milieu = (debut + fin) // 2
        if liste[milieu] == x:
            return milieu
        if x < liste[milieu]:
            fin = milieu - 1
        else:
            debut = milieu + 1
    return -1
~~~

## Tri par insertion — O(n²)

On insère chaque élément à sa place dans la partie déjà triée, comme on range des cartes dans sa main.

## Tri fusion — O(n log n)

On coupe la liste en deux, on trie récursivement chaque moitié, puis on **fusionne** les deux moitiés triées.

## En pratique

Python fournit **sorted()** et **list.sort()** (algorithme Timsort, O(n log n)). Avec **key**, on trie selon un critère :

~~~python
etudiants.sort(key=lambda e: e[1], reverse=True)
~~~

Programmer soi-même les tris reste indispensable pour **comprendre** et pour les examens.', array['La dichotomie exige une liste triée.', 'Insertion : O(n²) ; fusion : O(n log n).', 'sorted() accepte key et reverse.']::text[], '[{"language":"python","title":"Tri fusion","code":"def fusion(a, b):\n    resultat, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            resultat.append(a[i]); i += 1\n        else:\n            resultat.append(b[j]); j += 1\n    return resultat + a[i:] + b[j:]\n\ndef tri_fusion(liste):\n    if len(liste) <= 1:\n        return liste\n    m = len(liste) // 2\n    return fusion(tri_fusion(liste[:m]), tri_fusion(liste[m:]))\n\nprint(tri_fusion([38, 27, 43, 3, 9, 82, 10]))"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'science-donnees-ia', 'Introduction à la science des données et à l''IA', 'avance', 40, array['Découvrir l''écosystème Python pour les données.', 'Calculer des statistiques descriptives.', 'Comprendre le principe de l''apprentissage automatique.']::text[], '{}'::text[], '## L''écosystème

| Bibliothèque | Rôle |
|---|---|
| NumPy | calcul sur des tableaux de nombres |
| pandas | tableaux de données (lignes et colonnes) |
| Matplotlib | graphiques |
| scikit-learn | apprentissage automatique |

Ces bibliothèques s''installent avec pip. Les exemples ci-dessous utilisent uniquement la bibliothèque standard pour fonctionner partout.

## Statistiques descriptives

Moyenne, médiane, écart type, minimum, maximum : ces mesures résument un jeu de données.

## Qu''est-ce que l''apprentissage automatique ?

Au lieu d''écrire les règles à la main, on fournit des **exemples** et l''algorithme **apprend** une règle. Exemple : prédire la note d''examen à partir des heures de révision.

La **régression linéaire** cherche la droite y = a·x + b la plus proche des points. Les formules des moindres carrés donnent :

- a = covariance(x, y) / variance(x)
- b = moyenne(y) − a × moyenne(x)

## Une IA responsable

Un modèle n''est jamais meilleur que ses données : des données biaisées produisent des décisions biaisées. Vérifiez toujours les résultats et respectez la vie privée des personnes concernées.', array['NumPy, pandas, Matplotlib et scikit-learn forment l''écosystème données.', 'L''apprentissage automatique apprend une règle à partir d''exemples.', 'La qualité des données conditionne celle du modèle.']::text[], '[{"language":"python","title":"Régression linéaire à la main","code":"heures = [1, 2, 3, 4, 5, 6]\nnotes = [6, 8, 11, 12, 15, 17]\n\nn = len(heures)\nmx = sum(heures) / n\nmy = sum(notes) / n\ncov = sum((x - mx) * (y - my) for x, y in zip(heures, notes)) / n\nvar = sum((x - mx) ** 2 for x in heures) / n\na = cov / var\nb = my - a * mx\n\nprint(f\"Modèle : note = {a:.2f} x heures + {b:.2f}\")\nfor h in [3.5, 8]:\n    print(f\"{h} h de révision -> note prédite {a * h + b:.1f}\")"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'python'), null, 'python-evaluation-finale', 'Évaluation finale — Python', true, 70, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut 17 // 5 ?', null, '["3.4","3","2","4"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut len([1, [2, 3], 4]) ?', null, '["4","3","2","Erreur"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quel type est renvoyé par input() ?', null, '["int","str","float","bool"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Les indices d''une liste Python commencent à 1.', null, '["Vrai","Faux"]'::jsonb, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle structure garantit l''unicité de ses éléments ?', null, '["list","tuple","set","str"]'::jsonb, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle exception lève {"a": 1}["b"] ?', null, '["IndexError","KeyError","ValueError","NameError"]'::jsonb, 5) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Une méthode d''instance reçoit l''objet en premier paramètre, nommé self par convention.', null, '["Vrai","Faux"]'::jsonb, 6) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle est la complexité de sorted() ?', null, '["O(n)","O(n log n)","O(n²)","O(1)"]'::jsonb, 7) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Langage C =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('langage-c', 'c', (select id from public.course_categories where slug = 'programmation'), 'Parcours C', 'Langage C', 'Comprendre ce qui se passe au plus près de la machine.', 'Le langage C est la base de nombreux systèmes (Linux, microcontrôleurs, bases de données). Ce parcours couvre la structure d''un programme, les types, les entrées-sorties, les structures de contrôle, les fonctions, les tableaux, les chaînes, les pointeurs, l''allocation dynamique, les structures, les fichiers et les structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.']::text[], array['Écrire, compiler et exécuter des programmes C.', 'Comprendre la mémoire : adresses, pointeurs, allocation dynamique.', 'Manipuler tableaux, chaînes, structures et fichiers.', 'Implémenter des structures de données classiques.']::text[], 32, 'publie', 3, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'langage-c'), 'bases', 'Module 1 — Les bases', null, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'structure-programme', 'Structure d''un programme C', 'debutant', 25, array['Connaître la structure minimale d''un programme C.', 'Comprendre la compilation.']::text[], '{}'::text[], '## Un premier programme

~~~c
#include <stdio.h>

int main(void) {
    printf("Bonjour UPL !\n");
    return 0;
}
~~~

- **#include <stdio.h>** importe la bibliothèque d''entrées-sorties.
- **main** est la fonction principale : l''exécution commence ici.
- Chaque instruction se termine par un **point-virgule**.
- Les blocs sont délimités par des **accolades**.
- **return 0** indique que le programme s''est bien terminé.

## La compilation

Le C est un langage **compilé** : le compilateur (gcc) traduit le code source en programme exécutable. Les erreurs de compilation doivent être corrigées avant toute exécution. Sur la plateforme, le bouton **Exécuter** compile puis lance le programme dans un environnement isolé.

## Commentaires

// sur une ligne, ou /* sur plusieurs lignes */.', array['Un programme C commence par main.', 'Instructions terminées par ; et blocs entre accolades.', 'Le code est compilé avant d''être exécuté.']::text[], '[{"language":"c","title":"Bonjour","code":"#include <stdio.h>\n\nint main(void) {\n    printf(\"Bonjour UPL !\\n\");\n    printf(\"Le C a été créé en %d.\\n\", 1972);\n    return 0;\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'structure-programme'), 'c-structure-quiz', 'Structure', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-structure-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'qcm', 'Par quelle fonction commence l''exécution d''un programme C ?', null, '["start","main","printf","include"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'vrai_faux', 'Le C est un langage interprété ligne par ligne.', null, '["Vrai","Faux"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'variables-types', 'Variables et types', 'debutant', 30, array['Déclarer des variables typées.', 'Connaître int, double, char et leurs tailles.']::text[], '{}'::text[], '## Déclarer avant d''utiliser

En C, chaque variable doit être **déclarée avec son type** :

~~~c
int age = 20;
double moyenne = 13.5;
char initiale = ''U'';
const double PI = 3.14159;
~~~

## Les types principaux

| Type | Contenu | Taille courante |
|---|---|---|
| char | un caractère | 1 octet |
| int | entier | 4 octets |
| long long | grand entier | 8 octets |
| float | réel simple précision | 4 octets |
| double | réel double précision | 8 octets |

**sizeof(type)** donne la taille en octets.

## Attention

- Une variable non initialisée contient une valeur **indéterminée**.
- Un int a une capacité limitée (environ ±2 milliards) : au-delà, il y a **dépassement**.
- La division de deux int est **entière** : 7 / 2 vaut 3. Écrivez 7.0 / 2 pour obtenir 3.5.
- Il n''y a pas de type booléen natif en C89 : 0 signifie faux, toute autre valeur vrai (ou bool avec stdbool.h).', array['Toute variable est déclarée avec son type.', 'La division entre entiers est entière.', 'sizeof donne la taille d''un type.']::text[], '[{"language":"c","title":"Types et tailles","code":"#include <stdio.h>\n\nint main(void) {\n    int a = 7, b = 2;\n    printf(\"7 / 2 = %d\\n\", a / b);\n    printf(\"7.0 / 2 = %.1f\\n\", (double)a / b);\n    printf(\"sizeof(int) = %zu, sizeof(double) = %zu\\n\", sizeof(int), sizeof(double));\n    return 0;\n}"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'entrees-sorties', 'Entrées et sorties', 'debutant', 25, array['Afficher avec printf.', 'Lire avec scanf.']::text[], '{}'::text[], '## printf et les formats

| Format | Type |
|---|---|
| %d | int |
| %lld | long long |
| %f, %.2f | double (2 décimales) |
| %c | char |
| %s | chaîne |

~~~c
printf("Moyenne : %.2f\n", moyenne);
~~~

**\n** passe à la ligne.

## scanf

~~~c
int n;
scanf("%d", &n);
~~~

Le **&** donne l''**adresse** de la variable : scanf a besoin de savoir où ranger la valeur. Pour un double, utilisez **%lf** dans scanf.

## Vérifier la lecture

scanf renvoie le nombre de valeurs lues : **if (scanf("%d", &n) != 1)** détecte une saisie invalide.', array['printf utilise des formats (%d, %f, %s…).', 'scanf a besoin de l''adresse : &variable.', '%lf pour lire un double.']::text[], '[{"language":"c","title":"Lire et afficher","code":"#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Somme : %d\\n\", a + b);\n    printf(\"Moyenne : %.2f\\n\", (a + b) / 2.0);\n    return 0;\n}","stdin":"12 17"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'conditions', 'Conditions', 'debutant', 20, array['Utiliser if, else et switch.']::text[], '{}'::text[], '## if / else

~~~c
if (note >= 10) {
    printf("Admis\n");
} else if (note >= 8) {
    printf("Rattrapage\n");
} else {
    printf("Ajourné\n");
}
~~~

La condition est **entre parenthèses**. Opérateurs : ==, !=, <, >, <=, >=, && (ET), || (OU), ! (NON).

> Piège : **if (x = 5)** affecte 5 à x (toujours vrai) au lieu de comparer. Écrivez **==**.

## switch

~~~c
switch (jour) {
    case 6:
    case 7:
        printf("Week-end\n");
        break;
    default:
        printf("Semaine\n");
}
~~~

Sans **break**, l''exécution continue dans le cas suivant.', array['if (condition) { … } else { … }.', '== compare, = affecte.', 'switch nécessite break.']::text[], '[{"language":"c","title":"Pair ou impair","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    if (n % 2 == 0) {\n        printf(\"pair\\n\");\n    } else {\n        printf(\"impair\\n\");\n    }\n    return 0;\n}","stdin":"7"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'boucles', 'Boucles', 'debutant', 25, array['Utiliser for, while et do … while.']::text[], '{}'::text[], '## for

~~~c
for (int i = 1; i <= 10; i++) {
    printf("%d\n", i);
}
~~~

Trois parties : initialisation ; condition ; incrémentation.

## while et do … while

~~~c
while (solde < 2000) { solde *= 1.08; annees++; }

do {
    scanf("%d", &note);
} while (note < 0 || note > 20);
~~~

**do … while** exécute le corps au moins une fois, comme RÉPÉTER (mais la condition est celle de **continuation**).

## break et continue

Comme en Python : **break** sort de la boucle, **continue** passe au tour suivant.', array['for (init; condition; pas).', 'do … while s''exécute au moins une fois.', 'long long évite le dépassement pour les grands produits.']::text[], '[{"language":"c","title":"Factorielle","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    long long f = 1;\n    scanf(\"%d\", &n);\n    for (int i = 2; i <= n; i++) {\n        f *= i;\n    }\n    printf(\"%d! = %lld\\n\", n, f);\n    return 0;\n}","stdin":"15"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'langage-c'), 'modularite-memoire', 'Module 2 — Fonctions, tableaux et mémoire', null, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite-memoire'), (select id from public.courses where slug = 'langage-c'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer et définir des fonctions.', 'Comprendre le passage par valeur.']::text[], '{}'::text[], '## Définition

~~~c
int carre(int x) {
    return x * x;
}
~~~

Le type de retour précède le nom ; **void** indique l''absence de retour (procédure).

## Prototype

Une fonction doit être connue avant son appel. Si elle est définie après main, on écrit son **prototype** au début : **int carre(int x);**

## Passage par valeur

En C, les arguments sont **toujours copiés**. Pour qu''une fonction modifie une variable de l''appelant, on lui passe son **adresse** (voir les pointeurs).', array['type nom(paramètres) { … }.', 'void : pas de valeur de retour.', 'Les arguments sont copiés.']::text[], '[{"language":"c","title":"PGCD","code":"#include <stdio.h>\n\nint pgcd(int a, int b);\n\nint main(void) {\n    printf(\"pgcd(48, 18) = %d\\n\", pgcd(48, 18));\n    return 0;\n}\n\nint pgcd(int a, int b) {\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite-memoire'), (select id from public.courses where slug = 'langage-c'), 'tableaux', 'Tableaux', 'debutant', 30, array['Déclarer et parcourir un tableau.', 'Passer un tableau à une fonction.']::text[], '{}'::text[], '## Déclaration

~~~c
int notes[5] = {12, 15, 9, 17, 11};
~~~

Les indices vont de **0 à taille - 1**. Le C ne vérifie **pas** les débordements : écrire notes[5] corrompt la mémoire sans message d''erreur clair. Soyez rigoureux !

## Parcours

~~~c
for (int i = 0; i < 5; i++) somme += notes[i];
~~~

## Tableaux et fonctions

Un tableau passé à une fonction n''est pas copié : la fonction reçoit l''adresse du premier élément. Il faut transmettre la **taille** séparément.

~~~c
double moyenne(int t[], int n);
~~~

## Tableaux à deux dimensions

**int m[3][4];** et accès **m[i][j]**.', array['Indices de 0 à n-1.', 'Aucune vérification des bornes en C.', 'On passe la taille avec le tableau.']::text[], '[{"language":"c","title":"Maximum d''un tableau","code":"#include <stdio.h>\n\nint maximum(int t[], int n) {\n    int m = t[0];\n    for (int i = 1; i < n; i++) {\n        if (t[i] > m) m = t[i];\n    }\n    return m;\n}\n\nint main(void) {\n    int n, t[100];\n    scanf(\"%d\", &n);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &t[i]);\n    printf(\"Maximum : %d\\n\", maximum(t, n));\n    return 0;\n}","stdin":"5\n4 9 2 9 1"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite-memoire'), (select id from public.courses where slug = 'langage-c'), 'chaines', 'Chaînes de caractères', 'debutant', 30, array['Comprendre les chaînes terminées par ''\0''.', 'Utiliser string.h.']::text[], '{}'::text[], '## Une chaîne est un tableau de char

~~~c
char ville[20] = "Lubumbashi";
~~~

Une chaîne se termine par le caractère nul **''\0''**. Le tableau doit donc avoir une case de plus que le nombre de lettres.

## Fonctions de string.h

| Fonction | Rôle |
|---|---|
| strlen(s) | longueur |
| strcpy(d, s) | copie |
| strcat(d, s) | concaténation |
| strcmp(a, b) | comparaison (0 si égales) |

On ne compare **jamais** deux chaînes avec == : on compare leurs adresses !

## Lire une chaîne

**scanf("%19s", ville)** lit un mot (sans &, le nom du tableau est déjà une adresse). Pour une ligne entière : **fgets(ligne, sizeof ligne, stdin)**.', array['Une chaîne finit par ''\0''.', 'strlen, strcpy, strcmp sont dans string.h.', 'Ne jamais comparer des chaînes avec ==.']::text[], '[{"language":"c","title":"Compter les voyelles","code":"#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    char mot[100];\n    int nb = 0;\n    scanf(\"%99s\", mot);\n    for (size_t i = 0; i < strlen(mot); i++) {\n        char c = tolower(mot[i]);\n        if (strchr(\"aeiouy\", c)) nb++;\n    }\n    printf(\"%s contient %d voyelle(s)\\n\", mot, nb);\n    return 0;\n}","stdin":"Programmation"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite-memoire'), (select id from public.courses where slug = 'langage-c'), 'pointeurs', 'Pointeurs', 'avance', 40, array['Comprendre adresses et pointeurs.', 'Modifier une variable via son adresse.']::text[], '{}'::text[], '## Adresse et pointeur

Chaque variable occupe une place en mémoire, repérée par une **adresse**. Un **pointeur** est une variable qui contient une adresse.

~~~c
int x = 10;
int *p = &x;   // p contient l''adresse de x
*p = 20;       // modifie x via le pointeur
~~~

- **&x** : adresse de x.
- **\*p** : valeur située à l''adresse contenue dans p (déréférencement).

## Simuler le passage par référence

~~~c
void echanger(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}
echanger(&x, &y);
~~~

## Pointeurs et tableaux

Le nom d''un tableau est l''adresse de son premier élément : **t[i]** équivaut à **\*(t + i)**.

## Le pointeur NULL

**NULL** indique qu''un pointeur ne désigne rien. Déréférencer NULL ou un pointeur non initialisé provoque une **erreur de segmentation**.', array['Un pointeur contient une adresse.', '& donne l''adresse, * accède à la valeur pointée.', 'Passer une adresse permet de modifier la variable d''origine.']::text[], '[{"language":"c","title":"Échange par pointeurs","code":"#include <stdio.h>\n\nvoid echanger(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint main(void) {\n    int x = 3, y = 8;\n    int *p = &x;\n    printf(\"x = %d, *p = %d\\n\", x, *p);\n    echanger(&x, &y);\n    printf(\"Après échange : x = %d, y = %d\\n\", x, y);\n    return 0;\n}"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'pointeurs'), 'c-pointeurs-quiz', 'Pointeurs', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-pointeurs-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-pointeurs-quiz'), 'qcm', 'int x = 5; int *p = &x; *p = 9; Que vaut x ?', null, '["5","9","L''adresse de x","Erreur"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite-memoire'), (select id from public.courses where slug = 'langage-c'), 'allocation-dynamique', 'Allocation dynamique', 'avance', 35, array['Réserver de la mémoire avec malloc.', 'Libérer la mémoire avec free.']::text[], '{}'::text[], '## Pourquoi ?

La taille d''un tableau classique est fixée à la compilation. Avec l''allocation dynamique, on réserve la mémoire **pendant l''exécution**, selon les besoins.

~~~c
#include <stdlib.h>
int *t = malloc(n * sizeof(int));
if (t == NULL) { /* plus de mémoire */ }
...
free(t);
~~~

## Les règles

1. Toujours vérifier que malloc n''a pas renvoyé NULL.
2. Toujours libérer avec **free** ce qui a été alloué (sinon : **fuite mémoire**).
3. Ne jamais utiliser un pointeur après free.

**calloc** alloue et initialise à zéro ; **realloc** change la taille d''un bloc.', array['malloc réserve, free libère.', 'Vérifier NULL après malloc.', 'Une mémoire non libérée est une fuite.']::text[], '[{"language":"c","title":"Tableau de taille choisie","code":"#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n * sizeof(int));\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = i * i;\n    for (int i = 0; i < n; i++) printf(\"%d \", t[i]);\n    printf(\"\\n\");\n    free(t);\n    return 0;\n}","stdin":"8"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'langage-c'), 'donnees-avancees', 'Module 3 — Structures, fichiers et structures de données', null, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'donnees-avancees'), (select id from public.courses where slug = 'langage-c'), 'structures', 'Structures', 'intermediaire', 30, array['Définir un type structuré avec struct.', 'Manipuler un tableau de structures.']::text[], '{}'::text[], '## Regrouper des données

~~~c
typedef struct {
    char nom[50];
    int age;
    double moyenne;
} Etudiant;

Etudiant e = {"Amani", 20, 14.5};
printf("%s : %.1f\n", e.nom, e.moyenne);
~~~

On accède aux champs avec le **point**. Avec un pointeur vers une structure, on utilise la **flèche** : **p->age** (équivalent à (\*p).age).

## Tableaux de structures

**Etudiant promo[100];** permet de gérer toute une promotion.', array['struct regroupe des champs de types différents.', 'typedef donne un nom au type.', '. pour une variable, -> pour un pointeur.']::text[], '[{"language":"c","title":"Meilleur étudiant","code":"#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    double moyenne;\n} Etudiant;\n\nint main(void) {\n    Etudiant promo[3] = {{\"Amani\", 14.5}, {\"Grace\", 17.0}, {\"Josue\", 11.25}};\n    int meilleur = 0;\n    for (int i = 1; i < 3; i++) {\n        if (promo[i].moyenne > promo[meilleur].moyenne) meilleur = i;\n    }\n    printf(\"Major : %s (%.2f)\\n\", promo[meilleur].nom, promo[meilleur].moyenne);\n    return 0;\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'donnees-avancees'), (select id from public.courses where slug = 'langage-c'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Ouvrir, lire, écrire et fermer un fichier.']::text[], '{}'::text[], '## fopen et fclose

~~~c
FILE *f = fopen("notes.txt", "w");
if (f == NULL) { perror("fopen"); return 1; }
fprintf(f, "%s %d\n", "Amani", 15);
fclose(f);
~~~

Modes : "r" (lecture), "w" (écriture), "a" (ajout).

## Lire

**fscanf(f, "%s %d", nom, &note)** renvoie le nombre de valeurs lues, ou EOF à la fin du fichier. **fgets** lit une ligne entière.

Toujours vérifier que **fopen** n''a pas renvoyé NULL et toujours fermer le fichier.', array['fopen / fclose.', 'fprintf et fscanf fonctionnent comme printf et scanf.', 'Vérifier NULL après fopen.']::text[], '[{"language":"c","title":"Écrire puis relire","code":"#include <stdio.h>\n\nint main(void) {\n    FILE *f = fopen(\"notes.txt\", \"w\");\n    if (f == NULL) return 1;\n    fprintf(f, \"Amani 15\\nGrace 17\\nJosue 9\\n\");\n    fclose(f);\n\n    f = fopen(\"notes.txt\", \"r\");\n    if (f == NULL) return 1;\n    char nom[30];\n    int note;\n    while (fscanf(f, \"%29s %d\", nom, &note) == 2) {\n        printf(\"%-6s %2d %s\\n\", nom, note, note >= 10 ? \"admis\" : \"ajourné\");\n    }\n    fclose(f);\n    return 0;\n}"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'donnees-avancees'), (select id from public.courses where slug = 'langage-c'), 'structures-donnees', 'Algorithmes et structures de données', 'avance', 45, array['Implémenter une liste chaînée.', 'Implémenter une pile.']::text[], '{}'::text[], '## La liste chaînée

Chaque **nœud** contient une valeur et un pointeur vers le nœud suivant :

~~~c
typedef struct Noeud {
    int valeur;
    struct Noeud *suivant;
} Noeud;
~~~

Avantages : insertion en tête en O(1), taille variable. Inconvénient : accès au i-ème élément en O(n).

## La pile

Une pile peut être réalisée avec une liste chaînée : empiler = insérer en tête, dépiler = retirer la tête.

## Libérer la mémoire

Chaque nœud alloué avec malloc doit être libéré avec free, en parcourant la liste.', array['Une liste chaînée relie des nœuds par des pointeurs.', 'Une pile se réalise par insertion/retrait en tête.', 'Libérer chaque nœud.']::text[], '[{"language":"c","title":"Liste chaînée","code":"#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Noeud {\n    int valeur;\n    struct Noeud *suivant;\n} Noeud;\n\nNoeud *empiler(Noeud *tete, int v) {\n    Noeud *n = malloc(sizeof(Noeud));\n    if (n == NULL) exit(1);\n    n->valeur = v;\n    n->suivant = tete;\n    return n;\n}\n\nint main(void) {\n    Noeud *pile = NULL;\n    for (int i = 1; i <= 5; i++) pile = empiler(pile, i * 10);\n    for (Noeud *p = pile; p != NULL; p = p->suivant) printf(\"%d \", p->valeur);\n    printf(\"\\n\");\n    while (pile != NULL) {\n        Noeud *s = pile->suivant;\n        free(pile);\n        pile = s;\n    }\n    return 0;\n}"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'langage-c'), null, 'c-evaluation-finale', 'Évaluation finale — Langage C', true, 70, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que vaut 9 / 2 en C si les deux opérandes sont des int ?', null, '["4.5","4","5","Erreur"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Quel format affiche un double avec deux décimales ?', null, '["%d","%.2f","%2d","%s"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'vrai_faux', 'Le C vérifie automatiquement les indices des tableaux.', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que faut-il appeler après malloc lorsque la mémoire n''est plus utile ?', null, '["delete","free","fclose","Rien"]'::jsonb, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== JavaScript =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('javascript', 'javascript', (select id from public.course_categories where slug = 'web'), 'Parcours D', 'JavaScript', 'Le langage qui fait vivre le web.', 'JavaScript anime les pages web et fait aussi tourner des serveurs. Ce parcours va des variables et fonctions jusqu''au DOM, aux événements, à l''asynchronisme, aux promesses et aux API, avec des projets web pratiques.', 'debutant', array['Parcours Algorithmique, modules 1 et 2.']::text[], array['Maîtriser la syntaxe moderne de JavaScript.', 'Manipuler tableaux et objets.', 'Interagir avec une page web via le DOM et les événements.', 'Comprendre l''asynchronisme, les promesses et les API.']::text[], 28, 'publie', 4, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'javascript'), 'langage', 'Module 1 — Le langage', null, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'introduction', 'Introduction à JavaScript', 'debutant', 20, array['Situer JavaScript dans l''écosystème web.', 'Afficher avec console.log.']::text[], '{}'::text[], '## Le langage du web

Une page web repose sur trois technologies : **HTML** (structure), **CSS** (apparence) et **JavaScript** (comportement). JavaScript s''exécute dans tous les navigateurs, et aussi sur les serveurs grâce à **Node.js**.

## Afficher une valeur

~~~javascript
console.log("Bonjour UPL !");
console.log("2 + 3 =", 2 + 3);
~~~

Sur la plateforme, console.log écrit dans la console de sortie de l''éditeur.

## Lire une entrée

Dans les exercices, les données d''entrée sont accessibles ligne par ligne grâce à la fonction **lireLigne()** fournie par la plateforme (ou en lisant l''entrée standard avec Node.js).

## Syntaxe

Les instructions se terminent par un point-virgule (recommandé) et les blocs sont délimités par des accolades.', array['HTML structure, CSS décore, JavaScript anime.', 'console.log affiche dans la console.', 'JavaScript fonctionne aussi côté serveur avec Node.js.']::text[], '[{"language":"javascript","title":"Premier programme","code":"console.log(\"Bonjour UPL !\");\nconst annee = new Date().getFullYear();\nconsole.log(\"Nous sommes en\", annee);"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'variables-constantes', 'Variables, constantes et types', 'debutant', 25, array['Utiliser let et const.', 'Connaître les types primitifs.']::text[], '{}'::text[], '## let et const

~~~javascript
let age = 20;          // peut changer
const PI = 3.14159;    // ne peut pas être réaffectée
~~~

Utilisez **const** par défaut, **let** si la valeur doit changer. Évitez l''ancien **var**.

## Types primitifs

| Type | Exemple |
|---|---|
| number | 42, 3.14 (un seul type pour entiers et réels) |
| string | "UPL", ''UPL'' |
| boolean | true, false |
| undefined | variable sans valeur |
| null | absence volontaire de valeur |

**typeof x** donne le type.

## Conversions

Number("42") → 42, String(10) → "10", parseInt("12px") → 12. Attention : "5" + 3 donne "53" (concaténation), alors que "5" * 3 donne 15.', array['const par défaut, let si nécessaire.', 'number regroupe entiers et réels.', 'Attention aux conversions implicites avec +.']::text[], '[{"language":"javascript","title":"Types","code":"const nom = \"Amani\";\nlet note = 14.5;\nconsole.log(typeof nom, typeof note, typeof true);\nconsole.log(\"5\" + 3, \"5\" * 3, Number(\"5\") + 3);"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'operateurs-conditions', 'Opérateurs et conditions', 'debutant', 25, array['Utiliser === et !==.', 'Écrire if / else et switch.']::text[], '{}'::text[], '## Comparer avec ===

**===** compare valeur **et** type ; **==** convertit avant de comparer ("5" == 5 est vrai !). Utilisez toujours **===** et **!==**.

## Opérateurs

Arithmétiques : + - * / % ** ; logiques : && (ET), || (OU), ! (NON). Division entière : **Math.floor(a / b)** ou **Math.trunc(a / b)**.

## Conditions

~~~javascript
if (note >= 16) {
  console.log("Très bien");
} else if (note >= 10) {
  console.log("Passable");
} else {
  console.log("Ajourné");
}
const statut = note >= 10 ? "admis" : "ajourné";
~~~

**switch** fonctionne comme en C (avec break).', array['Toujours === et !==.', 'Math.floor pour la division entière.', 'L''opérateur ternaire condition ? a : b.']::text[], '[{"language":"javascript","title":"Comparaisons","code":"console.log(\"5\" == 5, \"5\" === 5);\nconst note = 13;\nconsole.log(note >= 10 ? \"admis\" : \"ajourné\");\nconsole.log(17 % 5, 2 ** 10, Math.floor(17 / 5));"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'boucles', 'Boucles', 'debutant', 20, array['Utiliser for, while, for…of.']::text[], '{}'::text[], '## for, while, do … while

~~~javascript
for (let i = 1; i <= 5; i++) console.log(i);
let n = 0;
while (n < 3) n++;
~~~

## for … of

Parcourt les **valeurs** d''un tableau ou d''une chaîne :

~~~javascript
for (const lettre of "UPL") console.log(lettre);
~~~

## for … in

Parcourt les **clés** d''un objet (à éviter sur les tableaux).', array['for classique pour un compteur.', 'for…of pour les valeurs.', 'for…in pour les clés d''un objet.']::text[], '[{"language":"javascript","title":"Table de multiplication","code":"const n = 7;\nfor (let i = 1; i <= 10; i++) {\n  console.log(n + \" x \" + i + \" = \" + n * i);\n}"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer des fonctions classiques et fléchées.', 'Utiliser des fonctions comme valeurs.']::text[], '{}'::text[], '## Déclarations

~~~javascript
function carre(x) {
  return x * x;
}
const cube = (x) => x * x * x;   // fonction fléchée
~~~

## Paramètres par défaut

~~~javascript
function saluer(nom, message = "Bonjour") {
  return message + ", " + nom;
}
~~~

## Fonctions d''ordre supérieur

En JavaScript, une fonction est une **valeur** : on peut la passer en argument. C''est la base de map, filter et des gestionnaires d''événements.', array['function ou fonction fléchée =>.', 'Les fonctions sont des valeurs.', 'Paramètres par défaut possibles.']::text[], '[{"language":"javascript","title":"Fonctions","code":"function estPremier(n) {\n  if (n < 2) return false;\n  for (let d = 2; d * d <= n; d++) {\n    if (n % d === 0) return false;\n  }\n  return true;\n}\nconst premiers = [];\nfor (let k = 2; k < 40; k++) if (estPremier(k)) premiers.push(k);\nconsole.log(premiers.join(\", \"));"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'tableaux-objets', 'Tableaux et objets', 'debutant', 35, array['Manipuler des tableaux avec map, filter, reduce.', 'Créer et parcourir des objets.']::text[], '{}'::text[], '## Tableaux

~~~javascript
const notes = [12, 15, 9, 17];
notes.push(11);
console.log(notes.length, notes[0]);
~~~

| Méthode | Rôle |
|---|---|
| map(f) | transforme chaque élément |
| filter(f) | garde les éléments qui vérifient f |
| reduce(f, init) | combine en une valeur |
| find(f) | premier élément qui vérifie f |
| sort((a, b) => a - b) | tri numérique |

> sort() sans argument trie **comme des chaînes** : [10, 9, 1].sort() donne [1, 10, 9].

## Objets

~~~javascript
const etudiant = { nom: "Amani", age: 20 };
etudiant.moyenne = 14.2;
for (const [cle, valeur] of Object.entries(etudiant)) console.log(cle, valeur);
~~~

## Déstructuration

const { nom, age } = etudiant; et const [premier, ...reste] = notes;', array['map, filter, reduce évitent beaucoup de boucles.', 'sort numérique : (a, b) => a - b.', 'Les objets associent des clés à des valeurs.']::text[], '[{"language":"javascript","title":"map, filter, reduce","code":"const promo = [\n  { nom: \"Amani\", moyenne: 14.5 },\n  { nom: \"Grâce\", moyenne: 17 },\n  { nom: \"Josué\", moyenne: 8.5 },\n];\nconst admis = promo.filter((e) => e.moyenne >= 10).map((e) => e.nom);\nconst moyenne = promo.reduce((s, e) => s + e.moyenne, 0) / promo.length;\nconsole.log(\"Admis :\", admis.join(\", \"));\nconsole.log(\"Moyenne générale :\", moyenne.toFixed(2));"}]'::jsonb, 'publie', 6, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'javascript'), 'web', 'Module 2 — JavaScript dans la page', null, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'dom', 'Le DOM', 'intermediaire', 30, array['Sélectionner et modifier des éléments HTML.']::text[], '{}'::text[], '## Qu''est-ce que le DOM ?

Le **DOM** (Document Object Model) est la représentation de la page HTML sous forme d''arbre d''objets que JavaScript peut lire et modifier.

## Sélectionner

~~~javascript
const titre = document.querySelector("h1");
const boutons = document.querySelectorAll(".btn");
~~~

## Modifier

~~~javascript
titre.textContent = "Nouveau titre";
titre.classList.add("important");
titre.style.color = "navy";
~~~

## Créer des éléments

~~~javascript
const li = document.createElement("li");
li.textContent = "Python";
document.querySelector("ul").append(li);
~~~

Préférez **textContent** à innerHTML pour insérer du texte venant d''un utilisateur : innerHTML peut exécuter du code malveillant (faille XSS).

> Les programmes de l''éditeur s''exécutent dans un environnement isolé sans page : testez le DOM dans un fichier HTML sur votre ordinateur.', array['Le DOM représente la page sous forme d''objets.', 'querySelector sélectionne, textContent modifie.', 'textContent est plus sûr qu''innerHTML.']::text[], '[{"language":"javascript","title":"Exemple (à tester dans une page HTML)","code":"// Dans une page contenant <ul id=\"langages\"></ul>\nconst langages = [\"Pseudocode\", \"Python\", \"C\", \"JavaScript\", \"Java\"];\nif (typeof document !== \"undefined\") {\n  const ul = document.querySelector(\"#langages\");\n  for (const l of langages) {\n    const li = document.createElement(\"li\");\n    li.textContent = l;\n    ul.append(li);\n  }\n} else {\n  console.log(\"Pas de page ici : voici la liste qui serait affichée :\");\n  langages.forEach((l) => console.log(\"- \" + l));\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'evenements', 'Événements', 'intermediaire', 25, array['Réagir aux actions de l''utilisateur avec addEventListener.']::text[], '{}'::text[], '## addEventListener

~~~javascript
const bouton = document.querySelector("#valider");
bouton.addEventListener("click", () => {
  console.log("Bouton cliqué !");
});
~~~

## Événements courants

click, input, change, submit, keydown, load.

## L''objet événement

~~~javascript
formulaire.addEventListener("submit", (event) => {
  event.preventDefault();   // empêche le rechargement de la page
  const nom = formulaire.elements.nom.value;
});
~~~

Toujours **valider** les données saisies avant de les utiliser.', array['addEventListener(type, fonction).', 'event.preventDefault() bloque le comportement par défaut.', 'Valider toujours les saisies.']::text[], '[{"language":"javascript","title":"Simulation d''événements","code":"// Un mini système d''événements pour comprendre le principe\nconst ecouteurs = {};\nfunction on(nom, f) {\n  if (!ecouteurs[nom]) ecouteurs[nom] = [];\n  ecouteurs[nom].push(f);\n}\nfunction emettre(nom, donnee) { (ecouteurs[nom] || []).forEach((f) => f(donnee)); }\n\non(\"click\", (d) => console.log(\"Clic sur\", d));\non(\"click\", () => console.log(\"Deuxième écouteur\"));\nemettre(\"click\", \"le bouton Valider\");"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'asynchronisme-promesses', 'Asynchronisme et promesses', 'avance', 35, array['Comprendre l''exécution asynchrone.', 'Utiliser les promesses et async/await.']::text[], '{}'::text[], '## Pourquoi l''asynchronisme ?

Certaines opérations prennent du temps (télécharger des données, attendre un délai). JavaScript ne bloque pas : il continue l''exécution et traite le résultat **plus tard**.

~~~javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");   // affiche A, C, puis B
~~~

## Les promesses

Une **promesse** représente un résultat futur : elle est **tenue** (resolve) ou **rompue** (reject).

~~~javascript
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
attendre(500).then(() => console.log("Fini"));
~~~

## async / await

~~~javascript
async function principal() {
  try {
    await attendre(500);
    console.log("Après 500 ms");
  } catch (e) {
    console.log("Erreur :", e.message);
  }
}
~~~

**await** suspend la fonction jusqu''au résultat, sans bloquer le reste du programme.', array['Le code asynchrone s''exécute plus tard.', 'Une promesse est tenue ou rompue.', 'async/await rend le code asynchrone lisible.']::text[], '[{"language":"javascript","title":"Promesses et async/await","code":"const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));\n\nasync function principal() {\n  console.log(\"Début\");\n  const a = await attendre(200, \"données A\");\n  console.log(\"Reçu :\", a);\n  const [b, c] = await Promise.all([attendre(100, \"B\"), attendre(150, \"C\")]);\n  console.log(\"En parallèle :\", b, c);\n  console.log(\"Fin\");\n}\nprincipal();"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchronisme-promesses'), 'js-async-quiz', 'Asynchronisme', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'js-async-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'js-async-quiz'), 'qcm', 'Dans quel ordre s''affichent A, B, C ? console.log(''A''); setTimeout(() => console.log(''B''), 0); console.log(''C'');', null, '["A B C","A C B","B A C","C A B"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'api', 'Consommer une API', 'avance', 30, array['Appeler une API web avec fetch.', 'Traiter une réponse JSON.']::text[], '{}'::text[], '## fetch

~~~javascript
async function chargerUtilisateurs() {
  const reponse = await fetch("https://exemple.org/api/utilisateurs");
  if (!reponse.ok) throw new Error("Erreur HTTP " + reponse.status);
  const donnees = await reponse.json();
  return donnees;
}
~~~

## JSON

**JSON** est le format d''échange de données du web. **JSON.parse(texte)** le transforme en objet, **JSON.stringify(objet)** en texte.

## Bonnes pratiques

- Vérifier **reponse.ok** avant de lire les données.
- Gérer les erreurs réseau avec try/catch.
- Ne jamais placer une **clé secrète** d''API dans le code du navigateur : elle serait visible de tous.

> Pour des raisons de sécurité, les programmes de l''éditeur n''ont pas accès au réseau.', array['fetch renvoie une promesse.', 'JSON.parse / JSON.stringify.', 'Aucune clé secrète dans le navigateur.']::text[], '[{"language":"javascript","title":"JSON","code":"const texte = ''{\"cours\": \"JavaScript\", \"lecons\": 10, \"langages\": [\"fr\", \"en\"]}'';\nconst objet = JSON.parse(texte);\nconsole.log(objet.cours, \"-\", objet.lecons, \"leçons\");\nobjet.niveau = \"débutant\";\nconsole.log(JSON.stringify(objet));"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'projets-web', 'Projets web pratiques', 'avance', 60, array['Réaliser un petit projet complet : gestionnaire de tâches.']::text[], '{}'::text[], '## Projet : liste de tâches

Objectif : une page où l''on ajoute, coche et supprime des tâches, avec sauvegarde dans le navigateur.

### Étapes

1. **HTML** : un champ texte, un bouton, une liste ul.
2. **Modèle** : un tableau d''objets { id, texte, faite }.
3. **Affichage** : une fonction afficher() qui reconstruit la liste à partir du modèle.
4. **Événements** : ajout (submit), basculer (click sur une case), suppression.
5. **Persistance** : localStorage.setItem("taches", JSON.stringify(taches)).

### Séparer la logique de l''affichage

La logique (ajouter, basculer, supprimer) se teste sans page : c''est ce que fait l''exemple ci-dessous. L''affichage n''est qu''une traduction du modèle en HTML.

## Autres idées de projets

- Calculatrice de moyenne pondérée.
- Quiz interactif avec score.
- Convertisseur de devises (avec une API).', array['Séparer modèle, logique et affichage.', 'localStorage conserve les données dans le navigateur.', 'Tester la logique indépendamment de la page.']::text[], '[{"language":"javascript","title":"Logique du gestionnaire de tâches","code":"let taches = [];\nlet prochainId = 1;\n\nfunction ajouter(texte) {\n  if (!texte.trim()) throw new Error(\"Tâche vide\");\n  taches.push({ id: prochainId++, texte: texte.trim(), faite: false });\n}\nfunction basculer(id) {\n  taches = taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t));\n}\nfunction supprimer(id) {\n  taches = taches.filter((t) => t.id !== id);\n}\nfunction afficher() {\n  taches.forEach((t) => console.log((t.faite ? \"[x] \" : \"[ ] \") + t.texte));\n  console.log(\"---\");\n}\n\najouter(\"Réviser les boucles\");\najouter(\"Faire l''exercice FizzBuzz\");\najouter(\"Lire la leçon sur les promesses\");\nbasculer(2);\nafficher();\nsupprimer(1);\nafficher();"}]'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-evaluation-finale', 'Évaluation finale — JavaScript', true, 70, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Que vaut "3" + 4 en JavaScript ?', null, '["7","\"34\"","Erreur","NaN"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quel mot-clé déclare une variable non réaffectable ?', null, '["var","let","const","static"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'vrai_faux', '=== compare la valeur et le type.', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quelle méthode garde les éléments vérifiant une condition ?', null, '["map","filter","reduce","forEach"]'::jsonb, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Java =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('java', 'java', (select id from public.course_categories where slug = 'programmation'), 'Parcours E', 'Java', 'La programmation orientée objet, rigoureuse et portable.', 'Java est utilisé dans les applications d''entreprise, Android et les systèmes distribués. Ce parcours présente la syntaxe, les méthodes, puis approfondit la programmation orientée objet : classes, constructeurs, encapsulation, héritage, polymorphisme, interfaces, collections, exceptions, fichiers et structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.', 'Notions d''objets (parcours Python, leçon POO) recommandées.']::text[], array['Écrire des programmes Java structurés.', 'Concevoir des classes selon les principes de la POO.', 'Utiliser les collections et gérer les exceptions.', 'Implémenter des structures de données.']::text[], 32, 'publie', 5, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'java'), 'bases', 'Module 1 — Les bases', null, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'presentation', 'Présentation de Java', 'debutant', 20, array['Comprendre la compilation en bytecode.', 'Écrire la classe Main.']::text[], '{}'::text[], '## Compiler une fois, exécuter partout

Le code Java est compilé en **bytecode**, exécuté par la **machine virtuelle Java (JVM)**. Le même programme fonctionne sur Windows, Linux, macOS ou Android.

## Premier programme

~~~java
public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour UPL !");
    }
}
~~~

- Tout code Java est placé dans une **classe**.
- L''exécution commence par la méthode **main**.
- Sur la plateforme, la classe principale doit s''appeler **Main**.

## Lire au clavier

~~~java
import java.util.Scanner;
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String ligne = sc.nextLine();
~~~', array['Java est compilé en bytecode exécuté par la JVM.', 'Tout est dans une classe ; main est le point d''entrée.', 'Scanner lit les entrées.']::text[], '[{"language":"java","title":"Bonjour","code":"public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Bonjour UPL !\");\n        System.out.println(\"Java a été créé en \" + 1995);\n    }\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'variables-types', 'Variables et types', 'debutant', 25, array['Déclarer des variables typées.', 'Distinguer types primitifs et String.']::text[], '{}'::text[], '## Types primitifs

| Type | Contenu |
|---|---|
| int, long | entiers |
| double | réels |
| boolean | true / false |
| char | un caractère |

~~~java
int age = 20;
double moyenne = 13.5;
final double PI = 3.14159;   // constante
String nom = "Amani";        // objet, pas un primitif
~~~

## Division

7 / 2 vaut 3 (division entière) ; 7 / 2.0 vaut 3.5. Le reste s''obtient avec %.

## Comparer des chaînes

Utilisez **a.equals(b)** et non ==, qui compare les références.

## var

Depuis Java 10, **var** laisse le compilateur déduire le type : var total = 0;', array['Types primitifs : int, double, boolean, char.', 'final déclare une constante.', 'equals compare le contenu des chaînes.']::text[], '[{"language":"java","title":"Types","code":"public class Main {\n    public static void main(String[] args) {\n        int a = 7, b = 2;\n        System.out.println(a / b + \" \" + (double) a / b + \" \" + a % b);\n        String s1 = \"UPL\";\n        String s2 = new String(\"UPL\");\n        System.out.println(s1 == s2);\n        System.out.println(s1.equals(s2));\n    }\n}"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'conditions-boucles', 'Conditions et boucles', 'debutant', 30, array['Utiliser if, switch, for, while et for-each.']::text[], '{}'::text[], '## Conditions

~~~java
if (note >= 10) {
    System.out.println("Admis");
} else {
    System.out.println("Ajourné");
}
~~~

Le **switch** moderne (Java 14 et plus) :

~~~java
String type = switch (jour) {
    case 6, 7 -> "Week-end";
    default -> "Semaine";
};
~~~

## Boucles

~~~java
for (int i = 1; i <= 10; i++) { ... }
while (condition) { ... }
do { ... } while (condition);
for (int note : notes) { ... }   // for-each
~~~', array['if / else, switch avec ->.', 'for, while, do…while, for-each.', 'Attention aux parenthèses dans les concaténations.']::text[], '[{"language":"java","title":"Table de multiplication","code":"import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= 10; i++) {\n            System.out.println(n + \" x \" + i + \" = \" + (n * i));\n        }\n    }\n}","stdin":"6"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'methodes', 'Méthodes', 'debutant', 25, array['Écrire des méthodes statiques.', 'Utiliser la surcharge.']::text[], '{}'::text[], '## Méthodes statiques

~~~java
static int carre(int x) {
    return x * x;
}
~~~

**static** signifie que la méthode appartient à la classe et non à un objet.

## Surcharge

Plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent :

~~~java
static double aire(double r) { return Math.PI * r * r; }
static double aire(double l, double h) { return l * h; }
~~~

## Passage des paramètres

Java passe toujours **une copie** : copie de la valeur pour les primitifs, copie de la **référence** pour les objets (l''objet lui-même peut donc être modifié).', array['static : méthode de classe.', 'La surcharge varie les paramètres.', 'Les arguments sont des copies (valeurs ou références).']::text[], '[{"language":"java","title":"Méthodes","code":"public class Main {\n    static boolean estPremier(int n) {\n        if (n < 2) return false;\n        for (int d = 2; d * d <= n; d++) {\n            if (n % d == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        StringBuilder sb = new StringBuilder();\n        for (int k = 2; k < 40; k++) {\n            if (estPremier(k)) sb.append(k).append(\" \");\n        }\n        System.out.println(sb.toString().trim());\n    }\n}"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'java'), 'objets', 'Module 2 — Programmation orientée objet', null, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'classes-objets', 'Classes, objets et constructeurs', 'intermediaire', 35, array['Définir une classe avec attributs, constructeur et méthodes.', 'Créer des objets avec new.']::text[], '{}'::text[], '## Une classe

~~~java
class Etudiant {
    String nom;
    double moyenne;

    Etudiant(String nom, double moyenne) {   // constructeur
        this.nom = nom;
        this.moyenne = moyenne;
    }

    boolean estAdmis() {
        return moyenne >= 10;
    }
}

Etudiant e = new Etudiant("Amani", 14.5);
~~~

- Le **constructeur** porte le nom de la classe et n''a pas de type de retour.
- **this** désigne l''objet courant.
- **new** crée un objet.

## toString

Redéfinir **toString()** permet d''afficher un objet lisiblement avec System.out.println.', array['Une classe regroupe attributs et méthodes.', 'Le constructeur initialise l''objet.', 'toString définit l''affichage.']::text[], '[{"language":"java","title":"Classe Etudiant","code":"class Etudiant {\n    String nom;\n    double moyenne;\n\n    Etudiant(String nom, double moyenne) {\n        this.nom = nom;\n        this.moyenne = moyenne;\n    }\n\n    boolean estAdmis() {\n        return moyenne >= 10;\n    }\n\n    @Override\n    public String toString() {\n        return nom + \" (\" + moyenne + \")\" + (estAdmis() ? \" admis\" : \" ajourné\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Josué\", 8.75) };\n        for (Etudiant e : promo) System.out.println(e);\n    }\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'encapsulation', 'Encapsulation', 'intermediaire', 25, array['Protéger les attributs avec private.', 'Écrire des accesseurs qui valident les données.']::text[], '{}'::text[], '## Cacher l''état interne

~~~java
class Compte {
    private double solde;

    public double getSolde() { return solde; }

    public void deposer(double montant) {
        if (montant <= 0) throw new IllegalArgumentException("Montant invalide");
        solde += montant;
    }
}
~~~

Les attributs **private** ne sont accessibles que depuis la classe. L''extérieur passe par des **méthodes publiques** qui garantissent la cohérence des données (pas de solde négatif, par exemple).

## Modificateurs d''accès

| Mot-clé | Accès |
|---|---|
| private | la classe seulement |
| (aucun) | le paquetage |
| protected | paquetage et sous-classes |
| public | tout le monde |', array['private protège les attributs.', 'Les méthodes publiques valident les modifications.', 'final empêche la réaffectation.']::text[], '[{"language":"java","title":"Compte encapsulé","code":"class Compte {\n    private final String titulaire;\n    private double solde;\n\n    Compte(String titulaire) { this.titulaire = titulaire; }\n\n    public double getSolde() { return solde; }\n\n    public void deposer(double m) {\n        if (m <= 0) throw new IllegalArgumentException(\"Montant invalide\");\n        solde += m;\n    }\n\n    public void retirer(double m) {\n        if (m > solde) throw new IllegalStateException(\"Solde insuffisant\");\n        solde -= m;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Compte c = new Compte(\"Amani\");\n        c.deposer(5000);\n        c.retirer(1200);\n        System.out.println(\"Solde : \" + c.getSolde());\n        try {\n            c.retirer(99999);\n        } catch (IllegalStateException e) {\n            System.out.println(\"Refusé : \" + e.getMessage());\n        }\n    }\n}"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'heritage-polymorphisme', 'Héritage et polymorphisme', 'avance', 40, array['Créer une sous-classe avec extends.', 'Redéfinir une méthode.', 'Exploiter le polymorphisme.']::text[], '{}'::text[], '## Héritage

~~~java
class Forme {
    double aire() { return 0; }
}
class Cercle extends Forme {
    private final double r;
    Cercle(double r) { this.r = r; }
    @Override
    double aire() { return Math.PI * r * r; }
}
~~~

La sous-classe hérite des attributs et méthodes de la classe mère ; **super(...)** appelle le constructeur parent.

## Polymorphisme

Une variable de type **Forme** peut désigner un Cercle ou un Rectangle : la méthode appelée est celle de **l''objet réel**.

~~~java
Forme[] formes = { new Cercle(1), new Rectangle(2, 3) };
for (Forme f : formes) System.out.println(f.aire());
~~~

## Classes abstraites

Une classe **abstract** ne peut pas être instanciée et peut déclarer des méthodes sans corps, que les sous-classes doivent définir.', array['extends crée une sous-classe.', '@Override redéfinit une méthode.', 'Le polymorphisme appelle la méthode de l''objet réel.']::text[], '[{"language":"java","title":"Formes","code":"abstract class Forme {\n    abstract double aire();\n    String nom() { return getClass().getSimpleName(); }\n}\n\nclass Cercle extends Forme {\n    private final double r;\n    Cercle(double r) { this.r = r; }\n    double aire() { return Math.PI * r * r; }\n}\n\nclass Rectangle extends Forme {\n    private final double l, h;\n    Rectangle(double l, double h) { this.l = l; this.h = h; }\n    double aire() { return l * h; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Forme[] formes = { new Cercle(1), new Rectangle(2, 3), new Cercle(2.5) };\n        for (Forme f : formes) {\n            System.out.printf(\"%s : %.2f%n\", f.nom(), f.aire());\n        }\n    }\n}"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'heritage-polymorphisme'), 'java-heritage-quiz', 'Héritage', false, 60, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-heritage-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'java-heritage-quiz'), 'vrai_faux', 'On peut créer un objet d''une classe abstraite avec new.', null, '["Vrai","Faux"]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'interfaces', 'Interfaces', 'avance', 25, array['Définir et implémenter une interface.']::text[], '{}'::text[], '## Un contrat

Une **interface** décrit ce qu''une classe sait faire, sans dire comment :

~~~java
interface Evaluable {
    double note();
    default boolean reussi() { return note() >= 10; }
}

class Examen implements Evaluable {
    public double note() { return 14; }
}
~~~

Une classe n''hérite que d''une seule classe, mais peut **implémenter plusieurs interfaces**.

## Interfaces utiles

**Comparable<T>** (ordre naturel), **Comparator<T>** (ordre personnalisé), **Runnable**.', array['Une interface est un contrat.', 'implements, éventuellement plusieurs.', 'Comparable définit l''ordre naturel.']::text[], '[{"language":"java","title":"Comparable","code":"import java.util.Arrays;\n\nclass Etudiant implements Comparable<Etudiant> {\n    final String nom;\n    final double moyenne;\n    Etudiant(String nom, double moyenne) { this.nom = nom; this.moyenne = moyenne; }\n    public int compareTo(Etudiant autre) { return Double.compare(autre.moyenne, moyenne); }\n    public String toString() { return nom + \" \" + moyenne; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Grâce\", 17), new Etudiant(\"Josué\", 11) };\n        Arrays.sort(promo);\n        System.out.println(Arrays.toString(promo));\n    }\n}"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position) values ((select id from public.courses where slug = 'java'), 'outils', 'Module 3 — Collections, exceptions et données', null, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'outils'), (select id from public.courses where slug = 'java'), 'collections', 'Collections', 'intermediaire', 35, array['Utiliser ArrayList, HashMap et HashSet.']::text[], '{}'::text[], '## ArrayList

~~~java
List<Integer> notes = new ArrayList<>();
notes.add(12);
notes.get(0);
notes.size();
~~~

## HashMap

~~~java
Map<String, Integer> compte = new HashMap<>();
compte.put("python", 3);
compte.merge("python", 1, Integer::sum);
compte.getOrDefault("java", 0);
~~~

## HashSet

Ensemble sans doublons, recherche rapide avec **contains**.

## Génériques

Le type entre chevrons (**<Integer>**) indique ce que contient la collection. Les collections contiennent des objets : on écrit Integer et non int.', array['ArrayList : liste dynamique.', 'HashMap / TreeMap : clé → valeur.', 'HashSet : unicité.']::text[], '[{"language":"java","title":"Compter des mots","code":"import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String texte = \"le code le plus simple est le meilleur code\";\n        Map<String, Integer> compte = new TreeMap<>();\n        for (String mot : texte.split(\" \")) {\n            compte.merge(mot, 1, Integer::sum);\n        }\n        for (Map.Entry<String, Integer> e : compte.entrySet()) {\n            System.out.println(e.getKey() + \" \" + e.getValue());\n        }\n        System.out.println(\"Distincts : \" + new HashSet<>(Arrays.asList(texte.split(\" \"))).size());\n    }\n}"}]'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'outils'), (select id from public.courses where slug = 'java'), 'exceptions', 'Exceptions', 'intermediaire', 25, array['Intercepter et lever des exceptions.']::text[], '{}'::text[], '## try / catch / finally

~~~java
try {
    int n = Integer.parseInt(texte);
} catch (NumberFormatException e) {
    System.out.println("Nombre invalide");
} finally {
    System.out.println("Toujours exécuté");
}
~~~

## Exceptions vérifiées

Certaines exceptions (comme **IOException**) doivent être soit interceptées, soit déclarées avec **throws** dans la signature de la méthode : le compilateur l''exige.

## Lever une exception

**throw new IllegalArgumentException("message");**', array['try / catch / finally.', 'Les exceptions vérifiées doivent être traitées ou déclarées.', 'throw lève une exception.']::text[], '[{"language":"java","title":"Conversion sécurisée","code":"public class Main {\n    public static void main(String[] args) {\n        String[] valeurs = { \"12\", \"abc\", \"0\" };\n        for (String v : valeurs) {\n            try {\n                int n = Integer.parseInt(v);\n                System.out.println(\"100 / \" + n + \" = \" + (100 / n));\n            } catch (NumberFormatException e) {\n                System.out.println(\"''\" + v + \"'' n''est pas un entier\");\n            } catch (ArithmeticException e) {\n                System.out.println(\"Division par zéro\");\n            }\n        }\n    }\n}"}]'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'outils'), (select id from public.courses where slug = 'java'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Lire et écrire des fichiers avec java.nio.file.']::text[], '{}'::text[], '## Écrire et lire

~~~java
Path chemin = Path.of("notes.txt");
Files.writeString(chemin, "Amani;15\nGrace;17\n");
List<String> lignes = Files.readAllLines(chemin);
~~~

## try-with-resources

~~~java
try (BufferedReader r = Files.newBufferedReader(chemin)) {
    String ligne;
    while ((ligne = r.readLine()) != null) { ... }
}
~~~

La ressource est fermée automatiquement, même en cas d''erreur.', array['Files et Path simplifient les fichiers.', 'try-with-resources ferme automatiquement.', 'IOException est vérifiée.']::text[], '[{"language":"java","title":"Fichier de notes","code":"import java.io.IOException;\nimport java.nio.file.*;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Path p = Paths.get(\"notes.txt\");\n        Files.write(p, List.of(\"Amani;15\", \"Grace;17\", \"Josue;9\"));\n        for (String ligne : Files.readAllLines(p)) {\n            String[] parties = ligne.split(\";\");\n            int note = Integer.parseInt(parties[1]);\n            System.out.println(parties[0] + \" : \" + (note >= 10 ? \"admis\" : \"ajourné\"));\n        }\n    }\n}"}]'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'outils'), (select id from public.courses where slug = 'java'), 'structures-donnees', 'Structures de données', 'avance', 40, array['Implémenter une pile générique.', 'Utiliser Deque et PriorityQueue.']::text[], '{}'::text[], '## Une pile générique

On peut écrire ses propres structures avec les génériques : **class Pile<T>**.

## Les structures de la bibliothèque

| Besoin | Classe |
|---|---|
| Pile / file | ArrayDeque |
| File de priorité | PriorityQueue |
| Liste chaînée | LinkedList |
| Arbre ordonné | TreeMap, TreeSet |

## Complexités

ArrayDeque : ajout/retrait aux extrémités en O(1). PriorityQueue : ajout et retrait du minimum en O(log n). TreeMap : opérations en O(log n).', array['Les génériques rendent les structures réutilisables.', 'ArrayDeque, PriorityQueue, TreeMap couvrent la plupart des besoins.', 'Connaître les complexités guide le choix.']::text[], '[{"language":"java","title":"Pile générique","code":"import java.util.ArrayList;\nimport java.util.PriorityQueue;\n\nclass Pile<T> {\n    private final ArrayList<T> elements = new ArrayList<>();\n    void empiler(T x) { elements.add(x); }\n    T depiler() {\n        if (elements.isEmpty()) throw new IllegalStateException(\"Pile vide\");\n        return elements.remove(elements.size() - 1);\n    }\n    boolean estVide() { return elements.isEmpty(); }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Pile<String> pile = new Pile<>();\n        for (String s : new String[] { \"a\", \"b\", \"c\" }) pile.empiler(s);\n        StringBuilder sb = new StringBuilder();\n        while (!pile.estVide()) sb.append(pile.depiler());\n        System.out.println(\"Dépilé : \" + sb);\n\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : new int[] { 42, 7, 19, 3 }) pq.add(x);\n        System.out.print(\"Par priorité :\");\n        while (!pq.isEmpty()) System.out.print(\" \" + pq.poll());\n        System.out.println();\n    }\n}"}]'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status) values ((select id from public.courses where slug = 'java'), null, 'java-evaluation-finale', 'Évaluation finale — Java', true, 70, 'publie')
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Comment compare-t-on le contenu de deux String ?', null, '["==","equals","compare","="]'::jsonb, 0) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quel mot-clé crée une sous-classe ?', null, '["implements","extends","inherits","super"]'::jsonb, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'vrai_faux', 'Une classe Java peut implémenter plusieurs interfaces.', null, '["Vrai","Faux"]'::jsonb, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quelle collection garantit l''unicité ?', null, '["ArrayList","HashSet","LinkedList","ArrayDeque"]'::jsonb, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Exercices =====
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-bonjour', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Bonjour UPL', 'Écrivez un algorithme qui affiche exactement la ligne suivante :

~~~text
Bonjour UPL
~~~', 'debutant', 'ecrire_algorithme', array['Écrire la structure d''un algorithme.', 'Utiliser ECRIRE.']::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], 'ALGORITHME Bonjour
DEBUT
  // Votre code ici
FIN', array['L''instruction qui affiche du texte s''appelle ECRIRE.', 'Le texte doit être placé entre guillemets : ECRIRE("…").']::text[], 5, false, 'publie', 1)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-bonjour'), null, '', 'Bonjour UPL', false, 1, 0);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-bonjour'), 'ALGORITHME Bonjour
DEBUT
  ECRIRE("Bonjour UPL")
FIN', 'Il suffit d''une seule instruction **ECRIRE** placée entre DEBUT et FIN. Le texte est écrit entre guillemets et doit être identique au caractère près (majuscules comprises).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-echange', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Échanger deux valeurs', 'Complétez l''algorithme pour **échanger** les valeurs de a et b, lues au clavier, puis afficher :

~~~text
a = <nouvelle valeur de a>
b = <nouvelle valeur de b>
~~~', 'debutant', 'completer', '{}'::text[], '[{"input":"3\n8","output":"a = 8\nb = 3"}]'::jsonb, array['Utiliser une variable intermédiaire.', 'Ne pas réécrire les valeurs à la main.']::text[], 'ALGORITHME Echange
VARIABLES
  a, b, temp : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  // Échangez a et b ici

  ECRIRE("a = ", a)
  ECRIRE("b = ", b)
FIN', array['Si vous écrivez directement a ← b, l''ancienne valeur de a est perdue.', 'Sauvegardez d''abord a dans temp.', 'L''ordre est : temp ← a, puis a ← b, puis b ← temp.']::text[], 10, false, 'publie', 2)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-echange');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-echange'), null, '3
8', 'a = 8
b = 3', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-echange'), null, '-1
0', 'a = 0
b = -1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-echange'), null, '5
5', 'a = 5
b = 5', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-echange'), 'ALGORITHME Echange
VARIABLES
  a, b, temp : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  temp ← a
  a ← b
  b ← temp
  ECRIRE("a = ", a)
  ECRIRE("b = ", b)
FIN', 'L''affectation **écrase** l''ancienne valeur. On sauvegarde donc a dans temp avant de le remplacer :

1. temp ← a (temp garde l''ancienne valeur de a)
2. a ← b
3. b ← temp')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-somme-deux-nombres', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Somme de deux nombres', 'Lisez deux entiers puis affichez leur somme sous la forme :

~~~text
Somme : <résultat>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"4\n9","output":"Somme : 13"}]'::jsonb, '{}'::text[], 'ALGORITHME Somme
VARIABLES
  a, b : ENTIER
DEBUT

FIN', array['Utilisez LIRE deux fois.', 'ECRIRE("Somme : ", a + b) affiche le texte suivi du résultat.']::text[], 5, false, 'publie', 3)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-deux-nombres');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '4
9', 'Somme : 13', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '-5
5', 'Somme : 0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '1000
2345', 'Somme : 3345', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), 'ALGORITHME Somme
VARIABLES
  a, b : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE("Somme : ", a + b)
FIN', 'On lit les deux valeurs, puis on affiche l''expression a + b directement dans ECRIRE. Attention à l''espace après les deux-points dans « Somme : ».')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-moyenne-trois-notes', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Moyenne de trois notes', 'Lisez trois notes (réels) et affichez leur moyenne :

~~~text
Moyenne : <valeur>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"12\n15\n9","output":"Moyenne : 12"}]'::jsonb, '{}'::text[], '', array['Les notes peuvent être décimales : quel type choisir ?', 'Attention aux priorités : a + b + c / 3 ne divise que c !']::text[], 10, false, 'publie', 4)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-moyenne-trois-notes');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '12
15
9', 'Moyenne : 12', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '10
11
12.5', 'Moyenne : 11.1666666667', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '0
0
20', 'Moyenne : 6.66666666667', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), 'ALGORITHME Moyenne
VARIABLES
  a, b, c, moy : REEL
DEBUT
  LIRE(a)
  LIRE(b)
  LIRE(c)
  moy ← (a + b + c) / 3
  ECRIRE("Moyenne : ", moy)
FIN', 'Les parenthèses sont indispensables : **(a + b + c) / 3**. Sans elles, seule c serait divisée par 3. Les variables sont de type REEL car une moyenne peut être décimale.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-conversion-temps', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Conversion de secondes', 'Lisez une durée en secondes (entier positif) et affichez-la en heures, minutes et secondes :

~~~text
<h> h <m> min <s> s
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3725","output":"1 h 2 min 5 s"}]'::jsonb, '{}'::text[], '', array['Une heure vaut 3600 secondes.', 'DIV donne le quotient, MOD le reste.', 'h ← total DIV 3600, puis travaillez sur le reste total MOD 3600.']::text[], 10, false, 'publie', 5)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-conversion-temps');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '3725', '1 h 2 min 5 s', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '59', '0 h 0 min 59 s', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '86399', '23 h 59 min 59 s', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-conversion-temps'), 'ALGORITHME ConversionTemps
VARIABLES
  total, h, m, s : ENTIER
DEBUT
  LIRE(total)
  h ← total DIV 3600
  m ← (total MOD 3600) DIV 60
  s ← total MOD 60
  ECRIRE(h, " h ", m, " min ", s, " s")
FIN', '- **h** : nombre d''heures complètes = total DIV 3600.
- **m** : dans le reste (total MOD 3600), nombre de minutes complètes = DIV 60.
- **s** : secondes restantes = total MOD 60.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-pair-impair', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'pseudocode', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"4","output":"pair"},{"input":"7","output":"impair"}]'::jsonb, '{}'::text[], '', array['Un nombre est pair si le reste de sa division par 2 vaut 0.', 'Utilisez MOD dans la condition d''un SI.']::text[], 5, false, 'publie', 6)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '4', 'pair', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '7', 'impair', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '0', 'pair', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '-3', 'impair', true, 1, 3);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-pair-impair'), 'ALGORITHME PairImpair
VARIABLES
  n : ENTIER
DEBUT
  LIRE(n)
  SI n MOD 2 = 0 ALORS
    ECRIRE("pair")
  SINON
    ECRIRE("impair")
  FINSI
FIN', 'On teste le reste de la division par 2. Remarque : pour un nombre négatif impair, n MOD 2 vaut -1, d''où l''intérêt de tester « = 0 » plutôt que « = 1 ».')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-mention', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'pseudocode', 'Mention au diplôme', 'Lisez une note sur 20 et affichez :

- **Note invalide** si la note n''est pas entre 0 et 20 ;
- **Excellent** si note ≥ 18 ;
- **Très bien** si note ≥ 16 ;
- **Bien** si note ≥ 14 ;
- **Assez bien** si note ≥ 12 ;
- **Passable** si note ≥ 10 ;
- **Ajourné** sinon.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"15","output":"Bien"}]'::jsonb, '{}'::text[], '', array['Commencez par traiter le cas invalide.', 'Testez les mentions de la plus haute à la plus basse avec SINON SI.']::text[], 10, false, 'publie', 7)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '15', 'Bien', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '9.5', 'Ajourné', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '18', 'Excellent', false, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '21', 'Note invalide', true, 1, 3);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '12', 'Assez bien', true, 1, 4);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-mention'), null, '10', 'Passable', true, 1, 5);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-mention'), 'ALGORITHME Mention
VARIABLES
  note : REEL
DEBUT
  LIRE(note)
  SI note < 0 OU note > 20 ALORS
    ECRIRE("Note invalide")
  SINON SI note >= 18 ALORS
    ECRIRE("Excellent")
  SINON SI note >= 16 ALORS
    ECRIRE("Très bien")
  SINON SI note >= 14 ALORS
    ECRIRE("Bien")
  SINON SI note >= 12 ALORS
    ECRIRE("Assez bien")
  SINON SI note >= 10 ALORS
    ECRIRE("Passable")
  SINON
    ECRIRE("Ajourné")
  FINSI
FIN', 'Les tests sont effectués **dans l''ordre**. En partant de la mention la plus haute, chaque SINON SI n''a besoin que d''une seule comparaison : si l''on arrive à « note >= 14 », on sait déjà que note < 16.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-annee-bissextile', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'conditions-imbriquees'), 'pseudocode', 'Année bissextile', 'Une année est **bissextile** si elle est divisible par 4 mais pas par 100, **ou** si elle est divisible par 400.

Lisez une année et affichez **bissextile** ou **non bissextile**.', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"2024","output":"bissextile"},{"input":"1900","output":"non bissextile"}]'::jsonb, '{}'::text[], '', array['« divisible par 4 » se teste avec annee MOD 4 = 0.', 'La condition complète combine ET, OU et NON… ou des SI imbriqués.', '(annee MOD 4 = 0 ET annee MOD 100 <> 0) OU annee MOD 400 = 0']::text[], 10, false, 'publie', 8)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-annee-bissextile');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2024', 'bissextile', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '1900', 'non bissextile', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2000', 'bissextile', false, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2023', 'non bissextile', true, 1, 3);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2400', 'bissextile', true, 1, 4);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-table-multiplication', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'pseudocode', 'Table de multiplication', 'Lisez un entier n et affichez sa table de multiplication de 1 à 10, au format :

~~~text
n x 1 = …
…
n x 10 = …
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n3 x 2 = 6\n…\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['Le nombre de lignes est connu : 10. Quelle boucle choisir ?', 'ECRIRE(n, " x ", i, " = ", n * i)']::text[], 10, false, 'publie', 9)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-table-multiplication');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-table-multiplication'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-table-multiplication'), null, '12', '12 x 1 = 12
12 x 2 = 24
12 x 3 = 36
12 x 4 = 48
12 x 5 = 60
12 x 6 = 72
12 x 7 = 84
12 x 8 = 96
12 x 9 = 108
12 x 10 = 120', true, 1, 1);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-somme-n-premiers', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'pseudocode', 'Somme des n premiers entiers', 'Lisez un entier n ≥ 0 et affichez la somme 1 + 2 + … + n (0 si n = 0).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"10","output":"55"}]'::jsonb, '{}'::text[], '', array['Utilisez un accumulateur initialisé à 0.', 'Une boucle POUR de 1 à n ajoute i à la somme.']::text[], 10, false, 'publie', 10)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-n-premiers');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '10', '55', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '0', '0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-n-premiers'), null, '100', '5050', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-compter-positifs', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'compteurs-accumulateurs'), 'pseudocode', 'Compter les nombres positifs', 'Lisez des entiers jusqu''à la valeur sentinelle **0** (non comptée). Affichez :

~~~text
Positifs : <nombre de valeurs strictement positives>
Négatifs : <nombre de valeurs strictement négatives>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n-2\n8\n-1\n3\n0","output":"Positifs : 3\nNégatifs : 2"}]'::jsonb, '{}'::text[], '', array['Le nombre de valeurs n''est pas connu : utilisez TANT QUE.', 'Lisez une première valeur avant la boucle, puis relisez à la fin du corps de boucle.']::text[], 10, false, 'publie', 11)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-compter-positifs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '5
-2
8
-1
3
0', 'Positifs : 3
Négatifs : 2', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '0', 'Positifs : 0
Négatifs : 0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-positifs'), null, '-4
-4
-4
0', 'Positifs : 0
Négatifs : 3', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-factorielle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'compteurs-accumulateurs'), 'pseudocode', 'Factorielle', 'Lisez un entier n (0 ≤ n ≤ 15) et affichez n! = 1 × 2 × … × n (avec 0! = 1).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"5","output":"120"}]'::jsonb, '{}'::text[], '', array['C''est un accumulateur de produit : à quelle valeur l''initialiser ?', 'Un produit s''initialise à 1, pas à 0.']::text[], 10, false, 'publie', 12)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-factorielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-factorielle'), null, '5', '120', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-factorielle'), null, '0', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-factorielle'), null, '10', '3628800', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-inverser-tableau', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'pseudocode', 'Afficher un tableau à l''envers', 'Lisez un entier n (1 ≤ n ≤ 100), puis n entiers que vous rangez dans un tableau. Affichez-les dans l''ordre inverse, **un par ligne**.', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"3\n10\n20\n30","output":"30\n20\n10"}]'::jsonb, '{}'::text[], '', array['Déclarez un tableau de 100 cases.', 'Une boucle POUR avec PAS -1 parcourt de n à 1.']::text[], 10, false, 'publie', 13)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-inverser-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '3
10
20
30', '30
20
10', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '1
42', '42', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-inverser-tableau'), null, '5
1
2
3
4
5', '5
4
3
2
1', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-maximum-tableau', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'pseudocode', 'Maximum et sa position', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Affichez la plus grande valeur et la position de sa **première** apparition :

~~~text
Maximum : <valeur> en position <indice>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n4\n9\n2\n9\n1","output":"Maximum : 9 en position 2"}]'::jsonb, '{}'::text[], '', array['Initialisez le maximum avec la première case.', 'Gardez aussi en mémoire l''indice du maximum.', 'Comparez avec > (strictement) pour conserver la première position.']::text[], 10, false, 'publie', 14)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-maximum-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '5
4
9
2
9
1', 'Maximum : 9 en position 2', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '1
-7', 'Maximum : -7 en position 1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-maximum-tableau'), null, '4
-5
-2
-9
-2', 'Maximum : -2 en position 2', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-compter-voyelles', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'chaines-caracteres'), 'pseudocode', 'Compter les voyelles', 'Lisez une phrase et affichez le nombre de voyelles qu''elle contient (a, e, i, o, u, y, en majuscules ou minuscules, sans accents).', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"Bonjour UPL","output":"4"}]'::jsonb, '{}'::text[], '', array['Parcourez la chaîne avec POUR i DE 1 A LONGUEUR(phrase).', 'MINUSCULE(phrase) évite de tester les majuscules.', 'Une condition avec plusieurs OU teste chaque voyelle.']::text[], 10, false, 'publie', 15)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-compter-voyelles');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'Bonjour UPL', '4', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'rythme', '2', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'AEIOUY aeiouy', '12', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-compter-voyelles'), null, 'xyz', '1', true, 1, 3);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
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
FIN', array['x^n = x × x × … × x (n fois).', 'Initialisez r à 1, multipliez-le n fois par x, puis RETOURNER r.']::text[], 10, false, 'publie', 16)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-fonction-puissance');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '2
10', '1024', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '5
0', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-fonction-puissance'), null, '-3
3', '-27', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-somme-chiffres-recursive', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recursivite'), 'pseudocode', 'Somme des chiffres (récursive)', 'Écrivez une fonction **récursive** sommeChiffres(n : ENTIER) : ENTIER qui retourne la somme des chiffres d''un entier n ≥ 0. Le programme lit n et affiche le résultat.', 'avance', 'ecrire_algorithme', '{}'::text[], '[{"input":"4096","output":"19"}]'::jsonb, array['La fonction doit être récursive (pas de boucle).']::text[], '', array['Le dernier chiffre de n est n MOD 10 ; le reste du nombre est n DIV 10.', 'Cas de base : si n < 10, la somme des chiffres est n lui-même.', 'Cas récursif : (n MOD 10) + sommeChiffres(n DIV 10).']::text[], 10, true, 'publie', 17)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-chiffres-recursive');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '4096', '19', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '7', '7', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '0', '0', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-somme-chiffres-recursive'), null, '999999', '54', true, 1, 3);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-recherche-sequentielle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'pseudocode', 'Recherche séquentielle', 'Lisez n (1 ≤ n ≤ 100), puis n entiers, puis une valeur x. Affichez la position de la **première** occurrence de x, ou **absent** si x n''est pas dans le tableau.', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"4\n7\n3\n9\n3\n3","output":"2"}]'::jsonb, '{}'::text[], '', array['Parcourez le tableau tant que vous n''avez pas trouvé et que vous n''êtes pas à la fin.', 'Une boucle TANT QUE avec deux conditions combinées par ET convient bien.']::text[], 10, false, 'publie', 18)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-recherche-sequentielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '4
7
3
9
3
3', '2', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '3
1
2
3
5', 'absent', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-recherche-sequentielle'), null, '1
8
8', '1', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-tri-bulles', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'pseudocode', 'Tri à bulles', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Triez-les par ordre croissant avec le **tri à bulles** et affichez-les sur une seule ligne, séparés par un espace.', 'avance', 'ecrire_algorithme', '{}'::text[], '[{"input":"5\n5\n1\n4\n2\n8","output":"1 2 4 5 8"}]'::jsonb, '{}'::text[], '', array['Comparez chaque paire de voisins T[j] et T[j + 1] ; échangez-les s''ils sont mal ordonnés.', 'Après le passage numéro i, les i plus grands éléments sont à leur place.', 'Construisez la ligne de sortie avec une chaîne : ligne ← ligne + CHAINE(T[i]).']::text[], 10, true, 'publie', 19)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-tri-bulles');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '5
5
1
4
2
8', '1 2 4 5 8', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '1
3', '3', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-tri-bulles'), null, '6
3
3
-1
0
10
-5', '-5 -1 0 3 3 10', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-nombres-premiers', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'resolution-problemes'), 'pseudocode', 'Nombres premiers', 'Lisez un entier n ≥ 2 et affichez tous les nombres premiers inférieurs ou égaux à n, séparés par un espace, sur une seule ligne.

Un nombre est premier s''il a exactement deux diviseurs : 1 et lui-même.', 'avance', 'probleme', '{}'::text[], '[{"input":"20","output":"2 3 5 7 11 13 17 19"}]'::jsonb, '{}'::text[], '', array['Écrivez d''abord une fonction estPremier(k : ENTIER) : BOOLEEN.', 'Il suffit de tester les diviseurs d de 2 tant que d * d <= k.', 'Construisez la ligne de résultat avec une chaîne.']::text[], 10, false, 'publie', 20)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-nombres-premiers');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '20', '2 3 5 7 11 13 17 19', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '2', '2', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-nombres-premiers'), null, '50', '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('algo-projet-caisse', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'resolution-problemes'), 'pseudocode', 'Mini-projet : caisse de la cafétéria', 'La cafétéria de l''université veut un programme de caisse.

**Entrées** : une suite de lignes, chacune contenant un prix unitaire (réel) puis, sur la ligne suivante, une quantité (entier). La saisie se termine par un prix égal à **0**.

**Sorties** :

~~~text
Articles : <quantité totale>
Total : <montant total>
Remise : <montant de la remise>
A payer : <montant final>
~~~

Une remise de **10 %** est accordée si le total dépasse **strictement 50**.', 'avance', 'mini_projet', '{}'::text[], '[{"input":"2.5\n4\n30\n1\n0","output":"Articles : 5\nTotal : 40\nRemise : 0\nA payer : 40"}]'::jsonb, '{}'::text[], '', array['Utilisez une valeur sentinelle (prix = 0) avec TANT QUE.', 'Deux accumulateurs : la quantité totale et le montant total.', 'Calculez la remise après la boucle, avec un SI.']::text[], 30, true, 'publie', 21)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-caisse');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '2.5
4
30
1
0', 'Articles : 5
Total : 40
Remise : 0
A payer : 40', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '20
3
0', 'Articles : 3
Total : 60
Remise : 6
A payer : 54', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '0', 'Articles : 0
Total : 0
Remise : 0
A payer : 0', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '50
1
0', 'Articles : 1
Total : 50
Remise : 0
A payer : 50', true, 1, 3);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-bonjour', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'syntaxe-fondamentale'), 'python', 'Bonjour en Python', 'Lisez un prénom et affichez :

~~~text
Bonjour <prénom>, bienvenue en Python !
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Amani","output":"Bonjour Amani, bienvenue en Python !"}]'::jsonb, '{}'::text[], 'prenom = input()
# Affichez le message', array['Utilisez print avec une f-string.', 'print(f"Bonjour {prenom}, …")']::text[], 5, false, 'publie', 22)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-bonjour'), null, 'Amani', 'Bonjour Amani, bienvenue en Python !', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-bonjour'), null, 'Grâce', 'Bonjour Grâce, bienvenue en Python !', true, 1, 1);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-bonjour'), 'prenom = input()
print(f"Bonjour {prenom}, bienvenue en Python !")', 'Une f-string insère la valeur de la variable entre accolades. Attention à la virgule et à l''espace avant le point d''exclamation.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-somme', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'variables-types'), 'python', 'Somme et produit', 'Lisez deux entiers (un par ligne) et affichez leur somme puis leur produit :

~~~text
Somme : <a + b>
Produit : <a * b>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4\n5","output":"Somme : 9\nProduit : 20"}]'::jsonb, '{}'::text[], '', array['input() renvoie une chaîne : convertissez avec int().', 'Sans conversion, "4" + "5" donne "45" !']::text[], 5, false, 'publie', 23)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-somme'), null, '4
5', 'Somme : 9
Produit : 20', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-somme'), null, '-3
7', 'Somme : 4
Produit : -21', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-somme'), null, '0
123', 'Somme : 123
Produit : 0', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-somme'), 'a = int(input())
b = int(input())
print("Somme :", a + b)
print("Produit :", a * b)', 'L''erreur classique est d''oublier **int()** : les chaînes seraient concaténées au lieu d''être additionnées. print sépare ses arguments par un espace.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-conversion-temps', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'operateurs'), 'python', 'Conversion de secondes', 'Lisez un nombre de secondes et affichez-le au format **HH:MM:SS** (avec deux chiffres pour chaque partie).', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3725","output":"01:02:05"}]'::jsonb, '{}'::text[], '', array['// donne le quotient, % le reste.', 'f"{h:02d}" affiche un entier sur deux chiffres.']::text[], 10, false, 'publie', 24)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-conversion-temps');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '3725', '01:02:05', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '59', '00:00:59', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-conversion-temps'), null, '86399', '23:59:59', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-conversion-temps'), 'total = int(input())
h = total // 3600
m = total % 3600 // 60
s = total % 60
print(f"{h:02d}:{m:02d}:{s:02d}")', 'Le format **:02d** complète avec un zéro à gauche pour obtenir deux chiffres.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-pair-impair', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'python', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"10","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 vaut 0 pour un nombre pair.']::text[], 5, false, 'publie', 25)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pair-impair'), null, '10', 'pair', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pair-impair'), null, '7', 'impair', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pair-impair'), null, '-3', 'impair', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pair-impair'), null, '0', 'pair', true, 1, 3);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-pair-impair'), 'n = int(input())
if n % 2 == 0:
    print("pair")
else:
    print("impair")', 'On teste le reste de la division par 2 avec l''opérateur **%** et la comparaison **==** (deux signes égal).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-mention', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'python', 'Mention', 'Lisez une note (réel) et affichez **Note invalide** (hors de 0–20), **Très bien** (≥ 16), **Bien** (≥ 14), **Passable** (≥ 10) ou **Ajourné**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"14.5","output":"Bien"}]'::jsonb, '{}'::text[], '', array['Utilisez if / elif / else.', 'Python permet d''écrire 0 <= note <= 20.']::text[], 10, false, 'publie', 26)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-mention'), null, '14.5', 'Bien', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-mention'), null, '20', 'Très bien', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-mention'), null, '9.99', 'Ajourné', false, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-mention'), null, '-1', 'Note invalide', true, 1, 3);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-mention'), null, '10', 'Passable', true, 1, 4);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-table', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'python', 'Table de multiplication', 'Lisez un entier n et affichez sa table de 1 à 10 au format **n x i = résultat**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n…\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['range(1, 11) produit les nombres de 1 à 10.']::text[], 10, false, 'publie', 27)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-table'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-table'), null, '9', '9 x 1 = 9
9 x 2 = 18
9 x 3 = 27
9 x 4 = 36
9 x 5 = 45
9 x 6 = 54
9 x 7 = 63
9 x 8 = 72
9 x 9 = 81
9 x 10 = 90', true, 1, 1);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-table'), 'n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")', 'range(1, 11) s''arrête **avant** 11 : la boucle s''exécute pour i = 1 à 10.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-factorielle', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'python', 'Factorielle', 'Lisez un entier n ≥ 0 et affichez n!. Python gère les grands entiers : testez avec n = 30 !', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"5","output":"120"}]'::jsonb, '{}'::text[], '', array['Initialisez le produit à 1.', 'for i in range(2, n + 1): …']::text[], 10, false, 'publie', 28)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-factorielle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-factorielle'), null, '5', '120', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-factorielle'), null, '0', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-factorielle'), null, '30', '265252859812191058636308480000000', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-factorielle'), 'n = int(input())
f = 1
for i in range(2, n + 1):
    f *= i
print(f)', 'Les entiers Python ont une précision illimitée, contrairement au C ou au Java où l''on aurait un dépassement de capacité pour 30!.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-maximum-liste', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'python', 'Maximum sans max()', 'Lisez une ligne d''entiers séparés par des espaces et affichez le plus grand **sans utiliser max()** ni **sorted()**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"4 9 -2 7","output":"9"}]'::jsonb, array['Interdiction d''utiliser max(), sorted() ou sort().']::text[], '', array['valeurs = list(map(int, input().split()))', 'Initialisez le maximum avec le premier élément, pas avec 0.']::text[], 10, false, 'publie', 29)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-maximum-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '4 9 -2 7', '9', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '-5 -1 -8', '-1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-maximum-liste'), null, '42', '42', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-maximum-liste'), 'valeurs = list(map(int, input().split()))
plus_grand = valeurs[0]
for v in valeurs[1:]:
    if v > plus_grand:
        plus_grand = v
print(plus_grand)', 'Initialiser à 0 serait faux pour une liste de nombres tous négatifs : on part du premier élément.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-inverser-liste', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'python', 'Inverser une liste', 'Lisez une ligne de mots séparés par des espaces et affichez-les dans l''ordre inverse, séparés par un espace.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"le code est beau","output":"beau est code le"}]'::jsonb, '{}'::text[], '', array['input().split() découpe la ligne en liste.', 'Une tranche avec un pas négatif [::-1] inverse une liste.', '" ".join(liste) recolle les mots.']::text[], 10, false, 'publie', 30)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-inverser-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'le code est beau', 'beau est code le', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'UPL', 'UPL', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-inverser-liste'), null, 'a b c d e', 'e d c b a', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-inverser-liste'), 'mots = input().split()
print(" ".join(mots[::-1]))', '**[::-1]** parcourt la liste avec un pas de -1 ; **join** assemble les éléments avec le séparateur choisi.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-frequences', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'dictionnaires-ensembles'), 'python', 'Fréquence des lettres', 'Lisez un mot (en minuscules) et affichez chaque lettre distincte avec son nombre d''occurrences, **dans l''ordre alphabétique**, au format **lettre:nombre**, une par ligne.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"banane","output":"a:2\nb:1\ne:1\nn:2"}]'::jsonb, '{}'::text[], '', array['Un dictionnaire associe chaque lettre à un compteur.', 'compte[c] = compte.get(c, 0) + 1', 'sorted(compte) donne les clés triées.']::text[], 10, false, 'publie', 31)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-frequences');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-frequences'), null, 'banane', 'a:2
b:1
e:1
n:2', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-frequences'), null, 'aaa', 'a:3', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-frequences'), null, 'programmation', 'a:2
g:1
i:1
m:2
n:1
o:2
p:1
r:2
t:1', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-frequences'), 'mot = input().strip()
compte = {}
for c in mot:
    compte[c] = compte.get(c, 0) + 1
for c in sorted(compte):
    print(f"{c}:{compte[c]}")', 'Le dictionnaire évite d''écrire 26 compteurs. **get(c, 0)** renvoie 0 pour une lettre pas encore rencontrée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-fonction-premier', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'python', 'Fonction est_premier', 'Écrivez une fonction **est_premier(n)** qui retourne True si n est premier. Le programme lit un entier n et affiche le nombre de nombres premiers inférieurs ou égaux à n.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"20","output":"8"}]'::jsonb, '{}'::text[], 'def est_premier(n):
    # À compléter
    pass

n = int(input())
print(sum(1 for k in range(2, n + 1) if est_premier(k)))', array['0 et 1 ne sont pas premiers.', 'Testez les diviseurs d tant que d * d <= n.']::text[], 10, false, 'publie', 32)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-fonction-premier');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '20', '8', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '1', '0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-fonction-premier'), null, '1000', '168', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-pgcd', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'python', 'PGCD d''Euclide (récursif)', 'Écrivez une fonction **récursive pgcd(a, b)** utilisant l''algorithme d''Euclide : pgcd(a, 0) = a et pgcd(a, b) = pgcd(b, a % b). Lisez deux entiers positifs et affichez leur PGCD.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"48\n18","output":"6"}]'::jsonb, array['Ne pas utiliser math.gcd.']::text[], '', array['Cas de base : b == 0.', 'Cas récursif : return pgcd(b, a % b).']::text[], 10, true, 'publie', 33)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-pgcd');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pgcd'), null, '48
18', '6', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pgcd'), null, '17
5', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-pgcd'), null, '1071
462', '21', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-pgcd'), 'def pgcd(a, b):
    if b == 0:
        return a
    return pgcd(b, a % b)

a = int(input())
b = int(input())
print(pgcd(a, b))', 'À chaque appel, le second argument diminue strictement (a % b < b) : on atteint forcément le cas de base b = 0.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-division-securisee', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'exceptions'), 'python', 'Division sécurisée', 'Lisez deux valeurs a et b (une par ligne) et affichez a / b arrondi à 2 décimales. Gérez les erreurs :

- si une valeur n''est pas un nombre : **Erreur : valeur invalide**
- si b vaut 0 : **Erreur : division par zéro**', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"7\n2","output":"3.5"}]'::jsonb, '{}'::text[], '', array['float() lève ValueError si la conversion échoue.', 'Utilisez plusieurs blocs except.', 'round(x, 2) arrondit.']::text[], 10, false, 'publie', 34)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-division-securisee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-division-securisee'), null, '7
2', '3.5', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-division-securisee'), null, '1
0', 'Erreur : division par zéro', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-division-securisee'), null, 'abc
2', 'Erreur : valeur invalide', false, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-division-securisee'), null, '10
3', '3.33', true, 1, 3);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'py-division-securisee'), 'try:
    a = float(input())
    b = float(input())
    print(round(a / b, 2))
except ValueError:
    print("Erreur : valeur invalide")
except ZeroDivisionError:
    print("Erreur : division par zéro")', 'Chaque type d''erreur a son propre **except**. On intercepte des exceptions précises plutôt qu''un except général.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
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
print("Carré :", r.est_carre())', array['Stockez les dimensions dans self.largeur et self.hauteur.', 'Chaque méthode reçoit self en premier paramètre.']::text[], 10, false, 'publie', 35)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-classe-rectangle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-classe-rectangle'), null, '4
5', 'Aire : 20
Périmètre : 18
Carré : False', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-classe-rectangle'), null, '3
3', 'Aire : 9
Périmètre : 12
Carré : True', true, 1, 1);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-parentheses', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-de-donnees'), 'python', 'Parenthèses équilibrées', 'Lisez une expression et affichez **OK** si les parenthèses (), crochets [] et accolades {} sont correctement équilibrés et imbriqués, **ERREUR** sinon.', 'avance', 'probleme', '{}'::text[], '[{"input":"{[(a+b)*c]}","output":"OK"},{"input":"(a]","output":"ERREUR"}]'::jsonb, '{}'::text[], '', array['Utilisez une pile : empilez chaque symbole ouvrant.', 'À chaque fermant, le sommet de la pile doit être l''ouvrant correspondant.', 'À la fin, la pile doit être vide.']::text[], 10, true, 'publie', 36)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-parentheses');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-parentheses'), null, '{[(a+b)*c]}', 'OK', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-parentheses'), null, '(a]', 'ERREUR', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-parentheses'), null, '((x)', 'ERREUR', false, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-parentheses'), null, 'x)(', 'ERREUR', true, 1, 3);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-parentheses'), null, 'sans symbole', 'OK', true, 1, 4);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-tri-insertion', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'recherche-tri'), 'python', 'Tri par insertion', 'Lisez une ligne d''entiers et affichez-les triés par ordre croissant en programmant le **tri par insertion** (sans sorted() ni sort()).', 'avance', 'ecrire_programme', '{}'::text[], '[{"input":"5 2 9 1 5 6","output":"1 2 5 5 6 9"}]'::jsonb, array['Interdiction d''utiliser sorted() et sort().']::text[], '', array['Pour chaque indice i à partir de 1, mémorisez cle = L[i].', 'Décalez vers la droite les éléments plus grands que cle situés avant i.', 'Placez cle dans la case libérée.']::text[], 10, true, 'publie', 37)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-tri-insertion');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '5 2 9 1 5 6', '1 2 5 5 6 9', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '1', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-tri-insertion'), null, '3 -1 0 -7 8', '-7 -1 0 3 8', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-dichotomie', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'recherche-tri'), 'python', 'Recherche dichotomique', 'La première ligne contient des entiers **triés** ; la seconde une valeur x. Affichez l''indice (à partir de 0) de x dans la liste, ou **-1** s''il est absent. Utilisez une recherche **dichotomique**.', 'avance', 'ecrire_programme', '{}'::text[], '[{"input":"1 3 5 7 9 11\n7","output":"3"}]'::jsonb, '{}'::text[], '', array['Gardez deux bornes debut et fin.', 'milieu = (debut + fin) // 2']::text[], 10, false, 'publie', 38)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-dichotomie');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-dichotomie'), null, '1 3 5 7 9 11
7', '3', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-dichotomie'), null, '1 3 5 7 9 11
4', '-1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-dichotomie'), null, '2
2', '0', true, 1, 2);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-dichotomie'), null, '10 20 30 40 50 60 70 80
80', '7', true, 1, 3);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('py-statistiques', (select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'science-donnees-ia'), 'python', 'Statistiques descriptives', 'Lisez une ligne de notes (réels) et affichez, arrondis à 2 décimales :

~~~text
Moyenne : …
Médiane : …
Écart type : …
~~~

L''écart type est la racine de la moyenne des carrés des écarts à la moyenne (écart type de population). Programmez les calculs vous-même, sans le module statistics.', 'avance', 'mini_projet', '{}'::text[], '[{"input":"10 12 14 16","output":"Moyenne : 13.0\nMédiane : 13.0\nÉcart type : 2.24"}]'::jsonb, '{}'::text[], '', array['La médiane d''une liste triée de taille paire est la moyenne des deux valeurs centrales.', 'variance = sum((x - moyenne) ** 2 for x in notes) / n', 'round(valeur, 2)']::text[], 25, false, 'publie', 39)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'py-statistiques');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-statistiques'), null, '10 12 14 16', 'Moyenne : 13.0
Médiane : 13.0
Écart type : 2.24', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-statistiques'), null, '5 18 9', 'Moyenne : 10.67
Médiane : 9.0
Écart type : 5.44', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'py-statistiques'), null, '12', 'Moyenne : 12.0
Médiane : 12.0
Écart type : 0.0', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-bonjour', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'structure-programme'), 'c', 'Bonjour en C', 'Affichez exactement **Bonjour UPL** suivi d''un retour à la ligne.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], '#include <stdio.h>

int main(void) {
    // Votre code ici
    return 0;
}', array['printf affiche du texte.', '\n passe à la ligne : printf("Bonjour UPL\n");']::text[], 5, false, 'publie', 40)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-bonjour'), null, '', 'Bonjour UPL', false, 1, 0);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-bonjour'), '#include <stdio.h>

int main(void) {
    printf("Bonjour UPL\n");
    return 0;
}', 'Une seule instruction printf ; n''oubliez pas le point-virgule ni le \n final.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-somme', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'entrees-sorties'), 'c', 'Somme et moyenne', 'Lisez deux entiers et affichez :

~~~text
Somme : <a + b>
Moyenne : <moyenne avec 1 décimale>
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"7 8","output":"Somme : 15\nMoyenne : 7.5"}]'::jsonb, '{}'::text[], '', array['scanf("%d %d", &a, &b);', 'Divisez par 2.0 pour obtenir un réel.', '%.1f affiche une décimale.']::text[], 10, false, 'publie', 41)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-somme'), null, '7 8', 'Somme : 15
Moyenne : 7.5', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-somme'), null, '10 10', 'Somme : 20
Moyenne : 10.0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-somme'), null, '-3 4', 'Somme : 1
Moyenne : 0.5', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-somme'), '#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Somme : %d\n", a + b);
    printf("Moyenne : %.1f\n", (a + b) / 2.0);
    return 0;
}', '(a + b) / 2 serait une division entière (7 au lieu de 7.5) : on divise par **2.0**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-pair-impair', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'conditions'), 'c', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"8","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 == 0 pour un nombre pair.']::text[], 5, false, 'publie', 42)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-pair-impair'), null, '8', 'pair', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-pair-impair'), null, '13', 'impair', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-pair-impair'), null, '-7', 'impair', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'c-pair-impair'), '#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) printf("pair\n");
    else printf("impair\n");
    return 0;
}', 'En C, -7 % 2 vaut -1 : tester == 0 fonctionne pour tous les signes.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-table', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'boucles'), 'c', 'Table de multiplication', 'Lisez n et affichez sa table de 1 à 10 au format **n x i = résultat**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4","output":"4 x 1 = 4\n…\n4 x 10 = 40"}]'::jsonb, '{}'::text[], '', array['for (int i = 1; i <= 10; i++)']::text[], 10, false, 'publie', 43)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-table'), null, '4', '4 x 1 = 4
4 x 2 = 8
4 x 3 = 12
4 x 4 = 16
4 x 5 = 20
4 x 6 = 24
4 x 7 = 28
4 x 8 = 32
4 x 9 = 36
4 x 10 = 40', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-table'), null, '11', '11 x 1 = 11
11 x 2 = 22
11 x 3 = 33
11 x 4 = 44
11 x 5 = 55
11 x 6 = 66
11 x 7 = 77
11 x 8 = 88
11 x 9 = 99
11 x 10 = 110', true, 1, 1);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-puissance', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'fonctions'), 'c', 'Fonction puissance', 'Écrivez une fonction **long long puissance(int x, int n)** (boucle, sans pow). Lisez x et n (n ≥ 0) et affichez x^n.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"2 20","output":"1048576"}]'::jsonb, array['Ne pas utiliser pow() de math.h.']::text[], '', array['Initialisez le résultat à 1.', 'Utilisez %lld pour afficher un long long.']::text[], 10, false, 'publie', 44)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-puissance');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-puissance'), null, '2 20', '1048576', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-puissance'), null, '7 0', '1', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-puissance'), null, '3 30', '205891132094649', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('c-inverser-tableau', (select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'tableaux'), 'c', 'Inverser un tableau', 'Lisez n (1 ≤ n ≤ 100) puis n entiers. Inversez le tableau **sur place** (en échangeant les éléments) puis affichez-le sur une ligne, séparé par des espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"5\n1 2 3 4 5","output":"5 4 3 2 1"}]'::jsonb, '{}'::text[], '', array['Échangez t[i] et t[n - 1 - i] pour i allant de 0 à n/2 - 1.', 'Attention à l''espace final : affichez l''espace avant chaque élément sauf le premier.']::text[], 10, false, 'publie', 45)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-inverser-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '5
1 2 3 4 5', '5 4 3 2 1', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '1
9', '9', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-inverser-tableau'), null, '4
10 -2 7 0', '0 7 -2 10', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
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
}', array['*a désigne la valeur pointée par a.', 'Utilisez une variable temporaire int t = *a;']::text[], 10, true, 'publie', 46)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'c-echange-pointeurs');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '3 9', '9 3', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '0 0', '0 0', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'c-echange-pointeurs'), null, '-5 12', '12 -5', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('js-bonjour', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'introduction'), 'javascript', 'Bonjour en JavaScript', 'Lisez un prénom avec **lireLigne()** et affichez **Bonjour <prénom> !**', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"Amani","output":"Bonjour Amani !"}]'::jsonb, '{}'::text[], 'const prenom = lireLigne();
// Affichez le message', array['console.log affiche une valeur.', 'Concaténez avec + : "Bonjour " + prenom + " !"']::text[], 5, false, 'publie', 47)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-bonjour'), null, 'Amani', 'Bonjour Amani !', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-bonjour'), null, 'Josué', 'Bonjour Josué !', true, 1, 1);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-bonjour'), 'const prenom = lireLigne();
console.log("Bonjour " + prenom + " !");', 'lireLigne() renvoie la ligne suivante de l''entrée ; console.log l''affiche après concaténation.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('js-fizzbuzz', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'boucles'), 'javascript', 'FizzBuzz', 'Lisez n et affichez les nombres de 1 à n, un par ligne, en remplaçant :

- les multiples de 3 par **Fizz** ;
- les multiples de 5 par **Buzz** ;
- les multiples de 3 et de 5 par **FizzBuzz**.', 'debutant', 'probleme', '{}'::text[], '[{"input":"5","output":"1\n2\nFizz\n4\nBuzz"}]'::jsonb, '{}'::text[], '', array['Testez d''abord le cas « multiple de 15 ».', 'i % 3 === 0 teste un multiple de 3.']::text[], 10, false, 'publie', 48)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-fizzbuzz');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-fizzbuzz'), null, '5', '1
2
Fizz
4
Buzz', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-fizzbuzz'), null, '15', '1
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
FizzBuzz', true, 1, 1);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-fizzbuzz'), 'const n = Number(lireLigne());
for (let i = 1; i <= n; i++) {
  if (i % 15 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}', 'L''ordre des tests est essentiel : si l''on teste « multiple de 3 » en premier, 15 afficherait Fizz.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('js-somme-tableau', (select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'tableaux-objets'), 'javascript', 'Statistiques avec reduce', 'Lisez une ligne de nombres séparés par des espaces et affichez :

~~~text
Somme : …
Pairs : … (les nombres pairs, séparés par une virgule et un espace)
~~~', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"3 8 5 12 7","output":"Somme : 35\nPairs : 8, 12"}]'::jsonb, '{}'::text[], '', array['lireLigne().split(" ").map(Number)', 'reduce((s, x) => s + x, 0)', 'filter puis join(", ")']::text[], 10, false, 'publie', 49)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'js-somme-tableau');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '3 8 5 12 7', 'Somme : 35
Pairs : 8, 12', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '2 4', 'Somme : 6
Pairs : 2, 4', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'js-somme-tableau'), null, '1 3 5', 'Somme : 9
Pairs : ', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'js-somme-tableau'), 'const nombres = lireLigne().trim().split(/\s+/).map(Number);
const somme = nombres.reduce((s, x) => s + x, 0);
const pairs = nombres.filter((x) => x % 2 === 0);
console.log("Somme : " + somme);
console.log("Pairs : " + pairs.join(", "));', 'map convertit les chaînes en nombres, reduce les additionne, filter sélectionne les pairs et join les assemble.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('java-bonjour', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'presentation'), 'java', 'Bonjour en Java', 'Affichez exactement **Bonjour UPL**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], 'public class Main {
    public static void main(String[] args) {
        // Votre code ici
    }
}', array['System.out.println affiche une ligne.']::text[], 5, false, 'publie', 50)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-bonjour'), null, '', 'Bonjour UPL', false, 1, 0);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-bonjour'), 'public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour UPL");
    }
}', 'System.out.println affiche le texte puis passe à la ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('java-somme', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'variables-types'), 'java', 'Somme de deux entiers', 'Lisez deux entiers avec Scanner et affichez **Somme : <a + b>**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"4 6","output":"Somme : 10"}]'::jsonb, '{}'::text[], '', array['Scanner sc = new Scanner(System.in);', 'Attention : "Somme : " + a + b concatène ! Mettez (a + b) entre parenthèses.']::text[], 10, false, 'publie', 51)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-somme');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-somme'), null, '4 6', 'Somme : 10', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-somme'), null, '-8 3', 'Somme : -5', true, 1, 1);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('java-pair-impair', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'conditions-boucles'), 'java', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"12","output":"pair"}]'::jsonb, '{}'::text[], '', array['n % 2 == 0']::text[], 5, false, 'publie', 52)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-pair-impair'), null, '12', 'pair', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-pair-impair'), null, '5', 'impair', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-pair-impair'), null, '-1', 'impair', true, 1, 2);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'java-pair-impair'), 'import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        System.out.println(n % 2 == 0 ? "pair" : "impair");
    }
}', 'L''opérateur ternaire choisit entre deux valeurs selon la condition.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('java-classe-compte', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'classes-objets'), 'java', 'Classe CompteBancaire', 'Écrivez une classe **CompteBancaire** avec un solde privé, une méthode **deposer(double)**, une méthode **retirer(double)** qui renvoie false si le solde est insuffisant, et **getSolde()**.

Entrée : une suite de lignes « D montant » (dépôt) ou « R montant » (retrait), terminée par « FIN ». Affichez **REFUS** pour chaque retrait impossible (texte sans accent), puis à la fin **Solde : <solde>** avec 2 décimales.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"D 100\nR 30\nR 100\nFIN","output":"REFUS\nSolde : 70.00"}]'::jsonb, '{}'::text[], '', array['Lisez chaque ligne avec sc.next() pour l''opération puis sc.nextDouble() pour le montant.', 'System.out.printf("Solde : %.2f%n", c.getSolde());']::text[], 10, false, 'publie', 53)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-classe-compte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'D 100
R 30
R 100
FIN', 'REFUS
Solde : 70.00', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'FIN', 'Solde : 0.00', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-classe-compte'), null, 'D 50.5
D 49.5
R 100
R 1
FIN', 'REFUS
Solde : 0.00', true, 1, 2);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values ('java-moyenne-liste', (select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'collections'), 'java', 'Moyenne avec ArrayList', 'Lisez des entiers jusqu''à la fin de l''entrée, stockez-les dans une **ArrayList<Integer>** et affichez **Nombre : n** puis **Moyenne : m** (2 décimales, point décimal).', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"12 15 9","output":"Nombre : 3\nMoyenne : 12.00"}]'::jsonb, '{}'::text[], '', array['while (sc.hasNextInt()) liste.add(sc.nextInt());', 'String.format(Locale.US, "%.2f", moyenne)']::text[], 10, false, 'publie', 54)
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'java-moyenne-liste');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '12 15 9', 'Nombre : 3
Moyenne : 12.00', false, 1, 0);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '7', 'Nombre : 1
Moyenne : 7.00', false, 1, 1);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values ((select id from public.exercises where slug = 'java-moyenne-liste'), null, '10 11', 'Nombre : 2
Moyenne : 10.50', true, 1, 2);
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
