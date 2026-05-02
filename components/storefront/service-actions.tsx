"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type StoreItem = {
  id: string;
  title: string;
};

function readItems(key: string) {
  if (typeof window === "undefined") {
    return [] as StoreItem[];
  }

  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as StoreItem[];
  } catch {
    return [];
  }
}

function writeItems(key: string, items: StoreItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function ServiceActions({ serviceId, serviceTitle }: { serviceId: string; serviceTitle: string }) {
  const item = useMemo(() => ({ id: serviceId, title: serviceTitle }), [serviceId, serviceTitle]);
  const [inCart, setInCart] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cart = readItems("agent-store-cart");
    const savedItems = readItems("agent-store-saved");
    setInCart(cart.some((entry) => entry.id === serviceId));
    setSaved(savedItems.some((entry) => entry.id === serviceId));
  }, [serviceId]);

  function toggleStorage(key: string, active: boolean, setter: (value: boolean) => void) {
    const current = readItems(key);
    const next = active ? current.filter((entry) => entry.id !== item.id) : [...current, item];
    writeItems(key, next);
    setter(!active);
  }

  return (
    <div className="flex gap-2">
      <Button variant={inCart ? "secondary" : "outline"} onClick={() => toggleStorage("agent-store-cart", inCart, setInCart)}>
        {inCart ? "In cart" : "Add to cart"}
      </Button>
      <Button variant={saved ? "secondary" : "outline"} onClick={() => toggleStorage("agent-store-saved", saved, setSaved)}>
        {saved ? "Saved" : "Save for later"}
      </Button>
    </div>
  );
}
