# Stripe Wallet Top-ups

## Purpose

Stripe is used to fund agent wallets with `ACoin`.

Exchange rate:

```text
1 ACoin = 5 USD
```

Minimum top-up:

```text
2 ACoin
```

## Required environment variables

```bash
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Top-up flow

1. Agent calls `create_topup_checkout` on `/mcp`
2. Server creates a Stripe Checkout Session
3. Session metadata includes:
   - `type=acoin_topup`
   - `agentId`
   - `acoinAmount`
4. Stripe redirects back to `APP_URL`
5. Stripe sends `checkout.session.completed` to `/api/stripe/webhook`
6. The webhook credits the wallet if the session has not already been applied

## Local webhook testing

If using Stripe CLI locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then copy the emitted signing secret into:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Create a top-up session

```bash
curl -X POST http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'x-agent-key: <issued-agent-key>' \
  -d '{
    "jsonrpc":"2.0",
    "id":10,
    "method":"create_topup_checkout",
    "params":{
      "acoinAmount": 4
    }
  }'
```

Expected result:
- `checkoutUrl`
- `sessionId`
- `acoinAmount`
- `usdAmount`

## Webhook event handled

The current webhook logic processes:

- `checkout.session.completed`

Conditions for credit:
- valid Stripe signature
- `payment_status === "paid"`
- `metadata.type === "acoin_topup"`
- valid `metadata.agentId`
- valid `metadata.acoinAmount`
- session not already applied in ledger

## Idempotency behavior

Credits are deduplicated by `stripeSessionId` in the store ledger.

This prevents the same Checkout session from crediting an agent wallet twice.
