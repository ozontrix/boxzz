"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  Package,
  CheckCircle,
  Zap,
  Clock,
  Info,
  Percent,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useApp } from "@/store";

export default function CartPage() {
  const { state, removeFromCart, updateCartQuantity, clearCart, showToast } = useApp();
  const { items, subtotal, shipping, gst, total } = state.cart;
  const [confirmClear, setConfirmClear] = useState(false);

  const handleQuantityChange = (productId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQty);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setConfirmClear(false);
    showToast("info", "Cart cleared", "All items have been removed from your cart.");
  };

  const itemCount = items.length;
  const hasFreeShipping = shipping === 0;
  const savingsAmount = Math.round(subtotal * 0.12);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Shopping Cart</h1>
              <p className="text-sm text-zinc-500">
                {itemCount === 0
                  ? "Your cart is waiting to be filled"
                  : `${itemCount} ${itemCount === 1 ? "item" : "items"} • ${formatPrice(subtotal)}`}
              </p>
            </div>
          </div>
          {itemCount > 0 && (
            <div className="relative">
              <button
                onClick={() => setConfirmClear(!confirmClear)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-error border border-zinc-200 hover:border-error/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
              <AnimatePresence>
                {confirmClear && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-lg p-3 z-10"
                  >
                    <p className="text-xs text-zinc-600 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      Remove all {itemCount} items?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearCart}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                      >
                        Yes, clear all
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Savings Banner */}
        {itemCount > 0 && savingsAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-5 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs sm:text-sm text-green-700">
              <span className="font-semibold">You're saving {formatPrice(savingsAmount)}</span> on this order — GST is already included in our pricing!
            </p>
          </motion.div>
        )}

        {itemCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    layout
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all hover:shadow-sm"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center text-2xl sm:text-3xl shrink-0 border border-zinc-100 overflow-hidden">
                      {item.image && !item.image.startsWith("📦") ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "📦"
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-sm sm:text-base font-medium text-zinc-800 hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-zinc-400 mt-0.5">Variant: {item.variant}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item.productId, -1, item.quantity)}
                              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-primary transition-colors active:bg-zinc-100"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                  updateCartQuantity(item.productId, val);
                                }
                              }}
                              className="w-12 h-9 text-center text-sm font-semibold text-zinc-800 border-x border-zinc-200 focus:outline-none bg-white/80 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                              min={1}
                            />
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item.productId, 1, item.quantity)}
                              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-primary transition-colors active:bg-zinc-100"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium">units</span>
                        </div>

                        <div className="text-right">
                          <p className="text-sm sm:text-base font-bold text-zinc-900 tabular-nums">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {formatPrice(item.price)}/unit
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-zinc-300 hover:text-error transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-dark transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white rounded-xl border border-zinc-100 p-4 sm:p-5 shadow-sm">
                <h2 className="text-base font-semibold text-zinc-800 mb-4">Order Summary</h2>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      Subtotal
                      <span className="text-[10px] text-zinc-400 font-normal">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-400" />
                      Shipping
                    </span>
                    {hasFreeShipping ? (
                      <span className="text-success font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        FREE
                      </span>
                    ) : (
                      <span className="font-medium">{formatPrice(shipping)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                      GST (12%)
                    </span>
                    <span className="font-medium">{formatPrice(gst)}</span>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {!hasFreeShipping && subtotal > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-2">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Add {formatPrice(2499 - subtotal)} more for <strong>FREE shipping</strong></span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((subtotal / 2499) * 100, 100)}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-amber-500 mt-1">
                      {Math.round((subtotal / 2499) * 100)}% of free shipping goal reached
                    </p>
                  </div>
                )}

                {/* Free Shipping Achieved */}
                {hasFreeShipping && subtotal > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="font-medium">FREE Shipping Applied!</span>
                    </div>
                    <p className="text-[10px] text-green-600 mt-1">
                      Your order qualifies for free delivery across India
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-zinc-900">Total</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-zinc-900">{formatPrice(total)}</span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                {state.auth.isAuthenticated ? (
                  <Link
                    href="/checkout"
                    className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 text-sm group"
                  >
                    <Zap className="w-4 h-4" />
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Login to continue</span>
                    </div>
                    <p className="text-xs text-amber-700 mb-3">
                      Please sign in or create an account to proceed with checkout.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href="/login"
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-primary text-sm font-semibold rounded-xl border border-primary hover:bg-orange-50 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Free shipping on orders above {formatPrice(2499)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>Easy returns within 7 days of delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Dispatch within 24-48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto"
            >
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400" />
            </motion.div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-800 mt-4">
              Your cart is empty
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
              Looks like you haven't added any packaging products yet. Browse our collection and start building your order.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
            >
              Browse Products
            </Link>

            {/* Quick links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/categories"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                All Categories
              </Link>
              <Link
                href="/wishlist"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Wishlist
              </Link>
              <Link
                href="/category/3-ply-boxes"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                3 Ply Boxes
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}