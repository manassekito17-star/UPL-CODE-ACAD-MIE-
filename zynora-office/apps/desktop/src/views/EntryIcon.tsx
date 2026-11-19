import { File, FileText, Folder, Presentation, Sheet } from "lucide-react";

import type { EntryKind } from "../ipc";

export function EntryIcon({ kind }: { kind: EntryKind }) {
  const props = { size: 18, "aria-hidden": true, className: `entry-icon entry-icon--${kind}` } as const;
  switch (kind) {
    case "folder":
      return <Folder {...props} />;
    case "text":
      return <FileText {...props} />;
    case "spreadsheet":
      return <Sheet {...props} />;
    case "presentation":
      return <Presentation {...props} />;
    default:
      return <File {...props} />;
  }
}
