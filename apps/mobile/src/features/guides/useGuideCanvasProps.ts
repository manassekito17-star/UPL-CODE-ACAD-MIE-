import { useCallback } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import { useWorkspaceStore } from '@/stores/workspaceStore';

import { guideActions } from './guideActions';

/** Repères, grille et magnétisme à passer au canvas du document. */
export function useGuideCanvasProps(document: GraphicDocument) {
  const guidesVisible = useWorkspaceStore((s) => s.guidesVisible);
  const guidesLocked = useWorkspaceStore((s) => s.guidesLocked);
  const gridVisible = useWorkspaceStore((s) => s.gridVisible);
  const grid = useWorkspaceStore((s) => s.grid);
  const snap = useWorkspaceStore((s) => s.snapEnabled);
  const id = document.id;
  const onGuideDropped = useCallback((guideId: string, position: number) => guideActions.drop(id, guideId, position), [id]);
  return { guides: document.guides, guidesVisible, guidesLocked, grid: gridVisible ? grid : null, snap, onGuideDropped };
}
