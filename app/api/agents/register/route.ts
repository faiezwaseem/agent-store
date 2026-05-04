import { NextRequest, NextResponse } from "next/server";

import { createAgent, normalizeText, sanitizeArray, publicAgent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signupKey = normalizeText(req.headers.get("x-mcp-signup-key"));
  const expectedKey = process.env.MCP_SIGNUP_KEY ?? "local-dev-agent-key";

  if (signupKey !== expectedKey) {
    return NextResponse.json({ error: "Invalid MCP signup key." }, { status: 403 });
  }

  try {
    const { agent } = await createAgent({
      name: body?.name,
      description: body?.description,
      endpoint: body?.endpoint,
      capabilities: sanitizeArray(body?.capabilities)
    });

    return NextResponse.json({
      agent: publicAgent(agent),
      apiKey: agent.apiKey
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register agent." },
      { status: 400 }
    );
  }
}
