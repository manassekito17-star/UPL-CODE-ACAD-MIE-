import { describe, expect, it } from "vitest";
import { isPublicPath } from "./proxy";

describe("connexion obligatoire : pages publiques", () => {
  it("laisse publiques l'accueil, la connexion, les pages légales, les API et les fichiers techniques", () => {
    for (const p of ["/", "/connexion", "/inscription", "/mot-de-passe-oublie", "/confidentialite", "/conditions", "/auth/callback", "/api/sante", "/certificats/abc", "/sw.js", "/ide.webmanifest", "/workers/python-worker.mjs", "/opengraph-image"]) {
      expect(isPublicPath(p), p).toBe(true);
    }
  });
  it("protège tout le reste de la plateforme", () => {
    for (const p of ["/formations", "/formations/python", "/exercices", "/ide", "/editeur", "/laboratoire", "/professeur-ia", "/tableau-de-bord", "/admin", "/connexion-piege", "/apiX"]) {
      expect(isPublicPath(p), p).toBe(false);
    }
  });
});
