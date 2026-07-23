"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ChevronRight,
  ArrowUpRight,
  ChevronDown,
  Send,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";
import { getAllCategories } from "@/lib/api/db";
import type { Category } from "@/types";

const EXCLUDED_PATHS = ["/cart", "/checkout", "/wishlist"];

export function Footer() {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Fetch categories from DB on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getAllCategories();
        setDbCategories(cats);
      } catch (e) {
        console.error("Failed to fetch categories for footer:", e);
      }
    }
    fetchCategories();
  }, []);

  // Hide footer on cart, checkout, wishlist
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return null;

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleBulkOrder = () => {
    const message = encodeURIComponent(
      "Hi Boxzz! I'm interested in a bulk order. Please share the price list and minimum order quantities."
    );
    window.open(`https://wa.me/918570059569?text=${message}`, "_blank");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const subject = encodeURIComponent("Bulk Order / Price List Enquiry");
    const body = encodeURIComponent(
      `Hi Boxzz Team,\n\nI'd like to get a price list and more information about your products for bulk ordering.\n\nMy Email: ${email.trim()}\n\nPlease send the details at your earliest convenience.\n\nThanks!`
    );
    window.open(
      `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`,
      "_blank"
    );
    setEmail("");
  };

  const handleContactWhatsApp = () => {
    const message = encodeURIComponent("Hi Boxzz! I have a question.");
    window.open(`https://wa.me/918570059569?text=${message}`, "_blank");
  };

  // Footer link groups
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "All Categories", href: "/categories" },
    { label: "Custom Packaging", href: "/custom-packaging" },
    { label: "Search Products", href: "/search" },
    { label: "My Account", href: "/account" },
  ];

  const policies = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Shipping Policy", href: "/shipping-policy" },
  ];

  const topCategories = dbCategories.slice(0, 6);

  return (
    <footer className="block">
      {/* ─── NEWSLETTER / CTA BAND ─── */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Tagline */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                🏭 Manufacturer Direct Pricing
              </h3>
              <p className="text-sm text-primary-100 mt-1 max-w-lg">
                Get the best bulk order prices delivered to your doorstep anywhere in India.
              </p>
            </div>

            {/* Right: Bulk Order CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleBulkOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-primary-50 transition-all shadow-xl shadow-black/10 group"
              >
                <MessageCircle className="w-5 h-5 fill-primary text-primary" />
                Bulk Order on WhatsApp
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN FOOTER ─── */}
      <div className="bg-zinc-900 text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-8">
            {/* Brand Column - 4 cols */}
            <div className="col-span-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/boxzz_final_logo.png"
                  alt={`${SITE_NAME} Logo`}
                  width={160}
                  height={50}
                  className="w-36 h-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-sm">
                India's trusted manufacturer of corrugated boxes, packaging tapes, bubble wrap, and custom packaging solutions. Serving businesses across India with premium quality and manufacturer-direct pricing.
              </p>

              {/* Trust badges */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: "GST Invoice" },
                  { icon: Truck, label: "PAN India" },
                  { icon: RotateCcw, label: "Easy Returns" },
                  { icon: Star, label: "Best Price" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-white/5 border border-white/10 rounded-lg text-zinc-400"
                    >
                      <Icon className="w-3 h-3 text-primary" />
                      {item.label}
                    </span>
                  );
                })}
              </div>

              {/* Bulk Email CTA */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Get Bulk Price List via Email
                </h4>
                <p className="text-xs text-zinc-500 mt-1 mb-3">
                  Send us your email and we'll share the latest bulk price list.
                </p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all shrink-0"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Links - 2 cols */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3 h-3 text-primary/0 group-hover:text-primary transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mt-8 mb-5">
                Policies
              </h3>
              <ul className="space-y-3">
                {policies.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3 h-3 text-primary/0 group-hover:text-primary transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories - 3 cols */}
            <div className="col-span-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                Top Categories
              </h3>
              <ul className="space-y-3">
                {topCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.id}`}
                      className="text-sm text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="text-xs">{cat.icon}</span>
                      <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                View All Categories
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Contact - 3 cols */}
            <div className="col-span-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Phone</p>
                    <a
                      href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                      className="text-white hover:text-primary transition-colors font-medium"
                    >
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Email</p>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-white hover:text-primary transition-colors font-medium break-all"
                    >
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Address</p>
                    <p className="text-white leading-snug">{CONTACT_INFO.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Working Hours</p>
                    <p className="text-white">{CONTACT_INFO.workingHours}</p>
                  </div>
                </li>
              </ul>

              {/* WhatsApp Quick Chat */}
              <button
                onClick={handleContactWhatsApp}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold rounded-xl hover:bg-[#25D366]/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* ─── MOBILE ACCORDION ─── */}
          <div className="lg:hidden space-y-1">
            {/* Brand */}
            <div className="pb-6 border-b border-zinc-800 mb-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/boxzz_final_logo.png"
                  alt={`${SITE_NAME} Logo`}
                  width={140}
                  height={44}
                  className="w-28 h-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                India's trusted manufacturer of corrugated boxes & packaging materials.
              </p>

              {/* Mobile Bulk Order */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleBulkOrder}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Bulk Order
                </button>
                <button
                  onClick={handleContactWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                  Chat
                </button>
              </div>
            </div>

            {/* Accordion Sections */}
            {[
              {
                id: "quick-links",
                label: "Quick Links",
                content: (
                  <ul className="space-y-2.5">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-zinc-400 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-1">
                      <span className="text-xs text-zinc-600 block mb-1">Policies</span>
                      {policies.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block text-sm text-zinc-400 hover:text-primary transition-colors py-0.5"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </li>
                  </ul>
                ),
              },
              {
                id: "categories",
                label: "Categories",
                content: (
                  <ul className="space-y-2.5">
                    {topCategories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/category/${cat.id}`}
                          className="text-sm text-zinc-400 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="text-xs">{cat.icon}</span>
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/categories"
                        className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        View All Categories →
                      </Link>
                    </li>
                  </ul>
                ),
              },
              {
                id: "contact",
                label: "Contact Us",
                content: (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                        {CONTACT_INFO.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary transition-colors break-all">
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{CONTACT_INFO.address}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{CONTACT_INFO.workingHours}</span>
                    </div>

                    {/* Mobile Email Form */}
                    <form onSubmit={handleEmailSubmit} className="mt-3 flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-all shrink-0"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                ),
              },
            ].map((section) => {
              const isOpen = expandedSection === section.id;
              return (
                <div key={section.id} className="border-b border-zinc-800">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-white uppercase tracking-wider">
                      {section.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-zinc-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">{section.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div className="bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>
            © {new Date().getFullYear()}{" "}
            <Link href="/" className="text-zinc-400 hover:text-primary transition-colors">
              {SITE_NAME}
            </Link>
            . All rights reserved. | GST Invoice Provided
          </p>
          <div className="flex items-center gap-4">
            {policies.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}