"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle, KeyRound, Eye, EyeOff, RefreshCcw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/api/supabase";
import { updatePassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState<boolean | null>(null);

  // Check if we arrived via a password reset link (recovery session)
  useEffect(() => {
    let mounted = true;
    async function checkRecovery() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const hasSession = !!data.session;
        const isRecovery =
          hasSession &&
          data.session.user.app_metadata?.provider === "email" &&
          !!data.session.user.confirmed_at;
        if (mounted) setIsRecovery(!!isRecovery || hasSession);
      } catch {
        if (mounted) setIsRecovery(false);
      }
    }
    checkRecovery();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
          <Image src="/boxzz_final_logo.png" alt="Boxzz Logo" width={140} height={44} className="w-32 h-auto object-contain" />
        </Link>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </motion.div>
              <h2 className="text-lg font-bold text-zinc-900">Password updated!</h2>
              <p className="text-sm text-zinc-500 mt-1">Redirecting to sign in...</p>
            </motion.div>
          ) : isRecovery === false ? (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-warning" />
              </motion.div>
              <h2 className="text-lg font-bold text-zinc-900">Invalid reset link</h2>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                <KeyRound className="w-3.5 h-3.5" />
                Request new reset link
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-xl font-bold text-zinc-900">Reset your password</h1>
              <p className="text-sm text-zinc-500 mt-1">Choose a new password for your account.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-error/5 border border-error/20 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <p className="text-xs text-error font-medium">{error}</p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); if (error) setError(null); }}
                      className="w-full h-11 px-4 pr-10 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {["bg-error", "bg-warning", "bg-primary", "bg-success"].map((color, idx) => (
                          <div key={idx} className={cn("h-1 flex-1 rounded-full transition-colors", newPassword.length >= (idx + 1) * 3 ? color : "bg-zinc-200")} />
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {newPassword.length < 6 ? "Weak" : newPassword.length < 10 ? "Fair" : newPassword.length < 14 ? "Good" : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
                      className="w-full h-11 px-4 pr-10 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || isRecovery === null}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full h-11 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25",
                    isSubmitting || isRecovery === null ? "opacity-80 cursor-not-allowed" : "hover:bg-primary-dark"
                  )}
                >
                  {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Update Password"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
