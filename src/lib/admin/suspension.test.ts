import { describe, expect, it } from "vitest";
import { effectiveStatus, statusLabel, suspensionEnd } from "./suspension";

const NOW = Date.UTC(2026, 10, 11, 10, 0, 0);

describe("suspension temporaire", () => {
  it("calcule la date de fin selon la durée choisie", () => {
    expect(suspensionEnd("24h", NOW)).toBe("2026-11-12T10:00:00.000Z");
    expect(suspensionEnd("7j", NOW)).toBe("2026-11-18T10:00:00.000Z");
    expect(suspensionEnd("indefini", NOW)).toBeNull();
  });
  it("lève automatiquement une suspension expirée", () => {
    expect(effectiveStatus("suspendu", "2026-11-12T10:00:00.000Z", NOW)).toBe("suspendu");
    expect(effectiveStatus("suspendu", "2026-11-11T09:59:00.000Z", NOW)).toBe("actif");
    expect(effectiveStatus("suspendu", null, NOW)).toBe("suspendu");
    expect(effectiveStatus("actif", null, NOW)).toBe("actif");
  });
  it("affiche un statut lisible", () => {
    expect(statusLabel("actif", null, NOW)).toEqual({ text: "Actif", tone: "vert" });
    expect(statusLabel("suspendu", null, NOW).text).toBe("Suspendu");
    expect(statusLabel("suspendu", "2026-11-12T10:00:00.000Z", NOW).text).toMatch(/^Suspendu jusqu'au 12\/11\/2026/);
    expect(statusLabel("suspendu", "2026-11-01T00:00:00.000Z", NOW).tone).toBe("vert");
  });
});
