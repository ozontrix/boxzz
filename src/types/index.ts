// ─── Product Types ───────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: CategorySlug;
  subcategory: string;
  features: string[];
  specifications?: Record<string, string>;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  moq: number; // Minimum Order Quantity
  unit: "piece" | "roll" | "box" | "set" | "meter" | "kg" | "pack";
  variants?: ProductVariant[];
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  customizationAvailable?: boolean;
  printingOptions?: string[];
  createdAt: string;
  applications?: string[];
  deliveryInfo?: {
    shipsWithin: string;
    panIndia: boolean;
    bulkOrders: boolean;
  };
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  weight: number;
  sku: string;
  inStock: boolean;
  value: string;
}

export type CategorySlug =
  | "3-ply-boxes"
  | "3-ply-flap-boxes"
  | "3-ply-printed-flap-boxes"
  | "3-ply-white-boxes"
  | "3-ply-flap-white-boxes"
  | "5-ply-boxes"
  | "7-ply-boxes"
  | "packaging-tapes"
  | "paper-bubble-wrap"
  | "poly-bags"
  | "thermal-labels"
  | "corrugated-roll"
  | "custom-packaging";

export interface Category {
  id: CategorySlug;
  name: string;
  nameHindi: string;
  icon: string;
  description: string;
  shortDescription: string;
  image: string;
  productCount: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  shortDescription: string;
  image: string;
  productCount: number;
  subcategories: CategorySlug[];
}

// ─── Cart Types ─────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  variant?: string;
  variantLabel?: string;
  shippingWeight?: number;
  customization?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

// ─── User / Auth Types ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  gstin?: string;
  avatar?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// ─── Order Types ────────────────────────────────────────────────
export type OrderStatus =
  | "confirmed"
  | "in-production"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping: number;
  gst: number;
  shippingAddress: Address;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingId?: string;
}

// ─── API Types ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Banner Types ───────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
}

// ─── Review Types ───────────────────────────────────────────────
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}