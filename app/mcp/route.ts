import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  ACOIN_USD_RATE,
  MIN_TOPUP_ACOIN,
  PLATFORM_FEE_ACOIN,
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

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil"
    })
  : null;

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
      wallet: {
        availableACoin: 0,
        escrowedACoin: 0,
        totalSpentACoin: 0,
        totalEarnedACoin: 0
      },
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

  if (method === "get_wallet") {
    const entries = store.ledger
      .filter((entry) => entry.agentId === agent.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
    return NextResponse.json(
      rpcResult(id, {
        wallet: agent.wallet,
        pricing: {
          acoinUsdRate: ACOIN_USD_RATE,
          minimumTopupACoin: MIN_TOPUP_ACOIN,
          feePerTransactionACoin: PLATFORM_FEE_ACOIN
        },
        transactions: entries
      })
    );
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

  if (method === "post_service_comment") {
    const serviceId = normalizeText(params.serviceId);
    const body = normalizeText(params.body);
    const service = store.services.find((item) => item.id === serviceId && item.status === "active");

    if (!service || !body) {
      return NextResponse.json(rpcError(id, 400, "serviceId and body are required."), { status: 400 });
    }

    const post = {
      id: randomId("post"),
      serviceId,
      authorAgentId: agent.id,
      body,
      score: Number.parseInt(String(params.score ?? "1"), 10) || 1,
      createdAt: nowIso()
    };

    store.discussions.push(post);
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { post }));
  }

  if (method === "place_bid") {
    const serviceId = normalizeText(params.serviceId);
    const amountACoin = Number(params.amountACoin);
    const message = normalizeText(params.message);
    const service = store.services.find((item) => item.id === serviceId && item.status === "active");

    if (!service || !Number.isFinite(amountACoin) || amountACoin <= 0) {
      return NextResponse.json(rpcError(id, 400, "serviceId and positive amountACoin are required."), {
        status: 400
      });
    }

    const bid = {
      id: randomId("bid"),
      serviceId,
      bidderAgentId: agent.id,
      amountACoin,
      message,
      status: "open" as const,
      createdAt: nowIso()
    };

    store.bids.push(bid);
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { bid }));
  }

  if (method === "post_review") {
    const serviceId = normalizeText(params.serviceId);
    const title = normalizeText(params.title);
    const body = normalizeText(params.body);
    const rating = Number(params.rating);
    const service = store.services.find((item) => item.id === serviceId && item.status === "active");

    if (!service || !title || !body || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        rpcError(id, 400, "serviceId, title, body, and rating between 1 and 5 are required."),
        { status: 400 }
      );
    }

    const review = {
      id: randomId("rev"),
      serviceId,
      authorAgentId: agent.id,
      rating,
      title,
      body,
      createdAt: nowIso()
    };

    store.reviews.push(review);
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { review }));
  }

  if (method === "create_service") {
    const title = normalizeText(params.title);
    const summary = normalizeText(params.summary);
    const category = normalizeText(params.category, "General");
    const priceACoin = Number(params.priceACoin ?? params.priceAmount);

    if (!title || !summary || !Number.isFinite(priceACoin) || priceACoin <= 0) {
      return NextResponse.json(
        rpcError(id, 400, "title, summary, and a positive priceACoin are required."),
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
      priceACoin,
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

    const totalACoin = Number((service.priceACoin + PLATFORM_FEE_ACOIN).toFixed(2));
    if (agent.wallet.availableACoin < totalACoin) {
      return NextResponse.json(
        rpcError(
          id,
          400,
          `Insufficient ACoin balance. Required ${totalACoin} ACoin including the ${PLATFORM_FEE_ACOIN} ACoin store fee.`
        ),
        { status: 400 }
      );
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
      pricing: {
        servicePriceACoin: service.priceACoin,
        feeACoin: PLATFORM_FEE_ACOIN,
        totalACoin
      },
      delivery: null
    };

    agent.wallet.availableACoin = Number((agent.wallet.availableACoin - totalACoin).toFixed(2));
    agent.wallet.escrowedACoin = Number((agent.wallet.escrowedACoin + service.priceACoin).toFixed(2));
    agent.wallet.totalSpentACoin = Number((agent.wallet.totalSpentACoin + totalACoin).toFixed(2));
    store.platform.feesCollectedACoin = Number(
      (store.platform.feesCollectedACoin + PLATFORM_FEE_ACOIN).toFixed(2)
    );

    store.orders.push(order);
    store.ledger.push(
      {
        id: randomId("txn"),
        agentId: agent.id,
        type: "purchase_hold",
        amountACoin: -service.priceACoin,
        usdAmount: -(service.priceACoin * ACOIN_USD_RATE),
        createdAt: nowIso(),
        orderId: order.id,
        stripeSessionId: null,
        note: `Escrowed for order ${order.id}`
      },
      {
        id: randomId("txn"),
        agentId: agent.id,
        type: "platform_fee",
        amountACoin: -PLATFORM_FEE_ACOIN,
        usdAmount: -(PLATFORM_FEE_ACOIN * ACOIN_USD_RATE),
        createdAt: nowIso(),
        orderId: order.id,
        stripeSessionId: null,
        note: "Marketplace transaction fee"
      }
    );
    await writeStore(store);
    return NextResponse.json(rpcResult(id, { order: publicOrder(order, store) }));
  }

  if (method === "create_topup_checkout") {
    if (!stripe) {
      return NextResponse.json(
        rpcError(id, 500, "Stripe is not configured. Set STRIPE_SECRET_KEY first."),
        { status: 500 }
      );
    }

    const acoinAmount = Number(params.acoinAmount);
    if (!Number.isFinite(acoinAmount) || acoinAmount < MIN_TOPUP_ACOIN) {
      return NextResponse.json(
        rpcError(id, 400, `Minimum top-up is ${MIN_TOPUP_ACOIN} ACoin.`),
        { status: 400 }
      );
    }

    const usdAmount = Number((acoinAmount * ACOIN_USD_RATE).toFixed(2));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${APP_URL}/?topup=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?topup=cancel`,
      metadata: {
        type: "acoin_topup",
        agentId: agent.id,
        acoinAmount: String(acoinAmount)
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(usdAmount * 100),
            product_data: {
              name: `${acoinAmount} ACoin top-up`,
              description: `1 ACoin = ${ACOIN_USD_RATE} USD`
            }
          }
        }
      ]
    });

    return NextResponse.json(
      rpcResult(id, {
        checkoutUrl: session.url,
        sessionId: session.id,
        acoinAmount,
        usdAmount
      })
    );
  }

  if (method === "list_wallet_transactions") {
    const transactions = store.ledger
      .filter((entry) => entry.agentId === agent.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json(rpcResult(id, { transactions }));
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
    if (order.status === "fulfilled") {
      return NextResponse.json(rpcError(id, 400, "Order is already fulfilled."), { status: 400 });
    }

    order.status = "fulfilled";
    order.updatedAt = nowIso();
    order.delivery = {
      note: normalizeText(params.deliveryNote),
      payload: typeof params.deliveryPayload === "object" && params.deliveryPayload ? params.deliveryPayload : {},
      fulfilledAt: nowIso()
    };

    agent.wallet.availableACoin = Number((agent.wallet.availableACoin + order.pricing.servicePriceACoin).toFixed(2));
    agent.wallet.totalEarnedACoin = Number((agent.wallet.totalEarnedACoin + order.pricing.servicePriceACoin).toFixed(2));

    const buyer = store.agents.find((item) => item.id === order.buyerAgentId);
    if (buyer) {
      buyer.wallet.escrowedACoin = Number((buyer.wallet.escrowedACoin - order.pricing.servicePriceACoin).toFixed(2));
    }

    store.ledger.push({
      id: randomId("txn"),
      agentId: agent.id,
      type: "sale_payout",
      amountACoin: order.pricing.servicePriceACoin,
      usdAmount: order.pricing.servicePriceACoin * ACOIN_USD_RATE,
      createdAt: nowIso(),
      orderId: order.id,
      stripeSessionId: null,
      note: `Payout released for order ${order.id}`
    });

    await writeStore(store);
    return NextResponse.json(rpcResult(id, { order: publicOrder(order, store) }));
  }

  return NextResponse.json(rpcError(id, 404, `Unknown method: ${method}`), { status: 404 });
}
