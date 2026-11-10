import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";
import { BOUTIQUE, ETUDIANTS, UNIVERSITE } from "./sql-data";

const SQL = "sql" as const;
const r = String.raw;

/**
 * Formation complète SQL — maîtriser les bases de données.
 * Les requêtes sont exécutées par SQLite (WebAssembly) dans le navigateur de
 * l'étudiant. Les différences avec MySQL / MariaDB et PostgreSQL sont signalées
 * à chaque fois qu'elles existent : SQLite n'est pas identique à ces systèmes.
 */
export const sql: Course = {
  slug: "sql",
  code: "Parcours I",
  language: "sql",
  category: "donnees",
  title: "Formation complète SQL — maîtriser les bases de données",
  tagline: "Créer, interroger et concevoir des bases de données relationnelles.",
  description:
    "Toute application sérieuse (université, pharmacie, banque, boutique) range ses données dans une base relationnelle. Cette formation va de la première table jusqu'aux jointures, sous-requêtes, transactions, normalisation, conception MERISE, déclencheurs et sécurité. Chaque requête s'exécute réellement avec SQLite dans votre navigateur ; les différences avec MySQL et PostgreSQL sont expliquées.",
  level: "debutant",
  prerequisites: ["Aucun prérequis pour le niveau 1.", "Notions d'algorithmique utiles à partir du niveau 2."],
  objectives: [
    "Créer des tables et manipuler les données (CREATE, INSERT, SELECT, UPDATE, DELETE).",
    "Écrire des requêtes avec filtres, tris, agrégats, jointures et sous-requêtes.",
    "Concevoir une base normalisée à partir d'un cahier des charges (MERISE).",
    "Garantir l'intégrité, la sécurité et les performances d'une base.",
  ],
  durationHours: 50,
  status: "publie",
  modules: [
    // =====================================================================
    // NIVEAU 1
    // =====================================================================
    {
      slug: "sql-fondements",
      title: "Les fondements des bases de données",
      lessons: [
        lesson({
          slug: "sql-introduction",
          title: "Qu'est-ce qu'une base de données ? Tables, lignes, clés",
          durationMinutes: 35,
          objectives: ["Définir base de données, SGBD, table, colonne, ligne.", "Expliquer le rôle des clés primaires et étrangères.", "Situer MySQL, MariaDB, PostgreSQL et SQLite."],
          content: r`
            ## Pourquoi une base de données ?

            Une université doit retrouver en une seconde les notes d'un étudiant parmi des milliers, empêcher deux étudiants d'avoir le même matricule, et permettre à plusieurs secrétaires de travailler en même temps sans écraser leurs modifications. Un fichier Excel ne suffit plus : on utilise une **base de données** gérée par un **SGBD** (système de gestion de bases de données).

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

            - la **clé primaire** (PRIMARY KEY) identifie chaque ligne de façon **unique** et n'est jamais vide : ici **id** ;
            - une **clé étrangère** (FOREIGN KEY) est une colonne qui fait référence à la clé primaire d'une autre table : la table des inscriptions contient **etudiant_id**, qui renvoie à **etudiants.id**. C'est ainsi que les tables sont **reliées**.

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

            Vos requêtes sont exécutées par **SQLite** (version 3), compilé en WebAssembly, **dans votre navigateur** : chaque étudiant a sa propre base, isolée. **SQLite n'est pas identique à MySQL ni à PostgreSQL** : le SQL de base (CREATE, INSERT, SELECT, JOIN, GROUP BY…) est le même, mais certains types et certaines instructions diffèrent. La formation le signale chaque fois, avec la syntaxe de chaque système.
          `,
          examples: [
            example(SQL, "Première requête sur la table etudiants", r`
              SELECT * FROM etudiants;
            `, { stdin: ETUDIANTS, explanation: "La table a été créée et remplie par les « données de départ » ; * signifie « toutes les colonnes »." }),
          ],
          summary: [
            "Une base relationnelle range les données dans des tables (colonnes × lignes).",
            "La clé primaire identifie une ligne ; la clé étrangère relie deux tables.",
            "SQL définit, manipule et contrôle les données.",
            "Le laboratoire utilise SQLite : proche, mais pas identique, de MySQL et PostgreSQL.",
          ],
          quiz: quiz("sql-introduction-quiz", "Vérification — Bases de données", [
            qcm("Que contient une ligne d'une table ?", ["Un type de donnée", "Les informations d'un élément (un étudiant…)", "Le nom de la base", "Une requête"], 1),
            qcm("Quel est le rôle d'une clé primaire ?", ["Relier deux tables", "Identifier chaque ligne de façon unique", "Trier la table", "Chiffrer les données"], 1),
            qcm("Une clé étrangère…", ["fait référence à la clé primaire d'une autre table", "est toujours un texte", "est facultative partout", "remplace la clé primaire"], 0),
            vraiFaux("SQLite et MySQL acceptent exactement les mêmes instructions.", false, "Le cœur du langage est commun, mais des types et instructions diffèrent."),
          ]),
        }),
        lesson({
          slug: "sql-create-insert",
          title: "Créer une table et insérer des données",
          durationMinutes: 40,
          prerequisites: ["Qu'est-ce qu'une base de données ?"],
          objectives: ["Créer une table avec CREATE TABLE.", "Choisir les types de colonnes.", "Insérer une ou plusieurs lignes avec INSERT."],
          content: r`
            ## CREATE TABLE

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
            | date | TEXT ('2026-11-10') | DATE | DATE |
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
            VALUES ('Kito', 'Manasse', 23, 'Informatique');
            ~~~

            - on liste les colonnes, puis les valeurs **dans le même ordre** ;
            - les textes sont entre **apostrophes** ; une apostrophe dans le texte se double : 'L''Université' ;
            - on n'indique pas **id** : il est attribué automatiquement ;
            - plusieurs lignes en une instruction : VALUES (…), (…), (…);
            - **NULL** (sans apostrophes) signifie « valeur inconnue ».

            ## Supprimer une table

            **DROP TABLE etudiants;** supprime la table et toutes ses données (définitivement). **CREATE TABLE IF NOT EXISTS** évite une erreur si la table existe déjà.

            Dans l'éditeur, chaque exécution part d'une **base neuve** : votre script doit donc créer ses tables avant de les remplir.
          `,
          examples: [
            example(SQL, "Créer, remplir et afficher", r`
              CREATE TABLE etudiants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                postnom TEXT NOT NULL,
                age INTEGER,
                filiere TEXT
              );

              INSERT INTO etudiants (nom, postnom, age, filiere) VALUES ('Kito', 'Manasse', 23, 'Informatique');
              INSERT INTO etudiants (nom, postnom, age, filiere) VALUES
                ('Mbuyi', 'Grace', 19, 'Droit'),
                ('L''Heureux', 'Paul', 20, NULL);

              SELECT * FROM etudiants;
            `),
          ],
          summary: ["CREATE TABLE nom (colonne TYPE contraintes, …);", "INSERT INTO table (colonnes) VALUES (valeurs), (…);", "La numérotation automatique s'écrit différemment selon le SGBD."],
          quiz: quiz("sql-create-insert-quiz", "Vérification — CREATE et INSERT", [
            qcm("Comment écrire un texte dans une requête SQL ?", ["\"Kito\"", "'Kito'", "Kito", "`Kito`"], 1),
            qcm("Quelle syntaxe numérote automatiquement en MySQL ?", ["AUTOINCREMENT", "AUTO_INCREMENT", "SERIAL", "IDENTITY(1,1)"], 1),
            qcm("Comment insérer la valeur inconnue ?", ["'NULL'", "NULL", "0", "''"], 1),
            vraiFaux("SQLite refuse un texte plus long que la longueur de VARCHAR(10).", false, "SQLite ne limite pas la longueur ; MySQL et PostgreSQL, si."),
          ]),
        }),
        lesson({
          slug: "sql-select",
          title: "Lire les données : SELECT et WHERE",
          durationMinutes: 35,
          prerequisites: ["Créer une table et insérer des données"],
          objectives: ["Choisir les colonnes affichées.", "Filtrer les lignes avec WHERE.", "Renommer avec AS et calculer des colonnes."],
          content: r`
            ## Choisir les colonnes

            ~~~sql
            SELECT nom, postnom FROM etudiants;
            ~~~

            **SELECT *** affiche toutes les colonnes ; en pratique, on nomme les colonnes utiles (plus lisible et plus rapide).

            ## Filtrer avec WHERE

            ~~~sql
            SELECT nom, age FROM etudiants WHERE age >= 21;
            SELECT nom FROM etudiants WHERE filiere = 'Droit';
            ~~~

            Opérateurs : **=**, **<>** (ou !=), **<**, **>**, **<=**, **>=**.

            ## Valeurs inconnues : IS NULL

            On ne compare **jamais** à NULL avec = : **filiere = NULL** n'est jamais vrai. On écrit **filiere IS NULL** ou **IS NOT NULL**.

            ## Alias et colonnes calculées

            ~~~sql
            SELECT nom AS etudiant, age + 1 AS age_annee_prochaine FROM etudiants;
            ~~~

            La concaténation de textes s'écrit **||** en SQLite et PostgreSQL (nom || ' ' || postnom), et **CONCAT(nom, ' ', postnom)** en MySQL (CONCAT existe aussi en PostgreSQL et dans SQLite récent).

            ## L'ordre d'écriture

            ~~~sql
            SELECT colonnes FROM table WHERE condition;
            ~~~

            Le SGBD lit d'abord **FROM** (quelle table), puis **WHERE** (quelles lignes), puis **SELECT** (quelles colonnes).
          `,
          examples: [
            example(SQL, "Filtrer et renommer", r`
              SELECT nom || ' ' || postnom AS etudiant, age
              FROM etudiants
              WHERE filiere = 'Informatique';

              SELECT nom FROM etudiants WHERE filiere IS NULL;
            `, { stdin: ETUDIANTS }),
          ],
          summary: ["SELECT colonnes FROM table WHERE condition;", "IS NULL / IS NOT NULL, jamais = NULL.", "AS renomme une colonne ; || concatène (SQLite, PostgreSQL)."],
          quiz: quiz("sql-select-quiz", "Vérification — SELECT", [
            qcm("Comment trouver les étudiants sans filière ?", ["WHERE filiere = NULL", "WHERE filiere IS NULL", "WHERE filiere = ''", "WHERE NULL"], 1),
            qcm("Quel mot-clé renomme une colonne du résultat ?", ["RENAME", "AS", "ALIAS", "TO"], 1),
            qcm("Quel opérateur signifie « différent de » ?", ["<>", "=!", "><", "NOT="], 0),
          ]),
        }),
        lesson({
          slug: "sql-update-delete",
          title: "Modifier et supprimer : UPDATE et DELETE",
          durationMinutes: 30,
          prerequisites: ["Lire les données : SELECT et WHERE"],
          objectives: ["Modifier des lignes avec UPDATE.", "Supprimer des lignes avec DELETE.", "Éviter les modifications accidentelles de toute la table."],
          content: r`
            ## UPDATE

            ~~~sql
            UPDATE etudiants SET filiere = 'Informatique', age = 20 WHERE id = 2;
            ~~~

            ## DELETE

            ~~~sql
            DELETE FROM etudiants WHERE id = 6;
            ~~~

            ## Le piège du WHERE oublié

            **UPDATE etudiants SET age = 0;** modifie **toutes** les lignes. **DELETE FROM etudiants;** vide **toute** la table. Il n'y a pas de bouton « annuler » (sauf dans une transaction, niveau 3). Méthode professionnelle :

            1. écrire d'abord le **SELECT** avec le même WHERE et vérifier les lignes visées ;
            2. remplacer SELECT par UPDATE ou DELETE ;
            3. sur une base réelle, travailler dans une **transaction** et avoir une **sauvegarde**.

            ## Calculer à partir de la valeur actuelle

            ~~~sql
            UPDATE produits SET stock = stock - 1 WHERE id = 3;
            ~~~

            ## Combien de lignes ?

            Le laboratoire affiche le nombre de lignes modifiées ou supprimées : s'il vaut 0, votre WHERE ne correspond à aucune ligne ; s'il est bien plus grand que prévu, le WHERE est trop large.
          `,
          examples: [
            example(SQL, "Modifier puis supprimer", r`
              UPDATE etudiants SET filiere = 'Informatique' WHERE nom = 'Nsimba';
              UPDATE etudiants SET age = age + 1 WHERE filiere = 'Droit';
              DELETE FROM etudiants WHERE age > 24;
              SELECT nom, age, filiere FROM etudiants;
            `, { stdin: ETUDIANTS }),
          ],
          summary: ["UPDATE table SET col = valeur WHERE condition;", "DELETE FROM table WHERE condition;", "Toujours tester le WHERE avec un SELECT d'abord."],
          quiz: quiz("sql-update-delete-quiz", "Vérification — UPDATE et DELETE", [
            qcm("Que fait DELETE FROM etudiants; ?", ["Supprime la table", "Supprime toutes les lignes", "Ne fait rien", "Demande confirmation"], 1),
            qcm("Comment augmenter tous les prix de 10 % ?", ["UPDATE produits SET prix = prix * 1.1;", "UPDATE produits prix + 10%;", "SET prix = 110%;", "ALTER produits prix * 1.1;"], 0),
            vraiFaux("Il est prudent de tester le WHERE avec un SELECT avant un DELETE.", true),
          ]),
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 2
    // =====================================================================
    {
      slug: "sql-requetes",
      title: "Requêtes, agrégats et contraintes",
      lessons: [
        lesson({
          slug: "sql-filtres-tris",
          title: "Filtres avancés, tri et limitation",
          durationMinutes: 40,
          prerequisites: ["Niveau 1"],
          objectives: ["Combiner des conditions avec AND, OR, NOT.", "Utiliser BETWEEN, IN, LIKE et DISTINCT.", "Trier avec ORDER BY et limiter avec LIMIT."],
          content: r`
            ## AND, OR, NOT

            ~~~sql
            SELECT nom FROM etudiants WHERE filiere = 'Droit' AND age < 20;
            SELECT nom FROM etudiants WHERE filiere = 'Droit' OR filiere = 'Médecine';
            ~~~

            **AND** est prioritaire sur **OR** : mettez des parenthèses dès que vous mélangez les deux.

            ## BETWEEN et IN

            ~~~sql
            SELECT nom FROM etudiants WHERE age BETWEEN 20 AND 22;          -- bornes incluses
            SELECT nom FROM etudiants WHERE filiere IN ('Droit', 'Médecine');
            ~~~

            ## LIKE : rechercher un motif

            **%** remplace n'importe quelle suite de caractères, **_** un seul caractère :

            ~~~sql
            SELECT nom FROM etudiants WHERE nom LIKE 'K%';     -- commence par K
            SELECT nom FROM etudiants WHERE postnom LIKE '%a'; -- se termine par a
            ~~~

            En SQLite et MySQL, LIKE ignore la casse des lettres simples ; en PostgreSQL il la respecte (on utilise **ILIKE** pour l'ignorer).

            ## DISTINCT

            **SELECT DISTINCT filiere FROM etudiants;** supprime les doublons du résultat.

            ## ORDER BY

            ~~~sql
            SELECT nom, age FROM etudiants ORDER BY age DESC, nom ASC;
            ~~~

            **ASC** (croissant, par défaut) ou **DESC** (décroissant) ; plusieurs critères possibles. Sans ORDER BY, **l'ordre des lignes n'est pas garanti**.

            ## LIMIT

            **LIMIT 3** garde les 3 premières lignes ; **LIMIT 3 OFFSET 6** saute 6 lignes puis en prend 3 (pagination). SQL Server utilise TOP et la norme FETCH FIRST 3 ROWS ONLY (accepté par PostgreSQL).
          `,
          examples: [
            example(SQL, "Les trois plus jeunes, hors Droit", r`
              SELECT nom, age, filiere
              FROM etudiants
              WHERE filiere IS NOT NULL AND NOT filiere = 'Droit'
              ORDER BY age
              LIMIT 3;

              SELECT DISTINCT filiere FROM etudiants WHERE filiere IS NOT NULL ORDER BY filiere;
            `, { stdin: ETUDIANTS }),
          ],
          summary: ["AND avant OR : utilisez des parenthèses.", "BETWEEN (bornes incluses), IN (liste), LIKE (% et _).", "ORDER BY … ASC/DESC ; LIMIT n OFFSET m ; DISTINCT."],
          quiz: quiz("sql-filtres-quiz", "Vérification — Filtres et tris", [
            qcm("WHERE age BETWEEN 18 AND 20 inclut-il 20 ?", ["Oui", "Non"], 0),
            qcm("Quel motif trouve les noms commençant par M ?", ["LIKE 'M_'", "LIKE 'M%'", "LIKE '%M'", "= 'M*'"], 1),
            qcm("Comment trier du plus grand au plus petit ?", ["ORDER BY x ASC", "ORDER BY x DESC", "SORT x DOWN", "ORDER x REVERSE"], 1),
            qcm("Que fait DISTINCT ?", ["Trie", "Supprime les doublons du résultat", "Compte", "Filtre les NULL"], 1),
          ]),
        }),
        lesson({
          slug: "sql-agregats",
          title: "Fonctions d'agrégation, GROUP BY et HAVING",
          durationMinutes: 45,
          prerequisites: ["Filtres avancés, tri et limitation"],
          objectives: ["Calculer avec COUNT, SUM, AVG, MIN, MAX.", "Regrouper avec GROUP BY.", "Filtrer les groupes avec HAVING."],
          content: r`
            ## Les fonctions d'agrégation

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

            Règle : chaque colonne du SELECT est soit dans le **GROUP BY**, soit à l'intérieur d'une **fonction d'agrégation**. (MySQL est parfois permissif ; PostgreSQL et la norme refusent.)

            ## HAVING

            **WHERE** filtre les **lignes avant** le regroupement ; **HAVING** filtre les **groupes après** :

            ~~~sql
            SELECT filiere, COUNT(*) AS effectif
            FROM etudiants
            WHERE age >= 20
            GROUP BY filiere
            HAVING COUNT(*) >= 2;
            ~~~

            ## Ordre d'exécution complet

            **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.** C'est pourquoi un alias défini dans SELECT ne peut pas être utilisé dans WHERE (mais il peut l'être dans ORDER BY).
          `,
          examples: [
            example(SQL, "Statistiques par catégorie", r`
              SELECT categorie,
                     COUNT(*) AS nb_produits,
                     ROUND(AVG(prix), 2) AS prix_moyen,
                     SUM(stock) AS stock_total
              FROM produits
              GROUP BY categorie
              HAVING COUNT(*) >= 2
              ORDER BY nb_produits DESC;
            `, { stdin: BOUTIQUE }),
          ],
          summary: ["COUNT, SUM, AVG, MIN, MAX résument des lignes.", "GROUP BY calcule par groupe.", "WHERE filtre les lignes, HAVING filtre les groupes."],
          quiz: quiz("sql-agregats-quiz", "Vérification — Agrégats", [
            qcm("COUNT(filiere) compte…", ["toutes les lignes", "les lignes où filiere n'est pas NULL", "les filières distinctes", "les NULL"], 1),
            qcm("Où filtrer « les filières de plus de 10 étudiants » ?", ["WHERE COUNT(*) > 10", "HAVING COUNT(*) > 10", "GROUP BY > 10", "ORDER BY 10"], 1),
            qcm("Quelle clause s'exécute en premier ?", ["SELECT", "WHERE", "FROM", "ORDER BY"], 2),
          ]),
        }),
        lesson({
          slug: "sql-contraintes",
          title: "Contraintes et modification de la structure",
          durationMinutes: 35,
          prerequisites: ["Fonctions d'agrégation"],
          objectives: ["Garantir la qualité des données avec les contraintes.", "Modifier une table avec ALTER TABLE.", "Comprendre les erreurs de contrainte."],
          content: r`
            ## Pourquoi des contraintes ?

            Une application peut avoir des bogues ; la base est la **dernière ligne de défense**. Les contraintes refusent les données incohérentes, quel que soit le programme qui les envoie.

            | Contrainte | Garantit que… |
            |---|---|
            | PRIMARY KEY | la valeur identifie la ligne (unique, non nulle) |
            | NOT NULL | la valeur est toujours renseignée |
            | UNIQUE | deux lignes n'ont jamais la même valeur (e-mail, matricule) |
            | CHECK (condition) | la condition est vraie (age >= 15, prix > 0) |
            | DEFAULT valeur | une valeur est mise si on n'en fournit pas |
            | FOREIGN KEY … REFERENCES | la valeur existe dans la table référencée |

            ~~~sql
            CREATE TABLE utilisateurs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL UNIQUE,
              role TEXT NOT NULL DEFAULT 'etudiant' CHECK (role IN ('etudiant', 'enseignant', 'administrateur')),
              cree_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            ~~~

            ## Quand une contrainte refuse

            L'instruction échoue avec un message (UNIQUE constraint failed, NOT NULL constraint failed, CHECK constraint failed…). Le laboratoire l'explique en français et indique la ligne.

            ## Clés étrangères dans SQLite

            Pour des raisons historiques, SQLite ne vérifie les clés étrangères que si **PRAGMA foreign_keys = ON;** est exécuté (c'est le cas dans le laboratoire). MySQL (moteur InnoDB) et PostgreSQL les vérifient toujours.

            ## ALTER TABLE

            ~~~sql
            ALTER TABLE etudiants ADD COLUMN email TEXT;
            ALTER TABLE etudiants RENAME COLUMN postnom TO post_nom;
            ~~~

            SQLite ne permet qu'une partie des modifications (ajouter, renommer, supprimer une colonne). MySQL et PostgreSQL permettent aussi de changer le type (ALTER COLUMN / MODIFY) ou d'ajouter une contrainte à une table existante.
          `,
          examples: [
            example(SQL, "Les contraintes en action", r`
              CREATE TABLE utilisateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL DEFAULT 'etudiant' CHECK (role IN ('etudiant', 'enseignant', 'administrateur'))
              );
              INSERT INTO utilisateurs (email) VALUES ('kito@upl.cd');
              INSERT INTO utilisateurs (email, role) VALUES ('prof@upl.cd', 'enseignant');
              ALTER TABLE utilisateurs ADD COLUMN telephone TEXT;
              SELECT * FROM utilisateurs;
              -- Essayez : INSERT INTO utilisateurs (email) VALUES ('kito@upl.cd');
            `),
          ],
          summary: ["Les contraintes protègent la base contre les données incohérentes.", "PRIMARY KEY, NOT NULL, UNIQUE, CHECK, DEFAULT, FOREIGN KEY.", "ALTER TABLE modifie la structure (possibilités variables selon le SGBD)."],
          quiz: quiz("sql-contraintes-quiz", "Vérification — Contraintes", [
            qcm("Quelle contrainte empêche deux comptes avec le même e-mail ?", ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"], 1),
            qcm("Quelle contrainte impose un prix positif ?", ["CHECK (prix > 0)", "UNIQUE (prix)", "DEFAULT 0", "NOT NULL"], 0),
            vraiFaux("SQLite vérifie toujours les clés étrangères, même sans PRAGMA.", false),
          ]),
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 3
    // =====================================================================
    {
      slug: "sql-relations",
      title: "Relations, jointures et intégrité",
      lessons: [
        lesson({
          slug: "sql-jointures",
          title: "Relations entre tables et jointures",
          level: "intermediaire",
          durationMinutes: 50,
          prerequisites: ["Contraintes (niveau 2)"],
          objectives: ["Reconnaître les relations 1-1, 1-n et n-n.", "Combiner des tables avec INNER JOIN et LEFT JOIN.", "Utiliser une table d'association."],
          content: r`
            ## Les trois types de relations

            | Relation | Exemple | Mise en œuvre |
            |---|---|---|
            | 1-1 | un étudiant ↔ une carte d'étudiant | clé étrangère UNIQUE dans l'une des tables |
            | 1-n | une filière → plusieurs étudiants | clé étrangère du côté « plusieurs » (etudiants.filiere_id) |
            | n-n | des étudiants ↔ des cours | **table d'association** (inscriptions) avec deux clés étrangères |

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

            RIGHT JOIN et FULL OUTER JOIN existent dans PostgreSQL et SQLite (depuis la version 3.39) ; MySQL n'a pas FULL OUTER JOIN.

            ## Jointure sur trois tables (n-n)

            ~~~sql
            SELECT e.nom, c.intitule, i.note
            FROM inscriptions i
            JOIN etudiants e ON e.id = i.etudiant_id
            JOIN cours c ON c.id = i.cours_id;
            ~~~

            ## Jointure et agrégats

            On combine librement : **moyenne par étudiant**, **nombre d'inscrits par cours**, **chiffre d'affaires par client**… avec GROUP BY après les JOIN.
          `,
          examples: [
            example(SQL, "Relevé de notes (jointure n-n)", r`
              SELECT e.nom, c.intitule, i.note
              FROM inscriptions i
              JOIN etudiants e ON e.id = i.etudiant_id
              JOIN cours c ON c.id = i.cours_id
              ORDER BY e.nom, c.intitule;

              -- Moyenne par étudiant, y compris ceux qui n'ont aucune note
              SELECT e.nom, ROUND(AVG(i.note), 2) AS moyenne, COUNT(i.cours_id) AS nb_cours
              FROM etudiants e
              LEFT JOIN inscriptions i ON i.etudiant_id = e.id
              GROUP BY e.id, e.nom
              ORDER BY e.nom;
            `, { stdin: UNIVERSITE }),
          ],
          summary: ["1-n : clé étrangère côté « plusieurs » ; n-n : table d'association.", "INNER JOIN : seulement les correspondances ; LEFT JOIN : toute la table de gauche.", "Alias de table (e, f) et condition ON clé étrangère = clé primaire."],
          quiz: quiz("sql-jointures-quiz", "Vérification — Jointures", [
            qcm("Comment représenter « des étudiants suivent des cours » (n-n) ?", ["Une colonne cours dans etudiants", "Une table d'association", "Une vue", "Un index"], 1),
            qcm("Quelle jointure garde les étudiants sans filière ?", ["INNER JOIN", "LEFT JOIN depuis etudiants", "CROSS JOIN", "Aucune"], 1),
            qcm("Dans une relation 1-n, où place-t-on la clé étrangère ?", ["Côté « 1 »", "Côté « plusieurs »", "Dans les deux tables", "Nulle part"], 1),
          ]),
        }),
        lesson({
          slug: "sql-sous-requetes-vues",
          title: "Sous-requêtes et vues",
          level: "intermediaire",
          durationMinutes: 40,
          prerequisites: ["Relations et jointures"],
          objectives: ["Écrire des sous-requêtes dans WHERE et dans SELECT.", "Utiliser IN, EXISTS et les sous-requêtes scalaires.", "Créer et interroger une vue."],
          content: r`
            ## Une requête dans une requête

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

            Une **vue** est une requête enregistrée sous un nom, que l'on interroge comme une table :

            ~~~sql
            CREATE VIEW releve AS
            SELECT e.nom, c.intitule, i.note FROM inscriptions i
            JOIN etudiants e ON e.id = i.etudiant_id
            JOIN cours c ON c.id = i.cours_id;

            SELECT * FROM releve WHERE note < 10;
            ~~~

            Avantages : simplifier les requêtes fréquentes, **masquer** des colonnes sensibles (on donne accès à la vue, pas à la table).
          `,
          examples: [
            example(SQL, "Sous-requêtes, WITH et vue", r`
              SELECT nom, age FROM etudiants WHERE age > (SELECT AVG(age) FROM etudiants);

              SELECT c.intitule FROM cours c
              WHERE NOT EXISTS (SELECT 1 FROM inscriptions i WHERE i.cours_id = c.id);

              WITH moyennes AS (
                SELECT etudiant_id, AVG(note) AS moyenne FROM inscriptions GROUP BY etudiant_id
              )
              SELECT e.nom, ROUND(m.moyenne, 2) AS moyenne
              FROM moyennes m JOIN etudiants e ON e.id = m.etudiant_id
              WHERE m.moyenne >= 12;

              CREATE VIEW releve AS
              SELECT e.nom, c.intitule, i.note FROM inscriptions i
              JOIN etudiants e ON e.id = i.etudiant_id JOIN cours c ON c.id = i.cours_id;
              SELECT * FROM releve WHERE note < 12 ORDER BY note;
            `, { stdin: UNIVERSITE }),
          ],
          summary: ["Une sous-requête est un SELECT entre parenthèses.", "IN, EXISTS / NOT EXISTS, sous-requête scalaire, table dérivée, WITH.", "Une vue est une requête nommée, interrogée comme une table."],
          quiz: quiz("sql-sous-requetes-quiz", "Vérification — Sous-requêtes et vues", [
            qcm("Que renvoie EXISTS (sous-requête) ?", ["Le nombre de lignes", "Vrai si au moins une ligne", "La première ligne", "NULL"], 1),
            qcm("Une vue stocke…", ["une copie des données", "une requête nommée", "un index", "une sauvegarde"], 1),
            vraiFaux("NOT IN se comporte mal si la sous-requête renvoie un NULL.", true),
          ]),
        }),
        lesson({
          slug: "sql-index-transactions",
          title: "Index et transactions",
          level: "intermediaire",
          durationMinutes: 40,
          prerequisites: ["Sous-requêtes et vues"],
          objectives: ["Accélérer les recherches avec des index.", "Lire un plan d'exécution.", "Garantir le « tout ou rien » avec les transactions (ACID)."],
          content: r`
            ## Les index

            Sans index, pour trouver **WHERE email = 'x'**, le SGBD lit **toute** la table. Un **index** est une structure triée (un arbre B) qui permet d'aller directement aux bonnes lignes, comme l'index d'un livre.

            ~~~sql
            CREATE INDEX idx_etudiants_nom ON etudiants (nom);
            CREATE UNIQUE INDEX idx_utilisateurs_email ON utilisateurs (email);
            ~~~

            - la clé primaire et les colonnes UNIQUE sont indexées automatiquement ;
            - on indexe les colonnes souvent utilisées dans **WHERE**, **JOIN** et **ORDER BY** (les clés étrangères en particulier) ;
            - un index **ralentit les écritures** et occupe de la place : on n'indexe pas tout.

            ## Voir le plan d'exécution

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

            Si une erreur survient au milieu, **ROLLBACK** remet la base dans l'état d'avant. MySQL et PostgreSQL écrivent **START TRANSACTION** ou **BEGIN**.

            ## Les propriétés ACID

            | Propriété | Signification |
            |---|---|
            | Atomicité | tout ou rien |
            | Cohérence | la base passe d'un état valide à un état valide (contraintes respectées) |
            | Isolation | les transactions simultanées ne se gênent pas |
            | Durabilité | une fois validées (COMMIT), les données survivent à une panne |
          `,
          examples: [
            example(SQL, "Index et plan d'exécution", r`
              EXPLAIN QUERY PLAN SELECT * FROM etudiants WHERE nom = 'Kito';
              CREATE INDEX idx_etudiants_nom ON etudiants (nom);
              EXPLAIN QUERY PLAN SELECT * FROM etudiants WHERE nom = 'Kito';
            `, { stdin: ETUDIANTS }),
            example(SQL, "Transaction annulée puis validée", r`
              CREATE TABLE comptes (id INTEGER PRIMARY KEY, titulaire TEXT, solde INTEGER CHECK (solde >= 0));
              INSERT INTO comptes VALUES (1, 'Kito', 100), (2, 'Mbuyi', 50);

              BEGIN;
              UPDATE comptes SET solde = solde + 30 WHERE id = 2;
              UPDATE comptes SET solde = solde - 30 WHERE id = 1;
              COMMIT;

              BEGIN;
              DELETE FROM comptes;
              ROLLBACK;

              SELECT * FROM comptes;
            `),
          ],
          summary: ["Un index accélère WHERE, JOIN et ORDER BY mais ralentit les écritures.", "EXPLAIN montre si un index est utilisé.", "BEGIN … COMMIT / ROLLBACK : tout ou rien (ACID)."],
          quiz: quiz("sql-index-quiz", "Vérification — Index et transactions", [
            qcm("Quelle colonne indexer en priorité ?", ["Une colonne jamais lue", "Une clé étrangère utilisée dans les jointures", "Toutes les colonnes", "Une colonne de commentaire"], 1),
            qcm("Que fait ROLLBACK ?", ["Valide", "Annule la transaction en cours", "Supprime la table", "Sauvegarde"], 1),
            qcm("Le « A » de ACID signifie…", ["Accès", "Atomicité", "Agrégat", "Authentification"], 1),
          ]),
        }),
        lesson({
          slug: "sql-normalisation",
          title: "Normalisation : 1NF, 2NF, 3NF",
          level: "intermediaire",
          durationMinutes: 40,
          prerequisites: ["Relations et jointures"],
          objectives: ["Repérer les redondances et les anomalies.", "Appliquer les trois premières formes normales.", "Découper une table mal conçue."],
          content: r`
            ## Le problème : la redondance

            Une table unique « inscriptions » contenant **nom_etudiant, telephone_etudiant, filiere, intitule_cours, credits, note** répète le téléphone à chaque cours suivi. Conséquences (**anomalies**) :

            - **modification** : changer le téléphone oblige à modifier plusieurs lignes (et on en oublie) ;
            - **insertion** : impossible d'enregistrer un cours tant que personne n'y est inscrit ;
            - **suppression** : supprimer la dernière inscription d'un cours efface les informations du cours.

            ## Dépendance fonctionnelle

            A → B (« A détermine B ») : connaissant A, on connaît B. Exemple : **matricule → nom**, **(matricule, code_cours) → note**.

            ## Première forme normale (1NF)

            Chaque colonne contient une **valeur atomique** (pas de liste « 12, 15, 9 » dans une case) et il n'y a pas de groupes de colonnes répétés (note1, note2, note3).

            ## Deuxième forme normale (2NF)

            1NF, et chaque colonne non clé dépend de **toute** la clé primaire (pas d'une partie). Dans inscriptions (matricule, code_cours, nom, note), **nom** ne dépend que de matricule : il part dans la table etudiants.

            ## Troisième forme normale (3NF)

            2NF, et aucune colonne non clé ne dépend d'une **autre colonne non clé**. Dans etudiants (matricule, nom, code_filiere, nom_filiere), **nom_filiere** dépend de code_filiere : il part dans la table filieres.

            ## Résultat

            ~~~text
            etudiants(id, nom, telephone, filiere_id → filieres.id)
            filieres(id, nom)
            cours(id, intitule, credits)
            inscriptions(etudiant_id → etudiants.id, cours_id → cours.id, note)
            ~~~

            Chaque information est stockée **une seule fois** ; les jointures la reconstituent. En pratique, on peut **dénormaliser** volontairement (copier une valeur) pour des raisons de performance, en connaissant le prix à payer.
          `,
          examples: [
            example(SQL, "Une table non normalisée et ses anomalies", r`
              CREATE TABLE inscriptions_brutes (etudiant TEXT, telephone TEXT, cours TEXT, credits INTEGER, note REAL);
              INSERT INTO inscriptions_brutes VALUES
                ('Kito', '0810000001', 'Algorithmique', 5, 15),
                ('Kito', '0810000001', 'Bases de données', 4, 17),
                ('Mbuyi', '0990000002', 'Algorithmique', 5, 12);

              -- Anomalie de modification : le téléphone est répété
              UPDATE inscriptions_brutes SET telephone = '0820000009' WHERE etudiant = 'Kito' AND cours = 'Algorithmique';
              SELECT DISTINCT etudiant, telephone FROM inscriptions_brutes;
            `),
          ],
          summary: ["Redondance ⇒ anomalies de modification, d'insertion et de suppression.", "1NF : valeurs atomiques ; 2NF : dépend de toute la clé ; 3NF : pas de dépendance entre colonnes non clés.", "On découpe en tables reliées par des clés étrangères."],
          quiz: quiz("sql-normalisation-quiz", "Vérification — Normalisation", [
            qcm("Une colonne notes = '12, 15, 9' viole…", ["la 1NF", "la 2NF", "la 3NF", "aucune"], 0),
            qcm("nom_filiere dépend de code_filiere (non clé) : quelle forme est violée ?", ["1NF", "2NF", "3NF"], 2),
            qcm("Quel est le but principal de la normalisation ?", ["Accélérer toutes les requêtes", "Éviter la redondance et les anomalies", "Chiffrer les données", "Réduire le nombre de tables"], 1),
          ]),
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 4
    // =====================================================================
    {
      slug: "sql-professionnel",
      title: "Conception et administration professionnelles",
      lessons: [
        lesson({
          slug: "sql-conception-merise",
          title: "Conception avec MERISE et diagrammes entité-association",
          level: "avance",
          durationMinutes: 50,
          prerequisites: ["Normalisation"],
          objectives: ["Construire un MCD à partir d'un cahier des charges.", "Lire les cardinalités.", "Traduire un MCD en modèle logique puis en tables."],
          content: r`
            ## La démarche MERISE

            **MERISE** est une méthode française de conception, très enseignée en Afrique francophone. Elle sépare trois niveaux :

            1. **MCD** (modèle conceptuel des données) : les **entités**, leurs **propriétés** et les **associations**, sans se soucier de la technique ;
            2. **MLD** (modèle logique) : les **tables**, clés primaires et étrangères ;
            3. **MPD** (modèle physique) : le script SQL pour un SGBD précis (types, index).

            Les méthodes anglo-saxonnes utilisent le **diagramme entité-association** (ER) ou UML : les idées sont les mêmes.

            ## Entités et associations

            - **Entité** : un objet du domaine (ÉTUDIANT, COURS, FILIÈRE) avec un **identifiant** (souligné) ;
            - **Association** : un lien entre entités, nommé par un verbe (ÉTUDIANT **suit** COURS) ; elle peut porter des propriétés (la **note** appartient à « suit »).

            ## Cardinalités

            Pour chaque entité dans une association : (minimum, maximum) d'occurrences.

            ~~~text
            FILIÈRE (0,n) ── appartenir ── (1,1) ÉTUDIANT
            ÉTUDIANT (0,n) ── suivre [note] ── (0,n) COURS
            ~~~

            Lecture : un étudiant appartient à **exactement une** filière (1,1) ; une filière a **0 à n** étudiants ; un étudiant suit 0 à n cours, et un cours est suivi par 0 à n étudiants.

            ## Règles de passage au modèle logique

            | Cas | Traduction |
            |---|---|
            | entité | table ; l'identifiant devient la clé primaire |
            | association (1,1)–(x,n) | clé étrangère dans la table du côté (1,1) |
            | association (x,n)–(x,n) | nouvelle table avec les deux clés étrangères (clé primaire composée) et les propriétés de l'association |
            | association (0,1)–(1,1) | clé étrangère UNIQUE |

            ## Méthode professionnelle

            1. lire le cahier des charges et souligner les **noms** (entités, propriétés) et les **verbes** (associations) ;
            2. dessiner le MCD et valider les cardinalités avec le client (« un médicament peut-il avoir plusieurs fournisseurs ? ») ;
            3. traduire en MLD, vérifier la **3NF** ;
            4. écrire le script (MPD) avec contraintes et index ;
            5. tester avec des données réalistes et les requêtes attendues.

            Le laboratoire affiche la **structure** de votre base (onglet Structure) : tables, colonnes, clés primaires 🔑 et clés étrangères →.
          `,
          examples: [
            example(SQL, "Du MCD pharmacie au script SQL", r`
              PRAGMA foreign_keys = ON;
              -- FOURNISSEUR (1,n) ── fournir ── (1,n) MÉDICAMENT ; CLIENT (0,n) ── acheter [quantité, date] ── (0,n) MÉDICAMENT
              CREATE TABLE fournisseurs (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL UNIQUE);
              CREATE TABLE medicaments (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prix REAL NOT NULL CHECK (prix > 0), stock INTEGER NOT NULL DEFAULT 0);
              CREATE TABLE fournir (fournisseur_id INTEGER REFERENCES fournisseurs (id), medicament_id INTEGER REFERENCES medicaments (id), PRIMARY KEY (fournisseur_id, medicament_id));
              CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL);
              CREATE TABLE ventes (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER REFERENCES clients (id), medicament_id INTEGER NOT NULL REFERENCES medicaments (id), quantite INTEGER NOT NULL CHECK (quantite > 0), date_vente TEXT NOT NULL DEFAULT CURRENT_DATE);
              CREATE INDEX idx_ventes_medicament ON ventes (medicament_id);

              INSERT INTO fournisseurs (nom) VALUES ('PharmaKin'), ('MedCongo');
              INSERT INTO medicaments (nom, prix, stock) VALUES ('Paracétamol', 2.5, 100), ('Amoxicilline', 6, 40);
              INSERT INTO fournir VALUES (1, 1), (2, 1), (2, 2);
              INSERT INTO clients (nom) VALUES ('Kito');
              INSERT INTO ventes (client_id, medicament_id, quantite) VALUES (1, 1, 2), (1, 2, 1);

              SELECT m.nom, COUNT(f.fournisseur_id) AS nb_fournisseurs
              FROM medicaments m LEFT JOIN fournir f ON f.medicament_id = m.id
              GROUP BY m.id, m.nom;
            `),
          ],
          summary: ["MCD (entités, associations, cardinalités) → MLD (tables, clés) → MPD (script SQL).", "Association (1,1)–(x,n) : clé étrangère ; (x,n)–(x,n) : table d'association.", "Valider les cardinalités avec le client, puis vérifier la 3NF."],
          quiz: quiz("sql-merise-quiz", "Vérification — MERISE", [
            qcm("Que représente un MCD ?", ["Le script SQL", "Les entités, associations et cardinalités", "Les index", "Les utilisateurs"], 1),
            qcm("Une association (0,n)–(0,n) devient…", ["une clé étrangère", "une table d'association", "une vue", "un index"], 1),
            qcm("Cardinalité (1,1) côté ÉTUDIANT pour « appartenir à une filière » signifie…", ["0 ou 1 filière", "exactement une filière", "plusieurs filières", "aucune"], 1),
          ]),
        }),
        lesson({
          slug: "sql-administration",
          title: "Déclencheurs, procédures, sécurité, sauvegarde et performances",
          level: "avance",
          durationMinutes: 50,
          prerequisites: ["Conception avec MERISE"],
          objectives: ["Automatiser des règles avec des déclencheurs.", "Connaître procédures et fonctions stockées selon le SGBD.", "Gérer utilisateurs, droits et sauvegardes.", "Diagnostiquer les problèmes de performance."],
          content: r`
            ## Les déclencheurs (triggers)

            Un **déclencheur** exécute automatiquement des instructions **avant** ou **après** un INSERT, UPDATE ou DELETE : journal des modifications, mise à jour d'un stock, refus d'une opération.

            ~~~sql
            CREATE TRIGGER maj_stock AFTER INSERT ON ventes
            BEGIN
              UPDATE medicaments SET stock = stock - NEW.quantite WHERE id = NEW.medicament_id;
            END;
            ~~~

            **NEW** désigne la ligne insérée (ou la nouvelle version) et **OLD** l'ancienne. Syntaxe ci-dessus : SQLite ; MySQL ajoute FOR EACH ROW ; PostgreSQL appelle une **fonction** (CREATE FUNCTION … RETURNS trigger, puis CREATE TRIGGER … EXECUTE FUNCTION).

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

            MySQL et PostgreSQL gèrent des **comptes** avec des **droits** précis (SQLite n'en a pas : la sécurité dépend des droits sur le fichier) :

            ~~~sql
            CREATE USER 'app_upl'@'localhost' IDENTIFIED BY '…';         -- MySQL
            GRANT SELECT, INSERT, UPDATE ON universite.* TO 'app_upl'@'localhost';
            REVOKE DELETE ON universite.* FROM 'app_upl'@'localhost';
            ~~~

            Principe du **moindre privilège** : l'application n'a que les droits nécessaires ; jamais le compte administrateur (root, postgres) dans le code.

            ## Sauvegarde et restauration

            - MySQL : **mysqldump universite > sauvegarde.sql** ; PostgreSQL : **pg_dump** / **pg_restore** ; SQLite : copie du fichier ou commande **.backup** ;
            - sauvegardes **automatiques**, **régulières**, conservées **ailleurs** que le serveur, et **testées** (une sauvegarde jamais restaurée n'est pas une sauvegarde).

            ## Performances

            Méthode : mesurer (journal des requêtes lentes, EXPLAIN ANALYZE), puis agir : index adaptés, éviter SELECT * et les requêtes répétées dans une boucle (problème « N+1 »), paginer avec LIMIT, archiver les données anciennes.

            ## Réplication et haute disponibilité

            Une ou plusieurs **répliques** reçoivent en continu les modifications du serveur principal : lecture répartie, et bascule en cas de panne. MySQL (réplication par journal binaire, Group Replication) et PostgreSQL (réplication en continu) le proposent ; c'est un sujet d'administration système, hors du laboratoire.
          `,
          examples: [
            example(SQL, "Déclencheurs : stock et journal", r`
              CREATE TABLE medicaments (id INTEGER PRIMARY KEY, nom TEXT NOT NULL, stock INTEGER NOT NULL CHECK (stock >= 0));
              CREATE TABLE ventes (id INTEGER PRIMARY KEY AUTOINCREMENT, medicament_id INTEGER NOT NULL REFERENCES medicaments (id), quantite INTEGER NOT NULL);
              CREATE TABLE journal (quand TEXT DEFAULT CURRENT_TIMESTAMP, message TEXT);

              CREATE TRIGGER maj_stock AFTER INSERT ON ventes
              BEGIN
                UPDATE medicaments SET stock = stock - NEW.quantite WHERE id = NEW.medicament_id;
                INSERT INTO journal (message) VALUES ('Vente de ' || NEW.quantite || ' unité(s) du médicament ' || NEW.medicament_id);
              END;

              INSERT INTO medicaments VALUES (1, 'Paracétamol', 10);
              INSERT INTO ventes (medicament_id, quantite) VALUES (1, 3);
              INSERT INTO ventes (medicament_id, quantite) VALUES (1, 2);
              SELECT nom, stock FROM medicaments;
              SELECT message FROM journal;
            `),
          ],
          summary: ["Un déclencheur agit automatiquement avant/après INSERT, UPDATE, DELETE (NEW / OLD).", "Procédures stockées : MySQL et PostgreSQL, pas SQLite.", "GRANT / REVOKE et moindre privilège ; sauvegardes automatiques et testées.", "Mesurer (EXPLAIN ANALYZE) avant d'optimiser."],
          quiz: quiz("sql-administration-quiz", "Vérification — Administration", [
            qcm("Dans un déclencheur AFTER INSERT, NEW désigne…", ["l'ancienne ligne", "la ligne insérée", "la table", "l'utilisateur"], 1),
            qcm("Quelle instruction donne un droit à un utilisateur ?", ["ALLOW", "GRANT", "PERMIT", "SET ROLE"], 1),
            qcm("Quel outil sauvegarde une base PostgreSQL ?", ["mysqldump", "pg_dump", "sqlite3 .dump uniquement", "cp"], 1),
            vraiFaux("SQLite permet de créer des procédures stockées avec CREATE PROCEDURE.", false),
          ]),
        }),
      ],
    },
  ],
  finalQuiz: quiz("sql-evaluation-finale", "Évaluation finale — SQL", [
    qcm("Quelle instruction lit des données ?", ["INSERT", "SELECT", "UPDATE", "CREATE"], 1),
    qcm("Comment tester une valeur inconnue ?", ["= NULL", "IS NULL", "== NULL", "NULL()"], 1),
    qcm("Où filtrer après un GROUP BY ?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 1),
    qcm("Quelle jointure garde toutes les lignes de la table de gauche ?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], 1),
    qcm("Une relation n-n se traduit par…", ["une table d'association", "une colonne liste", "un index", "une vue"], 0),
    qcm("Que garantit une transaction ?", ["La vitesse", "Le tout ou rien", "Le chiffrement", "La sauvegarde"], 1),
    qcm("Quelle forme normale interdit les dépendances entre colonnes non clés ?", ["1NF", "2NF", "3NF"], 2),
    vraiFaux("SQLite, MySQL et PostgreSQL ont exactement la même syntaxe pour la numérotation automatique.", false),
  ]),
};
