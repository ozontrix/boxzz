"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminGetDashboardStats } from "@/lib/api/admin";
import type { Order } from "@/types";

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple" | "rose";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} border flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Order Row ─────────────────────────────────────────
function RecentOrderRow({ order }: { order: any }) {
  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    "in-production": "bg-amber-100 text-amber-700",
    shipped: "bg-purple-100 text-purple-700",
    "out-for-delivery": "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-sm font-medium text-zinc-600">
          #{order.id?.slice(-4) || "N/A"}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-800">₹{order.total?.toLocaleString() || "0"}</p>
          <p className="text-xs text-zinc-400">{order.status || "Unknown"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>
          {order.status || "unknown"}
        </span>
        <span className="text-xs text-zinc-400">
          {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Quick Action Button ───────────────────────────────────────
function QuickAction({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-600">
        {icon}
      </div>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <svg className="w-4 h-4 ml-auto text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ─── Icon Components ───────────────────────────────────────────
function IconDollar() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function IconCartStat() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
function IconTrending() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IconList() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}
function IconTruckQuick() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalCategories: number;
    recentOrders: any[];
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminGetDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <h2 className="text-xl font-bold">Welcome back, Admin! 👋</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-md">
            Here's what's happening with your store today. Manage products, orders, and everything from one place.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={<IconDollar />}
          color="green"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders || 0}
          icon={<IconCartStat />}
          color="blue"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={<IconBox />}
          color="amber"
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts || 0}
          icon={<IconTrending />}
          color="purple"
        />
        <StatCard
          label="Categories"
          value={stats.totalCategories || 0}
          icon={<IconTag />}
          color="rose"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="px-6 py-2">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order: any, idx: number) => (
                <RecentOrderRow key={order.id || idx} order={order} />
              ))
            ) : (
              <div className="py-8 text-center text-zinc-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-sm">No orders yet</p>
                <p className="text-xs text-zinc-300 mt-1">Orders placed by customers will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction label="Add New Product" href="/admin/products" icon={<IconPlus />} />
              <QuickAction label="Manage Categories" href="/admin/categories" icon={<IconList />} />
              <QuickAction label="View Orders" href="/admin/orders" icon={<IconCartStat />} />
              <QuickAction label="Manage Banners" href="/admin/banners" icon={<IconTag />} />
              <QuickAction label="Shipping Settings" href="/admin/shipping" icon={<IconTruckQuick />} />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Store Status</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Admin Panel</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Supabase DB</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Products</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{stats.totalProducts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}