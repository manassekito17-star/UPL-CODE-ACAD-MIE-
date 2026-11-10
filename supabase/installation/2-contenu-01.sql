-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 1 sur 11.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;

-- ===== Algorithmique et pseudocode =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('algorithmique', 'pseudocode', (select id from public.course_categories where slug = 'fondamentaux'), 'Parcours A', 'Algorithmique et pseudocode', 'Apprendre à raisonner avant de programmer.', 'Le parcours obligatoire de base : de la notion d''algorithme jusqu''à la résolution de problèmes complexes, en passant par les structures de contrôle, les tableaux, les sous-programmes, la récursivité, le tri et la complexité. Chaque notion est illustrée par du pseudocode exécutable directement dans le navigateur.', 'debutant', array['Aucun prérequis : ce parcours part de zéro.']::text[], array['Décomposer un problème en étapes précises et non ambiguës.', 'Écrire des algorithmes corrects en pseudocode français.', 'Maîtriser variables, conditions, boucles, tableaux et chaînes.', 'Structurer un algorithme avec des fonctions et des procédures.', 'Comprendre la récursivité, la recherche, le tri et la complexité.']::text[], 30, 'publie', 1, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'algorithmique'), 'fondements', 'Les fondements', 'Ce qu''est un algorithme, la logique qui le sous-tend, la méthode pour analyser un problème, et les briques de base : variables, types, opérateurs, entrées et sorties.', 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'introduction-algorithmique', 'Introduction à l''algorithmique', 'debutant', 90, array['Définir les notions de problème, d''algorithme et de programme.', 'Citer et expliquer les propriétés d''un bon algorithme.', 'Identifier les entrées, le traitement et les sorties d''un algorithme.', 'Lire, écrire et exécuter un premier algorithme en pseudocode.']::text[], array['Aucun : ce chapitre est le point de départ de la formation.']::text[], '## 1. Pourquoi étudier l''algorithmique ?

Un ordinateur ne « comprend » rien : il exécute, très vite et sans jamais se tromper, des opérations **élémentaires** (ranger une valeur en mémoire, additionner deux nombres, comparer deux valeurs, afficher un caractère). Pour qu''il résolve un problème, quelqu''un doit lui décrire, étape par étape, **exactement** ce qu''il doit faire. Cette description est un **algorithme**.

L''algorithmique est la discipline qui étudie la conception de ces méthodes : comment les construire, comment s''assurer qu''elles sont **correctes**, et comment les rendre **efficaces**. C''est la compétence centrale de l''informaticien : les langages changent (Python, C, Java…), la manière de raisonner reste.

> L''informaticien commence par réfléchir à la méthode (l''algorithme), puis la traduit dans un langage (le programme).

## 2. Problème, algorithme, programme

| Notion | Définition | Exemple |
|---|---|---|
| Problème | Ce que l''on veut obtenir, à partir de données | Calculer la moyenne de trois notes |
| Algorithme | La méthode, décrite indépendamment de tout langage | Additionner les trois notes, puis diviser la somme par 3 |
| Programme | L''algorithme traduit dans un langage compris par la machine | Le même calcul écrit en Python ou en C |

Un même problème peut être résolu par **plusieurs algorithmes** (certains plus rapides que d''autres), et un même algorithme peut être traduit en **plusieurs programmes** (un par langage).

Le mot « algorithme » vient du nom du mathématicien persan **Al-Khwârizmî** (IXᵉ siècle), auteur de méthodes de calcul systématiques. L''algorithme d''**Euclide** (vers 300 av. J.-C.), qui calcule le plus grand diviseur commun de deux nombres, est l''un des plus anciens connus.

## 3. Les propriétés d''un bon algorithme

1. **Finitude** : il se termine toujours, après un nombre fini d''étapes.
2. **Précision** (absence d''ambiguïté) : chaque étape n''a qu''une seule interprétation possible. « Ajouter un peu de sel » n''est pas précis ; « ajouter 5 g de sel » l''est.
3. **Entrées et sorties définies** : on sait quelles données il reçoit et quels résultats il produit.
4. **Correction** : pour toute entrée valide, il produit le résultat attendu.
5. **Efficacité** : il n''utilise pas plus de temps ni de mémoire que nécessaire.

Ces propriétés ne sont pas décoratives : un algorithme qui ne se termine pas « bloque » l''ordinateur ; un algorithme ambigu sera traduit différemment par deux programmeurs ; un algorithme incorrect pour une seule entrée (par exemple une note égale à 0) est un algorithme faux.

## 4. Le schéma entrée → traitement → sortie

Presque tout algorithme suit le même schéma :

- **Entrées** : les données fournies (lues au clavier, dans un fichier…).
- **Traitement** : les calculs et les décisions.
- **Sorties** : les résultats communiqués (affichés à l''écran, enregistrés…).

Exemple : pour convertir une durée en minutes, l''entrée est le nombre d''heures, le traitement est la multiplication par 60, la sortie est le nombre de minutes.

## 5. L''ordre des instructions compte

Les instructions d''un algorithme s''exécutent **de haut en bas, une par une**, dans l''ordre où elles sont écrites (on parle d''exécution **séquentielle**). Échanger deux lignes change souvent le résultat : verser l''eau avant de la faire bouillir ne donne pas un thé chaud. Dans les chapitres suivants, nous verrons comment rompre cet ordre (conditions, boucles), toujours de façon contrôlée.

## 6. Le pseudocode utilisé sur la plateforme

Le **pseudocode** est une écriture structurée, proche du français, assez précise pour être exécutée, assez simple pour se concentrer sur la logique. Sur UPL CODE ACADEMY MK, il est **réellement interprété** : chaque exemple peut être exécuté avec le bouton **Exécuter**.

~~~pseudocode
ALGORITHME NomDeLAlgorithme
VARIABLES
  // déclaration des variables (chapitre 4)
DEBUT
  // instructions, exécutées de haut en bas
FIN
~~~

- Les mots-clés (ALGORITHME, DEBUT, ECRIRE…) s''écrivent indifféremment en majuscules ou minuscules, avec ou sans accents.
- Les commentaires commencent par **//** : ils sont destinés au lecteur et ignorés à l''exécution.
- **ECRIRE(…)** affiche des valeurs puis passe à la ligne.

Les conventions de pseudocode varient d''un enseignant à l''autre ; celles de la plateforme sont décrites dans la référence du pseudocode et restent proches des usages universitaires francophones.', array['Un algorithme est une suite finie et non ambiguë d''instructions qui résout un problème.', 'Le programme est la traduction d''un algorithme dans un langage de programmation.', 'Un bon algorithme est fini, précis, correct, et si possible efficace.', 'La plupart des algorithmes suivent le schéma entrée → traitement → sortie.', 'Les instructions s''exécutent dans l''ordre, de haut en bas.']::text[], '[{"language":"pseudocode","title":"Premier algorithme","code":"ALGORITHME Bonjour\nDEBUT\n  ECRIRE(\"Bonjour et bienvenue à UPL CODE ACADEMY MK !\")\n  ECRIRE(\"Je suis votre premier algorithme.\")\nFIN","explanation":"Deux instructions ECRIRE, exécutées dans l''ordre : deux lignes s''affichent."},{"language":"pseudocode","title":"Entrée, traitement, sortie","code":"ALGORITHME HeuresEnMinutes\nVARIABLES\n  heures, minutes : ENTIER\nDEBUT\n  LIRE(heures)\n  minutes ← heures * 60\n  ECRIRE(heures, \" heure(s) = \", minutes, \" minutes\")\nFIN","stdin":"3","explanation":"LIRE prend la valeur 3 dans la zone « Entrée »."}]'::jsonb, '{"competences":["Distinguer problème, algorithme et programme","Reconnaître les propriétés d''un algorithme correct","Identifier entrées, traitement et sorties","Écrire et exécuter un algorithme séquentiel simple"],"definitions":[{"term":"Algorithme","definition":"Suite **finie** d''instructions **non ambiguës** qui, appliquée à des données d''entrée, produit un résultat en un temps fini."},{"term":"Programme","definition":"Traduction d''un algorithme dans un langage de programmation, exécutable par un ordinateur."},{"term":"Instruction","definition":"Ordre élémentaire donné à la machine : lire, écrire, calculer, ranger une valeur, tester une condition."},{"term":"Pseudocode","definition":"Écriture structurée d''un algorithme en langage proche du naturel, indépendante de tout langage de programmation."},{"term":"Exécution séquentielle","definition":"Exécution des instructions une par une, dans l''ordre où elles sont écrites."}],"commentedAlgorithms":[{"title":"Calcul de la moyenne de trois notes","code":"ALGORITHME MoyenneTroisNotes\nVARIABLES\n  n1, n2, n3, moyenne : REEL\nDEBUT\n  LIRE(n1)\n  LIRE(n2)\n  LIRE(n3)\n  moyenne ← (n1 + n2 + n3) / 3\n  ECRIRE(\"Moyenne : \", moyenne)\nFIN","comments":{"1":"En-tête : le nom décrit ce que fait l''algorithme.","2":"Début de la zone de déclaration.","3":"Quatre boîtes en mémoire pouvant contenir des nombres à virgule.","4":"Début des instructions exécutables.","5":"Entrée : la première note est lue et rangée dans n1.","6":"Entrée : deuxième note.","7":"Entrée : troisième note.","8":"Traitement : les parenthèses imposent d''additionner avant de diviser.","9":"Sortie : le texte puis la valeur calculée.","10":"Fin de l''algorithme : il se termine toujours (finitude)."},"stdin":"12\n15\n9","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Oublier le bloc DEBUT … FIN","wrong":"ALGORITHME Salut\nVARIABLES\n  x : ENTIER\nECRIRE(\"Salut\")","right":"ALGORITHME Salut\nDEBUT\n  ECRIRE(\"Salut\")\nFIN","explanation":"Dès qu''un algorithme a une structure (ALGORITHME, VARIABLES…), ses instructions doivent être placées entre **DEBUT** et **FIN**.","run":true},{"title":"Inverser l''ordre des instructions","wrong":"ALGORITHME Double\nVARIABLES\n  n, d : ENTIER\nDEBUT\n  d ← n * 2\n  LIRE(n)\n  ECRIRE(d)\nFIN","right":"ALGORITHME Double\nVARIABLES\n  n, d : ENTIER\nDEBUT\n  LIRE(n)\n  d ← n * 2\n  ECRIRE(d)\nFIN","explanation":"Les instructions s''exécutent dans l''ordre : on ne peut pas calculer avec **n** avant de l''avoir lu. L''interpréteur signale que la variable est utilisée avant d''avoir reçu une valeur.","run":true,"stdin":"5"}],"solvedExercises":[{"title":"Identifier entrées et sorties","statement":"Pour le problème « calculer le prix à payer pour n cahiers vendus 1 500 FC l''unité », indiquez les entrées, le traitement et la sortie, puis écrivez l''algorithme.","solution":"ALGORITHME PrixCahiers\nCONSTANTES\n  PRIX_UNITAIRE = 1500\nVARIABLES\n  n, total : ENTIER\nDEBUT\n  LIRE(n)\n  total ← n * PRIX_UNITAIRE\n  ECRIRE(\"A payer : \", total, \" FC\")\nFIN","explanation":"- **Entrée** : le nombre de cahiers n.\n- **Traitement** : multiplier n par le prix unitaire.\n- **Sortie** : le montant total.\n\nLe prix unitaire est une **constante** : il ne dépend pas de l''utilisateur."},{"title":"Une recette est-elle un algorithme ?","statement":"« Mettre de l''eau à chauffer. Ajouter du riz. Laisser cuire un moment. Saler à votre goût. » Cette recette respecte-t-elle les propriétés d''un algorithme ? Corrigez-la.","solution":"1. Faire chauffer 1 litre d''eau jusqu''à ébullition.\n2. Ajouter 250 g de riz.\n3. Laisser cuire 12 minutes.\n4. Ajouter 5 g de sel.\n5. Égoutter.","explanation":"La recette initiale n''est **pas précise** : « un moment » et « à votre goût » admettent plusieurs interprétations. Un algorithme doit indiquer des quantités et des durées exactes pour que deux personnes obtiennent le même résultat."}],"td":{"title":"TD 1 — Premiers algorithmes séquentiels","instructions":"Pour chaque exercice : identifiez d''abord les entrées et les sorties, écrivez l''algorithme, puis soumettez-le. La correction s''affiche après réussite.","exerciseSlugs":["algo-trois-lignes","algo-carre-perimetre"]},"project":{"title":"Carte de visite numérique","context":"Vous préparez la carte de présentation affichée sur votre profil étudiant.","steps":["Identifier les trois données à lire : prénom, filière, année d''études.","Écrire l''algorithme séquentiel qui affiche la carte, ligne par ligne.","Vérifier le format exact (bordures, espaces) puis soumettre."],"deliverables":["Un algorithme qui affiche une carte de 5 lignes conforme au modèle."],"exerciseSlug":"algo-projet-carte"}}'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'introduction-interrogation', 'Interrogation — Introduction à l''algorithmique', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'introduction-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-interrogation'), 'qcm', 'Qu''est-ce qu''un algorithme ?', null, '["Un langage de programmation","Une suite finie d''instructions précises qui résout un problème","Un composant électronique","Un logiciel de traitement de texte"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-interrogation'), 'vrai_faux', 'Un même algorithme peut être traduit dans plusieurs langages de programmation.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-interrogation'), 'qcm', '« Laisser cuire un moment » viole quelle propriété ?', null, '["La finitude","La précision","L''efficacité","Aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, '« Un moment » n''a pas une interprétation unique.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-interrogation'), 'qcm', 'Dans « convertir des heures en minutes », quelle est la sortie ?', null, '["Le nombre d''heures","La multiplication par 60","Le nombre de minutes","Le chiffre 60"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-interrogation'), 'vrai_faux', 'Les instructions d''un algorithme séquentiel peuvent être écrites dans n''importe quel ordre.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'introduction-evaluation', 'Évaluation du chapitre 1', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'introduction-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Lequel de ces éléments est un programme ?', null, '["Une méthode de calcul écrite en français","Un algorithme traduit en Python","Un organigramme","Un énoncé d''exercice"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Quelle propriété garantit qu''un algorithme s''arrête ?', null, '["La correction","La finitude","La précision","L''efficacité"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Un algorithme donne un résultat faux uniquement quand une note vaut 0. Il est…', null, '["correct","incorrect","inefficace mais correct","ambigu"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'La correction exige un bon résultat pour toutes les entrées valides.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Que fait ECRIRE("A = ", 5) ?', null, '["Affiche A = 5","Range 5 dans A","Lit une valeur","Provoque une erreur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'vrai_faux', 'Un commentaire // est exécuté par l''interpréteur.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Que contient le schéma entrée → traitement → sortie pour « calculer l''aire d''un carré de côté c » ?', null, '["Entrée : aire ; sortie : c","Entrée : c ; traitement : c × c ; sortie : aire","Entrée : c × c ; sortie : c","Il n''y a pas d''entrée"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'qcm', 'Pourquoi écrire d''abord un algorithme avant le programme ?', null, '["Parce que l''ordinateur exécute le pseudocode plus vite","Pour se concentrer sur la méthode, indépendamment du langage","Parce que c''est obligatoire en Python","Pour éviter d''utiliser des variables"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'introduction-evaluation'), 'vrai_faux', 'Plusieurs algorithmes différents peuvent résoudre le même problème.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'logique-raisonnement', 'Logique mathématique et raisonnement', 'debutant', 120, array['Définir une proposition et sa valeur de vérité.', 'Utiliser les connecteurs NON, ET, OU et construire leurs tables de vérité.', 'Appliquer les lois de De Morgan pour transformer une condition.', 'Traduire une phrase en condition logique et raisonner par cas.']::text[], array['Chapitre 1 — Introduction à l''algorithmique.']::text[], '## 1. Propositions et valeurs de vérité

Une **proposition** est un énoncé qui est soit **vrai**, soit **faux**, sans autre possibilité. « 7 est un nombre pair » est une proposition (fausse) ; « 10 > 3 » est une proposition (vraie). En revanche « Quelle heure est-il ? » ou « x + 1 » ne sont pas des propositions.

Dans un algorithme, une **condition** est une proposition dont la valeur dépend des variables : « note ≥ 10 » est vraie si la note vaut 12, fausse si elle vaut 8. Le résultat d''une condition est une valeur **booléenne** : VRAI ou FAUX (du nom du mathématicien George Boole).

## 2. Les connecteurs logiques

On combine des propositions avec trois connecteurs :

- **NON p** (négation) : vrai quand p est faux.
- **p ET q** (conjonction) : vrai seulement quand p et q sont **tous les deux** vrais.
- **p OU q** (disjonction) : vrai quand **au moins un** des deux est vrai. Le OU logique est **inclusif** : « p OU q » est vrai aussi quand les deux sont vrais.

### Tables de vérité

| p | q | NON p | p ET q | p OU q |
|---|---|---|---|---|
| VRAI | VRAI | FAUX | VRAI | VRAI |
| VRAI | FAUX | FAUX | FAUX | VRAI |
| FAUX | VRAI | VRAI | FAUX | VRAI |
| FAUX | FAUX | VRAI | FAUX | FAUX |

Avec n propositions, une table de vérité compte 2ⁿ lignes : 4 lignes pour 2 propositions, 8 pour 3.

## 3. Priorités et parenthèses

Comme × passe avant +, **NON** s''applique avant **ET**, qui s''applique avant **OU**. Ainsi « NON a ET b OU c » se lit « ((NON a) ET b) OU c ». En cas de doute — et pour être lu facilement — on met des **parenthèses**. Les comparaisons (=, <, ≥…) sont évaluées avant les connecteurs : « x > 0 ET x < 10 » se lit « (x > 0) ET (x < 10) ».

## 4. Lois de De Morgan et équivalences utiles

Deux conditions sont **équivalentes** si elles ont la même table de vérité. Les lois de De Morgan permettent de « faire entrer » une négation dans une parenthèse :

- NON (p ET q) ⇔ (NON p) OU (NON q)
- NON (p OU q) ⇔ (NON p) ET (NON q)

Exemple : « la note n''est PAS comprise entre 0 et 20 » s''écrit NON ((note ≥ 0) ET (note ≤ 20)), c''est-à-dire (note < 0) OU (note > 20).

Autres équivalences courantes : NON (NON p) ⇔ p ; NON (x < y) ⇔ x ≥ y ; NON (x = y) ⇔ x ≠ y.

## 5. L''implication et le raisonnement

« Si p alors q » (**implication**) n''est faux que dans un cas : p vrai et q faux. « S''il pleut, alors le sol est mouillé » n''est pas contredit par un sol mouillé sans pluie. L''implication p ⇒ q est équivalente à (NON p) OU q. Elle n''est pas un opérateur du pseudocode, mais elle sert à **raisonner** sur les algorithmes : « si l''entrée est positive, alors le résultat est positif ».

Deux techniques de raisonnement reviennent sans cesse :

1. **Le raisonnement par cas** : on découpe les situations possibles (n pair / n impair ; x < 0, x = 0, x > 0) et on vérifie chaque cas. C''est exactement ce que fera une structure SI … SINON.
2. **Le contre-exemple** : pour montrer qu''une affirmation générale est fausse, un seul cas suffit. « Tout nombre premier est impair » est faux : 2 est premier et pair.

## 6. Traduire une phrase en condition

| Phrase | Condition |
|---|---|
| x est compris entre 10 et 20 (inclus) | (x ≥ 10) ET (x ≤ 20) |
| x est en dehors de [10 ; 20] | (x < 10) OU (x > 20) |
| n est pair | n MOD 2 = 0 |
| l''étudiant est admis s''il a au moins 10 de moyenne et aucune note éliminatoire | (moyenne ≥ 10) ET NON eliminatoire |

Piège classique : on n''écrit **jamais** 10 ≤ x ≤ 20 en pseudocode ; il faut deux comparaisons reliées par ET.', array['Une proposition est vraie ou fausse ; une condition est une proposition qui dépend des variables.', 'NON inverse, ET exige les deux, OU (inclusif) en exige au moins un.', 'Priorités : comparaisons, puis NON, puis ET, puis OU ; les parenthèses lèvent toute ambiguïté.', 'De Morgan : NON (p ET q) = NON p OU NON q ; NON (p OU q) = NON p ET NON q.', 'On ne peut pas enchaîner deux comparaisons : 10 ≤ x ≤ 20 s''écrit (x ≥ 10) ET (x ≤ 20).']::text[], '[{"language":"pseudocode","title":"Tables de vérité calculées par la machine","code":"ALGORITHME TableDeVerite\nVARIABLES\n  p, q : BOOLEEN\nDEBUT\n  ECRIRE(\"p | q | p ET q | p OU q | NON p\")\n  p ← VRAI\n  q ← VRAI\n  ECRIRE(p, \" | \", q, \" | \", p ET q, \" | \", p OU q, \" | \", NON p)\n  q ← FAUX\n  ECRIRE(p, \" | \", q, \" | \", p ET q, \" | \", p OU q, \" | \", NON p)\n  p ← FAUX\n  q ← VRAI\n  ECRIRE(p, \" | \", q, \" | \", p ET q, \" | \", p OU q, \" | \", NON p)\n  q ← FAUX\n  ECRIRE(p, \" | \", q, \" | \", p ET q, \" | \", p OU q, \" | \", NON p)\nFIN"},{"language":"pseudocode","title":"Vérifier une loi de De Morgan","code":"ALGORITHME DeMorgan\nVARIABLES\n  note : REEL\n  dedans, dehors : BOOLEEN\nDEBUT\n  LIRE(note)\n  dedans ← (note >= 0) ET (note <= 20)\n  dehors ← (note < 0) OU (note > 20)\n  ECRIRE(\"Note valide : \", dedans)\n  ECRIRE(\"NON valide = invalide ? \", (NON dedans) = dehors)\nFIN","stdin":"25"}]'::jsonb, '{"competences":["Évaluer une expression booléenne","Construire une table de vérité","Transformer une condition avec les lois de De Morgan","Traduire un énoncé en condition logique"],"definitions":[{"term":"Proposition","definition":"Énoncé qui est soit vrai, soit faux."},{"term":"Booléen","definition":"Type dont les seules valeurs sont **VRAI** et **FAUX**."},{"term":"Conjonction (ET)","definition":"p ET q est vrai si et seulement si p et q sont vrais tous les deux."},{"term":"Disjonction (OU)","definition":"p OU q est vrai si et seulement si au moins l''une des deux propositions est vraie (OU inclusif)."},{"term":"Négation (NON)","definition":"NON p est vrai si et seulement si p est faux."},{"term":"Équivalence de conditions","definition":"Deux conditions sont équivalentes si elles ont la même valeur pour toutes les valeurs possibles de leurs variables (même table de vérité)."}],"commentedAlgorithms":[{"title":"Admission d''un étudiant","code":"ALGORITHME Admission\nVARIABLES\n  moyenne : REEL\n  eliminatoire, admis : BOOLEEN\nDEBUT\n  LIRE(moyenne)\n  LIRE(eliminatoire)\n  admis ← (moyenne >= 10) ET (NON eliminatoire)\n  ECRIRE(\"Admis : \", admis)\nFIN","comments":{"1":"Problème : décider de l''admission à partir de la moyenne et d''une note éliminatoire.","3":"Moyenne générale sur 20.","4":"eliminatoire : VRAI si l''étudiant a une note éliminatoire.","6":"Première entrée : la moyenne.","7":"Deuxième entrée : VRAI ou FAUX.","8":"La condition traduit la règle : les deux exigences doivent être vraies.","9":"Un booléen s''affiche VRAI ou FAUX."},"stdin":"13.5\nFAUX","showTrace":true}],"commonErrors":[{"title":"Enchaîner deux comparaisons","wrong":"DEBUT\n  ECRIRE(0 <= 15 <= 20)\nFIN","right":"DEBUT\n  ECRIRE((15 >= 0) ET (15 <= 20))\nFIN","explanation":"En mathématiques, 0 ≤ x ≤ 20 est une abréviation. En algorithmique, chaque comparaison produit un booléen : il faut deux comparaisons reliées par **ET**.","run":true},{"title":"Mal nier une condition","wrong":"// « la note n''est pas valide »\ninvalide ← (note < 0) ET (note > 20)","right":"// « la note n''est pas valide »\ninvalide ← (note < 0) OU (note > 20)","explanation":"D''après De Morgan, NON (a ET b) devient (NON a) **OU** (NON b). Une note ne peut pas être à la fois négative et supérieure à 20 : la version fautive vaut toujours FAUX.","run":false}],"solvedExercises":[{"title":"Table de vérité à trois variables","statement":"Construisez la table de vérité de (p OU q) ET NON r. Combien de lignes contient-elle ? Pour quelles valeurs est-elle vraie ?","solution":"| p | q | r | p OU q | NON r | résultat |\n|---|---|---|---|---|---|\n| V | V | V | V | F | F |\n| V | V | F | V | V | **V** |\n| V | F | V | V | F | F |\n| V | F | F | V | V | **V** |\n| F | V | V | V | F | F |\n| F | V | F | V | V | **V** |\n| F | F | V | F | F | F |\n| F | F | F | F | V | F |","explanation":"Avec 3 variables : 2³ = 8 lignes. Le résultat est vrai lorsque r est faux **et** qu''au moins une de p, q est vraie : 3 lignes sur 8."},{"title":"Simplifier avec De Morgan","statement":"Simplifiez la condition NON ((age < 18) OU (age > 25)) et traduisez-la en français.","solution":"NON ((age < 18) OU (age > 25))\n= (NON (age < 18)) ET (NON (age > 25))\n= (age >= 18) ET (age <= 25)","explanation":"La négation d''un OU devient un ET des négations ; la négation de « < » est « ≥ ». La condition signifie : « l''âge est compris entre 18 et 25 ans inclus »."}],"td":{"title":"TD 2 — Conditions et tables de vérité","instructions":"Chaque programme doit afficher exactement les valeurs demandées (VRAI ou FAUX). Testez plusieurs combinaisons d''entrées avant de soumettre.","exerciseSlugs":["algo-table-verite","algo-de-morgan"]},"project":{"title":"Contrôle d''accès à la bibliothèque","context":"La bibliothèque universitaire autorise l''accès si la carte est valide ET (la cotisation est payée OU l''usager a moins de 18 ans).","steps":["Traduire la règle en une condition logique.","Construire la table de vérité de la condition (8 cas).","Écrire l''algorithme sans SI, en affichant directement les booléens.","Tester les 8 cas avant de soumettre."],"deliverables":["Un algorithme qui affiche l''autorisation d''accès et la gratuité."],"exerciseSlug":"algo-projet-bibliotheque"}}'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'logique-interrogation', 'Interrogation — Logique', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'logique-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-interrogation'), 'qcm', 'Que vaut VRAI ET FAUX ?', null, '["VRAI","FAUX"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-interrogation'), 'qcm', 'Que vaut FAUX OU VRAI ?', null, '["VRAI","FAUX"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-interrogation'), 'qcm', 'NON (a OU b) est équivalent à…', null, '["NON a OU NON b","NON a ET NON b","a ET b","a OU NON b"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-interrogation'), 'qcm', 'Combien de lignes compte la table de vérité d''une expression à 3 variables ?', null, '["3","6","8","9"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-interrogation'), 'qcm', 'Quelle condition traduit « x n''est pas compris entre 1 et 9 (inclus) » ?', null, '["(x < 1) ET (x > 9)","(x < 1) OU (x > 9)","(x <= 1) OU (x >= 9)","NON x"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'logique-evaluation', 'Évaluation du chapitre 2', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'logique-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'vrai_faux', '« x + 2 » est une proposition.', null, '["Vrai","Faux"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Ce n''est ni vrai ni faux : c''est une expression numérique.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', 'Avec a = VRAI et b = FAUX, que vaut NON a OU b ?', null, '["VRAI","FAUX"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'NON a = FAUX, puis FAUX OU FAUX = FAUX.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', 'Comment se lit NON a ET b OU c ?', null, '["NON (a ET (b OU c))","((NON a) ET b) OU c","NON ((a ET b) OU c)","(NON a) ET (b OU c)"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', 'Quelle est la négation de (n MOD 2 = 0) ET (n > 0) ?', null, '["(n MOD 2 <> 0) ET (n <= 0)","(n MOD 2 <> 0) OU (n <= 0)","(n MOD 2 = 0) OU (n > 0)","n MOD 2 <> 0"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'vrai_faux', '« p OU q » est faux lorsque p et q sont vrais tous les deux.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Le OU logique est inclusif.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', 'Quel contre-exemple réfute « tout multiple de 3 est impair » ?', null, '["9","15","6","21"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', 'Quelle condition est toujours fausse, quelle que soit la valeur de x ?', null, '["(x > 5) OU (x <= 5)","(x > 5) ET (x < 3)","NON (x = x + 1)","(x >= 0) OU (x < 0)"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'logique-evaluation'), 'qcm', '« Si p alors q » est faux uniquement quand…', null, '["p est faux","q est vrai","p est vrai et q est faux","p et q sont faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'analyse-problemes', 'Analyse et résolution des problèmes', 'debutant', 120, array['Appliquer une méthode d''analyse : données, résultats, contraintes.', 'Rédiger une spécification avec préconditions et postconditions.', 'Décomposer un problème en étapes simples.', 'Construire un jeu d''essai, y compris des cas limites, avant de programmer.']::text[], array['Chapitre 1 — Introduction à l''algorithmique.', 'Chapitre 2 — Logique et raisonnement.']::text[], '## 1. Pourquoi analyser avant d''écrire ?

Face à un exercice, la tentation est d''écrire immédiatement des instructions. C''est la principale cause d''algorithmes faux : on résout un autre problème que celui posé, on oublie un cas, on se perd. Un informaticien passe souvent **plus de temps à comprendre** qu''à écrire. Ce chapitre donne une méthode que nous appliquerons dans toute la formation.

## 2. Étape 1 — Comprendre l''énoncé

Lisez l''énoncé au moins deux fois, puis répondez par écrit à trois questions :

1. **Quelles sont les données ?** (ce que l''on connaît ou ce qui sera lu) — avec leur nature : entier, réel, texte.
2. **Quels sont les résultats ?** (ce que l''on doit produire et sous quelle forme).
3. **Quelles sont les contraintes ?** (valeurs autorisées, format d''affichage, règles de calcul).

Puis **traitez un exemple à la main**. Si vous n''êtes pas capable de résoudre le problème avec un crayon pour un cas précis, vous ne pourrez pas l''expliquer à une machine.

## 3. Étape 2 — Spécifier

La **spécification** décrit ce que fait l''algorithme, sans dire comment :

- **Précondition** : ce qui doit être vrai sur les entrées pour que l''algorithme fonctionne (« n ≥ 0 », « le prix est positif »).
- **Postcondition** : ce qui est vrai à la fin (« total = n × prix »).

Exemple — rendu de monnaie :
*Entrée* : un montant m (entier, m ≥ 0, multiple de 100). *Sortie* : le nombre de billets de 5 000, 1 000 et 500 FC et de pièces de 100 FC, en utilisant le moins de billets possible. *Postcondition* : 5000 × b5000 + 1000 × b1000 + 500 × b500 + 100 × p100 = m.

## 4. Étape 3 — Décomposer

On découpe le problème en **sous-problèmes** assez simples pour être résolus directement. Pour le rendu de monnaie :

1. Calculer le nombre de billets de 5 000 : quotient de m par 5 000 ; il reste le reste.
2. Recommencer avec 1 000 sur ce reste, puis avec 500, puis avec 100.

Chaque étape utilise le **quotient** (DIV) et le **reste** (MOD), que nous étudierons en détail au chapitre 6. On choisit ensuite les **variables** : une par donnée, une par résultat, et des variables intermédiaires (ici, le reste à rendre).

## 5. Étape 4 — Construire un jeu d''essai

Avant même d''écrire l''algorithme, on prépare des **tests** : des entrées et les sorties attendues, calculées à la main.

| Entrée m | 5000 | 1000 | 500 | 100 | Pourquoi ce test ? |
|---|---|---|---|---|---|
| 7 600 | 1 | 2 | 1 | 1 | cas normal |
| 0 | 0 | 0 | 0 | 0 | cas limite : rien à rendre |
| 5 000 | 1 | 0 | 0 | 0 | valeur exacte d''un billet |
| 400 | 0 | 0 | 0 | 4 | uniquement des pièces |

Les **cas limites** (zéro, valeur minimale ou maximale, égalités) sont ceux où se cachent la plupart des erreurs. C''est aussi ce que font les tests automatiques de la plateforme, dont certains sont cachés.

## 6. Étape 5 — Écrire, exécuter, vérifier

On écrit l''algorithme étape par étape, en respectant la décomposition, puis on l''exécute sur **chaque** ligne du jeu d''essai. Si un résultat diffère, on fait une **trace** (tableau de suivi des variables) pour trouver la première instruction fautive. Enfin, on se relit : noms de variables parlants, commentaires utiles, affichage conforme à l''énoncé.

> Résumé de la méthode : **Comprendre → Spécifier → Décomposer → Tester (jeu d''essai) → Écrire → Vérifier.**', array['Analyser avant d''écrire : données, résultats, contraintes, exemple traité à la main.', 'La spécification fixe les préconditions (entrées valides) et les postconditions (résultat garanti).', 'Décomposer en sous-problèmes simples, puis choisir les variables.', 'Préparer un jeu d''essai avec des cas normaux et des cas limites avant de programmer.', 'Vérifier sur chaque test ; en cas d''écart, faire une trace des variables.']::text[], '[{"language":"pseudocode","title":"Rendu de monnaie","code":"ALGORITHME RenduMonnaie\nVARIABLES\n  m, reste, b5000, b1000, b500, p100 : ENTIER\nDEBUT\n  LIRE(m)\n  b5000 ← m DIV 5000\n  reste ← m MOD 5000\n  b1000 ← reste DIV 1000\n  reste ← reste MOD 1000\n  b500 ← reste DIV 500\n  reste ← reste MOD 500\n  p100 ← reste DIV 100\n  ECRIRE(\"5000 FC : \", b5000)\n  ECRIRE(\"1000 FC : \", b1000)\n  ECRIRE(\"500 FC : \", b500)\n  ECRIRE(\"100 FC : \", p100)\nFIN","stdin":"7600"}]'::jsonb, '{"competences":["Identifier données, résultats et contraintes","Rédiger préconditions et postconditions","Décomposer un problème en étapes","Construire un jeu d''essai avec des cas limites"],"definitions":[{"term":"Spécification","definition":"Description précise de ce que doit faire un algorithme (entrées, sorties, conditions), sans dire comment."},{"term":"Précondition","definition":"Propriété que les entrées doivent vérifier pour que l''algorithme donne un résultat correct."},{"term":"Postcondition","definition":"Propriété vérifiée par les résultats à la fin de l''exécution."},{"term":"Jeu d''essai","definition":"Ensemble d''entrées accompagnées des sorties attendues, calculées à l''avance, qui sert à tester un algorithme."},{"term":"Cas limite","definition":"Entrée située à la frontière du domaine (zéro, minimum, maximum, égalité) où les erreurs sont fréquentes."}],"commentedAlgorithms":[{"title":"Convertir une durée en semaines et jours","code":"ALGORITHME SemainesJours\nCONSTANTES\n  JOURS_PAR_SEMAINE = 7\nVARIABLES\n  total, semaines, jours : ENTIER\nDEBUT\n  LIRE(total)\n  semaines ← total DIV JOURS_PAR_SEMAINE\n  jours ← total MOD JOURS_PAR_SEMAINE\n  ECRIRE(semaines, \" semaine(s) et \", jours, \" jour(s)\")\nFIN","comments":{"1":"Données : un nombre de jours (entier ≥ 0). Résultats : semaines et jours restants.","3":"Une constante nommée rend la règle lisible.","5":"Une variable pour la donnée, une par résultat.","7":"Précondition supposée : total ≥ 0.","8":"Quotient entier : nombre de semaines complètes.","9":"Reste : jours qui ne forment pas une semaine.","10":"Postcondition : 7 × semaines + jours = total."},"stdin":"45","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Programmer avant de comprendre : ignorer les cas limites","wrong":"// Moyenne d''une liste de n notes\nmoyenne ← somme / n","right":"SI n > 0 ALORS\n  moyenne ← somme / n\nSINON\n  ECRIRE(\"Aucune note\")\nFINSI","explanation":"Le jeu d''essai aurait révélé le cas **n = 0** : une division par zéro. Précisez la précondition (n > 0) ou traitez le cas explicitement.","run":false},{"title":"Confondre l''exemple et le problème","wrong":"// Énoncé : afficher le double du nombre lu.\n// Exemple de l''énoncé : entrée 4, sortie 8.\nECRIRE(8)","right":"LIRE(n)\nECRIRE(n * 2)","explanation":"L''exemple sert à comprendre ; l''algorithme doit fonctionner pour **toutes** les entrées valides. Les tests cachés de la plateforme utilisent d''autres valeurs.","run":false}],"solvedExercises":[{"title":"Analyser un problème de facturation","statement":"Une connexion internet coûte 2 000 FC de frais fixes plus 150 FC par heure. Écrivez la spécification puis l''algorithme qui lit le nombre d''heures et affiche le montant. Proposez un jeu d''essai.","solution":"ALGORITHME FactureInternet\nCONSTANTES\n  FRAIS_FIXES = 2000\n  PRIX_HEURE = 150\nVARIABLES\n  heures, montant : ENTIER\nDEBUT\n  LIRE(heures)\n  montant ← FRAIS_FIXES + heures * PRIX_HEURE\n  ECRIRE(\"Montant : \", montant, \" FC\")\nFIN","explanation":"- **Précondition** : heures ≥ 0, entier.\n- **Postcondition** : montant = 2000 + 150 × heures.\n- **Jeu d''essai** : 0 h → 2 000 FC (cas limite) ; 10 h → 3 500 FC ; 1 h → 2 150 FC."},{"title":"Décomposer un problème","statement":"On veut afficher l''âge exact (en années) d''une personne à partir de son année de naissance et de l''année en cours, puis indiquer combien d''années il lui reste avant 60 ans. Décomposez le problème.","solution":"ALGORITHME AgeEtRetraite\nVARIABLES\n  naissance, annee, age, reste : ENTIER\nDEBUT\n  LIRE(naissance)\n  LIRE(annee)\n  age ← annee - naissance\n  reste ← 60 - age\n  ECRIRE(\"Age : \", age)\n  ECRIRE(\"Années avant 60 ans : \", reste)\nFIN","explanation":"Sous-problèmes : (1) lire les deux années, (2) calculer l''âge, (3) calculer l''écart avec 60, (4) afficher. Cas limite à discuter : une personne de plus de 60 ans obtient un nombre négatif — il faudra une condition (chapitre 8) pour l''afficher proprement."}],"td":{"title":"TD 3 — Analyser, spécifier, tester","instructions":"Avant d''écrire chaque algorithme, notez ses données, ses résultats et un jeu d''essai d''au moins trois cas (dont un cas limite).","exerciseSlugs":["algo-rendu-monnaie","algo-semaines-jours"]},"project":{"title":"Budget mensuel de l''étudiant","context":"Un étudiant veut savoir ce qu''il lui reste chaque mois après le loyer, le transport et les repas.","steps":["Lister données, résultats et contraintes ; écrire la postcondition.","Préparer un jeu d''essai de 3 cas dont un cas limite (reste nul).","Décomposer : dépenses de transport, dépenses de repas, total, reste.","Écrire, exécuter le jeu d''essai, soumettre."],"deliverables":["La spécification, le jeu d''essai et l''algorithme."],"exerciseSlug":"algo-projet-budget"}}'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'analyse-interrogation', 'Interrogation — Analyse des problèmes', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'analyse-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-interrogation'), 'qcm', 'Que décrit une précondition ?', null, '["Le résultat final","Les conditions que doivent vérifier les entrées","La liste des variables","Le nom de l''algorithme"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-interrogation'), 'qcm', 'Pour « afficher la moyenne de n notes », quel est le cas limite le plus important ?', null, '["n = 5","n = 0","une note de 15","n = 20"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-interrogation'), 'vrai_faux', 'Un jeu d''essai se prépare après avoir écrit le programme seulement.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-interrogation'), 'qcm', 'Quelle est la bonne suite d''étapes ?', null, '["Écrire, tester, comprendre","Comprendre, spécifier, décomposer, tester, écrire, vérifier","Décomposer, écrire, comprendre","Tester, écrire"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-interrogation'), 'qcm', 'Pour 45 jours, combien de semaines complètes ?', null, '["5","6","7","3"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'analyse-evaluation', 'Évaluation du chapitre 3', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'analyse-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Dans « calculer le prix TTC à partir du prix HT et du taux de TVA », quelles sont les données ?', null, '["Le prix TTC","Le prix HT et le taux de TVA","Seulement le taux","Aucune"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Quelle postcondition convient à un algorithme d''échange de deux variables a et b ?', null, '["a = b","La nouvelle valeur de a est l''ancienne de b, et inversement","a > b","a et b valent 0"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Pour rendre 7 600 FC, combien de billets de 1 000 FC (méthode du chapitre) ?', null, '["7","2","1","0"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'vrai_faux', 'Un algorithme qui affiche directement la sortie de l''exemple de l''énoncé est correct.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Pourquoi les tests cachés existent-ils sur la plateforme ?', null, '["Pour piéger l''étudiant","Pour vérifier que l''algorithme marche pour d''autres entrées que l''exemple","Pour accélérer l''exécution","Ils n''ont pas d''utilité"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Quelle entrée est un cas limite pour « nombre de jours → semaines et jours » ?', null, '["45","100","0","13"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Si un résultat de test est faux, quelle est la démarche la plus efficace ?', null, '["Réécrire tout l''algorithme","Faire une trace des variables pour trouver la première instruction fautive","Changer les tests","Ajouter des variables au hasard"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'analyse-evaluation'), 'qcm', 'Que vaut 5000 × b5000 + 1000 × b1000 + 500 × b500 + 100 × p100 à la fin du rendu de monnaie ?', null, '["Toujours 0","Le montant m","5000","Cela dépend"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'variables-constantes', 'Variables et constantes', 'debutant', 120, array['Déclarer des variables et des constantes avec un type.', 'Utiliser l''affectation ← et comprendre qu''elle écrase l''ancienne valeur.', 'Suivre l''état de la mémoire avec un tableau de suivi (trace).', 'Choisir des noms de variables corrects et parlants.']::text[], array['Chapitre 3 — Analyse et résolution des problèmes.']::text[], '## 1. La mémoire et les variables

Pendant l''exécution, l''ordinateur range les données dans sa **mémoire**. Une **variable** est un emplacement de cette mémoire auquel on donne un **nom**. Elle possède trois caractéristiques :

- un **nom** (ou identificateur), pour la désigner : **age**, **total** ;
- un **type**, qui fixe les valeurs autorisées : ENTIER, REEL… (chapitre 5) ;
- une **valeur**, qui peut **changer** au cours de l''exécution.

Image utile : une boîte étiquetée. L''étiquette est le nom, la forme de la boîte est le type, le contenu est la valeur. Une boîte ne contient **qu''une seule valeur à la fois**.

## 2. Déclarer avant d''utiliser

Toute variable est **déclarée** dans la section VARIABLES, avant DEBUT. Plusieurs variables de même type peuvent être déclarées sur une ligne :

~~~pseudocode
VARIABLES
  age : ENTIER
  prix, total : REEL
  nom : CHAINE
~~~

La déclaration réserve la place, mais **ne donne pas de valeur** : juste après la déclaration, la variable est « indéfinie ». L''utiliser dans un calcul provoque une erreur (« utilisée avant d''avoir reçu une valeur »). Il faut d''abord l''**initialiser**.

## 3. L''affectation

L''affectation range une valeur dans une variable. Elle s''écrit avec la flèche **←** (on peut taper **<-**) :

~~~pseudocode
age ← 19
total ← prix * 2
compteur ← compteur + 1
~~~

Elle se lit « **age reçoit 19** » et s''exécute en deux temps :

1. la partie **droite** est calculée avec les valeurs **actuelles** des variables ;
2. le résultat est rangé dans la variable de **gauche** ; son ancienne valeur est **perdue**.

Ainsi « compteur ← compteur + 1 » n''a rien d''absurde : on calcule l''ancienne valeur plus 1, puis on la range dans compteur. À gauche de la flèche, il y a toujours **une seule variable** ; « a + b ← 5 » n''a pas de sens.

> Le signe **=** sert à **comparer** (x = 5 est VRAI ou FAUX). Il ne sert jamais à affecter.

## 4. Les constantes

Une **constante** est une valeur nommée qui ne change jamais pendant l''exécution :

~~~pseudocode
CONSTANTES
  PI = 3.14159
  TAUX_TVA = 0.16
  NB_ETUDIANTS_MAX = 120
~~~

Avantages : l''algorithme est **plus lisible** (TAUX_TVA plutôt que 0.16), **plus sûr** (toute tentative de modification est une erreur) et **plus facile à faire évoluer** (si le taux change, on modifie une seule ligne). Par convention, on écrit les constantes en MAJUSCULES.

## 5. Choisir les noms

Règles imposées : commencer par une lettre ; n''utiliser que des lettres, des chiffres et « _ » ; pas d''espace ; pas de mot-clé (SI, POUR, FIN, DEBUT…). Bonnes pratiques : des noms **parlants** (**moyenneGenerale** plutôt que **m**), cohérents, sans accents si l''on veut traduire facilement en C ou en Java.

| Nom | Valide ? | Pourquoi |
|---|---|---|
| note_finale | oui | lettres et « _ » |
| 2emeNote | non | commence par un chiffre |
| note finale | non | contient un espace |
| fin | non | mot réservé |

## 6. Le tableau de suivi (trace)

Pour comprendre ou vérifier un algorithme, on suit l''évolution des variables **instruction par instruction** dans un tableau : une colonne par variable, une ligne par instruction exécutée. C''est l''outil n°1 pour trouver une erreur.

| Instruction | a | b | c |
|---|---|---|---|
| a ← 5 | 5 | ? | ? |
| b ← a + 2 | 5 | 7 | ? |
| c ← a * b | 5 | 7 | 35 |
| a ← c - b | 28 | 7 | 35 |

Sur la plateforme, l''onglet **Tableau de suivi** des algorithmes commentés est calculé par l''interpréteur lui-même : il montre l''état réel des variables avant chaque ligne.', array['Une variable a un nom, un type et une valeur qui peut changer ; elle ne contient qu''une valeur à la fois.', 'Toute variable est déclarée, puis initialisée avant d''être utilisée.', 'L''affectation ← calcule la partie droite puis écrase la valeur de la variable de gauche.', 'Une constante ne change jamais ; on l''écrit en majuscules.', 'Le tableau de suivi permet de vérifier un algorithme instruction par instruction.']::text[], '[{"language":"pseudocode","title":"Échanger deux variables","code":"ALGORITHME Echange\nVARIABLES\n  a, b, temp : ENTIER\nDEBUT\n  a ← 5\n  b ← 8\n  ECRIRE(\"Avant : a = \", a, \", b = \", b)\n  temp ← a\n  a ← b\n  b ← temp\n  ECRIRE(\"Après : a = \", a, \", b = \", b)\nFIN","explanation":"Sans temp, la valeur de a serait écrasée et perdue."},{"language":"pseudocode","title":"Constantes et surface d''un cercle","code":"ALGORITHME Cercle\nCONSTANTES\n  PI = 3.14159\nVARIABLES\n  rayon, surface : REEL\nDEBUT\n  LIRE(rayon)\n  surface ← PI * rayon * rayon\n  ECRIRE(\"Surface : \", surface)\nFIN","stdin":"2"}]'::jsonb, '{"competences":["Déclarer et initialiser des variables","Utiliser correctement l''affectation","Utiliser des constantes nommées","Réaliser la trace d''un algorithme"],"definitions":[{"term":"Variable","definition":"Emplacement mémoire nommé, d''un type donné, dont la valeur peut changer pendant l''exécution."},{"term":"Déclaration","definition":"Annonce du nom et du type d''une variable, dans la section VARIABLES, avant son utilisation."},{"term":"Initialisation","definition":"Première affectation d''une valeur à une variable."},{"term":"Affectation","definition":"Instruction **v ← expression** : l''expression est évaluée puis sa valeur remplace celle de v."},{"term":"Constante","definition":"Valeur nommée fixée dans la section CONSTANTES et qui ne peut pas être modifiée."},{"term":"Trace","definition":"Tableau de l''évolution des variables, instruction après instruction."}],"commentedAlgorithms":[{"title":"Permutation circulaire de trois variables","code":"ALGORITHME Rotation\nVARIABLES\n  a, b, c, temp : ENTIER\nDEBUT\n  LIRE(a)\n  LIRE(b)\n  LIRE(c)\n  temp ← a\n  a ← b\n  b ← c\n  c ← temp\n  ECRIRE(a, \" \", b, \" \", c)\nFIN","comments":{"1":"Objectif : a reçoit b, b reçoit c, c reçoit l''ancienne valeur de a.","3":"temp est une variable auxiliaire pour ne rien perdre.","5":"Lecture des trois valeurs initiales.","8":"On sauvegarde a AVANT de l''écraser.","9":"a prend la valeur de b ; l''ancienne valeur de a est dans temp.","10":"b prend la valeur de c.","11":"c reçoit l''ancienne valeur de a, sauvegardée.","12":"Pour 1, 2, 3 on obtient 2 3 1."},"stdin":"1\n2\n3","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Utiliser = pour affecter","wrong":"VARIABLES\n  x : ENTIER\nDEBUT\n  x = 3\nFIN","right":"VARIABLES\n  x : ENTIER\nDEBUT\n  x ← 3\nFIN","explanation":"**=** compare deux valeurs ; **←** range une valeur dans une variable.","run":true},{"title":"Échanger sans variable auxiliaire","wrong":"VARIABLES\n  a, b : ENTIER\nDEBUT\n  a ← 5\n  b ← 8\n  a ← b\n  b ← a\n  ECRIRE(a, \" \", b)\nFIN","right":"VARIABLES\n  a, b, temp : ENTIER\nDEBUT\n  a ← 5\n  b ← 8\n  temp ← a\n  a ← b\n  b ← temp\n  ECRIRE(a, \" \", b)\nFIN","explanation":"Après **a ← b**, l''ancienne valeur de a (5) est perdue : la version fautive affiche « 8 8 ». Faites la trace pour le constater.","run":true},{"title":"Modifier une constante","wrong":"CONSTANTES\n  TVA = 0.16\nDEBUT\n  TVA ← 0.18\nFIN","right":"CONSTANTES\n  TVA = 0.18\nDEBUT\n  ECRIRE(TVA)\nFIN","explanation":"Une constante ne peut pas recevoir de nouvelle valeur pendant l''exécution : si la règle change, on modifie sa définition.","run":true}],"solvedExercises":[{"title":"Trace à la main","statement":"Donnez la valeur finale de x, y et z :\n\n~~~pseudocode\nx ← 4\ny ← x * 2\nz ← y - x\nx ← z + y\ny ← y + 1\n~~~","solution":"| Instruction | x | y | z |\n|---|---|---|---|\n| x ← 4 | 4 | ? | ? |\n| y ← x * 2 | 4 | 8 | ? |\n| z ← y - x | 4 | 8 | 4 |\n| x ← z + y | 12 | 8 | 4 |\n| y ← y + 1 | 12 | 9 | 4 |","explanation":"Valeurs finales : **x = 12, y = 9, z = 4**. À chaque ligne, on utilise les valeurs de la ligne précédente du tableau."},{"title":"Mise à jour d''un compteur","statement":"Écrivez un algorithme qui lit le nombre de visiteurs du matin et celui de l''après-midi, les cumule dans une seule variable total en deux affectations, puis l''affiche.","solution":"ALGORITHME Visiteurs\nVARIABLES\n  matin, apresMidi, total : ENTIER\nDEBUT\n  LIRE(matin)\n  LIRE(apresMidi)\n  total ← 0\n  total ← total + matin\n  total ← total + apresMidi\n  ECRIRE(\"Total : \", total)\nFIN","explanation":"total est **initialisé à 0**, puis chaque affectation ajoute une valeur à l''ancienne. C''est le principe de l''**accumulateur**, que nous généraliserons avec les boucles."}],"td":{"title":"TD 4 — Variables, affectations et traces","instructions":"Faites d''abord la trace de votre algorithme sur l''exemple de l''énoncé, puis soumettez-le.","exerciseSlugs":["algo-permutation-circulaire","algo-solde-compte"]},"project":{"title":"Caisse enregistreuse simplifiée","context":"Une cantine enregistre trois articles et affiche le sous-total après chacun.","steps":["Déclarer une seule variable total et l''initialiser.","Après chaque lecture de prix, mettre à jour total et afficher le sous-total.","Faire la trace de l''algorithme sur l''exemple, puis soumettre."],"deliverables":["Un algorithme avec un accumulateur et un tableau de suivi."],"exerciseSlug":"algo-projet-caisse-simple"}}'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'variables-interrogation', 'Interrogation — Variables et constantes', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'variables-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-interrogation'), 'qcm', 'Après a ← 3 ; b ← a ; a ← 10, que vaut b ?', null, '["3","10","13","indéfini"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-interrogation'), 'qcm', 'Quel nom de variable est valide ?', null, '["2nombre","note finale","note_finale","SI"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-interrogation'), 'vrai_faux', 'On peut modifier une constante dans le programme principal.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-interrogation'), 'qcm', 'Que vaut x après x ← 5 ; x ← x * x - 1 ?', null, '["4","24","25","9"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-interrogation'), 'qcm', 'Que contient une variable juste après sa déclaration ?', null, '["0","une valeur indéfinie","une chaîne vide","1"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'variables-evaluation', 'Évaluation du chapitre 4', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'variables-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Que fait l''instruction total ← total + 5 ?', null, '["Compare total et total + 5","Ajoute 5 à la valeur de total","Provoque toujours une erreur","Remet total à 5"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Après a ← 2 ; b ← 3 ; a ← a + b ; b ← a - b ; a ← a - b, que valent a et b ?', null, '["a = 2, b = 3","a = 3, b = 2","a = 5, b = 2","a = 5, b = 3"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Ce procédé échange a et b sans variable auxiliaire (avec des nombres).' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'vrai_faux', '« a + b ← 7 » est une affectation correcte.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Pourquoi utiliser une constante TAUX_TVA plutôt que 0.16 ?', null, '["Le calcul est plus rapide","Lisibilité, sécurité et facilité de modification","C''est obligatoire","Pour économiser la mémoire"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Lequel est un mot réservé, interdit comme nom de variable ?', null, '["total","FIN","prix_ht","n1"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Une variable peut-elle contenir deux valeurs en même temps ?', null, '["Oui","Non"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Après x ← 1 ; y ← x + 1 ; x ← y * 3 ; y ← x - y, que vaut y ?', null, '["2","4","6","1"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'x = 1, y = 2, x = 6, y = 6 − 2 = 4.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'variables-evaluation'), 'qcm', 'Que signale l''interpréteur si une variable est lue dans un calcul avant toute affectation ?', null, '["Rien, elle vaut 0","Une erreur : utilisée avant d''avoir reçu une valeur","Un avertissement seulement","Il ignore l''instruction"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'fondements'), (select id from public.courses where slug = 'algorithmique'), 'types-donnees', 'Types de données', 'debutant', 100, array['Connaître les types ENTIER, REEL, CHAINE, CARACTERE et BOOLEEN.', 'Choisir le type adapté à chaque donnée d''un problème.', 'Comprendre la vérification des types et les conversions.']::text[], array['Chapitre 4 — Variables et constantes.']::text[], '## 1. Pourquoi des types ?

Le **type** d''une donnée indique l''ensemble des valeurs qu''elle peut prendre et les **opérations** autorisées. On peut multiplier deux nombres, mais pas deux prénoms ; on peut mettre un texte en majuscules, mais pas un nombre. Déclarer le type permet à la machine de réserver la bonne place en mémoire et de **détecter des erreurs** de raisonnement.

## 2. Les types simples

| Type | Valeurs | Exemples | Opérations typiques |
|---|---|---|---|
| ENTIER | nombres sans partie décimale | -3, 0, 42 | + - * DIV MOD, comparaisons |
| REEL | nombres à virgule | 3.14, -0.5, 12.0 | + - * /, comparaisons |
| CHAINE | suite de caractères (texte) | "Lubumbashi", "" | concaténation +, LONGUEUR |
| CARACTERE | un seul caractère | ''A'', ''7'', ''?'' | comparaison, ORD |
| BOOLEEN | VRAI ou FAUX | VRAI | ET, OU, NON |

Remarques :

- En pseudocode comme dans la plupart des langages, la virgule décimale s''écrit avec un **point** : 3.14.
- Une chaîne s''écrit entre guillemets doubles, un caractère entre apostrophes. "7" (texte) et 7 (nombre) sont **différents**.
- La chaîne vide "" ne contient aucun caractère ; elle est très utile pour construire un texte morceau par morceau.

## 3. Choisir le bon type

La question à se poser : **quelles valeurs** cette donnée peut-elle prendre, et **quels calculs** fera-t-on dessus ?

| Donnée | Type | Justification |
|---|---|---|
| nombre d''étudiants | ENTIER | on compte des unités entières |
| moyenne, prix, température | REEL | peut avoir une partie décimale |
| nom, adresse, matricule « UPL-2026-17 » | CHAINE | texte, même s''il contient des chiffres |
| réponse oui/non, « est admis » | BOOLEEN | deux valeurs possibles |
| initiale, mention (A, B, C) | CARACTERE | un seul symbole |

Un numéro de téléphone se déclare en CHAINE : on ne fait aucun calcul dessus, et un 0 initial serait perdu dans un ENTIER.

## 4. La vérification des types

L''interpréteur de la plateforme **vérifie les types** à chaque affectation, comme le font C et Java :

- ranger 7 / 2 (= 3.5, un REEL) dans un ENTIER est une **erreur** : il faut soit déclarer un REEL, soit utiliser la division entière DIV ;
- ranger un texte dans une variable numérique est une erreur ;
- en revanche, un ENTIER peut être rangé dans un REEL (5 devient 5.0).

Ces erreurs ne sont pas des tracasseries : elles signalent presque toujours un **défaut de raisonnement**.

## 5. Conversions

Les fonctions prédéfinies permettent de convertir explicitement :

| Fonction | Rôle | Exemple | Résultat |
|---|---|---|---|
| ENTIER(x) | partie entière (tronque) | ENTIER(7.9) | 7 |
| ARRONDI(x) | arrondi au plus proche | ARRONDI(7.5) | 8 |
| REEL(s) | texte → réel | REEL("2.5") | 2.5 |
| CHAINE(x) | valeur → texte | CHAINE(15) | "15" |

CHAINE est indispensable pour coller un nombre à un texte avec + : "Note : " + CHAINE(15). (Avec ECRIRE, il suffit de séparer les éléments par des virgules.)

## 6. Et en mémoire ?

Dans un ordinateur, tout est codé en **binaire**. Un ENTIER occupe en général 4 octets (de −2 147 483 648 à 2 147 483 647 en C) ; un REEL est stocké de façon approchée, ce qui explique que 0.1 + 0.2 ne vaut pas exactement 0.3 dans la plupart des langages. La plateforme arrondit l''affichage pour le pseudocode, mais vous retrouverez ce phénomène en Python, C et Java : on ne compare jamais deux réels avec = sans précaution.', array['Cinq types simples : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN.', 'Le type fixe les valeurs possibles et les opérations autorisées.', 'Un REEL ne peut pas être rangé dans un ENTIER ; un ENTIER peut l''être dans un REEL.', 'On convertit explicitement avec ENTIER, ARRONDI, REEL, CHAINE.', 'Un numéro (téléphone, matricule) se stocke en CHAINE : on ne calcule pas dessus.']::text[], '[{"language":"pseudocode","title":"Les cinq types","code":"ALGORITHME Types\nVARIABLES\n  annee : ENTIER\n  moyenne : REEL\n  ville : CHAINE\n  initiale : CARACTERE\n  admis : BOOLEEN\nDEBUT\n  annee ← 2026\n  moyenne ← 14.5\n  ville ← \"Lubumbashi\"\n  initiale ← ''U''\n  admis ← moyenne >= 10\n  ECRIRE(annee, \" | \", moyenne, \" | \", ville, \" | \", initiale, \" | \", admis)\nFIN"},{"language":"pseudocode","title":"Conversions","code":"ALGORITHME Conversions\nVARIABLES\n  x : REEL\n  texte : CHAINE\nDEBUT\n  x ← 7.6\n  ECRIRE(\"ENTIER(7.6) = \", ENTIER(x), \" ; ARRONDI(7.6) = \", ARRONDI(x))\n  texte ← \"Note : \" + CHAINE(15)\n  ECRIRE(texte)\n  ECRIRE(\"Longueur du texte : \", LONGUEUR(texte))\nFIN"}]'::jsonb, '{"competences":["Choisir le type de chaque donnée","Interpréter une erreur de type","Convertir entre types"],"definitions":[{"term":"Type","definition":"Ensemble de valeurs possibles et d''opérations autorisées pour une donnée."},{"term":"ENTIER","definition":"Type des nombres sans partie décimale : …, −2, −1, 0, 1, 2, …"},{"term":"REEL","definition":"Type des nombres pouvant avoir une partie décimale, représentés de façon approchée en machine."},{"term":"CHAINE","definition":"Type des textes : suite (éventuellement vide) de caractères, écrite entre guillemets."},{"term":"Conversion","definition":"Transformation explicite d''une valeur d''un type vers un autre (ENTIER, REEL, CHAINE…)."}],"commentedAlgorithms":[{"title":"Fiche de résultat d''un étudiant","code":"ALGORITHME FicheResultat\nVARIABLES\n  nom : CHAINE\n  note1, note2, moyenne : REEL\n  initiale : CARACTERE\n  admis : BOOLEEN\nDEBUT\n  LIRE(nom)\n  LIRE(note1)\n  LIRE(note2)\n  moyenne ← (note1 + note2) / 2\n  initiale ← nom[1]\n  admis ← moyenne >= 10\n  ECRIRE(initiale, \". \", nom, \" : \", moyenne, \" - admis : \", admis)\nFIN","comments":{"3":"Un texte : le nom de l''étudiant.","4":"Des notes décimales : type REEL.","5":"Un seul caractère.","6":"Deux valeurs possibles : VRAI ou FAUX.","8":"La ligne lue est rangée telle quelle (CHAINE).","9":"La valeur lue est convertie en REEL.","11":"La division / produit un REEL : compatible avec moyenne.","12":"nom[1] est le premier caractère du nom.","13":"Une comparaison produit un BOOLEEN."},"stdin":"Mwamba\n12\n15.5","showTrace":true}],"commonErrors":[{"title":"Ranger une division réelle dans un ENTIER","wrong":"VARIABLES\n  moyenne : ENTIER\nDEBUT\n  moyenne ← 27 / 2\nFIN","right":"VARIABLES\n  moyenne : REEL\nDEBUT\n  moyenne ← 27 / 2\nFIN","explanation":"27 / 2 vaut 13.5, un REEL. Déclarez la variable en REEL, ou utilisez **DIV** si vous voulez réellement le quotient entier (13).","run":true},{"title":"Additionner un texte et un nombre","wrong":"VARIABLES\n  message : CHAINE\nDEBUT\n  message ← \"Total : \" + 15\nFIN","right":"VARIABLES\n  message : CHAINE\nDEBUT\n  message ← \"Total : \" + CHAINE(15)\nFIN","explanation":"L''opérateur + additionne deux nombres **ou** concatène deux chaînes. Pour coller un nombre à un texte, convertissez-le avec CHAINE.","run":true}],"solvedExercises":[{"title":"Choisir les types","statement":"Proposez un type pour : (a) le nombre d''heures de cours, (b) le prix d''un livre, (c) le numéro de téléphone +243 99 000 0000, (d) « l''étudiant est boursier », (e) la mention A/B/C.","solution":"(a) ENTIER  (b) REEL  (c) CHAINE  (d) BOOLEEN  (e) CARACTERE","explanation":"Le numéro de téléphone est un **texte** : il commence par « + », contient des espaces et on ne fait aucun calcul dessus."},{"title":"Prévoir le résultat","statement":"Quelles instructions provoquent une erreur si x est un ENTIER ? (1) x ← 10 DIV 4 ; (2) x ← 10 / 4 ; (3) x ← ARRONDI(2.6) ; (4) x ← \"3\".","solution":"(2) et (4) provoquent une erreur.","explanation":"(1) DIV donne l''entier 2. (2) 10 / 4 = 2.5 est un REEL. (3) ARRONDI(2.6) = 3, un entier. (4) \"3\" est un texte, pas un nombre."}],"td":{"title":"TD 5 — Types et conversions","instructions":"Déclarez chaque variable avec le type le plus adapté. Une erreur de type signalée par l''interpréteur indique souvent un mauvais choix.","exerciseSlugs":["algo-initiales","algo-majeur"]},"project":{"title":"Fiche de résultats","context":"Le secrétariat veut une fiche normalisée : nom en majuscules, initiale du prénom, moyenne et décision.","steps":["Choisir le type de chaque donnée (CHAINE, REEL, BOOLEEN).","Construire l''identité « NOM P. » avec MAJUSCULE et l''indexation.","Calculer la moyenne et la décision, puis afficher la fiche."],"deliverables":["Un algorithme correctement typé, sans erreur de type."],"exerciseSlug":"algo-projet-fiche"}}'::jsonb, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'types-interrogation', 'Interrogation — Types de données', false, 60, 'publie', 'interrogation', 10, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'types-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-interrogation'), 'qcm', 'Quel type pour le prix d''un livre (12.50) ?', null, '["ENTIER","REEL","BOOLEEN","CARACTERE"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-interrogation'), 'qcm', 'Que vaut 15 >= 10 ?', null, '["15","10","VRAI","FAUX"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-interrogation'), 'vrai_faux', 'Une variable CARACTERE peut contenir "Bonjour".', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-interrogation'), 'qcm', 'Que vaut ENTIER(9.99) ?', null, '["10","9","9.99","erreur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-interrogation'), 'qcm', 'Quel type pour un numéro de téléphone ?', null, '["ENTIER","REEL","CHAINE","BOOLEEN"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'types-evaluation', 'Évaluation du chapitre 5', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'types-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Laquelle de ces affectations est correcte si n est un ENTIER ?', null, '["n ← 7 / 2","n ← 7 DIV 2","n ← \"7\"","n ← 3.5"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Que produit "UPL" + " Academy" ?', null, '["Une erreur","\"UPL Academy\"","\"UPL\"","6"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'vrai_faux', 'Un ENTIER peut être rangé dans une variable REEL.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Que vaut LONGUEUR("") ?', null, '["1","0","indéfini","erreur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Quelle est la différence entre 7 et "7" ?', null, '["Aucune","7 est un nombre, \"7\" est un texte","\"7\" est plus grand","7 est un caractère"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Que vaut ARRONDI(4.5) ?', null, '["4","5","4.5","erreur"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Quel type pour « le paiement des frais a été effectué » ?', null, '["CHAINE","ENTIER","BOOLEEN","REEL"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'types-evaluation'), 'qcm', 'Pourquoi éviter de comparer deux réels avec = ?', null, '["C''est interdit","Les réels sont stockés de façon approchée","Les réels n''ont pas de valeur","Cela ralentit"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
commit;
