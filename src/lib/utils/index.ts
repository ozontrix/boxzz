import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY, FREE_SHIPPING_THRESHOLD, GST_RATE } from "@/lib/constants";

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (₹1,23,456.78)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  sellingPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}

/**
 * Check if order qualifies for free shipping
 */
export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculate GST amount
 */
export function calculateGst(amount: number): number {
  return amount * GST_RATE;
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Format a date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate order ID (e.g., BXZ-20260713-0001)
 */
export function generateOrderId(index: number): string {
  const date = new Date();
  const dateStr = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  return `BXZ-${dateStr}-${String(index).padStart(4, "0")}`;
}

/**
 * Mask phone number for privacy
 */
export function maskPhone(phone: string): string {
  return phone.slice(0, -4).replace(/\d/g, "X") + phone.slice(-4);
}