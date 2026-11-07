import { afterEach, describe, expect, it, vi } from "vitest";
import { alertsFor } from "../consumption";
import { entitlements } from "../plans";
import { DEFAULT_SETTINGS } from "../settings";
import { parseChatCompletionStream } from "./openai-compatible";

const sse = (lines: string[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      const enc = new TextEncoder();
      // Découpage arbitraire : une ligne peut arriver en plusieurs morceaux.
      const all = lines.map((l) => `${l}\n\n`).join("");
      for (let i = 0; i < all.length; i += 7) c.enqueue(enc.encode(all.slice(i, i + 7)));
      c.close();
    },
  });

async function loadWith(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("./index");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fournisseur compatible OpenAI (flux SSE)", () => {
  it("assemble le texte et lit l'usage", async () => {
    const out: string[] = [];
    let usage;
    for await (const c of parseChatCompletionStream(
      sse([
        'data: {"choices":[{"delta":{"role":"assistant","content":"Bon"}}],"model":"gemini-x"}',
        'data: {"choices":[{"delta":{"content":"jour !"}}]}',
        "data: {mal formé",
        'data: {"choices":[],"usage":{"prompt_tokens":12,"completion_tokens":3}}',
        "data: [DONE]",
        'data: {"choices":[{"delta":{"content":"ignoré"}}]}',
      ]),
    )) {
      if (c.text) out.push(c.text);
      if (c.usage) usage = c.usage;
    }
    expect(out.join("")).toBe("Bonjour !");
    expect(usage).toEqual({ prompt_tokens: 12, completion_tokens: 3 });
  });

  it("appelle l'API avec la clé côté serveur et le modèle configuré", async () => {
    const { getAiProvider, providerBilling } = await loadWith({ AI_PROVIDER: "openai_compatible", AI_BASE_URL: "https://api.exemple.test/v1/", AI_API_KEY: "cle-secrete", AI_MODEL: "modele-gratuit", AI_BILLING: "gratuit" });
    const fetchMock = vi.fn(async () => new Response(sse(['data: {"choices":[{"delta":{"content":"OK"}}]}', 'data: {"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":1}}', "data: [DONE]"]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const p = getAiProvider()!;
    expect(providerBilling(p)).toBe("gratuit");
    const gen = p.stream({ system: "S", messages: [{ role: "user", content: "Q" }], maxOutputTokens: 100, effort: "low" });
    let text = "";
    let r = await gen.next();
    while (!r.done) {
      text += r.value;
      r = await gen.next();
    }
    expect(text).toBe("OK");
    expect(r.value).toMatchObject({ inputTokens: 5, outputTokens: 1 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.exemple.test/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer cle-secrete");
    expect(JSON.parse(init.body as string)).toMatchObject({ model: "modele-gratuit", stream: true, messages: [{ role: "system", content: "S" }, { role: "user", content: "Q" }] });
  });

  it("signale clairement un quota de fournisseur atteint (429)", async () => {
    const { getAiProvider } = await loadWith({ AI_PROVIDER: "openai_compatible", AI_BASE_URL: "https://api.exemple.test/v1", AI_API_KEY: "k", AI_MODEL: "m", AI_BILLING: "gratuit" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("rate limited", { status: 429 })));
    const gen = getAiProvider()!.stream({ system: "S", messages: [], maxOutputTokens: 10, effort: "low" });
    await expect(gen.next()).rejects.toThrow("Quota du fournisseur IA atteint");
  });
});

describe("budget 0 : disponibilité du professeur IA", () => {
  const ai = { enabled: true, allow_paid_providers: false, monthly_budget_usd: 0 };
  it("aucun modèle connecté → indisponible, jamais de réponse simulée", async () => {
    const { aiAvailability } = await loadWith({ AI_PROVIDER: "openai_compatible", AI_BASE_URL: "", AI_API_KEY: "", AI_MODEL: "" });
    const a = aiAvailability(ai);
    expect(a.available).toBe(false);
    expect(a.reason).toContain("Aucun modèle");
    expect(a.reason).toContain("cours");
  });
  it("fournisseur payant bloqué tant qu'il n'est pas autorisé avec un budget", async () => {
    const { aiAvailability } = await loadWith({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-test" });
    expect(aiAvailability(ai)).toMatchObject({ available: false, billing: "payant" });
    expect(aiAvailability({ ...ai, allow_paid_providers: true })).toMatchObject({ available: false });
    expect(aiAvailability({ ...ai, allow_paid_providers: true, monthly_budget_usd: 10 })).toMatchObject({ available: true, billing: "payant" });
  });
  it("une offre non déclarée gratuite est traitée comme payante", async () => {
    const { aiAvailability } = await loadWith({ AI_PROVIDER: "openai_compatible", AI_BASE_URL: "https://x.test/v1", AI_API_KEY: "k", AI_MODEL: "m" });
    expect(aiAvailability(ai)).toMatchObject({ available: false, billing: "payant" });
  });
  it("offre gratuite déclarée → disponible sans budget", async () => {
    const { aiAvailability } = await loadWith({ AI_PROVIDER: "openai_compatible", AI_BASE_URL: "https://x.test/v1", AI_API_KEY: "k", AI_MODEL: "m", AI_BILLING: "gratuit", AI_PROVIDER_LABEL: "Google Gemini" });
    expect(aiAvailability(ai)).toEqual({ available: true, provider: "Google Gemini", billing: "gratuit" });
  });
});

describe("offres et alertes", () => {
  it("tout le monde reçoit les limites gratuites tant que le premium n'est pas ouvert", () => {
    expect(entitlements("premium", DEFAULT_SETTINGS)).toMatchObject({ plan: "gratuit", aiMessagesPerDay: DEFAULT_SETTINGS.ai.daily_messages_per_user });
    const open = { ...DEFAULT_SETTINGS, plans: { ...DEFAULT_SETTINGS.plans, premium_enabled: true } };
    expect(entitlements("premium", open)).toMatchObject({ plan: "premium", aiMessagesPerDay: 100, serverRunsPerDay: 200 });
    expect(entitlements("gratuit", open).plan).toBe("gratuit");
  });
  it("paramètres par défaut : budget 0, aucun fournisseur payant, navigateur d'abord", () => {
    expect(DEFAULT_SETTINGS.ai).toMatchObject({ monthly_budget_usd: 0, allow_paid_providers: false });
    expect(DEFAULT_SETTINGS.execution.browser_first).toBe(true);
    expect(DEFAULT_SETTINGS.execution.server_runs_global_per_day).toBeGreaterThan(0);
  });
  it("alerte à 80 % et à 100 %, ignore les jauges sans limite", () => {
    const a = alertsFor([
      { id: "a", label: "A", used: 79, limit: 100, unit: "nombre" },
      { id: "b", label: "B", used: 80, limit: 100, unit: "nombre" },
      { id: "c", label: "C", used: 120, limit: 100, unit: "nombre" },
      { id: "d", label: "D", used: 999, limit: 0, unit: "nombre" },
    ]);
    expect(a).toEqual([
      { level: "attention", text: "B : 80 % de la limite utilisés." },
      { level: "critique", text: "C : limite atteinte (120 %)." },
    ]);
  });
});
