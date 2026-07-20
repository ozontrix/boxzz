"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface RelatedProductsCarouselProps {
  products: Product[];
}

export function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-zinc-50/50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Related Products</h2>
            <p className="text-sm text-zinc-500 mt-1">You might also like these</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-primary transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-primary transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[200px] sm:min-w-[220px] lg:min-w-[240px] max-w-[260px]"
            >
              <ProductCard product={product} index={idx} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}