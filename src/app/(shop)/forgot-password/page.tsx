"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteLogo } from "@/components/ui/SiteLogo";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, MailCheck, KeyRound, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const result = await sendPasswordResetEmail(email.trim());
    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.includes("not found")
          ? "No account found with this email address."
          : result.error
      );
    } else {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-zinc-50/50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-primary mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Sign In
        </Link>

        <Link href="/" className="flex items-center mb-6">
          <SiteLogo className="w-32 h-auto object-contain" />
        </Link>

        <AnimatePresence mode="wait">
          {isSent ? (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-8 h-8 text-success" />
              </motion.div>
              <h1 className="text-lg font-bold text-zinc-900">Check your email</h1>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                We&apos;ve sent a password reset link to <span className="font-semibold text-zinc-800">{email.trim()}</span>.
                <br />Please check your inbox (and spam folder) and click the link to reset your password.
              </p>
              <Link href="/login" className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                <KeyRound className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-xl font-bold text-zinc-900">Forgot password?</h1>
              <p className="text-sm text-zinc-500 mt-1">Enter your email and we&apos;ll send you a link to reset your password.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-error/5 border border-error/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <p className="text-xs text-error font-medium">{error}</p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                    className={cn(
                      "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all",
                      error ? "border-error focus:ring-error/30 focus:border-error" : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                    )}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <motion.button type="submit" disabled={isSubmitting} whileTap={{ scale: 0.98 }} className={cn(
                  "w-full h-11 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25",
                  isSubmitting ? "opacity-80 cursor-not-allowed" : "hover:bg-primary-dark"
                )}>
                  {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                Remembered your password?{" "}
                <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">Sign in</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
