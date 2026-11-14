import { deleteAnnouncement, saveAnnouncement } from "@/app/admin/actions";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { formatDate } from "@/components/ui/labels";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Annonces" };

export default async function AnnouncementsPage() {
  await requireStaff("contenus");
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-nuit-900">Annonces</h1>
      <p className="text-sm text-gris-700">
        La dernière annonce publiée s&apos;affiche en fenêtre « Message de l&apos;administration » à l&apos;ouverture de la plateforme, une fois pour chaque utilisateur. Sans annonce publiée, le message de bienvenue par défaut est affiché.
      </p>
      <Card className="p-5">
        <form action={saveAnnouncement} className="space-y-3">
          <Field label="Titre" htmlFor="title"><input id="title" name="title" required className={inputClass} /></Field>
          <Field label="Message (Markdown)" htmlFor="body"><textarea id="body" name="body" rows={3} required className={inputClass} /></Field>
          <div className="flex flex-wrap items-center gap-4">
            <select name="audience" className={`${inputClass} w-auto`} aria-label="Public"><option value="tous">Tous</option><option value="etudiants">Étudiants</option><option value="enseignants">Enseignants</option></select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Publier immédiatement</label>
            <Button>Ajouter l&apos;annonce</Button>
          </div>
        </form>
      </Card>
      {(data ?? []).map((a) => (
        <Card key={a.id} className="flex flex-wrap items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-nuit-900">{a.title} <Badge tone={a.published ? "vert" : "gris"}>{a.published ? "publiée" : "brouillon"}</Badge> <Badge>{a.audience}</Badge></p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gris-700">{a.body}</p>
            <p className="mt-1 text-xs text-gris-500">{formatDate(a.created_at)}</p>
          </div>
          <form action={saveAnnouncement}>
            <input type="hidden" name="id" value={a.id} /><input type="hidden" name="title" value={a.title} /><input type="hidden" name="body" value={a.body} /><input type="hidden" name="audience" value={a.audience} />
            {!a.published && <input type="hidden" name="published" value="on" />}
            <Button size="sm" variant="secondaire">{a.published ? "Dépublier" : "Publier"}</Button>
          </form>
          <form action={deleteAnnouncement}><input type="hidden" name="id" value={a.id} /><Button size="sm" variant="danger">Supprimer</Button></form>
        </Card>
      ))}
    </div>
  );
}
