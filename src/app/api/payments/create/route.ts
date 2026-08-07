import { NextRequest, NextResponse } from "next/server";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@/lib/razorpay/server";

/**
 * POST /api/payments/create
 *
 * Creates a Razorpay order server-side for an "Online Mode" checkout.
 * The order id returned is later used by /api/payments/verify to save the
 * order ONLY after the payment has been captured & verified.
 *
 * Body:
 *   { amount: number (INR), currency?: string, notes?: Record<string,string> }
 *
 * Response:
 *   { keyId, orderId (razorpay), boxzzOrderId, amount, currency }
 */
export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error:
            "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment.",
        },
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
    const amount = Number(body.amount);
    const currency = typeof body.currency === "string" ? body.currency : "INR";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Generate the internal order id; used both as the DB primary key later
    // and as the Razorpay receipt reference (max 40 chars).
    const boxzzOrderId = `BXZ-${Date.now().toString().slice(-8)}-${String(
      Math.floor(Math.random() * 9999)
    ).padStart(4, "0")}`;

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency,
      receipt: boxzzOrderId,
      notes: {
        boxzz_order_id: boxzzOrderId,
        source: "boxzz_checkout",
        ...(body.notes || {}),
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      orderId: razorpayOrder.id, // razorpay order id
      boxzzOrderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (e: any) {
    console.error("create payment order error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
