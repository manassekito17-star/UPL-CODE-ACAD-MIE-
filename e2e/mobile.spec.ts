import { expect, test } from "@playwright/test";

for (const path of ["/", "/formations", "/formations/python/fonctions", "/exercices", "/exercices/algo-mention", "/editeur"]) {
  test(`pas de défilement horizontal sur ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("sur téléphone : consignes, code et console sont accessibles", async ({ page }) => {
  await page.goto("/exercices/algo-somme-deux-nombres");
  await expect(page.getByRole("tab", { name: "consignes" })).toBeVisible();
  await expect(page.getByText("Lisez deux entiers").filter({ visible: true })).toBeVisible();
  await page.getByRole("tab", { name: "code" }).click();
  await page.locator(".monaco-editor").waitFor();
  await page.getByRole("button", { name: "▶ Exécuter" }).click();
  await expect(page.getByRole("tab", { name: "console" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Exécution terminée").filter({ visible: true })).toBeVisible();
});
