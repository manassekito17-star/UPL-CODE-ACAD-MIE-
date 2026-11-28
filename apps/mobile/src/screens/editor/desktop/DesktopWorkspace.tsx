import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog, PromptDialog } from '@/components/ui';
import { DocumentCanvasHost, useViewSharedValues, type CanvasController } from '@/engine/canvas';
import { DOCUMENT_LIMITS, normalizeDocumentName, type GraphicDocument } from '@/engine/documents';
import { LAYER_NAME_MAX, findLayer } from '@/engine/layers';
import type { GuideOrientation } from '@/engine/guides';
import { guideActions } from '@/features/guides/guideActions';
import { useGuideCanvasProps } from '@/features/guides/useGuideCanvasProps';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { WorkspaceDialogs } from '@/features/workspace/WorkspaceDialogs';
import { loadWorkspaces } from '@/features/workspace/workspacePersistence';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { registerCanvas } from '@/features/shortcuts/dispatcher';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useDocumentStore } from '@/stores/documentStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ws, wsMetrics } from '@/theme';

import { DocTabs, StatusBar, showDocument } from './DocChrome';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { OptionsBar } from './OptionsBar';
import { RulersFrame } from './Rulers';
import { ToolRail } from './ToolRail';
import { WorkspaceContext, type WorkspaceContextValue } from './WorkspaceContext';

/** « Enregistrer sous » (copie sous un nouveau nom, qui remplace l'onglet) et « Dupliquer » (copie en plus). */
export function SaveAsDialog({ document }: { document: GraphicDocument }) {
  const request = useWorkspaceStore((s) => s.saveAsRequest);
  const requestSaveAs = useWorkspaceStore((s) => s.requestSaveAs);
  const visible = request?.documentId === document.id;
  const saveAs = request?.mode === 'saveAs';
  return (
    <PromptDialog
      visible={visible}
      title={saveAs ? 'Enregistrer sous' : 'Dupliquer le document'}
      label="Nom du document"
      initialValue={saveAs ? document.name : `${document.name} copie`}
      confirmLabel={saveAs ? 'Enregistrer' : 'Dupliquer'}
      maxLength={DOCUMENT_LIMITS.maxNameLength}
      onCancel={() => requestSaveAs(null)}
      onSubmit={(raw) => {
        const copy = useDocumentStore.getState().duplicateDocument(document, normalizeDocumentName(raw));
        requestSaveAs(null);
        if (saveAs) useWorkspaceStore.getState().closeDocument(document.id);
        useWorkspaceStore.getState().openDocument(copy.id);
        showDocument(copy.id);
        return null;
      }}
    />
  );
}

/** Confirmations demandées depuis les menus ou le panneau Calques. */
export function LayerDialogs({ document }: { document: GraphicDocument }) {
  const actions = useLayerActions(document.id);
  const pendingDeleteId = useWorkspaceStore((s) => s.pendingDeleteLayerId);
  const renameId = useWorkspaceStore((s) => s.renameLayerId);
  const requestDelete = useWorkspaceStore((s) => s.requestDeleteLayer);
  const requestRename = useWorkspaceStore((s) => s.requestRenameLayer);
  // Le calque visé est fixé à la demande : la confirmation ne porte que sur lui.
  const toDelete = pendingDeleteId ? findLayer(document, pendingDeleteId) : undefined;
  const toRename = renameId ? findLayer(document, renameId) : undefined;
  return (
    <>
      <ConfirmDialog
        visible={!!toDelete}
        title="Supprimer le calque ?"
        message={toDelete ? `« ${toDelete.name} » sera supprimé du document.` : ''}
        confirmLabel="Supprimer"
        destructive
        onCancel={() => requestDelete(null)}
        onConfirm={() => {
          if (toDelete) actions.remove(toDelete.id);
          requestDelete(null);
        }}
      />
      <PromptDialog
        visible={!!toRename}
        title="Renommer le calque"
        label="Nom du calque"
        initialValue={toRename?.name ?? ''}
        confirmLabel="Renommer"
        maxLength={LAYER_NAME_MAX}
        onCancel={() => requestRename(null)}
        onSubmit={(name) => {
          if (!toRename) return null;
          const error = actions.rename(toRename.id, name);
          if (error === null) requestRename(null);
          return error;
        }}
      />
    </>
  );
}

/**
 * Espace de travail tablette et grand écran : barre de menus, barre
 * d'options, barre d'outils, onglet du document, règles, toile, dock de
 * panneaux et barre d'état.
 */
export function DesktopWorkspace({ document }: { document: GraphicDocument }) {
  const breakpoint = useBreakpoint();
  const tool = useEditorUiStore((s) => s.activeTool);
  const selectedLayerId = useEditorUiStore((s) => s.selectedLayerId);
  const rulersVisible = useWorkspaceStore((s) => s.rulersVisible);
  const panelsHidden = useWorkspaceStore((s) => s.panelsHidden);
  const autoSelect = useWorkspaceStore((s) => s.autoSelect);
  const showTransformControls = useWorkspaceStore((s) => s.showTransformControls);
  const actions = useLayerActions(document.id);
  const resources = useRenderResources();
  const guideProps = useGuideCanvasProps(document);
  const rulerGuides = useMemo(
    () => ({
      docWidth: document.width,
      docHeight: document.height,
      grid: guideProps.grid,
      snap: guideProps.snap,
      onCreate: (orientation: GuideOrientation, position: number) => guideActions.add(document.id, orientation, position),
    }),
    [document.width, document.height, document.id, guideProps.grid, guideProps.snap],
  );
  const controller = useRef<CanvasController>(null);
  const view = useViewSharedValues();
  useEffect(() => registerCanvas(controller), []);
  useEffect(() => {
    void loadWorkspaces();
  }, []);
  const [zoom, setZoom] = useState<number | null>(null);

  const context = useMemo<WorkspaceContextValue>(() => ({ document, controller, view, zoom, setZoom }), [document, view, zoom]);

  return (
    <WorkspaceContext.Provider value={context}>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.root} testID="editor-screen">
        <View style={styles.root} testID="desktop-workspace">
          <MenuBar />
          {panelsHidden ? null : <OptionsBar />}
          <View style={styles.row}>
            {panelsHidden ? null : <ToolRail />}
            <View style={styles.center}>
              <DocTabs />
              <RulersFrame view={view} visible={rulersVisible} guides={rulerGuides}>
                <DocumentCanvasHost
                  document={document}
                  tool={tool}
                  onZoomChange={setZoom}
                  controllerRef={controller}
                  layers={document.layers}
                  selectedLayerId={selectedLayerId}
                  onTapDocument={actions.selectAt}
                  onLayerDragStart={actions.select}
                  resources={resources}
                  onLayerTransformed={actions.transform}
                  view={view}
                  pasteboardColor={ws.pasteboard}
                  autoSelect={autoSelect}
                  showTransformControls={showTransformControls}
                  {...guideProps}
                />
              </RulersFrame>
            </View>
            {panelsHidden ? null : <Dock width={breakpoint === 'expanded' ? wsMetrics.dockWidth : wsMetrics.dockWidthMedium} />}
          </View>
          <StatusBar />
        </View>
        <WorkspaceDialogs />
      </SafeAreaView>
    </WorkspaceContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ws.chrome },
  row: { flex: 1, flexDirection: 'row' },
  center: { flex: 1, backgroundColor: ws.pasteboard },
});
