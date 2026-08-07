import crypto from "crypto";

/**
 * Server-side Razorpay helpers (orders API, signature verification,
 * payment lookup). Server-only — never import in client components.
 *
 * Uses global `fetch` + Node `crypto` so no npm dependency is required.
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

/**
 * Public (client-safe) Razorpay key id. The Razorpay key id is not secret,
 * but it must be reachable from the browser to render the checkout widget.
 */
export function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || RAZORPAY_KEY_ID;
}

function basicAuth(): string {
  return `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString(
    "base64"
  )}`;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number; // paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface CreateRazorpayOrderInput {
  /** Amount in rupees (fractional cents are supported). */
  amount: number;
  currency?: string;
  /** Receipt reference (max 40 chars). */
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes || {},
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      "Failed to create Razorpay order";
    throw new Error(message);
  }
  return data as RazorpayOrder;
}

/**
 * Verify the HMAC-SHA256 signature Razorpay returns with a successful
 * payment. This proves the payment belongs to an order we created.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return generatedSignature === params.signature;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  order_id: string;
  amount: number; // paise
  currency: string;
  status: string; // "captured" | "failed" | "authorized" | "refunded" ...
  captured: boolean;
  method: string; // "card" | "netbanking" | "upi" | "wallet" | "emi" | "paylater" ...
  description?: string;
  email?: string;
  contact?: string;
  bank?: string;
  vpa?: string;
  wallet?: string;
  acquirer_data?: Record<string, unknown>;
  fee?: number;
  tax?: number;
  amount_refunded?: number;
  refund_status?: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number; // epoch seconds
}

export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPayment> {
  const res = await fetch(`${RAZORPAY_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: { Authorization: basicAuth() },
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error?.description || "Failed to fetch Razorpay payment";
    throw new Error(message);
  }
  return data as RazorpayPayment;
}
