"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  min: number;
  max: number;
  unit: string;
  onChange: (quantity: number) => void;
  showLabel?: boolean;
}

export function QuantitySelector({
  quantity,
  min,
  max,
  unit,
  onChange,
  showLabel = true,
}: QuantitySelectorProps) {
  const atMin = quantity <= min;
  const atMax = quantity >= max;

  const decrement = () => {
    if (!atMin) onChange(quantity - 1);
  };

  const increment = () => {
    if (!atMax) onChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div>
      {showLabel && (
        <h3 className="text-sm font-semibold text-zinc-800 mb-3 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-zinc-500" />
          Quantity
        </h3>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={decrement}
            disabled={atMin}
            className={cn(
              "w-10 h-10 flex items-center justify-center transition-colors",
              atMin
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-primary"
            )}
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            className="w-14 h-10 text-center text-sm font-semibold text-zinc-800 border-x border-zinc-200 focus:outline-none focus:bg-primary-50/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={min}
            max={max}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={increment}
            disabled={atMax}
            className={cn(
              "w-10 h-10 flex items-center justify-center transition-colors",
              atMax
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-primary"
            )}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        <span className="text-xs text-zinc-500">
          Min. {min} {unit}{min > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}