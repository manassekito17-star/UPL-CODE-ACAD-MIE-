import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Taille maximale d'une photo envoyée par le formulaire (déjà réduite dans le navigateur). */
export const AVATAR_MAX_BYTES = 400_000;

/**
 * Photo de profil reçue sous forme de « data URL » JPEG (réduite à 512 px par le navigateur).
 * Vérifie le format réel (signature JPEG), la taille, puis l'enregistre dans le dossier de
 * l'utilisateur (stockage « avatars » : chacun n'écrit que dans son propre dossier).
 */
export function decodeAvatar(dataUrl: unknown): Uint8Array | null | "invalide" {
  if (typeof dataUrl !== "string" || dataUrl === "") return null;
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return "invalide";
  const bytes = Uint8Array.from(Buffer.from(m[1], "base64"));
  if (bytes.length < 100 || bytes.length > AVATAR_MAX_BYTES) return "invalide";
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return "invalide";
  return bytes;
}

export async function saveAvatar(supabase: SupabaseClient, userId: string, bytes: Uint8Array): Promise<string | null> {
  const path = `${userId}/photo-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, bytes, { contentType: "image/jpeg", upsert: false, cacheControl: "31536000" });
  if (error) return null;
  const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  const { error: e2 } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  return e2 ? null : url;
}
