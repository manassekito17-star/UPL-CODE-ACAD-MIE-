import { devices, expect, test, type Page } from "@playwright/test";

/** Contenu du pseudocode (l'éditeur n'affiche que les lignes visibles). */
async function code(page: Page): Promise<string> {
  return page.evaluate(() => {
    const m = (window as unknown as { monaco?: { editor: { getModels(): Array<{ getValue(): string }> } } }).monaco;
    return m?.editor.getModels().find((x) => x.getValue().includes("ALGORITHME"))?.getValue() ?? "";
  });
}

/** Projets enregistrés sur l'appareil : chaque test part d'un studio neuf. */
async function openStudio(page: Page) {
  await page.goto("/flow");
  await page.evaluate(() => localStorage.removeItem("upl:flow:projets"));
  await page.goto("/flow");
  await expect(page.getByTestId("canevas-flow")).toBeVisible();
}

test("UPL Flow Studio : modèle, exécution réelle, pas à pas avant/arrière, variables", async ({ page }) => {
  await openStudio(page);
  await expect.poll(() => code(page), { timeout: 60_000 }).toContain("POUR i DE 1 A n FAIRE");
  await page.getByLabel("Entrées préparées (une par ligne)").fill("4");
  await page.getByRole("button", { name: "Pas à pas" }).click();
  await expect(page.getByTestId("variables-trace")).toContainText("étape 1/");
  await page.getByRole("button", { name: "Étape suivante" }).click();
  await page.getByRole("button", { name: "Étape suivante" }).click();
  await expect(page.locator("[data-actif=oui]")).toHaveCount(1);
  await page.getByRole("button", { name: "Étape précédente" }).click();
  await expect(page.getByTestId("variables-trace")).toContainText("étape 2/");
  await page.getByRole("button", { name: "Reprendre" }).click();
  await expect(page.getByTestId("sortie-flow")).toContainText("Somme = 10", { timeout: 30_000 });
  await expect(page.getByTestId("sortie-flow")).toContainText("Fin de l'algorithme");
});

test("UPL Flow Studio : insérer un bloc avec « + », le modifier, annuler, erreur rattachée au bloc", async ({ page }) => {
  await openStudio(page);
  const before = await page.getByTestId("inserer").count();
  await page.getByTestId("inserer").last().click(); // avant « Fin »
  await page.getByTestId("menu-insertion").getByRole("menuitem", { name: "Sortie (ÉCRIRE)" }).click();
  await expect(page.getByTestId("inserer")).toHaveCount(before + 1);
  const expr = page.getByTestId("inspecteur").getByLabel("Expression");
  await expr.fill('"Terminé"');
  await expect.poll(() => code(page), { timeout: 60_000 }).toContain('ECRIRE("Terminé")');
  // Erreur de syntaxe : signalée et rattachée au bloc
  await expr.fill('"Terminé');
  await page.getByRole("button", { name: "Erreurs ●" }).click();
  await expect(page.getByTestId("erreurs-flow")).toContainText("Erreur (ligne");
  await expr.fill('"Terminé"');
  // Annuler : les saisies rapprochées dans un même champ forment une seule étape, puis l'ajout du bloc.
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByRole("button", { name: "Annuler" })).toBeDisabled();
  await expect(page.getByTestId("inserer")).toHaveCount(before);
  await page.getByRole("button", { name: "Rétablir" }).click();
  await expect(page.getByTestId("inserer")).toHaveCount(before + 1);
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect.poll(() => code(page)).not.toContain("Terminé");
  await page.getByRole("button", { name: "Historique" }).click();
  await expect(page.getByTestId("historique-flow")).toBeVisible();
});

test("UPL Flow Studio : point d'arrêt, entrée demandée pendant l'exécution, import de pseudocode", async ({ page }) => {
  await openStudio(page);
  // Point d'arrêt sur « s ← s + i »
  await page.getByTestId("canevas-flow").getByText("s ← s + i").click();
  await page.getByRole("button", { name: "● Point d'arrêt" }).click();
  await expect(page.getByTestId("point-arret")).toHaveCount(1);
  // Aucune entrée préparée : la console demande n
  await page.getByRole("button", { name: "Exécuter" }).click();
  await expect(page.getByTestId("saisie-flow")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("saisie-flow").getByRole("textbox").fill("3");
  await page.getByTestId("saisie-flow").getByRole("button", { name: "OK" }).click();
  await expect(page.getByText("Point d'arrêt atteint")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-actif=oui]")).toContainText("s ← s + i");
  // Import : pseudocode → organigramme avec confirmation
  await page.getByRole("button", { name: "Arrêter" }).click();
  await page.getByRole("button", { name: "Importer du pseudocode" }).click();
  await page.getByLabel("Pseudocode à importer").fill('VARIABLES\n  a : ENTIER\nDEBUT\n  a ← 2\n  SI a > 1 ALORS\n    ECRIRE("grand")\n  FINSI\nFIN');
  await page.getByRole("button", { name: "Analyser" }).click();
  await page.getByRole("button", { name: "Remplacer le projet" }).click();
  await expect.poll(() => code(page)).toContain("SI a > 1 ALORS");
  await page.getByRole("button", { name: "Exécuter" }).click();
  await expect(page.getByTestId("sortie-flow")).toContainText("grand", { timeout: 30_000 });
});

for (const [name, device] of [["iPhone", devices["iPhone 13"]], ["Android", devices["Pixel 7"]]] as const) {
  test(`UPL Flow Studio sur ${name} : placer une forme au toucher, exécuter, console`, async ({ browser }) => {
    const opts: Record<string, unknown> = { ...device };
    delete opts.defaultBrowserType;
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    await openStudio(page);
    const before = await page.getByTestId("inserer").count();
    await page.getByRole("button", { name: "▱ Sortie (ÉCRIRE)" }).tap();
    await page.getByTestId("inserer").last().tap();
    await expect(page.getByTestId("inserer")).toHaveCount(before + 1);
    await page.getByRole("button", { name: "Console" }).tap();
    await page.getByLabel("Entrées préparées (une par ligne)").fill("2");
    await page.getByRole("button", { name: "Exécuter" }).tap();
    await expect(page.getByTestId("sortie-flow")).toContainText("Somme = 3", { timeout: 30_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });
}

test("UPL Flow Studio : pseudocode modifié à la main → organigramme mis à jour, console en bulles", async ({ page }) => {
  await openStudio(page);
  await page.getByRole("button", { name: "Pseudocode", exact: true }).first().click();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  await page.evaluate(() => {
    const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string; setValue(v: string): void }> } } }).monaco;
    const model = m.editor.getModels().find((x) => x.getValue().includes("ALGORITHME"))!;
    model.setValue('ALGORITHME Carre\nVARIABLES\n  x : ENTIER\nDEBUT\n  LIRE(x)\n  ECRIRE("Carré = ", x * x)\nFIN\n');
  });
  await expect(page.getByTestId("canevas-flow").getByText('"Carré = ", x * x')).toBeVisible({ timeout: 10_000 });
  // Code invalide : message, l'organigramme garde la dernière version valide
  await page.evaluate(() => {
    const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string; setValue(v: string): void }> } } }).monaco;
    m.editor.getModels().find((x) => x.getValue().includes("ALGORITHME"))!.setValue("ALGORITHME Carre\nDEBUT\n  SI x ALORS\nFIN\n");
  });
  await expect(page.getByTestId("synchro-pseudocode")).toContainText("Ligne");
  await expect(page.getByTestId("canevas-flow").getByText('"Carré = ", x * x')).toBeVisible();
  // Exécution : la valeur lue (bulle bleue) puis la sortie (bulle verte)
  await page.evaluate(() => {
    const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string; setValue(v: string): void }> } } }).monaco;
    m.editor.getModels().find((x) => x.getValue().includes("ALGORITHME"))!.setValue('ALGORITHME Carre\nVARIABLES\n  x : ENTIER\nDEBUT\n  LIRE(x)\n  ECRIRE("Carré = ", x * x)\nFIN\n');
  });
  await page.getByLabel("Entrées préparées (une par ligne)").fill("7");
  await page.getByRole("button", { name: "Exécuter" }).click();
  await expect(page.getByTestId("sortie-flow").locator("[data-type=entree]")).toHaveText("↳ 7", { timeout: 30_000 });
  await expect(page.getByTestId("sortie-flow").locator("[data-type=sortie]")).toHaveText("Carré = 49");
});
