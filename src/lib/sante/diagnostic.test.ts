import { describe, expect, it } from "vitest";
import { inputIssues, keyKind, urlIssues } from "./diagnostic";

const jwt = (payload: object) => `xx.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.yy`;

describe("diagnostic de configuration", () => {
  it("reconnaît la nature d'une clé sans la révéler", () => {
    expect(keyKind("")).toBe("absente");
    expect(keyKind("sb_publishable_abc")).toBe("publishable");
    expect(keyKind("sb_secret_abc")).toBe("secret");
    expect(keyKind(jwt({ role: "anon" }))).toBe("jwt-anon");
    expect(keyKind(jwt({ role: "service_role" }))).toBe("jwt-service_role");
    expect(keyKind("pas-une-cle")).toBe("illisible");
  });
  it("signale les erreurs de saisie courantes", () => {
    expect(inputIssues(" abc")).toContain("espace ou retour à la ligne au début ou à la fin");
    expect(inputIssues('"abc"')).toContain("guillemets autour de la valeur");
    expect(inputIssues("NEXT_PUBLIC_SUPABASE_URL https://x")).toContain("le nom de la variable semble collé dans la valeur");
    expect(inputIssues("abc")).toEqual([]);
  });
  it("vérifie le format de l'URL du projet", () => {
    expect(urlIssues("https://csclwkrumkpbskeajbhu.supabase.co")).toEqual([]);
    expect(urlIssues("https://csclwkrumkpbskeajbhu.supabase.co/rest/v1")).not.toEqual([]);
    expect(urlIssues(undefined)).toEqual(["absente"]);
  });
});
