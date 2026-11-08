import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout. Prérequis : `npm run build`.
 * Le serveur de production est lancé automatiquement sur le port 3100.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    // Connexion obligatoire sur la plateforme : session d'un étudiant de test partagée par les tests.
    { name: "connexion", testMatch: /auth\.setup\.ts/ },
    { name: "ordinateur", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 }, storageState: "e2e/.auth/etudiant.json" }, testIgnore: /mobile\.spec/, dependencies: ["connexion"] },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", storageState: "e2e/.auth/etudiant.json" }, testMatch: /mobile\.spec/, dependencies: ["connexion"] },
  ],
  webServer: {
    command: "npx next start -p 3100",
    // Les tests créent plusieurs comptes depuis la même adresse IP.
    // Professeur IA de test (déterministe, aucune IA appelée) : vérifie le câblage du contexte.
    env: { AUTH_RATE_LIMIT_PER_10MIN: "200", AI_PROVIDER: "test", UPL_ALLOW_TEST_AI: "true" },
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
