import Link from "next/link";
import { setCourseStatus } from "@/app/admin/actions";
import { CourseForm } from "@/components/admin/course-form";
import { STATUS_TONES } from "@/components/admin/status";
import { Badge, Button, Card } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Formations" };

export default async function AdminCourses() {
  await requireStaff("contenus");
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id, slug, title, status, language_id, validated_at, lessons(id, status)").order("sort_order");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-nuit-900">Formations et leçons</h1>
      <p className="text-sm text-gris-700">Un cours n&apos;est visible des étudiants qu&apos;une fois <strong>publié</strong> ; la publication enregistre l&apos;enseignant qui a validé le contenu.</p>
      <div className="space-y-2">
        {(courses ?? []).map((c) => {
          const lessons = c.lessons as Array<{ status: string }>;
          return (
            <Card key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <Link href={`/admin/formations/${c.slug}`} className="min-w-0 flex-1">
                <p className="font-semibold text-nuit-900 hover:text-electrique-600">{c.title}</p>
                <p className="text-xs text-gris-500">{c.language_id} · {lessons.filter((l) => l.status === "publie").length}/{lessons.length} leçons publiées</p>
              </Link>
              <Badge tone={STATUS_TONES[c.status as keyof typeof STATUS_TONES]}>{c.status}</Badge>
              <form action={setCourseStatus}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="slug" value={c.slug} />
                <input type="hidden" name="status" value={c.status === "publie" ? "brouillon" : "publie"} />
                <Button size="sm" variant={c.status === "publie" ? "secondaire" : "primaire"}>{c.status === "publie" ? "Dépublier" : "Valider et publier"}</Button>
              </form>
            </Card>
          );
        })}
      </div>
      <Card className="p-5">
        <h2 className="mb-4 font-bold text-nuit-900">Nouvelle formation</h2>
        <CourseForm />
      </Card>
    </div>
  );
}
