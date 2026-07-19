"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Home, Truck } from "lucide-react";
import { supabase } from "@/lib/api/supabase";
import { SITE_NAME, CONTACT_INFO, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_CHARGE } from "@/lib/constants";
import { getShippingConfig } from "@/lib/api/db";

export default function ShippingPolicyPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [shippingConfig, setShippingConfig] = useState({ freeThreshold: FREE_SHIPPING_THRESHOLD, standardCharge: STANDARD_SHIPPING_CHARGE });

  useEffect(() => {
    async function load() {
      try {
        const [dbContent, config] = await Promise.all([
          supabase.from("site_settings").select("value").eq("key", "shipping_policy_content").single(),
          getShippingConfig(),
        ]);
        if (dbContent.data?.value) setContent(dbContent.data.value);
        setShippingConfig({ freeThreshold: config.freeThreshold, standardCharge: config.standardCharge });
      } catch (e) {
        console.error("Failed to load shipping policy:", e);
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
          <span className="text-zinc-800 font-medium">Shipping Policy</span>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-50 via-green-50/50 to-white border-y border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-3xl shrink-0">
              <Truck className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">Shipping Policy</h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Information about shipping, delivery, and freight charges
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
        ) : content ? (
          <div className="prose prose-sm sm:prose-base max-w-none">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-zinc-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-zinc-600 prose-li:mb-1 prose-strong:text-zinc-800">
            <h2>Shipping Policy</h2>
            <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

            <h3>1. Shipping Coverage</h3>
            <p>We offer shipping services across all states and union territories of India. Our delivery network covers over 500 cities through our trusted logistics partners.</p>

            <h3>2. Shipping Charges</h3>
            <ul>
              <li><strong>Standard Shipping</strong>: ₹{shippingConfig.standardCharge.toLocaleString()} for orders below ₹{shippingConfig.freeThreshold.toLocaleString()}</li>
              <li><strong>Free Shipping</strong>: Orders of ₹{shippingConfig.freeThreshold.toLocaleString()} and above qualify for free standard shipping</li>
              <li><strong>Express Shipping</strong>: Available at select locations at additional charges</li>
              <li><strong>Bulk Orders</strong>: Special shipping rates apply for bulk/wholesale orders; contact us for a quote</li>
            </ul>

            <h3>3. Delivery Timeframes</h3>
            <ul>
              <li><strong>Standard Delivery</strong>: 5-7 business days across most locations in India</li>
              <li><strong>Metro Cities</strong>: 3-5 business days (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune)</li>
              <li><strong>Remote Areas</strong>: 7-10 business days for remote/location areas</li>
              <li><strong>Bulk Orders</strong>: Manufacturing lead time of 3-5 days + shipping time; total 8-12 business days</li>
            </ul>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
              ⏱ Note: Delivery times are estimates and may vary depending on the shipping destination, courier partner, and unforeseen circumstances. During peak seasons (festivals, sales), delivery may take longer.
            </p>

            <h3>4. Order Processing Time</h3>
            <ul>
              <li>Orders are processed within 24-48 hours of confirmation</li>
              <li>Orders placed on weekends or public holidays will be processed on the next business day</li>
              <li>Custom/manufactured orders may require additional processing time as communicated at the time of order</li>
            </ul>

            <h3>5. Tracking Your Order</h3>
            <ul>
              <li>Once your order is shipped, you will receive a tracking ID via email and SMS</li>
              <li>You can track your order status on our website under "My Account" → "Orders"</li>
              <li>For any tracking-related queries, contact our support team with your order ID</li>
            </ul>

            <h3>6. Freight Charges for Bulk Orders</h3>
            <p>For bulk orders exceeding 50 kg in weight or standard parcel dimensions, freight charges are calculated based on:</p>
            <ul>
              <li><strong>Weight</strong>: Actual weight or volumetric weight, whichever is higher</li>
              <li><strong>Distance</strong>: Shipping pin code to delivery pin code</li>
              <li><strong>Mode</strong>: Surface (road) or express, depending on urgency</li>
              <li>A freight quote will be provided before dispatch for such orders</li>
            </ul>

            <h3>7. Shipping Address</h3>
            <ul>
              <li>Please ensure your shipping address is complete and accurate</li>
              <li>Include landmark information for easier locating</li>
              <li>Provide a valid phone number for the delivery partner to contact you</li>
              <li>We are not responsible for delays or failed delivery due to incorrect addresses</li>
            </ul>

            <h3>8. Undelivered Packages</h3>
            <ul>
              <li>If a package is returned to us due to an incorrect address or failed delivery attempts, additional shipping charges will apply for re-delivery</li>
              <li>If you refuse delivery of a package, the original shipping charges are non-refundable</li>
              <li>Packages unclaimed after 30 days will be considered abandoned</li>
            </ul>

            <h3>9. Contact Us</h3>
            <p>For shipping-related inquiries, please contact us:</p>
            <ul>
              <li><strong>Phone</strong>: {CONTACT_INFO.phone}</li>
              <li><strong>Email</strong>: {CONTACT_INFO.email}</li>
              <li><strong>Working Hours</strong>: {CONTACT_INFO.workingHours}</li>
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