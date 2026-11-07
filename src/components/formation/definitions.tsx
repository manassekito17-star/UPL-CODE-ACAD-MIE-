import type { Definition } from "@/content/types";
import { Markdown } from "../learning/markdown";

export function DefinitionsView({ definitions }: { definitions: Definition[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {definitions.map((d) => (
        <div key={d.term} className="rounded-xl border-l-4 border-cyan-accent bg-white p-4 shadow-sm">
          <dt className="font-bold text-nuit-900">{d.term}</dt>
          <dd className="mt-1 text-sm text-gris-700"><Markdown>{d.definition}</Markdown></dd>
        </div>
      ))}
    </dl>
  );
}
