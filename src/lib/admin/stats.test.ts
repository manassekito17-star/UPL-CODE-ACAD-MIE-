import { describe, expect, it } from "vitest";
import { csvCell, loginMethods, toCsv } from "./stats";

describe("export CSV de l'administration", () => {
  it("échappe les séparateurs et neutralise les formules de tableur", () => {
    expect(csvCell('Dupont; "Jean"')).toBe('"Dupont; ""Jean"""');
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe(`"'=HYPERLINK(""http://x"")"`);
    expect(csvCell("+33 6")).toBe("'+33 6");
    expect(csvCell(null)).toBe("");
  });
  it("produit un fichier lisible par Excel (BOM UTF-8, en-têtes)", () => {
    const csv = toCsv([{ nom: "Émile", n: 3 }], [["nom", "Nom"], ["n", "Nombre"]]);
    expect(csv.startsWith("﻿Nom;Nombre\r\nÉmile;3\r\n")).toBe(true);
  });
  it("méthodes de connexion sans doublon", () => {
    expect(loginMethods({ app_metadata: { provider: "email", providers: ["email", "google"] }, identities: [{ provider: "google" }] })).toEqual(["email", "google"]);
  });
});
