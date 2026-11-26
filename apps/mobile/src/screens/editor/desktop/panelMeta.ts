import type { IconName } from '@/components/ui';
import type { PanelId } from '@/stores/workspaceStore';

/** Nom et icône de chaque panneau (onglets, dock réduit, colonne d'icônes, menu Fenêtre). */
export const PANEL_META: Record<PanelId, { label: string; icon: IconName }> = {
  color: { label: 'Couleur', icon: 'palette' },
  swatches: { label: 'Nuancier', icon: 'view-grid-outline' },
  properties: { label: 'Propriétés', icon: 'tune-variant' },
  adjustments: { label: 'Réglages', icon: 'circle-half-full' },
  layers: { label: 'Calques', icon: 'layers-outline' },
  channels: { label: 'Couches', icon: 'layers-triple-outline' },
  paths: { label: 'Tracés', icon: 'vector-curve' },
  history: { label: 'Historique', icon: 'history' },
  navigator: { label: 'Navigateur', icon: 'compass-outline' },
  character: { label: 'Caractère', icon: 'format-letter-case' },
  paragraph: { label: 'Paragraphe', icon: 'format-pilcrow' },
};

export const PANEL_LABELS: Record<PanelId, string> = Object.fromEntries(
  Object.entries(PANEL_META).map(([id, meta]) => [id, meta.label]),
) as Record<PanelId, string>;
