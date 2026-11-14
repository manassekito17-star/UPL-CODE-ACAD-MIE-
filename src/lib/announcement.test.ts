import { describe, expect, it } from "vitest";
import { oldEnoughToRate } from "./announcement";

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
