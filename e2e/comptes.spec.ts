import { expect, test } from "@playwright/test";
import { isDemoMode, promoteToAdmin, signUpStudent } from "./helpers";

/** Publication et comptes : Google, espace personnel, administration privée, sécurité. */

test("« Continuer avec Google » ouvre la page officielle de connexion Google", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await page.goto("/inscription");
  // Identifiants fictifs en test : on vérifie l'arrivée sur la page officielle de Google, sans se connecter.
  // (Une requête redirigée ne peut pas être interceptée : on lit l'adresse de la navigation.)
  let googleUrl = "";
  page.on("request", (r) => {
    if (r.isNavigationRequest() && r.url().startsWith("https://accounts.google.com/")) googleUrl ||= r.url();
  });
  await page.getByRole("button", { name: "Continuer avec Google" }).click();
  await expect.poll(() => googleUrl, { timeout: 30_000 }).toContain("accounts.google.com/o/oauth2");
  const u = new URL(googleUrl);
  expect(u.searchParams.get("client_id")).toBe("identifiant-de-test.apps.googleusercontent.com");
  expect(u.searchParams.get("redirect_uri")).toMatch(/\/auth\/v1\/callback$/);
  expect(u.searchParams.get("scope")).toContain("email");
  expect(u.searchParams.get("prompt")).toBe("select_account");

  // Le bouton est aussi présent sur la page de connexion ; l'annulation est expliquée.
  // Nouvel onglet : Google redirige ensuite l'onglet précédent vers sa page d'erreur (identifiants fictifs),
  // ce qui interromprait une navigation lancée dans le même onglet.
  const tab = await page.context().newPage();
  await page.close();
  await tab.goto("/connexion");
  await expect(tab.getByRole("button", { name: "Continuer avec Google" })).toBeVisible();
  await tab.goto("/auth/callback?error=access_denied");
  await expect(tab.getByText("Connexion Google annulée ou refusée.")).toBeVisible();
});

test("espace personnel, administration privée, statistiques et export", async ({ page, browser }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const email = (await signUpStudent(page, "Marie Administratrice"))!;

  // Espace personnel : identité et accès aux rubriques
  await page.goto("/tableau-de-bord");
  await expect(page.getByTestId("identite-etudiant")).toContainText(email);
  for (const name of ["Mes cours", "Ma progression", "Mes exercices", "Mes projets", "Historique et bulletin", "Paramètres du compte"]) {
    await expect(page.getByRole("navigation", { name: "Mon espace" }).getByRole("link", { name })).toBeVisible();
  }

  // Un étudiant n'accède ni à /admin ni aux exports
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin$/);
  expect((await page.request.get("/admin/export/utilisateurs")).status()).toBe(403);
  // …et ne peut pas devenir administrateur en écrivant lui-même dans la base
  const res = await page.request.get("/api/ai/status");
  expect(res.ok()).toBe(true);

  // Premier administrateur : procédure serveur (clé secrète, hors navigateur)
  await promoteToAdmin(email);
  await page.goto("/admin");
  const kpi = page.getByTestId("indicateurs-admin");
  for (const label of ["Comptes créés", "Utilisateurs actifs (30 j)", "En ligne maintenant", "Inscrits aujourd'hui", "Inscrits (7 derniers jours)", "Inscrits ce mois-ci"]) await expect(kpi).toContainText(label);
  await expect(page.getByTestId("graphique-inscriptions")).toBeVisible();
  await expect(page.getByTestId("graphique-activite")).toBeVisible();

  // Export CSV (sans mot de passe ni jeton)
  const csv = await (await page.request.get("/admin/export/utilisateurs")).text();
  expect(csv).toContain("Nom;E-mail;Connexion;Inscription;Dernière visite;Statut;Offre");
  expect(csv).toContain(email);
  expect(csv.toLowerCase()).not.toMatch(/password|mot de passe|token|jeton/);
  expect(await (await page.request.get("/admin/export/statistiques")).text()).toContain("Jour (UTC);Inscriptions;Utilisateurs actifs");

  // Panneau d'administration : menu latéral, tableau de bord et activité
  await expect(page.getByTestId("panneau-admin").getByRole("navigation")).toContainText("Utilisateurs");
  await expect(page.getByTestId("activite-recente")).toBeVisible();

  // Gestion des utilisateurs : recherche par e-mail, fiche, suspension temporaire avec motif
  const other = await browser.newContext();
  const p2 = await other.newPage();
  const otherEmail = (await signUpStudent(p2, "Étudiant Suspendu"))!;
  await p2.goto("/formations/algorithmique"); // une activité à suivre
  await page.goto(`/admin/utilisateurs?q=${encodeURIComponent(otherEmail)}`);
  const row = page.getByTestId("table-utilisateurs").getByRole("row").filter({ hasText: otherEmail });
  await expect(row).toContainText("E-mail");
  await expect(row).toContainText("Actif");
  await row.getByRole("link", { name: "Voir" }).click();
  await expect(page.getByTestId("fiche-utilisateur")).toContainText(otherEmail);
  await expect(page.getByTestId("resume-utilisateur")).toContainText("Chapitres terminés");
  await expect(page.getByTestId("activite-utilisateur")).toContainText("inscription");
  const suspension = page.getByTestId("form-suspension");
  await suspension.locator('select[name="duration"]').selectOption("7j");
  await suspension.locator('input[name="reason"]').fill("Test de suspension");
  page.once("dialog", (d) => d.accept());
  await suspension.getByRole("button", { name: "Suspendre" }).click();
  await expect(page.getByText("Compte suspendu (7 jours).")).toBeVisible();
  await expect(page.getByTestId("fiche-utilisateur")).toContainText("Suspendu jusqu'au");
  await p2.goto("/tableau-de-bord");
  await expect(p2).toHaveURL(/connexion|compte-suspendu/);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Réactiver maintenant" }).click();
  await expect(page.getByText("Compte réactivé.")).toBeVisible();
  await other.close();

  // Activité globale
  await page.goto("/admin/activite");
  await expect(page.getByTestId("activite-globale")).toContainText("Étudiant Suspendu");

  // Suppression définitive : l'adresse e-mail doit être recopiée
  const third = await browser.newContext();
  const p3 = await third.newPage();
  const thirdEmail = (await signUpStudent(p3, "Étudiant À Supprimer"))!;
  await third.close();
  await page.goto(`/admin/utilisateurs?q=${encodeURIComponent(thirdEmail)}`);
  await page.getByTestId("table-utilisateurs").getByRole("row").filter({ hasText: thirdEmail }).getByRole("link", { name: "Voir" }).click();
  const del = page.getByTestId("form-suppression");
  await del.locator('input[name="confirmEmail"]').fill("mauvaise@adresse.cd");
  page.once("dialog", (d) => d.accept());
  await del.getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(page.getByText("ne correspond pas : compte non supprimé")).toBeVisible();
  await page.getByTestId("form-suppression").locator('input[name="confirmEmail"]').fill(thirdEmail);
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("form-suppression").getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(page).toHaveURL(/\/admin\/utilisateurs\?message=/);
  await expect(page.getByText(`Compte ${thirdEmail} supprimé définitivement.`)).toBeVisible();
  await page.goto(`/admin/utilisateurs?q=${encodeURIComponent(thirdEmail)}`);
  await expect(page.getByTestId("table-utilisateurs")).toContainText("Aucun compte ne correspond.");

  // Journal d'audit
  await page.goto("/admin/journaux");
  await expect(page.locator("main")).toContainText("utilisateur.suspendu");
  await expect(page.locator("main")).toContainText("utilisateur.supprime");
  await expect(page.locator("main")).toContainText("export.csv");
});

test("aperçu de lien partagé (WhatsApp, Facebook, Telegram, Gmail) et robots", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "UPL CODE ACADEMY MK");
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toMatch(/^https?:\/\/.+\/opengraph-image/);
  const img = await request.get(new URL(image!).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});

test("après l'envoi d'un e-mail, un bouton ouvre la boîte de réception du fournisseur", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await page.goto("/mot-de-passe-oublie");
  await page.getByLabel("Adresse e-mail").fill(`inconnu.${Date.now()}@gmail.com`);
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  const link = page.getByRole("link", { name: /Ouvrir ma boîte Gmail/ });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "https://mail.google.com/mail/u/0/#inbox");
  await expect(link).toHaveAttribute("target", "_blank");
});
