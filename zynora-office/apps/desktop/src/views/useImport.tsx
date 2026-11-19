import { Button, Dialog, useToasts } from "@zynora/design-system";
import { useState, type ReactNode } from "react";

import { errorText, useApp } from "../context";
import type { ImportOutcome } from "../ipc";

/**
 * Import via le dialogue natif (ouvert par le cœur Rust). Renvoie la fonction d'import et la
 * fenêtre qui détaille les fichiers refusés par les contrôles de sécurité ou de format.
 */
export function useImport(onImported: () => void): { importInto: (folder: string) => Promise<void>; rejectedDialog: ReactNode } {
  const { api, t } = useApp();
  const toast = useToasts();
  const [rejected, setRejected] = useState<ImportOutcome["rejected"]>([]);

  async function importInto(folder: string) {
    let outcome: ImportOutcome;
    try {
      outcome = await api.importDocuments(folder);
    } catch (error) {
      toast({ tone: "error", message: errorText(error, t) });
      return;
    }
    if (outcome.cancelled) return;
    if (outcome.imported.length > 0) {
      toast({ tone: "success", message: t("docs.imported", { n: outcome.imported.length }) });
      onImported();
    }
    setRejected(outcome.rejected);
  }

  const rejectedDialog = (
    <Dialog
      open={rejected.length > 0}
      title={t("docs.rejected.title")}
      description={t("docs.rejected.desc")}
      onClose={() => setRejected([])}
      actions={
        <Button variant="primary" onClick={() => setRejected([])}>
          {t("dialog.close")}
        </Button>
      }
    >
      <ul className="rejected">
        {rejected.map((r) => (
          <li key={r.name}>
            <strong>{r.name}</strong>
            <span>{r.reason}</span>
          </li>
        ))}
      </ul>
    </Dialog>
  );

  return { importInto, rejectedDialog };
}
