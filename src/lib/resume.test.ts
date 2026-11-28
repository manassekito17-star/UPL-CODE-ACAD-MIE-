import { describe, expect, it } from "vitest";
import { appOf, remember, target } from "./resume";

describe("reprendre là où j'en étais", () => {
  it("garde la dernière page de travail, par application", () => {
    let s = remember({}, "/ide?projet=abc", 1000);
    s = remember(s, "/flow/classique", 2000);
    expect(target(s, null, 3000)).toBe("/flow/classique");
    expect(target(s, "ide", 3000)).toBe("/ide?projet=abc");
    expect(target(s, "editeur", 3000)).toBeNull();
    expect(appOf("/editeur?langage=python")).toBe("editeur");
  });
  it("ignore la connexion, l'accueil et la reprise elle-même ; oublie après 30 jours", () => {
    let s = remember({}, "/texte", 0);
    for (const u of ["/", "/connexion?suite=/ide", "/reprendre", "/auth/callback", "//pirate.example"]) s = remember(s, u, 10);
    expect(target(s, null, 10)).toBe("/texte");
    expect(target(s, null, 31 * 86_400_000)).toBeNull();
  });
});
