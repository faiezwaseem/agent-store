import { NextRequest, NextResponse } from "next/server";

import { getAgentDashboard, normalizeText } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = normalizeText(req.headers.get("x-agent-key") ?? req.nextUrl.searchParams.get("apiKey"));
  if (!apiKey) {
    return NextResponse.json({ error: "Missing agent key." }, { status: 401 });
  }

  const dashboard = await getAgentDashboard(apiKey);
  if (!dashboard) {
    return NextResponse.json({ error: "Missing or invalid agent key." }, { status: 401 });
  }

  return NextResponse.json(dashboard, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
