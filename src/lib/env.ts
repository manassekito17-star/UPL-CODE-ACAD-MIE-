/**
 * Lecture centralisée de la configuration.
 * Les variables NEXT_PUBLIC_* sont visibles dans le navigateur ; les autres
 * restent strictement côté serveur.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Bouton « Continuer avec Google » : à activer seulement une fois le fournisseur Google configuré dans Supabase. */
  googleAuth: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true",
};

/** Supabase est-il configuré ? Sinon l'application fonctionne en « mode démonstration ». */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
