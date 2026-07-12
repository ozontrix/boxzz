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

export const metadata: Metadata = {
  title: {
    default: "Boxzz — Premium Packaging & Corrugated Box Manufacturer",
    template: "%s | Boxzz",
  },
  description:
    "India's trusted manufacturer of corrugated boxes, packaging tapes, bubble wrap, and custom packaging solutions. Bulk orders, wholesale pricing, pan-India delivery.",
  keywords: [
    "corrugated boxes manufacturer",
    "packaging materials",
    "BOPP tape",
    "bubble wrap",
    "shipping boxes",
    "custom packaging India",
    "Boxzz",
  ],
  openGraph: {
    title: "Boxzz — Premium Packaging & Corrugated Box Manufacturer",
    description:
      "India's trusted manufacturer of corrugated boxes, packaging tapes, bubble wrap, and custom packaging solutions.",
    type: "website",
    locale: "en_IN",
    siteName: "Boxzz",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}