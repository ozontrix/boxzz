import { CATEGORIES, FEATURED_CATEGORIES, FEATURED_PRODUCTS, BANNERS } from "@/lib/constants";
import type { Product, Category, Banner, FeaturedCategory } from "@/types";

export function getFeaturedProducts(): Product[] {
  return FEATURED_PRODUCTS.filter((p) => p.isFeatured);
}

export function getBestSellerProducts(): Product[] {
  return FEATURED_PRODUCTS.filter((p) => p.isBestSeller);
}

export function getNewProducts(): Product[] {
  return FEATURED_PRODUCTS.filter((p) => p.isNew);
}

export function getProductBySlug(slug: string): Product | undefined {
  return FEATURED_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return FEATURED_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return FEATURED_PRODUCTS.filter((p) => p.category === categoryId);
}

export function getFeaturedCategories(): FeaturedCategory[] {
  return FEATURED_CATEGORIES;
}

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === slug);
}

export function getBanners(): Banner[] {
  return BANNERS;
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  return FEATURED_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== productId
  ).slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return FEATURED_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}