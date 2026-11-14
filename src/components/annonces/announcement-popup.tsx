import { getCurrentUser } from "@/lib/auth";
import { WELCOME_ANNOUNCEMENT, type PopupAnnouncement } from "@/lib/announcement";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementModal } from "./announcement-modal";

/**
 * Message de l'administration affiché à l'ouverture de la plateforme : la dernière annonce
 * publiée (Administration » Annonces) ou, à défaut, le message de bienvenue. Une seule fois
 * par annonce et par appareil, uniquement pour les utilisateurs connectés.
 */
export async function AnnouncementPopup() {
  if (!isSupabaseConfigured()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  let a: PopupAnnouncement = WELCOME_ANNOUNCEMENT;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("announcements").select("id, title, body, audience, created_at").eq("published", true).order("created_at", { ascending: false }).limit(5);
    const visible = (data ?? []).find((x) => x.audience !== "enseignants" || user.isTeacher || user.isAdmin);
    if (visible) a = { id: visible.id, title: visible.title, body: visible.body, date: visible.created_at, signature: "L'administration — UPL CODE ACADEMY MK" };
  } catch {
    /* annonce indisponible : message de bienvenue */
  }
  return <AnnouncementModal announcement={a} firstName={user.fullName?.split(" ")[0] ?? ""} />;
}
