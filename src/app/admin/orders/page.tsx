"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdateOrderTracking,
  adminUpdateOrderEstimatedDelivery,
  adminDeleteOrder,
} from "@/lib/api/admin";
import type { Order, OrderStatus } from "@/types";

const statusFlow: OrderStatus[] = [
  "confirmed",
  "in-production",
  "shipped",
  "out-for-delivery",
  "delivered",
];

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  "in-production": "In Production",
  shipped: "Shipped",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  "in-production": "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  "out-for-delivery": "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  returned: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusDot: Record<string, string> = {
  confirmed: "bg-blue-500",
  "in-production": "bg-amber-500",
  shipped: "bg-purple-500",
  "out-for-delivery": "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
  returned: "bg-rose-500",
};

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />
        {STATUS_LABELS[status]}
      </div>
    );
  }

  const currentStep = statusFlow.indexOf(status) + 1;

  return (
    <div className="flex items-center w-full">
      {statusFlow.map((s, idx) => {
        const stepNum = idx + 1;
        const isComplete = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isComplete
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-zinc-200 text-zinc-400"
                } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{stepNum}</span>
                )}
              </div>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap text-[10px] font-medium text-zinc-500">
                {STATUS_LABELS[s].split(" ")[0]}
              </span>
            </div>
            {idx < statusFlow.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${currentStep > stepNum ? "bg-emerald-500" : "bg-zinc-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [deliveryDateInput, setDeliveryDateInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await adminGetOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingId || "");
    setDeliveryDateInput(order.estimatedDelivery?.split("T")[0] || "");
    setCopiedId(false);
    setShowDetailModal(true);
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!window.confirm(`Delete order ${order.id}? This will permanently remove the order and its items.`)) return;
    setDeletingId(order.id);
    try {
      await adminDeleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedOrder && selectedOrder.id === order.id) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
    } catch (err: any) {
      alert("Error deleting order: " + (err.message || "Unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(true);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      await adminUpdateOrderTracking(selectedOrder.id, trackingInput);
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, trackingId: trackingInput } : o)));
      setSelectedOrder({ ...selectedOrder, trackingId: trackingInput });
    } catch (err: any) {
      alert("Error saving tracking: " + err.message);
    } finally {
      setSavingTracking(false);
    }
  };

  const handleSaveDeliveryDate = async () => {
    if (!selectedOrder) return;
    setSavingDelivery(true);
    try {
      const iso = new Date(deliveryDateInput).toISOString();
      await adminUpdateOrderEstimatedDelivery(selectedOrder.id, iso);
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, estimatedDelivery: iso } : o))
      );
      setSelectedOrder({ ...selectedOrder, estimatedDelivery: iso });
    } catch (err: any) {
      alert("Error saving delivery date: " + err.message);
    } finally {
      setSavingDelivery(false);
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "delivered" || current === "cancelled" || current === "returned") return null;
    const idx = statusFlow.indexOf(current);
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
  };

  const copyOrderId = async () => {
    if (!selectedOrder) return;
    try {
      await navigator.clipboard.writeText(selectedOrder.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const itemsHtml = selectedOrder.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;">${item.name}${item.variant ? `<br/><span style="color:#9ca3af;font-size:11px;">Variant: ${item.variant}</span>` : ""}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;text-align:right;">₹${item.price.toLocaleString()}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;text-align:right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedOrder.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .muted { color: #6b7280; font-size: 12px; }
            .section { margin-top: 24px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 12px; text-transform: uppercase; color: #374151; background: #f9fafb; padding: 8px; border: 1px solid #e5e7eb; }
            .total-row td { font-weight: 700; font-size: 14px; }
            .address { font-size: 13px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <p class="muted">${selectedOrder.id} • ${new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>

          <div class="section">
            <p class="section-title">Billing / Shipping Address</p>
            <div class="address">
              <strong>${selectedOrder.shippingAddress.fullName || "N/A"}</strong><br/>
              ${selectedOrder.shippingAddress.phone || ""}<br/>
              ${selectedOrder.shippingAddress.line1 || ""}${selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ""}<br/>
              ${selectedOrder.shippingAddress.city || ""}, ${selectedOrder.shippingAddress.state || ""} - ${selectedOrder.shippingAddress.pincode || ""}
            </div>
          </div>

          <div class="section">
            <p class="section-title">Items</p>
            <table>
              <thead>
                <tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <table>
              <tr><td style="padding:4px 8px;font-size:13px;">Subtotal</td><td style="padding:4px 8px;font-size:13px;text-align:right;">₹${selectedOrder.subtotal.toLocaleString()}</td></tr>
              <tr><td style="padding:4px 8px;font-size:13px;">Shipping</td><td style="padding:4px 8px;font-size:13px;text-align:right;">${selectedOrder.shipping === 0 ? "FREE" : `₹${selectedOrder.shipping.toLocaleString()}`}</td></tr>
              <tr><td style="padding:4px 8px;font-size:13px;">GST</td><td style="padding:4px 8px;font-size:13px;text-align:right;">₹${selectedOrder.gst.toLocaleString()}</td></tr>
              <tr class="total-row"><td style="padding:8px;font-size:14px;border-top:2px solid #111827;">Grand Total</td><td style="padding:8px;font-size:14px;border-top:2px solid #111827;text-align:right;">₹${selectedOrder.total.toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="section">
            <p class="muted">Payment Method: ${selectedOrder.paymentMethod}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => !["delivered", "cancelled", "returned"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
  }), [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Orders</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{stats.total} total orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Total Orders</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Delivered</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Revenue</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">₹{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Status</option>
            {statusFlow.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Items</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-blue-600">#{order.id.slice(-8)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-zinc-800">{order.shippingAddress.fullName || "N/A"}</p>
                    <p className="text-xs text-zinc-400">{order.shippingAddress.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-600">{order.items.length} item(s)</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-zinc-800">₹{order.total.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[order.status] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status] || "bg-zinc-400"}`} />
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        disabled={deletingId === order.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete order"
                      >
                        {deletingId === order.id ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-zinc-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">No orders found</p>
            <p className="text-xs text-zinc-300 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowDetailModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* ─── Sticky Header ─── */}
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-zinc-900">Order #{selectedOrder.id.slice(-8)}</h3>
                    <button
                      onClick={copyOrderId}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                      title="Copy full order ID"
                    >
                      {copiedId ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      )}
                    </button>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[selectedOrder.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[selectedOrder.status]}`} />
                      {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">{selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
                    title="Print invoice"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Scrollable Body ─── */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Status Timeline */}
              <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Order Progress</p>
                <OrderTimeline status={selectedOrder.status} />

                {/* Status Actions */}
                <div className="mt-5 pt-4 border-t border-zinc-200/70 flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-1">Update:</p>
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      disabled={statusUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {statusUpdating ? (
                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                      Move to {STATUS_LABELS[getNextStatus(selectedOrder.status)!]}
                    </button>
                  )}

                  {/* Jump to any status (quick CRUD) */}
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                    disabled={statusUpdating}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    title="Jump to any status"
                  >
                    {statusFlow.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>

                  {(selectedOrder.status === "confirmed" || selectedOrder.status === "in-production" || selectedOrder.status === "shipped" || selectedOrder.status === "out-for-delivery") && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Cancel order ${selectedOrder.id}?`)) {
                          handleStatusUpdate(selectedOrder.id, "cancelled");
                        }
                      }}
                      disabled={statusUpdating}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Customer</p>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-700">
                    <p className="font-semibold text-zinc-900">{selectedOrder.shippingAddress.fullName || "N/A"}</p>
                    <p className="text-zinc-500">{selectedOrder.shippingAddress.phone || "—"}</p>
                    {selectedOrder.paymentMethod && (
                      <p className="text-xs text-zinc-400 mt-1">
                        Payment: <span className="text-zinc-600 font-medium">{selectedOrder.paymentMethod}</span>
                      </p>
                    )}
                    {selectedOrder.notes && (
                      <p className="text-xs mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
                        <span className="font-semibold">Note:</span> {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Shipping Address</p>
                  </div>
                  <div className="space-y-0.5 text-sm text-zinc-600">
                    <p>{selectedOrder.shippingAddress.line1 || "—"}</p>
                    {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                    <p>{selectedOrder.shippingAddress.city || ""}{selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.state ? ", " : ""}{selectedOrder.shippingAddress.state || ""} - {selectedOrder.shippingAddress.pincode || ""}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Placed: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Items ({selectedOrder.items.length})</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div className="w-12 h-12 rounded-lg bg-white border border-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                        {item.image && !item.image.startsWith("📦") ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 line-clamp-1">{item.name}</p>
                        {item.variant && <p className="text-[11px] text-zinc-400">Variant: {item.variant}</p>}
                        <p className="text-[11px] text-zinc-400">₹{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-zinc-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Shipping</span>
                    <span className="font-medium">{selectedOrder.shipping === 0 ? "FREE" : `₹${selectedOrder.shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>GST</span>
                    <span className="font-medium">₹{selectedOrder.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-900">Grand Total</span>
                    <span className="text-lg font-bold text-zinc-900">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fulfillment: Tracking + Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Tracking ID</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking ID"
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleSaveTracking}
                      disabled={savingTracking}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {savingTracking ? "..." : "Save"}
                    </button>
                  </div>
                  {selectedOrder.trackingId ? (
                    <p className="text-xs font-mono text-teal-700 bg-teal-50 rounded-lg p-2 mt-2">Current: {selectedOrder.trackingId}</p>
                  ) : (
                    <p className="text-[11px] text-zinc-400 mt-2">No tracking ID yet — will be visible to customer once shipped.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Est. Delivery Date</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={deliveryDateInput}
                      onChange={(e) => setDeliveryDateInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleSaveDeliveryDate}
                      disabled={savingDelivery}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {savingDelivery ? "..." : "Save"}
                    </button>
                  </div>
                  {selectedOrder.estimatedDelivery ? (
                    <p className="text-xs font-medium text-amber-700 bg-amber-50 rounded-lg p-2 mt-2">
                      Current: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-400 mt-2">No estimated delivery date set.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}