import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "../env";

/**
 * Client serveur lié à la session de l'utilisateur (cookies).
 * Toutes les requêtes passent par les politiques RLS avec l'identité de l'utilisateur.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
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
