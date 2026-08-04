"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminGetProducts,
  adminDeleteProduct,
  adminGetCategories,
} from "@/lib/api/admin";
import type { Product, Category } from "@/types";
import { ProductFormModal } from "@/components/admin/ProductFormModal";

// ─── Helper Icons ──────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        adminGetProducts(),
        adminGetCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" && p.inStock) ||
        (stockFilter === "out" && !p.inStock);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteProduct(id);
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleShare = async (product: Product) => {
    const slug = product.slug || product.id;
    const url = `${window.location.origin}/product/${slug}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────
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
          <h2 className="text-xl font-bold text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <IconPlus />
          Add Product
        </button>
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
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid — rich cards with full product details */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const catName = categories.find((c) => c.id === product.category)?.name || product.category.replace(/-/g, " ");
          const discount = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : product.discount || 0;
          const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                product.inStock ? "border-zinc-100" : "border-red-200 bg-red-50/40"
              }`}
            >
              {/* Image + badges */}
              <div className="relative h-36 bg-zinc-50 border-b border-zinc-100 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {discount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-md">-{discount}%</span>
                  )}
                  {product.subcategory && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-zinc-800/70 rounded-md backdrop-blur-sm">{product.subcategory}</span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.isNew && <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded-md">NEW</span>}
                  {product.isBestSeller && <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-amber-600 rounded-md">BESTSELLER</span>}
                  {product.isFeatured && <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-purple-600 rounded-md">FEATURED</span>}
                </div>
                <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-medium text-zinc-600 bg-white/80 backdrop-blur-sm rounded-md border border-zinc-200">
                  ID: {product.id}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 capitalize">{catName}</p>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 py-1.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Price</p>
                    <p className="text-xs font-bold text-zinc-800">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-zinc-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 py-1.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Stock</p>
                    <p className="text-xs font-bold text-zinc-800">{product.stockCount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 py-1.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">MOQ</p>
                    <p className="text-xs font-bold text-zinc-800">{product.moq} {product.unit}s</p>
                  </div>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">Pack Sizes ({product.variants.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {product.variants.slice(0, 4).map((v) => (
                        <span key={v.id} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-medium">
                          {v.label}
                        </span>
                      ))}
                      {product.variants.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[10px] font-medium">
                          +{product.variants.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Short description */}
                {product.shortDescription && (
                  <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{product.shortDescription}</p>
                )}

                {/* Extra badges */}
                {(product.customizationAvailable || (product.features?.length || 0) > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {product.customizationAvailable && (
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary border border-primary-100 text-[10px] font-medium">
                        ✨ Customizable
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                      {product.features?.length || 0} features
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                      {product.reviewCount} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="px-4 pb-4 flex items-center gap-1.5">
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                  title="View on storefront"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </a>
                <button
                  onClick={() => handleShare(product)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    copiedId === product.id
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                  title={copiedId === product.id ? "Link copied!" : "Copy product link"}
                >
                  {copiedId === product.id ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </>
                  )}
                </button>
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit product"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Delete product"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm">No products found</p>
          <p className="text-xs text-zinc-300 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* ─── Create/Edit Product Modal ───────────────────────────── */}
      <ProductFormModal
        open={showForm}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setShowForm(false)}
        onSaved={() => {
          setShowForm(false);
          setEditingProduct(null);
          loadData();
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        (() => {
          const deletingProduct = products.find((p) => p.id === deleteConfirm);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Product</h3>
                  <p className="text-sm text-zinc-600 mb-1">
                    <span className="font-semibold text-zinc-900">{deletingProduct?.name || "This product"}</span>
                  </p>
                  <p className="text-xs text-zinc-400 mb-6">
                    ID: {deletingProduct?.id} — This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
