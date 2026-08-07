import { NextRequest, NextResponse } from "next/server";
import {
  fetchRazorpayPayment,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "@/lib/razorpay/server";
import { insertOrderServer } from "@/lib/api/orders-server";
import { mapOrder } from "@/lib/api/map-order";
import { supabaseAdmin } from "@/lib/api/supabase-admin";
import type { Address, CartItem } from "@/types";

/**
 * POST /api/payments/verify
 *
 * Verifies a Razorpay payment after the checkout widget's success handler
 * fires. The order is created in the database ONLY when:
 *   1. the HMAC signature is valid (payment belongs to an order we created), and
 *   2. Razorpay reports the payment as `captured`, and
 *   3. the paid amount & razorpay order id match what we expected.
 *
 * Body:
 *   {
 *     paymentId: string,        // razorpay_payment_id
 *     orderId: string,          // razorpay_order_id
 *     signature: string,        // razorpay_signature
 *     orderData: {
 *       id: string,             // boxzz order id (from /api/payments/create)
 *       items: CartItem[],
 *       total, subtotal, shipping, gst: number,
 *       shippingAddress: Address,
 *       notes?: string,
 *       userId?: string | null
 *     }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured." },
        { status: 503 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const {
      paymentId,
      orderId,
      signature,
      orderData,
    }: {
      paymentId?: string;
      orderId?: string;
      signature?: string;
      orderData?: {
        id?: string;
        items?: CartItem[];
        total?: number;
        subtotal?: number;
        shipping?: number;
        gst?: number;
        shippingAddress?: Address;
        notes?: string;
        userId?: string | null;
      };
    } = body ?? {};

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }
    if (!orderData?.id || !Array.isArray(orderData.items) || !orderData.shippingAddress) {
      return NextResponse.json(
        { error: "Missing order data" },
        { status: 400 }
      );
    }

    // 1. Verify the Razorpay signature.
    const signatureValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });
    if (!signatureValid) {
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // 2. Fetch the payment from Razorpay and confirm it was actually captured.
    const payment = await fetchRazorpayPayment(paymentId);
    const totalAmount = Number(orderData.total);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }
    const expectedAmountPaise = Math.round(totalAmount * 100);

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          error: `Payment is not captured (status: ${payment.status})`,
        },
        { status: 400 }
      );
    }
    if (payment.order_id !== orderId || payment.amount !== expectedAmountPaise) {
      return NextResponse.json(
        { error: "Payment amount/order mismatch" },
        { status: 400 }
      );
    }

    // 3. Payment verified — now (and only now) create the order.
    //    Idempotency: if this Razorpay order was already converted into a
    //    Boxzz order (e.g. a retried/duplicate request), return it as-is.
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();
    if (existingOrder) {
      return NextResponse.json({ success: true, order: mapOrder(existingOrder) });
    }

    const result = await insertOrderServer({
      orderId: orderData.id,
      items: orderData.items,
      total: totalAmount,
      subtotal: orderData.subtotal ?? totalAmount,
      shipping: orderData.shipping ?? 0,
      gst: orderData.gst ?? 0,
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      userId: orderData.userId ?? null,
      paymentMethod: "Online Mode",
      paymentStatus: "paid",
      paymentId,
      razorpayOrderId: orderId,
      paymentDetails: payment as unknown as Record<string, unknown>,
      paidAt: new Date(payment.created_at * 1000).toISOString(),
    });

    if (!result.order) {
      return NextResponse.json(
        { error: result.error || "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (e: any) {
    console.error("verify payment error:", e);
    return NextResponse.json(
      { error: e.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
