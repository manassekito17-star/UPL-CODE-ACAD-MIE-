import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { recordLessonActivity } from "@/lib/progress";
import { progressSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const body = await parseBody(request, progressSchema);
  if ("response" in body) return body.response;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ saved: false });
  if (user.status === "suspendu") return jsonError(403, "Compte suspendu.");
  const { courseSlug, lessonSlug, action, secondsSpent } = body.data;
  const r = await recordLessonActivity(user, courseSlug, lessonSlug, action, secondsSpent);
  if (!r.ok) return jsonError(404, r.error);
  return NextResponse.json({ saved: true, status: r.status });
}
