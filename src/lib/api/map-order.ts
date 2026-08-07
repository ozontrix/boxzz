import type {
  Address,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/types";

/**
 * Shared mapper that converts a raw Supabase order row (with nested
 * `order_items`) into the frontend `Order` shape. Used by the public API,
 * the admin API and the server-side payment verification flow.
 */
export function mapOrder(raw: any): Order {
  const items: CartItem[] = raw.order_items?.map((oi: any) => ({
    productId: oi.product_id,
    name: oi.product_name,
    price: oi.price,
    mrp: oi.mrp ?? oi.price,
    quantity: oi.quantity,
    image: oi.image ?? "📦",
    variant: oi.variant ?? undefined,
    variantId: oi.variant_id ?? undefined,
    variantLabel: oi.variant_label ?? undefined,
    shippingWeight: oi.shipping_weight ?? undefined,
  })) ?? [];

  const address: Address = raw.shipping_address
    ? {
        id: raw.shipping_address.id || `addr-${raw.id}`,
        label: raw.shipping_address.label || "Shipping",
        fullName:
          raw.shipping_address.full_name ||
          raw.shipping_address.fullName ||
          "",
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
    subtotal:
      raw.subtotal !== undefined
        ? raw.subtotal
        : raw.total - (raw.gst || 0) - (raw.shipping || 0),
    shipping: raw.shipping !== undefined ? raw.shipping : 0,
    gst: raw.gst !== undefined ? raw.gst : 0,
    shippingAddress: address,
    paymentMethod: raw.payment_method,
    paymentStatus: (raw.payment_status as PaymentStatus) ?? undefined,
    paymentId: raw.payment_id ?? undefined,
    razorpayOrderId: raw.razorpay_order_id ?? undefined,
    paymentDetails: raw.payment_details ?? undefined,
    paidAt: raw.paid_at ?? undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    estimatedDelivery: raw.estimated_delivery ?? undefined,
    trackingId: raw.tracking_id ?? undefined,
  };
}
