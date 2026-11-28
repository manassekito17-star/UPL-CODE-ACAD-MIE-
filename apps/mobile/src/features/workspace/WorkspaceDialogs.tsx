import { ConfirmDialog, PromptDialog } from '@/components/ui';
import { DEFAULT_WORKSPACE, WORKSPACE_NAME_MAX, useWorkspaceStore } from '@/stores/workspaceStore';

/** Fenêtre › Espace de travail : « Nouvel espace de travail… » et « Supprimer l'espace de travail… ». */
export function WorkspaceDialogs() {
  const dialog = useWorkspaceStore((s) => s.workspaceDialog);
  const setDialog = useWorkspaceStore((s) => s.setWorkspaceDialog);
  const name = useWorkspaceStore((s) => s.workspaceName);
  const close = () => setDialog(null);
  return (
    <>
      <PromptDialog
        visible={dialog === 'new'}
        title="Nouvel espace de travail"
        label="Nom (la disposition actuelle des panneaux et de la barre d’outils est enregistrée)"
        initialValue={name === DEFAULT_WORKSPACE ? '' : name}
        confirmLabel="Enregistrer"
        maxLength={WORKSPACE_NAME_MAX}
        onCancel={close}
        onSubmit={(value) => {
          const error = useWorkspaceStore.getState().saveWorkspace(value);
          if (error === null) close();
          return error;
        }}
      />
      <ConfirmDialog
        visible={dialog === 'delete' && name !== DEFAULT_WORKSPACE}
        title="Supprimer l’espace de travail ?"
        message={`« ${name} » sera supprimé. La disposition actuelle reste affichée ; l’espace ${DEFAULT_WORKSPACE} devient l’espace actuel.`}
        confirmLabel="Supprimer"
        destructive
        onCancel={close}
        onConfirm={() => {
          useWorkspaceStore.getState().deleteWorkspace(name);
          close();
        }}
      />
    </>
  );
}
