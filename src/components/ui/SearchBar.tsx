"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, X, TrendingUp, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { FEATURED_PRODUCTS } from "@/lib/constants";

const SUGGESTIONS = [
  { text: "3 ply boxes", icon: "📦" },
  { text: "5 ply boxes", icon: "💪" },
  { text: "flap boxes", icon: "📋" },
  { text: "packaging tape", icon: "🔵" },
  { text: "bubble wrap", icon: "📜" },
  { text: "thermal labels", icon: "🏷️" },
  { text: "poly bags", icon: "🛍️" },
  { text: "corrugated roll", icon: "🔄" },
  { text: "white boxes", icon: "⬜" },
  { text: "printed boxes", icon: "🎨" },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return FEATURED_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return SUGGESTIONS;
    const q = query.toLowerCase();
    return SUGGESTIONS.filter((s) => s.text.includes(q)).slice(0, 5);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(text)}`);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search packaging products..."
          className="w-full h-9 lg:h-10 pl-9 lg:pl-10 pr-8 text-sm bg-zinc-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all placeholder:text-zinc-400"
        />
        <Search className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-zinc-200 shadow-xl shadow-black/5 overflow-hidden z-50"
          >
            {query.trim().length > 0 && results.length > 0 ? (
              <div>
                {/* Product Results */}
                <div className="p-1.5">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Products
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => { setQuery(""); setIsOpen(false); }}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-base shrink-0">
                        {(product.category === "3-ply-boxes" || product.category === "5-ply-boxes" || product.category === "7-ply-boxes") && "📦"}
                        {(product.category === "3-ply-flap-boxes" || product.category === "3-ply-printed-flap-boxes" || product.category === "3-ply-white-boxes" || product.category === "3-ply-flap-white-boxes") && "📋"}
                        {product.category === "packaging-tapes" && "🔵"}
                        {product.category === "paper-bubble-wrap" && "📜"}
                        {product.category === "poly-bags" && "🛍️"}
                        {product.category === "thermal-labels" && "🏷️"}
                        {product.category === "corrugated-roll" && "🔄"}
                        {product.category === "custom-packaging" && "✨"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* View All */}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => { setQuery(""); setIsOpen(false); }}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 bg-zinc-50 text-xs font-medium text-primary hover:bg-orange-50 transition-colors border-t border-zinc-100"
                >
                  <Search className="w-3 h-3" />
                  View all results for "{query}"
                </Link>
              </div>
            ) : query.trim().length > 0 && results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-zinc-500">No products found for "{query}"</p>
                <p className="text-[10px] text-zinc-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                {/* Suggestions */}
                <div className="p-1.5">
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <TrendingUp className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                    {SUGGESTIONS.slice(0, 8).map((s) => (
                      <button
                        key={s.text}
                        onClick={() => handleSuggestion(s.text)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-600 bg-zinc-50 hover:bg-orange-50 hover:text-primary rounded-lg transition-colors"
                      >
                        <span>{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Quick Categories */}
                <Link
                  href="/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-50 text-xs font-medium text-zinc-600 hover:text-primary transition-colors border-t border-zinc-100"
                >
                  <Package className="w-3 h-3" />
                  Browse All Categories
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
