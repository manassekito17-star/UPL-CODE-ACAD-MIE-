import "server-only";

import { serverEnv } from "../server-env";
import { anthropicProvider } from "./anthropic";
import { testProvider } from "./test-provider";
import type { AiProvider } from "./types";

const PROVIDERS: Record<string, AiProvider> = {
  anthropic: anthropicProvider,
  test: testProvider,
};

export function getAiProvider(): AiProvider | null {
  const p = PROVIDERS[serverEnv.aiProvider];
  return p && p.isConfigured() ? p : null;
}
