-- Fichier généré par scripts/generate-seed.ts — ne pas modifier à la main.
-- Contenu pédagogique de référence d'UPL Code Academy.
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

Le **pseudocode** est une écriture structurée, proche du français, assez précise pour être exécutée, assez simple pour se concentrer sur la logique. Sur UPL Code Academy, il est **réellement interprété** : chaque exemple peut être exécuté avec le bouton **Exécuter**.

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

Les conventions de pseudocode varient d''un enseignant à l''autre ; celles de la plateforme sont décrites dans la référence du pseudocode et restent proches des usages universitaires francophones.', array['Un algorithme est une suite finie et non ambiguë d''instructions qui résout un problème.', 'Le programme est la traduction d''un algorithme dans un langage de programmation.', 'Un bon algorithme est fini, précis, correct, et si possible efficace.', 'La plupart des algorithmes suivent le schéma entrée → traitement → sortie.', 'Les instructions s''exécutent dans l''ordre, de haut en bas.']::text[], '[{"language":"pseudocode","title":"Premier algorithme","code":"ALGORITHME Bonjour\nDEBUT\n  ECRIRE(\"Bonjour et bienvenue à UPL Code Academy !\")\n  ECRIRE(\"Je suis votre premier algorithme.\")\nFIN","explanation":"Deux instructions ECRIRE, exécutées dans l''ordre : deux lignes s''affichent."},{"language":"pseudocode","title":"Entrée, traitement, sortie","code":"ALGORITHME HeuresEnMinutes\nVARIABLES\n  heures, minutes : ENTIER\nDEBUT\n  LIRE(heures)\n  minutes ← heures * 60\n  ECRIRE(heures, \" heure(s) = \", minutes, \" minutes\")\nFIN","stdin":"3","explanation":"LIRE prend la valeur 3 dans la zone « Entrée »."}]'::jsonb, '{"competences":["Distinguer problème, algorithme et programme","Reconnaître les propriétés d''un algorithme correct","Identifier entrées, traitement et sorties","Écrire et exécuter un algorithme séquentiel simple"],"definitions":[{"term":"Algorithme","definition":"Suite **finie** d''instructions **non ambiguës** qui, appliquée à des données d''entrée, produit un résultat en un temps fini."},{"term":"Programme","definition":"Traduction d''un algorithme dans un langage de programmation, exécutable par un ordinateur."},{"term":"Instruction","definition":"Ordre élémentaire donné à la machine : lire, écrire, calculer, ranger une valeur, tester une condition."},{"term":"Pseudocode","definition":"Écriture structurée d''un algorithme en langage proche du naturel, indépendante de tout langage de programmation."},{"term":"Exécution séquentielle","definition":"Exécution des instructions une par une, dans l''ordre où elles sont écrites."}],"commentedAlgorithms":[{"title":"Calcul de la moyenne de trois notes","code":"ALGORITHME MoyenneTroisNotes\nVARIABLES\n  n1, n2, n3, moyenne : REEL\nDEBUT\n  LIRE(n1)\n  LIRE(n2)\n  LIRE(n3)\n  moyenne ← (n1 + n2 + n3) / 3\n  ECRIRE(\"Moyenne : \", moyenne)\nFIN","comments":{"1":"En-tête : le nom décrit ce que fait l''algorithme.","2":"Début de la zone de déclaration.","3":"Quatre boîtes en mémoire pouvant contenir des nombres à virgule.","4":"Début des instructions exécutables.","5":"Entrée : la première note est lue et rangée dans n1.","6":"Entrée : deuxième note.","7":"Entrée : troisième note.","8":"Traitement : les parenthèses imposent d''additionner avant de diviser.","9":"Sortie : le texte puis la valeur calculée.","10":"Fin de l''algorithme : il se termine toujours (finitude)."},"stdin":"12\n15\n9","showTrace":true,"showFlowchart":true}],"commonErrors":[{"title":"Oublier le bloc DEBUT … FIN","wrong":"ALGORITHME Salut\nVARIABLES\n  x : ENTIER\nECRIRE(\"Salut\")","right":"ALGORITHME Salut\nDEBUT\n  ECRIRE(\"Salut\")\nFIN","explanation":"Dès qu''un algorithme a une structure (ALGORITHME, VARIABLES…), ses instructions doivent être placées entre **DEBUT** et **FIN**.","run":true},{"title":"Inverser l''ordre des instructions","wrong":"ALGORITHME Double\nVARIABLES\n  n, d : ENTIER\nDEBUT\n  d ← n * 2\n  LIRE(n)\n  ECRIRE(d)\nFIN","right":"ALGORITHME Double\nVARIABLES\n  n, d : ENTIER\nDEBUT\n  LIRE(n)\n  d ← n * 2\n  ECRIRE(d)\nFIN","explanation":"Les instructions s''exécutent dans l''ordre : on ne peut pas calculer avec **n** avant de l''avoir lu. L''interpréteur signale que la variable est utilisée avant d''avoir reçu une valeur.","run":true,"stdin":"5"}],"solvedExercises":[{"title":"Identifier entrées et sorties","statement":"Pour le problème « calculer le prix à payer pour n cahiers vendus 1 500 FC l''unité », indiquez les entrées, le traitement et la sortie, puis écrivez l''algorithme.","solution":"ALGORITHME PrixCahiers\nCONSTANTES\n  PRIX_UNITAIRE = 1500\nVARIABLES\n  n, total : ENTIER\nDEBUT\n  LIRE(n)\n  total ← n * PRIX_UNITAIRE\n  ECRIRE(\"A payer : \", total, \" FC\")\nFIN","explanation":"- **Entrée** : le nombre de cahiers n.\n- **Traitement** : multiplier n par le prix unitaire.\n- **Sortie** : le montant total.\n\nLe prix unitaire est une **constante** : il ne dépend pas de l''utilisateur."},{"title":"Une recette est-elle un algorithme ?","statement":"« Mettre de l''eau à chauffer. Ajouter du riz. Laisser cuire un moment. Saler à votre goût. » Cette recette respecte-t-elle les propriétés d''un algorithme ? Corrigez-la.","solution":"1. Faire chauffer 1 litre d''eau jusqu''à ébullition.\n2. Ajouter 250 g de riz.\n3. Laisser cuire 12 minutes.\n4. Ajouter 5 g de sel.\n5. Égoutter.","explanation":"La recette initiale n''est **pas précise** : « un moment » et « à votre goût » admettent plusieurs interprétations. Un algorithme doit indiquer des quantités et des durées exactes pour que deux personnes obtiennent le même résultat."}],"td":{"title":"TD 1 — Premiers algorithmes séquentiels","instructions":"Pour chaque exercice : identifiez d''abord les entrées et les sorties, écrivez l''algorithme, puis soumettez-le. La correction s''affiche après réussite.","exerciseSlugs":["algo-trois-lignes","algo-carre-perimetre"]},"project":{"title":"Carte de visite numérique","context":"Vous préparez la carte de présentation affichée sur votre profil étudiant.","steps":["Identifier les trois données à lire : prénom, filière, année d''études.","Écrire l''algorithme séquentiel qui affiche la carte, ligne par ligne.","Vérifier le format exact (bordures, espaces) puis soumettre."],"deliverables":["Un algorithme qui affiche une carte de 5 lignes conforme au modèle."],"exerciseSlug":"algo-projet-carte"}}'::jsonb, 'publie', 1, now())
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
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Combien de fois s''exécute le corps de POUR i DE 2 A 9 FAIRE ?', null, '["7","8","9","10"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Quelle boucle s''exécute toujours au moins une fois ?', null, '["POUR","TANT QUE","RÉPÉTER … JUSQU''À"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Avec note = 12, qu''affiche SI note >= 14 ALORS « Bien » SINON SI note >= 10 ALORS « Passable » SINON « Ajourné » FINSI ?', null, '["Bien","Passable","Ajourné","Passable puis Ajourné"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'À quelle valeur initialise-t-on un accumulateur de produit ?', null, '["0","1","-1","peu importe"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'T : TABLEAU[1..8] DE ENTIER. Quel accès provoque une erreur ?', null, '["T[1]","T[8]","T[0]","T[4]"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Pour trouver le maximum d''un tableau, on initialise le maximum avec…', null, '["0","la première case","la dernière case","-1"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Que vaut LONGUEUR("UPL Code") ?', null, '["7","8","3","2"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Dans un organigramme, quel symbole représente une décision ?', null, '["Rectangle","Losange","Ovale","Parallélogramme"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'vrai_faux', 'Une boucle TANT QUE dont la condition est fausse au départ n''exécute jamais son corps.', null, '["Vrai","Faux"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-2'), 'qcm', 'Quel schéma lit des valeurs jusqu''à une valeur d''arrêt ?', null, '["Une lecture avant la boucle et une à la fin du corps","Une seule lecture dans la condition","Une boucle POUR de 1 à 0","Aucune boucle"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'algorithmique'), 3, 'Niveau 3 — Intermédiaire : décomposer et résoudre', 'Concepts approfondis : sous-programmes, récursivité, algorithmes de recherche et de tri, résolution de problèmes complets, bonnes pratiques et débogage.', array['Découper un problème en fonctions et procédures.', 'Écrire et analyser des fonctions récursives.', 'Programmer les recherches et les tris classiques.', 'Mener la résolution d''un problème complet et le déboguer.']::text[], array['Débogage méthodique et invariants de boucle', 'Tri fusion et tri rapide']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-examen-niveau-3', 'Examen du niveau 3 — Décomposer et résoudre', false, 70, 'publie', 'examen_niveau', null, 3)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-examen-niveau-3');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Quelle est la différence entre une fonction et une procédure ?', null, '["La fonction retourne une valeur","La procédure est récursive","La fonction n''a pas de paramètres","Aucune"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Que permet le mot-clé VAR devant un paramètre ?', null, '["Le rendre constant","Le passer par référence","Le rendre facultatif","Le déclarer global"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Que se passe-t-il si une fonction récursive n''atteint jamais son cas de base ?', null, '["Elle retourne 0","Les appels s''accumulent jusqu''à l''erreur","Elle s''arrête après 10 appels","Rien"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Que retourne fact(4) avec fact(0) = 1 et fact(n) = n × fact(n − 1) ?', null, '["4","10","24","16"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'vrai_faux', 'La recherche dichotomique exige un tableau trié.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Combien de comparaisons au plus pour une dichotomie sur 1 000 éléments ?', null, '["environ 10","environ 100","500","1 000"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Dans le tri à bulles, après le premier passage…', null, '["le plus petit élément est en première position","le plus grand élément est en dernière position","le tableau est trié","rien n''est garanti"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Quelle est la bonne méthode face à un problème complexe ?', null, '["Écrire tout le code d''un coup","Comprendre, décomposer, tester avec des cas limites","Copier une solution","Commencer par l''affichage"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Une variable déclarée dans une fonction est…', null, '["visible partout","locale à la fonction","constante","globale"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-examen-niveau-3'), 'qcm', 'Quel cas limite tester en priorité pour un tri ?', null, '["Un tableau de 1 000 éléments","Un tableau d''un seul élément ou déjà trié","Un tableau de 10 éléments","Aucun"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'algorithmique'), 4, 'Niveau 4 — Professionnel : efficacité et grands problèmes', 'Complexité, optimisation, structures de données avancées et projets de synthèse : les outils pour concevoir des solutions efficaces à des problèmes de grande taille.', array['Analyser la complexité d''un algorithme.', 'Optimiser un algorithme et justifier le gain.', 'Choisir et implémenter des structures de données adaptées.', 'Réaliser un projet algorithmique de synthèse.']::text[], array['Structures de données : piles, files et listes chaînées', 'Optimisation d''algorithmes', 'Introduction aux graphes et aux parcours', 'Preuve de correction et invariants', 'Projet de synthèse']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-positionnement', 'Test de positionnement — Algorithmique', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Qu''est-ce qu''une variable ?', null, '["Un emplacement mémoire nommé dont la valeur peut changer","Un mot-clé","Une condition","Un fichier"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Que vaut 17 MOD 5 ?', null, '["3","2","3.4","12"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Que vaut (VRAI OU FAUX) ET FAUX ?', null, '["VRAI","FAUX"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Combien de fois s''exécute POUR i DE 1 A 10 PAS 2 FAIRE ?', null, '["5","10","4","6"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Quelle est la valeur finale de s ? s ← 0 ; POUR i DE 1 A 4 FAIRE s ← s + i FINPOUR', null, '["4","10","16","0"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Que vaut le 3e caractère de "ALGO" (indices à partir de 1) ?', null, '["L","G","O","A"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Quel est le rôle du cas de base d''une fonction récursive ?', null, '["Accélérer le calcul","Arrêter la suite des appels","Déclarer les variables","Afficher le résultat"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Une procédure qui doit modifier une variable de l''appelant prend un paramètre…', null, '["par valeur","par référence (VAR)","constant","global"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'vrai_faux', 'La recherche dichotomique fonctionne sur un tableau non trié.', null, '["Vrai","Faux"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Quelle est la complexité du tri par sélection ?', null, '["O(n)","O(log n)","O(n²)","O(1)"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Quelle structure respecte « dernier entré, premier sorti » ?', null, '["La file","La pile","Le tableau trié","La liste"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-positionnement'), 'qcm', 'Passer de O(n²) à O(n log n) pour n = 1 000 000 réduit le nombre d''opérations d''environ…', null, '["2 fois","10 fois","50 000 fois","rien"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'algorithmique'), null, 'algorithmique-evaluation-finale', 'Évaluation finale — Algorithmique', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'algorithmique-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Que vaut x après : x ← 5 ; x ← x * 2 + 1 ?', null, '["5","10","11","12"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Que vaut 23 DIV 4 ?', null, '["5","5.75","3","6"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Combien de fois s''affiche « * » ?', 'POUR i DE 1 A 3 FAIRE
  POUR j DE 1 A 4 FAIRE
    ECRIRE("*")
  FINPOUR
FINPOUR', '["3","4","12","7"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'vrai_faux', 'RÉPÉTER … JUSQU''À exécute toujours son corps au moins une fois.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quel est l''indice de la dernière case de T : TABLEAU[1..20] DE ENTIER ?', null, '["19","20","21","0"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quelle est la complexité de la recherche dichotomique ?', null, '["O(n)","O(n²)","O(log n)","O(1)"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'vrai_faux', 'Une fonction récursive doit avoir un cas de base.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'algorithmique-evaluation-finale'), 'qcm', 'Quelle condition teste qu''un nombre n est pair ?', null, '["n DIV 2 = 0","n MOD 2 = 0","n / 2 = 0","n MOD 2 = 1"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== HTML =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('html', 'html', (select id from public.course_categories where slug = 'web'), 'Parcours HTML', 'HTML', 'Structurer le contenu des pages web.', 'HTML est le langage qui décrit la structure et le sens du contenu d''une page web : titres, paragraphes, listes, liens, images, tableaux, formulaires. Ce parcours part de zéro et mène jusqu''à des pages accessibles, sémantiques et prêtes pour la production. Chaque exemple s''affiche en direct dans UPL IDE.', 'debutant', array['Savoir utiliser un navigateur web. Aucune connaissance en programmation n''est nécessaire.']::text[], array['Écrire des documents HTML valides et bien structurés.', 'Utiliser les éléments adaptés au sens du contenu (sémantique).', 'Créer des liens, insérer des images, des tableaux et des formulaires.', 'Produire des pages accessibles à tous les utilisateurs.']::text[], 30, 'publie', 2, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'html'), 'premiers-pas', 'Premiers pas en HTML', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'html') and slug = 'premiers-pas'), (select id from public.courses where slug = 'html'), 'html-introduction-web', 'Le web et le langage HTML', 'debutant', 75, array['Expliquer le rôle du navigateur, du serveur et d''une URL.', 'Distinguer les rôles de HTML, CSS et JavaScript.', 'Reconnaître une balise, un élément et un attribut.', 'Écrire et afficher une première page.']::text[], array['Savoir ouvrir une page web dans un navigateur.']::text[], '## 1. Comment fonctionne le web ?

Quand vous tapez une adresse comme **https://www.exemple.cd/cours.html** dans votre navigateur (Chrome, Firefox, Safari…), celui-ci envoie une **requête** à un ordinateur distant appelé **serveur**. Le serveur répond en envoyant un **fichier texte** écrit en HTML. Le navigateur lit ce fichier et le **dessine** à l''écran : c''est le **rendu**.

- **Client** : votre navigateur, qui demande et affiche les pages.
- **Serveur** : l''ordinateur qui stocke et envoie les pages.
- **URL** (adresse) : elle indique le protocole (**https**), le nom du site (**www.exemple.cd**) et le chemin du fichier (**/cours.html**).

## 2. Trois langages, trois rôles

| Langage | Rôle | Image |
|---|---|---|
| HTML | la **structure** et le sens du contenu | le squelette d''une maison |
| CSS | la **présentation** : couleurs, tailles, mise en page | la peinture et la décoration |
| JavaScript | le **comportement** : réactions aux clics, calculs | l''électricité qui fait fonctionner les appareils |

HTML n''est pas un langage de programmation : il ne calcule rien, il **décrit**. C''est un **langage de balisage** (HyperText Markup Language).

## 3. Balises, éléments et attributs

HTML entoure le contenu de **balises** écrites entre chevrons :

~~~html
<p>Bienvenue à UPL Code Academy</p>
~~~

- **`<p>`** est la balise **ouvrante**, **`</p>`** la balise **fermante** (avec une barre oblique).
- L''ensemble balise ouvrante + contenu + balise fermante forme un **élément** : ici un paragraphe.
- Certains éléments sont **vides** et n''ont pas de balise fermante : **`<br>`** (retour à la ligne), **`<img>`** (image).

Une balise ouvrante peut porter des **attributs**, qui précisent l''élément. Ils s''écrivent **nom="valeur"** :

~~~html
<a href="https://www.upl-univ.ac">Site de l''université</a>
~~~

Ici, l''attribut **href** indique la destination du lien.

## 4. L''imbrication

Les éléments peuvent contenir d''autres éléments : on dit qu''ils sont **imbriqués**. La règle d''or : **le dernier ouvert est le premier fermé**.

~~~html
<p>Le HTML est <strong>indispensable</strong>.</p>   <!-- correct -->
<p>Le HTML est <strong>indispensable.</p></strong>   <!-- incorrect -->
~~~

Le navigateur essaie de corriger les erreurs, mais le résultat devient imprévisible. On écrit donc toujours un HTML **bien formé**.

## 5. Votre première page

Une page HTML est un simple fichier texte, souvent nommé **index.html**. Dans UPL IDE, choisissez le langage **HTML** : l''aperçu se met à jour pendant que vous tapez. Le chapitre suivant détaille la structure complète d''un document ; pour l''instant, retenez qu''une page commence par **`<!DOCTYPE html>`** et que le contenu visible se place dans **`<body>`**.

## 6. Les commentaires

Un commentaire HTML s''écrit **`<!-- ainsi -->`**. Il n''est pas affiché par le navigateur, mais il reste visible pour quiconque consulte le code source de la page : n''y mettez jamais d''information confidentielle.

## 7. Inspecter une page réelle

Tous les navigateurs permettent de lire le HTML d''une page : clic droit puis **Afficher le code source**, ou la touche **F12** pour ouvrir les **outils de développement**. L''onglet **Éléments** (ou **Inspecteur**) montre l''arbre des éléments tel que le navigateur l''a compris, après correction d''éventuelles erreurs. Prenez l''habitude de comparer votre code à cet arbre : un élément mal fermé y apparaît souvent à un endroit inattendu.

**Méthode de travail recommandée :**
1. écrire quelques lignes ;
2. regarder l''aperçu ;
3. corriger avant d''aller plus loin.

Avancer par petites étapes évite d''avoir à chercher une erreur dans cent lignes.', array['Le navigateur (client) demande une page au serveur et dessine le HTML reçu.', 'HTML structure, CSS présente, JavaScript fait agir.', 'Un élément = balise ouvrante + contenu + balise fermante ; certains éléments sont vides.', 'Les attributs (nom="valeur") précisent un élément.', 'Le dernier élément ouvert est le premier fermé.']::text[], '[{"language":"html","title":"Première page","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Ma première page</title>\n</head>\n<body>\n  <h1>Bonjour UPL !</h1>\n  <p>Ceci est ma <strong>première</strong> page web.</p>\n  <p>Visitez le <a href=\"https://developer.mozilla.org/fr/\">site de référence MDN</a>.</p>\n</body>\n</html>","explanation":"Modifiez le texte dans l''éditeur : l''aperçu se met à jour automatiquement."}]'::jsonb, '{"competences":["Expliquer le fonctionnement client / serveur","Reconnaître balises, éléments et attributs","Écrire du HTML bien imbriqué"],"definitions":[{"term":"HTML","definition":"HyperText Markup Language : langage de balisage qui décrit la structure et le sens du contenu d''une page web."},{"term":"Balise","definition":"Marque entre chevrons (**`<p>`**, **`</p>`**) qui délimite un élément."},{"term":"Élément","definition":"Ensemble formé d''une balise ouvrante, d''un contenu et d''une balise fermante (ou d''une seule balise pour un élément vide)."},{"term":"Attribut","definition":"Information supplémentaire placée dans la balise ouvrante sous la forme nom=\"valeur\"."},{"term":"Navigateur","definition":"Logiciel qui demande les pages aux serveurs et les affiche (rendu)."}],"commentedAlgorithms":[{"title":"Anatomie d''une page minimale","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Accueil</title>\n</head>\n<body>\n  <h1>UPL Code Academy</h1>\n  <p>Apprendre à coder, pas à pas.</p>\n</body>\n</html>","comments":{"1":"Indique au navigateur qu''il s''agit d''un document HTML moderne.","2":"Élément racine ; l''attribut lang annonce le français (lecteurs d''écran, traduction).","3":"En-tête : informations sur la page, non affichées dans le contenu.","4":"Encodage : les accents s''affichent correctement.","5":"Titre affiché dans l''onglet du navigateur.","7":"Corps : tout le contenu visible.","8":"Titre principal de la page.","9":"Un paragraphe.","10":"Fermeture du corps…","11":"… puis de la racine : le dernier ouvert est le premier fermé."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Oublier la barre oblique de la balise fermante","wrong":"<p>Bonjour<p>","right":"<p>Bonjour</p>","explanation":"Sans **`</p>`**, le navigateur ouvre un second paragraphe vide au lieu de fermer le premier.","run":false},{"title":"Mal imbriquer les éléments","wrong":"<p><strong>Important</p></strong>","right":"<p><strong>Important</strong></p>","explanation":"Le dernier élément ouvert (**strong**) doit être fermé en premier.","run":false}],"solvedExercises":[{"title":"Repérer les composants","statement":"Dans **`<a href=\"contact.html\">`Nous écrire`</a>`**, nommez la balise ouvrante, l''attribut, sa valeur et le contenu.","solution":"Balise ouvrante : <a href=\"contact.html\">\nAttribut : href\nValeur : contact.html\nContenu : Nous écrire\nBalise fermante : </a>","explanation":"L''élément **a** (ancre) crée un lien ; **href** indique sa destination."},{"title":"Corriger un code","statement":"Corrigez : **`<h1>`Mon site`<h1>` `<p>`Texte `<em>`important`</p>``</em>`**","solution":"<h1>Mon site</h1>\n<p>Texte <em>important</em></p>","explanation":"La première balise h1 n''était pas fermée ; **em** doit être fermé avant **p**."}],"td":{"title":"TD 1 — Premiers éléments","instructions":"Écrivez le code dans l''éditeur et observez l''aperçu avant de soumettre. La correction vérifie la structure du document.","exerciseSlugs":["html-titre-et-texte","html-lien-mdn"]},"project":{"title":"Ma page de présentation","context":"Créer sa propre page de présentation, première brique de son portfolio.","steps":["Écrire le titre principal avec son prénom.","Rédiger un paragraphe de présentation avec un mot important.","Ajouter un lien vers un site de référence et un commentaire d''auteur.","Vérifier l''imbrication dans l''aperçu, puis soumettre."],"deliverables":["Une page index.html vérifiée par les tests automatiques."],"exerciseSlug":"html-projet-presentation"}}'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html-introduction-interrogation', 'Interrogation — Le web et HTML', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-introduction-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-interrogation'), 'qcm', 'Quel langage décrit la structure d''une page ?', null, '["CSS","HTML","JavaScript","Python"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-interrogation'), 'qcm', 'Dans <img src="logo.png">, src est…', null, '["une balise","un attribut","un élément fermant","un commentaire"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-interrogation'), 'vrai_faux', '<br> a besoin d''une balise fermante </br>.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-interrogation'), 'qcm', 'Quelle imbrication est correcte ?', null, '["<p><em>a</p></em>","<p><em>a</em></p>","<em><p>a</em></p>","<p>a<em></p>"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html-introduction-evaluation', 'Évaluation — Le web et HTML', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-introduction-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Que fait le navigateur ?', null, '["Il stocke les sites","Il demande les pages et les affiche","Il écrit le HTML","Il compile le code"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Dans https://www.exemple.cd/cours.html, quel est le chemin du fichier ?', null, '["https","www.exemple.cd","/cours.html","cd"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Quel rôle joue CSS ?', null, '["La structure","La présentation","Le comportement","Le stockage"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Comment s''écrit un attribut ?', null, '["nom:valeur","nom=\"valeur\"","(nom valeur)","nom->valeur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'vrai_faux', 'HTML est un langage de programmation qui effectue des calculs.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Comment écrit-on un commentaire HTML ?', null, '["// commentaire","/* commentaire */","<!-- commentaire -->","# commentaire"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-introduction-evaluation'), 'qcm', 'Quel élément est vide (sans balise fermante) ?', null, '["<p>","<img>","<h1>","<a>"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'html') and slug = 'premiers-pas'), (select id from public.courses where slug = 'html'), 'html-structure-document', 'Structure d''un document HTML', 'debutant', 75, array['Écrire le squelette complet d''un document HTML.', 'Expliquer le rôle du DOCTYPE, de head et de body.', 'Renseigner la langue, l''encodage, le titre et le viewport.', 'Organiser son code (indentation, commentaires).']::text[], array['Chapitre 1 — Le web et le langage HTML.']::text[], '## 1. Le squelette d''une page

Tout document HTML suit la même structure :

~~~html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Titre de la page</title>
</head>
<body>
  <!-- contenu visible -->
</body>
</html>
~~~

## 2. Le DOCTYPE

**`<!DOCTYPE html>`** est la toute première ligne. Ce n''est pas une balise : c''est une **déclaration** qui indique au navigateur d''utiliser le mode standard (HTML5). Sans elle, les navigateurs passent en mode « quirks » (compatibilité avec de très vieux sites) et certains rendus changent.

## 3. L''élément html et la langue

**`<html>`** est l''élément **racine** : il contient tout le document. Son attribut **lang** indique la langue principale : **lang="fr"** pour le français. Cette information est utilisée par les lecteurs d''écran (pour prononcer correctement), les moteurs de recherche et les outils de traduction.

## 4. L''en-tête : head

**`<head>`** contient des **métadonnées**, c''est-à-dire des informations sur la page, qui ne sont pas affichées dans son contenu :

| Élément | Rôle |
|---|---|
| `<meta charset="utf-8">` | encodage des caractères : indispensable pour les accents |
| `<meta name="viewport" …>` | adaptation à la largeur des téléphones |
| `<title>` | titre de l''onglet, des favoris et des résultats de recherche |
| `<link rel="stylesheet" href="style.css">` | feuille de style CSS (parcours CSS) |

Le **title** est obligatoire et doit décrire précisément la page : « Inscription — UPL Code Academy » plutôt que « Page ».

## 5. Le corps : body

**`<body>`** contient **tout le contenu visible** : textes, images, liens, formulaires. Il n''y a qu''un seul body par document. Plus tard, on y placera aussi les éléments de structure **header**, **main** et **footer**.

## 6. Écrire un code lisible

- **Indentez** : décalez de deux espaces le contenu d''un élément. L''indentation ne change pas l''affichage, mais rend l''imbrication visible.
- **Écrivez les balises en minuscules** et les valeurs d''attributs entre guillemets.
- **Validez** votre page avec le validateur du W3C (validator.w3.org) : il signale les balises non fermées et les attributs inconnus.
- Les espaces et retours à la ligne multiples dans le texte sont réduits à **un seul espace** à l''affichage : pour changer de paragraphe, on utilise un nouvel élément **p**, pas des lignes vides.

## 7. Vérifier la validité d''un document

Le **validateur du W3C** (validator.w3.org) analyse une page et signale les erreurs : balise non fermée, attribut inconnu, élément obligatoire manquant. Un document **valide** s''affiche de la même façon dans tous les navigateurs et reste lisible par les moteurs de recherche et les lecteurs d''écran.

Les trois oublis les plus fréquents en début de formation :
- l''absence de **`<!DOCTYPE html>`**, qui fait passer le navigateur en mode de compatibilité (« quirks mode ») ;
- l''absence de **`<meta charset="utf-8">`**, qui produit des caractères accentués illisibles ;
- un **`<title>`** vide, qui laisse l''onglet du navigateur sans nom.

Dans UPL, la correction automatique vérifie la présence et la place de ces éléments.', array['Un document commence par <!DOCTYPE html> puis l''élément racine <html lang="fr">.', 'head contient les métadonnées : charset, viewport, title ; body contient le contenu visible.', 'Le titre (title) apparaît dans l''onglet et dans les moteurs de recherche.', 'Indenter et valider son code évite les erreurs d''imbrication.']::text[], '[{"language":"html","title":"Squelette complet","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Inscription — UPL Code Academy</title>\n</head>\n<body>\n  <h1>Inscription</h1>\n  <p>Les espaces    multiples     sont réduits à un seul.</p>\n  <p>Un nouveau paragraphe commence ici.</p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Écrire le squelette d''un document","Renseigner les métadonnées essentielles","Écrire un code lisible et valide"],"definitions":[{"term":"DOCTYPE","definition":"Déclaration placée en première ligne qui active le mode standard du navigateur."},{"term":"Élément racine","definition":"L''élément **html**, qui contient tout le document."},{"term":"Métadonnées","definition":"Informations sur la page (encodage, titre, viewport…) placées dans **head** et non affichées dans le contenu."},{"term":"Encodage (charset)","definition":"Manière de représenter les caractères ; UTF-8 permet d''afficher les accents et tous les alphabets."}],"commentedAlgorithms":[{"title":"Une page d''accueil complète","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Accueil — Club informatique</title>\n</head>\n<body>\n  <!-- En-tête de la page -->\n  <h1>Club informatique de l''UPL</h1>\n  <p>Réunion chaque vendredi à 14 h.</p>\n</body>\n</html>","comments":{"1":"Mode standard.","2":"Langue : français.","4":"Sans cette ligne, « é » peut s''afficher « Ã© ».","5":"Sur téléphone, la page prend la largeur de l''écran au lieu d''être réduite.","6":"Titre précis : page et site.","8":"Début du contenu visible.","9":"Commentaire : invisible dans le rendu.","13":"Fin du document."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Mettre du contenu visible dans head","wrong":"<head>\n  <h1>Bienvenue</h1>\n</head>","right":"<head>\n  <title>Bienvenue</title>\n</head>\n<body>\n  <h1>Bienvenue</h1>\n</body>","explanation":"head ne contient que des métadonnées. Le contenu visible va dans **body**.","run":false},{"title":"Oublier l''encodage","wrong":"<head>\n  <title>Résumé</title>\n</head>","right":"<head>\n  <meta charset=\"utf-8\">\n  <title>Résumé</title>\n</head>","explanation":"Sans **charset=\"utf-8\"**, les accents peuvent être mal affichés selon le serveur.","run":false}],"solvedExercises":[{"title":"Ordonner un squelette","statement":"Remettez dans l''ordre : `</body>`, `<head>`, `<!DOCTYPE html>`, `</html>`, `<body>`, `<html lang=\"fr\">`, `</head>`, `<title>`T`</title>`.","solution":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <title>T</title>\n</head>\n<body>\n</body>\n</html>","explanation":"DOCTYPE d''abord ; html contient head puis body ; chaque élément est fermé dans l''ordre inverse de son ouverture."},{"title":"Choisir un bon titre","statement":"Proposez un title pour la page des horaires de la bibliothèque du site UPL Code Academy.","solution":"<title>Horaires de la bibliothèque — UPL Code Academy</title>","explanation":"Un bon titre décrit la page puis le site : il est lisible dans un onglet et utile dans les résultats de recherche."}],"td":{"title":"TD 2 — Squelettes de documents","instructions":"Chaque page doit être un document complet et valide.","exerciseSlugs":["html-meta-viewport","html-commentaire-titre"]},"project":{"title":"Page d''accueil d''un département","context":"Le département d''informatique veut une page d''accueil correctement structurée et lisible sur téléphone.","steps":["Écrire le squelette complet.","Renseigner langue, encodage, viewport et titre.","Ajouter le titre principal et deux paragraphes.","Soumettre et corriger d''après les vérifications."],"deliverables":["Un document HTML complet et valide."],"exerciseSlug":"html-projet-accueil"}}'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html-structure-interrogation', 'Interrogation — Structure d''un document', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-structure-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-interrogation'), 'qcm', 'Quelle est la première ligne d''un document HTML5 ?', null, '["<html>","<!DOCTYPE html>","<head>","<meta charset=\"utf-8\">"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-interrogation'), 'qcm', 'Où place-t-on le titre de l''onglet ?', null, '["dans body","dans un h1","dans head, avec title","dans le DOCTYPE"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-interrogation'), 'vrai_faux', 'Un document peut contenir plusieurs éléments body.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-interrogation'), 'qcm', 'À quoi sert lang="fr" ?', null, '["À traduire la page","À indiquer la langue du contenu","À changer la police","À rien"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html-structure-evaluation', 'Évaluation — Structure d''un document', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-structure-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Quel élément contient tout le document ?', null, '["body","head","html","main"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Que contient head ?', null, '["Le contenu visible","Des métadonnées","Les images","Les liens du menu"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Quel encodage recommande-t-on ?', null, '["ASCII","UTF-8","Latin-1","Base64"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Que fait la meta viewport ?', null, '["Elle ajoute une image","Elle adapte la page à la largeur des téléphones","Elle définit la langue","Elle cache la page"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'vrai_faux', 'Plusieurs espaces dans un paragraphe s''affichent comme un seul.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Quel outil vérifie la validité d''une page ?', null, '["Le validateur du W3C","Un antivirus","Le gestionnaire de tâches","Un tableur"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-structure-evaluation'), 'qcm', 'Que se passe-t-il sans DOCTYPE ?', null, '["La page ne s''affiche pas","Le navigateur passe en mode de compatibilité « quirks »","Les images disparaissent","Rien du tout"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'html') and slug = 'premiers-pas'), (select id from public.courses where slug = 'html'), 'html-textes-listes', 'Titres, paragraphes et listes', 'debutant', 90, array['Hiérarchiser un contenu avec les titres h1 à h6.', 'Structurer un texte en paragraphes et mettre en valeur avec strong et em.', 'Créer des listes à puces, numérotées et imbriquées.']::text[], array['Chapitre 2 — Structure d''un document HTML.']::text[], '## 1. Les titres : h1 à h6

HTML propose six niveaux de titres, du plus important (**h1**) au moins important (**h6**). Ils forment le **plan** de la page, comme les titres d''un mémoire :

~~~html
<h1>Cours d''algorithmique</h1>
  <h2>Chapitre 1 — Introduction</h2>
    <h3>1.1 Définitions</h3>
~~~

Règles :

- un seul **h1** par page, qui résume son sujet ;
- on ne **saute pas** de niveau (pas de h4 directement sous un h2) ;
- on choisit un titre pour son **rang dans le plan**, jamais pour sa taille : la taille se règle en CSS.

Les lecteurs d''écran utilisés par les personnes aveugles permettent de naviguer de titre en titre : une hiérarchie correcte rend la page **accessible**.

## 2. Les paragraphes et le texte

- **p** : un paragraphe.
- **br** : un retour à la ligne à l''intérieur d''un paragraphe (adresse, poème) ; à ne pas utiliser pour espacer des blocs.
- **strong** : texte **important** (affiché en gras par défaut).
- **em** : texte **accentué**, sur lequel on insiste à l''oral (en italique par défaut).

strong et em expriment un **sens** ; si l''on veut seulement du gras pour la décoration, on utilise CSS.

## 3. Les listes à puces : ul

Une liste **non ordonnée** (unordered list) regroupe des éléments sans ordre particulier ; chaque élément est un **li** (list item) :

~~~html
<ul>
  <li>Python</li>
  <li>C</li>
  <li>Java</li>
</ul>
~~~

## 4. Les listes numérotées : ol

Une liste **ordonnée** (ordered list) est utilisée quand l''ordre compte : étapes d''une recette, classement. Les numéros sont générés automatiquement. L''attribut **start** change le premier numéro, **reversed** inverse l''ordre.

## 5. Les listes imbriquées

Une liste peut contenir une autre liste, **à l''intérieur d''un li** :

~~~html
<ul>
  <li>Langages
    <ul>
      <li>Python</li>
      <li>Java</li>
    </ul>
  </li>
  <li>Outils</li>
</ul>
~~~

Un **ul** ou un **ol** ne doit contenir **que des li** : placer du texte ou un autre élément directement dans ul est une erreur.

## 6. Bien choisir son élément

| Besoin | Élément |
|---|---|
| Titre de section | h2, h3… |
| Bloc de texte | p |
| Énumération sans ordre | ul + li |
| Étapes, classement | ol + li |
| Mot important | strong |
| Insistance | em |

## 7. Le texte et l''accessibilité

Les personnes aveugles ou malvoyantes utilisent un **lecteur d''écran**, qui lit la page à voix haute. Ce logiciel permet de sauter de titre en titre ou de compter les éléments d''une liste : il s''appuie entièrement sur la **structure HTML**.

Une page dont les titres sont de simples paragraphes en gras est donc illisible pour lui. Les mêmes règles profitent aussi aux moteurs de recherche, qui utilisent les titres pour comprendre le sujet de la page.

**Règle pratique :** si vous retirez tout le style, la page doit rester compréhensible. C''est exactement ce que montre l''aperçu sans CSS d''UPL IDE.

## 8. Citations et extraits de code

- **`<blockquote>`** encadre une citation longue ; son attribut **cite** peut indiquer l''adresse de la source.
- **`<q>`** marque une courte citation à l''intérieur d''une phrase ; le navigateur ajoute les guillemets.
- **`<code>`** signale un fragment de code dans le texte. Associé à **`<pre>`**, qui conserve les espaces et les retours à la ligne, il permet d''afficher un programme entier.', array['h1 à h6 forment le plan de la page : un seul h1, pas de saut de niveau.', 'p pour les paragraphes ; strong pour l''importance, em pour l''insistance.', 'ul pour une liste sans ordre, ol quand l''ordre compte ; chaque élément est un li.', 'Une sous-liste se place à l''intérieur d''un li.']::text[], '[{"language":"html","title":"Fiche de cours structurée","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Fiche de cours</title>\n</head>\n<body>\n  <h1>Algorithmique — Fiche de révision</h1>\n  <h2>Les boucles</h2>\n  <p>Une boucle répète des instructions. Il est <strong>indispensable</strong> de vérifier qu''elle se termine.</p>\n  <h3>Les trois boucles</h3>\n  <ul>\n    <li>POUR</li>\n    <li>TANT QUE</li>\n    <li>RÉPÉTER … JUSQU''À</li>\n  </ul>\n  <h2>Méthode de résolution</h2>\n  <ol>\n    <li>Comprendre l''énoncé</li>\n    <li>Décomposer</li>\n    <li>Tester</li>\n  </ol>\n</body>\n</html>"}]'::jsonb, '{"competences":["Hiérarchiser une page avec des titres","Choisir entre ul et ol","Imbriquer correctement des listes"],"definitions":[{"term":"Titre (h1 à h6)","definition":"Élément qui introduit une section ; son numéro indique son rang dans le plan de la page."},{"term":"Liste non ordonnée (ul)","definition":"Liste dont l''ordre des éléments n''a pas d''importance, affichée avec des puces."},{"term":"Liste ordonnée (ol)","definition":"Liste dont l''ordre compte, numérotée automatiquement."},{"term":"Élément de liste (li)","definition":"Élément qui représente un item d''une liste ul ou ol."},{"term":"Accessibilité","definition":"Qualité d''une page utilisable par tous, y compris avec un lecteur d''écran ou sans souris."}],"commentedAlgorithms":[{"title":"Programme d''une journée de formation","code":"<h1>Journée découverte du code</h1>\n<h2>Matin</h2>\n<ol>\n  <li>Accueil des participants</li>\n  <li>Atelier pseudocode</li>\n</ol>\n<h2>Après-midi</h2>\n<ul>\n  <li>Python\n    <ul>\n      <li>Variables</li>\n      <li>Boucles</li>\n    </ul>\n  </li>\n  <li>HTML et CSS</li>\n</ul>\n<p>Inscription <strong>obligatoire</strong> avant jeudi.</p>","comments":{"1":"Un seul h1 : le sujet de la page.","2":"Section de premier niveau.","3":"L''ordre des activités compte : liste ordonnée.","4":"Chaque activité est un li.","7":"Même niveau que « Matin ».","8":"Ateliers au choix : sans ordre, liste à puces.","9":"Le li reste ouvert : il va contenir une sous-liste.","10":"Sous-liste à l''intérieur du li.","14":"On ferme le li après sa sous-liste.","17":"strong : information importante."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Choisir un titre pour sa taille","wrong":"<h4>Bienvenue sur mon site</h4>","right":"<h1>Bienvenue sur mon site</h1>","explanation":"Le niveau d''un titre exprime son rang dans le plan. Pour changer la taille, on utilise CSS.","run":false},{"title":"Mettre une sous-liste hors d''un li","wrong":"<ul>\n  <li>Langages</li>\n  <ul>\n    <li>Python</li>\n  </ul>\n</ul>","right":"<ul>\n  <li>Langages\n    <ul>\n      <li>Python</li>\n    </ul>\n  </li>\n</ul>","explanation":"Un ul ne peut contenir que des li : la sous-liste doit être placée dans le li qu''elle détaille.","run":false}],"solvedExercises":[{"title":"ul ou ol ?","statement":"Quelle liste utiliser pour : (a) les ingrédients d''une recette, (b) les étapes de la recette, (c) le classement d''un concours ?","solution":"(a) ul  (b) ol  (c) ol","explanation":"On utilise ol dès que l''ordre a un sens (étapes, rang)."},{"title":"Construire un plan","statement":"Écrivez les titres d''une page « Guide de l''étudiant » avec deux parties (Inscription, Examens), la partie Examens ayant deux sous-parties (Calendrier, Règlement).","solution":"<h1>Guide de l''étudiant</h1>\n<h2>Inscription</h2>\n<h2>Examens</h2>\n<h3>Calendrier</h3>\n<h3>Règlement</h3>","explanation":"Un h1 pour la page, des h2 pour les parties, des h3 pour les sous-parties : aucun niveau n''est sauté."}],"td":{"title":"TD 3 — Hiérarchie et listes","instructions":"Respectez la hiérarchie des titres et la structure des listes demandées.","exerciseSlugs":["html-recette","html-liste-imbriquee"]},"project":{"title":"Fiche de révision","context":"Transformer ses notes de cours en une fiche de révision bien structurée.","steps":["Écrire le plan avec h1, h2 et h3.","Rédiger les paragraphes et mettre en valeur l''essentiel.","Ajouter une liste à puces et une liste numérotée.","Vérifier la hiérarchie et soumettre."],"deliverables":["Une fiche HTML structurée."],"exerciseSlug":"html-projet-fiche-revision"}}'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html-textes-interrogation', 'Interrogation — Titres et listes', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-textes-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-interrogation'), 'qcm', 'Combien de h1 recommande-t-on par page ?', null, '["Aucun","Un seul","Deux","Autant que de sections"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-interrogation'), 'qcm', 'Quelle liste pour les étapes d''une installation ?', null, '["ul","ol","li","dl"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-interrogation'), 'qcm', 'Que peut contenir directement un ul ?', null, '["du texte","des li uniquement","des p","des h2"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-interrogation'), 'vrai_faux', 'strong sert à mettre un mot important en valeur.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html-textes-evaluation', 'Évaluation — Titres, paragraphes et listes', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-textes-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Sous un h2, quel est le titre suivant dans la hiérarchie ?', null, '["h1","h3","h4","h6"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Pourquoi respecter la hiérarchie des titres ?', null, '["Pour la taille du texte","Pour le plan de la page et l''accessibilité","Pour la vitesse","Ce n''est pas utile"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Quel élément pour un retour à la ligne dans une adresse ?', null, '["<p>","<br>","<hr>","<li>"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Où placer une sous-liste ?', null, '["Directement dans ul","Dans un li","Après </ul>","Dans head"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Quel attribut fait commencer une liste ol au numéro 5 ?', null, '["begin=\"5\"","start=\"5\"","first=\"5\"","value=\"5\""]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'vrai_faux', 'em et strong servent uniquement à la décoration.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-textes-evaluation'), 'qcm', 'Quel élément pour chaque élément d''une liste ?', null, '["<item>","<li>","<el>","<ul>"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'html') and slug = 'premiers-pas'), (select id from public.courses where slug = 'html'), 'html-liens-images', 'Liens et images', 'debutant', 90, array['Créer des liens vers d''autres sites, d''autres pages et des sections.', 'Distinguer chemins absolus et relatifs.', 'Insérer des images accessibles avec un texte alternatif.']::text[], array['Chapitre 3 — Titres, paragraphes et listes.']::text[], '## 1. Les liens : l''élément a

Les liens (hyperliens) font du web une « toile ». On les crée avec l''élément **a** (ancre) et son attribut **href** :

~~~html
<a href="https://developer.mozilla.org/fr/">Documentation MDN</a>
~~~

Le **texte du lien** doit indiquer clairement la destination : « Télécharger le règlement des examens » plutôt que « cliquez ici ». C''est essentiel pour l''accessibilité : les lecteurs d''écran peuvent lister tous les liens d''une page.

## 2. Chemins absolus et relatifs

| Type | Exemple | Quand l''utiliser |
|---|---|---|
| URL absolue | https://www.exemple.cd/cours.html | vers un autre site |
| chemin relatif | contact.html | page du même dossier |
| chemin relatif | cours/python.html | page d''un sous-dossier |
| chemin relatif | ../index.html | page du dossier parent |
| ancre | #examens | section de la même page (élément ayant id="examens") |

Les chemins relatifs fonctionnent encore si le site est déplacé vers une autre adresse.

Autres liens utiles : **mailto:adresse@exemple.cd** ouvre la messagerie, **tel:+243…** lance un appel sur téléphone.

## 3. Ouvrir dans un nouvel onglet

**target="_blank"** ouvre le lien dans un nouvel onglet. À utiliser avec modération (l''utilisateur perd le bouton « Précédent ») et en ajoutant **rel="noopener"**, qui empêche la page ouverte de contrôler la vôtre (protection de sécurité).

## 4. Les images : l''élément img

~~~html
<img src="images/campus.jpg" alt="Bâtiment principal du campus de l''UPL" width="600" height="400">
~~~

- **src** : chemin de l''image (relatif ou absolu).
- **alt** : **texte alternatif**, lu par les lecteurs d''écran et affiché si l''image ne se charge pas. Il est **obligatoire**. Pour une image purement décorative, on écrit **alt=""** (vide) afin qu''elle soit ignorée.
- **width** et **height** : dimensions en pixels ; les indiquer évite que la page « saute » pendant le chargement.

img est un élément **vide** : pas de balise fermante.

## 5. Formats d''image

| Format | Usage |
|---|---|
| JPEG (.jpg) | photographies |
| PNG (.png) | logos, captures avec transparence |
| SVG (.svg) | icônes et schémas vectoriels (nets à toute taille) |
| WebP (.webp) | photos et images légères pour le web |

Une image trop lourde ralentit la page, surtout sur une connexion mobile : redimensionnez et compressez vos images avant de les publier.

## 6. Une image cliquable

On peut placer une image dans un lien : le texte alternatif décrit alors la **destination** du lien.

~~~html
<a href="index.html"><img src="logo.png" alt="Accueil d''UPL Code Academy"></a>
~~~

## 7. Bonnes pratiques pour les liens et les images

- Le texte d''un lien doit annoncer sa destination : « Consulter le programme de L1 » plutôt que « cliquez ici ». Un lecteur d''écran peut lister tous les liens d''une page hors de leur contexte.
- Une image **décorative** reçoit un **alt** vide (**alt=""**) : le lecteur d''écran l''ignore. Une image **informative** reçoit une description de ce qu''elle apporte, pas de son apparence.
- Préciser **width** et **height** sur une image réserve sa place avant son chargement et évite que le texte « saute » pendant l''affichage.
- Un nom de fichier sans espace ni accent (**photo-campus.jpg**) évite les liens cassés sur les serveurs, qui distinguent souvent les majuscules des minuscules.', array['a + href crée un lien ; son texte doit décrire la destination.', 'Chemin absolu vers un autre site ; chemin relatif dans son propre site ; #id vers une section.', 'target="_blank" s''accompagne de rel="noopener".', 'img a besoin de src et d''un alt pertinent (vide si décorative) ; c''est un élément vide.']::text[], '[{"language":"html","title":"Liens et image accessible","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Liens et images</title>\n</head>\n<body>\n  <h1>Ressources</h1>\n  <p><a href=\"#contact\">Aller à la section Contact</a></p>\n  <p><a href=\"https://developer.mozilla.org/fr/docs/Web/HTML\" target=\"_blank\" rel=\"noopener\">Documentation HTML de MDN</a></p>\n  <img src=\"https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg\" alt=\"Logo HTML5\" width=\"120\" height=\"120\">\n  <h2 id=\"contact\">Contact</h2>\n  <p><a href=\"mailto:contact@exemple.cd\">Écrire au club informatique</a></p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Créer des liens absolus, relatifs et internes","Insérer des images accessibles","Choisir un format d''image adapté"],"definitions":[{"term":"Hyperlien","definition":"Élément **a** qui permet d''aller vers une autre ressource indiquée par son attribut **href**."},{"term":"Chemin relatif","definition":"Adresse exprimée à partir de l''emplacement de la page courante (ex. cours/python.html)."},{"term":"URL absolue","definition":"Adresse complète, avec protocole et nom de domaine (ex. https://www.exemple.cd/)."},{"term":"Texte alternatif (alt)","definition":"Description textuelle d''une image, lue par les lecteurs d''écran et affichée si l''image est absente."}],"commentedAlgorithms":[{"title":"Menu de navigation d''un petit site","code":"<nav>\n  <a href=\"index.html\">Accueil</a>\n  <a href=\"cours/html.html\">Cours HTML</a>\n  <a href=\"#horaires\">Horaires</a>\n  <a href=\"https://developer.mozilla.org/fr/\" target=\"_blank\" rel=\"noopener\">MDN</a>\n</nav>\n<img src=\"https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg\" alt=\"Logo HTML5\" width=\"80\" height=\"80\">\n<h2 id=\"horaires\">Horaires</h2>\n<p>Du lundi au vendredi, de 8 h à 16 h.</p>","comments":{"1":"nav regroupe les liens de navigation principaux.","2":"Chemin relatif : page du même dossier.","3":"Chemin relatif vers un sous-dossier.","4":"Ancre : section de cette page ayant id=\"horaires\".","5":"Site externe ouvert dans un nouvel onglet, protégé par rel=\"noopener\".","7":"Image : src, alt descriptif, dimensions.","8":"Cible de l''ancre #horaires."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Oublier le texte alternatif","wrong":"<img src=\"campus.jpg\">","right":"<img src=\"campus.jpg\" alt=\"Entrée principale du campus\">","explanation":"Sans alt, un lecteur d''écran lit le nom du fichier, ou rien. Le texte alternatif est obligatoire.","run":false},{"title":"Écrire « cliquez ici »","wrong":"<a href=\"reglement.pdf\">Cliquez ici</a> pour le règlement.","right":"<a href=\"reglement.pdf\">Télécharger le règlement des examens (PDF)</a>","explanation":"Le texte d''un lien doit avoir du sens hors contexte : les lecteurs d''écran listent les liens sans le texte qui les entoure.","run":false}],"solvedExercises":[{"title":"Écrire des chemins","statement":"La page actuelle est **site/cours/index.html**. Écrivez les chemins relatifs vers (a) site/cours/python.html, (b) site/index.html, (c) site/images/logo.png.","solution":"(a) python.html\n(b) ../index.html\n(c) ../images/logo.png","explanation":"« .. » remonte d''un dossier ; un nom seul désigne un fichier du dossier courant."},{"title":"Rédiger des textes alternatifs","statement":"Proposez un alt pour : (a) la photo d''un étudiant devant un ordinateur, (b) un trait décoratif, (c) un logo qui renvoie à l''accueil.","solution":"(a) alt=\"Étudiant programmant sur un ordinateur portable\"\n(b) alt=\"\"\n(c) alt=\"Accueil d''UPL Code Academy\"","explanation":"Une image décorative reçoit un alt vide ; une image cliquable décrit la destination du lien."}],"td":{"title":"TD 4 — Navigation et images","instructions":"Vérifiez chaque lien et chaque image dans l''aperçu avant de soumettre.","exerciseSlugs":["html-menu-navigation","html-ancre-section"]},"project":{"title":"Page de présentation du club informatique","context":"Le club informatique de l''université veut une page de présentation simple, accessible et bien structurée.","steps":["Écrire le squelette complet (langue, encodage, titre).","Ajouter un titre principal, une présentation et la liste des activités.","Ajouter un menu de liens et une image avec un texte alternatif.","Vérifier la hiérarchie des titres et l''accessibilité, puis soumettre."],"deliverables":["Une page index.html complète validée par les tests automatiques."],"exerciseSlug":"html-projet-club"}}'::jsonb, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html-liens-interrogation', 'Interrogation — Liens et images', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-liens-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-interrogation'), 'qcm', 'Quel attribut indique la destination d''un lien ?', null, '["src","href","alt","link"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-interrogation'), 'qcm', 'Quel chemin désigne une page du dossier parent ?', null, '["./index.html","../index.html","/index.html","#index"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-interrogation'), 'qcm', 'Quel alt pour une image décorative ?', null, '["alt=\"image\"","alt=\"\"","pas d''alt","alt=\"décoration\""]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-interrogation'), 'vrai_faux', 'img a une balise fermante </img>.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html-liens-evaluation', 'Évaluation — Liens et images', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-liens-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'Comment lier la section id="examens" de la même page ?', null, '["href=\"examens\"","href=\"#examens\"","href=\"/examens\"","src=\"#examens\""]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'Pourquoi ajouter rel="noopener" à un lien target="_blank" ?', null, '["Pour la couleur","Par sécurité","Pour le référencement","Ce n''est jamais utile"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'Quel format pour un logo vectoriel net à toute taille ?', null, '["JPEG","SVG","BMP","GIF"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'Quel est le meilleur texte de lien ?', null, '["Cliquez ici","Lien","Consulter le calendrier des examens","Ici"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'À quoi servent width et height sur une image ?', null, '["À compresser l''image","À réserver la place et éviter que la page saute","À changer le format","À rien"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'vrai_faux', 'Un chemin relatif continue de fonctionner si tout le site change d''adresse.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-liens-evaluation'), 'qcm', 'Que lit un lecteur d''écran pour une image ?', null, '["Son nom de fichier uniquement","Son texte alternatif","Sa taille","Rien"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'html') and m.slug not in ('premiers-pas') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'html'), 1, 'Niveau 1 — Très débutant : premières pages', 'Comprendre le web, écrire un document HTML complet, structurer du texte avec titres, paragraphes et listes, relier des pages par des liens et insérer des images accessibles.', array['Expliquer le rôle du navigateur, du serveur et du HTML.', 'Écrire un document HTML valide (doctype, head, body, métadonnées).', 'Structurer un texte avec une hiérarchie de titres et des listes.', 'Créer des liens et insérer des images avec un texte alternatif.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), null, 'html-examen-niveau-1', 'Examen du niveau 1 — Premières pages HTML', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Que signifie HTML ?', null, '["HyperText Markup Language","High Tech Modern Language","HyperTransfer Main Link","Home Tool Markup Language"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quelle balise contient le contenu visible de la page ?', null, '["<head>","<body>","<title>","<meta>"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quelle ligne doit commencer un document HTML5 ?', null, '["<html5>","<!DOCTYPE html>","<?xml?>","<doctype=5>"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Combien de <h1> recommande-t-on par page ?', null, '["Aucun","Un seul","Au moins trois","Un par paragraphe"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quelle balise crée une liste numérotée ?', null, '["<ul>","<ol>","<li>","<dl>"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quel attribut donne la destination d''un lien ?', null, '["src","href","alt","link"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quel attribut décrit une image pour un lecteur d''écran ?', null, '["title","alt","name","desc"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'vrai_faux', 'La balise <img> est un élément vide : elle n''a pas de balise fermante.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Où place-t-on <meta charset="utf-8"> ?', null, '["dans <body>","dans <head>","après </html>","dans <title>"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-examen-niveau-1'), 'qcm', 'Quel lien mène à l''élément d''id « contact » de la même page ?', null, '["<a href=\"contact\">","<a href=\"#contact\">","<a id=\"contact\">","<a href=\".contact\">"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'html'), 2, 'Niveau 2 — Débutant : structure et formulaires', 'Balises sémantiques de mise en page, tableaux de données, formulaires et médias.', array['Structurer une page avec header, nav, main, section, article et footer.', 'Présenter des données dans un tableau accessible.', 'Construire un formulaire avec des champs étiquetés et validés.']::text[], array['HTML sémantique (header, nav, main, footer)', 'Tableaux de données', 'Formulaires et types de champs', 'Validation native des formulaires', 'Audio, vidéo et iframes']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'html'), 3, 'Niveau 3 — Intermédiaire : accessibilité et qualité', 'Accessibilité (WCAG, ARIA), référencement, validation W3C et bonnes pratiques.', array['Rendre une page accessible au clavier et aux lecteurs d''écran.', 'Optimiser le référencement d''une page.', 'Valider et corriger un document.']::text[], array['Accessibilité et rôles ARIA', 'Référencement (SEO) et métadonnées', 'Validation W3C et erreurs courantes', 'Images responsives (srcset, picture)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'html'), 4, 'Niveau 4 — Professionnel : site complet', 'Organisation d''un site multipages, performances, intégration avec CSS et JavaScript, mise en ligne.', array['Organiser un site multipages maintenable.', 'Mesurer les performances et l''accessibilité.', 'Mettre un site en ligne.']::text[], array['Organisation d''un site multipages', 'Performances et Lighthouse', 'Mise en ligne d''un site statique', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'html'), null, 'html-positionnement', 'Test de positionnement — HTML', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'html-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise crée un paragraphe ?', null, '["<p>","<para>","<text>","<br>"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel attribut donne l''adresse d''un lien ?', null, '["src","href","url","alt"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise crée un élément de liste ?', null, '["<ul>","<li>","<list>","<ol>"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise regroupe le contenu principal unique de la page ?', null, '["<section>","<main>","<div>","<body>"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel attribut relie un <label> à son champ ?', null, '["name","for","id","value"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise crée une cellule d''en-tête de tableau ?', null, '["<td>","<th>","<thead>","<tr>"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'À quoi sert l''attribut aria-label ?', null, '["à styliser","à donner un nom accessible","à valider un champ","à créer un lien"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel élément propose plusieurs sources d''image selon l''écran ?', null, '["<figure>","<picture>","<canvas>","<source> seul"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'vrai_faux', 'Un bouton créé avec <div onclick> est aussi accessible au clavier qu''un <button>.', null, '["Vrai","Faux"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel outil audite performances et accessibilité d''une page ?', null, '["Lighthouse","Git","npm","Babel"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel attribut retarde le chargement d''une image hors écran ?', null, '["defer","loading=\"lazy\"","async","preload"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise déclare l''URL canonique d''une page ?', null, '["<meta name=\"canonical\">","<link rel=\"canonical\">","<base>","<a rel=\"canonical\">"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== CSS =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('css', 'css', (select id from public.course_categories where slug = 'web'), 'Parcours CSS', 'CSS', 'Mettre en forme et mettre en page le web.', 'CSS (Cascading Style Sheets) décrit l''apparence des pages HTML : couleurs, typographie, espacements, mise en page, adaptation aux téléphones, animations. Ce parcours part des règles de base et mène jusqu''aux mises en page professionnelles et à l''architecture des feuilles de style.', 'debutant', array['Parcours HTML, niveau 1.']::text[], array['Écrire des règles CSS et cibler précisément les éléments.', 'Maîtriser couleurs, typographie et modèle de boîte.', 'Construire des mises en page adaptées à tous les écrans.', 'Organiser des feuilles de style maintenables.']::text[], 30, 'publie', 3, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'css'), 'fondamentaux-css', 'Fondamentaux du CSS', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-introduction-selecteurs', 'Introduction au CSS et sélecteurs', 'debutant', 90, array['Expliquer le rôle du CSS et la séparation contenu / présentation.', 'Écrire une règle CSS : sélecteur, propriété, valeur.', 'Relier une feuille de style à une page.', 'Cibler des éléments par type, par classe et par identifiant.']::text[], array['Parcours HTML — chapitres 1 à 3.']::text[], '## 1. Séparer le contenu et la présentation

HTML dit **ce qu''est** le contenu (un titre, une liste) ; CSS dit **à quoi il ressemble** (bleu, centré, en gros caractères). Cette séparation a trois avantages :

- une seule feuille de style peut habiller **tout un site** : changer une couleur se fait en une ligne ;
- le HTML reste lisible et sémantique ;
- on peut proposer plusieurs présentations du même contenu (écran, téléphone, impression).

## 2. Anatomie d''une règle

~~~css
h1 {
  color: navy;
  text-align: center;
}
~~~

- **h1** est le **sélecteur** : il désigne les éléments concernés.
- Entre accolades se trouvent les **déclarations**, chacune sous la forme **propriété: valeur;**.
- **color** est une **propriété**, **navy** sa **valeur**. Chaque déclaration se termine par un **point-virgule**.

Les commentaires CSS s''écrivent **/* ainsi */**.

## 3. Relier le CSS au HTML

La méthode recommandée est une **feuille de style externe**, fichier **style.css**, reliée dans **head** :

~~~html
<link rel="stylesheet" href="style.css">
~~~

Deux autres possibilités existent : un élément **style** dans head (pratique pour un essai), et l''attribut **style** sur un élément (à éviter : il mélange contenu et présentation). Dans UPL IDE, les projets web contiennent déjà **index.html** et **style.css** reliés.

## 4. Les sélecteurs de base

| Sélecteur | Exemple | Cible |
|---|---|---|
| type | p | tous les paragraphes |
| classe | .important | tous les éléments ayant class="important" |
| identifiant | #menu | l''unique élément ayant id="menu" |
| descendant | nav a | les liens situés dans un nav |
| groupe | h1, h2 | les h1 et les h2 |
| universel | * | tous les éléments |

Une **classe** peut être utilisée sur plusieurs éléments, et un élément peut avoir plusieurs classes : **class="carte vedette"**. Un **identifiant** est unique dans la page. En pratique, on stylise surtout avec des **classes**, réutilisables.

## 5. La cascade et la spécificité

Quand plusieurs règles s''appliquent à un même élément et se contredisent, le navigateur choisit :

1. la règle la plus **spécifique** : un identifiant l''emporte sur une classe, qui l''emporte sur un type ;
2. à spécificité égale, la règle écrite **en dernier**.

~~~css
p { color: black; }
.alerte { color: red; }   /* un <p class="alerte"> sera rouge */
~~~

## 6. L''héritage

Certaines propriétés, comme **color** et **font-family**, sont **héritées** : définies sur body, elles s''appliquent à tous les éléments qu''il contient, sauf s''ils en redéfinissent une autre valeur. D''autres, comme **border** ou **margin**, ne le sont pas.

## 7. Les outils de développement

Ouvrez les outils du navigateur (**F12**), puis sélectionnez un élément dans l''onglet **Éléments**. Le panneau **Styles** affiche :
- toutes les règles qui s''appliquent à cet élément, de la plus spécifique à la moins spécifique ;
- les déclarations **barrées**, qui ont perdu la cascade ;
- le fichier et la ligne d''où vient chaque règle.

C''est l''outil indispensable pour comprendre pourquoi une règle « ne marche pas ». Dans la grande majorité des cas, c''est l''une de ces trois raisons :
- le sélecteur ne cible pas l''élément voulu ;
- une règle plus spécifique l''emporte ;
- la propriété est mal orthographiée et donc ignorée.', array['HTML structure le contenu, CSS le présente.', 'Une règle = sélecteur { propriété: valeur; }.', 'On relie une feuille externe avec <link rel="stylesheet" href="style.css">.', 'Sélecteurs : type (p), classe (.nom), identifiant (#nom), descendant (nav a), groupe (h1, h2).', 'En cas de conflit : la règle la plus spécifique, puis la dernière écrite.']::text[], '[{"language":"css","title":"Sélecteurs de type, de classe et d''identifiant","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Sélecteurs</title>\n  <style>\n    body { font-family: Arial, sans-serif; }\n    h1 { color: navy; }\n    .important { color: red; font-weight: bold; }\n    #pied { color: gray; }\n  </style>\n</head>\n<body>\n  <h1>Annonces du club</h1>\n  <p>Réunion vendredi à 14 h.</p>\n  <p class=\"important\">Inscription obligatoire avant jeudi.</p>\n  <p id=\"pied\">Club informatique de l''UPL</p>\n</body>\n</html>","explanation":"Dans un vrai projet, les règles seraient dans style.css."}]'::jsonb, '{"competences":["Écrire des règles CSS","Relier une feuille de style","Choisir le bon sélecteur","Prévoir le résultat de la cascade"],"definitions":[{"term":"Règle CSS","definition":"Association d''un sélecteur et d''un bloc de déclarations."},{"term":"Sélecteur","definition":"Motif qui désigne les éléments auxquels s''appliquent les déclarations."},{"term":"Déclaration","definition":"Couple **propriété: valeur;** qui fixe une caractéristique d''affichage."},{"term":"Classe","definition":"Attribut class réutilisable sur plusieurs éléments, ciblé en CSS par **.nom**."},{"term":"Spécificité","definition":"Poids d''un sélecteur qui départage les règles en conflit (identifiant > classe > type)."}],"commentedAlgorithms":[{"title":"Une feuille de style commentée","code":"<style>\n  body {\n    font-family: Georgia, serif;\n  }\n  .carte {\n    border: 2px solid #1d5fe0;\n    padding: 12px;\n  }\n  #titre {\n    color: #0a1a3a;\n  }\n</style>\n<h1 id=\"titre\">Nos formations</h1>\n<p class=\"carte\">Algorithmique</p>\n<p class=\"carte\">Python</p>","comments":{"1":"Dans un projet réel, ce contenu irait dans style.css.","2":"Sélecteur de type : l''élément body.","3":"Police héritée par tous les éléments de la page.","5":"Sélecteur de classe : tous les éléments class=\"carte\".","6":"Bordure de 2 pixels, pleine, bleue.","7":"Espace intérieur entre la bordure et le texte.","9":"Sélecteur d''identifiant : l''élément unique id=\"titre\".","10":"Couleur du texte, en hexadécimal.","14":"Même classe sur deux éléments : même style."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Oublier le point d''une classe","wrong":"important { color: red; }","right":".important { color: red; }","explanation":"Sans le point, le sélecteur cherche un élément nommé « important », qui n''existe pas en HTML.","run":false},{"title":"Oublier un point-virgule","wrong":"h1 {\n  color: navy\n  font-size: 32px;\n}","right":"h1 {\n  color: navy;\n  font-size: 32px;\n}","explanation":"Sans point-virgule, « navy font-size: 32px » est lu comme une seule valeur invalide : les deux déclarations sont ignorées.","run":false}],"solvedExercises":[{"title":"Prévoir la couleur","statement":"Avec p { color: black; } puis .note { color: green; } puis #n1 { color: blue; }, de quelle couleur est `<p class=\"note\" id=\"n1\">` ?","solution":"Bleu.","explanation":"L''identifiant est plus spécifique que la classe, elle-même plus spécifique que le type."},{"title":"Écrire des sélecteurs","statement":"Écrivez le sélecteur qui cible : (a) tous les liens du menu nav, (b) les h2 et h3, (c) les éléments de classe prix.","solution":"(a) nav a\n(b) h2, h3\n(c) .prix","explanation":"Espace = descendant ; virgule = groupe ; point = classe."}],"td":{"title":"TD 1 — Sélecteurs et règles","instructions":"Écrivez vos règles dans style.css ; la page index.html est déjà reliée. La correction lit vos règles CSS.","exerciseSlugs":["css-classe-alerte","css-menu-liens"]},"project":{"title":"Habiller la page d''annonces","context":"Donner une identité visuelle cohérente à la page d''annonces du club.","steps":["Choisir une police pour toute la page.","Colorer le titre principal.","Retirer le soulignement des liens du menu.","Mettre en évidence les alertes, puis soumettre."],"deliverables":["Une feuille style.css validée par les tests."],"exerciseSlug":"css-projet-annonce"}}'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css-introduction-interrogation', 'Interrogation — Sélecteurs', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-introduction-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quel sélecteur cible class="prix" ?', null, '["prix","#prix",".prix","*prix"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quel sélecteur cible id="menu" ?', null, '[".menu","#menu","menu","@menu"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quelle règle l''emporte à spécificité égale ?', null, '["la première écrite","la dernière écrite","la plus courte","aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'vrai_faux', 'La propriété color est héritée par les éléments enfants.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css-introduction-evaluation', 'Évaluation — Introduction au CSS', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-introduction-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Dans h1 { color: navy; }, quelle est la propriété ?', null, '["h1","color","navy","{ }"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Comment relier style.css à une page ?', null, '["<style src=\"style.css\">","<link rel=\"stylesheet\" href=\"style.css\">","<css>style.css</css>","<script src=\"style.css\">"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Que cible nav a ?', null, '["les nav et les a","les liens situés dans un nav","le premier lien","les nav dans un lien"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Quel sélecteur est le plus spécifique ?', null, '["p",".texte","#intro","*"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'vrai_faux', 'Un même identifiant peut être utilisé sur plusieurs éléments d''une page.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Pourquoi éviter l''attribut style dans le HTML ?', null, '["Il est interdit","Il mélange contenu et présentation","Il est plus lent","Il ne fonctionne pas"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Comment écrit-on un commentaire CSS ?', null, '["<!-- -->","// ","/* */","#"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-couleurs-textes', 'Couleurs, textes et polices', 'debutant', 90, array['Exprimer des couleurs (noms, hexadécimal, rgb) et garantir un bon contraste.', 'Régler la police, la taille, la graisse et l''alignement du texte.', 'Choisir l''unité adaptée : px, em, rem, %.']::text[], array['Chapitre 1 — Introduction au CSS et sélecteurs.']::text[], '## 1. Les couleurs

Deux propriétés principales : **color** (couleur du texte) et **background-color** (couleur du fond). Une couleur peut s''écrire :

| Notation | Exemple | Remarque |
|---|---|---|
| nom | navy, white, tomato | 140 noms prédéfinis |
| hexadécimal | #1d5fe0 | rouge, vert, bleu de 00 à ff |
| hexadécimal court | #fff | équivaut à #ffffff |
| rgb | rgb(29, 95, 224) | valeurs de 0 à 255 |
| rgb avec transparence | rgb(29 95 224 / 50%) | opacité de 50 % |

## 2. Le contraste, une question d''accessibilité

Un texte gris clair sur fond blanc est difficile à lire, surtout en plein soleil sur un téléphone ou pour une personne malvoyante. Les recommandations d''accessibilité (WCAG) demandent un **rapport de contraste d''au moins 4,5 : 1** pour le texte courant. Des outils comme le vérificateur de contraste des outils de développement du navigateur permettent de le mesurer.

## 3. Les polices

~~~css
body {
  font-family: "Segoe UI", Arial, sans-serif;
}
~~~

**font-family** reçoit une **liste** de polices : le navigateur utilise la première disponible. On termine toujours par une **famille générique** (**sans-serif**, **serif**, **monospace**). Les noms contenant des espaces s''écrivent entre guillemets.

Autres propriétés : **font-size** (taille), **font-weight** (graisse : **normal**, **bold** ou un nombre de 100 à 900), **font-style** (**italic**), **line-height** (hauteur de ligne ; 1.5 améliore la lisibilité).

## 4. Les unités

| Unité | Signification | Usage |
|---|---|---|
| px | pixel | bordures, petits détails |
| rem | relatif à la taille de police de la racine (16 px par défaut) | tailles de texte et espacements |
| em | relatif à la taille de police de l''élément | espacements proportionnels au texte |
| % | pourcentage de l''élément parent | largeurs |

Avec **rem**, si l''utilisateur agrandit la police de son navigateur, toute la page suit : c''est plus accessible que des tailles fixes en px.

## 5. L''alignement et la décoration du texte

- **text-align** : **left**, **center**, **right**, **justify** ;
- **text-decoration** : **none** (retirer le soulignement d''un lien), **underline** ;
- **text-transform** : **uppercase** (majuscules), **capitalize** ;
- **letter-spacing** : espacement entre les lettres.

## 6. Styler les liens

Les liens ont plusieurs **états**, ciblés par des **pseudo-classes** :

~~~css
a { color: #1d5fe0; }
a:hover { text-decoration: underline; }   /* survol de la souris */
a:focus { outline: 2px solid orange; }    /* navigation au clavier */
~~~

Ne supprimez jamais l''indicateur de focus sans le remplacer : il permet aux personnes qui naviguent au clavier de savoir où elles se trouvent.

## 7. Organiser ses couleurs et ses textes

Sur un vrai site, on limite volontairement le nombre de couleurs :
- une couleur **principale** (boutons, liens) ;
- une couleur **d''accent** ;
- des **gris** pour le texte et les fonds.

On fixe la police et la couleur du texte une seule fois sur **body** : grâce à l''héritage, tous les éléments en profitent. On ne redéfinit ensuite que les exceptions (titres, liens).

Cette discipline rend la feuille de style courte, cohérente et facile à modifier : changer la couleur principale ne demande alors qu''une modification. Au niveau 3, les **variables CSS** permettront de nommer ces couleurs.', array['color pour le texte, background-color pour le fond ; noms, hexadécimal ou rgb.', 'Un contraste suffisant (4,5 : 1) est une exigence d''accessibilité.', 'font-family se termine par une famille générique ; line-height de 1,5 améliore la lecture.', 'rem pour les tailles de texte : la page suit le réglage de l''utilisateur.', 'Les pseudo-classes :hover et :focus stylisent les états des liens.']::text[], '[{"language":"css","title":"Typographie lisible","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Typographie</title>\n  <style>\n    body { font-family: Georgia, serif; font-size: 1.125rem; line-height: 1.6; color: #222222; background-color: #fafafa; }\n    h1 { font-family: Arial, sans-serif; color: #1d5fe0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }\n    a { color: #0a1a3a; }\n    a:hover { color: #1d5fe0; }\n  </style>\n</head>\n<body>\n  <h1>Le CSS</h1>\n  <p>Un texte bien contrasté, avec une hauteur de ligne de 1,6, se lit beaucoup plus facilement, en particulier sur téléphone.</p>\n  <p><a href=\"#\">Un lien qui change de couleur au survol</a></p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Exprimer une couleur et vérifier un contraste","Configurer la typographie","Choisir une unité adaptée"],"definitions":[{"term":"Hexadécimal","definition":"Notation #rrggbb où chaque paire (00 à ff) donne la quantité de rouge, de vert et de bleu."},{"term":"Famille générique","definition":"Catégorie de police (serif, sans-serif, monospace) utilisée si aucune police listée n''est disponible."},{"term":"rem","definition":"Unité relative à la taille de police de l''élément racine (16 px par défaut)."},{"term":"Pseudo-classe","definition":"Mot-clé ajouté au sélecteur (**:hover**, **:focus**) qui cible un état particulier d''un élément."},{"term":"Contraste","definition":"Rapport de luminosité entre le texte et son fond ; au moins 4,5 : 1 pour un texte courant."}],"commentedAlgorithms":[{"title":"Mise en forme d''un article","code":"<style>\n  body {\n    font-family: \"Segoe UI\", Arial, sans-serif;\n    font-size: 1rem;\n    line-height: 1.5;\n    color: #1f2937;\n  }\n  h1 {\n    font-size: 2rem;\n    color: #1d5fe0;\n  }\n  .chapeau {\n    font-style: italic;\n    font-weight: 600;\n  }\n</style>\n<h1>Rentrée académique</h1>\n<p class=\"chapeau\">Les cours reprennent le lundi 6 octobre.</p>\n<p>Les étudiants sont invités à consulter leur emploi du temps.</p>","comments":{"2":"Réglages de base hérités par tout le document.","3":"Liste de polices terminée par une famille générique.","4":"16 px par défaut, ajustable par l''utilisateur.","5":"Hauteur de ligne : 1,5 fois la taille du texte.","6":"Gris très foncé : bon contraste sur fond blanc.","9":"Deux fois la taille de base.","10":"Le bleu principal du site, réservé aux titres.","12":"Classe pour le résumé de l''article.","13":"Italique : distingue le résumé du texte courant.","14":"Graisse intermédiaire (semi-gras)."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Une police sans famille générique","wrong":"body { font-family: Calibri; }","right":"body { font-family: Calibri, Arial, sans-serif; }","explanation":"Si Calibri n''est pas installée (téléphones Android, Linux), le navigateur choisit une police par défaut imprévisible.","run":false},{"title":"Un contraste insuffisant","wrong":"p { color: #cccccc; background-color: #ffffff; }","right":"p { color: #374151; background-color: #ffffff; }","explanation":"Le gris clair sur blanc a un contraste d''environ 1,6 : 1, illisible pour beaucoup d''utilisateurs.","run":false}],"solvedExercises":[{"title":"Convertir des couleurs","statement":"Écrivez en hexadécimal : (a) blanc, (b) noir, (c) rouge pur, (d) rgb(29, 95, 224).","solution":"(a) #ffffff\n(b) #000000\n(c) #ff0000\n(d) #1d5fe0","explanation":"29 = 1d, 95 = 5f, 224 = e0 en base 16."},{"title":"Calculer des tailles","statement":"La racine a une taille de 16 px. Que valent 1.5rem et 0.75rem en pixels ?","solution":"1.5rem = 24 px ; 0.75rem = 12 px","explanation":"Il suffit de multiplier par 16."}],"td":{"title":"TD 2 — Couleurs et typographie","instructions":"Écrivez exactement les valeurs demandées : la correction compare les valeurs de vos déclarations.","exerciseSlugs":["css-bandeau-couleurs","css-liens-etats"]},"project":{"title":"Mise en forme d''un article","context":"Rendre un article d''actualité agréable à lire sur ordinateur et sur téléphone.","steps":["Définir la typographie de base sur body.","Régler la taille et la couleur du titre.","Mettre le chapeau en italique.","Gérer l''état de survol des liens, puis soumettre."],"deliverables":["Une feuille style.css lisible et accessible."],"exerciseSlug":"css-projet-article"}}'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css-couleurs-interrogation', 'Interrogation — Couleurs et textes', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-couleurs-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Quelle propriété change la couleur du fond ?', null, '["color","background-color","font-color","bg"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Que vaut #fff ?', null, '["noir","blanc","rouge","gris"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Par quoi doit se terminer font-family ?', null, '["une police installée","une famille générique","un point","une taille"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Combien vaut 2rem si la racine fait 16 px ?', null, '["16 px","18 px","32 px","2 px"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css-couleurs-evaluation', 'Évaluation — Couleurs, textes et polices', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-couleurs-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle pseudo-classe cible le survol de la souris ?', null, '[":focus",":hover",":active",":visited"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle propriété retire le soulignement d''un lien ?', null, '["text-style: none","text-decoration: none","underline: none","font-decoration: none"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle valeur de line-height améliore la lecture d''un paragraphe ?', null, '["0.5","1.5","5","0"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quel rapport de contraste minimal pour un texte courant ?', null, '["1 : 1","2 : 1","4,5 : 1","10 : 1"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'vrai_faux', 'Supprimer l''indicateur de focus sans le remplacer gêne la navigation au clavier.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Pourquoi préférer rem à px pour le texte ?', null, '["rem est plus rapide","La page suit le réglage de taille de l''utilisateur","px n''existe plus","rem change la police"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Que fait text-transform: uppercase ?', null, '["Met en gras","Affiche en majuscules","Souligne","Agrandit"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-modele-boite', 'Le modèle de boîte', 'debutant', 100, array['Décrire les quatre zones d''une boîte : contenu, padding, bordure, marge.', 'Régler largeur, hauteur et box-sizing.', 'Centrer un bloc horizontalement et espacer les éléments.']::text[], array['Chapitre 2 — Couleurs, textes et polices.']::text[], '## 1. Tout élément est une boîte

Le navigateur dessine chaque élément comme un **rectangle** composé de quatre zones, de l''intérieur vers l''extérieur :

1. le **contenu** (texte, image) ;
2. le **padding** (marge intérieure) : espace entre le contenu et la bordure, qui prend la couleur de fond ;
3. la **bordure** (**border**) ;
4. la **marge** (**margin**, marge extérieure) : espace transparent qui sépare la boîte de ses voisines.

~~~text
┌──────────── margin ────────────┐
│ ┌────────── border ──────────┐ │
│ │ ┌──────── padding ───────┐ │ │
│ │ │        contenu         │ │ │
│ │ └────────────────────────┘ │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
~~~

Les outils de développement du navigateur (clic droit → Inspecter) affichent ce schéma pour l''élément sélectionné.

## 2. Padding, border et margin

~~~css
.carte {
  padding: 16px;                 /* les 4 côtés */
  border: 1px solid #dfe5ee;     /* épaisseur, style, couleur */
  margin: 0 0 24px 0;            /* haut, droite, bas, gauche */
}
~~~

Les raccourcis s''écrivent dans le sens des aiguilles d''une montre : **haut droite bas gauche**. Avec deux valeurs, la première vaut pour haut et bas, la seconde pour droite et gauche. On peut aussi régler un seul côté : **padding-top**, **margin-left**…

**border-radius** arrondit les coins : **border-radius: 8px**.

## 3. Largeur, hauteur et box-sizing

Par défaut (**box-sizing: content-box**), **width** ne concerne que le contenu : une boîte de width 300px avec 20px de padding et 1px de bordure occupe en réalité 342 px. C''est source d''erreurs. La plupart des projets commencent donc par :

~~~css
* { box-sizing: border-box; }
~~~

Avec **border-box**, width inclut padding et bordure : la boîte occupe exactement 300 px.

Préférez **max-width** à width pour les blocs de texte : la boîte se réduit sur les petits écrans au lieu de déborder.

## 4. Éléments de bloc et éléments en ligne

- Les éléments **de bloc** (p, h1, div, ul, section) occupent toute la largeur disponible et commencent sur une nouvelle ligne ; width, height et les marges verticales s''y appliquent.
- Les éléments **en ligne** (a, strong, em, span) s''insèrent dans le texte ; leur largeur et leurs marges verticales sont ignorées.

La propriété **display** change ce comportement : **display: block**, **display: inline-block** (en ligne mais dimensionnable).

## 5. Centrer un bloc

Pour centrer horizontalement un bloc de largeur fixée, on lui donne des marges latérales automatiques :

~~~css
.conteneur {
  max-width: 720px;
  margin: 0 auto;
}
~~~

Pour centrer du **texte** à l''intérieur d''un bloc, on utilise **text-align: center** : ce n''est pas la même chose.

## 6. La fusion des marges

Les marges verticales de deux blocs voisins ne s''additionnent pas : elles **fusionnent**, et la plus grande l''emporte. Un paragraphe avec margin-bottom 24px suivi d''un autre avec margin-top 16px sont séparés de 24 px, pas de 40 px.

## 7. Déboguer une mise en page

Quand une boîte n''a pas la taille ou la place attendue, ajoutez temporairement **outline: 1px solid red;** à l''élément concerné. Contrairement à **border**, **outline** ne prend pas de place et ne modifie donc pas les dimensions de la boîte.

Les outils de développement affichent aussi un schéma du modèle de boîte de l''élément sélectionné, avec les valeurs calculées du contenu, du padding, de la bordure et de la marge.

Dernier réflexe : vérifiez si **box-sizing: border-box** est appliqué. C''est la cause la plus fréquente d''un écart de quelques pixels entre la largeur demandée et la largeur obtenue.', array['Une boîte = contenu + padding + bordure + marge.', 'Raccourcis dans l''ordre haut, droite, bas, gauche.', 'box-sizing: border-box fait inclure padding et bordure dans width.', 'Les blocs prennent toute la largeur ; les éléments en ligne s''insèrent dans le texte.', 'margin: 0 auto centre un bloc de largeur limitée ; text-align centre le texte.']::text[], '[{"language":"css","title":"Une carte centrée","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Modèle de boîte</title>\n  <style>\n    * { box-sizing: border-box; }\n    body { font-family: Arial, sans-serif; background-color: #eef2f7; }\n    .carte { max-width: 360px; margin: 40px auto; padding: 20px; background-color: white; border: 1px solid #dfe5ee; border-radius: 12px; }\n    .carte h2 { margin: 0 0 8px 0; color: #1d5fe0; }\n  </style>\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Parcours HTML</h2>\n    <p>Structurer le contenu des pages web.</p>\n  </div>\n</body>\n</html>"}]'::jsonb, '{"competences":["Décrire le modèle de boîte","Régler les espacements","Centrer un bloc","Utiliser box-sizing"],"definitions":[{"term":"Padding","definition":"Marge intérieure, entre le contenu et la bordure ; elle prend la couleur de fond de l''élément."},{"term":"Margin","definition":"Marge extérieure, transparente, qui sépare la boîte des éléments voisins."},{"term":"box-sizing","definition":"Propriété qui indique si width inclut (border-box) ou non (content-box) le padding et la bordure."},{"term":"Élément de bloc","definition":"Élément qui occupe toute la largeur disponible et commence sur une nouvelle ligne."},{"term":"Fusion des marges","definition":"Les marges verticales adjacentes de deux blocs se confondent : seule la plus grande est appliquée."}],"commentedAlgorithms":[{"title":"Mise en page d''une fiche centrée","code":"<style>\n  * {\n    box-sizing: border-box;\n  }\n  .fiche {\n    max-width: 400px;\n    margin: 24px auto;\n    padding: 16px 24px;\n    border: 2px solid #1d5fe0;\n    border-radius: 8px;\n  }\n  .fiche p {\n    margin: 0 0 12px 0;\n  }\n</style>\n<div class=\"fiche\">\n  <p><strong>Nom :</strong> Amani</p>\n  <p><strong>Filière :</strong> Informatique</p>\n</div>","comments":{"2":"Sélecteur universel : tous les éléments.","3":"width inclut padding et bordure.","6":"Jamais plus de 400 px, moins sur petit écran.","7":"24 px en haut et en bas, centrée horizontalement.","8":"16 px en haut et en bas, 24 px à gauche et à droite.","9":"Bordure bleue de 2 px.","10":"Coins arrondis.","12":"Paragraphes situés dans une fiche.","13":"Seulement une marge basse de 12 px.","16":"div : bloc générique, sans signification particulière."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Centrer un bloc avec text-align","wrong":".conteneur { width: 600px; text-align: center; }","right":".conteneur { max-width: 600px; margin: 0 auto; }","explanation":"text-align centre le **contenu en ligne** (le texte) à l''intérieur du bloc, pas le bloc lui-même.","run":false},{"title":"Oublier box-sizing et déborder","wrong":".colonne { width: 100%; padding: 20px; }","right":"* { box-sizing: border-box; }\n.colonne { width: 100%; padding: 20px; }","explanation":"En content-box, 100 % + 40 px de padding dépasse la largeur du parent et provoque un défilement horizontal, en particulier sur téléphone.","run":false}],"solvedExercises":[{"title":"Calculer une largeur","statement":"Une boîte a width: 300px, padding: 10px, border: 2px solid. Quelle largeur occupe-t-elle en content-box ? en border-box ?","solution":"content-box : 300 + 2 × 10 + 2 × 2 = 324 px\nborder-box : 300 px","explanation":"En border-box, le contenu se réduit à 300 − 24 = 276 px pour que le total reste 300 px."},{"title":"Lire un raccourci","statement":"Que signifie margin: 10px 20px 30px ?","solution":"haut 10px, droite et gauche 20px, bas 30px","explanation":"Avec trois valeurs : haut, puis droite et gauche, puis bas."}],"td":{"title":"TD 3 — Boîtes et espacements","instructions":"Utilisez exactement les sélecteurs et les valeurs demandés.","exerciseSlugs":["css-conteneur-centre","css-espacements-liste"]},"project":{"title":"Carte de profil étudiant","context":"Mettre en forme la carte de profil d''un étudiant : centrée, aérée, lisible et adaptée au téléphone.","steps":["Ajouter box-sizing: border-box à tous les éléments.","Centrer la carte avec une largeur maximale et des marges automatiques.","Régler padding, bordure arrondie et couleur de fond.","Mettre en forme le titre et le texte, puis vérifier l''aperçu et soumettre."],"deliverables":["Une feuille style.css qui satisfait toutes les vérifications."],"exerciseSlug":"css-projet-profil"}}'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css-boite-interrogation', 'Interrogation — Modèle de boîte', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-boite-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Quelle zone est entre le contenu et la bordure ?', null, '["margin","padding","outline","width"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Que signifie padding: 10px 20px ?', null, '["haut/bas 10, gauche/droite 20","haut 10, bas 20","gauche 10, droite 20","tous les côtés 30"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Comment centrer un bloc de largeur limitée ?', null, '["text-align: center","margin: 0 auto","padding: auto","align: center"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'vrai_faux', 'En border-box, width inclut padding et bordure.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css-boite-evaluation', 'Évaluation — Le modèle de boîte', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-boite-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle est la zone la plus extérieure d''une boîte ?', null, '["padding","border","margin","contenu"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle largeur occupe width: 200px; padding: 10px; border: 1px solid en content-box ?', null, '["200 px","211 px","222 px","220 px"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quel élément est en ligne par défaut ?', null, '["p","div","span","h2"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Deux paragraphes : margin-bottom 30px puis margin-top 20px. Quel espace les sépare ?', null, '["50 px","30 px","20 px","10 px"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Pourquoi préférer max-width à width pour un bloc de texte ?', null, '["max-width est plus rapide","Le bloc se réduit sur les petits écrans","width n''existe pas","Pour la couleur"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'vrai_faux', 'Le padding prend la couleur de fond de l''élément.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle propriété arrondit les coins ?', null, '["corner","border-radius","round","radius"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'css') and m.slug not in ('fondamentaux-css') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 1, 'Niveau 1 — Très débutant : mettre en forme', 'Relier une feuille de style, cibler les éléments avec des sélecteurs, gérer couleurs et textes, comprendre le modèle de boîte.', array['Relier une feuille CSS et écrire des règles.', 'Choisir le bon sélecteur (élément, classe, id, descendant).', 'Mettre en forme couleurs, polices et textes.', 'Dimensionner et espacer des boîtes (margin, border, padding).']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), null, 'css-examen-niveau-1', 'Examen du niveau 1 — Fondamentaux du CSS', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Comment relie-t-on une feuille style.css à une page ?', null, '["<style src=\"style.css\">","<link rel=\"stylesheet\" href=\"style.css\">","<css href=\"style.css\">","<script src=\"style.css\">"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quel sélecteur cible les éléments de classe « carte » ?', null, '["#carte",".carte","carte","*carte"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quel sélecteur est le plus spécifique ?', null, '["p",".texte","#intro","*"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Que cible « nav a » ?', null, '["les nav qui sont dans un a","les a situés dans un nav","les nav et les a","le premier a"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quelle propriété change la couleur du texte ?', null, '["background-color","color","font-color","text-color"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quelle propriété met le texte en gras ?', null, '["font-style: bold","font-weight: bold","text-weight: bold","bold: true"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Dans le modèle de boîte, quel espace est à l''intérieur de la bordure ?', null, '["margin","padding","outline","gap"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Avec box-sizing: border-box, width inclut…', null, '["seulement le contenu","contenu, padding et bordure","aussi la marge","rien"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'vrai_faux', 'margin: 0 auto centre horizontalement un bloc qui a une largeur définie.', null, '["Vrai","Faux"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Si deux règles de même spécificité se contredisent, laquelle s''applique ?', null, '["la première écrite","la dernière écrite","aucune","celle avec le plus de propriétés"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 2, 'Niveau 2 — Débutant : mise en page', 'Positionnement, Flexbox, Grid et pages adaptées aux mobiles.', array['Disposer des éléments avec Flexbox et Grid.', 'Adapter une page aux écrans avec les media queries.']::text[], array['Affichage et positionnement', 'Flexbox', 'CSS Grid', 'Responsive design et media queries', 'Unités relatives (rem, %, vw)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 3, 'Niveau 3 — Intermédiaire : interfaces soignées', 'Variables CSS, transitions et animations, pseudo-éléments, thèmes clair et sombre.', array['Construire un thème avec des variables CSS.', 'Animer une interface sans nuire à l''accessibilité.']::text[], array['Variables CSS (custom properties)', 'Transitions et animations', 'Pseudo-classes et pseudo-éléments avancés', 'Thèmes clair et sombre']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 4, 'Niveau 4 — Professionnel : architecture CSS', 'Organisation des feuilles de style, méthodologies, préprocesseurs et frameworks, performances.', array['Organiser le CSS d''un projet réel (BEM, composants).', 'Évaluer l''usage d''un framework CSS.', 'Optimiser le rendu.']::text[], array['Méthodologie BEM et composants', 'Préprocesseurs (Sass)', 'Frameworks utilitaires', 'Performances du rendu', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), null, 'css-positionnement', 'Test de positionnement — CSS', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quel sélecteur cible l''élément d''id « menu » ?', null, '[".menu","#menu","menu","@menu"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété change la couleur de fond ?', null, '["color","background-color","fill","bgcolor"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété ajoute de l''espace à l''intérieur de la bordure ?', null, '["margin","padding","spacing","gap"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle déclaration active Flexbox sur un conteneur ?', null, '["display: flex","flex: on","position: flex","float: flex"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle règle applique des styles seulement sous 600 px de large ?', null, '["@media (max-width: 600px)","@screen 600","@if width < 600","@media (min-width: 600px)"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété définit les colonnes d''une grille ?', null, '["grid-columns","grid-template-columns","columns-grid","grid-cols"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Comment utilise-t-on la variable --principale ?', null, '["$principale","var(--principale)","@principale","--principale()"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quel pseudo-élément insère du contenu avant un élément ?', null, '[":before-content","::before",":first","::start"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété anime en douceur un changement de couleur au survol ?', null, '["animation-color","transition","transform","keyframes"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Dans la méthode BEM, que désigne « carte__titre » ?', null, '["un modificateur","un élément du bloc carte","un bloc","un id"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété est la moins coûteuse à animer ?', null, '["width","top","transform","margin"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'vrai_faux', 'Sass est un préprocesseur compilé en CSS avant d''être envoyé au navigateur.', null, '["Vrai","Faux"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;

-- ===== Python =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('python', 'python', (select id from public.course_categories where slug = 'programmation'), 'Parcours B', 'Python', 'Le langage idéal pour passer de l''algorithme au programme.', 'Un parcours complet pour apprendre Python : syntaxe, structures de contrôle, structures de données, fonctions, modules, exceptions, fichiers, programmation orientée objet, algorithmes classiques, jusqu''à une introduction à la science des données et à l''intelligence artificielle.', 'debutant', array['Avoir suivi le module 1 et 2 du parcours Algorithmique (recommandé).']::text[], array['Écrire des programmes Python lisibles et corrects.', 'Utiliser listes, tuples, dictionnaires et ensembles.', 'Structurer un programme avec des fonctions, des modules et des classes.', 'Gérer les erreurs et manipuler des fichiers.', 'Implémenter des algorithmes de recherche et de tri.']::text[], 36, 'publie', 4, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'bases', 'Les bases du langage', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
| ET, OU, NON | and, or, not |', array['print affiche des valeurs.', 'Les blocs sont définis par l''indentation.', '# introduit un commentaire.']::text[], '[{"language":"python","title":"Premier programme","code":"# Mon premier programme Python\nprint(\"Bonjour UPL !\")\nprint(\"2 + 3 =\", 2 + 3)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'syntaxe-fondamentale'), 'py-syntaxe-quiz', 'Syntaxe', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-syntaxe-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'qcm', 'Comment Python délimite-t-il les blocs ?', null, '["Avec DEBUT et FIN","Avec des accolades","Avec l''indentation","Avec des points-virgules"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'vrai_faux', 'En Python, # commence un commentaire.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Utilisez le style **snake_case** : note_finale, nombre_etudiants. Les constantes s''écrivent en majuscules : TAUX_TVA = 0.16.', array['= crée ou modifie une variable.', 'int, float, str, bool sont les types de base.', 'input() renvoie toujours une chaîne.']::text[], '[{"language":"python","title":"Types et conversions","code":"nom = input()\nannee = int(input())\nage = 2026 - annee\nprint(\"Bonjour\", nom)\nprint(\"Âge :\", age, type(age))\nprint(\"Moyenne :\", 27 / 2, type(27 / 2))","stdin":"Amani\n2006"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'variables-types'), 'py-variables-quiz', 'Variables', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que renvoie input() ?', null, '["Un int","Une str","Un float","Cela dépend de ce qui est tapé"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que vaut int("7") + 3 ?', null, '["\"73\"","10","Erreur","\"10\""]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Le **:.2f** affiche deux décimales.', array['// et % correspondent à DIV et MOD.', '** est la puissance.', 'Les f-strings formatent l''affichage.']::text[], '[{"language":"python","title":"Opérateurs","code":"secondes = 3725\nh = secondes // 3600\nm = secondes % 3600 // 60\ns = secondes % 60\nprint(f\"{h} h {m} min {s} s\")\nnote = 14\nprint(\"Valide :\", 0 <= note <= 20, \"| Pair :\", note % 2 == 0)"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['if / elif / else avec deux-points et indentation.', 'and, or, not combinent les conditions.', 'match remplace SELON.']::text[], '[{"language":"python","title":"Année bissextile","code":"annee = int(input())\nif (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:\n    print(\"bissextile\")\nelse:\n    print(\"non bissextile\")","stdin":"2024"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'py-conditions-quiz', 'Conditions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'qcm', 'Quel mot-clé correspond à SINON SI ?', null, '["else if","elseif","elif","sinon_si"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'vrai_faux', 'Une liste vide est considérée comme fausse dans un if.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['range(a, b) va de a à b-1.', 'while répète tant que la condition est vraie.', 'break sort, continue passe au tour suivant.']::text[], '[{"language":"python","title":"Table et somme","code":"n = int(input())\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n * i}\")\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(\"Somme de 1 à\", n, \":\", total)","stdin":"7"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'py-boucles-quiz', 'Boucles', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Quelles valeurs produit range(2, 8, 2) ?', null, '["2, 4, 6, 8","2, 4, 6","2, 8","0, 2, 4, 6"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Que fait break ?', null, '["Passe au tour suivant","Arrête le programme","Sort de la boucle","Recommence la boucle"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'structures-donnees', 'Collections', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['Les indices commencent à 0 ; -1 désigne le dernier.', 'append, sort, len, sum, in sont essentiels.', 'Un tuple ne peut pas être modifié.']::text[], '[{"language":"python","title":"Manipuler une liste","code":"notes = list(map(float, input().split()))\nprint(\"Notes :\", notes)\nprint(\"Moyenne :\", round(sum(notes) / len(notes), 2))\nprint(\"Admis :\", [n for n in notes if n >= 10])\nprint(\"Triées :\", sorted(notes))","stdin":"12 8.5 15 9 17"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'py-listes-quiz', 'Listes', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-listes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'L = [4, 8, 15]. Que vaut L[1] ?', null, '["4","8","15","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'Que vaut [x * 2 for x in range(3)] ?', null, '["[2, 4, 6]","[0, 2, 4]","[0, 1, 2]","[1, 2, 3]"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'vrai_faux', 'On peut modifier un élément d''un tuple.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Opérations : union (|), intersection (&), différence (-). Le test **x in ensemble** est très rapide.', array['Un dictionnaire associe clé → valeur.', 'get() fournit une valeur par défaut.', 'Un set élimine les doublons.']::text[], '[{"language":"python","title":"Fréquence des mots","code":"texte = input().lower()\ncompte = {}\nfor mot in texte.split():\n    compte[mot] = compte.get(mot, 0) + 1\nfor mot in sorted(compte):\n    print(mot, compte[mot])\nprint(\"Mots distincts :\", len(set(texte.split())))","stdin":"le code le plus simple est le meilleur code"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'fonctions-modules', 'Fonctions et modules', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions-modules'), (select id from public.courses where slug = 'python'), 'fonctions', 'Fonctions', 'debutant', 40, array['Définir des fonctions avec def.', 'Utiliser paramètres par défaut et valeurs de retour multiples.', 'Comprendre la portée des variables.']::text[], '{}'::text[], '## Définir une fonction

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
~~~', array['def définit une fonction, return renvoie le résultat.', 'Les paramètres peuvent avoir des valeurs par défaut.', 'Les variables d''une fonction sont locales.']::text[], '[{"language":"python","title":"Fonctions","code":"def est_premier(n):\n    \"\"\"Retourne True si n est un nombre premier.\"\"\"\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\npremiers = [k for k in range(2, 50) if est_premier(k)]\nprint(premiers)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'py-fonctions-quiz', 'Fonctions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'Que renvoie une fonction sans instruction return ?', null, '["0","None","False","Une erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'def f(a, b=2): return a * b. Que vaut f(5) ?', null, '["5","7","10","Erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions-modules'), (select id from public.courses where slug = 'python'), 'modules', 'Modules', 'debutant', 25, array['Importer des modules de la bibliothèque standard.', 'Créer son propre module.']::text[], '{}'::text[], '## Importer un module

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

Avec **pip**, on installe des bibliothèques comme numpy ou pandas (voir le dernier module).', array['import charge un module.', 'La bibliothèque standard est très riche.', 'if __name__ == "__main__" protège le code principal.']::text[], '[{"language":"python","title":"Bibliothèque standard","code":"import math\nimport statistics\nfrom collections import Counter\n\nnotes = [12, 15, 9, 15, 17, 12, 15]\nprint(\"Racine de 2 :\", round(math.sqrt(2), 4))\nprint(\"Moyenne :\", round(statistics.mean(notes), 2))\nprint(\"Médiane :\", statistics.median(notes))\nprint(\"Note la plus fréquente :\", Counter(notes).most_common(1))"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'structuration', 'Programmes robustes', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Interceptez des exceptions **précises**. Un **except:** sans type masque les vraies erreurs et rend le débogage difficile.', array['Le traceback indique le type et la ligne de l''erreur.', 'try / except intercepte une erreur précise.', 'raise lève une exception.']::text[], '[{"language":"python","title":"Saisie robuste","code":"valeurs = [\"12\", \"abc\", \"0\", \"4\"]\nfor v in valeurs:\n    try:\n        n = int(v)\n        print(f\"100 / {n} = {100 / n}\")\n    except ValueError:\n        print(f\"''{v}'' n''est pas un entier\")\n    except ZeroDivisionError:\n        print(\"Division par zéro impossible\")"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'exceptions'), 'py-exceptions-quiz', 'Exceptions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-exceptions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-exceptions-quiz'), 'qcm', 'Quelle exception provoque int("douze") ?', null, '["TypeError","ValueError","NameError","SyntaxError"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
- Oublier **encoding="utf-8"** peut corrompre les accents.', array['open() ouvre un fichier ; with le ferme automatiquement.', 'Modes : r (lire), w (écrire), a (ajouter).', 'strip() et split() découpent les lignes.']::text[], '[{"language":"python","title":"Écrire puis relire","code":"etudiants = [(\"Amani\", 15), (\"Grâce\", 17), (\"Josué\", 9)]\nwith open(\"notes.txt\", \"w\", encoding=\"utf-8\") as f:\n    for nom, note in etudiants:\n        f.write(f\"{nom};{note}\\n\")\n\nwith open(\"notes.txt\", encoding=\"utf-8\") as f:\n    for ligne in f:\n        nom, note = ligne.strip().split(\";\")\n        statut = \"admis\" if int(note) >= 10 else \"ajourné\"\n        print(f\"{nom} : {note} ({statut})\")"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'poo-algorithmes', 'Objets et algorithmes', null, 5, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Par convention, un attribut préfixé par **_** est « privé » : il ne doit pas être utilisé hors de la classe.', array['Une classe définit attributs et méthodes.', '__init__ initialise l''objet ; self le désigne.', 'L''héritage réutilise une classe existante.']::text[], '[{"language":"python","title":"Compte bancaire","code":"class Compte:\n    def __init__(self, titulaire, solde=0):\n        self.titulaire = titulaire\n        self._solde = solde\n\n    def deposer(self, montant):\n        if montant <= 0:\n            raise ValueError(\"Le montant doit être positif\")\n        self._solde += montant\n\n    def retirer(self, montant):\n        if montant > self._solde:\n            raise ValueError(\"Solde insuffisant\")\n        self._solde -= montant\n\n    def __str__(self):\n        return f\"Compte de {self.titulaire} : {self._solde} FC\"\n\nc = Compte(\"Amani\", 5000)\nc.deposer(2500)\nc.retirer(1000)\nprint(c)\ntry:\n    c.retirer(100000)\nexcept ValueError as e:\n    print(\"Erreur :\", e)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'programmation-orientee-objet'), 'py-poo-quiz', 'Objets', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-poo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-poo-quiz'), 'qcm', 'Quel est le rôle de __init__ ?', null, '["Détruire l''objet","Initialiser l''objet à sa création","Afficher l''objet","Importer la classe"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Tester **x in liste** coûte O(n), alors que **x in ensemble** coûte O(1) en moyenne : pour de grandes données, la différence est énorme.', array['Pile : append / pop (LIFO).', 'File : deque.append / popleft (FIFO).', 'dict et set offrent des recherches rapides.']::text[], '[{"language":"python","title":"Parenthèses équilibrées avec une pile","code":"def equilibre(expr):\n    paires = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    pile = []\n    for c in expr:\n        if c in \"([{\":\n            pile.append(c)\n        elif c in paires:\n            if not pile or pile.pop() != paires[c]:\n                return False\n    return not pile\n\nfor e in [\"(a + b) * [c]\", \"((a)\", \"{[()]}\", \"(]\"]:\n    print(e, \"->\", equilibre(e))"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Programmer soi-même les tris reste indispensable pour **comprendre** et pour les examens.', array['La dichotomie exige une liste triée.', 'Insertion : O(n²) ; fusion : O(n log n).', 'sorted() accepte key et reverse.']::text[], '[{"language":"python","title":"Tri fusion","code":"def fusion(a, b):\n    resultat, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            resultat.append(a[i]); i += 1\n        else:\n            resultat.append(b[j]); j += 1\n    return resultat + a[i:] + b[j:]\n\ndef tri_fusion(liste):\n    if len(liste) <= 1:\n        return liste\n    m = len(liste) // 2\n    return fusion(tri_fusion(liste[:m]), tri_fusion(liste[m:]))\n\nprint(tri_fusion([38, 27, 43, 3, 9, 82, 10]))"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'professionnel', 'Python professionnel', null, 6, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'professionnel'), (select id from public.courses where slug = 'python'), 'science-donnees-ia', 'Introduction à la science des données et à l''IA', 'avance', 40, array['Découvrir l''écosystème Python pour les données.', 'Calculer des statistiques descriptives.', 'Comprendre le principe de l''apprentissage automatique.']::text[], '{}'::text[], '## L''écosystème

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

Un modèle n''est jamais meilleur que ses données : des données biaisées produisent des décisions biaisées. Vérifiez toujours les résultats et respectez la vie privée des personnes concernées.', array['NumPy, pandas, Matplotlib et scikit-learn forment l''écosystème données.', 'L''apprentissage automatique apprend une règle à partir d''exemples.', 'La qualité des données conditionne celle du modèle.']::text[], '[{"language":"python","title":"Régression linéaire à la main","code":"heures = [1, 2, 3, 4, 5, 6]\nnotes = [6, 8, 11, 12, 15, 17]\n\nn = len(heures)\nmx = sum(heures) / n\nmy = sum(notes) / n\ncov = sum((x - mx) * (y - my) for x, y in zip(heures, notes)) / n\nvar = sum((x - mx) ** 2 for x in heures) / n\na = cov / var\nb = my - a * mx\n\nprint(f\"Modèle : note = {a:.2f} x heures + {b:.2f}\")\nfor h in [3.5, 8]:\n    print(f\"{h} h de révision -> note prédite {a * h + b:.1f}\")"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'python') and m.slug not in ('bases', 'structures-donnees', 'fonctions-modules', 'structuration', 'poo-algorithmes', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 1, 'Niveau 1 — Très débutant : premiers pas en Python', 'Écrire et exécuter ses premiers programmes : syntaxe, variables, opérateurs, conditions et boucles.', array['Écrire et exécuter un programme Python.', 'Utiliser variables, types et opérateurs.', 'Écrire des conditions et des boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-examen-niveau-1', 'Examen du niveau 1 — Bases de Python', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que renvoie input() ?', null, '["un int","une str","un float","cela dépend"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut 17 // 5 ?', null, '["3.4","3","2","4"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut 2 ** 3 ?', null, '["6","8","9","5"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Quel mot-clé correspond à SINON SI ?', null, '["else if","elif","elseif","sinon"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Quelles valeurs produit range(1, 5) ?', null, '["1, 2, 3, 4, 5","1, 2, 3, 4","0, 1, 2, 3, 4","1, 5"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'vrai_faux', 'Python délimite les blocs par l''indentation.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut int("4") + 1 ?', null, '["\"41\"","5","erreur","\"5\""]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que fait break dans une boucle ?', null, '["passe au tour suivant","sort de la boucle","arrête le programme","recommence"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 2, 'Niveau 2 — Débutant : collections et fonctions', 'Listes, tuples, dictionnaires, ensembles, fonctions et modules : écrire de petits programmes structurés.', array['Manipuler les collections Python.', 'Écrire des fonctions réutilisables.', 'Utiliser la bibliothèque standard.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-examen-niveau-2', 'Examen du niveau 2 — Collections et fonctions', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'L = [3, 6, 9]. Que vaut L[-1] ?', null, '["3","9","6","erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que vaut len({1, 1, 2, 3}) ?', null, '["4","3","2","1"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Comment obtenir une valeur par défaut si la clé k est absente de d ?', null, '["d[k]","d.get(k, defaut)","d.find(k)","d.value(k)"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que renvoie une fonction sans return ?', null, '["0","None","False","une erreur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'vrai_faux', 'Un tuple est modifiable.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que vaut [x * x for x in range(3)] ?', null, '["[1, 4, 9]","[0, 1, 4]","[0, 2, 4]","[0, 1, 2]"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 3, 'Niveau 3 — Intermédiaire : programmes robustes et objets', 'Exceptions, fichiers, programmation orientée objet, structures de données et algorithmes : des programmes complets et fiables.', array['Gérer les erreurs et les fichiers.', 'Concevoir des classes.', 'Implémenter des structures et des algorithmes classiques.']::text[], array['Débogage avec pdb et journalisation']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 4, 'Niveau 4 — Professionnel : Python en production', 'Science des données, architecture, tests, performances et sécurité : réaliser des projets Python professionnels.', array['Concevoir l''architecture d''un programme Python de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture d''une application Python', 'Tests automatisés avec pytest', 'Performance et profilage', 'Sécurité des programmes Python', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-positionnement', 'Test de positionnement — Python', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Comment affiche-t-on du texte en Python ?', null, '["echo","print()","ECRIRE","console.log()"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Que vaut 7 % 3 ?', null, '["2","1","2.33","0"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Comment ajoute-t-on 5 à la fin de la liste L ?', null, '["L.add(5)","L.append(5)","L.push(5)","L + 5"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quel mot-clé définit une fonction ?', null, '["function","def","fun","lambda seulement"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quelle exception provoque int("abc") ?', null, '["TypeError","ValueError","KeyError","NameError"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Que désigne self dans une méthode ?', null, '["la classe","l''objet courant","le module","le parent"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quel outil sert à écrire des tests automatisés en Python ?', null, '["pip","pytest","venv","pdb"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quelle structure offre un test d''appartenance en O(1) en moyenne ?', null, '["list","tuple","set","str"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-evaluation-finale', 'Évaluation finale — Python', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut 17 // 5 ?', null, '["3.4","3","2","4"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut len([1, [2, 3], 4]) ?', null, '["4","3","2","Erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quel type est renvoyé par input() ?', null, '["int","str","float","bool"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Les indices d''une liste Python commencent à 1.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle structure garantit l''unicité de ses éléments ?', null, '["list","tuple","set","str"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle exception lève {"a": 1}["b"] ?', null, '["IndexError","KeyError","ValueError","NameError"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Une méthode d''instance reçoit l''objet en premier paramètre, nommé self par convention.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle est la complexité de sorted() ?', null, '["O(n)","O(n log n)","O(n²)","O(1)"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Langage C =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('langage-c', 'c', (select id from public.course_categories where slug = 'programmation'), 'Parcours C', 'Langage C', 'Comprendre ce qui se passe au plus près de la machine.', 'Le langage C est la base de nombreux systèmes (Linux, microcontrôleurs, bases de données). Ce parcours couvre la structure d''un programme, les types, les entrées-sorties, les structures de contrôle, les fonctions, les tableaux, les chaînes, les pointeurs, l''allocation dynamique, les structures, les fichiers et les structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.']::text[], array['Écrire, compiler et exécuter des programmes C.', 'Comprendre la mémoire : adresses, pointeurs, allocation dynamique.', 'Manipuler tableaux, chaînes, structures et fichiers.', 'Implémenter des structures de données classiques.']::text[], 32, 'publie', 5, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'bases', 'Les bases', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

// sur une ligne, ou /* sur plusieurs lignes */.', array['Un programme C commence par main.', 'Instructions terminées par ; et blocs entre accolades.', 'Le code est compilé avant d''être exécuté.']::text[], '[{"language":"c","title":"Bonjour","code":"#include <stdio.h>\n\nint main(void) {\n    printf(\"Bonjour UPL !\\n\");\n    printf(\"Le C a été créé en %d.\\n\", 1972);\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'structure-programme'), 'c-structure-quiz', 'Structure', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-structure-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'qcm', 'Par quelle fonction commence l''exécution d''un programme C ?', null, '["start","main","printf","include"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'vrai_faux', 'Le C est un langage interprété ligne par ligne.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
- Il n''y a pas de type booléen natif en C89 : 0 signifie faux, toute autre valeur vrai (ou bool avec stdbool.h).', array['Toute variable est déclarée avec son type.', 'La division entre entiers est entière.', 'sizeof donne la taille d''un type.']::text[], '[{"language":"c","title":"Types et tailles","code":"#include <stdio.h>\n\nint main(void) {\n    int a = 7, b = 2;\n    printf(\"7 / 2 = %d\\n\", a / b);\n    printf(\"7.0 / 2 = %.1f\\n\", (double)a / b);\n    printf(\"sizeof(int) = %zu, sizeof(double) = %zu\\n\", sizeof(int), sizeof(double));\n    return 0;\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

scanf renvoie le nombre de valeurs lues : **if (scanf("%d", &n) != 1)** détecte une saisie invalide.', array['printf utilise des formats (%d, %f, %s…).', 'scanf a besoin de l''adresse : &variable.', '%lf pour lire un double.']::text[], '[{"language":"c","title":"Lire et afficher","code":"#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Somme : %d\\n\", a + b);\n    printf(\"Moyenne : %.2f\\n\", (a + b) / 2.0);\n    return 0;\n}","stdin":"12 17"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Sans **break**, l''exécution continue dans le cas suivant.', array['if (condition) { … } else { … }.', '== compare, = affecte.', 'switch nécessite break.']::text[], '[{"language":"c","title":"Pair ou impair","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    if (n % 2 == 0) {\n        printf(\"pair\\n\");\n    } else {\n        printf(\"impair\\n\");\n    }\n    return 0;\n}","stdin":"7"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Comme en Python : **break** sort de la boucle, **continue** passe au tour suivant.', array['for (init; condition; pas).', 'do … while s''exécute au moins une fois.', 'long long évite le dépassement pour les grands produits.']::text[], '[{"language":"c","title":"Factorielle","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    long long f = 1;\n    scanf(\"%d\", &n);\n    for (int i = 2; i <= n; i++) {\n        f *= i;\n    }\n    printf(\"%d! = %lld\\n\", n, f);\n    return 0;\n}","stdin":"15"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'modularite', 'Fonctions et tableaux', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer et définir des fonctions.', 'Comprendre le passage par valeur.']::text[], '{}'::text[], '## Définition

~~~c
int carre(int x) {
    return x * x;
}
~~~

Le type de retour précède le nom ; **void** indique l''absence de retour (procédure).

## Prototype

Une fonction doit être connue avant son appel. Si elle est définie après main, on écrit son **prototype** au début : **int carre(int x);**

## Passage par valeur

En C, les arguments sont **toujours copiés**. Pour qu''une fonction modifie une variable de l''appelant, on lui passe son **adresse** (voir les pointeurs).', array['type nom(paramètres) { … }.', 'void : pas de valeur de retour.', 'Les arguments sont copiés.']::text[], '[{"language":"c","title":"PGCD","code":"#include <stdio.h>\n\nint pgcd(int a, int b);\n\nint main(void) {\n    printf(\"pgcd(48, 18) = %d\\n\", pgcd(48, 18));\n    return 0;\n}\n\nint pgcd(int a, int b) {\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'tableaux', 'Tableaux', 'debutant', 30, array['Déclarer et parcourir un tableau.', 'Passer un tableau à une fonction.']::text[], '{}'::text[], '## Déclaration

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

**int m[3][4];** et accès **m[i][j]**.', array['Indices de 0 à n-1.', 'Aucune vérification des bornes en C.', 'On passe la taille avec le tableau.']::text[], '[{"language":"c","title":"Maximum d''un tableau","code":"#include <stdio.h>\n\nint maximum(int t[], int n) {\n    int m = t[0];\n    for (int i = 1; i < n; i++) {\n        if (t[i] > m) m = t[i];\n    }\n    return m;\n}\n\nint main(void) {\n    int n, t[100];\n    scanf(\"%d\", &n);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &t[i]);\n    printf(\"Maximum : %d\\n\", maximum(t, n));\n    return 0;\n}","stdin":"5\n4 9 2 9 1"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'chaines', 'Chaînes de caractères', 'debutant', 30, array['Comprendre les chaînes terminées par ''\0''.', 'Utiliser string.h.']::text[], '{}'::text[], '## Une chaîne est un tableau de char

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

**scanf("%19s", ville)** lit un mot (sans &, le nom du tableau est déjà une adresse). Pour une ligne entière : **fgets(ligne, sizeof ligne, stdin)**.', array['Une chaîne finit par ''\0''.', 'strlen, strcpy, strcmp sont dans string.h.', 'Ne jamais comparer des chaînes avec ==.']::text[], '[{"language":"c","title":"Compter les voyelles","code":"#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    char mot[100];\n    int nb = 0;\n    scanf(\"%99s\", mot);\n    for (size_t i = 0; i < strlen(mot); i++) {\n        char c = tolower(mot[i]);\n        if (strchr(\"aeiouy\", c)) nb++;\n    }\n    printf(\"%s contient %d voyelle(s)\\n\", mot, nb);\n    return 0;\n}","stdin":"Programmation"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'memoire', 'Mémoire et données', null, 3, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'pointeurs', 'Pointeurs', 'avance', 40, array['Comprendre adresses et pointeurs.', 'Modifier une variable via son adresse.']::text[], '{}'::text[], '## Adresse et pointeur

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

**NULL** indique qu''un pointeur ne désigne rien. Déréférencer NULL ou un pointeur non initialisé provoque une **erreur de segmentation**.', array['Un pointeur contient une adresse.', '& donne l''adresse, * accède à la valeur pointée.', 'Passer une adresse permet de modifier la variable d''origine.']::text[], '[{"language":"c","title":"Échange par pointeurs","code":"#include <stdio.h>\n\nvoid echanger(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint main(void) {\n    int x = 3, y = 8;\n    int *p = &x;\n    printf(\"x = %d, *p = %d\\n\", x, *p);\n    echanger(&x, &y);\n    printf(\"Après échange : x = %d, y = %d\\n\", x, y);\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'pointeurs'), 'c-pointeurs-quiz', 'Pointeurs', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-pointeurs-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-pointeurs-quiz'), 'qcm', 'int x = 5; int *p = &x; *p = 9; Que vaut x ?', null, '["5","9","L''adresse de x","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'allocation-dynamique', 'Allocation dynamique', 'avance', 35, array['Réserver de la mémoire avec malloc.', 'Libérer la mémoire avec free.']::text[], '{}'::text[], '## Pourquoi ?

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

**calloc** alloue et initialise à zéro ; **realloc** change la taille d''un bloc.', array['malloc réserve, free libère.', 'Vérifier NULL après malloc.', 'Une mémoire non libérée est une fuite.']::text[], '[{"language":"c","title":"Tableau de taille choisie","code":"#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n * sizeof(int));\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = i * i;\n    for (int i = 0; i < n; i++) printf(\"%d \", t[i]);\n    printf(\"\\n\");\n    free(t);\n    return 0;\n}","stdin":"8"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'structures', 'Structures', 'intermediaire', 30, array['Définir un type structuré avec struct.', 'Manipuler un tableau de structures.']::text[], '{}'::text[], '## Regrouper des données

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

**Etudiant promo[100];** permet de gérer toute une promotion.', array['struct regroupe des champs de types différents.', 'typedef donne un nom au type.', '. pour une variable, -> pour un pointeur.']::text[], '[{"language":"c","title":"Meilleur étudiant","code":"#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    double moyenne;\n} Etudiant;\n\nint main(void) {\n    Etudiant promo[3] = {{\"Amani\", 14.5}, {\"Grace\", 17.0}, {\"Josue\", 11.25}};\n    int meilleur = 0;\n    for (int i = 1; i < 3; i++) {\n        if (promo[i].moyenne > promo[meilleur].moyenne) meilleur = i;\n    }\n    printf(\"Major : %s (%.2f)\\n\", promo[meilleur].nom, promo[meilleur].moyenne);\n    return 0;\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Ouvrir, lire, écrire et fermer un fichier.']::text[], '{}'::text[], '## fopen et fclose

~~~c
FILE *f = fopen("notes.txt", "w");
if (f == NULL) { perror("fopen"); return 1; }
fprintf(f, "%s %d\n", "Amani", 15);
fclose(f);
~~~

Modes : "r" (lecture), "w" (écriture), "a" (ajout).

## Lire

**fscanf(f, "%s %d", nom, &note)** renvoie le nombre de valeurs lues, ou EOF à la fin du fichier. **fgets** lit une ligne entière.

Toujours vérifier que **fopen** n''a pas renvoyé NULL et toujours fermer le fichier.', array['fopen / fclose.', 'fprintf et fscanf fonctionnent comme printf et scanf.', 'Vérifier NULL après fopen.']::text[], '[{"language":"c","title":"Écrire puis relire","code":"#include <stdio.h>\n\nint main(void) {\n    FILE *f = fopen(\"notes.txt\", \"w\");\n    if (f == NULL) return 1;\n    fprintf(f, \"Amani 15\\nGrace 17\\nJosue 9\\n\");\n    fclose(f);\n\n    f = fopen(\"notes.txt\", \"r\");\n    if (f == NULL) return 1;\n    char nom[30];\n    int note;\n    while (fscanf(f, \"%29s %d\", nom, &note) == 2) {\n        printf(\"%-6s %2d %s\\n\", nom, note, note >= 10 ? \"admis\" : \"ajourné\");\n    }\n    fclose(f);\n    return 0;\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'professionnel', 'C professionnel', null, 4, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'professionnel'), (select id from public.courses where slug = 'langage-c'), 'structures-donnees', 'Algorithmes et structures de données', 'avance', 45, array['Implémenter une liste chaînée.', 'Implémenter une pile.']::text[], '{}'::text[], '## La liste chaînée

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

Chaque nœud alloué avec malloc doit être libéré avec free, en parcourant la liste.', array['Une liste chaînée relie des nœuds par des pointeurs.', 'Une pile se réalise par insertion/retrait en tête.', 'Libérer chaque nœud.']::text[], '[{"language":"c","title":"Liste chaînée","code":"#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Noeud {\n    int valeur;\n    struct Noeud *suivant;\n} Noeud;\n\nNoeud *empiler(Noeud *tete, int v) {\n    Noeud *n = malloc(sizeof(Noeud));\n    if (n == NULL) exit(1);\n    n->valeur = v;\n    n->suivant = tete;\n    return n;\n}\n\nint main(void) {\n    Noeud *pile = NULL;\n    for (int i = 1; i <= 5; i++) pile = empiler(pile, i * 10);\n    for (Noeud *p = pile; p != NULL; p = p->suivant) printf(\"%d \", p->valeur);\n    printf(\"\\n\");\n    while (pile != NULL) {\n        Noeud *s = pile->suivant;\n        free(pile);\n        pile = s;\n    }\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'langage-c') and m.slug not in ('bases', 'modularite', 'memoire', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 1, 'Niveau 1 — Très débutant : écrire et compiler', 'Structure d''un programme, variables, entrées-sorties, conditions et boucles.', array['Écrire, compiler et exécuter un programme C.', 'Utiliser printf et scanf.', 'Écrire des conditions et des boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-examen-niveau-1', 'Examen du niveau 1 — Bases du C', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Par quelle fonction commence l''exécution ?', null, '["start","main","init","printf"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Quel format lit un double avec scanf ?', null, '["%d","%f","%lf","%s"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Pourquoi écrit-on &n dans scanf("%d", &n) ?', null, '["pour multiplier","pour donner l''adresse de n","par convention","pour convertir"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'vrai_faux', 'if (x = 5) compare x à 5.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Que se passe-t-il sans break dans un case de switch ?', null, '["erreur","l''exécution continue dans le case suivant","le switch s''arrête","rien"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 2, 'Niveau 2 — Débutant : fonctions, tableaux et chaînes', 'Découper son programme, manipuler des tableaux et des chaînes.', array['Écrire des fonctions.', 'Parcourir des tableaux.', 'Manipuler des chaînes avec string.h.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 3, 'Niveau 3 — Intermédiaire : la mémoire', 'Pointeurs, allocation dynamique, structures et fichiers.', array['Maîtriser les pointeurs.', 'Allouer et libérer la mémoire.', 'Organiser des données avec struct et des fichiers.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 4, 'Niveau 4 — Professionnel : C robuste', 'Structures de données, modularité en plusieurs fichiers, sécurité mémoire, tests et performance.', array['Concevoir l''architecture d''un programme C de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Compilation séparée et Makefile', 'Sécurité mémoire (débordements, Valgrind)', 'Tests unitaires en C', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-positionnement', 'Test de positionnement — Langage C', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quelle fonction affiche du texte formaté en C ?', null, '["print","printf","echo","cout"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel caractère termine une chaîne en C ?', null, '["''\\n''","''\\0''","'' ''","EOF"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel est l''indice du dernier élément de int t[10] ?', null, '["10","9","11","1"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Que contient un pointeur ?', null, '["une valeur entière quelconque","une adresse mémoire","un tableau","une fonction"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quelle fonction libère une zone allouée par malloc ?', null, '["delete","free","release","dispose"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel outil détecte les fuites mémoire d''un programme C ?', null, '["Valgrind","gzip","grep","make"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel fichier décrit la compilation d''un projet avec make ?', null, '["Makefile","package.json","build.txt","main.h"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-evaluation-finale', 'Évaluation finale — Langage C', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que vaut 9 / 2 en C si les deux opérandes sont des int ?', null, '["4.5","4","5","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Quel format affiche un double avec deux décimales ?', null, '["%d","%.2f","%2d","%s"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'vrai_faux', 'Le C vérifie automatiquement les indices des tableaux.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que faut-il appeler après malloc lorsque la mémoire n''est plus utile ?', null, '["delete","free","fclose","Rien"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== JavaScript =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('javascript', 'javascript', (select id from public.course_categories where slug = 'web'), 'Parcours D', 'JavaScript', 'Le langage qui fait vivre le web.', 'JavaScript anime les pages web et fait aussi tourner des serveurs. Ce parcours va des variables et fonctions jusqu''au DOM, aux événements, à l''asynchronisme, aux promesses et aux API, avec des projets web pratiques.', 'debutant', array['Parcours Algorithmique, modules 1 et 2.']::text[], array['Maîtriser la syntaxe moderne de JavaScript.', 'Manipuler tableaux et objets.', 'Interagir avec une page web via le DOM et les événements.', 'Comprendre l''asynchronisme, les promesses et les API.']::text[], 28, 'publie', 6, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'langage', 'Le langage', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Les instructions se terminent par un point-virgule (recommandé) et les blocs sont délimités par des accolades.', array['HTML structure, CSS décore, JavaScript anime.', 'console.log affiche dans la console.', 'JavaScript fonctionne aussi côté serveur avec Node.js.']::text[], '[{"language":"javascript","title":"Premier programme","code":"console.log(\"Bonjour UPL !\");\nconst annee = new Date().getFullYear();\nconsole.log(\"Nous sommes en\", annee);"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Number("42") → 42, String(10) → "10", parseInt("12px") → 12. Attention : "5" + 3 donne "53" (concaténation), alors que "5" * 3 donne 15.', array['const par défaut, let si nécessaire.', 'number regroupe entiers et réels.', 'Attention aux conversions implicites avec +.']::text[], '[{"language":"javascript","title":"Types","code":"const nom = \"Amani\";\nlet note = 14.5;\nconsole.log(typeof nom, typeof note, typeof true);\nconsole.log(\"5\" + 3, \"5\" * 3, Number(\"5\") + 3);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

**switch** fonctionne comme en C (avec break).', array['Toujours === et !==.', 'Math.floor pour la division entière.', 'L''opérateur ternaire condition ? a : b.']::text[], '[{"language":"javascript","title":"Comparaisons","code":"console.log(\"5\" == 5, \"5\" === 5);\nconst note = 13;\nconsole.log(note >= 10 ? \"admis\" : \"ajourné\");\nconsole.log(17 % 5, 2 ** 10, Math.floor(17 / 5));"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Parcourt les **clés** d''un objet (à éviter sur les tableaux).', array['for classique pour un compteur.', 'for…of pour les valeurs.', 'for…in pour les clés d''un objet.']::text[], '[{"language":"javascript","title":"Table de multiplication","code":"const n = 7;\nfor (let i = 1; i <= 10; i++) {\n  console.log(n + \" x \" + i + \" = \" + n * i);\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'fonctions-donnees', 'Fonctions et données', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'fonctions-donnees'), (select id from public.courses where slug = 'javascript'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer des fonctions classiques et fléchées.', 'Utiliser des fonctions comme valeurs.']::text[], '{}'::text[], '## Déclarations

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

En JavaScript, une fonction est une **valeur** : on peut la passer en argument. C''est la base de map, filter et des gestionnaires d''événements.', array['function ou fonction fléchée =>.', 'Les fonctions sont des valeurs.', 'Paramètres par défaut possibles.']::text[], '[{"language":"javascript","title":"Fonctions","code":"function estPremier(n) {\n  if (n < 2) return false;\n  for (let d = 2; d * d <= n; d++) {\n    if (n % d === 0) return false;\n  }\n  return true;\n}\nconst premiers = [];\nfor (let k = 2; k < 40; k++) if (estPremier(k)) premiers.push(k);\nconsole.log(premiers.join(\", \"));"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'fonctions-donnees'), (select id from public.courses where slug = 'javascript'), 'tableaux-objets', 'Tableaux et objets', 'debutant', 35, array['Manipuler des tableaux avec map, filter, reduce.', 'Créer et parcourir des objets.']::text[], '{}'::text[], '## Tableaux

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

const { nom, age } = etudiant; et const [premier, ...reste] = notes;', array['map, filter, reduce évitent beaucoup de boucles.', 'sort numérique : (a, b) => a - b.', 'Les objets associent des clés à des valeurs.']::text[], '[{"language":"javascript","title":"map, filter, reduce","code":"const promo = [\n  { nom: \"Amani\", moyenne: 14.5 },\n  { nom: \"Grâce\", moyenne: 17 },\n  { nom: \"Josué\", moyenne: 8.5 },\n];\nconst admis = promo.filter((e) => e.moyenne >= 10).map((e) => e.nom);\nconst moyenne = promo.reduce((s, e) => s + e.moyenne, 0) / promo.length;\nconsole.log(\"Admis :\", admis.join(\", \"));\nconsole.log(\"Moyenne générale :\", moyenne.toFixed(2));"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'web', 'JavaScript dans la page', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

> Les programmes de l''éditeur s''exécutent dans un environnement isolé sans page : testez le DOM dans un fichier HTML sur votre ordinateur.', array['Le DOM représente la page sous forme d''objets.', 'querySelector sélectionne, textContent modifie.', 'textContent est plus sûr qu''innerHTML.']::text[], '[{"language":"javascript","title":"Exemple (à tester dans une page HTML)","code":"// Dans une page contenant <ul id=\"langages\"></ul>\nconst langages = [\"Pseudocode\", \"Python\", \"C\", \"JavaScript\", \"Java\"];\nif (typeof document !== \"undefined\") {\n  const ul = document.querySelector(\"#langages\");\n  for (const l of langages) {\n    const li = document.createElement(\"li\");\n    li.textContent = l;\n    ul.append(li);\n  }\n} else {\n  console.log(\"Pas de page ici : voici la liste qui serait affichée :\");\n  langages.forEach((l) => console.log(\"- \" + l));\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Toujours **valider** les données saisies avant de les utiliser.', array['addEventListener(type, fonction).', 'event.preventDefault() bloque le comportement par défaut.', 'Valider toujours les saisies.']::text[], '[{"language":"javascript","title":"Simulation d''événements","code":"// Un mini système d''événements pour comprendre le principe\nconst ecouteurs = {};\nfunction on(nom, f) {\n  if (!ecouteurs[nom]) ecouteurs[nom] = [];\n  ecouteurs[nom].push(f);\n}\nfunction emettre(nom, donnee) { (ecouteurs[nom] || []).forEach((f) => f(donnee)); }\n\non(\"click\", (d) => console.log(\"Clic sur\", d));\non(\"click\", () => console.log(\"Deuxième écouteur\"));\nemettre(\"click\", \"le bouton Valider\");"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'asynchrone', 'Asynchronisme et API', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchrone'), (select id from public.courses where slug = 'javascript'), 'asynchronisme-promesses', 'Asynchronisme et promesses', 'avance', 35, array['Comprendre l''exécution asynchrone.', 'Utiliser les promesses et async/await.']::text[], '{}'::text[], '## Pourquoi l''asynchronisme ?

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

**await** suspend la fonction jusqu''au résultat, sans bloquer le reste du programme.', array['Le code asynchrone s''exécute plus tard.', 'Une promesse est tenue ou rompue.', 'async/await rend le code asynchrone lisible.']::text[], '[{"language":"javascript","title":"Promesses et async/await","code":"const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));\n\nasync function principal() {\n  console.log(\"Début\");\n  const a = await attendre(200, \"données A\");\n  console.log(\"Reçu :\", a);\n  const [b, c] = await Promise.all([attendre(100, \"B\"), attendre(150, \"C\")]);\n  console.log(\"En parallèle :\", b, c);\n  console.log(\"Fin\");\n}\nprincipal();"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchronisme-promesses'), 'js-async-quiz', 'Asynchronisme', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'js-async-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'js-async-quiz'), 'qcm', 'Dans quel ordre s''affichent A, B, C ? console.log(''A''); setTimeout(() => console.log(''B''), 0); console.log(''C'');', null, '["A B C","A C B","B A C","C A B"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchrone'), (select id from public.courses where slug = 'javascript'), 'api', 'Consommer une API', 'avance', 30, array['Appeler une API web avec fetch.', 'Traiter une réponse JSON.']::text[], '{}'::text[], '## fetch

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

> Pour des raisons de sécurité, les programmes de l''éditeur n''ont pas accès au réseau.', array['fetch renvoie une promesse.', 'JSON.parse / JSON.stringify.', 'Aucune clé secrète dans le navigateur.']::text[], '[{"language":"javascript","title":"JSON","code":"const texte = ''{\"cours\": \"JavaScript\", \"lecons\": 10, \"langages\": [\"fr\", \"en\"]}'';\nconst objet = JSON.parse(texte);\nconsole.log(objet.cours, \"-\", objet.lecons, \"leçons\");\nobjet.niveau = \"débutant\";\nconsole.log(JSON.stringify(objet));"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'professionnel', 'Projets web', null, 5, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'professionnel'), (select id from public.courses where slug = 'javascript'), 'projets-web', 'Projets web pratiques', 'avance', 60, array['Réaliser un petit projet complet : gestionnaire de tâches.']::text[], '{}'::text[], '## Projet : liste de tâches

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
- Convertisseur de devises (avec une API).', array['Séparer modèle, logique et affichage.', 'localStorage conserve les données dans le navigateur.', 'Tester la logique indépendamment de la page.']::text[], '[{"language":"javascript","title":"Logique du gestionnaire de tâches","code":"let taches = [];\nlet prochainId = 1;\n\nfunction ajouter(texte) {\n  if (!texte.trim()) throw new Error(\"Tâche vide\");\n  taches.push({ id: prochainId++, texte: texte.trim(), faite: false });\n}\nfunction basculer(id) {\n  taches = taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t));\n}\nfunction supprimer(id) {\n  taches = taches.filter((t) => t.id !== id);\n}\nfunction afficher() {\n  taches.forEach((t) => console.log((t.faite ? \"[x] \" : \"[ ] \") + t.texte));\n  console.log(\"---\");\n}\n\najouter(\"Réviser les boucles\");\najouter(\"Faire l''exercice FizzBuzz\");\najouter(\"Lire la leçon sur les promesses\");\nbasculer(2);\nafficher();\nsupprimer(1);\nafficher();"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'javascript') and m.slug not in ('langage', 'fonctions-donnees', 'web', 'asynchrone', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 1, 'Niveau 1 — Très débutant : le langage', 'Variables, types, opérateurs, conditions et boucles.', array['Écrire et exécuter du JavaScript.', 'Utiliser let, const et les types.', 'Écrire conditions et boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-examen-niveau-1', 'Examen du niveau 1 — Bases de JavaScript', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que vaut "3" + 4 ?', null, '["7","\"34\"","erreur","NaN"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Quel mot-clé déclare une variable non réaffectable ?', null, '["var","let","const"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'vrai_faux', '=== compare la valeur et le type.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Comment obtenir la division entière de 17 par 5 ?', null, '["17 // 5","Math.floor(17 / 5)","17 DIV 5","int(17 / 5)"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que parcourt for (const x of tableau) ?', null, '["les indices","les valeurs","les clés","rien"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que vaut typeof 3.5 ?', null, '["\"float\"","\"number\"","\"double\"","\"real\""]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 2, 'Niveau 2 — Débutant : fonctions, données et page web', 'Fonctions, tableaux et objets, DOM et événements.', array['Écrire des fonctions.', 'Manipuler tableaux et objets.', 'Modifier une page et réagir aux actions.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 3, 'Niveau 3 — Intermédiaire : asynchronisme et API', 'Promesses, async/await et consommation d''API.', array['Comprendre l''asynchronisme.', 'Consommer une API web.']::text[], array['Modules ES et organisation du code', 'Débogage dans le navigateur']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 4, 'Niveau 4 — Professionnel : applications web', 'Architecture d''une application, tests, sécurité web et performances.', array['Concevoir l''architecture d''un programme JavaScript de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture d''une application front-end', 'Tests automatisés', 'Sécurité web (XSS, CSRF)', 'Performances web', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-positionnement', 'Test de positionnement — JavaScript', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quel mot-clé déclare une variable réaffectable ?', null, '["const","let","final","def"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Que vaut 2 === "2" ?', null, '["true","false"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle méthode ajoute un élément à la fin d''un tableau ?', null, '["add","push","append","insert"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle méthode réagit à un clic sur un élément ?', null, '["onClick()","addEventListener(\"click\", …)","listen(\"click\")","click.on()"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Que renvoie une fonction déclarée async ?', null, '["une valeur","une Promise","un callback","undefined"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle fonction effectue une requête HTTP ?', null, '["fetch","request","http","ajax"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle faille consiste à injecter du script dans une page ?', null, '["CSRF","XSS","DDoS","SQLi"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quel outil sert aux tests automatisés en JavaScript ?', null, '["Vitest","Webpack","ESLint","Prettier"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-evaluation-finale', 'Évaluation finale — JavaScript', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Que vaut "3" + 4 en JavaScript ?', null, '["7","\"34\"","Erreur","NaN"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quel mot-clé déclare une variable non réaffectable ?', null, '["var","let","const","static"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'vrai_faux', '=== compare la valeur et le type.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quelle méthode garde les éléments vérifiant une condition ?', null, '["map","filter","reduce","forEach"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Java =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('java', 'java', (select id from public.course_categories where slug = 'programmation'), 'Parcours E', 'Java', 'La programmation orientée objet, rigoureuse et portable.', 'Java est utilisé dans les applications d''entreprise, Android et les systèmes distribués. Ce parcours présente la syntaxe, les méthodes, puis approfondit la programmation orientée objet : classes, constructeurs, encapsulation, héritage, polymorphisme, interfaces, collections, exceptions, fichiers et structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.', 'Notions d''objets (parcours Python, leçon POO) recommandées.']::text[], array['Écrire des programmes Java structurés.', 'Concevoir des classes selon les principes de la POO.', 'Utiliser les collections et gérer les exceptions.', 'Implémenter des structures de données.']::text[], 32, 'publie', 7, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'bases', 'Les bases', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['Java est compilé en bytecode exécuté par la JVM.', 'Tout est dans une classe ; main est le point d''entrée.', 'Scanner lit les entrées.']::text[], '[{"language":"java","title":"Bonjour","code":"public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Bonjour UPL !\");\n        System.out.println(\"Java a été créé en \" + 1995);\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Depuis Java 10, **var** laisse le compilateur déduire le type : var total = 0;', array['Types primitifs : int, double, boolean, char.', 'final déclare une constante.', 'equals compare le contenu des chaînes.']::text[], '[{"language":"java","title":"Types","code":"public class Main {\n    public static void main(String[] args) {\n        int a = 7, b = 2;\n        System.out.println(a / b + \" \" + (double) a / b + \" \" + a % b);\n        String s1 = \"UPL\";\n        String s2 = new String(\"UPL\");\n        System.out.println(s1 == s2);\n        System.out.println(s1.equals(s2));\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
~~~', array['if / else, switch avec ->.', 'for, while, do…while, for-each.', 'Attention aux parenthèses dans les concaténations.']::text[], '[{"language":"java","title":"Table de multiplication","code":"import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= 10; i++) {\n            System.out.println(n + \" x \" + i + \" = \" + (n * i));\n        }\n    }\n}","stdin":"6"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Java passe toujours **une copie** : copie de la valeur pour les primitifs, copie de la **référence** pour les objets (l''objet lui-même peut donc être modifié).', array['static : méthode de classe.', 'La surcharge varie les paramètres.', 'Les arguments sont des copies (valeurs ou références).']::text[], '[{"language":"java","title":"Méthodes","code":"public class Main {\n    static boolean estPremier(int n) {\n        if (n < 2) return false;\n        for (int d = 2; d * d <= n; d++) {\n            if (n % d == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        StringBuilder sb = new StringBuilder();\n        for (int k = 2; k < 40; k++) {\n            if (estPremier(k)) sb.append(k).append(\" \");\n        }\n        System.out.println(sb.toString().trim());\n    }\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'objets', 'Objets et collections', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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

Redéfinir **toString()** permet d''afficher un objet lisiblement avec System.out.println.', array['Une classe regroupe attributs et méthodes.', 'Le constructeur initialise l''objet.', 'toString définit l''affichage.']::text[], '[{"language":"java","title":"Classe Etudiant","code":"class Etudiant {\n    String nom;\n    double moyenne;\n\n    Etudiant(String nom, double moyenne) {\n        this.nom = nom;\n        this.moyenne = moyenne;\n    }\n\n    boolean estAdmis() {\n        return moyenne >= 10;\n    }\n\n    @Override\n    public String toString() {\n        return nom + \" (\" + moyenne + \")\" + (estAdmis() ? \" admis\" : \" ajourné\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Josué\", 8.75) };\n        for (Etudiant e : promo) System.out.println(e);\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
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
| public | tout le monde |', array['private protège les attributs.', 'Les méthodes publiques valident les modifications.', 'final empêche la réaffectation.']::text[], '[{"language":"java","title":"Compte encapsulé","code":"class Compte {\n    private final String titulaire;\n    private double solde;\n\n    Compte(String titulaire) { this.titulaire = titulaire; }\n\n    public double getSolde() { return solde; }\n\n    public void deposer(double m) {\n        if (m <= 0) throw new IllegalArgumentException(\"Montant invalide\");\n        solde += m;\n    }\n\n    public void retirer(double m) {\n        if (m > solde) throw new IllegalStateException(\"Solde insuffisant\");\n        solde -= m;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Compte c = new Compte(\"Amani\");\n        c.deposer(5000);\n        c.retirer(1200);\n        System.out.println(\"Solde : \" + c.getSolde());\n        try {\n            c.retirer(99999);\n        } catch (IllegalStateException e) {\n            System.out.println(\"Refusé : \" + e.getMessage());\n        }\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'collections', 'Collections', 'intermediaire', 35, array['Utiliser ArrayList, HashMap et HashSet.']::text[], '{}'::text[], '## ArrayList

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

Le type entre chevrons (**<Integer>**) indique ce que contient la collection. Les collections contiennent des objets : on écrit Integer et non int.', array['ArrayList : liste dynamique.', 'HashMap / TreeMap : clé → valeur.', 'HashSet : unicité.']::text[], '[{"language":"java","title":"Compter des mots","code":"import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String texte = \"le code le plus simple est le meilleur code\";\n        Map<String, Integer> compte = new TreeMap<>();\n        for (String mot : texte.split(\" \")) {\n            compte.merge(mot, 1, Integer::sum);\n        }\n        for (Map.Entry<String, Integer> e : compte.entrySet()) {\n            System.out.println(e.getKey() + \" \" + e.getValue());\n        }\n        System.out.println(\"Distincts : \" + new HashSet<>(Arrays.asList(texte.split(\" \"))).size());\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'exceptions', 'Exceptions', 'intermediaire', 25, array['Intercepter et lever des exceptions.']::text[], '{}'::text[], '## try / catch / finally

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

**throw new IllegalArgumentException("message");**', array['try / catch / finally.', 'Les exceptions vérifiées doivent être traitées ou déclarées.', 'throw lève une exception.']::text[], '[{"language":"java","title":"Conversion sécurisée","code":"public class Main {\n    public static void main(String[] args) {\n        String[] valeurs = { \"12\", \"abc\", \"0\" };\n        for (String v : valeurs) {\n            try {\n                int n = Integer.parseInt(v);\n                System.out.println(\"100 / \" + n + \" = \" + (100 / n));\n            } catch (NumberFormatException e) {\n                System.out.println(\"''\" + v + \"'' n''est pas un entier\");\n            } catch (ArithmeticException e) {\n                System.out.println(\"Division par zéro\");\n            }\n        }\n    }\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'conception', 'Conception orientée objet', null, 3, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'heritage-polymorphisme', 'Héritage et polymorphisme', 'avance', 40, array['Créer une sous-classe avec extends.', 'Redéfinir une méthode.', 'Exploiter le polymorphisme.']::text[], '{}'::text[], '## Héritage

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

Une classe **abstract** ne peut pas être instanciée et peut déclarer des méthodes sans corps, que les sous-classes doivent définir.', array['extends crée une sous-classe.', '@Override redéfinit une méthode.', 'Le polymorphisme appelle la méthode de l''objet réel.']::text[], '[{"language":"java","title":"Formes","code":"abstract class Forme {\n    abstract double aire();\n    String nom() { return getClass().getSimpleName(); }\n}\n\nclass Cercle extends Forme {\n    private final double r;\n    Cercle(double r) { this.r = r; }\n    double aire() { return Math.PI * r * r; }\n}\n\nclass Rectangle extends Forme {\n    private final double l, h;\n    Rectangle(double l, double h) { this.l = l; this.h = h; }\n    double aire() { return l * h; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Forme[] formes = { new Cercle(1), new Rectangle(2, 3), new Cercle(2.5) };\n        for (Forme f : formes) {\n            System.out.printf(\"%s : %.2f%n\", f.nom(), f.aire());\n        }\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'heritage-polymorphisme'), 'java-heritage-quiz', 'Héritage', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-heritage-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-heritage-quiz'), 'vrai_faux', 'On peut créer un objet d''une classe abstraite avec new.', null, '["Vrai","Faux"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'interfaces', 'Interfaces', 'avance', 25, array['Définir et implémenter une interface.']::text[], '{}'::text[], '## Un contrat

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

**Comparable<T>** (ordre naturel), **Comparator<T>** (ordre personnalisé), **Runnable**.', array['Une interface est un contrat.', 'implements, éventuellement plusieurs.', 'Comparable définit l''ordre naturel.']::text[], '[{"language":"java","title":"Comparable","code":"import java.util.Arrays;\n\nclass Etudiant implements Comparable<Etudiant> {\n    final String nom;\n    final double moyenne;\n    Etudiant(String nom, double moyenne) { this.nom = nom; this.moyenne = moyenne; }\n    public int compareTo(Etudiant autre) { return Double.compare(autre.moyenne, moyenne); }\n    public String toString() { return nom + \" \" + moyenne; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Grâce\", 17), new Etudiant(\"Josué\", 11) };\n        Arrays.sort(promo);\n        System.out.println(Arrays.toString(promo));\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Lire et écrire des fichiers avec java.nio.file.']::text[], '{}'::text[], '## Écrire et lire

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

La ressource est fermée automatiquement, même en cas d''erreur.', array['Files et Path simplifient les fichiers.', 'try-with-resources ferme automatiquement.', 'IOException est vérifiée.']::text[], '[{"language":"java","title":"Fichier de notes","code":"import java.io.IOException;\nimport java.nio.file.*;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Path p = Paths.get(\"notes.txt\");\n        Files.write(p, List.of(\"Amani;15\", \"Grace;17\", \"Josue;9\"));\n        for (String ligne : Files.readAllLines(p)) {\n            String[] parties = ligne.split(\";\");\n            int note = Integer.parseInt(parties[1]);\n            System.out.println(parties[0] + \" : \" + (note >= 10 ? \"admis\" : \"ajourné\"));\n        }\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'professionnel', 'Java professionnel', null, 4, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'professionnel'), (select id from public.courses where slug = 'java'), 'structures-donnees', 'Structures de données', 'avance', 40, array['Implémenter une pile générique.', 'Utiliser Deque et PriorityQueue.']::text[], '{}'::text[], '## Une pile générique

On peut écrire ses propres structures avec les génériques : **class Pile<T>**.

## Les structures de la bibliothèque

| Besoin | Classe |
|---|---|
| Pile / file | ArrayDeque |
| File de priorité | PriorityQueue |
| Liste chaînée | LinkedList |
| Arbre ordonné | TreeMap, TreeSet |

## Complexités

ArrayDeque : ajout/retrait aux extrémités en O(1). PriorityQueue : ajout et retrait du minimum en O(log n). TreeMap : opérations en O(log n).', array['Les génériques rendent les structures réutilisables.', 'ArrayDeque, PriorityQueue, TreeMap couvrent la plupart des besoins.', 'Connaître les complexités guide le choix.']::text[], '[{"language":"java","title":"Pile générique","code":"import java.util.ArrayList;\nimport java.util.PriorityQueue;\n\nclass Pile<T> {\n    private final ArrayList<T> elements = new ArrayList<>();\n    void empiler(T x) { elements.add(x); }\n    T depiler() {\n        if (elements.isEmpty()) throw new IllegalStateException(\"Pile vide\");\n        return elements.remove(elements.size() - 1);\n    }\n    boolean estVide() { return elements.isEmpty(); }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Pile<String> pile = new Pile<>();\n        for (String s : new String[] { \"a\", \"b\", \"c\" }) pile.empiler(s);\n        StringBuilder sb = new StringBuilder();\n        while (!pile.estVide()) sb.append(pile.depiler());\n        System.out.println(\"Dépilé : \" + sb);\n\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : new int[] { 42, 7, 19, 3 }) pq.add(x);\n        System.out.print(\"Par priorité :\");\n        while (!pq.isEmpty()) System.out.print(\" \" + pq.poll());\n        System.out.println();\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'java') and m.slug not in ('bases', 'objets', 'conception', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 1, 'Niveau 1 — Très débutant : les bases', 'Présentation, variables, conditions, boucles et méthodes.', array['Écrire et exécuter un programme Java.', 'Utiliser types, conditions et boucles.', 'Écrire des méthodes.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-examen-niveau-1', 'Examen du niveau 1 — Bases de Java', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Comment compare-t-on le contenu de deux String ?', null, '["==","equals","=","compare"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Quel mot-clé déclare une constante ?', null, '["const","final","static","let"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Que vaut "Somme : " + 2 + 3 ?', null, '["\"Somme : 5\"","\"Somme : 23\"","erreur","5"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'vrai_faux', 'La surcharge permet plusieurs méthodes de même nom avec des paramètres différents.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Où commence l''exécution d''un programme Java ?', null, '["la méthode main","le constructeur","la première classe","la méthode start"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 2, 'Niveau 2 — Débutant : objets et collections', 'Classes, encapsulation, collections et exceptions.', array['Concevoir des classes encapsulées.', 'Utiliser les collections.', 'Gérer les exceptions.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 3, 'Niveau 3 — Intermédiaire : conception orientée objet', 'Héritage, polymorphisme, interfaces et fichiers.', array['Exploiter héritage et polymorphisme.', 'Définir des interfaces.', 'Lire et écrire des fichiers.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 4, 'Niveau 4 — Professionnel : Java en entreprise', 'Structures de données, architecture, tests et performances.', array['Concevoir l''architecture d''un programme Java de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture en couches', 'Tests unitaires avec JUnit', 'Gestion de projet avec Maven', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-positionnement', 'Test de positionnement — Java', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle méthode est le point d''entrée d''un programme Java ?', null, '["start","main","run","init"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel type stocke un nombre à virgule ?', null, '["int","double","char","boolean"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel mot-clé crée un objet ?', null, '["new","create","make","object"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle collection stocke des paires clé → valeur ?', null, '["ArrayList","HashMap","HashSet","LinkedList"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel mot-clé exprime l''héritage d''une classe ?', null, '["implements","extends","inherits","super"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'vrai_faux', 'Une classe peut implémenter plusieurs interfaces.', null, '["Vrai","Faux"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle bibliothèque est la référence des tests unitaires en Java ?', null, '["JUnit","Maven","Spring","Log4j"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel outil gère les dépendances d''un projet Java ?', null, '["Maven","javac","jar","javadoc"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-evaluation-finale', 'Évaluation finale — Java', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Comment compare-t-on le contenu de deux String ?', null, '["==","equals","compare","="]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quel mot-clé crée une sous-classe ?', null, '["implements","extends","inherits","super"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'vrai_faux', 'Une classe Java peut implémenter plusieurs interfaces.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quelle collection garantit l''unicité ?', null, '["ArrayList","HashSet","LinkedList","ArrayDeque"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Exercices =====
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-bonjour', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Bonjour UPL', 'Écrivez un algorithme qui affiche exactement la ligne suivante :

~~~text
Bonjour UPL
~~~', 'debutant', 'ecrire_algorithme', array['Écrire la structure d''un algorithme.', 'Utiliser ECRIRE.']::text[], '[{"input":"","output":"Bonjour UPL"}]'::jsonb, '{}'::text[], 'ALGORITHME Bonjour
DEBUT
  // Votre code ici
FIN', array['L''instruction qui affiche du texte s''appelle ECRIRE.', 'Le texte doit être placé entre guillemets : ECRIRE("…").']::text[], 5, false, 'publie', 1, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-bonjour');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-bonjour'), null, '', 'Bonjour UPL', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-bonjour'), 'ALGORITHME Bonjour
DEBUT
  ECRIRE("Bonjour UPL")
FIN', 'Il suffit d''une seule instruction **ECRIRE** placée entre DEBUT et FIN. Le texte est écrit entre guillemets et doit être identique au caractère près (majuscules comprises).')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
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
FIN', array['Si vous écrivez directement a ← b, l''ancienne valeur de a est perdue.', 'Sauvegardez d''abord a dans temp.', 'L''ordre est : temp ← a, puis a ← b, puis b ← temp.']::text[], 10, false, 'publie', 2, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-echange');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-echange'), null, '3
8', 'a = 8
b = 3', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-echange'), null, '-1
0', 'a = 0
b = -1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-echange'), null, '5
5', 'a = 5
b = 5', true, 1, 2, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-somme-deux-nombres', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Somme de deux nombres', 'Lisez deux entiers puis affichez leur somme sous la forme :

~~~text
Somme : <résultat>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"4\n9","output":"Somme : 13"}]'::jsonb, '{}'::text[], 'ALGORITHME Somme
VARIABLES
  a, b : ENTIER
DEBUT

FIN', array['Utilisez LIRE deux fois.', 'ECRIRE("Somme : ", a + b) affiche le texte suivi du résultat.']::text[], 5, false, 'publie', 3, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-somme-deux-nombres');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '4
9', 'Somme : 13', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '-5
5', 'Somme : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), null, '1000
2345', 'Somme : 3345', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-somme-deux-nombres'), 'ALGORITHME Somme
VARIABLES
  a, b : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE("Somme : ", a + b)
FIN', 'On lit les deux valeurs, puis on affiche l''expression a + b directement dans ECRIRE. Attention à l''espace après les deux-points dans « Somme : ».')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-moyenne-trois-notes', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Moyenne de trois notes', 'Lisez trois notes (réels) et affichez leur moyenne :

~~~text
Moyenne : <valeur>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"12\n15\n9","output":"Moyenne : 12"}]'::jsonb, '{}'::text[], '', array['Les notes peuvent être décimales : quel type choisir ?', 'Attention aux priorités : a + b + c / 3 ne divise que c !']::text[], 10, false, 'publie', 4, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-moyenne-trois-notes');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '12
15
9', 'Moyenne : 12', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '10
11
12.5', 'Moyenne : 11.1666666667', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-moyenne-trois-notes'), null, '0
0
20', 'Moyenne : 6.66666666667', true, 1, 2, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-conversion-temps', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Conversion de secondes', 'Lisez une durée en secondes (entier positif) et affichez-la en heures, minutes et secondes :

~~~text
<h> h <m> min <s> s
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3725","output":"1 h 2 min 5 s"}]'::jsonb, '{}'::text[], '', array['Une heure vaut 3600 secondes.', 'DIV donne le quotient, MOD le reste.', 'h ← total DIV 3600, puis travaillez sur le reste total MOD 3600.']::text[], 10, false, 'publie', 5, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-conversion-temps');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '3725', '1 h 2 min 5 s', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '59', '0 h 0 min 59 s', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-conversion-temps'), null, '86399', '23 h 59 min 59 s', true, 1, 2, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-pair-impair', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'pseudocode', 'Pair ou impair', 'Lisez un entier et affichez **pair** ou **impair**.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"4","output":"pair"},{"input":"7","output":"impair"}]'::jsonb, '{}'::text[], '', array['Un nombre est pair si le reste de sa division par 2 vaut 0.', 'Utilisez MOD dans la condition d''un SI.']::text[], 5, false, 'publie', 6, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-pair-impair');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '4', 'pair', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '7', 'impair', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '0', 'pair', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-pair-impair'), null, '-3', 'impair', true, 1, 3, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-mention', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'structures-conditionnelles'), 'pseudocode', 'Mention au diplôme', 'Lisez une note sur 20 et affichez :

- **Note invalide** si la note n''est pas entre 0 et 20 ;
- **Excellent** si note ≥ 18 ;
- **Très bien** si note ≥ 16 ;
- **Bien** si note ≥ 14 ;
- **Assez bien** si note ≥ 12 ;
- **Passable** si note ≥ 10 ;
- **Ajourné** sinon.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"15","output":"Bien"}]'::jsonb, '{}'::text[], '', array['Commencez par traiter le cas invalide.', 'Testez les mentions de la plus haute à la plus basse avec SINON SI.']::text[], 10, false, 'publie', 7, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-mention');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '15', 'Bien', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '9.5', 'Ajourné', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '18', 'Excellent', false, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '21', 'Note invalide', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '12', 'Assez bien', true, 1, 4, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-mention'), null, '10', 'Passable', true, 1, 5, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-annee-bissextile', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'conditions-imbriquees'), 'pseudocode', 'Année bissextile', 'Une année est **bissextile** si elle est divisible par 4 mais pas par 100, **ou** si elle est divisible par 400.

Lisez une année et affichez **bissextile** ou **non bissextile**.', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"2024","output":"bissextile"},{"input":"1900","output":"non bissextile"}]'::jsonb, '{}'::text[], '', array['« divisible par 4 » se teste avec annee MOD 4 = 0.', 'La condition complète combine ET, OU et NON… ou des SI imbriqués.', '(annee MOD 4 = 0 ET annee MOD 100 <> 0) OU annee MOD 400 = 0']::text[], 10, false, 'publie', 8, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-annee-bissextile');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2024', 'bissextile', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '1900', 'non bissextile', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-annee-bissextile'), null, '2000', 'bissextile', false, 1, 2, null);
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
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-fiche-etudiant', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Fiche étudiant', 'Lisez un nom, un prénom, une année de naissance et une moyenne (réel). Affichez :

~~~text
NOM : <nom en majuscules>
Prénom : <prénom>
Âge en 2026 : <âge>
Moyenne : <moyenne>/20
Admis : <VRAI si moyenne >= 10, sinon FAUX>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"Kalenga\nRuth\n2006\n13.5","output":"NOM : KALENGA\nPrénom : Ruth\nÂge en 2026 : 20\nMoyenne : 13.5/20\nAdmis : VRAI"}]'::jsonb, '{}'::text[], '', array['MAJUSCULE(nom) met le nom en majuscules.', '« /20 » est un texte collé juste après la moyenne.']::text[], 10, false, 'publie', 38, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-fiche-etudiant');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'Kalenga
Ruth
2006
13.5', 'NOM : KALENGA
Prénom : Ruth
Âge en 2026 : 20
Moyenne : 13.5/20
Admis : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'ilunga
Josué
2007
9.99', 'NOM : ILUNGA
Prénom : Josué
Âge en 2026 : 19
Moyenne : 9.99/20
Admis : FAUX', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'Banza
Marie
2004
10', 'NOM : BANZA
Prénom : Marie
Âge en 2026 : 22
Moyenne : 10/20
Admis : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), 'ALGORITHME Fiche
VARIABLES
  nom, prenom : CHAINE
  annee : ENTIER
  moyenne : REEL
DEBUT
  LIRE(nom)
  LIRE(prenom)
  LIRE(annee)
  LIRE(moyenne)
  ECRIRE("NOM : ", MAJUSCULE(nom))
  ECRIRE("Prénom : ", prenom)
  ECRIRE("Âge en 2026 : ", 2026 - annee)
  ECRIRE("Moyenne : ", moyenne, "/20")
  ECRIRE("Admis : ", moyenne >= 10)
FIN', 'Quatre lectures typées, cinq affichages. Le test caché avec la moyenne 10 vérifie la borne : 10 est admis.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-carte', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Projet : carte de visite numérique', 'Lisez un prénom, une filière puis une année d''études (texte, par exemple « Bac 1 ») et affichez exactement :

~~~text
+----------------------+
Nom : <prénom>
Filière : <filière>
Année : <année>
+----------------------+
~~~', 'debutant', 'mini_projet', '{}'::text[], '[{"input":"Amani\nInformatique\nBac 1","output":"+----------------------+\nNom : Amani\nFilière : Informatique\nAnnée : Bac 1\n+----------------------+"}]'::jsonb, '{}'::text[], '', array['Trois LIRE puis cinq ECRIRE.', 'Les deux bordures sont identiques : copiez-les exactement.']::text[], 15, false, 'publie', 39, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-carte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-carte'), null, 'Amani
Informatique
Bac 1', '+----------------------+
Nom : Amani
Filière : Informatique
Année : Bac 1
+----------------------+', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-carte'), null, 'Ruth
Intelligence Artificielle
Bac 2', '+----------------------+
Nom : Ruth
Filière : Intelligence Artificielle
Année : Bac 2
+----------------------+', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-carte'), 'ALGORITHME Carte
VARIABLES
  prenom, filiere, annee : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(filiere)
  LIRE(annee)
  ECRIRE("+----------------------+")
  ECRIRE("Nom : ", prenom)
  ECRIRE("Filière : ", filiere)
  ECRIRE("Année : ", annee)
  ECRIRE("+----------------------+")
FIN', 'L''année est lue comme un texte car elle contient « Bac ». L''algorithme est purement séquentiel.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-bibliotheque', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Projet : contrôle d''accès à la bibliothèque', 'Lisez l''âge (entier), puis si la carte est valide (booléen), puis si la cotisation est payée (booléen). L''accès est autorisé si **la carte est valide ET (la cotisation est payée OU l''âge est inférieur à 18)**. L''accès est gratuit si l''âge est inférieur à 18. Affichez, sans utiliser SI :

~~~text
Accès : <VRAI/FAUX>
Gratuit : <VRAI/FAUX>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"20\nVRAI\nFAUX","output":"Accès : FAUX\nGratuit : FAUX"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['Traduisez mot à mot : carte ET (cotisation OU age < 18).', 'Les parenthèses sont indispensables : ET est prioritaire sur OU.']::text[], 20, true, 'publie', 40, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-bibliotheque');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '20
VRAI
FAUX', 'Accès : FAUX
Gratuit : FAUX', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '16
VRAI
FAUX', 'Accès : VRAI
Gratuit : VRAI', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '25
VRAI
VRAI', 'Accès : VRAI
Gratuit : FAUX', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '15
FAUX
VRAI', 'Accès : FAUX
Gratuit : VRAI', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '18
VRAI
FAUX', 'Accès : FAUX
Gratuit : FAUX', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), 'ALGORITHME Bibliotheque
VARIABLES
  age : ENTIER
  carte, cotisation : BOOLEEN
DEBUT
  LIRE(age)
  LIRE(carte)
  LIRE(cotisation)
  ECRIRE("Accès : ", carte ET (cotisation OU age < 18))
  ECRIRE("Gratuit : ", age < 18)
FIN', 'Sans parenthèses, « carte ET cotisation OU age < 18 » autoriserait un mineur sans carte valide (cas 15, FAUX, VRAI). Le cas 18 ans vérifie la borne stricte < 18.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-budget', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Projet : budget mensuel', 'Lisez (entiers, en FC) : le revenu mensuel, le loyer, le coût du transport **par jour de cours** et le coût d''un repas. Un mois compte **22 jours de cours** avec **un repas par jour**. Affichez :

~~~text
Transport : <total transport>
Repas : <total repas>
Dépenses : <loyer + transport + repas>
Reste : <revenu - dépenses>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"200000\n60000\n2000\n3000","output":"Transport : 44000\nRepas : 66000\nDépenses : 170000\nReste : 30000"}]'::jsonb, '{}'::text[], '', array['Déclarez JOURS = 22 en constante.', 'Calculez chaque total dans sa propre variable avant de les additionner.']::text[], 20, false, 'publie', 41, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-budget');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '200000
60000
2000
3000', 'Transport : 44000
Repas : 66000
Dépenses : 170000
Reste : 30000', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '110000
0
2500
2500', 'Transport : 55000
Repas : 55000
Dépenses : 110000
Reste : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '150000
80000
1500
2000', 'Transport : 33000
Repas : 44000
Dépenses : 157000
Reste : -7000', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-budget'), 'ALGORITHME Budget
CONSTANTES
  JOURS = 22
VARIABLES
  revenu, loyer, transportJour, repas, transport, totalRepas, depenses : ENTIER
DEBUT
  LIRE(revenu)
  LIRE(loyer)
  LIRE(transportJour)
  LIRE(repas)
  transport ← transportJour * JOURS
  totalRepas ← repas * JOURS
  depenses ← loyer + transport + totalRepas
  ECRIRE("Transport : ", transport)
  ECRIRE("Repas : ", totalRepas)
  ECRIRE("Dépenses : ", depenses)
  ECRIRE("Reste : ", revenu - depenses)
FIN', 'La décomposition suit l''analyse : un total par poste, puis la somme, puis le reste. Le test caché montre qu''un reste négatif est possible : un futur chapitre permettra d''afficher un avertissement avec une condition.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-caisse-simple', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Projet : caisse enregistreuse', 'Lisez les prix de trois articles (réels). Après chaque lecture, ajoutez le prix à une variable **total** et affichez le sous-total :

~~~text
Sous-total : <après article 1>
Sous-total : <après article 2>
Total : <après article 3>
~~~', 'debutant', 'mini_projet', '{}'::text[], '[{"input":"1500\n250.5\n3000","output":"Sous-total : 1500\nSous-total : 1750.5\nTotal : 4750.5"}]'::jsonb, array['Une seule variable pour le cumul.']::text[], '', array['Initialisez total à 0 avant la première lecture.', 'Lisez le prix dans une variable prix, puis total ← total + prix.']::text[], 15, false, 'publie', 42, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-caisse-simple');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '1500
250.5
3000', 'Sous-total : 1500
Sous-total : 1750.5
Total : 4750.5', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '0
0
0', 'Sous-total : 0
Sous-total : 0
Total : 0', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '100
200
300', 'Sous-total : 100
Sous-total : 300
Total : 600', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), 'ALGORITHME Caisse
VARIABLES
  prix, total : REEL
DEBUT
  total ← 0
  LIRE(prix)
  total ← total + prix
  ECRIRE("Sous-total : ", total)
  LIRE(prix)
  total ← total + prix
  ECRIRE("Sous-total : ", total)
  LIRE(prix)
  total ← total + prix
  ECRIRE("Total : ", total)
FIN', 'La même variable prix est réutilisée pour chaque lecture ; total accumule. Ce motif répété sera écrit avec une boucle au niveau 2.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-fiche', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Projet : fiche de résultats', 'Lisez un nom, un prénom, puis deux notes (réels). Affichez :

~~~text
Étudiant : <NOM EN MAJUSCULES> <initiale du prénom en majuscule>.
Moyenne : <moyenne des deux notes>
Admis : <VRAI si moyenne >= 10>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"mbuyi\njoël\n12\n9","output":"Étudiant : MBUYI J.\nMoyenne : 10.5\nAdmis : VRAI"}]'::jsonb, '{}'::text[], '', array['MAJUSCULE(nom) et MAJUSCULE(prenom[1]).', 'La moyenne est un REEL.']::text[], 20, false, 'publie', 43, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-fiche');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'mbuyi
joël
12
9', 'Étudiant : MBUYI J.
Moyenne : 10.5
Admis : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'Kabeya
esther
8
11.5', 'Étudiant : KABEYA E.
Moyenne : 9.75
Admis : FAUX', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'ilunga
Anne
10
10', 'Étudiant : ILUNGA A.
Moyenne : 10
Admis : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-fiche'), 'ALGORITHME FicheResultats
VARIABLES
  nom, prenom : CHAINE
  n1, n2, moyenne : REEL
DEBUT
  LIRE(nom)
  LIRE(prenom)
  LIRE(n1)
  LIRE(n2)
  moyenne ← (n1 + n2) / 2
  ECRIRE("Étudiant : ", MAJUSCULE(nom), " ", MAJUSCULE(prenom[1]), ".")
  ECRIRE("Moyenne : ", moyenne)
  ECRIRE("Admis : ", moyenne >= 10)
FIN', 'Chaque donnée a son type : CHAINE pour l''identité, REEL pour les notes, et la décision est un BOOLEEN obtenu par comparaison.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-horloge', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Projet : horloge de la semaine', 'Lisez un nombre de minutes écoulées depuis lundi 00 h 00 (entier entre 0 et 10 079). Les jours sont numérotés de 1 (lundi) à 7 (dimanche). Affichez :

~~~text
Jour <n>, <h> h <m> min
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"1530","output":"Jour 2, 1 h 30 min"}]'::jsonb, '{}'::text[], '', array['Un jour compte 1 440 minutes.', 'Jour : minutes DIV 1440 + 1 ; heures : (minutes MOD 1440) DIV 60 ; minutes : minutes MOD 60.']::text[], 20, true, 'publie', 44, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-horloge');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1530', 'Jour 2, 1 h 30 min', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '0', 'Jour 1, 0 h 0 min', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1439', 'Jour 1, 23 h 59 min', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1440', 'Jour 2, 0 h 0 min', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '10079', 'Jour 7, 23 h 59 min', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-horloge'), 'ALGORITHME Horloge
CONSTANTES
  MIN_JOUR = 1440
VARIABLES
  minutes, jour, h, m : ENTIER
DEBUT
  LIRE(minutes)
  jour ← minutes DIV MIN_JOUR + 1
  h ← (minutes MOD MIN_JOUR) DIV 60
  m ← minutes MOD 60
  ECRIRE("Jour ", jour, ", ", h, " h ", m, " min")
FIN', 'DIV donne le nombre de jours complets écoulés (on ajoute 1 car lundi est le jour 1) ; MOD 1440 donne les minutes du jour courant. Les cas 1 439 et 1 440 vérifient le passage de minuit.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-recu', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Projet : reçu de paiement', 'Lisez le nom de l''étudiant, son matricule (texte), le montant total des frais et le montant payé (entiers, en dollars). Affichez exactement :

~~~text
===== REÇU =====
Étudiant : <nom>
Matricule : <matricule>
Payé : <payé> $ / <total> $
Reste à payer : <total - payé> $
================
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"Kasongo Amani\nUPL-2026-0042\n600\n450","output":"===== REÇU =====\nÉtudiant : Kasongo Amani\nMatricule : UPL-2026-0042\nPayé : 450 $ / 600 $\nReste à payer : 150 $\n================"}]'::jsonb, '{}'::text[], '', array['Le matricule contient des lettres et des tirets : type CHAINE.', 'Respectez les espaces autour de « / » et avant « $ ».']::text[], 20, false, 'publie', 45, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-recu');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-recu'), null, 'Kasongo Amani
UPL-2026-0042
600
450', '===== REÇU =====
Étudiant : Kasongo Amani
Matricule : UPL-2026-0042
Payé : 450 $ / 600 $
Reste à payer : 150 $
================', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-recu'), null, 'Ruth Kalenga
UPL-2025-0007
800
800', '===== REÇU =====
Étudiant : Ruth Kalenga
Matricule : UPL-2025-0007
Payé : 800 $ / 800 $
Reste à payer : 0 $
================', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-recu'), 'ALGORITHME Recu
VARIABLES
  nom, matricule : CHAINE
  total, paye : ENTIER
DEBUT
  LIRE(nom)
  LIRE(matricule)
  LIRE(total)
  LIRE(paye)
  ECRIRE("===== REÇU =====")
  ECRIRE("Étudiant : ", nom)
  ECRIRE("Matricule : ", matricule)
  ECRIRE("Payé : ", paye, " $ / ", total, " $")
  ECRIRE("Reste à payer : ", total - paye, " $")
  ECRIRE("================")
FIN', 'L''ordre des LIRE suit l''ordre des données ; l''affichage reprend exactement le modèle, espaces compris.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-premier-paragraphe', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Un titre et un paragraphe', 'Dans le corps de la page, ajoutez un titre principal **h1** contenant « Bienvenue » et un paragraphe contenant le mot **important** mis en valeur avec **strong**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Le contenu visible se place entre <body> et </body>.', '<p>Texte <strong>important</strong></p>']::text[], 5, false, 'publie', 46, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-premier-paragraphe');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Un h1 contient « Bienvenue »', '', '', false, 1, 0, '{"type":"text","selector":"h1","contains":"Bienvenue","message":"Un h1 contient « Bienvenue »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'La page contient un paragraphe', '', '', false, 1, 1, '{"type":"element","selector":"p","message":"La page contient un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Le mot « important » est dans un strong à l''intérieur d''un paragraphe', '', '', false, 1, 2, '{"type":"text","selector":"p strong","contains":"important","message":"Le mot « important » est dans un strong à l''intérieur d''un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Un seul h1', '', '', true, 1, 3, '{"type":"element","selector":"h1","max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-premier-paragraphe'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Bienvenue</h1>
  <p>Ce message est <strong>important</strong>.</p>
</body>
</html>', 'Le h1 donne le titre principal ; strong est imbriqué dans p et fermé avant lui.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-titre-et-texte', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Présentation personnelle', 'Écrivez une page avec un **h1** « Qui suis-je ? » et **deux paragraphes** : le premier contient votre prénom, le second votre filière, mise en valeur avec **em**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Deux éléments p successifs.', '<p>Filière : <em>Informatique</em></p>']::text[], 5, false, 'publie', 47, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-titre-et-texte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Le h1 vaut exactement « Qui suis-je ? »', '', '', false, 1, 0, '{"type":"text","selector":"h1","equals":"Qui suis-je ?","message":"Le h1 vaut exactement « Qui suis-je ? »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Au moins deux paragraphes', '', '', false, 1, 1, '{"type":"element","selector":"p","min":2,"message":"Au moins deux paragraphes"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Un em dans un paragraphe', '', '', false, 1, 2, '{"type":"element","selector":"p em","message":"Un em dans un paragraphe"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-titre-et-texte'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Qui suis-je ?</h1>
  <p>Je m''appelle Amani.</p>
  <p>Filière : <em>Informatique</em></p>
</body>
</html>', 'Chaque bloc de texte est un p ; em exprime l''insistance.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-lien-mdn', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Un lien vers la documentation', 'Ajoutez un paragraphe contenant un lien vers **https://developer.mozilla.org/fr/** dont le texte est « Documentation MDN ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['L''élément a et son attribut href.', '<a href="https://developer.mozilla.org/fr/">Documentation MDN</a>']::text[], 5, false, 'publie', 48, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-lien-mdn');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le lien pointe vers https://developer.mozilla.org/fr/', '', '', false, 1, 0, '{"type":"attribute","selector":"a","name":"href","equals":"https://developer.mozilla.org/fr/","message":"Le lien pointe vers https://developer.mozilla.org/fr/"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le texte du lien est « Documentation MDN »', '', '', false, 1, 1, '{"type":"text","selector":"a","equals":"Documentation MDN","message":"Le texte du lien est « Documentation MDN »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le lien est dans un paragraphe', '', '', true, 1, 2, '{"type":"element","selector":"p a","message":"Le lien est dans un paragraphe"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-lien-mdn'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <p><a href="https://developer.mozilla.org/fr/">Documentation MDN</a></p>
</body>
</html>', 'href porte l''adresse complète (URL absolue) ; le texte du lien décrit la destination.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-presentation', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Projet : ma page de présentation', 'Créez une page avec : un **h1** contenant votre prénom, un paragraphe de présentation avec au moins un mot en **strong**, un paragraphe avec un lien vers **https://www.wikipedia.org**, et un commentaire HTML indiquant l''auteur.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Un commentaire s''écrit <!-- … -->.', 'Vérifiez l''imbrication : le dernier ouvert est le premier fermé.']::text[], 15, false, 'publie', 49, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-presentation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un seul h1', '', '', false, 1, 0, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un mot important dans un paragraphe', '', '', false, 1, 1, '{"type":"element","selector":"p strong","message":"Un mot important dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un lien vers wikipedia.org dans un paragraphe', '', '', false, 1, 2, '{"type":"attribute","selector":"p a","name":"href","contains":"wikipedia.org","message":"Un lien vers wikipedia.org dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Au moins deux paragraphes', '', '', true, 1, 3, '{"type":"element","selector":"p","min":2,"message":"Au moins deux paragraphes"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-presentation'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <!-- Auteur : Amani -->
  <h1>Amani</h1>
  <p>Je suis étudiant en <strong>informatique</strong> à l''UPL.</p>
  <p>Ma référence : <a href="https://www.wikipedia.org">Wikipédia</a>.</p>
</body>
</html>', 'La page combine les éléments du chapitre : titre, paragraphes, mise en valeur, lien et commentaire.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-squelette', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Squelette complet', 'Écrivez un document HTML complet : DOCTYPE, élément html avec **lang="fr"**, head contenant **meta charset utf-8** et un **title** « Accueil », body contenant un **h1** « Accueil ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Commencez par <!DOCTYPE html>.', 'L''attribut lang se place sur l''élément html.']::text[], 5, false, 'publie', 50, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-squelette');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'html a l''attribut lang="fr"', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"html a l''attribut lang=\"fr\""}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'meta charset="utf-8" dans head', '', '', false, 1, 1, '{"type":"attribute","selector":"head meta[charset]","name":"charset","equals":"utf-8","message":"meta charset=\"utf-8\" dans head"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'Le titre de l''onglet est « Accueil »', '', '', false, 1, 2, '{"type":"text","selector":"head title","equals":"Accueil","message":"Le titre de l''onglet est « Accueil »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'Un h1 « Accueil » dans body', '', '', false, 1, 3, '{"type":"text","selector":"body h1","equals":"Accueil","message":"Un h1 « Accueil » dans body"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-squelette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Accueil</title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>', 'Le squelette complet garantit le mode standard, la langue, l''encodage et un titre d''onglet.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-meta-viewport', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Page adaptée au téléphone', 'Complétez l''en-tête avec la **meta viewport** (content="width=device-width, initial-scale=1") et donnez à la page le titre « Horaires — Bibliothèque ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<meta name="viewport" content="width=device-width, initial-scale=1">']::text[], 5, false, 'publie', 51, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-meta-viewport');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'meta viewport avec width=device-width', '', '', false, 1, 0, '{"type":"attribute","selector":"head meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport avec width=device-width"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'Titre « Horaires — Bibliothèque »', '', '', false, 1, 1, '{"type":"text","selector":"title","equals":"Horaires — Bibliothèque","message":"Titre « Horaires — Bibliothèque »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'L''encodage utf-8 est conservé', '', '', true, 1, 2, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"L''encodage utf-8 est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-meta-viewport'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Horaires — Bibliothèque</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>

</body>
</html>', 'La meta viewport est indispensable pour un affichage correct sur téléphone.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-commentaire-titre', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Contenu au bon endroit', 'Le code de départ place le titre visible dans head. Corrigez-le : le **h1** « Club informatique » doit être dans **body**, et head ne doit contenir aucun h1.', 'debutant', 'corriger', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
  <h1>Club informatique</h1>
</head>
<body>
  <p>Réunion le vendredi.</p>
</body>
</html>', array['Déplacez la ligne du h1 juste après <body>.']::text[], 5, false, 'publie', 52, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-commentaire-titre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le h1 est dans body', '', '', false, 1, 0, '{"type":"text","selector":"body h1","equals":"Club informatique","message":"Le h1 est dans body"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'head ne contient pas de h1', '', '', false, 1, 1, '{"type":"element","selector":"head h1","min":0,"max":0,"message":"head ne contient pas de h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le paragraphe existant est conservé', '', '', true, 1, 2, '{"type":"text","selector":"body p","contains":"vendredi","message":"Le paragraphe existant est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-commentaire-titre'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
</head>
<body>
  <h1>Club informatique</h1>
  <p>Réunion le vendredi.</p>
</body>
</html>', 'head ne contient que des métadonnées. Le navigateur déplace parfois le h1 de lui-même, mais le code doit être correct.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-accueil', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Projet : page d''accueil d''un département', 'Créez la page d''accueil du département d''informatique : document complet en français, encodage utf-8, meta viewport, titre « Département d''informatique — UPL », un h1 et deux paragraphes.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Reprenez le squelette complet du cours.', 'Le titre de l''onglet et le h1 peuvent différer.']::text[], 15, false, 'publie', 53, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-accueil');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Langue française', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"Langue française"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Encodage utf-8', '', '', false, 1, 1, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"Encodage utf-8"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'meta viewport', '', '', false, 1, 2, '{"type":"attribute","selector":"meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Titre de l''onglet exact', '', '', false, 1, 3, '{"type":"text","selector":"title","equals":"Département d''informatique — UPL","message":"Titre de l''onglet exact"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Deux paragraphes', '', '', true, 1, 4, '{"type":"element","selector":"body p","min":2,"message":"Deux paragraphes"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Un seul h1', '', '', true, 1, 5, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-accueil'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Département d''informatique — UPL</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Département d''informatique</h1>
  <p>Formations en informatique et en intelligence artificielle.</p>
  <p>Secrétariat ouvert du lundi au vendredi.</p>
</body>
</html>', 'Toutes les métadonnées essentielles sont présentes : la page est prête à être publiée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-langages', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste de langages', 'Ajoutez un titre **h2** « Langages » suivi d''une **liste à puces** de trois éléments : Python, C et Java.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['ul pour une liste sans ordre, li pour chaque élément.']::text[], 5, false, 'publie', 54, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-langages');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Un h2 « Langages »', '', '', false, 1, 0, '{"type":"text","selector":"h2","equals":"Langages","message":"Un h2 « Langages »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Une liste ul de trois éléments', '', '', false, 1, 1, '{"type":"element","selector":"ul > li","min":3,"max":3,"message":"Une liste ul de trois éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Java fait partie de la liste', '', '', true, 1, 2, '{"type":"text","selector":"ul > li","equals":"Java","message":"Java fait partie de la liste"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-langages'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h2>Langages</h2>
  <ul>
    <li>Python</li>
    <li>C</li>
    <li>Java</li>
  </ul>
</body>
</html>', 'L''ordre des langages n''a pas d''importance : on choisit ul.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-recette', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Une recette structurée', 'Créez une page avec un **h1** « Fufu », un **h2** « Ingrédients » suivi d''une liste **ul** d''au moins 2 ingrédients, puis un **h2** « Étapes » suivi d''une liste **ol** d''au moins 3 étapes.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Les ingrédients n''ont pas d''ordre ; les étapes, si.', 'Respectez la hiérarchie h1 puis h2.']::text[], 10, false, 'publie', 55, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-recette');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Un h1 « Fufu »', '', '', false, 1, 0, '{"type":"text","selector":"h1","equals":"Fufu","message":"Un h1 « Fufu »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Deux sections h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Deux sections h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins deux ingrédients dans un ul', '', '', false, 1, 2, '{"type":"element","selector":"ul > li","min":2,"message":"Au moins deux ingrédients dans un ul"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins trois étapes dans un ol', '', '', false, 1, 3, '{"type":"element","selector":"ol > li","min":3,"message":"Au moins trois étapes dans un ol"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-recette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Fufu</h1>
  <h2>Ingrédients</h2>
  <ul>
    <li>Farine de manioc</li>
    <li>Eau</li>
  </ul>
  <h2>Étapes</h2>
  <ol>
    <li>Faire bouillir l''eau.</li>
    <li>Verser la farine progressivement.</li>
    <li>Remuer jusqu''à obtenir une pâte ferme.</li>
  </ol>
</body>
</html>', 'ul pour les ingrédients, ol pour les étapes : le choix exprime le sens du contenu.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-imbriquee', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste imbriquée', 'Créez une liste **ul** de deux éléments, « Web » et « Programmation ». L''élément « Web » contient une **sous-liste ul** avec « HTML » et « CSS ».', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['La sous-liste se place à l''intérieur du li « Web », avant sa balise fermante.']::text[], 10, false, 'publie', 56, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-imbriquee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'La liste principale a deux éléments', '', '', false, 1, 0, '{"type":"element","selector":"body > ul > li","min":2,"max":2,"message":"La liste principale a deux éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Une sous-liste de deux éléments dans un li', '', '', false, 1, 1, '{"type":"element","selector":"ul > li > ul > li","min":2,"message":"Une sous-liste de deux éléments dans un li"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Aucune liste directement dans un ul', '', '', true, 1, 2, '{"type":"element","selector":"ul > ul","min":0,"max":0,"message":"Aucune liste directement dans un ul"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-imbriquee'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <ul>
    <li>Web
      <ul>
        <li>HTML</li>
        <li>CSS</li>
      </ul>
    </li>
    <li>Programmation</li>
  </ul>
</body>
</html>', 'La sous-liste détaille l''élément « Web » : elle est donc à l''intérieur de son li.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-fiche-revision', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Projet : fiche de révision', 'Créez une fiche de révision sur un sujet de votre choix : un **h1**, au moins **deux h2**, au moins un **h3**, un paragraphe avec un mot en **strong**, une liste **ul** et une liste **ol**.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Construisez d''abord le plan avec les titres.', 'Pas de saut de niveau : un h3 se place sous un h2.']::text[], 15, false, 'publie', 57, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-fiche-revision');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un seul h1', '', '', false, 1, 0, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins deux h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Au moins deux h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins un h3', '', '', false, 1, 2, '{"type":"element","selector":"h3","min":1,"message":"Au moins un h3"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un mot important dans un paragraphe', '', '', false, 1, 3, '{"type":"element","selector":"p strong","message":"Un mot important dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste à puces', '', '', true, 1, 4, '{"type":"element","selector":"ul > li","min":1,"message":"Une liste à puces"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste numérotée', '', '', true, 1, 5, '{"type":"element","selector":"ol > li","min":1,"message":"Une liste numérotée"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Révision : les boucles</h1>
  <h2>Définition</h2>
  <p>Une boucle répète des instructions ; elle doit <strong>toujours</strong> se terminer.</p>
  <h2>Les types de boucles</h2>
  <h3>Boucles conditionnelles</h3>
  <ul>
    <li>TANT QUE</li>
    <li>RÉPÉTER</li>
  </ul>
  <h3>Méthode</h3>
  <ol>
    <li>Initialiser</li>
    <li>Tester</li>
    <li>Mettre à jour</li>
  </ol>
</body>
</html>', 'Le plan (h1, h2, h3) structure la fiche ; les listes choisies selon que l''ordre compte ou non.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-image-alt', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Image accessible', 'Insérez l''image **https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg** avec un texte alternatif contenant « HTML5 », une largeur de **120** et une hauteur de **120**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<img src="…" alt="…" width="120" height="120">', 'img n''a pas de balise fermante.']::text[], 5, false, 'publie', 58, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-image-alt');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'L''image a la bonne source', '', '', false, 1, 0, '{"type":"attribute","selector":"img","name":"src","contains":"HTML5_logo","message":"L''image a la bonne source"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Le texte alternatif mentionne HTML5', '', '', false, 1, 1, '{"type":"attribute","selector":"img","name":"alt","contains":"HTML5","message":"Le texte alternatif mentionne HTML5"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Largeur 120', '', '', false, 1, 2, '{"type":"attribute","selector":"img","name":"width","equals":"120","message":"Largeur 120"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Hauteur 120', '', '', true, 1, 3, '{"type":"attribute","selector":"img","name":"height","equals":"120","message":"Hauteur 120"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-image-alt'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5" width="120" height="120">
</body>
</html>', 'alt décrit l''image pour les lecteurs d''écran ; width et height réservent sa place.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-menu-navigation', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Menu de navigation', 'Créez un élément **nav** contenant trois liens : « Accueil » vers **index.html**, « Cours » vers **cours/index.html** et « MDN » vers **https://developer.mozilla.org/fr/**, ce dernier ouvert dans un nouvel onglet avec **rel="noopener"**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Trois éléments a dans nav.', 'target="_blank" rel="noopener" sur le lien externe.']::text[], 10, false, 'publie', 59, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-menu-navigation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Trois liens dans nav', '', '', false, 1, 0, '{"type":"element","selector":"nav a","min":3,"message":"Trois liens dans nav"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien relatif vers index.html', '', '', false, 1, 1, '{"type":"attribute","selector":"nav a[href=''index.html'']","name":"href","equals":"index.html","message":"Un lien relatif vers index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien vers cours/index.html', '', '', false, 1, 2, '{"type":"attribute","selector":"nav a[href=''cours/index.html'']","name":"href","equals":"cours/index.html","message":"Un lien vers cours/index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Le lien en nouvel onglet a rel="noopener"', '', '', false, 1, 3, '{"type":"attribute","selector":"nav a[target=''_blank'']","name":"rel","contains":"noopener","message":"Le lien en nouvel onglet a rel=\"noopener\""}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-menu-navigation'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <nav>
    <a href="index.html">Accueil</a>
    <a href="cours/index.html">Cours</a>
    <a href="https://developer.mozilla.org/fr/" target="_blank" rel="noopener">MDN</a>
  </nav>
</body>
</html>', 'Liens relatifs à l''intérieur du site, URL absolue pour le site externe, protégée par rel="noopener".')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-ancre-section', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Lien vers une section', 'Créez un lien « Voir les horaires » qui mène à un titre **h2** « Horaires » de la même page, identifié par **id="horaires"**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['href="#horaires" sur le lien, id="horaires" sur le h2.']::text[], 5, false, 'publie', 60, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-ancre-section');
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
commit;
