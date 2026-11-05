import Link from "next/link";
import { notFound } from "next/navigation";
import { saveModule, setCourseStatus } from "@/app/admin/actions";
import { CourseForm, type CourseRow } from "@/components/admin/course-form";
import { Badge, Button, ButtonLink, Card, inputClass } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_TONES } from "@/components/admin/status";

export default async function AdminCourse({ params }: PageProps<"/admin/formations/[slug]">) {
  await requireStaff("contenus");
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (!course) notFound();
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from("modules").select("*").eq("course_id", course.id).order("position"),
    supabase.from("lessons").select("id, module_id, slug, title, status, position").eq("course_id", course.id).order("position"),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold text-nuit-900">{course.title}</h1>
        <Badge tone={STATUS_TONES[course.status as keyof typeof STATUS_TONES]}>{course.status}</Badge>
        {(["brouillon", "en_revision", "publie", "archive"] as const).filter((s) => s !== course.status).map((s) => (
          <form key={s} action={setCourseStatus}>
            <input type="hidden" name="id" value={course.id} /><input type="hidden" name="slug" value={course.slug} /><input type="hidden" name="status" value={s} />
            <Button size="sm" variant="secondaire">→ {s}</Button>
          </form>
        ))}
        <ButtonLink href={`/formations/${course.slug}`} size="sm" variant="fantome">Voir la page</ButtonLink>
      </div>
      <Card className="p-5"><CourseForm course={course as CourseRow} /></Card>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-xl font-bold text-nuit-900">Modules et leçons</h2>
        <ButtonLink href={`/admin/formations/${course.slug}/niveaux`} size="sm" variant="secondaire">Niveaux, critères, examens et positionnement →</ButtonLink>
      </div>
      {(modules ?? []).map((m) => (
        <Card key={m.id} className="p-4">
          <form action={saveModule} className="grid gap-2 sm:grid-cols-[1fr_10rem_9rem_5rem_auto]">
            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="courseSlug" value={course.slug} />
            <input type="hidden" name="description" value={m.description ?? ""} />
            <input name="title" defaultValue={m.title} className={inputClass} aria-label="Titre du module" />
            <input name="slug" defaultValue={m.slug} className={inputClass} aria-label="Slug du module" />
            <select name="level_number" defaultValue={m.level_number ?? ""} className={inputClass} aria-label="Niveau du module">
              <option value="">Sans niveau</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Niveau {n}</option>)}
            </select>
            <input name="position" type="number" defaultValue={m.position} className={inputClass} aria-label="Position" />
            <Button size="sm" variant="secondaire">Enregistrer</Button>
          </form>
          <ul className="mt-3 divide-y divide-gris-100">
            {(lessons ?? []).filter((l) => l.module_id === m.id).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-8 text-xs text-gris-500">{l.position}</span>
                <Link href={`/admin/formations/${course.slug}/lecons/${l.id}`} className="flex-1 text-nuit-900 hover:text-electrique-600">{l.title}</Link>
                <Badge tone={STATUS_TONES[l.status as keyof typeof STATUS_TONES]}>{l.status}</Badge>
              </li>
            ))}
          </ul>
          <ButtonLink href={`/admin/formations/${course.slug}/lecons/nouvelle?module=${m.id}`} size="sm" variant="fantome" className="mt-2">+ Ajouter une leçon</ButtonLink>
        </Card>
      ))}
      <Card className="p-4">
        <h3 className="mb-2 font-semibold text-nuit-900">Nouveau module</h3>
        <form action={saveModule} className="grid gap-2 sm:grid-cols-[1fr_10rem_9rem_5rem_auto]">
          <input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="courseSlug" value={course.slug} />
          <input name="title" required placeholder="Titre du module" className={inputClass} />
          <input name="slug" required placeholder="slug-du-module" className={inputClass} />
          <select name="level_number" defaultValue="1" className={inputClass} aria-label="Niveau du nouveau module">
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Niveau {n}</option>)}
          </select>
          <input name="position" type="number" defaultValue={(modules?.length ?? 0) + 1} className={inputClass} />
          <Button size="sm">Ajouter</Button>
        </form>
      </Card>
      <p className="text-sm"><Link href="/admin/formations" className="text-electrique-600 hover:underline">← Toutes les formations</Link></p>
    </div>
  );
}
