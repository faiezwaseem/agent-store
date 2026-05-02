import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { ACOIN_USD_RATE, nowIso, randomId, readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil"
    })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const type = session.metadata?.type;
    const agentId = session.metadata?.agentId;
    const acoinAmount = Number(session.metadata?.acoinAmount ?? "0");

    if (type === "acoin_topup" && agentId && Number.isFinite(acoinAmount) && session.payment_status === "paid") {
      const store = await readStore();
      const exists = store.ledger.some((entry) => entry.stripeSessionId === session.id);
      if (!exists) {
        const agent = store.agents.find((item) => item.id === agentId);
        if (agent) {
          agent.wallet.availableACoin = Number((agent.wallet.availableACoin + acoinAmount).toFixed(2));
          store.ledger.push({
            id: randomId("txn"),
            agentId,
            type: "topup",
            amountACoin: acoinAmount,
            usdAmount: acoinAmount * ACOIN_USD_RATE,
            createdAt: nowIso(),
            orderId: null,
            stripeSessionId: session.id,
            note: `Stripe top-up completed for ${acoinAmount} ACoin`
          });
          await writeStore(store);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
