import "server-only";

/** Configuration strictement serveur : ne jamais importer ce fichier côté client. */
export const serverEnv = {
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "").trim(),
  judge0Url: (process.env.JUDGE0_URL ?? "").replace(/\/+$/, ""),
  judge0AuthToken: process.env.JUDGE0_AUTH_TOKEN ?? "",
  judge0RapidApiKey: process.env.JUDGE0_RAPIDAPI_KEY ?? "",
  judge0RapidApiHost: process.env.JUDGE0_RAPIDAPI_HOST ?? "",
  judge0LanguageIds: {
    python: Number(process.env.JUDGE0_LANG_PYTHON ?? 71),
    c: Number(process.env.JUDGE0_LANG_C ?? 50),
    javascript: Number(process.env.JUDGE0_LANG_JAVASCRIPT ?? 63),
    java: Number(process.env.JUDGE0_LANG_JAVA ?? 62),
  },
  aiProvider: process.env.AI_PROVIDER ?? "anthropic",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? (process.env.AI_PROVIDER === "openai_compatible" ? "" : "claude-opus-5-5"),
  /** Fournisseur compatible OpenAI (Gemini, Groq, OpenRouter, Mistral, Ollama…). */
  aiBaseUrl: process.env.AI_BASE_URL ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
  /** Offre déclarée du fournisseur : « gratuit » (quotas gratuits) ou « payant » (facturé à l'usage). */
  aiBilling: process.env.AI_BILLING === "gratuit" ? ("gratuit" as const) : ("payant" as const),
  aiProviderLabel: process.env.AI_PROVIDER_LABEL ?? "",
  /** Autorise le professeur IA sans compte (développement local uniquement). */
  aiAllowAnonymous: process.env.AI_ALLOW_ANONYMOUS === "true",
};

export function isJudge0Configured(): boolean {
  return Boolean(serverEnv.judge0Url);
}
