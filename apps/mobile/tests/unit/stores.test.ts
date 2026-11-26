import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';
import { formatDateTime } from '@/utils/date';
import { createLocalId } from '@/utils/id';

const spec = (name: string) => ({ width: 100, height: 100, background: 'white' as const, name });

describe('documentStore', () => {
  beforeEach(resetDocumentStore);

  it('ajoute les documents en tête de liste', () => {
    const a = useDocumentStore.getState().createDocument(spec('A'));
    const b = useDocumentStore.getState().createDocument(spec('B'));
    const { order, documents } = useDocumentStore.getState();
    expect(order).toEqual([b.id, a.id]);
    expect(documents[a.id]?.name).toBe('A');
    expect(a.id).not.toBe(b.id);
  });

  it('supprime exactement le document demandé', () => {
    const a = useDocumentStore.getState().createDocument(spec('A'));
    const b = useDocumentStore.getState().createDocument(spec('B'));
    const c = useDocumentStore.getState().createDocument(spec('C'));
    expect(useDocumentStore.getState().removeDocument(b.id)).toBe(true);
    const { order, documents } = useDocumentStore.getState();
    expect(order).toEqual([c.id, a.id]);
    expect(Object.keys(documents).sort()).toEqual([a.id, c.id].sort());
  });

  it("ne supprime rien quand l'identifiant est inconnu", () => {
    const a = useDocumentStore.getState().createDocument(spec('A'));
    expect(useDocumentStore.getState().removeDocument('doc_inconnu')).toBe(false);
    expect(useDocumentStore.getState().order).toEqual([a.id]);
  });
});

describe('editorUiStore', () => {
  beforeEach(resetEditorUiStore);

  it('ouvre un seul panneau à la fois sur petit écran', () => {
    const { toggleCompactSheet } = useEditorUiStore.getState();
    toggleCompactSheet('layers');
    expect(useEditorUiStore.getState().compactSheet).toBe('layers');
    toggleCompactSheet('properties');
    expect(useEditorUiStore.getState().compactSheet).toBe('properties');
    toggleCompactSheet('properties');
    expect(useEditorUiStore.getState().compactSheet).toBeNull();
  });

  it('replie les panneaux indépendamment sur grand écran', () => {
    useEditorUiStore.getState().togglePanelExpanded('layers');
    expect(useEditorUiStore.getState().expandedPanels).toEqual({ layers: false, properties: true });
    useEditorUiStore.getState().toggleSidePanels();
    expect(useEditorUiStore.getState().sidePanelsVisible).toBe(false);
  });
});

describe('utilitaires', () => {
  it('formate une date en français', () => {
    expect(formatDateTime(new Date(2026, 10, 26, 7, 5).getTime())).toBe('26/11/2026 à 07:05');
  });

  it('génère des identifiants uniques même à horodatage identique', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createLocalId('doc', 42)));
    expect(ids.size).toBe(500);
    expect([...ids][0]).toMatch(/^doc_[0-9a-z]+$/);
  });
});
