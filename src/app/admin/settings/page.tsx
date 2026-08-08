"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/store/adminStore";
import { adminGetSettings, adminUpdateSettings } from "@/lib/api/admin";

interface Setting {
  key: string;
  value: string;
  type: string;
  label: string;
  description: string;
  section: string;
}

const SECTION_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  general: { label: "Admin Account", icon: "🛡️", description: "Update your profile name, email & password" },
  contact: { label: "Contact", icon: "📞", description: "Phone, email, address & working hours" },
  shipping: { label: "Shipping & GST", icon: "🚚", description: "Free shipping threshold, standard charge & GST rate" },
};

const SECTION_ORDER = ["general", "contact", "shipping"];

export default function AdminSettingsPage() {
  const { adminState, adminLogout, checkSession } = useAdmin();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

  // ── Admin profile form ─────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Change password form ───────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const data = await adminGetSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Prefill the profile form from the current admin session
  useEffect(() => {
    if (adminState.user) {
      setName(adminState.user.name || "");
      setEmail(adminState.user.email || "");
    }
  }, [adminState.user]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    setChangedKeys((prev) => new Set(prev).add(key));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const changedSettings = settings
        .filter((s) => changedKeys.has(s.key))
        .map((s) => ({ key: s.key, value: s.value }));

      if (changedSettings.length === 0) {
        const allSettings = settings.map((s) => ({ key: s.key, value: s.value }));
        await adminUpdateSettings(allSettings);
      } else {
        await adminUpdateSettings(changedSettings);
      }

      setChangedKeys(new Set());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      setProfileMsg({ type: "error", text: "Name and email are required." });
      return;
    }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/admin/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
        return;
      }
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      await checkSession();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password." });
        return;
      }
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  const currentSettings = settings.filter((s) => s.section === activeSection);
  const isDbSection = activeSection !== "general";

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
          <h2 className="text-xl font-bold text-zinc-900">Settings</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage your site configuration — all changes are saved to the database
          </p>
        </div>
        {isDbSection && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {isDbSection && changedKeys.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{changedKeys.size} unsaved change(s). Click &quot;Save Changes&quot; to persist.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {SECTION_ORDER.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-zinc-50 last:border-0 ${
                  activeSection === section
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span>{SECTION_CONFIG[section]?.icon || "📋"}</span>
                <span>{SECTION_CONFIG[section]?.label || section}</span>
                {isDbSection && changedKeys.size > 0 && activeSection === section && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>

          {/* Admin Info */}
          <div className="mt-4 bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {adminState.user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 truncate">{adminState.user?.name || "Admin"}</p>
                <p className="text-[10px] text-zinc-400 truncate">{adminState.user?.email}</p>
              </div>
              <button
                onClick={adminLogout}
                className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
              <span className="text-2xl">{SECTION_CONFIG[activeSection]?.icon || "📋"}</span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{SECTION_CONFIG[activeSection]?.label || activeSection}</h3>
                <p className="text-xs text-zinc-400">{SECTION_CONFIG[activeSection]?.description || `${activeSection} configuration`}</p>
              </div>
            </div>


            {activeSection === "general" ? (
              <div className="space-y-8">
                {/* ── Profile ─────────────────────────────── */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-800 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Information
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">Update the name and email shown for this admin account.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Admin Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setProfileMsg(null);
                        }}
                        placeholder="Enter admin name"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Admin Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setProfileMsg(null);
                        }}
                        placeholder="Enter admin email"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {profileMsg && (
                    <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm ${
                      profileMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {profileMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handleProfileUpdate}
                    disabled={profileSaving}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {profileSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {profileSaving ? "Saving..." : "Update Profile"}
                  </button>
                </div>


                {/* ── Change Password ─────────────────────── */}
                <div className="border-t border-zinc-100 pt-8">
                  <h4 className="text-sm font-semibold text-zinc-800 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Reset Password
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">Choose a new password for this admin account. Minimum 8 characters.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordMsg(null);
                        }}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordMsg(null);
                        }}
                        placeholder="Minimum 8 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordMsg(null);
                        }}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {passwordMsg && (
                    <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {passwordMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {passwordSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {passwordSaving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>

            ) : currentSettings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-400 mb-2">No settings in this section yet.</p>
                <p className="text-xs text-zinc-300">Settings can be added via database migration.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {currentSettings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      {setting.label}
                    </label>
                    {setting.type === "textarea" ? (
                      <textarea
                        value={setting.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        rows={setting.key.includes("content") ? 8 : 3}
                        className="w-full max-w-2xl px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y transition-all font-mono text-xs"
                        placeholder={`Enter ${setting.label.toLowerCase()}...`}
                      />
                    ) : setting.type === "number" ? (
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        step={setting.key === "gst_rate" ? "0.01" : "1"}
                        className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    )}
                    <p className="text-xs text-zinc-400 mt-1">{setting.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Save button at bottom for DB sections */}
            {isDbSection && (
              <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  {currentSettings.length} settings total • {changedKeys.size} unsaved
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50`}
                >
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


