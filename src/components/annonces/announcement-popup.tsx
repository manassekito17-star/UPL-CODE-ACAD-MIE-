import { getCurrentUser } from "@/lib/auth";
import { oldEnoughToRate, WELCOME_ANNOUNCEMENT, type PopupAnnouncement } from "@/lib/announcement";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementModal } from "./announcement-modal";

/**
 * Message de l'administration affiché à l'ouverture de la plateforme : la dernière annonce
 * publiée (Administration » Annonces) ou, à défaut, le message de bienvenue. Une seule fois
 * par annonce et par appareil, uniquement pour les utilisateurs connectés.
 * La note sur 5 étoiles n'est proposée qu'aux comptes créés depuis au moins 7 jours
 * (et qui n'ont pas encore donné leur avis).
 */
export async function AnnouncementPopup() {
  if (!isSupabaseConfigured()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  let a: PopupAnnouncement = WELCOME_ANNOUNCEMENT;
  let ratingEligible = false;
  let alreadyRated = false;
  try {
    const supabase = await createClient();
    const [{ data: profile }, rating] = await Promise.all([
      supabase.from("profiles").select("created_at").eq("id", user.id).maybeSingle(),
      supabase.from("app_ratings").select("stars").eq("user_id", user.id).maybeSingle(),
    ]);
    // Avis activés (table présente) et compte utilisé depuis au moins 7 jours.
    ratingEligible = !rating.error && oldEnoughToRate(profile?.created_at);
    alreadyRated = !!rating.data;
    const { data } = await supabase.from("announcements").select("id, title, body, audience, created_at").eq("published", true).order("created_at", { ascending: false }).limit(5);
    const visible = (data ?? []).find((x) => x.audience !== "enseignants" || user.isTeacher || user.isAdmin);
    if (visible) a = { id: visible.id, title: visible.title, body: visible.body, date: visible.created_at, signature: "L'administration — UPL CODE ACADEMY MK" };
  } catch {
    /* annonce indisponible : message de bienvenue */
  }
  return <AnnouncementModal announcement={a} firstName={user.fullName?.split(" ")[0] ?? ""} ratingEligible={ratingEligible} alreadyRated={alreadyRated} />;
}
