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

const SECTION_CONFIG: Record<string, { label: string; icon: string }> = {
  general: { label: "General", icon: "⚙️" },
  contact: { label: "Contact", icon: "📞" },
};

export default function AdminSettingsPage() {
  const { adminState, adminLogout } = useAdmin();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

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

  const sections = [...new Set(settings.map((s) => s.section))];

  const getValue = (key: string) => settings.find((s) => s.key === key)?.value || "";

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
        // Save all
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

  const currentSettings = settings.filter((s) => s.section === activeSection);

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
      </div>

      {changedKeys.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{changedKeys.size} unsaved change(s). Click "Save Changes" to persist.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {sections.map((section) => (
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
                {changedKeys.size > 0 && (
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
                <p className="text-xs text-zinc-400 capitalize">{activeSection} configuration</p>
              </div>
            </div>

            {currentSettings.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No settings in this section.</p>
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
                        rows={3}
                        className="w-full max-w-lg px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                      />
                    ) : setting.type === "number" ? (
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        step="0.01"
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
                    <p className="text-[10px] text-zinc-300 mt-0.5 font-mono">Key: {setting.key}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Save button at bottom */}
            <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                {settings.length} settings total • {changedKeys.size} unsaved
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
          </div>
        </div>
      </div>
    </div>
  );
}