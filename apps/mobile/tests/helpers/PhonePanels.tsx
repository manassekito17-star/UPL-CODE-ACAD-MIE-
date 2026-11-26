import { render } from '@testing-library/react-native';
import { ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RenderResourcesProvider } from '@/features/rendering/RenderResourcesProvider';
import { CanvasArea } from '@/screens/editor/CanvasArea';
import { EditorToolbar } from '@/screens/editor/EditorToolbar';
import { LayersPanelContent, PropertiesPanelContent } from '@/screens/editor/panels';
import { useDocumentStore } from '@/stores/documentStore';

/**
 * Les composants de l'espace téléphone (barre d'outils, zone de travail,
 * panneaux Calques et Propriétés) rendus ensemble. Sur téléphone, un seul
 * panneau est ouvert à la fois en feuille : les afficher côte à côte permet
 * de tester leurs interactions sans rouvrir la feuille à chaque étape.
 */
function PhonePanels({ documentId }: { documentId: string }) {
  const document = useDocumentStore((s) => s.documents[documentId]);
  if (!document) return null;
  return (
    <RenderResourcesProvider layers={document.layers}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <EditorToolbar orientation="vertical" documentId={document.id} />
        <CanvasArea document={document} />
        <ScrollView>
          <LayersPanelContent document={document} />
          <PropertiesPanelContent document={document} />
        </ScrollView>
      </View>
    </RenderResourcesProvider>
  );
}

export async function renderPhonePanels(documentId: string) {
  return render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PhonePanels documentId={documentId} />
    </GestureHandlerRootView>,
  );
}
