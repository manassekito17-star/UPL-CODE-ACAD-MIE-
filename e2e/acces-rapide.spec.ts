import { devices, expect, test, type Browser } from "@playwright/test";
import { isDemoMode } from "./helpers";

// Accès rapide sans mot de passe (connexion anonyme de Supabase Auth), testé sur
// ordinateur, iPhone et Android (émulation des appareils par Playwright).
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const APPAREILS = {
  ordinateur: { viewport: { width: 1366, height: 900 } },
  iPhone: devices["iPhone 13"],
  Android: devices["Pixel 7"],
} as const;

/** Options du contexte pour l'appareil (sans le type de navigateur : Chromium émule l'appareil). */
function opts(appareil: keyof typeof APPAREILS) {
  // Session vide : le projet de test ouvre sinon les contextes avec le compte étudiant de test.
  const o: Record<string, unknown> = { ...APPAREILS[appareil], storageState: { cookies: [], origins: [] } };
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
  // Photo : image PNG 1×1, réduite et convertie en JPEG par le navigateur avant l'envoi.
  await form.getByTestId("choisir-photo").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
  await expect(form.getByTestId("apercu-photo")).toHaveAttribute("src", /^data:image\/jpeg/);
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
    await expect(carte.locator("img")).toHaveAttribute("src", /\/storage\/v1\/object\/public\/avatars\//);
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
  // Photo obligatoire : sans photo, l'accès est refusé.
  await form.getByLabel("Nom", { exact: true }).fill("Kito");
  await form.getByRole("button", { name: "ACCÉDER À LA PLATEFORME" }).click();
  await expect(form.getByText("Ajoutez votre photo : elle est obligatoire.")).toBeVisible();
  await expect(page).toHaveURL(/connexion/);
});

test("« Créer un compte » propose aussi l'accès rapide avec un profil (Option B)", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/inscription");
  await expect(page.getByRole("heading", { name: "Option A — Continuer avec Google" })).toBeVisible();
  const b = page.getByTestId("inscription-acces-rapide");
  await expect(b.getByRole("heading", { name: "Option B — Accès rapide avec un profil" })).toBeVisible();
  await expect(b.getByTestId("acces-rapide")).toBeVisible();
  await expect(b.getByRole("button", { name: "ACCÉDER À LA PLATEFORME" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Option C/ })).toBeVisible();
  await ctx.close();
});

test("administration : un compte « accès rapide » (sans e-mail) se supprime en recopiant son nom", async ({ page, browser }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const { signUpStudent, promoteToAdmin } = await import("./helpers");
  const adminCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const admin = await adminCtx.newPage();
  const adminEmail = (await signUpStudent(admin, "Admin Suppression"))!;
  await promoteToAdmin(adminEmail);

  // Prénom unique en lettres seulement (le formulaire refuse les chiffres).
  const prenom = `Rapide${[...Date.now().toString(36)].map((c) => String.fromCharCode(97 + (parseInt(c, 36) % 26))).join("")}`;
  const { context } = await quickAccess(browser, "ordinateur", prenom);
  await context.close();

  await admin.goto(`/admin/utilisateurs?q=${encodeURIComponent(prenom)}`);
  const row = admin.getByTestId("table-utilisateurs").getByRole("row").filter({ hasText: prenom });
  await expect(row).toContainText("Accès rapide");
  await row.getByRole("link", { name: "Voir" }).click();
  const del = admin.getByTestId("form-suppression");
  await expect(del).toContainText("recopiez le nom complet");
  await del.locator('input[name="confirmEmail"]').fill("Autre Nom");
  admin.once("dialog", (d) => d.accept());
  await del.getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(admin.getByText("Le nom recopié ne correspond pas : compte non supprimé.")).toBeVisible();
  await admin.getByTestId("form-suppression").locator('input[name="confirmEmail"]').fill(`${prenom.toLowerCase()}  kabila`);
  admin.once("dialog", (d) => d.accept());
  await admin.getByTestId("form-suppression").getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(admin.getByText(`Compte ${prenom} Kabila supprimé définitivement.`)).toBeVisible();
  await admin.goto(`/admin/utilisateurs?q=${encodeURIComponent(prenom)}`);
  await expect(admin.getByTestId("table-utilisateurs")).toContainText("Aucun compte ne correspond.");
  await adminCtx.close();
});
