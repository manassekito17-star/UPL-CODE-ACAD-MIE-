-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 9 sur 14.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
commit;
