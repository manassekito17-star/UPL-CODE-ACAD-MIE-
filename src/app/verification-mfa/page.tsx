import { redirect } from "next/navigation";
import { Card, Container } from "@/components/ui";
import { getCurrentUser, mfaStatus } from "@/lib/auth";
import { MfaCodeForm } from "./mfa-forms";

export const metadata = { title: "Code de vérification" };

export default async function MfaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/admin");
  const mfa = await mfaStatus();
  if (!mfa.enrolled || mfa.verified) redirect("/admin");
  return (
    <Container className="max-w-md py-14">
      <Card className="p-6">
        <h1 className="text-xl font-bold text-nuit-900">Code de vérification</h1>
        <p className="mt-1 text-sm text-gris-700">Administration protégée : ouvrez votre application d&apos;authentification (Google Authenticator, Microsoft Authenticator…) et saisissez le code à 6 chiffres de « UPL CODE ACADEMY MK ».</p>
        <MfaCodeForm />
        <form action="/auth/deconnexion" method="post" className="mt-4 text-center">
          <button className="text-sm text-electrique-600 underline">Se déconnecter</button>
        </form>
      </Card>
    </Container>
  );
}
