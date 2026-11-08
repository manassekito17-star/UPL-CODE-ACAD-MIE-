import { describe, expect, it } from "vitest";
import { attributeBacktrack, tagToClose } from "./html-close";

describe("fermeture automatique des balises HTML", () => {
  it("ferme une balise ouvrante, avec ou sans attributs", () => {
    expect(tagToClose("  <p>", "")).toBe("p");
    expect(tagToClose('<div class="carte" id=\'a\'>', "")).toBe("div");
    expect(tagToClose('<a href="x>y">', "")).toBe("a");
  });
  it("ne ferme pas les balises vides, auto-fermantes ou déjà fermées", () => {
    expect(tagToClose("<br>", "")).toBeNull();
    expect(tagToClose('<img src="a.png">', "")).toBeNull();
    expect(tagToClose("<x-y/>", "")).toBeNull();
    expect(tagToClose("<p>", "</p>")).toBeNull();
    expect(tagToClose("</p>", "")).toBeNull();
    expect(tagToClose("a > b", "")).toBeNull();
    expect(tagToClose("<!-- note -->", "")).toBeNull();
  });
  it("place les attributs class/id dans la balise qui précède le curseur", () => {
    expect(attributeBacktrack("  <div>")).toBe(1);
    expect(attributeBacktrack('<a href="x">')).toBe(1);
    expect(attributeBacktrack("<div>texte")).toBe(0);
    expect(attributeBacktrack("<br/>")).toBe(0);
  });
});
