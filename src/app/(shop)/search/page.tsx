"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURED_PRODUCTS } from "@/lib/constants";
import { ProductCard } from "@/components/ui/ProductCard";
import type { CategorySlug } from "@/types";

const ALL_CATEGORIES = [
  { id: "" as CategorySlug, name: "All Products" },
  { id: "3-ply-boxes" as CategorySlug, name: "3 Ply Boxes" },
  { id: "3-ply-flap-boxes" as CategorySlug, name: "Flap Boxes" },
  { id: "5-ply-boxes" as CategorySlug, name: "5 Ply Boxes" },
  { id: "7-ply-boxes" as CategorySlug, name: "7 Ply Boxes" },
  { id: "packaging-tapes" as CategorySlug, name: "Packaging Tapes" },
  { id: "paper-bubble-wrap" as CategorySlug, name: "Bubble Wrap" },
  { id: "poly-bags" as CategorySlug, name: "Poly Bags" },
  { id: "thermal-labels" as CategorySlug, name: "Thermal Labels" },
  { id: "corrugated-roll" as CategorySlug, name: "Corrugated Roll" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high">("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let results = FEATURED_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );

    if (categoryFilter) {
      results = results.filter((p) => p.category === categoryFilter);
    }

    if (sortBy === "price-low") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") results.sort((a, b) => b.price - a.price);

    return results;
  }, [query, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ml-auto">
            <Search className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Search Query Display */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            {query ? (
              <>
                Results for &ldquo;<span className="text-primary">{query}</span>&rdquo;
              </>
            ) : (
              "Search Products"
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {allResults.length} product{allResults.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {!query ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-800 mt-4">Search our products</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
              Type in the search bar above to find packaging products, boxes, tapes, and more.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["3 ply boxes", "packaging tape", "flap boxes", "bubble wrap"].map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-orange-50 hover:text-primary transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : allResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-800 mt-4">No results found</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
              We couldn't find any products matching &ldquo;{query}&rdquo;. Try a different search term.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/categories"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {ALL_CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id === categoryFilter ? "" : cat.id)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all whitespace-nowrap",
                      categoryFilter === cat.id
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
                {ALL_CATEGORIES.length > 5 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-2.5 py-1 text-[11px] font-medium text-zinc-500 border border-dashed border-zinc-300 rounded-lg hover:border-zinc-400 transition-colors"
                  >
                    +{ALL_CATEGORIES.length - 5} more
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-8 px-2.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="flex flex-wrap gap-1.5 mb-4 overflow-hidden"
              >
                {ALL_CATEGORIES.slice(5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id === categoryFilter ? "" : cat.id)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all",
                      categoryFilter === cat.id
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </motion.div>
            )}

            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {allResults.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </motion.div>

            <p className="mt-6 text-xs text-center text-zinc-400">
              Showing {allResults.length} of {allResults.length} result{allResults.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}