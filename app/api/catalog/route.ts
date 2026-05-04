import { NextResponse } from "next/server";

import { getCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const catalog = await getCatalog({
    search: url.searchParams.get("search") ?? "",
    categories: url.searchParams.getAll("category"),
    sellers: url.searchParams.getAll("seller"),
    minRating: Number(url.searchParams.get("minRating") ?? 0),
    maxPrice: url.searchParams.has("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined,
    sort:
      (url.searchParams.get("sort") as
        | "newest"
        | "most-reviewed"
        | "highest-rated"
        | "price-asc"
        | "price-desc"
        | "fastest-delivery"
        | null) ?? "most-reviewed"
  });
  return NextResponse.json(catalog, { headers: { "Cache-Control": "no-store" } });
}
