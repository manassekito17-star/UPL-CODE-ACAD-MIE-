import { devices, expect, test } from "@playwright/test";

const ctx = (d: object) => {
  const o: Record<string, unknown> = { ...d };
  delete o.defaultBrowserType;
  return o;
};

test("page Télécharger : les trois applications avec leur icône, instructions iPhone", async ({ browser }) => {
  const context = await browser.newContext(ctx(devices["iPhone 13"]));
  const page = await context.newPage();
  await page.goto("/telecharger");
  for (const id of ["plateforme", "ide", "algo"]) {
    const carte = page.getByTestId(`appli-${id}`);
    await expect(carte.locator("img")).toBeVisible();
    // L'icône existe réellement (image chargée).
    expect(await carte.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth >= 180)).toBe(true);
    await expect(carte).toContainText("Sur l'écran d'accueil");
  }
  await expect(page.getByTestId("appli-ide").getByRole("link", { name: "Ouvrir UPL IDE" })).toHaveAttribute("href", "/ide?installer=1");
  await context.close();
});

test("page Télécharger sur Android : boutons d'installation de UPL IDE et UPL Algo", async ({ browser }) => {
  const context = await browser.newContext(ctx(devices["Pixel 7"]));
  const page = await context.newPage();
  await page.goto("/telecharger");
  await expect(page.getByTestId("appli-ide").getByRole("link", { name: "Installer UPL IDE" })).toHaveAttribute("href", "/ide?installer=1");
  await expect(page.getByTestId("appli-algo").getByRole("link", { name: "Installer UPL Algo" })).toHaveAttribute("href", "/editeur?langage=pseudocode&installer=1");
  await expect(page.getByTestId("appli-plateforme")).toContainText("Installer l'application");
  await context.close();
});

test("le lien d'installation ouvre directement la fenêtre d'installation de l'application", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode&installer=1");
  await expect(page.getByTestId("ide-hors-ligne")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("ide-hors-ligne")).toContainText("Installer UPL Algo");
  await page.goto("/ide?installer=1");
  await expect(page.getByTestId("ide-hors-ligne")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("ide-hors-ligne")).toContainText("Installer UPL IDE");
});
