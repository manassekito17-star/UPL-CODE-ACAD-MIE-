import { expect, test } from "@playwright/test";

/** Phase 2 — Laboratoire d'algorithmique : exécution pas à pas réelle (interpréteur de la plateforme). */
test("exécution pas à pas avec saisie interactive, variables, organigramme et retour arrière", async ({ page }) => {
  await page.goto("/laboratoire");
  await expect(page.getByRole("heading", { name: "Laboratoire d'algorithmique" })).toBeVisible();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();

  // Aucune entrée fournie : le laboratoire annonce puis demande n au moment du LIRE
  const ask = page.getByTestId("lab-saisie");
  await expect(page.getByTestId("lab-annonce-lire")).toContainText("LIRE(n)");
  await page.getByRole("button", { name: "Dernière étape" }).click();
  await expect(ask).toContainText("LIRE(n) attend une valeur");
  await ask.getByRole("textbox").fill("2");
  await ask.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByTestId("lab-variables")).toContainText("2");

  // Après la saisie, on reprend à la même étape : l'étape suivante montre n = 2
  await expect(ask).toBeHidden();
  await expect(page.getByTestId("lab-annonce-lire")).toContainText("LIRE(note)");
  await page.getByRole("button", { name: "Avancer" }).click();
  await page.getByRole("button", { name: "Dernière étape" }).click();
  await expect(ask).toContainText("LIRE(note) attend une valeur");
  await ask.getByRole("textbox").fill("12");
  await ask.getByRole("button", { name: "Valider" }).click();
  await expect(ask).toBeHidden();
  await page.getByRole("button", { name: "Dernière étape" }).click();
  await expect(ask).toContainText("LIRE(note) attend une valeur");
  await ask.getByRole("textbox").fill("15");
  await ask.getByRole("button", { name: "Valider" }).click();
  await expect(ask).toBeHidden();
  await expect(page.getByLabel("Entrées pour LIRE (une valeur par ligne, facultatif)")).toHaveValue("2\n12\n15");

  // Fin de l'exécution
  await page.getByRole("button", { name: "Dernière étape" }).click();
  await expect(page.getByTestId("lab-sortie")).toContainText("Moyenne : 13.5");
  await expect(page.getByTestId("lab-explication")).toContainText("L'algorithme est terminé.");

  // Retour en arrière : la sortie redevient partielle, l'étape décroît
  const label = await page.getByTestId("lab-etape").innerText();
  const total = Number(label.match(/\/ (\d+)/)![1]);
  await page.getByRole("button", { name: "Reculer" }).click();
  await expect(page.getByTestId("lab-etape")).toHaveText(`Étape ${total - 1} / ${total}`);

  // Remonter jusqu'à la vérification de fin de boucle POUR
  for (let i = 0; i < 10; i++) {
    if ((await page.getByTestId("lab-explication").innerText()).includes("fin de la boucle POUR")) break;
    await page.getByRole("button", { name: "Reculer" }).click();
  }
  await expect(page.getByTestId("lab-explication")).toContainText("i = 3 > 2 : fin de la boucle POUR (2 tour(s)).");
  await expect(page.getByTestId("lab-explication")).toContainText("FAUX");
  // Organigramme synchronisé : le bloc de la ligne courante est mis en évidence
  await expect(page.locator('[data-testid="lab-organigramme"] g.upl-actif').first()).toBeVisible();

  // Lecture automatique puis pause
  await page.getByRole("button", { name: "Première étape" }).click();
  await page.getByRole("button", { name: "Lecture" }).click();
  await expect(page.getByTestId("lab-etape")).not.toHaveText(`Étape 1 / ${total}`, { timeout: 5000 });
  await page.getByRole("button", { name: "Pause" }).click();
});

test("un algorithme du cours s'ouvre dans le laboratoire depuis le chapitre, avec la pile d'appels", async ({ page }) => {
  await page.goto("/formations/algorithmique/variables-constantes#algorithmes");
  await page.locator("section#algorithmes").getByRole("link", { name: "Pas à pas dans le laboratoire" }).first().click();
  await expect(page).toHaveURL(/\/laboratoire\?algorithme=variables-constantes\/0/);
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await expect(page.getByTestId("lab-pile")).toContainText("Programme principal");
  await page.getByTestId("retour-cours").click();
  await expect(page).toHaveURL(/\/formations\/algorithmique\/variables-constantes#algorithmes/);
});

test("erreurs : syntaxe signalée sans lancer la trace, boucle infinie interrompue", async ({ page }) => {
  await page.goto("/laboratoire");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  const setCode = (c: string) =>
    page.evaluate((code) => (window as unknown as { monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } } }).monaco.editor.getModels()[0].setValue(code), c);

  await setCode("ALGORITHME X\nDEBUT\n  SI VRAI ALORS\n    ECRIRE(1)\nFIN");
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Erreur de syntaxe" })).toBeVisible();

  await setCode("ALGORITHME Boucle\nVARIABLES\n  i : ENTIER\nDEBUT\n  i ← 0\n  TANT QUE VRAI FAIRE\n    i ← i + 1\n  FINTANTQUE\nFIN");
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await expect(page.getByText("Trace limitée aux 3000 premières étapes.")).toBeVisible();
});
