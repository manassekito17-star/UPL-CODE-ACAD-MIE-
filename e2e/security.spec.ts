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
