/**
 * Architecture interchangeable du professeur IA : tout fournisseur
 * implémente cette interface (Anthropic par défaut). Pour en ajouter un,
 * créer un fichier qui exporte un AiProvider et l'enregistrer dans index.ts.
 */
export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  refused?: boolean;
}

export interface AiStreamParams {
  system: string;
  messages: AiMessage[];
  maxOutputTokens: number;
  effort: "low" | "medium" | "high";
  signal?: AbortSignal;
}

export interface AiProvider {
  id: string;
  model: string;
  /**
   * Coût pour la plateforme : « gratuit » (offre gratuite avec quotas, ou
   * modèle local), « payant » (facturé à l'usage), « test » (aucune IA).
   */
  billing?: "gratuit" | "payant" | "test";
  label?: string;
  isConfigured(): boolean;
  /** Émet le texte au fil de l'eau puis retourne la consommation. */
  stream(params: AiStreamParams): AsyncGenerator<string, AiUsage>;
}

/** Prix en dollars par million de jetons (entrée, sortie). */
export const PRICING_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

export function estimateCostUsd(usage: AiUsage): number {
  const p = PRICING_USD_PER_MTOK[usage.model] ?? { input: 4, output: 20 };
  return (usage.inputTokens * p.input + usage.outputTokens * p.output) / 1_000_000;
}
