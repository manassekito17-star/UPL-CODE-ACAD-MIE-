import type { IconName } from '@/components/ui';

export interface ToolDefinition {
  id: 'select' | 'pan' | 'text' | 'shape' | 'image';
  label: string;
  icon: IconName;
  /** Phase qui rendra l'outil fonctionnel ; en attendant, il est désactivé. */
  availableInPhase: number;
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Sélection', icon: 'cursor-default-outline', availableInPhase: 4 },
  { id: 'pan', label: 'Vue', icon: 'hand-back-right-outline', availableInPhase: 3 },
  { id: 'text', label: 'Texte', icon: 'format-text', availableInPhase: 5 },
  { id: 'shape', label: 'Formes', icon: 'shape-outline', availableInPhase: 5 },
  { id: 'image', label: 'Image', icon: 'image-plus', availableInPhase: 5 },
];
