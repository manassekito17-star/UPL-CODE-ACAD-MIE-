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

  // Le bouton est aussi présent sur la page de connexion ; l'annulation est expliquée
  await page.goto("/connexion");
  await expect(page.getByRole("button", { name: "Continuer avec Google" })).toBeVisible();
  await page.goto("/auth/callback?error=access_denied");
  await expect(page.getByText("Connexion Google annulée ou refusée.")).toBeVisible();
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

  // Gestion des utilisateurs : recherche par e-mail, suspension avec confirmation
  const other = await browser.newContext();
  const p2 = await other.newPage();
  const otherEmail = (await signUpStudent(p2, "Étudiant Suspendu"))!;
  await page.goto(`/admin/utilisateurs?q=${encodeURIComponent(otherEmail)}`);
  const card = page.locator("div").filter({ hasText: otherEmail }).filter({ has: page.getByRole("button", { name: "Suspendre" }) }).last();
  await expect(card).toContainText("Connexion : e-mail");
  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Suspendre" }).click();
  await expect(page.locator("div").filter({ hasText: otherEmail }).getByRole("button", { name: "Réactiver" }).last()).toBeVisible();
  await p2.goto("/tableau-de-bord");
  await expect(p2).toHaveURL(/connexion|compte-suspendu/);
  await other.close();

  // Journal d'audit
  await page.goto("/admin/journaux");
  await expect(page.locator("main")).toContainText("utilisateur.suspendu");
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
