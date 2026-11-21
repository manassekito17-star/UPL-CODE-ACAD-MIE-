import { devices, expect, test, type Page } from "@playwright/test";
import { isDemoMode } from "./helpers";

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
  for (const m of ["Fichier", "Éditer", "Afficher", "Exécuter", "Correction", "Projet", "Options", "Aide"]) await expect(page.getByTestId(`menu-${m}`)).toBeVisible();
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
  await expect(page.getByTestId("messages")).toContainText("Comment corriger : Il manque FINSI");

  // Fonction mal écrite : l'éditeur propose le bon nom.
  await page.getByTestId("zone-code").fill("DÉBUT\n  T = [1, 2]\n  ÉCRIRE LONGEUR(T)\nFIN\n");
  await page.getByTestId("compiler").click();
  await expect(page.getByTestId("messages")).toContainText("Vouliez-vous dire LONGUEUR");

  // « Corriger le code » : l'éditeur réécrit le code corrigé, puis il s'exécute.
  await page.getByTestId("zone-code").fill('DÉBUT\n  POUR i = 1 JUSQU\'À 2\n    ECRIR "n" i\nFIN\n');
  await page.getByTestId("compiler").click();
  // Rien n'est corrigé tout seul : l'éditeur indique le menu Correction.
  await expect(page.getByTestId("messages")).toContainText("menu Correction » Corriger le code");
  await expect(page.getByTestId("dialogue-correction")).toHaveCount(0);
  await page.getByTestId("menu-Correction").click();
  await page.getByTestId("menu-Correction/Corriger le code...").click();
  await expect(page.getByTestId("code-corrige")).toContainText("POUR i = 1 JUSQU'À 2 FAIRE");
  await expect(page.getByTestId("code-corrige")).toContainText('ÉCRIRE "n", i');
  await expect(page.getByTestId("code-corrige")).toContainText("FINPOUR");
  await page.getByTestId("appliquer-correction").click();
  await expect(page.getByTestId("zone-code")).toHaveValue(/JUSQU'À 2 FAIRE[\s\S]*ÉCRIRE "n", i[\s\S]*FINPOUR/);
  await page.getByTestId("compiler").click();
  await expect(page.getByTestId("messages")).not.toContainText("Erreur");

  // Boucle intérieure qui réutilise i au lieu de j (programme d'un étudiant) : corrigé depuis le menu.
  await page.getByTestId("zone-code").fill("DEBUT\nsom=0\nT=[[1,2],[3,4]]\nPOUR i= 1 JUSQU'A 2 FAIRE\n  POUR i= 1 JUSQU'A 2 FAIRE\n    som=som+T[i][j]\n  FINPOUR\n  ECRIRE \"somme ligne\",i,\"=\",som\n  som=0\nFINPOUR\nFIN\n");
  await page.getByTestId("executer").click();
  await expect(page.getByTestId("messages")).toContainText("menu Correction » Corriger le code");
  await page.getByTestId("menu-Correction").click();
  await page.getByTestId("menu-Correction/Corriger le code...").click();
  await expect(page.getByTestId("liste-corrections")).toContainText("réutilisait i");
  await page.getByTestId("appliquer-correction").click();
  await expect(page.getByTestId("zone-code")).toHaveValue(/POUR j= 1 JUSQU'A 2 FAIRE/);
});

test("Interface classique : barre des caractères spéciaux (tape au curseur, l'éditeur garde le focus)", async ({ page }) => {
  await openClassic(page);
  const zone = page.getByTestId("zone-code");
  await zone.fill("x ");
  await zone.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(2, 2));
  await zone.focus();
  for (const c of ["←", "(", '"', "!=", ")"]) await page.getByTestId(`car-${c}`).click();
  await expect(zone).toHaveValue('x ←("!=)');
  await expect(zone).toBeFocused();
  await page.keyboard.type("1");
  await expect(zone).toHaveValue('x ←("!=)1');
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

test("Interface classique : tous les modèles d'organigramme de LARP (REQUÊTE, SÉLECTIONNER, tampons…)", async ({ page }) => {
  await openClassic(page);
  await page.getByTestId("menu-Projet").click();
  await page.getByTestId("menu-Projet/Nouveau").click();
  await page.getByTestId("menu-Projet/Nouveau/Organigramme…").click();
  for (const id of ["assign", "input", "output", "call", "comment", "comment-droite", "if", "if-miroir", "if-sinon", "if-sinon-miroir", "while", "while-miroir", "repeat", "repeat-miroir", "for", "for-miroir", "while-losange", "while-losange-miroir", "requete", "lire-de", "ecrire-dans", "selectionner", "ouvrir", "fermer", "separateur", "detruire", "compresser"])
    await expect(page.getByTestId(`forme-${id}`)).toBeVisible();
  await page.getByTestId("forme-requete").click();
  await page.getByTestId("inserer").last().click();
  await page.getByTestId("contenu-ok").click();
  await page.getByTestId("forme-selectionner").click();
  await page.getByTestId("inserer").last().click();
  await page.getByTestId("contenu-ok").click();
  await expect(page.getByTestId("organigramme")).toContainText("REQUÊTE");
  await page.keyboard.press("F7");
  await page.getByTestId("console-saisie").fill("3");
  await page.getByTestId("console-saisie").press("Enter");
  await expect(page.getByTestId("console-texte")).toContainText("deux ou trois");
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

test("Interface classique : projet enregistré dans le compte, retrouvé depuis un autre appareil", async ({ page, browser }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await openClassic(page);
  const name = `Compte${Date.now()}`;
  await page.getByTestId("menu-Fichier").click();
  await page.getByTestId("menu-Fichier/Sauvegarder sous...").click();
  await page.getByTestId("champ-nom").fill(name);
  await page.getByTestId("nom-ok").click();
  await expect(page.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte", { timeout: 20_000 });
  await expect(page.getByTestId("messages")).toContainText("enregistré dans votre compte");

  // Modification : enregistrée automatiquement dans le compte.
  await page.getByTestId("zone-code").fill('DÉBUT\n  ÉCRIRE "Depuis le compte"\nFIN\n');
  await expect(page.getByTestId("etat-compte")).toHaveText("☁ Modifié…");
  await expect(page.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte", { timeout: 20_000 });

  // Autre appareil (même compte, rien sur l'appareil) : le projet s'ouvre depuis le compte.
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await openClassic(p2);
  await p2.getByTestId("menu-Fichier").click();
  await p2.getByTestId("menu-Fichier/Ouvrir...").click();
  await p2.getByTestId("projet-compte").filter({ hasText: name }).click();
  await p2.getByTestId("ouvrir-ok").click();
  await expect(p2.getByTestId("zone-code")).toHaveValue(/Depuis le compte/);
  await expect(p2.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte");
  await p2.keyboard.press("F7");
  await expect(p2.getByTestId("console-texte")).toContainText("Depuis le compte");

  // Modification sur l'autre appareil, puis retour sur le premier : il charge la version la plus récente
  // et enregistre ensuite sans fenêtre « modifié sur un autre appareil ».
  await p2.getByTestId("console-texte").click();
  await p2.getByTestId("zone-code").fill('DÉBUT\n  ÉCRIRE "Depuis l appareil 2"\nFIN\n');
  await expect(p2.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte", { timeout: 20_000 });
  await page.bringToFront();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByTestId("zone-code")).toHaveValue(/Depuis l appareil 2/, { timeout: 20_000 });
  await page.getByTestId("zone-code").fill('DÉBUT\n  ÉCRIRE "Depuis l appareil 1"\nFIN\n');
  await expect(page.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte", { timeout: 20_000 });
  await expect(page.getByTestId("dialogue-confirmation")).toHaveCount(0);
  // L'appareil 2 n'a pas été rechargé : son enregistrement passe aussi, sans question.
  await p2.bringToFront();
  await p2.getByTestId("zone-code").fill('DÉBUT\n  ÉCRIRE "Encore appareil 2"\nFIN\n');
  await expect(p2.getByTestId("etat-compte")).toHaveText("☁ Dans votre compte", { timeout: 20_000 });
  await expect(p2.getByTestId("dialogue-confirmation")).toHaveCount(0);

  // Nettoyage : suppression du projet du compte.
  await p2.getByTestId("console-texte").click();
  await p2.getByTestId("menu-Fichier").click();
  await p2.getByTestId("menu-Fichier/Ouvrir...").click();
  await p2.getByTestId("projet-compte").filter({ hasText: name }).click();
  p2.once("dialog", (d) => d.accept());
  await p2.getByRole("button", { name: "Supprimer" }).click();
  await expect(p2.getByTestId("projet-compte").filter({ hasText: name })).toHaveCount(0);
  await other.close();
});
