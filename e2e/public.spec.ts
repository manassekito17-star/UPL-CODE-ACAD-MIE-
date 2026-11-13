import { expect, test } from "@playwright/test";

test("l'accueil présente l'académie et les huit parcours", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Apprendre à programmer");
  await page.goto("/formations");
  for (const title of ["Algorithmique et pseudocode", "HTML", "CSS", "Python", "Langage C", "JavaScript", "Java", "K+ — programmer en français"]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
});

test("une leçon affiche objectifs, contenu, exemple exécutable et résumé", async ({ page }) => {
  await page.goto("/formations/algorithmique/boucles");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boucles POUR, TANT QUE et RÉPÉTER");
  await expect(page.getByText("Objectifs pédagogiques")).toBeVisible();
  await expect(page.getByText("À retenir")).toBeVisible();
  await page.getByRole("button", { name: "▶ Exécuter" }).first().click();
  await expect(page.getByText("7 x 10 = 70")).toBeVisible();
});

test("une page inconnue renvoie 404", async ({ page }) => {
  const r = await page.goto("/formations/parcours-inexistant");
  expect(r?.status()).toBe(404);
});
