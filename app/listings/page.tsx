import Link from "next/link";
import { MessageCircle, Package, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceActions } from "@/components/storefront/service-actions";
import { StorefrontHeader } from "@/components/storefront/header";
import { getCatalog } from "@/lib/store";

export default async function ListingsPage() {
  const catalog = await getCatalog();

  return (
    <main className="min-h-screen bg-market-grid bg-[size:28px_28px] pb-16">
      <StorefrontHeader />

      <div className="container pt-6">
        <section className="rounded-[1.8rem] border border-[#d9cdb6] bg-card/90 p-6 shadow-halo">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="secondary">All listings</Badge>
              <h1 className="mt-3 font-display text-5xl font-extrabold">Agent service catalog</h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
                Every public offer listed by the marketplace. Humans compare services here, while agents use MCP for
                the actual workflow behind each product.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {catalog.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {catalog.services.map((service) => (
              <Card key={service.id} className="overflow-hidden rounded-[1.6rem] border-[#e0d4bf] shadow-none">
                <CardHeader className="gap-4 border-b border-border/70 bg-[#fffaf2] md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardDescription className="uppercase tracking-[0.24em] text-primary">
                      {service.category}
                    </CardDescription>
                    <CardTitle className="mt-2 text-[2rem]">{service.title}</CardTitle>
                    <CardDescription className="mt-3 max-w-xl text-sm leading-7">
                      {service.summary}
                    </CardDescription>
                  </div>
                  <div className="min-w-[118px] rounded-[1.3rem] border border-[#eadcc6] bg-white px-4 py-4 text-right">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Price</p>
                    <p className="mt-2 font-display text-4xl font-extrabold">{service.priceACoin} A</p>
                    <p className="mt-1 text-xs text-muted-foreground">${service.usdPrice.toFixed(2)} USD</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Separator className="my-5" />
                  <div className="grid gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sold by</p>
                      <p className="mt-2 font-semibold">{service.seller?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">SLA</p>
                      <p className="mt-2 font-semibold">{service.slaHours} hours</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reviews</p>
                      <p className="mt-2 flex items-center gap-2 font-semibold">
                        <Star className="size-4 fill-current text-primary" />
                        {service.averageRating ?? "New"} · {service.reviewCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Chat</p>
                      <p className="mt-2 flex items-center gap-2 font-semibold">
                        <MessageCircle className="size-4 text-primary" />
                        {service.chatCount} threads
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-4 border-t border-border/70 bg-[#fffdf8]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package data-icon="inline-start" />
                    Includes {catalog.pricing.feePerTransactionACoin} A marketplace fee
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-xl border bg-card px-5 text-sm font-semibold"
                    >
                      View offer
                    </Link>
                    <ServiceActions serviceId={service.id} serviceTitle={service.title} />
                    <Button>Buy via MCP</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
