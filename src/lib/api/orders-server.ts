import { supabaseAdmin } from "./supabase-admin";
import type { Address, CartItem, Order } from "@/types";
import { mapOrder } from "./map-order";

/**
 * Server-only order creation used by the payment verification flow.
 * Uses the Supabase service-role client (bypasses RLS) so we can persist
 * payment metadata alongside the order. The order is ONLY created here after
 * the Razorpay signature + payment status have been verified.
 */
export interface ServerOrderInput {
  orderId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  gst: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  razorpayOrderId?: string;
  paymentDetails?: Record<string, unknown>;
  paidAt?: string;
  notes?: string;
  userId?: string | null;
}

export async function insertOrderServer(
  input: ServerOrderInput
): Promise<{ order: Order | null; error?: string }> {
  try {
    const estimatedDelivery = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: orderError } = await supabaseAdmin.from("orders").insert({
      id: input.orderId,
      user_id: input.userId ?? null,
      status: "confirmed",
      total: input.total,
      subtotal: input.subtotal,
      shipping: input.shipping,
      gst: input.gst,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      payment_id: input.paymentId ?? null,
      razorpay_order_id: input.razorpayOrderId ?? null,
      payment_details: input.paymentDetails ?? null,
      paid_at: input.paidAt ?? null,
      notes: input.notes ?? null,
      shipping_address: {
        id: input.shippingAddress.id,
        label: input.shippingAddress.label,
        full_name: input.shippingAddress.fullName,
        phone: input.shippingAddress.phone,
        company: input.shippingAddress.company ?? null,
        line1: input.shippingAddress.line1,
        line2: input.shippingAddress.line2 ?? null,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        pincode: input.shippingAddress.pincode,
        is_default: false,
      },
      estimated_delivery: estimatedDelivery,
      tracking_id: null, // Tracking ID is added by admin only when the order is shipped
    });
    if (orderError) throw orderError;

    if (input.items.length > 0) {
      const orderItems = input.items.map((item) => ({
        order_id: input.orderId,
        product_id: item.productId,
        product_name: item.name,
        price: item.price,
        mrp: item.mrp ?? item.price,
        quantity: item.quantity,
        image: item.image,
        variant: item.variant ?? null,
        variant_id: item.variantId ?? null,
        variant_label: item.variantLabel ?? null,
        shipping_weight: item.shippingWeight ?? null,
      }));
      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // Fetch the complete order back
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", input.orderId)
      .single();
    if (error) throw error;

    return { order: data ? mapOrder(data) : null };
  } catch (e: any) {
    console.error("insertOrderServer error:", e);
    return { order: null, error: e.message || "Failed to create order" };
  }
}
