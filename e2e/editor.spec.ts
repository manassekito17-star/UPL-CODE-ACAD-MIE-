import { test } from "@playwright/test";
import { expectConsole, run, setEditorCode } from "./helpers";

test("pseudocode : exécution avec entrées", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await setEditorCode(page, 'VARIABLES a, b : ENTIER\nDEBUT\n  LIRE(a)\n  LIRE(b)\n  ECRIRE("Somme = ", a + b)\nFIN');
  await page.getByLabel(/Entrée/).fill("4\n9");
  await run(page);
  await expectConsole(page, "Somme = 13");
});

test("pseudocode : erreur expliquée avec la ligne", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await setEditorCode(page, "VARIABLES x : ENTIER\nDEBUT\n  x = 3\nFIN");
  await run(page);
  await expectConsole(page, /Erreur de syntaxe \(ligne 3\).*utilisez « ← »/);
});

test("Python : exécution dans le navigateur (Pyodide) quand le serveur d'exécution est absent", async ({ page }) => {
  await page.goto("/editeur?exemple=python/listes-tuples/0");
  await run(page);
  await expectConsole(page, "Moyenne : 12.3", 90_000);
});

test("JavaScript : exécution isolée et arrêt d'une boucle infinie", async ({ page }) => {
  await page.goto("/editeur?langage=javascript");
  await setEditorCode(page, 'console.log("ok", 6 * 7);');
  await run(page);
  await expectConsole(page, "ok 42");
  await setEditorCode(page, "while (true) {}");
  await run(page);
  await expectConsole(page, "Temps limite dépassé", 20_000);
});
