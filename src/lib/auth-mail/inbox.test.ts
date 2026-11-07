import { describe, expect, it } from "vitest";
import { inboxFor } from "./inbox";

describe("boîte de réception d'après l'adresse", () => {
  it("reconnaît les fournisseurs courants", () => {
    expect(inboxFor("prenom@gmail.com")?.provider).toBe("Gmail");
    expect(inboxFor(" Prenom@Hotmail.FR ")?.provider).toBe("Outlook");
    expect(inboxFor("a@yahoo.fr")?.provider).toBe("Yahoo Mail");
    expect(inboxFor("a@icloud.com")?.url).toContain("icloud.com");
  });
  it("ne propose rien pour un domaine inconnu ou une adresse invalide", () => {
    expect(inboxFor("etudiant@upl-univ.ac.cd")).toBeNull();
    expect(inboxFor("pas-une-adresse")).toBeNull();
  });
});
