"use client";

import { useEffect, useState } from "react";
import { adminCreateProduct, adminUpdateProduct } from "@/lib/api/admin";
import { supabase } from "@/lib/api/supabase";
import type { Product, Category, ProductVariant } from "@/types";
import { slugify } from "@/lib/utils";

// ─── Helper Icons ──────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Types ─────────────────────────────────────────────────────────
type FormTab = "basics" | "pricing" | "flags" | "variants" | "content" | "media";

const TABS: { id: FormTab; label: string; icon: string; desc: string }[] = [
  { id: "basics", label: "Basics", icon: "🏷️", desc: "Name, category & short intro" },
  { id: "pricing", label: "Pricing & Stock", icon: "💰", desc: "Price, MRP, inventory" },
  { id: "flags", label: "Badges", icon: "⭐", desc: "Featured, bestseller, new" },
  { id: "variants", label: "Pack Sizes", icon: "📦", desc: "Optional variants" },
  { id: "content", label: "Content", icon: "📝", desc: "Descriptions, features, specs" },
  { id: "media", label: "Media", icon: "🖼️", desc: "Product images" },
];

interface FormData {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number;
  category: string;
  subcategory: string;
  stock_count: number;
  moq: number;
  unit: string;
  in_stock: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  discount: number;
  customization_available: boolean;
  features: string;
  images: string;
  applications: string;
  printing_options: string;
  specifications: { key: string; value: string }[];
  variants: ProductVariant[];
}

const emptyFormData: FormData = {
  id: "",
  name: "",
  description: "",
  short_description: "",
  price: 0,
  original_price: 0,
  category: "",
  subcategory: "",
  stock_count: 0,
  moq: 1,
  unit: "piece",
  in_stock: true,
  is_featured: false,
  is_best_seller: false,
  is_new: false,
  discount: 0,
  customization_available: false,
  features: "",
  images: "",
  applications: "",
  printing_options: "",
  specifications: [],
  variants: [],
};

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ open, editingProduct, categories, onClose, onSaved }: ProductFormModalProps) {
  const [tab, setTab] = useState<FormTab>("basics");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize form state from the product being edited (or empty for create)
  const [formData, setFormData] = useState<FormData>(() =>
    editingProduct
      ? {
          id: editingProduct.id,
          name: editingProduct.name,
          description: editingProduct.description,
          short_description: editingProduct.shortDescription,
          price: editingProduct.price,
          original_price: editingProduct.originalPrice || 0,
          category: editingProduct.category,
          subcategory: editingProduct.subcategory,
          stock_count: editingProduct.stockCount,
          moq: editingProduct.moq,
          unit: editingProduct.unit,
          in_stock: editingProduct.inStock,
          is_featured: editingProduct.isFeatured || false,
          is_best_seller: editingProduct.isBestSeller || false,
          is_new: editingProduct.isNew || false,
          discount: editingProduct.discount || 0,
          customization_available: editingProduct.customizationAvailable || false,
          features: (editingProduct.features || []).join(", "),
          images: (editingProduct.images || []).join(", "),
          applications: (editingProduct.applications || []).join(", "),
          printing_options: (editingProduct.printingOptions || []).join(", "),
          specifications: editingProduct.specifications
            ? Object.entries(editingProduct.specifications).map(([key, value]) => ({ key, value }))
            : [],
          variants: editingProduct.variants || [],
        }
      : { ...emptyFormData, category: categories[0]?.id || "" }
  );

  // Reset form & active tab whenever the modal opens or the target product changes
  useEffect(() => {
    if (!open) return;
    setTab("basics");
    setFormData(
      editingProduct
        ? {
            id: editingProduct.id,
            name: editingProduct.name,
            description: editingProduct.description,
            short_description: editingProduct.shortDescription,
            price: editingProduct.price,
            original_price: editingProduct.originalPrice || 0,
            category: editingProduct.category,
            subcategory: editingProduct.subcategory,
            stock_count: editingProduct.stockCount,
            moq: editingProduct.moq,
            unit: editingProduct.unit,
            in_stock: editingProduct.inStock,
            is_featured: editingProduct.isFeatured || false,
            is_best_seller: editingProduct.isBestSeller || false,
            is_new: editingProduct.isNew || false,
            discount: editingProduct.discount || 0,
            customization_available: editingProduct.customizationAvailable || false,
            features: (editingProduct.features || []).join(", "),
            images: (editingProduct.images || []).join(", "),
            applications: (editingProduct.applications || []).join(", "),
            printing_options: (editingProduct.printingOptions || []).join(", "),
            specifications: editingProduct.specifications
              ? Object.entries(editingProduct.specifications).map(([key, value]) => ({ key, value }))
              : [],
            variants: editingProduct.variants || [],
          }
        : { ...emptyFormData, category: categories[0]?.id || "" }
    );
  }, [open, editingProduct, categories]);

  // ─── Field updates ───────────────────────────────────────────────
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Variant helpers ─────────────────────────────────────────────
  const addVariant = () => {
    const newVar: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "",
      value: "",
      price: formData.price,
      mrp: formData.original_price || formData.price,
      discount: formData.discount,
      stock: formData.stock_count,
      weight: 0,
      sku: formData.name ? slugify(formData.name) : "",
      inStock: true,
    };
    update("variants", [...formData.variants, newVar]);
  };

  const updateVariant = (idx: number, field: keyof ProductVariant, value: any) => {
    const variants = [...formData.variants];
    variants[idx] = { ...variants[idx], [field]: value };
    // Auto-compute discount from price/MRP (kept hidden from the user)
    if (field === "price" || field === "mrp") {
      const v = variants[idx];
      v.discount = v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
    }
    update("variants", variants);
  };

  const removeVariant = (idx: number) => {
    update("variants", formData.variants.filter((_, i) => i !== idx));
  };

  // ─── Specification helpers ───────────────────────────────────────
  const addSpecification = () => update("specifications", [...formData.specifications, { key: "", value: "" }]);
  const updateSpecification = (idx: number, field: "key" | "value", value: string) => {
    const specs = [...formData.specifications];
    specs[idx] = { ...specs[idx], [field]: value };
    update("specifications", specs);
  };
  const removeSpecification = (idx: number) => update("specifications", formData.specifications.filter((_, i) => i !== idx));

  // ─── Auto-computed discount display ─────────────────────────────
  const computedDiscount =
    formData.original_price > formData.price
      ? Math.round(((formData.original_price - formData.price) / formData.original_price) * 100)
      : 0;

  // ─── Save ────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const features = formData.features.split(",").map((f) => f.trim()).filter(Boolean);
      const images = formData.images.split(",").map((img) => img.trim()).filter(Boolean);
      const applications = formData.applications.split(",").map((a) => a.trim()).filter(Boolean);
      const printingOptions = formData.printing_options.split(",").map((p) => p.trim()).filter(Boolean);

      const specifications: Record<string, string> = {};
      formData.specifications.forEach((spec) => {
        if (spec.key.trim() && spec.value.trim()) specifications[spec.key.trim()] = spec.value.trim();
      });

      const variants = formData.variants.filter((v) => v.label.trim());

      const payload = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        price: formData.price,
        original_price: formData.original_price || undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        stock_count: formData.stock_count,
        moq: formData.moq,
        unit: formData.unit,
        in_stock: formData.in_stock,
        is_featured: formData.is_featured,
        is_best_seller: formData.is_best_seller,
        is_new: formData.is_new,
        customization_available: formData.customization_available,
        features,
        images,
        variants: variants.length > 0 ? variants : undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        printing_options: printingOptions.length > 0 ? printingOptions : undefined,
      };

      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, payload);
      } else {
        await adminCreateProduct({ id: `BXZ-${Date.now().toString().slice(-6)}`, ...payload });
      }
      onSaved();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
  const labelCls = "block text-sm font-medium text-zinc-700 mb-1.5";
  const hintCls = "text-xs text-zinc-400 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {editingProduct ? `ID: ${editingProduct.id}` : "Fill in the essentials — advanced options live in later tabs."}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400" aria-label="Close">
              <IconX />
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto hide-scrollbar pb-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5">
          {/* ─── BASICS ─── */}
          {tab === "basics" && (
            <div className="space-y-4">
              <SectionIntro emoji="🏷️" title="Basic Information" desc="The essentials — name, category and where it fits." />
              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputCls}
                  required
                  placeholder="e.g. 3 Ply Brown Corrugated Box (8x5x3.5 in)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputCls + " bg-white"}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => update("subcategory", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Corrugated Boxes"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => update("short_description", e.target.value)}
                  className={inputCls}
                  placeholder="One-liner shown on product cards"
                />
                <p className={hintCls}>Shown on the storefront product card — keep it short and punchy.</p>
              </div>
            </div>
          )}

          {/* ─── PRICING & STOCK ─── */}
          {tab === "pricing" && (
            <div className="space-y-4">
              <SectionIntro emoji="💰" title="Pricing & Stock" desc="Price, MRP and inventory. Discount is calculated automatically." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => update("price", Number(e.target.value))}
                    className={inputCls}
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className={labelCls}>Original / MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => update("original_price", Number(e.target.value))}
                    className={inputCls}
                    min={0}
                    placeholder="Keep blank if no discount"
                  />
                </div>
                <div>
                  <label className={labelCls}>Discount</label>
                  <div className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm bg-zinc-50 flex items-center gap-1.5">
                    {computedDiscount > 0 ? (
                      <span className="font-bold text-green-600">-{computedDiscount}% OFF</span>
                    ) : (
                      <span className="text-zinc-400">Auto-calculated</span>
                    )}
                  </div>
                  <p className={hintCls}>Derived from Price vs MRP — no manual entry needed.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => update("stock_count", Number(e.target.value))}
                    className={inputCls}
                    min={0}
                  />
                </div>
                <div>
                  <label className={labelCls}>Min. Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => update("moq", Number(e.target.value))}
                    className={inputCls}
                    min={1}
                  />
                </div>
                <div>
                  <label className={labelCls}>Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => update("unit", e.target.value)}
                    className={inputCls + " bg-white"}
                  >
                    <option value="piece">Piece</option>
                    <option value="roll">Roll</option>
                    <option value="box">Box</option>
                    <option value="set">Set</option>
                    <option value="meter">Meter</option>
                    <option value="kg">Kg</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>
              <ToggleRow
                label="In Stock"
                desc="Allow customers to buy this product"
                checked={formData.in_stock}
                onChange={(v) => update("in_stock", v)}
              />
            </div>
          )}

          {/* ─── FLAGS / BADGES ─── */}
          {tab === "flags" && (
            <div className="space-y-4">
              <SectionIntro emoji="⭐" title="Badges & Flags" desc="Highlight this product on the storefront." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToggleRow
                  label="⭐ Featured"
                  desc="Show in the Featured section on the homepage"
                  checked={formData.is_featured}
                  onChange={(v) => update("is_featured", v)}
                />
                <ToggleRow
                  label="🔥 Best Seller"
                  desc="Show the BESTSELLER badge on the card"
                  checked={formData.is_best_seller}
                  onChange={(v) => update("is_best_seller", v)}
                />
                <ToggleRow
                  label="🆕 New"
                  desc="Show the NEW badge on the card"
                  checked={formData.is_new}
                  onChange={(v) => update("is_new", v)}
                />
                <ToggleRow
                  label="✨ Customizable"
                  desc="Allow custom printing / customization"
                  checked={formData.customization_available}
                  onChange={(v) => update("customization_available", v)}
                />
              </div>
            </div>
          )}

          {/* ─── VARIANTS / PACK SIZES ─── */}
          {tab === "variants" && (
            <div className="space-y-4">
              <SectionIntro
                emoji="📦"
                title="Pack Sizes / Variants"
                desc="Optional. Add different pack sizes (e.g. Pack of 50, Pack of 100) with their own pricing. Label & price are required; MRP & discount are auto-computed."
              />
              {formData.variants.length === 0 && (
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center">
                  <p className="text-sm text-zinc-400">No pack sizes yet.</p>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <IconPlus />
                    Add Pack Size
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {formData.variants.map((variant, idx) => (
                  <div key={variant.id} className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pack #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1 rounded-lg hover:bg-red-100 text-zinc-400 hover:text-red-600 transition-colors"
                        aria-label="Remove pack"
                      >
                        <IconX />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Label *</label>
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(e) => updateVariant(idx, "label", e.target.value)}
                          placeholder="Pack of 50"
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Value</label>
                        <input
                          type="text"
                          value={variant.value}
                          onChange={(e) => updateVariant(idx, "value", e.target.value)}
                          placeholder="50"
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                          placeholder="auto-generated"
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Weight (g)</label>
                        <input
                          type="number"
                          value={variant.weight}
                          onChange={(e) => updateVariant(idx, "weight", Number(e.target.value))}
                          placeholder="0"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                          placeholder="0"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">MRP (₹)</label>
                        <input
                          type="number"
                          value={variant.mrp}
                          onChange={(e) => updateVariant(idx, "mrp", Number(e.target.value))}
                          placeholder="0"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                          placeholder="0"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.inStock}
                          onChange={(e) => updateVariant(idx, "inStock", e.target.checked)}
                          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[11px] text-zinc-500">In Stock</span>
                      </label>
                      {variant.mrp > variant.price && (
                        <span className="ml-auto text-[10px] font-semibold text-green-600">
                          Discount: {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% (auto)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formData.variants.length > 0 && (
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <IconPlus />
                  Add Another Pack
                </button>
              )}
            </div>
          )}

          {/* ─── CONTENT ─── */}
          {tab === "content" && (
            <div className="space-y-4">
              <SectionIntro emoji="📝" title="Content" desc="Full description, features, specifications and use-cases." />
              <div>
                <label className={labelCls}>Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className={inputCls + " resize-none"}
                  placeholder="Detailed product description shown on the product page"
                />
              </div>
              <div>
                <label className={labelCls}>Features</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => update("features", e.target.value)}
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="Strong 3-ply build, Foldable & stackable, 100% recyclable"
                />
                <p className={hintCls}>Separate each feature with a comma.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-zinc-700">Specifications</label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <IconPlus />
                    Add Spec
                  </button>
                </div>
                {formData.specifications.length === 0 && (
                  <p className="text-sm text-zinc-400 italic border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center">
                    No specifications yet. Add key-value pairs like Material → Corrugated Kraft.
                  </p>
                )}
                <div className="space-y-2">
                  {formData.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(idx, "key", e.target.value)}
                        placeholder="Spec name (e.g. Material)"
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(idx, "value", e.target.value)}
                        placeholder="Value (e.g. Corrugated Kraft)"
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(idx)}
                        className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                        aria-label="Remove spec"
                      >
                        <IconX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Applications</label>
                  <textarea
                    value={formData.applications}
                    onChange={(e) => update("applications", e.target.value)}
                    rows={2}
                    className={inputCls + " resize-none"}
                    placeholder="E-commerce, Retail, Food Delivery"
                  />
                  <p className={hintCls}>Comma-separated use cases.</p>
                </div>
                <div>
                  <label className={labelCls}>Printing Options</label>
                  <textarea
                    value={formData.printing_options}
                    onChange={(e) => update("printing_options", e.target.value)}
                    rows={2}
                    className={inputCls + " resize-none"}
                    placeholder="1-Color Print, Full CMYK, No Print"
                  />
                  <p className={hintCls}>Comma-separated printing options.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDIA ─── */}
          {tab === "media" && (
            <div className="space-y-4">
              <SectionIntro emoji="🖼️" title="Product Images" desc="Upload images or paste URLs. First image is the card thumbnail." />
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="product-image-upload"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setUploading(true);
                    const uploadedUrls: string[] = [];
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      const ext = file.name.split('.').pop();
                      const fileName = `product-${Date.now()}-${i}.${ext}`;
                      const { data, error } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });
                      if (error) {
                        alert('Upload failed: ' + error.message);
                        continue;
                      }
                      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
                      uploadedUrls.push(urlData.publicUrl);
                    }
                    if (uploadedUrls.length > 0) {
                      const existing = formData.images ? formData.images.split(', ').filter(Boolean) : [];
                      update("images", [...existing, ...uploadedUrls].join(', '));
                    }
                    setUploading(false);
                    e.target.value = '';
                  }}
                />
                <label htmlFor="product-image-upload" className="cursor-pointer">
                  <svg className="w-10 h-10 mx-auto text-zinc-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-zinc-500 font-medium">
                    {uploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                </label>
              </div>

              {formData.images && (
                <div className="flex flex-wrap gap-3">
                  {formData.images.split(',').map((url, idx) => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return null;
                    return (
                      <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                        <img src={trimmedUrl} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const urls = formData.images.split(',').map((u) => u.trim()).filter(Boolean);
                            urls.splice(idx, 1);
                            update("images", urls.join(', '));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className={labelCls}>Image URLs</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => update("images", e.target.value)}
                  className={inputCls}
                  placeholder="https://... , https://..."
                />
                <p className={hintCls}>Separate multiple URLs with commas.</p>
              </div>
            </div>
          )}

          {/* ─── Footer Nav (Prev/Next + Save) ─── */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-4 mt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="sm:w-32 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex-1" />
            {tab !== "basics" && (
              <button
                type="button"
                onClick={() => setTab(TABS[TABS.findIndex((t) => t.id === tab) - 1].id)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                ← Back
              </button>
            )}
            {tab !== "media" ? (
              <button
                type="button"
                onClick={() => setTab(TABS[TABS.findIndex((t) => t.id === tab) + 1].id)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Next: {TABS[TABS.findIndex((t) => t.id === tab) + 1].label} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  editingProduct ? "Update Product" : "Create Product"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionIntro({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-zinc-100">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h4 className="text-sm font-bold text-zinc-900">{title}</h4>
        <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        <span className="block text-xs text-zinc-500 mt-0.5">{desc}</span>
      </span>
    </label>
  );
}
