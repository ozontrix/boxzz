import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  alt?: string;
}

/**
 * The Boxzz logo, rendered as a plain <img> straight from /public.
 *
 * The logo is small, static and repeated on every page, so sending it through
 * next/image would spend a Vercel Image Transformation per size per page view
 * for no meaningful quality gain. Direct delivery is cached by the CDN.
 *
 * width/height are the intrinsic dimensions (1099x306) so the browser
 * reserves the aspect ratio and there is no layout shift while it loads.
 */
export function SiteLogo({ className, alt = "Boxzz Logo" }: SiteLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional direct delivery
    <img
      src="/boxzz_final_logo.png"
      alt={alt}
      width={1099}
      height={306}
      loading="eager"
      decoding="async"
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
