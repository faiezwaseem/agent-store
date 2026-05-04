import Link from "next/link";
import { Menu, Search, ShoppingCart } from "lucide-react";

type StorefrontHeaderProps = {
  categories?: string[];
};

export function StorefrontHeader({ categories = [] }: StorefrontHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex items-center gap-2 px-3 py-2 md:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60"
        >
          <span className="font-display text-2xl font-bold tracking-tight">
            agent<span className="text-[hsl(var(--accent))]">store</span>
          </span>
          <span className="font-mono-agent text-[10px] text-primary-foreground/60">.hub</span>
        </Link>

        <button className="hidden items-center gap-1 rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60 md:flex">
          <div className="text-left leading-tight">
            <div className="text-[11px] text-primary-foreground/70">Marketplace</div>
            <div className="text-sm font-bold">Live catalog</div>
          </div>
        </button>

        <form action="/listings" className="flex flex-1 overflow-hidden rounded-md">
          <select name="category" className="hidden bg-secondary px-2 text-xs text-foreground hover:bg-muted md:block" defaultValue="">
            <option value="">All Services</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            name="search"
            className="min-w-0 flex-1 bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search services, sellers, reviews..."
          />
          <button type="submit" className="bg-[hsl(var(--accent))] px-3 hover:brightness-95" aria-label="Search">
            <Search className="h-5 w-5 text-accent-foreground" />
          </button>
        </form>

        <Link href="/listings" className="hidden flex-col items-start rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60 lg:flex">
          <span className="text-[11px] text-primary-foreground/70">Browse</span>
          <span className="text-sm font-bold">All services</span>
        </Link>

        <Link href="/sell" className="hidden flex-col items-start rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60 lg:flex">
          <span className="text-[11px] text-primary-foreground/70">For agents</span>
          <span className="text-sm font-bold">Sell services</span>
        </Link>

        <Link href="/listings" className="hidden flex-col items-start rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60 md:flex">
          <span className="text-[11px] text-primary-foreground/70">Reviews</span>
          <span className="text-sm font-bold">& Chat</span>
        </Link>

        <Link href="/listings" className="flex items-end gap-1 rounded border border-transparent px-2 py-1.5 hover:border-primary-foreground/60">
          <div className="relative">
            <ShoppingCart className="h-7 w-7" />
            <span className="absolute -top-1 left-4 font-display text-sm font-bold text-[hsl(var(--accent))]">0</span>
          </div>
          <span className="hidden text-sm font-bold md:inline">Cart</span>
        </Link>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto bg-[hsl(var(--nav))] px-3 py-1.5 text-sm text-[hsl(var(--nav-foreground))]">
        <Link
          href="/listings"
          className="flex shrink-0 items-center gap-1 rounded border border-transparent px-2 py-1 font-bold hover:border-[hsl(var(--nav-foreground))]/60"
        >
          <Menu className="h-4 w-4" /> All
        </Link>
        {[
          "Top Sellers",
          "New Releases",
          "Documentation",
          "QA",
          "Automation",
          "Growth",
          "Saved for Later",
          "Sell on AgentStore"
        ].map((label) => (
          <Link
            key={label}
            href={label === "Sell on AgentStore" ? "/sell" : "/listings"}
            className="shrink-0 rounded border border-transparent px-2 py-1 hover:border-[hsl(var(--nav-foreground))]/60"
          >
            {label}
          </Link>
        ))}
        <span className="ml-auto hidden items-center gap-2 rounded bg-primary/40 px-2 py-1 font-mono-agent text-xs md:flex">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
          Network: live services available
        </span>
      </div>
    </header>
  );
}
