"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { supabase } from "@/lib/api/supabase";
import { getCategoryBySlug } from "@/data";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Product, Category } from "@/types";

function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    shortDescription: raw.short_description,
    price: raw.price,
    originalPrice: raw.original_price ?? undefined,
    images: raw.images ?? [],
    category: raw.category,
    subcategory: raw.subcategory,
    features: raw.features ?? [],
    specifications: raw.specifications ?? undefined,
    rating: raw.rating,
    reviewCount: raw.review_count,
    inStock: raw.in_stock,
    stockCount: raw.stock_count,
    moq: raw.moq,
    unit: raw.unit,
    variants: raw.variants ?? undefined,
    isNew: raw.is_new ?? false,
    isFeatured: raw.is_featured ?? false,
    isBestSeller: raw.is_best_seller ?? false,
    discount: raw.discount ?? undefined,
    customizationAvailable: raw.customization_available ?? false,
    printingOptions: raw.printing_options ?? undefined,
    createdAt: raw.created_at,
  };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cat] = await Promise.all([
          getCategoryBySlug(slug),
        ]);
        if (!cat) {
          setNotFoundState(true);
          return;
        }
        setCategory(cat);
        
        // Fetch only in-stock, active products
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("category", slug)
          .eq("in_stock", true)
          .gt("stock_count", 0)
          .order("created_at", { ascending: false });
        setProducts((data ?? []).map(mapProduct));
      } catch (e) {
        console.error("Failed to load category:", e);
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  if (notFoundState) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <Link
            href="/categories"
            className="hover:text-primary transition-colors"
          >
            Categories
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Category Header */}
      <section className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {category.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">
                {category.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-1 sm:mt-2 max-w-2xl">
                {category.description}
              </p>
              <div className="flex items-center gap-3 mt-3 sm:mt-4">
                <span className="px-3 py-1 text-xs sm:text-sm font-medium text-primary bg-orange-50 rounded-lg">
                  {products.length} Products
                </span>
                {category.nameHindi && (
                  <span className="text-xs sm:text-sm text-zinc-400">
                    {category.nameHindi}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {products.length > 0 ? (
          <>
            <SectionHeader
              title={`All ${category.name}`}
              subtitle="Browse our complete collection"
            />
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">📦</div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-800">
              No products yet
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Products in this category are coming soon.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}