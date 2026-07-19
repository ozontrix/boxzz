"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Upload,
  ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/api/upload";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/api/admin";
import type { Category } from "@/types";

interface CategoryForm {
  id: string;
  name: string;
  nameHindi: string;
  icon: string;
  description: string;
  shortDescription: string;
  image: string;
}

const EMPTY_FORM: CategoryForm = {
  id: "",
  name: "",
  nameHindi: "",
  icon: "📦",
  description: "",
  shortDescription: "",
  image: "",
};

const COMMON_ICONS = ["📦", "📋", "📜", "🛍️", "🏷️", "🔵", "🔄", "💪", "🔷", "🎨", "⬜", "🤍", "✨", "📎", "📐", "⚙️"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminGetCategories();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      id: cat.id,
      name: cat.name,
      nameHindi: cat.nameHindi || "",
      icon: cat.icon || "📦",
      description: cat.description || "",
      shortDescription: cat.shortDescription || "",
      image: cat.image || "",
    });
    setEditingId(cat.id);
    setError("");
    setShowForm(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, "images", "categories");
    if (url) {
      setForm(p => ({ ...p, image: url }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.id.trim()) { setError("Slug/ID is required"); return; }

    setSaving(true);
    try {
      const data = {
        id: form.id.trim(),
        name: form.name.trim(),
        name_hindi: form.nameHindi.trim(),
        icon: form.icon || "📦",
        description: form.description.trim(),
        short_description: form.shortDescription.trim(),
        image: form.image,
      };

      if (editingId) {
        await adminUpdateCategory(editingId, data);
      } else {
        await adminCreateCategory(data);
      }

      setShowForm(false);
      loadCategories();
    } catch (e: any) {
      setError(e.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? All products in this category will also be deleted.")) return;
    setDeleting(id);
    try {
      await adminDeleteCategory(id);
      loadCategories();
    } catch (e: any) {
      alert(e.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Categories</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage product categories ({categories.length} total)
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full h-10 pl-9 pr-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-100">
          <Grid3X3 className="w-10 h-10 text-zinc-300 mx-auto" />
          <p className="text-sm text-zinc-500 mt-3">
            {search ? "No categories match your search" : "No categories yet"}
          </p>
          {!search && (
            <button onClick={openAdd} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
              Add your first category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-zinc-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    cat.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{cat.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono truncate">{cat.id}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full">
                      <Package className="w-2.5 h-2.5" />
                      {cat.productCount} products
                    </span>
                    {cat.nameHindi && (
                      <span className="text-[10px] text-zinc-400">{cat.nameHindi}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-zinc-100">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto disabled:opacity-50"
                >
                  {deleting === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
            style={{ overscrollBehavior: "contain" }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900">
                  {editingId ? "Edit Category" : "Add Category"}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm(p => ({ ...p, name: e.target.value }));
                        if (!editingId) setForm(p => ({ ...p, id: generateSlug(e.target.value) }));
                      }}
                      className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      placeholder="e.g. Corrugated Boxes"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Slug / ID *</label>
                    <input
                      type="text"
                      value={form.id}
                      onChange={(e) => setForm(p => ({ ...p, id: e.target.value }))}
                      className="w-full h-10 px-3 text-sm font-mono border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-zinc-50"
                      placeholder="corrugated-boxes"
                      readOnly={!!editingId}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Hindi Name</label>
                    <input
                      type="text"
                      value={form.nameHindi}
                      onChange={(e) => setForm(p => ({ ...p, nameHindi: e.target.value }))}
                      className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      placeholder="e.g. नालीदार बक्से"
                    />
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Icon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, icon }))}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all",
                          form.icon === icon ? "border-blue-500 bg-blue-50" : "border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Image</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm(p => ({ ...p, image: e.target.value }))}
                      className="flex-1 h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      placeholder="Or paste image URL..."
                    />
                  </div>
                  {form.image && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                      <img src={form.image} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, image: "" }))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                    className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex-1"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}