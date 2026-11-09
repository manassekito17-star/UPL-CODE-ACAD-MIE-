import { expect, test } from "@playwright/test";
import { expectConsole, run, setEditorCode } from "./helpers";

test("pseudocode : exécution avec entrées", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await setEditorCode(page, 'VARIABLES a, b : ENTIER\nDEBUT\n  LIRE(a)\n  LIRE(b)\n  ECRIRE("Somme = ", a + b)\nFIN');
  await page.getByRole("button", { name: /Console et entrées/ }).click();
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

test("page Éditeur plein écran : menus, exemples, clavier de symboles et pas à pas", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await expect(page.getByTestId("editeur-algo")).toBeVisible();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  // Pas d'en-tête ni de pied de page visibles : l'éditeur couvre tout l'écran.
  const box = await page.getByTestId("editeur-algo").boundingBox();
  const vp = page.viewportSize()!;
  expect(box && box.x === 0 && box.y === 0 && box.width >= vp.width - 1 && box.height >= vp.height - 1).toBe(true);

  // Menu ⋮ → Exemples → « Somme des entiers de 1 à n », puis exécution.
  await page.getByRole("button", { name: "Plus d'options" }).click();
  for (const item of ["Annuler", "Rétablir", "Copier", "Coller", "Effacer l'éditeur", "Rechercher", "Partager le code", "Exemples", "Aide", "Entraînement", "Paramètres"]) {
    await expect(page.getByRole("menuitem", { name: item, exact: true })).toBeVisible();
  }
  await page.getByRole("menuitem", { name: "Exemples" }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Somme des entiers de 1 à n" }).click();
  await run(page);
  await expectConsole(page, "Somme = 15");

  // Clavier de symboles : la touche « <- » écrit l'affectation dans l'éditeur.
  await page.getByRole("toolbar", { name: "Symboles de programmation" }).getByRole("button", { name: "Affectation" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string }> } } }).monaco.editor.getModels().some((m) => m.getValue().includes("<- ")))).toBe(true);

  // Pas à pas : le laboratoire reçoit le code de l'éditeur.
  await page.getByRole("button", { name: "Exécution pas à pas" }).click();
  await expect(page).toHaveURL(/\/laboratoire\?depuis=editeur/);
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await expect.poll(() => page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string }> } } }).monaco.editor.getModels().some((m) => m.getValue().includes("sommeNombres")))).toBe(true);
});

test("lire sans valeur préparée : la console demande la valeur puis continue (comme un interpréteur interactif)", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await setEditorCode(page, 'Algorithme moyenneNotes\nVariables n, i : entier\nVariables note, somme, moyenne : réel\nDébut\n  écrire("Combien de notes ? ")\n  lire(n)\n  somme <- 0\n  Pour i <- 1 à n Faire\n    écrire("Note ", i, " : ")\n    lire(note)\n    somme <- somme + note\n  FinPour\n  moyenne <- somme / n\n  écrire("Moyenne = ", moyenne)\nFin');
  await run(page);
  await expect(page.getByText(/En attente de votre saisie…/)).toBeVisible();
  for (const [name, value] of [["n", "2"], ["note", "12"], ["note", "8"]]) {
    const field = page.getByLabel(`Valeur de ${name}`);
    await expect(field).toBeVisible();
    await field.fill(value);
    await field.press("Enter");
  }
  await expectConsole(page, "Moyenne = 10");
  await expect(page.getByTestId("saisie-console")).toHaveCount(0);
  await expect(page.getByLabel(/Entrée/)).toHaveValue("2\n12\n8");
});
