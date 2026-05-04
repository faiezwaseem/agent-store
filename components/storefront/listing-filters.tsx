"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Grid2x2, List, SlidersHorizontal, Star } from "lucide-react";

type ListingFiltersProps = {
  categories: string[];
  sellers: string[];
  maxPrice: number;
};

const ratingOptions = [5, 4, 3];

function parseSelected(params: URLSearchParams, key: string) {
  return params.getAll(key).filter(Boolean);
}

export function ListingFilters({ categories, sellers, maxPrice }: ListingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = useMemo(() => parseSelected(new URLSearchParams(searchParams.toString()), "category"), [searchParams]);
  const selectedSellers = useMemo(() => parseSelected(new URLSearchParams(searchParams.toString()), "seller"), [searchParams]);
  const selectedRating = Number(searchParams.get("minRating") ?? "0");
  const selectedPrice = Number(searchParams.get("maxPrice") ?? String(maxPrice));
  const selectedSort = searchParams.get("sort") ?? "most-reviewed";
  const search = searchParams.get("search") ?? "";

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function toggleMultiValue(key: string, value: string) {
    updateParams((params) => {
      const current = new Set(params.getAll(key));
      if (current.has(value)) {
        const next = [...current].filter((item) => item !== value);
        params.delete(key);
        next.forEach((item) => params.append(key, item));
      } else {
        params.append(key, value);
      }
    });
  }

  return (
    <>
      <aside className="space-y-6">
        <div className="rounded-md border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
            <SlidersHorizontal className="h-4 w-4" /> Refine
          </div>

          <form
            className="mb-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              updateParams((params) => {
                const next = String(form.get("search") ?? "").trim();
                if (next) {
                  params.set("search", next);
                } else {
                  params.delete("search");
                }
              });
            }}
          >
            <input
              name="search"
              defaultValue={search}
              placeholder="Search in shop..."
              className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>

          <div className="mb-4">
            <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Category</div>
            <div className="space-y-1.5">
              {categories.map((category) => (
                <label key={category} className="flex cursor-pointer items-center gap-2 text-sm hover:text-[hsl(var(--link-hover))]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleMultiValue("category", category)}
                    className="accent-[hsl(var(--accent))]"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Min rating</div>
            <div className="space-y-1">
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    updateParams((params) => {
                      if (selectedRating === rating) {
                        params.delete("minRating");
                      } else {
                        params.set("minRating", String(rating));
                      }
                    })
                  }
                  className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-sm ${
                    selectedRating === rating ? "bg-secondary" : ""
                  }`}
                >
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
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
              <span>Price</span>
              <span>{selectedPrice} A</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1}
              value={selectedPrice}
              onChange={(event) =>
                updateParams((params) => {
                  const value = Number(event.target.value);
                  if (value >= maxPrice) {
                    params.delete("maxPrice");
                  } else {
                    params.set("maxPrice", String(value));
                  }
                })
              }
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">Seller</div>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {sellers.map((seller) => (
                <label key={seller} className="flex cursor-pointer items-center gap-2 text-sm hover:text-[hsl(var(--link-hover))]">
                  <input
                    type="checkbox"
                    checked={selectedSellers.includes(seller)}
                    onChange={() => toggleMultiValue("seller", seller)}
                    className="accent-[hsl(var(--accent))]"
                  />
                  <span className="font-mono-agent text-[hsl(var(--link))]">{seller}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.replace(pathname)}
            className="w-full rounded border border-input px-3 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Clear filters
          </button>
        </div>
      </aside>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3 shadow-card">
        <div className="text-sm text-muted-foreground">Live marketplace filters update the catalog instantly.</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <select
              value={selectedSort}
              onChange={(event) =>
                updateParams((params) => {
                  params.set("sort", event.target.value);
                })
              }
              className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="most-reviewed">Most reviewed</option>
              <option value="highest-rated">Highest rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="fastest-delivery">Fastest delivery</option>
              <option value="newest">Newest</option>
            </select>
          </label>
          <div className="flex overflow-hidden rounded border border-border">
            <button type="button" className="bg-secondary p-1.5" aria-label="Grid view">
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button type="button" className="bg-card p-1.5" aria-label="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
