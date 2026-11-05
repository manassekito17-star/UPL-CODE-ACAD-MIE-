import { getLessonContext } from "@/lib/content/repository";
import { buildChapterSummaryPdf } from "@/lib/formation/pdf";

/** Résumé du chapitre au format PDF (téléchargement). */
export async function GET(_request: Request, ctx: RouteContext<"/formations/[course]/[lesson]/resume">) {
  const { course: courseSlug, lesson: lessonSlug } = await ctx.params;
  const c = await getLessonContext(courseSlug, lessonSlug);
  if (!c || c.course.status !== "publie" || c.lesson.status !== "publie") {
    return new Response("Chapitre introuvable.", { status: 404 });
  }
  const pdf = await buildChapterSummaryPdf(c.course, c.lesson);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume-${c.lesson.slug}.pdf"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
