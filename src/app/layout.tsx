import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://boxzz.in";
const siteName = "Boxzz";
const defaultTitle = "Boxzz — Premium Corrugated Boxes & Packaging Materials Manufacturer";
const defaultDescription =
  "India's trusted manufacturer of corrugated boxes, packaging tapes (Flipkart, Amazon), bubble wrap, poly bags, thermal labels & custom packaging. Bulk orders, wholesale pricing, PAN India delivery.";
const ogImage = "/boxzz-logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "corrugated boxes manufacturer India",
    "packaging materials supplier",
    "3 ply corrugated boxes",
    "5 ply corrugated boxes",
    "7 ply corrugated boxes",
    "Flipkart packaging tape",
    "Amazon packaging tape",
    "BOPP tape wholesale",
    "paper bubble wrap",
    "poly bags with POD",
    "thermal label paper",
    "custom printed boxes",
    "packaging wholesale India",
    "box manufacturer Karnal",
    "ecommerce packaging supplies",
    "shipping boxes bulk",
    "Boxzz packaging",
    "corrugated box manufacturer Haryana",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: siteName,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 334,
        alt: "Boxzz - Premium Packaging Manufacturer",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification", // Replace with actual code
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#2563eb",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Boxzz",
    "msapplication-TileColor": "#2563eb",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Boxzz",
    url: siteUrl,
    logo: `${siteUrl}${ogImage}`,
    description: defaultDescription,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-8570059569",
      contactType: "sales",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "New Bahadur Channa Colony, Hansi Road",
      addressLocality: "Karnal",
      addressRegion: "Haryana",
      postalCode: "132001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://wa.me/918570059569",
    ],
    foundingDate: "2020",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: "10", maxValue: "50" },
    areaServed: "IN",
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Corrugated Boxes" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Packaging Tapes" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bubble Wrap" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Poly Bags" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Thermal Labels" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Custom Packaging" } },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to vital origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}