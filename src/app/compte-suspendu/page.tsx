import { Container } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Compte suspendu" };

export default async function Suspended() {
  const user = await getCurrentUser();
  let until: string | null = null;
  let reason: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("suspended_until, suspended_reason").eq("id", user.id).maybeSingle();
    until = (data as { suspended_until?: string | null } | null)?.suspended_until ?? null;
    reason = (data as { suspended_reason?: string | null } | null)?.suspended_reason ?? null;
  }
  const fin = until ? new Date(until).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Kinshasa" }) : null;
  return (
    <Container className="py-20 text-center">
      <p className="text-5xl">⛔</p>
      <h1 className="mt-4 text-2xl font-bold text-nuit-900">Compte suspendu</h1>
      <p className="mt-2 text-gris-700">
        Votre compte a été suspendu par l&apos;administration{fin ? <> jusqu&apos;au <strong>{fin}</strong> (heure de Kinshasa)</> : ""}.
        {fin ? " Il sera réactivé automatiquement à cette date." : " Contactez le responsable de la plateforme pour plus d'informations."}
      </p>
      {reason && <p className="mt-3 text-sm text-gris-700">Motif : {reason}</p>}
      <form action="/auth/deconnexion" method="post" className="mt-6"><button className="text-electrique-600 underline">Se déconnecter</button></form>
    </Container>
  );
}
