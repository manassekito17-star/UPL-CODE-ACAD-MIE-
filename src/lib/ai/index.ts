import "server-only";

import { serverEnv } from "../server-env";
import { anthropicProvider } from "./anthropic";
import { openAiCompatibleProvider } from "./openai-compatible";
import { testProvider } from "./test-provider";
import type { AiProvider } from "./types";

const PROVIDERS: Record<string, AiProvider> = {
  anthropic: anthropicProvider,
  openai_compatible: openAiCompatibleProvider,
  test: testProvider,
};

export function getAiProvider(): AiProvider | null {
  const p = PROVIDERS[serverEnv.aiProvider];
  return p && p.isConfigured() ? p : null;
}

/** Offre du fournisseur configuré (Anthropic : facturé ; compatible OpenAI : déclaré par AI_BILLING). */
export function providerBilling(p: AiProvider): "gratuit" | "payant" | "test" {
  if (p.id === "test") return "test";
  if (p.id === "openai_compatible") return serverEnv.aiBilling;
  return p.billing ?? "payant";
}

export function providerLabel(p: AiProvider): string {
  if (p.id === "openai_compatible") return serverEnv.aiProviderLabel || "Fournisseur compatible OpenAI";
  if (p.id === "anthropic") return "Anthropic (Claude)";
  return p.label ?? p.id;
}

export interface AiAvailability {
  available: boolean;
  reason?: string;
  provider?: string;
  billing?: "gratuit" | "payant" | "test";
}

/** Le professeur IA peut-il répondre ? (avant tout quota par étudiant) */
export function aiAvailability(settings: { enabled: boolean; allow_paid_providers: boolean; monthly_budget_usd: number }): AiAvailability {
  if (!settings.enabled) return { available: false, reason: "Le professeur IA est désactivé par l'administration. Les cours, exercices et corrections restent accessibles." };
  const p = getAiProvider();
  if (!p) return { available: false, reason: "Aucun modèle d'IA n'est connecté à cette installation. Les cours, exercices et corrections automatiques restent accessibles." };
  const billing = providerBilling(p);
  if (billing === "payant" && (!settings.allow_paid_providers || settings.monthly_budget_usd <= 0)) {
    return { available: false, provider: providerLabel(p), billing, reason: "Le fournisseur d'IA configuré est payant et son utilisation n'est pas autorisée (budget 0). Les cours restent accessibles." };
  }
  return { available: true, provider: providerLabel(p), billing };
}
