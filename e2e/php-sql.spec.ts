import { expect, test } from "@playwright/test";
import { expectConsole, run, setEditorCode } from "./helpers";

// PHP 8.3 (php-wasm) et SQLite (sql.js) : vrais moteurs WebAssembly, exécutés
// dans un Web Worker du navigateur. Le premier chargement télécharge le moteur.

test("PHP : exécution réelle (PHP 8.3), fonctions, PDO SQLite et password_hash", async ({ page }) => {
  await page.goto("/editeur?langage=php");
  await setEditorCode(
    page,
    [
      "<?php",
      "function carre(int $x): int { return $x * $x; }",
      '$db = new PDO("sqlite::memory:");',
      '$db->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY, nom TEXT)");',
      '$stmt = $db->prepare("INSERT INTO etudiants (nom) VALUES (?)");',
      '$stmt->execute(["Kito"]);',
      '$nom = $db->query("SELECT nom FROM etudiants")->fetchColumn();',
      'echo "Carré = ", carre(9), "\\n";',
      'echo "Étudiant : ", htmlspecialchars($nom), "\\n";',
      'echo password_verify("secret", password_hash("secret", PASSWORD_DEFAULT)) ? "Mot de passe vérifié" : "échec", "\\n";',
      'echo "PHP ", PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;',
    ].join("\n"),
  );
  await run(page);
  await expectConsole(page, "Carré = 81", 120_000);
  await expectConsole(page, "Étudiant : Kito");
  await expectConsole(page, "Mot de passe vérifié");
  await expectConsole(page, "PHP 8.3");
  await expect(page.getByText(/PHP 8\.3 \(WebAssembly\)/).first()).toBeVisible();
});

test("PHP : erreur de syntaxe avec le numéro de ligne, puis aperçu de la page générée", async ({ page }) => {
  await page.goto("/editeur?langage=php");
  await setEditorCode(page, '<?php\n$a = 1\necho $a;');
  await run(page);
  await expectConsole(page, /Parse error: syntax error.*on line 3/, 120_000);

  await setEditorCode(page, '<?php $titre = "Bienvenue"; ?>\n<h1><?= htmlspecialchars($titre) ?></h1>\n<p>Page générée par PHP</p>');
  await run(page);
  const frame = page.getByTestId("apercu-php").frameLocator("iframe");
  await expect(frame.locator("h1")).toHaveText("Bienvenue", { timeout: 30_000 });
});

test("PHP : une boucle infinie est arrêtée, le moteur repart ensuite", async ({ page }) => {
  await page.goto("/editeur?langage=php");
  await setEditorCode(page, "<?php\nwhile (true) {}");
  await run(page);
  await expectConsole(page, "Temps limite dépassé", 150_000);
  await setEditorCode(page, '<?php echo "de nouveau prêt";');
  await run(page);
  await expectConsole(page, "de nouveau prêt", 120_000);
});

test("SQL : création, insertion et sélection affichées en tableau (SQLite)", async ({ page }) => {
  await page.goto("/editeur?langage=sql");
  await setEditorCode(
    page,
    [
      "CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, postnom TEXT, age INTEGER, filiere TEXT);",
      "INSERT INTO etudiants (nom, postnom, age, filiere) VALUES ('Kito', 'Manasse', 23, 'Informatique'), ('Mbuyi', 'Grace', 19, 'Droit');",
      "SELECT nom, age FROM etudiants WHERE age > 20;",
    ].join("\n"),
  );
  await run(page);
  await expectConsole(page, "2 lignes insérées.", 60_000);
  const table = page.getByTestId("tableau-resultat").first();
  await expect(table).toContainText("Kito");
  await expect(table).not.toContainText("Mbuyi");
  await expect(page.getByText(/SQLite 3\./).first()).toBeVisible();
  await page.getByRole("button", { name: /Structure/ }).click();
  await expect(page.getByTestId("structure-base")).toContainText("etudiants");
});

test("SQL : erreur expliquée en français avec la ligne", async ({ page }) => {
  await page.goto("/editeur?langage=sql");
  await setEditorCode(page, "CREATE TABLE a (x INTEGER);\nSELECT * FROM etudiant;");
  await run(page);
  await expectConsole(page, /Erreur SQL \(ligne 2\) : no such table: etudiant/, 60_000);
  await expectConsole(page, /La table « etudiant » n'existe pas/);
});

test("API : PHP et SQL ne sont jamais exécutés sur le serveur", async ({ page }) => {
  for (const language of ["php", "sql"]) {
    const res = await page.request.post("/api/execute", { data: { language, files: [{ name: "x", content: "1" }], stdin: "" } });
    expect(res.status()).toBe(503);
    expect((await res.json()).fallback).toBe("navigateur");
  }
});
