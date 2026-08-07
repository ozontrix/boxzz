// ─── Razorpay Checkout global declarations ──────────────────────
// The Razorpay Checkout widget is loaded at runtime from
// https://checkout.razorpay.com/v1/checkout.js and exposes `window.Razorpay`.

export {};

declare global {
  interface Window {
    Razorpay?: any;
  }
}
