-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 8 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle instruction arrête le script si le fichier inclus est absent ?', null, '["include","require","use","import"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 3, 'Niveau 3 — Intermédiaire : objets, données et API', 'Programmation orientée objet (classes, encapsulation, héritage, polymorphisme, interfaces, traits, namespaces), exceptions, base de données avec PDO, JSON et API REST.', array['Modéliser un domaine avec des classes.', 'Gérer les erreurs avec des exceptions.', 'Accéder à une base de données de façon sûre avec PDO.', 'Produire et consommer du JSON dans une API REST.']::text[], array['Fichiers : lecture, écriture et téléversement sécurisé', 'Architecture MVC appliquée à un projet', 'Composer et autoloading (PSR-4)', 'Projets : gestion des étudiants, authentification, gestion des produits et des articles, tableau de bord administrateur']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-3', 'Examen du niveau 3 — Objets, données et API', false, 70, 'publie', 'examen_niveau', null, 3)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-3');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel mot-clé crée un objet ?', null, '["class","new","object","create"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quelle visibilité réserve une propriété à la classe ?', null, '["public","protected","private","final"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que permet une interface ?', null, '["Hériter du code","Définir un contrat de méthodes","Créer des variables globales","Se connecter à la base"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel bloc s''exécute toujours, exception ou non ?', null, '["catch","finally","try","throw"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que protège une requête préparée ?', null, '["Le XSS","L''injection SQL","Le CSRF","La force brute"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que fait $pdo->rollBack() ?', null, '["Valide","Annule la transaction","Ferme la connexion","Rejoue la requête"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel code HTTP pour « ressource introuvable » ?', null, '["200","201","404","500"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que renvoie json_decode sur un JSON invalide (sans option) ?', null, '["false","null","une exception","\"\""]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 4, 'Niveau 4 — Professionnel : sécurité, architecture et mise en production', 'Sécurité d''une application (mots de passe, XSS, injection SQL, CSRF, sessions, fichiers), architecture professionnelle (MVC, routeur, middlewares, injection de dépendances), tests automatisés, Composer, Laravel et déploiement.', array['Sécuriser une application PHP de bout en bout.', 'Concevoir une architecture maintenable.', 'Tester automatiquement son code.', 'Préparer un déploiement et la maintenance.']::text[], array['PHP moderne : enums, readonly, attributs, types avancés', 'API sécurisées : authentification par jeton, rôles et permissions', 'Tests unitaires et d''intégration avec PHPUnit', 'Introduction à Laravel (routes, Eloquent, Blade, migrations)', 'Optimisation : cache, OPcache, requêtes et profilage', 'Déploiement et maintenance d''une application PHP', 'Projet final : application web complète (authentification, rôles, CRUD, API, tests)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-4', 'Examen du niveau 4 — PHP professionnel', false, 70, 'publie', 'examen_niveau', null, 4)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-4');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quelle fonction pour stocker un mot de passe ?', null, '["md5","sha1","password_hash","base64_encode"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Contre quelle attaque protège un jeton caché dans chaque formulaire ?', null, '["XSS","CSRF","Injection SQL","DDoS"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Que faire juste après une connexion réussie ?', null, '["session_destroy()","session_regenerate_id(true)","setcookie(\"mdp\", …)","rien"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quel dossier doit être le seul accessible depuis le web ?', null, '["src/","vendor/","public/","config/"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Qu''est-ce qu''un middleware ?', null, '["Une vue","Une couche traversée par la requête avant le contrôleur","Une table SQL","Un fichier CSS"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quel outil standard pour les tests unitaires en PHP ?', null, '["Jest","PHPUnit","pytest","JUnit"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'vrai_faux', 'Les mots de passe de la base de données doivent être écrits dans le code source versionné.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-positionnement', 'Test de positionnement — PHP', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Où s''exécute PHP ?', null, '["Dans le navigateur","Sur le serveur","Dans la base","Nulle part"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel opérateur concatène des chaînes ?', null, '["+",".","&","concat"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que vaut 17 % 5 ?', null, '["3","2","3.4","12"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Comment parcourir clés et valeurs d''un tableau ?', null, '["for ($t)","foreach ($t as $k => $v)","while ($t)","each($t)"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que contient $_POST ?', null, '["Les cookies","Les champs d''un formulaire envoyé en POST","La session","Les fichiers"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quelle fonction protège l''affichage contre le XSS ?', null, '["htmlspecialchars","trim","strlen","md5"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que désigne $this ?', null, '["La classe mère","L''objet courant","Le fichier","La session"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel mécanisme empêche l''injection SQL avec PDO ?', null, '["Les requêtes préparées","Les exceptions","Les sessions","Les transactions"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel mot-clé lève une exception ?', null, '["catch","throw","raise","error"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quelle protection contre le CSRF ?', null, '["htmlspecialchars","Un jeton aléatoire vérifié à chaque POST","md5","Un captcha seulement"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Dans MVC, quelle couche contient les gabarits HTML ?', null, '["Modèle","Vue","Contrôleur","Routeur"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel outil gère les dépendances PHP ?', null, '["Composer","npm","pip","apt"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-evaluation-finale', 'Évaluation finale — PHP', true, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Où s''exécute le code PHP d''un site ?', null, '["Navigateur","Serveur","Base de données","CSS"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel opérateur concatène deux chaînes ?', null, '["+",".","&","concat"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle boucle parcourt un tableau associatif avec ses clés ?', null, '["for","while","foreach ($t as $k => $v)","do…while"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle fonction échappe le HTML à l''affichage ?', null, '["htmlspecialchars","strip_tags","trim","addslashes"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel mécanisme empêche l''injection SQL ?', null, '["Les requêtes préparées","Les sessions","Les cookies","json_encode"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle fonction pour vérifier un mot de passe haché ?', null, '["password_verify","md5","hash_equals seul","crypt"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel mot-clé crée une classe fille ?', null, '["implements","extends","trait","new"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'vrai_faux', 'Les données de $_SESSION sont stockées dans le navigateur.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Formation complète SQL — maîtriser les bases de données =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('sql', 'sql', (select id from public.course_categories where slug = 'donnees'), 'Parcours I', 'Formation complète SQL — maîtriser les bases de données', 'Créer, interroger et concevoir des bases de données relationnelles.', 'Toute application sérieuse (université, pharmacie, banque, boutique) range ses données dans une base relationnelle. Cette formation va de la première table jusqu''aux jointures, sous-requêtes, transactions, normalisation, conception MERISE, déclencheurs et sécurité. Chaque requête s''exécute réellement avec SQLite dans votre navigateur ; les différences avec MySQL et PostgreSQL sont expliquées.', 'debutant', array['Aucun prérequis pour le niveau 1.', 'Notions d''algorithmique utiles à partir du niveau 2.']::text[], array['Créer des tables et manipuler les données (CREATE, INSERT, SELECT, UPDATE, DELETE).', 'Écrire des requêtes avec filtres, tris, agrégats, jointures et sous-requêtes.', 'Concevoir une base normalisée à partir d''un cahier des charges (MERISE).', 'Garantir l''intégrité, la sécurité et les performances d''une base.']::text[], 50, 'publie', 9, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'sql'), 'sql-fondements', 'Les fondements des bases de données', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-introduction', 'Qu''est-ce qu''une base de données ? Tables, lignes, clés', 'debutant', 35, array['Définir base de données, SGBD, table, colonne, ligne.', 'Expliquer le rôle des clés primaires et étrangères.', 'Situer MySQL, MariaDB, PostgreSQL et SQLite.']::text[], '{}'::text[], '## Pourquoi une base de données ?

Une université doit retrouver en une seconde les notes d''un étudiant parmi des milliers, empêcher deux étudiants d''avoir le même matricule, et permettre à plusieurs secrétaires de travailler en même temps sans écraser leurs modifications. Un fichier Excel ne suffit plus : on utilise une **base de données** gérée par un **SGBD** (système de gestion de bases de données).

## Le modèle relationnel

Les données sont rangées dans des **tables** :

| id | nom | postnom | age | filiere |
|---|---|---|---|---|
| 1 | Kito | Manasse | 23 | Informatique |
| 2 | Mbuyi | Grace | 19 | Droit |

- une **colonne** (ou attribut) a un nom et un **type** (nombre, texte, date…) ;
- une **ligne** (ou enregistrement) décrit un élément : ici, un étudiant ;
- le **schéma** est la description des tables et de leurs colonnes.

## Les clés

- la **clé primaire** (PRIMARY KEY) identifie chaque ligne de façon **unique** et n''est jamais vide : ici **id** ;
- une **clé étrangère** (FOREIGN KEY) est une colonne qui fait référence à la clé primaire d''une autre table : la table des inscriptions contient **etudiant_id**, qui renvoie à **etudiants.id**. C''est ainsi que les tables sont **reliées**.

## SQL, le langage

**SQL** (Structured Query Language) sert à :

- **définir** la structure : CREATE, ALTER, DROP ;
- **manipuler** les données : INSERT, SELECT, UPDATE, DELETE ;
- **contrôler** les accès : GRANT, REVOKE ; et les transactions : COMMIT, ROLLBACK.

Les mots-clés ne sont pas sensibles à la casse (on les écrit en majuscules par convention) ; chaque instruction se termine par un **point-virgule**.

## Les principaux SGBD

| SGBD | Utilisation typique |
|---|---|
| **MySQL** / **MariaDB** | sites web (PHP, WordPress), hébergements mutualisés |
| **PostgreSQL** | applications professionnelles, données complexes, très conforme à la norme SQL |
| **SQLite** | base dans un simple fichier : téléphones, navigateurs, applications de bureau, tests |
| Oracle, SQL Server | grandes entreprises (payants) |

## Le laboratoire de la plateforme

Vos requêtes sont exécutées par **SQLite** (version 3), compilé en WebAssembly, **dans votre navigateur** : chaque étudiant a sa propre base, isolée. **SQLite n''est pas identique à MySQL ni à PostgreSQL** : le SQL de base (CREATE, INSERT, SELECT, JOIN, GROUP BY…) est le même, mais certains types et certaines instructions diffèrent. La formation le signale chaque fois, avec la syntaxe de chaque système.', array['Une base relationnelle range les données dans des tables (colonnes × lignes).', 'La clé primaire identifie une ligne ; la clé étrangère relie deux tables.', 'SQL définit, manipule et contrôle les données.', 'Le laboratoire utilise SQLite : proche, mais pas identique, de MySQL et PostgreSQL.']::text[], '[{"language":"sql","title":"Première requête sur la table etudiants","code":"SELECT * FROM etudiants;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);","explanation":"La table a été créée et remplie par les « données de départ » ; * signifie « toutes les colonnes »."}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-introduction'), 'sql-introduction-quiz', 'Vérification — Bases de données', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-introduction-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Que contient une ligne d''une table ?', null, '["Un type de donnée","Les informations d''un élément (un étudiant…)","Le nom de la base","Une requête"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Quel est le rôle d''une clé primaire ?', null, '["Relier deux tables","Identifier chaque ligne de façon unique","Trier la table","Chiffrer les données"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Une clé étrangère…', null, '["fait référence à la clé primaire d''une autre table","est toujours un texte","est facultative partout","remplace la clé primaire"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'vrai_faux', 'SQLite et MySQL acceptent exactement les mêmes instructions.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Le cœur du langage est commun, mais des types et instructions diffèrent.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-create-insert', 'Créer une table et insérer des données', 'debutant', 40, array['Créer une table avec CREATE TABLE.', 'Choisir les types de colonnes.', 'Insérer une ou plusieurs lignes avec INSERT.']::text[], array['Qu''est-ce qu''une base de données ?']::text[], '## CREATE TABLE

~~~sql
CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  age INTEGER,
  filiere TEXT
);
~~~

Chaque colonne : **nom**, **type**, puis des **contraintes** facultatives (NOT NULL : valeur obligatoire).

## Les types selon le SGBD

| Donnée | SQLite | MySQL / MariaDB | PostgreSQL |
|---|---|---|---|
| entier | INTEGER | INT | INTEGER |
| décimal exact | NUMERIC | DECIMAL(10,2) | NUMERIC(10,2) |
| réel | REAL | DOUBLE | DOUBLE PRECISION |
| texte court | TEXT | VARCHAR(100) | VARCHAR(100) ou TEXT |
| date | TEXT (''2026-11-10'') | DATE | DATE |
| booléen | INTEGER (0 / 1) | BOOLEAN (TINYINT) | BOOLEAN |

SQLite est souple : il accepte VARCHAR(100) ou DATE, mais **ne limite pas la longueur** du texte et range les dates comme du texte. MySQL et PostgreSQL appliquent strictement les types.

## Numérotation automatique de la clé primaire

| SGBD | Syntaxe |
|---|---|
| SQLite | id INTEGER PRIMARY KEY AUTOINCREMENT |
| MySQL / MariaDB | id INT AUTO_INCREMENT PRIMARY KEY |
| PostgreSQL | id SERIAL PRIMARY KEY ou id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY |

## INSERT INTO

~~~sql
INSERT INTO etudiants (nom, postnom, age, filiere)
VALUES (''Kito'', ''Manasse'', 23, ''Informatique'');
~~~

- on liste les colonnes, puis les valeurs **dans le même ordre** ;
- les textes sont entre **apostrophes** ; une apostrophe dans le texte se double : ''L''''Université'' ;
- on n''indique pas **id** : il est attribué automatiquement ;
- plusieurs lignes en une instruction : VALUES (…), (…), (…);
- **NULL** (sans apostrophes) signifie « valeur inconnue ».

## Supprimer une table

**DROP TABLE etudiants;** supprime la table et toutes ses données (définitivement). **CREATE TABLE IF NOT EXISTS** évite une erreur si la table existe déjà.

Dans l''éditeur, chaque exécution part d''une **base neuve** : votre script doit donc créer ses tables avant de les remplir.', array['CREATE TABLE nom (colonne TYPE contraintes, …);', 'INSERT INTO table (colonnes) VALUES (valeurs), (…);', 'La numérotation automatique s''écrit différemment selon le SGBD.']::text[], '[{"language":"sql","title":"Créer, remplir et afficher","code":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\n\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES (''Kito'', ''Manasse'', 23, ''Informatique'');\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''L''''Heureux'', ''Paul'', 20, NULL);\n\nSELECT * FROM etudiants;"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-create-insert'), 'sql-create-insert-quiz', 'Vérification — CREATE et INSERT', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-create-insert-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Comment écrire un texte dans une requête SQL ?', null, '["\"Kito\"","''Kito''","Kito","`Kito`"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Quelle syntaxe numérote automatiquement en MySQL ?', null, '["AUTOINCREMENT","AUTO_INCREMENT","SERIAL","IDENTITY(1,1)"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Comment insérer la valeur inconnue ?', null, '["''NULL''","NULL","0","''''"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'vrai_faux', 'SQLite refuse un texte plus long que la longueur de VARCHAR(10).', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'SQLite ne limite pas la longueur ; MySQL et PostgreSQL, si.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-select', 'Lire les données : SELECT et WHERE', 'debutant', 35, array['Choisir les colonnes affichées.', 'Filtrer les lignes avec WHERE.', 'Renommer avec AS et calculer des colonnes.']::text[], array['Créer une table et insérer des données']::text[], '## Choisir les colonnes

~~~sql
SELECT nom, postnom FROM etudiants;
~~~

**SELECT *** affiche toutes les colonnes ; en pratique, on nomme les colonnes utiles (plus lisible et plus rapide).

## Filtrer avec WHERE

~~~sql
SELECT nom, age FROM etudiants WHERE age >= 21;
SELECT nom FROM etudiants WHERE filiere = ''Droit'';
~~~

Opérateurs : **=**, **<>** (ou !=), **<**, **>**, **<=**, **>=**.

## Valeurs inconnues : IS NULL

On ne compare **jamais** à NULL avec = : **filiere = NULL** n''est jamais vrai. On écrit **filiere IS NULL** ou **IS NOT NULL**.

## Alias et colonnes calculées

~~~sql
SELECT nom AS etudiant, age + 1 AS age_annee_prochaine FROM etudiants;
~~~

La concaténation de textes s''écrit **||** en SQLite et PostgreSQL (nom || '' '' || postnom), et **CONCAT(nom, '' '', postnom)** en MySQL (CONCAT existe aussi en PostgreSQL et dans SQLite récent).

## L''ordre d''écriture

~~~sql
SELECT colonnes FROM table WHERE condition;
~~~

Le SGBD lit d''abord **FROM** (quelle table), puis **WHERE** (quelles lignes), puis **SELECT** (quelles colonnes).', array['SELECT colonnes FROM table WHERE condition;', 'IS NULL / IS NOT NULL, jamais = NULL.', 'AS renomme une colonne ; || concatène (SQLite, PostgreSQL).']::text[], '[{"language":"sql","title":"Filtrer et renommer","code":"SELECT nom || '' '' || postnom AS etudiant, age\nFROM etudiants\nWHERE filiere = ''Informatique'';\n\nSELECT nom FROM etudiants WHERE filiere IS NULL;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-select'), 'sql-select-quiz', 'Vérification — SELECT', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-select-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Comment trouver les étudiants sans filière ?', null, '["WHERE filiere = NULL","WHERE filiere IS NULL","WHERE filiere = ''''","WHERE NULL"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Quel mot-clé renomme une colonne du résultat ?', null, '["RENAME","AS","ALIAS","TO"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Quel opérateur signifie « différent de » ?', null, '["<>","=!","><","NOT="]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-update-delete', 'Modifier et supprimer : UPDATE et DELETE', 'debutant', 30, array['Modifier des lignes avec UPDATE.', 'Supprimer des lignes avec DELETE.', 'Éviter les modifications accidentelles de toute la table.']::text[], array['Lire les données : SELECT et WHERE']::text[], '## UPDATE

~~~sql
UPDATE etudiants SET filiere = ''Informatique'', age = 20 WHERE id = 2;
~~~

## DELETE

~~~sql
DELETE FROM etudiants WHERE id = 6;
~~~

## Le piège du WHERE oublié

**UPDATE etudiants SET age = 0;** modifie **toutes** les lignes. **DELETE FROM etudiants;** vide **toute** la table. Il n''y a pas de bouton « annuler » (sauf dans une transaction, niveau 3). Méthode professionnelle :

1. écrire d''abord le **SELECT** avec le même WHERE et vérifier les lignes visées ;
2. remplacer SELECT par UPDATE ou DELETE ;
3. sur une base réelle, travailler dans une **transaction** et avoir une **sauvegarde**.

## Calculer à partir de la valeur actuelle

~~~sql
UPDATE produits SET stock = stock - 1 WHERE id = 3;
~~~

## Combien de lignes ?

Le laboratoire affiche le nombre de lignes modifiées ou supprimées : s''il vaut 0, votre WHERE ne correspond à aucune ligne ; s''il est bien plus grand que prévu, le WHERE est trop large.', array['UPDATE table SET col = valeur WHERE condition;', 'DELETE FROM table WHERE condition;', 'Toujours tester le WHERE avec un SELECT d''abord.']::text[], '[{"language":"sql","title":"Modifier puis supprimer","code":"UPDATE etudiants SET filiere = ''Informatique'' WHERE nom = ''Nsimba'';\nUPDATE etudiants SET age = age + 1 WHERE filiere = ''Droit'';\nDELETE FROM etudiants WHERE age > 24;\nSELECT nom, age, filiere FROM etudiants;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-update-delete'), 'sql-update-delete-quiz', 'Vérification — UPDATE et DELETE', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-update-delete-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-update-delete-quiz'), 'qcm', 'Que fait DELETE FROM etudiants; ?', null, '["Supprime la table","Supprime toutes les lignes","Ne fait rien","Demande confirmation"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-update-delete-quiz'), 'qcm', 'Comment augmenter tous les prix de 10 % ?', null, '["UPDATE produits SET prix = prix * 1.1;","UPDATE produits prix + 10%;","SET prix = 110%;","ALTER produits prix * 1.1;"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-update-delete-quiz'), 'vrai_faux', 'Il est prudent de tester le WHERE avec un SELECT avant un DELETE.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'sql'), 'sql-requetes', 'Requêtes, agrégats et contraintes', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-requetes'), (select id from public.courses where slug = 'sql'), 'sql-filtres-tris', 'Filtres avancés, tri et limitation', 'debutant', 40, array['Combiner des conditions avec AND, OR, NOT.', 'Utiliser BETWEEN, IN, LIKE et DISTINCT.', 'Trier avec ORDER BY et limiter avec LIMIT.']::text[], array['Niveau 1']::text[], '## AND, OR, NOT

~~~sql
SELECT nom FROM etudiants WHERE filiere = ''Droit'' AND age < 20;
SELECT nom FROM etudiants WHERE filiere = ''Droit'' OR filiere = ''Médecine'';
~~~

**AND** est prioritaire sur **OR** : mettez des parenthèses dès que vous mélangez les deux.

## BETWEEN et IN

~~~sql
SELECT nom FROM etudiants WHERE age BETWEEN 20 AND 22;          -- bornes incluses
SELECT nom FROM etudiants WHERE filiere IN (''Droit'', ''Médecine'');
~~~

## LIKE : rechercher un motif

**%** remplace n''importe quelle suite de caractères, **_** un seul caractère :

~~~sql
SELECT nom FROM etudiants WHERE nom LIKE ''K%'';     -- commence par K
SELECT nom FROM etudiants WHERE postnom LIKE ''%a''; -- se termine par a
~~~

En SQLite et MySQL, LIKE ignore la casse des lettres simples ; en PostgreSQL il la respecte (on utilise **ILIKE** pour l''ignorer).

## DISTINCT

**SELECT DISTINCT filiere FROM etudiants;** supprime les doublons du résultat.

## ORDER BY

~~~sql
SELECT nom, age FROM etudiants ORDER BY age DESC, nom ASC;
~~~

**ASC** (croissant, par défaut) ou **DESC** (décroissant) ; plusieurs critères possibles. Sans ORDER BY, **l''ordre des lignes n''est pas garanti**.

## LIMIT

**LIMIT 3** garde les 3 premières lignes ; **LIMIT 3 OFFSET 6** saute 6 lignes puis en prend 3 (pagination). SQL Server utilise TOP et la norme FETCH FIRST 3 ROWS ONLY (accepté par PostgreSQL).', array['AND avant OR : utilisez des parenthèses.', 'BETWEEN (bornes incluses), IN (liste), LIKE (% et _).', 'ORDER BY … ASC/DESC ; LIMIT n OFFSET m ; DISTINCT.']::text[], '[{"language":"sql","title":"Les trois plus jeunes, hors Droit","code":"SELECT nom, age, filiere\nFROM etudiants\nWHERE filiere IS NOT NULL AND NOT filiere = ''Droit''\nORDER BY age\nLIMIT 3;\n\nSELECT DISTINCT filiere FROM etudiants WHERE filiere IS NOT NULL ORDER BY filiere;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-filtres-tris'), 'sql-filtres-quiz', 'Vérification — Filtres et tris', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-filtres-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-filtres-quiz'), 'qcm', 'WHERE age BETWEEN 18 AND 20 inclut-il 20 ?', null, '["Oui","Non"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-filtres-quiz'), 'qcm', 'Quel motif trouve les noms commençant par M ?', null, '["LIKE ''M_''","LIKE ''M%''","LIKE ''%M''","= ''M*''"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-filtres-quiz'), 'qcm', 'Comment trier du plus grand au plus petit ?', null, '["ORDER BY x ASC","ORDER BY x DESC","SORT x DOWN","ORDER x REVERSE"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-filtres-quiz'), 'qcm', 'Que fait DISTINCT ?', null, '["Trie","Supprime les doublons du résultat","Compte","Filtre les NULL"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-requetes'), (select id from public.courses where slug = 'sql'), 'sql-agregats', 'Fonctions d''agrégation, GROUP BY et HAVING', 'debutant', 45, array['Calculer avec COUNT, SUM, AVG, MIN, MAX.', 'Regrouper avec GROUP BY.', 'Filtrer les groupes avec HAVING.']::text[], array['Filtres avancés, tri et limitation']::text[], '## Les fonctions d''agrégation

Elles résument plusieurs lignes en une valeur :

| Fonction | Résultat |
|---|---|
| COUNT(*) | nombre de lignes |
| COUNT(colonne) | nombre de valeurs non NULL |
| SUM(colonne) | somme |
| AVG(colonne) | moyenne |
| MIN / MAX | plus petite / plus grande valeur |

~~~sql
SELECT COUNT(*) AS nombre, AVG(age) AS age_moyen FROM etudiants;
~~~

**ROUND(AVG(age), 1)** arrondit à une décimale.

## GROUP BY

Pour calculer **par catégorie** :

~~~sql
SELECT filiere, COUNT(*) AS effectif
FROM etudiants
GROUP BY filiere;
~~~

Règle : chaque colonne du SELECT est soit dans le **GROUP BY**, soit à l''intérieur d''une **fonction d''agrégation**. (MySQL est parfois permissif ; PostgreSQL et la norme refusent.)

## HAVING

**WHERE** filtre les **lignes avant** le regroupement ; **HAVING** filtre les **groupes après** :

~~~sql
SELECT filiere, COUNT(*) AS effectif
FROM etudiants
WHERE age >= 20
GROUP BY filiere
HAVING COUNT(*) >= 2;
~~~

## Ordre d''exécution complet

**FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.** C''est pourquoi un alias défini dans SELECT ne peut pas être utilisé dans WHERE (mais il peut l''être dans ORDER BY).', array['COUNT, SUM, AVG, MIN, MAX résument des lignes.', 'GROUP BY calcule par groupe.', 'WHERE filtre les lignes, HAVING filtre les groupes.']::text[], '[{"language":"sql","title":"Statistiques par catégorie","code":"SELECT categorie,\n       COUNT(*) AS nb_produits,\n       ROUND(AVG(prix), 2) AS prix_moyen,\n       SUM(stock) AS stock_total\nFROM produits\nGROUP BY categorie\nHAVING COUNT(*) >= 2\nORDER BY nb_produits DESC;","stdin":"PRAGMA foreign_keys = ON;\nCREATE TABLE produits (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, categorie TEXT NOT NULL, prix REAL NOT NULL CHECK (prix > 0), stock INTEGER NOT NULL DEFAULT 0);\nCREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, ville TEXT NOT NULL);\nCREATE TABLE commandes (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL REFERENCES clients (id), date_commande TEXT NOT NULL);\nCREATE TABLE lignes_commande (commande_id INTEGER NOT NULL REFERENCES commandes (id), produit_id INTEGER NOT NULL REFERENCES produits (id), quantite INTEGER NOT NULL CHECK (quantite > 0), PRIMARY KEY (commande_id, produit_id));\nINSERT INTO produits (nom, categorie, prix, stock) VALUES\n  (''Cahier'', ''Papeterie'', 1.5, 200), (''Stylo'', ''Papeterie'', 0.5, 500), (''Calculatrice'', ''Électronique'', 25, 15),\n  (''Clé USB'', ''Électronique'', 8, 40), (''Sac à dos'', ''Bagagerie'', 30, 0), (''Règle'', ''Papeterie'', 1, 120);\nINSERT INTO clients (nom, ville) VALUES (''Kito'', ''Kinshasa''), (''Mbuyi'', ''Lubumbashi''), (''Ilunga'', ''Kinshasa''), (''Tshala'', ''Goma'');\nINSERT INTO commandes (client_id, date_commande) VALUES (1, ''2026-10-02''), (2, ''2026-10-05''), (1, ''2026-10-20''), (3, ''2026-11-01'');\nINSERT INTO lignes_commande (commande_id, produit_id, quantite) VALUES\n  (1, 1, 10), (1, 2, 5), (2, 3, 1), (3, 4, 2), (3, 1, 4), (4, 5, 1), (4, 6, 3);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-agregats'), 'sql-agregats-quiz', 'Vérification — Agrégats', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-agregats-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-agregats-quiz'), 'qcm', 'COUNT(filiere) compte…', null, '["toutes les lignes","les lignes où filiere n''est pas NULL","les filières distinctes","les NULL"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-agregats-quiz'), 'qcm', 'Où filtrer « les filières de plus de 10 étudiants » ?', null, '["WHERE COUNT(*) > 10","HAVING COUNT(*) > 10","GROUP BY > 10","ORDER BY 10"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-agregats-quiz'), 'qcm', 'Quelle clause s''exécute en premier ?', null, '["SELECT","WHERE","FROM","ORDER BY"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-requetes'), (select id from public.courses where slug = 'sql'), 'sql-contraintes', 'Contraintes et modification de la structure', 'debutant', 35, array['Garantir la qualité des données avec les contraintes.', 'Modifier une table avec ALTER TABLE.', 'Comprendre les erreurs de contrainte.']::text[], array['Fonctions d''agrégation']::text[], '## Pourquoi des contraintes ?

Une application peut avoir des bogues ; la base est la **dernière ligne de défense**. Les contraintes refusent les données incohérentes, quel que soit le programme qui les envoie.

| Contrainte | Garantit que… |
|---|---|
| PRIMARY KEY | la valeur identifie la ligne (unique, non nulle) |
| NOT NULL | la valeur est toujours renseignée |
| UNIQUE | deux lignes n''ont jamais la même valeur (e-mail, matricule) |
| CHECK (condition) | la condition est vraie (age >= 15, prix > 0) |
| DEFAULT valeur | une valeur est mise si on n''en fournit pas |
| FOREIGN KEY … REFERENCES | la valeur existe dans la table référencée |

~~~sql
CREATE TABLE utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT ''etudiant'' CHECK (role IN (''etudiant'', ''enseignant'', ''administrateur'')),
  cree_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
~~~

## Quand une contrainte refuse

L''instruction échoue avec un message (UNIQUE constraint failed, NOT NULL constraint failed, CHECK constraint failed…). Le laboratoire l''explique en français et indique la ligne.

## Clés étrangères dans SQLite

Pour des raisons historiques, SQLite ne vérifie les clés étrangères que si **PRAGMA foreign_keys = ON;** est exécuté (c''est le cas dans le laboratoire). MySQL (moteur InnoDB) et PostgreSQL les vérifient toujours.

## ALTER TABLE

~~~sql
ALTER TABLE etudiants ADD COLUMN email TEXT;
ALTER TABLE etudiants RENAME COLUMN postnom TO post_nom;
~~~

SQLite ne permet qu''une partie des modifications (ajouter, renommer, supprimer une colonne). MySQL et PostgreSQL permettent aussi de changer le type (ALTER COLUMN / MODIFY) ou d''ajouter une contrainte à une table existante.', array['Les contraintes protègent la base contre les données incohérentes.', 'PRIMARY KEY, NOT NULL, UNIQUE, CHECK, DEFAULT, FOREIGN KEY.', 'ALTER TABLE modifie la structure (possibilités variables selon le SGBD).']::text[], '[{"language":"sql","title":"Les contraintes en action","code":"CREATE TABLE utilisateurs (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  email TEXT NOT NULL UNIQUE,\n  role TEXT NOT NULL DEFAULT ''etudiant'' CHECK (role IN (''etudiant'', ''enseignant'', ''administrateur''))\n);\nINSERT INTO utilisateurs (email) VALUES (''kito@upl.cd'');\nINSERT INTO utilisateurs (email, role) VALUES (''prof@upl.cd'', ''enseignant'');\nALTER TABLE utilisateurs ADD COLUMN telephone TEXT;\nSELECT * FROM utilisateurs;\n-- Essayez : INSERT INTO utilisateurs (email) VALUES (''kito@upl.cd'');"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-contraintes'), 'sql-contraintes-quiz', 'Vérification — Contraintes', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-contraintes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-contraintes-quiz'), 'qcm', 'Quelle contrainte empêche deux comptes avec le même e-mail ?', null, '["NOT NULL","UNIQUE","CHECK","DEFAULT"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-contraintes-quiz'), 'qcm', 'Quelle contrainte impose un prix positif ?', null, '["CHECK (prix > 0)","UNIQUE (prix)","DEFAULT 0","NOT NULL"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-contraintes-quiz'), 'vrai_faux', 'SQLite vérifie toujours les clés étrangères, même sans PRAGMA.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'sql'), 'sql-relations', 'Relations, jointures et intégrité', null, 3, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-relations'), (select id from public.courses where slug = 'sql'), 'sql-jointures', 'Relations entre tables et jointures', 'intermediaire', 50, array['Reconnaître les relations 1-1, 1-n et n-n.', 'Combiner des tables avec INNER JOIN et LEFT JOIN.', 'Utiliser une table d''association.']::text[], array['Contraintes (niveau 2)']::text[], '## Les trois types de relations

| Relation | Exemple | Mise en œuvre |
|---|---|---|
| 1-1 | un étudiant ↔ une carte d''étudiant | clé étrangère UNIQUE dans l''une des tables |
| 1-n | une filière → plusieurs étudiants | clé étrangère du côté « plusieurs » (etudiants.filiere_id) |
| n-n | des étudiants ↔ des cours | **table d''association** (inscriptions) avec deux clés étrangères |

La base **universite** du laboratoire : **filieres**, **etudiants** (filiere_id), **cours**, **inscriptions** (etudiant_id, cours_id, note).

## INNER JOIN

Garde les lignes qui ont une **correspondance** dans les deux tables :

~~~sql
SELECT e.nom, f.nom AS filiere
FROM etudiants e
INNER JOIN filieres f ON f.id = e.filiere_id;
~~~

**e** et **f** sont des **alias de table** ; la condition **ON** dit comment les lignes se correspondent (presque toujours : clé étrangère = clé primaire).

## LEFT JOIN

Garde **toutes** les lignes de la table de gauche, même sans correspondance (les colonnes de droite valent alors NULL) : indispensable pour « les étudiants **sans** filière » ou « les cours **sans** inscrit ».

~~~sql
SELECT e.nom, f.nom AS filiere
FROM etudiants e
LEFT JOIN filieres f ON f.id = e.filiere_id;
~~~

RIGHT JOIN et FULL OUTER JOIN existent dans PostgreSQL et SQLite (depuis la version 3.39) ; MySQL n''a pas FULL OUTER JOIN.

## Jointure sur trois tables (n-n)

~~~sql
SELECT e.nom, c.intitule, i.note
FROM inscriptions i
JOIN etudiants e ON e.id = i.etudiant_id
JOIN cours c ON c.id = i.cours_id;
~~~

## Jointure et agrégats

On combine librement : **moyenne par étudiant**, **nombre d''inscrits par cours**, **chiffre d''affaires par client**… avec GROUP BY après les JOIN.', array['1-n : clé étrangère côté « plusieurs » ; n-n : table d''association.', 'INNER JOIN : seulement les correspondances ; LEFT JOIN : toute la table de gauche.', 'Alias de table (e, f) et condition ON clé étrangère = clé primaire.']::text[], '[{"language":"sql","title":"Relevé de notes (jointure n-n)","code":"SELECT e.nom, c.intitule, i.note\nFROM inscriptions i\nJOIN etudiants e ON e.id = i.etudiant_id\nJOIN cours c ON c.id = i.cours_id\nORDER BY e.nom, c.intitule;\n\n-- Moyenne par étudiant, y compris ceux qui n''ont aucune note\nSELECT e.nom, ROUND(AVG(i.note), 2) AS moyenne, COUNT(i.cours_id) AS nb_cours\nFROM etudiants e\nLEFT JOIN inscriptions i ON i.etudiant_id = e.id\nGROUP BY e.id, e.nom\nORDER BY e.nom;","stdin":"PRAGMA foreign_keys = ON;\nCREATE TABLE filieres (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL UNIQUE\n);\nCREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER CHECK (age >= 15),\n  filiere_id INTEGER REFERENCES filieres (id)\n);\nCREATE TABLE cours (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  intitule TEXT NOT NULL,\n  credits INTEGER NOT NULL DEFAULT 3\n);\nCREATE TABLE inscriptions (\n  etudiant_id INTEGER NOT NULL REFERENCES etudiants (id),\n  cours_id INTEGER NOT NULL REFERENCES cours (id),\n  note REAL CHECK (note BETWEEN 0 AND 20),\n  PRIMARY KEY (etudiant_id, cours_id)\n);\nINSERT INTO filieres (nom) VALUES (''Informatique''), (''Droit''), (''Médecine'');\nINSERT INTO etudiants (nom, postnom, age, filiere_id) VALUES\n  (''Kito'', ''Manasse'', 23, 1),\n  (''Mbuyi'', ''Grace'', 19, 2),\n  (''Kabila'', ''Mutombo'', 21, 1),\n  (''Ilunga'', ''Sarah'', 25, 3),\n  (''Nsimba'', ''Joel'', 22, NULL);\nINSERT INTO cours (intitule, credits) VALUES (''Algorithmique'', 5), (''Bases de données'', 4), (''Droit civil'', 3), (''Anatomie'', 6);\nINSERT INTO inscriptions (etudiant_id, cours_id, note) VALUES\n  (1, 1, 15), (1, 2, 17), (2, 3, 12), (3, 1, 9), (3, 2, 11), (4, 4, 14);"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-jointures'), 'sql-jointures-quiz', 'Vérification — Jointures', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-jointures-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-jointures-quiz'), 'qcm', 'Comment représenter « des étudiants suivent des cours » (n-n) ?', null, '["Une colonne cours dans etudiants","Une table d''association","Une vue","Un index"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-jointures-quiz'), 'qcm', 'Quelle jointure garde les étudiants sans filière ?', null, '["INNER JOIN","LEFT JOIN depuis etudiants","CROSS JOIN","Aucune"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-jointures-quiz'), 'qcm', 'Dans une relation 1-n, où place-t-on la clé étrangère ?', null, '["Côté « 1 »","Côté « plusieurs »","Dans les deux tables","Nulle part"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-relations'), (select id from public.courses where slug = 'sql'), 'sql-sous-requetes-vues', 'Sous-requêtes et vues', 'intermediaire', 40, array['Écrire des sous-requêtes dans WHERE et dans SELECT.', 'Utiliser IN, EXISTS et les sous-requêtes scalaires.', 'Créer et interroger une vue.']::text[], array['Relations et jointures']::text[], '## Une requête dans une requête

Une **sous-requête** est un SELECT entre parenthèses utilisé par une autre requête.

~~~sql
-- Étudiants plus âgés que la moyenne
SELECT nom, age FROM etudiants
WHERE age > (SELECT AVG(age) FROM etudiants);
~~~

## Sous-requête avec IN

~~~sql
SELECT nom FROM etudiants
WHERE id IN (SELECT etudiant_id FROM inscriptions WHERE note >= 15);
~~~

## EXISTS et NOT EXISTS

**EXISTS** est vrai si la sous-requête renvoie au moins une ligne. Elle peut faire référence à la requête principale (sous-requête **corrélée**) :

~~~sql
SELECT c.intitule FROM cours c
WHERE NOT EXISTS (SELECT 1 FROM inscriptions i WHERE i.cours_id = c.id);
~~~

Attention : **NOT IN** avec une sous-requête qui contient un NULL ne renvoie rien ; **NOT EXISTS** est plus sûr.

## Sous-requête dans SELECT ou FROM

~~~sql
SELECT nom, (SELECT COUNT(*) FROM inscriptions i WHERE i.etudiant_id = e.id) AS nb_cours
FROM etudiants e;
~~~

Une sous-requête dans FROM est une **table dérivée** (elle doit avoir un alias). La clause **WITH** (expression de table commune, CTE) donne un nom à une sous-requête et rend les requêtes longues lisibles ; elle existe dans SQLite, PostgreSQL et MySQL 8.

## Les vues

Une **vue** est une requête enregistrée sous un nom, que l''on interroge comme une table :

~~~sql
CREATE VIEW releve AS
SELECT e.nom, c.intitule, i.note FROM inscriptions i
JOIN etudiants e ON e.id = i.etudiant_id
JOIN cours c ON c.id = i.cours_id;

SELECT * FROM releve WHERE note < 10;
~~~

Avantages : simplifier les requêtes fréquentes, **masquer** des colonnes sensibles (on donne accès à la vue, pas à la table).', array['Une sous-requête est un SELECT entre parenthèses.', 'IN, EXISTS / NOT EXISTS, sous-requête scalaire, table dérivée, WITH.', 'Une vue est une requête nommée, interrogée comme une table.']::text[], '[{"language":"sql","title":"Sous-requêtes, WITH et vue","code":"SELECT nom, age FROM etudiants WHERE age > (SELECT AVG(age) FROM etudiants);\n\nSELECT c.intitule FROM cours c\nWHERE NOT EXISTS (SELECT 1 FROM inscriptions i WHERE i.cours_id = c.id);\n\nWITH moyennes AS (\n  SELECT etudiant_id, AVG(note) AS moyenne FROM inscriptions GROUP BY etudiant_id\n)\nSELECT e.nom, ROUND(m.moyenne, 2) AS moyenne\nFROM moyennes m JOIN etudiants e ON e.id = m.etudiant_id\nWHERE m.moyenne >= 12;\n\nCREATE VIEW releve AS\nSELECT e.nom, c.intitule, i.note FROM inscriptions i\nJOIN etudiants e ON e.id = i.etudiant_id JOIN cours c ON c.id = i.cours_id;\nSELECT * FROM releve WHERE note < 12 ORDER BY note;","stdin":"PRAGMA foreign_keys = ON;\nCREATE TABLE filieres (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL UNIQUE\n);\nCREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER CHECK (age >= 15),\n  filiere_id INTEGER REFERENCES filieres (id)\n);\nCREATE TABLE cours (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  intitule TEXT NOT NULL,\n  credits INTEGER NOT NULL DEFAULT 3\n);\nCREATE TABLE inscriptions (\n  etudiant_id INTEGER NOT NULL REFERENCES etudiants (id),\n  cours_id INTEGER NOT NULL REFERENCES cours (id),\n  note REAL CHECK (note BETWEEN 0 AND 20),\n  PRIMARY KEY (etudiant_id, cours_id)\n);\nINSERT INTO filieres (nom) VALUES (''Informatique''), (''Droit''), (''Médecine'');\nINSERT INTO etudiants (nom, postnom, age, filiere_id) VALUES\n  (''Kito'', ''Manasse'', 23, 1),\n  (''Mbuyi'', ''Grace'', 19, 2),\n  (''Kabila'', ''Mutombo'', 21, 1),\n  (''Ilunga'', ''Sarah'', 25, 3),\n  (''Nsimba'', ''Joel'', 22, NULL);\nINSERT INTO cours (intitule, credits) VALUES (''Algorithmique'', 5), (''Bases de données'', 4), (''Droit civil'', 3), (''Anatomie'', 6);\nINSERT INTO inscriptions (etudiant_id, cours_id, note) VALUES\n  (1, 1, 15), (1, 2, 17), (2, 3, 12), (3, 1, 9), (3, 2, 11), (4, 4, 14);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-sous-requetes-vues'), 'sql-sous-requetes-quiz', 'Vérification — Sous-requêtes et vues', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-sous-requetes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-sous-requetes-quiz'), 'qcm', 'Que renvoie EXISTS (sous-requête) ?', null, '["Le nombre de lignes","Vrai si au moins une ligne","La première ligne","NULL"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-sous-requetes-quiz'), 'qcm', 'Une vue stocke…', null, '["une copie des données","une requête nommée","un index","une sauvegarde"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-sous-requetes-quiz'), 'vrai_faux', 'NOT IN se comporte mal si la sous-requête renvoie un NULL.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-relations'), (select id from public.courses where slug = 'sql'), 'sql-index-transactions', 'Index et transactions', 'intermediaire', 40, array['Accélérer les recherches avec des index.', 'Lire un plan d''exécution.', 'Garantir le « tout ou rien » avec les transactions (ACID).']::text[], array['Sous-requêtes et vues']::text[], '## Les index

Sans index, pour trouver **WHERE email = ''x''**, le SGBD lit **toute** la table. Un **index** est une structure triée (un arbre B) qui permet d''aller directement aux bonnes lignes, comme l''index d''un livre.

~~~sql
CREATE INDEX idx_etudiants_nom ON etudiants (nom);
CREATE UNIQUE INDEX idx_utilisateurs_email ON utilisateurs (email);
~~~

- la clé primaire et les colonnes UNIQUE sont indexées automatiquement ;
- on indexe les colonnes souvent utilisées dans **WHERE**, **JOIN** et **ORDER BY** (les clés étrangères en particulier) ;
- un index **ralentit les écritures** et occupe de la place : on n''indexe pas tout.

## Voir le plan d''exécution

**EXPLAIN QUERY PLAN SELECT …** (SQLite) ou **EXPLAIN** (MySQL, PostgreSQL ; **EXPLAIN ANALYZE** mesure réellement) montre si le SGBD parcourt toute la table (SCAN) ou utilise un index (SEARCH … USING INDEX).

## Les transactions

Une **transaction** regroupe plusieurs instructions qui doivent réussir **ensemble** :

~~~sql
BEGIN;
UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;
COMMIT;   -- valide les deux
-- ou ROLLBACK; pour tout annuler
~~~

Si une erreur survient au milieu, **ROLLBACK** remet la base dans l''état d''avant. MySQL et PostgreSQL écrivent **START TRANSACTION** ou **BEGIN**.

## Les propriétés ACID

| Propriété | Signification |
|---|---|
| Atomicité | tout ou rien |
| Cohérence | la base passe d''un état valide à un état valide (contraintes respectées) |
| Isolation | les transactions simultanées ne se gênent pas |
| Durabilité | une fois validées (COMMIT), les données survivent à une panne |', array['Un index accélère WHERE, JOIN et ORDER BY mais ralentit les écritures.', 'EXPLAIN montre si un index est utilisé.', 'BEGIN … COMMIT / ROLLBACK : tout ou rien (ACID).']::text[], '[{"language":"sql","title":"Index et plan d''exécution","code":"EXPLAIN QUERY PLAN SELECT * FROM etudiants WHERE nom = ''Kito'';\nCREATE INDEX idx_etudiants_nom ON etudiants (nom);\nEXPLAIN QUERY PLAN SELECT * FROM etudiants WHERE nom = ''Kito'';","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);"},{"language":"sql","title":"Transaction annulée puis validée","code":"CREATE TABLE comptes (id INTEGER PRIMARY KEY, titulaire TEXT, solde INTEGER CHECK (solde >= 0));\nINSERT INTO comptes VALUES (1, ''Kito'', 100), (2, ''Mbuyi'', 50);\n\nBEGIN;\nUPDATE comptes SET solde = solde + 30 WHERE id = 2;\nUPDATE comptes SET solde = solde - 30 WHERE id = 1;\nCOMMIT;\n\nBEGIN;\nDELETE FROM comptes;\nROLLBACK;\n\nSELECT * FROM comptes;"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-index-transactions'), 'sql-index-quiz', 'Vérification — Index et transactions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-index-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-index-quiz'), 'qcm', 'Quelle colonne indexer en priorité ?', null, '["Une colonne jamais lue","Une clé étrangère utilisée dans les jointures","Toutes les colonnes","Une colonne de commentaire"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-index-quiz'), 'qcm', 'Que fait ROLLBACK ?', null, '["Valide","Annule la transaction en cours","Supprime la table","Sauvegarde"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-index-quiz'), 'qcm', 'Le « A » de ACID signifie…', null, '["Accès","Atomicité","Agrégat","Authentification"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-relations'), (select id from public.courses where slug = 'sql'), 'sql-normalisation', 'Normalisation : 1NF, 2NF, 3NF', 'intermediaire', 40, array['Repérer les redondances et les anomalies.', 'Appliquer les trois premières formes normales.', 'Découper une table mal conçue.']::text[], array['Relations et jointures']::text[], '## Le problème : la redondance

Une table unique « inscriptions » contenant **nom_etudiant, telephone_etudiant, filiere, intitule_cours, credits, note** répète le téléphone à chaque cours suivi. Conséquences (**anomalies**) :

- **modification** : changer le téléphone oblige à modifier plusieurs lignes (et on en oublie) ;
- **insertion** : impossible d''enregistrer un cours tant que personne n''y est inscrit ;
- **suppression** : supprimer la dernière inscription d''un cours efface les informations du cours.

## Dépendance fonctionnelle

A → B (« A détermine B ») : connaissant A, on connaît B. Exemple : **matricule → nom**, **(matricule, code_cours) → note**.

## Première forme normale (1NF)

Chaque colonne contient une **valeur atomique** (pas de liste « 12, 15, 9 » dans une case) et il n''y a pas de groupes de colonnes répétés (note1, note2, note3).

## Deuxième forme normale (2NF)

1NF, et chaque colonne non clé dépend de **toute** la clé primaire (pas d''une partie). Dans inscriptions (matricule, code_cours, nom, note), **nom** ne dépend que de matricule : il part dans la table etudiants.

## Troisième forme normale (3NF)

2NF, et aucune colonne non clé ne dépend d''une **autre colonne non clé**. Dans etudiants (matricule, nom, code_filiere, nom_filiere), **nom_filiere** dépend de code_filiere : il part dans la table filieres.

## Résultat

~~~text
etudiants(id, nom, telephone, filiere_id → filieres.id)
filieres(id, nom)
cours(id, intitule, credits)
inscriptions(etudiant_id → etudiants.id, cours_id → cours.id, note)
~~~

Chaque information est stockée **une seule fois** ; les jointures la reconstituent. En pratique, on peut **dénormaliser** volontairement (copier une valeur) pour des raisons de performance, en connaissant le prix à payer.', array['Redondance ⇒ anomalies de modification, d''insertion et de suppression.', '1NF : valeurs atomiques ; 2NF : dépend de toute la clé ; 3NF : pas de dépendance entre colonnes non clés.', 'On découpe en tables reliées par des clés étrangères.']::text[], '[{"language":"sql","title":"Une table non normalisée et ses anomalies","code":"CREATE TABLE inscriptions_brutes (etudiant TEXT, telephone TEXT, cours TEXT, credits INTEGER, note REAL);\nINSERT INTO inscriptions_brutes VALUES\n  (''Kito'', ''0810000001'', ''Algorithmique'', 5, 15),\n  (''Kito'', ''0810000001'', ''Bases de données'', 4, 17),\n  (''Mbuyi'', ''0990000002'', ''Algorithmique'', 5, 12);\n\n-- Anomalie de modification : le téléphone est répété\nUPDATE inscriptions_brutes SET telephone = ''0820000009'' WHERE etudiant = ''Kito'' AND cours = ''Algorithmique'';\nSELECT DISTINCT etudiant, telephone FROM inscriptions_brutes;"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-normalisation'), 'sql-normalisation-quiz', 'Vérification — Normalisation', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-normalisation-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-normalisation-quiz'), 'qcm', 'Une colonne notes = ''12, 15, 9'' viole…', null, '["la 1NF","la 2NF","la 3NF","aucune"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-normalisation-quiz'), 'qcm', 'nom_filiere dépend de code_filiere (non clé) : quelle forme est violée ?', null, '["1NF","2NF","3NF"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-normalisation-quiz'), 'qcm', 'Quel est le but principal de la normalisation ?', null, '["Accélérer toutes les requêtes","Éviter la redondance et les anomalies","Chiffrer les données","Réduire le nombre de tables"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'sql'), 'sql-professionnel', 'Conception et administration professionnelles', null, 4, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-professionnel'), (select id from public.courses where slug = 'sql'), 'sql-conception-merise', 'Conception avec MERISE et diagrammes entité-association', 'avance', 50, array['Construire un MCD à partir d''un cahier des charges.', 'Lire les cardinalités.', 'Traduire un MCD en modèle logique puis en tables.']::text[], array['Normalisation']::text[], '## La démarche MERISE

**MERISE** est une méthode française de conception, très enseignée en Afrique francophone. Elle sépare trois niveaux :

1. **MCD** (modèle conceptuel des données) : les **entités**, leurs **propriétés** et les **associations**, sans se soucier de la technique ;
2. **MLD** (modèle logique) : les **tables**, clés primaires et étrangères ;
3. **MPD** (modèle physique) : le script SQL pour un SGBD précis (types, index).

Les méthodes anglo-saxonnes utilisent le **diagramme entité-association** (ER) ou UML : les idées sont les mêmes.

## Entités et associations

- **Entité** : un objet du domaine (ÉTUDIANT, COURS, FILIÈRE) avec un **identifiant** (souligné) ;
- **Association** : un lien entre entités, nommé par un verbe (ÉTUDIANT **suit** COURS) ; elle peut porter des propriétés (la **note** appartient à « suit »).

## Cardinalités

Pour chaque entité dans une association : (minimum, maximum) d''occurrences.

~~~text
FILIÈRE (0,n) ── appartenir ── (1,1) ÉTUDIANT
ÉTUDIANT (0,n) ── suivre [note] ── (0,n) COURS
~~~

Lecture : un étudiant appartient à **exactement une** filière (1,1) ; une filière a **0 à n** étudiants ; un étudiant suit 0 à n cours, et un cours est suivi par 0 à n étudiants.

## Règles de passage au modèle logique

| Cas | Traduction |
|---|---|
| entité | table ; l''identifiant devient la clé primaire |
| association (1,1)–(x,n) | clé étrangère dans la table du côté (1,1) |
| association (x,n)–(x,n) | nouvelle table avec les deux clés étrangères (clé primaire composée) et les propriétés de l''association |
| association (0,1)–(1,1) | clé étrangère UNIQUE |

## Méthode professionnelle

1. lire le cahier des charges et souligner les **noms** (entités, propriétés) et les **verbes** (associations) ;
2. dessiner le MCD et valider les cardinalités avec le client (« un médicament peut-il avoir plusieurs fournisseurs ? ») ;
3. traduire en MLD, vérifier la **3NF** ;
4. écrire le script (MPD) avec contraintes et index ;
5. tester avec des données réalistes et les requêtes attendues.

Le laboratoire affiche la **structure** de votre base (onglet Structure) : tables, colonnes, clés primaires 🔑 et clés étrangères →.', array['MCD (entités, associations, cardinalités) → MLD (tables, clés) → MPD (script SQL).', 'Association (1,1)–(x,n) : clé étrangère ; (x,n)–(x,n) : table d''association.', 'Valider les cardinalités avec le client, puis vérifier la 3NF.']::text[], '[{"language":"sql","title":"Du MCD pharmacie au script SQL","code":"PRAGMA foreign_keys = ON;\n-- FOURNISSEUR (1,n) ── fournir ── (1,n) MÉDICAMENT ; CLIENT (0,n) ── acheter [quantité, date] ── (0,n) MÉDICAMENT\nCREATE TABLE fournisseurs (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL UNIQUE);\nCREATE TABLE medicaments (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prix REAL NOT NULL CHECK (prix > 0), stock INTEGER NOT NULL DEFAULT 0);\nCREATE TABLE fournir (fournisseur_id INTEGER REFERENCES fournisseurs (id), medicament_id INTEGER REFERENCES medicaments (id), PRIMARY KEY (fournisseur_id, medicament_id));\nCREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL);\nCREATE TABLE ventes (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER REFERENCES clients (id), medicament_id INTEGER NOT NULL REFERENCES medicaments (id), quantite INTEGER NOT NULL CHECK (quantite > 0), date_vente TEXT NOT NULL DEFAULT CURRENT_DATE);\nCREATE INDEX idx_ventes_medicament ON ventes (medicament_id);\n\nINSERT INTO fournisseurs (nom) VALUES (''PharmaKin''), (''MedCongo'');\nINSERT INTO medicaments (nom, prix, stock) VALUES (''Paracétamol'', 2.5, 100), (''Amoxicilline'', 6, 40);\nINSERT INTO fournir VALUES (1, 1), (2, 1), (2, 2);\nINSERT INTO clients (nom) VALUES (''Kito'');\nINSERT INTO ventes (client_id, medicament_id, quantite) VALUES (1, 1, 2), (1, 2, 1);\n\nSELECT m.nom, COUNT(f.fournisseur_id) AS nb_fournisseurs\nFROM medicaments m LEFT JOIN fournir f ON f.medicament_id = m.id\nGROUP BY m.id, m.nom;"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-conception-merise'), 'sql-merise-quiz', 'Vérification — MERISE', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-merise-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-merise-quiz'), 'qcm', 'Que représente un MCD ?', null, '["Le script SQL","Les entités, associations et cardinalités","Les index","Les utilisateurs"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-merise-quiz'), 'qcm', 'Une association (0,n)–(0,n) devient…', null, '["une clé étrangère","une table d''association","une vue","un index"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
commit;
