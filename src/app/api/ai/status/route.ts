import { NextResponse } from "next/server";
import { aiAvailability, getAiProvider, providerBilling } from "@/lib/ai";
import { checkAiQuota } from "@/lib/ai/quota";
import { getCurrentUser } from "@/lib/auth";
import { entitlements } from "@/lib/plans";
import { getSettings } from "@/lib/settings";
import { userPlan } from "@/lib/usage";

/** État du professeur IA pour l'étudiant : disponibilité, fournisseur, limites et questions restantes. */
export async function GET() {
  const user = await getCurrentUser();
  const settings = await getSettings();
  const availability = aiAvailability(settings.ai);
  const ent = entitlements(await userPlan(user?.id ?? null), settings);
  const provider = getAiProvider();
  let remainingToday: number | undefined;
  let reason = availability.reason;
  let available = availability.available;
  if (available && provider && user) {
    const q = await checkAiQuota(user.id, settings.ai, providerBilling(provider), ent.aiMessagesPerDay);
    remainingToday = q.remainingToday;
    if (!q.ok) {
      available = false;
      reason = q.reason;
    }
  }
  return NextResponse.json(
    { available, reason, provider: availability.provider, billing: availability.billing, plan: ent.plan, dailyLimit: ent.aiMessagesPerDay, remainingToday },
    { headers: { "Cache-Control": "no-store" } },
  );
}
