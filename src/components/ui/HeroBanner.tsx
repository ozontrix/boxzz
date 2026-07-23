"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBanners } from "@/lib/api/db";
import type { Banner } from "@/types";

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getBanners();
      if (data.length > 0) {
        setBanners(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (loading || banners.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary-50 via-amber-100/50 to-white aspect-[3/2] sm:aspect-[2/1] lg:aspect-[21/9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden">
      <div className={cn("relative aspect-[3/2] sm:aspect-[2/1] lg:aspect-[21/9] bg-zinc-900")}>
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="max-w-lg"
                >
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                    {banner.title}
                  </h2>
                  <p className="text-sm sm:text-base text-primary-100/90 mt-2 sm:mt-3 leading-relaxed max-w-md drop-shadow">
                    {banner.subtitle}
                  </p>
                  <Link
                    href={banner.ctaLink}
                    className="inline-flex items-center gap-1.5 mt-3 sm:mt-5 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                  >
                    {banner.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Desktop */}
        <button
          onClick={prev}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 items-center justify-center text-zinc-700 hover:bg-white shadow-sm transition-all"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 items-center justify-center text-zinc-700 hover:bg-white shadow-sm transition-all"
          aria-label="Next banner"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "rounded-full transition-all duration-300",
                idx === current
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}