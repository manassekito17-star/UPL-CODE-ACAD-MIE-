import { Container } from "@/components/ui";

export const metadata = { title: "Compte suspendu" };

export default function Suspended() {
  return (
    <Container className="py-20 text-center">
      <p className="text-5xl">⛔</p>
      <h1 className="mt-4 text-2xl font-bold text-nuit-900">Compte suspendu</h1>
      <p className="mt-2 text-gris-700">Votre compte a été suspendu par l&apos;administration. Contactez le responsable de la plateforme pour plus d&apos;informations.</p>
      <form action="/auth/deconnexion" method="post" className="mt-6"><button className="text-electrique-600 underline">Se déconnecter</button></form>
    </Container>
  );
}
