import { devices, expect, test } from "@playwright/test";

const ctx = (d: object) => {
  const o: Record<string, unknown> = { ...d };
  delete o.defaultBrowserType;
  return o;
};
const RELEASE = "https://github.com/manassekito17-star/UPL-CODE-ACAD-MIE-/releases/download/zynora-office-preview/";

test("page ZYNORA Office : téléchargements pour chaque système, sans connexion", async ({ browser }) => {
  // Page publique : contexte sans session.
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/zynora-office");
  await expect(page.getByRole("heading", { name: "ZYNORA Office", level: 1 })).toBeVisible();
  for (const [id, file] of [
    ["windows", "ZYNORA-Office-Windows-x64-setup.exe"],
    ["macos", "ZYNORA-Office-macOS-AppleSilicon.dmg"],
    ["linux", "ZYNORA-Office-Linux-x86_64.AppImage"],
    ["android", "ZYNORA-Office-Android-arm64-test.apk"],
  ] as const) {
    await expect(page.getByTestId(`plateforme-${id}`).locator(`a[href="${RELEASE}${file}"]`)).toBeVisible();
  }
  await expect(page.getByTestId("a-venir")).toContainText("ZYNORA Word");
  expect(await page.locator("img[alt='Icône ZYNORA Office']").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth >= 128)).toBe(true);
  await context.close();
});

test("page ZYNORA Office sur Android : l'APK est proposé en premier", async ({ browser }) => {
  const context = await browser.newContext({ ...ctx(devices["Pixel 7"]), storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/zynora-office");
  const first = page.getByTestId("telechargements").locator("[data-testid^='plateforme-']").first();
  await expect(first).toHaveAttribute("data-testid", "plateforme-android");
  await expect(first).toContainText("Votre appareil");
  await context.close();
});

test("page ZYNORA Office sur iPhone : absence de version iOS expliquée", async ({ browser }) => {
  const context = await browser.newContext({ ...ctx(devices["iPhone 13"]), storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/zynora-office");
  await expect(page.getByTestId("iphone")).toContainText("pas encore disponible");
  await context.close();
});

test("la page Télécharger renvoie vers ZYNORA Office", async ({ page }) => {
  await page.goto("/telecharger");
  await expect(page.getByTestId("appli-zynora").getByRole("link", { name: "Télécharger ZYNORA Office" })).toHaveAttribute("href", "/zynora-office");
});
