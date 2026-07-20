"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface SpecificationsTableProps {
  specifications: Record<string, string>;
}

export function SpecificationsTable({ specifications }: SpecificationsTableProps) {
  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <div className="divide-y divide-zinc-100">
        {Object.entries(specifications).map(([key, value], idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-zinc-50/50 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-700 col-span-1">{key}</span>
            <span className="text-sm text-zinc-600 col-span-2 flex items-center gap-1.5">
              {renderSpecValue(key, value)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function renderSpecValue(key: string, value: string) {
  const lower = value.toLowerCase();
  
  if (lower === "yes" || lower === "true") {
    return (
      <span className="inline-flex items-center gap-1 text-success">
        <Check className="w-3.5 h-3.5" />
        Yes
      </span>
    );
  }
  if (lower === "no" || lower === "false") {
    return (
      <span className="inline-flex items-center gap-1 text-zinc-400">
        <X className="w-3.5 h-3.5" />
        No
      </span>
    );
  }
  return value;
}