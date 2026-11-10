import { expect, test } from "@playwright/test";
import { setEditorCode, signUpStudent } from "./helpers";

/** Parcours K+ et formation « Sites web dynamiques avec K+ » (vrai moteur K+ dans le navigateur). */

test("le parcours K+ figure au catalogue avec ses deux modules rédigés", async ({ page }) => {
  await page.goto("/formations");
  await expect(page.getByRole("heading", { name: "K+ — programmer en français", exact: true })).toBeVisible();
  await page.goto("/formations/kplus");
  await expect(page.getByText("Les bases du langage K+").first()).toBeVisible();
  await expect(page.getByText("Sites web dynamiques avec K+").first()).toBeVisible();
});

test("une leçon K+ Web affiche une page utilisable : saisie, clic, réponse du moteur", async ({ page }) => {
  await page.goto("/formations/kplus/kplus-web-interactions");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boutons et champs de saisie");
  await page.getByRole("button", { name: "▶ Exécuter" }).first().click();
  const site = page.getByTestId("kplus-page").first();
  await expect(site).toBeVisible({ timeout: 90_000 });
  await expect(site.getByRole("heading", { name: "Calculatrice du double" })).toBeVisible();
  await site.getByLabel("Votre nombre").fill("3.5");
  await site.getByRole("button", { name: "Calculer" }).click();
  await expect(site.getByText("Le double est 7.0")).toBeVisible();
  await site.getByLabel("Votre nombre").fill("abc");
  await site.getByRole("button", { name: "Calculer" }).click();
  await expect(site.getByText("Écrivez un nombre, par exemple 3.5")).toBeVisible();
});

test("un exercice de site web K+ est corrigé par scénario : réussi, puis échoué avec la différence", async ({ page }) => {
  await signUpStudent(page);
  await page.goto("/exercices/kplus-web-salutation");
  const juste = [
    "utiliser web",
    'titre("Salutation")',
    'variable nom = champ("Votre nom")',
    'variable reponse = paragraphe("")',
    "fonction saluer()",
    '    si valeur(nom) == "" alors',
    '        changer_texte(reponse, "Écrivez votre nom.")',
    "    sinon",
    '        changer_texte(reponse, "Bonjour " + valeur(nom) + " !")',
    "    fin",
    "fin",
    'bouton("Saluer", saluer)',
  ].join("\n");
  await setEditorCode(page, juste);
  await page.getByRole("button", { name: "✓ Soumettre" }).click();
  await expect(page.getByText("Bravo, exercice réussi !")).toBeVisible({ timeout: 90_000 });

  // Oubli du cas « champ vide » : le correcteur le détecte.
  await setEditorCode(page, juste.replace('"Écrivez votre nom."', '"Bonjour  !"'));
  await page.getByRole("button", { name: "✓ Soumettre" }).click();
  await expect(page.getByText(/\d\/\d test\(s\) réussi\(s\)/)).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("Bravo, exercice réussi !")).toHaveCount(0);
});
