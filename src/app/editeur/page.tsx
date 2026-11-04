import type { Metadata } from "next";
import { CodeWorkspace } from "@/components/editor/code-workspace";
import { Container, Notice } from "@/components/ui";
import type { LanguageId } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/content/repository";
import { isLanguageId, LANGUAGES } from "@/lib/execution/languages";
import type { SourceFile } from "@/lib/execution/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Éditeur de code" };

export default async function EditorPage({ searchParams }: PageProps<"/editeur">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  let language: LanguageId = isLanguageId(sp.langage) ? sp.langage : "pseudocode";
  let files: SourceFile[] | undefined;
  let stdin = "";
  let programId: string | undefined;
  let title = "";
  let notice: string | null = null;

  if (typeof sp.programme === "string" && user) {
    const supabase = await createClient();
    const { data } = await supabase.from("programs").select("*").eq("id", sp.programme).maybeSingle();
    if (data && isLanguageId(data.language_id)) {
      language = data.language_id;
      files = data.files as SourceFile[];
      stdin = data.stdin;
      programId = data.id;
      title = data.title;
    } else notice = "Programme introuvable.";
  } else if (typeof sp.exemple === "string") {
    const [courseSlug, lessonSlug, index] = sp.exemple.split("/");
    const course = await getCourse(courseSlug);
    const ex = course?.modules.flatMap((m) => m.lessons).find((l) => l.slug === lessonSlug && l.status === "publie")?.examples[Number(index)];
    if (ex) {
      language = ex.language;
      files = [{ name: LANGUAGES[ex.language].mainFile, content: ex.code }];
      stdin = ex.stdin ?? "";
      title = ex.title;
    }
  }

  return (
    <Container className="max-w-[96rem] py-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold text-nuit-900">Éditeur de code</h1>
        <p className="text-xs text-gris-500">Ctrl + Entrée pour exécuter · les programmes s&apos;exécutent dans un environnement isolé avec limites de temps et de mémoire.</p>
      </div>
      {notice && <div className="mb-3"><Notice tone="alerte">{notice}</Notice></div>}
      {!user && <div className="mb-3"><Notice>Connectez-vous pour enregistrer vos programmes et compiler du C ou du Java sur le serveur.</Notice></div>}
      <CodeWorkspace
        key={programId ?? sp.exemple?.toString() ?? language}
        initialLanguage={language}
        initialFiles={files}
        initialStdin={stdin}
        canSave={Boolean(user)}
        programId={programId}
        programTitle={title}
        storageKey={programId || files ? undefined : "editeur"}
      />
    </Container>
  );
}
