"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/ui/SiteLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  MailWarning,
  RefreshCcw,
  MailCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, resendVerificationEmail } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email not confirmed state
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  }, [email, password]);

  const handleResend = async () => {
    if (!email.trim()) {
      setResendError("Please enter your email address first.");
      return;
    }
    setIsResending(true);
    setResendError(null);
    setResendSent(false);
    const result = await resendVerificationEmail(email.trim());
    setIsResending(false);
    if (result.success) {
      setResendSent(true);
    } else {
      setResendError(result.error || "Failed to resend verification email.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setApiError(null);
    setResendError(null);
    setResendSent(false);

    const result = await login(email.trim(), password);

    if (result.success) {
      setEmailNotConfirmed(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 800);
    } else {
      // Email not confirmed — show banner with resend button
      if (result.emailNotConfirmed) {
        setEmailNotConfirmed(true);
        setApiError(null);
      } else {
        setEmailNotConfirmed(false);
        setApiError(result.error || "Invalid email or password. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-zinc-50/50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Logo */}
        <Link href="/" className="flex items-center mb-6">
          <SiteLogo className="w-32 h-auto object-contain" />
        </Link>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-success" />
              </motion.div>
              <h2 className="text-lg font-bold text-zinc-900">Welcome back!</h2>
              <p className="text-sm text-zinc-500 mt-1">Redirecting to homepage...</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="text-xl font-bold text-zinc-900">Welcome back</h1>
              <p className="text-sm text-zinc-500 mt-1">Sign in to access your orders, saved addresses & more</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Email Not Confirmed Banner */}
                <AnimatePresence>
                  {emailNotConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
                        <div className="flex items-start gap-2">
                          <MailWarning className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-warning">
                              Email not confirmed
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Please confirm your email address before signing in. We sent a
                              verification link to{" "}
                              <span className="font-medium text-zinc-800">{email.trim()}</span>.
                            </p>

                            {/* Resend Button */}
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending || resendSent}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning text-white text-[11px] font-semibold rounded-lg hover:bg-warning/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isResending ? (
                                  <RefreshCcw className="w-3 h-3 animate-spin" />
                                ) : resendSent ? (
                                  <MailCheck className="w-3 h-3" />
                                ) : (
                                  <RefreshCcw className="w-3 h-3" />
                                )}
                                {isResending
                                  ? "Sending..."
                                  : resendSent
                                  ? "Resent!"
                                  : "Resend verification email"}
                              </button>
                            </div>

                            {resendSent && (
                              <p className="text-[11px] text-success font-medium mt-1.5">
                                ✓ Verification email sent. Please check your inbox & spam folder.
                              </p>
                            )}
                            {resendError && (
                              <p className="text-[11px] text-error font-medium mt-1.5">
                                {resendError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 bg-error/5 border border-error/20 rounded-xl flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <p className="text-xs text-error font-medium">{apiError}</p>
                  </motion.div>
                )}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        // Reset not-confirmed banner when typing
                        if (emailNotConfirmed || resendSent || resendError) {
                          setEmailNotConfirmed(false);
                          setResendSent(false);
                          setResendError(null);
                        }
                      }}
                      className={cn(
                        "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all",
                        errors.email
                          ? "border-error focus:ring-error/30 focus:border-error"
                          : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                      )}
                      placeholder="you@example.com"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <AlertCircle className="w-4 h-4 text-error" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-error mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className={cn(
                        "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all pr-10",
                        errors.password
                          ? "border-error focus:ring-error/30 focus:border-error"
                          : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                      )}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-error mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary/30 transition-colors"
                    />
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-800 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full h-11 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25",
                    isSubmitting ? "opacity-80 cursor-not-allowed" : "hover:bg-primary-dark"
                  )}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}