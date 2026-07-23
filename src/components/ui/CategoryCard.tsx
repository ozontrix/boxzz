"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import type { Category, FeaturedCategory } from "@/types";

type CardCategory = Pick<Category, "id" | "name" | "icon" | "image" | "shortDescription" | "productCount">;

interface CategoryCardProps {
  category: CardCategory | FeaturedCategory;
  index?: number;
  href?: string;
}

const gradientMap: Record<string, string> = {
  "3-ply-boxes": "from-amber-500/90 to-primary-600/90",
  "3-ply-flap-boxes": "from-sky-500/90 to-blue-600/90",
  "3-ply-printed-flap-boxes": "from-fuchsia-500/90 to-purple-600/90",
  "3-ply-white-boxes": "from-slate-300/90 to-slate-400/90",
  "3-ply-flap-white-boxes": "from-emerald-400/90 to-emerald-600/90",
  "5-ply-boxes": "from-red-500/90 to-rose-600/90",
  "7-ply-boxes": "from-violet-500/90 to-purple-700/90",
  "packaging-tapes": "from-cyan-500/90 to-blue-600/90",
  "paper-bubble-wrap": "from-teal-400/90 to-teal-600/90",
  "poly-bags": "from-rose-400/90 to-rose-600/90",
  "thermal-labels": "from-yellow-500/90 to-amber-600/90",
  "corrugated-roll": "from-stone-500/90 to-stone-700/90",
};

const accentColorMap: Record<string, string> = {
  "3-ply-boxes": "bg-amber-500",
  "3-ply-flap-boxes": "bg-sky-500",
  "3-ply-printed-flap-boxes": "bg-fuchsia-500",
  "3-ply-white-boxes": "bg-slate-400",
  "3-ply-flap-white-boxes": "bg-emerald-500",
  "5-ply-boxes": "bg-red-500",
  "7-ply-boxes": "bg-violet-500",
  "packaging-tapes": "bg-cyan-500",
  "paper-bubble-wrap": "bg-teal-500",
  "poly-bags": "bg-rose-500",
  "thermal-labels": "bg-amber-500",
  "corrugated-roll": "bg-stone-500",
};

export function CategoryCard({ category, index = 0, href }: CategoryCardProps) {
  const gradient = gradientMap[category.id] || "from-primary/90 to-primary-dark/90";
  const accent = accentColorMap[category.id] || "bg-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="group relative"
    >
      <Link
        href={href || `/category/${category.id}`}
        className="relative block overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500"
      >
        {/* ─── Image Container ─── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

          {/* Top Badge - Product Count */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full">
              <Package className="w-3 h-3" />
              {category.productCount} Products
            </span>
          </div>

          {/* Category Icon - floating emoji */}
          <div className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl text-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <h3 className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow-sm group-hover:translate-y-[-2px] transition-transform duration-300">
              {category.name}
            </h3>
            <p className="text-white/80 text-xs mt-1 line-clamp-1 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
              {category.shortDescription}
            </p>
          </div>
        </div>

        {/* ─── Bottom Action Bar ─── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <span className={`w-1.5 h-1.5 rounded-full ${accent} group-hover:scale-150 transition-transform duration-300`} />
          <span className="text-xs font-medium text-zinc-500 group-hover:text-primary transition-colors duration-300 flex items-center gap-1">
            Explore Category
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </div>
      </Link>
    </motion.div>
  );
}