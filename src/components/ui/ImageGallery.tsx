"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  category: string;
}

export function ImageGallery({ images, productName, category }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && selectedImage < images.length - 1) {
          setSelectedImage((prev) => prev + 1);
        } else if (diff < 0 && selectedImage > 0) {
          setSelectedImage((prev) => prev - 1);
        }
      }
    },
    [touchStart, selectedImage, images.length]
  );

  const categoryEmoji = (cat: string) => {
    if (cat.includes("3-ply") || cat.includes("5-ply") || cat.includes("7-ply")) return "📦";
    if (cat.includes("flap") || cat.includes("printed")) return "📋";
    if (cat === "packaging-tapes") return "🔵";
    if (cat === "paper-bubble-wrap") return "📜";
    if (cat === "poly-bags") return "🛍️";
    if (cat === "thermal-labels") return "🏷️";
    if (cat === "corrugated-roll") return "🔄";
    if (cat === "custom-packaging") return "✨";
    return "📦";
  };

  const currentImage = images[selectedImage];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        ref={imageRef}
        className="relative aspect-square bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl border border-zinc-100 overflow-hidden group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt={`${productName} view ${selectedImage + 1}`}
                className={cn(
                  "w-full h-full object-contain transition-transform duration-200 p-4",
                  isZoomed && "scale-150"
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl sm:text-9xl opacity-20 select-none">
                  {categoryEmoji(category)}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Zoom indicator (desktop only) */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            {selectedImage > 0 && (
              <button
                onClick={() => setSelectedImage((p) => p - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {selectedImage < images.length - 1 && (
              <button
                onClick={() => setSelectedImage((p) => p + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Dots indicator on mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  selectedImage === idx
                    ? "bg-primary w-4"
                    : "bg-zinc-300"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 transition-all overflow-hidden bg-zinc-50 shrink-0",
                selectedImage === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              {img ? (
                <img
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  {categoryEmoji(category)}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}