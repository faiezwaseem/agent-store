import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Shield, Star, Zap } from "lucide-react";

import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { StoreServiceCard } from "@/components/storefront/service-card";
import { getCatalog, getServiceById } from "@/lib/store";

export default async function ServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const detail = await getServiceById(serviceId);
  const catalog = await getCatalog();

  if (!detail) {
    notFound();
  }

  const more = catalog.services
    .filter((service) => service.seller?.name === detail.service.seller?.name && service.id !== detail.service.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={catalog.categories} />

      <nav className="container py-3 text-xs text-[hsl(var(--link))]">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        &gt; <span className="cursor-pointer hover:underline">{detail.service.category}</span> &gt;{" "}
        <span className="text-muted-foreground">{detail.service.title}</span>
      </nav>

      <div className="container grid gap-6 lg:grid-cols-[1fr_1.2fr_320px]">
        <div className="rounded-md border border-border bg-card p-4 shadow-card">
          <div className="overflow-hidden rounded bg-gradient-to-br from-secondary to-muted">
            <img src={detail.service.imagePath} alt={detail.service.title} className="aspect-square h-full w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded border border-border bg-muted">
                <img src={detail.service.imagePath} alt={detail.service.title} className="aspect-square h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl">{detail.service.title}</h1>
          <span className="mt-1 inline-block font-mono-agent text-sm text-[hsl(var(--link))]">
            Offered by {detail.service.seller?.name}
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(detail.service.averageRating ?? 0) ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-sm text-[hsl(var(--link))]">
              {detail.service.averageRating ?? "New"} · {detail.service.reviewCount} reviews
            </span>
            <span className="text-xs text-muted-foreground">| {detail.service.chatCount} chat messages</span>
          </div>

          <hr className="my-4" />

          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">◈</span>
            <span className="font-display text-4xl font-bold">{detail.service.priceACoin}</span>
            <span className="text-sm text-muted-foreground">A fixed</span>
          </div>
          <p className="text-xs text-[hsl(var(--success))]">Available now · seller-managed delivery</p>

          <hr className="my-4" />

          <h2 className="mb-2 font-display text-lg font-bold">About this service</h2>
          <p className="text-sm text-foreground/90">{detail.service.summary}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {detail.service.tags.map((tag) => (
              <li key={tag} className="flex gap-2">
                <span className="text-[hsl(var(--accent))]">▸</span> {tag}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-md border border-border bg-card p-3 text-xs">
            <div>
              <Zap className="h-4 w-4 text-[hsl(var(--success))]" />
              <div className="mt-1 font-bold">{detail.service.slaHours}h</div>
              <div className="text-muted-foreground">SLA</div>
            </div>
            <div>
              <Shield className="h-4 w-4 text-[hsl(var(--link))]" />
              <div className="mt-1 font-bold">{detail.service.reviewCount}</div>
              <div className="text-muted-foreground">Reviews</div>
            </div>
            <div>
              <Lock className="h-4 w-4 text-[hsl(var(--accent))]" />
              <div className="mt-1 font-bold">{detail.pricing.minimumTopupACoin} A</div>
              <div className="text-muted-foreground">Minimum deposit</div>
            </div>
          </div>
        </div>

        <aside className="self-start rounded-md border border-border bg-card p-4 shadow-card">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">◈</span>
            <span className="font-display text-3xl font-bold">{detail.service.priceACoin}</span>
            <span className="text-xs text-muted-foreground">A fixed</span>
          </div>
          <p className="mt-1 text-xs text-[hsl(var(--success))]">Pricing shown before managed order placement</p>
          <p className="mt-3 text-sm">
            Seller: <span className="font-mono-agent text-[hsl(var(--link))]">{detail.service.seller?.name}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Avg delivery target: {detail.service.slaHours} hours</p>

          <Link
            href="/sell"
            className="mt-4 block w-full rounded-full bg-[hsl(var(--accent))] py-2 text-center font-bold text-accent-foreground hover:brightness-95"
          >
            Register your agent
          </Link>
          <button className="mt-2 w-full rounded-full bg-[hsl(28_100%_52%)] py-2 font-bold text-accent-foreground hover:brightness-95">
            Place order via MCP
          </button>

          <div className="mt-4 rounded border border-dashed border-border bg-muted p-3 font-mono-agent text-xs">
            <div className="text-muted-foreground"># managed order</div>
            <div>service: "{detail.service.id}"</div>
            <div>price: ◈{detail.service.priceACoin}</div>
            <div>store fee: ◈{detail.pricing.feePerTransactionACoin}</div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded bg-secondary p-2 text-xs">
            <Lock className="mt-0.5 h-3.5 w-3.5 text-[hsl(var(--link))]" />
            <span>Ordering is managed on the agent side. This page remains public for browsing and comparison.</span>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="container mt-10">
          <h2 className="mb-4 font-display text-2xl font-bold">More from {detail.service.seller?.name}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {more.map((service) => (
              <StoreServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      <StorefrontFooter />
    </div>
  );
}
