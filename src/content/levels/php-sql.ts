import { qcm, vraiFaux } from "../helpers";
import { levelExam, placement, type LevelPlan } from "./build";

// =====================================================================
// PHP — du débutant au professionnel
// =====================================================================
export const phpLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : premières pages dynamiques",
    description: "Comprendre le rôle de PHP côté serveur et écrire ses premiers scripts : echo, variables, types, constantes, opérateurs, concaténation et premières conditions. Projet : une page personnalisée.",
    objectives: ["Expliquer le fonctionnement client / serveur.", "Écrire et exécuter un script PHP.", "Manipuler variables, types, constantes et opérateurs.", "Produire une page HTML qui change selon les données."],
    modules: [{ slug: "php-premiers-pas", title: "Premiers pas en PHP", lessons: ["php-introduction", "php-variables-types", "php-operateurs", "php-conditions-simples"] }],
    exam: levelExam("php-examen-niveau-1", "Examen du niveau 1 — Premiers pas en PHP", [
      qcm("Que reçoit le navigateur quand il demande une page PHP ?", ["Le code PHP", "Le HTML produit par PHP", "Un fichier binaire", "Le code et le HTML"], 1),
      qcm("Quel symbole commence le nom d'une variable ?", ["@", "#", "$", "&"], 2),
      qcm("Qu'affiche echo \"Total : \" . 2 + 3; en PHP 8 ?", ["Total : 5", "Total : 23", "une erreur", "5"], 0, "En PHP 8, + et - sont prioritaires sur le point : 2 + 3 est calculé d'abord."),
      qcm("Que vaut 7 % 3 ?", ["2", "1", "2.33", "0"], 1),
      qcm("Que vaut \"7\" === 7 ?", ["true", "false"], 1),
      qcm("Comment déclarer une constante ?", ["$TAUX = 0.16;", "const TAUX = 0.16;", "constant TAUX 0.16;", "let TAUX = 0.16;"], 1),
      qcm("Quelle forme affiche une valeur au milieu du HTML ?", ["<? echo ?>", "<?= $valeur ?>", "{{ $valeur }}", "<%= valeur %>"], 1),
      vraiFaux("Une donnée saisie au clavier ou dans un formulaire arrive sous forme de chaîne.", true),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : programmes et formulaires",
    description: "Structures de contrôle, tableaux, fonctions, chaînes et dates, puis le web : formulaires GET/POST, validation, sécurité de l'affichage, sessions, cookies et inclusion de fichiers. Projets : inscription, calculatrice, gestion de notes.",
    objectives: ["Choisir la bonne structure de contrôle.", "Organiser les données en tableaux associatifs.", "Écrire des fonctions réutilisables.", "Traiter un formulaire de façon sûre et conserver un état avec les sessions."],
    modules: [
      { slug: "php-controle-donnees", title: "Structures de contrôle, tableaux et fonctions", lessons: ["php-conditions-switch-match", "php-boucles", "php-tableaux", "php-fonctions-chaines-dates"] },
      { slug: "php-web", title: "PHP et le web : formulaires et sessions", lessons: ["php-formulaires", "php-sessions-cookies-include"] },
    ],
    plannedChapters: ["Projet guidé : formulaire de connexion complet (pages, session, déconnexion)", "Projet guidé : formulaire de contact avec validation et message de confirmation"],
    exam: levelExam("php-examen-niveau-2", "Examen du niveau 2 — Programmes et formulaires", [
      qcm("Que se passe-t-il sans break dans un case de switch ?", ["Erreur", "L'exécution continue dans le cas suivant", "Le switch s'arrête", "Rien"], 1),
      qcm("Quelle boucle pour parcourir un tableau associatif ?", ["for", "foreach ($t as $cle => $valeur)", "while", "do…while"], 1),
      qcm("Que renvoie count([3, 5, 8]) ?", ["8", "3", "16", "2"], 1),
      qcm("Quelle fonction découpe une chaîne en tableau ?", ["implode", "explode", "split", "substr"], 1),
      qcm("Une variable créée dans une fonction est visible…", ["partout", "dans la fonction seulement", "dans les fichiers inclus", "dans la session"], 1),
      qcm("Quel tableau contient les champs d'un formulaire method=\"post\" ?", ["$_GET", "$_POST", "$_FORM", "$_REQUEST_POST"], 1),
      qcm("Avant d'afficher une saisie dans une page, on utilise…", ["htmlspecialchars", "trim", "intval", "json_encode"], 0),
      qcm("Où sont conservées les données de $_SESSION ?", ["Dans le navigateur", "Sur le serveur", "Dans l'URL", "Dans le cache"], 1),
      qcm("Quelle instruction arrête le script si le fichier inclus est absent ?", ["include", "require", "use", "import"], 1),
    ]),
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : objets, données et API",
    description: "Programmation orientée objet (classes, encapsulation, héritage, polymorphisme, interfaces, traits, namespaces), exceptions, base de données avec PDO, JSON et API REST.",
    objectives: ["Modéliser un domaine avec des classes.", "Gérer les erreurs avec des exceptions.", "Accéder à une base de données de façon sûre avec PDO.", "Produire et consommer du JSON dans une API REST."],
    modules: [
      { slug: "php-objet", title: "Programmation orientée objet", lessons: ["php-classes-objets", "php-heritage-interfaces", "php-exceptions"] },
      { slug: "php-donnees-api", title: "Bases de données avec PDO, JSON et API", lessons: ["php-pdo", "php-json-api"] },
    ],
    plannedChapters: [
      "Fichiers : lecture, écriture et téléversement sécurisé",
      "Architecture MVC appliquée à un projet",
      "Composer et autoloading (PSR-4)",
      "Projets : gestion des étudiants, authentification, gestion des produits et des articles, tableau de bord administrateur",
    ],
    exam: levelExam("php-examen-niveau-3", "Examen du niveau 3 — Objets, données et API", [
      qcm("Quel mot-clé crée un objet ?", ["class", "new", "object", "create"], 1),
      qcm("Quelle visibilité réserve une propriété à la classe ?", ["public", "protected", "private", "final"], 2),
      qcm("Que permet une interface ?", ["Hériter du code", "Définir un contrat de méthodes", "Créer des variables globales", "Se connecter à la base"], 1),
      qcm("Quel bloc s'exécute toujours, exception ou non ?", ["catch", "finally", "try", "throw"], 1),
      qcm("Que protège une requête préparée ?", ["Le XSS", "L'injection SQL", "Le CSRF", "La force brute"], 1),
      qcm("Que fait $pdo->rollBack() ?", ["Valide", "Annule la transaction", "Ferme la connexion", "Rejoue la requête"], 1),
      qcm("Quel code HTTP pour « ressource introuvable » ?", ["200", "201", "404", "500"], 2),
      qcm("Que renvoie json_decode sur un JSON invalide (sans option) ?", ["false", "null", "une exception", "\"\""], 1),
    ]),
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : sécurité, architecture et mise en production",
    description: "Sécurité d'une application (mots de passe, XSS, injection SQL, CSRF, sessions, fichiers), architecture professionnelle (MVC, routeur, middlewares, injection de dépendances), tests automatisés, Composer, Laravel et déploiement.",
    objectives: ["Sécuriser une application PHP de bout en bout.", "Concevoir une architecture maintenable.", "Tester automatiquement son code.", "Préparer un déploiement et la maintenance."],
    modules: [{ slug: "php-professionnel", title: "PHP professionnel : sécurité, architecture et tests", lessons: ["php-securite", "php-architecture-tests"] }],
    plannedChapters: [
      "PHP moderne : enums, readonly, attributs, types avancés",
      "API sécurisées : authentification par jeton, rôles et permissions",
      "Tests unitaires et d'intégration avec PHPUnit",
      "Introduction à Laravel (routes, Eloquent, Blade, migrations)",
      "Optimisation : cache, OPcache, requêtes et profilage",
      "Déploiement et maintenance d'une application PHP",
      "Projet final : application web complète (authentification, rôles, CRUD, API, tests)",
    ],
    exam: levelExam("php-examen-niveau-4", "Examen du niveau 4 — PHP professionnel", [
      qcm("Quelle fonction pour stocker un mot de passe ?", ["md5", "sha1", "password_hash", "base64_encode"], 2),
      qcm("Contre quelle attaque protège un jeton caché dans chaque formulaire ?", ["XSS", "CSRF", "Injection SQL", "DDoS"], 1),
      qcm("Que faire juste après une connexion réussie ?", ["session_destroy()", "session_regenerate_id(true)", "setcookie(\"mdp\", …)", "rien"], 1),
      qcm("Quel dossier doit être le seul accessible depuis le web ?", ["src/", "vendor/", "public/", "config/"], 2),
      qcm("Qu'est-ce qu'un middleware ?", ["Une vue", "Une couche traversée par la requête avant le contrôleur", "Une table SQL", "Un fichier CSS"], 1),
      qcm("Quel outil standard pour les tests unitaires en PHP ?", ["Jest", "PHPUnit", "pytest", "JUnit"], 1),
      vraiFaux("Les mots de passe de la base de données doivent être écrits dans le code source versionné.", false),
    ]),
  },
];

export const phpPlacement = placement("php-positionnement", "Test de positionnement — PHP", {
  1: [
    qcm("Où s'exécute PHP ?", ["Dans le navigateur", "Sur le serveur", "Dans la base", "Nulle part"], 1),
    qcm("Quel opérateur concatène des chaînes ?", ["+", ".", "&", "concat"], 1),
    qcm("Que vaut 17 % 5 ?", ["3", "2", "3.4", "12"], 1),
  ],
  2: [
    qcm("Comment parcourir clés et valeurs d'un tableau ?", ["for ($t)", "foreach ($t as $k => $v)", "while ($t)", "each($t)"], 1),
    qcm("Que contient $_POST ?", ["Les cookies", "Les champs d'un formulaire envoyé en POST", "La session", "Les fichiers"], 1),
    qcm("Quelle fonction protège l'affichage contre le XSS ?", ["htmlspecialchars", "trim", "strlen", "md5"], 0),
  ],
  3: [
    qcm("Que désigne $this ?", ["La classe mère", "L'objet courant", "Le fichier", "La session"], 1),
    qcm("Quel mécanisme empêche l'injection SQL avec PDO ?", ["Les requêtes préparées", "Les exceptions", "Les sessions", "Les transactions"], 0),
    qcm("Quel mot-clé lève une exception ?", ["catch", "throw", "raise", "error"], 1),
  ],
  4: [
    qcm("Quelle protection contre le CSRF ?", ["htmlspecialchars", "Un jeton aléatoire vérifié à chaque POST", "md5", "Un captcha seulement"], 1),
    qcm("Dans MVC, quelle couche contient les gabarits HTML ?", ["Modèle", "Vue", "Contrôleur", "Routeur"], 1),
    qcm("Quel outil gère les dépendances PHP ?", ["Composer", "npm", "pip", "apt"], 0),
  ],
});

// =====================================================================
// SQL — maîtriser les bases de données (moteur du laboratoire : SQLite)
// =====================================================================
export const sqlLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : premières tables",
    description: "Bases de données, tables, colonnes, lignes, clés primaires et étrangères ; MySQL, MariaDB, PostgreSQL et SQLite ; CREATE, INSERT, SELECT, UPDATE, DELETE.",
    objectives: ["Expliquer le modèle relationnel.", "Créer et remplir une table.", "Lire, modifier et supprimer des lignes sans risque."],
    modules: [{ slug: "sql-fondements", title: "Les fondements des bases de données", lessons: ["sql-introduction", "sql-create-insert", "sql-select", "sql-update-delete"] }],
    exam: levelExam("sql-examen-niveau-1", "Examen du niveau 1 — Fondements SQL", [
      qcm("Quel est le rôle de la clé primaire ?", ["Relier deux tables", "Identifier chaque ligne de façon unique", "Trier", "Chiffrer"], 1),
      qcm("Quelle instruction crée une table ?", ["NEW TABLE", "CREATE TABLE", "MAKE TABLE", "INSERT TABLE"], 1),
      qcm("Comment écrire un texte en SQL ?", ["\"texte\"", "'texte'", "texte", "(texte)"], 1),
      qcm("Comment tester une valeur inconnue ?", ["= NULL", "IS NULL", "== NULL", "EMPTY"], 1),
      qcm("Que fait DELETE FROM etudiants; sans WHERE ?", ["Rien", "Supprime toutes les lignes", "Supprime la table", "Erreur"], 1),
      qcm("Numérotation automatique en MySQL ?", ["AUTOINCREMENT", "AUTO_INCREMENT", "SERIAL", "IDENTITY"], 1),
      vraiFaux("SQLite est identique à MySQL.", false),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : requêtes et agrégats",
    description: "WHERE avancé (AND, OR, NOT, BETWEEN, LIKE, IN), DISTINCT, ORDER BY, LIMIT, fonctions d'agrégation, GROUP BY, HAVING, contraintes et ALTER TABLE.",
    objectives: ["Écrire des filtres précis.", "Trier et paginer.", "Calculer des statistiques par groupe.", "Protéger la qualité des données avec les contraintes."],
    modules: [{ slug: "sql-requetes", title: "Requêtes, agrégats et contraintes", lessons: ["sql-filtres-tris", "sql-agregats", "sql-contraintes"] }],
    plannedChapters: ["Projets guidés : gestion d'une école, des notes, des utilisateurs et des produits"],
    exam: levelExam("sql-examen-niveau-2", "Examen du niveau 2 — Requêtes et agrégats", [
      qcm("BETWEEN 18 AND 20 inclut-il 20 ?", ["Oui", "Non"], 0),
      qcm("Motif des noms commençant par K ?", ["LIKE 'K%'", "LIKE '%K'", "= 'K*'", "LIKE 'K_'"], 0),
      qcm("Où filtrer les groupes ?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 1),
      qcm("COUNT(colonne) ignore…", ["les doublons", "les NULL", "les zéros", "rien"], 1),
      qcm("Quelle contrainte impose une valeur unique ?", ["CHECK", "UNIQUE", "DEFAULT", "NOT NULL"], 1),
      qcm("Trier du plus grand au plus petit ?", ["ASC", "DESC", "DOWN", "REVERSE"], 1),
    ]),
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : relations et intégrité",
    description: "Relations 1-1, 1-n, n-n, jointures, sous-requêtes, vues, index, transactions et normalisation (1NF à 3NF).",
    objectives: ["Relier les tables par des clés étrangères.", "Écrire des jointures et des sous-requêtes.", "Utiliser index et transactions.", "Normaliser une base."],
    modules: [{ slug: "sql-relations", title: "Relations, jointures et intégrité", lessons: ["sql-jointures", "sql-sous-requetes-vues", "sql-index-transactions", "sql-normalisation"] }],
    plannedChapters: ["Projets : université, pharmacie, ventes, employés, commandes"],
    exam: levelExam("sql-examen-niveau-3", "Examen du niveau 3 — Relations", [
      qcm("Une relation n-n se traduit par…", ["une table d'association", "une colonne", "un index", "une vue"], 0),
      qcm("Quelle jointure garde toute la table de gauche ?", ["INNER", "LEFT", "CROSS", "NATURAL"], 1),
      qcm("Que fait ROLLBACK ?", ["Valide", "Annule la transaction", "Sauvegarde", "Supprime"], 1),
      qcm("Une colonne contenant une liste viole…", ["1NF", "2NF", "3NF"], 0),
      qcm("Une vue est…", ["une copie", "une requête nommée", "un index", "un utilisateur"], 1),
      qcm("Un index accélère…", ["les écritures", "les recherches", "les sauvegardes", "rien"], 1),
    ]),
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : conception et administration",
    description: "MERISE et diagrammes entité-association, conception professionnelle, déclencheurs, procédures et fonctions, sécurité, utilisateurs et permissions, sauvegardes, performances, réplication.",
    objectives: ["Concevoir une base à partir d'un cahier des charges.", "Automatiser des règles avec des déclencheurs.", "Administrer droits et sauvegardes.", "Diagnostiquer les performances."],
    modules: [{ slug: "sql-professionnel", title: "Conception et administration professionnelles", lessons: ["sql-conception-merise", "sql-administration"] }],
    plannedChapters: ["Procédures et fonctions stockées (MySQL, PostgreSQL)", "Optimisation avancée et plans d'exécution", "Sauvegarde et restauration en pratique", "Réplication et haute disponibilité", "Projet final : base de données complète d'un établissement"],
    exam: levelExam("sql-examen-niveau-4", "Examen du niveau 4 — Professionnel", [
      qcm("Que représente un MCD ?", ["Le script SQL", "Entités, associations, cardinalités", "Les index", "Les droits"], 1),
      qcm("Dans un trigger AFTER INSERT, NEW désigne…", ["l'ancienne ligne", "la ligne insérée", "la table", "l'utilisateur"], 1),
      qcm("Quelle instruction donne un droit ?", ["GRANT", "ALLOW", "PERMIT", "OPEN"], 0),
      qcm("Outil de sauvegarde PostgreSQL ?", ["mysqldump", "pg_dump", "cp", "zip"], 1),
      vraiFaux("SQLite gère les procédures stockées.", false),
      qcm("Principe pour les comptes d'application ?", ["Administrateur partout", "Moindre privilège", "Mot de passe vide", "Compte partagé"], 1),
    ]),
  },
];

export const sqlPlacement = placement("sql-positionnement", "Test de positionnement — SQL", {
  1: [qcm("Quelle instruction lit des données ?", ["INSERT", "SELECT", "UPDATE", "DROP"], 1), qcm("Une clé primaire est…", ["unique", "facultative", "toujours un texte", "une table"], 0)],
  2: [qcm("Où filtrer après GROUP BY ?", ["WHERE", "HAVING"], 1), qcm("Que fait DISTINCT ?", ["Trie", "Supprime les doublons", "Compte", "Filtre NULL"], 1)],
  3: [qcm("Jointure gardant toute la table de gauche ?", ["INNER", "LEFT"], 1), qcm("Que garantit une transaction ?", ["Vitesse", "Tout ou rien"], 1)],
  4: [qcm("Association (0,n)–(0,n) en MLD ?", ["Clé étrangère", "Table d'association"], 1), qcm("Commande pour donner un droit ?", ["GRANT", "SET"], 0)],
});
