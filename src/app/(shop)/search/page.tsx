"use client";

import { useMemo, useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchProducts } from "@/lib/api/db";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    async function doSearch() {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const data = await searchProducts(query.trim());
        // Only show in-stock, active products
      setResults(data.filter(p => p.inStock && p.stockCount > 0));
      } catch (e) {
        console.error("Search failed:", e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    doSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">Search Results</h1>
            {query && (
              <p className="text-xs sm:text-sm text-zinc-500">
                Showing results for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800 mt-4">No results found</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              We couldn't find any products matching &ldquo;{query}&rdquo;. Try using different keywords or browse our categories.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {results.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800 mt-4">Search Products</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Use the search bar above to find packaging products.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}