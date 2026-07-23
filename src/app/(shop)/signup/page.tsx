"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Full name is required";
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
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setApiError(null);

    const result = await signUp(email, password, name.trim());

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setApiError(result.error || "Sign up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
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
              <h2 className="text-lg font-bold text-zinc-900">Account created!</h2>
              <p className="text-sm text-zinc-500 mt-1">Welcome to Boxzz! Redirecting...</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="text-xl font-bold text-zinc-900">Create an account</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Join Boxzz for wholesale packaging rates
              </p>

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

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    className={cn(
                      "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all",
                      errors.name
                        ? "border-error focus:ring-error/30 focus:border-error"
                        : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                    )}
                    placeholder="Your full name"
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-error mt-1"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email */}
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
                        clearError("email");
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

                {/* Password */}
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
                        clearError("password");
                      }}
                      className={cn(
                        "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all pr-10",
                        errors.password
                          ? "border-error focus:ring-error/30 focus:border-error"
                          : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                      )}
                      placeholder="Create a password"
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
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {["bg-error", "bg-warning", "bg-primary", "bg-success"].map(
                          (color, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                password.length >= (idx + 1) * 3 ? color : "bg-zinc-200"
                              )}
                            />
                          )
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {password.length < 6
                          ? "Weak"
                          : password.length < 10
                          ? "Fair"
                          : password.length < 14
                          ? "Good"
                          : "Strong"}
                      </p>
                    </div>
                  )}
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError("confirmPassword");
                    }}
                    className={cn(
                      "w-full h-11 px-4 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all",
                      errors.confirmPassword
                        ? "border-error focus:ring-error/30 focus:border-error"
                        : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
                    )}
                    placeholder="Re-enter your password"
                  />
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-error mt-1"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
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
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Sign in
                </Link>
              </p>

              <div className="mt-6 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-xs text-zinc-600 text-center">
                  <span className="font-semibold text-zinc-800">Business account?</span>{" "}
                  Register for GST invoices, bulk pricing, and dedicated support.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}