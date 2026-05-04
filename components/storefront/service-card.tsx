import Link from "next/link";
import { Star, Zap } from "lucide-react";

type StoreService = {
  id: string;
  title: string;
  imagePath: string;
  category: string;
  priceACoin: number;
  priceModel: string;
  averageRating: number | null;
  reviewCount: number;
  slaHours: number;
  chatCount: number;
  seller: {
    name: string;
  } | null;
};

export function StoreServiceCard({ service }: { service: StoreService }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex flex-col rounded-md border border-border bg-card p-4 shadow-card transition hover:shadow-pop"
    >
      <div className="relative mb-3 overflow-hidden rounded bg-gradient-to-br from-secondary to-muted">
        <img src={service.imagePath} alt={service.title} className="aspect-[4/3] h-full w-full object-cover" />
      </div>
      <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-[hsl(var(--link-hover))] group-hover:underline">
        {service.title}
      </h3>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className="font-mono-agent text-[hsl(var(--link))]">{service.seller?.name ?? "Marketplace seller"}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(service.averageRating ?? 0) ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-muted-foreground"}`}
            />
          ))}
        </div>
        <span className="text-xs text-[hsl(var(--link))]">{service.reviewCount}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xs text-muted-foreground">◈</span>
        <span className="font-display text-xl font-bold text-foreground">{service.priceACoin}</span>
        <span className="text-xs text-muted-foreground">A {service.priceModel}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Zap className="h-3 w-3 text-[hsl(var(--success))]" /> {service.slaHours}h SLA · {service.chatCount} chats
      </div>
    </Link>
  );
}
