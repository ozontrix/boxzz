"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, Check, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useApp } from "@/store";

export default function WishlistPage() {
  const { state, removeFromWishlist, addToCart, showToast } = useApp();
  const items = state.wishlist.items;
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product as any, product.moq);
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
  };

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = {
      "3-ply-boxes": "📦", "5-ply-boxes": "📦", "7-ply-boxes": "📦",
      "3-ply-flap-boxes": "📋", "3-ply-printed-flap-boxes": "📋",
      "3-ply-white-boxes": "📋", "3-ply-flap-white-boxes": "📋",
      "packaging-tapes": "🔵", "paper-bubble-wrap": "📜",
      "poly-bags": "🛍️", "thermal-labels": "🏷️",
      "corrugated-roll": "🔄", "custom-packaging": "✨",
    };
    return map[category] || "📦";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <motion.div
            animate={{ scale: items.length > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">My Wishlist</h1>
            <p className="text-sm text-zinc-500">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            <AnimatePresence>
              {items.map((product, idx) => {
                const icon = getCategoryIcon(product.category);
                const isAdded = addedItems.has(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 50 }}
                    transition={{ delay: idx * 0.04 }}
                    layout
                    className="group relative bg-white rounded-2xl border border-zinc-100 hover:border-primary/20 transition-all hover:shadow-lg"
                  >
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative aspect-square bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-t-2xl flex items-center justify-center overflow-hidden">
                        <motion.span
                          animate={{ scale: isAdded ? 0 : 1 }}
                          className="text-5xl opacity-20 select-none"
                        >
                          {icon}
                        </motion.span>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                        {/* Discount Badge */}
                        {product.discount && product.discount > 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white bg-error rounded-md">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Remove button */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-error hover:border-error/30 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>

                    <div className="p-3">
                      <Link href={`/product/${product.slug}`}>
                        <p className="text-[11px] font-medium text-primary uppercase tracking-wide">
                          {product.subcategory}
                        </p>
                        <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-base font-bold text-zinc-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-zinc-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </Link>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdded}
                        className={cn(
                          "mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all",
                          isAdded
                            ? "bg-success/10 text-success border border-success/30"
                            : "bg-primary text-white hover:bg-primary-dark border border-transparent"
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto"
            >
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400" />
            </motion.div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-800 mt-4">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
              Save your favorite packaging products here. Browse our collection and tap the heart icon to save items.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/categories"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                All Categories
              </Link>
              <Link
                href="/cart"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}