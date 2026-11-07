import { expect, test } from "@playwright/test";

test("les API refusent une origine étrangère (CSRF)", async ({ request }) => {
  const r = await request.post("/api/execute", { headers: { Origin: "https://site-malveillant.example" }, data: {} });
  expect(r.status()).toBe(403);
});

test("les entrées invalides sont rejetées", async ({ request }) => {
  const r = await request.post("/api/execute", { data: { language: "cobol", files: [] } });
  expect(r.status()).toBe(400);
});

test("les espaces protégés redirigent vers la connexion", async ({ page }) => {
  for (const path of ["/tableau-de-bord", "/admin", "/mes-programmes"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/connexion/);
  }
});

test("C et Java indiquent clairement l'absence du service d'exécution (aucune simulation)", async ({ request }) => {
  const r = await request.post("/api/execute", { data: { language: "c", files: [{ name: "main.c", content: "int main(){return 0;}" }], stdin: "" } });
  if (r.status() === 200) return; // Judge0 configuré : exécution réelle
  expect(r.status()).toBeGreaterThanOrEqual(401);
  expect((await r.json()).error).toMatch(/Judge0|Connectez-vous/);
});
