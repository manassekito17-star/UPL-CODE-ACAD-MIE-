import { devices, expect, test, type Browser } from "@playwright/test";
import { isDemoMode } from "./helpers";

// Accès rapide sans mot de passe (connexion anonyme de Supabase Auth), testé sur
// ordinateur, iPhone et Android (émulation des appareils par Playwright).
const APPAREILS = {
  ordinateur: { viewport: { width: 1366, height: 900 } },
  iPhone: devices["iPhone 13"],
  Android: devices["Pixel 7"],
} as const;

/** Options du contexte pour l'appareil (sans le type de navigateur : Chromium émule l'appareil). */
function opts(appareil: keyof typeof APPAREILS) {
  const o: Record<string, unknown> = { ...APPAREILS[appareil] };
  delete o.defaultBrowserType;
  return o;
}

async function quickAccess(browser: Browser, appareil: keyof typeof APPAREILS, prenom: string) {
  const context = await browser.newContext(opts(appareil));
  const page = await context.newPage();
  await page.goto("/");
  const form = page.getByTestId("acces-rapide");
  await form.getByLabel("Nom", { exact: true }).fill("Kabila");
  await form.getByLabel("Prénom").fill(prenom);
  await form.getByLabel("Enseignant").check();
  await form.getByLabel("Féminin").check();
  await form.getByLabel("Filière").selectOption("autre");
  await form.getByLabel("Votre filière").fill("Agronomie");
  await form.getByRole("button", { name: "ACCÉDER À LA PLATEFORME" }).click();
  await expect(page).toHaveURL(/tableau-de-bord/, { timeout: 30_000 });
  return { context, page };
}

for (const appareil of Object.keys(APPAREILS) as Array<keyof typeof APPAREILS>) {
  test(`accès rapide sur ${appareil} : profil, modification, session conservée, déconnexion`, async ({ page: probe, browser }) => {
    test.skip(await isDemoMode(probe), "Supabase non configuré");
    const { context, page } = await quickAccess(browser, appareil, `Grace${appareil}`);

    // Profil affiché : avatar par défaut, nom, prénom, poste, sexe, filière, date de création.
    await page.goto("/profil");
    const carte = page.getByTestId("carte-profil");
    for (const t of ["Kabila", `Grace${appareil}`, "Enseignant", "Féminin", "Agronomie", new Date().toLocaleDateString("fr-FR")]) await expect(carte).toContainText(t);
    await expect(page.getByTestId("methode-connexion")).toContainText("Accès rapide");
    await expect(page.getByTestId("methode-connexion")).toContainText("n'est pas vérifié");

    // « Enseignant » déclaré ne donne aucun droit : l'administration reste fermée.
    await page.goto("/admin");
    await expect(page).toHaveURL(/acces-refuse|connexion/);

    // Modification des informations autorisées.
    await page.goto("/profil");
    await page.getByTestId("formulaire-profil").getByLabel("Filière").fill("Informatique");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Profil enregistré.")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("carte-profil")).toContainText("Informatique");

    // Fermer puis rouvrir le navigateur (mêmes cookies) : l'espace est retrouvé.
    const state = await context.storageState();
    await context.close();
    const reopened = await browser.newContext({ ...opts(appareil), storageState: state });
    const again = await reopened.newPage();
    await again.goto("/tableau-de-bord");
    await expect(again).toHaveURL(/tableau-de-bord/);
    await again.goto("/profil");
    await expect(again.getByTestId("carte-profil")).toContainText(`Grace${appareil}`);

    // Déconnexion : l'espace n'est plus accessible.
    await again.getByRole("button", { name: "Se déconnecter" }).click();
    await again.goto("/profil");
    await expect(again).toHaveURL(/connexion/);
    await reopened.close();
  });
}

test("accès rapide : champs obligatoires et rôle non modifiable par le formulaire", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await page.context().clearCookies();
  await page.goto("/connexion");
  const form = page.getByTestId("acces-rapide");
  await expect(form.getByRole("button", { name: "ACCÉDER À LA PLATEFORME" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continuer avec Google/ }).or(page.getByText("La connexion Google n'est pas configurée"))).toBeVisible();
  // Aucun choix « administrateur » dans le formulaire.
  await expect(form.getByLabel("Administrateur")).toHaveCount(0);
  // Formulaire envoyé sans le navigateur (requête forgée) : refusé côté serveur.
  await form.getByLabel("Nom", { exact: true }).fill("K");
  await form.getByLabel("Prénom").fill("Ana");
  await form.getByLabel("Masculin").check();
  await form.getByLabel("Filière").selectOption("Droit");
  await form.evaluate((f) => f.setAttribute("novalidate", ""));
  await form.getByRole("button", { name: "ACCÉDER À LA PLATEFORME" }).click();
  await expect(form.getByText("Nom : au moins 2 caractères.")).toBeVisible();
});
