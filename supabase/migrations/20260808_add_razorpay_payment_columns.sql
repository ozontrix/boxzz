-- Add Razorpay payment tracking columns to the orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS payment_details jsonb,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Speed up lookups by Razorpay order id (used during verification / reconciliation)
CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx
  ON public.orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;
