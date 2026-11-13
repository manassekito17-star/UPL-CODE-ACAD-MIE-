import { describe, expect, it } from "vitest";
import { AVATAR_MAX_BYTES, decodeAvatar } from "./avatar";

const jpeg = (n: number) => `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(n).fill(1)]).toString("base64")}`;

describe("photo de profil", () => {
  it("absente : aucune photo", () => expect(decodeAvatar("")).toBeNull());
  it("JPEG valide accepté", () => expect((decodeAvatar(jpeg(500)) as Uint8Array).length).toBe(504));
  it("refuse un autre format, un faux JPEG ou une image trop lourde", () => {
    expect(decodeAvatar("data:image/svg+xml;base64,PHN2Zz4=")).toBe("invalide");
    expect(decodeAvatar(`data:image/jpeg;base64,${Buffer.from("<?php echo 1; ?>".repeat(20)).toString("base64")}`)).toBe("invalide");
    expect(decodeAvatar(jpeg(AVATAR_MAX_BYTES))).toBe("invalide");
    expect(decodeAvatar("https://exemple.com/a.jpg")).toBe("invalide");
  });
});
