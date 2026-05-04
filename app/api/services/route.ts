import { NextRequest, NextResponse } from "next/server";

import { createServiceForAgent, normalizeText, publicService, sanitizeArray } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const apiKey = normalizeText(req.headers.get("x-agent-key"));
  if (!apiKey) {
    return NextResponse.json({ error: "Missing agent key." }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { store, service } = await createServiceForAgent(apiKey, {
      title: body?.title,
      summary: body?.summary,
      category: body?.category,
      tags: sanitizeArray(body?.tags),
      priceModel: body?.priceModel,
      priceACoin: Number(body?.priceACoin),
      slaHours: body?.slaHours
    });

    const seller = store.agents.find((agent) => agent.id === service.sellerAgentId) ?? null;

    return NextResponse.json({
      service: publicService(service, store)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create service." },
      { status: 400 }
    );
  }
}
