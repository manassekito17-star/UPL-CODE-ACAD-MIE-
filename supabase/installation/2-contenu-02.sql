-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 2 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'operateurs', 'Opérateurs et expressions', 'debutant', 110, array['Évaluer des expressions arithmétiques, de comparaison et logiques.', 'Utiliser DIV et MOD pour les problèmes de quotient, de reste et de chiffres.', 'Appliquer les règles de priorité et utiliser les parenthèses.']::text[], array['Chapitre 2 — Logique et raisonnement.', 'Chapitre 5 — Types de données.']::text[], '## 1. Expressions et opérateurs

Une **expression** est une combinaison de valeurs, de variables et d''**opérateurs** qui produit une valeur : 2 * x + 1, (a + b) / 2, note >= 10. Évaluer une expression, c''est calculer cette valeur avec le contenu actuel des variables.

## 2. Opérateurs arithmétiques

| Opérateur | Rôle | Exemple | Résultat | Type du résultat |
|---|---|---|---|---|
| + | addition | 7 + 2 | 9 | entier si les deux le sont |
| - | soustraction | 7 - 2 | 5 | idem |
| * | multiplication | 7 * 2 | 14 | idem |
| / | division réelle | 7 / 2 | 3.5 | toujours REEL |
| DIV | quotient entier | 7 DIV 2 | 3 | ENTIER |
| MOD | reste de la division entière | 7 MOD 2 | 1 | ENTIER |
| ^ | puissance | 2 ^ 3 | 8 | nombre |

La division par zéro (x / 0, x DIV 0, x MOD 0) est une **erreur d''exécution** : il faut l''empêcher par une condition.

## 3. DIV et MOD : des outils fondamentaux

Pour deux entiers a et b (b > 0), on a toujours : **a = b × (a DIV b) + (a MOD b)**, avec 0 ≤ a MOD b < b.

Applications classiques :

- **parité** : n est pair si n MOD 2 = 0 ;
- **divisibilité** : n est un multiple de k si n MOD k = 0 ;
- **chiffres** d''un nombre : le chiffre des unités de n est n MOD 10, et n DIV 10 « efface » ce chiffre ; pour 375 : unités 375 MOD 10 = 5, dizaines (375 DIV 10) MOD 10 = 7, centaines 375 DIV 100 = 3 ;
- **conversions** : 200 secondes = 200 DIV 60 = 3 minutes et 200 MOD 60 = 20 secondes ;
- **cycles** : le jour de la semaine dans k jours est (jour + k) MOD 7.

## 4. Opérateurs de comparaison

=, <> (différent), <, >, <= (≤), >= (≥). Ils s''appliquent aux nombres et aux chaînes (ordre alphabétique) et produisent un **booléen**. On compare des valeurs de même nature : comparer un nombre et un texte est une erreur.

## 5. Opérateurs logiques

ET, OU, NON combinent des booléens (chapitre 2). La plateforme les évalue **en court-circuit** : dans « a ET b », si a est FAUX, b n''est pas évalué (le résultat est déjà connu). C''est utile pour se protéger : (d <> 0) ET (n MOD d = 0) n''évalue jamais n MOD 0.

## 6. Priorités

Du plus prioritaire au moins prioritaire :

1. parenthèses ;
2. ^ (puissance) ;
3. signe moins unaire (−x) ;
4. *, /, DIV, MOD (de gauche à droite) ;
5. +, − (de gauche à droite) ;
6. comparaisons ;
7. NON, puis ET, puis OU.

Exemples : 2 + 3 * 4 vaut 14 ; (2 + 3) * 4 vaut 20 ; 20 - 6 - 2 vaut 12 (et non 16) ; 2 ^ 3 ^ 2 se calcule de droite à gauche : 2 ^ 9 = 512. En cas de doute, **ajoutez des parenthèses** : elles ne coûtent rien et rendent l''algorithme lisible.

## 7. Évaluer une expression pas à pas

Évaluons (a + b) MOD 3 = 0 OU a > 10 avec a = 4, b = 5 :

1. a + b = 9 ;
2. 9 MOD 3 = 0 ;
3. 0 = 0 → VRAI ;
4. VRAI OU … → **VRAI** (a > 10 n''est même pas évalué).

## 8. Type du résultat d''une expression

Le type du résultat dépend des opérandes et de l''opérateur, et il doit être compatible avec la variable qui le reçoit :

| Expression | Résultat | Type |
|---|---|---|
| 7 + 2 | 9 | ENTIER |
| 7 + 2.5 | 9.5 | REEL (un réel « contamine » le calcul) |
| 9 / 3 | 3 | REEL, même si la valeur est « ronde » |
| 9 DIV 3 | 3 | ENTIER |
| "a" + "b" | "ab" | CHAINE |
| 3 < 5 | VRAI | BOOLEEN |

Retenez surtout que **/ produit toujours un réel** : c''est la source de l''erreur « type incompatible » la plus fréquente chez les débutants. Si le résultat doit être entier, utilisez DIV, ou convertissez explicitement avec ENTIER ou ARRONDI.', array['/ donne toujours un réel ; DIV donne le quotient entier, MOD le reste.', 'a = b × (a DIV b) + (a MOD b) : base des problèmes de chiffres, de parité et de conversion.', 'Les comparaisons produisent des booléens ; ET, OU, NON les combinent (évaluation en court-circuit).', 'Priorités : parenthèses, ^, *, / DIV MOD, + −, comparaisons, NON, ET, OU.', 'La division par zéro est une erreur d''exécution à prévenir.']::text[], '[{"language":"pseudocode","title":"Quotient et reste","code":"ALGORITHME Conversion\nVARIABLES\n  secondes, minutes, reste : ENTIER\nDEBUT\n  LIRE(secondes)\n  minutes ← secondes DIV 60\n  reste ← secondes MOD 60\n  ECRIRE(secondes, \" s = \", minutes, \" min \", reste, \" s\")\nFIN","stdin":"200"},{"language":"pseudocode","title":"Priorités","code":"ECRIRE(2 + 3 * 4)\nECRIRE((2 + 3) * 4)\nECRIRE(20 - 6 - 2)\nECRIRE(17 DIV 5, \" \", 17 MOD 5, \" \", 17 / 5)\nECRIRE(2 ^ 10)"}]'::jsonb, '{"competences":["Évaluer une expression en respectant les priorités","Utiliser DIV et MOD","Extraire les chiffres d''un nombre","Prévenir la division par zéro"],"definitions":[{"term":"Expression","definition":"Combinaison de valeurs, de variables et d''opérateurs qui produit une valeur."},{"term":"DIV","definition":"Quotient de la division entière : 17 DIV 5 = 3."},{"term":"MOD","definition":"Reste de la division entière : 17 MOD 5 = 2. Pour b > 0, 0 ≤ a MOD b < b."},{"term":"Priorité","definition":"Ordre dans lequel les opérateurs d''une expression sont appliqués en l''absence de parenthèses."},{"term":"Évaluation en court-circuit","definition":"Arrêt de l''évaluation d''un ET (ou d''un OU) dès que le premier opérande suffit à connaître le résultat."}],"commentedAlgorithms":[{"title":"Chiffres d''un nombre de trois chiffres","code":"ALGORITHME Chiffres\nVARIABLES\n  n, c, d, u : ENTIER\nDEBUT\n  LIRE(n)\n  u ← n MOD 10\n  d ← (n DIV 10) MOD 10\n  c ← n DIV 100\n  ECRIRE(\"Centaines : \", c)\n  ECRIRE(\"Dizaines : \", d)\n  ECRIRE(\"Unités : \", u)\n  ECRIRE(\"Vérification : \", c * 100 + d * 10 + u)\nFIN","comments":{"1":"Précondition : n est compris entre 100 et 999.","3":"c, d, u : centaines, dizaines, unités.","5":"Lecture du nombre, par exemple 375.","6":"Le reste de la division par 10 est le dernier chiffre.","7":"n DIV 10 retire les unités ; MOD 10 isole alors les dizaines.","8":"Le quotient par 100 donne les centaines.","9":"Affichage des trois chiffres, du plus grand rang au plus petit.","12":"Postcondition : on retrouve n."},"stdin":"375","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Oublier les parenthèses dans une moyenne","wrong":"ECRIRE(12 + 14 + 16 / 3)","right":"ECRIRE((12 + 14 + 16) / 3)","explanation":"La division est prioritaire sur l''addition : la version fautive calcule 12 + 14 + 5.33 = 31.33 au lieu de 14.","run":true},{"title":"Diviser par zéro","wrong":"VARIABLES\n  a, b : ENTIER\nDEBUT\n  a ← 10\n  b ← 0\n  ECRIRE(a MOD b)\nFIN","right":"VARIABLES\n  a, b : ENTIER\nDEBUT\n  a ← 10\n  b ← 0\n  SI b <> 0 ALORS\n    ECRIRE(a MOD b)\n  SINON\n    ECRIRE(\"Diviseur nul\")\n  FINSI\nFIN","explanation":"Toute division (/, DIV, MOD) par une variable qui peut valoir 0 doit être protégée par une condition.","run":true}],"solvedExercises":[{"title":"Évaluer des expressions","statement":"Avec a = 7 et b = 3, évaluez : (1) a DIV b * b + a MOD b ; (2) a / b > 2 ET a MOD 2 = 1 ; (3) -a MOD b + 2 ^ b.","solution":"(1) 7 DIV 3 = 2 ; 2 × 3 = 6 ; 7 MOD 3 = 1 ; 6 + 1 = **7**\n(2) 7 / 3 ≈ 2.33 > 2 → VRAI ; 7 MOD 2 = 1 → VRAI ; **VRAI**\n(3) −7 MOD 3 = −1 (signe du dividende) ; 2 ^ 3 = 8 ; **7**","explanation":"La première expression illustre la relation a = b × (a DIV b) + (a MOD b). Attention au reste d''un nombre négatif : en pseudocode comme en C, Java et JavaScript, il a le signe du dividende (en Python, il a celui du diviseur)."},{"title":"Jour de la semaine","statement":"Les jours sont numérotés de 0 (lundi) à 6 (dimanche). Écrivez un algorithme qui lit le numéro du jour actuel et un nombre de jours k, puis affiche le numéro du jour dans k jours.","solution":"ALGORITHME JourFutur\nVARIABLES\n  jour, k, futur : ENTIER\nDEBUT\n  LIRE(jour)\n  LIRE(k)\n  futur ← (jour + k) MOD 7\n  ECRIRE(\"Jour : \", futur)\nFIN","explanation":"MOD 7 « boucle » sur la semaine : depuis jeudi (3), dans 10 jours on obtient (3 + 10) MOD 7 = 6, un dimanche."}],"td":{"title":"TD 6 — DIV, MOD et priorités","instructions":"Vérifiez vos calculs sur un exemple à la main avant de soumettre ; les tests cachés contiennent des cas limites.","exerciseSlugs":["algo-chiffres","algo-divisibilite"]},"project":{"title":"Horloge de la semaine","context":"Un capteur compte les minutes écoulées depuis lundi 00 h 00. Il faut afficher le jour et l''heure correspondants.","steps":["Calculer le nombre de minutes par jour (1 440).","Utiliser DIV et MOD pour obtenir le jour, les heures et les minutes.","Tester les cas limites : 0, 1 439, 1 440 et la dernière minute de la semaine."],"deliverables":["Un algorithme utilisant DIV et MOD, vérifié sur des cas limites."],"exerciseSlug":"algo-projet-horloge"}}'::jsonb, 'publie', 6, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'operateurs-interrogation', 'Interrogation — Opérateurs', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'operateurs-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-interrogation'), 'qcm', 'Que vaut 17 MOD 5 ?', null, '["3","2","3.4","12"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-interrogation'), 'qcm', 'Que vaut 2 + 3 * 4 ?', null, '["20","14","24","9"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-interrogation'), 'qcm', 'Que vaut 20 - 6 - 2 ?', null, '["16","12","10","18"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-interrogation'), 'qcm', 'Quel est le chiffre des dizaines de 4 829 ?', null, '["(4829 DIV 10) MOD 10 = 2","4829 MOD 100 = 29","4829 DIV 100 = 48","4829 MOD 10 = 9"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-interrogation'), 'vrai_faux', '7 / 2 donne 3 en pseudocode.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, '/ est la division réelle : 3.5. C''est 7 DIV 2 qui vaut 3.' from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'operateurs-evaluation', 'Évaluation du chapitre 6', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'operateurs-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Que vaut 45 DIV 7 ?', null, '["6","6.43","3","7"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Que vaut 45 MOD 7 ?', null, '["6","3","2","0"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Comment tester qu''un nombre n est un multiple de 4 ?', null, '["n DIV 4 = 0","n MOD 4 = 0","n / 4 = 0","n MOD 4 = 4"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Que vaut (2 + 3) * 4 - 6 / 2 ?', null, '["17","7","20","2"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, '(2 + 3) × 4 = 20, 6 / 2 = 3, 20 − 3 = 17.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Combien de minutes complètes dans 365 secondes ?', null, '["6","5","6.08","65"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'vrai_faux', 'Dans (d <> 0) ET (n MOD d = 0), si d vaut 0, n MOD d n''est pas calculé.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Que vaut 2 ^ 3 ^ 2 ?', null, '["64","512","36","12"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'La puissance s''évalue de droite à gauche : 2 ^ 9.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'operateurs-evaluation'), 'qcm', 'Quel est le chiffre des centaines de 375 ?', null, '["375 DIV 100 = 3","375 MOD 100 = 75","375 MOD 10 = 5","375 / 100 = 3.75"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'entrees-sorties', 'Entrées et sorties', 'debutant', 90, array['Lire des données de différents types avec LIRE.', 'Produire un affichage clair et conforme à un format imposé avec ECRIRE.', 'Comprendre la conversion des données lues et les erreurs de saisie.']::text[], array['Chapitre 5 — Types de données.']::text[], '## 1. Communiquer avec l''utilisateur

Un algorithme utile **reçoit** des données et **communique** ses résultats. En pseudocode, deux instructions suffisent :

- **LIRE(variable)** : attend une donnée et la range dans la variable (entrée) ;
- **ECRIRE(…)** : affiche des valeurs à l''écran puis passe à la ligne (sortie).

## 2. LIRE : obtenir des données

~~~pseudocode
LIRE(nom)
LIRE(age)
LIRE(a, b)        // lit deux valeurs, une par ligne
~~~

Sur la plateforme, les données sont saisies à l''avance dans la zone **Entrée**, **une valeur par ligne** : chaque LIRE consomme la ligne suivante. Ce fonctionnement est exactement celui des tests automatiques des exercices.

La valeur lue est **convertie dans le type de la variable** :

| Type de la variable | Saisie | Résultat |
|---|---|---|
| ENTIER | 42 | 42 |
| ENTIER | 4.5 ou abc | **erreur** de saisie |
| REEL | 12,5 ou 12.5 | 12.5 |
| CHAINE | Jean Mukendi | "Jean Mukendi" (toute la ligne) |
| BOOLEEN | VRAI, FAUX, 1 ou 0 | VRAI / FAUX |

S''il n''y a plus de donnée à lire, l''exécution s''arrête avec un message clair.

## 3. ECRIRE : afficher des résultats

ECRIRE accepte plusieurs éléments séparés par des virgules ; ils sont affichés **collés**, sans espace ajouté :

~~~pseudocode
ECRIRE("La moyenne de ", nom, " est ", moyenne, "/20")
~~~

- Les textes entre guillemets sont affichés tels quels ;
- les variables et expressions sont **évaluées** puis affichées ;
- les booléens s''affichent VRAI ou FAUX ;
- chaque ECRIRE se termine par un **retour à la ligne**.

Pour afficher une ligne vide : ECRIRE(""). Pour construire une ligne morceau par morceau (par exemple dans une boucle), on concatène dans une variable CHAINE puis on l''affiche une fois.

## 4. Guider l''utilisateur

Dans un vrai programme, on affiche un message **avant** chaque lecture : ECRIRE("Votre âge ?") puis LIRE(age). Dans les exercices corrigés automatiquement, au contraire, on n''affiche **que** ce que demande l''énoncé : un message en trop rendrait la sortie différente de la sortie attendue.

## 5. Respecter un format de sortie

Les tests comparent la sortie **caractère par caractère** (les espaces en fin de ligne sont tolérés). Avant de soumettre, vérifiez : majuscules et accents, espaces autour des deux-points, ordre des lignes, nombre de décimales. Exemple : si l''énoncé demande « Somme : 13 », les sorties « somme : 13 », « Somme: 13 » et « Somme : 13.0 » sont toutes **incorrectes**.

## 6. L''ordre des lectures

Les données sont consommées **dans l''ordre** des instructions LIRE. Si l''énoncé fournit d''abord le prix puis la quantité, il faut lire le prix en premier : inverser les deux LIRE ne provoque pas toujours d''erreur, mais produit un résultat faux. Avant d''écrire vos LIRE, recopiez l''exemple d''entrée de l''énoncé et associez chaque ligne à une variable.

## 7. Les entrées : jamais de confiance aveugle

Un utilisateur peut saisir n''importe quoi. Un programme robuste **vérifie** ses entrées (une note entre 0 et 20, un âge positif) et redemande si nécessaire : nous apprendrons à le faire avec les structures conditionnelles (chapitre 8) et la boucle RÉPÉTER (chapitre 10). C''est aussi une règle de **sécurité** fondamentale en programmation : toute donnée venant de l''extérieur doit être validée.', array['LIRE range dans une variable la donnée suivante, convertie dans son type.', 'Sur la plateforme, une valeur par ligne dans la zone Entrée.', 'ECRIRE affiche ses éléments collés, puis passe à la ligne.', 'Dans les exercices, respectez exactement le format de sortie demandé.', 'Toute entrée doit être vérifiée avant d''être utilisée.']::text[], '[{"language":"pseudocode","title":"Saluer l''utilisateur","code":"ALGORITHME Salutation\nVARIABLES\n  nom : CHAINE\n  annee, age : ENTIER\nDEBUT\n  ECRIRE(\"Quel est votre nom ?\")\n  LIRE(nom)\n  ECRIRE(\"Votre année de naissance ?\")\n  LIRE(annee)\n  age ← 2026 - annee\n  ECRIRE(\"Bonjour \", nom, \", vous avez environ \", age, \" ans.\")\nFIN","stdin":"Grâce\n2005"},{"language":"pseudocode","title":"Construire une ligne avant de l''afficher","code":"ALGORITHME Ligne\nVARIABLES\n  a, b, c : ENTIER\n  ligne : CHAINE\nDEBUT\n  LIRE(a, b, c)\n  ligne ← CHAINE(a) + \" - \" + CHAINE(b) + \" - \" + CHAINE(c)\n  ECRIRE(\"Valeurs : \", ligne)\nFIN","stdin":"4\n8\n15"}]'::jsonb, '{"competences":["Lire des données de types variés","Produire un affichage conforme à un format","Interpréter une erreur de saisie"],"definitions":[{"term":"Entrée","definition":"Donnée fournie à l''algorithme depuis l''extérieur (clavier, fichier) et obtenue avec LIRE."},{"term":"Sortie","definition":"Résultat communiqué par l''algorithme, produit avec ECRIRE."},{"term":"Format de sortie","definition":"Forme exacte attendue de l''affichage : textes, espaces, ordre, nombre de décimales."},{"term":"Validation d''entrée","definition":"Vérification qu''une donnée saisie respecte les contraintes attendues avant de l''utiliser."}],"commentedAlgorithms":[{"title":"Bulletin simplifié","code":"ALGORITHME Bulletin\nVARIABLES\n  nom : CHAINE\n  note1, note2 : REEL\nDEBUT\n  LIRE(nom)\n  LIRE(note1, note2)\n  ECRIRE(\"Étudiant : \", nom)\n  ECRIRE(\"Notes : \", note1, \" et \", note2)\n  ECRIRE(\"Moyenne : \", (note1 + note2) / 2)\n  ECRIRE(\"Admis : \", (note1 + note2) / 2 >= 10)\nFIN","comments":{"6":"1re ligne d''entrée : tout le texte de la ligne.","7":"Deux valeurs : 2e et 3e lignes d''entrée.","8":"Texte et variable affichés collés.","9":"Les espaces doivent être écrits dans les textes.","10":"Une expression est évaluée avant d''être affichée.","11":"Un booléen s''affiche VRAI ou FAUX."},"stdin":"Kasongo Amani\n11\n14","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Lire un texte dans un ENTIER","wrong":"VARIABLES\n  age : ENTIER\nDEBUT\n  LIRE(age)\n  ECRIRE(age)\nFIN\n// Entrée saisie : vingt","right":"VARIABLES\n  age : ENTIER\nDEBUT\n  LIRE(age)\n  ECRIRE(age)\nFIN\n// Entrée saisie : 20","explanation":"LIRE convertit la saisie dans le type de la variable : « vingt » n''est pas un entier. Sur la plateforme, l''erreur indique la variable concernée et la valeur reçue.","run":false},{"title":"Ne pas respecter le format demandé","wrong":"// Énoncé : afficher « Somme : 13 »\nECRIRE(\"La somme vaut \", a + b)","right":"// Énoncé : afficher « Somme : 13 »\nECRIRE(\"Somme : \", a + b)","explanation":"Le résultat est juste, mais la sortie ne correspond pas à l''énoncé : le test automatique échoue. Copiez le format exact, espaces compris.","run":false}],"solvedExercises":[{"title":"Prévoir l''affichage","statement":"Qu''affiche ce programme avec les entrées 3 et 4 ?\n\n~~~pseudocode\nLIRE(a, b)\nECRIRE(a, \"+\", b, \"=\", a + b)\nECRIRE(\"\")\nECRIRE(a * b > 10)\n~~~","solution":"3+4=7\n\nVRAI","explanation":"Les éléments sont collés sans espace ; ECRIRE(\"\") produit une ligne vide ; 3 × 4 = 12 > 10 donne VRAI."},{"title":"Carte d''identité","statement":"Lisez un nom, un prénom et une année de naissance, puis affichez exactement :\n\n~~~text\nNom : <NOM>\nPrénom : <prénom>\nÂge en 2026 : <âge>\n~~~\n(le nom en majuscules).","solution":"ALGORITHME Carte\nVARIABLES\n  nom, prenom : CHAINE\n  annee : ENTIER\nDEBUT\n  LIRE(nom)\n  LIRE(prenom)\n  LIRE(annee)\n  ECRIRE(\"Nom : \", MAJUSCULE(nom))\n  ECRIRE(\"Prénom : \", prenom)\n  ECRIRE(\"Âge en 2026 : \", 2026 - annee)\nFIN","explanation":"Trois lectures, trois écritures. MAJUSCULE transforme la chaîne ; l''âge est une expression calculée directement dans ECRIRE."}],"td":{"title":"TD 7 — Entrées, sorties et formats","instructions":"Copiez exactement le format de l''énoncé (majuscules, espaces, accents). Les tests comparent la sortie ligne par ligne.","exerciseSlugs":["algo-facture","algo-fiche-etudiant"]},"project":{"title":"Reçu de paiement des frais académiques","context":"La caisse de l''université remet un reçu indiquant le montant payé et le reste à payer.","steps":["Lire nom, matricule, montant total et montant payé dans cet ordre.","Calculer le reste à payer.","Afficher le reçu en respectant exactement le format."],"deliverables":["Un reçu de 6 lignes conforme au modèle."],"exerciseSlug":"algo-projet-recu"}}'::jsonb, 'publie', 7, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'entrees-sorties-interrogation', 'Interrogation — Entrées et sorties', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'entrees-sorties-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-interrogation'), 'qcm', 'Qu''affiche ECRIRE("A", 1, "B") ?', null, '["A 1 B","A1B","A, 1, B","erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-interrogation'), 'qcm', 'Sur la plateforme, comment saisir deux valeurs pour LIRE(a, b) ?', null, '["Sur une même ligne séparées par une virgule","Une valeur par ligne","Entre guillemets","Ce n''est pas possible"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-interrogation'), 'vrai_faux', 'Dans un exercice corrigé automatiquement, il faut afficher « Entrez un nombre » avant LIRE.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-interrogation'), 'qcm', 'Que se passe-t-il si l''on saisit « abc » pour une variable ENTIER ?', null, '["La variable vaut 0","Erreur de saisie","La variable vaut \"abc\"","Rien"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-interrogation'), 'qcm', 'Que vaut l''affichage de ECRIRE(5 > 3) ?', null, '["5 > 3","VRAI","1","TRUE"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'entrees-sorties-evaluation', 'Évaluation du chapitre 7', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'entrees-sorties-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Que fait LIRE(x) ?', null, '["Affiche x","Range dans x la donnée suivante","Compare x à une saisie","Efface x"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Quelle instruction affiche « Total : 12 » si t vaut 12 ?', null, '["ECRIRE(\"Total :\", t)","ECRIRE(\"Total : \", t)","ECRIRE(Total, t)","ECRIRE(\"Total : t\")"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Une variable CHAINE reçoit « Jean Mukendi » par LIRE. Que contient-elle ?', null, '["\"Jean\"","\"Jean Mukendi\"","\"Mukendi\"","une erreur"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'vrai_faux', 'Chaque ECRIRE se termine par un retour à la ligne.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Quelle saisie est acceptée pour une variable REEL ?', null, '["douze","12,5","12 et demi","\"12\""]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Pourquoi valider les entrées d''un programme ?', null, '["Pour ralentir l''utilisateur","Parce qu''une donnée extérieure peut être invalide ou malveillante","Ce n''est jamais utile","Pour économiser la mémoire"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Qu''affiche ECRIRE("x = ", 2 * 3, ";") ?', null, '["x = 6;","x = 2 * 3;","x = 6 ;","x=6;"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'entrees-sorties-evaluation'), 'qcm', 'Un exercice attend « Moyenne : 12 ». Votre programme affiche « Moyenne : 12.0 ». Le test…', null, '["réussit","échoue","dépend de l''enseignant","n''est pas exécuté"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'notion-algorithme', 'Notion d''algorithme (fusionné dans le chapitre 1)', 'debutant', 25, array['Connaître les propriétés d''un bon algorithme.', 'Identifier entrées, traitement et sorties.']::text[], '{}'::text[], 'Ce contenu fait désormais partie du chapitre « Introduction à l''algorithmique ».', array['Voir le chapitre 1.']::text[], '[]'::jsonb, null, 'archive', 8, null)
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'notion-algorithme'), 'notion-algo-quiz', 'Propriétés d''un algorithme', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'notion-algo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'notion-algo-quiz'), 'qcm', 'Laquelle de ces propriétés n''est PAS exigée d''un algorithme ?', null, '["Se terminer en un temps fini","Être écrit en anglais","Être non ambigu","Produire un résultat correct"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'structures-controle', 'Structures de contrôle', 'Prendre des décisions et répéter des actions.', 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Décalez les instructions à l''intérieur d''un bloc. L''interpréteur ne l''exige pas, mais vos lecteurs (et vos enseignants !) vous remercieront.', array['SI … ALORS … SINON … FINSI exécute un bloc selon une condition.', 'SINON SI enchaîne plusieurs cas testés dans l''ordre.', 'SELON compare une valeur à plusieurs constantes.']::text[], '[{"language":"pseudocode","title":"Mention d''un étudiant","code":"ALGORITHME Mention\nVARIABLES\n  note : REEL\nDEBUT\n  LIRE(note)\n  SI note >= 16 ALORS\n    ECRIRE(\"Très bien\")\n  SINON SI note >= 14 ALORS\n    ECRIRE(\"Bien\")\n  SINON SI note >= 10 ALORS\n    ECRIRE(\"Passable\")\n  SINON\n    ECRIRE(\"Insuffisant\")\n  FINSI\nFIN","stdin":"14.5"},{"language":"pseudocode","title":"SELON","code":"ALGORITHME Jour\nVARIABLES\n  jour : ENTIER\nDEBUT\n  LIRE(jour)\n  SELON jour\n    CAS 1 : ECRIRE(\"Lundi\")\n    CAS 2 : ECRIRE(\"Mardi\")\n    CAS 3 : ECRIRE(\"Mercredi\")\n    CAS 4 : ECRIRE(\"Jeudi\")\n    CAS 5 : ECRIRE(\"Vendredi\")\n    CAS 6, 7 : ECRIRE(\"Week-end\")\n    AUTRE : ECRIRE(\"Numéro invalide\")\n  FINSELON\nFIN","stdin":"6"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'conditions-quiz', 'Conditions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'conditions-quiz'), 'qcm', 'Avec note = 15, que affiche l''algorithme « Mention » ?', null, '["Très bien","Bien","Passable","Bien puis Passable"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, '15 >= 16 est faux, 15 >= 14 est vrai : « Bien » est affiché et les autres cas sont ignorés.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'conditions-quiz'), 'vrai_faux', 'Le bloc SINON est obligatoire dans un SI.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
- Écrire 0 < x < 10 au lieu de (x > 0) ET (x < 10).', array['Un SI peut contenir d''autres SI ; chacun a son FINSI.', 'ET / OU permettent souvent d''éviter des imbrications.', 'L''ordre des tests compte quand les cas se chevauchent.']::text[], '[{"language":"pseudocode","title":"Le plus grand de trois nombres","code":"ALGORITHME Maximum3\nVARIABLES\n  a, b, c, max : ENTIER\nDEBUT\n  LIRE(a)\n  LIRE(b)\n  LIRE(c)\n  SI a >= b ALORS\n    SI a >= c ALORS\n      max ← a\n    SINON\n      max ← c\n    FINSI\n  SINON\n    SI b >= c ALORS\n      max ← b\n    SINON\n      max ← c\n    FINSI\n  FINSI\n  ECRIRE(\"Maximum : \", max)\nFIN","stdin":"12\n45\n7"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Si la condition de sortie n''est jamais atteinte, la boucle ne s''arrête pas. La plateforme interrompt automatiquement le programme après un grand nombre d''instructions. Vérifiez toujours que **la condition finit par changer** dans le corps de la boucle.', array['POUR : nombre de tours connu.', 'TANT QUE : condition testée avant chaque tour.', 'RÉPÉTER … JUSQU''À : au moins un tour, s''arrête quand la condition est vraie.']::text[], '[{"language":"pseudocode","title":"Table de multiplication","code":"ALGORITHME Table\nVARIABLES\n  n, i : ENTIER\nDEBUT\n  LIRE(n)\n  POUR i DE 1 A 10 FAIRE\n    ECRIRE(n, \" x \", i, \" = \", n * i)\n  FINPOUR\nFIN","stdin":"7"},{"language":"pseudocode","title":"Épargne avec TANT QUE","code":"ALGORITHME Epargne\nVARIABLES\n  solde : REEL\n  annees : ENTIER\nDEBUT\n  solde ← 1000\n  annees ← 0\n  TANT QUE solde < 2000 FAIRE\n    solde ← solde * 1.08\n    annees ← annees + 1\n  FINTANTQUE\n  ECRIRE(\"Capital doublé après \", annees, \" ans\")\nFIN"},{"language":"pseudocode","title":"Saisie contrôlée avec RÉPÉTER","code":"ALGORITHME SaisieNote\nVARIABLES\n  note : REEL\nDEBUT\n  REPETER\n    ECRIRE(\"Entrez une note entre 0 et 20 :\")\n    LIRE(note)\n  JUSQU''A (note >= 0) ET (note <= 20)\n  ECRIRE(\"Note acceptée : \", note)\nFIN","stdin":"25\n-3\n12"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'boucles'), 'boucles-quiz', 'Boucles', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'qcm', 'Combien de fois s''exécute le corps de POUR i DE 3 A 7 FAIRE ?', null, '["4","5","7","3"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'qcm', 'Quelle boucle s''exécute toujours au moins une fois ?', null, '["POUR","TANT QUE","RÉPÉTER … JUSQU''À","Aucune"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'boucles-quiz'), 'vrai_faux', 'Une boucle TANT QUE dont la condition est fausse au départ ne s''exécute pas.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['Compteur : +1 à chaque événement, initialisé à 0.', 'Accumulateur : somme (0) ou produit (1).', 'Toujours initialiser avant la boucle.']::text[], '[{"language":"pseudocode","title":"Statistiques d''une promotion","code":"ALGORITHME Statistiques\nVARIABLES\n  n, i, nbAdmis : ENTIER\n  note, somme, meilleure : REEL\nDEBUT\n  LIRE(n)\n  somme ← 0\n  nbAdmis ← 0\n  POUR i DE 1 A n FAIRE\n    LIRE(note)\n    somme ← somme + note\n    SI note >= 10 ALORS\n      nbAdmis ← nbAdmis + 1\n    FINSI\n    SI i = 1 OU note > meilleure ALORS\n      meilleure ← note\n    FINSI\n  FINPOUR\n  ECRIRE(\"Moyenne : \", somme / n)\n  ECRIRE(\"Admis : \", nbAdmis, \" sur \", n)\n  ECRIRE(\"Meilleure note : \", meilleure)\nFIN","stdin":"5\n12\n8.5\n15\n9\n17","explanation":"Le OU est évalué de gauche à droite : au premier tour, i = 1 est vrai et meilleure n''est pas encore lue."}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-controle'), (select id from public.courses where slug = 'algorithmique'), 'organigrammes', 'Organigrammes', 'debutant', 25, array['Lire et dessiner un organigramme.', 'Passer d''un organigramme au pseudocode et inversement.']::text[], '{}'::text[], '## Qu''est-ce qu''un organigramme ?

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

Pour les problèmes plus longs, le pseudocode est plus compact ; l''organigramme reste précieux pour expliquer la logique à l''oral ou en examen.', array['Ovale : début/fin ; rectangle : traitement ; parallélogramme : entrée/sortie ; losange : décision.', 'Une boucle est une flèche qui remonte vers une décision.', 'Chaque symbole se traduit par une instruction de pseudocode.']::text[], '[{"language":"pseudocode","title":"Traduction de l''organigramme « pair ou impair »","code":"ALGORITHME PairImpair\nVARIABLES\n  n : ENTIER\nDEBUT\n  LIRE(n)\n  SI n MOD 2 = 0 ALORS\n    ECRIRE(\"pair\")\n  SINON\n    ECRIRE(\"impair\")\n  FINSI\nFIN","stdin":"7"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'organigrammes'), 'organigramme-quiz', 'Organigrammes', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'organigramme-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'organigramme-quiz'), 'qcm', 'Quel symbole représente une condition ?', null, '["Le rectangle","L''ovale","Le losange","Le parallélogramme"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'donnees-structurees', 'Tableaux et chaînes', 'Manipuler des collections de valeurs et du texte.', 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Un tableau passé à une fonction l''est **par référence** : la fonction travaille directement sur le tableau d''origine.', array['Un tableau regroupe des valeurs de même type, repérées par un indice.', 'On le parcourt avec une boucle POUR.', 'Attention aux indices hors limites.']::text[], '[{"language":"pseudocode","title":"Notes au-dessus de la moyenne","code":"ALGORITHME AuDessus\nCONSTANTES\n  N = 5\nVARIABLES\n  notes : TABLEAU[1..N] DE REEL\n  i : ENTIER\n  somme, moyenne : REEL\nDEBUT\n  somme ← 0\n  POUR i DE 1 A N FAIRE\n    LIRE(notes[i])\n    somme ← somme + notes[i]\n  FINPOUR\n  moyenne ← somme / N\n  ECRIRE(\"Moyenne : \", moyenne)\n  POUR i DE 1 A N FAIRE\n    SI notes[i] > moyenne ALORS\n      ECRIRE(\"Étudiant \", i, \" : \", notes[i])\n    FINSI\n  FINPOUR\nFIN","stdin":"12\n7\n15\n10\n16"},{"language":"pseudocode","title":"Matrice et boucles imbriquées","code":"ALGORITHME Matrice\nVARIABLES\n  M : TABLEAU[1..3, 1..3] DE ENTIER\n  i, j : ENTIER\n  ligne : CHAINE\nDEBUT\n  POUR i DE 1 A 3 FAIRE\n    ligne ← \"\"\n    POUR j DE 1 A 3 FAIRE\n      M[i, j] ← i * j\n      ligne ← ligne + CHAINE(M[i, j]) + \" \"\n    FINPOUR\n    ECRIRE(ligne)\n  FINPOUR\nFIN"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'tableaux'), 'tableaux-quiz', 'Tableaux', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'tableaux-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'tableaux-quiz'), 'qcm', 'T : TABLEAU[1..10] DE ENTIER. Combien de cases contient T ?', null, '["9","10","11","1"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'tableaux-quiz'), 'vrai_faux', 'Un tableau peut contenir à la fois des entiers et des chaînes.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Les chaînes se comparent avec = et <>, et aussi avec < ou > (ordre alphabétique). La comparaison distingue majuscules et minuscules : utilisez MINUSCULE pour comparer sans en tenir compte.', array['+ concatène ; CHAINE(x) convertit un nombre en texte.', 's[i] donne le i-ème caractère (à partir de 1).', 'LONGUEUR, MAJUSCULE, MINUSCULE, SOUSCHAINE sont prédéfinies.']::text[], '[{"language":"pseudocode","title":"Palindrome","code":"ALGORITHME Palindrome\nVARIABLES\n  mot, envers : CHAINE\n  i : ENTIER\nDEBUT\n  LIRE(mot)\n  mot ← MINUSCULE(mot)\n  envers ← \"\"\n  POUR i DE LONGUEUR(mot) A 1 PAS -1 FAIRE\n    envers ← envers + mot[i]\n  FINPOUR\n  SI mot = envers ALORS\n    ECRIRE(mot, \" est un palindrome\")\n  SINON\n    ECRIRE(mot, \" n''est pas un palindrome\")\n  FINSI\nFIN","stdin":"Radar"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'modularite', 'Sous-programmes et récursivité', 'Découper un algorithme en fonctions et procédures réutilisables.', 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Avant ou après le bloc DEBUT … FIN principal. Une fonction peut se terminer par FIN ou FINFONCTION.', array['Une fonction retourne une valeur avec RETOURNER ; une procédure non.', 'Les variables locales n''existent que pendant l''appel.', 'VAR passe un paramètre par référence.']::text[], '[{"language":"pseudocode","title":"Fonction et procédure","code":"ALGORITHME Sousprogrammes\n\nFONCTION estPair(n : ENTIER) : BOOLEEN\nDEBUT\n  RETOURNER n MOD 2 = 0\nFIN\n\nPROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)\nVARIABLES\n  t : ENTIER\nDEBUT\n  t ← a\n  a ← b\n  b ← t\nFIN\n\nVARIABLES\n  x, y : ENTIER\nDEBUT\n  x ← 4\n  y ← 9\n  ECRIRE(\"4 est pair : \", estPair(x))\n  echanger(x, y)\n  ECRIRE(\"Après échange : x = \", x, \", y = \", y)\nFIN"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fonctions-procedures'), 'fonctions-quiz', 'Sous-programmes', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'fonctions-quiz'), 'qcm', 'Quelle est la différence principale entre fonction et procédure ?', null, '["La fonction ne prend pas de paramètres","La fonction retourne une valeur, la procédure non","La procédure est plus rapide","Il n''y a aucune différence"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'fonctions-quiz'), 'vrai_faux', 'Sans VAR, modifier un paramètre dans une procédure modifie la variable de l''appelant.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Tout algorithme récursif peut s''écrire avec des boucles. La récursivité est naturelle pour les problèmes qui se décomposent (tours de Hanoï, parcours d''arbres, tri fusion), mais elle peut être coûteuse : la version récursive naïve de Fibonacci recalcule de nombreuses fois les mêmes valeurs.', array['Une fonction récursive s''appelle elle-même.', 'Il faut un cas de base et un cas récursif qui s''en rapproche.', 'Chaque appel en attente occupe la pile d''appels.']::text[], '[{"language":"pseudocode","title":"Factorielle et Fibonacci","code":"ALGORITHME Recursivite\n\nFONCTION fact(n : ENTIER) : ENTIER\nDEBUT\n  SI n = 0 ALORS\n    RETOURNER 1\n  FINSI\n  RETOURNER n * fact(n - 1)\nFIN\n\nFONCTION fib(n : ENTIER) : ENTIER\nDEBUT\n  SI n <= 1 ALORS\n    RETOURNER n\n  FINSI\n  RETOURNER fib(n - 1) + fib(n - 2)\nFIN\n\nVARIABLES\n  i : ENTIER\nDEBUT\n  ECRIRE(\"5! = \", fact(5))\n  POUR i DE 0 A 10 FAIRE\n    ECRIRE(\"fib(\", i, \") = \", fib(i))\n  FINPOUR\nFIN"},{"language":"pseudocode","title":"Tours de Hanoï","code":"ALGORITHME Hanoi\n\nPROCEDURE hanoi(n : ENTIER, depart : CHAINE, arrivee : CHAINE, inter : CHAINE)\nDEBUT\n  SI n > 0 ALORS\n    hanoi(n - 1, depart, inter, arrivee)\n    ECRIRE(\"Déplacer le disque \", n, \" de \", depart, \" vers \", arrivee)\n    hanoi(n - 1, inter, arrivee, depart)\n  FINSI\nFIN\n\nDEBUT\n  hanoi(3, \"A\", \"C\", \"B\")\nFIN"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recursivite'), 'recursivite-quiz', 'Récursivité', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'recursivite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'recursivite-quiz'), 'qcm', 'Que se passe-t-il si une fonction récursive n''a pas de cas de base ?', null, '["Elle retourne 0","Elle s''appelle indéfiniment jusqu''à saturer la mémoire","Elle s''exécute une seule fois","Le compilateur ajoute un cas de base automatiquement"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'algorithmes-classiques', 'Algorithmes classiques et résolution de problèmes', 'Rechercher, trier, mesurer l''efficacité et résoudre des problèmes complets.', 5, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Des tris plus rapides existent (tri fusion, tri rapide) ; ils utilisent la récursivité.', array['Recherche séquentielle : tout tableau, jusqu''à n comparaisons.', 'Recherche dichotomique : tableau trié, environ log2(n) comparaisons.', 'Tri par sélection et tri à bulles : environ n² comparaisons.']::text[], '[{"language":"pseudocode","title":"Recherche dichotomique","code":"ALGORITHME Dichotomie\nVARIABLES\n  T : TABLEAU[1..10] DE ENTIER\n  i, x, gauche, droite, milieu : ENTIER\n  trouve : BOOLEEN\nDEBUT\n  POUR i DE 1 A 10 FAIRE\n    T[i] ← i * 3        // tableau trié : 3, 6, 9, …, 30\n  FINPOUR\n  LIRE(x)\n  gauche ← 1\n  droite ← 10\n  trouve ← FAUX\n  TANT QUE gauche <= droite ET NON trouve FAIRE\n    milieu ← (gauche + droite) DIV 2\n    SI T[milieu] = x ALORS\n      trouve ← VRAI\n    SINON SI x < T[milieu] ALORS\n      droite ← milieu - 1\n    SINON\n      gauche ← milieu + 1\n    FINSI\n  FINTANTQUE\n  SI trouve ALORS\n    ECRIRE(x, \" trouvé à la position \", milieu)\n  SINON\n    ECRIRE(x, \" absent du tableau\")\n  FINSI\nFIN","stdin":"21"},{"language":"pseudocode","title":"Tri par sélection","code":"ALGORITHME TriSelection\nCONSTANTES\n  N = 6\nVARIABLES\n  T : TABLEAU[1..N] DE ENTIER\n  i, j, iMin, temp : ENTIER\n  ligne : CHAINE\nDEBUT\n  POUR i DE 1 A N FAIRE\n    LIRE(T[i])\n  FINPOUR\n  POUR i DE 1 A N - 1 FAIRE\n    iMin ← i\n    POUR j DE i + 1 A N FAIRE\n      SI T[j] < T[iMin] ALORS\n        iMin ← j\n      FINSI\n    FINPOUR\n    temp ← T[i]\n    T[i] ← T[iMin]\n    T[iMin] ← temp\n  FINPOUR\n  ligne ← \"\"\n  POUR i DE 1 A N FAIRE\n    ligne ← ligne + CHAINE(T[i]) + \" \"\n  FINPOUR\n  ECRIRE(\"Tableau trié : \", ligne)\nFIN","stdin":"42\n7\n19\n3\n25\n11"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'recherche-tri'), 'tri-quiz', 'Recherche et tri', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'tri-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'tri-quiz'), 'vrai_faux', 'La recherche dichotomique fonctionne sur un tableau non trié.', null, '["Vrai","Faux"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'tri-quiz'), 'qcm', 'Combien de comparaisons au maximum pour une recherche dichotomique dans 1 024 éléments ?', null, '["environ 10","environ 100","512","1 024"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, '1 024 = 2^10 : on divise 10 fois la zone par deux.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Quand le résultat est faux : ajoutez des ECRIRE pour suivre les variables, faites une trace à la main sur un petit exemple, ou demandez au **professeur IA** de vous aider à analyser l''erreur.', array['Comprendre, décomposer, concevoir, écrire, tester.', 'Chaque sous-problème devient une fonction ou une procédure.', 'Testez toujours les cas limites.']::text[], '[{"language":"pseudocode","title":"Programme complet décomposé","code":"ALGORITHME Promotion\nCONSTANTES\n  MAX = 100\nVARIABLES\n  notes : TABLEAU[1..MAX] DE REEL\n  n, i : ENTIER\n  ligne : CHAINE\n\nPROCEDURE lireNotes(T : TABLEAU DE REEL, n : ENTIER)\nVARIABLES\n  i : ENTIER\nDEBUT\n  POUR i DE 1 A n FAIRE\n    LIRE(T[i])\n  FINPOUR\nFIN\n\nFONCTION moyenne(T : TABLEAU DE REEL, n : ENTIER) : REEL\nVARIABLES\n  i : ENTIER\n  s : REEL\nDEBUT\n  s ← 0\n  POUR i DE 1 A n FAIRE\n    s ← s + T[i]\n  FINPOUR\n  RETOURNER s / n\nFIN\n\nFONCTION nbAdmis(T : TABLEAU DE REEL, n : ENTIER) : ENTIER\nVARIABLES\n  i, c : ENTIER\nDEBUT\n  c ← 0\n  POUR i DE 1 A n FAIRE\n    SI T[i] >= 10 ALORS\n      c ← c + 1\n    FINSI\n  FINPOUR\n  RETOURNER c\nFIN\n\nPROCEDURE trier(T : TABLEAU DE REEL, n : ENTIER)\nVARIABLES\n  i, j : ENTIER\n  tmp : REEL\nDEBUT\n  POUR i DE 1 A n - 1 FAIRE\n    POUR j DE 1 A n - i FAIRE\n      SI T[j] > T[j + 1] ALORS\n        tmp ← T[j]\n        T[j] ← T[j + 1]\n        T[j + 1] ← tmp\n      FINSI\n    FINPOUR\n  FINPOUR\nFIN\n\nDEBUT\n  LIRE(n)\n  lireNotes(notes, n)\n  ECRIRE(\"Moyenne : \", moyenne(notes, n))\n  ECRIRE(\"Admis : \", nbAdmis(notes, n), \"/\", n)\n  trier(notes, n)\n  ECRIRE(\"Meilleure note : \", notes[n])\n  ligne ← \"\"\n  POUR i DE 1 A n FAIRE\n    ligne ← ligne + CHAINE(notes[i]) + \" \"\n  FINPOUR\n  ECRIRE(\"Notes triées : \", ligne)\nFIN","stdin":"6\n12\n8\n15.5\n10\n6.5\n18"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'efficacite', 'Efficacité des algorithmes', null, 6, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'efficacite'), (select id from public.courses where slug = 'algorithmique'), 'complexite', 'Complexité algorithmique', 'avance', 35, array['Estimer le nombre d''opérations d''un algorithme.', 'Connaître les notations O(1), O(log n), O(n), O(n log n), O(n²).']::text[], '{}'::text[], '## Pourquoi mesurer ?

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
- Pour de grandes données, passer de O(n²) à O(n log n) change tout.', array['La complexité décrit l''évolution du coût en fonction de n.', 'On garde le terme dominant : 3n² + 5n devient O(n²).', 'O(log n) < O(n) < O(n log n) < O(n²) < O(2^n).']::text[], '[{"language":"pseudocode","title":"Compter les opérations","code":"ALGORITHME CompterOperations\nVARIABLES\n  n, i, j, compteur : ENTIER\nDEBUT\n  POUR n DE 10 A 40 PAS 10 FAIRE\n    compteur ← 0\n    POUR i DE 1 A n FAIRE\n      POUR j DE 1 A n FAIRE\n        compteur ← compteur + 1\n      FINPOUR\n    FINPOUR\n    ECRIRE(\"n = \", n, \" -> \", compteur, \" opérations\")\n  FINPOUR\nFIN","explanation":"Quand n double, le nombre d''opérations est multiplié par 4 : c''est la signature d''un O(n²)."}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'complexite'), 'complexite-quiz', 'Complexité', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'complexite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'complexite-quiz'), 'qcm', 'Quelle est la complexité de deux boucles POUR imbriquées de 1 à n ?', null, '["O(n)","O(log n)","O(n²)","O(1)"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'complexite-quiz'), 'qcm', 'Comment s''écrit 5n + 100 en notation O ?', null, '["O(5n)","O(n)","O(100)","O(n + 100)"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'algorithmique') and m.slug not in ('fondements', 'structures-controle', 'donnees-structurees', 'modularite', 'algorithmes-classiques', 'efficacite') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'algorithmique'), 1, 'Niveau 1 — Très débutant : les fondements', 'Aucune connaissance préalable. Vocabulaire, logique, méthode d''analyse, variables, types, opérateurs, entrées et sorties : tout ce qu''il faut pour écrire ses premiers algorithmes séquentiels.', array['Comprendre ce qu''est un algorithme et le vocabulaire de base.', 'Raisonner avec des conditions logiques.', 'Analyser un problème simple avant de l''écrire.', 'Écrire, exécuter et tracer un algorithme séquentiel.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-examen-niveau-1', 'Examen du niveau 1 — Fondements de l''algorithmique', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Quelle propriété garantit qu''un algorithme s''arrête ?', null, '["La précision","La finitude","L''efficacité","La lisibilité"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Que vaut NON (VRAI ET FAUX) ?', null, '["VRAI","FAUX"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Quelle condition traduit « x n''appartient pas à [0 ; 100] » ?', null, '["(x < 0) ET (x > 100)","(x < 0) OU (x > 100)","(x <= 0) OU (x >= 100)","NON x"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Une précondition décrit…', null, '["le résultat","ce que doivent vérifier les entrées","le nom des variables","la durée d''exécution"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Après a ← 4 ; b ← a ; a ← a + b, que vaut a ?', null, '["4","8","12","0"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Quel type pour « le nombre de cours suivis » ?', null, '["REEL","ENTIER","CHAINE","BOOLEEN"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Que vaut 29 DIV 4 ?', null, '["7","7.25","1","4"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Que vaut 29 MOD 4 ?', null, '["7","1","3","0"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Que vaut 3 + 2 * 5 - 1 ?', null, '["24","12","14","10"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'vrai_faux', 'Ranger 9 / 2 dans une variable ENTIER provoque une erreur de type.', null, '["Vrai","Faux"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Qu''affiche ECRIRE("n=", 2 * 3) ?', null, '["n= 6","n=6","n=2 * 3","6"]'::jsonb, 10, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-1'), 'qcm', 'Quel est le chiffre des dizaines de 572 ?', null, '["(572 DIV 10) MOD 10 = 7","572 MOD 10 = 2","572 DIV 100 = 5","572 MOD 100 = 72"]'::jsonb, 11, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'algorithmique'), 2, 'Niveau 2 — Débutant : contrôler l''exécution et structurer les données', 'Les fondamentaux du raisonnement algorithmique : conditions, boucles, compteurs et accumulateurs, tableaux, chaînes et organigrammes. Petits programmes et premiers projets.', array['Choisir et écrire la structure de contrôle adaptée.', 'Parcourir et traiter un tableau ou une chaîne.', 'Représenter un algorithme par un organigramme.', 'Réaliser de petits programmes complets.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-examen-niveau-2', 'Examen du niveau 2 — Contrôle et données', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-examen-niveau-2');
commit;
