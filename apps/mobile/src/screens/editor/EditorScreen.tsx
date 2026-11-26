import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, CollapsiblePanel, Icon, IconButton, Screen } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { RenderResourcesProvider } from '@/features/rendering/RenderResourcesProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore, type EditorPanel } from '@/stores/editorUiStore';
import { colors, radius, spacing } from '@/theme';

import { CanvasArea } from './CanvasArea';
import { EditorToolbar } from './EditorToolbar';
import { EditorTopBar, goHome } from './EditorTopBar';
import { LayersPanelContent, PropertiesPanelContent } from './panels';

const PANEL_META: Record<EditorPanel, { title: string; icon: 'layers-outline' | 'tune-variant' }> = {
  layers: { title: 'Calques', icon: 'layers-outline' },
  properties: { title: 'Propriétés', icon: 'tune-variant' },
};

function PanelContent({ panel, document }: { panel: EditorPanel; document: GraphicDocument }) {
  return panel === 'layers' ? <LayersPanelContent document={document} /> : <PropertiesPanelContent document={document} />;
}

export interface EditorScreenProps {
  projectId: string;
}

export function EditorScreen({ projectId }: EditorScreenProps) {
  const document = useDocumentStore((s) => s.documents[projectId]);
  const breakpoint = useBreakpoint();
  const resetForDocument = useEditorUiStore((s) => s.resetForDocument);

  // Nouvelle ouverture : aucune sélection ni message hérités d'un autre document.
  useEffect(() => {
    resetForDocument();
  }, [projectId, resetForDocument]);

  if (!document) return <MissingDocument />;
  return (
    <RenderResourcesProvider layers={document.layers}>
      {breakpoint === 'compact' ? <CompactWorkspace document={document} /> : <WideWorkspace document={document} />}
    </RenderResourcesProvider>
  );
}

/** Téléphone en portrait : canvas plein écran, un panneau à la fois en feuille. */
function CompactWorkspace({ document }: { document: GraphicDocument }) {
  const sheet = useEditorUiStore((s) => s.compactSheet);
  const toggleSheet = useEditorUiStore((s) => s.toggleCompactSheet);
  const closeSheet = useEditorUiStore((s) => s.closeCompactSheet);

  return (
    <Screen scroll={false} edges={['top', 'bottom', 'left', 'right']} testID="editor-screen">
      <EditorTopBar document={document} />
      <CanvasArea document={document} />
      {sheet ? (
        <View style={styles.sheet} testID={`sheet-${sheet}`}>
          <View style={styles.sheetHeader}>
            <Icon name={PANEL_META[sheet].icon} size={20} color={colors.textSecondary} />
            <AppText variant="label" style={styles.flex} accessibilityRole="header">
              {PANEL_META[sheet].title}
            </AppText>
            <IconButton icon="close" label={`Fermer le panneau ${PANEL_META[sheet].title}`} onPress={closeSheet} />
          </View>
          <ScrollView contentContainerStyle={styles.sheetBody}>
            <PanelContent panel={sheet} document={document} />
          </ScrollView>
        </View>
      ) : null}
      <View style={styles.bottomBar}>
        <EditorToolbar orientation="horizontal" documentId={document.id} />
        <View style={styles.divider} />
        {(Object.keys(PANEL_META) as EditorPanel[]).map((panel) => (
          <IconButton
            key={panel}
            icon={PANEL_META[panel].icon}
            label={PANEL_META[panel].title}
            showLabel
            active={sheet === panel}
            onPress={() => toggleSheet(panel)}
          />
        ))}
      </View>
    </Screen>
  );
}

/** Tablette ou paysage : outils à gauche, panneaux repliables à droite. */
function WideWorkspace({ document }: { document: GraphicDocument }) {
  const breakpoint = useBreakpoint();
  const sidePanelsVisible = useEditorUiStore((s) => s.sidePanelsVisible);
  const expanded = useEditorUiStore((s) => s.expandedPanels);
  const toggleSidePanels = useEditorUiStore((s) => s.toggleSidePanels);
  const togglePanel = useEditorUiStore((s) => s.togglePanelExpanded);

  return (
    <Screen scroll={false} edges={['top', 'bottom', 'left', 'right']} testID="editor-screen">
      <EditorTopBar document={document} sidePanels={{ visible: sidePanelsVisible, onToggle: toggleSidePanels }} />
      <View style={styles.row}>
        <EditorToolbar orientation="vertical" documentId={document.id} />
        <CanvasArea document={document} />
        {sidePanelsVisible ? (
          <ScrollView
            style={[styles.side, { width: breakpoint === 'expanded' ? 320 : 272 }]}
            testID="side-panels"
          >
            {(Object.keys(PANEL_META) as EditorPanel[]).map((panel) => (
              <CollapsiblePanel
                key={panel}
                title={PANEL_META[panel].title}
                icon={PANEL_META[panel].icon}
                expanded={expanded[panel]}
                onToggle={() => togglePanel(panel)}
                testID={`panel-${panel}`}
              >
                <PanelContent panel={panel} document={document} />
              </CollapsiblePanel>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </Screen>
  );
}

function MissingDocument() {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} testID="editor-missing">
      <Icon name="file-image-outline" size={40} color={colors.textSecondary} />
      <AppText variant="title" accessibilityRole="header">
        Projet introuvable
      </AppText>
      <AppText tone="secondary">
        Ce projet a été supprimé, ou l’application a été fermée depuis son ouverture : les projets ne sont pas
        encore enregistrés sur l’appareil (phase 7).
      </AppText>
      <Button label="Retour à l’accueil" onPress={goHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  side: {
    flexGrow: 0,
    backgroundColor: colors.panel,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: spacing.sm },
  sheet: {
    maxHeight: '50%',
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  sheetBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});
