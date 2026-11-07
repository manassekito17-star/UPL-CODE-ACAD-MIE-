import { expect, test } from "@playwright/test";
import { isDemoMode, promoteToAdmin, signUpStudent } from "./helpers";

/** Lancement gratuit : limites affichées, consommation suivie, aucun service payant sans autorisation. */
test("le professeur IA affiche son état et ses limites ; l'administration suit la consommation", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const email = (await signUpStudent(page, "Budget Zéro"))!;

  const status = await (await page.request.get("/api/ai/status")).json();
  expect(status).toMatchObject({ available: true, billing: "test", plan: "gratuit" });
  expect(status.dailyLimit).toBeGreaterThan(0);
  expect(status.remainingToday).toBe(status.dailyLimit);

  await page.goto("/professeur-ia");
  await expect(page.getByTestId("ia-limites")).toContainText(`${status.dailyLimit} / ${status.dailyLimit} question(s) restante(s) aujourd'hui`);
  await expect(page.getByTestId("ia-limites")).toContainText("test, aucune IA");

  // Python et JavaScript : exécution dans le navigateur (aucun appel au service payant)
  const run = await page.request.post("/api/execute", { data: { language: "python", files: [{ name: "main.py", content: "print(1)" }], stdin: "" } });
  expect(run.status()).toBe(503);
  expect((await run.json()).fallback).toBe("navigateur");

  // Un étudiant n'accède pas au suivi de consommation
  await page.goto("/admin/consommation");
  await expect(page).not.toHaveURL(/\/admin\/consommation$/);

  await promoteToAdmin(email);
  await page.goto("/admin/consommation");
  await expect(page.getByRole("heading", { name: "Consommation et coûts" })).toBeVisible();
  const gauges = page.getByTestId("jauges-consommation");
  for (const label of ["Questions au professeur IA aujourd'hui", "Exécutions serveur (Judge0) aujourd'hui", "Base de données (Supabase Free)", "Fichiers stockés (Supabase Free)", "Utilisateurs actifs sur 30 jours"]) {
    await expect(gauges).toContainText(label);
  }
  await page.goto("/admin/parametres");
  await expect(page.getByLabel(/Autoriser un fournisseur d'IA/)).not.toBeChecked();
  await expect(page.getByLabel(/Python et JavaScript dans le navigateur/)).toBeChecked();
});
