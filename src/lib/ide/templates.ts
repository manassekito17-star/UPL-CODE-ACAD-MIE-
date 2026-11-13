import type { ProjectFile } from "./fs";

/**
 * Modèles de projet réellement exécutables ou prévisualisables par la
 * plateforme. Les modèles React / Next.js / Node.js demandent un
 * environnement d'exécution isolé (UPL Studio, phase 8) : ils ne sont pas
 * proposés tant que cet environnement n'existe pas.
 */
export interface ProjectTemplate {
  id: string;
  label: string;
  description: string;
  files: ProjectFile[];
  folders?: string[];
  /** Fichier ouvert à la création. */
  open: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "web",
    label: "Site web (HTML, CSS, JavaScript)",
    description: "Page HTML reliée à une feuille de style et à un script, avec aperçu en direct.",
    open: "index.html",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon site</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <h1>Mon site</h1>
  </header>
  <main>
    <p>Modifiez les fichiers : l'aperçu se met à jour.</p>
    <button id="bouton">Cliquez-moi</button>
  </main>
  <script src="js/script.js"></script>
</body>
</html>
`,
      },
      { path: "css/style.css", content: "body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n  color: #0a1a3a;\n}\n\nh1 {\n  color: #1d5fe0;\n}\n" },
      { path: "js/script.js", content: 'document.getElementById("bouton").addEventListener("click", () => {\n  console.log("Bouton cliqué !");\n});\n' },
    ],
  },
  {
    id: "python",
    label: "Python",
    description: "Programme principal et un module importé.",
    open: "main.py",
    files: [
      { path: "main.py", content: 'from outils import saluer\n\nnom = input("Votre nom : ")\nprint(saluer(nom))\n' },
      { path: "outils.py", content: 'def saluer(nom):\n    return f"Bonjour, {nom} !"\n' },
    ],
  },
  {
    id: "algorithmique",
    label: "Algorithmique (pseudocode)",
    description: "Algorithme exécuté par l'interpréteur de la plateforme.",
    open: "main.algo",
    files: [{ path: "main.algo", content: 'ALGORITHME Bonjour\nVARIABLES\n  nom : CHAINE\nDEBUT\n  ECRIRE("Votre nom ?")\n  LIRE(nom)\n  ECRIRE("Bonjour, ", nom)\nFIN\n' }],
  },
  {
    id: "kplus",
    label: "K+ (programmation en français)",
    description: "Programme K+ exécuté dans le navigateur par le moteur K+.",
    open: "main.kplus",
    files: [
      {
        path: "main.kplus",
        content:
          '# Programme K+ : le langage de programmation en français\n\nvariable nom = demander("Votre nom ? ")\nafficher("Bonjour", nom)\n\nfonction carre(x)\n    retourner x * x\nfin\n\npour i de 1 à 5 faire\n    afficher(i, "au carré =", carre(i))\nfin\n',
      },
    ],
  },
  {
    id: "javascript",
    label: "JavaScript (console)",
    description: "Programme JavaScript exécuté en console.",
    open: "main.js",
    files: [{ path: "main.js", content: 'const nombres = [3, 1, 4, 1, 5];\nconst somme = nombres.reduce((a, b) => a + b, 0);\nconsole.log("Somme :", somme);\n' }],
  },
  {
    id: "c",
    label: "Langage C",
    description: "Programme C (compilé par le service d'exécution).",
    open: "main.c",
    files: [{ path: "main.c", content: '#include <stdio.h>\n\nint main(void) {\n    printf("Bonjour depuis C !\\n");\n    return 0;\n}\n' }],
  },
  {
    id: "java",
    label: "Java",
    description: "Classe Main (compilée par le service d'exécution).",
    open: "Main.java",
    files: [{ path: "Main.java", content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Bonjour depuis Java !");\n    }\n}\n' }],
  },
  {
    id: "php",
    label: "Site PHP (pages, includes, PDO SQLite)",
    description: "Vrai PHP 8.3 exécuté dans le navigateur (WebAssembly) : index.php, configuration, fonctions, base SQLite avec PDO et aperçu de la page générée.",
    open: "index.php",
    folders: ["includes", "css"],
    files: [
      {
        path: "index.php",
        content: `<?php
declare(strict_types=1);

require __DIR__ . "/includes/config.php";
require __DIR__ . "/includes/functions.php";
require __DIR__ . "/includes/database.php";

$pdo = connexion();
$etudiants = $pdo->query("SELECT nom, filiere FROM etudiants ORDER BY nom")->fetchAll();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title><?= e(APP_NAME) ?></title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <h1><?= e(APP_NAME) ?></h1>
  <ul>
    <?php foreach ($etudiants as $etudiant): ?>
      <li><?= e($etudiant["nom"]) ?> — <?= e($etudiant["filiere"]) ?></li>
    <?php endforeach; ?>
  </ul>
</body>
</html>
`,
      },
      { path: "includes/config.php", content: `<?php
const APP_NAME = "Université — liste des étudiants";
` },
      {
        path: "includes/functions.php",
        content: `<?php
/** Échappe un texte avant de l'afficher dans la page (protection contre le XSS). */
function e(string $texte): string
{
    return htmlspecialchars($texte, ENT_QUOTES, "UTF-8");
}
`,
      },
      {
        path: "includes/database.php",
        content: `<?php
/** Base SQLite en mémoire, recréée à chaque exécution (requêtes préparées avec PDO). */
function connexion(): PDO
{
    $pdo = new PDO("sqlite::memory:", null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, filiere TEXT NOT NULL)");
    $ajout = $pdo->prepare("INSERT INTO etudiants (nom, filiere) VALUES (:nom, :filiere)");
    foreach ([["Kito", "Informatique"], ["Mbuyi", "Droit"], ["Kabila", "Économie"]] as [$nom, $filiere]) {
        $ajout->execute(["nom" => $nom, "filiere" => $filiere]);
    }
    return $pdo;
}
`,
      },
      { path: "css/style.css", content: `body {
  font-family: Arial, sans-serif;
  margin: 2rem;
}

h1 {
  color: #4f46e5;
}
` },
    ],
  },
  {
    id: "sql",
    label: "Base de données SQL (SQLite)",
    description: "Script SQL exécuté par SQLite dans le navigateur : tables, clés, insertions et requêtes, résultats en tableaux.",
    open: "universite.sql",
    files: [
      {
        path: "universite.sql",
        content: `-- Base « universite » (SQLite : certaines syntaxes diffèrent de MySQL et PostgreSQL)
PRAGMA foreign_keys = ON;

CREATE TABLE filieres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE
);

CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  age INTEGER CHECK (age >= 15),
  filiere_id INTEGER REFERENCES filieres (id)
);

INSERT INTO filieres (nom) VALUES ('Informatique'), ('Droit');
INSERT INTO etudiants (nom, postnom, age, filiere_id) VALUES
  ('Kito', 'Manasse', 23, 1),
  ('Mbuyi', 'Grace', 19, 2),
  ('Kabila', 'Mutombo', 21, 1);

SELECT e.nom, e.postnom, f.nom AS filiere
FROM etudiants e
JOIN filieres f ON f.id = e.filiere_id
ORDER BY e.nom;
`,
      },
    ],
  },
  {
    id: "vierge",
    label: "Projet vierge",
    description: "Un fichier README.md pour commencer.",
    open: "README.md",
    files: [{ path: "README.md", content: "# Mon projet\n\nDécrivez ici votre projet.\n" }],
  },
];

export const templateById = (id: string) => PROJECT_TEMPLATES.find((t) => t.id === id);
