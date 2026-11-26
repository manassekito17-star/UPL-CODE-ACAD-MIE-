import type { IconName } from '@/components/ui';
import type { ToolId } from '@/engine/canvas';

/** Dernière phase livrée : les outils des phases suivantes restent désactivés. */
export const DELIVERED_PHASE = 5;

export interface ToolDefinition {
  id: ToolId;
  label: string;
  icon: IconName;
  /** `mode` : outil actif persistant ; `insert` : ajoute un calque puis passe en Sélection. */
  kind: 'mode' | 'insert';
  /** Phase qui rend l'outil fonctionnel. */
  availableInPhase: number;
  /** Aide lue par les lecteurs d'écran quand l'outil est disponible. */
  hint: string;
}

export const TOOLS: readonly ToolDefinition[] = [
  {
    id: 'select',
    label: 'Sélection',
    icon: 'cursor-default-outline',
    kind: 'mode',
    availableInPhase: 4,
    hint: 'Toucher un calque le sélectionne ; le glisser le déplace ; les poignées le redimensionnent et le tournent.',
  },
  { id: 'pan', label: 'Vue', icon: 'hand-back-right-outline', kind: 'mode', availableInPhase: 3, hint: 'Un doigt déplace la vue ; deux doigts zooment' },
  { id: 'text', label: 'Texte', icon: 'format-text', kind: 'insert', availableInPhase: 5, hint: 'Ajouter un texte modifiable' },
  { id: 'shape', label: 'Formes', icon: 'shape-outline', kind: 'insert', availableInPhase: 5, hint: 'Ajouter un rectangle, un cercle ou une ligne' },
  { id: 'image', label: 'Image', icon: 'image-plus', kind: 'insert', availableInPhase: 5, hint: 'Importer une image de la galerie' },
];

export function isToolAvailable(tool: ToolDefinition): boolean {
  return tool.availableInPhase <= DELIVERED_PHASE;
}
