import { supabase } from "./supabase";
import type { Product, Category, Banner, Address, Order, OrderStatus, CartItem } from "@/types";

// ─── Product Mapping ──────────────────────────────────────────────
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

function mapCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    nameHindi: raw.name_hindi ?? "",
    icon: raw.icon,
    description: raw.description,
    shortDescription: raw.short_description,
    image: raw.image,
    productCount: raw.product_count,
  };
}

function mapBanner(raw: any): Banner {
  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    image: raw.image,
    cta: raw.cta,
    ctaLink: raw.cta_link,
    bgColor: raw.bg_color,
  };
}

function mapAddress(raw: any): Address {
  return {
    id: raw.id,
    label: raw.label,
    fullName: raw.full_name,
    phone: raw.phone,
    company: raw.company ?? undefined,
    line1: raw.line1,
    line2: raw.line2 ?? undefined,
    city: raw.city,
    state: raw.state,
    pincode: raw.pincode,
    isDefault: raw.is_default,
  };
}

function mapOrder(raw: any): Order {
  const items: CartItem[] = raw.order_items?.map((oi: any) => ({
    productId: oi.product_id,
    name: oi.product_name,
    price: oi.price,
    quantity: oi.quantity,
    image: oi.image ?? "📦",
    variant: oi.variant ?? undefined,
  })) ?? [];

  const address: Address = raw.shipping_address
    ? {
        id: raw.shipping_address.id || `addr-${raw.id}`,
        label: raw.shipping_address.label || "Shipping",
        fullName: raw.shipping_address.full_name || raw.shipping_address.fullName || "",
        phone: raw.shipping_address.phone || "",
        company: raw.shipping_address.company,
        line1: raw.shipping_address.line1 || "",
        line2: raw.shipping_address.line2,
        city: raw.shipping_address.city || "",
        state: raw.shipping_address.state || "",
        pincode: raw.shipping_address.pincode || "",
        isDefault: false,
      }
    : {
        id: `addr-${raw.id}`,
        label: "Shipping",
        fullName: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      };

  return {
    id: raw.id,
    items,
    status: raw.status as OrderStatus,
    total: raw.total,
    shippingAddress: address,
    paymentMethod: raw.payment_method,
    createdAt: raw.created_at,
    estimatedDelivery: raw.estimated_delivery ?? undefined,
    trackingId: raw.tracking_id ?? undefined,
  };
}

// ─── Products ─────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getAllProducts error:", e);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getFeaturedProducts error:", e);
    return [];
  }
}

export async function getBestSellerProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_best_seller", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getBestSellerProducts error:", e);
    return [];
  }
}

export async function getNewProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_new", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getNewProducts error:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data ? mapProduct(data) : null;
  } catch (e) {
    console.error("getProductBySlug error:", e);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ? mapProduct(data) : null;
  } catch (e) {
    console.error("getProductById error:", e);
    return null;
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", categoryId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getProductsByCategory error:", e);
    return [];
  }
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", productId)
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("getRelatedProducts error:", e);
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const q = `%${query.toLowerCase()}%`;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(
        `name.ilike.${q},description.ilike.${q},category.ilike.${q},short_description.ilike.${q}`
      )
      .limit(20);
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (e) {
    console.error("searchProducts error:", e);
    return [];
  }
}

// ─── Categories ───────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  } catch (e) {
    console.error("getAllCategories error:", e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", slug)
      .single();
    if (error) throw error;
    return data ? mapCategory(data) : null;
  } catch (e) {
    console.error("getCategoryBySlug error:", e);
    return null;
  }
}

// ─── Banners ──────────────────────────────────────────────────────

export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapBanner);
  } catch (e) {
    console.error("getBanners error:", e);
    return [];
  }
}

// ─── Addresses ────────────────────────────────────────────────────

export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAddress);
  } catch (e) {
    console.error("getUserAddresses error:", e);
    return [];
  }
}

export async function addAddress(
  userId: string,
  address: Omit<Address, "id">
): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        label: address.label,
        full_name: address.fullName,
        phone: address.phone,
        company: address.company ?? null,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.isDefault,
      })
      .select()
      .single();
    if (error) throw error;
    return data ? mapAddress(data) : null;
  } catch (e) {
    console.error("addAddress error:", e);
    return null;
  }
}

export async function updateAddress(address: Address): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("addresses")
      .update({
        label: address.label,
        full_name: address.fullName,
        phone: address.phone,
        company: address.company ?? null,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.isDefault,
      })
      .eq("id", address.id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("updateAddress error:", e);
    return false;
  }
}

export async function deleteAddress(addressId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("deleteAddress error:", e);
    return false;
  }
}

// ─── Shipping Config (from DB) ────────────────────────────────────
export interface ShippingConfig {
  standardCharge: number;
  freeThreshold: number;
  gstRate: number;
  methods: Array<{
    id: string;
    label: string;
    type: string;
    charge: number;
    free_threshold: number | null;
    min_days: number;
    max_days: number;
  }>;
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const { data, error } = await supabase
      .from("shipping_settings")
      .select("*")
      .eq("is_active", true)
      .order("charge", { ascending: true });
    if (error) throw error;

    const settings = data ?? [];
    const standardMethod = settings.find((s: any) => s.type === "standard") || settings[0];
    
    return {
      standardCharge: standardMethod?.charge ?? 149,
      freeThreshold: standardMethod?.free_threshold ?? 2499,
      gstRate: 0.12,
      methods: settings.map((s: any) => ({
        id: s.id,
        label: s.label,
        type: s.type,
        charge: s.charge,
        free_threshold: s.free_threshold,
        min_days: s.min_days,
        max_days: s.max_days,
      })),
    };
  } catch (e) {
    console.error("getShippingConfig error:", e);
    return {
      standardCharge: 149,
      freeThreshold: 2499,
      gstRate: 0.12,
      methods: [],
    };
  }
}

// ─── Orders ───────────────────────────────────────────────────────

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapOrder);
  } catch (e) {
    console.error("getUserOrders error:", e);
    return [];
  }
}

export async function createOrder(
  orderData: {
    items: CartItem[];
    total: number;
    subtotal: number;
    shipping: number;
    gst: number;
    shippingAddress: Address;
    paymentMethod: string;
    notes?: string;
  },
  userId: string
): Promise<{ order: Order | null; error?: string }> {
  try {
    const orderId = `BXZ-${Date.now().toString().slice(-8)}-${String(
      Math.floor(Math.random() * 9999)
    ).padStart(4, "0")}`;

    const estimatedDelivery = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Insert order
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      user_id: userId,
      status: "confirmed",
      total: orderData.total,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      gst: orderData.gst,
      payment_method: orderData.paymentMethod,
      notes: orderData.notes ?? null,
      shipping_address: {
        id: orderData.shippingAddress.id,
        label: orderData.shippingAddress.label,
        full_name: orderData.shippingAddress.fullName,
        phone: orderData.shippingAddress.phone,
        company: orderData.shippingAddress.company ?? null,
        line1: orderData.shippingAddress.line1,
        line2: orderData.shippingAddress.line2 ?? null,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        pincode: orderData.shippingAddress.pincode,
        is_default: false,
      },
      estimated_delivery: estimatedDelivery,
      tracking_id: `BXZ-TRK-${Date.now().toString().slice(-6)}`,
    });
    if (orderError) throw orderError;

    // Insert order items
    if (orderData.items.length > 0) {
      const orderItems = orderData.items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variant: item.variant ?? null,
      }));
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // Fetch the complete order back
    const order = await getOrderById(orderId);
    return { order };
  } catch (e: any) {
    console.error("createOrder error:", e);
    return { order: null, error: e.message || "Failed to create order" };
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (error) throw error;
    return data ? mapOrder(data) : null;
  } catch (e) {
    console.error("getOrderById error:", e);
    return null;
  }
}