// This file is kept for backward compatibility.
// All data should be fetched from Supabase via src/lib/api/db.ts
// These functions delegate to the real DB layer.

import {
  getAllProducts as dbGetAllProducts,
  getFeaturedProducts as dbGetFeaturedProducts,
  getBestSellerProducts as dbGetBestSellerProducts,
  getNewProducts as dbGetNewProducts,
  getProductBySlug as dbGetProductBySlug,
  getProductById as dbGetProductById,
  getProductsByCategory as dbGetProductsByCategory,
  getRelatedProducts as dbGetRelatedProducts,
  searchProducts as dbSearchProducts,
  getAllCategories as dbGetAllCategories,
  getCategoryBySlug as dbGetCategoryBySlug,
  getBanners as dbGetBanners,
} from "@/lib/api/db";
import type { Product, Category, Banner, FeaturedCategory } from "@/types";

// Products — always from Supabase
export async function getFeaturedProducts(): Promise<Product[]> {
  return dbGetFeaturedProducts();
}

export async function getBestSellerProducts(): Promise<Product[]> {
  return dbGetBestSellerProducts();
}

export async function getNewProducts(): Promise<Product[]> {
  return dbGetNewProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return dbGetProductBySlug(slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = await dbGetProductById(id);
  return product ?? undefined;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return dbGetProductsByCategory(categoryId);
}

export async function getCategories(): Promise<Category[]> {
  return dbGetAllCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const cat = await dbGetCategoryBySlug(slug);
  return cat ?? undefined;
}

export async function getBanners(): Promise<Banner[]> {
  return dbGetBanners();
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  return dbGetRelatedProducts(productId, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return dbSearchProducts(query);
}

// Featured categories are derived from DB categories
export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  const categories = await dbGetAllCategories();
  return categories.slice(0, 6).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    description: cat.description,
    shortDescription: cat.shortDescription,
    image: cat.image,
    productCount: cat.productCount,
    subcategories: [cat.id],
  }));
}