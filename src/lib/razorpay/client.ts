"use client";

/**
 * Client-side helpers for the Razorpay Checkout widget.
 *
 * The checkout script is injected dynamically at runtime so we don't need
 * any npm dependency. Types are defined here because Razorpay does not ship
 * official TypeScript types for the browser widget.
 */

const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/** Callback payload returned by Razorpay when a payment succeeds. */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    /** Called when the user dismisses/closes the checkout without paying. */
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
  handler: (response: RazorpayPaymentResponse) => void;
}

interface RazorpayInstance {
  on: (event: string, callback: (response: any) => void) => void;
  open: () => void;
  close: () => void;
}

let checkoutScriptPromise: Promise<boolean> | null = null;

/**
 * Inject the Razorpay checkout script once and resolve when it is ready.
 * Resolves `false` when it can't be loaded (or on the server).
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.getElementById(
      "razorpay-checkout-js"
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
}

/**
 * Create a Razorpay checkout instance.
 * Returns `null` if the widget is not available yet — call
 * `loadRazorpayCheckoutScript()` first.
 */
export function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): RazorpayInstance | null {
  if (typeof window === "undefined" || !window.Razorpay) return null;
  return new window.Razorpay(options);
}
