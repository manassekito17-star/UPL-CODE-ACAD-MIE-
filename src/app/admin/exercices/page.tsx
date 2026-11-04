import Link from "next/link";
import { STATUS_TONES } from "@/components/admin/status";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Exercices" };

export default async function AdminExercises() {
  await requireStaff("contenus");
  const supabase = await createClient();
  const { data } = await supabase.from("exercises").select("slug, title, language_id, difficulty, status, courses(title)").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-nuit-900">Exercices et tests</h1>
        <ButtonLink href="/admin/exercices/nouveau">+ Nouvel exercice</ButtonLink>
      </div>
      <Card className="divide-y divide-gris-100">
        {(data ?? []).map((e) => (
          <Link key={e.slug} href={`/admin/exercices/${e.slug}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gris-50">
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-nuit-900">{e.title}</span>
              <span className="text-xs text-gris-500">{(e.courses as unknown as { title: string } | null)?.title ?? "Sans parcours"} · {e.language_id} · {e.difficulty}</span>
            </span>
            <Badge tone={STATUS_TONES[e.status as keyof typeof STATUS_TONES]}>{e.status}</Badge>
          </Link>
        ))}
      </Card>
    </div>
  );
}
