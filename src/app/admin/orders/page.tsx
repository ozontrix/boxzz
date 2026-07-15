"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdateOrderTracking,
  adminUpdateOrderEstimatedDelivery,
} from "@/lib/api/admin";
import type { Order, OrderStatus } from "@/types";

const statusFlow: OrderStatus[] = [
  "confirmed",
  "in-production",
  "shipped",
  "out-for-delivery",
  "delivered",
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  "in-production": "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  "out-for-delivery": "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  returned: "bg-rose-100 text-rose-700 border-rose-200",
};

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
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
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    try {
      await adminUpdateOrderTracking(selectedOrder.id, trackingInput);
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, trackingId: trackingInput } : o)));
      setSelectedOrder({ ...selectedOrder, trackingId: trackingInput });
    } catch (err: any) {
      alert("Error saving tracking: " + err.message);
    }
  };

  const handleSaveDeliveryDate = async () => {
    if (!selectedOrder) return;
    try {
      const iso = new Date(deliveryDateInput).toISOString();
      await adminUpdateOrderEstimatedDelivery(selectedOrder.id, iso);
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, estimatedDelivery: iso } : o))
      );
      setSelectedOrder({ ...selectedOrder, estimatedDelivery: iso });
    } catch (err: any) {
      alert("Error saving delivery date: " + err.message);
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "delivered" || current === "cancelled" || current === "returned") return null;
    const idx = statusFlow.indexOf(current);
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
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
            <option value="confirmed">Confirmed</option>
            <option value="in-production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
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
                <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
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
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[order.status] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View
                    </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Order #{selectedOrder.id.slice(-8)}</h3>
                  <p className="text-xs text-zinc-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">Order Status</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                  {getNextStatus(selectedOrder.status) && (
                    <>
                      <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Move to {getNextStatus(selectedOrder.status)?.replace(/-/g, " ")}
                      </button>
                    </>
                  )}
                  {(selectedOrder.status === "confirmed" || selectedOrder.status === "in-production" || selectedOrder.status === "shipped" || selectedOrder.status === "out-for-delivery") && (
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Tracking & Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Tracking ID</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking ID"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleSaveTracking}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  {selectedOrder.trackingId && (
                    <p className="text-sm font-mono text-zinc-700 mt-2">Current: {selectedOrder.trackingId}</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Est. Delivery Date</p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={deliveryDateInput}
                      onChange={(e) => setDeliveryDateInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleSaveDeliveryDate}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  {selectedOrder.estimatedDelivery && (
                    <p className="text-sm text-zinc-700 mt-2">
                      Current: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-700 space-y-1">
                  <p className="font-semibold">{selectedOrder.shippingAddress.fullName || "N/A"}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Order Items ({selectedOrder.items.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.image}</span>
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{item.name}</p>
                          {item.variant && <p className="text-xs text-zinc-400">Variant: {item.variant}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-800">₹{item.price.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-zinc-800">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Order Total</span>
                <span className="text-xl font-bold text-blue-800">₹{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}