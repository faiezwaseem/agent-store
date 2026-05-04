"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type SellerPortalProps = {
  categories: string[];
  signupKeyHint: string;
};

type Dashboard = {
  agent: {
    id: string;
    name: string;
    endpoint: string;
    description: string;
    capabilities: string[];
    wallet: {
      availableACoin: number;
      escrowedACoin: number;
      totalSpentACoin: number;
      totalEarnedACoin: number;
    };
  };
  services: Array<{
    id: string;
    title: string;
    category: string;
    priceACoin: number;
    slaHours: number;
    status: string;
    createdAt: string;
  }>;
  orders: {
    purchases: Array<{
      id: string;
      status: string;
      service: { title: string } | null;
    }>;
    sales: Array<{
      id: string;
      status: string;
      service: { title: string } | null;
    }>;
  };
  wallet: {
    availableACoin: number;
    escrowedACoin: number;
    totalSpentACoin: number;
    totalEarnedACoin: number;
    transactions: Array<{
      id: string;
      type: string;
      amountACoin: number;
      createdAt: string;
      note: string;
    }>;
  };
  pricing: {
    feePerTransactionACoin: number;
    minimumTopupACoin: number;
  };
};

const STORAGE_KEY = "agent-store-seller-key";

export function SellerPortal({ categories, signupKeyHint }: SellerPortalProps) {
  const serviceCategories = [...new Set([...categories, "General"])];
  const [apiKey, setApiKey] = useState("");
  const [issuedApiKey, setIssuedApiKey] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const savedKey = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (savedKey) {
      setApiKey(savedKey);
      void loadDashboard(savedKey);
    }
  }, []);

  async function loadDashboard(nextApiKey: string) {
    const response = await fetch(`/api/agents/me?apiKey=${encodeURIComponent(nextApiKey)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Unable to load seller dashboard.");
    }

    const payload = (await response.json()) as Dashboard;
    setDashboard(payload);
    window.localStorage.setItem(STORAGE_KEY, nextApiKey);
    return payload;
  }

  function handleRefresh(nextApiKey = apiKey) {
    startTransition(async () => {
      setError("");
      setSuccess("");
      try {
        await loadDashboard(nextApiKey);
      } catch (refreshError) {
        setDashboard(null);
        setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh seller dashboard.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h1 className="font-display text-3xl font-bold">Seller portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register an agent, store its API key locally in this browser, and publish services into the live marketplace.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(formElement);

            startTransition(async () => {
              setError("");
              setSuccess("");
              try {
                const response = await fetch("/api/agents/register", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-mcp-signup-key": String(form.get("signupKey") ?? "")
                  },
                  body: JSON.stringify({
                    name: form.get("name"),
                    endpoint: form.get("endpoint"),
                    description: form.get("description"),
                    capabilities: String(form.get("capabilities") ?? "")
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  })
                });
                const payload = (await response.json()) as { apiKey?: string; error?: string };
                if (!response.ok || !payload.apiKey) {
                  throw new Error(payload.error ?? "Unable to register agent.");
                }

                setIssuedApiKey(payload.apiKey);
                setApiKey(payload.apiKey);
                await loadDashboard(payload.apiKey);
                setSuccess("Agent registered. Your marketplace key is active below.");
                formElement.reset();
              } catch (registrationError) {
                setError(registrationError instanceof Error ? registrationError.message : "Unable to register agent.");
              }
            });
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-semibold">Signup key</label>
            <input
              name="signupKey"
              defaultValue={signupKeyHint}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="local-dev-agent-key"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Agent name</label>
            <input name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Endpoint</label>
            <input
              name="endpoint"
              required
              placeholder="mcp://my-agent"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Capabilities</label>
            <input
              name="capabilities"
              placeholder="automation, qa, support"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Registering..." : "Register agent"}
          </Button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Issued API key</div>
          <code className="mt-2 block overflow-x-auto font-mono-agent text-sm text-[hsl(var(--link))]">
            {issuedApiKey || apiKey || "Register an agent to receive a key"}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            This key stays in your browser when you load the dashboard here, and it also works against the `/mcp` endpoint.
          </p>
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleRefresh(apiKey);
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-semibold">Existing agent key</label>
            <input
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="agt_..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={isPending || !apiKey}>
              {isPending ? "Loading..." : "Load dashboard"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.localStorage.removeItem(STORAGE_KEY);
                setApiKey("");
                setIssuedApiKey("");
                setDashboard(null);
                setError("");
                setSuccess("Local seller key cleared from this browser.");
              }}
            >
              Clear key
            </Button>
          </div>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-[hsl(var(--success))]">{success}</p> : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-2xl font-bold">Publish a service</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Services created here appear on the home page, listings page, detail page, catalog API, and MCP market feed.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(formElement);

            startTransition(async () => {
              setError("");
              setSuccess("");
              try {
                const response = await fetch("/api/services", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-agent-key": apiKey
                  },
                  body: JSON.stringify({
                    title: form.get("title"),
                    summary: form.get("summary"),
                    category: form.get("category"),
                    tags: String(form.get("tags") ?? "")
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    priceACoin: Number(form.get("priceACoin")),
                    slaHours: Number(form.get("slaHours")),
                    priceModel: "fixed"
                  })
                });
                const payload = (await response.json()) as { error?: string };
                if (!response.ok) {
                  throw new Error(payload.error ?? "Unable to create service.");
                }

                setSuccess("Service published to the live marketplace.");
                await loadDashboard(apiKey);
                formElement.reset();
              } catch (serviceError) {
                setError(serviceError instanceof Error ? serviceError.message : "Unable to create service.");
              }
            });
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-semibold">Title</label>
            <input name="title" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Summary</label>
            <textarea
              name="summary"
              rows={3}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <select name="category" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Tags</label>
              <input
                name="tags"
                placeholder="support, docs, growth"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Price (ACoin)</label>
              <input
                name="priceACoin"
                type="number"
                min={1}
                step="0.1"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">SLA hours</label>
              <input
                name="slaHours"
                type="number"
                min={1}
                step={1}
                defaultValue={24}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending || !apiKey}>
            {isPending ? "Publishing..." : "Publish service"}
          </Button>
        </form>

        {dashboard ? (
          <div className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Agent</div>
                <div className="mt-1 font-display text-xl font-bold">{dashboard.agent.name}</div>
                <div className="mt-1 font-mono-agent text-xs text-[hsl(var(--link))]">{dashboard.agent.endpoint}</div>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Wallet</div>
                <div className="mt-1 font-display text-xl font-bold">{dashboard.wallet.availableACoin} A available</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {dashboard.wallet.escrowedACoin} A escrowed · {dashboard.pricing.feePerTransactionACoin} A fee per sale
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">My live services</h3>
                <Link href="/listings" className="text-sm text-[hsl(var(--link))] hover:underline">
                  View marketplace
                </Link>
              </div>
              <div className="space-y-2">
                {dashboard.services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services yet. Publish your first listing from the form above.</p>
                ) : (
                  dashboard.services.map((service) => (
                    <div key={service.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">{service.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.category} · {service.slaHours}h SLA
                          </div>
                        </div>
                        <div className="font-display text-lg font-bold">{service.priceACoin} A</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold">Sales</h3>
                <div className="mt-2 space-y-2">
                  {dashboard.orders.sales.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No customer orders yet.</p>
                  ) : (
                    dashboard.orders.sales.map((order) => (
                      <div key={order.id} className="rounded-xl border border-border p-3 text-sm">
                        <div className="font-semibold">{order.service?.title ?? order.id}</div>
                        <div className="text-muted-foreground">{order.status}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Recent wallet activity</h3>
                <div className="mt-2 space-y-2">
                  {dashboard.wallet.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No wallet transactions yet.</p>
                  ) : (
                    dashboard.wallet.transactions.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{entry.type}</span>
                          <span className={entry.amountACoin >= 0 ? "text-[hsl(var(--success))]" : "text-foreground"}>
                            {entry.amountACoin} A
                          </span>
                        </div>
                        <div className="mt-1 text-muted-foreground">{entry.note}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Load a seller key to see wallet balances, listings, and live order activity here.
          </div>
        )}
      </section>
    </div>
  );
}
