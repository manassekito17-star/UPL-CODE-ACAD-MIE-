-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 3 sur 11.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
<p>Bienvenue à UPL CODE ACADEMY MK</p>
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

Avancer par petites étapes évite d''avoir à chercher une erreur dans cent lignes.', array['Le navigateur (client) demande une page au serveur et dessine le HTML reçu.', 'HTML structure, CSS présente, JavaScript fait agir.', 'Un élément = balise ouvrante + contenu + balise fermante ; certains éléments sont vides.', 'Les attributs (nom="valeur") précisent un élément.', 'Le dernier élément ouvert est le premier fermé.']::text[], '[{"language":"html","title":"Première page","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Ma première page</title>\n</head>\n<body>\n  <h1>Bonjour UPL !</h1>\n  <p>Ceci est ma <strong>première</strong> page web.</p>\n  <p>Visitez le <a href=\"https://developer.mozilla.org/fr/\">site de référence MDN</a>.</p>\n</body>\n</html>","explanation":"Modifiez le texte dans l''éditeur : l''aperçu se met à jour automatiquement."}]'::jsonb, '{"competences":["Expliquer le fonctionnement client / serveur","Reconnaître balises, éléments et attributs","Écrire du HTML bien imbriqué"],"definitions":[{"term":"HTML","definition":"HyperText Markup Language : langage de balisage qui décrit la structure et le sens du contenu d''une page web."},{"term":"Balise","definition":"Marque entre chevrons (**`<p>`**, **`</p>`**) qui délimite un élément."},{"term":"Élément","definition":"Ensemble formé d''une balise ouvrante, d''un contenu et d''une balise fermante (ou d''une seule balise pour un élément vide)."},{"term":"Attribut","definition":"Information supplémentaire placée dans la balise ouvrante sous la forme nom=\"valeur\"."},{"term":"Navigateur","definition":"Logiciel qui demande les pages aux serveurs et les affiche (rendu)."}],"commentedAlgorithms":[{"title":"Anatomie d''une page minimale","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Accueil</title>\n</head>\n<body>\n  <h1>UPL CODE ACADEMY MK</h1>\n  <p>Apprendre à coder, pas à pas.</p>\n</body>\n</html>","comments":{"1":"Indique au navigateur qu''il s''agit d''un document HTML moderne.","2":"Élément racine ; l''attribut lang annonce le français (lecteurs d''écran, traduction).","3":"En-tête : informations sur la page, non affichées dans le contenu.","4":"Encodage : les accents s''affichent correctement.","5":"Titre affiché dans l''onglet du navigateur.","7":"Corps : tout le contenu visible.","8":"Titre principal de la page.","9":"Un paragraphe.","10":"Fermeture du corps…","11":"… puis de la racine : le dernier ouvert est le premier fermé."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Oublier la barre oblique de la balise fermante","wrong":"<p>Bonjour<p>","right":"<p>Bonjour</p>","explanation":"Sans **`</p>`**, le navigateur ouvre un second paragraphe vide au lieu de fermer le premier.","run":false},{"title":"Mal imbriquer les éléments","wrong":"<p><strong>Important</p></strong>","right":"<p><strong>Important</strong></p>","explanation":"Le dernier élément ouvert (**strong**) doit être fermé en premier.","run":false}],"solvedExercises":[{"title":"Repérer les composants","statement":"Dans **`<a href=\"contact.html\">`Nous écrire`</a>`**, nommez la balise ouvrante, l''attribut, sa valeur et le contenu.","solution":"Balise ouvrante : <a href=\"contact.html\">\nAttribut : href\nValeur : contact.html\nContenu : Nous écrire\nBalise fermante : </a>","explanation":"L''élément **a** (ancre) crée un lien ; **href** indique sa destination."},{"title":"Corriger un code","statement":"Corrigez : **`<h1>`Mon site`<h1>` `<p>`Texte `<em>`important`</p>``</em>`**","solution":"<h1>Mon site</h1>\n<p>Texte <em>important</em></p>","explanation":"La première balise h1 n''était pas fermée ; **em** doit être fermé avant **p**."}],"td":{"title":"TD 1 — Premiers éléments","instructions":"Écrivez le code dans l''éditeur et observez l''aperçu avant de soumettre. La correction vérifie la structure du document.","exerciseSlugs":["html-titre-et-texte","html-lien-mdn"]},"project":{"title":"Ma page de présentation","context":"Créer sa propre page de présentation, première brique de son portfolio.","steps":["Écrire le titre principal avec son prénom.","Rédiger un paragraphe de présentation avec un mot important.","Ajouter un lien vers un site de référence et un commentaire d''auteur.","Vérifier l''imbrication dans l''aperçu, puis soumettre."],"deliverables":["Une page index.html vérifiée par les tests automatiques."],"exerciseSlug":"html-projet-presentation"}}'::jsonb, 'publie', 1, now())
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

Le **title** est obligatoire et doit décrire précisément la page : « Inscription — UPL CODE ACADEMY MK » plutôt que « Page ».

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

Dans UPL, la correction automatique vérifie la présence et la place de ces éléments.', array['Un document commence par <!DOCTYPE html> puis l''élément racine <html lang="fr">.', 'head contient les métadonnées : charset, viewport, title ; body contient le contenu visible.', 'Le titre (title) apparaît dans l''onglet et dans les moteurs de recherche.', 'Indenter et valider son code évite les erreurs d''imbrication.']::text[], '[{"language":"html","title":"Squelette complet","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Inscription — UPL CODE ACADEMY MK</title>\n</head>\n<body>\n  <h1>Inscription</h1>\n  <p>Les espaces    multiples     sont réduits à un seul.</p>\n  <p>Un nouveau paragraphe commence ici.</p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Écrire le squelette d''un document","Renseigner les métadonnées essentielles","Écrire un code lisible et valide"],"definitions":[{"term":"DOCTYPE","definition":"Déclaration placée en première ligne qui active le mode standard du navigateur."},{"term":"Élément racine","definition":"L''élément **html**, qui contient tout le document."},{"term":"Métadonnées","definition":"Informations sur la page (encodage, titre, viewport…) placées dans **head** et non affichées dans le contenu."},{"term":"Encodage (charset)","definition":"Manière de représenter les caractères ; UTF-8 permet d''afficher les accents et tous les alphabets."}],"commentedAlgorithms":[{"title":"Une page d''accueil complète","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Accueil — Club informatique</title>\n</head>\n<body>\n  <!-- En-tête de la page -->\n  <h1>Club informatique de l''UPL</h1>\n  <p>Réunion chaque vendredi à 14 h.</p>\n</body>\n</html>","comments":{"1":"Mode standard.","2":"Langue : français.","4":"Sans cette ligne, « é » peut s''afficher « Ã© ».","5":"Sur téléphone, la page prend la largeur de l''écran au lieu d''être réduite.","6":"Titre précis : page et site.","8":"Début du contenu visible.","9":"Commentaire : invisible dans le rendu.","13":"Fin du document."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Mettre du contenu visible dans head","wrong":"<head>\n  <h1>Bienvenue</h1>\n</head>","right":"<head>\n  <title>Bienvenue</title>\n</head>\n<body>\n  <h1>Bienvenue</h1>\n</body>","explanation":"head ne contient que des métadonnées. Le contenu visible va dans **body**.","run":false},{"title":"Oublier l''encodage","wrong":"<head>\n  <title>Résumé</title>\n</head>","right":"<head>\n  <meta charset=\"utf-8\">\n  <title>Résumé</title>\n</head>","explanation":"Sans **charset=\"utf-8\"**, les accents peuvent être mal affichés selon le serveur.","run":false}],"solvedExercises":[{"title":"Ordonner un squelette","statement":"Remettez dans l''ordre : `</body>`, `<head>`, `<!DOCTYPE html>`, `</html>`, `<body>`, `<html lang=\"fr\">`, `</head>`, `<title>`T`</title>`.","solution":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <title>T</title>\n</head>\n<body>\n</body>\n</html>","explanation":"DOCTYPE d''abord ; html contient head puis body ; chaque élément est fermé dans l''ordre inverse de son ouverture."},{"title":"Choisir un bon titre","statement":"Proposez un title pour la page des horaires de la bibliothèque du site UPL CODE ACADEMY MK.","solution":"<title>Horaires de la bibliothèque — UPL CODE ACADEMY MK</title>","explanation":"Un bon titre décrit la page puis le site : il est lisible dans un onglet et utile dans les résultats de recherche."}],"td":{"title":"TD 2 — Squelettes de documents","instructions":"Chaque page doit être un document complet et valide.","exerciseSlugs":["html-meta-viewport","html-commentaire-titre"]},"project":{"title":"Page d''accueil d''un département","context":"Le département d''informatique veut une page d''accueil correctement structurée et lisible sur téléphone.","steps":["Écrire le squelette complet.","Renseigner langue, encodage, viewport et titre.","Ajouter le titre principal et deux paragraphes.","Soumettre et corriger d''après les vérifications."],"deliverables":["Un document HTML complet et valide."],"exerciseSlug":"html-projet-accueil"}}'::jsonb, 'publie', 2, now())
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
<a href="index.html"><img src="logo.png" alt="Accueil d''UPL CODE ACADEMY MK"></a>
~~~

## 7. Bonnes pratiques pour les liens et les images

- Le texte d''un lien doit annoncer sa destination : « Consulter le programme de L1 » plutôt que « cliquez ici ». Un lecteur d''écran peut lister tous les liens d''une page hors de leur contexte.
- Une image **décorative** reçoit un **alt** vide (**alt=""**) : le lecteur d''écran l''ignore. Une image **informative** reçoit une description de ce qu''elle apporte, pas de son apparence.
- Préciser **width** et **height** sur une image réserve sa place avant son chargement et évite que le texte « saute » pendant l''affichage.
- Un nom de fichier sans espace ni accent (**photo-campus.jpg**) évite les liens cassés sur les serveurs, qui distinguent souvent les majuscules des minuscules.', array['a + href crée un lien ; son texte doit décrire la destination.', 'Chemin absolu vers un autre site ; chemin relatif dans son propre site ; #id vers une section.', 'target="_blank" s''accompagne de rel="noopener".', 'img a besoin de src et d''un alt pertinent (vide si décorative) ; c''est un élément vide.']::text[], '[{"language":"html","title":"Liens et image accessible","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Liens et images</title>\n</head>\n<body>\n  <h1>Ressources</h1>\n  <p><a href=\"#contact\">Aller à la section Contact</a></p>\n  <p><a href=\"https://developer.mozilla.org/fr/docs/Web/HTML\" target=\"_blank\" rel=\"noopener\">Documentation HTML de MDN</a></p>\n  <img src=\"https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg\" alt=\"Logo HTML5\" width=\"120\" height=\"120\">\n  <h2 id=\"contact\">Contact</h2>\n  <p><a href=\"mailto:contact@exemple.cd\">Écrire au club informatique</a></p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Créer des liens absolus, relatifs et internes","Insérer des images accessibles","Choisir un format d''image adapté"],"definitions":[{"term":"Hyperlien","definition":"Élément **a** qui permet d''aller vers une autre ressource indiquée par son attribut **href**."},{"term":"Chemin relatif","definition":"Adresse exprimée à partir de l''emplacement de la page courante (ex. cours/python.html)."},{"term":"URL absolue","definition":"Adresse complète, avec protocole et nom de domaine (ex. https://www.exemple.cd/)."},{"term":"Texte alternatif (alt)","definition":"Description textuelle d''une image, lue par les lecteurs d''écran et affichée si l''image est absente."}],"commentedAlgorithms":[{"title":"Menu de navigation d''un petit site","code":"<nav>\n  <a href=\"index.html\">Accueil</a>\n  <a href=\"cours/html.html\">Cours HTML</a>\n  <a href=\"#horaires\">Horaires</a>\n  <a href=\"https://developer.mozilla.org/fr/\" target=\"_blank\" rel=\"noopener\">MDN</a>\n</nav>\n<img src=\"https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg\" alt=\"Logo HTML5\" width=\"80\" height=\"80\">\n<h2 id=\"horaires\">Horaires</h2>\n<p>Du lundi au vendredi, de 8 h à 16 h.</p>","comments":{"1":"nav regroupe les liens de navigation principaux.","2":"Chemin relatif : page du même dossier.","3":"Chemin relatif vers un sous-dossier.","4":"Ancre : section de cette page ayant id=\"horaires\".","5":"Site externe ouvert dans un nouvel onglet, protégé par rel=\"noopener\".","7":"Image : src, alt descriptif, dimensions.","8":"Cible de l''ancre #horaires."},"language":"html","showPreview":true}],"commonErrors":[{"title":"Oublier le texte alternatif","wrong":"<img src=\"campus.jpg\">","right":"<img src=\"campus.jpg\" alt=\"Entrée principale du campus\">","explanation":"Sans alt, un lecteur d''écran lit le nom du fichier, ou rien. Le texte alternatif est obligatoire.","run":false},{"title":"Écrire « cliquez ici »","wrong":"<a href=\"reglement.pdf\">Cliquez ici</a> pour le règlement.","right":"<a href=\"reglement.pdf\">Télécharger le règlement des examens (PDF)</a>","explanation":"Le texte d''un lien doit avoir du sens hors contexte : les lecteurs d''écran listent les liens sans le texte qui les entoure.","run":false}],"solvedExercises":[{"title":"Écrire des chemins","statement":"La page actuelle est **site/cours/index.html**. Écrivez les chemins relatifs vers (a) site/cours/python.html, (b) site/index.html, (c) site/images/logo.png.","solution":"(a) python.html\n(b) ../index.html\n(c) ../images/logo.png","explanation":"« .. » remonte d''un dossier ; un nom seul désigne un fichier du dossier courant."},{"title":"Rédiger des textes alternatifs","statement":"Proposez un alt pour : (a) la photo d''un étudiant devant un ordinateur, (b) un trait décoratif, (c) un logo qui renvoie à l''accueil.","solution":"(a) alt=\"Étudiant programmant sur un ordinateur portable\"\n(b) alt=\"\"\n(c) alt=\"Accueil d''UPL CODE ACADEMY MK\"","explanation":"Une image décorative reçoit un alt vide ; une image cliquable décrit la destination du lien."}],"td":{"title":"TD 4 — Navigation et images","instructions":"Vérifiez chaque lien et chaque image dans l''aperçu avant de soumettre.","exerciseSlugs":["html-menu-navigation","html-ancre-section"]},"project":{"title":"Page de présentation du club informatique","context":"Le club informatique de l''université veut une page de présentation simple, accessible et bien structurée.","steps":["Écrire le squelette complet (langue, encodage, titre).","Ajouter un titre principal, une présentation et la liste des activités.","Ajouter un menu de liens et une image avec un texte alternatif.","Vérifier la hiérarchie des titres et l''accessibilité, puis soumettre."],"deliverables":["Une page index.html complète validée par les tests automatiques."],"exerciseSlug":"html-projet-club"}}'::jsonb, 'publie', 4, now())
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
commit;
