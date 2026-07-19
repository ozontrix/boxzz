"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  Building2,
  Phone,
  Mail,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  AlertCircle,
  Hash,
  Eye,
  EyeOff,
  Shield,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { INDIAN_STATES, CONTACT_INFO } from "@/lib/constants";
import { useApp } from "@/store";
import type { Address, Order, OrderStatus } from "@/types";
import { updatePassword, sendPasswordResetEmail, updateProfile } from "@/lib/api/auth";

type Tab = "orders" | "addresses" | "profile";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  "confirmed": { label: "Confirmed", color: "text-primary bg-orange-50 border-primary/20", icon: <CheckCircle className="w-4 h-4" />, step: 1 },
  "in-production": { label: "In Production", color: "text-secondary bg-blue-50 border-secondary/20", icon: <Clock className="w-4 h-4" />, step: 2 },
  "shipped": { label: "Shipped", color: "text-accent bg-teal-50 border-accent/20", icon: <Package className="w-4 h-4" />, step: 3 },
  "out-for-delivery": { label: "Out for Delivery", color: "text-primary bg-orange-50 border-primary/20", icon: <Truck className="w-4 h-4" />, step: 4 },
  "delivered": { label: "Delivered", color: "text-success bg-green-50 border-success/20", icon: <CheckCircle className="w-4 h-4" />, step: 5 },
  "cancelled": { label: "Cancelled", color: "text-error bg-red-50 border-error/20", icon: <XCircle className="w-4 h-4" />, step: -1 },
  "returned": { label: "Returned", color: "text-warning bg-amber-50 border-warning/20", icon: <RotateCcw className="w-4 h-4" />, step: -2 },
};

const ORDER_TIMELINE: OrderStatus[] = ["confirmed", "in-production", "shipped", "out-for-delivery", "delivered"];

interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_ADDRESS_FORM: AddressFormData = {
  label: "Home",
  fullName: "",
  phone: "",
  company: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "returned") {
    const config = STATUS_CONFIG[status];
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
          {config.icon}
        </div>
        <span className="text-xs font-medium text-zinc-600">{config.label}</span>
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[status]?.step || 0;

  return (
    <div className="flex items-center gap-1">
      {ORDER_TIMELINE.map((s, idx) => {
        const stepNum = idx + 1;
        const isComplete = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
              isComplete ? "bg-success text-white" : "bg-zinc-100 text-zinc-400",
              isCurrent && "ring-2 ring-success/30"
            )}>
              {isComplete ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              )}
            </div>
            {idx < ORDER_TIMELINE.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full",
                currentStep > stepNum ? "bg-success" : "bg-zinc-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[order.status];
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const isTrackable = order.status === "shipped" || order.status === "out-for-delivery";

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-zinc-100 overflow-hidden hover:shadow-sm transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        {/* Order Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-zinc-900 font-mono">{order.id}</p>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                config.color
              )}>
                {config.icon}
                {config.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {formatDate(order.createdAt)} • {itemsCount} item{itemsCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-zinc-900">{formatPrice(order.total)}</p>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto mt-0.5" />
            </motion.div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-3">
          <OrderTimeline status={order.status} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="p-4 space-y-3">
              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-base">{item.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-700 truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <span className="text-xs font-medium text-zinc-700">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Shipping To</p>
                <div className="text-xs text-zinc-600 space-y-0.5 bg-zinc-50 rounded-lg p-2.5">
                  <p className="font-medium text-zinc-700">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="text-zinc-400">{order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Tracking & Payment */}
              <div className="grid grid-cols-2 gap-2">
                {order.trackingId && (
                  <div className="bg-zinc-50 rounded-lg p-2.5">
                    <p className="text-[10px] font-medium text-zinc-400 uppercase">Tracking</p>
                    <p className="text-xs font-mono font-medium text-zinc-700 mt-0.5">{order.trackingId}</p>
                  </div>
                )}
                <div className="bg-zinc-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase">Payment</p>
                  <p className="text-xs font-medium text-zinc-700 mt-0.5">{order.paymentMethod}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="bg-zinc-50 rounded-lg p-2.5">
                    <p className="text-[10px] font-medium text-zinc-400 uppercase">Est. Delivery</p>
                    <p className="text-xs font-medium text-zinc-700 mt-0.5">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
                <div className="bg-zinc-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase">Total</p>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Track Button */}
              {isTrackable && order.trackingId && (
                <motion.a
                  href={`https://www.google.com/search?q=track+shipment+${order.trackingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Track Shipment ({order.trackingId})
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}

              {/* View Details with status */}
              {!isTrackable && order.status !== "delivered" && order.status !== "cancelled" && order.status !== "returned" && (
                <div className="bg-orange-50 rounded-lg p-3 text-xs text-zinc-600">
                  <p className="font-medium text-zinc-700 mb-1">Order Status: {STATUS_CONFIG[order.status]?.label}</p>
                  <p>We are processing your order. You'll receive tracking details once it's shipped.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl border p-4 relative",
        address.isDefault ? "border-primary/30 bg-orange-50/30" : "border-zinc-100"
      )}
    >
      {/* Default Badge */}
      {address.isDefault && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-semibold text-primary">
          <Star className="w-3 h-3 fill-primary" />
          Default
        </div>
      )}

      <div className="flex items-start gap-2.5 mb-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          address.isDefault ? "bg-primary/10" : "bg-zinc-100"
        )}>
          {address.label === "Home" ? (
            <Home className="w-4 h-4 text-zinc-600" />
          ) : address.label === "Office" || address.label === "Work" ? (
            <Building2 className="w-4 h-4 text-zinc-600" />
          ) : (
            <MapPin className="w-4 h-4 text-zinc-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">{address.label}</span>
          </div>
          <div className="mt-1 text-xs text-zinc-600 space-y-0.5">
            <p className="font-medium text-zinc-700">{address.fullName}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p className="text-zinc-400">{address.phone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-2 pt-2.5 border-t border-zinc-100">
        {!address.isDefault && (
          <button
            onClick={onSetDefault}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-primary hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Star className="w-3 h-3" />
            Set Default
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-error hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default function AccountPage() {
  const { state, dispatch, logout, showToast, addAddress, updateAddress, removeAddress, setDefaultAddress, refreshUserData } = useApp();
  const { isAuthenticated, user } = state.auth;
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Profile editing state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const orders = state.orders;
  const savedAddresses = state.savedAddresses;

  // Sync profile fields when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Refresh data on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  // ─── Address Form Handlers ───
  const openAddAddress = () => {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setEditingAddressId(null);
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const openEditAddress = (address: Address) => {
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      company: address.company || "",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setEditingAddressId(address.id);
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const validateAddressForm = (): boolean => {
    const errs: Partial<Record<keyof AddressFormData, string>> = {};
    if (!addressForm.label.trim()) errs.label = "Required";
    if (!addressForm.fullName.trim()) errs.fullName = "Required";
    if (!addressForm.phone.trim()) errs.phone = "Required";
    else if (!/^\+?[\d\s-]{10,}$/.test(addressForm.phone.replace(/\s/g, "")))
      errs.phone = "Invalid phone";
    if (!addressForm.line1.trim()) errs.line1 = "Required";
    if (!addressForm.city.trim()) errs.city = "Required";
    if (!addressForm.state) errs.state = "Select state";
    if (!addressForm.pincode.trim()) errs.pincode = "Required";
    else if (!/^\d{6}$/.test(addressForm.pincode)) errs.pincode = "6-digit pincode";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    setAddressSubmitting(true);

    const addressData = {
      label: addressForm.label,
      fullName: addressForm.fullName,
      phone: addressForm.phone,
      company: addressForm.company || undefined,
      line1: addressForm.line1,
      line2: addressForm.line2 || undefined,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      isDefault: editingAddressId
        ? savedAddresses.find(a => a.id === editingAddressId)?.isDefault || false
        : savedAddresses.length === 0,
    };

    if (editingAddressId) {
      await updateAddress({ ...addressData, id: editingAddressId });
    } else {
      await addAddress(addressData);
    }

    setAddressSubmitting(false);
    setShowAddressForm(false);
    setEditingAddressId(null);
    // Refresh to get latest from DB
    refreshUserData();
  };

  const handleDeleteAddress = async (id: string) => {
    await removeAddress(id);
    refreshUserData();
  };

  // ─── Profile Handlers ───
  const handleProfileUpdate = async () => {
    if (!profileName.trim()) {
      showToast("error", "Validation Error", "Name cannot be empty.");
      return;
    }
    setProfileSubmitting(true);
    const result = await updateProfile({
      name: profileName.trim(),
      phone: profilePhone.trim() || undefined,
    });
    setProfileSubmitting(false);
    if (result.user) {
      dispatch({ type: "AUTH_UPDATE_USER", payload: result.user });
      showToast("success", "Profile Updated", "Your profile has been updated successfully.");
      setShowProfileForm(false);
    } else {
      showToast("error", "Update Failed", result.error || "Could not update profile.");
    }
  };

  // ─── Password Handlers ───
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      showToast("error", "Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords Don't Match", "New password and confirm password must match.");
      return;
    }
    setPasswordSubmitting(true);
    const result = await updatePassword(newPassword);
    setPasswordSubmitting(false);
    if (!result.error) {
      showToast("success", "Password Changed", "Your password has been updated successfully.");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showToast("error", "Password Change Failed", result.error);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetEmailSent(false);
    const result = await sendPasswordResetEmail(user.email);
    if (!result.error) {
      setResetEmailSent(true);
      showToast("success", "Reset Email Sent", `Password reset link sent to ${user.email}`);
    } else {
      showToast("error", "Failed to Send", result.error);
    }
  };

  // ─── Stats ───
  const orderCount = orders.length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const addressCount = savedAddresses.length;

  const tabs = [
    { id: "orders" as Tab, label: "My Orders", icon: Package, count: orderCount },
    { id: "addresses" as Tab, label: "Saved Addresses", icon: MapPin, count: addressCount },
    { id: "profile" as Tab, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50/30 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">My Account</h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              {isAuthenticated && user?.name ? `Welcome back, ${user.name}` : "Manage your orders & address"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-zinc-100 p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── ORDERS TAB ─── */}
        {activeTab === "orders" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Total Orders", value: orderCount, icon: Package },
                { label: "Delivered", value: deliveredCount, icon: CheckCircle },
                { label: "In Progress", value: orderCount - deliveredCount, icon: Truck },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-xl border border-zinc-100 p-3 sm:p-4 text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto" />
                    <p className="text-lg sm:text-xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-2.5">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-14 bg-white rounded-xl border border-zinc-100">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7 text-zinc-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 mt-3">No orders yet</h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Your order history will appear here once you place your first order.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ─── ADDRESSES TAB ─── */}
        {activeTab === "addresses" && !showAddressForm && (
          <div>
            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500">
                {addressCount > 0 ? `${addressCount} saved address${addressCount > 1 ? "es" : ""}` : "No addresses saved"}
              </p>
              <button
                onClick={openAddAddress}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            </div>

            {/* Addresses Grid */}
            {addressCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => openEditAddress(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => setDefaultAddress(address.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-14 bg-white rounded-xl border border-zinc-100">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
                  <MapPin className="w-7 h-7 text-zinc-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 mt-3">No addresses saved</h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Add your first address for faster checkout.
                </p>
                <button
                  onClick={openAddAddress}
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── ADDRESS FORM ─── */}
        {activeTab === "addresses" && showAddressForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-800">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                  className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-3">
                {/* Label */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Address Label <span className="text-error">*</span></label>
                  <div className="flex gap-2">
                    {["Home", "Office", "Other"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setAddressForm(prev => ({ ...prev, label }))}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                          addressForm.label === label
                            ? "border-primary bg-orange-50 text-primary"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AFInput label="Full Name" value={addressForm.fullName} onChange={v => setAddressForm(p => ({ ...p, fullName: v }))} error={addressErrors.fullName} />
                  <AFInput label="Phone" value={addressForm.phone} onChange={v => setAddressForm(p => ({ ...p, phone: v }))} error={addressErrors.phone} />
                  <div className="sm:col-span-2">
                    <AFInput label="Company (Optional)" value={addressForm.company} onChange={v => setAddressForm(p => ({ ...p, company: v }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <AFInput label="Address Line 1" value={addressForm.line1} onChange={v => setAddressForm(p => ({ ...p, line1: v }))} error={addressErrors.line1} />
                  </div>
                  <div className="sm:col-span-2">
                    <AFInput label="Address Line 2 (Optional)" value={addressForm.line2} onChange={v => setAddressForm(p => ({ ...p, line2: v }))} />
                  </div>
                  <AFInput label="City" value={addressForm.city} onChange={v => setAddressForm(p => ({ ...p, city: v }))} error={addressErrors.city} />
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">State <span className="text-error">*</span></label>
                    <select
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                      className={cn(
                        "w-full h-10 px-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white",
                        addressErrors.state
                          ? "border-error focus:ring-error/30"
                          : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                      )}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {addressErrors.state && <p className="text-xs text-error mt-1">{addressErrors.state}</p>}
                  </div>
                  <AFInput label="Pincode" value={addressForm.pincode} onChange={v => setAddressForm(p => ({ ...p, pincode: v }))} error={addressErrors.pincode} maxLength={6} />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                    className="px-4 py-2 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:opacity-70"
                  >
                    {addressSubmitting ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ─── PROFILE TAB ─── */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            {/* User Info Card */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
                  {isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  {isAuthenticated && user ? (
                    <>
                      <h2 className="text-sm font-bold text-zinc-900">{user.name}</h2>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-sm font-bold text-zinc-900">Guest User</h2>
                      <p className="text-xs text-zinc-500">Sign in to access full features</p>
                    </>
                  )}
                </div>
                {isAuthenticated && !showProfileForm && (
                  <button
                    onClick={() => setShowProfileForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {/* Profile Edit Form */}
              <AnimatePresence>
                {showProfileForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-3 border-t border-zinc-100">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowProfileForm(false); setProfileName(user?.name || ""); setProfilePhone(user?.phone || ""); }}
                          className="px-4 py-2 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileUpdate}
                          disabled={profileSubmitting}
                          className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70"
                        >
                          {profileSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showProfileForm && isAuthenticated && user && (
                <div className="space-y-2 text-xs text-zinc-600">
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {user.phone}
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div className="flex gap-2 mt-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Password / Security */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl border border-zinc-100 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-zinc-800">Security</h3>
                  </div>
                  {!showPasswordForm && (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showPasswordForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-3 border-t border-zinc-100">
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full h-10 px-3 pr-10 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="Min 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full h-10 px-3 pr-10 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="Re-enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); }}
                            className="px-4 py-2 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePasswordChange}
                            disabled={passwordSubmitting}
                            className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70"
                          >
                            {passwordSubmitting ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot Password via Email */}
                {!showPasswordForm && (
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <button
                      onClick={handleSendResetEmail}
                      disabled={resetEmailSent}
                      className="text-xs font-medium text-primary hover:text-primary-dark transition-colors disabled:text-zinc-400"
                    >
                      {resetEmailSent ? "✓ Reset link sent!" : "Send password reset email instead"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-zinc-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-zinc-500">Orders</span>
                </div>
                <p className="text-lg font-bold text-zinc-900">{orderCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-zinc-500">Addresses</span>
                </div>
                <p className="text-lg font-bold text-zinc-900">{addressCount}</p>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-zinc-800">Need Bulk Pricing?</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Get manufacturer-direct pricing, GST invoices, and dedicated account management for orders above ₹10,000.
              </p>
              <button
                onClick={() => showToast("info", "Business Account", "Contact us at " + CONTACT_INFO.phone)}
                className="mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Talk to our team &rarr;
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4">
              <div className="space-y-2 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {CONTACT_INFO.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {CONTACT_INFO.email}
                </div>
              </div>
            </div>

            {/* Sign Out */}
            {isAuthenticated && (
              <button
                onClick={() => { logout(); setActiveTab("profile"); }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-zinc-100 text-zinc-600 hover:text-error hover:border-error/30 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Address Form Input ───
function AFInput({
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
        {label} {label.includes("Optional") ? "" : <span className="text-error">*</span>}
      </label>
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
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}