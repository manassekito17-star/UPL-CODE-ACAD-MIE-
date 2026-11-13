/** Types de rendu-web.js (copie de kplus/rendu_web.js du dépôt K+). */
import type { KPlusCommand } from "@/lib/execution/types";

export interface KPlusRendu {
  appliquer(commandes: KPlusCommand[]): void;
  vider(): void;
  arreterMinuteries(): void;
  valeursChamps(): Record<string, string>;
  minuteriesActives(): number;
}

declare const api: {
  creerRendu(
    conteneur: HTMLElement,
    options?: {
      surEvenement?: (id: string, genre: string, valeurs: Record<string, string>) => Promise<unknown> | void;
      surTitre?: (texte: string) => void;
    },
  ): KPlusRendu;
};
export default api;
