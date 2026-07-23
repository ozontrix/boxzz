"use client";

import { motion } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";
import { TrendingUp, BadgePercent } from "lucide-react";
import type { ProductVariant } from "@/types";

interface PackSizeSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  showTitle?: boolean;
  showDetails?: boolean;
}

export function PackSizeSelector({
  variants,
  selectedVariant,
  onSelect,
  showTitle = true,
  showDetails = true,
}: PackSizeSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Find the best value variant (highest discount %)
  const bestValueVariant = [...variants].sort((a, b) => b.discount - a.discount)[0];

  const savings =
    selectedVariant && selectedVariant.mrp > selectedVariant.price
      ? selectedVariant.mrp - selectedVariant.price
      : 0;

  return (
    <div>
      {showTitle && (
        <h3 className="text-sm font-semibold text-zinc-800 mb-3">
          Select Pack Size
          <span className="text-[11px] font-normal text-red-500"> *</span>
        </h3>
      )}

      <div className="flex flex-wrap gap-2">
        {variants.map((variant, idx) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isBestValue = bestValueVariant?.id === variant.id && variant.discount > 0;

          return (
            <motion.button
              key={variant.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, type: "spring", stiffness: 250, damping: 18 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(variant)}
              disabled={!variant.inStock}
              className={cn(
                "relative px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all whitespace-nowrap",
                isSelected
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                  : variant.inStock
                  ? "border-zinc-200 bg-white text-zinc-700 hover:border-primary/40 hover:bg-primary-50/30"
                  : "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
              )}
            >
              <span className="relative z-10">{variant.label}</span>

              {/* Best value badge */}
              {isBestValue && !isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center z-20 shadow-sm">
                  <BadgePercent className="w-2 h-2 text-white" />
                </span>
              )}

              {/* Selected glow */}
              {isSelected && (
                <motion.div
                  layoutId="chip-glow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary-dark pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Details strip — shown when a variant is selected */}
      {showDetails && selectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 p-3 bg-gradient-to-r from-primary/5 to-amber-50 rounded-xl border border-primary/10"
        >
          {/* Price */}
          <span className="text-sm font-extrabold text-zinc-800">
            {formatPrice(selectedVariant.price)}
          </span>

          {/* MRP slash */}
          {selectedVariant.mrp > selectedVariant.price && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(selectedVariant.mrp)}
            </span>
          )}

          {/* Discount */}
          {selectedVariant.discount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-success bg-green-50 rounded-md border border-green-100">
              <TrendingUp className="w-2.5 h-2.5" />
              {selectedVariant.discount}% OFF
            </span>
          )}

          {/* Savings */}
          {savings > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-error bg-red-50 rounded-md border border-red-100">
              Save {formatPrice(savings)}
            </span>
          )}

          {/* Stock */}
          {selectedVariant.inStock && selectedVariant.stock > 0 && (
            <span className="text-[10px] text-zinc-400">
              {selectedVariant.stock >= 500 ? "✅ In Stock" : `📦 ${selectedVariant.stock} left`}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}