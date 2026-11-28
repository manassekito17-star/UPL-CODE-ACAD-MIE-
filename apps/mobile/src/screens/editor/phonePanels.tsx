import type { IconName } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import type { EditorPanel } from '@/stores/editorUiStore';

import { ColorPanel, SwatchesPanel } from './desktop/panels/ColorPanels';
import { HistoryPanel } from './desktop/panels/HistoryPanel';
import { NavigatorPanel } from './desktop/panels/NavigatorPanel';
import { LayersPanelContent, PropertiesPanelContent } from './panels';

/** Panneaux du téléphone, ouverts un à la fois dans la feuille du bas. */
export const PHONE_PANELS: Record<EditorPanel, { title: string; icon: IconName }> = {
  layers: { title: 'Calques', icon: 'layers-outline' },
  properties: { title: 'Propriétés', icon: 'tune-variant' },
  color: { title: 'Couleur', icon: 'palette' },
  swatches: { title: 'Nuancier', icon: 'view-grid-outline' },
  history: { title: 'Historique', icon: 'history' },
  navigator: { title: 'Navigateur', icon: 'compass-outline' },
};

/** Panneaux qui ont un bouton dans la barre du bas (les autres : menu Fenêtre). */
export const BOTTOM_BAR_PANELS: readonly EditorPanel[] = ['layers', 'properties'];

export function PhonePanelContent({ panel, document }: { panel: EditorPanel; document: GraphicDocument }) {
  switch (panel) {
    case 'layers':
      return <LayersPanelContent document={document} />;
    case 'properties':
      return <PropertiesPanelContent document={document} />;
    case 'color':
      return <ColorPanel />;
    case 'swatches':
      return <SwatchesPanel />;
    case 'history':
      return <HistoryPanel />;
    case 'navigator':
      return <NavigatorPanel />;
  }
}
