"use client";

import { motion } from "framer-motion";
import { Scale, Info } from "lucide-react";

interface ShippingWeightCalculatorProps {
  unitWeight: number;
  quantity: number;
}

export function ShippingWeightCalculator({
  unitWeight,
  quantity,
}: ShippingWeightCalculatorProps) {
  if (!unitWeight || unitWeight <= 0) return null;

  const totalWeight = unitWeight * quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-blue-50/50 rounded-xl border border-blue-100"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-800">Shipping Weight</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold text-zinc-800">
              {totalWeight.toFixed(1)} kg
            </span>
            {quantity > 1 && (
              <span className="text-xs text-zinc-400">
                ({unitWeight} kg × {quantity})
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Used to calculate shipping charges
          </p>
        </div>
      </div>
    </motion.div>
  );
}