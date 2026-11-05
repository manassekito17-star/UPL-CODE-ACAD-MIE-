import "server-only";

import type { AiProvider, AiStreamParams, AiUsage } from "./types";

/**
 * Fournisseur de TEST, déterministe, sans appel à une IA : il renvoie un
 * résumé du contexte reçu (mode, parcours, niveau, chapitre). Il sert
 * uniquement aux tests de bout en bout du câblage (contexte construit côté
 * serveur, historique, quotas). Il exige deux variables explicites
 * (AI_PROVIDER=test et UPL_ALLOW_TEST_AI=true) et annonce clairement qu'il
 * n'est pas une IA.
 */
const tag = (text: string, name: string) => text.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim() ?? "";

export const testProvider: AiProvider = {
  id: "test",
  model: "test",
  isConfigured: () => process.env.UPL_ALLOW_TEST_AI === "true",
  async *stream({ messages }: AiStreamParams): AsyncGenerator<string, AiUsage> {
    const last = messages[messages.length - 1]?.content ?? "";
    const parcours = tag(last, "parcours");
    const lines = [
      "**[Professeur de test — aucune IA n'a été appelée]**",
      `Mode : ${tag(last, "consigne_du_mode").split(" :")[0].slice(0, 60)}`,
      `Niveau de langage : ${tag(last, "niveau_etudiant")}`,
      `Parcours : ${parcours.match(/^Parcours : (.+)$/m)?.[1] ?? "aucun"}`,
      `Niveau actuel : ${parcours.match(/^Niveau actuel de l'étudiant dans ce parcours : (.+)$/m)?.[1] ?? "inconnu"}`,
      `Chapitre : ${parcours.match(/^Chapitre en cours : (.+)$/m)?.[1] ?? "aucun"}`,
      `Messages dans la conversation : ${messages.length}`,
    ];
    for (const l of lines) yield `${l}\n\n`;
    return { inputTokens: 0, outputTokens: 0, model: "test" };
  },
};
