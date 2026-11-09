import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { isDemoMode, promoteToAdmin, signUpStudent } from "./helpers";

test.use({ storageState: { cookies: [], origins: [] } });

/** Code à 6 chiffres (RFC 6238, 30 s, SHA-1) calculé comme une application d'authentification. */
function totp(secretBase32: string, offset = 0): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secretBase32.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offset));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

test.setTimeout(120_000);

test("administrateur : activation du second facteur puis code exigé à la connexion", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const email = (await signUpStudent(page, "Admin Double Facteur"))!;
  await promoteToAdmin(email);

  await page.goto("/admin/securite");
  await page.getByRole("button", { name: "Activer le second facteur" }).click();
  const secret = (await page.getByTestId("mfa-secret").innerText()).replace(/\s+/g, "");
  const enrolledWindow = Math.floor(Date.now() / 30000);
  await page.getByLabel("Code à 6 chiffres").fill(totp(secret));
  await page.getByRole("button", { name: "Confirmer l'activation" }).click();
  // Message exact de réussite (« Non activé » est déjà affiché sur la page avant la confirmation).
  await expect(page.getByText("Second facteur activé", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("mfa-statut")).toContainText("Activé");

  // Nouvelle connexion : le panneau d'administration demande le code.
  await page.context().clearCookies();
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("Algorithme2026");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/tableau-de-bord/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/verification-mfa/);
  expect((await page.request.get("/admin/export/utilisateurs")).status()).toBe(403);

  // Mauvais code refusé, bon code accepté.
  await page.getByLabel("Code à 6 chiffres").fill("000000");
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText(/Code incorrect/)).toBeVisible();
  // Un code ne sert qu'une fois : on attend la période suivante de 30 secondes.
  while (Math.floor(Date.now() / 30000) === enrolledWindow) await page.waitForTimeout(1000);
  await page.getByLabel("Code à 6 chiffres").fill(totp(secret));
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId("panneau-admin")).toBeVisible();
});
