import { describe, expect, it } from "vitest";
import { scrollTargetFor } from "./page-scroll";

describe("balayage sur un éditeur intégré à une page", () => {
  it("code court (rien à faire défiler) : la page défile", () => {
    expect(scrollTargetFor(-120, 0, 300, 400)).toBe("page");
    expect(scrollTargetFor(120, 0, 300, 400)).toBe("page");
  });
  it("code long : le code défile tant qu'il n'est pas en butée", () => {
    expect(scrollTargetFor(-120, 0, 1600, 400)).toBe("editeur"); // doigt vers le haut, code en haut : le code descend
    expect(scrollTargetFor(120, 0, 1600, 400)).toBe("page"); // déjà en haut : la page remonte
    expect(scrollTargetFor(120, 500, 1600, 400)).toBe("editeur");
    expect(scrollTargetFor(-120, 1200, 1600, 400)).toBe("page"); // déjà en bas : la page continue
  });
});
