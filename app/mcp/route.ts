import { NextRequest, NextResponse } from "next/server";

import {
  MCP_SIGNUP_KEY,
  nowIso,
  normalizeText,
  publicAgent,
  publicOrder,
  publicService,
  randomApiKey,
  randomId,
  readStore,
  sanitizeArray,
  writeStore
} from "@/lib/store";

export const dynamic = "force-dynamic";

function rpcResult(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function authenticateAgent(req: NextRequest) {
  const store = await readStore();
  const apiKey = normalizeText(req.headers.get("x-agent-key"));
  const agent = store.agents.find((item) => item.apiKey === apiKey) ?? null;
  return { store, agent };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const method = normalizeText(body?.method);
  const params = typeof body?.params === "object" && body?.params ? body.params : {};

  if (!method) {
    return NextResponse.json(rpcError(id, -32600, "Missing method."), { status: 400 });
  }

  if (method === "register_agent") {
    const store = await readStore();
    const signupKey = normalizeText(req.headers.get("x-mcp-signup-key"));
    if (signupKey !== MCP_SIGNUP_KEY) {
      return NextResponse.json(rpcError(id, 403, "Invalid MCP signup key."), { status: 403 });
    }

    const name = normalizeText(params.name);
    const endpoint = normalizeText(params.endpoint);
    if (!name || !endpoint) {
      return NextResponse.json(rpcError(id, 400, "name and endpoint are required."), { status: 400 });
    }

    const agent = {
      id: randomId("agent"),
      name,
      description: normalizeText(params.description),
      endpoint,
      capabilities: sanitizeArray(params.capabilities),
      apiKey: randomApiKey(),
      createdAt: nowIso()
    };

    store.agents.push(agent);
    await writeStore(store);

    return NextResponse.json(rpcResult(id, { agent: publicAgent(agent), apiKey: agent.apiKey }));
  }

  const { store, agent } = await authenticateAgent(req);
  if (!agent) {
    return NextResponse.json(rpcError(id, 401, "Missing or invalid agent key."), { status: 401 });
  }

  if (method === "whoami") {
    return NextResponse.json(rpcResult(id, { agent: publicAgent(agent) }));
  }

  if (method === "list_market") {
    const search = normalizeText(params.search).toLowerCase();
    const services = store.services
      .filter((service) => service.status === "active")
      .filter((service) => {
        if (!search) {
          return true;
        }
        const haystack = [service.title, service.summary, service.category, ...service.tags]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
      .map((service) => publicService(service, store));

    return NextResponse.json(rpcResult(id, { services }));
  }

  if (method === "create_service") {
    const title = normalizeText(params.title);
    const summary = normalizeText(params.summary);
    const category = normalizeText(params.category, "General");
    const priceAmount = Number(params.priceAmount);

    if (!title || !summary || !Number.isFinite(priceAmount) || priceAmount <= 0) {
      return NextResponse.json(
        rpcError(id, 400, "title, summary, and a positive priceAmount are required."),
        { status: 400 }
      );
    }

    const service = {
      id: randomId("svc"),
      sellerAgentId: agent.id,
      title,
      summary,
      category,
      tags: sanitizeArray(params.tags),
      priceModel: normalizeText(params.priceModel, "fixed"),
      priceAmount,
      currency: normalizeText(params.currency, "USD"),
      slaHours: Number.parseInt(String(params.slaHours ?? "24"), 10),
      status: "active" as const,
      createdAt: nowIso()
    };

    store.services.push(service);
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { service: publicService(service, store) }));
  }

  if (method === "buy_service") {
    const serviceId = normalizeText(params.serviceId);
    const service = store.services.find((item) => item.id === serviceId && item.status === "active");
    if (!service) {
      return NextResponse.json(rpcError(id, 404, "Service not found."), { status: 404 });
    }

    if (service.sellerAgentId === agent.id) {
      return NextResponse.json(rpcError(id, 400, "Agents cannot buy their own service."), { status: 400 });
    }

    const order = {
      id: randomId("ord"),
      serviceId: service.id,
      buyerAgentId: agent.id,
      sellerAgentId: service.sellerAgentId,
      requirements: normalizeText(params.requirements),
      status: "pending" as const,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      delivery: null
    };

    store.orders.push(order);
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { order: publicOrder(order, store) }));
  }

  if (method === "list_my_services") {
    const services = store.services
      .filter((service) => service.sellerAgentId === agent.id)
      .map((service) => publicService(service, store));
    return NextResponse.json(rpcResult(id, { services }));
  }

  if (method === "list_my_orders") {
    const purchases = store.orders
      .filter((order) => order.buyerAgentId === agent.id)
      .map((order) => publicOrder(order, store));
    const sales = store.orders
      .filter((order) => order.sellerAgentId === agent.id)
      .map((order) => publicOrder(order, store));
    return NextResponse.json(rpcResult(id, { purchases, sales }));
  }

  if (method === "fulfill_order") {
    const orderId = normalizeText(params.orderId);
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) {
      return NextResponse.json(rpcError(id, 404, "Order not found."), { status: 404 });
    }

    if (order.sellerAgentId !== agent.id) {
      return NextResponse.json(rpcError(id, 403, "Only the seller can fulfill this order."), { status: 403 });
    }

    order.status = "fulfilled";
    order.updatedAt = nowIso();
    order.delivery = {
      note: normalizeText(params.deliveryNote),
      payload: typeof params.deliveryPayload === "object" && params.deliveryPayload ? params.deliveryPayload : {},
      fulfilledAt: nowIso()
    };

    await writeStore(store);
    return NextResponse.json(rpcResult(id, { order: publicOrder(order, store) }));
  }

  return NextResponse.json(rpcError(id, 404, `Unknown method: ${method}`), { status: 404 });
}
