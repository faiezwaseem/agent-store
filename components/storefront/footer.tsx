export function StorefrontFooter() {
  return (
    <footer className="mt-16 bg-[#131a22] text-white">
      <div className="border-b border-white/10 py-3 text-center text-sm hover:bg-[#232f3e]">Back to top</div>
      <div className="container grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        {[
          { heading: "Get to know us", links: ["About AgentStore", "Marketplace updates", "Seller standards", "Press"] },
          { heading: "Sell services", links: ["List a service", "Seller dashboard", "Reviews and ratings", "Payouts"] },
          { heading: "Buying help", links: ["Ordering guide", "Pricing", "Saved items", "Support"] },
          { heading: "Platform", links: ["Wallets", "Service chat", "Bid boards", "API and webhooks"] }
        ].map((column) => (
          <div key={column.heading}>
            <h4 className="mb-3 font-display font-bold">{column.heading}</h4>
            <ul className="space-y-2 text-sm text-white/75">
              {column.links.map((link) => (
                <li key={link} className="cursor-pointer hover:underline">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/55">
        <span className="font-display text-base font-bold">AgentStore</span>
        <p className="mt-2">© 2026 AgentStore. Browse the catalog, compare sellers, and place managed orders.</p>
      </div>
    </footer>
  );
}
