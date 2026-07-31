import { supabase } from "./supabase";
import type { User } from "@/types";
import { getUserAddresses } from "./db";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "https://boxzz.in";

/**
 * Build a User object from a Supabase auth user
 */
function buildUser(authUser: any, fallbackEmail = ""): User {
  return {
    id: authUser.id,
    name:
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "User",
    email: authUser.email || fallbackEmail,
    phone: authUser.phone ?? undefined,
    emailConfirmed: !!authUser.email_confirmed_at,
    addresses: [],
  };
}

/**
 * Sign up with email & password
 *
 * When email confirmation is enabled, Supabase returns a user with
 * `email_confirmed_at = null` and no session. In that case we return
 * the user with `emailConfirmed: false` and a flag so the UI can show
 * the "verify your email" screen.
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{
  user: User | null;
  error?: string;
  requiresEmailConfirmation?: boolean;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, full_name: name },
        emailRedirectTo: `${SITE_URL}/login`,
      },
    });

    if (error) {
      // "User already registered" — surface a friendly message
      if (error.message?.toLowerCase().includes("already registered")) {
        return {
          user: null,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
      throw error;
    }

    if (!data.user) return { user: null, error: "No user returned" };

    const emailConfirmed = !!data.user.email_confirmed_at;
    const requiresEmailConfirmation = !emailConfirmed && !data.session;

    const user: User = {
      ...buildUser(data.user, email),
      addresses: [],
    };

    return { user, requiresEmailConfirmation };
  } catch (e: any) {
    console.error("signUp error:", e);
    return { user: null, error: e.message || "Sign up failed" };
  }
}

/**
 * Sign in with email & password
 *
 * If the email is not confirmed, we return a special error so the UI
 * can show the "email not confirmed" banner and a resend button.
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error?: string; emailNotConfirmed?: boolean }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Detect unconfirmed email from the error message
      if (
        error.message?.toLowerCase().includes("email not confirmed") ||
        error.message?.toLowerCase().includes("not been confirmed")
      ) {
        return {
          user: null,
          error: "Please confirm your email address before signing in.",
          emailNotConfirmed: true,
        };
      }
      throw error;
    }

    if (!data.user) return { user: null, error: "No user returned" };

    // Fetch addresses
    const addresses = await getUserAddresses(data.user.id);

    const user: User = {
      ...buildUser(data.user, email),
      addresses,
    };

    return { user };
  } catch (e: any) {
    console.error("signIn error:", e);
    return { user: null, error: e.message || "Sign in failed" };
  }
}

/**
 * Resend the email confirmation/verification email
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ error?: string; sent?: boolean }> {
  try {
    // Supabase has no direct "resend verification" call on the anon key,
    // so we use OTP sign-in which triggers a magic-link email to the user's
    // address. This performs as a verification email. If the user's email
    // is already confirmed this will just send a magic-link, which is fine.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/login`,
        shouldCreateUser: false,
      },
    });

    if (error) throw error;
    return { sent: true };
  } catch (e: any) {
    console.error("resendVerificationEmail error:", e);
    return { error: e.message || "Failed to resend verification email" };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return {};
  } catch (e: any) {
    console.error("signOut error:", e);
    return { error: e.message || "Sign out failed" };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<{
  user: User | null;
  session: any | null;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) return { user: null, session: null };

    const addresses = await getUserAddresses(data.session.user.id);
    const user: User = {
      ...buildUser(data.session.user),
      addresses,
    };

    return { user, session: data.session };
  } catch (e) {
    console.error("getCurrentSession error:", e);
    return { user: null, session: null };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return null;

    const addresses = await getUserAddresses(data.user.id);
    const user: User = {
      ...buildUser(data.user),
      addresses,
    };

    return user;
  } catch (e) {
    console.error("getCurrentUser error:", e);
    return null;
  }
}

/**
 * Update password (used after clicking the reset link)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return {};
  } catch (e: any) {
    console.error("updatePassword error:", e);
    return { error: e.message || "Update failed" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/reset-password`,
    });
    if (error) throw error;
    return {};
  } catch (e: any) {
    console.error("sendPasswordResetEmail error:", e);
    return { error: e.message || "Failed to send reset email" };
  }
}

/**
 * Update user profile metadata
 */
export async function updateProfile(data: {
  name?: string;
  phone?: string;
}): Promise<{ user: User | null; error?: string }> {
  try {
    const updateData: Record<string, any> = {};
    if (data.name) {
      updateData.data = { name: data.name, full_name: data.name };
    }
    if (data.phone) {
      updateData.phone = data.phone;
    }

    const { data: result, error } = await supabase.auth.updateUser(updateData);
    if (error) throw error;
    if (!result.user) return { user: null, error: "No user returned" };

    const addresses = result.user.id
      ? await getUserAddresses(result.user.id).catch(() => [])
      : [];

    const user: User = {
      ...buildUser(result.user),
      addresses,
    };

    return { user };
  } catch (e: any) {
    console.error("updateProfile error:", e);
    return { user: null, error: e.message || "Update failed" };
  }
}

