import { supabase } from "./supabase";
import type { Product, Category, Banner, Address, Order, OrderStatus, CartItem } from "@/types";

// ─── Admin Auth ──────────────────────────────────────────────────
export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function adminSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ─── Categories ──────────────────────────────────────────────────
export async function adminGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function adminCreateCategory(category: {
  id: string;
  name: string;
  name_hindi?: string;
  icon?: string;
  description?: string;
  short_description?: string;
  image?: string;
}): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      id: category.id,
      name: category.name,
      name_hindi: category.name_hindi || "",
      icon: category.icon || "📦",
      description: category.description || "",
      short_description: category.short_description || "",
      image: category.image || "",
      product_count: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function adminUpdateCategory(
  id: string,
  updates: Partial<{
    name: string;
    name_hindi: string;
    icon: string;
    description: string;
    short_description: string;
    image: string;
  }>
): Promise<void> {
  const { error } = await supabase.from("categories").update(updates).eq("id", id);
  if (error) throw error;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  // Delete all products in this category first
  await supabase.from("products").delete().eq("category", id);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ─── Products ────────────────────────────────────────────────────
export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function adminCreateProduct(product: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category: string;
  subcategory?: string;
  features?: string[];
  specifications?: Record<string, string>;
  in_stock?: boolean;
  stock_count?: number;
  moq?: number;
  unit?: string;
  variants?: any[];
  is_new?: boolean;
  is_featured?: boolean;
  is_best_seller?: boolean;
  discount?: number;
  customization_available?: boolean;
  printing_options?: string[];
}): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price,
      original_price: product.original_price || null,
      images: product.images || [],
      category: product.category,
      subcategory: product.subcategory || "",
      features: product.features || [],
      specifications: product.specifications || {},
      in_stock: product.in_stock ?? true,
      stock_count: product.stock_count ?? 0,
      moq: product.moq ?? 1,
      unit: product.unit || "piece",
      variants: product.variants || [],
      is_new: product.is_new ?? false,
      is_featured: product.is_featured ?? false,
      is_best_seller: product.is_best_seller ?? false,
      discount: product.discount || null,
      customization_available: product.customization_available ?? false,
      printing_options: product.printing_options || [],
    })
    .select()
    .single();
  if (error) throw error;

  // Update category product count
  await supabase.rpc("update_category_product_count", { cat_id: product.category });

  return mapProduct(data);
}

export async function adminUpdateProduct(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    original_price: number;
    images: string[];
    category: string;
    subcategory: string;
    features: string[];
    specifications: Record<string, string>;
    in_stock: boolean;
    stock_count: number;
    moq: number;
    unit: string;
    variants: any[];
    is_new: boolean;
    is_featured: boolean;
    is_best_seller: boolean;
    discount: number;
    customization_available: boolean;
    printing_options: string[];
  }>
): Promise<void> {
  const { error } = await supabase.from("products").update(updates).eq("id", id);
  if (error) throw error;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  // Get product to know its category
  const { data: product } = await supabase
    .from("products")
    .select("category")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  // Update category product count
  if (product?.category) {
    await supabase.rpc("update_category_product_count", { cat_id: product.category });
  }
}

// ─── Orders ──────────────────────────────────────────────────────
export async function adminGetOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export async function adminUpdateOrderTracking(
  orderId: string,
  trackingId: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ tracking_id: trackingId })
    .eq("id", orderId);
  if (error) throw error;
}

export async function adminUpdateOrderEstimatedDelivery(
  orderId: string,
  estimatedDelivery: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ estimated_delivery: estimatedDelivery })
    .eq("id", orderId);
  if (error) throw error;
}

// ─── Banners ─────────────────────────────────────────────────────
export async function adminGetBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapBanner);
}

export async function adminCreateBanner(banner: {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  cta?: string;
  cta_link?: string;
  bg_color?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<Banner> {
  const { data, error } = await supabase
    .from("banners")
    .insert({
      id: banner.id,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      cta: banner.cta || "",
      cta_link: banner.cta_link || "",
      bg_color: banner.bg_color || "from-orange-50 via-amber-100/50 to-white",
      is_active: banner.is_active ?? true,
      sort_order: banner.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapBanner(data);
}

export async function adminUpdateBanner(
  id: string,
  updates: Partial<{
    title: string;
    subtitle: string;
    image: string;
    cta: string;
    cta_link: string;
    bg_color: string;
    is_active: boolean;
    sort_order: number;
  }>
): Promise<void> {
  const { error } = await supabase.from("banners").update(updates).eq("id", id);
  if (error) throw error;
}

export async function adminDeleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
}

// ─── Users ───────────────────────────────────────────────────────
export async function adminGetUsers() {
  // Get users from auth.users via a custom function
  // Since we can't directly query auth.users from anon client,
  // we'll get users from orders and addresses
  const { data: orderUsers, error: orderError } = await supabase
    .from("orders")
    .select("user_id, shipping_address")
    .order("created_at", { ascending: false });
  if (orderError) throw orderError;

  // Get unique user IDs
  const userIds = [...new Set((orderUsers ?? []).map((o: any) => o.user_id).filter(Boolean))];

  // Get addresses for these users
  const { data: addresses, error: addrError } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: false });
  if (addrError) throw addrError;

  // Build user profiles from available data
  const userMap = new Map<string, any>();
  
  for (const order of orderUsers ?? []) {
    if (order.user_id && !userMap.has(order.user_id)) {
      const addr = order.shipping_address || {};
      userMap.set(order.user_id, {
        id: order.user_id,
        name: addr.full_name || addr.fullName || "Unknown",
        email: "",
        phone: addr.phone || "",
        addresses: [],
        orderCount: 0,
        totalSpent: 0,
      });
    }
    if (order.user_id) {
      const user = userMap.get(order.user_id);
      if (user) {
        user.orderCount++;
        user.totalSpent += (order as any).total || 0;
      }
    }
  }

  // Attach addresses
  for (const addr of addresses ?? []) {
    const user = userMap.get((addr as any).user_id);
    if (user) {
      user.addresses.push(mapAddress(addr));
    }
  }

  return Array.from(userMap.values());
}

// ─── Shipping Settings ────────────────────────────────────────────
export interface ShippingSetting {
  id: string;
  label: string;
  type: "standard" | "express" | "free" | "international";
  charge: number;
  free_threshold: number | null;
  min_days: number;
  max_days: number;
  is_active: boolean;
  regions: string[];
  description: string;
  created_at: string;
}

export async function adminGetShippingSettings(): Promise<ShippingSetting[]> {
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("*")
    .order("charge", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateShippingSetting(
  setting: Omit<ShippingSetting, "created_at">
): Promise<void> {
  const { error } = await supabase.from("shipping_settings").insert(setting);
  if (error) throw error;
}

export async function adminUpdateShippingSetting(
  id: string,
  updates: Partial<Omit<ShippingSetting, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase.from("shipping_settings").update(updates).eq("id", id);
  if (error) throw error;
}

export async function adminDeleteShippingSetting(id: string): Promise<void> {
  const { error } = await supabase.from("shipping_settings").delete().eq("id", id);
  if (error) throw error;
}

export async function adminGetContactInfo() {
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("*")
    .eq("type", "contact")
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ─── Site Settings ────────────────────────────────────────────────
export async function adminGetSettings(): Promise<{ key: string; value: string; type: string; label: string; description: string; section: string }[]> {
  const { data, error } = await supabase.from("site_settings").select("*").order("section", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
  if (error) throw error;
}

export async function adminUpdateSettings(settings: { key: string; value: string }[]): Promise<void> {
  for (const setting of settings) {
    const { error } = await supabase.from("site_settings").update({ value: setting.value, updated_at: new Date().toISOString() }).eq("key", setting.key);
    if (error) throw error;
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────────
export async function adminGetDashboardStats() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*");
  if (ordersError) throw ordersError;

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, category");
  if (productsError) throw productsError;

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id");
  if (catError) throw catError;

  const totalRevenue = (orders ?? []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const totalOrders = (orders ?? []).length;
  const pendingOrders = (orders ?? []).filter(
    (o: any) => !["delivered", "cancelled", "returned"].includes(o.status)
  ).length;
  const totalProducts = (products ?? []).length;
  const totalCategories = (categories ?? []).length;

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCategories,
    recentOrders: (orders ?? [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
  };
}

// ─── Mapping Functions ───────────────────────────────────────────
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