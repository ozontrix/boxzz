"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setApiError(null);

    const result = await login(email, password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 800);
    } else {
      setApiError(result.error || "Invalid email or password. Please try again.");
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
          <Image
            src="/boxzz_final_logo.png"
            alt="Boxzz Logo"
            width={140}
            height={44}
            className="w-32 h-auto object-contain"
          />
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
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Forgot password?
                  </button>
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