"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, BadgeIndianRupee } from "lucide-react";

interface PriceDisplayProps {
  price: number;
  mrp: number;
  discount: number;
  quantity?: number;
  showTotal?: boolean;
  compact?: boolean;
}

export function PriceDisplay({
  price,
  mrp,
  discount,
  quantity = 1,
  showTotal = false,
  compact = false,
}: PriceDisplayProps) {
  const savings = mrp - price;
  const totalPrice = price * quantity;
  const totalMrp = mrp * quantity;
  const totalSavings = totalMrp - totalPrice;

  if (compact) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-zinc-900">
          {formatPrice(price)}
        </span>
        {mrp > price && (
          <span className="text-sm text-zinc-400 line-through">
            {formatPrice(mrp)}
          </span>
        )}
        {discount > 0 && (
          <span className="text-xs font-semibold text-success bg-green-50 px-1.5 py-0.5 rounded-md">
            {discount}% OFF
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-error/10 to-error/5 border border-error/20 rounded-lg"
        >
          <TrendingDown className="w-3.5 h-3.5 text-error" />
          <span className="text-xs font-bold text-error">
            {discount}% OFF
          </span>
          {savings > 0 && (
            <span className="text-xs text-zinc-500">
              &bull; You Save {formatPrice(savings)}
            </span>
          )}
        </motion.div>
      )}

      {/* Price Row */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          {formatPrice(price)}
        </span>
        {mrp > price && (
          <span className="text-lg sm:text-xl text-zinc-400 line-through">
            {formatPrice(mrp)}
          </span>
        )}
        {discount > 0 && (
          <span className="text-sm font-semibold text-success bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
            Save {formatPrice(savings)}
          </span>
        )}
      </div>

      {/* Total if quantity > 1 */}
      {showTotal && quantity > 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Unit Price</span>
              <span className="font-medium text-zinc-800">{formatPrice(price)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Quantity</span>
              <span className="font-medium text-zinc-800">× {quantity}</span>
            </div>
            <div className="border-t border-zinc-200 pt-1.5 flex justify-between">
              <span className="font-semibold text-zinc-800 flex items-center gap-1">
                <BadgeIndianRupee className="w-4 h-4" />
                Total Price
              </span>
              <span className="text-lg font-bold text-zinc-900">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-xs text-success">
                <span>Total Savings</span>
                <span className="font-semibold">{formatPrice(totalSavings)}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}