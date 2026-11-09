import { unenrollTotp } from "@/app/verification-mfa/actions";
import { MfaEnroll } from "@/app/verification-mfa/mfa-forms";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Card, Notice } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sécurité du compte" };

export default async function SecurityPage({ searchParams }: PageProps<"/admin/securite">) {
  await requireAdmin();
  const sp = await searchParams;
  const message = typeof sp.message === "string" ? sp.message.slice(0, 200) : "";
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factors = (data?.totp ?? []).filter((f) => f.status === "verified");
  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-nuit-900">Sécurité du compte</h1>
        <p className="text-sm text-gris-700">Le second facteur protège l&apos;administration même si votre mot de passe ou votre session sont volés : un code à 6 chiffres, généré par votre téléphone, est demandé à chaque connexion à l&apos;administration.</p>
      </div>
      {message && <Notice tone="info">{message}</Notice>}
      <Card className="space-y-3 p-5">
        <h2 className="font-semibold text-nuit-900">Second facteur (code à 6 chiffres)</h2>
        {factors.length ? (
          <>
            <p className="text-sm text-green-800" data-testid="mfa-statut">✓ Activé — {factors.map((f) => `ajouté le ${formatDateTime(f.created_at)}`).join(", ")}.</p>
            {factors.map((f) => (
              <form key={f.id} action={unenrollTotp}>
                <input type="hidden" name="factorId" value={f.id} />
                <ConfirmSubmit variant="danger" message="Désactiver le second facteur ? L'administration ne demandera plus de code.">Désactiver</ConfirmSubmit>
              </form>
            ))}
          </>
        ) : (
          <>
            <p className="text-sm text-amber-800" data-testid="mfa-statut">Non activé (recommandé pour tous les administrateurs).</p>
            <MfaEnroll />
          </>
        )}
        <p className="text-xs text-gris-500">Gardez votre téléphone avec l&apos;application d&apos;authentification. En cas de perte, un autre administrateur (ou le SQL Editor de Supabase : <code>delete from auth.mfa_factors where user_id = …</code>) peut retirer le facteur.</p>
      </Card>
    </div>
  );
}
