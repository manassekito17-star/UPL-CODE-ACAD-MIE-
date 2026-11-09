import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "../env";
import { SESSION_COOKIE_OPTIONS } from "./cookies";

/**
 * Client serveur lié à la session de l'utilisateur (cookies).
 * Toutes les requêtes passent par les politiques RLS avec l'identité de l'utilisateur.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    // Cookies de session illisibles par JavaScript (HttpOnly) : le navigateur ne parle jamais
    // directement à Supabase, seul le serveur lit la session.
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Appel depuis un composant serveur : le proxy se charge du rafraîchissement.
        }
      },
    },
  });
}
