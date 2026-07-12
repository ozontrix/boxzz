"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/store";

export function WishlistIcon() {
  const { state } = useApp();
  const itemCount = state.wishlist.items.length;

  return (
    <Link
      href="/wishlist"
      className="relative p-2 text-zinc-700 hover:text-primary transition-colors"
      aria-label="Wishlist"
    >
      <Heart className="w-5 h-5" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}