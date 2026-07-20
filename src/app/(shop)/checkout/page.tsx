"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Home,
  Building2,
  Star,
  Plus,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { INDIAN_STATES, PAYMENT_METHODS } from "@/lib/constants";
import type { Address, Order } from "@/types";
import { useApp } from "@/store";
import { createOrder } from "@/lib/api";

interface FormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  company: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string | undefined;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const EMPTY_FORM: FormData = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  company: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart, showToast, addOrder, addAddress, refreshUserData } = useApp();
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const { items, subtotal, shipping, gst, total } = state.cart;
  const { savedAddresses, auth } = state;
  const isAuthenticated = auth.isAuthenticated;

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const selectSavedAddress = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.line1,
      addressLine2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      company: address.company || "",
      notes: formData.notes,
    });
    setSelectedSavedAddressId(address.id);
    setErrors({});
  };

  const validateAddress = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid phone number";
    if (!formData.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state) errs.state = "Please select a state";
    if (!formData.pincode.trim()) errs.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) errs.pincode = "Enter a valid 6-digit pincode";
    return errs;
  }, [formData]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAddress();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      // If user is authenticated and no saved address was selected, save this address
      if (isAuthenticated && !selectedSavedAddressId) {
        const addressData = {
          label: "Home",
          fullName: formData.fullName,
          phone: formData.phone,
          company: formData.company || undefined,
          line1: formData.addressLine1,
          line2: formData.addressLine2 || undefined,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          isDefault: savedAddresses.length === 0,
        };
        // Save address to DB in background
        addAddress(addressData).then(() => refreshUserData());
      }
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      label: "Home",
      fullName: formData.fullName,
      phone: formData.phone,
      company: formData.company || undefined,
      line1: formData.addressLine1,
      line2: formData.addressLine2 || undefined,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      isDefault: false,
    };

    const userId = state.auth.user?.id || "guest";

    const result = await createOrder(
      {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          mrp: item.mrp || item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant,
          variantLabel: item.variantLabel,
          shippingWeight: item.shippingWeight,
        })),
        total,
        subtotal,
        shipping,
        gst,
        shippingAddress,
        paymentMethod: selectedPayment === "cod" ? "Cash on Delivery" : selectedPayment,
        notes: formData.notes || undefined,
      },
      userId
    );

    if (result.order) {
      addOrder(result.order);
      setOrderId(result.order.id);
      setOrderPlaced(true);
      clearCart();
    } else {
      showToast("error", "Order Failed", result.error || "Something went wrong. Please try again.");
    }
    setIsPlacingOrder(false);
  };

  // Empty cart state
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-800 mt-4">Your cart is empty</h2>
          <p className="text-sm text-zinc-500 mt-1">Add items to your cart before checkout</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>
          <h1 className="text-2xl font-bold text-zinc-900 mt-4">Order Confirmed!</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Thank you for your order. We'll start preparing it right away.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100"
          >
            <p className="text-xs text-zinc-500">Order ID</p>
            <p className="text-sm font-bold text-zinc-800 mt-0.5">{orderId}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-zinc-800">What happens next?</span>
            </div>
            <ol className="text-xs text-zinc-600 space-y-1.5 text-left ml-6 list-decimal">
              <li>We'll confirm your order details via phone/SMS</li>
              <li>Order will be processed within 24-48 hours</li>
              <li>You'll receive tracking details once shipped</li>
              <li>Estimated delivery: 3-7 business days</li>
            </ol>
          </motion.div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="px-6 py-2.5 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Checkout</h1>
            <p className="text-sm text-zinc-500">
              {step === "address" && "Enter your shipping address"}
              {step === "payment" && "Choose payment method"}
              {step === "confirm" && "Review your order"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { id: "address", label: "Address" },
            { id: "payment", label: "Payment" },
            { id: "confirm", label: "Confirm" },
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isComplete =
              (step === "payment" && s.id === "address") ||
              (step === "confirm" && (s.id === "address" || s.id === "payment"));

            return (
              <div key={s.id} className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : isComplete
                        ? "bg-success text-white"
                        : "bg-zinc-100 text-zinc-400"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium hidden sm:block",
                      isActive ? "text-zinc-900" : "text-zinc-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 rounded-full transition-colors",
                      isComplete ? "bg-success" : "bg-zinc-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-4">
            {step === "address" && (
              <motion.form
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleAddressSubmit}
                className="space-y-4"
              >
                {/* Saved Addresses */}
                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                    <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      Saved Addresses
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => selectSavedAddress(addr)}
                          className={cn(
                            "text-left p-3 rounded-xl border transition-all",
                            selectedSavedAddressId === addr.id
                              ? "border-primary bg-orange-50"
                              : "border-zinc-200 hover:border-zinc-300"
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {addr.label === "Home" ? <Home className="w-3 h-3 text-zinc-500" /> : <Building2 className="w-3 h-3 text-zinc-500" />}
                            <span className="text-[11px] font-medium text-zinc-600">{addr.label}</span>
                            {addr.isDefault && <Star className="w-3 h-3 text-primary fill-primary" />}
                          </div>
                          <p className="text-xs font-medium text-zinc-800 truncate">{addr.fullName}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{addr.line1}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{addr.city}, {addr.state}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address Form */}
                <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                  <h2 className="text-base font-semibold text-zinc-800 flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    {selectedSavedAddressId ? "Edit Shipping Address" : (isAuthenticated ? "New Shipping Address" : "Shipping Address")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <InputField
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(v) => { setFormData(p => ({ ...p, fullName: v })); clearError("fullName"); setSelectedSavedAddressId(null); }}
                        error={errors.fullName}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InputField
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(v) => { setFormData(p => ({ ...p, phone: v })); clearError("phone"); setSelectedSavedAddressId(null); }}
                        error={errors.phone}
                        placeholder="+91 98765 43210"
                        type="tel"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InputField
                        label="Address Line 1"
                        value={formData.addressLine1}
                        onChange={(v) => { setFormData(p => ({ ...p, addressLine1: v })); clearError("addressLine1"); setSelectedSavedAddressId(null); }}
                        error={errors.addressLine1}
                        placeholder="Street address, building, area"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-zinc-600 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => { setFormData(p => ({ ...p, addressLine2: e.target.value })); setSelectedSavedAddressId(null); }}
                        className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="Landmark, nearby location"
                      />
                    </div>
                    <div>
                      <InputField
                        label="City"
                        value={formData.city}
                        onChange={(v) => { setFormData(p => ({ ...p, city: v })); clearError("city"); setSelectedSavedAddressId(null); }}
                        error={errors.city}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">
                        State <span className="text-error">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => { setFormData(p => ({ ...p, state: e.target.value })); clearError("state"); setSelectedSavedAddressId(null); }}
                        className={cn(
                          "w-full h-10 px-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white",
                          errors.state
                            ? "border-error focus:ring-error/30 focus:border-error"
                            : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                        )}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-error mt-1"
                        >
                          {errors.state}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <InputField
                        label="Pincode"
                        value={formData.pincode}
                        onChange={(v) => { setFormData(p => ({ ...p, pincode: v })); clearError("pincode"); setSelectedSavedAddressId(null); }}
                        error={errors.pincode}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-zinc-600 mb-1">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))}
                        className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="Company name for invoice"
                      />
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Back to Cart */}
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-dark transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Cart
                </Link>
              </motion.form>
            )}

            {step === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                  <h2 className="text-base font-semibold text-zinc-800 flex items-center gap-2 mb-4">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Payment Method
                  </h2>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          selectedPayment === method.id
                            ? "border-primary bg-orange-50"
                            : "border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedPayment === method.id ? "border-primary" : "border-zinc-300"
                          )}
                        >
                          {selectedPayment === method.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2.5 h-2.5 rounded-full bg-primary"
                            />
                          )}
                        </div>
                        <span className="text-xl">{method.icon}</span>
                        <div className="text-left">
                          <span className="text-sm font-medium text-zinc-700">{method.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                  <h2 className="text-base font-semibold text-zinc-800 mb-3">Order Notes (Optional)</h2>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full h-20 px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    placeholder="Any special instructions, customization details, or delivery preferences..."
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setStep("address"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Address
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setStep("confirm"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                  >
                    Review Order
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Address Preview */}
                <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    Shipping To
                  </h2>
                  <div className="text-sm text-zinc-600 space-y-0.5">
                    <p className="font-medium text-zinc-800">{formData.fullName}</p>
                    <p>{formData.addressLine1}</p>
                    {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                    <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                    <p className="text-zinc-400">{formData.phone}</p>
                  </div>
                  <button
                    onClick={() => setStep("address")}
                    className="mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Payment Preview */}
                <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Payment Method
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.icon}</span>
                    <span className="text-sm text-zinc-700">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}</span>
                  </div>
                  <button
                    onClick={() => setStep("payment")}
                    className="mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Change Payment
                  </button>
                </div>

                {formData.notes && (
                  <div className="bg-white rounded-xl border border-zinc-100 p-4">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Order Notes</p>
                    <p className="text-sm text-zinc-700">{formData.notes}</p>
                  </div>
                )}

                {/* Place Order */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 text-base",
                    isPlacingOrder ? "opacity-80 cursor-not-allowed" : "hover:bg-primary-dark"
                  )}
                >
                  {isPlacingOrder ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      Place Order - {formatPrice(total)}
                    </>
                  )}
                </motion.button>

                <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your information is secure
                </p>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-xl border border-zinc-100 p-4 sm:p-5 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2.5 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-700 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-medium text-zinc-800 ml-2">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-success font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>GST (12%)</span>
                  <span className="font-medium">{formatPrice(gst)}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-zinc-900">Total</span>
                  <span className="text-lg font-bold text-zinc-900">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Truck className="w-4 h-4 text-primary" />
                  Free shipping above ₹2499
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── InputField Component ─────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">
        {label} <span className="text-error">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className={cn(
            "w-full h-10 px-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all",
            error
              ? "border-error focus:ring-error/30 focus:border-error"
              : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
          )}
          placeholder={placeholder}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-error mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}