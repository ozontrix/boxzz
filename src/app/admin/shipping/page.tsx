"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  adminGetShippingSettings,
  adminCreateShippingSetting,
  adminUpdateShippingSetting,
  adminDeleteShippingSetting,
  adminGetOrders,
} from "@/lib/api/admin";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_CHARGE, GST_RATE, CONTACT_INFO } from "@/lib/constants";
import type { ShippingSetting } from "@/lib/api/admin";
import type { Order } from "@/types";

export default function AdminShippingPage() {
  const [shippingSettings, setShippingSettings] = useState<ShippingSetting[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"methods" | "zones" | "orders" | "settings">("methods");
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ShippingSetting | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    type: "standard" as string,
    charge: 0,
    free_threshold: null as number | null,
    min_days: 5,
    max_days: 7,
    is_active: true,
    regions: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [settings, ordersData] = await Promise.all([
        adminGetShippingSettings(),
        adminGetOrders(),
      ]);
      setShippingSettings(settings);
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats
  const stats = {
    totalOrders: orders.length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    pendingShipment: orders.filter((o) => ["confirmed", "in-production", "shipped", "out-for-delivery"].includes(o.status)).length,
    avgDelivery: orders.filter((o) => o.estimatedDelivery).length > 0
      ? Math.round(
          orders
            .filter((o) => o.estimatedDelivery)
            .reduce((sum, o) => {
              const days = (new Date(o.estimatedDelivery!).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / orders.filter((o) => o.estimatedDelivery).length
        )
      : 7,
  };

  const openCreate = () => {
    setEditingSetting(null);
    setFormData({
      id: `ship-${Date.now().toString().slice(-6)}`,
      label: "",
      type: "standard",
      charge: 0,
      free_threshold: null,
      min_days: 5,
      max_days: 7,
      is_active: true,
      regions: "All India",
      description: "",
    });
    setShowForm(true);
  };

  const openEdit = (setting: ShippingSetting) => {
    setEditingSetting(setting);
    setFormData({
      id: setting.id,
      label: setting.label,
      type: setting.type,
      charge: setting.charge,
      free_threshold: setting.free_threshold,
      min_days: setting.min_days,
      max_days: setting.max_days,
      is_active: setting.is_active,
      regions: (setting.regions || []).join(", "),
      description: setting.description,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        id: formData.id,
        label: formData.label,
        type: formData.type as ShippingSetting["type"],
        charge: formData.charge,
        free_threshold: formData.free_threshold,
        min_days: formData.min_days,
        max_days: formData.max_days,
        is_active: formData.is_active,
        regions: formData.regions.split(",").map((r) => r.trim()).filter(Boolean),
        description: formData.description,
      };

      if (editingSetting) {
        await adminUpdateShippingSetting(editingSetting.id, data);
      } else {
        await adminCreateShippingSetting(data);
      }
      setShowForm(false);
      setEditingSetting(null);
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteShippingSetting(id);
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleActive = async (setting: ShippingSetting) => {
    try {
      await adminUpdateShippingSetting(setting.id, { is_active: !setting.is_active });
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "methods" as const, label: "Shipping Methods", icon: "🚚", count: shippingSettings.length },
    { id: "zones" as const, label: "Coverage Zones", icon: "🌍" },
    { id: "orders" as const, label: "Shipment Orders", icon: "📦", count: stats.pendingShipment },
    { id: "settings" as const, label: "Config", icon: "⚙️" },
  ];

  const typeIcons: Record<string, string> = {
    standard: "🚚",
    express: "⚡",
    free: "🎉",
    international: "✈️",
  };

  const typeColors: Record<string, string> = {
    standard: "bg-blue-100 text-blue-700 border-blue-200",
    express: "bg-purple-100 text-purple-700 border-purple-200",
    free: "bg-emerald-100 text-emerald-700 border-emerald-200",
    international: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Shipping & Logistics</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Manage shipping methods, rates, and delivery tracking</p>
        </div>
        {activeTab === "methods" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Method
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Total Orders</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Pending Shipment</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats.pendingShipment}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Delivered</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.deliveredOrders}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Avg Delivery (days)</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{stats.avgDelivery}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "methods" | "zones" | "orders" | "settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-zinc-200 text-zinc-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shipping Methods */}
      {activeTab === "methods" && (
        <div className="space-y-4">
          {shippingSettings.length === 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-700">No shipping methods configured</p>
              <p className="text-xs text-zinc-400 mt-1">Add your first shipping method to get started</p>
              <button onClick={openCreate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Shipping Method
              </button>
            </div>
          )}

          {shippingSettings.map((setting) => (
            <div
              key={setting.id}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${typeColors[setting.type] || "bg-zinc-100"}`}>
                      {typeIcons[setting.type] || "🚚"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900">{setting.label}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          setting.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {setting.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 capitalize">{setting.type} • {setting.min_days}-{setting.max_days} business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="text-lg font-bold text-zinc-900">
                        {setting.charge === 0 ? "Free" : `₹${setting.charge.toLocaleString()}`}
                      </p>
                      {setting.free_threshold && (
                        <p className="text-[10px] text-zinc-400">Free above ₹{setting.free_threshold.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(setting)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(setting)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600"
                        title={setting.is_active ? "Deactivate" : "Activate"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={setting.is_active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(setting.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                {setting.description && (
                  <p className="text-xs text-zinc-500 mt-3 ml-16">{setting.description}</p>
                )}
                <div className="mt-3 ml-16 flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>ID: {setting.id}</span>
                  <span>•</span>
                  <span>Regions: {setting.regions.join(", ") || "All India"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coverage Zones */}
      {activeTab === "zones" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-3">🇮🇳</div>
            <p className="text-2xl font-bold text-zinc-900">29+</p>
            <p className="text-xs text-zinc-500 mt-1">States Covered</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-3">🏙️</div>
            <p className="text-2xl font-bold text-zinc-900">500+</p>
            <p className="text-xs text-zinc-500 mt-1">Cities Served</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 flex items-center justify-center text-2xl mb-3">📦</div>
            <p className="text-2xl font-bold text-zinc-900">PAN India</p>
            <p className="text-xs text-zinc-500 mt-1">Delivery Network</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 flex items-center justify-center text-2xl mb-3">🚚</div>
            <p className="text-2xl font-bold text-zinc-900">5-7</p>
            <p className="text-xs text-zinc-500 mt-1">Business Days</p>
          </div>
        </div>
      )}

      {/* Shipment Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tracking</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Est. Delivery</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned").map((order) => (
                  <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-blue-600">#{order.id.slice(-8)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-800">{order.shippingAddress.fullName || "N/A"}</p>
                      <p className="text-xs text-zinc-400">{order.shippingAddress.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-1 rounded-full font-semibold capitalize text-amber-700 bg-amber-100">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-zinc-600">{order.trackingId || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-zinc-500">
                        {order.estimatedDelivery
                          ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                          : "Not set"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned").length === 0 && (
            <div className="py-12 text-center text-zinc-400">
              <p className="text-sm">No pending shipments</p>
            </div>
          )}
        </div>
      )}

      {/* Config Settings */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 mb-4">Shipping Configuration (from constants)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Free Shipping Threshold</p>
                  <p className="text-lg font-bold text-zinc-900">₹{FREE_SHIPPING_THRESHOLD.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Orders above this get free shipping</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Standard Shipping Charge</p>
                  <p className="text-lg font-bold text-zinc-900">₹{STANDARD_SHIPPING_CHARGE}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Default shipping rate</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">GST Rate</p>
                  <p className="text-lg font-bold text-zinc-900">{(GST_RATE * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Applied to subtotal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Phone</p>
                  <p className="text-sm font-medium text-zinc-800">{CONTACT_INFO.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-zinc-800">{CONTACT_INFO.email}</p>
                </div>
                <div className="sm:col-span-2 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Address</p>
                  <p className="text-sm font-medium text-zinc-800">{CONTACT_INFO.address}</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400 mb-1">Working Hours</p>
                  <p className="text-sm font-medium text-zinc-800">{CONTACT_INFO.workingHours}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700">
                💡 These values are defined in <code className="bg-blue-100 px-1.5 py-0.5 rounded">src/lib/constants/index.ts</code>.
                Edit the file to modify them permanently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">
                  {editingSetting ? "Edit Shipping Method" : "Add Shipping Method"}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Method Label *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Standard Shipping"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="free">Free</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                  <div className="flex items-center h-10 px-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-700">{formData.is_active ? "Active" : "Inactive"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Charge (₹)</label>
                  <input
                    type="number"
                    value={formData.charge}
                    onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Free Above (₹)</label>
                  <input
                    type="number"
                    value={formData.free_threshold || ""}
                    onChange={(e) => setFormData({ ...formData, free_threshold: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    min={0}
                    placeholder="Leave empty if N/A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Min Days</label>
                  <input
                    type="number"
                    value={formData.min_days}
                    onChange={(e) => setFormData({ ...formData, min_days: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    min={1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Max Days</label>
                  <input
                    type="number"
                    value={formData.max_days}
                    onChange={(e) => setFormData({ ...formData, max_days: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Regions (comma separated)</label>
                <input
                  type="text"
                  value={formData.regions}
                  onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
                  placeholder="All India, Delhi NCR, Mumbai, Bangalore"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this shipping method"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingSetting ? "Update" : "Create Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Shipping Method</h3>
              <p className="text-sm text-zinc-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}