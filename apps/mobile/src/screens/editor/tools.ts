import type { IconName } from '@/components/ui';
import type { ToolId } from '@/engine/canvas';

/** Dernière phase livrée : les outils des phases suivantes restent désactivés. */
export const DELIVERED_PHASE = 4;

export interface ToolDefinition {
  id: ToolId;
  label: string;
  icon: IconName;
  /** Phase qui rend l'outil fonctionnel. */
  availableInPhase: number;
  /** Aide lue par les lecteurs d'écran quand l'outil est disponible. */
  hint: string;
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Sélection', icon: 'cursor-default-outline', availableInPhase: 4, hint: 'Toucher un calque le sélectionne ; le glisser le déplace. Deux doigts zooment toujours.' },
  { id: 'pan', label: 'Vue', icon: 'hand-back-right-outline', availableInPhase: 3, hint: 'Un doigt déplace la vue ; deux doigts zooment' },
  { id: 'text', label: 'Texte', icon: 'format-text', availableInPhase: 5, hint: 'Ajouter un texte' },
  { id: 'shape', label: 'Formes', icon: 'shape-outline', availableInPhase: 5, hint: 'Ajouter une forme' },
  { id: 'image', label: 'Image', icon: 'image-plus', availableInPhase: 5, hint: 'Importer une image' },
];

export function isToolAvailable(tool: ToolDefinition): boolean {
  return tool.availableInPhase <= DELIVERED_PHASE;
}
