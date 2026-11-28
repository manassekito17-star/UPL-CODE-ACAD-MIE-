import { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText, Button, Icon, IconButton, Screen } from '@/components/ui';
import type { GraphicDocument } from '@/engine/documents';
import { ExportDialog } from '@/features/export';
import { commandClose } from '@/features/files/fileCommands';
import { useThumbnailWriter } from '@/features/projects/useThumbnailWriter';
import { RenderResourcesProvider } from '@/features/rendering/RenderResourcesProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore, type EditorPanel } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { colors, radius, spacing } from '@/theme';

import { CanvasArea } from './CanvasArea';
import { DesktopWorkspace } from './desktop/DesktopWorkspace';
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

/**
 * Hauteur minimale de l'espace studio (menus, options, règles, dock) : en
 * dessous (téléphone en paysage), la toile garderait trop peu de place et
 * l'espace téléphone est utilisé.
 */
export const STUDIO_MIN_HEIGHT = 520;

export interface EditorScreenProps {
  projectId: string;
}

export function EditorScreen({ projectId }: EditorScreenProps) {
  const document = useDocumentStore((s) => s.documents[projectId]);
  const breakpoint = useBreakpoint();
  const { height } = useWindowDimensions();
  const studio = breakpoint !== 'compact' && height >= STUDIO_MIN_HEIGHT;
  const resetForDocument = useEditorUiStore((s) => s.resetForDocument);

  const openDocument = useWorkspaceStore((s) => s.openDocument);
  const exists = !!document;
  // Nouvelle ouverture : aucune sélection ni message hérités d'un autre
  // document ; le document prend sa place dans les onglets.
  useEffect(() => {
    resetForDocument();
    if (exists) openDocument(projectId);
  }, [projectId, resetForDocument, openDocument, exists]);

  if (!document) return <MissingDocument />;
  return (
    <RenderResourcesProvider layers={document.layers}>
      {studio ? <DesktopWorkspace document={document} /> : <CompactWorkspace document={document} />}
      <ExportDialog />
      <ThumbnailWriter document={document} />
    </RenderResourcesProvider>
  );
}

/** Met à jour la miniature du projet (liste des projets récents). */
function ThumbnailWriter({ document }: { document: GraphicDocument }) {
  useThumbnailWriter(document);
  return null;
}

/** Bouton retour d'Android : même chose que « Fermer le document » (proposition d'enregistrer). */
function useHardwareBack(documentId: string) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      commandClose([documentId], goHome);
      return true;
    });
    return () => sub.remove();
  }, [documentId]);
}

/** Téléphone (portrait ou paysage) : canvas plein écran, un panneau à la fois en feuille. */
function CompactWorkspace({ document }: { document: GraphicDocument }) {
  useHardwareBack(document.id);
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

function MissingDocument() {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} testID="editor-missing">
      <Icon name="file-image-outline" size={40} color={colors.textSecondary} />
      <AppText variant="title" accessibilityRole="header">
        Projet introuvable
      </AppText>
      <AppText tone="secondary">
        Ce projet a été supprimé, ou son lien n’est plus valide.
      </AppText>
      <Button label="Retour à l’accueil" onPress={goHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
