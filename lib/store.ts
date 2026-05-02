import fs from "node:fs/promises";
import path from "node:path";

export type AgentRecord = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  capabilities: string[];
  apiKey: string;
  createdAt: string;
};

export type ServiceRecord = {
  id: string;
  sellerAgentId: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  priceModel: string;
  priceAmount: number;
  currency: string;
  slaHours: number;
  status: "active" | "archived";
  createdAt: string;
};

export type OrderRecord = {
  id: string;
  serviceId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  requirements: string;
  status: "pending" | "fulfilled";
  createdAt: string;
  updatedAt: string;
  delivery: null | {
    note: string;
    payload: Record<string, unknown>;
    fulfilledAt: string;
  };
};

export type StoreState = {
  agents: AgentRecord[];
  services: ServiceRecord[];
  orders: OrderRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
export const MCP_SIGNUP_KEY = process.env.MCP_SIGNUP_KEY ?? "local-dev-agent-key";

const seedState: StoreState = {
  agents: [
    {
      id: "agent_aurora",
      name: "Aurora Docs",
      description: "Documentation agent for API references, onboarding, and SDK examples.",
      endpoint: "mcp://aurora-docs",
      capabilities: ["documentation", "developer-experience", "sdk-guides"],
      apiKey: "seed_aurora_key",
      createdAt: "2026-05-02T00:00:00.000Z"
    },
    {
      id: "agent_cinder",
      name: "Cinder QA",
      description: "Regression and test-plan agent for web apps and workflows.",
      endpoint: "mcp://cinder-qa",
      capabilities: ["qa", "test-plans", "browser-regression"],
      apiKey: "seed_cinder_key",
      createdAt: "2026-05-02T00:00:00.000Z"
    }
  ],
  services: [
    {
      id: "svc_docs_audit",
      sellerAgentId: "agent_aurora",
      title: "API Docs Audit",
      summary: "Deep audit of developer docs, examples, and onboarding friction.",
      category: "Documentation",
      tags: ["docs", "api", "devrel"],
      priceModel: "fixed",
      priceAmount: 120,
      currency: "USD",
      slaHours: 12,
      status: "active",
      createdAt: "2026-05-02T00:00:00.000Z"
    },
    {
      id: "svc_regression_sweep",
      sellerAgentId: "agent_cinder",
      title: "Regression Sweep",
      summary: "Targeted bug hunt with reproducible test notes and severity tags.",
      category: "QA",
      tags: ["qa", "testing", "browser"],
      priceModel: "fixed",
      priceAmount: 180,
      currency: "USD",
      slaHours: 8,
      status: "active",
      createdAt: "2026-05-02T00:00:00.000Z"
    }
  ],
  orders: []
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    await writeStore(seedState);
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(STORE_FILE, "utf8");
  return JSON.parse(raw) as StoreState;
}

export async function writeStore(store: StoreState) {
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

export function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function sanitizeArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item)).filter(Boolean).slice(0, 16)
    : [];
}

export function nowIso() {
  return new Date().toISOString();
}

export function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 14)}`;
}

export function randomApiKey() {
  return `agt_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
}

export function publicAgent(agent: AgentRecord) {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    endpoint: agent.endpoint,
    capabilities: agent.capabilities,
    createdAt: agent.createdAt
  };
}

export function publicService(service: ServiceRecord, store: StoreState) {
  const seller = store.agents.find((agent) => agent.id === service.sellerAgentId);
  return {
    ...service,
    seller: seller ? publicAgent(seller) : null
  };
}

export function publicOrder(order: OrderRecord, store: StoreState) {
  const buyer = store.agents.find((agent) => agent.id === order.buyerAgentId);
  const seller = store.agents.find((agent) => agent.id === order.sellerAgentId);
  const service = store.services.find((item) => item.id === order.serviceId);

  return {
    ...order,
    buyer: buyer ? publicAgent(buyer) : null,
    seller: seller ? publicAgent(seller) : null,
    service: service ? publicService(service, store) : null
  };
}

export async function getCatalog() {
  const store = await readStore();
  const services = store.services
    .filter((service) => service.status === "active")
    .map((service) => publicService(service, store));
  const categories = [...new Set(services.map((service) => service.category))];

  return {
    stats: {
      agents: store.agents.length,
      services: services.length,
      orders: store.orders.length,
      categories: categories.length
    },
    categories,
    services
  };
}
