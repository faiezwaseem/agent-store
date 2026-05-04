import Link from "next/link";
import { Grid2x2, List, SlidersHorizontal, Star } from "lucide-react";

import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { StoreServiceCard } from "@/components/storefront/service-card";
import { getCatalog } from "@/lib/store";

export default async function ListingsPage() {
  const catalog = await getCatalog();
  const featuredSellers = [...new Set(catalog.services.map((service) => service.seller?.name).filter(Boolean))].slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={catalog.categories} />

      <div className="border-b border-border bg-card">
        <div className="container py-2 text-sm text-muted-foreground">
          <Link href="/" className="text-[hsl(var(--link))] hover:text-[hsl(var(--link-hover))] hover:underline">
            AgentStore
          </Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">Shop · All services</span>
        </div>
      </div>

      <div className="container grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
              <SlidersHorizontal className="h-4 w-4" /> Refine
            </div>

            <input
              placeholder="Search in shop…"
              className="mb-4 w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mb-4">
              <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Category</div>
              <div className="space-y-1.5">
                {catalog.categories.map((category) => (
                  <label key={category} className="flex cursor-pointer items-center gap-2 text-sm hover:text-[hsl(var(--link-hover))]">
                    <input type="checkbox" className="accent-[hsl(var(--accent))]" />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Min rating</div>
              <div className="space-y-1">
                {[5, 4, 3].map((rating) => (
                  <button key={rating} className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rating ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="ml-1 text-[hsl(var(--link))]">& up</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Price</div>
              <input type="range" min={0} max={50} step={1} className="w-full accent-[hsl(var(--accent))]" />
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Seller</div>
              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {featuredSellers.map((seller) => (
                  <label key={seller} className="flex cursor-pointer items-center gap-2 text-sm hover:text-[hsl(var(--link-hover))]">
                    <input type="checkbox" className="accent-[hsl(var(--accent))]" />
                    <span className="font-mono-agent text-[hsl(var(--link))]">{seller}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3 shadow-card">
            <div className="text-sm">
              <span className="font-bold text-foreground">{catalog.services.length}</span>{" "}
              <span className="text-muted-foreground">services listed</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort by</span>
                <select className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Most reviewed</option>
                  <option>Highest rated</option>
                  <option>Price: low → high</option>
                  <option>Price: high → low</option>
                  <option>Fastest delivery</option>
                </select>
              </label>
              <div className="flex overflow-hidden rounded border border-border">
                <button className="bg-secondary p-1.5" aria-label="Grid view">
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button className="bg-card p-1.5" aria-label="List view">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {catalog.services.map((service) => (
              <StoreServiceCard key={service.id} service={service} />
            ))}
          </div>
        </main>
      </div>

      <StorefrontFooter />
    </div>
  );
}
