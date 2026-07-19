"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Home, Shield } from "lucide-react";
import { supabase } from "@/lib/api/supabase";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "privacy_policy_content")
          .single();
        if (data?.value) {
          setContent(data.value);
        }
      } catch (e) {
        console.error("Failed to load privacy policy:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultContent = `
## Privacy Policy

Last updated: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}

### 1. Introduction

Welcome to ${SITE_NAME}. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.

### 2. Information We Collect

We may collect the following types of information:

- **Personal Identification Information**: Name, email address, phone number, shipping address, billing address
- **Order Information**: Product selections, order history, payment details
- **Technical Data**: IP address, browser type, device information, cookies
- **Communication Data**: Your preferences in receiving marketing from us

### 3. How We Use Your Information

We use the collected information for:

- Processing and delivering your orders
- Communicating with you about your orders
- Providing customer support
- Improving our products and services
- Sending relevant offers and updates (with your consent)
- Complying with legal obligations

### 4. Data Protection

We implement appropriate security measures to protect your personal information, including:

- Secure SSL encryption for data transmission
- Restricted access to personal data
- Regular security audits
- Secure payment processing

### 5. Sharing Your Information

We do not sell, trade, or rent your personal information to third parties. We may share information with:

- Delivery partners for order fulfillment
- Payment processors for secure transactions
- Legal authorities when required by law

### 6. Cookies

Our website uses cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings, but this may affect某些 functionality.

### 7. Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Delete your data (subject to legal requirements)
- Object to processing of your data
- Data portability

### 8. Contact Us

If you have any questions about this privacy policy, please contact us:

- **Email**: ${CONTACT_INFO.email}
- **Phone**: ${CONTACT_INFO.phone}
- **Address**: ${CONTACT_INFO.address}

### 9. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
`;

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
          <span className="text-zinc-800 font-medium">Privacy Policy</span>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-y border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl shrink-0">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">Privacy Policy</h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                How we collect, use, and protect your personal information
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
                <h2>Privacy Policy</h2>
                <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                
                <h3>1. Introduction</h3>
                <p>Welcome to {SITE_NAME}. We respect your privacy and are committed to protecting your personal data.</p>
                
                <h3>2. Information We Collect</h3>
                <p>We may collect the following types of information:</p>
                <ul>
                  <li><strong>Personal Identification Information</strong>: Name, email address, phone number, shipping and billing addresses</li>
                  <li><strong>Order Information</strong>: Product selections, order history, payment details</li>
                  <li><strong>Technical Data</strong>: IP address, browser type, device information</li>
                  <li><strong>Communication Data</strong>: Your preferences for receiving marketing communications</li>
                </ul>

                <h3>3. How We Use Your Information</h3>
                <p>We use the collected information for:</p>
                <ul>
                  <li>Processing and delivering your orders</li>
                  <li>Communicating with you regarding your orders and inquiries</li>
                  <li>Providing customer support and resolving issues</li>
                  <li>Improving our products, services, and website experience</li>
                  <li>Sending relevant offers and updates (only with your explicit consent)</li>
                  <li>Complying with applicable legal and regulatory obligations</li>
                </ul>

                <h3>4. Data Protection & Security</h3>
                <p>We implement industry-standard security measures to protect your personal information:</p>
                <ul>
                  <li>SSL/TLS encryption for all data transmissions</li>
                  <li>Restricted access to personal data on a need-to-know basis</li>
                  <li>Regular security assessments and updates</li>
                  <li>Secure payment gateways for all financial transactions</li>
                </ul>

                <h3>5. Information Sharing</h3>
                <p>We respect your privacy and do not sell, trade, or rent your personal information to third parties. We may share information only with:</p>
                <ul>
                  <li><strong>Delivery Partners</strong>: For order fulfillment and shipment tracking</li>
                  <li><strong>Payment Processors</strong>: For secure payment processing (we never store full payment details)</li>
                  <li><strong>Legal Authorities</strong>: When required by applicable law or to protect our rights</li>
                </ul>

                <h3>6. Data Retention</h3>
                <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for legal, accounting, or reporting requirements. Order information is typically retained for 5 years as required by tax regulations.</p>

                <h3>7. Your Rights</h3>
                <p>Under applicable data protection laws, you have the right to:</p>
                <ul>
                  <li><strong>Access</strong>: Request a copy of the personal data we hold about you</li>
                  <li><strong>Rectification</strong>: Request correction of inaccurate or incomplete data</li>
                  <li><strong>Erasure</strong>: Request deletion of your data, subject to legal retention requirements</li>
                  <li><strong>Restriction</strong>: Request restriction of processing your data</li>
                  <li><strong>Portability</strong>: Request transfer of your data to another service provider</li>
                  <li><strong>Objection</strong>: Object to the processing of your data for marketing purposes</li>
                </ul>

                <h3>8. Contact Us</h3>
                <p>If you have any questions, concerns, or requests regarding this privacy policy or your personal data, please contact us:</p>
                <ul>
                  <li><strong>Email</strong>: {CONTACT_INFO.email}</li>
                  <li><strong>Phone</strong>: {CONTACT_INFO.phone}</li>
                  <li><strong>Address</strong>: {CONTACT_INFO.address}</li>
                  <li><strong>Working Hours</strong>: {CONTACT_INFO.workingHours}</li>
                </ul>

                <h3>9. Policy Updates</h3>
                <p>We may update this privacy policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date. We encourage you to review this policy regularly.</p>
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