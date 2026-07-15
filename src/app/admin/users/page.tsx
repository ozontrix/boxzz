"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { adminGetUsers } from "@/lib/api/admin";

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

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
          <h2 className="text-xl font-bold text-zinc-900">Users</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{users.length} registered user(s)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Users</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Orders</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{users.reduce((s, u) => s + u.orderCount, 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Revenue</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            ₹{users.reduce((s, u) => s + u.totalSpent, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Spent</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Addresses</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id || idx} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{user.name || "Unknown"}</p>
                        <p className="text-xs text-zinc-400">ID: {(user.id || "").slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-600">{user.phone || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-zinc-800">{user.orderCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-zinc-800">₹{user.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-zinc-800">{user.addresses?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewUser(user)}
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
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-zinc-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{selectedUser.name || "Unknown User"}</h3>
                    <p className="text-sm text-zinc-500">ID: {(selectedUser.id || "").slice(0, 8)}...</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-zinc-50">
                  <p className="text-xs text-zinc-400 mb-1">Phone</p>
                  <p className="font-medium text-zinc-800">{selectedUser.phone || "N/A"}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50">
                  <p className="text-xs text-zinc-400 mb-1">Total Orders</p>
                  <p className="font-medium text-zinc-800">{selectedUser.orderCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50">
                  <p className="text-xs text-zinc-400 mb-1">Total Spent</p>
                  <p className="font-medium text-zinc-800">₹{selectedUser.totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50">
                  <p className="text-xs text-zinc-400 mb-1">Saved Addresses</p>
                  <p className="font-medium text-zinc-800">{selectedUser.addresses?.length || 0}</p>
                </div>
              </div>

              {/* Saved Addresses */}
              {selectedUser.addresses?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Saved Addresses</h4>
                  <div className="space-y-2">
                    {selectedUser.addresses.map((addr: any) => (
                      <div key={addr.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-800">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}