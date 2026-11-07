import { getCurrentUser, isStaff } from "@/lib/auth";
import { verifyCertificate } from "@/lib/levels/certificates";
import { buildCertificatePdf } from "@/lib/levels/pdf";
import { createClient } from "@/lib/supabase/server";

/** PDF du certificat : réservé à son titulaire (et à l'équipe). */
export async function GET(request: Request, ctx: RouteContext<"/certificats/[code]/pdf">) {
  const { code } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Connexion requise.", { status: 401 });
  const cert = await verifyCertificate(code);
  if (!cert) return new Response("Certificat introuvable.", { status: 404 });
  if (!isStaff(user)) {
    const supabase = await createClient();
    const { data } = await supabase.from("certificates").select("id").eq("verification_code", code).eq("user_id", user.id).maybeSingle();
    if (!data) return new Response("Accès refusé.", { status: 403 });
  }
  const verifyUrl = `${new URL(request.url).origin}/certificats/${code}`;
  const pdf = await buildCertificatePdf({ ...cert, verifyUrl });
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="certificat-${code}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
