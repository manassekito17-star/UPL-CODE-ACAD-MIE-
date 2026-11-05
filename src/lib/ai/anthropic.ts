import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "../server-env";
import type { AiProvider, AiStreamParams, AiUsage } from "./types";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ apiKey: serverEnv.anthropicApiKey, maxRetries: 2, timeout: 120_000 });
  return client;
}

export const anthropicProvider: AiProvider = {
  id: "anthropic",
  model: serverEnv.aiModel,
  billing: "payant",
  label: "Anthropic (Claude)",
  isConfigured: () => Boolean(serverEnv.anthropicApiKey),
  async *stream({ system, messages, maxOutputTokens, effort, signal }: AiStreamParams): AsyncGenerator<string, AiUsage> {
    const stream = getClient().beta.messages.stream(
      {
        model: serverEnv.aiModel,
        max_tokens: maxOutputTokens,
        system,
        messages,
        thinking: { type: "adaptive" },
        output_config: { effort },
        // Repli automatique côté serveur si le modèle principal décline une requête.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { signal },
    );
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    const refused = final.stop_reason === "refusal";
    if (refused) {
      yield "\n\nJe ne peux pas répondre à cette demande. Reformulez votre question en lien avec votre apprentissage de la programmation.";
    }
    return {
      inputTokens: final.usage.input_tokens + (final.usage.cache_read_input_tokens ?? 0) + (final.usage.cache_creation_input_tokens ?? 0),
      outputTokens: final.usage.output_tokens,
      model: final.model ?? serverEnv.aiModel,
      refused,
    };
  },
};
