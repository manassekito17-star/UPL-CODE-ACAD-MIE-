-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 9 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-merise-quiz'), 'qcm', 'Cardinalité (1,1) côté ÉTUDIANT pour « appartenir à une filière » signifie…', null, '["0 ou 1 filière","exactement une filière","plusieurs filières","aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-professionnel'), (select id from public.courses where slug = 'sql'), 'sql-administration', 'Déclencheurs, procédures, sécurité, sauvegarde et performances', 'avance', 50, array['Automatiser des règles avec des déclencheurs.', 'Connaître procédures et fonctions stockées selon le SGBD.', 'Gérer utilisateurs, droits et sauvegardes.', 'Diagnostiquer les problèmes de performance.']::text[], array['Conception avec MERISE']::text[], '## Les déclencheurs (triggers)

Un **déclencheur** exécute automatiquement des instructions **avant** ou **après** un INSERT, UPDATE ou DELETE : journal des modifications, mise à jour d''un stock, refus d''une opération.

~~~sql
CREATE TRIGGER maj_stock AFTER INSERT ON ventes
BEGIN
  UPDATE medicaments SET stock = stock - NEW.quantite WHERE id = NEW.medicament_id;
END;
~~~

**NEW** désigne la ligne insérée (ou la nouvelle version) et **OLD** l''ancienne. Syntaxe ci-dessus : SQLite ; MySQL ajoute FOR EACH ROW ; PostgreSQL appelle une **fonction** (CREATE FUNCTION … RETURNS trigger, puis CREATE TRIGGER … EXECUTE FUNCTION).

## Procédures et fonctions stockées

Du code exécuté **dans** le SGBD (variables, conditions, boucles). Elles existent dans MySQL (CREATE PROCEDURE, CALL) et PostgreSQL (CREATE FUNCTION en PL/pgSQL, CREATE PROCEDURE), **pas dans SQLite** : le laboratoire ne peut donc pas les exécuter.

~~~sql
-- MySQL (non exécutable dans le laboratoire SQLite)
DELIMITER //
CREATE PROCEDURE inscrire(IN p_etudiant INT, IN p_cours INT)
BEGIN
  INSERT INTO inscriptions (etudiant_id, cours_id) VALUES (p_etudiant, p_cours);
END //
DELIMITER ;
CALL inscrire(1, 3);
~~~

## Utilisateurs et permissions

MySQL et PostgreSQL gèrent des **comptes** avec des **droits** précis (SQLite n''en a pas : la sécurité dépend des droits sur le fichier) :

~~~sql
CREATE USER ''app_upl''@''localhost'' IDENTIFIED BY ''…'';         -- MySQL
GRANT SELECT, INSERT, UPDATE ON universite.* TO ''app_upl''@''localhost'';
REVOKE DELETE ON universite.* FROM ''app_upl''@''localhost'';
~~~

Principe du **moindre privilège** : l''application n''a que les droits nécessaires ; jamais le compte administrateur (root, postgres) dans le code.

## Sauvegarde et restauration

- MySQL : **mysqldump universite > sauvegarde.sql** ; PostgreSQL : **pg_dump** / **pg_restore** ; SQLite : copie du fichier ou commande **.backup** ;
- sauvegardes **automatiques**, **régulières**, conservées **ailleurs** que le serveur, et **testées** (une sauvegarde jamais restaurée n''est pas une sauvegarde).

## Performances

Méthode : mesurer (journal des requêtes lentes, EXPLAIN ANALYZE), puis agir : index adaptés, éviter SELECT * et les requêtes répétées dans une boucle (problème « N+1 »), paginer avec LIMIT, archiver les données anciennes.

## Réplication et haute disponibilité

Une ou plusieurs **répliques** reçoivent en continu les modifications du serveur principal : lecture répartie, et bascule en cas de panne. MySQL (réplication par journal binaire, Group Replication) et PostgreSQL (réplication en continu) le proposent ; c''est un sujet d''administration système, hors du laboratoire.', array['Un déclencheur agit automatiquement avant/après INSERT, UPDATE, DELETE (NEW / OLD).', 'Procédures stockées : MySQL et PostgreSQL, pas SQLite.', 'GRANT / REVOKE et moindre privilège ; sauvegardes automatiques et testées.', 'Mesurer (EXPLAIN ANALYZE) avant d''optimiser.']::text[], '[{"language":"sql","title":"Déclencheurs : stock et journal","code":"CREATE TABLE medicaments (id INTEGER PRIMARY KEY, nom TEXT NOT NULL, stock INTEGER NOT NULL CHECK (stock >= 0));\nCREATE TABLE ventes (id INTEGER PRIMARY KEY AUTOINCREMENT, medicament_id INTEGER NOT NULL REFERENCES medicaments (id), quantite INTEGER NOT NULL);\nCREATE TABLE journal (quand TEXT DEFAULT CURRENT_TIMESTAMP, message TEXT);\n\nCREATE TRIGGER maj_stock AFTER INSERT ON ventes\nBEGIN\n  UPDATE medicaments SET stock = stock - NEW.quantite WHERE id = NEW.medicament_id;\n  INSERT INTO journal (message) VALUES (''Vente de '' || NEW.quantite || '' unité(s) du médicament '' || NEW.medicament_id);\nEND;\n\nINSERT INTO medicaments VALUES (1, ''Paracétamol'', 10);\nINSERT INTO ventes (medicament_id, quantite) VALUES (1, 3);\nINSERT INTO ventes (medicament_id, quantite) VALUES (1, 2);\nSELECT nom, stock FROM medicaments;\nSELECT message FROM journal;"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-administration'), 'sql-administration-quiz', 'Vérification — Administration', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-administration-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-administration-quiz'), 'qcm', 'Dans un déclencheur AFTER INSERT, NEW désigne…', null, '["l''ancienne ligne","la ligne insérée","la table","l''utilisateur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-administration-quiz'), 'qcm', 'Quelle instruction donne un droit à un utilisateur ?', null, '["ALLOW","GRANT","PERMIT","SET ROLE"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-administration-quiz'), 'qcm', 'Quel outil sauvegarde une base PostgreSQL ?', null, '["mysqldump","pg_dump","sqlite3 .dump uniquement","cp"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-administration-quiz'), 'vrai_faux', 'SQLite permet de créer des procédures stockées avec CREATE PROCEDURE.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'sql') and m.slug not in ('sql-fondements', 'sql-requetes', 'sql-relations', 'sql-professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'sql'), 1, 'Niveau 1 — Très débutant : premières tables', 'Bases de données, tables, colonnes, lignes, clés primaires et étrangères ; MySQL, MariaDB, PostgreSQL et SQLite ; CREATE, INSERT, SELECT, UPDATE, DELETE.', array['Expliquer le modèle relationnel.', 'Créer et remplir une table.', 'Lire, modifier et supprimer des lignes sans risque.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-examen-niveau-1', 'Examen du niveau 1 — Fondements SQL', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Quel est le rôle de la clé primaire ?', null, '["Relier deux tables","Identifier chaque ligne de façon unique","Trier","Chiffrer"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Quelle instruction crée une table ?', null, '["NEW TABLE","CREATE TABLE","MAKE TABLE","INSERT TABLE"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Comment écrire un texte en SQL ?', null, '["\"texte\"","''texte''","texte","(texte)"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Comment tester une valeur inconnue ?', null, '["= NULL","IS NULL","== NULL","EMPTY"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Que fait DELETE FROM etudiants; sans WHERE ?', null, '["Rien","Supprime toutes les lignes","Supprime la table","Erreur"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'qcm', 'Numérotation automatique en MySQL ?', null, '["AUTOINCREMENT","AUTO_INCREMENT","SERIAL","IDENTITY"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-1'), 'vrai_faux', 'SQLite est identique à MySQL.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'sql'), 2, 'Niveau 2 — Débutant : requêtes et agrégats', 'WHERE avancé (AND, OR, NOT, BETWEEN, LIKE, IN), DISTINCT, ORDER BY, LIMIT, fonctions d''agrégation, GROUP BY, HAVING, contraintes et ALTER TABLE.', array['Écrire des filtres précis.', 'Trier et paginer.', 'Calculer des statistiques par groupe.', 'Protéger la qualité des données avec les contraintes.']::text[], array['Projets guidés : gestion d''une école, des notes, des utilisateurs et des produits']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-examen-niveau-2', 'Examen du niveau 2 — Requêtes et agrégats', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'BETWEEN 18 AND 20 inclut-il 20 ?', null, '["Oui","Non"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'Motif des noms commençant par K ?', null, '["LIKE ''K%''","LIKE ''%K''","= ''K*''","LIKE ''K_''"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'Où filtrer les groupes ?', null, '["WHERE","HAVING","ORDER BY","LIMIT"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'COUNT(colonne) ignore…', null, '["les doublons","les NULL","les zéros","rien"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'Quelle contrainte impose une valeur unique ?', null, '["CHECK","UNIQUE","DEFAULT","NOT NULL"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-2'), 'qcm', 'Trier du plus grand au plus petit ?', null, '["ASC","DESC","DOWN","REVERSE"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'sql'), 3, 'Niveau 3 — Intermédiaire : relations et intégrité', 'Relations 1-1, 1-n, n-n, jointures, sous-requêtes, vues, index, transactions et normalisation (1NF à 3NF).', array['Relier les tables par des clés étrangères.', 'Écrire des jointures et des sous-requêtes.', 'Utiliser index et transactions.', 'Normaliser une base.']::text[], array['Projets : université, pharmacie, ventes, employés, commandes']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-examen-niveau-3', 'Examen du niveau 3 — Relations', false, 70, 'publie', 'examen_niveau', null, 3)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-examen-niveau-3');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Une relation n-n se traduit par…', null, '["une table d''association","une colonne","un index","une vue"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Quelle jointure garde toute la table de gauche ?', null, '["INNER","LEFT","CROSS","NATURAL"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Que fait ROLLBACK ?', null, '["Valide","Annule la transaction","Sauvegarde","Supprime"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Une colonne contenant une liste viole…', null, '["1NF","2NF","3NF"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Une vue est…', null, '["une copie","une requête nommée","un index","un utilisateur"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-3'), 'qcm', 'Un index accélère…', null, '["les écritures","les recherches","les sauvegardes","rien"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'sql'), 4, 'Niveau 4 — Professionnel : conception et administration', 'MERISE et diagrammes entité-association, conception professionnelle, déclencheurs, procédures et fonctions, sécurité, utilisateurs et permissions, sauvegardes, performances, réplication.', array['Concevoir une base à partir d''un cahier des charges.', 'Automatiser des règles avec des déclencheurs.', 'Administrer droits et sauvegardes.', 'Diagnostiquer les performances.']::text[], array['Procédures et fonctions stockées (MySQL, PostgreSQL)', 'Optimisation avancée et plans d''exécution', 'Sauvegarde et restauration en pratique', 'Réplication et haute disponibilité', 'Projet final : base de données complète d''un établissement']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-examen-niveau-4', 'Examen du niveau 4 — Professionnel', false, 70, 'publie', 'examen_niveau', null, 4)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-examen-niveau-4');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'qcm', 'Que représente un MCD ?', null, '["Le script SQL","Entités, associations, cardinalités","Les index","Les droits"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'qcm', 'Dans un trigger AFTER INSERT, NEW désigne…', null, '["l''ancienne ligne","la ligne insérée","la table","l''utilisateur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'qcm', 'Quelle instruction donne un droit ?', null, '["GRANT","ALLOW","PERMIT","OPEN"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'qcm', 'Outil de sauvegarde PostgreSQL ?', null, '["mysqldump","pg_dump","cp","zip"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'vrai_faux', 'SQLite gère les procédures stockées.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-examen-niveau-4'), 'qcm', 'Principe pour les comptes d''application ?', null, '["Administrateur partout","Moindre privilège","Mot de passe vide","Compte partagé"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-positionnement', 'Test de positionnement — SQL', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Quelle instruction lit des données ?', null, '["INSERT","SELECT","UPDATE","DROP"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Une clé primaire est…', null, '["unique","facultative","toujours un texte","une table"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Où filtrer après GROUP BY ?', null, '["WHERE","HAVING"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Que fait DISTINCT ?', null, '["Trie","Supprime les doublons","Compte","Filtre NULL"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Jointure gardant toute la table de gauche ?', null, '["INNER","LEFT"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Que garantit une transaction ?', null, '["Vitesse","Tout ou rien"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Association (0,n)–(0,n) en MLD ?', null, '["Clé étrangère","Table d''association"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-positionnement'), 'qcm', 'Commande pour donner un droit ?', null, '["GRANT","SET"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), null, 'sql-evaluation-finale', 'Évaluation finale — SQL', true, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Quelle instruction lit des données ?', null, '["INSERT","SELECT","UPDATE","CREATE"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Comment tester une valeur inconnue ?', null, '["= NULL","IS NULL","== NULL","NULL()"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Où filtrer après un GROUP BY ?', null, '["WHERE","HAVING","ORDER BY","LIMIT"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Quelle jointure garde toutes les lignes de la table de gauche ?', null, '["INNER JOIN","LEFT JOIN","CROSS JOIN","SELF JOIN"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Une relation n-n se traduit par…', null, '["une table d''association","une colonne liste","un index","une vue"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Que garantit une transaction ?', null, '["La vitesse","Le tout ou rien","Le chiffrement","La sauvegarde"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'qcm', 'Quelle forme normale interdit les dépendances entre colonnes non clés ?', null, '["1NF","2NF","3NF"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-evaluation-finale'), 'vrai_faux', 'SQLite, MySQL et PostgreSQL ont exactement la même syntaxe pour la numérotation automatique.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
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
commit;
