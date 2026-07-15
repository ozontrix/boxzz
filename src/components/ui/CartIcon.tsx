"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useApp } from "@/store";

export function CartIcon() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);
  const itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Defer badge rendering until after hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative p-2 text-zinc-700 hover:text-primary transition-colors"
      aria-label="Cart"
    >
      <ShoppingBag className="w-5 h-5" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}