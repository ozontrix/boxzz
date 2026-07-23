"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Home, Scale } from "lucide-react";
import { supabase } from "@/lib/api/supabase";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

export default function TermsConditionsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "terms_conditions_content")
          .single();
        if (data?.value) {
          setContent(data.value);
        }
      } catch (e) {
        console.error("Failed to load terms:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-medium">Terms & Conditions</span>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-r from-amber-50 via-primary-50/50 to-white border-y border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-primary-100 flex items-center justify-center text-3xl shrink-0">
              <Scale className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">Terms & Conditions</h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Terms governing the use of our website and purchase of products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-zinc-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-zinc-600 prose-li:mb-1 prose-strong:text-zinc-800">
            <h2>Terms & Conditions</h2>
            <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

            <h3>1. Introduction</h3>
            <p>Welcome to {SITE_NAME}. By accessing our website and placing an order, you agree to be bound by these terms and conditions. Please read them carefully before making a purchase.</p>

            <h3>2. Business Information</h3>
            <ul>
              <li><strong>Business Name</strong>: Anmol Packaging</li>
              <li><strong>Address</strong>: {CONTACT_INFO.address}</li>
              <li><strong>Phone</strong>: {CONTACT_INFO.phone}</li>
              <li><strong>Email</strong>: {CONTACT_INFO.email}</li>
              <li><strong>GSTIN</strong>: Applicable GST will be charged on all invoices as per government regulations</li>
            </ul>

            <h3>3. Products & Pricing</h3>
            <ul>
              <li>All product prices are listed in Indian Rupees (₹) and are exclusive of GST unless stated otherwise</li>
              <li>Prices are subject to change without prior notice</li>
              <li>Product images are for illustration purposes; actual products may vary slightly</li>
              <li>We reserve the right to modify or discontinue products without notice</li>
              <li>Minimum order quantities (MOQ) apply to all products as specified on product pages</li>
            </ul>

            <h3>4. Orders & Payment</h3>
            <ul>
              <li>Orders are confirmed only after payment is received in full</li>
              <li>We accept Cash on Delivery (COD), Bank Transfer (NEFT/IMPS), and UPI payments</li>
              <li>For COD orders, a nominal convenience fee may apply</li>
              <li>We reserve the right to cancel any order due to pricing errors, stock unavailability, or suspected fraud</li>
              <li>Bulk orders may require advance payment as per mutual agreement</li>
            </ul>

            <h3>5. Shipping & Delivery</h3>
            <ul>
              <li>We ship across India through our logistics partners</li>
              <li>Estimated delivery times are 3-7 business days for most locations</li>
              <li>Shipping charges are calculated at checkout and vary by location and order value</li>
              <li>Free shipping is available on orders above the specified threshold</li>
              <li>Delivery times are estimates and not guaranteed; delays may occur due to factors beyond our control</li>
              <li>Risk of loss and title for products pass to you upon delivery to the carrier</li>
            </ul>

            <h3>6. Returns & Refunds</h3>
            <ul>
              <li>Returns are accepted within 7 days of delivery for defective or incorrect items</li>
              <li>Products must be unused and in original packaging for returns</li>
              <li>Customized, printed, or made-to-order products cannot be returned unless defective</li>
              <li>Refunds will be processed within 7-10 business days after inspection and approval</li>
              <li>Return shipping costs are borne by the buyer unless the return is due to our error</li>
            </ul>

            <h3>7. GST & Taxation</h3>
            <ul>
              <li>GST is charged at the applicable rate (currently 12% on packaging products)</li>
              <li>A GST invoice will be provided for every order</li>
              <li>Taxes are calculated based on the shipping address and current tax laws</li>
              <li>Prices displayed on product pages are exclusive of GST; the final amount including GST is shown at checkout</li>
            </ul>

            <h3>8. Limitation of Liability</h3>
            <p>{SITE_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products or website. Our total liability is limited to the purchase price of the products in question.</p>

            <h3>9. Intellectual Property</h3>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of {SITE_NAME} and is protected by applicable intellectual property laws. Unauthorized use is strictly prohibited.</p>

            <h3>10. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Karnal, Haryana.</p>

            <h3>11. Contact Information</h3>
            <p>For any questions or concerns regarding these terms, please contact us:</p>
            <ul>
              <li><strong>Email</strong>: {CONTACT_INFO.email}</li>
              <li><strong>Phone</strong>: {CONTACT_INFO.phone}</li>
              <li><strong>Address</strong>: {CONTACT_INFO.address}</li>
            </ul>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}