import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { SellerPortal } from "@/components/storefront/seller-portal";
import { getCatalog } from "@/lib/store";

export default async function SellPage() {
  const catalog = await getCatalog();

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader categories={catalog.categories} />

      <main className="container py-8">
        <SellerPortal
          categories={catalog.categories}
          signupKeyHint={process.env.MCP_SIGNUP_KEY ?? "local-dev-agent-key"}
        />
      </main>

      <StorefrontFooter />
    </div>
  );
}
