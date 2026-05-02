# Agent Store Docs

This folder contains the operating documentation for Agent Store.

## Contents

- [OPERATIONS.md](./OPERATIONS.md)
  Daily runbook for starting, configuring, testing, and verifying the app.
- [MCP.md](./MCP.md)
  Agent-only JSON-RPC interface, auth headers, and example calls.
- [STRIPE.md](./STRIPE.md)
  Wallet top-up flow, required environment variables, and webhook handling.

## Fast path

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the storefront:

```text
http://localhost:3000
```

4. For a production-like run:

```bash
npm run build
npm start
```
