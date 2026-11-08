import { expect, test } from "@playwright/test";

for (const path of ["/", "/ide", "/laboratoire", "/formations", "/formations/python/fonctions", "/formations/algorithmique", "/formations/algorithmique/niveaux/1", "/formations/html/html-liens-images", "/formations/algorithmique/positionnement", "/exercices", "/exercices/algo-mention", "/exercices/css-carte-boite", "/editeur", "/editeur?langage=html", "/confidentialite", "/conditions"]) {
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

test("sur téléphone : un balayage commencé sur un éditeur fait défiler la page (sans blocage)", async ({ page, context }) => {
  await page.goto("/editeur");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  const cdp = await context.newCDPSession(page);
  const swipe = async (y1: number, y2: number) => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: y1 }] });
    for (let i = 1; i <= 12; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y: y1 + ((y2 - y1) * i) / 12 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  const top = await page.evaluate(() => document.querySelector(".monaco-editor")!.getBoundingClientRect().top);
  const viewport = page.viewportSize()!.height;
  const y = Math.min(viewport - 40, top + 200);
  await swipe(y, y - 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  const after = await page.evaluate(() => scrollY);
  const top2 = await page.evaluate(() => document.querySelector(".monaco-editor")!.getBoundingClientRect().top);
  await swipe(Math.max(top2 + 30, 80), Math.max(top2 + 30, 80) + 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(after);
});
