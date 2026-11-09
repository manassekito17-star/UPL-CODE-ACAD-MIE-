import type { Metadata } from "next";
import type { Viewport } from "next";
import { AlgoStudio } from "@/components/editor/algo-studio";
import type { LanguageId } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/content/repository";
import { isLanguageId, LANGUAGES } from "@/lib/execution/languages";
import type { SourceFile } from "@/lib/execution/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Éditeur de code",
  // Application installable « UPL Algo » (écran d'accueil), utilisable sans Internet.
  manifest: "/editeur.webmanifest",
  appleWebApp: { capable: true, title: "UPL Algo", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/editeur-apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#3c3f41" };

export default async function EditorPage({ searchParams }: PageProps<"/editeur">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  let language: LanguageId = isLanguageId(sp.langage) ? sp.langage : "pseudocode";
  let files: SourceFile[] | undefined;
  let stdin = "";
  let programId: string | undefined;
  let title = "";
  let notice: string | null = null;
  // Retour au cours : uniquement vers une page de formation de la plateforme (pas de redirection ouverte).
  let back: string | null = typeof sp.retour === "string" && /^\/formations\/[a-z0-9-]+(\/[a-z0-9-]+)?(#[a-z0-9-]+)?$/.test(sp.retour) ? sp.retour : null;

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
  } else if (typeof sp.exemple === "string" || typeof sp.algorithme === "string") {
    // Démonstration ouverte depuis un chapitre : exemple exécutable ou algorithme commenté.
    const ref = (typeof sp.exemple === "string" ? sp.exemple : (sp.algorithme as string)).split("/");
    const [courseSlug, lessonSlug, index] = ref;
    const course = /^[a-z0-9-]{2,80}$/.test(courseSlug ?? "") ? await getCourse(courseSlug) : null;
    const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.slug === lessonSlug && l.status === "publie");
    const ex = typeof sp.exemple === "string" ? lesson?.examples[Number(index)] : undefined;
    const algo = typeof sp.algorithme === "string" ? lesson?.pedagogy?.commentedAlgorithms[Number(index)] : undefined;
    const source = ex ? { language: ex.language, code: ex.code, stdin: ex.stdin, title: ex.title } : algo ? { language: algo.language ?? "pseudocode", code: algo.code, stdin: algo.stdin, title: algo.title } : null;
    if (source && course && lesson) {
      language = source.language;
      files = LANGUAGES[language].preview && LANGUAGES[language].defaultFiles
        ? LANGUAGES[language].defaultFiles!.map((f) => (f.name === "index.html" ? { name: f.name, content: source.code } : { name: f.name, content: "" }))
        : [{ name: LANGUAGES[language].mainFile, content: source.code }];
      stdin = source.stdin ?? "";
      title = source.title;
      back ??= `/formations/${course.slug}/${lesson.slug}#${ex ? "exemples" : "algorithmes"}`;
    }
  }

  return (
    <AlgoStudio
      key={programId ?? sp.exemple?.toString() ?? sp.algorithme?.toString() ?? language}
      initialLanguage={language}
      initialFiles={files}
      initialStdin={stdin}
      canSave={Boolean(user)}
      programId={programId}
      programTitle={title}
      back={back}
      initialNotice={notice}
    />
  );
}
