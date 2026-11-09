import { expect, test } from "@playwright/test";
import { isDemoMode } from "./helpers";

// Visiteur sans compte.
test.use({ storageState: { cookies: [], origins: [] } });

test("les API refusent une origine étrangère (CSRF)", async ({ request }) => {
  const r = await request.post("/api/execute", { headers: { Origin: "https://site-malveillant.example" }, data: {} });
  expect(r.status()).toBe(403);
});

test("les entrées invalides sont rejetées", async ({ request }) => {
  const r = await request.post("/api/execute", { data: { language: "cobol", files: [] } });
  expect(r.status()).toBe(400);
});

test("connexion obligatoire : toute la plateforme mène à la connexion, sauf les pages publiques", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  for (const path of ["/tableau-de-bord", "/admin", "/mes-programmes", "/formations", "/formations/algorithmique", "/exercices", "/editeur", "/ide", "/laboratoire", "/professeur-ia", "/formation"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/connexion\?suite=/);
  }
  await expect(page.getByTestId("connexion-requise")).toContainText("Gmail");
  for (const path of ["/", "/connexion", "/inscription", "/confidentialite", "/conditions"]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/$" : path}`));
  }
  expect((await page.request.get("/api/sante")).status()).toBe(200);
});

test("C et Java indiquent clairement l'absence du service d'exécution (aucune simulation)", async ({ request }) => {
  const r = await request.post("/api/execute", { data: { language: "c", files: [{ name: "main.c", content: "int main(){return 0;}" }], stdin: "" } });
  if (r.status() === 200) return; // Judge0 configuré : exécution réelle
  expect(r.status()).toBeGreaterThanOrEqual(401);
  expect((await r.json()).error).toMatch(/Judge0|Connectez-vous/);
});

test("en-têtes de sécurité : CSP complète, HSTS, aucune signature du serveur", async ({ request }) => {
  const r = await request.get("/connexion");
  const h = r.headers();
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(h["content-security-policy"]).toContain("https://accounts.google.com");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("redirection après connexion : jamais vers un autre site", async ({ page }) => {
  const r = await page.request.get(`/auth/callback?code=x&suite=${encodeURIComponent("/\\site-malveillant.example")}`, { maxRedirects: 0 });
  expect(r.headers()["location"] ?? "").not.toContain("site-malveillant");
});

test("diagnostic public minimal : aucun détail technique pour les visiteurs", async ({ request }) => {
  const r = await request.get("/api/sante");
  const body = await r.json();
  expect(Object.keys(body)).toEqual(["ok"]);
});

test("la politique de sécurité (CSP) ne bloque rien sur les pages publiques", async ({ page }) => {
  const refus: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) refus.push(m.text());
  });
  for (const path of ["/", "/connexion", "/inscription", "/confidentialite"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(refus).toEqual([]);
});

test("navigateur intégré (WhatsApp) : conseil d'ouvrir Chrome, connexion e-mail toujours disponible", async ({ browser }) => {
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Linux; Android 13; SM-A135F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 WhatsApp/2.23.20",
  });
  const page = await ctx.newPage();
  await page.goto("/connexion");
  test.skip((await page.getByRole("button", { name: /Continuer avec Google/ }).count()) === 0, "Connexion Google non configurée");
  await expect(page.getByTestId("navigateur-integre")).toContainText("WhatsApp");
  await expect(page.getByRole("link", { name: "Ouvrir dans Chrome" })).toHaveAttribute("href", /^intent:\/\//);
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
  await ctx.close();
});

test("navigateur normal : aucun avertissement", async ({ page }) => {
  await page.goto("/connexion");
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
  await expect(page.getByTestId("navigateur-integre")).toHaveCount(0);
});
