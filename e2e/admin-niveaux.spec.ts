import { expect, test } from "@playwright/test";
import { isDemoMode, promoteToAdmin, signUpStudent } from "./helpers";

/** Administration pédagogique : niveaux, critères, examens, positionnement, ressources, statistiques. */
test("l'équipe pédagogique définit un examen de niveau, ses critères et des ressources de chapitre", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const email = (await signUpStudent(page, "Admin Pédagogie"))!;
  await promoteToAdmin(email);

  await page.goto("/admin/formations/java");
  await page.getByRole("link", { name: /Niveaux, critères, examens/ }).click();
  await expect(page.getByTestId("stats-niveaux")).toContainText("Positionnés ici");

  // Niveau 4 de Java : pas d'examen au départ → on en crée un
  const n4 = page.getByTestId("admin-niveau-4");
  await n4.getByLabel("Note minimale à l'examen (%)").fill("80");
  await n4.getByLabel("Examen de fin de niveau").fill("? Quel outil exécute des tests unitaires en Java ?\n+ JUnit\n- Maven\n> JUnit est la bibliothèque de tests de référence.\n\n? Une interface peut-elle avoir plusieurs implémentations ?\n+ Oui\n- Non");
  await n4.getByRole("button", { name: "Enregistrer le niveau 4" }).click();
  await expect(n4).toContainText("Niveau 4 enregistré avec un examen de 2 question(s)");

  await page.goto("/formations/java/niveaux/4");
  await expect(page.getByTestId("criteres-niveau")).toContainText("au moins 80 %");
  await expect(page.locator("section#examen")).toContainText("Quel outil exécute des tests unitaires en Java ?");

  // Positionnement : chaque question doit porter son niveau
  await page.goto("/admin/formations/java/niveaux");
  await page.getByLabel("Questions du test de positionnement").fill("? Question sans niveau\n+ a\n- b");
  await page.getByRole("button", { name: "Enregistrer le test de positionnement" }).click();
  await expect(page.getByText("sans « @ niveau n »")).toBeVisible();

  // Ressources de chapitre : lien https, fichier PDF, lien dangereux refusé (titres uniques : test rejouable)
  const doc = `Documentation officielle ${Date.now()}`;
  const fiche = `Fiche de cours PDF ${Date.now()}`;
  await page.goto("/admin/formations/java");
  await page.getByRole("link", { name: "Présentation de Java" }).first().click();
  const res = page.getByTestId("ressources-lecon");
  await res.getByLabel("Titre").fill(doc);
  await res.getByLabel("Adresse (https://…)").fill("https://docs.oracle.com/javase/tutorial/");
  await res.getByRole("button", { name: "Ajouter la ressource" }).click();
  await expect(res).toContainText("Ressource ajoutée.");

  await res.getByLabel("Type").selectOption("document");
  await res.getByLabel("Titre").fill(fiche);
  await res.getByLabel("Adresse (https://…)").fill("");
  await res.getByLabel("… ou fichier (20 Mo max.)").setInputFiles({ name: "fiche.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%fiche de test\n") });
  await res.getByRole("button", { name: "Ajouter la ressource" }).click();
  await expect(res.getByRole("link", { name: fiche })).toBeVisible();

  await res.getByLabel("Titre").fill("Lien piégé");
  await res.getByLabel("… ou fichier (20 Mo max.)").setInputFiles([]);
  await res.getByLabel("Adresse (https://…)").evaluate((el) => el.setAttribute("type", "text"));
  await res.getByLabel("Adresse (https://…)").fill("javascript:alert(1)");
  await res.getByRole("button", { name: "Ajouter la ressource" }).click();
  await expect(res).toContainText("L'adresse doit commencer par https://");

  await page.goto("/formations/java/presentation");
  const section = page.locator("section#ressources");
  await expect(section.getByRole("link", { name: doc })).toHaveAttribute("href", "https://docs.oracle.com/javase/tutorial/");
  const pdfHref = await section.getByRole("link", { name: fiche }).getAttribute("href");
  expect((await page.request.get(pdfHref!)).status()).toBe(200);
});
