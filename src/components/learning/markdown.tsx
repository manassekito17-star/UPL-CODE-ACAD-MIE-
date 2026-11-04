import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../ui";

/** Rendu Markdown sûr : le HTML brut n'est pas interprété (protection XSS). */
export function Markdown({ children, className, invert = false }: { children: string; className?: string; invert?: boolean }) {
  return (
    <div className={cn("prose-upl", invert && "prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}
