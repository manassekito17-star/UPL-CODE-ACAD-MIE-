import { describe, expect, it } from "vitest";
import { fullNameOf, quickProfileSchema } from "./quick-access";

const base = { last_name: "Kito", first_name: "Manassé", position: "etudiant", sex: "masculin", faculty: "Informatique" };

describe("accès rapide : validation du profil", () => {
  it("accepte un profil complet et compose le nom", () => {
    const r = quickProfileSchema.parse(base);
    expect(r).toEqual({ last_name: "Kito", first_name: "Manassé", position: "etudiant", sex: "masculin", faculty: "Informatique" });
    expect(fullNameOf(r)).toBe("Manassé Kito");
  });
  it("filière personnalisée", () => {
    expect(quickProfileSchema.parse({ ...base, faculty: "autre", faculty_other: "Agronomie" }).faculty).toBe("Agronomie");
    expect(quickProfileSchema.safeParse({ ...base, faculty: "autre", faculty_other: "" }).success).toBe(false);
  });
  it("refuse un poste ou un rôle inventé (administrateur) et un sexe hors liste", () => {
    expect(quickProfileSchema.safeParse({ ...base, position: "administrateur" }).success).toBe(false);
    expect(quickProfileSchema.safeParse({ ...base, sex: "x" }).success).toBe(false);
  });
  it("refuse les noms vides, trop longs ou contenant du code", () => {
    expect(quickProfileSchema.safeParse({ ...base, last_name: " " }).success).toBe(false);
    expect(quickProfileSchema.safeParse({ ...base, first_name: "<script>" }).success).toBe(false);
    expect(quickProfileSchema.safeParse({ ...base, last_name: "a".repeat(61) }).success).toBe(false);
    expect(quickProfileSchema.parse({ ...base, faculty: "autre", faculty_other: "<b>Droit</b>" }).faculty).toBe("bDroit/b");
  });
});
