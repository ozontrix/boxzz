"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Home,
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Printer,
  Check,
  Minus,
  Plus,
  Share2,
  X,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/data";
import { ProductCard } from "@/components/ui/ProductCard";
import { useApp } from "@/store";
import type { Product as ProductType } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "features">("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const { addToCart, removeFromCart, addToWishlist, removeFromWishlist, isInWishlist, isInCart, getCartQuantity, showToast, updateCartQuantity } = useApp();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQty = getCartQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    setQuantity(product.moq);
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      setAddedToWishlist(true);
      setTimeout(() => setAddedToWishlist(false), 1500);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500">
          <Link href="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <Link href={`/category/${product.category}`} className="hover:text-primary">
            {product.category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl sm:text-9xl opacity-10 select-none">
                    {(product.category === "3-ply-boxes" || product.category === "5-ply-boxes" || product.category === "7-ply-boxes") && "📦"}
                    {(product.category === "3-ply-flap-boxes" || product.category === "3-ply-printed-flap-boxes" || product.category === "3-ply-white-boxes" || product.category === "3-ply-flap-white-boxes") && "📋"}
                    {product.category === "packaging-tapes" && "🔵"}
                    {product.category === "paper-bubble-wrap" && "📜"}
                    {product.category === "poly-bags" && "🛍️"}
                    {product.category === "thermal-labels" && "🏷️"}
                    {product.category === "corrugated-roll" && "🔄"}
                    {product.category === "custom-packaging" && "✨"}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {discount > 0 && (
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-error rounded-lg"
                  >
                    -{discount}%
                  </motion.span>
                )}
                {product.isNew && (
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.1 } }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-primary rounded-lg"
                  >
                    NEW
                  </motion.span>
                )}
              </div>

              {/* Share */}
              <button
                onClick={() => showToast("info", "Link Copied!", "Product link copied to clipboard.")}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-primary transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Cart item indicator overlay */}
              <AnimatePresence>
                {addedToCart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-success/10 z-10 flex items-center justify-center"
                  >
                    <div className="bg-white rounded-2xl p-4 shadow-xl flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-success" />
                      </div>
                      <p className="text-sm font-medium text-zinc-800 mt-2">Added to Cart!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 transition-all overflow-hidden bg-zinc-50",
                      selectedImage === idx ? "border-primary" : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-medium text-primary bg-orange-50 rounded-lg">
                {product.subcategory}
              </span>
              {product.customizationAvailable && (
                <span className="px-2.5 py-1 text-xs font-medium text-secondary bg-blue-50 rounded-lg flex items-center gap-1">
                  <Printer className="w-3 h-3" />
                  Customizable
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900 mt-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-zinc-600">{product.rating}</span>
              <span className="text-sm text-zinc-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 sm:mt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-base sm:text-lg text-zinc-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-sm font-semibold text-success bg-green-50 px-2 py-0.5 rounded-lg">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                + GST &bull; MOQ: {product.moq} {product.unit}s
              </p>
            </div>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-zinc-600 mt-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-zinc-800 mb-2">Size / Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.value)}
                      className={cn(
                        "px-3.5 py-2 text-sm font-medium rounded-xl border transition-all",
                        selectedVariant === variant.value
                          ? "border-primary bg-orange-50 text-primary"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Printing Options */}
            {product.printingOptions && product.printingOptions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-2">Printing Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.printingOptions.map((option) => (
                    <span
                      key={option}
                      className="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-lg"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Only show when NOT already in cart */}
            {!inCart && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-zinc-800 mb-2">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= product.moq) setQuantity(val);
                      }}
                      className="w-14 h-10 text-center text-sm font-medium text-zinc-800 border-x border-zinc-200 focus:outline-none"
                      min={product.moq}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Min. {product.moq} {product.unit}s
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <AnimatePresence mode="wait">
              {inCart ? (
                <motion.div
                  key="in-cart"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 space-y-2"
                >
                  {/* Cart Status Bar */}
                  <motion.div
                    layoutId="cart-button"
                    className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-success">Added to Cart</p>
                      <p className="text-xs text-zinc-500">Qty: {cartQty} × {formatPrice(product.price)}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveFromCart}
                      className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-error hover:border-error/30 hover:bg-error/5 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>

                  {/* Quantity Adjuster Inline */}
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-xs font-medium text-zinc-600">Adjust Quantity</span>
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCartQuantity(product.id, Math.max(product.moq, cartQty - 1))}
                        className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="w-10 h-8 flex items-center justify-center text-xs font-semibold text-zinc-800 border-x border-zinc-200">
                        {cartQty}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>

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
                  className="mt-6 flex flex-col sm:flex-row gap-3"
                >
                  <motion.button
                    layoutId="cart-button"
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-lg bg-primary text-white shadow-primary/25 hover:bg-primary-dark"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWishlist}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 border font-medium rounded-xl transition-all",
                      inWishlist
                        ? "border-error/30 text-error bg-error/5"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", inWishlist && "fill-error")} />
                    {inWishlist ? "Saved" : "Wishlist"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Summary */}
            <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Unit Price</span>
                  <span className="font-medium text-zinc-800">{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Quantity</span>
                  <span className="font-medium text-zinc-800">{quantity} {product.unit}s</span>
                </div>
                <div className="border-t border-zinc-200 pt-1.5 flex justify-between">
                  <span className="font-semibold text-zinc-800">Estimated Total</span>
                  <span className="font-bold text-zinc-900">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">+ GST as applicable &bull; Shipping calculated at checkout</p>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "PAN India Delivery" },
                  { icon: RotateCcw, label: "Easy Returns" },
                  { icon: ShieldCheck, label: "GST Invoice" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-50">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-[11px] font-medium text-zinc-600 text-center">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              {product.inStock ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-success font-medium">In Stock</span>
                  <span className="text-zinc-400">({product.stockCount.toLocaleString()} units available)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="text-error font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 sm:mt-12">
          <div className="border-b border-zinc-200">
            <div className="flex gap-4 sm:gap-6">
              {[
                { id: "description", label: "Description" },
                { id: "features", label: "Features" },
                { id: "specs", label: "Specifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "description" | "specs" | "features")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative",
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
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm max-w-none text-zinc-600 leading-relaxed"
              >
                <p>{product.description}</p>
              </motion.div>
            )}

            {activeTab === "features" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {product.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-zinc-600">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "specs" && product.specifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg"
              >
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <div key={idx} className="flex items-center px-4 py-2.5 bg-white hover:bg-zinc-50 transition-colors">
                      <span className="text-sm font-medium text-zinc-700 w-1/3">{key}</span>
                      <span className="text-sm text-zinc-600 w-2/3">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-zinc-50/50 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Related Products</h2>
            <p className="text-sm text-zinc-500 mt-1">You might also like these</p>
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}