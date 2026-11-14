import { describe, expect, it } from "vitest";
import { nextPopup, oldEnoughToRate } from "./announcement";

describe("note sur 5 étoiles proposée après 7 jours d'utilisation", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");
  it("compte récent : pas encore", () => {
    expect(oldEnoughToRate("2026-11-14T12:00:01Z", now)).toBe(false);
    expect(oldEnoughToRate(null, now)).toBe(false);
  });
  it("compte de 7 jours ou plus : oui", () => {
    expect(oldEnoughToRate("2026-11-13T12:00:00Z", now)).toBe(true);
    expect(oldEnoughToRate("2025-01-01T00:00:00Z", now)).toBe(true);
  });
});


describe("enchaînement des fenêtres : une par visite", () => {
  const base = { loggedIn: true, welcomeSeen: false, canRate: true, ratingAsked: false, importantSeen: false, shownThisVisit: false };
  it("ancien utilisateur : bienvenue, puis avis, puis avis important, puis plus rien", () => {
    expect(nextPopup(base)).toBe("annonce");
    expect(nextPopup({ ...base, welcomeSeen: true })).toBe("avis");
    expect(nextPopup({ ...base, welcomeSeen: true, ratingAsked: true })).toBe("important");
    expect(nextPopup({ ...base, welcomeSeen: true, ratingAsked: true, importantSeen: true })).toBeNull();
  });
  it("nouveau compte (moins de 7 jours) : bienvenue puis avis important ; la note viendra plus tard", () => {
    const n = { ...base, canRate: false };
    expect(nextPopup(n)).toBe("annonce");
    expect(nextPopup({ ...n, welcomeSeen: true })).toBe("important");
    expect(nextPopup({ ...n, welcomeSeen: true, importantSeen: true })).toBeNull();
    expect(nextPopup({ ...base, welcomeSeen: true, importantSeen: true })).toBe("avis");
  });
  it("une seule fenêtre par visite ; visiteur non connecté : avis important seulement", () => {
    expect(nextPopup({ ...base, shownThisVisit: true })).toBeNull();
    expect(nextPopup({ ...base, loggedIn: false })).toBe("important");
    expect(nextPopup({ ...base, loggedIn: false, importantSeen: true })).toBeNull();
  });
});
