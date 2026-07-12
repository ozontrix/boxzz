"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  ChevronRight,
  Package,
  Ruler,
  ArrowRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { getCategories, getFeaturedCategories } from "@/data";
import type { CategorySlug } from "@/types";

// ─── Subcategory metadata ───
interface SubcatInfo {
  id: CategorySlug;
  name: string;
  icon: string;
  shortDescription: string;
  productCount: number;
  href: string;
}

const SUBCATEGORY_MAP: Record<string, SubcatInfo[]> = {
  "corrugated-boxes": [
    { id: "3-ply-boxes", name: "3 Ply Corrugated Boxes", icon: "📦", shortDescription: "37 sizes • Starting ₹2.50", productCount: 37, href: "/category/3-ply-boxes" },
    { id: "3-ply-flap-boxes", name: "3 Ply Flap Boxes", icon: "📋", shortDescription: "13 sizes • Starting ₹1.75", productCount: 13, href: "/category/3-ply-flap-boxes" },
    { id: "3-ply-printed-flap-boxes", name: "Printed Flap Boxes", icon: "🎨", shortDescription: "2 sizes • Starting ₹7.50", productCount: 2, href: "/category/3-ply-printed-flap-boxes" },
    { id: "3-ply-white-boxes", name: "3 Ply White Boxes", icon: "⬜", shortDescription: "6 sizes • Starting ₹3.50", productCount: 6, href: "/category/3-ply-white-boxes" },
    { id: "3-ply-flap-white-boxes", name: "3 Ply Flap White Boxes", icon: "🤍", shortDescription: "12 sizes • Starting ₹2.15", productCount: 12, href: "/category/3-ply-flap-white-boxes" },
    { id: "5-ply-boxes", name: "5 Ply Corrugated Boxes", icon: "💪", shortDescription: "5 sizes • Starting ₹26.00", productCount: 5, href: "/category/5-ply-boxes" },
    { id: "7-ply-boxes", name: "7 Ply Corrugated Boxes", icon: "🔷", shortDescription: "Starting ₹110.00", productCount: 1, href: "/category/7-ply-boxes" },
  ],
  "packaging-tapes": [
    { id: "packaging-tapes", name: "BOPP Packaging Tapes", icon: "🔵", shortDescription: "5 types • Box of 36-72 pcs", productCount: 5, href: "/category/packaging-tapes" },
  ],
  "protective-packaging": [
    { id: "paper-bubble-wrap", name: "Paper Bubble Wrap", icon: "📜", shortDescription: "2 sizes • Starting ₹650/roll", productCount: 2, href: "/category/paper-bubble-wrap" },
    { id: "poly-bags", name: "Poly Bags (With POD)", icon: "🛍️", shortDescription: "7 sizes • ₹160/kg", productCount: 1, href: "/category/poly-bags" },
    { id: "corrugated-roll", name: "Corrugated Roll", icon: "🔄", shortDescription: "4 sizes • ₹50/kg", productCount: 1, href: "/category/corrugated-roll" },
  ],
  "labels-media": [
    { id: "thermal-labels", name: "Thermal Label Paper", icon: "🏷️", shortDescription: "4 variants • Starting ₹65", productCount: 4, href: "/category/thermal-labels" },
    { id: "3-ply-printed-flap-boxes", name: "Custom Printed Boxes", icon: "🎨", shortDescription: "Brand logo printing", productCount: 2, href: "/category/3-ply-printed-flap-boxes" },
  ],
};

const gradientMap: Record<string, string> = {
  "corrugated-boxes": "from-amber-500 to-orange-600",
  "packaging-tapes": "from-cyan-500 to-blue-600",
  "protective-packaging": "from-teal-400 to-teal-600",
  "labels-media": "from-yellow-500 to-amber-600",
};

const iconMap: Record<string, React.ReactNode> = {
  "corrugated-boxes": <Package className="w-5 h-5" />,
  "packaging-tapes": <Ruler className="w-5 h-5" />,
  "protective-packaging": <Layers className="w-5 h-5" />,
  "labels-media": <Grid3X3 className="w-5 h-5" />,
};

export default function CategoriesPage() {
  const categories = useMemo(() => getCategories(), []);
  const featuredCategories = useMemo(() => getFeaturedCategories(), []);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">All Categories</h1>
            <p className="text-sm text-zinc-500">Explore our complete range of packaging products</p>
          </div>
        </div>

        {/* ─── Featured Groups with Nested Subcategories ─── */}
        <div className="space-y-3 mb-8 sm:mb-10">
          {featuredCategories.map((group, groupIdx) => {
            const isExpanded = expandedGroup === group.id;
            const subcats = SUBCATEGORY_MAP[group.id] || [];
            const gradient = gradientMap[group.id] || "from-primary to-primary-dark";
            const totalProducts = subcats.reduce((sum, s) => sum + s.productCount, 0);

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.08 }}
                className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Group Header - Tappable */}
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Group Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-20`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{group.icon}</span>
                      <h2 className="text-base sm:text-lg font-bold text-zinc-900">{group.name}</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 line-clamp-1">{group.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-primary bg-orange-50 rounded-full">
                        <Package className="w-2.5 h-2.5" />
                        {totalProducts} products
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded-full">
                        {subcats.length} subcategories
                      </span>
                    </div>
                  </div>

                  {/* Expand / Collapse */}
                  <div className="shrink-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Subcategories */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-100">
                        {/* View All link to first subcategory */}
                        <Link
                          href={`/category/${group.subcategories[0]}`}
                          className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-gradient-to-r from-orange-50/50 to-white hover:from-orange-50 transition-colors group"
                        >
                          <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3" />
                            View all {group.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Subcategory grid */}
                        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {subcats.map((sub, subIdx) => (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIdx * 0.03 }}
                            >
                              <Link
                                href={sub.href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-lg shrink-0 group-hover:border-primary/30 group-hover:scale-110 transition-all">
                                  {sub.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-zinc-800 group-hover:text-primary transition-colors truncate">
                                    {sub.name}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 truncate">{sub.shortDescription}</p>
                                </div>
                                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                                  {sub.productCount}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ─── All Individual Categories Grid ─── */}
        <div>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-800">All Categories</h2>
            <span className="text-xs text-zinc-400">({categories.length} total)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat, idx) => (
              <CategoryCard key={cat.id} category={cat} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}