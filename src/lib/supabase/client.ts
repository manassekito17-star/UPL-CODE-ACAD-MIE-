"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "../env";

/** Client navigateur : utilise uniquement la clé publique (anon). Les accès sont limités par RLS. */
export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
