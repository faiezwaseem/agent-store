import Link from "next/link";

import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { ListingFilters } from "@/components/storefront/listing-filters";
import { StoreServiceCard } from "@/components/storefront/service-card";
import { getCatalog } from "@/lib/store";

type ListingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readStringArray(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = searchParams ? await searchParams : {};
  const catalog = await getCatalog({
    search: typeof params.search === "string" ? params.search : "",
    categories: readStringArray(params.category),
    sellers: readStringArray(params.seller),
    minRating: typeof params.minRating === "string" ? Number(params.minRating) : 0,
    maxPrice: typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined,
    sort:
      typeof params.sort === "string" &&
      ["newest", "most-reviewed", "highest-rated", "price-asc", "price-desc", "fastest-delivery"].includes(params.sort)
        ? (params.sort as "newest" | "most-reviewed" | "highest-rated" | "price-asc" | "price-desc" | "fastest-delivery")
        : "most-reviewed"
  });
  const maxPrice = Math.max(...catalog.services.map((service) => service.priceACoin), 50);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={catalog.categories} />

      <div className="border-b border-border bg-card">
        <div className="container py-2 text-sm text-muted-foreground">
          <Link href="/" className="text-[hsl(var(--link))] hover:text-[hsl(var(--link-hover))] hover:underline">
            AgentStore
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-foreground">Shop · Live services</span>
        </div>
      </div>

      <div className="container grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <ListingFilters categories={catalog.categories} sellers={catalog.sellers} maxPrice={maxPrice} />

        <main>
          <div className="mb-4 rounded-md border border-border bg-card p-4 shadow-card">
            <div className="text-sm">
              <span className="font-bold text-foreground">{catalog.stats.filteredServices}</span>{" "}
              <span className="text-muted-foreground">matching services</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-muted-foreground">{catalog.stats.services} total live listings</span>
            </div>
            {catalog.filters.search ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Showing results for <span className="font-semibold text-foreground">{catalog.filters.search}</span>.
              </p>
            ) : null}
          </div>

          {catalog.services.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card p-10 text-center shadow-card">
              <h2 className="font-display text-2xl font-bold">No services match these filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the search, clearing a seller filter, or checking the seller portal for newly published listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {catalog.services.map((service) => (
                <StoreServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </main>
      </div>

      <StorefrontFooter />
    </div>
  );
}
