import "server-only";

import { serverEnv } from "../server-env";
import type { AiProvider, AiStreamParams, AiUsage } from "./types";

/**
 * Fournisseur « compatible OpenAI » (API Chat Completions en flux SSE),
 * format documenté et proposé par de nombreux services, dont certains ont
 * une offre gratuite (avec quotas) :
 *   - Google Gemini : https://generativelanguage.googleapis.com/v1beta/openai/
 *   - Groq :          https://api.groq.com/openai/v1
 *   - OpenRouter :    https://openrouter.ai/api/v1  (modèles « :free »)
 *   - Mistral :       https://api.mistral.ai/v1
 *   - Ollama :        http://localhost:11434/v1     (modèle local, sans clé)
 * L'adresse, la clé et le modèle sont configurés côté serveur uniquement.
 * Les conditions et quotas gratuits sont fixés par chaque fournisseur et
 * peuvent changer : l'administrateur déclare l'offre (AI_BILLING).
 */

/** Analyse un flux SSE « data: {…} » et renvoie les fragments de texte et l'usage. */
export async function* parseChatCompletionStream(body: ReadableStream<Uint8Array>): AsyncGenerator<{ text?: string; usage?: { prompt_tokens?: number; completion_tokens?: number }; model?: string }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const text = json.choices?.[0]?.delta?.content;
        yield { text: typeof text === "string" ? text : undefined, usage: json.usage ?? undefined, model: json.model };
      } catch {
        /* ligne incomplète ou non JSON : ignorée */
      }
    }
  }
}

export const openAiCompatibleProvider: AiProvider = {
  id: "openai_compatible",
  get model() {
    return serverEnv.aiModel;
  },
  isConfigured: () => Boolean(serverEnv.aiBaseUrl && serverEnv.aiModel && (serverEnv.aiApiKey || serverEnv.aiBaseUrl.startsWith("http://localhost"))),
  async *stream({ system, messages, maxOutputTokens, signal }: AiStreamParams): AsyncGenerator<string, AiUsage> {
    const res = await fetch(`${serverEnv.aiBaseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(serverEnv.aiApiKey ? { Authorization: `Bearer ${serverEnv.aiApiKey}` } : {}) },
      body: JSON.stringify({
        model: serverEnv.aiModel,
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: maxOutputTokens,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      if (res.status === 429) throw new Error(`Quota du fournisseur IA atteint (429). ${detail.slice(0, 200)}`);
      throw new Error(`Fournisseur IA : erreur ${res.status}. ${detail.slice(0, 200)}`);
    }
    let usage = { prompt_tokens: 0, completion_tokens: 0 };
    let model = serverEnv.aiModel;
    for await (const chunk of parseChatCompletionStream(res.body)) {
      if (chunk.text) yield chunk.text;
      if (chunk.usage) usage = { prompt_tokens: chunk.usage.prompt_tokens ?? 0, completion_tokens: chunk.usage.completion_tokens ?? 0 };
      if (chunk.model) model = chunk.model;
    }
    return { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, model };
  },
};
