import { createContext, useContext, type RefObject } from 'react';

import type { CanvasController, ViewSharedValues } from '@/engine/canvas';
import type { GraphicDocument } from '@/engine/documents';

/** Ce que partagent les éléments de l'espace de travail : document, vue et zoom. */
export interface WorkspaceContextValue {
  document: GraphicDocument;
  controller: RefObject<CanvasController | null>;
  view: ViewSharedValues;
  zoom: number | null;
  setZoom: (percent: number) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace doit être utilisé dans l'espace de travail.");
  return value;
}

/** Facteur d'un clic de zoom (√2 : deux clics doublent le zoom). */
export const ZOOM_STEP = Math.SQRT2;
