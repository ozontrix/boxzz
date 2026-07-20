"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Check } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";
import { useApp } from "@/store";
import { PackSizeSelector } from "./PackSizeSelector";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, isInCart, showToast } = useApp();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveMrp = selectedVariant?.mrp ?? product.originalPrice ?? effectivePrice;
  const discount = selectedVariant?.discount ?? (product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0);

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const hasSlider = (product.images?.length ?? 0) >= 2;
  const hasVariants = product.variants && product.variants.length > 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistLoading(true);
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setTimeout(() => setWishlistLoading(false), 300);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) return;
    setCartLoading(true);
    addToCart(product, product.moq, selectedVariant?.value);
    setTimeout(() => setCartLoading(false), 300);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 group-hover:border-primary/20 transition-colors">
          {/* Product Image */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onMouseEnter={() => hasSlider && setCurrentImageIndex(1)}
            onMouseLeave={() => hasSlider && setCurrentImageIndex(0)}
          >
            {product.images?.[currentImageIndex] ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="text-6xl opacity-20 select-none">
                {(product.category === "3-ply-boxes" || product.category === "5-ply-boxes" || product.category === "7-ply-boxes") && "📦"}
                {(product.category === "3-ply-flap-boxes" || product.category === "3-ply-printed-flap-boxes" || product.category === "3-ply-white-boxes" || product.category === "3-ply-flap-white-boxes") && "📋"}
                {product.category === "packaging-tapes" && "🔵"}
                {product.category === "paper-bubble-wrap" && "📜"}
                {product.category === "poly-bags" && "🛍️"}
                {product.category === "thermal-labels" && "🏷️"}
                {product.category === "corrugated-roll" && "🔄"}
                {product.category === "custom-packaging" && "✨"}
              </div>
            )}

            {/* Image Slider Dots */}
            {hasSlider && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {product.images?.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(i);
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentImageIndex
                        ? "bg-white w-3"
                        : "bg-white/60 hover:bg-white/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {discount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-error rounded-md">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-primary rounded-md">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-amber-600 rounded-md">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                inWishlist ? "fill-error text-error" : "text-zinc-500"
              )}
            />
          </button>

          {/* Quick Action Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2 translate-y-2 group-hover:translate-y-0 transition-all">
              <button
                onClick={handleAddToCart}
                disabled={inCart || cartLoading}
                className={cn(
                  "w-9 h-9 rounded-xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center transition-colors",
                  inCart ? "text-success border-success/30" : "text-zinc-600 hover:text-primary"
                )}
              >
                {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </button>
              <span className="w-9 h-9 rounded-xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-600 hover:text-primary transition-colors cursor-pointer">
                <Eye className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* MOQ Badge */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium text-zinc-500 bg-white/80 backdrop-blur-sm rounded-md border border-zinc-200">
            MOQ: {product.moq} {product.unit}s
          </div>

          {/* Out of Stock Overlay */}
          {(!product.inStock || product.stockCount <= 0) && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                <span className="text-sm font-bold text-red-600">Out of Stock</span>
              </div>
            </div>
          )}

          {/* Unit Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-medium text-zinc-500 bg-white/80 backdrop-blur-sm rounded-md border border-zinc-200 capitalize">
            Per {product.unit}
          </div>
        </div>

        <div className="mt-2.5 px-0.5">
          {/* Category */}
          <p className="text-[11px] font-medium text-primary uppercase tracking-wide">
            {product.subcategory}
          </p>

          {/* Name */}
          <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-zinc-600">
              {product.rating}
            </span>
            <span className="text-xs text-zinc-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Compact Pack Size Chips */}
          {hasVariants && (
            <div className="mt-1.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <div className="flex flex-wrap gap-1.5">
                {product.variants!.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(variant);
                      }}
                      disabled={!variant.inStock}
                      className={cn(
                        "px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all whitespace-nowrap",
                        isSelected
                          ? "border-primary bg-primary text-white shadow-sm"
                          : variant.inStock
                          ? "border-zinc-200 bg-white text-zinc-600 hover:border-primary/40 hover:bg-orange-50/30"
                          : "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                      )}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-base font-bold text-zinc-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Customization Tag */}
          {product.customizationAvailable && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-primary bg-orange-50 rounded-md">
                Customizable
              </span>
            </div>
          )}

          {/* In Cart Indicator */}
          {inCart && (
            <div className="flex items-center gap-1 mt-1.5">
              <Check className="w-3 h-3 text-success" />
              <span className="text-[10px] font-medium text-success">In Cart</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// Missing Star import
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill={props.fill || "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}