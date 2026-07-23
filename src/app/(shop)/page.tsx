"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getFeaturedProducts,
  getBestSellerProducts,
  getNewProducts,
  getBanners,
} from "@/lib/api/db";
import { getFeaturedCategories } from "@/data";
import type { Product, FeaturedCategory } from "@/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featured, bestSellers, newArrivals, categories] = await Promise.all([
          getFeaturedProducts(),
          getBestSellerProducts(),
          getNewProducts(),
          getFeaturedCategories(),
        ]);
        setFeaturedProducts(featured);
        setBestSellerProducts(bestSellers);
        setNewProducts(newArrivals);
        setFeaturedCategories(categories);
      } catch (e) {
        console.error("Failed to load homepage data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner Section ─── */}
      <section>
        <HeroBanner />
      </section>

      {/* ─── Marquee Strip ─── */}
      <MarqueeStrip />

      {/* ─── Categories Section ─── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary-100/60 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-full blur-3xl -z-10" />

        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full text-xs font-semibold text-primary-600 mb-3">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              Categories
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 mt-1.5 max-w-xl">
              Explore our wide range of packaging materials tailored for your business
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredCategories.map((cat, idx) => (
            <CategoryCard key={cat.id} category={cat} index={idx} href={`/category/${cat.subcategories[0]}`} />
          ))}
        </div>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2">
          {featuredCategories.map((group) => (
            <div key={group.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full">
              <span className="text-xs">{group.icon}</span>
              <span className="text-[11px] font-medium text-zinc-600">{group.name.split(" ")[0]}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className="text-[10px] text-zinc-400">{group.productCount} products</span>
            </div>
          ))}
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="bg-gradient-to-b from-zinc-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <SectionHeader
            title="Featured Products"
            subtitle="Most popular packaging products this month"
            href="/category/3-ply-boxes"
          />
          {isLoading ? (
            <div className="mt-4 sm:mt-6 flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {featuredProducts.slice(0, 10).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Best Seller Products ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <SectionHeader
          title={
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Best Sellers
            </span>
          }
          subtitle="Trusted by businesses across India"
          href="/category/3-ply-flap-boxes"
        />
        {isLoading ? (
          <div className="mt-4 sm:mt-6 flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {bestSellerProducts.slice(0, 10).map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ─── New Arrivals ─── */}
      {newProducts.length > 0 && (
        <section className="bg-gradient-to-b from-white to-zinc-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <SectionHeader
              title={
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  New Arrivals
                </span>
              }
              subtitle="Fresh from our production line"
              href="/category/packaging-tapes"
            />
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {newProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Trust Badges ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Why Choose Boxzz?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-2">
              India's most trusted packaging manufacturer
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Award,
                title: "Premium Quality",
                desc: "Virgin materials, certified quality",
              },
              {
                icon: Truck,
                title: "PAN India Delivery",
                desc: "Free shipping above ₹2,499",
              },
              {
                icon: ShieldCheck,
                title: "Bulk Orders",
                desc: "Manufacturer direct pricing",
              },
              {
                icon: RotateCcw,
                title: "Customization",
                desc: "Custom sizes & printing",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className="text-center p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="mt-3 text-sm sm:text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0v40M0 20h40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight">
              Need Custom Packaging Solutions?
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-primary-100 max-w-xl mx-auto">
              Get a free quote for custom-sized boxes, branded packaging, or bulk orders. Our team will get back to you within 24 hours.
            </p>
            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/custom-packaging"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-primary font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg shadow-black/10 text-sm sm:text-base"
              >
                Get a Free Quote
              </Link>
              <a
                href="tel:+918570059569"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm sm:text-base"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}