import { devices, expect, test, type Page } from "@playwright/test";

/** Interface classique : chaque test part de l'exemple fourni (projet courant effacé). */
async function openClassic(page: Page) {
  await page.goto("/flow/classique");
  await page.evaluate(() => {
    localStorage.removeItem("upl:larp:courant");
    localStorage.removeItem("upl:larp:projets");
  });
  await page.goto("/flow/classique");
  await expect(page.getByTestId("larp-fenetre")).toBeVisible({ timeout: 30_000 });
}

test("Interface classique : disposition (menus, panneau de contrôle, navigateur, modèles, messages, statut)", async ({ page }) => {
  await openClassic(page);
  for (const m of ["Fichier", "Éditer", "Afficher", "Exécuter", "Projet", "Options", "Aide"]) await expect(page.getByTestId(`menu-${m}`)).toBeVisible();
  await expect(page.getByTestId("panneau-controle")).toBeVisible();
  await expect(page.getByTestId("navigateur")).toContainText("Module principal");
  await expect(page.getByTestId("doc-PRINCIPAL")).toBeVisible();
  await expect(page.getByTestId("doc-Factorielle")).toBeVisible();
  await expect(page.getByTestId("modeles")).toContainText("TANTQUE");
  await expect(page.getByTestId("statut")).toContainText("1:1");
  await page.getByTestId("menu-Exécuter").click();
  await expect(page.getByTestId("menu-Exécuter/Exécuter pas-à-pas...")).toContainText("Shift+F7");
});

test("Interface classique : exécuter (F7), saisie dans la console, erreur de compilation localisée", async ({ page }) => {
  await openClassic(page);
  await page.keyboard.press("F7");
  await page.getByTestId("console-saisie").fill("6");
  await page.getByTestId("console-saisie").press("Enter");
  await expect(page.getByTestId("console-texte")).toContainText("La factorielle de  6  est  720");
  await expect(page.getByTestId("console-fin")).toContainText("Pressez une touche");
  await page.getByTestId("console-texte").click();
  await expect(page.getByTestId("console")).toHaveCount(0);

  await page.getByTestId("zone-code").fill('DÉBUT\n  SI x > 1 ALORS\n    ÉCRIRE "x"\nFIN\n');
  await page.getByTestId("compiler").click();
  await expect(page.getByTestId("messages")).toContainText("PRINCIPAL (ligne 4) : FINSI attendu");
});

test("Interface classique : pas-à-pas (variables, pile d'appels, ligne surlignée) et point d'arrêt", async ({ page }) => {
  await openClassic(page);
  await page.getByTestId("doc-Factorielle").click();
  await page.locator('[title="Point d\'arrêt (F8)"]').nth(4).click(); // ligne 5 : F = F * i
  await expect(page.getByTestId("marge-arret")).toHaveCount(1);
  await page.getByTestId("pas-a-pas").click();
  await expect(page.getByTestId("fenetre-pas-a-pas")).toBeVisible();
  await page.getByTestId("pas-continuer").click();
  await page.getByTestId("console-saisie").fill("4");
  await page.getByTestId("console-saisie").press("Enter");
  await expect(page.getByTestId("console-statut")).toContainText("En pause");
  await expect(page.getByTestId("pile-appels")).toContainText("Factorielle(4)");
  await expect(page.getByTestId("valeur-i")).toHaveText("2");
  await expect(page.getByTestId("ligne-active")).toBeVisible();
  await page.getByTestId("pas-un-pas").click();
  await page.getByTestId("pas-un-pas").click();
  await expect(page.getByTestId("valeur-F")).toHaveText("2");
  await page.getByTestId("pas-arreter").click();
  await expect(page.getByTestId("fenetre-pas-a-pas")).toHaveCount(0);
});

test("Interface classique : organigramme construit au toucher, exécuté, traduit en pseudo-code", async ({ page }) => {
  await openClassic(page);
  await page.getByTestId("menu-Projet").click();
  await page.getByTestId("menu-Projet/Nouveau").click();
  await page.getByTestId("menu-Projet/Nouveau/Organigramme…").click();
  await page.getByTestId("forme-input").click();
  await page.getByTestId("inserer").last().click();
  await page.getByTestId("champ-target").fill("n");
  await page.getByTestId("contenu-ok").click();
  await page.getByTestId("forme-output").click();
  await page.getByTestId("inserer").last().click();
  await page.getByTestId("champ-expr").fill('"Double = ", n * 2');
  await page.getByTestId("contenu-ok").click();
  await expect(page.getByTestId("organigramme")).toContainText("LIRE n");
  await page.keyboard.press("F7");
  await page.getByTestId("console-saisie").fill("21");
  await page.getByTestId("console-saisie").press("Enter");
  await expect(page.getByTestId("console-texte")).toContainText("Double =  42");
  await page.getByTestId("console-texte").click();
  await page.getByTestId("menu-Afficher").click();
  await page.getByTestId("menu-Afficher/Pseudo-code…").click();
  await expect(page.getByTestId("dialogue-pseudo")).toContainText('ÉCRIRE "Double = ", n * 2');
});

for (const [name, device] of [["iPhone", devices["iPhone 13 landscape"]], ["Android", devices["Pixel 7 landscape"]]] as const) {
  test(`Interface classique sur ${name} (paysage) : même fenêtre, exécution au toucher`, async ({ browser }) => {
    const opts: Record<string, unknown> = { ...device };
    delete opts.defaultBrowserType;
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    await openClassic(page);
    const box = await page.getByTestId("larp-fenetre").boundingBox();
    expect(box!.width).toBeGreaterThan(500);
    await page.getByTestId("executer").tap();
    await page.getByTestId("console-saisie").fill("5");
    await page.getByTestId("console-valider").tap();
    await expect(page.getByTestId("console-texte")).toContainText("120");
    await page.getByTestId("menu-Exécuter").tap();
    await expect(page.getByTestId("menu-Exécuter/Exécuter...")).toBeVisible();
    await context.close();
  });
}

test("Interface classique sur iPhone (portrait) : la fenêtre remplit la hauteur, balayage horizontal", async ({ browser }) => {
  const opts: Record<string, unknown> = { ...devices["iPhone 13"] };
  delete opts.defaultBrowserType;
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  await openClassic(page);
  const vp = page.viewportSize()!;
  const box = (await page.getByTestId("larp-fenetre").boundingBox())!;
  expect(box.height).toBeGreaterThan(vp.height * 0.95);
  expect(box.width).toBeGreaterThan(vp.width);
  const ecran = page.getByTestId("larp-ecran");
  const canScroll = await ecran.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(canScroll).toBe(true);
  await ecran.evaluate((el) => (el.scrollLeft = el.scrollWidth));
  await expect.poll(() => ecran.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await context.close();
});
