"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Home,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Truck,
  Zap,
  MessageCircle,
  FileText,
  Ruler,
  Recycle,
  Box,
  Grip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/data";
import { useApp } from "@/store";
import type { Product as ProductType, ProductVariant } from "@/types";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { PackSizeSelector } from "@/components/ui/PackSizeSelector";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { SpecificationsTable } from "@/components/ui/SpecificationsTable";
import { DeliveryInfo } from "@/components/ui/DeliveryInfo";
import { RelatedProductsCarousel } from "@/components/ui/RelatedProductsCarousel";

const FEATURES_ICONS = [
  Check,
  Sparkles,
  ShieldCheck,
  Recycle,
  Grip,
  Zap,
];

const APPLICATIONS_ICONS = [
  "🛒",
  "📬",
  "📦",
  "🎁",
  "💻",
  "💍",
  "🧴",
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "features" | "faq">("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [showMobileSticky, setShowMobileSticky] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, isInWishlist, isInCart, getCartQuantity, showToast } = useApp();
  const purchaseRef = useRef<HTMLDivElement>(null);

  // Get current effective price/mrp based on variant or base product
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const effectiveMrp = selectedVariant?.mrp ?? product?.originalPrice ?? effectivePrice;
  const effectiveDiscount = selectedVariant?.discount ?? (effectiveMrp > effectivePrice ? calculateDiscount(effectiveMrp, effectivePrice) : 0);
  const effectiveWeight = selectedVariant?.weight ?? 0;
  const effectiveStock = selectedVariant?.stock ?? product?.stockCount ?? 0;
  const effectiveSku = selectedVariant?.sku ?? product?.slug ?? "";
  const totalPrice = effectivePrice * quantity;
  const totalWeight = effectiveWeight * quantity;

  useEffect(() => {
    async function load() {
      try {
        const p = await getProductBySlug(slug);
        if (!p) {
          notFound();
          return;
        }
        setProduct(p);
        setQuantity(p.moq || 1);
        // Auto-select first variant if available
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
        const related = await getRelatedProducts(p.id);
        setRelatedProducts(related);
      } catch (e) {
        console.error("Failed to load product:", e);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  // Show mobile sticky on scroll
  // (purchaseRef is used as a scroll anchor point for the sticky mobile bar)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowMobileSticky(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const imageUrl = product.images?.[0] || "📦";
    addToCart(product, quantity, selectedVariant?.value);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [product, quantity, selectedVariant, addToCart]);

  const handleRemoveFromCart = useCallback(() => {
    if (!product) return;
    removeFromCart(product.id);
    setQuantity(product.moq);
  }, [product, removeFromCart]);

  const handleWishlist = useCallback(() => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [product, isInWishlist, removeFromWishlist, addToWishlist]);

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(Math.max(product?.moq ?? 1, 1));
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 animate-pulse">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQty = getCartQuantity(product.id);
  const categoryName = product.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // FAQ data
  const faqs = [
    {
      q: `What is the minimum order quantity for ${product.name}?`,
      a: `The minimum order quantity for this product is ${product.moq} ${product.unit}s. For bulk orders beyond 10,000 units, please contact us for special pricing.`,
    },
    {
      q: "Are these boxes recyclable?",
      a: "Yes, all our corrugated boxes are made from high-strength kraft paper and are 100% recyclable and biodegradable. We are committed to eco-friendly packaging solutions.",
    },
    {
      q: "Can I get custom printing on these boxes?",
      a: product.customizationAvailable
        ? "Yes, we offer custom printing options including 1-color, 2-color, and full CMYK printing. Minimum order quantity for printed boxes may vary. Contact us for a quote."
        : "Custom printing is not available for this product. However, we offer custom packaging solutions — check out our Custom Packaging page.",
    },
    {
      q: "What are the delivery charges?",
      a: "Shipping is free for orders above ₹2,499. For orders below this amount, standard shipping charges apply. We ship PAN India via trusted courier partners with tracking provided.",
    },
    {
      q: "How long does delivery take?",
      a: "We ship within 24 hours of order confirmation. Delivery typically takes 3-7 business days depending on your location. Metro cities usually receive delivery within 2-3 days.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${product.category}`} className="hover:text-primary transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-800 font-medium truncate max-w-[180px] sm:max-w-[250px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* ─── LEFT: Image Gallery ─── */}
          <div>
            <ImageGallery
              images={product.images}
              productName={product.name}
              category={product.category}
            />
          </div>

          {/* ─── RIGHT: Product Info ─── */}
          <div className="flex flex-col gap-5">
            {/* Category & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-medium text-primary bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
                {product.subcategory}
              </span>
              {product.isNew && (
                <span className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              )}
              {product.customizationAvailable && (
                <span className="px-2.5 py-1 text-xs font-medium text-secondary bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Customizable
                </span>
              )}
            </div>

            {/* Title & SKU */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                SKU: {effectiveSku}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.floor(product.rating);
                  const half = !filled && i < product.rating;
                  return (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        filled
                          ? "fill-amber-400 text-amber-400"
                          : half
                          ? "fill-amber-200 text-amber-300"
                          : "text-zinc-200"
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-sm font-medium text-zinc-700">{product.rating}</span>
              <span className="text-sm text-zinc-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price Display */}
            <PriceDisplay
              price={effectivePrice}
              mrp={effectiveMrp}
              discount={effectiveDiscount}
              quantity={quantity}
              showTotal={quantity > 1}
            />

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                {product.shortDescription}
              </p>
            )}

            {/* Pack Size Selector */}
            {product.variants && product.variants.length > 0 && (
              <PackSizeSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelect={handleVariantSelect}
              />
            )}

            {/* Quantity Selector */}
            <QuantitySelector
              quantity={quantity}
              min={product.moq}
              max={effectiveStock}
              unit={product.unit}
              onChange={setQuantity}
            />

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {product.inStock && effectiveStock > 0 ? (
                <span className="text-success font-semibold">✅ In Stock</span>
              ) : (
                <span className="text-error font-semibold">❌ Out of Stock</span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100" ref={purchaseRef} />

            {/* Action Buttons - Main Area */}
            <AnimatePresence mode="wait">
              {inCart ? (
                <motion.div
                  key="in-cart"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* In Cart Status */}
                  <motion.div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-success">Added to Cart</p>
                      <p className="text-xs text-zinc-500">
                        {cartQty} {product.unit}{(cartQty > 1 ? "s" : "")} × {formatPrice(effectivePrice)} = {formatPrice(effectivePrice * cartQty)}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveFromCart}
                      className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-error hover:border-error/30 hover:bg-error/5 transition-all shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </motion.div>

                  {/* Wishlist */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWishlist}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-5 py-2.5 border font-medium rounded-xl transition-all text-sm",
                      inWishlist
                        ? "border-error/30 text-error bg-error/5"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", inWishlist && "fill-error")} />
                    {inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="add-to-cart"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={handleAddToCart}
                    disabled={!product.inStock || effectiveStock <= 0}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all shadow-lg text-white",
                      product.inStock && effectiveStock > 0
                        ? "bg-primary shadow-primary/25 hover:bg-primary-dark"
                        : "bg-zinc-300 cursor-not-allowed"
                    )}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.inStock && effectiveStock > 0 ? "Add to Cart" : "Out of Stock"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWishlist}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3.5 border font-medium rounded-xl transition-all",
                      inWishlist
                        ? "border-error/30 text-error bg-error/5"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", inWishlist && "fill-error")} />
                    {inWishlist ? "Saved" : "Wishlist"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showToast("info", "Link Copied!", "Product link copied to clipboard.")}
                    className="flex items-center justify-center px-4 py-3.5 border border-zinc-200 rounded-xl text-zinc-400 hover:text-primary hover:bg-zinc-50 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: "PAN India Delivery" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: ShieldCheck, label: "GST Invoice" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-medium text-zinc-600 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

           

            {/* Total Summary */}
            {quantity > 1 && (
              <div className="p-4 bg-gradient-to-br from-zinc-50 to-white rounded-xl border border-zinc-100">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Unit Price</span>
                    <span className="font-medium text-zinc-800">{formatPrice(effectivePrice)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Quantity</span>
                    <span className="font-medium text-zinc-800">× {quantity}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-1.5 flex justify-between">
                    <span className="font-semibold text-zinc-800">Estimated Total</span>
                    <span className="font-bold text-lg text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">+ GST as applicable &bull; Shipping calculated at checkout</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── DETAILS TABS ─── */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="border-b border-zinc-200">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar">
              {[
                { id: "description", label: "Description" },
                { id: "features", label: "Features" },
                { id: "specs", label: "Specifications" },
                { id: "faq", label: "FAQ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "description" | "specs" | "features" | "faq")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                    activeTab === tab.id ? "text-primary" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            {/* Description */}
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm max-w-none text-zinc-600 leading-relaxed"
              >
                <div className="bg-gradient-to-br from-zinc-50 to-white rounded-xl p-5 sm:p-6 border border-zinc-100">
                  <h3 className="text-lg font-bold text-zinc-900 mb-3">Product Overview</h3>
                  <p className="text-sm sm:text-base leading-relaxed">{product.description}</p>

                  {/* Applications grid */}
                  {product.applications && product.applications.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-zinc-800 mb-3 flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-primary" />
                        Applications
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.applications.map((app, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-zinc-200 rounded-lg text-zinc-700 shadow-sm"
                          >
                            {APPLICATIONS_ICONS[idx % APPLICATIONS_ICONS.length]}
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material & Eco info */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Material", value: "Corrugated Kraft", icon: "📄" },
                      { label: "Strength", value: "High", icon: "💪" },
                      { label: "Eco-Friendly", value: "100% Recyclable", icon: "♻️" },
                      { label: "Reusable", value: "Yes", icon: "🔄" },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-white rounded-xl border border-zinc-100 text-center">
                        <span className="text-lg">{item.icon}</span>
                        <p className="text-xs font-semibold text-zinc-800 mt-1">{item.value}</p>
                        <p className="text-[10px] text-zinc-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features */}
            {activeTab === "features" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {product.features.map((feature, idx) => {
                  const Icon = FEATURES_ICONS[idx % FEATURES_ICONS.length];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-zinc-100 hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-amber-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-zinc-700 leading-snug pt-1">{feature}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Specifications */}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                {product.specifications ? (
                  <SpecificationsTable specifications={product.specifications} />
                ) : (
                  <p className="text-sm text-zinc-500">No specifications available for this product.</p>
                )}
              </div>
            )}

            {/* FAQ */}
            {activeTab === "faq" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl space-y-2"
              >
                {faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border border-zinc-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-zinc-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-800 flex-1">{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-zinc-400 transition-transform shrink-0",
                          expandedFaq === idx && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProductsCarousel products={relatedProducts} />

      {/* ─── STICKY MOBILE CART BAR ─── */}
      <AnimatePresence>
        {showMobileSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe"
          >
            <div className="glass-strong border-t border-zinc-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-primary">{formatPrice(effectivePrice)}</span>
                    {effectiveMrp > effectivePrice && (
                      <span className="text-xs text-zinc-400 line-through">{formatPrice(effectiveMrp)}</span>
                    )}
                    {effectiveDiscount > 0 && (
                      <span className="text-[10px] font-semibold text-success">{effectiveDiscount}% OFF</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {selectedVariant?.label || `${product.moq} ${product.unit}s`}
                  </p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(product.id, Math.max(product.moq, cartQty - 1))}
                      className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-zinc-800 w-8 text-center">{cartQty}</span>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    disabled={!product.inStock || effectiveStock <= 0}
                    className={cn(
                      "flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg",
                      product.inStock
                        ? "bg-primary text-white shadow-primary/25"
                        : "bg-zinc-300 text-white"
                    )}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}