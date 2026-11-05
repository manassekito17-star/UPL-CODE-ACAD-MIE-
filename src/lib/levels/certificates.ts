import "server-only";

import type { LevelNumber } from "@/content/types";
import { isSupabaseConfigured } from "../env";
import { createClient } from "../supabase/server";

export interface VerifiedCertificate {
  fullName: string;
  courseTitle: string;
  level: LevelNumber | null;
  levelTitle: string | null;
  score: number | null;
  issuedAt: string;
  code: string;
}

export const isCertificateCode = (code: string) => /^[a-f0-9]{8,64}$/.test(code);

/** Vérification publique d'un certificat par son code (fonction SQL limitée aux champs publics). */
export async function verifyCertificate(code: string): Promise<VerifiedCertificate | null> {
  if (!isCertificateCode(code) || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_certificate", { p_code: code });
  const row = (data as Array<{ full_name: string | null; course_title: string; level_number: number | null; level_title: string | null; score: number | null; issued_at: string }> | null)?.[0];
  if (!row) return null;
  return {
    fullName: row.full_name ?? "",
    courseTitle: row.course_title,
    level: (row.level_number as LevelNumber | null) ?? null,
    levelTitle: row.level_title,
    score: row.score === null ? null : Number(row.score),
    issuedAt: row.issued_at,
    code,
  };
}
