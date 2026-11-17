import { expect, test } from "@playwright/test";

/** Nom officiel : « ZiTECH » partout (slogan BUILD BEYOND LIMITS), aucune ancienne appellation visible. */
const PAGES = ["/", "/laboratoire", "/formations", "/formation", "/formations/algorithmique", "/formations/html/html-introduction-web", "/exercices", "/connexion", "/inscription", "/certificats/deadbeefdeadbeef"];
// Anciennes appellations de marque (les mentions de l'université dans l'avis restent autorisées).
const OLD = /UPL CODE|UPL IDE|UPL Algo|UPL Flow|Academy MK|ACADEMY MK|LEARN\. CODE\./i;

for (const path of PAGES) {
  test(`nom officiel sur ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(/ZiTECH/);
    await expect(page.getByRole("link", { name: "ZiTECH — accueil" }).first()).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(OLD);
    expect(text).toContain("BUILD BEYOND LIMITS");
  });
}

test("métadonnées et manifeste d'application", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute("content", "ZiTECH");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "ZiTECH");
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.name).toBe("ZiTECH");
  expect(m.theme_color).toBe("#020817");
  // Logo officiel : fichiers vectoriels et image de partage.
  for (const f of ["/brand/zitech-symbole.svg", "/brand/zitech-logo-horizontal-blanc.svg", "/brand/zitech-logo-vertical-sombre.svg", "/favicon.ico", "/icons/site-512.png"]) expect((await request.get(f)).status(), f).toBe(200);
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("le résumé PDF porte le nouveau nom", async ({ request }) => {
  const r = await request.get("/formations/algorithmique/introduction-algorithmique/resume");
  expect(r.status()).toBe(200);
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(await r.body());
  expect(doc.getAuthor()).toBe("ZiTECH");
  expect(doc.getCreator()).toBe("ZiTECH");
});
