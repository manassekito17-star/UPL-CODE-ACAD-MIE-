import { describe, expect, it } from "vitest";
import { matchesDeclaredType } from "./file-signature";

const b = (s: string | number[]) => (typeof s === "string" ? new TextEncoder().encode(s) : new Uint8Array(s));

describe("contenu réel des fichiers téléversés", () => {
  it("reconnaît les types autorisés", () => {
    expect(matchesDeclaredType(b("%PDF-1.7\n..."), "application/pdf")).toBe(true);
    expect(matchesDeclaredType(b([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]), "image/png")).toBe(true);
    expect(matchesDeclaredType(b([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg")).toBe(true);
    expect(matchesDeclaredType(b("RIFF\u0000\u0000\u0000\u0000WEBPVP8 "), "image/webp")).toBe(true);
    expect(matchesDeclaredType(b("\u0000\u0000\u0000\u0018ftypmp42"), "video/mp4")).toBe(true);
    expect(matchesDeclaredType(b([0x50, 0x4b, 0x03, 0x04, 0x14]), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(true);
  });
  it("refuse un fichier déguisé", () => {
    expect(matchesDeclaredType(b("<html><script>alert(1)</script>"), "application/pdf")).toBe(false);
    expect(matchesDeclaredType(b("<svg onload=alert(1)>"), "image/png")).toBe(false);
    expect(matchesDeclaredType(b("%PDF-1.7"), "image/svg+xml")).toBe(false);
  });
});
