import { test as setup } from "@playwright/test";
import { signUpStudent } from "./helpers";

/**
 * La plateforme demande une connexion : un compte étudiant de test est créé une fois,
 * et sa session est réutilisée par les tests (fichier non versionné).
 * En mode démonstration (sans Supabase), la session est vide et rien n'est protégé.
 */
export const AUTH_FILE = "e2e/.auth/etudiant.json";

setup("compte étudiant de test", async ({ page }) => {
  await signUpStudent(page, "Étudiant E2E");
  await page.context().storageState({ path: AUTH_FILE });
});
