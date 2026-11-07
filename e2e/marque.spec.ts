import { expect, test } from "@playwright/test";

/** Nom officiel : « UPL CODE ACADEMY MK » partout, aucune ancienne appellation visible. */
const PAGES = ["/", "/laboratoire", "/formations", "/formation", "/formations/algorithmique", "/formations/html/html-introduction-web", "/exercices", "/editeur", "/connexion", "/inscription", "/certificats/deadbeefdeadbeef"];
const OLD = /UPL Code Academy(?! MK)|UPL CODE ACADEMY(?! MK)/i;

for (const path of PAGES) {
  test(`nom officiel sur ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(/UPL CODE ACADEMY MK/);
    await expect(page.getByRole("link", { name: "UPL CODE ACADEMY MK — accueil" }).first()).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(OLD);
    expect(text).toContain("MK");
  });
}

test("métadonnées et manifeste d'application", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute("content", "UPL CODE ACADEMY MK");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "UPL CODE ACADEMY MK");
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.name).toBe("UPL CODE ACADEMY MK");
});

test("le résumé PDF porte le nouveau nom", async ({ request }) => {
  const r = await request.get("/formations/algorithmique/introduction-algorithmique/resume");
  expect(r.status()).toBe(200);
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(await r.body());
  expect(doc.getAuthor()).toBe("UPL CODE ACADEMY MK");
  expect(doc.getCreator()).toBe("UPL CODE ACADEMY MK");
});
