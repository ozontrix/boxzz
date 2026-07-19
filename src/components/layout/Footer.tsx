import Image from "next/image";
import Link from "next/link";
import { Package, Phone, Mail, MapPin, Clock, ChevronRight } from "lucide-react";
import { SITE_NAME, CATEGORIES, CONTACT_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="hidden lg:block bg-zinc-900 text-zinc-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/boxzz-logo.png"
                alt="Boxzz Logo"
                width={140}
                height={44}
                className="w-32 h-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              India's trusted manufacturer of corrugated boxes, packaging tapes, bubble wrap, and custom packaging solutions. Bulk orders, wholesale pricing, pan-India delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-zinc-500 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-zinc-500 hover:text-primary transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm text-zinc-500 hover:text-primary transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-500 hover:text-primary transition-colors">
                  Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-sm text-zinc-500 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {CONTACT_INFO.phone}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {CONTACT_INFO.email}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {CONTACT_INFO.address}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {CONTACT_INFO.workingHours}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}