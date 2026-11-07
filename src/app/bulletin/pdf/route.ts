import { getCurrentUser } from "@/lib/auth";
import { getBulletin } from "@/lib/levels/bulletin";
import { buildBulletinPdf } from "@/lib/levels/pdf";

/** Bulletin de progression de l'étudiant connecté, en PDF. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Connexion requise.", { status: 401 });
  const pdf = await buildBulletinPdf({ name: user.fullName, email: user.email }, await getBulletin(user));
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="bulletin-upl-code-academy-mk.pdf"', "Cache-Control": "private, no-store" },
  });
}
