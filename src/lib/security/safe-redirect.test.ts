import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("chemin de retour après connexion", () => {
  it("accepte les pages du site", () => {
    expect(safeRedirectPath("/ide")).toBe("/ide");
    expect(safeRedirectPath("/ide?projet=abc#x")).toBe("/ide?projet=abc#x");
    expect(safeRedirectPath("/formations/python/fonctions")).toBe("/formations/python/fonctions");
  });
  it("refuse les redirections vers un autre site", () => {
    for (const v of ["https://pirate.cd", "//pirate.cd", "/\\pirate.cd", "/\\/pirate.cd", "javascript:alert(1)", "/\u0000//pirate.cd", " /ide", "", null, undefined, 42]) {
      expect(safeRedirectPath(v)).toBe("/tableau-de-bord");
    }
  });
});
