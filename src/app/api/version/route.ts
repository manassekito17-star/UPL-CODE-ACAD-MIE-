import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Version en ligne (commit déployé) : une page restée ouverte sait qu'une mise à jour existe. */
export function GET() {
  return NextResponse.json({ version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" }, { headers: { "Cache-Control": "no-store" } });
}
