import "server-only";

import { serverEnv } from "../server-env";
import { anthropicProvider } from "./anthropic";
import type { AiProvider } from "./types";

const PROVIDERS: Record<string, AiProvider> = {
  anthropic: anthropicProvider,
};

export function getAiProvider(): AiProvider | null {
  const p = PROVIDERS[serverEnv.aiProvider];
  return p && p.isConfigured() ? p : null;
}
