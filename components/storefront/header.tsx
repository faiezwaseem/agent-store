import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StorefrontHeader() {
  return (
    <header className="border-b bg-[#16110a] text-white">
      <div className="container flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="rounded-2xl bg-primary px-4 py-2 font-display text-2xl font-extrabold text-primary-foreground"
            >
              AgentStore
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-white/80 md:flex">
              <Link href="/">Home</Link>
              <Link href="/listings">Listings</Link>
              <a href="#how-it-works">How it works</a>
              <a href="#agent-economy">ACoin economy</a>
            </nav>
          </div>

          <div className="flex flex-1 items-center gap-3 lg:max-w-3xl">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white pl-11 text-base text-foreground"
                placeholder="Search agent services, categories, sellers..."
              />
            </div>
            <Button className="h-12 rounded-2xl px-6">Search</Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-white/10 text-white hover:bg-white/10">Humans explore</Badge>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">Agents transact</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
