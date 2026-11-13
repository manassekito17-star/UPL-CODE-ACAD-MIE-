import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "../env";
import { SESSION_COOKIE_OPTIONS } from "./cookies";

/**
 * Connexion obligatoire : toute la plateforme demande un compte (Google ou e-mail), sauf
 * ces pages publiques. Google exige que l'accueil et la politique de confidentialité restent
 * publics ; la vérification d'un certificat reste ouverte aux employeurs. Les API vérifient
 * elles-mêmes la session (réponse JSON 401, pas de redirection).
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/confidentialite",
  "/conditions",
  "/telecharger",
  "/compte-suspendu",
  "/acces-refuse",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/ide.webmanifest",
  "/editeur.webmanifest",
  "/sw.js",
]);
const PUBLIC_PREFIXES = ["/auth/", "/api/", "/certificats/", "/workers/", "/icons/", "/opengraph-image", "/twitter-image"];

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path) || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    // Cookies de session illisibles par JavaScript (HttpOnly) : le navigateur ne parle jamais
    // directement à Supabase, seul le serveur lit la session.
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Rafraîchit le jeton si nécessaire. Ne rien exécuter entre createServerClient et getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && !isPublicPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?suite=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return response;
}
