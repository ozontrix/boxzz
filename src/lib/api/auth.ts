import { supabase } from "./supabase";
import type { User } from "@/types";
import { getUserAddresses } from "./db";

/**
 * Sign up with email & password
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ user: User | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, full_name: name },
      },
    });

    if (error) throw error;
    if (!data.user) return { user: null, error: "No user returned" };

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata?.name || name || email.split("@")[0],
      email: data.user.email || email,
      phone: data.user.phone ?? undefined,
      addresses: [],
    };

    return { user };
  } catch (e: any) {
    console.error("signUp error:", e);
    return { user: null, error: e.message || "Sign up failed" };
  }
}

/**
 * Sign in with email & password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) return { user: null, error: "No user returned" };

    // Fetch addresses
    const addresses = await getUserAddresses(data.user.id);

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
      email: data.user.email || email,
      phone: data.user.phone ?? undefined,
      addresses,
    };

    return { user };
  } catch (e: any) {
    console.error("signIn error:", e);
    return { user: null, error: e.message || "Sign in failed" };
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
      id: data.session.user.id,
      name:
        data.session.user.user_metadata?.name ||
        data.session.user.email?.split("@")[0] ||
        "User",
      email: data.session.user.email || "",
      phone: data.session.user.phone ?? undefined,
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
      id: data.user.id,
      name:
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User",
      email: data.user.email || "",
      phone: data.user.phone ?? undefined,
      addresses,
    };

    return user;
  } catch (e) {
    console.error("getCurrentUser error:", e);
    return null;
  }
}

/**
 * Update password
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
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/account`,
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

    const user: User = {
      id: result.user.id,
      name: result.user.user_metadata?.name || result.user.email?.split("@")[0] || "User",
      email: result.user.email || "",
      phone: result.user.phone ?? undefined,
      addresses: [],
    };

    return { user };
  } catch (e: any) {
    console.error("updateProfile error:", e);
    return { user: null, error: e.message || "Update failed" };
  }
}