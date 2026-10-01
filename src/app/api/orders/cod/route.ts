import { NextRequest, NextResponse } from "next/server";
import { insertOrderServer } from "@/lib/api/orders-server";
import type { Address, CartItem } from "@/types";

interface CodOrderData {
  items?: CartItem[];
  total?: number;
  subtotal?: number;
  shipping?: number;
  gst?: number;
  shippingAddress?: Address;
  notes?: string;
  userId?: string | null;
}

interface CodOrderRequestBody {
  orderData?: CodOrderData;
}

function createBoxzzOrderId() {
  return `BXZ-${Date.now().toString().slice(-8)}-${String(
    Math.floor(Math.random() * 9999)
  ).padStart(4, "0")}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * POST /api/orders/cod
 *
 * Creates a Cash on Delivery order without invoking Razorpay. The order is
 * stored with payment_status = "pending" so admins can distinguish it from
 * prepaid Razorpay orders.
 */
export async function POST(request: NextRequest) {
  try {
    let body: CodOrderRequestBody;
    try {
      body = (await request.json()) as CodOrderRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const orderData = body?.orderData ?? {};

    const totalAmount = Number(orderData.total);
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }
    if (!orderData.shippingAddress?.fullName || !orderData.shippingAddress?.phone || !orderData.shippingAddress?.line1) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    const result = await insertOrderServer({
      orderId: createBoxzzOrderId(),
      items: orderData.items,
      total: totalAmount,
      subtotal: Number(orderData.subtotal ?? totalAmount),
      shipping: Number(orderData.shipping ?? 0),
      gst: Number(orderData.gst ?? 0),
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      userId: orderData.userId ?? null,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
    });

    if (!result.order) {
      return NextResponse.json(
        { error: result.error || "Failed to create COD order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (e: unknown) {
    console.error("create COD order error:", e);
    return NextResponse.json(
      { error: getErrorMessage(e, "Failed to create COD order") },
      { status: 500 }
    );
  }
}