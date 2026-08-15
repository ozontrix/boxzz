"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type ImageMode = "auto" | "optimize" | "direct";

/**
 * Hosts that already serve pre-optimized assets (resized / WebP / AVIF).
 * Sending these through next/image would only burn Vercel Image
 * Transformations for no quality gain.
 */
const PRE_OPTIMIZED_HOSTS = ["images.gurez.online"];

/** Public Supabase storage object endpoint prefix. */
const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
/** Supabase render endpoint that applies on-the-fly Image Transformations. */
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";
/** Supabase transform quality (matches next/image's default of 75-80). */
const SUPABASE_TRANSFORM_QUALITY = 80;

function isPreOptimizedRemote(src: string): boolean {
  try {
    const { hostname } = new URL(src, "https://local.invalid");
    return PRE_OPTIMIZED_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function isSupabaseStorageUrl(src: string): boolean {
  try {
    const url = new URL(src, "https://local.invalid");
    return (
      url.hostname.endsWith("supabase.co") && url.pathname.includes(SUPABASE_OBJECT_PATH)
    );
  } catch {
    return false;
  }
}

/**
 * Rewrite a public Supabase object URL to the render endpoint so the Supabase
 * CDN downscales/optimizes the original for the size we actually display.
 *
 *   .../storage/v1/object/public/product-images/x.jpeg
 *     → .../storage/v1/render/image/public/product-images/x.jpeg?width=640&quality=80&format=webp
 *
 * This keeps delivery entirely on Supabase's CDN (zero Vercel Image
 * Transformations) while avoiding shipping full-resolution originals to
 * small card/thumbnail layouts.
 */
function withSupabaseTransform(src: string, width?: number): string {
  if (!width || width <= 0 || !isSupabaseStorageUrl(src)) return src;
  const url = new URL(src);
  url.pathname = url.pathname.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  url.search = "";
  url.searchParams.set("width", String(Math.round(width)));
  url.searchParams.set("quality", String(SUPABASE_TRANSFORM_QUALITY));
  url.searchParams.set("format", "webp");
  return url.toString();
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  /**
   * "auto" (default): serve pre-optimized remote images directly and use
   * next/image everywhere else.
   * "optimize": always use next/image (large, above-the-fold, responsive).
   * "direct": always render a plain <img> (small repeated thumbnails/cards).
   */
  mode?: ImageMode;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  /**
   * Direct mode only: request this width from the Supabase render endpoint for
   * Supabase-hosted images. Pass roughly 2x the displayed width for retina.
   */
  transformWidth?: number;
}

/**
 * A single image abstraction that lets us keep next/image where Vercel
 * optimization provides real value (heroes, large responsive images) and
 * fall back to direct delivery (Supabase CDN / pre-optimized CDNs) for
 * repeated thumbnails, cards and avatars — dramatically cutting Vercel Image
 * Transformations without changing the UI.
 */
export function OptimizedImage({
  src,
  alt,
  mode = "auto",
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality,
  className,
  style,
  loading,
  decoding,
  transformWidth,
}: OptimizedImageProps) {
  const effectiveMode: ImageMode =
    mode === "auto" ? (isPreOptimizedRemote(src) ? "direct" : "optimize") : mode;

  if (effectiveMode === "direct") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional direct delivery
      <img
        src={withSupabaseTransform(src, transformWidth)}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={loading ?? (priority ? "eager" : "lazy")}
        decoding={decoding ?? "async"}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
        style={style}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
    />
  );
}
