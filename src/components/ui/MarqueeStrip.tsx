"use client";

import { motion } from "framer-motion";

const ITEMS = [
  {
    icon: "🏭",
    title: "Direct Manufacturer",
    description: "Best prices across India",
  },
  {
    icon: "📏",
    title: "60+ Standard Sizes",
    description: "From 3.5\" to 27\" boxes",
  },
  {
    icon: "📐",
    title: "Bulk Orders Welcome",
    description: "MOQ as low as 100 pieces",
  },
  {
    icon: "🚚",
    title: "PAN India Delivery",
    description: "Ships across India",
  },
  {
    icon: "⭐",
    title: "Premium Quality",
    description: "Virgin materials guaranteed",
  },
  {
    icon: "🎨",
    title: "Custom Printing",
    description: "Brand your packaging",
  },
  {
    icon: "💪",
    title: "5 Ply & 7 Ply",
    description: "Heavy-duty options",
  },
  {
    icon: "📦",
    title: "3 Ply Boxes",
    description: "Starting ₹1.75/piece",
  },
];

export function MarqueeStrip() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary-50 via-amber-50/30 to-white border-y border-zinc-100 py-3 sm:py-3.5">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <motion.div
        className="flex gap-4 sm:gap-6 items-center"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          x: {
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {/* Double the items for seamless loop */}
        {[...ITEMS, ...ITEMS].map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-zinc-200/60 hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group"
          >
            <span className="text-lg sm:text-xl drop-shadow-sm">{item.icon}</span>
            <div className="whitespace-nowrap">
              <p className="text-xs sm:text-sm font-semibold text-zinc-800 group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 group-hover:text-zinc-600 transition-colors">
                {item.description}
              </p>
            </div>
            {/* Separator dot */}
            <span className="w-1 h-1 rounded-full bg-zinc-300 ml-1 sm:ml-2 flex-shrink-0" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}