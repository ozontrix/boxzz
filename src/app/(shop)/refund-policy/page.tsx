"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Home, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/api/supabase";
import { useApp } from "@/store";
import { SITE_NAME } from "@/lib/constants";

export default function RefundPolicyPage() {
  const [content, setContent] = useState("");
  const { state } = useApp();
  const contact = state.contact;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "refund_policy_content")
          .single();
        if (data?.value) {
          setContent(data.value);
        }
      } catch (e) {
        console.error("Failed to load refund policy:", e);
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
          <span className="text-zinc-800 font-medium">Refund Policy</span>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-50 via-green-50/50 to-white border-y border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-3xl shrink-0">
              <RotateCcw className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">Refund Policy</h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Our returns, refunds, and cancellation terms for your peace of mind
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
            {content ? (
              content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i}>{line}</p>;
              })
            ) : (
              <>
                <h2>Refund Policy</h2>
                <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

                <h3>1. Introduction</h3>
                <p>
                  At {SITE_NAME}, we strive to deliver high-quality packaging products that meet your expectations. If
                  you are not completely satisfied with your purchase, this Refund Policy explains when and how you can
                  request a return or refund. Please read it carefully before placing an order.
                </p>

                <h3>2. Refund Eligibility</h3>
                <p>You may be eligible for a refund or replacement in the following situations:</p>
                <ul>
                  <li><strong>Defective or damaged products</strong> received in unusable condition</li>
                  <li><strong>Incorrect items</strong> — a different product or size than what you ordered</li>
                  <li><strong>Missing items</strong> from your order</li>
                  <li><strong>Cancelled orders</strong> that have not yet been dispatched or manufactured</li>
                </ul>

                <h3>3. Return Window & Conditions</h3>
                <ul>
                  <li>Return or refund requests must be raised within <strong>7 days</strong> of delivery</li>
                  <li>Products must be <strong>unused</strong> and in their <strong>original packaging</strong></li>
                  <li>A valid proof of purchase (order ID / invoice) is required for all requests</li>
                  <li>Items must be returned in the same condition they were received, with all accessories and labels intact</li>
                </ul>

                <h3>4. Non-Refundable Items</h3>
                <p>The following are not eligible for refund or return, except in cases of manufacturing defects:</p>
                <ul>
                  <li><strong>Customized, printed, or made-to-order products</strong> (e.g., boxes printed with your brand logo)</li>
                  <li><strong>Bulk / wholesale orders</strong> once production has started</li>
                  <li><strong>Shipping and freight charges</strong> — these are non-refundable once the order is dispatched</li>
                  <li>Products damaged due to misuse, mishandling, or improper storage after delivery</li>
                  <li>Packages refused at delivery or returned due to an incorrect/incomplete address</li>
                </ul>

                <h3>5. How to Request a Refund</h3>
                <p>To initiate a return or refund request, please contact our support team within the return window:</p>
                <ul>
                  <li><strong>Email</strong>: {contact.email}</li>
                  <li><strong>Phone / WhatsApp</strong>: {contact.phone}</li>
                  <li><strong>Working Hours</strong>: {contact.workingHours}</li>
                </ul>
                <p>
                  Please share your <strong>order ID</strong>, the <strong>product name</strong>, and a brief description
                  (with photos/videos where applicable) of the issue. Our team will verify the details and guide you
                  through the next steps.
                </p>

                <h3>6. Refund Process & Timeline</h3>
                <ul>
                  <li>Once your request is received, it is <strong>verified within 1-2 business days</strong></li>
                  <li>For eligible returns, we arrange a reverse pickup or request you to ship the item back</li>
                  <li>After inspection and approval, refunds are <strong>processed within 7-10 business days</strong></li>
                  <li>You will be notified by email/SMS at every step of the process</li>
                </ul>


                <h3>7. Payment Refunds via Razorpay</h3>
                <p>
                  All online payments on {SITE_NAME} are processed securely through <strong>Razorpay</strong> (UPI,
                  Credit/Debit Cards, Net Banking, and Wallets). Approved refunds are initiated through the same payment
                  gateway and are credited back to your <strong>original payment method</strong>:
                </p>
                <ul>
                  <li><strong>UPI / Wallets</strong>: Typically reflect within 24-48 hours</li>
                  <li><strong>Credit / Debit Cards</strong>: Usually 5-7 business days, depending on your bank</li>
                  <li><strong>Net Banking</strong>: Usually 3-5 business days, depending on your bank</li>
                </ul>
                <p>
                  If your refund amount is not credited within the timelines above, please contact your bank first, and
                  then our support team with your Razorpay payment ID and order ID for assistance.
                </p>

                <h3>8. Shipping & Return Costs</h3>
                <ul>
                  <li>If the return is due to <strong>our error</strong> (defective, damaged, or incorrect item), we bear the return shipping cost</li>
                  <li>For <strong>change-of-mind</strong> returns, the return shipping cost is borne by the buyer</li>
                  <li>Original shipping charges are non-refundable for orders that have been dispatched</li>
                  <li>Re-delivery of undelivered packages may attract additional shipping charges</li>
                </ul>

                <h3>9. Damaged, Defective or Incorrect Items</h3>
                <ul>
                  <li>Please inspect your order immediately upon delivery</li>
                  <li>Report any damage, defects, or missing items within <strong>48 hours of delivery</strong> with clear photos/videos</li>
                  <li>We will arrange a free replacement or a full refund (including shipping) after verification</li>
                  <li>Claims raised after 48 hours may not be eligible for a free replacement</li>
                </ul>

                <h3>10. Contact Us</h3>
                <p>If you have any questions about this Refund Policy, please reach out to us:</p>
                <ul>
                  <li><strong>Email</strong>: {contact.email}</li>
                  <li><strong>Phone</strong>: {contact.phone}</li>
                  <li><strong>Address</strong>: {contact.address}</li>
                  <li><strong>Working Hours</strong>: {contact.workingHours}</li>
                </ul>
              </>
            )}
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
