"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
} from "@/lib/api/admin";
import { supabase } from "@/lib/api/supabase";
import type { Banner } from "@/types";

const BANNER_RECOMMENDATIONS = {
  aspectRatio: "16:7",
  aspectRatioPercent: "44.375%", // height/width * 100
  minWidth: 1200,
  minHeight: 525,
  maxSize: "10MB",
  formats: "PNG, JPG, WebP",
  tips: [
    "Use high-quality images with clear focal points centered in the frame",
    "Avoid text on the image itself — use the banner title/subtitle fields instead",
    "Keep the most important visual elements away from edges (safe zone: center 70%)",
    "Use bright, clean images that complement the gradient overlay",
    "Mobile: the left 60% of the image is most visible — place key elements there",
  ],
  bgColorOptions: [
    { value: "from-primary-50 via-amber-100/50 to-white", label: "Warm Amber", preview: "bg-gradient-to-r from-primary-50 via-amber-100/50 to-white" },
    { value: "from-blue-50 via-indigo-100/50 to-white", label: "Cool Indigo", preview: "bg-gradient-to-r from-blue-50 via-indigo-100/50 to-white" },
    { value: "from-emerald-50 via-green-100/50 to-white", label: "Fresh Green", preview: "bg-gradient-to-r from-emerald-50 via-green-100/50 to-white" },
    { value: "from-rose-50 via-pink-100/50 to-white", label: "Soft Rose", preview: "bg-gradient-to-r from-rose-50 via-pink-100/50 to-white" },
    { value: "from-purple-50 via-violet-100/50 to-white", label: "Muted Violet", preview: "bg-gradient-to-r from-purple-50 via-violet-100/50 to-white" },
    { value: "from-cyan-50 via-sky-100/50 to-white", label: "Sky Blue", preview: "bg-gradient-to-r from-cyan-50 via-sky-100/50 to-white" },
    { value: "from-yellow-50 via-amber-100/50 to-white", label: "Sunny Yellow", preview: "bg-gradient-to-r from-yellow-50 via-amber-100/50 to-white" },
  ],
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    image: "",
    imagePreview: "",
    cta: "",
    cta_link: "",
    bg_color: "from-primary-50 via-amber-100/50 to-white",
    sort_order: 0,
  });

  const loadBanners = useCallback(async () => {
    try {
      const data = await adminGetBanners();
      setBanners(data);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setFormData({
      id: "", title: "", subtitle: "", image: "", imagePreview: "",
      cta: "", cta_link: "",
      bg_color: "from-primary-50 via-amber-100/50 to-white", sort_order: 0,
    });
    setShowForm(true);
    setShowGuidelines(false);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      imagePreview: banner.image || "",
      cta: banner.cta,
      cta_link: banner.ctaLink,
      bg_color: banner.bgColor,
      sort_order: 0,
    });
    setShowForm(true);
    setShowGuidelines(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large! Maximum size is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file type
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Invalid file format! Only PNG, JPG, and WebP are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('banner-images')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, image: urlData.publicUrl }));
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: formData.image,
        cta: formData.cta,
        cta_link: formData.cta_link,
        bg_color: formData.bg_color,
        sort_order: formData.sort_order,
      };

      if (editingBanner) {
        await adminUpdateBanner(editingBanner.id, bannerData);
      } else {
        const id = formData.id || `banner-${Date.now().toString().slice(-6)}`;
        await adminCreateBanner({ id, ...bannerData });
      }
      setShowForm(false);
      setEditingBanner(null);
      await loadBanners();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteBanner(id);
      setDeleteConfirm(null);
      await loadBanners();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Banners</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{banners.length} banner(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Banners</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{banners.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{banners.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <p className="text-sm text-zinc-500">With CTAs</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{banners.filter((b) => b.cta).length}</p>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group"
          >
            {/* Banner Preview - exact aspect ratio */}
            <div
              className="relative overflow-hidden bg-gradient-to-r"
              style={{ aspectRatio: "16/7" }}
            >
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor}`} />
              )}
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
              <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8">
                <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xs line-clamp-2 drop-shadow">
                  {banner.subtitle}
                </p>
                {banner.cta && (
                  <span className="inline-block mt-2 w-fit px-3 py-1 rounded-lg bg-white/90 text-blue-700 text-xs font-semibold shadow-sm">
                    {banner.cta}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-800">{banner.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Active</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>ID: {banner.id}</span>
                <span>•</span>
                <span>Link: {banner.ctaLink || "—"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">
                  {editingBanner ? "Edit Banner" : "Create Banner"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGuidelines(!showGuidelines)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Guidelines
                  </button>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Guidelines Panel */}
            {showGuidelines && (
              <div className="mx-6 mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">📐 Banner Image Guidelines</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/80">
                    <span className="font-medium text-blue-800">Aspect Ratio</span>
                    <p className="text-blue-600 mt-0.5">{BANNER_RECOMMENDATIONS.aspectRatio}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80">
                    <span className="font-medium text-blue-800">Min Resolution</span>
                    <p className="text-blue-600 mt-0.5">{BANNER_RECOMMENDATIONS.minWidth} × {BANNER_RECOMMENDATIONS.minHeight}px</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80">
                    <span className="font-medium text-blue-800">Max File Size</span>
                    <p className="text-blue-600 mt-0.5">{BANNER_RECOMMENDATIONS.maxSize}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80">
                    <span className="font-medium text-blue-800">Formats</span>
                    <p className="text-blue-600 mt-0.5">{BANNER_RECOMMENDATIONS.formats}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-blue-800 mb-1.5">💡 Pro Tips</p>
                  <ul className="space-y-1">
                    {BANNER_RECOMMENDATIONS.tips.map((tip, idx) => (
                      <li key={idx} className="text-[11px] text-blue-700 flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-[11px] text-amber-800">
                    <span className="font-semibold">⚠️ Note:</span> The banner image will be cropped to 16:7 aspect ratio.
                    Keep important content in the center 70% (safe zone) to avoid cropping issues.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Banner Preview */}
              <div
                className="relative rounded-xl overflow-hidden bg-gradient-to-r"
                style={{ aspectRatio: "16/7" }}
              >
                {formData.imagePreview ? (
                  <img
                    src={formData.imagePreview}
                    alt="Banner preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-r ${formData.bg_color}`} />
                )}
                {/* Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8">
                  <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
                    {formData.title || "Your Banner Title"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xs line-clamp-2 drop-shadow">
                    {formData.subtitle || "Banner subtitle appears here"}
                  </p>
                  {formData.cta && (
                    <span className="inline-block mt-2 w-fit px-3 py-1 rounded-lg bg-white/90 text-blue-700 text-xs font-semibold shadow-sm">
                      {formData.cta}
                    </span>
                  )}
                </div>
                {/* Aspect ratio badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-mono">
                  16:7
                </div>
                {/* Safe zone indicator */}
                <div className="absolute inset-y-0 left-[15%] right-[15%] border-2 border-dashed border-white/30 rounded hidden sm:block pointer-events-none" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Banner Image</label>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-5 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    id="banner-image-upload"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="banner-image-upload" className="cursor-pointer">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mx-auto text-zinc-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-zinc-500 font-medium">Click to upload banner image</p>
                        <p className="text-xs text-zinc-400 mt-1">{BANNER_RECOMMENDATIONS.aspectRatio} • {BANNER_RECOMMENDATIONS.minWidth}×{BANNER_RECOMMENDATIONS.minHeight}px min • {BANNER_RECOMMENDATIONS.maxSize} max</p>
                      </>
                    )}
                  </label>
                </div>
                {formData.image && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Image uploaded</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: "", imagePreview: "" }));
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Banner Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Premium Packaging Solutions"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Keep it short and impactful — max 6-8 words recommended</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., High-quality boxes, tapes, and wrapping materials for all your shipping needs"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">A short description — 15-20 words max</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CTA Text</label>
                  <input
                    type="text"
                    value={formData.cta}
                    onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                    placeholder="Shop Now"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Button text — 2-3 words, action-oriented</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CTA Link</label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="/categories/3-ply-boxes"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Fallback Background Color</label>
                <p className="text-[10px] text-zinc-400 mb-2">Used when no image is uploaded or while the image loads</p>
                <div className="flex flex-wrap gap-2">
                  {BANNER_RECOMMENDATIONS.bgColorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bg_color: option.value })}
                      className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                        formData.bg_color === option.value
                          ? "border-blue-500 shadow-sm bg-blue-50"
                          : "border-transparent hover:border-zinc-200"
                      }`}
                    >
                      <div className={`w-12 h-7 rounded-lg bg-gradient-to-r ${option.value} border border-zinc-200`} />
                      <span className="text-[10px] text-zinc-500 font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order & ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Banner ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    disabled={!!editingBanner}
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Lower numbers appear first</p>
                </div>
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
                  disabled={saving || uploadingImage}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
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
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Banner</h3>
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